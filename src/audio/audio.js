// Ported from the newer Saltline bundle (audio/audio.js).
import { Go, i_, s_ } from "./library.js";
import { $l, Ci, Kb, Qb, ao, em, ml } from "./synthesis.js";

function o_(n, e, t) {
  let i = Array.isArray(e) ? e : [e];
  if (!n.loop) for (let r of i) em(r, t, n.ir ? 0 : 3e-4, n.ir ? 0.05 : 0.012);
  let s = 0;
  for (let r of i) s = Math.max(s, Qb(r));
  let o = n.fixed ? Math.min(1, n.peak / (s || 1)) : s > 0 ? n.peak / s : 1;
  for (let r of i) ml(r, o);
  return { sr: t, ch: i, loop: !!n.loop };
}

function r_(i, e = 0, t) {
  let n = Go[i];
  if (!n) return null;
  let s = t || n.sr,
    o = e % n.n,
    r = n.gen(s, ao(Kb(i) + o * 7919), o);
  if (s_(r)) {
    let a;
    do a = r.next();
    while (!a.done);
    r = a.value;
  }
  return o_(n, r, s);
}

function a_(i, e = 0, t) {
  let n = Go[i];
  if (!n) return null;
  let s = t || n.sr,
    o = e % n.n,
    r = n.gen(s, ao(Kb(i) + o * 7919), o),
    a = null;
  return {
    step() {
      if (a) return a;
      if (s_(r)) {
        let l = r.next();
        if (!l.done) return null;
        r = l.value;
      }
      return (a = o_(n, r, s));
    },
  };
}

var ji = {
  comp: { threshold: -3, knee: 6, ratio: 2, attack: 0.01, release: 0.12 },
  preGain: 1,
  master: 0.9,
  musicBus: 0.73,
  weapon: {
    rifle: {
      shot: "rifle_shot",
      n: 5,
      gain: 1.12,
      tailOut: "rifle_tail_out",
      tailIn: "rifle_tail_in",
      tail: 1.12,
      duck: 0.45,
      shellPitch: 1,
    },
    pistol: {
      shot: "pistol_shot",
      n: 4,
      gain: 1.12,
      tailOut: "pistol_tail_out",
      tailIn: "pistol_tail_in",
      tail: 1.12,
      duck: 0.5,
      shellPitch: 1.22,
    },
  },
  duck: { attack: 0.012, hold: 0.085, release: 0.1 },
  tailBoostAfter: 0.105,
  music: {
    trim: 0.92,
    layers: {
      music_drone: 1,
      music_strings: 1,
      music_pulse: 1,
      music_ticks: 1,
      music_drums: 1,
      music_brass: 1,
      music_lift: 1,
    },
    cell: 0.8,
    horn: 0.7,
    fill: 0.55,
    hit: 0.42,
    riser: 0.9,
    impact: 0.75,
    relay: 0.9,
    death: 0.9,
    complete: 0.9,
    xfade: 0.5,
    relayDuck: 0.4,
    preImpactDip: 0.45,
    riserMin: 1.25,
    riserMinAfterRelay: 2.6,
    riserCooldown: 25,
    cadenceLen: 11.5,
  },
};

function Q6_2(n) {
  return n >= 0.45 ? 1 : 0.4 + (0.6 * Math.max(0, n)) / 0.45;
}

function bz(n) {
  let e = Math.abs(n);
  return Math.sign(n) * (e <= 0.6 ? e : 0.6 + 0.4 * Math.tanh((e - 0.6) / 0.4));
}

var eE = 4;

function tE(n = 4097) {
  let e = new Float32Array(n);
  for (let t = 0; t < n; t++) e[t] = bz(((t / (n - 1)) * 2 - 1) * eE);
  return e;
}

function Mz(n) {
  let e = (d) => Math.pow(10, d / 20),
    t = (d) => (d > 0 ? 20 * Math.log10(d) : -1e3),
    i = e(n.threshold),
    s = n.threshold + n.knee,
    o = e(s),
    r = 1 / n.ratio,
    a = (d, m) => (d < i ? d : i + (1 - Math.exp(-m * (d - i))) / m),
    l = (d, m) => {
      if (d < i) return 1;
      let x = d * 1.001;
      return (t(a(x, m)) - t(a(d, m))) / (t(x) - t(d));
    },
    c = 0.1,
    u = 1e4,
    f = 5;
  if (n.knee > 0)
    for (let d = 0; d < 15; d++)
      (l(o, f) < r ? (u = f) : (c = f), (f = Math.sqrt(c * u)));
  let h = t(a(o, f)),
    p = (d) => (d < o ? a(d, f) : e(h + r * (t(d) - s)));
  return { saturate: p, makeup: Math.pow(1 / p(1), 0.6) };
}

function nE() {
  return ji.preGain / (Mz(ji.comp).makeup * eE);
}

var pi = (i, e, t) => Math.min(t, Math.max(e, i));

var Pv = (i, e, t) => {
  let n = pi((t - i) / (e - i), 0, 1);
  return n * n * (3 - 2 * n);
};

var Jv_2 = Ci.bar;

var sE = Ci.beat;

var wz = {};

function oE(n, e, t = wz, i = {}) {
  let s = ji.music.layers;
  for (let o of $l) i[o] = 0;
  if (n === "title" || n === "intro") i.music_drone = 0.95;
  else if (n === "dead") i.music_drone = 0.4;
  else if (n === "complete")
    i.music_drone = t.after == null || t.after > ji.music.cadenceLen ? 0.7 : 0;
  else {
    let o = Pv(0.3, 0.6, e),
      r = Pv(0.7, 0.95, e) * (t.gate == null ? 1 : t.gate),
      a = t.final ? r : 0;
    ((i.music_drone = 1 - 0.15 * o - 0.15 * r - 0.2 * a),
      (i.music_strings = o * (0.85 + 0.15 * r)),
      (i.music_pulse = o * (0.8 + 0.2 * r) * (1 - 0.2 * a)),
      (i.music_ticks = o * (0.7 + 0.3 * r)),
      (i.music_drums = r),
      (i.music_brass = r * (1 - 0.15 * a)),
      (i.music_lift = a));
  }
  for (let o of $l) i[o] *= s[o] * ji.music.trim;
  return i;
}

function rE(n) {
  let { ctx: e, out: t, bufs: i, whenReady: s, running: o } = n,
    r = n.rnd || Math.random,
    a = ji.music,
    l = {
      on: !1,
      t0: 0,
      layers: {},
      nextBar: 0,
      live: "title",
      tier: 0,
      final: !1,
      gate: 1,
      gateT: -1,
      wave: null,
      lastImpact: -99,
      armed: !1,
      plan: "rest",
      cycle: 0,
      quiet: 0,
      lastFill: -1,
      duckUntil: -1,
      muteUntil: -1,
      completeT: -1,
      lastSting: -99,
      lastRelay: -99,
      voices: [],
      bars: 0,
    },
    c = (R, z = 0) => i.get(R + "#" + z),
    u = () => {};
  function f(R, z) {
    let I = c(R);
    if (!I) return;
    let L = e.createGain();
    ((L.gain.value = 0), L.connect(t));
    let U = e.createBufferSource();
    ((U.buffer = I), (U.loop = !0), U.connect(L));
    let k = z + 0.06,
      C = 0;
    (l.on
      ? (C = (((k - l.t0) % I.duration) + I.duration) % I.duration)
      : ((l.on = !0), (l.t0 = k), (l.nextBar = 0)),
      U.start(k, C),
      (l.layers[R] = { g: L, s: U, t: 0, hold: -1 }));
  }
  function h(R, z, I, L) {
    if (
      !(I < R.hold) &&
      !(Math.abs(z - R.t) < 0.004 && !(z === 0 && R.t !== 0))
    ) {
      R.t = z;
      try {
        R.g.gain.setTargetAtTime(z, I, L);
      } catch {
        R.g.gain.value = z;
      }
    }
  }
  let p = { gate: 1, final: !1, after: null },
    d = {},
    m = (R, z) => (
      (p.gate = l.gate),
      (p.final = l.final),
      (p.after = l.completeT >= 0 ? z - l.completeT : null),
      oE(l.live, R, p, d)
    );
  function x(R, z, I, L, U = {}) {
    let k = c(R, z);
    if (!k) return (s(R, z, u), null);
    if (!o()) return null;
    let C = e.currentTime;
    ((I = Math.max(I, C)), (L *= a.trim));
    let A = e.createGain(),
      F = e.createBufferSource();
    if (((F.buffer = k), F.connect(A), A.connect(t), U.fadeIn))
      try {
        (A.gain.setValueAtTime(0, I),
          A.gain.linearRampToValueAtTime(L, I + U.fadeIn));
      } catch {
        A.gain.value = L;
      }
    else A.gain.value = L;
    let H = {
      s: F,
      g: A,
      name: R,
      kind: U.kind || "phrase",
      end: I + k.duration - (U.offset || 0),
      gain: L,
    };
    return (
      (F.onended = () => {
        try {
          (F.disconnect(), A.disconnect());
        } catch {}
      }),
      F.start(I, U.offset || 0),
      l.voices.push(H),
      H
    );
  }
  function v(R, z) {
    let I = e.currentTime;
    for (let L of l.voices)
      if (!(L.end <= I || (R && !R(L)))) {
        try {
          (L.g.gain.cancelScheduledValues(I),
            L.g.gain.setTargetAtTime(0, I, z / 3),
            L.s.stop(I + z));
        } catch {}
        L.end = I + z;
      }
  }
  function y(R, z, I, L) {
    if (c(R)) return x(R, 0, z, I, { kind: L });
    let U = e.currentTime;
    return (
      s(R, 0, () => {
        e.currentTime - U < 1.5 &&
          x(R, 0, e.currentTime + 0.03, I, { kind: L });
      }),
      null
    );
  }
  let b = (R, z, I) =>
    l.on ? l.t0 + Math.ceil((R + z - l.t0) / I - 1e-9) * I : R + z;
  function g(R, z, I) {
    if (
      !l.on ||
      !c("mus_impact") ||
      (!I && R - l.lastImpact < a.riserCooldown)
    ) {
      l.gate = 1;
      return;
    }
    let L = R - l.lastRelay < 1.5 ? a.riserMinAfterRelay : a.riserMin,
      U = b(R, L, Jv_2);
    ((l.gate = 0),
      (l.gateT = U),
      (l.lastImpact = U),
      (l.muteUntil = Math.max(l.muteUntil, U + 0.2)));
    let k = { Ti: U, voices: [] };
    if (c("mus_riser")) {
      let F = Math.max(R + 0.02, U - Ci.riserPeak);
      k.voices.push(
        x("mus_riser", 0, F, a.riser, {
          offset: Ci.riserPeak - (U - F),
          fadeIn: 0.1,
          kind: "wave",
        }),
      );
    }
    k.voices.push(x("mus_impact", 0, U, a.impact, { kind: "wave" }));
    let C = oE("playing", 1, { gate: 1, final: l.final }),
      A = R < l.duckUntil ? a.relayDuck : 1;
    for (let F of $l) {
      let H = l.layers[F];
      if (H) {
        try {
          (H.g.gain.cancelScheduledValues(R),
            A < 1 &&
              H.t > 0.01 &&
              H.g.gain.setTargetAtTime(Math.max(0, H.t) * A, R, 0.2),
            H.t > 0.01 &&
              H.g.gain.setTargetAtTime(
                H.t * Math.min(A, a.preImpactDip),
                U - 0.5,
                0.12,
              ),
            H.g.gain.setTargetAtTime(C[F], U - 0.03, 0.008));
        } catch {}
        ((H.t = C[F]), (H.hold = U + 0.25));
      }
    }
    ((l.wave = k), (l.armed = !0));
  }
  function E(R) {
    if (l.wave) {
      for (let z of l.wave.voices)
        if (z) {
          try {
            (z.g.gain.cancelScheduledValues(R),
              z.g.gain.setTargetAtTime(0, R, 0.08),
              z.s.stop(R + 0.3));
          } catch {}
          z.end = R + 0.3;
        }
      for (let z of $l) {
        let I = l.layers[z];
        if (I) {
          try {
            I.g.gain.cancelScheduledValues(R);
          } catch {}
          ((I.hold = -1), (I.t = -1));
        }
      }
      ((l.wave = null), (l.gate = 1), (l.lastImpact = -99), (l.armed = !1));
    }
  }
  function M() {
    ((l.final = !1),
      (l.gate = 1),
      (l.gateT = -1),
      (l.wave = null),
      (l.armed = !1),
      (l.completeT = -1),
      (l.duckUntil = -1),
      (l.muteUntil = -1),
      (l.lastImpact = -99),
      (l.plan = "rest"),
      (l.quiet = 0));
  }
  let _ = {
      get on() {
        return l.on;
      },
      state(R, z) {
        if (R === "paused") return;
        let I = l.live;
        if (((l.live = R), z === "paused" && I === R)) return;
        let L = e.currentTime;
        (R === "playing" || R === "intro" || R === "title") &&
          ((R === "playing" && I === "intro") ||
            (E(L), M(), v((U) => U.kind !== "phrase", 0.5)));
      },
      relay() {
        if (!o()) return;
        let R = e.currentTime;
        if (R - l.lastRelay < 1) return;
        let z = b(R, 0.15, sE);
        ((l.lastRelay = R),
          v((I) => I.kind === "phrase", 0.4),
          y("objective", z, a.relay, "sting"),
          (l.duckUntil = z + 3.4),
          (l.muteUntil = Math.max(l.muteUntil, z + 4.2)));
      },
      finalRun() {
        if (l.final || ((l.final = !0), !o() || !l.on)) return;
        let R = e.currentTime;
        (l.wave && E(R), g(R, 1, !0));
      },
      death() {
        if (!o()) return;
        let R = e.currentTime;
        R - l.lastSting < 1 ||
          ((l.lastSting = R),
          E(R),
          v(null, 0.25),
          y("death", R + 0.02, a.death, "sting"));
      },
      complete() {
        if (!o()) return;
        let R = e.currentTime;
        if (R - l.lastSting < 6) return;
        ((l.lastSting = R), E(R), v(null, 0.35));
        let z = b(R, 0.15, sE);
        ((l.completeT = z), y("complete", z, a.complete, "sting"));
      },
      snap() {
        ((l.gate = 1), (l.lastImpact = e.currentTime), (l.armed = !0));
      },
      update(R, z, I) {
        if (!o()) return;
        let L = e.currentTime;
        if (!l.on)
          if (c("music_drone")) f("music_drone", L);
          else return;
        for (let H of $l) !l.layers[H] && c(H) && f(H, L);
        let U = l.live === "playing",
          k = U
            ? I >= 0.8 || (l.tier === 2 && I >= 0.68)
              ? 2
              : I >= 0.4 || (l.tier >= 1 && I >= 0.32)
                ? 1
                : 0
            : 0;
        (k === 2 && l.tier < 2 && !l.wave && l.gate === 1
          ? g(L, z, !1)
          : k < 2 && l.wave && L < l.wave.Ti - 0.6 && !l.final && E(L),
          (l.tier = k),
          l.wave && L >= l.wave.Ti && ((l.gate = 1), (l.wave = null)));
        let C = m(z, L),
          A = L < l.duckUntil ? a.relayDuck : 1,
          F =
            l.live === "dead" ||
            (l.live === "complete" &&
              l.completeT >= 0 &&
              L - l.completeT < a.cadenceLen);
        for (let H of $l) {
          let N = l.layers[H];
          N && h(N, C[H] * A, L, F ? 0.22 : A < 1 ? 0.2 : a.xfade);
        }
        for (; l.t0 + l.nextBar * Jv_2 - L < 0.4;) {
          let H = l.t0 + l.nextBar * Jv_2;
          (H > L + 0.03 && S(l.nextBar, H, k, L), l.nextBar++);
        }
        (l.voices.length > 24 || (l.voices.length && l.voices[0].end < L)) &&
          (l.voices = l.voices.filter((H) => H.end > L));
      },
      debug() {
        let R = {};
        for (let z of $l) R[z] = l.layers[z] ? +l.layers[z].t.toFixed(3) : null;
        return {
          on: l.on,
          t0: l.t0,
          bar: l.nextBar,
          live: l.live,
          tier: l.tier,
          final: l.final,
          gate: l.gate,
          plan: l.plan,
          voices: l.voices.length,
          layers: R,
        };
      },
    },
    T = (R, z, I) => x("mus_cell", R, z, I),
    w = (R, z, I) => x("mus_horn", R, z, I);
  function S(R, z, I, L) {
    let U = R % 8,
      k = l.live;
    if (k === "dead") return;
    if (z < l.muteUntil) {
      U === 0 && (l.plan = "rest");
      return;
    }
    if (k === "complete") {
      if (l.completeT >= 0 && z - l.completeT < a.cadenceLen + 2) return;
      U === 0 && r() < 0.6 && T(0, z, a.cell * 0.8);
      return;
    }
    if (U === 0) {
      let N = r();
      (l.cycle++,
        k === "title" || k === "intro"
          ? (l.plan = c("mus_cell", 3) && l.plan !== "full" ? "full" : "rest")
          : I === 0
            ? (l.plan =
                l.quiet >= 1
                  ? N < 0.5
                    ? "call"
                    : N < 0.8
                      ? "full call"
                      : "answer"
                  : N < 0.3
                    ? "call"
                    : N < 0.48
                      ? "full call"
                      : N < 0.62
                        ? "tail"
                        : N < 0.72
                          ? "answer"
                          : "rest")
            : I === 1
              ? (l.plan = N < 0.4 ? "call" : N < 0.55 ? "tail" : "rest")
              : l.armed || l.final
                ? ((l.plan = l.armed || l.cycle % 2 ? "full" : "call"),
                  (l.armed = !1))
                : (l.plan = ["rest", "full call", "rest", "full"][l.cycle % 4]),
        (l.quiet = l.plan === "rest" ? l.quiet + 1 : 0));
    }
    let C = l.plan,
      A = U >> 1,
      H =
        (U & 1) === 0 &&
        (C === "full" ||
          (C === "call" && A === 0) ||
          (C === "full call" && A < 2) ||
          (C === "tail" && A === 3) ||
          (C === "answer" && A >= 2));
    if (I === 2 && l.gate === 1) {
      H && w(A, z, a.horn);
      let N = l.final ? [0.6, 1] : [0.3, 0.8];
      if ((U === 3 && r() < N[0]) || (U === 7 && r() < N[1])) {
        let Z = Math.floor(r() * 3);
        (Z === l.lastFill && (Z = (Z + 1) % 3),
          (l.lastFill = Z),
          x("mus_fill", Z, z, a.fill, { kind: "fill" }));
      }
      return;
    }
    I !== 2 &&
      (H &&
        T(
          A,
          z,
          k === "title" || k === "intro"
            ? a.cell
            : I === 1
              ? a.cell * 0.85
              : a.cell,
        ),
      H ||
        (k === "title" || k === "intro"
          ? U === 5 &&
            r() < 0.5 &&
            x("mus_hit", 0, z, a.hit * 0.8, { kind: "hit" })
          : I === 0
            ? (U === 4 || U === 1) &&
              r() < (U === 4 ? 0.5 : 0.2) &&
              x("mus_hit", r() < 0.5 ? 0 : 1, z, a.hit * (0.7 + 0.3 * r()), {
                kind: "hit",
              })
            : I === 1 &&
              (U === 0 || (U === 4 && r() < 0.4)) &&
              x("mus_hit", U === 0 ? 0 : 1, z, a.hit * 0.85, {
                kind: "hit",
              })));
  }
  return _;
}

var ti = (n, e, t) => Math.min(t, Math.max(e, n));

var l_ = {
  metal: "impact_metal",
  concrete: "impact_concrete",
  wood: "impact_wood",
  water: "impact_water",
  glass: "impact_glass",
  dirt: "impact_concrete",
  rubber: "impact_wood",
};

var Iv = {
  metal: "step_metal",
  water: "step_water",
  concrete: "step_concrete",
  wood: "step_concrete",
  dirt: "step_concrete",
  glass: "step_concrete",
  rubber: "step_concrete",
};

var tC = new Set([
  "thunder",
  "foghorn",
  "objective",
  "complete",
  "death",
  "mus_cell",
  "mus_horn",
  "mus_fill",
  "mus_hit",
  "mus_riser",
  "mus_impact",
  "explosion",
  "explosion_big",
  "rifle_tail_out",
  "rifle_tail_in",
  "pistol_tail_out",
  "pistol_tail_in",
  "gull_die",
  "hound_die",
  "relay_cut",
  "container_bang",
  "ear_ring",
]);

var nC = [
  "rifle_tail_out",
  "rifle_tail_in",
  "ir_outdoor",
  "ir_shed",
  "pistol_shot",
  "pistol_tail_out",
  "pistol_tail_in",
  "reload_magout",
  "reload_maginsert",
  "reload_magin",
  "reload_boltback",
  "reload_bolt",
  "pistol_dry",
  "pistol_magout",
  "pistol_maginsert",
  "pistol_magin",
  "pistol_slide",
  "weapon_holster",
  "weapon_draw",
  "gear_rustle",
  "shell_bounce",
  "shell_bounce_metal",
  "rain",
  "whiz",
  "impact_concrete",
  "impact_metal",
  "land",
  "jump",
  "hurt",
  "explosion",
  "explosion_big",
  "music_drone",
  "mus_cell",
  "wind",
  "impact_enemy",
  "impact_wood",
  "impact_water",
  "impact_glass",
  "ricochet",
  "gull_rotor",
  "hound_servo",
  "alert",
  "telegraph",
  "gull_fire",
  "hound_fire",
  "hound_step",
  "ui_click",
  "ui_hover",
  "sea",
  "rain_interior",
  "relay_hum",
  "gull_die",
  "hound_die",
  "ear_ring",
  "death",
  "mus_hit",
  "music_strings",
  "music_pulse",
  "music_ticks",
  "relay_cut",
  "objective",
  "mus_riser",
  "mus_impact",
  "music_drums",
  "music_brass",
  "mus_fill",
  "mus_horn",
  "thunder",
  "music_lift",
  "complete",
  "gull_cry",
  "halyard",
  "foghorn",
  "container_bang",
];

function iC() {
  let i = () => {},
    e = {
      setPos: i,
      setGain: i,
      setPitch: i,
      stop: i,
    };
  return {
    silent: !0,
    update: i,
    resume: i,
    play: i,
    loop: () => e,
    setIntensity: i,
    setInterior: i,
    setVolume: i,
    setPaused: i,
    debug: () => ({
      state: "none",
    }),
    names: Object.keys(Go),
    ready: Promise.resolve(),
  };
}

async function createAudio(context) {
  let e =
      typeof window < "u" && (window.AudioContext || window.webkitAudioContext),
    t = null;
  try {
    e &&
      (t = new e({
        latencyHint: "interactive",
      }));
  } catch {
    t = null;
  }
  return t
    ? u_(context, t, null)
    : (console.warn("[audio] WebAudio unavailable \u2014 running silent"),
      iC());
}

function u_(n, e, t) {
  let i = n.events,
    s = Math.random,
    o = () => (t ? !0 : e.state === "running"),
    r = t ? t.bufs : new Map(),
    a = new Map(),
    l = 0,
    c = 0,
    u = 0;
  function f(ie, ae) {
    let pe = e.createBuffer(ae.ch.length, ae.ch[0].length, ae.sr);
    for (let Me = 0; Me < ae.ch.length; Me++)
      pe.getChannelData(Me).set(ae.ch[Me]);
    (r.set(ie, pe), c++);
    let Ee = a.get(ie);
    if (Ee) {
      a.delete(ie);
      for (let Me of Ee)
        try {
          Me(pe);
        } catch (Ie) {
          console.error("[audio] ready callback", Ie);
        }
    }
    return pe;
  }
  let h = (ie) => (Go[ie].ir ? e.sampleRate : void 0);
  function p(ie, ae) {
    let pe = performance.now(),
      Ee = f(ie + "#" + ae, r_(ie, ae, h(ie)));
    return ((l += performance.now() - pe), Ee);
  }
  let d = [],
    m = new Set();
  for (let ie of [...nC, ...Object.keys(Go)]) {
    let ae = Go[ie];
    if (!(!ae || m.has(ie))) {
      m.add(ie);
      for (let pe = 0; pe < ae.n; pe++)
        r.has(ie + "#" + pe) ||
          (ae.boot
            ? p(ie, pe)
            : d.push({ name: ie, v: pe, k: ie + "#" + pe, steps: null }));
    }
  }
  u = l;
  let x,
    v = new Promise((ie) => {
      x = ie;
    });
  function y() {
    let ie = performance.now();
    for (; d.length;) {
      let ae = d[0];
      if (r.has(ae.k)) {
        d.shift();
        continue;
      }
      ae.steps || (ae.steps = a_(ae.name, ae.v, h(ae.name)));
      let pe = null;
      try {
        pe = ae.steps.step();
      } catch (Ee) {
        (console.error("[audio] synthesis failed for " + ae.k, Ee), d.shift());
        continue;
      }
      if (
        (pe && (f(ae.k, pe), d.shift(), ae.name, void 0),
        performance.now() - ie > 6)
      )
        break;
    }
    ((l += performance.now() - ie), d.length ? setTimeout(y, 12) : x());
  }
  t ? x() : setTimeout(y, 120);
  function b(ie, ae, pe) {
    let Ee = ie + "#" + ae,
      Me = r.get(Ee);
    if (Me) {
      pe(Me);
      return;
    }
    (a.has(Ee) || a.set(Ee, []), a.get(Ee).push(pe));
    let Ie = d.findIndex((Ce) => Ce.k === Ee);
    if (Ie > 0 && !d[Ie].steps) {
      let [Ce] = d.splice(Ie, 1);
      d.splice(d[0] && d[0].steps ? 1 : 0, 0, Ce);
    }
  }
  let g = (ie) => {
      let ae = e.createGain();
      return ((ae.gain.value = ie), ae);
    },
    E = g(1),
    M = e.createDynamicsCompressor(),
    _ = g(nE()),
    T = e.createWaveShaper(),
    w = g(ji.master);
  ((M.threshold.value = ji.comp.threshold),
    (M.knee.value = ji.comp.knee),
    (M.ratio.value = ji.comp.ratio),
    (M.attack.value = ji.comp.attack),
    (M.release.value = ji.comp.release),
    (T.curve = tE()));
  try {
    T.oversample = "2x";
  } catch {}
  (E.connect(M),
    M.connect(_),
    _.connect(T),
    T.connect(w),
    w.connect(e.destination));
  let S = e.createBiquadFilter();
  ((S.type = "lowpass"), (S.frequency.value = 2e4), (S.Q.value = 0.5));
  let R = g(1);
  (S.connect(R), R.connect(E));
  let z = {
    world: g(1.25),
    near: g(1.24),
    gun: g(1),
    tail: g(1),
    amb: g(0.767),
    dry: g(1.3),
    music: g(ji.musicBus),
  };
  (z.world.connect(S),
    z.near.connect(S),
    z.gun.connect(S),
    z.tail.connect(S),
    z.dry.connect(E));
  let I = g(1),
    L = g(1),
    U = g(1);
  (z.amb.connect(I),
    I.connect(S),
    z.music.connect(U),
    U.connect(L),
    L.connect(E));
  function k(ie, ae, pe) {
    let Ee = e.currentTime,
      Me = ji.duck;
    for (let Ie of [I.gain, L.gain])
      try {
        (Ie.cancelScheduledValues(Ee),
          Ie.setTargetAtTime(ie, Ee, Me.attack),
          Ie.setTargetAtTime(1, Ee + (ae || Me.hold), pe || Me.release));
      } catch {}
  }
  let C = g(1),
    A = g(1),
    F = g(0),
    H = e.createConvolver(),
    N = e.createConvolver(),
    Z = g(0.75),
    Q = g(0.95),
    W = g(0.9),
    J = g(0.32),
    G = g(0.07),
    te = g(0.2);
  (z.world.connect(W),
    W.connect(C),
    z.near.connect(J),
    J.connect(C),
    z.gun.connect(G),
    G.connect(C),
    C.connect(A),
    C.connect(F),
    A.connect(H),
    F.connect(N),
    H.connect(Z),
    N.connect(Q),
    Z.connect(S),
    Q.connect(S),
    z.music.connect(te),
    te.connect(N),
    b("ir_outdoor", 0, (ie) => {
      H.buffer = ie;
    }),
    b("ir_shed", 0, (ie) => {
      N.buffer = ie;
    }));
  function oe(ie, ae, pe, Ee) {
    ie.positionX
      ? ((ie.positionX.value = ae),
        (ie.positionY.value = pe),
        (ie.positionZ.value = Ee))
      : ie.setPosition(ae, pe, Ee);
  }
  function ee(ie) {
    let ae = e.createPanner();
    return (
      (ae.panningModel = ie ? "HRTF" : "equalpower"),
      (ae.distanceModel = "inverse"),
      (ae.refDistance = 3),
      (ae.rolloffFactor = 0.6),
      (ae.maxDistance = 400),
      (ae.coneInnerAngle = 360),
      ae
    );
  }
  let le = { world: [], near: [], gun: [], tail: [], dry: [], music: [] };
  function xe(ie, ae) {
    let pe = {
      g: g(0),
      pan: null,
      src: null,
      end: 0,
      start: 0,
      name: "",
      pri: 0,
    };
    (ae
      ? ((pe.pan = ee(!1)), pe.g.connect(pe.pan), pe.pan.connect(z[ie]))
      : pe.g.connect(z[ie]),
      le[ie].push(pe));
  }
  for (let ie = 0; ie < 22; ie++) xe("world", !0);
  for (let ie = 0; ie < 12; ie++) xe("near", !1);
  for (let ie = 0; ie < 18; ie++) xe("gun", !1);
  for (let ie = 0; ie < 12; ie++) xe("tail", !1);
  for (let ie = 0; ie < 8; ie++) xe("dry", !1);
  for (let ie = 0; ie < 3; ie++) xe("music", !1);
  let j = { x: 0, y: 1.7, z: 0 },
    O = !1,
    q = !1,
    ue = 0.9,
    de = (n.game && n.game.state) || "title",
    $ = 0,
    se = 0,
    fe = 0,
    me = 0,
    ge = 0,
    ce = 0,
    P = 1,
    D = 1,
    B = 0,
    X = -9,
    re = -9,
    Y = ji.weapon.rifle,
    he = -9,
    V = -9,
    ne = -9,
    ye = -9,
    Te = -9,
    Re = -9,
    Ue = -9,
    Ve = {},
    ze = { rifle: 0, pistol: 0 },
    Ge = [],
    _e = { autoIntensity: !0 };
  function Ne(ie, ae, pe, Ee) {
    let Me = null,
      Ie = 0,
      Ce = null,
      Ye = null;
    for (let rt = 0; rt < ie.length; rt++) {
      let Be = ie[rt];
      if (Be.end <= Ee) {
        Me || (Me = Be);
        continue;
      }
      (Be.name === ae && (Ie++, (!Ce || Be.start < Ce.start) && (Ce = Be)),
        (!Ye ||
          Be.pri < Ye.pri ||
          (Be.pri === Ye.pri && Be.start < Ye.start)) &&
          (Ye = Be));
    }
    if (Ie >= (pe.max || 4)) {
      if (!pe.soft || !Me) return Ce;
      try {
        (Ce.g.gain.cancelScheduledValues(Ee),
          Ce.g.gain.setTargetAtTime(0, Ee, 0.035),
          Ce.src && Ce.src.stop(Ee + 0.25));
      } catch {}
      ((Ce.end = Ee + 0.25), (Ce.name = ""));
    }
    return Me || (Ye && Ye.pri <= pe.pri ? Ye : null);
  }
  let ke = (ie, ae) => !!je(ie, ae);
  function je(ie, ae) {
    ((ae = ae || {}),
      (ie = i_[ie] || ie),
      ae.surface &&
        (ie === "impact_concrete"
          ? (ie = l_[ae.surface] || ie)
          : ie === "step_concrete" && (ie = Iv[ae.surface] || ie)));
    let pe = Go[ie];
    if (!pe || pe.loop || pe.ir || !o()) return null;
    let Ee = ae.variant;
    Ee == null
      ? (Ee = Ve[ie] =
          ((Ve[ie] || 0) + 1 + (pe.n > 2 && s() < 0.3 ? 1 : 0)) % pe.n)
      : (Ee %= pe.n);
    let Me = r.get(ie + "#" + Ee);
    if (!Me) {
      if (ae.noDefer && tC.has(ie)) return null;
      if (tC.has(ie)) {
        let o0 = e.currentTime;
        return (
          b(ie, Ee, () => {
            e.currentTime - o0 < 2.5 &&
              ke(ie, Object.assign({}, ae, { variant: Ee }));
          }),
          null
        );
      }
      Me = p(ie, Ee);
    }
    let Ie = e.currentTime,
      Ce = ae.pos,
      Ye = !!Ce && pe.bus === "world",
      rt = Ye ? le.world : le[pe.bus === "world" ? "near" : pe.bus],
      Be = Ne(rt, ie, pe, Ie);
    if (!Be) return null;
    let _t = Ie + (ae.delay || 0),
      wt = Be.g.gain;
    if ((wt.cancelScheduledValues(Ie), Be.end > Ie && Be.src)) {
      wt.setTargetAtTime(0, Ie, 0.004);
      try {
        Be.src.stop(Ie + 0.025);
      } catch {}
      _t = Math.max(_t, Ie + 0.025);
    }
    let z0 = ae.jitter != null ? ae.jitter : 0.035,
      Pi = ti((ae.pitch || 1) * (1 + (s() * 2 - 1) * z0), 0.25, 4);
    if (
      (wt.setValueAtTime(
        (ae.gain != null ? ae.gain : 1) * (1 - s() * 0.08),
        _t,
      ),
      Ye)
    ) {
      let o0 = Array.isArray(Ce) ? { x: Ce[0], y: Ce[1], z: Ce[2] } : Ce;
      (oe(Be.pan, o0.x || 0, o0.y || 0, o0.z || 0),
        (Be.pan.refDistance = ae.ref || pe.ref || 3),
        (Be.pan.rolloffFactor =
          ae.roll != null ? ae.roll : pe.roll != null ? pe.roll : 0.6));
    }
    let Lt = e.createBufferSource();
    return (
      (Lt.buffer = Me),
      (Lt.playbackRate.value = Pi),
      Lt.connect(Be.g),
      (Lt.onended = () => {
        try {
          Lt.disconnect();
        } catch {}
      }),
      Lt.start(_t),
      (Be.src = Lt),
      (Be.start = _t),
      (Be.end = _t + Me.duration / Pi + 0.03),
      (Be.name = ie),
      (Be.pri = pe.pri || 0),
      Be
    );
  }
  let Ze = new Set(),
    qe = new Set(),
    Oe = () => {},
    mt = !1,
    $e = { setPos: Oe, setGain: Oe, setPitch: Oe, stop: Oe, alive: !1 };
  function Ke(ie, ae) {
    ae = ae || {};
    let pe = Go[ie];
    if (!pe || !pe.loop) return $e;
    let Ee = (ie === "gull_rotor" || ie === "hound_servo") && !ae._auto;
    Ee && !ae.hrtf && (ae = Object.assign({ hrtf: !0 }, ae));
    let Me = {
        name: ie,
        alive: !0,
        vT: 1,
        vC: 1,
        px: 0,
        py: 0,
        pz: 0,
        gT: ae.gain != null ? ae.gain : 1,
        gC: 0,
        pT: ae.pitch || 1,
        pC: ae.pitch || 1,
        src: null,
        g: g(0),
        pan: null,
        rate: ae.fade || 6,
      },
      Ie = Me.g;
    if (
      (ae.pos &&
        ((Me.pan = ee(!!ae.hrtf)),
        (Me.pan.refDistance = ae.ref || pe.ref || 3),
        (Me.pan.rolloffFactor =
          ae.roll != null ? ae.roll : pe.roll != null ? pe.roll : 0.6),
        Me.g.connect(Me.pan),
        (Ie = Me.pan)),
      Ie.connect(z[ae.bus || (ae.pos ? "world" : pe.music ? "music" : "amb")]),
      (Me.setPos = (Ce) => {
        Me.pan &&
          Ce &&
          (Array.isArray(Ce)
            ? ((Me.px = Ce[0]), (Me.py = Ce[1]), (Me.pz = Ce[2]))
            : ((Me.px = Ce.x || 0), (Me.py = Ce.y || 0), (Me.pz = Ce.z || 0)),
          Number.isFinite(Me.px + Me.py + Me.pz) &&
            oe(Me.pan, Me.px, Me.py, Me.pz));
      }),
      (Me.setGain = (Ce) => {
        Me.gT = Math.max(0, +Ce || 0);
      }),
      (Me.setPitch = (Ce) => {
        Me.pT = ti(+Ce || 1, 0.25, 4);
      }),
      (Me.stop = (Ce) => {
        if (!Me.alive) return;
        ((Me.alive = !1), Ze.delete(Me), qe.delete(Me));
        let Ye = Ce ?? 0.18,
          rt = e.currentTime;
        try {
          (Me.g.gain.setValueAtTime(Me.gC, rt),
            Me.g.gain.linearRampToValueAtTime(0, rt + Ye),
            Me.src && Me.src.stop(rt + Ye + 0.03));
        } catch {}
        setTimeout(
          () => {
            try {
              (Me.src && Me.src.disconnect(),
                Me.g.disconnect(),
                Me.pan && Me.pan.disconnect());
            } catch {}
          },
          (Ye + 0.3) * 1e3,
        );
      }),
      ae.pos && Me.setPos(ae.pos),
      b(ie, 0, (Ce) => {
        if (!Me.alive) return;
        let Ye = e.createBufferSource();
        ((Ye.buffer = Ce),
          (Ye.loop = !0),
          (Ye.playbackRate.value = Me.pC),
          Ye.connect(Me.g),
          Ye.start(0, ae.offset != null ? ae.offset : s() * Ce.duration),
          (Me.src = Ye));
      }),
      Ze.add(Me),
      Ee && (qe.add(Me), !mt))
    ) {
      mt = !0;
      for (let Ce of [...Sn.keys()]) xn(Ce);
    }
    return Me;
  }
  let Bt = rE({
    ctx: e,
    out: z.music,
    bufs: r,
    whenReady: b,
    running: o,
    rnd: s,
  });
  function Gt() {}
  let vi = {
      rain: Ke("rain", { gain: 0, fade: 2 }),
      rainIn: Ke("rain_interior", { gain: 0, fade: 2 }),
      wind: Ke("wind", { gain: 0, fade: 2 }),
      sea: Ke("sea", { gain: 0, pos: [33, -1, 0], fade: 2, bus: "amb" }),
    },
    q0 = 0.4,
    yi = 0.4,
    sn = 2,
    P0 = {
      fog: 14 + s() * 14,
      gull: 5 + s() * 8,
      hal: 4 + s() * 6,
      bang: 20 + s() * 25,
    };
  function $t(ie, ae) {
    let pe = 1 - 0.7 * se;
    if ((P0.fog -= ie) <= 0) {
      P0.fog = 40 + s() * 30;
      let Ee = j.z + (s() * 2 - 1) * 250;
      ke("foghorn", {
        pos: [j.x + 320, 8, Ee],
        ref: 400,
        gain: 0.34 * ae * pe,
        pitch: s() < 0.3 ? 0.89 : 1,
        jitter: 0.01,
      });
    }
    if ((P0.gull -= ie) <= 0) {
      P0.gull = 9 + s() * 16;
      let Ee = s() * 6.283,
        Me = 35 + s() * 50;
      ke("gull_cry", {
        pos: [j.x + Math.cos(Ee) * Me, 14 + s() * 18, j.z + Math.sin(Ee) * Me],
        ref: Me,
        roll: 1,
        gain: (0.16 + s() * 0.16) * ae * pe,
        jitter: 0.1,
      });
    }
    if (
      ((P0.hal -= ie) <= 0 &&
        ((P0.hal = 6 + s() * 11),
        ke("halyard", {
          pos: [29 + s() * 8, 3 + s() * 6, -8 + s() * 32],
          ref: 16,
          roll: 0.5,
          gain: (0.3 + s() * 0.3) * ae * pe,
          jitter: 0.08,
        })),
      (P0.bang -= ie) <= 0)
    ) {
      P0.bang = 28 + s() * 34;
      let Ee = 1.6 + s() * 3.2;
      ke("container_bang", {
        pos: [j.x + Math.cos(Ee) * 150, 4, j.z + Math.sin(Ee) * 150],
        ref: 150,
        gain: (0.2 + s() * 0.16) * ae * pe,
        jitter: 0.12,
      });
    }
  }
  let Sn = new Map(),
    bi = 0;
  function oi(ie) {
    !ie ||
      mt ||
      Sn.has(ie) ||
      ie.alive === !1 ||
      Sn.set(ie, {
        h: null,
        type: ie.type === "hound" ? "hound" : "gull",
        lx: ie.pos ? ie.pos.x : 0,
        ly: ie.pos ? ie.pos.y : 0,
        lz: ie.pos ? ie.pos.z : 0,
        sp: 0,
        d: 1e9,
        tune: 0.96 + s() * 0.1,
      });
  }
  function xn(ie) {
    let ae = Sn.get(ie);
    ae && (ae.h && ae.h.stop(0.12), Sn.delete(ie));
  }
  let Zt = [];
  function Vs(ie) {
    if (((bi -= ie), bi <= 0 && mt)) {
      ((bi = 0.25), (Zt.length = 0));
      for (let ae of qe)
        ((ae.d = Math.hypot(ae.px - j.x, ae.py - j.y, ae.pz - j.z)),
          Zt.push(ae));
      Zt.sort((ae, pe) => ae.d - pe.d);
      for (let ae = 0; ae < Zt.length; ae++)
        Zt[ae].vT = ae < 6 && Zt[ae].d < 90 ? 1 : 0;
    }
    if (bi <= 0) {
      bi = 0.25;
      let ae = n.enemies && n.enemies.list;
      if (Array.isArray(ae))
        for (let pe = 0; pe < ae.length; pe++) {
          let Ee = ae[pe];
          Ee && Ee.alive !== !1 && !Sn.has(Ee) && oi(Ee);
        }
      Zt.length = 0;
      for (let [pe, Ee] of Sn) {
        if (pe.alive === !1 || (Array.isArray(ae) && ae.indexOf(pe) < 0)) {
          xn(pe);
          continue;
        }
        let Me = pe.pos;
        Me &&
          ((Ee.d = Math.hypot(Me.x - j.x, Me.y - j.y, Me.z - j.z)),
          Zt.push(Ee));
      }
      Zt.sort((pe, Ee) => pe.d - Ee.d);
      for (let pe = 0; pe < Zt.length; pe++) {
        let Ee = Zt[pe],
          Me = pe < 6 && Ee.d < 90;
        Me && !Ee.h
          ? (Ee.h = Ke(Ee.type === "gull" ? "gull_rotor" : "hound_servo", {
              pos: [Ee.lx, Ee.ly, Ee.lz],
              gain: 0,
              hrtf: !0,
              fade: 5,
              _auto: !0,
            }))
          : !Me && Ee.h && (Ee.h.stop(0.25), (Ee.h = null));
      }
    }
    for (let [ae, pe] of Sn) {
      let Ee = ae.pos;
      if (Ee) {
        if (ie > 0) {
          let Me = Math.hypot(Ee.x - pe.lx, Ee.y - pe.ly, Ee.z - pe.lz) / ie;
          pe.sp += (Math.min(Me, 30) - pe.sp) * Math.min(1, ie * 5);
        }
        if (((pe.lx = Ee.x), (pe.ly = Ee.y), (pe.lz = Ee.z), !!pe.h))
          if ((pe.h.setPos(Ee), pe.type === "gull"))
            (pe.h.setGain(1),
              pe.h.setPitch(pe.tune * (0.94 + 0.3 * ti(pe.sp / 10, 0, 1))));
          else {
            let Me = ti(pe.sp / 3, 0, 1);
            (pe.h.setGain(0.3 + 0.5 * Me),
              pe.h.setPitch(pe.tune * (0.88 + 0.3 * Me)));
          }
      }
    }
  }
  let ws = [];
  function cl() {
    for (let ae of ws) ae.h.stop(0.2);
    ws = [];
    let ie = n.level && n.level.objectives;
    Array.isArray(ie) &&
      ie.forEach((ae, pe) => {
        ae &&
          ae.pos &&
          ws.push({
            id: ae.id,
            index: pe,
            pos: { x: ae.pos.x, y: (ae.pos.y || 0) + 1.2, z: ae.pos.z },
            h: Ke("relay_hum", {
              pos: [ae.pos.x, (ae.pos.y || 0) + 1.2, ae.pos.z],
              gain: 0.9,
            }),
          });
      });
  }
  function I0(ie) {
    ie = ie || {};
    let ae = ws.findIndex((pe) => ie.id != null && pe.id === ie.id);
    if (
      (ae < 0 &&
        ie.index != null &&
        (ae = ws.findIndex((pe) => pe.index === ie.index)),
      ae >= 0)
    ) {
      let pe = ws[ae];
      (pe.h.stop(0.08),
        ws.splice(ae, 1),
        ke("relay_cut", { pos: pe.pos, gain: 1 }));
    } else ke("relay_cut", { gain: 0.8 });
  }
  let Kt = (ie) => (ie && typeof ie.x == "number" ? ie : null),
    be = (ie) => (ie && ie.weapon === "pistol" ? "pistol" : "rifle");
  function Le(ie) {
    let ae = ji.weapon[ie],
      pe = e.currentTime;
    ((Y = ae),
      (X = pe),
      (ze[ie] = (ze[ie] + 1 + (s() < 0.25 ? 1 : 0)) % ae.n),
      je(ae.shot, { variant: ze[ie], gain: ae.gain, jitter: 0.012 }));
    for (let Ce of Ge)
      if (Ce.ch.src === Ce.src)
        try {
          Ce.ch.g.gain.cancelScheduledValues(pe);
        } catch {}
    Ge.length = 0;
    let Ee = se,
      Me = Q6_2(pe - re),
      Ie = (Ce, Ye) => {
        if (Ye < 0.05) return;
        let rt = ae.tail * Ye,
          Be = je(Ce, { gain: rt * Me, jitter: 0.02, noDefer: !0 });
        if (Be && Me < 0.999) {
          try {
            Be.g.gain.setTargetAtTime(rt, Be.start + ji.tailBoostAfter, 0.03);
          } catch {}
          Ge.push({ ch: Be, src: Be.src });
        }
      };
    (Ie(ae.tailOut, Math.cos((Ee * Math.PI) / 2)),
      Ie(ae.tailIn, Math.sin((Ee * Math.PI) / 2)),
      (re = pe),
      k(ae.duck),
      me > 0.3 && (me = Math.min(1, me + 0.015)));
  }
  let Fe = (ie, ae) => {
    i &&
      i.on &&
      i.on(ie, (pe) => {
        try {
          ae(pe || {});
        } catch (Ee) {
          console.error("[audio] " + ie, Ee);
        }
      });
  };
  (Fe("weapon:fire", (ie) => {
    o() && Le(be(ie));
  }),
    Fe("weapon:dry", (ie) =>
      ke(be(ie) === "pistol" ? "pistol_dry" : "rifle_dry", {
        gain: 1,
        jitter: 0.02,
      }),
    ));
  let He = {
    rifle: {
      magout: "reload_magout",
      maginsert: "reload_maginsert",
      magin: "reload_magin",
      boltback: "reload_boltback",
      bolt: "reload_bolt",
      slide: "reload_bolt",
    },
    pistol: {
      magout: "pistol_magout",
      maginsert: "pistol_maginsert",
      magin: "pistol_magin",
      boltback: "pistol_slide",
      bolt: "pistol_slide",
      slide: "pistol_slide",
    },
  };
  (Fe("weapon:reload", (ie) => {
    let ae = be(ie),
      pe = ie.phase,
      Ee = He[ae][pe];
    pe === "start"
      ? ke("gear_rustle", {
          variant: 0,
          gain: 0.9,
          pitch: ae === "pistol" ? 1.12 : 1,
        })
      : pe === "done"
        ? ke("gear_rustle", {
            variant: 1,
            gain: 0.6,
            pitch: ae === "pistol" ? 1.12 : 1,
          })
        : pe === "boltback" && ae === "rifle"
          ? ke(Ee, {
              variant: ie.partial ? 1 : 0,
              gain: ie.partial ? 0.6 : 1,
              jitter: 0.02,
            })
          : Ee && ke(Ee, { gain: 1, jitter: 0.02 });
  }),
    Fe("weapon:switch", (ie) => {
      let ae = ie.to === "pistol",
        pe = ie.from === "pistol";
      ie.phase === "holster"
        ? ke("weapon_holster", { gain: pe ? 0.75 : 1, pitch: pe ? 1.18 : 1 })
        : ie.phase === "draw" &&
          ke("weapon_draw", { gain: ae ? 0.8 : 1, pitch: ae ? 1.15 : 1 });
    }),
    Fe("weapon:melee", () => ke("jump", { gain: 0.9, pitch: 1.2 })),
    Fe("shell:bounce", (ie) => {
      let ae = e.currentTime;
      if (ae - ye < 0.04) return;
      ye = ae;
      let pe = Y.shellPitch;
      ie.surface === "water"
        ? ke("impact_water", { pos: Kt(ie.pos), gain: 0.25, pitch: 1.7 })
        : ie.surface === "metal" || ie.surface === "glass"
          ? ke("shell_bounce_metal", {
              pos: Kt(ie.pos),
              gain: 1,
              pitch: pe,
              jitter: 0.06,
            })
          : ke("shell_bounce", {
              pos: Kt(ie.pos),
              gain:
                ie.surface === "wood" ||
                ie.surface === "rubber" ||
                ie.surface === "dirt"
                  ? 0.5
                  : 0.85,
              pitch: pe * (ie.surface === "wood" ? 0.9 : 1),
              jitter: 0.06,
            });
    }),
    Fe("impact", (ie) => {
      let ae = e.currentTime;
      if (ae - he < 0.022) return;
      he = ae;
      let pe = Kt(ie.point),
        Ee = ie.surface;
      if (ie.enemy) {
        ke("impact_enemy", {
          pos: pe,
          gain: ie.part === "weak" ? 1 : 0.85,
          pitch: ie.part === "weak" ? 1.25 : 1,
        });
        return;
      }
      if (
        ie.from === "enemy" &&
        pe &&
        ie.dir &&
        typeof ie.dir.x == "number" &&
        ae - Ue > 0.09
      ) {
        let Me = ie.dir,
          Ie = Me.x * Me.x + Me.y * Me.y + Me.z * Me.z || 1,
          Ce =
            ((j.x - pe.x) * Me.x + (j.y - pe.y) * Me.y + (j.z - pe.z) * Me.z) /
            Ie;
        if (Ce < -1.5) {
          let Ye = pe.x + Me.x * Ce,
            rt = pe.y + Me.y * Ce,
            Be = pe.z + Me.z * Ce,
            _t = Math.hypot(j.x - Ye, j.y - rt, j.z - Be);
          _t < 3.2 &&
            ((Ue = ae),
            ke("whiz", {
              pos: { x: Ye, y: rt, z: Be },
              gain: ti(1.15 - _t / 3.5, 0.3, 1),
              jitter: 0.1,
            }));
        }
      }
      (ke(l_[Ee] || "impact_concrete", {
        pos: pe,
        gain: ie.from === "enemy" ? 0.8 : 0.9,
        pitch: Ee === "dirt" ? 0.8 : Ee === "rubber" ? 0.7 : 1,
        jitter: 0.07,
      }),
        ae - V > 0.22 &&
          ((Ee === "metal" && s() < 0.24) ||
            (Ee === "concrete" && s() < 0.07)) &&
          ((V = ae),
          ke("ricochet", {
            pos: pe,
            gain: 0.75,
            delay: 0.012,
            jitter: 0.12,
          })));
    }),
    Fe("player:step", (ie) => {
      let ae = ie.surface || "concrete";
      try {
        ie.pos &&
          n.ground &&
          n.ground.isPuddle &&
          n.ground.isPuddle(ie.pos.x, ie.pos.z) &&
          (ae = "water");
      } catch {}
      ke(Iv[ae] || "step_concrete", {
        gain: (ie.sprint ? 0.8 : 0.55) * (ae === "water" ? 0.9 : 1),
        pitch: (ie.sprint ? 1.05 : 1) * (ae === "wood" ? 1.18 : 1),
        jitter: 0.06,
      });
    }),
    Fe("player:jump", () => ke("jump", { gain: 0.8 })),
    Fe("player:land", (ie) => {
      let ae = ti(0.35 + (Math.abs(ie.speed) || 4) / 10, 0.35, 1);
      (ke("land", { gain: ae }),
        (ie.surface === "water" || ie.surface === "metal") &&
          ke(Iv[ie.surface], { gain: ae * 0.8, pitch: 0.9 }));
    }),
    Fe("player:hit", (ie) => {
      let ae = +ie.amount || 10,
        pe = e.currentTime;
      (ke("hurt", { gain: ti(0.5 + ae / 40, 0.5, 1), jitter: 0.08 }),
        ae >= 6 &&
          pe - ne > 1.8 &&
          ((ne = pe),
          ke("ear_ring", { gain: ti(ae / 28, 0.3, 1), jitter: 0.02 })),
        (ce = Math.max(ce, ti(ae / 40, 0.2, 0.7))),
        (me = Math.min(1, Math.max(me, 0.6) + 0.15)));
    }),
    Fe("player:dead", () => {
      (Bt.death(), (ce = 1));
    }),
    Fe("enemy:spawn", (ie) => oi(ie.enemy)),
    Fe("enemy:alert", (ie) => {
      me = Math.max(me, 0.6);
      let ae = e.currentTime;
      if (ae - Te < 0.12) return;
      Te = ae;
      let pe = ie.enemy || {};
      ke("alert", {
        pos: Kt(pe.pos) || Kt(ie.pos),
        variant: pe.type === "hound" ? 1 : 0,
        gain: 0.9,
      });
    }),
    Fe("enemy:fire", (ie) => {
      let ae = ie.type || (ie.enemy && ie.enemy.type),
        pe = Kt(ie.pos) || (ie.enemy && Kt(ie.enemy.pos));
      (ke(ae === "hound" ? "hound_fire" : "gull_fire", {
        pos: pe,
        gain: 1,
        jitter: 0.04,
      }),
        (me = Math.min(1, Math.max(me, 0.6) + 0.05)));
    }),
    Fe("enemy:step", (ie) => {
      if (ie.crash) {
        (ke("hound_step", { pos: Kt(ie.pos), gain: 1, pitch: 0.72 }),
          ke("impact_metal", { pos: Kt(ie.pos), gain: 0.8, pitch: 0.55 }));
        return;
      }
      ie.type !== "gull" &&
        ke("hound_step", {
          pos: Kt(ie.pos),
          gain: ti(0.6 + (+ie.speed || 2) * 0.1, 0.6, 1),
          jitter: 0.06,
        });
    }),
    Fe("enemy:telegraph", (ie) => {
      let ae = ie.enemy || {},
        pe = ie.type || ae.type,
        Ee = ti(+ie.time || 0.55, 0.15, 1.5);
      (ke("telegraph", {
        pos: Kt(ie.pos) || Kt(ae.pos),
        variant: pe === "hound" ? 1 : 0,
        pitch: 0.55 / Ee,
        gain: ie.melee ? 0.7 : 1,
        jitter: 0,
      }),
        (me = Math.max(me, 0.6)));
    }),
    Fe("enemy:melee", (ie) => {
      let ae = Kt(ie.pos) || (ie.enemy && Kt(ie.enemy.pos));
      (ke("hound_step", { pos: ae, gain: 1, pitch: 0.8 }),
        ke("impact_metal", { pos: ae, gain: 0.9, pitch: 0.7 }),
        ke("hurt", { gain: 0.6 }));
    }),
    Fe("enemy:killed", (ie) => {
      let ae = ie.enemy,
        pe = ie.type || (ae && ae.type),
        Ee = Kt(ie.pos) || (ae && Kt(ae.pos));
      (ae && xn(ae),
        ke(pe === "hound" ? "hound_die" : "gull_die", {
          pos: Ee,
          gain: 1,
          jitter: 0.05,
        }));
    }),
    Fe("explosion", (ie) => {
      let ae = ti(+ie.size || 1, 0.3, 3),
        pe = Kt(ie.pos),
        Ee = ae >= 1.3,
        Me = () =>
          ke("explosion", {
            pos: pe,
            gain: ti(0.42 + 0.4 * ae, 0.5, 1),
            pitch: ti(1.26 - 0.22 * ae, 0.82, 1.2),
            jitter: 0.04,
          });
      if (
        ((Ee &&
          je("explosion_big", {
            pos: pe,
            gain: ti(0.7 + 0.18 * ae, 0.9, 1.2),
            pitch: ti(1.13 - 0.075 * ae, 0.92, 1.04),
            jitter: 0.03,
            ref: 12 + 3 * ae,
            noDefer: !0,
          })) ||
          Me(),
        pe)
      ) {
        let Ie = Math.hypot(pe.x - j.x, pe.y - j.y, pe.z - j.z);
        ce = Math.max(ce, ti((1 - (Ie - 5) / 10) * (Ee ? 1 : 0.7), 0, 0.8));
      }
      ((me = Math.max(me, 0.6)),
        (P = Math.min(P, Ee ? 0.3 : 0.45)),
        k(Ee ? 0.4 : 0.6, Ee ? 0.4 : 0.15, Ee ? 0.45 : 0.2));
    }),
    Fe("objective:done", (ie) => {
      (I0(ie), Bt.relay());
    }),
    Fe("objective:all", () => Bt.finalRun()));
  let De = () => Bt.complete();
  (Fe("extraction:reached", De),
    Fe("thunder", (ie) => {
      let ae = ti(ie.intensity != null ? +ie.intensity : 0.6, 0.1, 1);
      ke("thunder", {
        variant: ae > 0.6 ? 1 : 0,
        delay: 0.5 + (1 - ae) * 2 + s() * 0.6,
        gain: 0.35 + 0.65 * ae,
        jitter: 0.1,
      });
    }),
    Fe("ui:click", () => ke("ui_click")),
    Fe("ui:hover", () => ke("ui_hover")),
    Fe("game:state", (ie) => {
      let ae = de;
      if (
        ((de = ie.state || de),
        Bt.state(de, ae),
        de === "playing" && ae !== "paused")
      ) {
        ((me = 0), (ce = 0), cl());
        for (let pe of [...Sn.keys()]) pe.alive === !1 && xn(pe);
      }
      (de === "complete" && De(),
        de === "paused" ? (q = !0) : ae === "paused" && (q = !1));
    }));
  function ve() {
    if (((O = !0), e.state !== "running" && e.state !== "closed"))
      try {
        let ie = e.resume();
        ie && ie.catch && ie.catch(() => {});
      } catch {}
  }
  if (typeof window < "u" && !t) {
    let ie = () => {
      if ((ve(), o()))
        for (let ae of ["pointerdown", "keydown", "touchend", "mousedown"])
          window.removeEventListener(ae, ie, !0);
    };
    for (let ae of ["pointerdown", "keydown", "touchend", "mousedown"])
      window.addEventListener(ae, ie, { capture: !0, passive: !0 });
    document.addEventListener("visibilitychange", () => {
      try {
        document.hidden ? e.suspend() : O && e.resume();
      } catch {}
    });
  }
  function we(ie) {
    ie = Math.min(Math.max(+ie || 0, 0), 0.25);
    let ae = n.camera,
      pe = e.listener;
    if (ae && ae.matrixWorld) {
      let Be = ae.matrixWorld.elements;
      ((j.x = Be[12]),
        (j.y = Be[13]),
        (j.z = Be[14]),
        Number.isFinite(j.x + j.y + j.z + Be[8] + Be[4]) &&
          (pe.positionX
            ? ((pe.positionX.value = j.x),
              (pe.positionY.value = j.y),
              (pe.positionZ.value = j.z),
              (pe.forwardX.value = -Be[8]),
              (pe.forwardY.value = -Be[9]),
              (pe.forwardZ.value = -Be[10]),
              (pe.upX.value = Be[4]),
              (pe.upY.value = Be[5]),
              (pe.upZ.value = Be[6]))
            : (pe.setPosition(j.x, j.y, j.z),
              pe.setOrientation(
                -Be[8],
                -Be[9],
                -Be[10],
                Be[4],
                Be[5],
                Be[6],
              ))));
    }
    let Ee = n.level && n.level.interiorBoxes;
    if (Array.isArray(Ee) && Ee.length) {
      let Be = 0;
      for (let _t = 0; _t < Ee.length; _t++) {
        let wt = Ee[_t];
        if (
          wt &&
          wt.min &&
          wt.max &&
          j.x > wt.min.x &&
          j.x < wt.max.x &&
          j.y > wt.min.y - 0.5 &&
          j.y < wt.max.y &&
          j.z > wt.min.z &&
          j.z < wt.max.z
        ) {
          Be = 1;
          break;
        }
      }
      $ = Be;
    }
    let Me = (Be) => 1 - Math.exp(-ie * Be);
    if (
      ((se += ($ - se) * Me(3)),
      (A.gain.value = 1 - 0.9 * se),
      (F.gain.value = se),
      !o())
    )
      return;
    let Ie = e.currentTime,
      Ce = de === "playing" || de === "intro";
    ((B +=
      ((q ? 0 : de === "title" ? 0.6 : de === "dead" ? 0.7 : 1) - B) * Me(1.2)),
      (D += ((q ? 0 : 1) - D) * Me(12)),
      (R.gain.value = D),
      (ce += ((de === "dead" ? 0.85 : 0) - ce) * Me(de === "dead" ? 3 : 0.9)),
      (S.frequency.value = 2e4 * Math.pow(0.03, ti(ce, 0, 1))),
      (w.gain.value = ue),
      (sn -= ie) <= 0 && ((sn = 3 + s() * 6), (yi = 0.12 + s() * 0.88)),
      (q0 += (yi - q0) * Me(0.5)),
      vi.rain.setGain(B * (1 - 0.93 * se) * 0.95),
      vi.rainIn.setGain(B * se * 0.95),
      vi.wind.setGain(B * (0.3 + 0.7 * q0) * (1 - 0.65 * se) * 0.75),
      vi.wind.setPitch(0.9 + 0.25 * q0),
      vi.sea.setGain(B * (1 - 0.5 * se) * 1),
      vi.sea.setPos([33, -1, ti(j.z, -28, 26)]),
      !q &&
        (Ce || de === "title" || de === "complete") &&
        $t(ie, de === "title" ? 0.7 : 1),
      q || Vs(ie),
      (me = Math.max(0, me - ie * (Sn.size ? 0.045 : 0.14))));
    let rt =
      Ce || q ? Math.max(fe, _e.autoIntensity ? Math.max(0.15, me) : 0) : 0;
    ((ge += (rt - ge) * Me(2)),
      (P += (1 - P) * Me(3.5)),
      (U.gain.value = P * (q ? 0.45 : 1)),
      Bt.update(ie, ge, rt));
    for (let Be of Ze)
      ((Be.vC += (Be.vT - Be.vC) * Me(4)),
        (Be.gC += (Be.gT * Be.vC - Be.gC) * Me(Be.rate)),
        (Be.g.gain.value = Be.gC),
        Be.src &&
          Math.abs(Be.pT - Be.pC) > 1e-4 &&
          ((Be.pC += (Be.pT - Be.pC) * Me(8)),
          (Be.src.playbackRate.value = Be.pC)));
  }
  async function Ae(ie) {
    ((ie = ie || {}), await v);
    let ae = e.sampleRate,
      pe = ie.seconds || 10,
      Ee = new OfflineAudioContext(2, ae * pe, ae),
      Me = new Map(),
      Ie = {
        on(Ht, rn) {
          (Me.has(Ht) || Me.set(Ht, []), Me.get(Ht).push(rn));
        },
        emit(Ht, rn) {
          for (let Hi of Me.get(Ht) || []) Hi(rn);
        },
      },
      Ce = new Float32Array(16);
    ((Ce[0] = Ce[5] = Ce[10] = Ce[15] = 1), (Ce[13] = 1.7));
    let Ye = [
        { type: "gull", alive: !0, pos: { x: 6, y: 4, z: -9 } },
        { type: "hound", alive: !0, pos: { x: -8, y: 0, z: -14 } },
        { type: "gull", alive: !0, pos: { x: 0, y: 5, z: -30 } },
      ],
      rt = { min: { x: -99, y: -9, z: -99 }, max: { x: 99, y: 99, z: 99 } },
      Be = {
        events: Ie,
        params: {},
        camera: { matrixWorld: { elements: Ce } },
        enemies: { list: [] },
        level: {
          interiorBoxes: ie.interior
            ? [rt]
            : [
                {
                  min: { x: 500, y: 0, z: 500 },
                  max: { x: 501, y: 1, z: 501 },
                },
              ],
          objectives: [{ id: "A", pos: { x: 4, y: 0, z: 3 } }],
        },
      },
      _t = u_(Be, Ee, { bufs: r }),
      wt = 0.02,
      z0 = 0,
      Pi = (Ht) => {
        let rn = Ht * wt;
        if (
          (Ht === 0 &&
            (Ie.emit("game:state", { state: "playing" }),
            ie.bare && (_t.setIntensity(1), _t.music.snap())),
          rn < 3 &&
            Ht % 23 === 0 &&
            Ie.emit("player:step", { surface: "concrete", sprint: !1 }),
          Ht === 150)
        ) {
          for (let Hi of Ye)
            (Be.enemies.list.push(Hi), Ie.emit("enemy:spawn", { enemy: Hi }));
          (Ie.emit("enemy:alert", { enemy: Ye[0] }), _t.setIntensity(1));
        }
        (Ht >= 150 &&
          Ht < 198 &&
          Ht % 4 === 2 &&
          (Ie.emit("weapon:fire", { weapon: "rifle" }),
          ie.bare ||
            (Ie.emit("impact", {
              point: { x: 4, y: 1, z: -12 },
              surface: Ht % 8 ? "metal" : "concrete",
              from: "player",
            }),
            Ie.emit("shell:bounce", {
              pos: { x: 0.6, y: 0, z: 0.2 },
              surface: Ht % 3 ? "concrete" : "metal",
            }))),
          Ht >= 225 &&
            Ht < 275 &&
            Ht % 10 === 5 &&
            Ie.emit("weapon:fire", { weapon: "pistol" }),
          Ht === 276 && Ie.emit("weapon:dry", { weapon: "pistol" }));
        {
          let Hi = [
              "start",
              "magout",
              "maginsert",
              "magin",
              "boltback",
              "bolt",
              "done",
            ],
            Oi = (Ht - 280) / 4;
          Oi >= 0 &&
            Oi < Hi.length &&
            Oi === Math.floor(Oi) &&
            Ie.emit("weapon:reload", {
              phase: Hi[Oi],
              weapon: "rifle",
              empty: !0,
            });
        }
        (Ht === 312 &&
          Ie.emit("weapon:switch", {
            from: "rifle",
            to: "pistol",
            phase: "holster",
          }),
          Ht === 322 &&
            Ie.emit("weapon:switch", {
              from: "rifle",
              to: "pistol",
              phase: "draw",
            }),
          rn >= 4 &&
            rn < 6.6 &&
            !ie.bare &&
            (Ht % 13 === 0 &&
              Ie.emit("enemy:fire", {
                enemy: Ye[0],
                pos: Ye[0].pos,
                type: "gull",
              }),
            Ht % 17 === 0 &&
              Ie.emit("enemy:fire", {
                enemy: Ye[1],
                pos: Ye[1].pos,
                type: "hound",
              }),
            Ht % 25 === 0 &&
              Ie.emit("enemy:step", { pos: Ye[1].pos, type: "hound" })),
          Ht === 330 &&
            Ie.emit("explosion", { pos: { x: 3, y: 0, z: -7 }, size: 2 }),
          Ht === 345 &&
            Ie.emit("explosion", { pos: { x: -6, y: 3, z: -9 }, size: 0.9 }),
          Ht === 350 && Ie.emit("player:hit", { amount: 20 }),
          Ht === 360 &&
            ((Ye[0].alive = !1),
            Ie.emit("enemy:killed", {
              enemy: Ye[0],
              pos: Ye[0].pos,
              type: "gull",
            })),
          Ht === 400 &&
            (Ie.emit("objective:done", { id: "A", index: 0, total: 3 }),
            _t.setIntensity(0.15)));
      };
    for (let Ht = 1; Ht * wt < pe - 0.01; Ht++)
      Ee.suspend(Ht * wt).then(() => {
        (Pi(Ht), _t.update(wt), z0++, Ee.resume());
      });
    (Pi(0), _t.update(wt));
    let Lt = performance.now(),
      o0 = await Ee.startRendering(),
      g0 = performance.now() - Lt,
      M0 = {
        interior: !!ie.interior,
        renderMs: Math.round(g0),
        steps: z0,
        peak: 0,
        over: 0,
        nan: 0,
        rmsDb: [],
        shotPeakDb: [],
        shotRmsDb: [],
        bodyRmsDb: [],
        troughDb: [],
        bedRmsDb: 0,
        inst: _t.debug(),
      },
      on = o0.getChannelData(0),
      Tn = o0.getChannelData(1),
      ri = Math.round(ae / 2);
    for (let Ht = 0; Ht * ri < on.length; Ht++) {
      let rn = 0;
      for (let Hi = Ht * ri; Hi < (Ht + 1) * ri && Hi < on.length; Hi++) {
        let Oi = on[Hi],
          uc = Tn[Hi];
        (!(Math.abs(Oi) < 1e9) || !(Math.abs(uc) < 1e9)) && M0.nan++;
        let Wu = Math.max(Math.abs(Oi), Math.abs(uc));
        (Wu > M0.peak && (M0.peak = Wu),
          Wu >= 0.999 && M0.over++,
          (rn += Oi * Oi + uc * uc));
      }
      M0.rmsDb.push(+(10 * Math.log10(rn / (2 * ri) + 1e-12)).toFixed(1));
    }
    for (let Ht = 0; Ht < 12; Ht++) {
      let rn = Math.round((3.004 + Ht * 0.08) * ae),
        Hi = rn + Math.round(0.076 * ae),
        Oi = 0,
        uc = 0;
      for (let Br = rn; Br < Hi && Br < on.length; Br++) {
        let Xh = Math.max(Math.abs(on[Br]), Math.abs(Tn[Br]));
        (Xh > Oi && (Oi = Xh), (uc += on[Br] * on[Br]));
      }
      (M0.shotPeakDb.push(+(20 * Math.log10(Oi + 1e-9)).toFixed(1)),
        M0.shotRmsDb.push(
          +(10 * Math.log10(uc / (Hi - rn) + 1e-12)).toFixed(1),
        ));
      let Wu = (Br, Xh) => {
        let cb = 0;
        for (let Yh = Br; Yh < Xh && Yh < on.length; Yh++)
          cb += on[Yh] * on[Yh];
        return +(10 * Math.log10(cb / (Xh - Br) + 1e-12)).toFixed(1);
      };
      (M0.bodyRmsDb.push(Wu(rn, rn + Math.round(0.05 * ae))),
        M0.troughDb.push(
          Wu(rn + Math.round(0.051 * ae), rn + Math.round(0.076 * ae)),
        ));
    }
    {
      let Ht = 0,
        rn = Math.round(2 * ae),
        Hi = Math.round(2.95 * ae);
      for (let Oi = rn; Oi < Hi; Oi++) Ht += on[Oi] * on[Oi];
      M0.bedRmsDb = +(10 * Math.log10(Ht / (Hi - rn) + 1e-12)).toFixed(1);
    }
    return ((M0.peak = +M0.peak.toFixed(3)), M0);
  }
  return (
    Object.assign(_e, {
      ctx: e,
      resume: ve,
      play: ke,
      loop: Ke,
      update: we,
      ready: v,
      selfTest: Ae,
      music: Bt,
      setIntensity(ie) {
        fe = ti(+ie || 0, 0, 1);
      },
      setInterior(ie) {
        $ = ti(+ie || 0, 0, 1);
      },
      setVolume(ie) {
        ((ue = ti(+ie, 0, 1)),
          Number.isFinite(ue) || (ue = 0.9),
          (w.gain.value = ue));
      },
      setPaused(ie) {
        q = !!ie;
      },
      names: Object.keys(Go).filter((ie) => !Go[ie].ir),
      get intensity() {
        return ge;
      },
      get interior() {
        return se;
      },
      debug() {
        let ie = 0,
          ae = e.currentTime;
        for (let pe in le) for (let Ee of le[pe]) Ee.end > ae && ie++;
        return {
          state: e.state,
          sampleRate: e.sampleRate,
          buffers: c,
          queued: d.length,
          genMs: Math.round(l),
          bootMs: Math.round(u),
          voices: ie,
          loops: Ze.size,
          tracked: Sn.size,
          music: Bt.on,
          score: Bt.debug(),
          intensity: +ge.toFixed(2),
          interior: +se.toFixed(2),
          gameState: de,
          reverb: [!!H.buffer, !!N.buffer],
        };
      },
    }),
    _e
  );
}

export { createAudio };
