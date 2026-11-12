// Arena networking: one WebSocket to the lobby Worker (roster, signaling, fallback relay)
// plus a WebRTC mesh between players (lower id dials). Game packets go over the direct
// channel when it is open, otherwise through the lobby relay, so play never waits on P2P.

import { accept, canP2P, dial, STUN } from "./p2p.js";

const DIAL_DELAY = 250;
const RETRY = [2000, 5000, 10000, 20000, 30000];

export function createArenaNet({ url, room = "public", name = "", direct = false, onHello, onPeer, onLeave, onMsg, onStatus }) {
  const http = url.replace(/^ws/, "http").replace(/\/$/, "");
  const wsUrl = http.replace(/^http/, "ws") + `/ws?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`;
  const peers = new Map(); // id -> { id, name, pipe, n, fails, retry, answer, route }
  let ws = null,
    me = null,
    closed = false,
    wsRetry = 0,
    rtcConfig = null;

  const status = (s, extra) => onStatus && onStatus(s, extra);

  async function loadIce() {
    if (rtcConfig) return rtcConfig;
    let ice = STUN,
      turn = false;
    try {
      const r = await fetch(http + "/ice", { cache: "no-store" });
      const j = await r.json();
      if (Array.isArray(j.ice) && j.ice.length) {
        ice = j.ice;
        turn = ice.some((s) => [].concat(s.urls).some((u) => /^turns?:/.test(u)));
      }
    } catch {}
    // With strangers, relay-only keeps public IPs private (traffic goes via Cloudflare TURN).
    rtcConfig = { iceServers: ice, iceTransportPolicy: !direct && turn ? "relay" : "all" };
    return rtcConfig;
  }

  function wsSend(obj) {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(obj));
      return true;
    }
    return false;
  }

  function connect() {
    if (closed) return;
    status("connecting");
    ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      let m;
      try {
        m = JSON.parse(e.data);
      } catch {
        return;
      }
      if (m.k === "hello") {
        wsRetry = 0;
        me = m.id;
        status("online", { id: me, name: m.name });
        onHello && onHello(m.id, m.name);
        for (const p of m.peers) addPeer(p.id, p.name);
      } else if (m.k === "join") addPeer(m.id, m.name);
      else if (m.k === "leave") dropPeer(m.id, true);
      else if (m.k === "sig") onSig(m.from, m.d);
      else if (m.k === "r") deliver(m.from, m.d);
      else if (m.k === "full") status("full", { max: m.max });
    };
    ws.onclose = () => {
      for (const id of [...peers.keys()]) dropPeer(id, true);
      me = null;
      if (closed) return;
      status("offline");
      setTimeout(connect, RETRY[Math.min(wsRetry++, RETRY.length - 1)]);
    };
  }

  function deliver(from, d) {
    if (!peers.has(from)) return;
    let m;
    try {
      m = JSON.parse(d);
    } catch {
      return;
    }
    onMsg && onMsg(from, m);
  }

  function addPeer(id, name) {
    if (id === me || peers.has(id)) return;
    const p = { id, name, pipe: null, n: "", fails: 0, retry: null, answer: null, route: "server" };
    peers.set(id, p);
    onPeer && onPeer(id, name);
    if (canP2P() && me < id) later(p, DIAL_DELAY);
  }

  function dropPeer(id, gone) {
    const p = peers.get(id);
    if (!p) return;
    clearTimeout(p.retry);
    p.pipe && p.pipe.close();
    p.pipe = null;
    if (gone) {
      peers.delete(id);
      onLeave && onLeave(id);
    }
  }

  function later(p, ms) {
    clearTimeout(p.retry);
    p.retry = setTimeout(() => peers.get(p.id) === p && redial(p), ms);
  }

  function failed(p) {
    p.pipe = null;
    p.route = "server";
    if (me < p.id && p.fails < RETRY.length) later(p, RETRY[p.fails++]);
  }

  function hooks(p, n) {
    return {
      onOpen() {
        if (p.n !== n) return;
        p.fails = 0;
        p.pipe &&
          p.pipe.route().then((r) => {
            p.route = r;
            status("route", { id: p.id, route: r });
          });
      },
      onMsg(s) {
        p.n === n && deliver(p.id, s);
      },
      onDown() {
        if (p.n !== n) return;
        failed(p);
      },
    };
  }

  async function redial(p) {
    const n = Math.random().toString(36).slice(2, 8);
    p.n = n;
    p.pipe && p.pipe.close();
    p.pipe = null;
    const cfg = await loadIce();
    try {
      const d = await dial((sdp) => wsSend({ k: "sig", to: p.id, d: { t: "o", s: sdp, n } }), hooks(p, n), cfg);
      if (p.n !== n) return d.pipe.close();
      p.pipe = d.pipe;
      p.answer = d.answer;
      // no answer within 12s: count as a failure
      setTimeout(() => p.n === n && !(p.pipe && p.pipe.open()) && (p.pipe && p.pipe.close(), failed(p)), 12000);
    } catch {
      failed(p);
    }
  }

  async function onSig(from, d) {
    const p = peers.get(from);
    if (!p || !d) return;
    if (d.t === "a") {
      if (d.n === p.n && p.answer) p.answer(d.s);
      return;
    }
    if (d.t !== "o" || !canP2P()) return;
    // they dial us; replace whatever we had
    p.n = d.n;
    p.pipe && p.pipe.close();
    p.pipe = null;
    const cfg = await loadIce();
    try {
      const pipe = await accept(d.s, (sdp) => wsSend({ k: "sig", to: from, d: { t: "a", s: sdp, n: d.n } }), hooks(p, d.n), cfg);
      if (p.n !== d.n) return pipe.close();
      p.pipe = pipe;
    } catch {}
  }

  /** Send a game packet. to: peer id or undefined for everyone. fast: unreliable lane (snapshots). */
  function send(obj, { to, fast = false } = {}) {
    const s = JSON.stringify(obj);
    const targets = to ? [peers.get(to)].filter(Boolean) : [...peers.values()];
    const viaServer = [];
    for (const p of targets) if (!(p.pipe && p.pipe.open() && p.pipe.send(s, fast))) viaServer.push(p.id);
    if (!viaServer.length) return;
    wsSend({ k: "r", to: viaServer.length === peers.size && !to ? null : viaServer, d: s });
  }

  connect();
  loadIce();

  return {
    get id() {
      return me;
    },
    peers,
    send,
    routes: () => [...peers.values()].map((p) => ({ id: p.id, name: p.name, route: p.pipe && p.pipe.open() ? p.route : "server" })),
    close() {
      closed = true;
      for (const id of [...peers.keys()]) dropPeer(id, true);
      ws && ws.close();
    },
  };
}
