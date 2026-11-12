// Arena: drop-in online free-for-all for aim practice.
//
// Open with ?arena (public room) or ?arena=<room>, or the "Arena" button on the title screen.
// The map runs holdout's setup without waves (see the arena branch in game/flow.js).
// Netcode is shooter-authoritative: the shooter tests its ray against what it sees of the other
// players and sends the hit; the victim applies the damage and announces its own death.
// Good enough for practice among friends; there is no lag compensation or anti-cheat.

import { createArenaNet } from "./arena-net.js";

const DEFAULT_SERVER = "https://saltline-arena.wafusenki.workers.dev";
const SEND_HZ = 20;
const INTERP_MS = 110;
const RESPAWN_S = 3;
const SPAWN_SHIELD_S = 1.5;
const NAME_KEY = "saltline.callsign";

const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

function serverUrl(params) {
  return params.arenasrv || (import.meta.env && import.meta.env.VITE_ARENA_URL) || DEFAULT_SERVER;
}

function hue(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (h % 360) / 360;
}

function boot() {
  const G = window.__G;
  if (!G || !G.game || !G.hud || !G.player || !G.enemies || !G.combat) return void setTimeout(boot, 100);
  if (G.showcase || G.params.bench || G.params.shot) return;
  createArena(G);
}

function createArena(G) {
  const T = G.THREE;
  const P = G.params;
  const remotes = new Map(); // id -> remote
  let net = null,
    room = null,
    active = false,
    kills = 0,
    deaths = 0,
    lastAttacker = null,
    respawnAt = 0,
    shieldUntil = 0,
    sendT = 0,
    myName = P.name || store.get(NAME_KEY) || "";

  // ---------- title screen entry ----------
  const titleActions = document.querySelector('.m-title .m-actions');
  let titleBtn = null;
  if (titleActions) {
    titleBtn = document.createElement("button");
    titleBtn.className = "btn";
    titleBtn.textContent = "Arena · Online";
    titleBtn.title = "Drop into the public free-for-all";
    titleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      start(P.arena || "public");
    });
    titleActions.insertBefore(titleBtn, titleActions.children[1] || null);
    fetch(serverUrl(P).replace(/\/$/, "") + "/rooms?room=" + encodeURIComponent(P.arena || "public"))
      .then((r) => r.json())
      .then((j) => j && j.players > 0 && (titleBtn.textContent = `Arena · ${j.players} online`))
      .catch(() => {});
  }

  // ---------- scoreboard ----------
  const board = document.createElement("div");
  board.className = "arena-board";
  board.style.cssText =
    "position:fixed;top:12px;right:12px;z-index:30;min-width:180px;padding:8px 10px;background:rgba(6,10,12,.62);" +
    "color:#e8e4da;font:12px/1.5 ui-monospace,Menlo,monospace;letter-spacing:.02em;pointer-events:none;display:none;border-radius:0";
  document.body.appendChild(board);

  function renderBoard() {
    if (!active) return void (board.style.display = "none");
    board.style.display = G.game.state === "playing" || G.game.state === "paused" ? "block" : "none";
    const rows = [{ name: (myName || "You") + " (you)", k: kills, d: deaths, me: true, route: "" }];
    const routes = net ? net.routes() : [];
    for (const r of remotes.values()) {
      const rt = routes.find((x) => x.id === r.id);
      rows.push({ name: r.name, k: r.k, d: r.d, route: rt ? rt.route : "" });
    }
    rows.sort((a, b) => b.k - a.k || a.d - b.d);
    const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
    const tag = { direct: "p2p", relay: "turn", server: "srv", unknown: "…" };
    board.innerHTML =
      `<div style="opacity:.7;margin-bottom:4px">ARENA · ${esc(room)} · ${remotes.size + 1} online</div>` +
      rows
        .map(
          (r) =>
            `<div style="display:flex;gap:10px;${r.me ? "color:#ffb36b" : ""}"><span style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${esc(r.name)}</span>` +
            `<span>${r.k}/${r.d}</span><span style="width:30px;text-align:right;opacity:.5">${tag[r.route] || ""}</span></div>`,
        )
        .join("") +
      (net && !net.id ? `<div style="opacity:.6;margin-top:4px">connecting…</div>` : "");
    G.hud.setTally && G.hud.setTally(`K ${kills} · D ${deaths}`);
  }

  // ---------- remote avatars ----------
  const shared = {
    body: new T.CapsuleGeometry(0.3, 0.72, 4, 12),
    head: new T.SphereGeometry(0.2, 16, 12),
    visor: new T.BoxGeometry(0.3, 0.09, 0.08),
    gun: new T.BoxGeometry(0.07, 0.1, 0.62),
    visorMat: new T.MeshStandardMaterial({ color: 0x111417, emissive: 0x6fd3ff, emissiveIntensity: 1.6, roughness: 0.3 }),
    gunMat: new T.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.6, metalness: 0.4 }),
  };

  function nameTag(text) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 48;
    const x = c.getContext("2d");
    x.fillStyle = "rgba(6,10,12,.55)";
    x.fillRect(0, 0, 256, 48);
    x.font = "bold 26px ui-monospace,Menlo,monospace";
    x.fillStyle = "#f2ede2";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(text.slice(0, 16), 128, 25);
    const tex = new T.CanvasTexture(c);
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: true, transparent: true }));
    s.scale.set(1.1, 0.21, 1);
    return s;
  }

  function makeAvatar(id, name) {
    const g = new T.Group();
    const col = new T.Color().setHSL(hue(id), 0.65, 0.5);
    const mat = new T.MeshStandardMaterial({ color: col, roughness: 0.55, emissive: col, emissiveIntensity: 0.12 });
    const body = new T.Mesh(shared.body, mat);
    body.position.y = 0.66;
    const head = new T.Mesh(shared.head, mat);
    const visor = new T.Mesh(shared.visor, shared.visorMat);
    visor.position.set(0, 0.02, -0.16);
    head.add(visor);
    const arm = new T.Group(); // pitches with aim
    const gun = new T.Mesh(shared.gun, shared.gunMat);
    gun.position.set(0.2, -0.05, -0.32);
    arm.add(gun);
    const muzzle = new T.Object3D();
    muzzle.position.set(0.2, -0.03, -0.66);
    arm.add(muzzle);
    const tag = nameTag(name);
    for (const m of [body, head, gun]) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    g.add(body, head, arm, tag);
    g.visible = false;
    G.scene.add(g);
    return { g, mat, body, head, arm, muzzle, tag };
  }

  function addRemote(id, name) {
    if (remotes.has(id)) return;
    remotes.set(id, {
      id,
      name: name || "Diver",
      buf: [],
      alive: false,
      shield: false,
      k: 0,
      d: 0,
      eye: 1.6,
      pos: new T.Vector3(),
      yaw: 0,
      pitch: 0,
      av: makeAvatar(id, name || "Diver"),
    });
    G.hud.feed && G.hud.feed(`${name} joined`);
  }

  function dropRemote(id, quiet) {
    const r = remotes.get(id);
    if (!r) return;
    G.scene.remove(r.av.g);
    r.av.mat.dispose();
    r.av.tag.material.map.dispose();
    r.av.tag.material.dispose();
    remotes.delete(id);
    quiet || (G.hud.feed && G.hud.feed(`${r.name} left`));
  }

  const lerpAngle = (a, b, t) => {
    let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  };

  function updateRemote(r, now) {
    const at = now - INTERP_MS;
    const b = r.buf;
    while (b.length > 2 && b[1].t <= at) b.shift();
    let s;
    if (b.length >= 2 && b[0].t <= at) {
      const [a, c] = b;
      const t = Math.min(1, (at - a.t) / Math.max(1, c.t - a.t));
      r.pos.set(a.p[0] + (c.p[0] - a.p[0]) * t, a.p[1] + (c.p[1] - a.p[1]) * t, a.p[2] + (c.p[2] - a.p[2]) * t);
      r.yaw = lerpAngle(a.y, c.y, t);
      r.pitch = a.q + (c.q - a.q) * t;
      s = c;
    } else if (b.length) {
      s = b[b.length - 1];
      r.pos.fromArray(s.p);
      r.yaw = s.y;
      r.pitch = s.q;
    }
    if (s) {
      r.alive = !!s.a;
      r.shield = !!s.i;
      r.eye = s.e;
    }
    const av = r.av;
    av.g.visible = r.alive && b.length > 0;
    av.g.position.copy(r.pos);
    av.g.rotation.y = r.yaw;
    av.head.position.y = r.eye - 0.06;
    av.arm.position.y = r.eye - 0.22;
    av.arm.rotation.x = r.pitch;
    av.tag.position.y = r.eye + 0.36;
    av.body.scale.y = Math.max(0.6, Math.min(1, r.eye / 1.6));
    av.body.position.y = 0.66 * av.body.scale.y;
    av.mat.opacity = r.shield ? 0.45 : 1;
    av.mat.transparent = r.shield;
  }

  // hit volumes, in world space at what this client currently shows
  const tmp = new T.Vector3(),
    oc = new T.Vector3();
  function spheres(r) {
    const p = r.pos;
    return [
      [p.x, p.y + r.eye - 0.06, p.z, 0.21, "weak"],
      [p.x, p.y + Math.min(1.12, r.eye - 0.45), p.z, 0.31, "body"],
      [p.x, p.y + 0.75 * Math.min(1, r.eye / 1.6), p.z, 0.32, "body"],
      [p.x, p.y + 0.36, p.z, 0.3, "body"],
    ];
  }
  function rayRemote(o, d, max) {
    let best = null;
    for (const r of remotes.values()) {
      if (!r.alive || !r.av.g.visible) continue;
      for (const [x, y, z, rad, part] of spheres(r)) {
        oc.set(o.x - x, o.y - y, o.z - z);
        const b = oc.dot(d),
          c = oc.lengthSq() - rad * rad,
          disc = b * b - c;
        if (disc < 0) continue;
        const t = -b - Math.sqrt(disc);
        if (t > 0 && t < max && (!best || t < best.dist)) {
          const point = new T.Vector3().copy(d).multiplyScalar(t).add(o);
          best = {
            dist: t,
            point,
            normal: tmp.set(point.x - x, point.y - y, point.z - z).normalize().clone(),
            enemy: proxyFor(r),
            part,
          };
        }
      }
    }
    return best;
  }

  // what combat.js sees as an "enemy" when the ray lands on another player
  function proxyFor(r) {
    if (!r.proxy)
      r.proxy = {
        type: "player",
        remote: true,
        alive: true,
        get pos() {
          return r.pos;
        },
        damage(amount, point, dir, part) {
          if (!active || !r.alive || r.shield) return false;
          const e = G.player.eye;
          net.send({ t: "h", d: Math.round(amount), w: part === "weak" ? 1 : 0, o: [e.x, e.y, e.z] }, { to: r.id });
          return false; // the kill is confirmed by the victim
        },
      };
    return r.proxy;
  }

  let installed = false;
  function install() {
    if (installed) return;
    installed = true;
    const enemies = G.enemies;
    const raw = enemies.raycast.bind(enemies);
    enemies.raycast = (o, d, max = 300) => {
      const hit = raw(o, d, max);
      if (!active || !remotes.size) return hit;
      const rh = rayRemote(o, d, hit ? hit.dist : max);
      return rh || hit;
    };

    G.events.on("weapon:fire", (e) => {
      if (!active || !net || !e || !e.origin || !e.dir) return;
      const o = e.origin,
        d = e.dir;
      net.send({ t: "f", o: [o.x, o.y, o.z], d: [d.x, d.y, d.z], w: e.weapon || "" });
    });

    G.events.on("player:dead", () => {
      if (!active) return;
      deaths++;
      const by = lastAttacker && performance.now() - lastAttacker.at < 6000 ? lastAttacker.id : null;
      lastAttacker = null;
      net && net.send({ t: "k", by });
      const killer = by && remotes.get(by);
      G.hud.message && G.hud.message(killer ? `Eliminated by ${killer.name}` : "You went down", RESPAWN_S - 0.2);
      G.hud.feed && G.hud.feed(killer ? `${killer.name} ✕ you` : "you ✕ yourself");
      respawnAt = performance.now() + RESPAWN_S * 1000;
      renderBoard();
    });
  }

  // ---------- spawning ----------
  function spawnPoint() {
    const L = G.level;
    let pts = ((L && L.enemySpawns) || []).filter((s) => s.type === "ground").map((s) => s.pos);
    if (L && L.coverPoints) pts = pts.concat(L.coverPoints);
    if (!pts.length) return null;
    let best = null,
      score = -Infinity;
    for (const p of pts) {
      let near = 60;
      for (const r of remotes.values()) if (r.alive) near = Math.min(near, Math.hypot(p.x - r.pos.x, p.z - r.pos.z));
      const s = near + Math.random() * 8;
      if (s > score) {
        score = s;
        best = p;
      }
    }
    const pos = best.clone ? best.clone() : new T.Vector3(best.x, best.y || 0, best.z);
    // face the middle of the yard
    const yaw = Math.atan2(pos.x - -4, pos.z - 0);
    return { pos, yaw };
  }

  function respawn() {
    respawnAt = 0;
    G.player.reset(spawnPoint() || undefined);
    G.weapon && G.weapon.reset && G.weapon.reset();
    G.player.invulnerable = true;
    shieldUntil = performance.now() + SPAWN_SHIELD_S * 1000;
  }

  // ---------- network messages ----------
  const v3 = (a) => new T.Vector3(a[0], a[1], a[2]);
  function onMsg(from, m) {
    const r = remotes.get(from);
    if (!r || !m) return;
    if (m.t === "s") {
      r.buf.push({ t: performance.now(), p: m.p, y: m.y, q: m.q, a: m.a, i: m.i, e: m.e || 1.6 });
      if (r.buf.length > 12) r.buf.shift();
      r.k = m.k | 0;
      r.d = m.d | 0;
      if (m.n && m.n !== r.name) r.name = String(m.n).slice(0, 16);
    } else if (m.t === "h") {
      const pl = G.player;
      if (G.game.state !== "playing" || !pl.alive || pl.invulnerable) return;
      const dmg = Math.max(0, Math.min(250, +m.d || 0));
      lastAttacker = { id: from, at: performance.now() };
      pl.damage(dmg, Array.isArray(m.o) ? v3(m.o) : null);
    } else if (m.t === "k") {
      r.alive = false;
      r.buf.length = 0;
      r.av.g.visible = false;
      if (m.by && m.by === (net && net.id)) {
        kills++;
        G.hud.hitmarker && G.hud.hitmarker("kill");
        G.hud.feed && G.hud.feed(`you ✕ ${r.name}`);
        G.events.emit("arena:kill", { victim: r.name });
      } else {
        const k = m.by && remotes.get(m.by);
        G.hud.feed && G.hud.feed(k ? `${k.name} ✕ ${r.name}` : `${r.name} went down`);
      }
      renderBoard();
    } else if (m.t === "f") {
      remoteShot(r, m);
    }
  }

  // ---------- remote gunfire visuals ----------
  const tracers = [];
  const tracerMat = new T.LineBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false });
  function remoteShot(r, m) {
    if (!Array.isArray(m.o) || !Array.isArray(m.d)) return;
    const o = v3(m.o),
      d = v3(m.d).normalize();
    let end = d.clone().multiplyScalar(160).add(o);
    try {
      const hit = G.physics.raycast(o, d, 160);
      if (hit) {
        end = hit.point.clone();
        G.events.emit("impact", { point: hit.point, normal: hit.normal, dist: hit.dist, surface: hit.surface, enemy: null, dir: d, from: "enemy", box: hit.box });
      }
    } catch {}
    const from = new T.Vector3();
    r.av.g.visible ? r.av.muzzle.getWorldPosition(from) : from.copy(o);
    const geo = new T.BufferGeometry().setFromPoints([from, end]);
    const line = new T.Line(geo, tracerMat.clone());
    line.frustumCulled = false;
    G.scene.add(line);
    tracers.push({ line, life: 0.07 });
  }

  // ---------- per-frame ----------
  let last = performance.now();
  function frame() {
    requestAnimationFrame(frame);
    const now = performance.now(),
      dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    for (let i = tracers.length - 1; i >= 0; i--) {
      const t = tracers[i];
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / 0.07);
      if (t.life <= 0) {
        G.scene.remove(t.line);
        t.line.geometry.dispose();
        t.line.material.dispose();
        tracers.splice(i, 1);
      }
    }
    if (!active) return;
    const run = G.game.run;
    if (G.game.state === "title" || (run && run.mode !== "arena")) return void stop();
    for (const r of remotes.values()) updateRemote(r, now);
    const pl = G.player;
    if (shieldUntil && now > shieldUntil) {
      shieldUntil = 0;
      pl.invulnerable = false;
    }
    if (respawnAt && now > respawnAt && G.game.state === "playing") respawn();
    sendT -= dt;
    if (net && net.id && sendT <= 0) {
      sendT = 1 / SEND_HZ;
      const playing = G.game.state === "playing" || G.game.state === "paused";
      net.send(
        {
          t: "s",
          p: [+pl.pos.x.toFixed(3), +pl.pos.y.toFixed(3), +pl.pos.z.toFixed(3)],
          e: +(pl.eye.y - pl.pos.y).toFixed(2),
          y: +pl.yaw.toFixed(3),
          q: +pl.pitch.toFixed(3),
          a: playing && pl.alive ? 1 : 0,
          i: shieldUntil ? 1 : 0,
          k: kills,
          d: deaths,
          n: myName || undefined,
        },
        { fast: true },
      );
    }
  }
  requestAnimationFrame(frame);
  setInterval(renderBoard, 500);

  // ---------- leave (quit to title, or another mode started) ----------
  function stop() {
    active = false;
    respawnAt = 0;
    if (shieldUntil) G.player.invulnerable = false;
    shieldUntil = 0;
    lastAttacker = null;
    for (const id of [...remotes.keys()]) dropRemote(id, true);
    if (net) net.close();
    net = null;
    window.__arena = null;
    renderBoard();
  }

  // ---------- start ----------
  function start(r) {
    room = String(r || "public").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24) || "public";
    if (!myName) {
      const n = (prompt("Callsign for the arena?", "") || "").trim().slice(0, 16);
      if (n) {
        myName = n;
        store.set(NAME_KEY, n);
      }
    }
    install();
    if (!net) {
      net = createArenaNet({
        url: serverUrl(P),
        room,
        name: myName,
        direct: P.p2p === "direct",
        onHello: (id, name) => {
          if (!myName) myName = name;
          // reconnect: everyone is new again
          for (const id2 of [...remotes.keys()]) dropRemote(id2, true);
        },
        onPeer: addRemote,
        onLeave: dropRemote,
        onMsg,
        onStatus: (s, x) => {
          if (s === "full") G.hud.message && G.hud.message(`Room is full (${x.max})`, 4);
          window.__arenaStatus = s;
        },
      });
      window.__arena = { net, remotes, get kills() { return kills; }, get deaths() { return deaths; } };
    }
    active = true;
    kills = deaths = 0;
    try {
      G.audio && G.audio.resume && G.audio.resume();
      G.input && G.input.requestLock && G.input.requestLock();
    } catch {}
    G.game.start({ skipIntro: true, mode: "arena" });
    respawn();
    shieldUntil = performance.now() + SPAWN_SHIELD_S * 1000;
    G.hud.message && G.hud.message(`Arena · ${room}`, 2.5);
    renderBoard();
  }

  if (P.arena !== undefined) {
    // URL entry: pointer lock still needs a click, the game shows its own click-to-play hint
    start(P.arena || "public");
  }
}

boot();
