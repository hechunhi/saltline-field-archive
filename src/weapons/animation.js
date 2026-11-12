// Ported from the newer Saltline bundle (weapons/animation.js).
import { vf, zc } from "../core/config.js";
import { clamp, damp, lerp, saturate } from "../core/math.js";
import {
  Bone,
  Box3,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  Euler,
  Float32BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Skeleton,
  SkinnedMesh,
  Sphere,
  THREE,
  Vector3,
  defineModuleExports,
} from "../vendor/three-r180.js";
import { M1_2, ME, N_, Wv } from "./rig.js";
import {
  $a_2,
  Eu,
  Fs_2,
  Nn,
  Q0,
  RE,
  Su,
  TE,
  Tu,
  Xn_2,
  Yo,
  Zl,
  createWeapon,
  dn_2,
  en,
  fm,
  h0,
  i0,
  kn,
  m0,
  ma,
  oy,
  pa,
  pn,
  qv,
  ry,
  sa,
  showcaseWeapon,
  sy,
  tu,
  weaponShowcaseModule,
  wn_2,
} from "./weapon.js";

defineModuleExports(weaponShowcaseModule, {
  create: () => I5,
  showcase: () => BD,
});

var enemiesShowcaseModule = {
  rifle: {
    pivot: [0, -0.035, 0.3],
    ads: {
      pos: 0.22,
      rot: 0.05,
      w: 23,
      z: 0.75,
      arc: { p: [0.004, 0.011, 0.01], r: [0.02, -0.03, -0.03] },
      out: 0.03,
    },
    idle: {
      hz: 0.25,
      breathY: 5e-4,
      breathP: 9e-4,
      drift: 6e-4,
      driftR: 0.001,
      noise: 18e-5,
      noiseR: 4e-4,
    },
    walk: {
      y: 0.0034,
      x: 0.0034,
      z: 0.0016,
      pitch: 0.007,
      yaw: 0.01,
      roll: 0.015,
      lag: 0.04,
    },
    run: {
      y: 0.015,
      x: 0.011,
      z: 0.006,
      pitch: 0.028,
      yaw: 0.028,
      roll: 0.046,
      lag: 0.05,
    },
    crouch: 0.72,
    inertia: {
      z: 0.0042,
      x: 0.0034,
      pitch: 0.0085,
      roll: 0.01,
      lean: 0.006,
      tau: 0.13,
      spr: [15, 0.48],
    },
    sway: {
      lag: 0.058,
      max: 0.07,
      roll: 0.55,
      shift: 0.02,
      spr: [13.5, 0.64],
      adsRot: 0.1,
      adsPos: 0.5,
    },
    air: {
      jumpY: 0.26,
      jumpP: 0.95,
      fallY: 0.0019,
      fallP: 0.004,
      landY: 0.092,
      landP: 0.26,
      landR: 0.17,
      spr: [20.5, 0.56],
    },
    recoil: {
      back: 0.82,
      rise: 1.5,
      yaw: 0.95,
      roll: 1.7,
      up: 0.11,
      side: 0.09,
      first: 1.4,
      adsBack: 0.75,
      adsRot: 0.1,
      adsPos: 0.9,
      spr: {
        kZ: [44, 0.55],
        kP: [36, 0.5],
        kY: [30, 0.45],
        kR: [31, 0.42],
        kX: [40, 0.5],
        kU: [40, 0.5],
      },
    },
    sprint: { spr: [17, 1] },
    wall: {
      near: 0.42,
      far: 1.05,
      p: [-0.03, -0.035, 0.085],
      r: [0.34, 0.5, 0.16],
    },
    crouchDip: { y: 0.0075, pitch: 0.02, roll: 0.028, w: [16, 8] },
  },
  pistol: {
    pivot: [0, -0.085, 0.075],
    ads: {
      pos: 0.14,
      rot: 0.06,
      w: 29.5,
      z: 0.75,
      arc: { p: [0.003, 0.008, 0.012], r: [0.03, -0.02, -0.03] },
      out: 0.024,
    },
    idle: {
      hz: 0.25,
      breathY: 6e-4,
      breathP: 0.0011,
      drift: 7e-4,
      driftR: 0.0014,
      noise: 25e-5,
      noiseR: 7e-4,
    },
    walk: {
      y: 0.003,
      x: 0.0036,
      z: 0.0014,
      pitch: 0.009,
      yaw: 0.014,
      roll: 0.015,
      lag: 0.028,
    },
    run: {
      y: 0.012,
      x: 0.009,
      z: 0.005,
      pitch: 0.034,
      yaw: 0.03,
      roll: 0.04,
      lag: 0.034,
    },
    crouch: 0.72,
    inertia: {
      z: 0.0034,
      x: 0.0028,
      pitch: 0.011,
      roll: 0.012,
      lean: 0.0085,
      tau: 0.1,
      spr: [20, 0.5],
    },
    sway: {
      lag: 0.04,
      max: 0.085,
      roll: 0.45,
      shift: 0.012,
      spr: [19, 0.6],
      adsRot: 0.1,
      adsPos: 0.4,
    },
    air: {
      jumpY: 0.22,
      jumpP: 1.2,
      fallY: 0.0017,
      fallP: 0.005,
      landY: 0.078,
      landP: 0.34,
      landR: 0.2,
      spr: [23, 0.54],
    },
    recoil: {
      back: 0.55,
      rise: 6.4,
      yaw: 1.3,
      roll: 2.3,
      up: 0.2,
      side: 0.1,
      first: 1,
      adsBack: 0.8,
      adsRot: 0.42,
      adsPos: 0.8,
      spr: {
        kZ: [56, 0.55],
        kP: [50, 0.5],
        kY: [38, 0.48],
        kR: [38, 0.45],
        kX: [46, 0.5],
        kU: [46, 0.5],
      },
    },
    sprint: { spr: [20, 1] },
    wall: {
      near: 0.32,
      far: 0.8,
      p: [-0.02, -0.02, 0.13],
      r: [0.42, 0.3, 0.1],
    },
    crouchDip: { y: 0.0065, pitch: 0.03, roll: 0.026, w: [18, 9] },
  },
};

var ft_2 = {
  tac: 2.24,
  empty: 2.72,
  atMag: 0.36,
  magout: 0.4,
  clear: 0.52,
  away: 0.74,
  swap: 0.8,
  rise: 0.86,
  align: 1.1,
  insert: 1.15,
  short: 1.31,
  windup: 1.385,
  magin: 1.44,
  rebound: 1.5,
  regrip: 1.54,
  tugDown: 1.6,
  tugUp: 1.66,
  swapBack: 1.75,
  atHandle: 1.84,
  tacBack: 1.89,
  tacRelease: 1.905,
  tacBolt: 1.93,
  back: 1.96,
  release: 2.12,
  bolt: 2.155,
  shortBy: 0.009,
  backOff: 0.032,
  reboundBy: 0.008,
  tugBy: 0.005,
  partial: 0.32,
};

var It = {
  tac: 1.5,
  empty: 1.9,
  release: 0.12,
  magout: 0.18,
  swap: 0.48,
  rise: 0.52,
  align: 0.84,
  insert: 0.9,
  fingers: 1.02,
  windup: 1.075,
  magin: 1.13,
  rebound: 1.19,
  swapBack: 1.3,
  regrip: 1.44,
  thumb: 1.53,
  slideRelease: 1.575,
  slide: 1.61,
  backOff: 0.026,
  reboundBy: 0.01,
};

var xU = new Euler();

var vU = new RE();

var Us_2 = Vector3;

var ja_2 = Quaternion;

var Cu = { upper: 0.3, fore: 0.27 };

var er = { right: [0.19, -0.24, 0.1], left: [-0.19, -0.24, 0.1] };

var Un = 20;

var Eh = ["thumb", "index", "middle", "ring", "little"];

var t0_2 = [
  {
    name: "thumb",
    base: [-0.0235, -0.01, -0.02],
    dir: [-0.3, -0.05, -0.95],
    up: [-0.72, 0.69, 0],
    len: [0.044, 0.033, 0.029],
    rad: [0.015, 0.0122, 0.0112, 0.0098],
    wide: 1.15,
  },
  {
    name: "index",
    base: [-0.0335, 0.0015, -0.096],
    yaw: 0.07,
    roll: -0.05,
    sgn: 1,
    len: [0.0405, 0.0235, 0.022],
    rad: [0.0102, 0.0093, 0.0085, 0.0076],
    wide: 1.12,
  },
  {
    name: "middle",
    base: [-0.011, 0.0035, -0.101],
    yaw: 0.01,
    roll: 0,
    sgn: 1,
    len: [0.044, 0.0262, 0.0238],
    rad: [0.0104, 0.0095, 0.0087, 0.0078],
    wide: 1.12,
  },
  {
    name: "ring",
    base: [0.0105, 0.002, -0.0965],
    yaw: -0.06,
    roll: 0.05,
    sgn: -1,
    len: [0.0412, 0.0245, 0.0223],
    rad: [0.0099, 0.009, 0.0082, 0.0073],
    wide: 1.12,
  },
  {
    name: "little",
    base: [0.0305, -0.0015, -0.0875],
    yaw: -0.14,
    roll: 0.12,
    sgn: -1,
    len: [0.0325, 0.0188, 0.02],
    rad: [0.0089, 0.0081, 0.0073, 0.0065],
    wide: 1.12,
  },
];

var jz = new Us_2(0.2, 0, 0.98).normalize();

var kE = new Us_2(1, 0, 0);

var PE = new Us_2(0, 1, 0);

var Kz = new Us_2(0, 0, 1);

function Jz(n, e, t = new ja_2()) {
  let i = new Us_2(-n[0], -n[1], -n[2]).normalize(),
    s = new Us_2(e[0], e[1], e[2]).cross(i).normalize(),
    o = new Us_2().crossVectors(i, s);
  return t.setFromRotationMatrix(new Matrix4().makeBasis(s, o, i));
}

t0_2[0].q0 = Jz(t0_2[0].dir, t0_2[0].up);

for (let n = 1; n < 5; n++)
  t0_2[n].qRoll = new ja_2().setFromAxisAngle(Kz, t0_2[n].roll);

for (let n of t0_2) n.total = n.len[0] + n.len[1] + n.len[2];

var l0 = {
  upperArm: 0,
  forearm: 1,
  twist1: 2,
  twist2: 3,
  hand: 4,
  digit: (n, e) => 5 + n * 3 + e,
  helper: (n, e) => 20 + n * 3 + e,
  count: 35,
};

var T1_2 = ["upperArm", "forearm", "forearmTwist1", "forearmTwist2", "hand"];

for (let n of ["", "Helper"])
  for (let e = 0; e < 5; e++)
    for (let t = 0; t < 3; t++) T1_2.push(Eh[e] + n + (t + 1));

var Qz = [
  [-0.25, 1.35],
  [-0.2, 1],
  [-0.35, 1.4],
  [-0.15, 1],
];

var eD = [
  [-0.45, 1.6],
  [0, 1.95],
  [-0.1, 1.45],
  [-0.3, 0.4],
];

var xs = { min: new Float32Array(Un), max: new Float32Array(Un) };

for (let n = 0; n < 5; n++)
  for (let e = 0; e < 4; e++) {
    let t = (n ? eD : Qz)[e];
    ((xs.min[n * 4 + e] = t[0]), (xs.max[n * 4 + e] = t[1]));
  }

function d0(n = {}, e = null) {
  let t = new Float32Array(Un);
  e && t.set(e);
  for (let i = 0; i < 5; i++) {
    let s = n[Eh[i]] || (i && n.fingers);
    if (s) for (let o = 0; o < 4; o++) t[i * 4 + o] = s[o] || 0;
  }
  return t;
}

function tn_2(n, e, t, i) {
  for (let s = 0; s < Un; s++) n[s] = e[s] + (t[s] - e[s]) * i;
  return n;
}

function ly(n) {
  let e = 0;
  for (let t = 0; t < Un; t++) {
    let i = xs.min[t],
      s = xs.max[t];
    n[t] < i
      ? ((e = Math.max(e, i - n[t])), (n[t] = i))
      : n[t] > s && ((e = Math.max(e, n[t] - s)), (n[t] = s));
  }
  return e;
}

function LE(n) {
  let e = 0;
  for (let t = 0; t < Un; t++)
    e = Math.max(e, xs.min[t] - n[t], n[t] - xs.max[t]);
  return Math.max(0, e);
}

var jl = d0({
  thumb: [0.34, 0.08, 0.14, 0.5],
  index: [0.14, 0.22, 0.12, 0.075],
  middle: [0.18, 0.26, 0.14, 0],
  ring: [0.22, 0.28, 0.15, 0.065],
  little: [0.26, 0.3, 0.16, 0.13],
});

var di_2 = {
  rest: jl,
  relaxed: d0({
    thumb: [0.42, 0.14, 0.22, 0.34],
    index: [0.3, 0.44, 0.24, 0.03],
    middle: [0.4, 0.52, 0.28, 0],
    ring: [0.48, 0.56, 0.3, 0.02],
    little: [0.54, 0.58, 0.32, 0.06],
  }),
  open: d0({
    thumb: [0.2, -0.05, -0.05, 0.75],
    index: [-0.05, 0.04, 0.02, 0.12],
    middle: [-0.05, 0.04, 0.02, 0],
    ring: [-0.05, 0.04, 0.02, 0.1],
    little: [-0.05, 0.04, 0.02, 0.18],
  }),
  flat: d0({
    thumb: [0.05, 0, 0.02, 0.2],
    index: [0, 0.02, 0.01, -0.04],
    middle: [0, 0.02, 0.01, 0],
    ring: [0, 0.02, 0.01, -0.03],
    little: [0, 0.02, 0.01, -0.06],
  }),
  fist: d0({
    thumb: [0.98, 0.42, 0.62, 0.16],
    index: [1.4, 1.72, 1.02, -0.04],
    middle: [1.44, 1.74, 1.02, 0],
    ring: [1.46, 1.74, 1.02, -0.03],
    little: [1.48, 1.72, 1.02, -0.08],
  }),
};

function Za_2(n) {
  if (typeof n == "string") {
    let e = di_2[n];
    if (!e) throw new Error('weapon_hands: unknown pose "' + n + '"');
    return e;
  }
  return n;
}

var IE = new ja_2();

var zE = new ja_2();

var w1_2 = new Us_2();

function _h(n, e, t, i) {
  let s = t0_2[n],
    o = n * 4;
  return e > 0
    ? i.setFromAxisAngle(kE, -t[o + e])
    : n === 0
      ? i
          .setFromAxisAngle(jz, t[0])
          .multiply(IE.setFromAxisAngle(PE, t[3]))
          .multiply(s.q0)
      : i
          .setFromAxisAngle(PE, s.yaw + s.sgn * t[o + 3])
          .multiply(s.qRoll)
          .multiply(IE.setFromAxisAngle(kE, -t[o]));
}

function tr() {
  return {
    q: Array.from({ length: 15 }, () => new ja_2()),
    j: Array.from({ length: 20 }, () => new Us_2()),
  };
}

function Sh(n, e, t) {
  let i = t0_2[e],
    s = t.q,
    o = t.j,
    r = e * 3,
    a = e * 4;
  (_h(e, 0, n, s[r]),
    s[r + 1].copy(s[r]).multiply(_h(e, 1, n, zE)),
    s[r + 2].copy(s[r + 1]).multiply(_h(e, 2, n, zE)),
    o[a].set(i.base[0], i.base[1], i.base[2]));
  for (let l = 0; l < 3; l++)
    o[a + l + 1]
      .copy(o[a + l])
      .add(w1_2.set(0, 0, -i.len[l]).applyQuaternion(s[r + l]));
}

function ra_2(n, e) {
  for (let t = 0; t < 5; t++) Sh(n, t, e);
  return e;
}

function vs(n, e, t) {
  return {
    type: "capsule",
    a: [n[0], n[1], n[2]],
    b: [e[0], e[1], e[2]],
    r: t,
  };
}

function mn_2(n, e, t = null, i = 0) {
  let s = t
      ? t.isQuaternion
        ? t.clone()
        : new ja_2(t[0], t[1], t[2], t[3])
      : new ja_2(),
    o = new Matrix4().makeRotationFromQuaternion(s).elements;
  return {
    type: "box",
    c: [n[0], n[1], n[2]],
    h: [e[0], e[1], e[2]],
    q: [s.x, s.y, s.z, s.w],
    m: [o[0], o[1], o[2], o[4], o[5], o[6], o[8], o[9], o[10]],
    r: i,
  };
}

function Th(n, e) {
  let t = new Us_2(),
    i = new Us_2(),
    s = new ja_2();
  return (
    e.decompose(t, s, i),
    n.map((o) =>
      o.type === "capsule"
        ? vs(
            new Us_2(...o.a).applyMatrix4(e).toArray(),
            new Us_2(...o.b).applyMatrix4(e).toArray(),
            o.r,
          )
        : mn_2(
            new Us_2(...o.c).applyMatrix4(e).toArray(),
            o.h,
            s.clone().multiply(new ja_2(o.q[0], o.q[1], o.q[2], o.q[3])),
            o.r,
          ),
    )
  );
}

function tD(n, e, t, i) {
  if (n.type === "capsule") {
    let p = n.a,
      d = n.b,
      m = d[0] - p[0],
      x = d[1] - p[1],
      v = d[2] - p[2],
      y = e - p[0],
      b = t - p[1],
      g = i - p[2],
      E = (y * m + b * x + g * v) / (m * m + x * x + v * v || 1e-12);
    return (
      (E = E < 0 ? 0 : E > 1 ? 1 : E),
      Math.hypot(y - m * E, b - x * E, g - v * E) - n.r
    );
  }
  let s = n.m,
    o = n.h,
    r = n.r,
    a = e - n.c[0],
    l = t - n.c[1],
    c = i - n.c[2],
    u = Math.abs(a * s[0] + l * s[1] + c * s[2]) - o[0] + r,
    f = Math.abs(a * s[3] + l * s[4] + c * s[5]) - o[1] + r,
    h = Math.abs(a * s[6] + l * s[7] + c * s[8]) - o[2] + r;
  return (
    Math.hypot(Math.max(u, 0), Math.max(f, 0), Math.max(h, 0)) +
    Math.min(Math.max(u, f, h), 0) -
    r
  );
}

function h5(n, e, t, i) {
  let s = 1e9;
  for (let o = 0; o < n.length; o++) {
    let r = tD(n[o], e, t, i);
    r < s && (s = r);
  }
  return s;
}

var Mh = tr();

var E1_2 = tr();

var S1_2 = 6;

var DE = [0, 0, 0];

function wh(n, e, t, i = null, s = null) {
  Sh(n, e, Mh);
  let o = t0_2[e],
    r = Mh.j,
    a = e * 4;
  for (let l = 0; l < 3; l++) {
    let c = -1e9;
    if (!(e === 0 && l === 0)) {
      let u = r[a + l],
        f = r[a + l + 1],
        h = o.rad[l],
        p = o.rad[l + 1],
        d = l === 2 ? p / o.len[l] : 0,
        m = i && l >= (e === 0 ? 2 : 1);
      for (let x = 0; x < S1_2; x++) {
        let v =
            e === 0 && l === 1
              ? 0.35 + (0.65 * x) / (S1_2 - 1)
              : x / (S1_2 - 1),
          y = v * (1 - d),
          b = u.x + (f.x - u.x) * y,
          g = u.y + (f.y - u.y) * y,
          E = u.z + (f.z - u.z) * y,
          M = h5(t, b, g, E);
        (s && (M = Math.min(M, h5(s, b, g, E))),
          m && (M = Math.min(M, i(b, g, E))));
        let _ = h + (p - h) * v - M;
        _ > c && (c = _);
      }
    }
    DE[l] = c;
  }
  return DE;
}

function Kl(n, e, t = {}) {
  ((n = Za_2(n)), (t.depth = -1e9), (t.digit = 0), (t.phalanx = 0));
  for (let i = 0; i < 5; i++) {
    let s = wh(n, i, e);
    for (let o = 0; o < 3; o++)
      s[o] > t.depth && ((t.depth = s[o]), (t.digit = i), (t.phalanx = o));
  }
  return t;
}

function Jl(n, e = {}) {
  let t = Za_2(e.from || "open"),
    i = Za_2(e.to || "fist"),
    s = e.skin ?? 8e-4,
    o = e.steps || 40,
    r = e.palm || null,
    a = e.out || new Float32Array(Un);
  a.set(Za_2(e.rest || t));
  let l = [0, 0, 0];
  for (let c of e.digits || [1, 2, 3, 4, 0]) {
    let u = null;
    if (c === 0 && e.self !== !1) {
      (ra_2(a, E1_2), (u = []));
      for (let v = 1; v < 5; v++)
        for (let y = 0; y < 3; y++) {
          let b = t0_2[v],
            g = E1_2.j[v * 4 + y],
            E = E1_2.j[v * 4 + y + 1];
          u.push(
            vs(
              [g.x, g.y, g.z],
              y === 2
                ? [
                    E.x + ((g.x - E.x) * b.rad[3]) / b.len[2],
                    E.y + ((g.y - E.y) * b.rad[3]) / b.len[2],
                    E.z + ((g.z - E.z) * b.rad[3]) / b.len[2],
                  ]
                : [E.x, E.y, E.z],
              (b.rad[y] + b.rad[y + 1]) / 2,
            ),
          );
        }
    }
    let f = c * 4,
      h = (v, y) => {
        for (let b = 0; b < 3; b++) {
          let g = b > y ? Math.min(1, l[b] + v / o) : l[b];
          ((a[f + b] = t[f + b] + (i[f + b] - t[f + b]) * g),
            b === 0 && (a[f + 3] = t[f + 3] + (i[f + 3] - t[f + 3]) * g));
        }
      },
      p = [0, 0, 0],
      d = (v) => {
        let y = wh(a, c, n, r, u),
          b = -1;
        for (let g = v + 1; g < 3; g++)
          y[g] + s > 0 && y[g] > p[g] + 1e-7 && (b = g);
        return b;
      },
      m = () => {
        let v = wh(a, c, n, r, u);
        ((p[0] = v[0]), (p[1] = v[1]), (p[2] = v[2]));
      };
    ((l[0] = l[1] = l[2] = 0), h(0, 2), m());
    let x = -1;
    for (let v = 0; v < o && x < 2; v++) {
      h(1, x);
      let y = d(x);
      if (y < 0) {
        for (let E = x + 1; E < 3; E++) l[E] = Math.min(1, l[E] + 1 / o);
        m();
        continue;
      }
      let b = 0,
        g = 1;
      for (let E = 0; E < 10; E++) {
        let M = (b + g) / 2;
        h(M, x);
        let _ = d(x);
        _ < 0 ? (b = M) : ((g = M), (y = _));
      }
      for (let E = x + 1; E < 3; E++) l[E] = Math.min(1, l[E] + b / o);
      (h(0, 2), m(), (x = y), v--);
    }
    h(0, 2);
  }
  if (e.hold)
    for (let c = 0; c < 5; c++) {
      let u = e.hold[Eh[c]];
      if (u) for (let f = 0; f < 4; f++) a[c * 4 + f] = u[f];
    }
  return a;
}

var Ns_2 = new Us_2();

var ay = new Us_2();

function f5(n, e, t, i) {
  Sh(n, e, Mh);
  let s = t0_2[e],
    o = e * 4;
  return (
    i.copy(Mh.j[o + 2]).lerp(Mh.j[o + 3], t),
    ay.set(0, -1, 0).applyQuaternion(Mh.q[e * 3 + 2]),
    i.addScaledVector(ay, s.rad[2] + (s.rad[3] - s.rad[2]) * t)
  );
}

function FE(n, e, t, i = {}) {
  let s = i.couple ?? 0.6,
    o = i.at ?? 0.5,
    r = e * 4,
    a = [r, r + 3, r + 1],
    l = 0.001,
    c = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    u = [0, 0, 0],
    f = () => {
      for (let v of [r, r + 1, r + 3])
        n[v] = Math.min(xs.max[v], Math.max(xs.min[v], n[v]));
      n[r + 2] = Math.min(xs.max[r + 2], Math.max(xs.min[r + 2], s * n[r + 1]));
    },
    h = t[0],
    p = t[1],
    d = t[2],
    m = 1e9,
    x = 1e-4;
  f();
  for (
    let v = 0;
    v < (i.iters || 40) &&
    (f5(n, e, o, Ns_2),
    (u[0] = h - Ns_2.x),
    (u[1] = p - Ns_2.y),
    (u[2] = d - Ns_2.z),
    (m = Math.hypot(u[0], u[1], u[2])),
    !(m < 2e-5));
    v++
  ) {
    for (let _ = 0; _ < 3; _++) {
      let T = a[_],
        w = n[T],
        S = n[r + 2];
      ((n[T] = w + l),
        T === r + 1 && (n[r + 2] = s * n[T]),
        f5(n, e, o, ay.set(0, 0, 0) && Ns_2),
        (c[0][_] = (Ns_2.x - (h - u[0])) / l),
        (c[1][_] = (Ns_2.y - (p - u[1])) / l),
        (c[2][_] = (Ns_2.z - (d - u[2])) / l),
        (n[T] = w),
        (n[r + 2] = S));
    }
    let y = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      b = [0, 0, 0];
    for (let _ = 0; _ < 3; _++) {
      for (let T = 0; T < 3; T++) {
        let w = 0;
        for (let S = 0; S < 3; S++) w += c[S][_] * c[S][T];
        y[_][T] = w + (_ === T ? x : 0);
      }
      b[_] = c[0][_] * u[0] + c[1][_] * u[1] + c[2][_] * u[2];
    }
    let g = (_) =>
        _[0][0] * (_[1][1] * _[2][2] - _[1][2] * _[2][1]) -
        _[0][1] * (_[1][0] * _[2][2] - _[1][2] * _[2][0]) +
        _[0][2] * (_[1][0] * _[2][1] - _[1][1] * _[2][0]),
      E = g(y);
    if (Math.abs(E) < 1e-18) break;
    let M = [n[r], n[r + 3], n[r + 1], n[r + 2]];
    for (let _ = 0; _ < 3; _++) {
      let T = y.map((w, S) => w.map((R, z) => (z === _ ? b[S] : R)));
      n[a[_]] += Math.max(-0.35, Math.min(0.35, g(T) / E));
    }
    if (
      (f(),
      f5(n, e, o, Ns_2),
      Math.hypot(h - Ns_2.x, p - Ns_2.y, d - Ns_2.z) > m)
    ) {
      if (
        ((n[r] = M[0]),
        (n[r + 3] = M[1]),
        (n[r + 1] = M[2]),
        (n[r + 2] = M[3]),
        (x *= 8),
        x > 1e3)
      )
        break;
    } else x = Math.max(1e-6, x * 0.4);
  }
  return (f5(n, e, o, Ns_2), Math.hypot(h - Ns_2.x, p - Ns_2.y, d - Ns_2.z));
}

function cy(n, e = null, t = {}) {
  ((n = Za_2(n)), ra_2(n, E1_2), (t.depth = -1e9), (t.a = 0), (t.b = 0));
  let i = E1_2.j,
    s = (o, r, a) => {
      let l = t0_2[o],
        c = i[o * 4 + r],
        u = i[o * 4 + r + 1],
        f = a / (S1_2 - 1),
        h = f * (1 - (r === 2 ? l.rad[3] / l.len[2] : 0));
      return (
        w1_2.copy(c).lerp(u, h),
        l.rad[r] + (l.rad[r + 1] - l.rad[r]) * f
      );
    };
  for (let o = 0; o < 5; o++)
    for (let r = 0; r < 3; r++)
      for (let a = 0; a < S1_2; a++) {
        let l = s(o, r, a),
          c = w1_2.x,
          u = w1_2.y,
          f = w1_2.z;
        if (e && r > 0 && !(o === 0 && r === 1)) {
          let h = l - e(c, u, f);
          h > t.depth && ((t.depth = h), (t.a = o), (t.b = -1));
        }
        for (let h = o + 1; h < 5; h++)
          for (let p = 0; p < 3; p++) {
            if (
              (r === 0 && p === 0) ||
              (o === 0 && r === 0 && p === 0) ||
              (h - o === 1 && o > 0 && (r === 0 || p === 0) && r + p < 2)
            )
              continue;
            let d = t0_2[h],
              m = i[h * 4 + p],
              x = i[h * 4 + p + 1],
              v = x.x - m.x,
              y = x.y - m.y,
              b = x.z - m.z,
              g =
                ((c - m.x) * v + (u - m.y) * y + (f - m.z) * b) /
                (v * v + y * y + b * b),
              E = 1 - (p === 2 ? d.rad[3] / d.len[2] : 0);
            g = g < 0 ? 0 : g > E ? E : g;
            let M =
              l +
              d.rad[p] +
              (d.rad[p + 1] - d.rad[p]) * g -
              Math.hypot(c - m.x - v * g, u - m.y - y * g, f - m.z - b * g);
            M > t.depth && ((t.depth = M), (t.a = o), (t.b = h));
          }
      }
  return t;
}

var ec = 0;

var Ja_2 = 5;

var py = 6;

var x5 = 7;

var HE = 8;

var vy = 0;

var yy = 1;

var nD = 0.03;

var iD = 0.0065;

var sD = 0.01;

var oD = 0.012;

var rD = 0.0015;

var Ah = {
  hem: 0.046,
  end: 0.535,
  band: [0.128, 0.172],
  refl: [0.1445, 0.1555],
};

var zu = [];

var aD = new Matrix4();

var lD = new Quaternion();

var cD = new Vector3();

function my(n) {
  let e = aD.makeRotationFromQuaternion(n).elements;
  return [e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10]];
}

function ku(n, e, t, i, s, o, r, a = {}) {
  let l = (o - r) / s;
  zu.push({
    type: vy,
    bone: n,
    group: e,
    o: [t.x, t.y, t.z],
    m: my(i),
    h: s,
    ra: o,
    rb: r,
    sx: a.wide || 1,
    b: l,
    a_: Math.sqrt(1 - l * l),
    k: a.k ?? 0.004,
    ta: a.ta || 0,
    tb: a.tb || 0,
    R: a.R || 0.01,
    bc: [t.x, t.y, t.z].map((c, u) => c - my(i)[6 + u] * s * 0.5),
    br: s * 0.5 + Math.max(o, r) * (a.wide || 1),
  });
}

function vo(n, e, t, i, s = null, o = {}) {
  zu.push({
    type: yy,
    bone: n,
    group: e,
    o: [t[0], t[1], t[2]],
    m: my(s || lD.identity()),
    r: i,
    k: o.k ?? 0.004,
    R: o.R || 0.01,
    bc: t.slice(),
    br: Math.max(i[0], i[1], i[2]),
  });
}

var uy = (n) => new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), n);

var NE = new Quaternion();

var OE = ra_2(jl, tr());

var Dr_2 = (n, e) => OE.j[n * 4 + e];

var Ka_2 = (n, e) => OE.q[n * 3 + e];

var Lr_2 = (n, e, t) =>
  new Vector3(
    t === 0 ? 1 : 0,
    t === 1 ? 1 : 0,
    t === 2 ? 1 : 0,
  ).applyQuaternion(Ka_2(n, e));

var P1_2 = { guard: [], web: null };

function uD() {
  let n = l0.hand;
  for (let e = 1; e < 5; e++) {
    let t = t0_2[e],
      i = new Vector3(...t.base),
      s = new Vector3(t.base[0] * 0.74 + 0.001, 5e-4, -0.02),
      o = i.clone().sub(s),
      r = o.length() - 0.002;
    o.normalize();
    let a = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), o);
    (ku(n, ec, s, a, r, 0.0142, e === 4 ? 0.0112 : 0.0122, {
      k: 0.012,
      tb: 0.005,
      R: 0.012,
    }),
      vo(
        l0.helper(e, 0),
        ec,
        [t.base[0], t.base[1] + 0.0022, t.base[2] + 0.001],
        [0.0112, 0.0108, 0.0112].map((l) => l * (e === 4 ? 0.9 : 1)),
        null,
        { k: 0.006 },
      ));
  }
  (vo(n, ec, [0, 0.005, -0.056], [0.037, 0.009, 0.046], null, {
    k: 0.012,
    R: 0.012,
  }),
    vo(n, ec, [0.0265, -0.0098, -0.047], [0.0135, 0.0108, 0.035], uy(-0.1), {
      k: 0.01,
      R: 0.012,
    }),
    vo(n, ec, [5e-4, -0.0068, -0.084], [0.037, 0.0078, 0.014], uy(-0.1), {
      k: 0.012,
      R: 0.012,
    }),
    vo(n, ec, [0.001, 0, -0.014], [0.0305, 0.019, 0.024], null, {
      k: 0.012,
      R: 0.012,
    }));
  for (let e = 1; e < 4; e++) {
    let t = t0_2[e].base,
      i = t0_2[e + 1].base;
    for (let s of [-1, 1])
      vo(
        l0.digit(s < 0 ? e : e + 1, 0),
        ec,
        [
          (t[0] + i[0]) / 2 + s * 0.0025,
          (t[1] + i[1]) / 2 - 0.002,
          (t[2] + i[2]) / 2 - 0.008,
        ],
        [0.0062, 0.0064, 0.0082],
        null,
        { k: 0.006, R: 0.012 },
      );
  }
  for (let e = 1; e < 5; e++) {
    let t = t0_2[e],
      i = e === 4 ? 0.88 : 1,
      s = [t.base[0], t.base[1] + 0.01, t.base[2] + 0.003],
      o = [0.0112 * i, 0.0042, 0.013 * i];
    if (
      (vo(l0.helper(e, 0), x5, s, o, uy(t.yaw), { k: 0.004, R: 0.012 }),
      P1_2.guard.push({ c: s, r: o, yaw: t.yaw }),
      e < 4)
    ) {
      let r = t0_2[e + 1],
        a = new Vector3(s[0], s[1] - 0.0012, s[2] + 0.003),
        l = new Vector3(r.base[0], r.base[1] + 0.0094, r.base[2] + 0.006),
        c = l.clone().sub(a),
        u = c.length();
      (c.normalize(),
        ku(
          n,
          x5,
          a,
          new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), c),
          u,
          0.0042,
          0.0042,
          { k: 0.004, R: 0.012 },
        ));
    }
  }
  for (let e = 1; e < 5; e++) {
    let t = t0_2[e],
      i = t.rad,
      s = t.wide;
    for (let r = 0; r < 3; r++) {
      let a = r === 2,
        l = t.len[r] - (a ? i[3] : 0);
      if (
        (ku(l0.digit(e, r), e, Dr_2(e, r), Ka_2(e, r), l, i[r], i[r + 1], {
          wide: s,
          k: 0.0018,
          ta: 0.005,
          tb: a ? 0 : 0.005,
        }),
        r > 0)
      ) {
        let c = Dr_2(e, r)
          .clone()
          .addScaledVector(Lr_2(e, r, 1), 0.0012);
        vo(
          l0.helper(e, r),
          e,
          c.toArray(),
          [i[r] * s * 0.95, i[r] * 0.95, i[r] * 1.05],
          Ka_2(e, r),
          { k: 0.002 },
        );
      }
    }
    let o = Dr_2(e, 2)
      .clone()
      .addScaledVector(Lr_2(e, 2, 2), -t.len[2] * 0.56)
      .addScaledVector(Lr_2(e, 2, 1), -0.0012);
    vo(
      l0.digit(e, 2),
      e,
      o.toArray(),
      [i[3] * s * 1.04, i[3] * 0.98, t.len[2] * 0.4],
      Ka_2(e, 2),
      { k: 0.003 },
    );
  }
  {
    let e = t0_2[0],
      t = e.rad,
      i = e.wide,
      s = l0.digit(0, 0);
    ku(s, Ja_2, Dr_2(0, 0), Ka_2(0, 0), e.len[0], t[0], t[1] * 1.04, {
      wide: 1.06,
      k: 0.006,
      ta: 0.006,
      tb: 0.005,
      R: 0.012,
    });
    let o = Dr_2(0, 0)
      .clone()
      .addScaledVector(Lr_2(0, 0, 2), -0.02)
      .addScaledVector(Lr_2(0, 0, 1), -0.0048)
      .add(cD.set(0.0055, -0.003, 0));
    vo(s, Ja_2, o.toArray(), [0.0158, 0.0122, 0.027], Ka_2(0, 0), {
      k: 0.01,
      R: 0.012,
    });
    {
      let a = Dr_2(0, 1)
          .clone()
          .addScaledVector(Lr_2(0, 1, 2), -0.004),
        l = new Vector3(
          t0_2[1].base[0],
          t0_2[1].base[1] - 0.004,
          t0_2[1].base[2] + 0.02,
        ),
        c = l.clone().sub(a),
        u = c.length() / 2;
      c.normalize();
      let f = new Vector3(0.25, 1, 0).normalize(),
        h = new Vector3().crossVectors(c, f).normalize();
      h.z < 0 && h.negate();
      let p = new Vector3().crossVectors(h, c),
        d = new Quaternion().setFromRotationMatrix(
          new Matrix4().makeBasis(c, p, h),
        ),
        m = a.clone().add(l).multiplyScalar(0.5).addScaledVector(h, 0.0075);
      (vo(l0.helper(0, 0), Ja_2, m.toArray(), [u + 0.003, 0.0058, 0.015], d, {
        k: 0.012,
        R: 0.014,
      }),
        (P1_2.web = { c: m.toArray(), ab: c.toArray() }));
    }
    vo(
      l0.helper(0, 0),
      Ja_2,
      [e.base[0] + 0.002, e.base[1], e.base[2] + 0.002],
      [0.015, 0.014, 0.015],
      null,
      { k: 0.01, R: 0.012 },
    );
    for (let a = 1; a < 3; a++) {
      let l = a === 2,
        c = e.len[a] - (l ? t[3] : 0);
      ku(l0.digit(0, a), Ja_2, Dr_2(0, a), Ka_2(0, a), c, t[a], t[a + 1], {
        wide: l ? i * 1.03 : i,
        k: 0.002,
        ta: 0.005,
        tb: l ? 0 : 0.005,
      });
      let u = Dr_2(0, a)
        .clone()
        .addScaledVector(Lr_2(0, a, 1), 0.0012);
      vo(
        l0.helper(0, a),
        Ja_2,
        u.toArray(),
        [t[a] * i * 0.95, t[a] * 0.96, t[a] * 1.06],
        Ka_2(0, a),
        { k: 0.002 },
      );
    }
    let r = Dr_2(0, 2)
      .clone()
      .addScaledVector(Lr_2(0, 2, 2), -e.len[2] * 0.56)
      .addScaledVector(Lr_2(0, 2, 1), -0.0014);
    vo(
      l0.digit(0, 2),
      Ja_2,
      r.toArray(),
      [t[3] * i * 1.1, t[3] * 0.98, e.len[2] * 0.4],
      Ka_2(0, 2),
      { k: 0.003 },
    );
  }
  (ku(l0.twist2, py, new Vector3(0, 5e-4, 0.084), NE, 0.088, 0.0232, 0.0222, {
    wide: 1.43,
    k: 0.006,
    ta: 0,
    tb: 0.012,
    R: 0.022,
  }),
    ku(l0.twist2, py, new Vector3(0, 5e-4, 0.084), NE, 0.064, 0.0246, 0.024, {
      wide: 1.4,
      k: 0.0035,
      ta: 0,
      tb: 0,
      R: 0.01,
    }));
}

uD();

var ir = zu.length;

var VE = new Uint8Array(ir);

var by = new Uint8Array(ir);

var p5 = new Uint8Array(ir);

var m5 = new Float64Array(ir * 3);

var aa_2 = new Float64Array(ir * 9);

var pi_2 = new Float64Array(ir * 8);

var v5 = new Float64Array(ir);

var C1 = new Float64Array(ir * 4);

zu.forEach((n, e) => {
  ((VE[e] = n.type),
    (by[e] = n.group),
    (p5[e] = n.bone),
    (v5[e] = n.k),
    m5.set(n.o, e * 3),
    aa_2.set(n.m, e * 9),
    C1.set([n.bc[0], n.bc[1], n.bc[2], n.br], e * 4),
    n.type === vy
      ? pi_2.set([n.h, n.ra, n.rb, 1 / n.sx, n.b, n.a_, n.ta, n.tb], e * 8)
      : n.type === yy
        ? pi_2.set(
            [
              1 / n.r[0],
              1 / n.r[1],
              1 / n.r[2],
              Math.min(n.r[0], n.r[1], n.r[2]),
            ],
            e * 8,
          )
        : pi_2.set([n.hh[0], n.hh[1], n.hh[2], n.rr], e * 8));
});

var k1_2 = 0;

function WE(n, e, t, i) {
  let s = n * 3,
    o = n * 9,
    r = n * 8,
    a = e - m5[s],
    l = t - m5[s + 1],
    c = i - m5[s + 2],
    u = a * aa_2[o] + l * aa_2[o + 1] + c * aa_2[o + 2],
    f = a * aa_2[o + 3] + l * aa_2[o + 4] + c * aa_2[o + 5],
    h = a * aa_2[o + 6] + l * aa_2[o + 7] + c * aa_2[o + 8],
    p = VE[n];
  if (p === vy) {
    let E = pi_2[r],
      M = pi_2[r + 1],
      _ = u * pi_2[r + 3],
      T = Math.sqrt(_ * _ + f * f),
      w = -h,
      S = pi_2[r + 4],
      R = pi_2[r + 5],
      z = w * R - T * S,
      I =
        z < 0
          ? Math.sqrt(T * T + w * w) - M
          : z > R * E
            ? Math.sqrt(T * T + (w - E) * (w - E)) - pi_2[r + 2]
            : T * R + w * S - M;
    return ((k1_2 = Math.max(I, pi_2[r + 6] - w, w - E + pi_2[r + 7])), I);
  }
  if (p === yy) {
    let E = u * pi_2[r],
      M = f * pi_2[r + 1],
      _ = h * pi_2[r + 2],
      T = Math.sqrt(E * E + M * M + _ * _);
    if (T < 1e-9) return (k1_2 = -pi_2[r + 3]);
    let w = E * pi_2[r],
      S = M * pi_2[r + 1],
      R = _ * pi_2[r + 2];
    return (k1_2 = (T * (T - 1)) / Math.sqrt(w * w + S * S + R * R));
  }
  let d = pi_2[r + 3],
    m = Math.abs(u) - pi_2[r] + d,
    x = Math.abs(f) - pi_2[r + 1] + d,
    v = Math.abs(h) - pi_2[r + 2] + d,
    y = m > 0 ? m : 0,
    b = x > 0 ? x : 0,
    g = v > 0 ? v : 0;
  return (k1_2 =
    Math.sqrt(y * y + b * b + g * g) + Math.min(Math.max(m, x, v), 0) - d);
}

var Iu = (n, e, t) => {
  let i = t - Math.abs(n - e);
  return i <= 0 ? (n < e ? n : e) : (n < e ? n : e) - (i * i) / (4 * t);
};

var zr_2 = new Float64Array(HE);

var UE = new Float64Array(ir);

var gy = new Float64Array(ir);

var xy = 0;

function Rh(n, e, t, i = !1) {
  xy++;
  for (let r = 0; r < HE; r++) zr_2[r] = 1e9;
  for (let r = 0; r < ir; r++) {
    let a = r * 4,
      l = n - C1[a],
      c = e - C1[a + 1],
      u = t - C1[a + 2],
      f = Math.sqrt(l * l + c * c + u * u) - C1[a + 3],
      h;
    f > nD
      ? ((h = f), i && ((UE[r] = f), (gy[r] = f)))
      : ((h = WE(r, n, e, t)), i && ((UE[r] = h), (gy[r] = k1_2)));
    let p = by[r];
    zr_2[p] = Iu(zr_2[p], h, v5[r]);
  }
  let s = Iu(zr_2[ec], zr_2[Ja_2], sD);
  s = Iu(s, zr_2[py], oD);
  let o = Math.min(zr_2[1], zr_2[2], zr_2[3], zr_2[4]);
  return Iu(Iu(s, o, iD), zr_2[x5], rD);
}

var GE = [];

zu.forEach((n, e) => {
  n.bone === l0.hand && n.group !== Ja_2 && GE.push(e);
});

function Fr(n, e, t) {
  let i = 1e9,
    s = 1e9;
  for (let o of GE) {
    let r = WE(o, n, e, t);
    by[o] === x5 ? (s = Iu(s, r, v5[o])) : (i = Iu(i, r, v5[o]));
  }
  return Math.min(i, s);
}

function fy(n, e, t) {
  let i = [n];
  for (; i[i.length - 1] < e;) i.push(i[i.length - 1] + t(i[i.length - 1]));
  return Float64Array.from(i);
}

var hy = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
];

var BE = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [0, 2],
  [1, 3],
  [4, 6],
  [5, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

function fD(n, e, t, i) {
  let s = n.length,
    o = e.length,
    r = t.length,
    a = 1,
    l = s,
    c = s * o,
    u = s * o * r,
    f = new Float32Array(u).fill(NaN),
    h = new Int32Array(u).fill(-1),
    p = new Float64Array(8),
    d = (w) => {
      let S = f[w];
      if (S !== S) {
        let R = (w / c) | 0,
          z = w - R * c,
          I = (z / s) | 0;
        ((S = Rh(n[z - I * s], e[I], t[R])), S === 0 && (S = 1e-9), (f[w] = S));
      }
      return S;
    },
    m = hy.map((w) => w[0] * a + w[1] * l + w[2] * c),
    x = 0,
    v = 0,
    y = 0;
  for (; n[x + 1] < i[0];) x++;
  for (; e[v + 1] < i[1];) v++;
  for (; t[y + 1] < i[2];) y++;
  for (
    ;
    v < o - 2 && !(d(x + v * l + y * c) < 0 && d(x + (v + 1) * l + y * c) > 0);
  )
    v++;
  let b = [],
    g = [],
    E = [x + v * l + y * c];
  for (; E.length;) {
    let w = E.pop();
    if (h[w] !== -1) continue;
    let S = (w / c) | 0,
      R = w - S * c,
      z = (R / s) | 0,
      I = R - z * s;
    if (I < 0 || z < 0 || S < 0 || I >= s - 1 || z >= o - 1 || S >= r - 1) {
      h[w] = -2;
      continue;
    }
    let L = 0;
    for (let H = 0; H < 8; H++)
      ((p[H] = d(w + m[H])), p[H] < 0 && (L |= 1 << H));
    if (L === 0 || L === 255) {
      h[w] = -2;
      continue;
    }
    let U = 0,
      k = 0,
      C = 0,
      A = 0;
    for (let H = 0; H < 12; H++) {
      let N = BE[H][0],
        Z = BE[H][1];
      if (((L >> N) & 1) === ((L >> Z) & 1)) continue;
      let Q = p[N] / (p[N] - p[Z]),
        W = hy[N],
        J = hy[Z];
      ((U += n[I + W[0]] + (n[I + J[0]] - n[I + W[0]]) * Q),
        (k += e[z + W[1]] + (e[z + J[1]] - e[z + W[1]]) * Q),
        (C += t[S + W[2]] + (t[S + J[2]] - t[S + W[2]]) * Q),
        A++);
    }
    ((h[w] = g.length), g.push(w), b.push(U / A, k / A, C / A));
    let F = (H, N, Z, Q) => {
      let W = (L >> H) & 1;
      return (
        W !== ((L >> N) & 1) || W !== ((L >> Z) & 1) || W !== ((L >> Q) & 1)
      );
    };
    (F(0, 2, 4, 6) && E.push(w - a),
      F(1, 3, 5, 7) && E.push(w + a),
      F(0, 1, 4, 5) && E.push(w - l),
      F(2, 3, 6, 7) && E.push(w + l),
      F(0, 1, 2, 3) && E.push(w - c),
      F(4, 5, 6, 7) && E.push(w + c));
  }
  let M = [],
    _ = b,
    T = (w, S, R, z, I) => {
      if (w < 0 || S < 0 || R < 0 || z < 0) return;
      if (I) {
        let k = S;
        ((S = z), (z = k));
      }
      let L =
          (_[w * 3] - _[R * 3]) ** 2 +
          (_[w * 3 + 1] - _[R * 3 + 1]) ** 2 +
          (_[w * 3 + 2] - _[R * 3 + 2]) ** 2,
        U =
          (_[S * 3] - _[z * 3]) ** 2 +
          (_[S * 3 + 1] - _[z * 3 + 1]) ** 2 +
          (_[S * 3 + 2] - _[z * 3 + 2]) ** 2;
      L <= U ? M.push(w, S, R, w, R, z) : M.push(w, S, z, S, R, z);
    };
  for (let w = 0; w < g.length; w++) {
    let S = g[w],
      R = f[S];
    (R < 0 != f[S + a] < 0 && T(h[S], h[S - l], h[S - l - c], h[S - c], R > 0),
      R < 0 != f[S + l] < 0 && T(h[S], h[S - a], h[S - a - c], h[S - c], R < 0),
      R < 0 != f[S + c] < 0 &&
        T(h[S], h[S - a], h[S - a - l], h[S - l], R > 0));
  }
  return { pos: b, idx: M };
}

var hD = (n) => {
  if (n >= 1) return 0;
  if (n <= 0) return 1;
  let e = 1 - n;
  return e * e * (3 - 2 * e);
};

var nr = l0.count;

var Ql = new Float64Array(nr);

var g5 = new Uint8Array(nr * nr);

{
  let n = (e, t) => {
    g5[e * nr + t] = g5[t * nr + e] = 1;
  };
  for (let e = 0; e < nr; e++) g5[e * nr + e] = 1;
  n(l0.hand, l0.twist2);
  for (let e = 0; e < 5; e++) {
    let t = [
      l0.hand,
      l0.helper(e, 0),
      l0.digit(e, 0),
      l0.helper(e, 1),
      l0.digit(e, 1),
      l0.helper(e, 2),
      l0.digit(e, 2),
    ];
    for (let i = 0; i < t.length; i++)
      for (let s = i + 1; s <= i + 2 && s < t.length; s++) n(t[i], t[s]);
    if (e > 0 && e < 4)
      for (let i of [l0.helper(e, 0), l0.digit(e, 0)])
        for (let s of [l0.helper(e + 1, 0), l0.digit(e + 1, 0)]) n(i, s);
  }
}

var Pu = [1, 2, 3, 4].map((n) => t0_2[n].base[0]);

var A1_2 = [1, 2, 3, 4].map((n) => t0_2[n].base[2]);

function dD(n) {
  if (n <= Pu[0]) return [Math.max(0.3, 1 + (n - Pu[0]) / 0.016), A1_2[0]];
  for (let e = 0; e < 3; e++)
    if (n <= Pu[e + 1]) {
      let t = (n - Pu[e]) / (Pu[e + 1] - Pu[e]);
      return [1 + e + t, A1_2[e] + (A1_2[e + 1] - A1_2[e]) * t];
    }
  return [Math.min(4.7, 4 + (n - Pu[3]) / 0.016), A1_2[3]];
}

var R1_2 = [0, 0, 0, 0];

function pD(n, e, t, i) {
  let s = 1e9;
  for (let o = 0; o < 3; o++) {
    let r = Dr_2(n, o),
      a = Dr_2(n, o + 1),
      l = a.x - r.x,
      c = a.y - r.y,
      u = a.z - r.z,
      f = l * l + c * c + u * u,
      h = ((e - r.x) * l + (t - r.y) * c + (i - r.z) * u) / f;
    h = Math.max(o === 0 ? -0.5 : 0, Math.min(1, h));
    let p = e - r.x - l * h,
      d = t - r.y - c * h,
      m = i - r.z - u * h,
      x = Math.hypot(p, d, m);
    if (x < s) {
      s = x;
      let v = Lr_2(n, o, 0),
        y = Lr_2(n, o, 1),
        b = x || 1;
      ((R1_2[0] =
        (o > 0 ? t0_2[n].len[0] : 0) +
        (o > 1 ? t0_2[n].len[1] : 0) +
        h * t0_2[n].len[o]),
        (R1_2[1] = (p * y.x + d * y.y + m * y.z) / b),
        (R1_2[2] = (p * v.x + d * v.y + m * v.z) / b));
    }
  }
  return ((R1_2[3] = s), R1_2);
}

var Qa_2 = (n, e, t) => (
  (t = Math.min(1, Math.max(0, (t - n) / (e - n)))),
  t * t * (3 - 2 * t)
);

function dy(n, e, t) {
  let i = (n - 0.066) / (Ah.end - 0.066),
    s = 0.0042 * Math.exp(-Math.pow((n - 0.105) / 0.04, 2)),
    o = 0.005 * Qa_2(0.19, 0.25, n) * (1 - Qa_2(0.33, 0.4, n)),
    r =
      Math.pow(
        Math.abs(
          Math.sin(
            (Math.PI * n) / 0.029 +
              1.7 * Math.sin(e + 0.5) +
              0.8 * Math.sin(2 * e + 1.3),
          ),
        ),
        0.6,
      ) *
        2 -
      1.25,
    a =
      Math.pow(
        Math.abs(
          Math.sin(
            (Math.PI * n) / 0.036 +
              1.9 * Math.sin(e - 0.8) +
              0.7 * Math.sin(2 * e),
          ),
        ),
        0.6,
      ) *
        2 -
      1.25,
    l =
      Math.sin(n * 38 + 2 * Math.sin(e * 2 + 1)) +
      0.6 * Math.sin(3 * e + n * 23),
    c =
      0.041 +
      0.015 * Math.pow(Math.max(0, Math.min(1, i * 1.9)), 0.8) +
      0.0035 * Qa_2(0.3, 0.42, n) +
      0.0022 * Math.exp(-Math.pow((n - 0.08) / 0.012, 2)),
    u =
      0.0016 *
      Math.exp(
        -Math.pow(Math.atan2(Math.sin(e + 1.9), Math.cos(e + 1.9)) / 0.1, 2),
      );
  return (
    t && (t[0] = ((s * r + o * a) / (s + o + 8e-4)) * 0.8 + 0.1 * l),
    c + s * r + o * a + 0.0015 * l + u
  );
}

function mD(n) {
  let t = [],
    i = [0],
    s = [
      [0.053, 0.0238, 0],
      [0.049, 0.0262, 0],
      [0.0462, 0.0318, 0],
      [0.0462, 0.0356, 0],
      [0.049, 0.0382, 0],
      [0.053, 0.0388, 0],
      [0.06, 0.0384, 0],
      [0.065, 0.0368, 0],
    ];
  for (let p of s) t.push(p);
  for (let p = 0.072; p < 0.3; p += 0.0072) t.push([p, -1, 0]);
  for (let p = 0.309; p < Ah.end - 0.02; p += 0.015) t.push([p, -1, 0]);
  let o = t.length,
    r = [Ah.end - 0.018, Ah.end - 0.006, Ah.end],
    a = n.pos.length / 3,
    l = [],
    c = (p, d) => {
      let [m, x] = t[p];
      if (x >= 0) {
        let y = Qa_2(0.0262, 0.0356, x);
        return [
          Math.cos(d) * x * (1.4 - 0.4 * y),
          Math.sin(d) * x * (1 - 0.1 * y) + 5e-4,
          m,
        ];
      }
      let v = dy(m, d, i) * (0.9 + 0.1 * Qa_2(0.066, 0.085, m));
      return [Math.cos(d) * v, Math.sin(d) * v * 0.9 + 5e-4, m];
    },
    u = (p, d, m, x, v) => {
      (n.pos.push(p[0], p[1], p[2]),
        n.nrm.push(d[0], d[1], d[2]),
        n.rest.push(p[0], p[1], p[2], 1),
        n.hand.push(m, v, Math.sin(x), Math.cos(x)));
      let y = Qa_2(0.095, 0.165, m),
        b = Qa_2(0.165, 0.235, m),
        g = Qa_2(Cu.fore - 0.045, Cu.fore + 0.045, m);
      (n.si.push(l0.twist2, l0.twist1, l0.forearm, l0.upperArm),
        n.sw.push((1 - y) * (1 - g), y * (1 - b) * (1 - g), b * (1 - g), g));
    };
  for (let p = 0; p < o; p++)
    for (let d = 0; d < 24; d++) {
      let m = (d / 24) * Math.PI * 2,
        x = c(p, m),
        y = c(p, m + 0.001),
        b = p < o - 1 ? c(p + 1, m) : null,
        g = p > 0 ? c(p - 1, m) : null,
        E = [y[0] - x[0], y[1] - x[1], y[2] - x[2]],
        M = b || x,
        _ = g || x,
        T = [M[0] - _[0], M[1] - _[1], M[2] - _[2]],
        w = [
          E[1] * T[2] - E[2] * T[1],
          E[2] * T[0] - E[0] * T[2],
          E[0] * T[1] - E[1] * T[0],
        ],
        S = Math.hypot(w[0], w[1], w[2]) || 1;
      ((w = w.map((R) => R / S)),
        t[p][1] < 0 ? dy(t[p][0], m, i) : (i[0] = 0),
        u(x, w, t[p][0], m, i[0]),
        l.push(x));
    }
  for (let p = 0; p < 2; p++)
    for (let d = 0; d < 24; d++) {
      let m = (d / 24) * Math.PI * 2,
        x = [0.8, 0.42][p],
        v = dy(Ah.end - 0.02, m, null),
        y = [Math.cos(m) * v * x, Math.sin(m) * v * 0.9 * x + 5e-4, r[p]],
        b = [0.55, 0.9][p],
        g = Math.sqrt(1 - b * b);
      u(y, [Math.cos(m) * g, Math.sin(m) * g, b], r[p], m, 0);
    }
  u([0, 5e-4, r[2]], [0, 0, 1], r[2], 0, 0);
  let f = o + 2,
    h = a + f * 24;
  for (let p = 0; p < f - 1; p++)
    for (let d = 0; d < 24; d++) {
      let m = a + p * 24 + d,
        x = a + p * 24 + ((d + 1) % 24),
        v = m + 24,
        y = x + 24;
      n.idx.push(m, x, v, x, y, v);
    }
  for (let p = 0; p < 24; p++)
    n.idx.push(a + (f - 1) * 24 + p, a + (f - 1) * 24 + ((p + 1) % 24), h);
}

var d5 = null;

function My(n = {}) {
  if (d5 && !n.force) return d5;
  let e = performance.now();
  xy = 0;
  let t = n.hxy || 0.0034,
    i = n.hzF || 0.0047,
    s = n.hzP || 0.006,
    o = n.hzC || 0.008,
    r = [1e9, 1e9, 1e9],
    a = [-1e9, -1e9, -1e9];
  for (let M of zu)
    for (let _ = 0; _ < 3; _++)
      ((r[_] = Math.min(r[_], M.bc[_] - M.br)),
        (a[_] = Math.max(a[_], M.bc[_] + M.br)));
  let l = 0.006,
    c = fy(r[0] - l, a[0] + l, () => t),
    u = fy(r[1] - l, a[1] + l, () => t),
    f = fy(r[2] - l, a[2] + l, (M) => (M < -0.022 ? i : M < 0.004 ? s : o)),
    { pos: h, idx: p } = fD(c, u, f, [0, 0, -0.05]),
    d = h.length / 3,
    m = {
      pos: h,
      nrm: new Array(d * 3),
      idx: p,
      si: new Array(d * 4),
      sw: new Array(d * 4),
      rest: new Array(d * 4),
      hand: new Array(d * 4),
    },
    x = 6e-4,
    v = [0, 0, 0, 0],
    y = [0, 0, 0, 0],
    b = [0, 0, 0, 0, 0];
  for (let M = 0; M < d; M++) {
    let _ = h[M * 3],
      T = h[M * 3 + 1],
      w = h[M * 3 + 2],
      S = Rh(_ + x, T - x, w - x),
      R = Rh(_ - x, T - x, w + x),
      z = Rh(_ - x, T + x, w - x),
      I = Rh(_ + x, T + x, w + x),
      L = (S - R - z + I) / (4 * x),
      U = (-S - R + z + I) / (4 * x),
      k = (-S + R - z + I) / (4 * x),
      C = L * L + U * U + k * k || 1e-12,
      F = -((S + R + z + I) / 4) / C,
      H = Math.abs(F) * Math.sqrt(C);
    (H > 0.0012 && (F *= 0.0012 / H),
      (_ += L * F),
      (T += U * F),
      (w += k * F),
      (h[M * 3] = _),
      (h[M * 3 + 1] = T),
      (h[M * 3 + 2] = w));
    let N = Math.sqrt(C);
    ((L /= N),
      (U /= N),
      (k /= N),
      (m.nrm[M * 3] = L),
      (m.nrm[M * 3 + 1] = U),
      (m.nrm[M * 3 + 2] = k),
      Rh(_, T, w, !0),
      Ql.fill(0));
    let Z = 0,
      Q = 1e9;
    for (let G = 0; G < ir; G++) {
      let te = gy[G] / zu[G].R,
        oe = hD(te);
      (oe > Ql[p5[G]] && (Ql[p5[G]] = oe), te < Q && ((Q = te), (Z = p5[G])));
    }
    Ql[Z] < 1e-4 && (Ql[Z] = 1e-4);
    let W = 0;
    for (let G = 1; G < nr; G++) Ql[G] > Ql[W] && (W = G);
    (v.fill(-1), y.fill(0));
    for (let G = 0; G < nr; G++) {
      let te = g5[W * nr + G] ? Ql[G] : 0;
      if (te <= y[3]) continue;
      let oe = 3;
      for (; oe > 0 && te > y[oe - 1];)
        ((y[oe] = y[oe - 1]), (v[oe] = v[oe - 1]), oe--);
      ((y[oe] = te), (v[oe] = G));
    }
    let J = y[0] + y[1] + y[2] + y[3] || 1;
    for (let G = 0; G < 4; G++)
      ((m.si[M * 4 + G] = v[G] < 0 ? 0 : v[G]), (m.sw[M * 4 + G] = y[G] / J));
  }
  {
    let M = Array.from({ length: d }, () => []),
      _ = new Set();
    for (let w = 0; w < p.length; w += 3)
      for (let S = 0; S < 3; S++) {
        let R = p[w + S],
          z = p[w + ((S + 1) % 3)],
          I = R < z ? R * d + z : z * d + R;
        _.has(I) || (_.add(I), M[R].push(z), M[z].push(R));
      }
    let T = new Float64Array(nr);
    for (let w = 0; w < (n.relax ?? 3); w++) {
      let S = m.si.slice(),
        R = m.sw.slice();
      for (let z = 0; z < d; z++) {
        T.fill(0);
        let I = M[z],
          L = 1 / I.length;
        for (let k = 0; k < 4; k++) T[S[z * 4 + k]] += R[z * 4 + k];
        for (let k of I)
          for (let C = 0; C < 4; C++) T[S[k * 4 + C]] += R[k * 4 + C] * L;
        (v.fill(-1), y.fill(0));
        for (let k = 0; k < nr; k++) {
          let C = T[k];
          if (C <= y[3]) continue;
          let A = 3;
          for (; A > 0 && C > y[A - 1];)
            ((y[A] = y[A - 1]), (v[A] = v[A - 1]), A--);
          ((y[A] = C), (v[A] = k));
        }
        let U = y[0] + y[1] + y[2] + y[3];
        for (let k = 0; k < 4; k++)
          ((m.si[z * 4 + k] = v[k] < 0 ? 0 : v[k]),
            (m.sw[z * 4 + k] = y[k] / U));
      }
    }
  }
  for (let M = 0; M < d; M++) {
    let _ = h[M * 3],
      T = h[M * 3 + 1],
      w = h[M * 3 + 2],
      S = m.nrm[M * 3 + 1],
      R = 0;
    b.fill(0);
    for (let A = 0; A < 4; A++) {
      let F = m.si[M * 4 + A],
        H = m.sw[M * 4 + A];
      F >= 5
        ? (b[F >= 20 ? ((F - 20) / 3) | 0 : ((F - 5) / 3) | 0] += H)
        : (R += H);
    }
    let z = dD(_),
      I = (z[1] - w) * R,
      L = z[0] * R,
      U = S * R,
      k = Math.max(-1, Math.min(1, _ / 0.045)) * R,
      C = Math.max(-1, Math.min(1, _ / 0.045));
    for (let A = 0; A < 5; A++)
      if (b[A] > 0) {
        let F = pD(A, _, T, w),
          H = F[1],
          N = F[2];
        if (A === 0) {
          let Z = Qa_2(0.55, 1.05, F[0] / t0_2[0].len[0]);
          ((H = S + (H - S) * Z), (N = C + (N - C) * Z));
        }
        ((I += F[0] * b[A]), (L += A * b[A]), (U += H * b[A]), (k += N * b[A]));
      }
    ((m.rest[M * 4] = _),
      (m.rest[M * 4 + 1] = T),
      (m.rest[M * 4 + 2] = w),
      (m.rest[M * 4 + 3] = 0),
      (m.hand[M * 4] = I),
      (m.hand[M * 4 + 1] = L),
      (m.hand[M * 4 + 2] = U),
      (m.hand[M * 4 + 3] = k));
  }
  {
    let M = new Int32Array(d),
      _ = [];
    for (let S = 0; S < d; S++) M[S] = S;
    let T = (S) => {
      for (; M[S] !== S;) S = M[S] = M[M[S]];
      return S;
    };
    for (let S = 0; S < p.length; S += 3)
      for (let R = 0; R < 3; R++) {
        let z = T(p[S + R]),
          I = T(p[S + ((R + 1) % 3)]);
        z !== I &&
          Math.hypot(
            h[z * 3] - h[I * 3],
            h[z * 3 + 1] - h[I * 3 + 1],
            h[z * 3 + 2] - h[I * 3 + 2],
          ) < 25e-5 &&
          (M[Math.max(z, I)] = Math.min(z, I));
      }
    let w = new Int32Array(d).fill(-1);
    for (let S = 0; S < d; S++) T(S) === S && ((w[S] = _.length), _.push(S));
    if (_.length < d) {
      let S = [];
      for (let R = 0; R < p.length; R += 3) {
        let z = w[T(p[R])],
          I = w[T(p[R + 1])],
          L = w[T(p[R + 2])];
        z !== I && I !== L && z !== L && S.push(z, I, L);
      }
      p.length = 0;
      for (let R of S) p.push(R);
      for (let [R, z] of [
        [h, 3],
        [m.nrm, 3],
        [m.si, 4],
        [m.sw, 4],
        [m.rest, 4],
        [m.hand, 4],
      ]) {
        for (let I = 0; I < _.length; I++)
          for (let L = 0; L < z; L++) R[I * z + L] = R[_[I] * z + L];
        R.length = _.length * z;
      }
    }
  }
  let g = h.length / 3,
    E = p.length / 3;
  return (
    mD(m),
    (d5 = {
      position: Float32Array.from(m.pos),
      normal: Float32Array.from(m.nrm),
      skinIndex: Uint16Array.from(m.si),
      skinWeight: Float32Array.from(m.sw),
      rest: Float32Array.from(m.rest),
      hand: Float32Array.from(m.hand),
      index: Uint32Array.from(m.idx),
      vertexCount: m.pos.length / 3,
      triCount: m.idx.length / 3,
      gloveVerts: g,
      gloveTris: E,
      evals: xy,
      ms: performance.now() - e,
    }),
    d5
  );
}

function qE(n) {
  let e = Float32Array.from(n.position),
    t = Float32Array.from(n.normal),
    i = Uint32Array.from(n.index);
  for (let s = 0; s < e.length; s += 3) ((e[s] = -e[s]), (t[s] = -t[s]));
  for (let s = 0; s < i.length; s += 3) {
    let o = i[s + 1];
    ((i[s + 1] = i[s + 2]), (i[s + 2] = o));
  }
  return { ...n, position: e, normal: t, index: i };
}

var D1_2 = Vector3;

var _y = Quaternion;

var ZE = Matrix4;

var mi = (n, e, t) => new D1_2(n, e, t);

function Ch(n, e, t) {
  let i = e.clone().normalize(),
    s = t.clone().negate();
  s.addScaledVector(i, -s.dot(i)).normalize();
  let o = new D1_2().crossVectors(i, s);
  return {
    p: n.clone(),
    q: new _y().setFromRotationMatrix(new ZE().makeBasis(o, i, s)),
  };
}

function z1_2(n, e, t, i, s, o, r, a) {
  return mn_2(
    n.toArray(),
    [s, o, r],
    new _y().setFromRotationMatrix(new ZE().makeBasis(e, t, i)),
    a,
  );
}

var XE = mi(0, 1, 0);

var nn = {};

function tc(n) {
  let e = mi(Math.cos(n.tilt), 0, Math.sin(n.tilt)),
    t = mi(Math.sin(n.tilt), 0, -Math.cos(n.tilt)),
    i = mi(...n.web),
    s = Math.cos(n.roll),
    o = Math.sin(n.roll),
    r = t.clone().multiplyScalar(s).addScaledVector(XE, -o),
    a = t.clone().multiplyScalar(-o).addScaledVector(XE, -s),
    l =
      n.roll >= 0
        ? i.clone()
        : i.clone().addScaledVector(t, n.depth).addScaledVector(r, -n.depth),
    c = n.pad || [0, 0, 0];
  l.addScaledVector(e, -(n.drop || 0)).addScaledVector(a, c[0]);
  let u = l
      .clone()
      .addScaledVector(e, n.len / 2 - 0.004)
      .addScaledVector(r, n.depth / 2)
      .addScaledVector(a, n.width / 2),
    f = a.clone().negate(),
    h = [
      z1_2(
        u,
        e,
        f,
        r.clone().negate(),
        n.len / 2,
        n.width / 2,
        n.depth / 2,
        n.round,
      ),
    ];
  if (n.pad) {
    let y = n.pad[2],
      b = n.len - 0.004 - y;
    h.push(
      z1_2(
        l
          .clone()
          .addScaledVector(e, y + b / 2)
          .addScaledVector(r, (n.depth + c[1]) / 2)
          .addScaledVector(a, (n.width - c[0]) / 2),
        e,
        f,
        r.clone().negate(),
        b / 2,
        (n.width + c[0]) / 2,
        (n.depth + c[1]) / 2,
        n.round + 0.003,
      ),
    );
  }
  let p = e
      .clone()
      .multiplyScalar(-Math.cos(n.rake))
      .addScaledVector(r, -Math.sin(n.rake)),
    d = r
      .clone()
      .multiplyScalar(Math.cos(n.rake))
      .addScaledVector(e, -Math.sin(n.rake)),
    m = l
      .clone()
      .addScaledVector(a, n.width / 2)
      .addScaledVector(e, -0.004),
    x = (y, b) => m.clone().addScaledVector(d, y).addScaledVector(p, b);
  (h.push(
    z1_2(
      x((n.top[0] + n.top[1]) / 2, n.top[2] + n.top[3] / 2),
      p.clone().negate(),
      f,
      d.clone().negate(),
      n.top[3] / 2,
      n.topW / 2,
      (n.top[1] - n.top[0]) / 2,
      0.004,
    ),
  ),
    h.push(
      vs(
        x(n.guard[0], n.guard[2]).toArray(),
        x(n.guard[1], n.guard[2]).toArray(),
        0.0035,
      ),
    ));
  let v = x(n.trigger[0], n.trigger[1]);
  return {
    colliders: h,
    frame: Ch(m, p, d),
    trigger: [
      v.clone().addScaledVector(a, -0.004).toArray(),
      v.clone().addScaledVector(a, 0.004).toArray(),
    ],
    a: e,
    f: r,
    n: a,
  };
}

var YE = [0.1, 1.62, 1.02, 0];

var el = [1.55, 1.78, 1.08, 0];

var gD = [0.1, 1.62, 1.02, -0.1];

var y5 = [1.55, 1.78, 1.08, -0.1];

var b5 = d0({
  thumb: [1.3, 0, 0, 1],
  index: [-0.45, 0.1, 0.06, 0.36],
  middle: gD,
  ring: YE,
  little: YE,
});

var I1_2 = tc({
  web: [-0.0335, -0.012, -0.045],
  tilt: 0.22,
  roll: -0.3,
  drop: 0.012,
  rake: 0.3,
  len: 0.094,
  width: 0.028,
  depth: 0.045,
  round: 0.009,
  top: [0.012, 0.2, 0.005, 0.04],
  topW: 0.034,
  guard: [0.036, 0.1, -0.024],
  trigger: [0.084, -0.01],
});

var jE = [1.3, 0.55, 0.6, -0.1];

var wy = [0.8, 0.1, 0.06, 0.36];

nn.rifle_grip = {
  ...I1_2,
  about:
    "firing hand on an AR-style pistol grip, index straight along the receiver. Frame: origin at the top rear of the grip (where the web of the thumb sits), +Y up, -Z muzzle.",
  fit: {
    from: b5,
    to: d0({ thumb: jE, index: wy, middle: y5, ring: el, little: el }),
  },
};

nn.trigger = {
  ...I1_2,
  about:
    "same grip with the index pad on the trigger (colliders include the trigger as a thin bar). setTrigger(0..1) pulls.",
  colliders: I1_2.colliders.concat([
    vs(I1_2.trigger[0], I1_2.trigger[1], 0.0032),
  ]),
  fit: {
    from: d0({ index: [-0.25, 0.2, 0.1, 0.16] }, b5),
    to: d0({
      thumb: jE,
      index: [0.34, 1.6, 0.95, 0.2],
      middle: y5,
      ring: el,
      little: el,
    }),
  },
};

var KE = tc({
  web: [-0.0335, -0.012, -0.045],
  tilt: 0.16,
  roll: -0.2,
  drop: 0.008,
  rake: 0.31,
  len: 0.1,
  width: 0.03,
  depth: 0.05,
  round: 0.011,
  top: [0.012, 0.15, 0.004, 0.032],
  topW: 0.027,
  guard: [0.04, 0.096, -0.03],
  trigger: [0.082, -0.013],
});

nn.pistol_grip = {
  ...KE,
  about:
    "high firing grip on a service pistol, index straight along the frame. Frame: origin at the top of the backstrap under the beavertail, +Y up, -Z muzzle.",
  fit: {
    from: b5,
    to: d0({
      thumb: [0.95, 0.18, 0.22, 0.3],
      index: wy,
      middle: y5,
      ring: el,
      little: el,
    }),
  },
};

nn.slide_stop = {
  ...KE,
  about:
    "pistol_grip with the thumb pressing the slide stop down (the lever sits on the left of the frame above the trigger).",
  fit: {
    from: b5,
    to: d0({
      thumb: [1.15, 0.52, 0.66, 0.34],
      index: wy,
      middle: y5,
      ring: el,
      little: el,
    }),
  },
};

{
  let n = tc({
    web: [-0.0335, -0.012, -0.029],
    tilt: -0.45,
    roll: 0,
    drop: 0.016,
    pad: [0.014, 0.017, 0.03],
    rake: 0.31,
    len: 0.1,
    width: 0.03,
    depth: 0.05,
    round: 0.014,
    top: [0.012, 0.15, 0.004, 0.032],
    topW: 0.027,
    guard: [0.04, 0.096, -0.03],
    trigger: [0.082, -0.013],
  });
  nn.pistol_support = {
    ...n,
    about:
      "support hand wrapped over the firing hand's fingers (the grip shape is padded by those fingers), thumb forward along the frame. Frame: the SAME part frame as pistol_grip (the pistol's tang), so both hands take one frame.",
    fit: {
      from: d0({ thumb: [0, -0.1, -0.1, 0.7], fingers: [-0.2, 1.1, 0.6, 0] }),
      to: d0({ thumb: [0.6, 0.2, 0.2, 0.7], fingers: el }),
    },
  };
}

{
  let n = mi(-0.05, -0.0315, -0.078),
    e = mi(0.042, -0.0315, -0.066),
    t = n.clone().sub(e).normalize(),
    i = mi(0.1, -0.5, -0.86);
  i.addScaledVector(t, -i.dot(t)).normalize();
  let s = new D1_2().crossVectors(i, t);
  nn.foregrip = {
    colliders: [
      vs(n.toArray(), e.toArray(), 0.0165),
      z1_2(
        n.clone().addScaledVector(t, 0.03),
        t,
        s,
        i,
        0.021,
        0.022,
        0.1,
        0.006,
      ),
    ],
    frame: Ch(n.clone().addScaledVector(t, 0.009), t, i),
    about:
      "fist round a vertical foregrip. Frame: origin at the top of the grip where it meets the handguard, +Y up along the grip, -Z muzzle (the hand may be turned about +Y freely).",
    fit: {
      from: d0({
        thumb: [1.25, 0, 0, 0.85],
        fingers: [-0.05, 0.04, 0.02, 0],
      }),
      to: d0({
        thumb: [1.25, 0.55, 0.7, -0.12],
        fingers: [1.5, 1.8, 1.1, -0.02],
      }),
    },
  };
}

{
  let n = mi(0, -0.0375, -0.082);
  nn.handguard = {
    colliders: [mn_2(n.toArray(), [0.09, 0.0225, 0.0225], null, 0.012)],
    frame: Ch(n, mi(0, -1, 0), mi(-1, 0, 0)),
    about:
      "support hand cupped under a ~45 mm handguard, fingers up the far side, thumb along the near side pointing at the muzzle. Frame: origin on the handguard's centre line under the middle of the palm, +Y up, -Z muzzle.",
    fit: {
      from: d0({
        thumb: [0.25, -0.1, -0.2, 1],
        fingers: [-0.05, 0.04, 0.02, 0.04],
      }),
      to: d0({ thumb: [1.2, 0.3, 0.35, 1], fingers: [1.5, 1.6, 1, 0] }),
    },
  };
}

{
  let n = mi(0.004, -0.1035, -0.059);
  nn.mag_cup = {
    colliders: [mn_2(n.toArray(), [0.012, 0.09, 0.031], null, 0.003)],
    frame: Ch(mi(0.004, -0.0135, -0.059), mi(0, -1, 0), mi(0, 0, -1)),
    about:
      "palm up under a magazine base plate, fingers up its front face, thumb up its side. Frame: origin at the centre of the base plate, +Y along the magazine toward the gun, -Z the magazine's front (bullet noses).",
    fit: {
      from: d0({ thumb: [0.9, 0, 0, 0.9], fingers: [0.2, 0.05, 0.02, 0] }),
      to: d0({
        thumb: [1.3, 0.3, 0.3, -0.1],
        index: [1.42, 0.3, 0.2, 0],
        middle: [1.6, 0.3, 0.2, 0],
        ring: [1.6, 0.3, 0.2, 0],
        little: [1.36, 0.34, 0.22, 0],
      }),
    },
  };
}

{
  let e = mi(0, Math.cos(0.95), Math.sin(0.95)),
    t = mi(0, -Math.sin(0.95), Math.cos(0.95)),
    i = mi(-0.006, -0.05, -0.088);
  nn.mag_pinch = {
    colliders: [z1_2(i, mi(1, 0, 0), e, t, 0.09, 0.012, 0.031, 0.003)],
    frame: Ch(i, mi(-1, 0, 0), t.clone().negate()),
    about:
      "a magazine held by its flat sides between the thumb and the fingers. Frame: origin at the middle of the magazine body, +Y toward its feed lips, -Z its front.",
    fit: {
      from: d0({
        thumb: [0.55, -0.1, -0.2, 1],
        fingers: [0.35, 0.1, 0.05, 0],
      }),
      to: d0({ thumb: [1.25, 0.5, 0.5, 0.1], fingers: [1.3, 1.1, 0.6, 0] }),
    },
  };
}

{
  let n = d0({ fingers: [0.3, 1.25, 0.85, 0] }),
    e = ra_2(n, tr()),
    t = e.j[5].clone().lerp(e.j[6], 0.62),
    i = e.j[9].clone().lerp(e.j[10], 0.62),
    s = mi(0, -1, 0).applyQuaternion(e.q[4]),
    o = t.clone().addScaledVector(s, t0_2[1].rad[1] + 0.006),
    r = i
      .clone()
      .addScaledVector(
        mi(0, -1, 0).applyQuaternion(e.q[7]),
        t0_2[2].rad[1] + 0.006,
      ),
    a = r.clone().sub(o).normalize();
  (o.addScaledVector(a, -0.016), r.addScaledVector(a, 0.014));
  let l = o.clone().add(r).multiplyScalar(0.5),
    c = mi(0, 0, 1).applyQuaternion(e.q[4]).negate();
  nn.charging_handle = {
    colliders: [vs(o.toArray(), r.toArray(), 0.005)],
    frame: Ch(l, new D1_2().crossVectors(a, c), c.clone()),
    about:
      "index and middle fingers hooked over an AR charging handle, the others folded. Frame: origin at the middle of the handle, +Y up, -Z muzzle (rack by moving the hand along +Z of the part).",
    fit: {
      digits: [1, 2],
      rest: d0({
        thumb: [0.25, 0.2, 0.3, 0.45],
        ring: [1.3, 1.55, 0.9, 0],
        little: [1.3, 1.5, 0.85, -0.04],
      }),
      from: d0({ fingers: [0.3, 0.35, 0.2, 0] }),
      to: d0({ fingers: [0.3, 1.8, 1.25, 0] }),
    },
  };
}

var $E = new _y();

var xD = new D1_2();

function M5(n, e, t, i, s) {
  let o = nn[n];
  if (!o) throw new Error('weapon_hands: unknown grip "' + n + '"');
  return (
    $E.copy(o.frame.q).invert(),
    s.copy(t).multiply($E),
    i.copy(xD.copy(o.frame.p).negate().applyQuaternion(s)).add(e),
    i
  );
}

var vD = {
  from: d0({ thumb: [1.3, 0, 0, 0.95] }, di_2.open),
  to: d0({
    thumb: [1.15, 0.75, 0.95, 0.1],
    index: [1.5, 1.9, 1.3, -0.04],
    middle: [1.52, 1.9, 1.3, 0],
    ring: [1.54, 1.9, 1.3, -0.03],
    little: [1.56, 1.9, 1.3, -0.08],
  }),
};

function Ey() {
  let n = { fist: Jl([], { ...vD, palm: Fr }) };
  for (let e in nn) n[e] = Jl(nn[e].colliders, { ...nn[e].fit, palm: Fr });
  return n;
}

function JE(n = Ey()) {
  for (let e in n) di_2[e] = n[e];
  return di_2;
}

var zy = {};

defineModuleExports(zy, {
  ARM: () => Cu,
  BONE: () => l0,
  BONE_NAMES: () => T1_2,
  COLORS: () => Ay,
  DEFAULT_POLE: () => S5,
  DIGITS: () => t0_2,
  DIGIT_NAMES: () => Eh,
  GRIPS: () => nn,
  LIMITS: () => xs,
  POSES: () => di_2,
  REST: () => jl,
  SHOULDER: () => er,
  TRIGGER_PULL: () => oS,
  TWIST_SHARE: () => Iy,
  WETNESS: () => kh,
  WRIST_LIMITS: () => sS,
  armGeometry: () => aS,
  armMaterial: () => lS,
  box: () => mn_2,
  capsule: () => vs,
  clampPose: () => ly,
  createArm: () => Fh,
  fitGrip: () => rS,
  fitReferencePoses: () => Ey,
  handSocket: () => M5,
  lerpPose: () => tn_2,
  limitViolation: () => LE,
  makePose: () => d0,
  mirrorColliders: () => Lh,
  penetration: () => Kl,
  selfPenetration: () => wD,
  showcase: () => TD,
  transformColliders: () => Th,
});

var Ay = {
  olive: [0.15, 0.156, 0.094],
  gusset: [0.066, 0.071, 0.05],
  tan: [0.33, 0.245, 0.14],
  tanDark: [0.235, 0.172, 0.1],
  rubber: [0.06, 0.062, 0.068],
  stitch: [0.5, 0.44, 0.3],
  cuff: [0.062, 0.066, 0.056],
  strap: [0.036, 0.038, 0.04],
  tab: [0.56, 0.15, 0.03],
  navy: [0.046, 0.068, 0.106],
  hem: [0.028, 0.04, 0.062],
  orange: [0.5, 0.145, 0.028],
  refl: [0.42, 0.42, 0.4],
};

var kh = { value: 0.7 };

var ys = Ay;

var L1_2 = t0_2.map((n) => [n.len[0], n.len[0] + n.len[1], n.total]);

var Ty = P1_2.web;

var yD = Ty.c.map((n, e) => n - Ty.ab[e] * 0.009);

var Du = Ty.ab.map((n) => n * 0.018);

var bD = Du[0] * Du[0] + Du[1] * Du[1] + Du[2] * Du[2];

var nc = P1_2.guard.map((n) => [
  n.c[0],
  n.c[1],
  n.c[2],
  Math.cos(n.yaw),
  Math.sin(n.yaw),
  1 / (n.r[0] + 0.001),
  1 / (n.r[1] + 0.0035),
  1 / (n.r[2] + 0.001),
]);

var _5 = [0.0165, -0.037, 0.02, 0.028];

var w5 = [-0.047, 0.0085, 0.22];

var En_2 = (n) => {
  let e = (+n).toPrecision(6).replace(/\.?0+$/, "");
  return /[.e]/.test(e) ? e : e + ".0";
};

var Ui = (n) => `vec3(${n.map(En_2).join(", ")})`;

var Sy = (n) =>
  `(F < 0.5 ? ${En_2(L1_2[0][n])} : F < 1.5 ? ${En_2(L1_2[1][n])} : F < 2.5 ? ${En_2(L1_2[2][n])} : F < 3.5 ? ${En_2(L1_2[3][n])} : ${En_2(L1_2[4][n])})`;

var MD = `
float aBand(float x, float a, float b, float w) { return smoothstep(a - w, a, x) * (1.0 - smoothstep(b, b + w, x)); }
float aHash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float aNoise(vec3 x) { vec3 i = floor(x), q = fract(x); q = q * q * (3.0 - 2.0 * q);
  return mix(mix(mix(aHash(i), aHash(i + vec3(1, 0, 0)), q.x), mix(aHash(i + vec3(0, 1, 0)), aHash(i + vec3(1, 1, 0)), q.x), q.y),
             mix(mix(aHash(i + vec3(0, 0, 1)), aHash(i + vec3(1, 0, 1)), q.x), mix(aHash(i + vec3(0, 1, 1)), aHash(i + vec3(1, 1, 1)), q.x), q.y), q.z); }
// hc = (A, F, D, S), rs = rest position + zone. Returns albedo; rough, h (metres), kind as in surfaceJS.
vec3 armSurface(vec4 hc, vec4 rs, float gD, out float rough, out float h, out float kind) {
  float A = hc.x, F = hc.y, D = hc.z, S = hc.w, x = rs.x, y = rs.y, z = rs.z; vec3 col; h = 0.0;
  if (rs.w > 0.5) {
    float ang = atan(D, S);
    col = ${Ui(ys.navy)}; rough = 0.50; kind = 4.0;
    col *= 0.80 + 0.26 * smoothstep(-0.9, 0.6, F);
    float bandM = aBand(A, 0.128, 0.172, 0.0012), refl = aBand(A, 0.1445, 0.1555, 0.0008);
    col = mix(col, ${Ui(ys.orange)}, bandM); col = mix(col, ${Ui(ys.refl)}, refl); rough = mix(rough, 0.62, bandM); rough = mix(rough, 0.30, refl); kind = mix(kind, 5.0, refl);
    h += 0.00035 * bandM + 0.00015 * refl;
    float edge = aBand(A, 0.1268, 0.1292, 0.0006) + aBand(A, 0.1708, 0.1732, 0.0006);
    col = mix(col, ${Ui(ys.stitch)}, 0.55 * edge * step(fract(ang * 9.5), 0.62));
    float hem = 1.0 - smoothstep(0.0655, 0.0675, A), rib = 0.5 + 0.5 * cos(ang * 44.0);
    col = mix(col, ${Ui(ys.hem)}, hem); col *= mix(1.0, 0.62 + 0.5 * rib, hem); h += 0.0007 * rib * hem; rough = mix(rough, 0.82, hem); kind = mix(kind, 3.0, hem);
    float sa = atan(sin(ang + 1.9), cos(ang + 1.9)) / 0.045, seam = exp(-sa * sa) * (1.0 - hem);
    rough = mix(rough, 0.34, seam * 0.8); col *= 1.0 - 0.25 * seam;
  } else {
    float j1 = ${Sy(0)}, j2 = ${Sy(1)}, j3 = ${Sy(2)};
    float u = A < j1 ? A / j1 : A < j2 ? 1.0 + (A - j1) / (j2 - j1) : 2.0 + (A - j2) / (j3 - j2);
    float thumb = 1.0 - smoothstep(0.35, 0.65, F), digit = smoothstep(0.003, 0.010, A), cuff = smoothstep(0.0045, 0.0060, z);
    float sw = 0.025 + 0.31 * digit * mix(1.0, smoothstep(0.9, 1.15, u), thumb);
    float back = smoothstep(sw - 0.035, sw + 0.035, D), palmar = 1.0 - smoothstep(-sw - 0.035, -sw + 0.035, D), side = 1.0 - back - palmar;
    float r = length(rs.xyz);
    col = ${Ui(ys.olive)}; rough = 0.92; kind = 0.0;
    col = mix(col, ${Ui(ys.gusset)}, side); rough = mix(rough, 0.95, side);
    col = mix(col, ${Ui(ys.tan)}, palmar); rough = mix(rough, 0.66, palmar); kind = mix(kind, 1.0, palmar);
    float cap = smoothstep(2.40, 2.46, u) * (1.0 - palmar);
    col = mix(col, ${Ui(ys.tan)}, cap); rough = mix(rough, 0.66, cap); kind = mix(kind, 1.0, cap);
    float ex = (x - ${En_2(_5[0])}) / ${En_2(_5[2])}, ez = (z - ${En_2(_5[1])}) / ${En_2(_5[3])}, he = sqrt(ex * ex + ez * ez), heelOn = palmar * (1.0 - digit);
    float heel = (1.0 - smoothstep(0.94, 1.0, he)) * heelOn;
    vec3 wv = rs.xyz - ${Ui(yD)}, sdv = ${Ui(Du)}; float wt = clamp(dot(wv, sdv) / ${En_2(bD)}, 0.0, 1.0);
    float sdist = length(wv - sdv * wt), saddle = (1.0 - smoothstep(0.0158, 0.0168, sdist)) * (1.0 - smoothstep(0.30, 0.50, D));
    float reinf = max(heel, saddle) * (1.0 - cuff);
    col = mix(col, ${Ui(ys.tanDark)}, reinf); rough = mix(rough, 0.76, reinf); h += 0.0005 * reinf; kind = mix(kind, 1.0, reinf);
    float prow = max(aBand(he, 0.86, 0.89, 0.012) * heelOn, aBand(sdist, 0.0138, 0.0144, 0.0003) * (1.0 - smoothstep(-0.25, -0.05, D))) * (1.0 - cuff);
    float ge = 9.0, gE; vec3 gv; vec2 gl = vec2(0.0), gL;
${nc.map(
  (n) =>
    `    gv = rs.xyz - ${Ui(n.slice(0, 3))}; gL = vec2(gv.x * ${En_2(n[3])} - gv.z * ${En_2(n[4])}, gv.x * ${En_2(n[4])} + gv.z * ${En_2(n[3])}); gE = length(vec3(gL.x * ${En_2(n[5])}, gv.y * ${En_2(n[6])}, gL.y * ${En_2(n[7])})); if (gE < ge) { ge = gE; gl = gL; }`,
).join(`
`)}
    float gs = 9.0; vec2 gp, gb;
${[0, 1, 2].map(
  (n) =>
    `    gp = rs.xz - vec2(${En_2(nc[n][0])}, ${En_2(nc[n][2] + 0.0045)}); gb = vec2(${En_2(nc[n + 1][0] - nc[n][0])}, ${En_2(nc[n + 1][2] - nc[n][2])}); gs = min(gs, length(gp - gb * clamp(dot(gp, gb) / dot(gb, gb), 0.0, 1.0)));`,
).join(`
`)}
    float lobe = clamp(1.15 - ge, 0.0, 1.0), guard = max(1.0 - smoothstep(0.94, 1.0, ge), (1.0 - smoothstep(0.0066, 0.0074, gs)) * smoothstep(0.004, 0.006, y - ${En_2(nc[1][1] - 0.011)})) * smoothstep(0.15, 0.35, D);
    float top = smoothstep(0.835, 0.875, D), fs = fract(u);
    float ribs = aBand(fs, 0.24, 0.80, 0.02) * (1.0 - 0.85 * (aBand(fs, 0.405, 0.435, 0.008) + aBand(fs, 0.605, 0.635, 0.008)));
    float bars = top * ribs * (u < 2.0 ? 1.0 : 0.0) * (u < 1.0 ? 1.0 - thumb : 1.0) * digit;
    float rz = (${En_2(w5[0])} + ${En_2(w5[2])} * x - z) / ${En_2(w5[1])}, ri = clamp(floor(rz + 0.5), 0.0, 2.0);
    float plate = aBand((rz - ri) * ${En_2(w5[1])}, -0.0016, 0.0016, 0.0006) * aBand(x, -0.0175 + 0.004 * ri, 0.0200 - 0.002 * ri, 0.0012) * smoothstep(0.62, 0.70, D) * (1.0 - digit);
    float rub = max(guard, max(bars, plate));
    col = mix(col, ${Ui(ys.rubber)}, rub); rough = mix(rough, 0.46, rub); kind = mix(kind, 2.0, rub);
    float rim = aBand(ge, 0.80, 0.87, 0.02) * guard;
    float slot = (aBand(gl.y, -0.0052, -0.0036, 0.0004) + aBand(gl.y, 0.0012, 0.0028, 0.0004)) * aBand(gl.x, -0.0052, 0.0052, 0.0006) * (1.0 - smoothstep(0.70, 0.80, ge)) * guard;
    h += 0.0011 * bars + 0.0010 * plate + 0.0006 * guard * (0.4 + 0.6 * lobe) - 0.00035 * rim - 0.0006 * slot;
    col *= (1.0 + 0.5 * guard * lobe * lobe) * (1.0 - 0.3 * rim) * (1.0 - 0.55 * slot);
    float dash = step(fract(r / 0.0024), 0.60), free = (1.0 - rub) * (1.0 - cuff) * (1.0 - saddle);
    float gd = clamp(gD, 25.0, 700.0), sA = abs(D - sw) / gd, sB = abs(D + sw) / gd, sd = min(sA, sB), groove = (1.0 - smoothstep(0.0, 0.0006, sd)) * free;
    float row = aBand(sd, 0.0010, 0.0016, 0.00025) * free * (sA < sB ? step(sw, D) : step(D, -sw));
    float cs = abs(u - 2.43) * (j3 - j2), capSeam = (1.0 - smoothstep(0.0, 0.0006, cs)) * (1.0 - palmar);
    float capRow = aBand(cs, 0.0010, 0.0016, 0.00025) * (1.0 - palmar) * step(fract(S * 5.5 + D * 2.0), 0.6);
    float gr = max(groove, capSeam); h -= 0.00045 * gr; col *= 1.0 - 0.45 * gr;
    float st = max(row * dash, max(capRow, prow * 0.55)); col = mix(col, ${Ui(ys.stitch)}, 0.85 * st); h += 0.00022 * st;
    float c1 = (A - j1) / 0.0013, c2 = (A - j2) / 0.0013, c0 = (A - 0.0135) / 0.0014;
    float cre = (exp(-c1 * c1) + exp(-c2 * c2)) * digit, root = exp(-c0 * c0) * (1.0 - thumb) * palmar;
    h -= 0.0006 * (cre * palmar + root) + 0.00025 * cre * back * (1.0 - rub); col *= 1.0 - 0.35 * (cre * palmar + root);
    float ang = atan(y, x), rib = 0.5 + 0.5 * cos(ang * 46.0);
    col = mix(col, ${Ui(ys.cuff)}, cuff); col *= mix(1.0, 0.70 + 0.45 * rib, cuff); h = mix(h, 0.0005 * rib, cuff); rough = mix(rough, 0.88, cuff); kind = mix(kind, 3.0, cuff);
    float strap = aBand(z, 0.0165, 0.0345, 0.0005) * smoothstep(-0.55, -0.45, D) * cuff;
    col = mix(col, ${Ui(ys.strap)}, strap); h = mix(h, 0.0012, strap); rough = mix(rough, 0.80, strap); kind = mix(kind, 0.0, strap);
    float tabE = strap * aBand(x, 0.0080, 0.0280, 0.0008) * smoothstep(0.2, 0.3, D); col = mix(col, ${Ui(ys.rubber)}, tabE); h += 0.0009 * tabE; rough = mix(rough, 0.45, tabE); kind = mix(kind, 2.0, tabE);
    float srow = strap * (1.0 - tabE) * (aBand(z, 0.0176, 0.0186, 0.0003) + aBand(z, 0.0324, 0.0334, 0.0003)) * step(fract(ang * 14.0), 0.6); col = mix(col, ${Ui(ys.stitch)}, 0.8 * srow);
    float tab = aBand(z, 0.0078, 0.0140, 0.0003) * aBand(x, -0.0225, -0.0090, 0.0005) * smoothstep(0.3, 0.4, D); col = mix(col, ${Ui(ys.tab)}, tab); h += 0.0006 * tab; rough = mix(rough, 0.7, tab); kind = mix(kind, 0.0, tab);
    col *= 1.0 - 0.4 * aBand(z, 0.0040, 0.0064, 0.0006);
  }
  return col;
}
// sub-millimetre detail by kind: weave (0), pebbled grain (1), moulded rubber (2), knit rib (3), waxed ripstop + beads (4), glass bead tape (5)
vec3 armMicro(vec3 col, vec4 hc, vec4 rs, vec3 rn, float kind, float wet, inout float rough, inout float h) {
  vec3 p = rs.xyz, an = abs(rn); an = an * an; an /= an.x + an.y + an.z + 1e-5;
  float px = max(length(dFdx(p)), length(dFdy(p))), fine = 1.0 - smoothstep(0.00018, 0.00050, px);      // fade detail the pixels cannot hold
  float wf = 5712.0, weave = (sin(p.y * wf) * sin(p.z * wf)) * an.x + (sin(p.x * wf) * sin(p.z * wf)) * an.y + (sin(p.x * wf) * sin(p.y * wf)) * an.z;
  float n1 = aNoise(p * 950.0), n2 = aNoise(p * 2300.0 + 7.3), big = aNoise(p * 90.0 + 3.1);
  float kFab = 1.0 - min(1.0, abs(kind - 0.0)), kLea = 1.0 - min(1.0, abs(kind - 1.0)), kRub = 1.0 - min(1.0, abs(kind - 2.0)), kRib = 1.0 - min(1.0, abs(kind - 3.0)), kShell = 1.0 - min(1.0, abs(kind - 4.0)), kRefl = 1.0 - min(1.0, abs(kind - 5.0));
  h += fine * (kFab * 0.00005 * weave + kLea * 0.00011 * (n1 * 0.7 + n2 * 0.3 - 0.5) + kRub * 0.00003 * (n2 - 0.5) + kRib * 0.00006 * weave + kShell * 0.000035 * weave + kRefl * 0.00004 * (n2 - 0.5));
  col *= 1.0 + fine * (kFab * 0.06 * weave + kLea * 0.16 * (n1 - 0.5) + kRib * 0.08 * weave + kShell * 0.04 * weave) + (big - 0.5) * (0.16 * kLea + 0.10 * kFab + 0.10 * kShell + 0.06 * kRub);
  rough += (big - 0.5) * (0.10 * kLea + 0.10 * kShell + 0.12 * kRub) + fine * (n1 - 0.5) * 0.10 * kLea;
  // rain beads on the shell (laid out in the sleeve's own angle / length coordinates) and, sparser, on the rubber
  if (wet > 0.01 && (kShell + kRefl + kRub) > 0.3) {
    vec2 q = rs.w > 0.5 ? vec2(atan(hc.z, hc.w) * 0.046, hc.x) : vec2(dot(p, vec3(0.8, 0.0, 0.6)), dot(p, vec3(-0.42, 0.7, 0.57)));
    float bead = 0.0, wetR = 0.0;
    for (int o = 0; o < 2; o++) {
      float cell = o == 0 ? 0.0085 : 0.0041; vec2 g = q / cell + float(o) * 13.7, id = floor(g), fr = fract(g);
      float r1 = aHash(vec3(id, 1.0 + float(o))), r2 = aHash(vec3(id, 5.0)), r3 = aHash(vec3(id, 9.0));
      float rad = (o == 0 ? 0.0019 : 0.0010) * (0.55 + 0.6 * r3), on = step(r1, (o == 0 ? 0.42 : 0.5) * wet * (rs.w > 0.5 ? 1.0 : 0.5));
      float d = length((fr - (0.25 + 0.5 * vec2(r2, r3))) * cell) / rad;
      bead = max(bead, on * sqrt(max(0.0, 1.0 - d * d)) * rad * 0.55); wetR = max(wetR, on * (1.0 - smoothstep(0.85, 1.0, d)));
    }
    h += bead; rough = mix(rough, 0.07, wetR); col *= 1.0 - 0.18 * wetR;
  }
  rough = clamp(rough, 0.05, 1.0);
  return col;
}
vec3 armBump(vec3 N, vec3 vp, float h) {
  vec3 dpx = dFdx(vp), dpy = dFdy(vp), r1 = cross(dpy, N), r2 = cross(N, dpx);
  float det = dot(dpx, r1); vec3 g = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
  return normalize(abs(det) * N - g);
}
`;

function QE(n) {
  let e = new n.MeshStandardMaterial({
    color: 16777215,
    roughness: 0.8,
    metalness: 0,
  });
  return (
    (e.name = "saltline_arm"),
    (e.onBeforeCompile = (t) => {
      ((t.uniforms.uArmWet = kh),
        (t.vertexShader = t.vertexShader
          .replace(
            "#include <common>",
            `#include <common>
attribute vec4 aRest; attribute vec4 aHand; varying vec4 vArmRest; varying vec4 vArmHand; varying vec3 vArmN;`,
          )
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
vArmRest = aRest; vArmHand = aHand; vArmN = normal;`,
          )),
        (t.fragmentShader = t.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>
uniform float uArmWet; varying vec4 vArmRest; varying vec4 vArmHand; varying vec3 vArmN;
` + MD,
          )
          .replace(
            "#include <map_fragment>",
            `#include <map_fragment>
  vec3 armPx = dFdx(-vViewPosition), armPy = dFdy(-vViewPosition), armNg = normalize(cross(armPx, armPy)), armR1 = cross(armPy, armNg), armR2 = cross(armNg, armPx);
  float armGD = length(dFdx(vArmHand.z) * armR1 + dFdy(vArmHand.z) * armR2) / max(abs(dot(armPx, armR1)), 1e-12);
  float armRough, armH, armKind; vec3 armCol = armSurface(vArmHand, vArmRest, armGD, armRough, armH, armKind);
  armCol = armMicro(armCol, vArmHand, vArmRest, normalize(vArmN), armKind, uArmWet, armRough, armH);
  diffuseColor.rgb = armCol;`,
          )
          .replace(
            "#include <roughnessmap_fragment>",
            `#include <roughnessmap_fragment>
  roughnessFactor = armRough;`,
          )
          .replace(
            "#include <normal_fragment_maps>",
            `#include <normal_fragment_maps>
  normal = armBump(normal, -vViewPosition, armH);`,
          )));
    }),
    (e.customProgramCacheKey = () => "saltline-arm-1"),
    e
  );
}

JE();

var U0 = Vector3;

var la_2 = Quaternion;

var iS = Matrix4;

var nl = Cu.upper;

var Lu = Cu.fore;

var ic = Math.PI;

var Iy = [0.42, 0.84];

var sS = { flex: [-1.22, 1.4], deviation: [-0.61, 0.35], twist: [-1.66, 1.66] };

var S5 = { right: [0.8, -0.6, 0], left: [-0.8, -0.6, 0] };

var oS = [0.04, 0.22, 0.16, 0];

var _D = [0.16, 0.2, 0.2];

var wD = (n, e) => cy(n, Fr, e);

var rS = (n, e = {}) => Jl(n, e.palm === void 0 ? { ...e, palm: Fr } : e);

function Lh(n) {
  return n.map((e) =>
    e.type === "capsule"
      ? vs([-e.a[0], e.a[1], e.a[2]], [-e.b[0], e.b[1], e.b[2]], e.r)
      : mn_2(
          [-e.c[0], e.c[1], e.c[2]],
          e.h,
          [e.q[0], -e.q[1], -e.q[2], e.q[3]],
          e.r,
        ),
  );
}

var Ry = {};

function aS(n = "right") {
  if (Ry[n]) return Ry[n];
  let e = n === "left" ? qE(My()) : My(),
    t = new BufferGeometry();
  return (
    t.setAttribute("position", new BufferAttribute(e.position, 3)),
    t.setAttribute("normal", new BufferAttribute(e.normal, 3)),
    t.setAttribute("skinIndex", new BufferAttribute(e.skinIndex, 4)),
    t.setAttribute("skinWeight", new BufferAttribute(e.skinWeight, 4)),
    t.setAttribute("aRest", new BufferAttribute(e.rest, 4)),
    t.setAttribute("aHand", new BufferAttribute(e.hand, 4)),
    t.setIndex(new BufferAttribute(e.index, 1)),
    (t.boundingSphere = new Sphere(new U0(0, 0, 0.2), 0.7)),
    (t.boundingBox = new Box3(new U0(-0.5, -0.5, -0.5), new U0(0.5, 0.5, 0.9))),
    (t.userData = { triCount: e.triCount, buildMs: e.ms }),
    (Ry[n] = t)
  );
}

var eS = null;

function lS() {
  return eS || (eS = QE(THREE));
}

var F1_2 = new U0();

var tS = new U0();

var nS = new U0();

var Nr = new U0();

var tl = new U0();

var Ph = new U0();

var yo = new U0();

var sr = new U0();

var zh = new U0();

var N1_2 = new U0();

var Fu = new U0();

var bs = new la_2();

var ni_2 = new la_2();

var E5 = new la_2();

var Cy = new la_2();

var ky_2 = new la_2();

var Dh = new iS();

var ED = new U0();

var Py = new U0(0, 0, 1);

var SD = new Euler();

var Ih = (n, e) => (n.isVector3 ? e.copy(n) : e.set(n[0], n[1], n[2]));

function Fh(n, e = {}) {
  let t = e.side === "left" ? "left" : "right",
    i = t === "left" ? -1 : 1,
    s = new Group();
  s.name = "arm-" + t;
  let o = T1_2.map((A) => {
      let F = new Bone();
      return ((F.name = A), F);
    }),
    r = o,
    a = r[0],
    l = r[1],
    c = r[2],
    u = r[3],
    f = r[4];
  (s.add(a),
    a.add(l),
    l.add(c, u, f),
    l.position.set(0, 0, -nl),
    c.position.set(0, 0, -0.09),
    u.position.set(0, 0, -0.2),
    f.position.set(0, 0, -Lu));
  let h = [],
    p = [],
    d = [],
    m = [];
  for (let A = 0; A < 5; A++)
    for (let F = 0; F < 3; F++) {
      let H = r[l0.digit(A, F)],
        N = r[l0.helper(A, F)],
        Z = F ? r[l0.digit(A, F - 1)] : f,
        Q = t0_2[A];
      (Z.add(H, N),
        F
          ? H.position.set(0, 0, -Q.len[F - 1])
          : H.position.set(Q.base[0] * i, Q.base[1], Q.base[2]),
        N.position.copy(H.position),
        m.push(H.position.clone()),
        h.push(_h(A, F, jl, new la_2())),
        p.push(H),
        d.push(N));
    }
  let x = (A) => (i < 0 && ((A.y = -A.y), (A.z = -A.z)), A),
    v = new Float32Array(Un),
    y = new Float32Array(Un),
    b = new Float32Array(5),
    g = new Float32Array(5),
    E = 0;
  function M() {
    for (let A = 0; A < Un; A++) y[A] = v[A];
    for (let A = 0; A < 4; A++) y[4 + A] += oS[A] * E;
    for (let A = 0; A < 5; A++) {
      let F = b[A];
      F !== 0 &&
        ((y[A * 4 + 1] += F),
        (y[A * 4 + 2] += F * 0.6),
        A && (y[A * 4] += F * 0.4));
    }
    ly(y);
    for (let A = 0; A < 5; A++)
      for (let F = 0; F < 3; F++) {
        let H = A * 3 + F,
          N = p[H],
          Z = d[H];
        (x(_h(A, F, y, N.quaternion)),
          Z.quaternion.copy(x(bs.copy(h[H]))).slerp(N.quaternion, 0.5));
        let Q = A === 0 && F === 0 ? 0 : y[A * 4 + F] - jl[A * 4 + F],
          W = Math.sin(Math.min(Math.max(Q, 0), 2) * 0.5);
        (F1_2.set(0, _D[F] * t0_2[A].rad[F] * W * W, 0).applyQuaternion(
          Z.quaternion,
        ),
          Z.position.copy(m[H]).add(F1_2));
      }
  }
  function _(A) {
    for (let F = 0; F < Un; F++) v[F] = A[F];
  }
  let T = {
      reach: 0,
      wristFlex: 0,
      wristDeviation: 0,
      twist: 0,
      violation: 0,
      lean: 0,
      elbow: new U0(),
      shoulder: new U0(),
    },
    w = new U0(),
    S = new U0(),
    R = new la_2(),
    z = !1,
    I = { x: 0, y: 0, vx: 0, vy: 0 };
  function L(A, F, H, N, Z, Q) {
    (Ih(A, Nr),
      (Nr.x *= i),
      Ih(F, tl),
      (tl.x *= i),
      E5.copy(H),
      x(E5),
      N ? (Ih(N, sr), (sr.x *= i)) : sr.set(0.8, -0.6, 0),
      yo.subVectors(tl, Nr));
    let W = yo.length() || 1e-6;
    yo.multiplyScalar(1 / W);
    let J = (nl + Lu) * 0.999,
      G = Math.abs(nl - Lu) + 0.02,
      te = 0;
    W > J &&
      Z > 0 &&
      ((te = Math.min(Z, W - J)), Nr.addScaledVector(yo, te), (W -= te));
    let oe = Math.max(0, W - J);
    oe > 0
      ? ((W = J), tl.copy(Nr).addScaledVector(yo, W))
      : W < G && ((W = G), tl.copy(Nr).addScaledVector(yo, W));
    let ee = (W * W + nl * nl - Lu * Lu) / (2 * W),
      le = Math.sqrt(Math.max(0, nl * nl - ee * ee));
    (sr.addScaledVector(yo, -sr.dot(yo)),
      sr.lengthSq() < 1e-8 &&
        (sr.set(0, -1, 0).addScaledVector(yo, yo.y),
        sr.lengthSq() < 1e-8 && sr.set(1, 0, 0).addScaledVector(yo, -yo.x)),
      sr.normalize(),
      Ph.copy(Nr).addScaledVector(yo, ee).addScaledVector(sr, le),
      zh.crossVectors(sr, yo).normalize(),
      Fu.subVectors(Nr, Ph).normalize(),
      N1_2.crossVectors(Fu, zh),
      Cy.setFromRotationMatrix(Dh.makeBasis(zh, N1_2, Fu)),
      Fu.subVectors(Ph, tl).normalize(),
      N1_2.crossVectors(Fu, zh),
      ky_2.setFromRotationMatrix(Dh.makeBasis(zh, N1_2, Fu)),
      bs.copy(ky_2).invert().multiply(E5),
      bs.w < 0 &&
        ((bs.x = -bs.x), (bs.y = -bs.y), (bs.z = -bs.z), (bs.w = -bs.w)));
    let xe = 2 * Math.atan2(bs.z, bs.w);
    for (; xe > ic / 2;) xe -= 2 * ic;
    for (; xe <= -1.5 * ic;) xe += 2 * ic;
    (ni_2.setFromAxisAngle(Py, -xe).multiply(bs),
      ni_2.w < 0 &&
        ((ni_2.x = -ni_2.x),
        (ni_2.y = -ni_2.y),
        (ni_2.z = -ni_2.z),
        (ni_2.w = -ni_2.w)));
    let j = Math.sqrt(ni_2.x * ni_2.x + ni_2.y * ni_2.y + ni_2.z * ni_2.z),
      O = 2 * Math.atan2(j, ni_2.w),
      q = j > 1e-9 ? O / j : 2,
      ue = -ni_2.x * q,
      de = ni_2.y * q,
      $ = xe + ic / 2,
      se = sS;
    return (
      (T.reach = oe),
      (T.lean = te),
      (T.wristFlex = ue),
      (T.wristDeviation = de),
      (T.twist = $),
      (T.violation = Math.max(
        0,
        se.flex[0] - ue,
        ue - se.flex[1],
        se.deviation[0] - de,
        de - se.deviation[1],
        se.twist[0] - $,
        $ - se.twist[1],
      )),
      Q &&
        (T.elbow.set(Ph.x * i, Ph.y, Ph.z),
        T.shoulder.set(Nr.x * i, Nr.y, Nr.z),
        a.position.copy(T.shoulder),
        x(a.quaternion.copy(Cy)),
        x(l.quaternion.copy(Cy).invert().multiply(ky_2)),
        x(f.quaternion.copy(bs)),
        x(R.setFromAxisAngle(Py, xe * Iy[0])),
        c.quaternion.copy(R),
        x(u.quaternion.setFromAxisAngle(Py, xe * Iy[1])),
        F1_2.set(tl.x * i, tl.y, tl.z),
        z && S.subVectors(F1_2, w),
        w.copy(F1_2),
        (z = !0)),
      T
    );
  }
  (_(jl), M(), a.position.set(0, 0, nl + Lu), s.updateMatrixWorld(!0));
  let U = new Skeleton(o),
    k = new SkinnedMesh(aS(t), e.material || lS());
  ((k.name = "arm-mesh-" + t),
    (k.frustumCulled = !1),
    (k.castShadow = !1),
    (k.receiveShadow = !0),
    s.add(k),
    k.bind(U, new iS()));
  let C = {
    side: t,
    group: s,
    mesh: k,
    bones: o,
    skeleton: U,
    ik: T,
    pose: v,
    hand: f,
    bone: Object.fromEntries(T1_2.map((A, F) => [A, o[F]])),
    triCount: k.geometry.userData.triCount,
    setLayer(A) {
      return (s.traverse((F) => F.layers.set(A)), C);
    },
    setVisible(A) {
      return ((s.visible = !!A), C);
    },
    setFingers(A, F = 1) {
      return ((A = Za_2(A)), F >= 1 ? _(A) : tn_2(v, v, A, F), M(), C);
    },
    blendFingers(A, F, H) {
      return (tn_2(v, Za_2(A), Za_2(F), H), M(), C);
    },
    setFinger(A, F, H = 1) {
      typeof A == "string" && (A = Eh.indexOf(A));
      for (let N = 0; N < 4; N++) v[A * 4 + N] += (F[N] - v[A * 4 + N]) * H;
      return (M(), C);
    },
    setTrigger(A) {
      return ((A = A < 0 ? 0 : A > 1 ? 1 : A), A !== E && ((E = A), M()), C);
    },
    get trigger() {
      return E;
    },
    get shown() {
      return y;
    },
    solve(A, F, H, N = null, Z = null) {
      return L(A, F, H, N, Z && Z.lean ? Z.lean : 0, !0);
    },
    solveMatrix(A, F, H = null, N = null) {
      return (
        F.decompose(tS, ni_2, ED),
        L(A, tS, E5.copy(ni_2), H, N && N.lean ? N.lean : 0, !0)
      );
    },
    findPole(A, F, H, N = null) {
      let Z = Ih(A, new U0()),
        Q = Ih(F, new U0()),
        W = H.clone(),
        J = Q.clone().sub(Z).normalize(),
        G = Ih(N || S5[t], new U0());
      G.addScaledVector(J, -G.dot(J)).normalize();
      let te = new U0().crossVectors(J, G),
        oe = new U0(),
        ee = new U0(),
        le = 1e9;
      for (let xe = 0; xe < 24; xe++) {
        let j = (xe / 24) * 2 * ic;
        ee.copy(G).multiplyScalar(Math.cos(j)).addScaledVector(te, Math.sin(j));
        let O = L(Z, Q, W, ee, 0, !1),
          q = O.violation + 0.12 * (1 - Math.cos(j));
        q < le && ((le = q), oe.copy(ee));
      }
      return oe;
    },
    fitGrip(A, F = {}) {
      let H = A;
      if (F.space === "parent" || F.space === "world") {
        let Z = s.parent;
        (s.updateWorldMatrix(!0, !0),
          Dh.copy(f.matrixWorld).invert(),
          Z && F.space === "parent" && Dh.multiply(Z.matrixWorld),
          (H = Th(A, Dh)));
      }
      i < 0 && (H = Lh(H));
      let N = rS(H, F);
      return (F.apply !== !1 && (_(N), M()), N);
    },
    socket(A, F, H, N, Z) {
      return i > 0
        ? M5(A, F, H, N, Z)
        : (nS.set(-F.x, F.y, F.z),
          ni_2.set(H.x, -H.y, -H.z, H.w),
          M5(A, nS, ni_2, N, Z),
          (N.x = -N.x),
          (Z.y = -Z.y),
          (Z.z = -Z.z),
          N);
    },
    gripFrame(A, F, H) {
      let N = nn[A].frame;
      return (
        F.copy(N.p),
        H.copy(N.q),
        i < 0 && ((F.x = -F.x), (H.y = -H.y), (H.z = -H.z)),
        F
      );
    },
    penetration(A, F) {
      return Kl(y, i < 0 ? Lh(A) : A, F);
    },
    selfPenetration(A) {
      return cy(y, Fr, A);
    },
    impulse(A = 1) {
      for (let F = 0; F < 5; F++) g[F] += A * (1.6 + 0.3 * F);
      ((I.vx += A * 0.5), (I.vy -= A * 0.35));
    },
    update(A) {
      if (!(A > 0)) return;
      A > 0.05 && (A = 0.05);
      let F = !1;
      for (let Z = 0; Z < 5; Z++)
        ((g[Z] += (-b[Z] * 900 - g[Z] * 34) * A),
          (b[Z] += g[Z] * A),
          Math.abs(b[Z]) > 2e-4 || Math.abs(g[Z]) > 0.02
            ? (F = !0)
            : ((b[Z] = 0), (g[Z] = 0)));
      (F && M(),
        (I.vx += (-I.x * 260 - I.vx * 18) * A - S.y * 9),
        (I.vy += (-I.y * 260 - I.vy * 18) * A + S.x * 9 * i),
        S.set(0, 0, 0),
        (I.x += I.vx * A),
        (I.y += I.vy * A));
      let H = Math.max(-0.06, Math.min(0.06, I.x)),
        N = Math.max(-0.06, Math.min(0.06, I.y));
      Math.abs(H) > 1e-5 || Math.abs(N) > 1e-5
        ? (bs.set(H * 0.5, N * 0.5, 0, 1).normalize(),
          c.quaternion.copy(R).multiply(bs))
        : c.quaternion.copy(R);
    },
    dispose() {
      (s.parent && s.parent.remove(s), U.dispose());
    },
  };
  return (e.layer != null && C.setLayer(e.layer), C);
}

async function TD(n) {
  let e = Fh(n, { side: "right" }),
    t = Fh(n, { side: "left" }),
    i = new Group();
  ((i.name = "hands-studio"), n.scene.add(i));
  let s = {
      view: "back",
      pose: ["relaxed", "relaxed"],
      poseSet: !1,
      blend: null,
      trig: 0,
      grip: null,
      held: "rifle",
      gun: null,
      t: 0,
    },
    o = {
      rifle: [0.118, -0.122, -0.275, 0.034, 0.085, -0.03],
      pistol: [0.135, -0.078, -0.5, 0.06, 0.12, -0.07],
    },
    r = { p: new U0(), q: new la_2() },
    a = new U0(0, -0.055, 0.085),
    l = new U0(0, -0.04, -0.256),
    c = new U0(0, -0.012, 0.045),
    u = new U0(),
    f = new la_2(),
    h = new U0(),
    p = new la_2(),
    d = [0, 1.68, 4],
    m = {
      back: [[0.2, 1.34, 0.78], [0, 1.25, 0], 26, 0],
      palm: [[0.2, 1.34, 0.78], [0, 1.25, 0], 26, ic],
      side: [[0.74, 1.3, 0.34], [0, 1.24, 0], 26, 0],
      arm: [[0.62, 1.02, 0.62], [0.06, 0.98, 0], 30, 0],
    },
    x = typeof window < "u" ? window.__setShot : null;
  function v() {
    let M = s.view === "fp";
    for (let _ of [e, t])
      ((M ? n.camera : i).add(_.group),
        _.setLayer(M ? zc : vf),
        _.group.position.set(0, 0, 0),
        _.group.quaternion.identity());
    if (!M) {
      let _ = m[s.view] || m.back;
      (i.position.set(0, 1.16, 0),
        i.rotation.set(ic / 2, 0, 0),
        i.rotateZ(_[3]));
      for (let T of [e, t]) {
        let w = T === e ? 1 : -1;
        T.bone.upperArm.position.set(0.125 * w, 0, nl + Lu);
        for (let S of [
          "upperArm",
          "forearm",
          "forearmTwist1",
          "forearmTwist2",
          "hand",
        ])
          T.bone[S].quaternion.identity();
      }
    }
  }
  function y() {
    let M = s.view === "fp";
    if (s.blend) {
      let _ =
        s.blend[2] != null ? +s.blend[2] : 0.5 - 0.5 * Math.cos(s.t * 1.6);
      (e.blendFingers(s.blend[0], s.blend[1], _),
        t.blendFingers(s.blend[0], s.blend[1], _));
    } else
      s.poseSet
        ? (e.setFingers(s.pose[0]), t.setFingers(s.pose[1]))
        : s.grip
          ? (e.setFingers("foregrip"), t.setFingers("foregrip"))
          : M && s.held === "pistol"
            ? (e.setFingers(s.trig ? "trigger" : "pistol_grip"),
              t.setFingers("pistol_support"))
            : M
              ? (e.setFingers(s.trig ? "trigger" : "rifle_grip"),
                t.setFingers("foregrip"))
              : (e.setFingers(s.pose[0]), t.setFingers(s.pose[1]));
    if (
      (e.setTrigger(
        s.trig === "anim" ? 0.5 - 0.5 * Math.cos(s.t * 4) : +s.trig || 0,
      ),
      !!M)
    )
      if (s.grip)
        for (let _ of [e, t]) {
          let T = _ === e ? 1 : -1;
          (h.set(s.grip[0] + 0.11 * T, s.grip[1], s.grip[2]),
            p.setFromRotationMatrix(
              Dh.makeBasis(
                zh.set(0, 0.86 * T, -0.5 * T).normalize(),
                N1_2.set(-T, 0, 0),
                Fu.set(0, 0.5, 0.86).normalize(),
              ),
            ),
            _.socket("foregrip", h, p, u, f),
            _.solve(er[_.side], u, f, null, { lean: 0.15 }));
        }
      else {
        let _ = s.gun || o[s.held] || o.rifle,
          T = s.held === "pistol";
        (r.p.set(_[0], _[1], _[2]),
          r.q.setFromEuler(SD.set(_[3] || 0, _[4] || 0, _[5] || 0, "YXZ")),
          h
            .copy(T ? c : a)
            .applyQuaternion(r.q)
            .add(r.p),
          e.socket(T ? "pistol_grip" : "rifle_grip", h, r.q, u, f),
          e.solve(er.right, u, f, null, { lean: 0.2 }),
          T || h.copy(l).applyQuaternion(r.q).add(r.p),
          t.socket(T ? "pistol_support" : "foregrip", h, r.q, u, f),
          t.solve(er.left, u, f, null, { lean: 0.2 }));
      }
  }
  function b(M, _) {
    if ((M.hview && (s.view = M.hview), M.hpose != null)) {
      let w = String(M.hpose).split(",");
      ((s.pose = [
        di_2[w[0]] ? w[0] : "relaxed",
        di_2[w[1] || w[0]] ? w[1] || w[0] : "relaxed",
      ]),
        (s.poseSet = M.hpose !== ""),
        (s.blend = null));
    }
    if (M.hblend != null) {
      let w = String(M.hblend).split(",");
      s.blend = di_2[w[0]] && di_2[w[1]] ? w : null;
    }
    (M.htrig != null && (s.trig = M.htrig === "anim" ? "anim" : +M.htrig),
      M.hgrip != null &&
        (s.grip =
          M.hgrip === "" ? null : String(M.hgrip).split(",").map(Number)),
      M.hheld != null && (s.held = M.hheld === "pistol" ? "pistol" : "rifle"),
      M.hgun != null &&
        (s.gun = M.hgun === "" ? null : String(M.hgun).split(",").map(Number)),
      M.hwet != null && (kh.value = +M.hwet),
      v(),
      y());
    for (let w of [e, t])
      console.log(
        `[hands] ${w.side}: view ${s.view}, ${w.triCount} tris` +
          (s.view === "fp"
            ? `, reach ${w.ik.reach.toFixed(3)} flex ${w.ik.wristFlex.toFixed(2)} dev ${w.ik.wristDeviation.toFixed(2)} twist ${w.ik.twist.toFixed(2)} violation ${w.ik.violation.toFixed(2)}`
            : ""),
      );
    let T = {};
    if (!M.cam)
      if (s.view === "fp")
        ((T.cam = [...d, d[0] + 0.28, d[1] - 0.01, d[2] + 1].join(",")),
          M.fov || (T.fov = 74));
      else {
        let w = m[s.view] || m.back;
        ((T.cam = [...w[0], ...w[1]].join(",")), M.fov || (T.fov = w[2]));
      }
    return (!_ && x && x(T), T);
  }
  typeof window < "u" &&
    ((window.__setShot = (M) => {
      (M &&
        (M.hview ||
          M.hpose != null ||
          M.hblend != null ||
          M.htrig != null ||
          M.hgrip != null ||
          M.hheld != null ||
          M.hgun != null ||
          M.hwet != null) &&
        b(M, !1),
        x && x(M));
    }),
    (window.__hands = { R: e, L: t, st: s, apply: (M) => b(M, !1) }));
  let g = b(n.params || {}, !0),
    E = g.cam ? g.cam.split(",").map(Number) : [0.2, 1.34, 0.78, 0, 1.25, 0];
  return (
    g.fov &&
      !(n.params && n.params.fov) &&
      ((n.camera.fov = g.fov), n.camera.updateProjectionMatrix()),
    {
      cam: E.slice(0, 3),
      target: E.slice(3, 6),
      R: e,
      L: t,
      state: s,
      update(M) {
        ((s.t += M),
          (s.trig === "anim" || (s.blend && s.blend[2] == null)) && y(),
          e.update(M),
          t.update(M));
      },
    }
  );
}

var W0 = Vector3;

var Ur_2 = Quaternion;

var Nu = Matrix4;

var Nh = new W0(1, 1, 1);

var cS = (n) => (
  (n = n < 0 ? 0 : n > 1 ? 1 : n),
  n * n * n * (n * (6 * n - 15) + 10)
);

function fS(n, e) {
  let t = new W0(n[0], n[1], n[2]).normalize().negate(),
    i = new W0(e[0], e[1], e[2]);
  return (
    i.addScaledVector(t, -i.dot(t)).normalize(),
    new Ur_2().setFromRotationMatrix(
      new Nu().makeBasis(new W0().crossVectors(i, t), i, t),
    )
  );
}

function hS(n, e, t, i) {
  return new W0(n === "left" ? -i[0] : i[0], i[1], i[2])
    .applyQuaternion(e)
    .negate()
    .add(new W0(t[0], t[1], t[2]));
}

function il(n, e, t, i = new Ur_2()) {
  let s = typeof e == "string" ? nn[e].frame : e,
    o = new W0(),
    r = new Ur_2(),
    a = n === "left",
    l = a ? new W0(-t.x, t.y, t.z) : t,
    c = a ? new Ur_2(i.x, -i.y, -i.z, i.w) : i;
  return (
    r.copy(c).multiply(new Ur_2().copy(s.q).invert()),
    o.copy(s.p).negate().applyQuaternion(r).add(l),
    a && ((o.x = -o.x), (r.y = -r.y), (r.z = -r.z)),
    { p: o, q: r }
  );
}

function AD(n) {
  let e = -1e9,
    t = new W0(),
    i = new Ur_2(),
    s = (o, r, a) => {
      let l = -Fr(o, r, a);
      l > e && (e = l);
    };
  for (let o of n)
    if (o.type === "capsule") {
      let r = new W0(...o.a),
        a = new W0(...o.b),
        l = a.clone().sub(r),
        c = l.length() || 1e-9;
      l.multiplyScalar(1 / c);
      let u = new W0(1, 0, 0);
      (Math.abs(l.x) > 0.9 && u.set(0, 1, 0),
        u.addScaledVector(l, -u.dot(l)).normalize());
      let f = new W0().crossVectors(l, u);
      for (let h = 0; h <= 8; h++)
        for (let p = 0; p < 12; p++) {
          let d = (p / 12) * Math.PI * 2;
          (t
            .copy(r)
            .addScaledVector(l, (c * h) / 8)
            .addScaledVector(u, Math.cos(d) * o.r)
            .addScaledVector(f, Math.sin(d) * o.r),
            s(t.x, t.y, t.z));
        }
    } else {
      i.set(o.q[0], o.q[1], o.q[2], o.q[3]);
      let r = o.h,
        a = 6;
      for (let l = 0; l < 6; l++) {
        let c = l >> 1,
          u = l & 1 ? 1 : -1,
          f = (c + 1) % 3,
          h = (c + 2) % 3;
        for (let p = 0; p <= a; p++)
          for (let d = 0; d <= a; d++) {
            let m = [0, 0, 0];
            ((m[c] = u * r[c]),
              (m[f] = ((p / a) * 2 - 1) * Math.max(0, r[f] - o.r)),
              (m[h] = ((d / a) * 2 - 1) * Math.max(0, r[h] - o.r)),
              t.set(m[0], m[1], m[2]).applyQuaternion(i),
              s(t.x + o.c[0], t.y + o.c[1], t.z + o.c[2]));
          }
      }
    }
  return e;
}

function ca_2(n, e, t, i, s, o = {}) {
  let r = new Nu().compose(t, i, Nh).invert(),
    a = Th(s, r);
  e === "left" && (a = Lh(a));
  let l = Jl(a, { palm: Fr, ...o });
  return {
    name: n,
    side: e,
    p: t.clone(),
    q: i.clone(),
    pose: l,
    shapes: a,
    depth: Kl(l, a).depth,
    palm: () => AD(a),
  };
}

function dS(n, e, t, i = null) {
  let s = n.shapes;
  if (i) {
    let r = new Nu().compose(n.p, n.q, Nh).invert(),
      a = Th(i, r);
    (n.side === "left" && (a = Lh(a)), (s = s.concat(a)));
  }
  let o = Jl(s, { palm: Fr, ...t });
  return { ...n, name: e, pose: o, shapes: s, depth: Kl(o, s).depth };
}

function Uu(n, e, t, i, s = null, o = {}) {
  s = s || n.pose;
  let r = new W0(i[0], i[1], i[2]).applyMatrix4(
    new Nu().compose(n.p, n.q, Nh).invert(),
  );
  n.side === "left" && (r.x = -r.x);
  let a = Float32Array.from(s);
  if (o.start) for (let c = 0; c < 4; c++) a[t * 4 + c] = o.start[c];
  let l = FE(a, t, [r.x, r.y, r.z], o);
  return { ...n, name: e, pose: a, depth: Kl(a, n.shapes).depth, miss: l };
}

var T5 = tr();

function pS(n, e, t = n.pose, i = 0.5) {
  Sh(t, e, T5);
  let s = t0_2[e],
    o = e * 4,
    r = new W0().copy(T5.j[o + 2]).lerp(T5.j[o + 3], i);
  return (
    r.addScaledVector(
      new W0(0, -1, 0).applyQuaternion(T5.q[e * 3 + 2]),
      s.rad[2] + (s.rad[3] - s.rad[2]) * i,
    ),
    n.side === "left" && (r.x = -r.x),
    r.applyMatrix4(new Nu().compose(n.p, n.q, Nh))
  );
}

var Dy = tr();

var U1_2 = new W0();

var uS = new W0();

function RD(n, e, t, i, s, o, r, a) {
  Sh(n, e, Dy);
  let l = t0_2[e],
    c = Dy.j,
    u = e * 4,
    f = -1e9;
  for (let p = e === 0 ? 1 : 0; p < 3; p++) {
    let d = c[u + p],
      m = c[u + p + 1],
      x = p === 2 ? l.rad[3] / l.len[2] : 0;
    for (let v = 0; v < 6; v++) {
      let y = e === 0 && p === 1 ? a + ((1 - a) * v) / 5 : v / 5,
        b = y * (1 - x),
        g =
          l.rad[p] +
          (l.rad[p + 1] - l.rad[p]) * y -
          h5(
            t,
            d.x + (m.x - d.x) * b,
            d.y + (m.y - d.y) * b,
            d.z + (m.z - d.z) * b,
          );
      g > f && (f = g);
    }
  }
  (U1_2.copy(c[u + 2]).lerp(c[u + 3], 0.55),
    uS.set(0, -1, 0).applyQuaternion(Dy.q[e * 3 + 2]),
    U1_2.addScaledVector(uS, l.rad[2] + (l.rad[3] - l.rad[2]) * 0.55));
  let h = Math.hypot(U1_2.x - i, U1_2.y - s, U1_2.z - o);
  return { cost: h + 6 * Math.max(0, f + r), miss: h, deep: f };
}

function R5(n, e, t, i, s = {}) {
  let o = new W0(i[0], i[1], i[2]).applyMatrix4(
    new Nu().compose(n.p, n.q, Nh).invert(),
  );
  n.side === "left" && (o.x = -o.x);
  let r = Float32Array.from(s.base || n.pose),
    a = t * 4,
    l = s.skin ?? 8e-4,
    c = [0, 0, 0, 0],
    u = [0, 0, 0, 0],
    f = [0, 0, 0, 0],
    h = [7, 6, 4, 5];
  for (let x = 0; x < 4; x++) ((c[x] = xs.min[a + x]), (u[x] = xs.max[a + x]));
  let p = 1e9,
    d = 0,
    m = 0;
  for (let x = 0; x < 3; x++) {
    let v = [0, 0, 0, 0];
    for (v[0] = 0; v[0] < h[0]; v[0]++)
      for (v[1] = 0; v[1] < h[1]; v[1]++)
        for (v[2] = 0; v[2] < h[2]; v[2]++)
          for (v[3] = 0; v[3] < h[3]; v[3]++) {
            for (let b = 0; b < 4; b++)
              r[a + b] =
                c[b] + (u[b] - c[b]) * (h[b] > 1 ? v[b] / (h[b] - 1) : 0.5);
            let y = RD(r, t, n.shapes, o.x, o.y, o.z, l, s.root ?? 0.35);
            if (y.cost < p) {
              ((p = y.cost), (d = y.miss), (m = y.deep));
              for (let b = 0; b < 4; b++) f[b] = r[a + b];
            }
          }
    for (let y = 0; y < 4; y++) {
      let b = (u[y] - c[y]) / (h[y] - 1);
      ((c[y] = Math.max(xs.min[a + y], f[y] - b)),
        (u[y] = Math.min(xs.max[a + y], f[y] + b)));
    }
  }
  for (let x = 0; x < 4; x++) r[a + x] = f[x];
  return {
    ...n,
    name: e,
    pose: r,
    depth: Kl(r, n.shapes).depth,
    miss: d,
    deep: m,
  };
}

function mS(n, e = n.pose, t = [1, 2, 3, 4]) {
  let i = ra_2(e, tr()),
    s = new Nu().compose(n.p, n.q, Nh),
    o = n.side === "left" ? -1 : 1,
    r = [],
    a = (l) => new W0(l.x * o, l.y, l.z).applyMatrix4(s).toArray();
  for (let l of t)
    for (let c = 0; c < 3; c++) {
      let u = t0_2[l],
        f = i.j[l * 4 + c],
        h = i.j[l * 4 + c + 1],
        p = c === 2 ? h.clone().lerp(f, u.rad[3] / u.len[2]) : h;
      r.push(vs(a(f), a(p), (u.rad[c] + u.rad[c + 1]) / 2));
    }
  return r;
}

function gi_2(n, e, t) {
  let i = n.attributes.position.array,
    s = [1e9, 1e9, 1e9],
    o = [-1e9, -1e9, -1e9],
    r = 0;
  for (let a = 0; a < i.length; a += 3) {
    let l = i[a],
      c = i[a + 1],
      u = i[a + 2];
    l < e[0] ||
      l > t[0] ||
      c < e[1] ||
      c > t[1] ||
      u < e[2] ||
      u > t[2] ||
      (r++,
      l < s[0] && (s[0] = l),
      l > o[0] && (o[0] = l),
      c < s[1] && (s[1] = c),
      c > o[1] && (o[1] = c),
      u < s[2] && (s[2] = u),
      u > o[2] && (o[2] = u));
  }
  return { min: s, max: o, n: r };
}

function Bu(n, e, t, i = 0.01) {
  let s = [];
  for (let o = t[1]; o > e[1] + 1e-9; o -= i) {
    let r = gi_2(n, [e[0], Math.max(e[1], o - i), e[2]], [t[0], o, t[2]]);
    r.n &&
      s.push({
        y: o - i / 2,
        x0: r.min[0],
        x1: r.max[0],
        z0: r.min[2],
        z1: r.max[2],
        n: r.n,
      });
  }
  return s;
}

function gS(n) {
  let e = Math.max(...n.map((l) => l.z1 - l.z0)),
    t = n.filter((l) => l.z1 - l.z0 > 0.75 * e),
    i = (l) => {
      let c = 0,
        u = 0,
        f = 0,
        h = 0;
      for (let m of t)
        ((c += m.y), (u += m[l]), (f += m.y * m.y), (h += m.y * m[l]));
      let p = t.length,
        d = p > 1 ? (p * h - c * u) / (p * f - c * c) : 0;
      return [(u - d * c) / p, d];
    },
    s = i("z0"),
    o = i("z1"),
    r = (l) => s[0] + s[1] * l,
    a = (l) => o[0] + o[1] * l;
  return {
    rake: Math.atan(-(s[1] + o[1]) / 2),
    hw: Math.max(...t.map((l) => Math.max(-l.x0, l.x1))),
    top: Math.max(...n.map((l) => l.y)),
    bottom: Math.min(...n.map((l) => l.y)),
    front: r,
    back: a,
    centre: (l) => (r(l) + a(l)) / 2,
    depth: (l) => a(l) - r(l),
  };
}

var xS = {
  shoulder: {
    right: [er.right[0], er.right[1], er.right[2]],
    left: [er.left[0], er.left[1], er.left[2]],
  },
  lean: 0.2,
};

var A5 = (n) => ({
  p: new W0(),
  q: new Ur_2(),
  pose: new Float32Array(Un),
  trig: 0,
  pole: new W0().fromArray(S5[n]),
  sh: new W0().fromArray(xS.shoulder[n]),
});

function vS(n, e = 1) {
  let t = Fh(n, { side: "right" }),
    i = Fh(n, { side: "left" }),
    s = [t, i];
  for (let S of s) (S.setLayer(e), n.camera && n.camera.add(S.group));
  let o = { r: A5("right"), l: A5("left") },
    r = [o.r, o.l];
  (o.r.pose.set(di_2.relaxed), o.l.pose.set(di_2.relaxed));
  let a = s.map((S, R) => ({
      last: A5(S.side),
      from: A5(S.side),
      fromL: { p: new W0(), q: new Ur_2() },
      v: new W0(),
      w: new W0(),
      side: R ? -1 : 1,
    })),
    l = new W0(),
    c = new Ur_2(),
    u = new W0(),
    f = new Float32Array(Un),
    h = { lean: xS.lean },
    p = new Ur_2(),
    d = new Ur_2(),
    m = new W0(),
    x = new W0(),
    v = new W0(),
    y = 1,
    b = 0,
    g = !0,
    E = -1,
    M = null,
    _ = !1,
    T = !1;
  return {
    right: t,
    left: i,
    list: s,
    targets: o,
    state: a,
    get dropping() {
      return E >= 0;
    },
    setVisible(S) {
      if (((g = !!S), E < 0)) for (let R of s) R.group.visible = g;
    },
    blend(S = 0.2) {
      if (_) {
        for (let R of a)
          (R.from.p.copy(R.last.p),
            R.from.q.copy(R.last.q),
            R.from.pose.set(R.last.pose),
            R.from.pole.copy(R.last.pole),
            R.from.sh.copy(R.last.sh));
        ((y = 0), (b = S), (T = !0));
      }
    },
    snap() {
      ((y = 1), (b = 0), (T = !1));
    },
    attach(S, R = null, z = 0) {
      M = S ? { root: S } : null;
      for (let I of s) ((S || n.camera).add(I.group), I.setLayer(S ? z : e));
      (S &&
        (p.setFromEuler(new Euler(R.r[0], R.r[1], R.r[2], "YXZ")),
        d.copy(p).invert(),
        m.fromArray(R.p),
        (M.qi = d.clone()),
        (M.p = m.clone())),
        (y = 1));
    },
    update(S, R, z) {
      if (E >= 0 || !R || !R.armTargets) return;
      R.armTargets(o, S);
      let I = y < 1 && b > 0 ? cS((y += S / b)) : 1;
      if ((I >= 1 && (y = 1), T)) {
        ((T = !1), d.copy(z.quaternion).invert());
        for (let L of a)
          (L.fromL.p.copy(L.from.p).sub(z.position).applyQuaternion(d),
            L.fromL.q.copy(d).multiply(L.from.q));
      }
      if (I < 1)
        for (let L of a)
          (L.from.p
            .copy(L.fromL.p)
            .applyQuaternion(z.quaternion)
            .add(z.position),
            L.from.q.copy(z.quaternion).multiply(L.fromL.q));
      for (let L = 0; L < 2; L++) {
        let U = r[L],
          k = a[L],
          C = s[L],
          A = U.pose;
        (M
          ? (l.copy(U.p),
            c.copy(U.q),
            u.copy(U.pole).applyQuaternion(M.qi),
            x.copy(U.sh).sub(M.p).applyQuaternion(M.qi))
          : (l.copy(U.p).applyQuaternion(z.quaternion).add(z.position),
            c.copy(z.quaternion).multiply(U.q),
            u.copy(U.pole),
            x.copy(U.sh)),
          I < 1 &&
            (l.lerpVectors(k.from.p, l, I),
            c.slerpQuaternions(k.from.q, c, I),
            u.lerpVectors(k.from.pole, u, I),
            x.lerpVectors(k.from.sh, x, I),
            (A = tn_2(f, k.from.pose, U.pose, I))),
          k.last.p.copy(l),
          k.last.q.copy(c),
          k.last.pose.set(A),
          k.last.pole.copy(u),
          k.last.sh.copy(x),
          C.setFingers(A),
          C.setTrigger(U.trig),
          C.solve(x, l, c, u, h),
          C.update(S));
      }
      _ = !0;
    },
    startDrop(S = Math.random) {
      if (_) {
        ((E = 0), (y = 1));
        for (let R of a)
          (R.from.p.copy(R.last.p),
            R.from.q.copy(R.last.q),
            R.from.pose.set(R.last.pose),
            R.v.set(R.side * (0.1 + S() * 0.08), -0.05, 0.1),
            R.w.set(
              -1.5 - S() * 0.5,
              R.side * 0.5,
              R.side * (0.7 + S() * 0.4),
            ));
      }
    },
    dropUpdate(S) {
      if (E < 0) return;
      E += S;
      let R = cS(E / 0.15);
      for (let z = 0; z < 2; z++) {
        let I = a[z],
          L = s[z];
        if (!L.group.visible) continue;
        ((I.v.y -= 2.2 * S), I.from.p.addScaledVector(I.v, S));
        let U = I.w.length() * S;
        (U > 0 &&
          (c.setFromAxisAngle(v.copy(I.w).normalize(), U),
          I.from.q.multiply(c)),
          L.setFingers(tn_2(f, I.from.pose, di_2.relaxed, R)),
          L.setTrigger(0),
          L.solve(I.last.sh, I.from.p, I.from.q, I.last.pole, h),
          L.update(S),
          I.last.p.copy(I.from.p),
          I.last.q.copy(I.from.q),
          (E > 0.9 || I.from.p.y < -0.6) && (L.group.visible = !1));
      }
    },
    restore() {
      if (!(E < 0)) {
        ((E = -1), (y = 1), (_ = !1));
        for (let S of s) S.group.visible = g;
      }
    },
    report() {
      return s.map((S) => ({
        side: S.side,
        reach: S.ik.reach,
        violation: S.ik.violation,
        lean: S.ik.lean,
        flex: S.ik.wristFlex,
        deviation: S.ik.wristDeviation,
        twist: S.ik.twist,
      }));
    },
    dispose() {
      for (let S of s) S.dispose();
    },
  };
}

var Pn_2 = Vector3;

var Fo = Quaternion;

var C5 = 0.076;

var yS = 0;

var bS = (n, e) => ({
  p: n.p.map((t, i) => t - e.p[i]),
  r: n.r.map((t, i) => t - e.r[i]),
});

var Ly = (n, e, t, i, s, o, r) => ({
  name: n,
  HIP: e,
  ADS: { p: [0, -wn_2.sightY, t], r: [0, 0, 0] },
  SPRINT: bS(i, e),
  SPRINT_ARC: s,
  RELOAD: bS(o, e),
  RACK: r,
});

var Fy_2 = { p: [0, 0, 0], r: [-0.16, 0, 0.62] };

var Ny_2 = [0.494, 0.305, -0.83];

var Uy_2 = [
  Ly(
    "close",
    { p: [0.1, -0.109, -0.219], r: [-0.045, 0.035, 0.09] },
    -0.1065,
    { p: [0.07, -0.205, -0.27], r: [0.25, 0.8, 0.32] },
    { p: [-0.01, -0.022, 0.02], r: [-0.06, 0.02, 0.07] },
    { p: [0.088, -0.022, -0.295], r: Ny_2 },
    Fy_2,
  ),
  Ly(
    "threequarter",
    { p: [0.143, -0.173, -0.397], r: [0.065, 0.14, 0.04] },
    -0.1115,
    { p: [0.07, -0.16, -0.3], r: [-0.2, 0.85, 0.35] },
    { p: [-0.008, -0.02, 0.03], r: [0.05, 0.02, 0.06] },
    { p: [0.09, -0.035, -0.34], r: Ny_2 },
    Fy_2,
  ),
  Ly(
    "compact",
    { p: [0.165, -0.172, -0.345], r: [0.045, 0.075, 0.03] },
    -0.1115,
    { p: [0.13, -0.185, -0.3], r: [-0.28, 0.55, 0.15] },
    { p: [-0.006, -0.016, 0.02], r: [0.04, 0.02, 0.05] },
    { p: [0.1, -0.04, -0.31], r: Ny_2 },
    Fy_2,
  ),
];

var B1_2 = (n, e, t) => (n < e || n >= t ? 0 : Yo((n - e) / (t - e)));

var Uh = (n) => new Fo().setFromAxisAngle(new Pn_2(1, 0, 0), n);

var By = (n) => new Fo().setFromAxisAngle(new Pn_2(0, 1, 0), n);

var CD = [1, 0, 0, 1];

var kD = [1.6, 1.1, 0.8, 1];

var PD = d0({ thumb: [1.35, 0.7, 0.6, 0.3], fingers: [1.6, 1.1, 0.7, 0] });

var MS = 0.0275;

var sc = {
  grip: {
    web: [-0.0335, -0.012, -0.045],
    tilt: 0.22,
    roll: -0.3,
    drop: 0.012,
    lift: 0.0025,
  },
  foreYaw: -0.8,
  foreTip: 0.08,
  foreDrop: 0.008,
  pinchAt: 0.15,
  pinchYaw: 0,
  cupYaw: 0,
  handle: { fingers: [0.85, 0.4, -0.34], back: [-0.36, 0.1, -1] },
  shR: [0.2, -0.18, 0.4],
  shL: [-0.17, -0.24, 0.05],
  poleR: [0.3, -0.95, 0],
  poleL: [-0.5, -0.85, 0],
  sprintShR: [0.19, -0.24, 0.1],
  sprintPoleR: [0.9, -0.4, 0],
};

function ID(n) {
  let e = wn_2.grip,
    t = wn_2.handguard,
    i = wn_2.handguardR,
    s = wn_2.magPos,
    o = wn_2.handlePos,
    r = {},
    a = gi_2(
      n.poly,
      [-0.02, e[1] - 0.065, e[2] - 0.045],
      [0.02, e[1] + 0.058, e[2] + 0.05],
    ),
    l = gS(
      Bu(
        n.poly,
        [-0.02, e[1] - 0.06, e[2] - 0.045],
        [0.02, e[1] + 0.03, e[2] + 0.05],
      ),
    ),
    c = l.rake,
    u = a.max[1],
    f = l.bottom - 0.005,
    h = (u + f) / 2,
    p = (u - f) / 2 / Math.cos(c),
    d = (l.depth(h) / 2) * Math.cos(c);
  r.gripDim = {
    rake: c,
    hw: l.hw,
    hl: p,
    hd: d + 8e-4,
    c: [0, h, l.centre(h) - 8e-4],
  };
  let m = mn_2(r.gripDim.c, [l.hw, p, r.gripDim.hd], Uh(-c), l.hw * 0.9),
    x = gi_2(
      n.ano,
      [-0.03, e[1] + 0.045, e[2] - 0.17],
      [0.03, e[1] + 0.125, e[2] + 0.028],
    ),
    v = -gi_2(n.ano, [-0.03, -0.018, e[2] - 0.12], [0, -0.008, e[2] - 0.02])
      .min[0],
    y = mn_2(
      [0, (x.min[1] + x.max[1]) / 2, (x.min[2] + x.max[2]) / 2],
      [v, (x.max[1] - x.min[1]) / 2, (x.max[2] - x.min[2]) / 2],
      null,
      0.003,
    ),
    b = mn_2(
      [0, s[1] - 0.0345, s[2]],
      [v + 0.001, 0.0345, 0.0355],
      null,
      0.003,
    ),
    g = mn_2([0, 0.002, x.max[2] + 0.09], [0.014, 0.016, 0.09], null, 0.01),
    E = gi_2(
      n.ano,
      [-0.009, e[1] - 0.004, e[2] - 0.115],
      [0.009, e[1] + 0.006, e[2] - 0.03],
    );
  r.tang = new Pn_2(0, E.min[1] + MS, l.back(E.min[1] + MS));
  let M = mn_2(
      [0, (E.min[1] + E.max[1]) / 2, (E.min[2] + E.max[2]) / 2],
      [
        (E.max[0] - E.min[0]) / 2,
        (E.max[1] - E.min[1]) / 2,
        (E.max[2] - E.min[2]) / 2,
      ],
      null,
      0.0018,
    ),
    _ = Bu(
      n.gun,
      [-0.0034, e[1] + 0.012, e[2] - 0.092],
      [0.0034, e[1] + 0.043, e[2] - 0.058],
      0.006,
    ),
    T = _[Math.floor(_.length / 2)];
  r.triggerAt = [0, T.y, T.z0];
  let w = vs(
    [-0.0031, T.y + 0.006, T.z0 + 0.0028],
    [0.0031, T.y - 0.01, T.z0 + 0.0028 - 0.003],
    0.003,
  );
  ((r.grip = [m, y, b, g, M]), (r.trigger = [w]));
  let S = Bu(
      n.poly,
      [-0.03, -i - 0.085, t[2] - 0.03],
      [0.03, -i + 0.002, t[2] + 0.03],
    ),
    R = S.slice(1),
    z = Math.min(...R.map((te) => te.z0)),
    I = Math.max(...R.map((te) => te.z1)),
    L = Math.max(...R.map((te) => te.x1)),
    U = gi_2(
      n.poly,
      [-0.03, -i - 0.085, t[2] - 0.03],
      [0.03, -i + 0.002, t[2] + 0.03],
    );
  ((r.foreTop = new Pn_2(0, U.max[1], (z + I) / 2)),
    (r.foreDim = { hw: L, hd: (I - z) / 2, len: U.max[1] - U.min[1] }),
    (r.fore = [
      mn_2(
        [0, (U.max[1] + U.min[1]) / 2, (z + I) / 2],
        [L, (U.max[1] - U.min[1]) / 2, (I - z) / 2],
        null,
        0.01,
      ),
      mn_2([t[0], t[1], t[2]], [i, i, 0.146], null, 0.008),
    ]));
  let k = Bu(n.mag, [-1, -1, -1], [1, 0, 1], 0.02),
    C = (te) => (te.z0 + te.z1) / 2,
    A = [];
  for (let te = 0; te < k.length - 1; te++) {
    let oe = k[te],
      ee = k[Math.min(k.length - 2, te + 1)],
      le = k[Math.max(0, te - 1)],
      xe = Math.atan2(C(le) - C(ee), le.y - ee.y || 1);
    A.push(
      mn_2(
        [0, oe.y, C(oe)],
        [Math.max(-oe.x0, oe.x1), 0.0125, ((oe.z1 - oe.z0) / 2) * Math.cos(xe)],
        Uh(xe),
        0.003,
      ),
    );
  }
  let F = gi_2(n.mag, [-1, -1, -1], [1, 1, 1]),
    H = gi_2(n.mag, [-1, F.min[1], -1], [1, F.min[1] + 0.012, 1]),
    N = k[k.length - 2],
    Z = k[k.length - 3],
    Q = Math.atan2(C(Z) - C(N), Z.y - N.y) * 1.25;
  ((r.magAxis = (te) => {
    let oe = 0;
    for (; oe < k.length - 2 && -k[oe + 1].y < te;) oe++;
    let ee = k[oe],
      le = k[oe + 1],
      xe = Math.min(1, Math.max(0, (-te - ee.y) / (le.y - ee.y)));
    return {
      z: C(ee) + (C(le) - C(ee)) * xe,
      tilt: Math.atan2(C(ee) - C(le), ee.y - le.y),
      hw: Math.max(-ee.x0, ee.x1),
      hd: (ee.z1 - ee.z0) / 2,
    };
  }),
    (r.magTilt = Q),
    (r.magLen = -F.min[1]));
  let W = k[k.length - 1],
    J = C(N) + (C(N) - C(Z)) * 0.9;
  ((r.plate = new Pn_2(0, (H.min[1] + W.y + 0.01) / 2 - 0.004, J)),
    A.push(
      mn_2(
        [0, r.plate.y + 0.0045 * Math.cos(Q), r.plate.z + 0.0045 * Math.sin(Q)],
        [F.max[0], 0.0045, 0.034],
        Uh(Q),
        0.003,
      ),
    ),
    (r.mag = A));
  let G = gi_2(n.bolt, [-1, -1, -1], [-v - 0.0015, 1, 1]);
  return (
    (r.knob = vs(
      [G.min[0] + 0.003, o[1], o[2]],
      [G.max[0], o[1], o[2]],
      (G.max[1] - G.min[1]) / 2,
    )),
    (r.knobTip = G.min[0]),
    (r.handle = [
      r.knob,
      y,
      mn_2([0, wn_2.railTop - 0.004, o[2]], [0.011, 0.006, 0.1], null, 0.002),
    ]),
    r
  );
}

var Hy_2 = null;

var _S = "";

function zD(n) {
  let e = JSON.stringify(sc);
  if (Hy_2 && e === _S) return Hy_2;
  let t = ID(n),
    i = sc,
    s = { shapes: t },
    o = new Fo();
  ((Hy_2 = s), (_S = e));
  let r = tc({
      ...i.grip,
      rake: t.gripDim.rake,
      len:
        (t.tang.y -
          (t.gripDim.c[1] - t.gripDim.hl * Math.cos(t.gripDim.rake))) /
        Math.cos(t.gripDim.rake),
      width: 2 * t.gripDim.hw,
      depth: 2 * t.gripDim.hd,
      round: 0.009,
      top: [0.012, 0.2, 0.005, 0.04],
      topW: 0.034,
      guard: [0.036, 0.1, -0.024],
      trigger: [0.084, -0.01],
    }),
    a = il("right", r.frame, t.tang, o);
  (a.p.add(new Pn_2(0, i.grip.lift, 0).applyQuaternion(a.q)),
    (s.grip = ca_2("grip", "right", a.p, a.q, t.grip, {
      from: d0({ thumb: CD }, nn.rifle_grip.fit.from),
      to: d0({ thumb: kD }, nn.rifle_grip.fit.to),
    })),
    (s.trigger = Uu(
      s.grip,
      "trigger",
      1,
      [t.triggerAt[0] + 0.002, t.triggerAt[1], t.triggerAt[2] - 0.0015],
      s.grip.pose,
      { start: [0.2, 1, 0.6, 0.1], at: 0.7 },
    )));
  let l = il(
    "left",
    "foregrip",
    t.foreTop.clone().add(new Pn_2(0, -i.foreDrop, 0)),
    By(i.foreYaw).multiply(Uh(i.foreTip)),
  );
  s.fore = ca_2("fore", "left", l.p, l.q, t.fore, nn.foregrip.fit);
  let c = t.magAxis(i.pinchAt),
    u = il(
      "left",
      "mag_pinch",
      new Pn_2(0, -i.pinchAt, c.z),
      Uh(c.tilt).multiply(By(i.pinchYaw)),
    );
  s.pinch = ca_2("pinch", "left", u.p, u.q, t.mag, nn.mag_pinch.fit);
  let f = il("left", "mag_cup", t.plate, Uh(t.magTilt).multiply(By(i.cupYaw)));
  (f.p.add(new Pn_2(0, 0.003, 0).applyQuaternion(f.q)),
    (s.carry = ca_2("carry", "left", f.p, f.q, t.mag, {
      from: nn.mag_cup.fit.from,
      to: PD,
    })),
    (s.cup = {
      ...s.carry,
      name: "cup",
      pose: tn_2(new Float32Array(Un), nn.mag_cup.fit.from, s.carry.pose, 0.72),
    }));
  let h = fS(i.handle.fingers, i.handle.back),
    p = d0({
      thumb: [0.9, 0.2, 0.3, 0.6],
      index: [0.45, 0.55, 0.33, 0],
      middle: [0.45, 0.55, 0.33, 0],
      ring: [1.2, 1.45, 0.9, 0],
      little: [1.25, 1.45, 0.85, -0.04],
    }),
    d = ra_2(p, tr()),
    m = d.j[6]
      .clone()
      .lerp(d.j[7], 0.5)
      .lerp(d.j[10].clone().lerp(d.j[11], 0.5), 0.5);
  m.y -= 0.009;
  let x = t.knobTip + 0.0035,
    v = t.knob.a[2] - t.knob.r - 5e-4,
    y = hS("left", h, [x, t.knob.a[1], v], m.toArray()),
    b = {
      name: "handle",
      side: "left",
      p: y,
      q: h,
      pose: p,
      shapes: ca_2("handle", "left", y, h, t.handle, { from: p, to: p }).shapes,
    };
  return (
    (s.handle = Uu(
      Uu(b, "handle", 1, [x, t.knob.a[1] + 0.0075, v], null, { at: 0.8 }),
      "handle",
      2,
      [x, t.knob.a[1] - 0.0075, v],
      null,
      { at: 0.8 },
    )),
    s
  );
}

function wS(n) {
  let { G: e, mats: t, mk: i, S: s, rng: o } = n,
    r = new Group();
  r.name = "viewmodel-pac9";
  let a = TE();
  r.add(
    i(a.ano, t.ano),
    i(a.gun, t.steel),
    i(a.poly, t.poly),
    i(a.plain, t.plain),
  );
  let l = i(a.bolt, t.steel);
  r.add(l);
  let c = new Group(),
    u = new Pn_2().fromArray(wn_2.magPos);
  c.position.copy(u);
  let f = i(a.round, t.brass);
  (c.add(i(a.mag, t.tan), f), r.add(c));
  let h = null;
  try {
    ((h = M1_2([
      ["model", -0.0168, -0.0315, 0.064, 0.0095, "L"],
      ["maker", -0.0168, -0.042, 0.064, 0.003, "L"],
      ["cal", -0.0168, -0.0465, 0.064, 0.0028, "L"],
      ["prop", -0.0168, -0.071, 0.066, 0.0026, "L"],
      ["auto", -0.0168, -0.027, -0.0335, 0.0036, "L"],
      ["semi", -0.0168, -0.0262, -0.049, 0.0036, "L"],
      ["safe", -0.0168, -0.0362, -0.062, 0.0036, "L"],
      ["rack", -0.0168, -0.004, -0.205, 0.02, "L"],
      ["warn", -0.0181, -0.01, 0.03, 0.0062, "L"],
      ["optic", -0.0195, 0.0735, 0.021, 0.0024, "L"],
      ["model", 0.0168, -0.0315, 0.068, 0.0095, "R"],
      ["warn", 0.0168, -0.066, 0.066, 0.0075, "R"],
      ["rack", 0.0168, -0.004, -0.205, 0.02, "R"],
      ["auto", 0.0168, -0.027, -0.0335, 0.0036, "R"],
      ["safe", 0.0168, -0.0362, -0.062, 0.0036, "R"],
      ["optic", 0.0195, 0.0735, 0.021, 0.0024, "R"],
      ["cal", 0.0181, 0.0245, -0.055, 0.0026, "R"],
      ["r2", 0, 0.04365, -0.0816, 0.003, "T"],
      ["r4", 0, 0.04365, -0.0616, 0.003, "T"],
      ["r6", 0, 0.04365, 0.0584, 0.003, "T"],
      ["r8", 0, 0.04365, 0.0784, 0.003, "T"],
      ["r10", 0, 0.04365, 0.0984, 0.003, "T"],
      ["r12", 0, 0.04365, 0.1184, 0.003, "T"],
    ])),
      (h.castShadow = !1),
      (h.receiveShadow = !0),
      (h.frustumCulled = !1),
      r.add(h));
  } catch (B) {
    console.warn("[weapon] markings skipped: " + B);
  }
  let p = ME(
    wn_2.window.map((B) => [
      B[0] * 1.01,
      (B[1] - wn_2.sightY) * 1.01 + wn_2.sightY,
    ]),
    wn_2.lensF + 0.0025,
  );
  ((p.frustumCulled = !1), r.add(p));
  let d = N_();
  (d.position.fromArray(wn_2.muzzle), (d.visible = !1), r.add(d));
  let m = zD(a),
    x = n.arms || null,
    v = new Matrix4(),
    y = new Pn_2(1, 1, 1),
    b = new Fo(),
    g = (B, X, re, Y, he) => {
      (he.copy(re).multiply(B.q), Y.copy(B.p).applyQuaternion(re).add(X));
    },
    E = { p: m.fore.p, q: m.fore.q },
    M = { p: new Pn_2(), q: new Fo() };
  g(m.pinch, u, b, M.p, M.q);
  let _ = {
      p: M.p.clone().add(new Pn_2(-0.045, -0.035, 0.015)),
      q: M.q.clone(),
    },
    T = { p: M.p.clone().add(new Pn_2(0, -(C5 + 0.006), 0)), q: M.q.clone() },
    w = i0(-0.5, 0, 0.25),
    S = {
      p: M.p.clone().add(new Pn_2(-0.06, -0.36, 0.13)),
      q: w.clone().multiply(M.q),
    },
    R = { p: new Pn_2(-0.05, -0.38, 0.14), q: w.clone() },
    z = { p: new Pn_2(-0.005, -(C5 + 0.014), 0.006), q: i0(-0.11, 0, 0.07) },
    I = { p: new Pn_2(0, -C5, 0), q: new Fo() },
    L = [
      [ft_2.rise, R],
      [ft_2.align, z],
      [ft_2.insert, I],
      [9, I],
    ],
    U = { p: new Pn_2(), q: new Fo() };
  g(m.carry, u.clone().add(R.p), R.q, U.p, U.q);
  let k = { p: new Pn_2(), q: new Fo() };
  g(m.carry, u, b, k.p, k.q);
  let C = { p: m.handle.p, q: m.handle.q },
    A = { p: new Pn_2(), q: new Fo() },
    F = { partial: !0 },
    H = [
      [0, E],
      [0.07, E],
      [0.27, _],
      [ft_2.atMag, M],
      [9, M],
    ],
    N = {
      tac: [
        [ft_2.tacRelease + 0.03, A],
        [ft_2.tac - 0.04, E],
        [9, E],
      ],
      empty: [
        [ft_2.release + 0.03, A],
        [ft_2.empty - 0.1, E],
        [9, E],
      ],
    },
    Z = tn_2(new Float32Array(Un), di_2.relaxed, di_2.open, 0.25),
    Q = tn_2(new Float32Array(Un), nn.mag_pinch.fit.from, m.pinch.pose, 0.25),
    W = new Pn_2(),
    J = new Fo(),
    G = new Fo(),
    te = new Pn_2(),
    oe = new Pn_2(),
    ee = new Fo(),
    le = new Matrix4().compose(m.pinch.p, m.pinch.q, y).invert(),
    xe = new Matrix4().compose(m.carry.p, m.carry.q, y).invert(),
    j = new Pn_2(),
    O = {
      p: new Pn_2().copy(E.p),
      q: new Fo().copy(E.q),
      pose: new Float32Array(Un),
      busy: !1,
    },
    q = (B, X, re, Y, he) =>
      he < 0.5 ? tn_2(B, X, re, Yo(he * 2)) : tn_2(B, re, Y, Yo(he * 2 - 1)),
    ue = (B) => {
      (v.compose(W, J, y).multiply(B),
        v.decompose(c.position, c.quaternion, j));
    },
    de = 9,
    $ = !1,
    se = 0,
    fe = 1,
    me = 0;
  function ge() {
    ((O.busy = !1),
      O.p.copy(E.p),
      O.q.copy(E.q),
      O.pose.set(m.fore.pose),
      (c.visible = !0),
      c.position.copy(u),
      c.quaternion.identity(),
      (se = 0));
  }
  ge();
  let ce =
      Object.values(a).reduce((B, X) => B + Tu(X), 0) +
      (h ? Tu(h.geometry) : 0) +
      2,
    P = 0;
  r.traverse((B) => {
    B.isMesh && P++;
  });
  let D = {
    id: "rifle",
    name: wn_2.name,
    root: r,
    flash: d,
    muzzle: wn_2.muzzle,
    eject: wn_2.eject,
    sight: [0, wn_2.sightY, -wn_2.lensF],
    info: { tris: Math.round(ce), meshes: P },
    slot: { id: "rifle", name: wn_2.name, ammo: 30, magSize: 30, reserve: 150 },
    def: {
      magSize: 30,
      reserve: 150,
      rpm: 720,
      damage: 26,
      range: 300,
      auto: !0,
      adsTime: 0.18,
      inspect: !0,
      flashLight: 45,
      flashScale: 1,
      smoke: !0,
      spread: {
        hip: 0.0125,
        ads: 0.0012,
        moveHip: 0.013,
        moveAds: 0.004,
        bloomHip: 0.0065,
        bloomAds: 0.0022,
        air: 0.022,
        crouch: 0.002,
        shot: 0.17,
        decay: 1.5,
      },
    },
    views: Uy_2,
    view: 0,
    get pose() {
      return Uy_2[D.view];
    },
    setView(B) {
      D.view = Math.max(0, Math.min(Uy_2.length - 1, B | 0));
    },
    motion: enemiesShowcaseModule.rifle,
    reloadTime: (B) => (B ? ft_2.empty : ft_2.tac),
    reset() {
      ((de = 9),
        ($ = !1),
        (f.visible = !0),
        ge(),
        (l.position.z = 0),
        (fe = 1),
        (me = 0));
    },
    cancelReload(B) {
      (ge(), B && ($ = !1), (f.visible = D.slot.ammo > 0));
    },
    shot(B) {
      ((de = 0),
        x && (x.right.impulse(0.55), x.left.impulse(0.35)),
        B && (($ = !0), (f.visible = !1)));
    },
    recoil(B, X, re) {
      let Y = B <= 9 ? 1 : 0.38,
        he =
          (B < 4
            ? (o() - 0.5) * 0.0022
            : Math.sin(B * 0.57 + s.recPhase) * 0.0042 + (o() - 0.5) * 0.002) *
          X;
      (re.addRecoil && re.addRecoil(0.0068 * Y * X * (0.85 + o() * 0.3), he),
        re.addShake && re.addShake(0.12 * X));
      let V = enemiesShowcaseModule.rifle.recoil,
        ne = s.adsE,
        Te =
          (B === 1 ? V.first : B === 2 ? 0.5 + 0.5 * V.first : 1) *
          (0.88 + o() * 0.24) *
          (re.crouching ? 0.88 : 1),
        Re = Te * lerp(1, V.adsRot, ne),
        Ue = Te * lerp(1, V.adsPos, ne);
      ((s.kZ.v += V.back * Te * lerp(1, V.adsBack, ne)),
        (s.kP.v += V.rise * Re),
        (s.kY.v += (o() - 0.5) * V.yaw * Re),
        (s.kR.v += (o() - 0.5) * V.roll * Re),
        (s.kU.v += V.up * Ue * (0.7 + 0.6 * o())),
        (s.kX.v += (o() - 0.5) * 2 * V.side * Ue));
    },
    reload(B, X) {
      let re = n.ev,
        Y = B.empty;
      (re(B, "magout", ft_2.magout) && (s.bump.v -= 0.25),
        X >= ft_2.swap && !B.f.fresh && ((B.f.fresh = 1), (f.visible = !0)),
        re(B, "maginsert", ft_2.insert) && ((s.bump.v += 0.1), (s.kR.v += 0.4)),
        re(B, "magin", ft_2.magin) &&
          ((s.bump.v += 0.8),
          (s.kR.v -= 0.55),
          Y || ($ = !1),
          x && x.left.impulse(1)),
        X >= ft_2.regrip + 0.025 &&
          !B.f.tug &&
          ((B.f.tug = 1), (s.bump.v -= 0.3)));
      let he = Y ? ft_2.back : ft_2.tacBack,
        V = Y ? ft_2.release : ft_2.tacRelease,
        ne = Y ? ft_2.bolt : ft_2.tacBolt,
        ye = Y ? 1 : ft_2.partial,
        Te = Y ? yS : 0;
      ((se =
        X < ft_2.atHandle
          ? Te
          : X < he
            ? Te + (ye - Te) * Yo(dn_2(X, ft_2.atHandle, he))
            : X < V
              ? ye
              : ye * Math.max(0, 1 - (X - V) / (ne - V))),
        re(B, "boltback", he, Y ? null : F) &&
          (($ = !1), (s.kZ.v += Y ? 0.55 : 0.3), (s.bump.v -= Y ? 0.12 : 0.06)),
        re(B, "bolt", ne) &&
          (($ = !1),
          (s.kZ.v -= Y ? 0.85 : 0.45),
          (s.kP.v -= Y ? 0.9 : 0.4),
          (s.bump.v -= Y ? 0.14 : 0.05),
          (se = 0)),
        (s.antYT =
          0.0045 * B1_2(X, ft_2.magout - 0.14, ft_2.magout) -
          0.002 * B1_2(X, ft_2.insert - 0.1, ft_2.insert) -
          0.006 * B1_2(X, ft_2.short, ft_2.magin)),
        (s.antRT =
          0.022 * B1_2(X, ft_2.magout - 0.14, ft_2.magout) +
          0.05 * B1_2(X, ft_2.atHandle - 0.04, V)));
      let Re = O.pose;
      if (((O.busy = !0), X < ft_2.magout))
        (createWeapon(H, X, W, J),
          q(Re, m.fore.pose, Z, Q, dn_2(X, 0.03, 0.3)),
          X > 0.3 &&
            tn_2(Re, Q, m.pinch.pose, Yo(dn_2(X, 0.3, ft_2.atMag + 0.02))),
          c.quaternion.identity(),
          c.position.copy(u));
      else if (X < ft_2.away) {
        let ze = ma(dn_2(X, ft_2.magout, ft_2.clear)),
          Ge = Yo(dn_2(X, ft_2.clear - 0.03, ft_2.away));
        (W.copy(M.p).lerp(T.p, ze).lerp(S.p, Ge),
          J.copy(M.q).slerp(S.q, Ge),
          Re.set(m.pinch.pose),
          ue(le));
      } else if (X < ft_2.rise) {
        let ze = Yo(dn_2(X, ft_2.away, ft_2.rise));
        (W.copy(S.p).lerp(U.p, ze),
          J.copy(S.q).slerp(U.q, ze),
          tn_2(Re, m.pinch.pose, m.carry.pose, ze),
          ue(X < ft_2.swap ? le : xe));
      } else {
        let ze = 0,
          Ge = 0,
          _e = 0;
        if (X < ft_2.insert) createWeapon(L, X, oe, ee);
        else {
          if ((oe.set(0, 0, 0), ee.identity(), X < ft_2.short))
            ze =
              ft_2.shortBy +
              (C5 - ft_2.shortBy) *
                Math.pow(1 - dn_2(X, ft_2.insert, ft_2.short), 2.2);
          else if (X < ft_2.windup)
            ((ze = ft_2.shortBy),
              (_e = Yo(dn_2(X, ft_2.short, ft_2.windup))),
              (Ge = ft_2.backOff * _e));
          else if (X < ft_2.magin) {
            let Ne = dn_2(X, ft_2.windup, ft_2.magin),
              ke = (ft_2.shortBy + ft_2.backOff) * (1 - Ne * Ne);
            ((ze = Math.min(ft_2.shortBy, ke)), (Ge = ke - ze), (_e = 1));
          } else
            X < ft_2.rebound
              ? ((Ge = ft_2.reboundBy * ma(dn_2(X, ft_2.magin, ft_2.rebound))),
                (_e = 1))
              : X < ft_2.regrip
                ? ((Ge =
                    ft_2.reboundBy *
                    (1 - Yo(dn_2(X, ft_2.rebound, ft_2.regrip)))),
                  (_e = 1 - Yo(dn_2(X, ft_2.rebound, ft_2.regrip))))
                : X < ft_2.tugDown
                  ? (Ge = ft_2.tugBy * Yo(dn_2(X, ft_2.regrip, ft_2.tugDown)))
                  : X < ft_2.tugUp &&
                    (Ge =
                      ft_2.tugBy * (1 - Yo(dn_2(X, ft_2.tugDown, ft_2.tugUp))));
          oe.y = -ze;
        }
        if ((c.quaternion.copy(ee), c.position.copy(u).add(oe), X < ft_2.tugUp))
          (g(m.carry, c.position, ee, W, J),
            (W.y -= Ge),
            tn_2(Re, m.carry.pose, m.cup.pose, _e));
        else if (X < ft_2.atHandle) {
          let Ne = dn_2(X, ft_2.tugUp, ft_2.atHandle),
            ke = Yo(Ne);
          (te.copy(C.p),
            (te.z += wn_2.boltTravel * Te),
            W.copy(k.p).lerp(te, ke),
            (W.x -= 0.03 * Math.sin(Math.PI * ke)),
            J.copy(k.q).slerp(C.q, ke),
            q(Re, m.carry.pose, Z, m.handle.pose, Ne));
        } else if (X < V + 0.03)
          (W.copy(C.p),
            (W.z += wn_2.boltTravel * (X < V ? se : ye)),
            J.copy(C.q),
            A.p.copy(W),
            A.q.copy(J),
            tn_2(Re, m.handle.pose, Z, 0.5 * Yo(dn_2(X, V, V + 0.03))));
        else {
          let Ne = Y ? N.empty : N.tac;
          createWeapon(Ne, X, W, J);
          let ke = dn_2(X, Ne[0][0], Ne[1][0]);
          ((W.y -= 0.035 * Math.sin(Math.PI * Yo(ke))),
            ke < 0.6
              ? tn_2(Re, m.handle.pose, Z, 0.5 + 0.5 * Yo(ke / 0.6))
              : tn_2(Re, Z, m.fore.pose, Yo((ke - 0.6) / 0.4)));
        }
      }
      (O.p.copy(W), O.q.copy(J));
      let Ue = Yo(X / 0.3),
        Ve = 1 - Yo((X - (B.T - 0.46)) / 0.4);
      ((s.reloadW = Math.min(Ue, Ve)),
        (s.rackW = Yo((X - (ft_2.magin + 0.08)) / 0.28) * Ve));
    },
    endReload() {
      ge();
    },
    parts(B, X) {
      de += B;
      let re = 0.072,
        Y = de < re ? Math.sin((Math.PI * de) / re) : 0;
      ($ && de > re * 0.5 && (Y = Math.max(Y, yS / 0.95)),
        (l.position.z = wn_2.boltTravel * Math.max(Y * 0.95, se)),
        (me = X));
    },
    armTargets(B, X) {
      let re = s.spV.x > 0.3 || s.reload || s.hol > 0.12 ? 0 : 1;
      ((fe += (re - fe) * (1 - Math.exp(-16 * X))),
        B.r.p.copy(m.grip.p),
        B.r.q.copy(m.grip.q),
        tn_2(B.r.pose, m.grip.pose, m.trigger.pose, Yo(fe)),
        (B.r.trig = me * fe));
      let Y = Math.min(1, Math.max(0, s.spV.x));
      (B.r.pole.fromArray(sc.poleR).lerp(te.fromArray(sc.sprintPoleR), Y),
        B.r.sh.fromArray(sc.shR).lerp(te.fromArray(sc.sprintShR), Y),
        B.l.p.copy(O.p),
        B.l.q.copy(O.q),
        B.l.pose.set(O.busy ? O.pose : m.fore.pose),
        (B.l.trig = 0),
        B.l.pole.fromArray(sc.poleL),
        B.l.sh.fromArray(sc.shL));
    },
    snapArms() {
      fe = s.spV.x > 0.3 || s.reload || s.hol > 0.12 ? 0 : 1;
    },
    setLocked(B) {
      (($ = !!B), (f.visible = !B));
    },
    get locked() {
      return $;
    },
    holds: m,
  };
  return D;
}

var Hu = 0.0128;

var sl = -0.012;

var Ki = 0.011;

var No_2 = 0.0165;

var ES = 0.0074;

var Oy = 0.0046;

var Vy_2 = 0.314;

var SS = [-0.309, -0.951];

var RS = 0.1185;

var G0 = {
  name: "PAC-4 Bosun",
  muzzle: [0, 0, -0.1075],
  eject: [0.017, 0.007, -0.01],
  sightY: No_2,
  rearF: -0.0705,
  frontF: 0.0885,
  slideTravel: 0.04,
  slideLock: 0.036,
  rake: Vy_2,
  magPos: [0, -0.013, 0.0387],
  magLen: RS,
  magAxis: [0, SS[1], -SS[0]],
  stopPivot: [0, -0.0165, -0.004],
  barrelPivot: [0, -0.01, 0],
  gripFront: [-0.0335, -0.06],
  gripBack: [-0.0925, -0.06],
};

var TS = (n, e, t, i, s = 12) => {
  let o = new CircleGeometry(n, s);
  return (o.translate(e, t, i), o);
};

function AS(n = 0, e = Hu) {
  let t = [
    [e - 8e-4, sl],
    [e, sl + 8e-4],
    [e, sl + 0.0022],
    [e - 55e-5, sl + 0.0027],
    [e - 55e-5, sl + 0.0041],
    [e, sl + 0.0046],
    [e - n, sl + 0.0056],
    [e - n, Oy - 0.001],
    [e, Oy],
    [ES + 7e-4, Ki - 8e-4],
    [ES, Ki],
  ];
  return t.concat(t.map((i) => [-i[0], i[1]]).reverse());
}

function CS() {
  let n = [1, 1, 1],
    e = [1, 1, 1],
    t = [2.6, 2.6, 2.7],
    i = [0.3, 0.3, 0.31],
    s = [1, 1, 1],
    o = [0.014, 0.014, 0.015],
    r = { wear: 1 },
    a = { wear: 0.9 },
    l = { bare: 0.45, wear: 1.2 },
    c = { wear: 0.8 },
    u = { wear: 0, ao: 0.75 },
    f = { wear: 0 },
    h = [],
    p = [],
    d = [],
    m = [],
    x = [],
    v = [],
    y = [],
    b = [],
    g = [],
    E = (H, N, Z, Q, W, J, G, te) => {
      let oe = Math.min(H * 0.25, (Z - N) * 0.25);
      return h0(
        [
          [0, N],
          [H - oe, N],
          [H, N + oe],
          [H, Z - oe],
          [H - oe, Z],
          [0, Z],
        ],
        G,
        J,
        { ...te, ox: Q, oy: W },
      );
    },
    M = 0.245,
    _ = 65e-5,
    T = AS(0),
    w = AS(_),
    S = (H, N) =>
      Math.abs(H) < Hu - 3e-4 && N > sl + 0.005 && N < Oy - 5e-4 ? 0.8 : 0,
    R = (H, N, Z, Q = 0.0032, W = 0.0015) => {
      for (let J = 0; J < Z; J++) {
        let G = N + J * Q;
        H.push(
          kn(T, G - W / 2 - 35e-5, { rake: -M }),
          kn(w, G - W / 2, { rake: -M }),
          kn(w, G + W / 2, { rake: -M }),
          kn(T, G + W / 2 + 35e-5, { rake: -M }),
        );
      }
    };
  {
    let H = [kn(T, -0.082, { sx: 0.945, sy: 0.94, cy: -5e-4 }), kn(T, -0.0811)];
    (R(H, -0.0735, 10),
      H.push(kn(T, -0.038), kn(T, -0.0118)),
      h.push(Eu(H, n, { ...r, crease: 38, aoFn: S })));
  }
  {
    let H = T.slice(0, 6),
      N = T.slice(11),
      Z = [
        ...H,
        [Hu, -0.0011],
        [Hu - 6e-4, -5e-4],
        [-0.0042, -5e-4],
        [-0.0042, Ki - 6e-4],
        [-0.0048, Ki],
        ...N.filter((Q) => Q[0] < -0.005),
      ];
    h.push(Nn(Z, -0.012, 0.03, 4e-4, n, { wear: 1, zone: 0.5, crease: 38 }));
  }
  {
    let H = [kn(T, 0.0298), kn(T, 0.056)];
    (R(H, 0.064, 6),
      H.push(
        kn(T, 0.088),
        kn(T, 0.0975),
        kn(T, 0.1018, { sx: 0.965, sy: 0.97, cy: 0.002 }),
        kn(T, 0.104, { sx: 0.9, sy: 0.92, cy: 0.002 }),
      ),
      h.push(Eu(H, n, { ...r, crease: 38, aoFn: S })));
  }
  for (let H = 0; H < 5; H++) {
    let N = (H - 2) * 0.0026;
    (h.push(
      qv(9e-4, 5e-4, 0.044, 2e-4, N, Ki + 1e-4, -0.04, n, { wear: 0.45 }),
    ),
      h.push(
        qv(9e-4, 5e-4, 0.05, 2e-4, N, Ki + 1e-4, 0.059, n, { wear: 0.45 }),
      ));
  }
  let z = [0.8, 0.8, 0.83];
  (h.push(
    Nn(
      tu(
        [
          [-0.0092, Ki - 4e-4],
          [0.0092, Ki - 4e-4],
          [0.0092, No_2 - 0.0016],
          [0.0078, No_2],
          [0.0019, No_2],
          [0.0019, No_2 - 0.003],
          [-0.0019, No_2 - 0.003],
          [-0.0019, No_2],
          [-0.0078, No_2],
          [-0.0092, No_2 - 0.0016],
        ],
        [0, 0, 6e-4, 6e-4, 0, 0, 0, 0, 6e-4, 6e-4],
        1,
      ),
      -0.0755,
      -0.0655,
      4e-4,
      z,
      r,
    ),
  ),
    h.push(
      Nn(
        [
          [-0.0074, Ki - 2e-4],
          [0.0074, Ki - 2e-4],
          [0.0066, Ki + 0.0011],
          [-0.0066, Ki + 0.0011],
        ],
        -0.078,
        -0.063,
        3e-4,
        z,
        r,
      ),
    ),
    h.push(
      h0(
        [
          [0, -6e-4],
          [0.0011, -6e-4],
          [0.0013, -3e-4],
          [0.0013, 4e-4],
          [0, 4e-4],
        ],
        6,
        t,
        l,
      )
        .rotateX(Math.PI / 2)
        .translate(0, Ki + 0.0011, 0.0642),
    ),
    h.push(
      Q0(
        [
          [0.0885, Ki - 4e-4],
          [0.0975, Ki - 4e-4],
          [0.0935, No_2],
          [0.0885, No_2],
        ],
        -0.0017,
        0.0017,
        3e-4,
        z,
        r,
      ),
    ),
    h.push(
      Nn(
        [
          [-0.005, Ki - 2e-4],
          [0.005, Ki - 2e-4],
          [0.0044, Ki + 0.001],
          [-0.0044, Ki + 0.001],
        ],
        0.087,
        0.0985,
        3e-4,
        z,
        r,
      ),
    ),
    h.push(
      qv(0.0013, 0.003, 0.019, 5e-4, Hu, 0.0012, -0.0225, [2.2, 2.2, 2.3], {
        bare: 0.5,
        wear: 1,
      }),
    ),
    h.push(m0(0.001, 6e-4, Hu + 2e-4, 0.0012, -0.03, t, 6, l)),
    h.push(
      Nn(
        Su(-0.008, -0.0092, 0.008, 0.0052, 0.0016, 2),
        -0.0826,
        -0.0816,
        3e-4,
        [0.62, 0.62, 0.64],
        { wear: 0.6 },
      ),
    ),
    h.push(E(0.0016, -0.0829, -0.082, 0, -0.0052, t, 8, l)),
    h.push(qv(0.0012, 0.0032, 0.0052, 3e-4, -Hu, sl + 0.0015, 0.008, i, u)),
    h.push(
      h0(
        [
          [0.0082, 0.10405],
          [0.0067, 0.10405],
        ],
        16,
        [0.1, 0.1, 0.11],
        u,
      ),
    ),
    h.push(
      h0(
        [
          [0.0036, 0.10405],
          [0.0029, 0.10405],
        ],
        10,
        [0.1, 0.1, 0.11],
        { ...u, oy: -0.0088 },
      ),
    ));
  for (let H of [-1, 1])
    g.push(TS(0.00105, H * 0.0052, No_2 - 0.0024, 0.0755 + 1e-4));
  (g.push(TS(0.00115, 0, No_2 - 0.0019, -0.0885 + 1e-4)),
    p.push(
      h0(
        [
          [0.0066, 0.026],
          [0.0066, 0.105],
          [0.0061, 0.1066],
          [0.0055, 0.1075],
          [0.0049, 0.1075],
          [0.0045, 0.1062],
        ],
        16,
        [5.5, 5.5, 5.7],
        { bare: 0.8, wear: 0.6 },
      ),
    ),
    p.push(
      h0(
        [
          [0.0045, 0.1062],
          [0.0045, 0.09],
          [0, 0.09],
        ],
        12,
        [0.25, 0.25, 0.25],
        u,
      ),
    ),
    p.push(
      Nn(
        tu(
          [
            [-0.0038, -4e-4],
            [0.009, -4e-4],
            [0.009, 0.0096],
            [0.008, 0.0106],
            [-0.003, 0.0106],
            [-0.0038, 0.0098],
          ],
          5e-4,
          1,
        ),
        -0.0115,
        0.0295,
        5e-4,
        [7.5, 7.5, 7.8],
        { bare: 1, wear: 0.5, zone: 0.8 },
      ),
    ),
    p.push(qv(0.0022, 6e-4, 0.0034, 2e-4, 0.0026, 0.0106, -0.0085, i, u)),
    p.push(qv(6e-4, 0.004, 0.006, 2e-4, 0.0091, 0.004, -0.008, i, u)));
  let I = tu(
    [
      [0.098, -0.0126],
      [0.1, -0.015],
      [0.1, -0.027],
      [0.097, -0.03],
      [0.024, -0.03],
      [0.02, -0.033],
      [-0.026, -0.033],
      [-0.031, -0.04],
      [-0.084, -0.04],
      [-0.0875, -0.03],
      [-0.0885, -0.0126],
    ],
    [
      6e-4, 0.0015, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.004,
      8e-4,
    ],
    2,
  );
  (d.push(Q0(I, -0.0127, 0.0127, 0.0016, s, { ...c, bs: 2 })),
    d.push(
      Eu(
        [
          [-0.084, 0.0126, -0.033, -0.0126, 0.0016, 0.003],
          [-0.0872, 0.0125, -0.0292, -0.0126, 0.0018, 0.004],
          [-0.0902, 0.012, -0.0258, -0.0128, 0.0022, 0.0046],
          [-0.093, 0.011, -0.0232, -0.0132, 0.0026, 0.0044],
          [-0.0954, 0.0096, -0.0214, -0.0139, 0.0028, 0.0036],
          [-0.0972, 0.008, -0.0203, -0.0147, 0.0026, 0.0028],
          [-0.0984, 0.006, -0.0196, -0.0156, 0.0019, 0.0019],
        ].map(([H, N, Z, Q, W, J]) => kn($a_2(N, Z, Q, W, J, 4), H)),
        s,
        { ...c, crease: 62 },
      ),
    ));
  {
    let H = [
        [-0.0262, -0.015],
        [-0.0275, -0.033],
        [-0.03, -0.037],
        [-0.0335, -0.06],
        [-0.0545, -0.125],
        [-0.056, -0.13],
      ],
      N = [
        [-0.0895, -0.015],
        [-0.0915, -0.0222],
        [-0.0878, -0.03],
        [-0.085, -0.035],
        [-0.0885, -0.042],
        [-0.093, -0.062],
        [-0.101, -0.09],
        [-0.1085, -0.115],
      ],
      Z = (G, te) => {
        let oe = 0;
        for (; oe < G.length - 2 && te < G[oe + 1][1];) oe++;
        return (
          G[oe][0] +
          ((G[oe + 1][0] - G[oe][0]) * (te - G[oe][1])) /
            (G[oe + 1][1] - G[oe][1])
        );
      },
      Q = [];
    for (let [G, te, oe, ee, le] of [
      [-0.015, -0.015, 0.0124, 0.004, 0.004],
      [-0.0185, -0.0185, 0.013, 0.0055, 0.005],
      [-0.024, -0.024, 0.0137, 0.0068, 0.0062],
      [-0.031, -0.031, 0.0146, 0.0078, 0.008],
      [-0.04, -0.039, 0.015, 0.0082, 0.0096],
      [-0.06, -0.058, 0.015, 0.0084, 0.0102],
      [-0.08, -0.076, 0.015, 0.0084, 0.0104],
      [-0.1, -0.093, 0.015, 0.0084, 0.0104],
      [-0.118, -0.106, 0.015, 0.0082, 0.01],
      [-0.124, -0.1105, 0.0158, 0.008, 0.0096],
      [-0.13, -0.115, 0.0162, 0.0078, 0.0092],
      [-0.1308, -0.1158, 0.015, 0.007, 0.0084],
    ]) {
      let xe = Z(H, G),
        j = Z(N, te),
        O = $a_2(oe, j, xe, ee, le, 4);
      Q.push(
        O.map((q) => [q[0], te + ((G - te) * (q[1] - j)) / (xe - j), -q[1]]),
      );
    }
    d.push(Eu(Q, s, { ...c, crease: 40 }));
    let W = tu(
        [
          [-0.044, -0.05],
          [-0.06, -0.115],
          [-0.099, -0.104],
          [-0.0935, -0.085],
          [-0.0865, -0.06],
          [-0.083, -0.045],
          [-0.056, -0.041],
        ],
        0.004,
        2,
      ),
      J = [];
    for (let G = 0; G < 16; G++) {
      let te = (G / 16) * Math.PI * 2;
      J.push([-0.0685 + Math.cos(te) * 0.0064, -0.072 + Math.sin(te) * 0.0064]);
    }
    for (let G of [-1, 1])
      (d.push(
        Q0(W, G > 0 ? 0.0146 : -0.0155, G > 0 ? 0.0155 : -0.0146, 4e-4, s, {
          wear: 0.8,
          zone: 1,
          holes: [J],
        }),
      ),
        m.push(
          m0(0.0058, 0.0012, G * 0.015, -0.072, -0.0685, [3.2, 3.2, 3.3], 16, {
            bare: 0.7,
            wear: 1,
          }),
        ),
        d.push(
          Q0(
            Su(0, -0.027, 0.019, -0.018, 0.002, 2),
            G > 0 ? 0.0124 : -0.0131,
            G > 0 ? 0.0131 : -0.0124,
            3e-4,
            s,
            { wear: 0.8, zone: 1 },
          ),
        ));
  }
  d.push(
    Nn(
      [
        [-0.0086, -0.0296],
        [0.0086, -0.0296],
        [0.01, -0.032],
        [-0.01, -0.032],
      ],
      0.038,
      0.095,
      4e-4,
      s,
      c,
    ),
  );
  {
    let H = tu(
      [
        [-0.01, -0.0316],
        [0.01, -0.0316],
        [0.0106, -0.0326],
        [0.009, -0.0346],
        [-0.009, -0.0346],
        [-0.0106, -0.0326],
      ],
      4e-4,
      1,
    );
    for (let N = 0; N < 5; N++) {
      let Z = 0.042 + N * 0.01001;
      d.push(Nn(H, Z, Z + 0.00478, 6e-4, s, c));
    }
  }
  d.push(
    Q0(
      tu(
        [
          [0.024, -0.029],
          [0.025, -0.056],
          [0.016, -0.0665],
          [-0.029, -0.0665],
          [-0.0345, -0.06],
          [-0.03, -0.032],
        ],
        [0.001, 0.004, 0.004, 0.004, 0.003, 0.001],
        2,
      ),
      -0.0075,
      0.0075,
      0.002,
      s,
      {
        ...c,
        bs: 2,
        holes: [
          tu(
            [
              [0.0195, -0.0335],
              [0.02, -0.055],
              [0.014, -0.062],
              [-0.027, -0.062],
              [-0.03, -0.057],
              [-0.026, -0.0335],
            ],
            0.004,
            3,
          ),
        ],
      },
    ),
  );
  for (let H = 0; H < 5; H++)
    d.push(
      qv(0.011, 0.0016, 0.0014, 5e-4, 0, -0.037 - H * 0.0042, 0.0252, s, c),
    );
  (v.push(
    qv(
      0.0222,
      0.001,
      0.0345,
      2e-4,
      0,
      -0.12585,
      -0.07526,
      o,
      f,
      [-0.278, 0, 0],
    ),
  ),
    d.push(
      Q0(
        tu(
          [
            [-0.101, -0.1085],
            [-0.1094, -0.1112],
            [-0.1072, -0.1188],
            [-0.099, -0.116],
          ],
          0.0015,
          2,
        ),
        -0.003,
        0.003,
        8e-4,
        s,
        { ...c, holes: [Su(-0.1064, -0.1158, -0.1026, -0.1116, 0.0012, 2)] },
      ),
    ),
    m.push(m0(0.0013, 0.0304, 0, -0.103, -0.0985, t, 8, l)),
    d.push(
      qv(
        0.0034,
        0.0082,
        0.0072,
        0.0014,
        -0.015,
        -0.0455,
        -0.0375,
        s,
        { wear: 1.2 },
        [-Vy_2, 0, 0],
      ),
    ));
  for (let H = 0; H < 3; H++)
    d.push(
      qv(
        8e-4,
        0.001,
        0.006,
        3e-4,
        -0.0169,
        -0.0432 - H * 0.0022,
        -0.0375 - H * 7e-4,
        s,
        c,
      ),
    );
  for (let [H, N, Z] of [
    [0.004, -0.0225, 0.0019],
    [-0.008, -0.0178, 0.0016],
    [-0.076, -0.026, 0.0019],
  ])
    m.push(m0(Z, 0.0262, 0, N, H, t, 10, l));
  (m.push(
    Q0(
      tu(
        [
          [-0.0065, -0.0325],
          [0.0012, -0.0325],
          [6e-4, -0.042],
          [0.003, -0.05],
          [0.0056, -0.0565],
          [0.0022, -0.0588],
          [-0.003, -0.052],
          [-0.0055, -0.043],
        ],
        [0, 0, 0.004, 0.005, 8e-4, 8e-4, 0.005, 0.004],
        2,
      ),
      -0.0033,
      0.0033,
      0.0011,
      [1.2, 1.2, 1.25],
      { wear: 0.6, bs: 2 },
    ),
  ),
    m.push(
      qv(
        0.0012,
        0.011,
        0.0014,
        4e-4,
        0,
        -0.049,
        0.0048,
        [0.6, 0.6, 0.62],
        a,
        [0.36, 0, 0],
      ),
    ));
  for (let H of [-1, 1]) {
    m.push(
      qv(0.0018, 0.0044, 0.0125, 7e-4, H * 0.0131, -0.0188, 0.0215, e, {
        wear: 1.3,
      }),
    );
    for (let N = 0; N < 4; N++)
      m.push(
        qv(
          8e-4,
          0.0034,
          0.001,
          3e-4,
          H * 0.0142,
          -0.0188,
          0.0178 + N * 0.0025,
          e,
          { wear: 1.3 },
        ),
      );
  }
  m.push(
    h0(
      [
        [0.0028, 0.03],
        [0.0028, 0.1036],
        [0.0023, 0.1046],
        [0, 0.1046],
      ],
      10,
      [8, 8, 8.3],
      { bare: 0.9, wear: 0.4, oy: -0.0088 },
    ),
  );
  for (let H of [-1, 1])
    m.push(qv(0.002, 0.001, 0.15, 3e-4, H * 0.0112, -0.01225, 0.01, i, u));
  {
    x.push(
      Q0(
        tu(
          [
            [0.0045, 0.0024],
            [0.0045, -0.0024],
            [-0.019, -0.0022],
            [-0.029, -0.004],
            [-0.0335, -0.0016],
            [-0.0335, 0.003],
            [-0.0255, 0.004],
            [-0.019, 0.0022],
          ],
          8e-4,
          1,
        ),
        -0.0149,
        -0.0128,
        5e-4,
        [1.3, 1.3, 1.35],
        { wear: 1.3 },
      ),
    );
    for (let H = 0; H < 4; H++)
      x.push(
        qv(
          8e-4,
          0.005,
          0.0011,
          3e-4,
          -0.0152,
          2e-4,
          -0.0222 - H * 0.0026,
          [1.3, 1.3, 1.35],
          { wear: 1.3 },
        ),
      );
    x.push(m0(0.0026, 0.001, -0.0153, 0, 0.001, t, 10, l));
  }
  let L = [2.3, 2.3, 2.4],
    U = RS,
    k = { bare: 0.45, wear: 1, zone: 0.6 };
  (y.push(
    Q0(
      Su(-0.0155, -U, 0.0155, 0, 0.003, 2).map((H) => [-H[0], H[1]]),
      -0.01025,
      0.01025,
      0.0018,
      L,
      { ...k, bs: 2 },
    ),
  ),
    y.push(qv(0.005, U - 0.02, 0.001, 4e-4, 0, -U / 2 - 0.004, 0.0157, L, k)));
  for (let H = 0; H < 6; H++)
    y.push(m0(0.0015, 6e-4, 0.01025, -0.03 - H * 0.014, -0.01, i, 8, u));
  for (let H of [-1, 1])
    y.push(qv(0.0024, 0.0052, 0.023, 8e-4, H * 0.0074, 0.0016, -0.003, L, k));
  (y.push(
    qv(
      0.0262,
      0.008,
      0.04,
      0.0026,
      0,
      -U - 0.0036,
      0.0025,
      [0.85, 0.85, 0.87],
      { wear: 0.7 },
    ),
  ),
    y.push(
      qv(
        0.018,
        0.0012,
        0.008,
        4e-4,
        0,
        -U - 0.0078,
        0.01,
        [0.55, 0.55, 0.56],
        f,
      ),
    ),
    y.push(
      qv(0.015, 0.004, 0.019, 0.001, 0, -0.001, -0.004, [6, 2.6, 0.9], f),
    ));
  let C = [1.25, 0.72, 0.5];
  {
    let H = h0(
        [
          [0, -0.0105],
          [0.0046, -0.0105],
          [0.0049, -0.0098],
          [0.0049, 0.007],
          [0.0046, 0.0085],
        ],
        12,
        [1, 1, 1],
        f,
      ),
      N = h0(
        [
          [0.0045, 0.0085],
          [0.0043, 0.0125],
          [0.0034, 0.016],
          [0.0018, 0.0182],
          [0, 0.0188],
        ],
        12,
        C,
        f,
      );
    for (let Z of [H, N])
      (Z.rotateX(0.09), Z.translate(0, 0.0046, -0.001), b.push(Z));
  }
  let A = {
      slide: Fs_2(h),
      barrel: Fs_2(p),
      frame: Fs_2(d),
      steel: Fs_2(m),
      stop: Fs_2(x),
      plain: Fs_2(v),
      mag: Fs_2(y),
      round: Fs_2(b),
    },
    F = (H, N, Z, Q) =>
      Q === "frame"
        ? Math.abs(H) < 0.0155 && N < -0.048 && N > -0.124 && -Z < -0.03
          ? (1 - Math.min(1, Math.max(0, (Math.abs(H) - 0.0075) / 0.003))) *
            Math.max(
              1 -
                Math.min(
                  1,
                  Math.max(
                    0,
                    (-0.0335 + (N + 0.06) * 0.323 + Z - 0.004) / 0.003,
                  ),
                ),
              1 -
                Math.min(
                  1,
                  Math.max(
                    0,
                    (-Z - (-0.093 + (N + 0.062) * 0.2857) - 0.004) / 0.003,
                  ),
                ),
            )
          : 0
        : Q === "slide"
          ? Math.max(
              0.8 *
                Zl(H, N, Z, -0.006, 0.02, -0.002, 0.009, -0.014, 0.032, 0.004),
              0.6 * Zl(H, N, Z, -0.02, 0.02, -0.02, 0.02, 0.094, 0.11, 0.008),
              0.5 *
                Zl(H, N, Z, -0.02, 0.02, -0.014, -0.0105, -0.09, 0.11, 0.002),
            )
          : 0;
  (sy(
    Object.keys(A).map((H) => ({
      key: H,
      g: A[H],
      off:
        H === "mag" || H === "round"
          ? G0.magPos
          : H === "stop"
            ? G0.stopPivot
            : null,
      rx: H === "mag" || H === "round" ? -Vy_2 : 0,
    })),
    F,
    0.0013,
  ),
    (A.dots = DD(g)));
  for (let H in A) A[H].computeBoundingSphere();
  return A;
}

function DD(n) {
  let e = [],
    t = [],
    i = [],
    s = [],
    o = 0;
  for (let a of n) {
    let l = a.attributes.position.array,
      c = a.attributes.normal.array,
      u = a.attributes.uv.array;
    for (let f = 0; f < l.length; f++) (e.push(l[f]), t.push(c[f]));
    for (let f = 0; f < u.length; f++) i.push(u[f]);
    for (let f of a.index.array) s.push(f + o);
    o += l.length / 3;
  }
  let r = new BufferGeometry();
  return (
    r.setAttribute("position", new Float32BufferAttribute(e, 3)),
    r.setAttribute("normal", new Float32BufferAttribute(t, 3)),
    r.setAttribute("uv", new Float32BufferAttribute(i, 2)),
    r.setIndex(s),
    r
  );
}

var ii = Vector3;

var or = Quaternion;

var Bh = 0.118;

var k5 = 0.062;

var kS = (n, e) => ({
  p: n.p.map((t, i) => t - e.p[i]),
  r: n.r.map((t, i) => t - e.r[i]),
});

var Wy = (n, e, t, i, s, o, r) => ({
  name: n,
  HIP: e,
  ADS: { p: [0, -G0.sightY, t], r: [0, 0, 0] },
  SPRINT: kS(i, e),
  SPRINT_ARC: s,
  RELOAD: kS(o, e),
  RACK: r,
});

var Gy_2 = { p: [-0.03, 0.035, 0.04], r: [0.06, 0.04, -0.22] };

var qy = [0.58, 0.28, -0.99];

var Xy_2 = [
  Wy(
    "close",
    { p: [0.075, -0.071, -0.343], r: [0.01, 0.08, 0.1] },
    -0.44,
    { p: [0.07, -0.11, -0.33], r: [-0.55, 0.35, 0.12] },
    { p: [-0.006, -0.012, 0.02], r: [0.05, 0.03, 0.04] },
    { p: [0.065, 0.057, -0.4], r: qy },
    Gy_2,
  ),
  Wy(
    "threequarter",
    { p: [0.103, -0.101, -0.5], r: [0.05, 0.16, 0.05] },
    -0.47,
    { p: [0.09, -0.13, -0.42], r: [-0.45, 0.5, 0.1] },
    { p: [-0.006, -0.012, 0.025], r: [0.05, 0.03, 0.04] },
    { p: [0.07, 0.05, -0.44], r: qy },
    Gy_2,
  ),
  Wy(
    "compact",
    { p: [0.166, -0.123, -0.481], r: [0.04, 0.07, 0.02] },
    -0.47,
    { p: [0.14, -0.15, -0.42], r: [-0.6, 0.25, 0.05] },
    { p: [-0.004, -0.01, 0.02], r: [0.05, 0.02, 0.03] },
    { p: [0.08, 0.04, -0.42], r: qy },
    Gy_2,
  ),
];

var H1_2 = (n, e, t) => (n < e || n >= t ? 0 : Yo((n - e) / (t - e)));

var Yy_2 = (n) => new or().setFromAxisAngle(new ii(1, 0, 0), n);

var LD = (n) => new or().setFromAxisAngle(new ii(0, 1, 0), n);

var PS = 0.026;

var ol_2 = {
  grip: {
    web: [-0.0335, -0.012, -0.045],
    tilt: 0.3,
    roll: 0.3,
    drop: 0.008,
    lift: 0.0025,
    nudge: [-0.008, 0, -0.002],
    thumb: [0, 0],
    wrap: {
      back: [-0.006, 0.024],
      out: [0, 0.0015, 0.003],
      dip: [0.3, 0.6, 0.9],
      clear: 3e-4,
      skin: 0,
    },
  },
  support: {
    web: [-0.0335, -0.012, -0.029],
    tilt: 0.3,
    roll: 0.2,
    drop: 0.016,
    pad: [0.008, 0.017, 0.03],
    nudge: [0, -0.014, 0],
    thumb: [0, 0],
    sweep: [0.5, 0.15, 0.1, 1.5, 1.3, -0.25],
  },
  carryYaw: 0,
  slapShift: 0.028,
  shR: [0.2, -0.2, 0.32],
  shL: [-0.2, -0.2, 0.32],
  poleR: [0.8, -0.6, 0],
  poleL: [-0.8, -0.6, 0],
  sprintShR: [0.26, -0.1, 0.32],
  sprintPoleR: [1, -0.2, 0],
  ads: {
    shR: [0.22, -0.3, 0.15],
    shL: [-0.22, -0.3, 0.15],
    poleR: [0.87, -0.5, 0],
    poleL: [-0.87, -0.5, 0],
  },
};

function FD(n) {
  let e = -G0.gripFront[0],
    t = -G0.gripBack[0],
    i = G0.gripFront[1],
    s = G0.rake,
    o = Math.tan(s),
    r = {},
    a = (() => {
      let L = gi_2(n.frame, [-0.03, i - 0.02, e], [0.03, i + 0.01, t]);
      return Math.min(-L.min[0], L.max[0]);
    })(),
    l = gi_2(
      n.frame,
      [-0.02, i + 0.015, t - 0.004],
      [0.02, i + 0.048, t + 0.003],
    ).min[1],
    c = gi_2(n.frame, [-0.03, i - 0.14, e], [0.03, i, t + 0.03]).min[1],
    u = (l + c) / 2,
    f = (e + t) / 2 + (i - u) * o,
    h = (l - c) / 2 / Math.cos(s),
    p = ((t - e) / 2) * Math.cos(s);
  ((r.gripDim = { rake: s, hw: a, hl: h, hd: p, c: [0, u, f] }),
    (r.frontAt = (L) => e + (i - L) * o));
  let d = mn_2(r.gripDim.c, [a, h, p], Yy_2(-s), a * 0.62),
    m = gi_2(n.slide, [-1, -1, -1], [1, 1, 1]),
    x = gi_2(n.frame, [-1, i + 0.026, -1], [1, 0, t]),
    v = mn_2(
      [0, (x.min[1] + m.max[1] - 0.005) / 2, (m.min[2] + x.max[2]) / 2],
      [
        (m.max[0] - m.min[0]) / 2,
        (m.max[1] - 0.005 - x.min[1]) / 2,
        (x.max[2] - m.min[2]) / 2,
      ],
      null,
      0.003,
    ),
    y = gi_2(
      n.frame,
      [-0.009, i - 0.008, e - 0.064],
      [0.009, i - 0.003, e - 0.004],
    ),
    b = mn_2(
      [0, (y.min[1] + y.max[1]) / 2, (y.min[2] + y.max[2]) / 2],
      [
        (y.max[0] - y.min[0]) / 2,
        (y.max[1] - y.min[1]) / 2,
        (y.max[2] - y.min[2]) / 2,
      ],
      null,
      0.0015,
    );
  r.tang = new ii(0, y.min[1] + PS, t + (i - y.min[1] - PS) * o);
  let g = mn_2(
      [0, (y.max[1] + x.min[1]) / 2, y.min[2] + 0.002],
      [(y.max[0] - y.min[0]) / 2, (x.min[1] - y.max[1]) / 2, 0.002],
      null,
      0.0015,
    ),
    E = Bu(
      n.steel,
      [-0.0034, i + 0.0015, -0.008],
      [0.0034, i + 0.026, 0.008],
      0.005,
    ),
    M = E[Math.floor(E.length / 2)];
  ((r.triggerAt = [0, M.y, M.z0]),
    (r.trigger = [
      vs(
        [-0.0033, M.y + 0.005, M.z0 + 0.003],
        [0.0033, M.y - 0.008, M.z0 + 0.001],
        0.003,
      ),
    ]));
  let _ = gi_2(n.stop, [-1, -1, -1], [1, 1, 1]),
    T = G0.stopPivot;
  r.lever = [
    mn_2(
      [T[0] + (_.min[0] + _.max[0]) / 2, T[1], T[2] + _.max[2] - 0.008],
      [(_.max[0] - _.min[0]) / 2, 0.004, 0.008],
      null,
      0.001,
    ),
  ];
  let w = gi_2(n.frame, [-1, i + 0.026, t - 0.012], [1, 0, 1]),
    S = mn_2(
      [0, (w.min[1] + w.max[1]) / 2, (w.min[2] + w.max[2]) / 2],
      [
        (w.max[0] - w.min[0]) / 2,
        (w.max[1] - w.min[1]) / 2,
        (w.max[2] - w.min[2]) / 2,
      ],
      null,
      0.004,
    );
  ((r.upperHw = (m.max[0] - m.min[0]) / 2), (r.grip = [d, v, b, g, S]));
  let R = gi_2(n.mag, [-1, -1, -1], [1, 1, 1]),
    z = gi_2(n.mag, [-1, R.min[1] + 0.012, -1], [1, -0.012, 1]),
    I = gi_2(n.mag, [-1, R.min[1], -1], [1, R.min[1] + 0.0085, 1]);
  ((r.mag = [
    mn_2(
      [0, (R.min[1] + 0.008) / 2, (z.min[2] + z.max[2]) / 2],
      [
        Math.max(-z.min[0], z.max[0]),
        -(R.min[1] + 0.008) / 2,
        (z.max[2] - z.min[2]) / 2,
      ],
      null,
      0.003,
    ),
    mn_2(
      [0, (I.min[1] + I.max[1]) / 2, (I.min[2] + I.max[2]) / 2],
      [I.max[0], (I.max[1] - I.min[1]) / 2, (I.max[2] - I.min[2]) / 2],
      null,
      0.0025,
    ),
  ]),
    (r.padBottom = new ii(0, R.min[1], (I.min[2] + I.max[2]) / 2)));
  {
    let L = r.mag[1];
    r.grip.push(
      mn_2(
        new ii()
          .fromArray(L.c)
          .applyQuaternion(Yy_2(-s))
          .add(new ii().fromArray(G0.magPos))
          .toArray(),
        L.h,
        Yy_2(-s),
        L.r,
      ),
    );
  }
  return r;
}

var $y_2 = null;

var IS = "";

function ND(n) {
  let e = JSON.stringify(ol_2);
  if ($y_2 && e === IS) return $y_2;
  let t = FD(n),
    i = ol_2,
    s = { shapes: t },
    o = new or(),
    r = t.gripDim;
  (($y_2 = s), (IS = e));
  let a = {
      rake: r.rake,
      len: (t.tang.y - (r.c[1] - r.hl * Math.cos(r.rake))) / Math.cos(r.rake),
      width: 2 * r.hw,
      depth: 2 * r.hd,
      top: [0.012, 0.15, 0.004, 0.032],
      topW: 0.027,
      guard: [0.04, 0.096, -0.03],
      trigger: [0.082, -0.013],
    },
    l = il("right", tc({ ...i.grip, ...a, round: 0.011 }).frame, t.tang, o);
  (l.p.add(new ii(0, i.grip.lift, 0).applyQuaternion(l.q)),
    i.grip.nudge && l.p.add(new ii().fromArray(i.grip.nudge)));
  let c = t.lever[0],
    u = -t.upperHw - 5e-4;
  if (
    ((s.grip = ca_2("grip", "right", l.p, l.q, t.grip, nn.pistol_grip.fit)),
    i.grip.wrap)
  ) {
    let y = i.grip.wrap,
      b = (g, E, M, _, T, w) =>
        Uu(s.grip, "grip", g, [-(r.hw + M), T.y, w + E], s.grip.pose, {
          start: [1.35, 1.45, 0.4, s.grip.pose[g * 4 + 3]],
          at: 0.5,
          couple: _,
        });
    for (let g = 2; g < 5; g++) {
      let E = pS(s.grip, g),
        M = t.frontAt(E.y),
        _ = null,
        T = 1e9;
      for (let w = y.back[0]; w <= y.back[1] + 1e-9; w += 0.003)
        for (let S of y.out)
          for (let R of y.dip) {
            let z = b(g, w, S, R, E, M),
              I = wh(z.pose, g, s.grip.shapes),
              L =
                5 * Math.max(0, Math.max(I[0], I[1]) + y.clear) +
                Math.abs(I[2] + y.skin) +
                3 * z.miss -
                0.02 * w;
            L < T && ((T = L), (_ = z));
          }
      s.grip = _;
    }
  }
  ((s.grip = R5(
    s.grip,
    "grip",
    0,
    [u, c.c[1] - 0.006 + i.grip.thumb[0], c.c[2] + 0.022 + i.grip.thumb[1]],
    { root: 0.85 },
  )),
    (s.trigger = Uu(
      s.grip,
      "trigger",
      1,
      [t.triggerAt[0] + 0.002, t.triggerAt[1] + 0.007, t.triggerAt[2] - 0.0015],
      s.grip.pose,
      { start: [0.2, 1, 0.6, 0.1], at: 0.4, couple: 0.3 },
    )));
  let f = il("left", tc({ ...i.support, ...a, round: 0.014 }).frame, t.tang, o);
  i.support.nudge && f.p.add(new ii().fromArray(i.support.nudge));
  let h = i.support.sweep,
    p = d0({
      thumb: [0, -0.1, -0.1, 0.7],
      fingers: [h[0], h[1], h[2], 0],
      index: [h[0], h[1], h[2], h[5]],
    }),
    d = d0({
      thumb: [0, -0.1, -0.1, 0.7],
      fingers: [1.6, h[1], h[2], 0],
      index: [1.6, h[1], h[2], h[5]],
    });
  s.support = ca_2(
    "support",
    "left",
    f.p,
    f.q,
    t.grip.concat(mS(s.grip, s.grip.pose, [0, 1, 2, 3, 4])),
    { from: p, to: d, digits: [1, 2, 3, 4] },
  );
  let m = Float32Array.from(s.support.pose);
  for (let y = 1; y < 5; y++) ((m[y * 4 + 1] = h[3]), (m[y * 4 + 2] = h[4]));
  ((s.support = dS(s.support, "support", {
    from: s.support.pose,
    to: m,
    digits: [1, 2, 3, 4],
  })),
    (s.support = R5(s.support, "support", 0, [
      u,
      c.c[1] - 0.002 + i.support.thumb[0],
      c.c[2] - 0.03 + i.support.thumb[1],
    ])),
    (s.supportOpen = tn_2(new Float32Array(Un), p, s.support.pose, 0.2)),
    (s.stop = R5(
      s.grip,
      "stop",
      0,
      [c.c[0] - c.h[0], c.c[1] + 0.002, c.c[2] + 0.002],
      { skin: -0.003, root: 0.85 },
    )));
  let x = il("left", "mag_cup", t.padBottom, LD(i.carryYaw));
  s.carry = ca_2("carry", "left", x.p, x.q, t.mag, {
    from: nn.mag_cup.fit.from,
    to: d0({ thumb: [1.35, 0.7, 0.6, 0.3], fingers: [1.6, 1.1, 0.7, 0] }),
  });
  let v = x.p.clone().add(new ii(0, 0, -i.slapShift).applyQuaternion(x.q));
  return (
    (s.slap = {
      ...s.carry,
      name: "slap",
      p: v,
      pose: tn_2(new Float32Array(Un), s.carry.pose, di_2.relaxed, 0.55),
    }),
    s
  );
}

function zS(n) {
  let { mats: e, mk: t, S: i, rng: s } = n,
    o = new Group();
  o.name = "viewmodel-pac4";
  let r = CS();
  o.add(t(r.frame, e.poly), t(r.steel, e.steel), t(r.plain, e.plain));
  let a = new Group();
  (a.position.fromArray(G0.barrelPivot),
    r.barrel.translate(
      -G0.barrelPivot[0],
      -G0.barrelPivot[1],
      -G0.barrelPivot[2],
    ),
    a.add(t(r.barrel, e.steel)),
    o.add(a));
  let l = new Group();
  (l.add(t(r.slide, e.slide), t(r.dots, e.dots)), o.add(l));
  let c = t(r.stop, e.steel);
  (c.position.fromArray(G0.stopPivot), o.add(c));
  let u = new Group(),
    f = new ii().fromArray(G0.magPos),
    h = i0(-G0.rake, 0, 0),
    p = new ii().fromArray(G0.magAxis),
    d = t(r.round, e.brass);
  (u.add(t(r.mag, e.steel), d), o.add(u));
  let m = null,
    x = null;
  try {
    ((m = M1_2([
      ["p_model", -0.01295, 2e-4, 0.0465, 0.0072, "L"],
      ["p_name", -0.01295, 2e-4, 0.0215, 0.0044, "L"],
      ["p_maker", -0.01295, -0.0052, -0.013, 0.0019, "L"],
      ["p_cal", 0.01295, 2e-4, 0.047, 0.004, "R"],
    ])),
      (x = M1_2([
        ["p_prop", -0.01285, -0.0212, 0.059, 0.0022, "L"],
        ["p_sn", 0.01285, -0.0212, 0.062, 0.0026, "R"],
        ["p_rack", -0.01285, -0.03, -0.06, 0.0034, "L"],
      ])));
    for (let ge of [m, x])
      ((ge.castShadow = !1), (ge.receiveShadow = !0), (ge.frustumCulled = !1));
    (l.add(m), o.add(x));
  } catch (ge) {
    console.warn("[weapon] pistol markings skipped: " + ge);
  }
  let v = N_();
  (v.position.fromArray(G0.muzzle), (v.visible = !1), o.add(v));
  let y = ND(r),
    b = n.arms || null,
    g = new or(),
    E = (ge, ce, P, D, B) => {
      (B.copy(P).multiply(ge.q), D.copy(ge.p).applyQuaternion(P).add(ce));
    },
    M = { p: y.support.p, q: y.support.q },
    _ = { p: new ii(0.1, -0.38, 0.12), q: i0(-0.3, 0, 0.45) },
    T = {
      p: p
        .clone()
        .multiplyScalar(Bh + 0.016)
        .add(new ii(-0.004, 0, 0.005)),
      q: i0(-0.1, 0, 0.08),
    },
    w = { p: p.clone().multiplyScalar(Bh), q: new or() },
    S = [
      [It.rise, _],
      [It.align, T],
      [It.insert, w],
      [9, w],
    ],
    R = new or(),
    z = { p: new ii(), q: new or() };
  E(y.carry, f.clone().add(_.p), R.copy(_.q).multiply(h), z.p, z.q);
  let I = { p: new ii(), q: new or() };
  E(y.slap, f.clone().addScaledVector(p, It.reboundBy), h, I.p, I.q);
  let L = [
      [0, M],
      [0.05, M],
      [0.42, z],
      [9, z],
    ],
    U = I.p
      .clone()
      .lerp(M.p, 0.5)
      .add(new ii(0.035, -0.07, 0.045)),
    k = tn_2(new Float32Array(Un), di_2.relaxed, di_2.open, 0.25),
    C = y.supportOpen,
    A = new ii(),
    F = new or(),
    H = new ii(),
    N = new or(),
    Z = new ii(),
    Q = new ii(),
    W = new ii(),
    J = new or(),
    G = {
      p: new ii().copy(M.p),
      q: new or().copy(M.q),
      pose: new Float32Array(Un),
      busy: !1,
    },
    te = (ge, ce, P, D, B) =>
      B < 0.5 ? tn_2(ge, ce, P, Yo(B * 2)) : tn_2(ge, P, D, Yo(B * 2 - 1)),
    oe = 0.1366,
    ee = 1.53,
    le = 9,
    xe = !1,
    j = 0,
    O = 1,
    q = 0,
    ue = 0;
  function de() {
    ((G.busy = !1),
      G.p.copy(M.p),
      G.q.copy(M.q),
      G.pose.set(y.support.pose),
      (ue = 0),
      (u.visible = !0),
      u.position.copy(f),
      u.quaternion.copy(h));
  }
  de();
  let $ = (ge) => {
      l.position.z = ge;
      let ce = Math.min(1, ge / 0.006);
      ((a.rotation.x = 0.02 * ce),
        (a.position.z = G0.barrelPivot[2] + 0.0025 * ce));
    },
    se =
      Object.values(r).reduce((ge, ce) => ge + Tu(ce), 0) +
      (m ? Tu(m.geometry) + Tu(x.geometry) : 0) +
      2,
    fe = 0;
  o.traverse((ge) => {
    ge.isMesh && fe++;
  });
  let me = {
    id: "pistol",
    name: G0.name,
    root: o,
    flash: v,
    muzzle: G0.muzzle,
    eject: G0.eject,
    sight: [0, G0.sightY, -G0.rearF],
    info: { tris: Math.round(se), meshes: fe },
    slot: {
      id: "pistol",
      name: G0.name,
      ammo: 15,
      magSize: 15,
      reserve: 1 / 0,
    },
    def: {
      magSize: 15,
      reserve: 1 / 0,
      rpm: 420,
      damage: 34,
      range: 120,
      auto: !1,
      adsTime: 0.14,
      inspect: !1,
      flashLight: 30,
      flashScale: 0.55,
      smoke: !1,
      spread: {
        hip: 0.0105,
        ads: 0.0017,
        moveHip: 0.0065,
        moveAds: 0.003,
        bloomHip: 0.0085,
        bloomAds: 0.003,
        air: 0.018,
        crouch: 0.002,
        shot: 0.3,
        decay: 2.8,
      },
    },
    views: Xy_2,
    view: 0,
    get pose() {
      return Xy_2[me.view];
    },
    setView(ge) {
      me.view = Math.max(0, Math.min(Xy_2.length - 1, ge | 0));
    },
    motion: enemiesShowcaseModule.pistol,
    reloadTime: (ge) => (ge ? It.empty : It.tac),
    reset() {
      ((le = 9),
        (xe = !1),
        (j = 0),
        (d.visible = !0),
        de(),
        $(0),
        (c.rotation.x = 0),
        (O = 1),
        (q = 0));
    },
    cancelReload(ge) {
      (de(), ge && (xe = !1), (d.visible = me.slot.ammo > 0));
    },
    shot(ge) {
      ((le = 0),
        b && (b.right.impulse(0.8), b.left.impulse(0.6)),
        ge && ((xe = !0), (d.visible = !1)));
    },
    recoil(ge, ce, P) {
      (P.addRecoil &&
        P.addRecoil(0.0092 * ce * (0.9 + s() * 0.2), (s() - 0.5) * 0.005 * ce),
        P.addShake && P.addShake(0.14 * ce));
      let D = enemiesShowcaseModule.pistol.recoil,
        B = i.adsE,
        X = (0.9 + s() * 0.2) * (P.crouching ? 0.9 : 1),
        re = X * lerp(1, D.adsRot, B),
        Y = X * lerp(1, D.adsPos, B);
      ((i.kZ.v += D.back * X * lerp(1, D.adsBack, B)),
        (i.kP.v += D.rise * re),
        (i.kY.v += (s() - 0.5) * D.yaw * re),
        (i.kR.v += (s() - 0.5) * D.roll * re),
        (i.kU.v += D.up * Y),
        (i.kX.v += (s() - 0.5) * 2 * D.side * Y));
    },
    reload(ge, ce) {
      let P = n.ev,
        D = ge.empty;
      (P(ge, "magout", It.magout) && (i.bump.v += 0.1),
        ce >= It.swap && !ge.f.fresh && ((ge.f.fresh = 1), (d.visible = !0)),
        P(ge, "maginsert", It.insert) && ((i.bump.v += 0.1), (i.kR.v += 0.5)),
        P(ge, "magin", It.magin) &&
          ((i.bump.v += 0.85), (i.kP.v += 0.85), b && b.left.impulse(1)),
        D &&
          P(ge, "slide", It.slide) &&
          ((xe = !1), (i.kZ.v -= 0.9), (i.kP.v -= 2.6), (i.bump.v -= 0.12)),
        (i.antRT =
          0.035 * H1_2(ce, 0.03, It.magout) -
          0.03 * H1_2(ce, It.thumb - 0.08, It.slideRelease) * (D ? 1 : 0)),
        (i.antYT =
          -0.002 * H1_2(ce, It.insert - 0.1, It.insert) -
          0.0065 * H1_2(ce, It.fingers, It.magin) +
          0.003 * H1_2(ce, It.thumb - 0.08, It.slideRelease) * (D ? 1 : 0)));
      let B = 0,
        X = 0;
      if (ce < It.swap)
        if (ce < It.magout) (u.position.copy(f), u.quaternion.copy(h));
        else {
          let Y = ce - It.magout;
          if (Y < oe)
            (u.position.copy(f).addScaledVector(p, 4.5 * Y * Y + 0.3 * Y),
              u.quaternion.copy(h));
          else {
            let he = Y - oe;
            (Q.set(0, -1, 0).applyQuaternion(N.copy(o.quaternion).invert()),
              u.position
                .copy(f)
                .addScaledVector(p, 0.125 + ee * he)
                .addScaledVector(Q, 4.9 * he * he),
              N.setFromAxisAngle(Z.set(1, 0, 0), -2.6 * he),
              u.quaternion.copy(h).multiply(N));
          }
        }
      else {
        let Y = 0;
        if (ce < It.insert) createWeapon(S, Math.max(ce, It.rise), H, N);
        else {
          if ((N.identity(), ce < It.fingers))
            Y = Bh - k5 * ma(dn_2(ce, It.insert, It.fingers));
          else if (ce < It.windup)
            ((Y = Bh - k5),
              (X = Yo(dn_2(ce, It.fingers, It.windup))),
              (B = It.backOff * X));
          else if (ce < It.magin) {
            let he = dn_2(ce, It.windup, It.magin),
              V = (Bh - k5 + It.backOff) * (1 - he * he);
            ((Y = Math.min(Bh - k5, V)), (B = V - Y), (X = 1));
          } else
            ((X = 1), (B = It.reboundBy * ma(dn_2(ce, It.magin, It.rebound))));
          H.copy(p).multiplyScalar(Y);
        }
        (u.position.copy(f).add(H), u.quaternion.copy(N).multiply(h));
      }
      let re = G.pose;
      if (((G.busy = !0), ce < It.swap))
        (createWeapon(L, ce, A, F),
          te(
            re,
            y.support.pose,
            k,
            y.carry.pose,
            dn_2(ce, 0.03, It.swap - 0.02),
          ));
      else if (ce < It.rebound)
        (E(y.carry, u.position, u.quaternion, A, F),
          E(y.slap, u.position, u.quaternion, W, J),
          A.lerp(W, X).addScaledVector(p, B),
          F.slerp(J, X),
          tn_2(re, y.carry.pose, y.slap.pose, X));
      else {
        let Y = dn_2(ce, It.rebound, It.regrip),
          he = Yo(Y),
          V = 1 - he;
        (A.copy(I.p)
          .multiplyScalar(V * V)
          .addScaledVector(U, 2 * V * he)
          .addScaledVector(M.p, he * he),
          F.copy(I.q).slerp(
            M.q,
            Yo(dn_2(ce, It.rebound + 0.02, It.regrip - 0.02)),
          ),
          Y < 0.55
            ? tn_2(re, y.slap.pose, C, Yo(Y / 0.55))
            : tn_2(re, C, y.support.pose, Yo((Y - 0.55) / 0.45)));
      }
      (G.p.copy(A),
        G.q.copy(F),
        D
          ? ((j =
              ce < It.thumb ? 1 : 1 - Yo(dn_2(ce, It.thumb, It.slideRelease))),
            $(
              ce < It.slideRelease
                ? G0.slideLock
                : G0.slideLock *
                    Math.max(
                      0,
                      1 - (ce - It.slideRelease) / (It.slide - It.slideRelease),
                    ),
            ),
            (ue =
              Yo(dn_2(ce, It.thumb - 0.16, It.thumb - 0.01)) *
              (1 - Yo(dn_2(ce, It.slide + 0.02, It.slide + 0.16)))))
          : (ue = 0),
        (i.reloadW = Math.min(
          Yo(ce / 0.22),
          1 - Yo((ce - (It.magin + 0.03)) / 0.32),
        )),
        (i.rackW = D
          ? Yo((ce - (It.magin + 0.05)) / 0.28) *
            (1 - Yo((ce - (It.slide + 0.04)) / 0.24))
          : 0));
    },
    endReload() {
      de();
    },
    parts(ge, ce, P) {
      le += ge;
      let D = 0.066;
      if (!(P && xe)) {
        let B =
          le < D
            ? le < 0.024
              ? le / 0.024
              : 1 - (le - 0.024) / (D - 0.024)
            : 0;
        (xe && le > 0.024 && (B = Math.max(B, G0.slideLock / G0.slideTravel)),
          $(G0.slideTravel * B),
          (j = xe && le > 0.03 ? 1 : 0));
      }
      ((c.rotation.x = -0.06 * j), (q = ce));
    },
    armTargets(ge, ce) {
      let P = i.spV.x > 0.3 || i.reload || i.hol > 0.12 ? 0 : 1;
      ((O += (P - O) * (1 - Math.exp(-16 * ce))),
        ge.r.p.copy(y.grip.p),
        ge.r.q.copy(y.grip.q),
        tn_2(ge.r.pose, y.grip.pose, y.trigger.pose, Yo(O)),
        (ge.r.trig = q * O));
      let D = Math.min(1, Math.max(0, i.spV.x)),
        B = Yo(Math.min(1, Math.max(0, i.adsV.x))),
        X = ol_2.ads;
      if (
        (ge.r.pole
          .fromArray(ol_2.poleR)
          .lerp(Z.fromArray(ol_2.sprintPoleR), D)
          .lerp(Z.fromArray(X.poleR), B),
        ge.r.sh
          .fromArray(ol_2.shR)
          .lerp(Z.fromArray(ol_2.sprintShR), D)
          .lerp(Z.fromArray(X.shR), B),
        ge.l.p.copy(G.p),
        ge.l.q.copy(G.q),
        ge.l.pose.set(G.busy ? G.pose : y.support.pose),
        (ge.l.trig = 0),
        ge.l.pole.fromArray(ol_2.poleL).lerp(Z.fromArray(X.poleL), B),
        ge.l.sh.fromArray(ol_2.shL).lerp(Z.fromArray(X.shL), B),
        ue > 0)
      )
        for (let re = 0; re < 4; re++)
          ge.r.pose[re] += (y.stop.pose[re] - ge.r.pose[re]) * ue;
    },
    snapArms() {
      O = i.spV.x > 0.3 || i.reload || i.hol > 0.12 ? 0 : 1;
    },
    setLocked(ge) {
      ((xe = !!ge), (d.visible = !ge), ge && (le = 9));
    },
    get locked() {
      return xe;
    },
    holds: y,
  };
  return me;
}

var Js_2 = Vector3;

var UD = ["kZ", "kP", "kY", "kR", "kX", "kU"];

var DS = [
  "kZ",
  "kP",
  "kY",
  "kR",
  "kX",
  "kU",
  "swY",
  "swP",
  "jY",
  "jP",
  "jR",
  "inZ",
  "inX",
  "inP",
  "inR",
  "bump",
  "antY",
  "antR",
  "amt",
  "wall",
];

var Hh = { p: [0.085, -0.34, 0.07], r: [-0.5, 0.22, -0.42] };

var LS = 1.25;

var O1 = Math.PI * 2;

var P5 = 0.965;

var FS = (n) =>
  -(0.9 * Math.sin(n) + 0.318 * Math.sin(2 * n) + 0.1 * Math.sin(3 * n)) *
  0.9416;

var NS = { walk: 1.55, sprint: 2.1, crouch: 1.05 };

async function I5(n) {
  let e = { brass: 4, glove_fabric: 3 },
    t = (B) =>
      n.mats.get(B, { triplanar: !0, vertexColors: !0, scale: e[B] || 1 }),
    i = (B, X) => {
      let re = new Mesh(B, X);
      return (
        (re.castShadow = !1),
        (re.receiveShadow = !0),
        (re.frustumCulled = !1),
        re
      );
    },
    s = (B, X, re, Y, he) => {
      let V = new MeshStandardMaterial({
        color: new Color(X[0], X[1], X[2]),
        roughness: re,
        metalness: Y,
        vertexColors: !0,
      });
      return ((V.name = B), he >= 0 && fm(V, he), V);
    },
    o = {
      ano: s("pac9_anodised", [0.0085, 0.009, 0.0105], 0.4, 0.45, 0),
      plain: s("pac9_matte", [1, 1, 1], 0.92, 0, 4),
      steel: s("pac9_phosphate", [0.016, 0.016, 0.0165], 0.5, 0.7, 1),
      poly: s("pac9_polymer", [0.0125, 0.0128, 0.0135], 0.62, 0, 2),
      tan: s("pac9_polymer_tan", [0.105, 0.08, 0.05], 0.62, 0, 2),
      slide: s("pac4_nitride", [0.008, 0.0083, 0.0092], 0.36, 0.55, 0),
      dots: new MeshStandardMaterial({
        color: new Color(0.3, 0.42, 0.3),
        emissive: new Color(0.16, 0.5, 0.2),
        emissiveIntensity: 0.55,
        roughness: 0.35,
        metalness: 0,
      }),
      fab: t("glove_fabric"),
      brass: t("brass"),
    };
  o.dots.name = "pac4_tritium";
  let r = n.rng && n.rng.fork ? n.rng.fork() : Math.random,
    a = {
      t: 0,
      cooldown: 0,
      prevFire: !1,
      dryDone: !1,
      fireQ: 0,
      autoReload: -1,
      reload: null,
      burst: 0,
      lastShot: -9,
      bloom: 0,
      heat: 0,
      smoke: 0,
      smokeTick: 0,
      adsLin: 0,
      adsE: 0,
      sprintT: 0,
      reloadW: 0,
      rackW: 0,
      finger: 0,
      flashT: 0,
      flashDur: 0.05,
      recPhase: 0,
      wasGround: !0,
      lastVy: 0,
      spreadS: 0.0125,
      idleT: 0,
      inspect: -1,
      hol: 0,
      adsWant: !1,
      spWant: !1,
      urgent: !1,
      antYT: 0,
      antRT: 0,
      gait: 0,
      gOffT: 0,
      gOff: pn(9, 1),
      stride: { x: 1.55, v: 0, w: 14, z: 1 },
      spd: 0,
      stepEv: 0,
      jumpEv: 0,
      landEv: -1,
      landSide: 1,
      lpR: 0,
      lpF: 0,
      breath: 0,
      exert: 0,
      wallT: 0,
      wallK: 0,
      adsV: pn(23, 0.75),
      adsS: pn(9, 1),
      spV: pn(17, 1),
      rwS: pn(45, 1),
      rkS: pn(45, 1),
      wall: pn(10, 1),
      amt: pn(13, 1),
      kZ: pn(44, 0.55),
      kP: pn(36, 0.5),
      kY: pn(30, 0.45),
      kR: pn(31, 0.42),
      kX: pn(40, 0.5),
      kU: pn(40, 0.5),
      swY: pn(13.5, 0.64),
      swP: pn(13.5, 0.64),
      jY: pn(20.5, 0.56),
      jP: pn(20.5, 0.56),
      jR: pn(20.5, 0.56),
      inZ: pn(15, 0.48),
      inX: pn(15, 0.48),
      inP: pn(15, 0.48),
      inR: pn(15, 0.48),
      stance: pn(13, 1),
      stance2: pn(5.5, 1),
      bump: pn(24.5, 0.61),
      antY: pn(50, 0.8),
      antR: pn(50, 0.8),
    };
  n.events &&
    n.events.on &&
    (n.events.on("player:step", () => {
      a.stepEv = 1;
    }),
    n.events.on("player:jump", () => {
      a.jumpEv = 1;
    }),
    n.events.on("player:land", (B) => {
      a.landEv = B && B.speed > 0 ? B.speed : 0;
    }));
  let l = {
    freeze: !1,
    pause: !1,
    reloadT: null,
    empty: !1,
    flash: !1,
    noFire: !1,
    ads: !1,
    sprint: !1,
    noIdle: !1,
  };
  l.S = a;
  let c = {
      t: 0,
      T: 0,
      empty: !1,
      rig: null,
      seated: !1,
      fresh: !1,
      f: null,
    },
    u = { active: !1, phase: "", t: 0, fresh: !1, from: null, to: null };
  function f(B, X, re, Y) {
    if (B.t < re || B.f[X]) return !1;
    ((B.f[X] = 1), X === "magin" && h(B));
    let he = { phase: X, empty: B.empty, weapon: B.rig.id };
    return (Y && Object.assign(he, Y), n.events.emit("weapon:reload", he), !0);
  }
  function h(B) {
    let X = B.rig.slot,
      re = Math.min(X.magSize - X.ammo, X.reserve);
    ((X.ammo += re), (X.reserve -= re), (B.seated = !0));
  }
  let p = vS(n, zc),
    d = { G: n, S: a, mats: o, mk: i, rng: r, ev: f, arms: p },
    m = wS(d),
    x = zS(d),
    v = { rifle: m, pistol: x },
    y = [m, x];
  for (let B of y)
    (B.root.traverse((X) => {
      X.layers.set(zc);
    }),
      (B.root.visible = !1),
      n.camera.add(B.root),
      console.log(
        `[weapon] ${B.name}: ${B.info.tris} tris, ${B.info.meshes} meshes (flash only while firing, hidden while holstered)`,
      ));
  console.log(
    `[weapon] arms: 2 x ${p.right.triCount} tris, 2 draw calls, shared by both weapons`,
  );
  let b = m,
    g = !0,
    E = {
      state: "idle",
      ads: 0,
      spread: 0.0125,
      debug: l,
      slots: [m.slot, x.slot],
      rigs: v,
      pending: null,
      arms: p,
      info: { tris: m.info.tris, meshes: m.info.meshes, pistol: x.info },
      update: O,
      reset: T,
      switchTo: U,
      swap() {
        return U((u.active ? u.to : b) === m ? "pistol" : "rifle");
      },
      equip(B) {
        v[B] &&
          (I(),
          (u.active = !1),
          (E.pending = null),
          (a.hol = 0),
          _(v[B]),
          p.snap());
      },
      setVisible(B) {
        ((g = !!B), (b.root.visible = g), p.setVisible(g));
      },
      muzzleWorld: S,
      reloadNow: z,
      addAmmo(B) {
        b.slot.reserve += B;
      },
      setWetness(B) {
        Wv.value = kh.value = Math.max(0, Math.min(1, +B || 0));
      },
      snap() {
        let B = n.player,
          X =
            (!!B.sprinting || l.sprint) &&
            !n.input.fire &&
            !n.input.ads &&
            !a.reload;
        ((a.adsLin = (n.input.ads || l.ads) && !u.active ? 1 : 0),
          (a.adsE = Yo(a.adsLin)),
          (E.ads = a.adsE),
          (a.adsWant = a.adsLin > 0),
          (a.sprintT = X ? 1 : 0),
          (a.spWant = X));
        for (let re of DS) Xn_2(a[re]);
        (Xn_2(a.adsV, a.adsLin),
          Xn_2(a.adsS, a.adsLin),
          Xn_2(a.spV, a.sprintT),
          Xn_2(a.rwS, a.reloadW),
          Xn_2(a.rkS, a.rackW),
          (a.lpR = 0),
          (a.lpF = 0),
          (a.gait += a.gOff.x),
          Xn_2(a.gOff),
          (a.gOffT = 0),
          (a.stepEv = 0),
          (a.jumpEv = 0),
          (a.landEv = -1),
          (a.wasGround = B.onGround !== !1),
          Xn_2(a.stance, B.crouching ? 1 : 0),
          Xn_2(a.stance2, B.crouching ? 1 : 0),
          (a.wallK = 0),
          (a.antYT = 0),
          (a.antRT = 0));
        for (let re of y) re.snapArms && re.snapArms();
        p.snap();
      },
      view: 1,
      setView: M,
    };
  function M(B) {
    ((B = Math.max(1, Math.min(3, Math.round(+B) || 1))), (E.view = B));
    for (let X of y) X.setView && X.setView(B - 1);
    return B;
  }
  Object.defineProperties(E, {
    name: { enumerable: !0, get: () => b.slot.name },
    ammo: {
      enumerable: !0,
      get: () => b.slot.ammo,
      set: (B) => {
        b.slot.ammo = B;
      },
    },
    magSize: { enumerable: !0, get: () => b.slot.magSize },
    reserve: {
      enumerable: !0,
      get: () => b.slot.reserve,
      set: (B) => {
        b.slot.reserve = B;
      },
    },
    damage: { enumerable: !0, get: () => b.def.damage },
    rpm: { enumerable: !0, get: () => b.def.rpm },
    current: { enumerable: !0, get: () => b.id },
    root: { enumerable: !0, get: () => b.root },
  });
  function _(B) {
    (b.flash && (b.flash.visible = !1),
      (b.root.visible = !1),
      (b = B),
      (b.root.visible = g));
    let X = B.motion;
    for (let re of UD)
      ((a[re].w = X.recoil.spr[re][0]),
        (a[re].z = X.recoil.spr[re][1]),
        Xn_2(a[re]));
    for (let re of ["swY", "swP"])
      ((a[re].w = X.sway.spr[0]), (a[re].z = X.sway.spr[1]));
    for (let re of ["jY", "jP", "jR"])
      ((a[re].w = X.air.spr[0]), (a[re].z = X.air.spr[1]));
    for (let re of ["inZ", "inX", "inP", "inR"])
      ((a[re].w = X.inertia.spr[0]), (a[re].z = X.inertia.spr[1]));
    (Xn_2(a.adsV),
      Xn_2(a.adsS),
      Xn_2(a.rwS),
      Xn_2(a.rkS),
      Xn_2(a.antY),
      Xn_2(a.antR),
      (a.antYT = 0),
      (a.antRT = 0),
      (a.adsWant = !1),
      (a.reloadW = 0),
      (a.rackW = 0),
      (a.cooldown = 0),
      (a.fireQ = 0),
      (a.dryDone = !1),
      (a.burst = 0),
      (a.bloom = 0),
      (a.heat = 0),
      (a.smoke = 0),
      (a.flashT = 0),
      (a.finger = 0),
      (a.adsLin = 0),
      (a.adsE = 0),
      (a.inspect = -1),
      (a.idleT = 0),
      (a.autoReload = -1));
  }
  function T() {
    (j(), p.snap());
    for (let B of y)
      ((B.slot.ammo = B.def.magSize),
        (B.slot.reserve = B.def.reserve),
        B.reset(),
        B.flash && (B.flash.visible = !1));
    ((a.reload = null),
      (u.active = !1),
      (E.pending = null),
      (E.state = "idle"),
      (E.ads = 0),
      Object.assign(a, {
        prevFire: !1,
        lastShot: -9,
        sprintT: 0,
        reloadW: 0,
        rackW: 0,
        hol: 0,
        gait: 0,
        gOffT: 0,
        spd: 0,
        stepEv: 0,
        jumpEv: 0,
        landEv: -1,
        lpR: 0,
        lpF: 0,
        exert: 0,
        wallK: 0,
        wasGround: !0,
      }));
    for (let B of DS) Xn_2(a[B]);
    (Xn_2(a.spV),
      Xn_2(a.stance),
      Xn_2(a.stance2),
      Xn_2(a.gOff),
      Xn_2(a.stride, NS.walk),
      _(m));
  }
  function w(B, X) {
    let re = b.root;
    (re.updateMatrix(), X.fromArray(B).applyMatrix4(re.matrix));
    let Y = n.camera,
      he =
        Math.tan((Y.fov * Math.PI) / 360) /
        Math.tan((n.viewCamera.fov * Math.PI) / 360);
    return (
      (X.x *= he),
      (X.y *= he),
      X.applyQuaternion(Y.quaternion).add(Y.position)
    );
  }
  function S(B = new Js_2()) {
    return w(b.muzzle, B);
  }
  function R(B) {
    ((c.t = 0),
      (c.fresh = !0),
      (c.T = b.reloadTime(B)),
      (c.empty = B),
      (c.rig = b),
      (c.seated = !1),
      (c.f = {}),
      (a.reload = c),
      (a.autoReload = -1));
  }
  function z() {
    let B = b.slot;
    return a.reload || u.active || B.ammo >= B.magSize || B.reserve <= 0
      ? !1
      : (R(B.ammo <= 0),
        n.events.emit("weapon:reload", {
          phase: "start",
          empty: c.empty,
          weapon: b.id,
        }),
        !0);
  }
  function I() {
    if (!a.reload) return;
    let B = a.reload;
    ((a.reload = null), p.blend(0.22), B.rig.cancelReload(B.seated));
  }
  function L(B, X, re) {
    (I(),
      (a.autoReload = -1),
      (a.inspect = -1),
      (a.fireQ = 0),
      (u.active = !0),
      (u.phase = "holster"),
      (u.t = re),
      (u.fresh = !0),
      (u.from = B),
      (u.to = X),
      (E.pending = X.id),
      n.events.emit("weapon:switch", {
        from: B.id,
        to: X.id,
        phase: "holster",
      }));
  }
  function U(B) {
    let X = v[B];
    return X
      ? u.active
        ? u.phase === "holster"
          ? u.to === X
            ? !1
            : ((u.to = X), (E.pending = X.id), !0)
          : X === b
            ? !1
            : (L(
                b,
                X,
                showcaseWeapon.holster *
                  (1 - saturate(u.t / showcaseWeapon.draw)),
              ),
              !0)
        : X === b
          ? !1
          : (L(b, X, 0), !0)
      : !1;
  }
  function k(B) {
    if ((u.fresh ? (u.fresh = !1) : (u.t += B), u.phase === "holster"))
      if (u.t >= showcaseWeapon.holster) {
        let X = u.from;
        (p.blend(0.13),
          _(u.to),
          (u.phase = "draw"),
          (u.t = Math.min(
            u.t - showcaseWeapon.holster,
            showcaseWeapon.draw * 0.5,
          )),
          n.events.emit("weapon:switch", {
            from: X.id,
            to: b.id,
            phase: "draw",
          }),
          (a.hol = 1 - oy(u.t / showcaseWeapon.draw, LS)));
      } else a.hol = pa(u.t / showcaseWeapon.holster);
    else
      u.t >= showcaseWeapon.draw
        ? ((u.active = !1), (E.pending = null), (a.hol = 0))
        : (a.hol = 1 - oy(u.t / showcaseWeapon.draw, LS));
  }
  let C = new Js_2(),
    A = new Js_2(),
    F = new Js_2(),
    H = new Js_2(),
    N = new Js_2(),
    Z = new Js_2();
  function Q() {
    let B = n.player,
      X = n.camera,
      re = b,
      Y = re.def;
    (re.slot.ammo--,
      a.burst++,
      (a.lastShot = a.t),
      (a.heat = Math.min(1.3, a.heat + 0.05)));
    let he = E.spread,
      V = r() * Math.PI * 2,
      ne = Math.tan(he) * Math.sqrt(r());
    (C.set(Math.cos(V) * ne, Math.sin(V) * ne, -1)
      .normalize()
      .applyQuaternion(X.quaternion),
      Z.copy(B.eye || X.position));
    let ye = null;
    try {
      ye = n.combat.playerShot(Z, C, { damage: Y.damage, range: Y.range });
    } catch {}
    (ye && ye.point ? F.copy(ye.point) : F.copy(Z).addScaledVector(C, Y.range),
      S(A));
    let Te = n.fx;
    (Te &&
      (Te.tracer && Te.tracer(A, F),
      Te.shell &&
        (w(re.eject, H),
        N.set(2 + r() * 1.2, 1.2 + r() * 0.8, 0.5 - r() * 0.6).applyQuaternion(
          X.quaternion,
        ),
        B.vel && N.add(B.vel),
        Te.shell(H, N))),
      n.render &&
        n.render.lightPool &&
        n.render.lightPool.flash(A, 16756832, Y.flashLight, 9, 0.05),
      n.events.emit("weapon:fire", {
        origin: Z,
        dir: C,
        muzzle: A,
        ads: a.adsE,
        weapon: re.id,
      }),
      re.recoil(a.burst, lerp(1, 0.55, a.adsE) * (B.crouching ? 0.85 : 1), B),
      (a.bloom = Math.min(1, a.bloom + Y.spread.shot)),
      (a.flashT = a.flashDur = 0.036 + r() * 0.02));
    let Re = re.flash,
      Ue = Re.material.uniforms;
    ((Ue.uSeed.value = r() * 100),
      (Ue.uJet.value = (0.6 + r() * 0.6) * (Y.auto ? 1 : 0.25)),
      (Re.rotation.z = (r() - 0.5) * 0.4));
    let Ve = (0.8 + r() * 0.5) * lerp(1, 0.62, a.adsE) * Y.flashScale;
    (Re.scale.set(Ve, Ve, Ve * (0.8 + r() * 0.5)), re.shot(re.slot.ammo <= 0));
  }
  let W = {
      active: !1,
      rig: null,
      t: 0,
      vel: new Js_2(),
      w: new Js_2(),
      rest: !1,
      sunk: !1,
      bounces: 0,
      qRest: new Quaternion(),
      heard: 0,
    },
    J = new Quaternion(),
    G = new Js_2(),
    te = new Euler();
  function oe() {
    if (W.active || !g || !b.root.visible) return;
    let B = b,
      X = B.root,
      re = n.camera,
      Y = n.player;
    (I(),
      (u.active = !1),
      (E.pending = null),
      B.flash && (B.flash.visible = !1),
      re.updateMatrixWorld(!0),
      X.updateMatrixWorld(!0),
      p.startDrop(r));
    let he =
      Math.tan((re.fov * Math.PI) / 360) /
      Math.tan((n.viewCamera.fov * Math.PI) / 360);
    (G.copy(X.position),
      (G.z /= he),
      G.applyQuaternion(re.quaternion).add(re.position),
      J.copy(re.quaternion).multiply(X.quaternion),
      n.scene.add(X),
      X.position.copy(G),
      X.quaternion.copy(J),
      X.traverse((V) => {
        (V.layers.set(vf), V.isMesh && (V.castShadow = V !== B.flash));
      }),
      W.vel
        .set(0.35 + r() * 0.3, 0.5, -0.5 - r() * 0.4)
        .applyQuaternion(re.quaternion),
      Y && Y.vel && W.vel.addScaledVector(Y.vel, 0.6),
      W.w.set(2.2 + r() * 1.5, (r() - 0.5) * 3, -(3 + r() * 2)),
      Object.assign(W, {
        active: !0,
        rig: B,
        t: 0,
        rest: !1,
        sunk: !1,
        bounces: 0,
        heard: 0,
      }),
      (E.state = "dropped"),
      n.events.emit("weapon:dropped", { weapon: B.id, pos: X.position }));
  }
  function ee(B, X) {
    if (!n.audio || !n.audio.play || W.heard > 3) return;
    W.heard++;
    let re = Math.min(1.4, 0.35 + X * 0.28);
    try {
      (n.audio.play("shell_bounce_metal", {
        pos: B.position,
        gain: re * 1.3,
        pitch: 0.42 + r() * 0.08,
      }),
        n.audio.play("reload_magout", {
          pos: B.position,
          gain: re,
          pitch: 0.7 + r() * 0.1,
        }));
    } catch {}
  }
  function le(B) {
    if (!W.active) return;
    ((W.t += B), p.dropUpdate(B));
    let X = W.rig.root;
    if (W.rest || W.sunk) return;
    let re = Math.max(1, Math.ceil(B / 0.012)),
      Y = B / re;
    for (let he = 0; he < re; he++) {
      W.vel.y -= 13.5 * Y;
      let V = Math.hypot(W.vel.x, W.vel.z);
      if (V > 0.05) {
        G.set(W.vel.x / V, 0, W.vel.z / V);
        let Te = null;
        try {
          Te = n.physics.raycast(X.position, G, V * Y + 0.12);
        } catch {
          Te = null;
        }
        Te && ((W.vel.x *= -0.2), (W.vel.z *= -0.2));
      }
      (X.position.addScaledVector(W.vel, Y),
        te.set(W.w.x * Y, W.w.y * Y, W.w.z * Y),
        J.setFromEuler(te),
        X.quaternion.multiply(J));
      let ne = 0;
      try {
        ne = n.physics.groundHeight(
          X.position.x,
          X.position.z,
          X.position.y + 0.4,
        );
      } catch {
        ne = 0;
      }
      if (!(ne > -1.5)) {
        if (X.position.y < -1.7) {
          ((W.sunk = !0), (X.visible = !1));
          try {
            n.fx.splash && n.fx.splash(X.position, 0.8);
          } catch {}
        }
        continue;
      }
      let ye = 0.045;
      if (X.position.y < ne + ye && W.vel.y < 0) {
        X.position.y = ne + ye;
        let Te = -W.vel.y;
        if ((ee(X, Te), W.bounces++, Te < 1.1 || W.bounces >= 3)) {
          G.set(0, 0, -1).applyQuaternion(X.quaternion);
          let Re = Math.atan2(-G.x, -G.z),
            Ue = new Js_2(1, 0, 0).applyQuaternion(X.quaternion).y > 0 ? 1 : -1;
          (W.qRest.setFromEuler(
            te.set(0, Re, Ue * (Math.PI / 2 - 0.06), "YXZ"),
          ),
            (W.rest = !0),
            (W.restT = 0),
            W.vel.set(0, 0, 0));
          break;
        }
        ((W.vel.y = Te * 0.3),
          (W.vel.x *= 0.55),
          (W.vel.z *= 0.55),
          W.w.multiplyScalar(0.55),
          (W.w.x += (r() - 0.5) * 3));
      }
    }
  }
  function xe(B) {
    if (!W.active || !W.rest || W.sunk || ((W.restT += B), W.restT > 0.5))
      return;
    let X = W.rig.root;
    X.quaternion.slerp(W.qRest, 1 - Math.exp(-16 * B));
    let re = 0;
    try {
      re = n.physics.groundHeight(
        X.position.x,
        X.position.z,
        X.position.y + 0.4,
      );
    } catch {
      re = 0;
    }
    X.position.y = damp(X.position.y, re + 0.024, 18, B);
  }
  function j() {
    if (!W.active) return;
    let B = W.rig,
      X = B.root;
    (n.camera.add(X),
      X.scale.set(1, 1, 1),
      p.restore(),
      X.traverse((re) => {
        (re.layers.set(zc), re.isMesh && (re.castShadow = !1));
      }),
      (X.visible = !1),
      (W.active = !1),
      (W.rig = null));
  }
  function O(B) {
    let X = n.player,
      re = n.input;
    if (
      (X && re && !X.alive && !l.pause && (W.active || oe(), le(B), xe(B)),
      !X || !re || !X.alive)
    ) {
      ((a.prevFire = !1), b.flash && (b.flash.visible = !1));
      return;
    }
    if (l.pause) return;
    ((a.t += B),
      re.pressed &&
        (re.pressed("swap")
          ? E.swap()
          : re.pressed("weapon1")
            ? U("rifle")
            : re.pressed("weapon2") && U("pistol")),
      u.active && k(B));
    let Y = b,
      he = Y.def,
      V = Y.slot,
      ne = u.active,
      ye = !!re.fire && g && !l.noFire,
      Te = ye && !a.prevFire;
    ((a.prevFire = ye), ye || (a.dryDone = !1));
    let Re = (!!X.sprinting || l.sprint) && !ye && !re.ads && !a.reload;
    if (
      ((a.sprintT = damp(a.sprintT, Re ? 1 : 0, 9, B)),
      (a.spWant = Re),
      (a.urgent = !Re && (ye || !!re.ads || !!a.reload)),
      re.pressed && re.pressed("reload") && z(),
      a.autoReload >= 0 && ((a.autoReload -= B), a.autoReload < 0 && z()),
      l.reloadT != null && !a.reload && R(l.empty),
      a.reload)
    ) {
      let $e = a.reload;
      (l.reloadT != null
        ? ($e.t = l.reloadT)
        : $e.fresh
          ? ($e.fresh = !1)
          : ($e.t += B),
        Y.reload($e, $e.t),
        $e.t >= $e.T &&
          l.reloadT == null &&
          ((a.reload = null),
          (a.reloadW = 0),
          (a.rackW = 0),
          (a.antYT = 0),
          (a.antRT = 0),
          Y.endReload(),
          n.events.emit("weapon:reload", {
            phase: "done",
            empty: $e.empty,
            weapon: Y.id,
          })));
    } else ((a.reloadW = 0), (a.rackW = 0), (a.antYT = 0), (a.antRT = 0));
    a.cooldown -= B;
    let Ue = !a.reload && !ne && a.sprintT < 0.45;
    if (he.auto) {
      if (ye && Ue)
        if (V.ammo > 0) {
          let $e = 0;
          for (; a.cooldown <= 0 && V.ammo > 0 && $e < 3;)
            (Q(), (a.cooldown += 60 / he.rpm), $e++);
        } else
          a.dryDone ||
            ((a.dryDone = !0),
            n.events.emit("weapon:dry", { weapon: Y.id }),
            (a.bump.v -= 0.08),
            V.reserve > 0 && (a.autoReload = 0.32));
    } else
      (Te ? (a.fireQ = 0.13) : a.fireQ > 0 && (a.fireQ -= B),
        a.fireQ > 0 &&
          Ue &&
          a.cooldown <= 0 &&
          ((a.fireQ = 0),
          V.ammo > 0
            ? (Q(), (a.cooldown = 60 / he.rpm))
            : (n.events.emit("weapon:dry", { weapon: Y.id }),
              (a.bump.v -= 0.08),
              (a.cooldown = 0.12),
              V.reserve > 0 && (a.autoReload = 0.28))));
    (a.cooldown < 0 && (a.cooldown = Math.max(a.cooldown, -0.001)),
      a.t - a.lastShot > 0.24 &&
        (a.burst > 0 && (a.recPhase = r() * 6.28), (a.burst = 0)),
      (a.bloom = Math.max(0, a.bloom - B * he.spread.decay)),
      he.smoke &&
        a.t - a.lastShot > 0.11 &&
        a.t - a.lastShot < 0.11 + B * 1.5 &&
        a.heat > 0.4 &&
        (a.smoke = Math.min(1.6, a.heat * 1.3)),
      a.smoke > 0 &&
        ((a.smoke -= B),
        (a.smokeTick -= B),
        a.smokeTick <= 0 &&
          n.fx &&
          n.fx.smoke &&
          ((a.smokeTick = 0.085),
          S(A),
          n.fx.smoke(A, {
            size: 0.1 + a.smoke * 0.06,
            life: 1.3,
            rise: 0.5,
            count: 1,
            alpha: 0.22,
          }))),
      (a.heat = Math.max(0, a.heat - B * 0.2)));
    let Ve = (!!re.ads || l.ads) && !a.reload && !ne && a.sprintT < 0.35;
    ((a.adsLin = clamp(a.adsLin + (Ve ? B : -B) / he.adsTime, 0, 1)),
      (a.adsE = Yo(a.adsLin)),
      (E.ads = a.adsE),
      (a.adsWant = Ve));
    let ze = X.speed || 0,
      Ge = saturate(ze / 6),
      _e = he.spread,
      Ne =
        lerp(_e.hip, _e.ads, a.adsE) +
        Ge * lerp(_e.moveHip, _e.moveAds, a.adsE) +
        a.bloom * lerp(_e.bloomHip, _e.bloomAds, a.adsE) +
        (X.onGround === !1 ? _e.air : 0) -
        (X.crouching ? _e.crouch * (1 - a.adsE) : 0);
    ((a.spreadS = damp(a.spreadS, Ne, 18, B)),
      (E.spread = a.spreadS),
      ye ||
      !!re.ads ||
      !!a.reload ||
      ne ||
      ze > 0.2 ||
      (re.look && Math.abs(re.look.dx) + Math.abs(re.look.dy) > 0.002) ||
      a.sprintT > 0.1
        ? ((a.idleT = 0),
          a.inspect >= 0 && (a.inspect = Math.max(a.inspect, 2.9)))
        : (a.idleT += B),
      he.inspect && a.inspect < 0 && a.idleT > 24 && (a.inspect = 0));
    let je = 0,
      Ze = 0,
      qe = 0;
    if (a.inspect >= 0) {
      let $e = (a.inspect += B);
      ((je = Yo($e / 0.5) * (1 - Yo(($e - 1.4) / 0.5))),
        (Ze = Yo(($e - 1.5) / 0.5) * (1 - Yo(($e - 2.8) / 0.5))),
        (qe = Yo($e / 0.5) * (1 - Yo(($e - 2.9) / 0.5))),
        $e > 3.5 && ((a.inspect = -1), (a.idleT = 0)));
    }
    ((E.state = ne
      ? "switching"
      : a.reload
        ? "reloading"
        : a.inspect >= 0
          ? "inspect"
          : a.sprintT > 0.5
            ? "sprinting"
            : a.t - a.lastShot < 0.14
              ? "firing"
              : "idle"),
      (a.finger = damp(a.finger, (ye && Ue) || l.flash ? 1 : 0, 30, B)),
      Y.parts(B, a.finger, !!a.reload));
    let Oe = Y.flash,
      mt = Oe.material.uniforms;
    if (
      (l.flash &&
        ((a.flashT = a.flashDur = 0.05),
        (mt.uSeed.value = 3.7),
        Oe.scale.setScalar(he.flashScale)),
      (a.flashT -= B),
      l.flash && (a.flashT = a.flashDur * 0.6),
      (mt.uInt.value =
        a.flashT > 0
          ? 9.5 * Math.sqrt(a.flashT / a.flashDur)
          : a.lastShot === a.t
            ? 4.5
            : 0),
      (mt.uHeat.value = he.smoke ? saturate((a.heat - 0.45) / 0.8) * 2.2 : 0),
      (Oe.visible = mt.uInt.value > 0 || mt.uHeat.value > 0.02),
      l.freeze)
    ) {
      p.update(B, Y, Y.root);
      return;
    }
    (D(Math.min(B, 0.1), Y, X, re, je, Ze, qe), p.update(B, Y, Y.root));
  }
  let q = new Quaternion(),
    ue = new Quaternion(),
    de = new Euler(),
    $ = new Js_2(),
    se = new Js_2(),
    fe = new Js_2(),
    me = (B) => B * (0.35 + 0.65 * Math.abs(B)),
    ge = (B) => B * (1.6 - 0.6 * Math.abs(B)),
    ce = (B) => B * (1.45 - 0.45 * Math.abs(B)),
    P = (B, X) => {
      Math.abs(B.x - X) < 1e-5 && Math.abs(B.v) < 1e-4 && Xn_2(B, X);
    };
  function D(B, X, re, Y, he, V, ne) {
    let ye = X.motion,
      Te = X.pose,
      Re = Te.HIP,
      Ue = Te.ADS,
      Ve = Te.SPRINT,
      ze = Te.SPRINT_ARC,
      Ge = Te.RELOAD,
      _e = Te.RACK,
      Ne = ye.ads.arc,
      ke = ye.wall,
      je = re.onGround !== !1,
      Ze = re.speed || 0,
      qe = re.vel ? re.vel.x : 0,
      Oe = re.vel ? re.vel.y : 0,
      mt = re.vel ? re.vel.z : 0,
      $e = a.t;
    (en(a.adsV, a.adsWant ? 1 : 0, B, ye.ads.w, ye.ads.z),
      P(a.adsV, a.adsWant ? 1 : 0),
      en(a.adsS, a.adsWant ? 1 : 0, B),
      P(a.adsS, a.adsWant ? 1 : 0));
    let Ke = a.adsS.x - a.adsV.x,
      Bt = Ke > 0 ? Ke * Ke * ye.ads.out : 0;
    (en(
      a.spV,
      a.spWant ? 1 : 0,
      B,
      ye.sprint.spr[0] * (a.urgent ? 1.5 : 1),
      ye.sprint.spr[1],
    ),
      P(a.spV, a.spWant ? 1 : 0),
      en(a.rwS, a.reloadW, B),
      P(a.rwS, a.reloadW),
      en(a.rkS, a.rackW, B),
      P(a.rkS, a.rackW));
    let Gt = a.adsV.x,
      vi = saturate(Gt),
      q0 = vi * vi * (3 - 2 * vi),
      yi = 4 * Gt * (1 - Gt),
      sn = a.spV.x,
      P0 = 4 * sn * (1 - sn),
      $t = a.rwS.x,
      Sn = a.rkS.x,
      bi = a.hol,
      oi = ge(bi),
      xn = me(bi),
      Zt = ce(bi);
    if (
      ((a.wallT -= B),
      a.wallT <= 0 && n.physics && n.physics.raycast && re.forward && re.eye)
    ) {
      a.wallT = 0.08;
      let pe = null;
      try {
        pe = n.physics.raycast(re.eye, re.forward, ke.far);
      } catch {
        pe = null;
      }
      a.wallK = pe ? Yo((ke.far - pe.dist) / (ke.far - ke.near)) : 0;
    }
    (en(a.wall, a.wallK, B), P(a.wall, a.wallK));
    let Vs = a.wall.x * (1 - 0.85 * q0) * (1 - saturate(bi * bi)),
      ws =
        Re.p[0] +
        (Ue.p[0] - Re.p[0]) * Gt +
        Ne.p[0] * yi +
        Ve.p[0] * sn +
        ze.p[0] * P0 +
        Ge.p[0] * $t +
        _e.p[0] * Sn +
        Hh.p[0] * oi +
        ke.p[0] * Vs -
        0.035 * ne,
      cl =
        Re.p[1] +
        (Ue.p[1] - Re.p[1]) * Gt +
        Ne.p[1] * yi +
        Ve.p[1] * sn +
        ze.p[1] * P0 +
        Ge.p[1] * $t +
        _e.p[1] * Sn +
        Hh.p[1] * xn +
        ke.p[1] * Vs +
        0.045 * ne,
      I0 =
        Re.p[2] +
        (Ue.p[2] - Re.p[2]) * Gt +
        Ne.p[2] * yi +
        Ve.p[2] * sn +
        ze.p[2] * P0 +
        Ge.p[2] * $t +
        _e.p[2] * Sn +
        Hh.p[2] * oi +
        ke.p[2] * Vs,
      Kt =
        Re.r[0] * (1 - Gt) +
        Ne.r[0] * yi +
        Ve.r[0] * sn +
        ze.r[0] * P0 +
        Ge.r[0] * $t +
        _e.r[0] * Sn +
        Hh.r[0] * Zt +
        ke.r[0] * Vs +
        0.3 * ne,
      be =
        Re.r[1] * (1 - Gt) +
        Ne.r[1] * yi +
        Ve.r[1] * sn +
        ze.r[1] * P0 +
        Ge.r[1] * $t +
        _e.r[1] * Sn +
        Hh.r[1] * Zt +
        ke.r[1] * Vs +
        0.18 * ne +
        0.25 * V,
      Le =
        Re.r[2] * (1 - Gt) +
        Ne.r[2] * yi +
        Ve.r[2] * sn +
        ze.r[2] * P0 +
        Ge.r[2] * $t +
        _e.r[2] * Sn +
        Hh.r[2] * Zt +
        ke.r[2] * Vs -
        0.75 * he +
        0.55 * V,
      Fe = 0,
      He = 0,
      De = 0,
      ve = 0,
      we = 0,
      Ae = 0,
      ie = lerp(1, ye.ads.pos, q0),
      ae = lerp(1, ye.ads.rot, q0);
    if (!l.noIdle) {
      let pe = ye.idle,
        Ee = a.exert,
        Me = ie * (1 - 0.5 * sn),
        Ie = ae;
      ((a.exert = damp(
        a.exert,
        re.sprinting ? 1 : 0,
        re.sprinting ? 0.3 : 0.14,
        B,
      )),
        (a.breath +=
          B * O1 * pe.hz * (1 + 0.5 * Ee) * (1 + 0.1 * sa($e * 0.11, 3))),
        a.breath > 4096 && (a.breath -= 651 * O1));
      let Ce = a.breath,
        Ye = (1 + 0.9 * Ee) * (1 + 0.2 * sa($e * 0.07, 5)),
        rt = (Math.sin(Ce) + 0.24 * Math.sin(2 * Ce + 0.7)) * Ye,
        Be = (Math.sin(Ce - 0.6) + 0.2 * Math.sin(2 * Ce + 0.2)) * Ye,
        _t = 1.4 * sa($e * 0.09, 7),
        wt = 1.4 * sa($e * 0.08, 8);
      ((Fe +=
        (Math.sin($e * 0.53 + _t) * pe.drift +
          rt * pe.breathY * 0.15 +
          sa($e * 2.3, 12) * pe.noise) *
        Me),
        (He +=
          (rt * pe.breathY +
            Math.sin($e * 0.83 + 1.7 + wt) * pe.drift * 0.6 +
            sa($e * 1.9, 11) * pe.noise) *
          Me),
        (ve +=
          (Be * pe.breathP +
            Math.sin($e * 0.41 + 0.9 + wt) * pe.driftR * 0.5 +
            sa($e * 1.6, 13) * pe.noiseR) *
          Ie),
        (we +=
          (Math.sin($e * 0.37 + 2.2 + _t) * pe.driftR +
            sa($e * 1.3, 14) * pe.noiseR) *
          Ie),
        (Ae +=
          (Math.sin($e * 0.29 + 0.4 - _t) * pe.driftR * 0.8 +
            sa($e * 1.1, 15) * pe.noiseR) *
          Ie));
    }
    {
      let pe = re.tuning && re.tuning.stride ? re.tuning.stride : NS,
        Ee = en(
          a.stride,
          re.crouching ? pe.crouch : re.sprinting ? pe.sprint : pe.walk,
          B,
        );
      a.spd = damp(a.spd, Ze, 14, B);
      let Me = a.gait + a.gOff.x;
      if (je) {
        let Tn = saturate(Ze / 0.5);
        a.gait +=
          (Tn * Ze * B) / Ee -
          (((1 - Tn) * Math.sin(O1 * Me)) / O1) * (1 - Math.exp(-8 * B));
      }
      if (a.landEv >= 0 || (!a.wasGround && je))
        a.gOffT += Math.floor(Me) + 0.35 - Me;
      else if (a.stepEv) {
        let Tn = (Ze * B) / Ee,
          ri = Math.round(Me) - Me - Tn * 0.5;
        Math.abs(ri) > 0.55 * Tn && (a.gOffT += ri - (a.gOffT - a.gOff.x));
      }
      ((a.stepEv = 0),
        en(a.gOff, a.gOffT, B),
        a.gait > 2048 && (a.gait -= 2048),
        en(
          a.amt,
          je
            ? Math.pow(saturate(Ze / 3.8), 0.8) * (re.crouching ? ye.crouch : 1)
            : 0,
          B,
        ));
      let Ie = ye.walk,
        Ce = ye.run,
        Ye = a.amt.x,
        rt = a.gait + a.gOff.x - (lerp(Ie.lag, Ce.lag, sn) * a.spd) / Ee,
        Be = O1 * rt - P5,
        _t = Math.PI * rt,
        wt = Ye * lerp(1, 0.14, q0),
        z0 = Ye * lerp(1, 0.05, q0),
        Pi = FS(Be),
        Lt = Math.sin(_t) + 0.16 * Math.sin(3 * _t + 0.5),
        o0 = Math.sin(Be + P5 + 2.2) + 0.25 * Math.sin(_t + 0.4),
        g0 = FS(Be - 0.55),
        M0 = Math.sin(_t + 1.25) + 0.22 * Math.sin(Be + P5),
        on = Math.sin(_t + 0.35) + 0.25 * Math.sin(Be + P5 + 1);
      ((Fe += Lt * lerp(Ie.x, Ce.x, sn) * wt),
        (He += Pi * lerp(Ie.y, Ce.y, sn) * wt),
        (De += o0 * lerp(Ie.z, Ce.z, sn) * wt),
        (ve += g0 * lerp(Ie.pitch, Ce.pitch, sn) * z0),
        (we += M0 * lerp(Ie.yaw, Ce.yaw, sn) * z0),
        (Ae += on * lerp(Ie.roll, Ce.roll, sn) * z0));
    }
    {
      let pe = ye.inertia,
        Ee = re.yaw || 0,
        Me = Math.cos(Ee),
        Ie = Math.sin(Ee),
        Ce = qe * Me - mt * Ie,
        Ye = -qe * Ie - mt * Me,
        rt = 1 - Math.exp(-B / pe.tau);
      ((a.lpR += (Ce - a.lpR) * rt), (a.lpF += (Ye - a.lpF) * rt));
      let Be = Ce - a.lpR,
        _t = Ye - a.lpF,
        wt = lerp(1, 0.3, q0),
        z0 = lerp(1, 0.08, q0);
      ((De += en(a.inZ, _t * pe.z, B) * wt),
        (Fe += en(a.inX, -Be * pe.x, B) * wt),
        (ve += en(a.inP, _t * pe.pitch, B) * z0),
        (Ae += en(a.inR, -Be * pe.roll - a.lpR * pe.lean * (1 - sn), B) * z0));
    }
    {
      let pe = ye.sway,
        Ee = pe.spr[0] * pe.spr[0] * pe.lag,
        Me = pe.max * 2.5;
      ((a.swY.v += clamp(Y.look ? Y.look.dx : 0, -0.35, 0.35) * Ee),
        (a.swP.v += clamp(Y.look ? Y.look.dy : 0, -0.35, 0.35) * Ee * 0.8),
        en(a.swY, 0, B),
        en(a.swP, 0, B),
        (a.swY.x > Me || a.swY.x < -Me) &&
          ((a.swY.x = clamp(a.swY.x, -Me, Me)), (a.swY.v = 0)),
        (a.swP.x > Me || a.swP.x < -Me) &&
          ((a.swP.x = clamp(a.swP.x, -Me, Me)), (a.swP.v = 0)));
      let Ie = ry(a.swY.x, pe.max),
        Ce = ry(a.swP.x, pe.max * 0.75),
        Ye = lerp(1, pe.adsRot, q0),
        rt = lerp(1, pe.adsPos, q0);
      ((we += Ie * Ye),
        (Ae -= Ie * pe.roll * Ye),
        (ve += Ce * Ye),
        (Fe -= Ie * pe.shift * rt),
        (He += Ce * pe.shift * rt));
    }
    {
      let pe = ye.air,
        Ee = lerp(1, 0.45, q0),
        Me = lerp(1, 0.1, q0);
      if (
        (a.wasGround &&
          !je &&
          (a.jumpEv || Oe > 1) &&
          ((a.jY.v += pe.jumpY), (a.jP.v += pe.jumpP)),
        !a.wasGround && je)
      ) {
        let rt = clamp(Math.max(a.landEv, -a.lastVy), 0, 14);
        ((a.landSide = -a.landSide),
          (a.jY.v -= rt * pe.landY),
          (a.jP.v -= rt * pe.landP),
          (a.jR.v += a.landSide * rt * pe.landR * (0.65 + 0.35 * r())));
      }
      ((a.wasGround = je),
        (a.jumpEv = 0),
        (a.landEv = -1),
        je || (a.lastVy = Oe));
      let Ie = ye.crouchDip,
        Ce = re.crouching ? 1 : 0,
        Ye =
          (en(a.stance, Ce, B, Ie.w[0], 1) - en(a.stance2, Ce, B, Ie.w[1], 1)) *
          2.4;
      ((He -= Ye * Ie.y * Ee),
        (ve -= Ye * Ie.pitch * Me),
        (Ae += Ye * Ie.roll * Me),
        (He += en(a.jY, je ? 0 : clamp(-Oe * pe.fallY, -0.004, 0.016), B) * Ee),
        (ve += en(a.jP, je ? 0 : clamp(-Oe * pe.fallP, -0.02, 0.04), B) * Me),
        (Ae += en(a.jR, 0, B) * Me));
    }
    (en(a.kZ, 0, B),
      en(a.kP, 0, B),
      en(a.kY, 0, B),
      en(a.kR, 0, B),
      en(a.kX, 0, B),
      en(a.kU, 0, B),
      en(a.bump, 0, B),
      en(a.antY, a.antYT, B),
      en(a.antR, a.antRT, B),
      (ve += a.kP.x + a.bump.x * 1.5),
      (we += a.kY.x),
      (Ae += a.kR.x + a.antR.x),
      (He += a.bump.x * 0.6 + a.antY.x),
      q.setFromEuler(de.set(Kt, be, Le, "YXZ")),
      ue.setFromEuler(de.set(ve, we, Ae, "YXZ")),
      $.fromArray(ye.pivot),
      se.copy($).applyQuaternion(ue),
      $.sub(se),
      fe.set($.x + a.kX.x, $.y + a.kU.x, $.z + a.kZ.x - Bt).applyQuaternion(q),
      X.root.position.set(ws + Fe + fe.x, cl + He + fe.y, I0 + De + fe.z),
      X.root.quaternion.copy(q).multiply(ue));
  }
  if (
    (T(),
    n.params && n.params.wview && M(n.params.wview),
    typeof window < "u" &&
      n.params &&
      n.params.shot &&
      !n.showcase &&
      window.__setShot)
  ) {
    let B = window.__setShot;
    window.__setShot = (X) => {
      if (
        (X && X.wview && M(X.wview),
        X && X.wfill && n.render && (n.render.viewFill = +X.wfill),
        X && (X.wgun || X.wpose))
      ) {
        l.pause = !1;
        let re = X.wgun === "pistol" ? "pistol" : "rifle",
          Y = X.wpose || "hip",
          he = Y === "empty";
        ((a.reload = null),
          (l.reloadT = null),
          (l.empty = !1),
          (l.flash = Y === "fire"),
          (l.ads = Y === "ads" || !!X.wads),
          (l.sprint = Y === "sprint"));
        for (let V of y) ((V.slot.ammo = V.def.magSize), V.reset());
        if (
          (E.equip(re),
          (he || Y === "locked") && ((b.slot.ammo = 0), b.setLocked(!0)),
          (Y === "reload" || he) &&
            ((l.reloadT = X.wt != null ? +X.wt : 0.6), (l.empty = he)),
          E.snap(),
          O(0.016),
          E.snap(),
          Y === "switch")
        ) {
          U(re === "rifle" ? "pistol" : "rifle");
          let V = X.wt != null ? +X.wt : 0.14;
          for (let ne = 0; ne < V - 1e-6; ne += 0.005) O(0.005);
          l.pause = !0;
        }
      }
      B(X);
    };
  }
  return E;
}

async function BD(n) {
  let e = await I5(n);
  n.weapon = e;
  let t = new Js_2(0, 1.68, 4),
    i = {
      south: [0.28, -0.01, 1],
      east: [1, 0, 0.25],
      north: [-0.2, -0.01, -1],
      west: [-1, 0, 0.1],
      nw: [-0.75, -0.01, -0.65],
    },
    s = {
      rifle: {
        side: [Math.PI, [1.12, 1.3, 0.11], [0, 1.235, 0.11], 30],
        right: [0, [1.12, 1.3, -0.11], [0, 1.235, -0.11], 30],
        top: [Math.PI * 0.86, [0.62, 1.8, -0.42], [0, 1.24, 0.12], 32],
        hands: [Math.PI, [0.4, 1.4, 0.02], [0.02, 1.215, 0.25], 30],
        rhand: [0, [0.36, 1.22, 0.27], [0.03, 1.16, 0.09], 30],
        muzzle: [Math.PI, [0.26, 1.37, 0.98], [0, 1.262, 0.44], 30],
        optic: [Math.PI, [0.2, 1.4, -0.26], [0, 1.31, 0.02], 30],
        lower: [Math.PI, [0.34, 1.26, 0.04], [0, 1.2, 0.03], 30],
      },
      pistol: {
        side: [Math.PI, [0.5, 1.25, -0.03], [0, 1.215, -0.03], 30],
        right: [0, [0.5, 1.25, 0.03], [0, 1.215, 0.03], 30],
        top: [Math.PI * 0.86, [0.2, 1.56, -0.16], [0, 1.25, 0], 32],
        hands: [Math.PI * 0.8, [0.3, 1.36, -0.2], [0, 1.2, -0.01], 30],
        rear: [Math.PI * 0.93, [0.07, 1.33, -0.34], [0, 1.24, 0], 30],
        grip: [0, [0.28, 1.2, 0.16], [0, 1.19, 0.05], 30],
        under: [Math.PI, [0.26, 1.02, -0.16], [0, 1.17, -0.05], 30],
      },
    },
    o = window.__setShot,
    r = null;
  function a(c, u = {}) {
    let f = u.wgun === "pistol" ? "pistol" : "rifle",
      h = s[f][c];
    ((r = c), u.wview && e.setView(u.wview));
    let p = n.input,
      d = n.player;
    ((p.ads = !1),
      (p.fire = !1),
      (d.sprinting = !1),
      (d.speed = 0),
      (e.debug.pause = !1),
      (e.debug.reloadT = null),
      (e.debug.flash = !1),
      (e.debug.empty = !1),
      (e.debug.freeze = !!h),
      e.arms.attach(null),
      e.reset(),
      e.equip(f));
    for (let E of Object.values(e.rigs))
      (n.camera.add(E.root), E.root.traverse((M) => M.layers.set(zc)));
    let m = e.root,
      x = e.rigs[f],
      v = (E, M) => {
        ((e.debug.reloadT = +E),
          (e.debug.empty = !!M),
          M && ((e.ammo = 0), x.setLocked(!0)));
      },
      y,
      b,
      g;
    if (h)
      (n.scene.add(m),
        m.position.set(0, 1.25, 0),
        m.rotation.set(0, h[0], 0, "YXZ"),
        m.traverse((E) => E.layers.set(vf)),
        e.arms.attach(m, x.pose.HIP, vf),
        (y = h[1]),
        (b = h[2]),
        (g = h[3]),
        u.wt != null
          ? v(u.wt, !!u.wempty)
          : u.wempty && ((e.ammo = 0), x.setLocked(!0)));
    else {
      let E = i[u.wlook] || i.south;
      ((y = [t.x, t.y, t.z]),
        (b = [t.x + E[0] * 50, t.y + E[1] * 50, t.z + E[2] * 50]),
        (g = 74),
        c === "ads" && ((p.ads = !0), (g = 52)),
        c === "sprint" && ((d.sprinting = !0), (d.speed = 6)),
        c === "fire" &&
          ((e.debug.flash = !0), u.wads && ((p.ads = !0), (g = 52))),
        (c === "reload" || c === "empty") &&
          v(u.wt != null ? u.wt : 0.62, c === "empty"),
        c === "locked" &&
          ((e.ammo = 0), x.setLocked(!0), u.wads && ((p.ads = !0), (g = 52))));
    }
    if ((e.snap(), e.update(0.016), e.snap(), c === "switch")) {
      e.switchTo(f === "rifle" ? "pistol" : "rifle");
      let E = u.wt != null ? +u.wt : 0.14;
      for (let M = 0; M < E - 1e-6; M += 0.005) e.update(0.005);
      e.debug.pause = !0;
    }
    return (
      o &&
        o({
          cam: u.cam || [...y, ...b].join(","),
          fov: u.fov || g,
          exposure: u.exposure,
        }),
      { cam: y, target: b }
    );
  }
  window.__setShot = (c) => {
    c && c.wpose ? a(c.wpose, c) : o && o(c);
  };
  let l = a(n.params.wpose || "hip", n.params);
  return {
    cam: l.cam,
    target: l.target,
    update(c) {
      (e.update(c), r === "fire" && (e.debug.flash = !0));
    },
  };
}

export { I5, zy };
