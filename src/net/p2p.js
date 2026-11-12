// WebRTC DataChannel between two players. Ported from kani-circle src/lib/p2p.ts (2026-10).
//
// Signaling is supplied by the caller (here: the arena lobby Worker). No trickle ICE: we wait for
// gathering (max 2.5s) and send the whole SDP once, which keeps signaling to one message each way.
// Changes from the kani version, for a shooter:
//   - two channels: "g" reliable + ordered (hits, kills, names) and "u" unordered with no retransmits
//     (position snapshots; a lost snapshot is replaced by the next one, so never stall on it)
//   - the caller may pass an RTCConfiguration (iceTransportPolicy "relay" hides public IPs from strangers)
// Direct P2P is only the fast lane: if it never opens, the caller keeps using the server relay.

export const STUN = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];

export const canP2P = () => typeof RTCPeerConnection !== "undefined";

function gathered(pc, ms = 2500) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((ok) => {
    const done = () => {
      pc.removeEventListener("icegatheringstatechange", on);
      clearTimeout(tm);
      ok();
    };
    const on = () => {
      if (pc.iceGatheringState === "complete") done();
    };
    const tm = setTimeout(done, ms);
    pc.addEventListener("icegatheringstatechange", on);
  });
}

// hooks: { onOpen(), onMsg(string), onDown() }
function pipe(pc, h) {
  let rel = null,
    fast = null,
    dead = false,
    opened = false;
  const down = () => {
    if (dead) return;
    dead = true;
    try {
      pc.close();
    } catch {}
    h.onDown();
  };
  const bind = (c) => {
    if (c.label === "u") {
      fast = c;
      c.onmessage = (e) => typeof e.data === "string" && h.onMsg(e.data);
      return;
    }
    rel = c;
    c.onopen = () => {
      if (!opened) {
        opened = true;
        h.onOpen();
      }
    };
    c.onmessage = (e) => typeof e.data === "string" && h.onMsg(e.data);
    c.onerror = down;
    c.onclose = down;
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed" || pc.connectionState === "closed") down();
  };
  const p = {
    // fast=true: unreliable lane when it is open, otherwise the reliable one
    send(s, fastLane = false) {
      const c = fastLane && fast && fast.readyState === "open" ? fast : rel;
      if (!c || c.readyState !== "open") return false;
      if (fastLane && c.bufferedAmount > 64 * 1024) return true; // congested: drop a snapshot, not the link
      try {
        c.send(s);
        return true;
      } catch {
        return false;
      }
    },
    async route() {
      const stats = await pc.getStats();
      let pair;
      stats.forEach((s) => {
        if (s.type === "transport" && s.selectedCandidatePairId) pair = stats.get(s.selectedCandidatePairId);
      });
      if (!pair) return "unknown";
      return [stats.get(pair.localCandidateId), stats.get(pair.remoteCandidateId)].some(
        (s) => s && s.candidateType === "relay",
      )
        ? "relay"
        : "direct";
    },
    open: () => !!rel && rel.readyState === "open",
    close() {
      if (dead) return;
      dead = true;
      try {
        fast && fast.close();
        rel && rel.close();
        pc.close();
      } catch {}
    },
  };
  return { p, bind };
}

/** Dialing side: creates the channels and sends the offer; call answer(sdp) when it comes back. */
export async function dial(signal, h, config = { iceServers: STUN }) {
  const pc = new RTCPeerConnection(config);
  const { p, bind } = pipe(pc, h);
  bind(pc.createDataChannel("g", { ordered: true }));
  bind(pc.createDataChannel("u", { ordered: false, maxRetransmits: 0 }));
  await pc.setLocalDescription(await pc.createOffer());
  await gathered(pc);
  signal((pc.localDescription && pc.localDescription.sdp) || "");
  return {
    pipe: p,
    answer: (sdp) => pc.setRemoteDescription({ type: "answer", sdp }).catch(() => p.close()),
  };
}

/** Answering side: takes the offer, sends the answer. */
export async function accept(sdp, signal, h, config = { iceServers: STUN }) {
  const pc = new RTCPeerConnection(config);
  const { p, bind } = pipe(pc, h);
  pc.ondatachannel = (e) => bind(e.channel);
  await pc.setRemoteDescription({ type: "offer", sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await gathered(pc);
  signal((pc.localDescription && pc.localDescription.sdp) || "");
  return p;
}
