// Saltline arena lobby (Cloudflare Worker + Durable Object).
//
// One Durable Object per room. It does three small jobs:
//   1. roster: who is in the room (id + callsign), join / leave broadcasts
//   2. WebRTC signaling: relays offer / answer SDP between two players (no trickle, see src/net/p2p.js)
//   3. fallback relay: game packets for players whose direct channel is not up yet (or never comes up)
// GET /ice hands out short-lived Cloudflare TURN credentials so browsers behind strict NAT still connect.
// Nothing is stored; a room disappears when the last socket closes.

const MAX_PLAYERS = 8
const SIG_MAX = 16_000 // one full SDP
const PKT_MAX = 1_200 // one game packet relayed through the server
const PKT_PER_SEC = 60
const SIG_PER_30S = 24
const ROOM_RE = /^[a-z0-9-]{1,24}$/
const ICE_TTL = 4 * 3600
const STUN = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }]

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  Vary: "Origin",
})

let iceCache = null // { at, ice }
async function iceServers(env) {
  if (!env.CF_TURN_KEY_ID || !env.CF_TURN_KEY_TOKEN) return STUN
  if (iceCache && Date.now() - iceCache.at < 3600e3) return iceCache.ice
  try {
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.CF_TURN_KEY_ID}/credentials/generate-ice-servers`, {
      method: "POST",
      headers: { Authorization: "Bearer " + env.CF_TURN_KEY_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ ttl: ICE_TTL }),
    })
    if (!r.ok) return STUN
    const j = await r.json()
    // drop port 53: browsers often stall on it
    const ice = (j.iceServers || []).map((s) => ({
      ...s,
      urls: [].concat(s.urls).filter((u) => !/:53(\?|$)/.test(u)),
    })).filter((s) => s.urls.length)
    if (!ice.length) return STUN
    iceCache = { at: Date.now(), ice }
    return ice
  } catch (_) {
    return STUN
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    const origin = req.headers.get("Origin")
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(origin) })
    if (url.pathname === "/ice") {
      return Response.json({ ice: await iceServers(env) }, { headers: { ...cors(origin), "Cache-Control": "no-store" } })
    }
    if (url.pathname === "/ws") {
      if (req.headers.get("Upgrade") !== "websocket") return new Response("expected websocket", { status: 426 })
      const room = (url.searchParams.get("room") || "public").toLowerCase()
      if (!ROOM_RE.test(room)) return new Response("bad room", { status: 400 })
      const stub = env.ROOM.get(env.ROOM.idFromName(room))
      return stub.fetch(req)
    }
    if (url.pathname === "/rooms") {
      // cheap presence for the title screen: how many are in the public room
      const stub = env.ROOM.get(env.ROOM.idFromName(url.searchParams.get("room") || "public"))
      const r = await stub.fetch(new Request("https://do/count"))
      return new Response(r.body, { headers: { ...cors(origin), "Content-Type": "application/json", "Cache-Control": "no-store" } })
    }
    return new Response("saltline arena", { headers: cors(origin) })
  },
}

const cleanName = (s) => String(s || "").replace(/[^\p{L}\p{N} _.-]/gu, "").trim().slice(0, 16)

export class ArenaRoom {
  constructor(ctx) {
    this.ctx = ctx
  }

  roster() {
    const out = []
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment()
      if (a) out.push({ id: a.id, name: a.name })
    }
    return out
  }

  send(ws, obj) {
    try { ws.send(typeof obj === "string" ? obj : JSON.stringify(obj)) } catch (_) {}
  }

  byId(id) {
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment()
      if (a && a.id === id) return ws
    }
    return null
  }

  broadcast(obj, except) {
    const s = JSON.stringify(obj)
    for (const ws of this.ctx.getWebSockets()) if (ws !== except) this.send(ws, s)
  }

  async fetch(req) {
    const url = new URL(req.url)
    if (url.pathname === "/count") return Response.json({ players: this.ctx.getWebSockets().length, max: MAX_PLAYERS })
    if (this.ctx.getWebSockets().length >= MAX_PLAYERS) {
      const pair = new WebSocketPair()
      pair[1].accept()
      pair[1].send(JSON.stringify({ k: "full", max: MAX_PLAYERS }))
      pair[1].close(4001, "room full")
      return new Response(null, { status: 101, webSocket: pair[0] })
    }
    const pair = new WebSocketPair()
    const [client, server] = [pair[0], pair[1]]
    this.ctx.acceptWebSocket(server)
    const id = crypto.randomUUID().slice(0, 8)
    const name = cleanName(url.searchParams.get("name")) || "Diver-" + id.slice(0, 3).toUpperCase()
    server.serializeAttachment({ id, name, sigW: 0, sigN: 0, pktW: 0, pktN: 0 })
    this.send(server, { k: "hello", id, name, peers: this.roster().filter((p) => p.id !== id) })
    this.broadcast({ k: "join", id, name }, server)
    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws, msg) {
    if (typeof msg !== "string" || msg.length > SIG_MAX) return
    const a = ws.deserializeAttachment()
    if (!a) return
    let m
    try { m = JSON.parse(msg) } catch (_) { return }
    if (!m || typeof m !== "object") return
    const now = Date.now()

    if (m.k === "sig") {
      // {k:"sig", to, d:{t:"o"|"a", s:SDP, n}} -> target gets {k:"sig", from, d}
      const d = m.d
      if (!d || (d.t !== "o" && d.t !== "a") || typeof d.s !== "string") return
      if (now - a.sigW > 30e3) { a.sigW = now; a.sigN = 0 }
      if (++a.sigN > SIG_PER_30S) return ws.serializeAttachment(a)
      ws.serializeAttachment(a)
      const to = this.byId(String(m.to || ""))
      if (to && to !== ws) this.send(to, { k: "sig", from: a.id, d: { t: d.t, s: d.s, n: String(d.n || "") } })
      return
    }

    if (m.k === "r") {
      // fallback relay: {k:"r", to:[ids]|null, d:"<packet>"}
      if (typeof m.d !== "string" || m.d.length > PKT_MAX) return
      if (now - a.pktW > 1000) { a.pktW = now; a.pktN = 0 }
      if (++a.pktN > PKT_PER_SEC) return ws.serializeAttachment(a)
      ws.serializeAttachment(a)
      const out = JSON.stringify({ k: "r", from: a.id, d: m.d })
      const to = Array.isArray(m.to) ? new Set(m.to.slice(0, MAX_PLAYERS).map(String)) : null
      for (const w of this.ctx.getWebSockets()) {
        if (w === ws) continue
        const b = w.deserializeAttachment()
        if (b && (!to || to.has(b.id))) this.send(w, out)
      }
      return
    }

    if (m.k === "ping") this.send(ws, { k: "pong", t: m.t })
  }

  async webSocketClose(ws) {
    this.leave(ws)
  }

  async webSocketError(ws) {
    this.leave(ws)
  }

  leave(ws) {
    const a = ws.deserializeAttachment()
    ws.serializeAttachment(null)
    try { ws.close(1000, "bye") } catch (_) {}
    if (a) this.broadcast({ k: "leave", id: a.id }, ws)
  }
}
