// Ported from the newer Saltline bundle (audio/synthesis.js).

var vt = Math.PI * 2;

function ao(i) {
  let e = i >>> 0;
  return () => {
    ((e |= 0), (e = (e + 1831565813) | 0));
    let t = Math.imul(e ^ (e >>> 15), 1 | e);
    return (
      (t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t),
      ((t ^ (t >>> 14)) >>> 0) / 4294967296
    );
  };
}

function Kb(i) {
  let e = 2166136261;
  for (let t = 0; t < i.length; t++)
    ((e ^= i.charCodeAt(t)), (e = Math.imul(e, 16777619)));
  return e >>> 0;
}

var St = (i, e) => new Float32Array(Math.max(1, Math.round(i * e)));

var Xt = (i, e, t) => e + (t - e) * i();

var Ns = (i) => 440 * Math.pow(2, (i - 69) / 12);

function Qn(i, e, t) {
  let n = St(i, e);
  for (let s = 0; s < n.length; s++) n[s] = t() * 2 - 1;
  return n;
}

function Av(i, e, t, n) {
  let s = (vt * Math.max(10, Math.min(e, n * 0.47))) / n,
    o = Math.cos(s),
    r = Math.sin(s),
    a = r / (2 * t),
    l,
    c,
    u,
    h = 1 + a,
    f = -2 * o,
    p = 1 - a;
  return (
    i === "lp"
      ? ((l = (1 - o) / 2), (c = 1 - o), (u = l))
      : i === "hp"
        ? ((l = (1 + o) / 2), (c = -(1 + o)), (u = l))
        : ((l = a), (c = 0), (u = -a)),
    [l / h, c / h, u / h, f / h, p / h]
  );
}

function tn(i, e, t, n, s) {
  let [o, r, a, l, c] = Av(e, t, n, s),
    u = 0,
    h = 0;
  for (let f = 0; f < i.length; f++) {
    let p = i[f],
      d = o * p + u;
    ((u = r * p - l * d + h), (h = a * p - c * d), (i[f] = d));
  }
  return i;
}

function di(i, e, t, n, s, o = 1) {
  let r = i.length;
  for (let a = 0; a < o; a++) {
    let l = 0,
      c = 0,
      u = null;
    a > 0 && ((l = di.z1), (c = di.z2));
    let h = a === o - 1 ? i : null;
    for (let f = 0; f < r; f++) {
      (f & 31) === 0 &&
        (u = Av(e, t(f / r), typeof n == "function" ? n(f / r) : n, s));
      let p = i[f],
        d = u[0] * p + l;
      ((l = u[1] * p - u[3] * d + c),
        (c = u[2] * p - u[4] * d),
        h && (h[f] = d));
    }
    ((di.z1 = l), (di.z2 = c));
  }
  return i;
}

var Vo =
  (i, e, t = 1) =>
  (n) =>
    i * Math.pow(e / i, Math.pow(n, t));

function lo(i, e, t) {
  for (let n = 0; n < i.length; n++) i[n] *= t(n / e);
  return i;
}

var co = (i, e = 0) =>
  e > 0
    ? (t) => (1 - Math.exp(-t / e)) * Math.exp(-t / i)
    : (t) => Math.exp(-t / i);

function Se(i, e, t, n, s) {
  let o = Math.round(t * s),
    r = Math.min(e.length, i.length - o);
  for (let a = Math.max(0, -o); a < r; a++) i[o + a] += e[a] * n;
  return i;
}

function Us(i, e, t, n, s) {
  let o = i.length,
    r = Math.round(t * s) % o;
  r < 0 && (r += o);
  for (let a = 0; a < e.length; a++) ((i[r] += e[a] * n), ++r >= o && (r = 0));
  return i;
}

function Qb(i) {
  let e = 0;
  for (let t = 0; t < i.length; t++) {
    let n = Math.abs(i[t]);
    n > e && (e = n);
  }
  return e;
}

function ml(i, e) {
  for (let t = 0; t < i.length; t++) i[t] *= e;
  return i;
}

function Wo(i, e) {
  let t = 1 / Math.tanh(e);
  for (let n = 0; n < i.length; n++) i[n] = Math.tanh(i[n] * e) * t;
  return i;
}

function em(i, e, t, n) {
  let s = Math.min(i.length >> 1, Math.round(t * e)),
    o = Math.min(i.length >> 1, Math.round(n * e));
  for (let r = 0; r < s; r++) i[r] *= r / s;
  for (let r = 0; r < o; r++) {
    let a = r / o;
    i[i.length - 1 - r] *= a * a;
  }
  return i;
}

function at(i, e, t, n, s = {}) {
  let o = Qn(i, t, e);
  (s.hp && tn(o, "hp", s.hp, 0.707, i),
    s.lp && tn(o, "lp", s.lp, 0.707, i),
    s.bp && tn(o, "bp", s.bp, s.q || 1, i),
    lo(o, i, co(n, s.att || 0)));
  let r = Qb(o);
  return r > 0 ? ml(o, 1 / r) : o;
}

function ei(i, e, t, n, s, o, r = 6e-4) {
  let a = St(i, e),
    l = 0;
  for (let c = 0; c < a.length; c++) {
    let u = c / i;
    ((l += (vt * (n + (t - n) * Math.exp(-u / s))) / i),
      (a[c] = Math.sin(l) * Math.exp(-u / o) * (1 - Math.exp(-u / r))));
  }
  return a;
}

function jc(i, e, t, n, s = !0) {
  let o = St(i, e),
    r = 0,
    a = o.length;
  for (let l = 0; l < a; l++) {
    let c = l / a;
    ((r += (vt * t * Math.pow(n / t, c)) / i),
      (o[l] = Math.sin(r) * (s ? Math.sin(Math.PI * c) : 1)));
  }
  return o;
}

function dn(n, e, t, i) {
  let s = St(n, e);
  for (let [r, a, l] of t) {
    if (r > n * 0.46) continue;
    let c = (vt * r) / n,
      u = i ? i() * vt : 0,
      f = Math.exp(-1 / (a * n)),
      h = 2 * f * Math.cos(c),
      p = f * f,
      d = Math.min(
        s.length,
        Math.ceil(Math.log(1e-5 / Math.max(l, 1e-5)) / Math.log(f)) + 1,
      ),
      m = (l / f) * Math.sin(u - c),
      x = l * Math.sin(u);
    for (let v = 0; v < d; v++) {
      s[v] += x;
      let y = h * x - p * m;
      ((m = x), (x = y));
    }
  }
  let o = Math.min(s.length, Math.round(4e-4 * n));
  for (let r = 0; r < o; r++) s[r] *= r / o;
  return s;
}

function Jc(i, e, t, n, s = {}) {
  let o = St(i, t),
    r = s.from || 0,
    a = s.fall || 1;
  for (let l = 0; l < n; l++) {
    let c = r + (t - r - 0.02) * Math.pow(e(), a),
      u = Math.round(c * i),
      h = Math.round(Xt(e, s.minLen || 0.001, s.maxLen || 0.004) * i),
      f = Xt(e, 0.2, 1) * (s.ampFall ? Math.exp(-c / s.ampFall) : 1);
    for (let p = 0; p < h && u + p < o.length; p++)
      o[u + p] += (e() * 2 - 1) * f * Math.exp((-4 * p) / h);
  }
  return (
    s.hp && tn(o, "hp", s.hp, 0.707, i),
    s.lp && tn(o, "lp", s.lp, 0.707, i),
    s.bp && tn(o, "bp", s.bp, s.q || 1, i),
    o
  );
}

function Rv(i, e, t) {
  let n = i.length - e,
    s = new Float32Array(e);
  s.set(i.subarray(0, e));
  for (let o = 0; o < n; o++) {
    let r = (o + 0.5) / n,
      a = t ? Math.sin((r * Math.PI) / 2) : r,
      l = t ? Math.cos((r * Math.PI) / 2) : 1 - r;
    s[o] = i[o] * a + i[e + o] * l;
  }
  return s;
}

function Zc(i, e, t, n, s = 0.4) {
  let o = Qn(i, e + s, t);
  return (n(o), Rv(o, Math.round(i * e), !0));
}

function Q1(i, ...e) {
  let t = new Float32Array(i);
  for (let [n, s] of e)
    for (let o = 0; o < Math.min(i, n.length); o++) t[o] += n[o] * s;
  return t;
}

var KR = (n, e = 1) => {
  let t = Qb(n);
  return t > 0 ? ml(n, e / t) : n;
};

function QR(n, e) {
  let t = St(n, e * 12);
  for (let i = 0; i < t.length; i++) {
    let s = i / n / e;
    t[i] = (1 - s) * Math.exp(-s);
  }
  return t;
}

function e8(n, e, t, i, s, o) {
  let r = Math.exp(-1 / (s * e)),
    a = Math.exp(-1 / (o * e)),
    l = 1 / i - 1,
    c = 0;
  for (let u = 0; u < n.length; u++) {
    let f = Math.abs(n[u]);
    ((c = f > c ? r * c + (1 - r) * f : a * c + (1 - a) * f),
      c > t && (n[u] *= Math.pow(c / t, l)));
  }
  return n;
}

function t8(n, e, t, i, s = 1) {
  let o = Math.max(1, Math.round(t * e)),
    r = new Float32Array(n.length);
  for (let l = 0; l < n.length; l++) r[l] = n[l] + (l >= o ? r[l - o] * i : 0);
  let a = 1 - i * 0.5;
  for (let l = 0; l < n.length; l++) n[l] = n[l] * (1 - s) + r[l] * a * s;
  return n;
}

function e_(n, e, t, i = {}) {
  let s = 0.004;
  for (let a of t) s = Math.max(s, a[1]);
  let o = St(n, Math.min(0.5, s * 7 + 0.004)),
    r = i.jit == null ? 0.02 : i.jit;
  return (
    Se(
      o,
      dn(
        n,
        o.length / n,
        t.map(([a, l, c]) => [a * (1 + (e() * 2 - 1) * r), l, c]),
        e,
      ),
      0,
      i.ring == null ? 0.6 : i.ring,
      n,
    ),
    i.tick !== 0 &&
      Se(
        o,
        at(n, e, 0.006, i.tickTau || 9e-4, { hp: i.hp || 2500 }),
        0,
        i.tick == null ? 0.7 : i.tick,
        n,
      ),
    o
  );
}

function n8(n, e, t, i, s, o = {}) {
  let r = Qn(n, t, e),
    a = o.q || 1.8,
    l = o.rough || 200,
    c = o.rough1 || l,
    u = r.length;
  if ((di(r, "bp", Vo(i, s, o.curve || 1), a, n), o.hi)) {
    let m = Qn(n, t, e);
    di(m, "bp", Vo(i * 2.37, s * 2.37, o.curve || 1), a * 1.5, n);
    for (let x = 0; x < u; x++) r[x] += m[x] * o.hi;
  }
  let f = 0.5,
    h = 0.5,
    p = 0,
    d = o.env || ((m) => Math.sin(Math.PI * Math.pow(m, 0.7)));
  for (let m = 0; m < u; m++) {
    let x = m / u;
    (m >= p &&
      ((h = 0.2 + e() * 0.8),
      (p = m + (n / (l + (c - l) * x)) * (0.6 + e() * 0.8))),
      (f += (h - f) * 0.03),
      (r[m] *= f * d(x)));
  }
  return KR(r);
}

function i8(n, e, t, i, s, o) {
  let r = Qn(n, t, e),
    a = r.length;
  di(r, "bp", Vo(i, s), 0.7, n);
  let l = Qn(n, t, e);
  tn(l, "lp", 420, 0.7, n);
  let c = 0.4,
    u = 0.6,
    f = 0,
    h = 0.5,
    p = 0.5;
  for (let d = 0; d < a; d++) {
    let m = d / a;
    (d >= f && ((u = 0.15 + e() * 0.85), (f = d + n * (0.006 + e() * 0.016))),
      (d & 63) === 0 && (p = 0.5 + e() * 0.5),
      (c += (u - c) * 0.004),
      (h += (p - h) * 0.05),
      (r[d] = (r[d] * c * h + l[d] * 0.9 * c) * o(m)));
  }
  return KR(r);
}

var s8 = (n, e, t = 28) => tn(n, "hp", t, 0.707, e);

function o8(n, e, t, i = 0.72, s = 0.0012) {
  for (let o = 0; o < n.length; o++)
    n[o] *= i + (1 - i) * Math.exp(-Math.max(0, o / e - t) / s);
  return n;
}

var d1_2 =
  (n, e = 1) =>
  (t) =>
    Math.pow(t < n ? t / n : (1 - t) / (1 - n), e);

var QP = {
  len: 0.64,
  n: 5,
  pitch: [1, 0.965, 1.035, 0.985, 1.018],
  bright: [1, 1.07, 0.94, 1.04, 0.97],
  layers: [
    [85, 220, 1.75, 0.115, 0.125],
    [220, 950, 2.2, 0.1, 0.052],
    [950, 5e3, 1.5, 0.055, 0.026],
  ],
  hold: 0.022,
  holdTau: 0.0095,
  drive: 1.6,
  tPlus: 4e-4,
  blast: 2.5,
  f0: 150,
  f1: 62,
  tauF: 0.03,
  tauA: 0.055,
  thump: 0.2,
  lpEnd: 800,
  lpMid: 2600,
  lpMidTau: 0.07,
  lpTop: 15e3,
  lpTopTau: 0.0028,
  shelfF: 230,
  shelf: 0.55,
  plateau: 0.8,
  reDrive: 1.5,
  mech: [
    [
      0.021,
      0.05,
      [
        [2180, 0.007, 1],
        [3460, 0.006, 0.7],
        [1840, 0.009, 0.5],
      ],
      3e3,
    ],
    [
      0.058,
      0.07,
      [
        [1930, 0.009, 1],
        [2910, 0.007, 0.75],
        [4380, 0.005, 0.5],
        [860, 0.014, 0.4],
      ],
      2400,
    ],
  ],
  spring: [
    [706, 0.055, 1],
    [1418, 0.035, 0.4],
  ],
  springG: 0.02,
};

var eI = {
  len: 0.44,
  n: 4,
  pitch: [1, 1.04, 0.962, 1.02],
  bright: [1, 0.95, 1.06, 1.02],
  layers: [
    [100, 270, 1.3, 0.16, 0.055],
    [270, 1400, 2.2, 0.2, 0.038],
    [1400, 5500, 1.8, 0.12, 0.016],
  ],
  hold: 0.01,
  holdTau: 0.005,
  drive: 1.5,
  tPlus: 45e-5,
  blast: 2.5,
  f0: 230,
  f1: 105,
  tauF: 0.014,
  tauA: 0.028,
  thump: 0.25,
  lpEnd: 1e3,
  lpMid: 2200,
  lpMidTau: 0.04,
  lpTop: 15e3,
  lpTopTau: 0.0024,
  shelfF: 260,
  shelf: 0.2,
  plateau: 0.78,
  reDrive: 1.5,
  mech: [
    [
      0.016,
      0.09,
      [
        [2920, 0.006, 1],
        [4410, 0.005, 0.8],
        [1650, 0.007, 0.4],
      ],
      3400,
    ],
    [
      0.046,
      0.12,
      [
        [3380, 0.008, 1],
        [5180, 0.007, 0.8],
        [1230, 0.01, 0.35],
      ],
      3e3,
    ],
  ],
  spring: [
    [1180, 0.02, 1],
    [2390, 0.012, 0.4],
  ],
  springG: 0.015,
};

function r6(n, e, t, i) {
  let s = t % i.n,
    o = i.pitch[s],
    r = i.bright[s],
    a = 5e-4,
    l = St(n, i.len),
    c = l.length - Math.round(0.004 * n),
    u = new Float32Array(c);
  for (let [p, d, m, x, v] of i.layers) {
    let y = new Float32Array(c);
    for (let R = 0; R < c; R++) y[R] = e() * 2 - 1;
    (tn(y, "hp", p * o, 0.707, n),
      tn(y, "hp", p * o, 0.707, n),
      tn(y, "lp", d * o * r, 0.707, n));
    let b = 0,
      g = Math.min(c, Math.round(0.12 * n));
    for (let R = 0; R < g; R++) b += y[R] * y[R];
    let E = 1 / Math.sqrt(b / g + 1e-12),
      M = Math.exp(-1 / (v * n)),
      _ = Math.exp(-1 / (i.holdTau * n)),
      T = Math.round(i.hold * n),
      w = x,
      S = m;
    for (let R = 0; R < c; R++)
      ((u[R] += y[R] * E * (S + w)), (w *= M), R >= T && (S *= _));
  }
  (Se(u, ei(n, 0.3, i.f0 * o, i.f1 * o, i.tauF, i.tauA, 0.001), 0, i.thump, n),
    Se(u, QR(n, i.tPlus / o), 0, i.blast, n));
  for (let p = 0; p < c; p++) u[p] = Math.tanh(u[p] * i.drive);
  let f = (p) => {
    let d = (p * c) / n;
    return (
      (i.lpEnd + i.lpMid * Math.exp(-d / i.lpMidTau)) * r +
      i.lpTop * Math.exp(-d / i.lpTopTau)
    );
  };
  (di(u, "lp", f, 0.6, n), di(u, "lp", f, 0.6, n));
  let h = Float32Array.from(u);
  tn(h, "lp", i.shelfF, 0.707, n);
  for (let p = 0; p < c; p++) u[p] += h[p] * i.shelf;
  s8(u, n, 30);
  {
    let p = 0,
      d = Math.round(0.004 * n),
      m = Math.round((i.hold + 0.004) * n);
    for (let x = d; x < m; x++) p += u[x] * u[x];
    ml(u, i.plateau / Math.sqrt(p / (m - d) + 1e-12));
  }
  (Wo(u, i.reDrive), Se(l, u, a, 1, n));
  for (let p = 0; p < i.mech.length; p++) {
    let [d, m, x, v] = i.mech[p],
      y = a + d * Xt(e, 0.94, 1.06);
    (Se(
      l,
      e_(
        n,
        e,
        x.map(([b, g, E]) => [b * o, g, E]),
        { hp: v, tick: 0.6, ring: 0.7 },
      ),
      y,
      m,
      n,
    ),
      p === i.mech.length - 1 &&
        Se(
          l,
          dn(
            n,
            0.22,
            i.spring.map(([b, g, E]) => [b * o, g, E]),
            e,
          ),
          y + 0.002,
          i.springG,
          n,
        ));
  }
  return l;
}

var a6 = (n, e, t) => r6(n, e, t, QP);

var l6 = (n, e, t) => r6(n, e, t, eI);

var ql = (n) => Math.pow(10, n / 20);

var c6 = (n, e) => {
  for (let t = 0; t < n.length; t++) n[t] = e * Math.tanh(n[t] / e);
  return n;
};

var xu = (n, e, t) => {
  let i = 0;
  ((e = Math.max(0, e | 0)), (t = Math.min(n.length, t | 0)));
  for (let s = e; s < t; s++) i += n[s] * n[s];
  return Math.sqrt(i / Math.max(1, t - e));
};

function i6(n, e) {
  let t = Math.round(0.01 * e),
    i = Math.round(0.002 * e),
    s = 0;
  for (let o = 0; o + t <= n.length; o += i) s = Math.max(s, xu(n, o, o + t));
  return s;
}

function u6(n, e, t, i) {
  let s = Math.floor(e() * 1e9),
    o = ao(s),
    r = i.len,
    a = i.ref,
    l = i.slaps[t % i.slaps.length].map(([m, x, v, y, b]) => {
      let g = Qn(n, 0.16, o);
      return (
        tn(g, "hp", 300, 0.7, n),
        tn(g, "lp", v, 0.7, n),
        lo(
          g,
          n,
          (E) =>
            (1 - Math.exp(-E / 0.002)) *
            (E < i.slapHold ? 1 : Math.exp(-(E - i.slapHold) / i.slapTau)),
        ),
        KR(g),
        t8(g, n, b / 1e3, 0.5, 0.7),
        Se(
          g,
          dn(
            n,
            0.1,
            [
              [Xt(o, 110, 190), 0.05, 1],
              [Xt(o, 240, 420), 0.035, 0.6],
            ],
            o,
          ),
          0.002,
          0.12,
          n,
        ),
        { b: ml(g, (a * ql(x)) / i6(g, n)), t: m - 0.007, pan: y }
      );
    }),
    c = Qn(n, r, o),
    u = at(n, o, 0.6, 0.14, { hp: 80, lp: 650, att: 0.04 });
  ml(u, (a * ql(i.far)) / i6(u, n));
  let f = Qn(n, r - 0.1, o);
  (tn(f, "lp", 130, 0.7, n),
    tn(f, "hp", 34, 0.7, n),
    lo(
      f,
      n,
      (m) => (1 - Math.exp(-m / 0.05)) * Math.exp(-Math.pow(m / i.lateT, 2)),
    ),
    ml(f, (a * ql(i.rumble)) / xu(f, 0.1 * n, 0.3 * n)));
  let h = Math.round(0.1 * n),
    p = Math.round(0.2 * n),
    d = (m) => {
      let x = ao(s + 101 + m * 977),
        v = St(n, r),
        y = m ? 1 : -1,
        b = Qn(n, r, x),
        g = St(n, r);
      for (let M = 0; M < g.length; M++) g[M] = c[M] * 0.72 + b[M] * 0.68;
      (di(g, "lp", Vo(i.lp0, i.lp1, 0.55), 0.6, n), tn(g, "hp", 140, 0.7, n));
      let E = Float32Array.from(g);
      (lo(E, n, (M) => (1 - Math.exp(-M / 0.003)) * Math.exp(-M / i.earlyTau)),
        lo(
          g,
          n,
          (M) =>
            (1 - Math.exp(-M / 0.03)) * Math.exp(-Math.pow(M / i.lateT, 2)),
        ),
        Se(v, E, 0.004, (a * ql(i.early)) / xu(E, 0, 0.05 * n), n),
        Se(v, g, 0.004, (a * ql(i.floor)) / xu(g, h, p), n));
      for (let M of l)
        Se(
          v,
          M.b,
          M.t + (M.pan * y > 0 ? 0 : Math.abs(M.pan) * 9e-4),
          1 + 0.4 * M.pan * y,
          n,
        );
      return (
        Se(v, u, i.farT + (m ? 7e-4 : 0), m ? 0.85 : 1.1, n),
        Se(v, f, 0.03, 1, n),
        c6(v, i.ceil)
      );
    };
  return [d(0), d(1)];
}

function f6(n, e, t, i) {
  let s = Math.floor(e() * 1e9),
    o = ao(s),
    r = i.len,
    a = i.ref,
    l = Qn(n, r, o),
    c = 18,
    u = [];
  for (let m = 0; m < c; m++)
    u.push([
      0.006 + 0.085 * Math.pow((m + o()) / c, 1.3),
      Math.pow(0.9, m) * Xt(o, 0.6, 1.1),
      o() * 2 - 1,
      Xt(o, 3200, 7500),
    ]);
  let f = t & 1 ? 0.051 : 0.046,
    h = Math.round(0.1 * n),
    p = Math.round(0.2 * n),
    d = (m) => {
      let x = ao(s + 211 + m * 613),
        v = St(n, r),
        y = m ? 1 : -1,
        b = St(n, 0.5);
      for (let [_, T, w, S] of u)
        Se(
          b,
          at(n, x, 0.03, 0.005, { hp: 350, lp: S, att: 4e-4 }),
          _ + (w * y > 0 ? 0 : 6e-4),
          T * (1 + 0.4 * w * y),
          n,
        );
      for (let _ = 1; _ < 8; _++)
        Se(
          b,
          at(n, x, 0.04, 0.007, { hp: 600, lp: 5200 / (1 + _ * 0.3) }),
          f * _ * (m ? 1.012 : 0.99),
          0.45 * Math.pow(0.72, _),
          n,
        );
      Se(v, b, 0, (a * ql(i.early)) / xu(b, 0, 0.05 * n), n);
      let g = Qn(n, r, x),
        E = St(n, r);
      for (let _ = 0; _ < E.length; _++) E[_] = l[_] * 0.7 + g[_] * 0.7;
      (di(E, "lp", Vo(i.lp0, i.lp1, 0.5), 0.6, n),
        tn(E, "hp", 170, 0.7, n),
        lo(E, n, co(i.tau, 0.006)));
      let M = (a * ql(i.level)) / xu(E, h, p);
      Se(v, E, 0.004, M, n);
      for (let [_, T] of [
        [57, 1],
        [86, 0.8],
        [123, 0.6],
        [171, 0.4],
      ]) {
        let w = Qn(n, Math.min(r - 0.05, 0.9), x);
        (tn(w, "bp", _ * (t & 1 ? 1.05 : 1), 8, n),
          lo(w, n, co(i.tau * 1.25, 0.02)),
          Se(v, w, 0.01, (T * a * ql(i.modes)) / xu(w, h, p), n));
      }
      return c6(v, i.ceil);
    };
  return [d(0), d(1)];
}

var tI = [
  [
    [0.078, -11.6, 4400, -0.8, 2.7],
    [0.124, -11.6, 3400, 0.7, 3.6],
    [0.171, -12, 2500, -0.3, 2.2],
    [0.262, -19, 1500, 0.5, 4.1],
  ],
  [
    [0.084, -11.4, 4200, 0.8, 3.1],
    [0.131, -11.6, 3600, -0.6, 2.4],
    [0.177, -12, 2400, 0.35, 3.9],
    [0.286, -19, 1400, -0.5, 2.9],
  ],
];

var nI = {
  len: 2.2,
  ref: 0.7,
  ceil: 0.75,
  slaps: tI,
  slapHold: 0.024,
  slapTau: 0.009,
  lp0: 3600,
  lp1: 600,
  early: -15,
  earlyTau: 0.03,
  floor: -14.1,
  lateT: 0.8,
  farT: 0.42,
  far: -18,
  rumble: -22,
};

var iI = {
  len: 1.5,
  ref: 0.53,
  slaps: [
    [
      [0.076, -11.8, 5200, -0.7, 2.1],
      [0.121, -12, 3900, 0.75, 2.9],
      [0.168, -12.8, 2800, -0.25, 3.4],
    ],
  ],
  slapHold: 0.015,
  slapTau: 0.008,
  ceil: 0.6,
  lp0: 4400,
  lp1: 700,
  early: -15,
  earlyTau: 0.03,
  floor: -14.6,
  lateT: 0.55,
  farT: 0.34,
  far: -22,
  rumble: -28,
};

var sI = {
  len: 1.3,
  ref: 0.7,
  ceil: 0.7,
  lp0: 7800,
  lp1: 1300,
  tau: 0.15,
  early: -13,
  level: -9,
  modes: -21,
};

var oI = {
  len: 0.9,
  ref: 0.53,
  ceil: 0.55,
  lp0: 8500,
  lp1: 1700,
  tau: 0.105,
  early: -13,
  level: -10,
  modes: -27,
};

var h6 = (n, e, t) => u6(n, e, t, nI);

var d6 = (n, e, t) => f6(n, e, t, sI);

var p6 = (n, e, t) => u6(n, e, t, iI);

var m6 = (n, e, t) => f6(n, e, t, oI);

function g6(n, e) {
  let t = St(n, 0.2),
    i = 5e-4;
  return (
    Se(
      t,
      e_(
        n,
        e,
        [
          [2260, 0.005, 1],
          [3640, 0.0045, 0.75],
          [5880, 0.003, 0.5],
          [8100, 0.002, 0.3],
        ],
        { hp: 2200, tick: 0.9 },
      ),
      i,
      1,
      n,
    ),
    Se(
      t,
      dn(
        n,
        0.05,
        [
          [640, 0.009, 1],
          [1180, 0.007, 0.6],
        ],
        e,
      ),
      i,
      0.3,
      n,
    ),
    Se(t, at(n, e, 0.02, 0.004, { lp: 900 }), i, 0.22, n),
    Se(
      t,
      e_(
        n,
        e,
        [
          [3050, 0.003, 1],
          [4700, 0.0025, 0.6],
        ],
        { hp: 3200, tick: 0.5 },
      ),
      i + 0.0125,
      0.16,
      n,
    ),
    Se(
      t,
      dn(
        n,
        0.18,
        [
          [742, 0.04, 1],
          [1493, 0.028, 0.45],
          [2260, 0.016, 0.2],
        ],
        e,
      ),
      i + 0.002,
      0.045,
      n,
    ),
    s8(t, n, 60)
  );
}

function x6(n, e) {
  let t = St(n, 0.14),
    i = 5e-4;
  return (
    Se(
      t,
      e_(
        n,
        e,
        [
          [3480, 0.0038, 1],
          [5350, 0.003, 0.7],
          [7900, 0.0022, 0.45],
          [1950, 0.005, 0.4],
        ],
        { hp: 3e3, tick: 0.8 },
      ),
      i,
      1,
      n,
    ),
    Se(
      t,
      dn(
        n,
        0.03,
        [
          [980, 0.006, 1],
          [1620, 0.005, 0.5],
        ],
        e,
      ),
      i,
      0.22,
      n,
    ),
    Se(
      t,
      e_(
        n,
        e,
        [
          [4300, 0.0025, 1],
          [6600, 0.002, 0.5],
        ],
        { hp: 3800, tick: 0.5 },
      ),
      i + 0.009,
      0.14,
      n,
    ),
    Se(
      t,
      dn(
        n,
        0.09,
        [
          [1310, 0.018, 1],
          [2650, 0.012, 0.4],
        ],
        e,
      ),
      i + 0.002,
      0.03,
      n,
    ),
    s8(t, n, 90)
  );
}

function v6(n, e) {
  let t = St(n, 0.38),
    i = 0.003;
  (Se(
    t,
    e_(
      n,
      e,
      [
        [3340, 0.004, 1],
        [5210, 0.003, 0.6],
        [1880, 0.006, 0.45],
        [7600, 0.002, 0.3],
      ],
      { hp: 2600, tick: 0.75 },
    ),
    i,
    0.62,
    n,
  ),
    Se(
      t,
      n8(n, e, 0.17, 2700, 1450, {
        rough: 210,
        rough1: 130,
        env: d1_2(0.25, 0.8),
      }),
      i + 0.018,
      0.4,
      n,
    ));
  let s = Qn(n, 0.24, e);
  (tn(s, "hp", 4200, 0.7, n),
    lo(s, n, (a) => Math.pow(Math.sin((Math.PI * a) / 0.24), 2)),
    Se(t, KR(s), i + 0.05, 0.075, n));
  let o = Qn(n, 0.22, e);
  (di(o, "bp", Vo(520, 260), 0.8, n),
    lo(o, n, (a) => Math.pow(Math.sin((Math.PI * a) / 0.22), 2)),
    Se(t, KR(o), i + 0.08, 0.1, n));
  let r = i + 0.2;
  return (
    Se(
      t,
      dn(
        n,
        0.12,
        [
          [418, 0.026, 1],
          [1135, 0.016, 0.6],
          [2280, 0.009, 0.4],
          [3420, 0.005, 0.25],
        ],
        e,
      ),
      r,
      0.3,
      n,
    ),
    Se(t, at(n, e, 0.05, 0.009, { lp: 1e3 }), r, 0.3, n),
    Se(t, at(n, e, 0.004, 8e-4, { hp: 2800 }), r, 0.18, n),
    s8(t, n, 70)
  );
}

function y6(n, e) {
  let t = St(n, 0.26),
    i = 0.004;
  (Se(
    t,
    e_(
      n,
      e,
      [
        [2210, 0.004, 1],
        [3580, 0.003, 0.6],
      ],
      { hp: 2400, tick: 0.5 },
    ),
    i,
    0.3,
    n,
  ),
    Se(
      t,
      dn(
        n,
        0.06,
        [
          [520, 0.014, 1],
          [1240, 0.009, 0.5],
        ],
        e,
      ),
      i,
      0.26,
      n,
    ),
    Se(
      t,
      n8(n, e, 0.19, 1e3, 3300, {
        rough: 140,
        rough1: 320,
        hi: 0.35,
        env: (s) => Math.pow(s, 0.8) * (s > 0.93 ? (1 - s) / 0.07 : 1),
      }),
      i + 0.012,
      0.62,
      n,
    ));
  for (let [s, o] of [
    [0.085, 0.14],
    [0.142, 0.2],
  ])
    Se(
      t,
      e_(
        n,
        e,
        [
          [2850, 0.003, 1],
          [4420, 0.0025, 0.6],
        ],
        { hp: 3e3, tick: 0.6 },
      ),
      i + s,
      o,
      n,
    );
  return (
    Se(t, at(n, e, 0.03, 0.006, { bp: 720, q: 1 }), i + 0.2, 0.22, n),
    s8(t, n, 70)
  );
}

function b6(n, e) {
  let t = St(n, 0.21),
    i = 8e-4,
    s = i + 0.031;
  return (
    Se(
      t,
      e_(
        n,
        e,
        [
          [2390, 0.0055, 1],
          [3760, 0.0045, 0.75],
          [5640, 0.0035, 0.5],
          [1270, 0.007, 0.45],
        ],
        { hp: 2400, tick: 0.95, tickTau: 8e-4 },
      ),
      i,
      0.62,
      n,
    ),
    Se(t, ei(n, 0.08, 172, 74, 0.014, 0.02, 8e-4), i, 0.5, n),
    Se(t, at(n, e, 0.04, 0.008, { lp: 720 }), i, 0.3, n),
    Se(
      t,
      dn(
        n,
        0.07,
        [
          [432, 0.016, 1],
          [915, 0.011, 0.6],
        ],
        e,
      ),
      i,
      0.2,
      n,
    ),
    Se(
      t,
      e_(
        n,
        e,
        [
          [3130, 0.011, 1],
          [4690, 0.009, 0.85],
          [7160, 0.006, 0.55],
          [1890, 0.012, 0.5],
          [9420, 0.0035, 0.3],
        ],
        { hp: 2800, tick: 1.1, tickTau: 0.001 },
      ),
      s,
      1.05,
      n,
    ),
    Se(t, at(n, e, 0.012, 0.0022, { bp: 2600, q: 0.8 }), s, 0.4, n),
    Se(
      t,
      dn(
        n,
        0.16,
        [
          [1485, 0.028, 1],
          [2215, 0.024, 0.6],
          [3320, 0.016, 0.35],
        ],
        e,
      ),
      s + 8e-4,
      0.11,
      n,
    ),
    s8(Wo(KR(t), 1.5), n, 45)
  );
}

function M6(n, e, t) {
  let i = t === 1,
    s = i ? 0.085 : 0.15,
    o = St(n, i ? 0.16 : 0.26),
    r = 0.001;
  (Se(
    o,
    e_(
      n,
      e,
      [
        [2710, 0.004, 1],
        [4130, 0.003, 0.6],
        [1560, 0.006, 0.4],
      ],
      { hp: 2600, tick: 0.7 },
    ),
    r,
    i ? 0.4 : 0.45,
    n,
  ),
    Se(
      o,
      n8(n, e, s, 1350, i ? 2e3 : 2650, {
        rough: 260,
        rough1: 420,
        hi: 0.5,
        q: 2.2,
        env: (u) => 0.35 + 0.65 * u,
      }),
      r + 0.006,
      0.34,
      n,
    ));
  let a = i ? 4 : 8;
  for (let u = 0; u < a; u++) {
    let f = (u + 0.5) / a,
      h = r + 0.01 + s * Math.pow(f, 0.85),
      p = 1900 + 1500 * f;
    Se(
      o,
      e_(
        n,
        e,
        [
          [p, 0.003, 1],
          [p * 1.62, 0.0025, 0.6],
          [p * 2.71, 0.0018, 0.3],
        ],
        { hp: 2800, tick: 0.6, jit: 0.04 },
      ),
      h,
      0.2 + 0.2 * f,
      n,
    );
  }
  let l = St(n, s),
    c = 0;
  for (let u = 0; u < l.length; u++) {
    let f = u / l.length;
    ((c += (vt * (470 + 300 * f)) / n),
      (l[u] =
        (Math.sin(c) + 0.4 * Math.sin(2.02 * c)) *
        f *
        Math.min(1, (1 - f) * 12)));
  }
  if ((Se(o, l, r + 0.008, 0.055, n), i))
    Se(o, at(n, e, 0.02, 0.004, { bp: 1500, q: 1 }), r + 0.012 + s, 0.3, n);
  else {
    let u = r + 0.012 + s;
    (Se(
      o,
      e_(
        n,
        e,
        [
          [1660, 0.012, 1],
          [2750, 0.01, 0.7],
          [4210, 0.006, 0.5],
          [6300, 0.004, 0.3],
        ],
        { hp: 2e3, tick: 1 },
      ),
      u,
      0.75,
      n,
    ),
      Se(o, ei(n, 0.05, 205, 100, 0.012, 0.014, 8e-4), u, 0.35, n));
  }
  return s8(Wo(KR(o), 1.2), n, 60);
}

function _6(n, e) {
  let t = St(n, 0.33),
    i = 8e-4,
    s = i + 0.019;
  Se(
    t,
    e_(
      n,
      e,
      [
        [2950, 0.003, 1],
        [4580, 0.0025, 0.6],
      ],
      { hp: 3e3, tick: 0.6 },
    ),
    i,
    0.11,
    n,
  );
  let o = Qn(n, 0.018, e);
  return (
    di(o, "bp", Vo(1700, 5600), 2.5, n),
    lo(o, n, (r) => Math.pow(r / 0.018, 1.6)),
    Se(t, KR(o), i + 0.001, 0.16, n),
    Se(
      t,
      lo(jc(n, 0.018, 850, 2500, !1), n, (r) => Math.pow(r / 0.018, 2)),
      i + 0.001,
      0.05,
      n,
    ),
    Se(t, at(n, e, 0.02, 0.0016, { hp: 1400 }), s, 1.15, n),
    Se(t, at(n, e, 0.04, 0.007, { hp: 500, lp: 1900 }), s, 0.95, n),
    Se(
      t,
      dn(
        n,
        0.08,
        [
          [820, 0.012, 1],
          [1240, 0.011, 0.9],
          [1710, 0.009, 0.7],
        ],
        e,
      ),
      s,
      0.4,
      n,
    ),
    Se(t, ei(n, 0.07, 255, 104, 0.01, 0.02, 6e-4), s, 0.55, n),
    Se(
      t,
      dn(
        n,
        0.2,
        [
          [2290, 0.024, 1],
          [3420, 0.02, 0.85],
          [4640, 0.016, 0.6],
          [2880, 0.018, 0.5],
          [6410, 0.008, 0.35],
          [8350, 0.005, 0.25],
        ].map(([r, a, l]) => [r * Xt(e, 0.985, 1.015), a, l]),
        e,
      ),
      s,
      0.46,
      n,
    ),
    Se(
      t,
      dn(
        n,
        0.28,
        [
          [706, 0.07, 1],
          [1421, 0.045, 0.35],
        ],
        e,
      ),
      s + 0.002,
      0.07,
      n,
    ),
    s8(Wo(KR(t), 1.6), n, 45)
  );
}

function w6(n, e) {
  let t = St(n, 0.27),
    i = 0.003;
  (Se(
    t,
    e_(
      n,
      e,
      [
        [4120, 0.0035, 1],
        [6340, 0.0028, 0.6],
        [2480, 0.005, 0.4],
      ],
      { hp: 3200, tick: 0.7 },
    ),
    i,
    0.6,
    n,
  ),
    Se(
      t,
      n8(n, e, 0.09, 3100, 2050, {
        rough: 300,
        rough1: 200,
        hi: 0.4,
        q: 2.4,
        env: d1_2(0.2, 0.8),
      }),
      i + 0.012,
      0.42,
      n,
    ),
    Se(
      t,
      dn(
        n,
        0.1,
        [
          [3320, 0.02, 1],
          [5150, 0.014, 0.5],
        ],
        e,
      ),
      i + 0.02,
      0.05,
      n,
    ));
  let s = Qn(n, 0.14, e);
  return (
    tn(s, "hp", 4500, 0.7, n),
    lo(s, n, (o) => Math.pow(Math.sin((Math.PI * o) / 0.14), 2)),
    Se(t, KR(s), i + 0.04, 0.05, n),
    Se(
      t,
      e_(
        n,
        e,
        [
          [1720, 0.008, 1],
          [2960, 0.006, 0.6],
          [690, 0.012, 0.5],
        ],
        { hp: 2600, tick: 0.4 },
      ),
      i + 0.108,
      0.3,
      n,
    ),
    s8(t, n, 90)
  );
}

function E6(n, e) {
  let t = St(n, 0.19),
    i = 0.003;
  return (
    Se(
      t,
      e_(
        n,
        e,
        [
          [2900, 0.0035, 1],
          [4650, 0.003, 0.6],
        ],
        { hp: 2800, tick: 0.5 },
      ),
      i,
      0.3,
      n,
    ),
    Se(
      t,
      n8(n, e, 0.115, 1650, 4300, {
        rough: 220,
        rough1: 420,
        hi: 0.4,
        q: 2.2,
        env: (s) => Math.pow(s, 0.7) * (s > 0.92 ? (1 - s) / 0.08 : 1),
      }),
      i + 0.01,
      0.6,
      n,
    ),
    Se(
      t,
      e_(
        n,
        e,
        [
          [3700, 0.003, 1],
          [5600, 0.0025, 0.5],
        ],
        { hp: 3200, tick: 0.6 },
      ),
      i + 0.07,
      0.16,
      n,
    ),
    s8(t, n, 90)
  );
}

function S6(n, e) {
  let t = St(n, 0.15),
    i = 8e-4,
    s = i + 0.013;
  return (
    Se(
      t,
      e_(
        n,
        e,
        [
          [2620, 0.004, 1],
          [4050, 0.0035, 0.7],
          [1480, 0.006, 0.4],
        ],
        { hp: 2600, tick: 0.8 },
      ),
      i,
      0.55,
      n,
    ),
    Se(t, ei(n, 0.05, 215, 108, 0.01, 0.013, 8e-4), i, 0.3, n),
    Se(t, at(n, e, 0.03, 0.006, { hp: 350, lp: 1600 }), i, 0.4, n),
    Se(
      t,
      dn(
        n,
        0.04,
        [
          [760, 0.008, 1],
          [1330, 0.007, 0.7],
        ],
        e,
      ),
      i,
      0.25,
      n,
    ),
    Se(
      t,
      e_(
        n,
        e,
        [
          [3610, 0.008, 1],
          [5420, 0.0065, 0.75],
          [8130, 0.004, 0.45],
          [2110, 0.008, 0.4],
        ],
        { hp: 3200, tick: 1 },
      ),
      s,
      1,
      n,
    ),
    Se(
      t,
      dn(
        n,
        0.08,
        [
          [1920, 0.016, 1],
          [2870, 0.012, 0.5],
        ],
        e,
      ),
      s + 6e-4,
      0.07,
      n,
    ),
    s8(Wo(KR(t), 1.4), n, 60)
  );
}

function T6(n, e) {
  let t = St(n, 0.2),
    i = 8e-4,
    s = i + 0.012;
  Se(
    t,
    e_(
      n,
      e,
      [
        [3900, 0.0028, 1],
        [5900, 0.0022, 0.6],
      ],
      { hp: 3400, tick: 0.6 },
    ),
    i,
    0.13,
    n,
  );
  let o = Qn(n, 0.011, e);
  return (
    di(o, "bp", Vo(2400, 7200), 2.5, n),
    lo(o, n, (r) => Math.pow(r / 0.011, 1.5)),
    Se(t, KR(o), i + 0.001, 0.17, n),
    Se(t, at(n, e, 0.012, 0.0011, { hp: 2400 }), s, 1.1, n),
    Se(t, at(n, e, 0.025, 0.005, { hp: 700, lp: 2400 }), s, 0.8, n),
    Se(
      t,
      dn(
        n,
        0.05,
        [
          [1180, 0.008, 1],
          [1760, 0.007, 0.8],
        ],
        e,
      ),
      s,
      0.3,
      n,
    ),
    Se(t, ei(n, 0.04, 330, 165, 0.007, 0.011, 5e-4), s, 0.32, n),
    Se(
      t,
      dn(
        n,
        0.12,
        [
          [3060, 0.012, 1],
          [4490, 0.011, 0.85],
          [6920, 0.008, 0.6],
          [9350, 0.005, 0.35],
          [1710, 0.012, 0.4],
        ].map(([r, a, l]) => [r * Xt(e, 0.985, 1.015), a, l]),
        e,
      ),
      s,
      0.5,
      n,
    ),
    Se(
      t,
      dn(
        n,
        0.1,
        [
          [1190, 0.022, 1],
          [2400, 0.014, 0.4],
        ],
        e,
      ),
      s + 0.002,
      0.05,
      n,
    ),
    s8(Wo(KR(t), 1.5), n, 70)
  );
}

function $v_2(n, e, t, i, s, o) {
  for (let r of i) {
    let a = o * Xt(t, 0.85, 1.2);
    Se(
      n,
      e_(
        e,
        t,
        [
          [a, 0.005, 1],
          [a * 1.47, 0.004, 0.6],
          [a * 2.3, 0.003, 0.3],
        ],
        { hp: 3500, tick: 0.4 },
      ),
      r,
      s * Xt(t, 0.5, 1),
      e,
    );
  }
}

function A6(n, e) {
  let t = St(n, 0.31);
  return (
    Se(t, i8(n, e, 0.26, 2500, 900, d1_2(0.32, 1.2)), 0.004, 0.7, n),
    $v_2(t, n, e, [0.055, 0.112, 0.168], 0.2, 4100),
    Se(t, ei(n, 0.07, 125, 68, 0.02, 0.022, 0.003), 0.215, 0.5, n),
    Se(t, at(n, e, 0.05, 0.012, { lp: 520 }), 0.215, 0.45, n),
    Se(
      t,
      dn(
        n,
        0.05,
        [
          [610, 0.012, 1],
          [1340, 0.008, 0.5],
        ],
        e,
      ),
      0.217,
      0.14,
      n,
    ),
    s8(t, n, 50)
  );
}

function R6(n, e) {
  let t = St(n, 0.29);
  (Se(t, i8(n, e, 0.22, 900, 2800, d1_2(0.5, 1.2)), 0.004, 0.65, n),
    $v_2(t, n, e, [0.04, 0.097, 0.15], 0.17, 4600));
  let i = 0.205;
  return (
    Se(
      t,
      dn(
        n,
        0.06,
        [
          [615, 0.012, 1],
          [1510, 0.008, 0.6],
          [2920, 0.005, 0.4],
        ],
        e,
      ),
      i,
      0.4,
      n,
    ),
    Se(t, at(n, e, 0.02, 0.004, { lp: 1400 }), i, 0.45, n),
    Se(t, at(n, e, 0.004, 8e-4, { hp: 2600 }), i, 0.3, n),
    Se(
      t,
      e_(
        n,
        e,
        [
          [2480, 0.004, 1],
          [3900, 0.003, 0.6],
        ],
        { hp: 2800, tick: 0.5 },
      ),
      i + 0.022,
      0.14,
      n,
    ),
    s8(t, n, 60)
  );
}

function C6(n, e, t) {
  let i = St(n, 0.2),
    s = t % 2 === 0;
  return (
    Se(
      i,
      i8(n, e, 0.17, s ? 1100 : 2300, s ? 2400 : 1200, d1_2(0.4, 1.3)),
      0.004,
      0.8,
      n,
    ),
    $v_2(i, n, e, [0.03 + 0.02 * t, 0.11], 0.1, 4300),
    s8(i, n, 80)
  );
}

var rI = [
  [4180, 1],
  [6830, 0.7],
  [9760, 0.5],
  [11900, 0.3],
  [2470, 0.3],
];

function Xv(n, e, t, i, s) {
  return dn(
    n,
    i * 6,
    rI.map(([o, r], a) => [o * t, i / (1 + a * 0.35), r]),
    e,
  );
}

function k6(n, e, t) {
  let i = St(n, 0.5),
    s = [1, 1.09, 0.93, 1.04][t & 3],
    o = 6e-4,
    r = 1,
    a = 2 + (t !== 1 ? 1 : 0);
  for (let l = 0; l < a; l++) {
    let c = s * (l & 1 ? 1.19 : 1) * Xt(e, 0.97, 1.04);
    (Se(i, Xv(n, e, c, Xt(e, 0.016, 0.03)), o, r * 0.5, n),
      Se(i, at(n, e, 0.004, 8e-4, { hp: 3200 }), o, r * 0.5, n),
      Se(i, at(n, e, 0.012, 0.0025, { bp: 1900, q: 0.8 }), o, r * 0.3, n),
      (o += Xt(e, 0.085, 0.15) * (l ? 0.72 : 1)),
      (r *= Xt(e, 0.42, 0.6)));
  }
  return s8(i, n, 200);
}

function P6(n, e, t) {
  let i = St(n, 0.7),
    s = [1, 1.11, 0.94][t % 3],
    o = 6e-4,
    r = 1;
  for (let a = 0; a < 3; a++) {
    let l = s * (a & 1 ? 1.19 : 1) * Xt(e, 0.97, 1.04);
    (Se(i, Xv(n, e, l, Xt(e, 0.045, 0.075)), o, r * 0.5, n),
      Se(i, at(n, e, 0.003, 6e-4, { hp: 4500 }), o, r * 0.55, n),
      Se(
        i,
        dn(
          n,
          0.3,
          [
            [1320 * s, 0.05, 1],
            [2130 * s, 0.04, 0.6],
            [3350 * s, 0.028, 0.4],
            [640 * s, 0.03, 0.3],
          ],
          e,
        ),
        o,
        r * 0.16,
        n,
      ),
      (o += Xt(e, 0.075, 0.13) * (a ? 0.7 : 1)),
      (r *= Xt(e, 0.5, 0.66)));
  }
  if (t !== 1)
    for (let a = 0; a < 6; a++)
      (Se(i, Xv(n, e, s * Xt(e, 1, 1.25), 0.012), o, r * 0.3, n),
        (o += 0.016 + 0.004 * a),
        (r *= 0.75));
  return s8(i, n, 200);
}

function I6(n, e, t) {
  let i = St(n, 2.2),
    s = t ? 0.9 : 1,
    o = 5e-4,
    r = St(n, 0.08);
  (Se(r, QR(n, 9e-4), 0, 1.2, n),
    Se(r, at(n, e, 0.03, 0.005, { hp: 1500 }), 0, 1.5, n),
    Wo(KR(r, 2), 2));
  let a = St(n, 2.1);
  Se(a, ei(n, 0.9, 122 * s, 47, 0.08, 0.16, 0.001), 0, 1, n);
  let l = Qn(n, 1.4, e);
  (di(l, "lp", Vo(3e3, 240, 0.5), 0.7, n),
    Se(a, KR(lo(l, n, co(0.2, 0.002))), 0, 1.3, n),
    Se(a, at(n, e, 0.45, 0.08, { bp: 500 * s, q: 1.2 }), 0, 0.8, n));
  let c = Qn(n, 2, e);
  (tn(c, "lp", 115, 0.7, n), Se(a, KR(lo(c, n, co(0.45, 0.03))), 0, 0.4, n));
  for (let [u, f, h] of [
    [0.13, 0.3, 1900],
    [0.235, 0.2, 1300],
    [0.41, 0.12, 800],
  ])
    Se(
      a,
      at(n, e, 0.25, 0.045, { hp: 110, lp: h, att: 0.004 }),
      u * (t ? 1.1 : 1),
      f,
      n,
    );
  (e8(KR(a), n, 0.3, 4, 5e-4, 0.09),
    Wo(KR(a, 1.6), 1.8),
    Se(i, r, o, 1, n),
    Se(i, a, o, 0.8, n),
    Se(
      i,
      KR(
        Jc(n, e, 1.9, 70, {
          from: 0.2,
          fall: 1.5,
          hp: 1500,
          lp: 9e3,
          ampFall: 0.6,
          maxLen: 0.008,
        }),
      ),
      0,
      0.3,
      n,
    ));
  for (let u = 0; u < 5; u++) {
    let f = Xt(e, 1e3, 3800);
    Se(
      i,
      dn(
        n,
        0.2,
        [
          [f, Xt(e, 0.02, 0.05), 1],
          [f * 1.61, 0.02, 0.5],
        ],
        e,
      ),
      Xt(e, 0.35, 1.5),
      Xt(e, 0.03, 0.08),
      n,
    );
  }
  return o8(Wo(KR(s8(i, n, 22), 2.2), 1.6), n, o);
}

function* z6(n, e, t) {
  let i = St(n, 4.2),
    s = t ? 0.93 : 1,
    o = 5e-4,
    r = St(n, 0.12);
  (Se(r, QR(n, 0.0014), 0, 1.3, n),
    Se(r, at(n, e, 0.03, 0.004, { hp: 2e3 }), 0, 1.6, n),
    Se(r, at(n, e, 0.1, 0.016, { hp: 500, lp: 8e3 }), 0, 1.1, n),
    Wo(KR(r, 2.4), 2.4));
  let a = St(n, 4.1);
  (Se(a, ei(n, 2.4, 52 * s, 29, 0.28, 0.42, 0.004), 0, 1, n),
    Se(a, ei(n, 1.4, 104 * s, 60, 0.2, 0.26, 0.002), 0, 0.7, n),
    yield);
  let l = Qn(n, 2.6, e);
  (di(l, "lp", Vo(4200, 170, 0.45), 0.7, n),
    Se(a, KR(lo(l, n, co(0.36, 0.003))), 0, 1.5, n),
    Se(a, at(n, e, 0.8, 0.14, { bp: 300 * s, q: 1 }), 0, 1, n),
    yield);
  let c = Qn(n, 4, e);
  (tn(c, "lp", 95, 0.7, n), Se(a, KR(lo(c, n, co(1, 0.05))), 0, 1, n));
  let u = Qn(n, 4, e);
  di(u, "lp", Vo(420, 110, 0.6), 0.7, n);
  let f = [];
  for (let d = 0; d < 6; d++)
    f.push([Xt(e, 0.5, 2.8), Xt(e, 0.12, 0.35), Xt(e, 0.4, 1)]);
  let h = (d) => {
    let m = 0.3;
    for (let [x, v, y] of f) {
      let b = (d - x) / v;
      m += y * Math.exp(-b * b);
    }
    return m * Math.exp(-d / 1.3) * (1 - Math.exp(-d / 0.15));
  };
  for (let d = 0, m = 0, x = 0; d < u.length; d++)
    ((d & 63) === 0 && ((m = h(d / n)), (x = (h((d + 64) / n) - m) / 64)),
      (u[d] *= m),
      (m += x));
  (Se(a, KR(u), 0, 0.55, n), yield);
  for (let [d, m, x] of [
    [0.16, 0.42, 1700],
    [0.29, 0.34, 1300],
    [0.47, 0.26, 950],
    [0.79, 0.17, 700],
    [1.22, 0.1, 520],
  ])
    Se(
      a,
      at(n, e, 0.5, 0.05 + d * 0.07, { hp: 70, lp: x, att: 0.006 }),
      d * (t ? 1.08 : 1),
      m,
      n,
    );
  (e8(KR(a), n, 0.4, 3, 5e-4, 0.1),
    Wo(KR(a, 1.7), 1.8),
    Se(i, r, o, 1, n),
    Se(i, a, o, 0.85, n),
    yield,
    Se(
      i,
      KR(
        Jc(n, e, 3.4, 170, {
          from: 0.3,
          fall: 1.6,
          hp: 1200,
          lp: 9e3,
          ampFall: 1,
          maxLen: 0.01,
        }),
      ),
      0,
      0.42,
      n,
    ));
  for (let d = 0; d < 11; d++) {
    let m = Xt(e, 900, 4200);
    Se(
      i,
      dn(
        n,
        0.3,
        [
          [m, Xt(e, 0.02, 0.07), 1],
          [m * 1.61, 0.025, 0.5],
          [m * 2.4, 0.012, 0.25],
        ],
        e,
      ),
      Xt(e, 0.35, 2.7),
      Xt(e, 0.04, 0.11),
      n,
    );
  }
  let p = Xt(e, 0.95, 1.3);
  for (let [d, m] of [
    [0, 1],
    [0.21, 0.5],
    [0.33, 0.28],
  ])
    (Se(
      i,
      dn(
        n,
        1,
        [
          [312 * s, 0.2, 1],
          [489 * s, 0.16, 0.8],
          [744 * s, 0.12, 0.6],
          [1183 * s, 0.08, 0.4],
          [1735 * s, 0.05, 0.3],
          [2620 * s, 0.03, 0.2],
        ],
        e,
      ),
      p + d,
      0.12 * m,
      n,
    ),
      Se(i, at(n, e, 0.02, 0.004, { hp: 900, lp: 5e3 }), p + d, 0.1 * m, n));
  return o8(Wo(KR(s8(i, n, 18), 2.2), 1.6), n, o);
}

function D6(n, e, t) {
  let i = St(n, 0.26),
    s = [1, 1.08, 0.93][t % 3],
    o = 5e-4,
    r = 0;
  Se(i, at(n, e, 0.006, 9e-4, { hp: 4200 }), o, 0.9, n);
  let a = St(n, 0.085);
  for (let l = 0; l < a.length; l++) {
    let c = l / n,
      u = (520 + 2300 * Math.exp(-c / 0.014)) * s;
    r += u / n;
    let f =
      Math.sign(Math.sin(vt * r)) * 0.6 +
      (2 * (r * 1.5 - Math.floor(r * 1.5)) - 1) * 0.5;
    a[l] = f * (0.75 + 0.25 * Math.sin(vt * 310 * c)) * Math.exp(-c / 0.02);
  }
  return (
    tn(a, "hp", 700 * s, 0.8, n),
    tn(a, "lp", 5200, 0.8, n),
    Se(i, KR(a), o, 1, n),
    Se(
      i,
      at(n, e, 0.12, 0.022, { hp: 2600, lp: 9500, att: 0.0015 }),
      o + 0.002,
      0.5,
      n,
    ),
    Se(i, at(n, e, 0.05, 0.009, { bp: 1750 * s, q: 2.5 }), o, 0.4, n),
    Se(
      i,
      e_(
        n,
        e,
        [
          [3450 * s, 0.005, 1],
          [5300, 0.004, 0.6],
          [2050, 0.007, 0.4],
        ],
        { hp: 3200, tick: 0.5 },
      ),
      o + 0.024,
      0.24,
      n,
    ),
    s8(Wo(KR(i), 1.5), n, 350)
  );
}

function L6(n, e, t) {
  let i = St(n, 0.42),
    s = [1, 0.94, 1.06][t % 3],
    o = 5e-4,
    r = 0,
    a = 0;
  Se(i, at(n, e, 0.008, 0.0013, { hp: 2800 }), o, 0.8, n);
  let l = St(n, 0.17);
  for (let u = 0; u < l.length; u++) {
    let f = u / n,
      h = (150 + 760 * Math.exp(-f / 0.028)) * s;
    ((r += h / n), (a += (h * 2.76 + 90) / n));
    let p = 2 * (r - Math.floor(r)) - 1;
    l[u] =
      (p * 0.8 + Math.sin(vt * r) * Math.sin(vt * a) * 0.9) *
      Math.exp(-f / 0.04) *
      (1 - Math.exp(-f / 6e-4));
  }
  (tn(l, "hp", 170, 0.8, n),
    tn(l, "lp", 3600, 0.8, n),
    Se(i, KR(l), o, 1, n),
    Se(i, ei(n, 0.09, 210 * s, 92 * s, 0.016, 0.024, 8e-4), o, 0.6, n),
    Se(i, at(n, e, 0.07, 0.014, { bp: 640 * s, q: 1.8 }), o, 0.55, n));
  let c = Qn(n, 0.3, e);
  return (
    di(c, "bp", Vo(3800, 1500), 0.9, n),
    lo(c, n, co(0.065, 0.012)),
    Se(i, KR(c), o + 0.03, 0.34, n),
    Se(
      i,
      e_(
        n,
        e,
        [
          [1380 * s, 0.012, 1],
          [2260 * s, 0.009, 0.7],
          [3540, 0.006, 0.45],
        ],
        { hp: 1800, tick: 0.6 },
      ),
      o + 0.062,
      0.26,
      n,
    ),
    s8(Wo(KR(i), 1.7), n, 80)
  );
}

function F6(n, e, t) {
  let i = St(n, 0.32),
    s = Qn(n, 0.3, e),
    o = [5200, 4300, 6100][t % 3],
    r = [1300, 1e3, 1700][t % 3],
    a = 0.05;
  di(s, "bp", Vo(o, r, 0.8), 3.5, n);
  for (let l = 0; l < s.length; l++) {
    let c = (l / n - a) / (l / n < a ? 0.018 : 0.055);
    s[l] *= Math.exp(-c * c);
  }
  return (
    Se(i, KR(s), 0, 1, n),
    Se(i, QR(n, 18e-5), a - 0.002, 0.5, n),
    Se(i, at(n, e, 0.006, 7e-4, { hp: 3500 }), a - 0.002, 0.55, n),
    Se(i, jc(n, 0.2, o * 0.5, r * 0.6), 0, 0.03, n),
    s8(i, n, 300)
  );
}

var Ci = {
  bpm: 96,
  beat: 0.625,
  bar: 2.5,
  s16: 0.15625,
  cycleBars: 8,
  formBars: 16,
  sr: 22050,
  srLo: 16e3,
  key: "D minor (aeolian)",
  scale: [2, 4, 5, 7, 9, 10, 0],
  swing: 0.01,
  riserPeak: 5,
  chords: ["Dm", "Bb/D", "Gm/D", "Dsus2 | Am7/D"],
  motif: {
    call: ["D4", "A4", "Bb4", "F4"],
    answer: ["D4", "G4", "A4", "E4"],
    resolve: ["F4", "E4", "D4"],
  },
  cells: [
    [62, 69],
    [70, 65],
    [62, 67],
    [69, 64],
  ],
  cellSecond: 0.9375,
  loops: {
    music_drone: 16,
    music_strings: 8,
    music_pulse: 16,
    music_ticks: 6,
    music_drums: 8,
    music_brass: 8,
    music_lift: 8,
  },
};

var Ct = Ci.bar;

var qa_2 = Ci.beat;

var qn_2 = Ci.s16;

var Ko = Ci.sr;

var i5 = Ci.srLo;

var N6 = [57, 58, 58, 57];

var lI = [65, 65, 67, 64];

var U6 = [69, 70, 70, 69];

var cI = [74, 74, 74, 76];

var Zv = [57, 58, 58, 57];

var uI = [53, 53, 55, 52];

var fI = [
  [38, 50, 57],
  [38, 53, 58],
  [38, 55, 58],
  [38, 52, 57],
];

var hI = [
  [50, 57, 62],
  [53, 58, 62],
  [55, 58, 62],
  [52, 57, 64],
];

var bu = {
  drone: 0.071,
  strings: 0.062,
  pulse: 0.078,
  ticks: 0.03,
  drums: 0.122,
  brass: 0.08,
  lift: 0.071,
};

function Mu(n, e) {
  let t = 0,
    i = 0;
  for (let o of n) {
    for (let r = 0; r < o.length; r++) t += o[r] * o[r];
    i += o.length;
  }
  let s = e / Math.sqrt(t / i || 1);
  for (let o of n) ml(o, s);
  return n;
}

var dI = [0, 3, 6, 8, 11, 14];

var pI_2 = (n, e, t) => Math.min(t, Math.max(e, n));

function Xl(n, e) {
  let t = Math.sqrt(1 + e * e) / e;
  for (let i = 0; i < n.length; i++) {
    let s = n[i] * e;
    n[i] = (s / Math.sqrt(1 + s * s)) * t;
  }
  return n;
}

function Jo(n, e, t, i, s = {}) {
  let o = Qn(n, t, e);
  (s.hp && tn(o, "hp", s.hp, 0.707, n),
    s.lp && tn(o, "lp", s.lp, 0.707, n),
    s.bp && tn(o, "bp", s.bp, s.q || 1, n));
  let r = Math.exp(-1 / (i * n)),
    a = s.att > 0 ? Math.exp(-1 / (s.att * n)) : 0,
    l = 1,
    c = 1,
    u = 0;
  for (let f = 0; f < o.length; f++) {
    let h = o[f] * l * (1 - c);
    ((o[f] = h), (l *= r), (c *= a), h > u ? (u = h) : -h > u && (u = -h));
  }
  return u > 0 ? ml(o, 1 / u) : o;
}

function s5(n, e, t, i, s, o, r = 6e-4) {
  let a = St(n, e),
    l = Math.exp(-1 / (s * n)),
    c = Math.exp(-1 / (o * n)),
    u = Math.exp(-1 / (r * n)),
    f = (vt * i) / n,
    h = 0,
    p = (vt * (t - i)) / n,
    d = 1,
    m = 1;
  for (let x = 0; x < a.length; x++)
    ((h += f + p),
      h > vt && (h -= vt),
      (a[x] = Math.sin(h) * d * (1 - m)),
      (p *= l),
      (d *= c),
      (m *= u));
  return a;
}

function xo(n, e, t, i, s, o = 0.4) {
  let [r, a, l, c, u] = Av(e, t, i, s),
    f = n.length,
    h = 0,
    p = 0;
  for (let d = Math.max(0, f - Math.round(o * s)); d < f; d++) {
    let m = n[d],
      x = r * m + h;
    ((h = a * m - c * x + p), (p = l * m - u * x));
  }
  for (let d = 0; d < f; d++) {
    let m = n[d],
      x = r * m + h;
    ((h = a * m - c * x + p), (p = l * m - u * x), (n[d] = x));
  }
  return n;
}

function o5(n, e, t, i, s = 0.4) {
  let o = n.length,
    r = Math.max(0, o - Math.round(s * i)),
    a = 0,
    l = 0,
    c = null;
  for (let u = r; u < o; u++) {
    ((u & 63) === 0 || u === r) && (c = Av("lp", e(u / o), t, i));
    let f = n[u],
      h = c[0] * f + a;
    ((a = c[1] * f - c[3] * h + l), (l = c[2] * f - c[4] * h));
  }
  for (let u = 0; u < o; u++) {
    (u & 63) === 0 && (c = Av("lp", e(u / o), t, i));
    let f = n[u],
      h = c[0] * f + a;
    ((a = c[1] * f - c[3] * h + l), (l = c[2] * f - c[4] * h), (n[u] = h));
  }
  return n;
}

function _u(n, e, t, i) {
  let s = n.length,
    o = i ? Math.max(0, s - Math.round(0.3 * e)) : s;
  for (let [r, a, l] of t) {
    let c = Math.sqrt(1 + l),
      u = (vt * r) / e,
      f = Math.sin(u) / (2 * a),
      h = Math.cos(u),
      p = 1 + f / c,
      d = (1 + f * c) / p,
      m = (-2 * h) / p,
      x = (1 - f * c) / p,
      v = (-2 * h) / p,
      y = (1 - f / c) / p,
      b = 0,
      g = 0;
    for (let E = o; E < s; E++) {
      let M = n[E],
        _ = d * M + b;
      ((b = m * M - v * _ + g), (g = x * M - y * _));
    }
    for (let E = 0; E < s; E++) {
      let M = n[E],
        _ = d * M + b;
      ((b = m * M - v * _ + g), (g = x * M - y * _), (n[E] = _));
    }
  }
  return n;
}

var g1_2 = [
  [520, 1.4, 0.35],
  [1350, 1.6, 0.22],
];

function B6(n, e, t, i = 13, s = 2.2, o = 0.3) {
  return (
    n.forEach((r, a) => {
      let l = r.length,
        c = r.slice(),
        u = a * 2.1,
        f = o * (a ? -1 : 1),
        h = (m) =>
          (i + s * Math.sin((vt * t * m) / l + u) + (a ? 3.1 : 0)) * 0.001 * e,
        p = h(0),
        d = 0;
      for (let m = 0; m < l; m++) {
        (m & 63) === 0 && ((p = h(m)), (d = (h(m + 64) - p) / 64));
        let x = m - p;
        ((p += d), x < 0 && (x += l));
        let v = x | 0,
          y = x - v;
        r[m] = c[m] + f * (c[v] + (c[v + 1 < l ? v + 1 : 0] - c[v]) * y);
      }
    }),
    n
  );
}

function mI(n, e, t, i = 40, s = 120) {
  let o = n.length,
    r = new Float32Array(o),
    a = new Float32Array(o);
  for (let l = 0; l < o; l++)
    ((r[l] = 0.5 * (n[l] + e[l])), (a[l] = 0.5 * (n[l] - e[l])));
  (xo(r, "hp", i, 0.707, t, 0.6),
    xo(a, "hp", s, 0.707, t),
    xo(a, "hp", s, 0.707, t));
  for (let l = 0; l < o; l++) ((n[l] = r[l] + a[l]), (e[l] = r[l] - a[l]));
}

var gI = [0.0297, 0.0371, 0.0411, 0.0437, 0.0533, 0.0617, 0.0683, 0.0741];

function xI(n, e, t = {}, i = 1) {
  let s = e / 2,
    o = n.length,
    r = o >> 1,
    a = new Float32Array(r),
    l = t.rt || 2.4,
    c = t.size || 1,
    u = t.damp ?? 0.3,
    f = Math.round((t.pre ?? 0.018) * e) & -2,
    h = 1 - u,
    p = gI.map((X) => Math.round(X * c * s) | 1),
    d = p.map((X) => Math.pow(10, (-3 * X) / s / l)),
    m = new Float32Array(p[0]),
    x = new Float32Array(p[1]),
    v = new Float32Array(p[2]),
    y = new Float32Array(p[3]),
    b = new Float32Array(p[4]),
    g = new Float32Array(p[5]),
    E = new Float32Array(p[6]),
    M = new Float32Array(p[7]),
    [_, T, w, S, R, z, I, L] = p,
    [U, k, C, A, F, H, N, Z] = d,
    Q = 0,
    W = 0,
    J = 0,
    G = 0,
    te = 0,
    oe = 0,
    ee = 0,
    le = 0,
    xe = 0,
    j = 0,
    O = 0,
    q = 0,
    ue = 0,
    de = 0,
    $ = 0,
    se = 0,
    fe = Math.round(0.0051 * s) | 1,
    me = Math.round(0.0127 * s) | 1,
    ge = new Float32Array(fe),
    ce = new Float32Array(me),
    P = 0,
    D = 0;
  for (let X = 0; X < r; X++) {
    let re = 2 * X - f,
      Y =
        re >= 3 && re < o - 3
          ? (16 * n[re] +
              9 * (n[re - 1] + n[re + 1]) -
              (n[re - 3] + n[re + 3])) *
            0.0109375
          : 0;
    {
      let Ge = ge[P],
        _e = Y + 0.6 * Ge;
      ((ge[P] = _e), (Y = Ge - 0.6 * _e), ++P === fe && (P = 0));
    }
    {
      let Ge = ce[D],
        _e = Y + 0.6 * Ge;
      ((ce[D] = _e), (Y = Ge - 0.6 * _e), ++D === me && (D = 0));
    }
    let he = m[Q],
      V = x[W],
      ne = v[J],
      ye = y[G],
      Te = b[te],
      Re = g[oe],
      Ue = E[ee],
      Ve = M[le],
      ze = (he + V + ne + ye + Te + Re + Ue + Ve) * 0.25;
    ((xe += (he - ze - xe) * h),
      (m[Q] = xe * U + Y),
      ++Q === _ && (Q = 0),
      (j += (V - ze - j) * h),
      (x[W] = j * k + Y),
      ++W === T && (W = 0),
      (O += (ne - ze - O) * h),
      (v[J] = O * C + Y),
      ++J === w && (J = 0),
      (q += (ye - ze - q) * h),
      (y[G] = q * A + Y),
      ++G === S && (G = 0),
      (ue += (Te - ze - ue) * h),
      (b[te] = ue * F + Y),
      ++te === R && (te = 0),
      (de += (Re - ze - de) * h),
      (g[oe] = de * H + Y),
      ++oe === z && (oe = 0),
      ($ += (Ue - ze - $) * h),
      (E[ee] = $ * N + Y),
      ++ee === I && (ee = 0),
      (se += (Ve - ze - se) * h),
      (M[le] = se * Z + Y),
      ++le === L && (le = 0),
      (a[X] = (he - V + ne - ye + Te - Re + Ue - Ve) * 0.5));
  }
  tn(a, "hp", t.hp || 180, 0.707, s);
  let B = i;
  for (let X = 2; X < r - 3; X++)
    ((n[2 * X] += a[X] * B),
      (n[2 * X + 1] +=
        (3 * (a[X - 2] + a[X + 3]) -
          25 * (a[X - 1] + a[X + 2]) +
          150 * (a[X] + a[X + 1])) *
        (B / 256)));
  return n;
}

function Yl(n, e, t, i) {
  return xI(n, e, i, t);
}

function gs(n, e, t, i, s, o) {
  let r = n[0].length,
    a = n.length > 1,
    l = o.n || 5,
    c = o.det ?? 8,
    u = o.att ?? 0.5,
    f = o.rel ?? 0.6,
    h = o.rng,
    p = (o.g ?? 1) / Math.sqrt(l),
    d = o.swell ? o.swell[0] : 1,
    m = o.swell ? o.swell[1] : 1,
    x = o.swp || 1,
    v = Math.min(f * 3, o.tail ?? 99),
    y = Math.round((s + v) * e),
    b = ((Math.round(i * e) % r) + r) % r,
    g = a ? (o.width ?? 0.75) : 0,
    E = o.pan || 0,
    M = o.drift ?? 0.0012,
    _ = o.trem,
    T = n[0],
    w = a ? n[1] : null;
  for (let S = 0; S < l; S++) {
    let R = l > 1 ? (S / (l - 1)) * 2 - 1 : 0,
      z = t * Math.pow(2, (R * c + (h() - 0.5) * c * 0.4) / 1200),
      I = l > 1 ? (((S * 3 + 1) % l) / (l - 1)) * 2 - 1 : 0,
      L = pI_2(E + I * g, -1, 1),
      U = a ? Math.cos(((L + 1) * Math.PI) / 4) * p * Math.SQRT2 : p,
      k = a ? Math.sin(((L + 1) * Math.PI) / 4) * p * Math.SQRT2 : 0,
      C = u * (0.65 + 0.7 * h()),
      A = M * (0.5 + h()),
      F = vt * (0.07 + 0.2 * h()),
      H = h() * vt,
      N = _ ? vt * _.rate * (0.93 + 0.14 * h()) : 0,
      Z = h() * vt,
      Q = _ ? _.depth : 0,
      W = (oe) => {
        let ee = oe < C ? 0.5 - 0.5 * Math.cos((Math.PI * oe) / C) : 1;
        if (oe < s)
          d !== m
            ? (ee *= d + (m - d) * (x === 1 ? oe / s : Math.pow(oe / s, x)))
            : (ee *= d);
        else {
          let le = oe - s;
          ee *= m * Math.exp(-le / f) * Math.max(0, 1 - le / v);
        }
        return (Q && (ee *= 1 - Q * (0.5 - 0.5 * Math.cos(N * oe + Z))), ee);
      },
      J = h(),
      G = b,
      te = W(0);
    for (let oe = 0; oe < y; oe += 32) {
      let ee = oe / e,
        le = te;
      te = W((oe + 32) / e);
      let xe = (te - le) / 32,
        j = (z * (1 + A * Math.sin(F * ee + H))) / e,
        O = 1 - j,
        q = Math.min(32, y - oe),
        ue = le;
      if (G + q <= r) {
        if (w)
          for (let de = 0; de < q; de++, G++) {
            ((J += j), J >= 1 && (J -= 1));
            let $ = J + J - 1;
            if (J < j) {
              let se = J / j;
              $ -= se + se - se * se - 1;
            } else if (J > O) {
              let se = (J - 1) / j;
              $ -= se * se + se + se + 1;
            }
            (($ *= ue), (ue += xe), (T[G] += $ * U), (w[G] += $ * k));
          }
        else
          for (let de = 0; de < q; de++, G++) {
            ((J += j), J >= 1 && (J -= 1));
            let $ = J + J - 1;
            if (J < j) {
              let se = J / j;
              $ -= se + se - se * se - 1;
            } else if (J > O) {
              let se = (J - 1) / j;
              $ -= se * se + se + se + 1;
            }
            ((T[G] += $ * ue * U), (ue += xe));
          }
        G === r && (G = 0);
      } else
        for (let de = 0; de < q; de++) {
          ((J += j), J >= 1 && (J -= 1));
          let $ = J + J - 1;
          if (J < j) {
            let se = J / j;
            $ -= se + se - se * se - 1;
          } else if (J > O) {
            let se = (J - 1) / j;
            $ -= se * se + se + se + 1;
          }
          (($ *= ue),
            (ue += xe),
            (T[G] += $ * U),
            w && (w[G] += $ * k),
            ++G >= r && (G = 0));
        }
    }
  }
}

function mh(n, e) {
  let t = n.length,
    i = new Float32Array(t * 2),
    s = e ? (o) => n[(o + t) % t] : (o) => (o < 0 || o >= t ? 0 : n[o]);
  for (let o = 0; o < t; o++)
    ((i[2 * o] = n[o]),
      (i[2 * o + 1] =
        o >= 2 && o < t - 3
          ? (3 * (n[o - 2] + n[o + 3]) -
              25 * (n[o - 1] + n[o + 2]) +
              150 * (n[o] + n[o + 1])) /
            256
          : (3 * (s(o - 2) + s(o + 3)) -
              25 * (s(o - 1) + s(o + 2)) +
              150 * (s(o) + s(o + 1))) /
            256));
  return i;
}

function Ya_2(n, e, t, i) {
  let s = e < 400,
    o = s ? n / 2 : n,
    r = i.n || 4,
    a = i.det ?? 7,
    l = i.vel ?? 0.8,
    c = i.att ?? 0.045,
    u = i.rel ?? 0.16,
    f = i.rng,
    h = i.swell || [1, 1],
    p = i.swp || 1.6,
    d = Math.round((t + u * 3.5) * o),
    m = new Float32Array(d),
    x = Math.max(h[0], h[1]),
    v = 1 - Math.exp(-t / c),
    y = Math.ceil(d / 32) + 1,
    b = (U) =>
      U < t
        ? (1 - Math.exp(-U / c)) * (h[0] + (h[1] - h[0]) * Math.pow(U / t, p))
        : v * h[1] * Math.exp(-(U - t) / u),
    g = i.scoop ?? -35,
    E = i.bright ?? 8,
    M = i.vib ?? 1,
    _ = 0.8 / Math.sqrt(r),
    T = new Float32Array(y),
    w = new Float32Array(y);
  for (let U = 0; U < y; U++) {
    let k = (U * 32) / o;
    ((T[U] = b(k)),
      (w[U] =
        Math.pow(2, (g * Math.exp(-k / 0.028)) / 1200) *
        (1 + 0.0035 * M * Math.sin(vt * 5.2 * k) * Math.min(1, k / 0.7))));
  }
  for (let U = 0; U < r; U++) {
    let k =
        (e *
          Math.pow(
            2,
            ((r > 1 ? (U / (r - 1)) * 2 - 1 : 0) * a + (f() - 0.5) * 3) / 1200,
          )) /
        o,
      C = f();
    for (let A = 0, F = 0; A < d; A += 32, F++) {
      let H = k * w[F],
        N = 1 - H,
        Z = Math.min(d, A + 32);
      for (let Q = A; Q < Z; Q++) {
        ((C += H), C >= 1 && (C -= 1));
        let W = C + C - 1;
        if (C < H) {
          let J = C / H;
          W -= J + J - J * J - 1;
        } else if (C > N) {
          let J = (C - 1) / H;
          W -= J * J + J + J + 1;
        }
        m[Q] += W;
      }
    }
  }
  let S = (U) =>
      Av(
        "lp",
        Math.min(
          o * 0.42,
          e * (1.3 + E * l * Math.pow(T[Math.min(y - 1, U)] / x, 1.4)),
        ),
        0.9,
        o,
      ),
    R = 0,
    z = 0,
    I = S(0);
  for (let U = 0, k = 0; U < d; U += 32, k++) {
    let C = I;
    I = S(k + 1);
    let A = Math.min(d, U + 32),
      F = (T[Math.min(y - 1, k + 1)] - T[k]) / 32,
      H = (I[0] - C[0]) / 32,
      N = (I[1] - C[1]) / 32,
      Z = (I[2] - C[2]) / 32,
      Q = (I[3] - C[3]) / 32,
      W = (I[4] - C[4]) / 32,
      J = T[k],
      G = C[0],
      te = C[1],
      oe = C[2],
      ee = C[3],
      le = C[4];
    for (let xe = U; xe < A; xe++) {
      let j = m[xe] * _,
        O = G * j + R;
      ((R = te * j - ee * O + z), (z = oe * j - le * O));
      let q = O * J * 1.3;
      ((m[xe] = (q / Math.sqrt(1 + q * q)) * 0.8),
        (J += F),
        (G += H),
        (te += N),
        (oe += Z),
        (ee += Q),
        (le += W));
    }
  }
  Se(
    m,
    Jo(o, f, 0.05, 0.014, { bp: Math.min(2400, e * 5), q: 0.8, att: 0.004 }),
    0,
    0.05 * l,
    o,
  );
  let L = Math.min(d, Math.round(0.02 * o));
  for (let U = 0; U < L; U++) m[d - 1 - U] *= U / L;
  return s ? mh(m, !1) : m;
}

function H6_2(n, e, t, i, s = {}) {
  let o = s.dur || 0.5,
    r = Math.round(o * n),
    a = new Float32Array(r),
    l = n / e,
    c = s.damp ?? 0.5 - 0.22 * t,
    u = s.tau || 0.2,
    f = Math.floor(l - c - 0.1),
    h = l - c - f,
    p = (1 - h) / (1 + h),
    d = Math.exp(-l / (n * u * 2.2)),
    m = new Float32Array(f),
    x = 0,
    v = 0,
    y = 0.16 + 0.62 * t;
  for (let S = 0; S < f; S++)
    ((x += (i() * 2 - 1 - x) * y), (m[S] = x), (v += x));
  v /= f;
  let b = Math.max(1, Math.round(f * 0.19)),
    g = new Float32Array(f);
  for (let S = 0; S < f; S++) g[S] = m[S] - v - 0.55 * (m[(S + b) % f] - v);
  let E = 0,
    M = 0;
  for (let S = 0; S < r; S++) {
    let R = S >= f ? a[S - f] : 0,
      z = S > f ? a[S - f - 1] : 0,
      I = (1 - c) * R + c * z,
      L = p * I + E - p * M;
    ((E = I), (M = L), (a[S] = (S < f ? g[S] : 0) + d * L));
  }
  let _ = s.mute || 0.14;
  for (let S = 0; S < r; S++) {
    let R = S / n;
    a[S] *= Math.exp(-R / _) * Math.min(1, S / (0.0012 * n));
  }
  Se(a, Jo(n, i, 0.03, 0.007, { lp: 500 }), 0, 0.12 * Qb(a) * t, n);
  let T = Qb(a);
  T > 0 && ml(a, 1 / T);
  let w = Math.round(0.02 * n);
  for (let S = 0; S < w; S++) a[r - 1 - S] *= S / w;
  return a;
}

function vI(n, e, t) {
  let i = St(n, e),
    s = 0;
  for (let o of t) s = Math.max(s, o[2]);
  for (let [o, r, a] of t) {
    if (o > n * 0.46 || a < s * 0.001) continue;
    let l = (vt * o) / n,
      c = Math.exp(-1 / (r * n)),
      u = 2 * c * Math.cos(l),
      f = c * c,
      h = Math.min(
        i.length,
        Math.ceil(Math.log((s * 0.001) / a) / Math.log(c)) + 1,
      ),
      p = (-a / c) * Math.sin(l),
      d = 0;
    for (let m = 0; m < h; m++) {
      i[m] += d;
      let x = u * d - f * p;
      ((p = d), (d = x));
    }
  }
  return i;
}

function Xa_2(n, e, t, i, s) {
  let o = n / 2,
    r = 32e-5 * Math.pow(e / 262, 1.2),
    a = Math.min(8, Math.floor((0.46 * o) / e)),
    l = [];
  for (let h = 1; h <= a; h++) {
    let p = h * e * Math.sqrt(1 + r * h * h),
      d =
        Math.pow(h, -1.45) *
        Math.abs(Math.sin((Math.PI * h) / 7.6)) *
        Math.pow(t, (h - 1) * 0.3),
      m = (i * 0.36) / (1 + 0.33 * (h - 1));
    h <= 2
      ? l.push([p * 0.9996, m, d * 0.55], [p * 1.0006, m * 0.82, d * 0.45])
      : l.push([p, m, d]);
  }
  let c = vI(o, i, l),
    u = Math.round(0.007 * o);
  for (let h = 0; h < u; h++) c[h] *= h / u;
  Se(c, Jo(o, s, 0.06, 0.014, { lp: 420, att: 0.003 }), 0, 0.1 * t, o);
  let f = Math.round(0.25 * o);
  for (let h = 0; h < f && h < c.length; h++) c[c.length - 1 - h] *= h / f;
  return mh(ml(c, t), !1);
}

function m1_2(n, e, t, i) {
  let s = St(n, 0.9);
  return (
    Se(
      s,
      s5(n, 0.9, t * (1.5 + 0.6 * i), t, 0.016, 0.16 + 0.1 * i, 0.0012),
      0,
      1,
      n,
    ),
    Se(s, s5(n, 0.35, t * 1.59 * 1.25, t * 1.59, 0.02, 0.07, 0.001), 0, 0.3, n),
    Se(
      s,
      dn(
        n,
        0.25,
        [
          [t * 2.3, 0.05, 0.16],
          [t * 2.65, 0.04, 0.11],
          [t * 3.16, 0.03, 0.08],
          [t * 3.6, 0.025, 0.05],
        ],
        e,
      ),
      0,
      1,
      n,
    ),
    Se(s, Jo(n, e, 0.14, 0.026, { bp: 520, q: 0.6 }), 0, 0.2 + 0.32 * i, n),
    Se(s, Jo(n, e, 0.012, 0.0022, { hp: 2200 }), 0, 0.1 + 0.2 * i, n),
    Xl(s, 1.2 + 0.5 * i)
  );
}

function yu(n, e, t = 1) {
  let i = St(n, 1.6);
  return (
    Se(i, s5(n, 1.6, 124, 55, 0.045, 0.34 * t, 0.002), 0, 1, n),
    Se(i, Jo(n, e, 0.5, 0.09, { lp: 150 }), 0, 0.7, n),
    Se(i, Jo(n, e, 0.16, 0.03, { bp: 700, q: 0.5 }), 0, 0.3, n),
    Se(i, Jo(n, e, 0.02, 0.004, { hp: 1800 }), 0, 0.12, n),
    Xl(i, 1.5)
  );
}

function gh(n, e, t, i, s = 1) {
  let o = [];
  for (let [l, c] of [
    [1, 1],
    [2.756, 0.7],
    [5.404, 0.5],
    [8.933, 0.32],
    [13.34, 0.2],
  ])
    o.push([
      t * l * (1 + (e() - 0.5) * 0.01),
      (i * 0.3) / (1 + (l - 1) * 0.16),
      c * Math.pow(s, Math.log2(l)),
    ]);
  for (let l = 0; l < 14; l++) {
    let c = 1.2 + 9 * Math.pow(e(), 1.4);
    o.push([
      t * c,
      ((i * 0.2) / (1 + (c - 1) * 0.3)) * (0.5 + e()),
      0.22 * e() * Math.pow(s, Math.log2(c)),
    ]);
  }
  let r = dn(n, i, o, e);
  Se(r, Jo(n, e, 0.01, 0.0018, { hp: 1500 }), 0, 0.5 * s, n);
  let a = Qb(r);
  return Xl(ml(r, 1 / a), 1.4);
}

function yI(n, e, t) {
  let i = n.length,
    s = Math.round(Ns(38) * t) / t,
    o = s / e,
    r = vt * o,
    a = 2 * Math.cos(r),
    l = 0,
    c = 1,
    u = 0,
    f = -Math.sin(r);
  for (let h = 0; h < i; h++) {
    (h & 255) === 0 &&
      ((c = 0.8 + 0.2 * Math.sin((vt * 4 * h) / i - 1.2)),
      (u = Math.sin(r * h)),
      (f = Math.sin(r * (h - 1))));
    let p = l < 0.25 ? 4 * l : l < 0.75 ? 2 - 4 * l : 4 * l - 4,
      d = (0.8 * u + 0.24 * p) * 1.5 * c;
    n[h] += (d / Math.sqrt(1 + d * d)) * 0.105;
    let m = a * u - f;
    ((f = u), (u = m), (l += o), l >= 1 && (l -= 1));
  }
}

var r5 = (n, e, t = 1) => {
  for (let i = 0; i < n.length; i++) n[i] += e[i] * t;
  return n;
};

function O6(n, e, t) {
  let i = n.length;
  for (let s = 0; s < t.length; s++) {
    let [o, r] = t[s],
      a = (s + 1) * e;
    for (let l = 0; l < i; l++) {
      let c = l - a;
      (c < 0 && (c += i), (n[l] += r * o[c]));
    }
  }
  return n;
}

function* bI(n, e) {
  let t = n / 2,
    i = 16 * Ct,
    s = Math.round(i * t),
    o = new Float32Array(s),
    r = new Float32Array(s),
    a = new Float32Array(s),
    l = [r, a];
  (yI(o, t, i), yield);
  {
    let u = Math.round(4 * Ct * t),
      f = new Float32Array(u),
      h = new Float32Array(u);
    (gs([f], t, Ns(38), -0.9, 4 * Ct - 1, {
      n: 3,
      det: 6,
      att: 1.5,
      rel: 0.9,
      g: 0.15,
      swell: [0.8, 1],
      rng: e,
    }),
      yield,
      gs([h], t, Ns(50), -0.9, 4 * Ct - 1, {
        n: 3,
        det: 8,
        att: 1.7,
        rel: 0.9,
        g: 0.16,
        swell: [0.85, 1],
        rng: e,
      }),
      yield);
    for (let p = 0; p < 4; p++)
      (Us(o, f, p * 4 * Ct, 1, t), Us(o, h, (p * 4 + 2) * Ct, 1, t));
  }
  (o5(
    o,
    (u) => 520 + 150 * Math.sin(vt * u - 0.6) + 70 * Math.sin(vt * 3 * u + 1),
    0.8,
    t,
  ),
    yield,
    gs(l, t, Ns(62), -1, 8 * Ct - 0.8, {
      n: 2,
      det: 7,
      att: 2.2,
      rel: 0.8,
      g: 0.085,
      width: 0.5,
      rng: e,
    }),
    yield);
  for (let u = 0; u < 4; u++) {
    let f = u * 2 * Ct - 0.7;
    (gs(l, t, Ns(N6[u]), f, 2 * Ct - 0.1, {
      n: 3,
      det: 9,
      att: 1.4,
      rel: 0.7,
      g: 0.12,
      width: 0.8,
      swell: [0.75, 1],
      rng: e,
    }),
      yield,
      gs(l, t, Ns(lI[u]), f + 0.25, 2 * Ct - 0.35, {
        n: 3,
        det: 10,
        att: 1.7,
        rel: 0.75,
        g: 0.095,
        width: 0.9,
        swell: [0.7, 1],
        rng: e,
      }),
      yield);
  }
  for (let u = 0; u < 4; u++)
    (gs(l, t, Ns(N6[u]), (8 + u * 2) * Ct - 0.7, 2 * Ct - 0.1, {
      n: 4,
      det: 10,
      att: 1.6,
      rel: 0.75,
      g: 0.16,
      width: 0.85,
      swell: [0.8, 1],
      rng: e,
    }),
      yield);
  (gs(l, t, Ns(74), 8 * Ct + 0.5, 6 * Ct, {
    n: 2,
    det: 5,
    att: 3.5,
    rel: 1.2,
    g: 0.045,
    width: 0.9,
    swell: [0.6, 1],
    rng: e,
  }),
    yield,
    gs(l, t, Ns(81), 10 * Ct, 3.5 * Ct, {
      n: 2,
      det: 4,
      att: 3,
      rel: 1.3,
      g: 0.02,
      width: 0.9,
      rng: e,
    }),
    yield,
    gs(l, t, Ns(60), 14 * Ct - 0.4, 2 * Ct - 0.4, {
      n: 3,
      det: 9,
      att: 1.5,
      rel: 0.7,
      g: 0.09,
      width: 0.7,
      rng: e,
    }),
    yield,
    gs(l, t, Ns(64), 14 * Ct - 0.1, 2 * Ct - 0.7, {
      n: 3,
      det: 9,
      att: 1.7,
      rel: 0.7,
      g: 0.085,
      width: 0.9,
      rng: e,
    }),
    yield);
  for (let u of l)
    (o5(
      u,
      (f) =>
        1250 + 380 * Math.sin(vt * 2 * f + 0.5) + 160 * Math.sin(vt * 5 * f),
      0.75,
      t,
    ),
      yield,
      _u(
        u,
        t,
        [
          [290, 1.3, 0.4],
          [1050, 1.6, 0.3],
        ],
        !0,
      ),
      yield);
  (B6(l, t, 7),
    yield,
    r5(r, o),
    r5(a, o),
    mI(r, a, t, 42, 120),
    yield,
    Mu(l, bu.drone));
  let c = mh(r, !0);
  return (yield, [c, mh(a, !0)]);
}

function* MI(n, e) {
  let t = Math.round(8 * Ct * n),
    i = new Float32Array(t),
    s = new Float32Array(t),
    o = [i, s];
  for (let r = 0; r < 4; r++) {
    let a = r * 2 * Ct - 0.35,
      l = { rate: 12.8, depth: 0.5 };
    (gs(o, n, Ns(U6[r]), a, 2 * Ct - 0.15, {
      n: 4,
      det: 10,
      att: 0.9,
      rel: 0.45,
      g: 0.1,
      width: 0.9,
      pan: -0.15,
      swell: [0.5, 1],
      swp: 1.5,
      trem: l,
      rng: e,
    }),
      yield,
      gs(o, n, Ns(cI[r]), a + 0.1, 2 * Ct - 0.25, {
        n: 4,
        det: 11,
        att: 1.1,
        rel: 0.45,
        g: 0.085,
        width: 0.9,
        pan: 0.15,
        swell: [0.45, 1],
        swp: 1.5,
        trem: l,
        rng: e,
      }),
      yield,
      gs(o, n, Ns(U6[r] - 12), a, 2 * Ct - 0.15, {
        n: 2,
        det: 8,
        att: 1.2,
        rel: 0.5,
        g: 0.05,
        width: 0.6,
        swell: [0.6, 1],
        rng: e,
      }),
      yield);
  }
  (gs(o, n, Ns(86), 0.4, 8 * Ct - 2.2, {
    n: 2,
    det: 4,
    att: 3,
    rel: 0.5,
    g: 0.012,
    width: 1,
    swell: [0.7, 1],
    rng: e,
  }),
    yield);
  for (let r of o)
    (o5(
      r,
      (a) =>
        2900 + 800 * Math.sin(vt * 4 * a - 1.57) + 300 * Math.sin(vt * 3 * a),
      0.7,
      n,
    ),
      yield,
      _u(
        r,
        n,
        [
          [480, 1.4, 0.3],
          [1500, 1.8, 0.28],
        ],
        !0,
      ),
      yield);
  return (
    B6(o, n, 5, 11, 1.8, 0.25),
    xo(i, "hp", 240, 0.707, n),
    xo(s, "hp", 240, 0.707, n),
    Mu(o, bu.strings)
  );
}

function V6_2(n, e) {
  let t = (n >> 1) & 3,
    i = n >= 8,
    s = [],
    o = 50 + e,
    r = [
      1, 0.42, 0.52, 0.86, 0.4, 0.5, 0.8, 0.46, 0.95, 0.4, 0.52, 0.82, 0.42,
      0.5, 0.76, 0.5,
    ];
  for (let a = 0; a < 16; a++) {
    if (i && (a === 5 || a === 13)) continue;
    let l = o,
      c = r[a];
    (a === 3 || a === 11
      ? (l = Zv[t] + e)
      : (a === 6 || a === 14) && (l = uI[t] + 12 + e),
      i &&
        (a === 6 && (l = 62 + e),
        a === 14 && (l = Zv[t] + e),
        a === 8 && (c = 1)),
      n === 15 &&
        (c = Math.min(1, 0.45 + 0.04 * a + (dI.includes(a) ? 0.12 : 0))),
      n % 4 === 3 && a === 15 && (l = Zv[t] + e),
      s.push([a, l, c]));
  }
  return s;
}

function* _I(n, e) {
  let t = Math.round(16 * Ct * n),
    i = new Float32Array(t),
    s = new Float32Array(t),
    o = new Map(),
    r = (u, f) => {
      let h = u * 4 + f,
        p = o.get(h);
      return (
        p ||
          o.set(
            h,
            (p = H6_2(n, Ns(u), [0.4, 0.7, 1][f], e, {
              mute: 0.12 + 0.05 * f,
            })),
          ),
        p
      );
    },
    a = (() => {
      let u = Math.round(0.3 * n),
        f = new Float32Array(u),
        h = Ns(38),
        p = 0,
        d = 0;
      for (let x = 0; x < u; x++) {
        let v = x / n,
          y = (v * h) % 1 < 0.5 ? 1 : -1,
          b = 1 - Math.exp((-vt * (90 + 380 * Math.exp(-v / 0.05))) / n);
        ((p += (y - p) * b),
          (d += (p - d) * b),
          (f[x] = d * Math.exp(-v / 0.11) * Math.min(1, x / 60)));
      }
      let m = Math.round(0.03 * n);
      for (let x = 0; x < m; x++) f[u - 1 - x] *= x / m;
      return f;
    })();
  for (let u = 0; u < 16; u++) {
    for (let [f, h, p] of V6_2(u, 0)) {
      let d = p * (0.93 + 0.14 * e());
      Us(
        i,
        r(h, d > 0.78 ? 2 : d > 0.55 ? 1 : 0),
        u * Ct + f * qn_2,
        0.3 * (0.35 + 0.65 * d),
        n,
      );
    }
    (Us(s, a, u * Ct, 0.2, n), Us(s, a, u * Ct + 2 * qa_2, 0.14, n), yield);
  }
  xo(i, "hp", 115, 0.707, n);
  let l = i.slice();
  xo(l, "lp", 1900, 0.7, n);
  let c = l.slice();
  return (
    xo(c, "lp", 1200, 0.7, n),
    yield,
    O6(i, Math.round(3 * qn_2 * n), [
      [l, 0.27],
      [c, 0.1],
    ]),
    r5(i, s),
    ml(i, 1 / Qb(i)),
    Xl(i, 1.6),
    Mu([i], bu.pulse)[0]
  );
}

function* wI(n, e) {
  let t = Math.round(6 * Ct * n),
    i = new Float32Array(t),
    s = dn(n, 0.06, [
      [2349.3, 0.011, 1],
      [3520, 0.006, 0.4],
      [5870, 0.004, 0.2],
    ]),
    o = dn(n, 0.06, [
      [1760, 0.012, 1],
      [2637, 0.007, 0.35],
      [4186, 0.004, 0.15],
    ]);
  (Se(s, Jo(n, e, 0.004, 0.001, { hp: 3e3 }), 0, 0.5, n),
    Se(o, Jo(n, e, 0.004, 0.001, { hp: 2500 }), 0, 0.4, n));
  let r = [];
  for (let c = 0; c < 6; c++)
    r.push(
      Jo(n, e, 0.07, 0.012 + 0.012 * (c % 3), {
        hp: 5200 + 900 * (c % 2),
        att: 0.0012,
      }),
    );
  let a = gh(n, e, Ns(86), 0.5, 0.7),
    l = [
      [
        0.9, 0.3, 0.45, 0.7, 0.28, 0.4, 0.75, 0.3, 0.85, 0.3, 0.45, 0.7, 0.3,
        0.42, 0.72, 0.4,
      ],
      [
        0.9, 0.25, 0.5, 0.65, 0.3, 0.3, 0.8, 0.45, 0.8, 0.25, 0.3, 0.75, 0.35,
        0.5, 0.7, 0.55,
      ],
      [
        0.85, 0.35, 0.4, 0.75, 0.25, 0.5, 0.7, 0.25, 0.9, 0.4, 0.5, 0.65, 0.25,
        0.35, 0.8, 0.6,
      ],
    ];
  for (let c = 0; c < 6; c++) {
    let u = l[c % 3];
    for (let f = 0; f < 16; f++) {
      let h = c * Ct + f * qn_2;
      f % 4 === 0
        ? Us(i, s, h, f === 0 ? 0.42 : 0.32, n)
        : f % 4 === 2 && Us(i, o, h, 0.24, n);
      let p = u[(f + (c >= 3 ? 8 : 0)) % 16] * (0.9 + 0.2 * e());
      Us(i, r[(f * 5 + c) % 6], h + (f & 1 ? Ci.swing : 0), 0.2 * p, n);
    }
    yield;
  }
  return (
    Us(i, a, 2 * Ct + 14 * qn_2, 0.1, n),
    Us(i, a, 5 * Ct + 11 * qn_2, 0.08, n),
    xo(i, "hp", 1100, 0.707, n),
    Mu([i], bu.ticks)[0]
  );
}

var p1_2 = null;

var jv_2 = 0;

function W6_2(n) {
  if (p1_2 && p1_2.sr === n) {
    let o = p1_2;
    return (++jv_2 >= 4 && ((p1_2 = null), (jv_2 = 0)), o);
  }
  let e = ao(23063 + n),
    t = (o, r, a, l) => {
      let c = new Float32Array(Math.round(l * n));
      return (
        c.set(o.subarray(0, Math.min(o.length, c.length))),
        Yl(c, n, r, a)
      );
    },
    i = { rt: 2.3, size: 1.25, damp: 0.3, pre: 0.022, hp: 170 },
    s = { lo: [], mid: [], hi: [] };
  for (let o of [0.55, 1])
    (s.lo.push(t(m1_2(n, e, 55, o), 0.3, i, 2)),
      s.mid.push(t(m1_2(n, e, 73.42, o), 0.28, i, 1.8)),
      s.hi.push(t(m1_2(n, e, 110, o), 0.26, i, 1.6)));
  return (
    (s.big = t(
      yu(n, e, 1),
      0.55,
      { rt: 3.2, size: 1.5, damp: 0.35, pre: 0.03, hp: 150 },
      3.6,
    )),
    (s.steel = t(
      gh(n, e, Ns(57), 1.6, 0.8),
      0.5,
      { rt: 2.8, size: 1.4, damp: 0.22, pre: 0.025, hp: 250 },
      3,
    )),
    (s.sr = n),
    (p1_2 = s),
    (jv_2 = 1),
    s
  );
}

function* EI(n, e) {
  let t = Math.round(8 * Ct * n),
    i = new Float32Array(t),
    s = W6_2(n);
  yield;
  let o = (r, a, l, c) => Us(i, s[r][a], l, c, n);
  for (let r = 0; r < 8; r++) {
    let a = r * Ct,
      l = r & 1,
      c = r === 7;
    (o("lo", 1, a, 0.62),
      o("lo", 1, a + 8 * qn_2, c ? 0.4 : 0.5),
      c ||
        (o("mid", 0, a + 3 * qn_2, 0.3),
        o("mid", 1, a + 6 * qn_2, 0.4),
        l
          ? (o("hi", 1, a + 12 * qn_2, 0.36),
            o("hi", 0, a + 13 * qn_2, 0.2),
            o("mid", 1, a + 14 * qn_2, 0.44),
            r === 3 && o("lo", 0, a + 15 * qn_2, 0.3))
          : (o("hi", 0, a + 11 * qn_2, 0.3), o("mid", 1, a + 14 * qn_2, 0.42))),
      (r === 0 || r === 4) && Us(i, s.big, a, r === 0 ? 0.6 : 0.5, n),
      (r === 2 || r === 6) &&
        Us(i, s.steel, a + 8 * qn_2, r === 2 ? 0.2 : 0.16, n),
      yield);
  }
  return (xo(i, "hp", 38, 0.707, n, 0.6), Mu([Xl(i, 1.15)], bu.drums)[0]);
}

function* SI(n, e) {
  let t = Math.round(8 * Ct * n),
    i = new Float32Array(t),
    s = (r, a, l) => {
      let c = (r >> 1) & 3;
      for (let u of fI[c])
        Us(
          i,
          Ya_2(n, Ns(u), 0.2, {
            vel: l,
            att: 0.012,
            rel: 0.07,
            n: 3,
            det: 8,
            bright: 9,
            rng: e,
          }),
          r * Ct + a * qn_2 - 0.006,
          0.17 * (0.5 + 0.5 * l) * (u === 38 ? 0.8 : 1),
          n,
        );
    },
    o = (r, a, l, c) => {
      let u = (r >> 1) & 3;
      for (let f of hI[u])
        Us(
          i,
          Ya_2(n, Ns(f), l, {
            vel: c,
            att: 0.25,
            rel: 0.1,
            swell: [0.12, 1],
            swp: 2.2,
            n: 3,
            det: 9,
            bright: 7,
            rng: e,
          }),
          r * Ct + a * qn_2,
          0.15,
          n,
        );
    };
  return (
    s(0, 0, 1),
    s(0, 11, 0.6),
    yield,
    o(1, 4, 12 * qn_2 - 0.05, 0.9),
    yield,
    s(2, 0, 0.9),
    s(2, 6, 0.7),
    yield,
    s(3, 3, 0.55),
    s(3, 14, 0.75),
    yield,
    s(4, 0, 1),
    s(4, 8, 0.6),
    yield,
    o(5, 4, 12 * qn_2 - 0.05, 0.9),
    yield,
    s(6, 0, 0.9),
    s(6, 6, 0.7),
    s(6, 11, 0.55),
    yield,
    o(7, 0, 16 * qn_2 - 0.05, 1),
    yield,
    xo(i, "hp", 60, 0.707, n, 0.5),
    _u(i, n, g1_2, !0),
    ml(i, 1 / Qb(i)),
    Xl(i, 1.3),
    Mu([i], bu.brass)[0]
  );
}

function* TI(n, e) {
  let t = Math.round(8 * Ct * n),
    i = new Float32Array(t),
    s = new Float32Array(t),
    o = new Map(),
    r = (l, c) => {
      let u = l * 4 + c,
        f = o.get(u);
      return (
        f ||
          o.set(
            u,
            (f = H6_2(n, Ns(l), [0.55, 0.8, 1][c], e, {
              mute: 0.1 + 0.03 * c,
              dur: 0.4,
            })),
          ),
        f
      );
    };
  for (let l = 0; l < 8; l++) {
    for (let [c, u, f] of V6_2(l + (l >= 4 ? 8 : 0), 12)) {
      let h = Math.min(1, f * 1.08 * (0.93 + 0.14 * e()));
      Us(
        i,
        r(u, h > 0.78 ? 2 : h > 0.55 ? 1 : 0),
        l * Ct + c * qn_2,
        0.22 * (0.4 + 0.6 * h),
        n,
      );
    }
    yield;
  }
  (xo(i, "hp", 230, 0.707, n),
    [74, 76, 77, 79, 81, 82, 84, 86].forEach((l, c) => {
      (gs([s], n, Ns(l), c * Ct - 0.12, Ct - 0.1, {
        n: 3,
        det: 11,
        att: 0.35,
        rel: 0.3,
        g: 0.1,
        swell: [0.55, 1],
        swp: 1.4,
        trem: { rate: 12.8, depth: 0.4 },
        rng: e,
      }),
        gs([s], n, Ns(l - 12), c * Ct - 0.12, Ct - 0.1, {
          n: 2,
          det: 8,
          att: 0.4,
          rel: 0.3,
          g: 0.06,
          swell: [0.6, 1],
          rng: e,
        }));
    }),
    yield,
    o5(s, (l) => 3300 + 900 * Math.sin(vt * l - 1.57), 0.7, n),
    xo(s, "hp", 300, 0.707, n),
    yield);
  let a = i.slice();
  return (
    xo(a, "lp", 2600, 0.7, n),
    O6(i, Math.round(3 * qn_2 * n), [[a, 0.22]]),
    Mu([r5(i, s)], bu.lift)[0]
  );
}

var G6_2 = { rt: 3, size: 1.45, damp: 0.3, pre: 0.03, hp: 200 };

function* AI(n, e, t) {
  let i = St(n, 5.4),
    [s, o] = Ci.cells[t];
  return (
    Se(i, Xa_2(n, Ns(s), 0.62, 3.2, e), 0.002, 0.55, n),
    yield,
    Se(i, Xa_2(n, Ns(o), 0.8, 4.3, e), Ci.cellSecond + 0.002, 0.6, n),
    Se(i, Xa_2(n, Ns(o - 12), 0.5, 4, e), Ci.cellSecond + 0.002, 0.2, n),
    yield,
    Yl(i, n, 0.5, G6_2),
    i
  );
}

function* RI(n, e, t) {
  let i = St(n, 4.8),
    [s, o] = Ci.cells[t];
  for (let r of [-12, 0])
    (Se(
      i,
      Ya_2(n, Ns(s + r), Ci.cellSecond - 0.1, {
        vel: 0.7,
        att: 0.05,
        rel: 0.09,
        n: 4,
        det: 8,
        bright: 6.5,
        rng: e,
      }),
      0,
      r ? 0.3 : 0.36,
      n,
    ),
      yield,
      Se(
        i,
        Ya_2(n, Ns(o + r), 2.5, {
          vel: 0.9,
          att: 0.07,
          rel: 0.25,
          swell: [0.75, 1],
          swp: 0.7,
          n: 4,
          det: 9,
          bright: 6.5,
          rng: e,
        }),
        Ci.cellSecond,
        r ? 0.34 : 0.4,
        n,
      ),
      yield);
  return (
    tn(i, "hp", 110, 0.707, n),
    _u(i, n, g1_2),
    Yl(i, n, 0.3, { rt: 2.4, size: 1.3, damp: 0.3, pre: 0.025, hp: 220 }),
    i
  );
}

function* CI(n, e, t) {
  let i = St(n, Ct + 1.1),
    s = W6_2(n);
  yield;
  let o = (a, l, c, u) => Se(i, s[a][l], c * qn_2, u, n);
  t === 0
    ? ([8, 9, 10, 11, 12, 13, 14, 15].forEach((a, l) =>
        o(l < 4 ? "mid" : "lo", l % 2 ? 0 : 1, a, 0.28 + 0.06 * l),
      ),
      o("hi", 1, 6, 0.4))
    : t === 1
      ? (o("hi", 1, 0, 0.4),
        o("hi", 0, 2, 0.26),
        o("hi", 1, 3, 0.42),
        o("mid", 1, 6, 0.46),
        o("mid", 0, 8, 0.3),
        o("mid", 1, 9, 0.48),
        o("lo", 1, 12, 0.56),
        o("lo", 0, 14, 0.4),
        o("lo", 1, 15, 0.6))
      : (o("lo", 1, 8, 0.5),
        o("mid", 1, 11, 0.5),
        o("hi", 1, 12, 0.4),
        o("hi", 1, 13, 0.46),
        o("lo", 1, 14, 0.62),
        o("lo", 0, 15, 0.42),
        Se(i, s.steel, 4 * qn_2, 0.2, n));
  let r = i.length - Math.round(0.35 * n);
  for (let a = r; a < i.length; a++) i[a] *= 1 - (a - r) / (i.length - r);
  return Xl(i, 1.1);
}

function* kI(n, e, t) {
  let i = St(n, 4.6);
  return (
    Se(i, yu(n, e, 1.2), 0.03, t ? 0.5 : 0.9, n),
    yield,
    t &&
      (Se(i, gh(n, e, Ns(45), 2.6, 0.55), 0.03, 0.4, n),
      Se(i, gh(n, e, Ns(50) * 1.012, 2.2, 0.5), 0.09, 0.22, n),
      yield),
    tn(i, "lp", t ? 1500 : 500, 0.7, n),
    Yl(i, n, 1.1, { rt: 3.6, size: 1.6, damp: 0.4, pre: 0.045, hp: 120 }),
    i
  );
}

function PI(n, e, t, i, s) {
  let o = n.length,
    r = [s(), s(), s(), s(), s()],
    a = [-11, -5, 0, 6, 12].map((h) => Math.pow(2, h / 1200) / t),
    l = 0,
    c = 0,
    u = 0,
    f = 0;
  for (let h = 0; h < o; h++) {
    if ((h & 15) === 0) {
      let d = h / t,
        m = Math.min(1, d / i);
      ((c = Ns(50) * Math.pow(2, Math.pow(m, 1.8))),
        (l += (16 * (3.2 + 9.6 * m * m)) / t),
        (u =
          (d < i ? Math.pow(m, 2.2) : Math.exp(-(d - i) / 0.07)) *
          (1 - 0.3 * (0.5 - 0.5 * Math.cos(vt * l)) * m) *
          0.2),
        (f = (d < i ? Math.pow(m, 2.6) : Math.exp(-(d - i) / 0.05)) * 1.6));
    }
    let p = 0;
    for (let d = 0; d < 5; d++) {
      let m = c * a[d],
        x = r[d] + m;
      (x >= 1 && (x -= 1), (r[d] = x));
      let v = x + x - 1;
      if (x < m) {
        let y = x / m;
        v -= y + y - y * y - 1;
      } else if (x > 1 - m) {
        let y = (x - 1) / m;
        v -= y * y + y + y + 1;
      }
      p += v;
    }
    ((n[h] = p * u), (e[h] *= f));
  }
}

function* II(n, e) {
  let t = Ci.riserPeak,
    i = St(n, t + 0.6),
    s = i.length,
    o = Qn(n, t + 0.6, e);
  (di(
    o,
    "bp",
    (a) => 320 * Math.pow(18, Math.min(1, (a * (t + 0.6)) / t)),
    1.3,
    n,
  ),
    yield);
  let r = new Float32Array(s);
  (PI(r, o, n, t, e),
    yield,
    di(
      r,
      "lp",
      (a) => 350 * Math.pow(11, Math.min(1, (a * (t + 0.6)) / t)),
      0.9,
      n,
    ),
    tn(r, "hp", 200, 0.707, n));
  for (let a = 0; a < s; a++) i[a] = r[a] + o[a];
  return i;
}

function* zI(n, e) {
  let t = St(n, 5);
  (Se(t, yu(n, e, 1.25), 0, 1, n),
    Se(t, m1_2(n, e, 55, 1), 0, 0.7, n),
    yield,
    Se(t, gh(n, e, Ns(50), 2.4, 0.9), 0, 0.3, n),
    Se(t, gh(n, e, Ns(57) * 0.99, 1.8, 0.8), 0.004, 0.16, n),
    yield);
  let i = St(n, 4);
  for (let [s, o] of [
    [38, 1],
    [45, 0.8],
    [50, 0.9],
    [57, 0.5],
  ])
    (Se(
      i,
      Ya_2(n, Ns(s), 1.3, {
        vel: 1,
        att: 0.02,
        rel: 0.4,
        swell: [1, 0.3],
        swp: 0.5,
        n: 5,
        det: 12,
        bright: 7,
        scoop: -60,
        rng: e,
      }),
      0,
      0.24 * o,
      n,
    ),
      yield);
  return (
    Se(t, _u(i, n, g1_2), 0, 1, n),
    Yl(t, n, 0.45, { rt: 3.4, size: 1.55, damp: 0.3, pre: 0.03, hp: 160 }),
    Xl(t, 1.3)
  );
}

function* DI(n, e) {
  let t = St(n, 5);
  (Se(t, Xa_2(n, Ns(65), 0.7, 1.6, e), 0.002, 0.6, n),
    Se(t, Xa_2(n, Ns(64), 0.7, 1.6, e), 0.002 + qa_2 / 2, 0.58, n),
    yield,
    Se(t, Xa_2(n, Ns(62), 0.9, 4.2, e), 0.002 + qa_2, 0.72, n),
    Se(t, Xa_2(n, Ns(50), 0.6, 4, e), 0.002 + qa_2, 0.3, n),
    Se(t, Xa_2(n, Ns(74), 0.55, 3, e), 0.002 + qa_2 * 2.5, 0.3, n),
    yield);
  let i = St(n, 4.6);
  for (let [s, o] of [
    [50, 1],
    [57, 0.9],
    [62, 0.8],
  ])
    (Se(
      i,
      Ya_2(n, Ns(s), 1.9, {
        vel: 0.55,
        att: 0.3,
        rel: 0.5,
        swell: [0.6, 1],
        swp: 0.8,
        n: 4,
        det: 8,
        bright: 5,
        scoop: 0,
        rng: e,
      }),
      qa_2 - 0.1,
      0.2 * o,
      n,
    ),
      yield);
  return (
    Se(t, _u(i, n, g1_2), 0, 1, n),
    Se(t, yu(n, e, 1), qa_2, 0.3, n),
    Yl(t, n, 0.5, G6_2),
    t
  );
}

function LI(n, e, t, i) {
  let s = n.length,
    o = [],
    r = [];
  for (let c = 0; c < t.length * 3; c++)
    (o.push(i()),
      r.push(
        (Ns(t[(c / 3) | 0]) *
          Math.pow(2, (((c % 3) - 1) * 9 + (i() - 0.5) * 4) / 1200)) /
          e,
      ));
  let a = 1,
    l = 0;
  for (let c = 0; c < s; c++) {
    if ((c & 15) === 0) {
      let f = c / e;
      ((a = Math.pow(2, (-16 / 12) * Math.pow(Math.min(1, f / 4.2), 1.35))),
        (l =
          0.07 *
          (1 - Math.exp(-f / 0.03)) *
          Math.pow(Math.max(0, 1 - f / 4.4), 1.2)));
    }
    let u = 0;
    for (let f = 0; f < o.length; f++) {
      let h = r[f] * a,
        p = o[f] + h;
      (p >= 1 && (p -= 1), (o[f] = p));
      let d = p + p - 1;
      if (p < h) {
        let m = p / h;
        d -= m + m - m * m - 1;
      } else if (p > 1 - h) {
        let m = (p - 1) / h;
        d -= m * m + m + m + 1;
      }
      u += d;
    }
    n[c] = u * l;
  }
}

function* FI(n, e) {
  let t = St(n, 5.2),
    i = St(n / 2, 5.2),
    s = [50, 57, 62, 65];
  return (
    LI(i, n / 2, s, e),
    yield,
    di(i, "lp", Vo(2400, 140, 0.6), 0.9, n / 2),
    tn(i, "hp", 60, 0.707, n / 2),
    Se(t, mh(i, !1), 0, 1, n),
    Se(t, yu(n, e, 1.2), 0, 0.75, n),
    Se(t, s5(n, 2.6, 98, 41, 0.9, 0.9, 0.004), 0.02, 0.4, n),
    yield,
    Yl(t, n, 0.5, { rt: 3.4, size: 1.5, damp: 0.4, pre: 0.03, hp: 150 }),
    t
  );
}

function* NI(n, e) {
  let t = St(n, 12.5),
    i = St(n / 2, 12.5),
    s = [i],
    o = (c, u, f, h, p) => {
      for (let d of f)
        gs(s, n / 2, Ns(d), c - 0.25, u, {
          n: 3,
          det: 9,
          att: 0.5,
          rel: 0.7,
          g: h * (d < 48 ? 1.1 : 0.8),
          swell: p,
          tail: 2.2,
          rng: e,
        });
    };
  (o(0, Ct, [46, 53, 58, 62], 0.075, [0.7, 1]),
    yield,
    o(Ct, Ct, [48, 55, 60, 64], 0.08, [0.75, 1]),
    yield,
    o(2 * Ct, 2.6 * Ct, [38, 45, 50, 57, 62], 0.085, [1, 0.5]),
    yield,
    di(i, "lp", (c) => 1700 - 700 * c, 0.75, n / 2),
    tn(i, "hp", 45, 0.707, n / 2),
    Se(t, mh(i, !1), 0, 1, n),
    yield);
  let r = St(n, 12.5);
  for (let [c, u] of [
    [46, 0.8],
    [58, 1],
  ])
    Se(
      r,
      Ya_2(n, Ns(c), Ct - 0.2, {
        vel: 0.6,
        att: 0.2,
        rel: 0.2,
        swell: [0.6, 1],
        n: 3,
        det: 8,
        bright: 5,
        scoop: 0,
        rng: e,
      }),
      0,
      0.13 * u,
      n,
    );
  for (let [c, u] of [
    [48, 0.8],
    [60, 1],
  ])
    Se(
      r,
      Ya_2(n, Ns(c), Ct - 0.2, {
        vel: 0.7,
        att: 0.2,
        rel: 0.2,
        swell: [0.65, 1],
        n: 3,
        det: 8,
        bright: 5.5,
        scoop: 0,
        rng: e,
      }),
      Ct,
      0.14 * u,
      n,
    );
  yield;
  for (let [c, u] of [
    [38, 0.9],
    [50, 1],
    [57, 0.8],
  ])
    Se(
      r,
      Ya_2(n, Ns(c), 2 * Ct, {
        vel: 0.7,
        att: 0.1,
        rel: 0.8,
        swell: [1, 0.3],
        swp: 0.8,
        n: 3,
        det: 8,
        bright: 5,
        scoop: -20,
        rng: e,
      }),
      2 * Ct,
      0.15 * u,
      n,
    );
  (Se(t, _u(r, n, g1_2), 0, 1, n), yield);
  let a = (c, u, f, h, p) => Se(t, Xa_2(n, Ns(u), f, h, e), c + 0.002, p, n);
  (a(0, 65, 0.7, 2.6, 0.5),
    a(2 * qa_2, 67, 0.72, 2.4, 0.5),
    a(Ct, 69, 0.85, 3.4, 0.6),
    a(Ct, 57, 0.5, 3, 0.2),
    yield,
    a(2 * Ct, 62, 0.9, 5.5, 0.7),
    a(2 * Ct, 50, 0.7, 5.5, 0.4),
    a(2 * Ct + Ci.cellSecond, 69, 0.7, 5, 0.5),
    a(3 * Ct, 74, 0.6, 4.5, 0.4),
    a(3 * Ct + 2 * qa_2, 78, 0.45, 4.4, 0.3),
    yield,
    Se(t, yu(n, e, 1), 0, 0.35, n),
    Se(t, m1_2(n, e, 55, 0.8), Ct, 0.3, n),
    Se(t, yu(n, e, 1.25), 2 * Ct, 0.6, n),
    Yl(t, n, 0.5, { rt: 3.6, size: 1.55, damp: 0.3, pre: 0.03, hp: 190 }));
  let l = Math.round(10.4 * n);
  for (let c = l; c < t.length; c++)
    t[c] *= Math.pow(1 - (c - l) / (t.length - l), 1.5);
  return t;
}

var vu = (n, e) => ({
  gen: n,
  n: 1,
  sr: e,
  peak: 0.9,
  fixed: 1,
  loop: 1,
  music: 1,
});

var Ga = (n, e, t, i, s = 2) => ({
  gen: n,
  n: e,
  sr: t,
  peak: i,
  bus: "music",
  max: s,
  pri: 9,
});

var q6_2 = {
  music_drone: vu(bI, Ko),
  music_strings: vu(MI, Ko),
  music_pulse: vu(_I, i5),
  music_ticks: vu(wI, Ko),
  music_drums: vu(EI, i5),
  music_brass: vu(SI, i5),
  music_lift: vu(TI, Ko),
  mus_cell: Ga(AI, 4, Ko, 0.5),
  mus_horn: Ga(RI, 4, Ko, 0.6),
  mus_fill: Ga(CI, 3, i5, 0.6),
  mus_hit: Ga(kI, 2, Ko, 0.6),
  mus_riser: Ga(II, 1, Ko, 0.6, 1),
  mus_impact: Ga(zI, 1, Ko, 0.8, 1),
  objective: Ga(DI, 1, Ko, 0.7, 1),
  death: Ga(FI, 1, Ko, 0.85, 1),
  complete: Ga(NI, 1, Ko, 0.8, 1),
};

var $l = Object.keys(Ci.loops);

function r8(i, e, t) {
  let n = St(i, 0.3),
    s = [1, 1.07, 0.94, 1.03][t & 3];
  (Se(n, ei(i, 0.06, 112 * s, 58 * s, 0.018, 0.02, 0.002), 0, 0.75, i),
    Se(
      n,
      at(i, e, 0.06, 0.016, {
        lp: 720 * s,
      }),
      0,
      0.9,
      i,
    ),
    Se(
      n,
      at(i, e, 0.1, 0.028, {
        bp: 2500 * s,
        q: 0.7,
        att: 0.004,
      }),
      0.012,
      0.22,
      i,
    ));
  let o = at(i, e, 0.2, 0.05, {
      hp: 3800,
      att: 0.01,
    }),
    r = 1;
  for (let a = 0; a < o.length; a++)
    (a % 70 === 0 && (r = 0.3 + e() * 0.7), (o[a] *= r));
  return (Se(n, o, 0.02, 0.16, i), n);
}

function t_(i, e, t, n) {
  let s = St(i, t),
    o = Qn(i, t * 0.9, e);
  (di(o, "bp", Vo(1500, 520), 0.8, i),
    Se(s, lo(o, i, co(0.085 * n, 0.007)), 0, 0.9, i),
    Se(
      s,
      at(i, e, t * 0.8, 0.07 * n, {
        hp: 3e3,
        att: 0.012,
      }),
      0.01,
      0.25,
      i,
    ));
  let r = Math.round(5 * n);
  for (let a = 0; a < r; a++) {
    let l = Xt(e, 500, 1700);
    Se(
      s,
      jc(i, Xt(e, 0.008, 0.02), l, l * Xt(e, 1.3, 1.9)),
      Xt(e, 0.03, t * 0.6),
      Xt(e, 0.1, 0.3),
      i,
    );
  }
  return s;
}

function a8(i, e, t) {
  let n = t_(i, e, 0.46, 1 + t * 0.08);
  return (Se(n, ei(i, 0.06, 100, 55, 0.02, 0.02, 0.002), 0, 0.5, i), n);
}

function l8(i, e, t) {
  let n = St(i, 0.38),
    s = [1, 1.08, 0.92][t % 3];
  return (
    Se(n, ei(i, 0.06, 120, 62, 0.018, 0.02, 0.002), 0, 0.6, i),
    Se(
      n,
      at(i, e, 0.04, 0.008, {
        lp: 2400,
      }),
      0,
      0.6,
      i,
    ),
    Se(
      n,
      dn(
        i,
        0.36,
        [
          [178 * s, 0.09, 1],
          [412 * s, 0.075, 0.8],
          [733 * s, 0.06, 0.55],
          [1214 * s, 0.045, 0.4],
          [1958 * s, 0.03, 0.3],
          [3130 * s, 0.016, 0.18],
        ],
        e,
      ),
      0.001,
      0.3,
      i,
    ),
    Se(
      n,
      at(i, e, 0.08, 0.02, {
        bp: 3e3,
        q: 0.8,
        att: 0.003,
      }),
      0.01,
      0.1,
      i,
    ),
    n
  );
}

function c8(i, e) {
  let t = St(i, 0.45);
  (Se(t, ei(i, 0.14, 124, 44, 0.03, 0.045, 0.002), 0, 1, i),
    Se(
      t,
      at(i, e, 0.14, 0.035, {
        lp: 520,
      }),
      0,
      1,
      i,
    ),
    Se(
      t,
      at(i, e, 0.2, 0.06, {
        bp: 1500,
        q: 0.7,
        att: 0.01,
      }),
      0.01,
      0.16,
      i,
    ));
  for (let n of [0.022, 0.05, 0.088])
    Se(
      t,
      at(i, e, 0.012, 0.003, {
        bp: Xt(e, 2200, 4200),
        q: 2,
      }),
      n,
      Xt(e, 0.1, 0.22),
      i,
    );
  return (
    Se(
      t,
      at(i, e, 0.2, 0.05, {
        hp: 3500,
        att: 0.01,
      }),
      0.015,
      0.1,
      i,
    ),
    Wo(t, 1.2)
  );
}

function u8(i, e) {
  let t = St(i, 0.26);
  return (
    Se(
      t,
      at(i, e, 0.2, 0.05, {
        bp: 900,
        q: 0.7,
        att: 0.02,
      }),
      0,
      0.6,
      i,
    ),
    Se(
      t,
      at(i, e, 0.1, 0.025, {
        bp: 2600,
        q: 0.8,
        att: 0.004,
      }),
      0.005,
      0.35,
      i,
    ),
    Se(t, ei(i, 0.05, 95, 60, 0.02, 0.018, 0.003), 0, 0.4, i),
    t
  );
}

function h8(i, e) {
  let t = St(i, 0.5);
  return (
    Se(t, ei(i, 0.25, 92, 38, 0.04, 0.06, 0.0015), 0, 1.1, i),
    Se(
      t,
      at(i, e, 0.2, 0.04, {
        lp: 320,
      }),
      0,
      1.2,
      i,
    ),
    Se(
      t,
      at(i, e, 0.06, 0.01, {
        bp: 820,
        q: 1,
      }),
      0,
      0.55,
      i,
    ),
    Se(
      t,
      at(i, e, 0.03, 0.004, {
        hp: 1800,
        lp: 5e3,
      }),
      0,
      0.2,
      i,
    ),
    Wo(t, 1.6)
  );
}

function f8(i) {
  let e = St(i, 2.4);
  for (let t = 0; t < e.length; t++) {
    let n = t / i;
    e[t] =
      (Math.sin(vt * 3150 * n) +
        0.7 * Math.sin(vt * 4013 * n + 1) +
        0.35 * Math.sin(vt * 5310 * n + 2)) *
      (1 - Math.exp(-n / 0.12)) *
      Math.exp(-n / 0.55);
  }
  return e;
}

function d8(i, e, t) {
  let n = St(i, 0.5),
    s = [640, 880, 745][t % 3] * Xt(e, 0.97, 1.03);
  return (
    Se(
      n,
      at(i, e, 0.015, 0.003, {
        hp: 1500,
      }),
      0,
      1,
      i,
    ),
    Se(
      n,
      at(i, e, 0.04, 0.008, {
        lp: 1800,
      }),
      0,
      0.6,
      i,
    ),
    Se(
      n,
      dn(
        i,
        0.48,
        [1, 1.58, 2.24, 2.92, 3.71, 4.93, 6.31, 8.1].map((r, a) => [
          s * r,
          0.13 / (1 + a * 0.55),
          1 / (1 + a * 0.5),
        ]),
        e,
      ),
      5e-4,
      0.42,
      i,
    ),
    n
  );
}

function p8(i, e, t) {
  let n = St(i, 0.36),
    s = [1, 1.1, 0.9][t % 3];
  return (
    Se(
      n,
      at(i, e, 0.06, 0.013, {
        lp: 950 * s,
      }),
      0,
      1.1,
      i,
    ),
    Se(n, ei(i, 0.05, 150 * s, 70, 0.012, 0.016), 0, 0.6, i),
    Se(
      n,
      at(i, e, 0.012, 0.002, {
        hp: 2e3,
      }),
      0,
      0.6,
      i,
    ),
    Se(
      n,
      at(i, e, 0.12, 0.024, {
        bp: 3500 * s,
        q: 0.7,
      }),
      0.003,
      0.3,
      i,
    ),
    Se(
      n,
      Jc(i, e, 0.34, 16, {
        from: 0.03,
        fall: 1.8,
        hp: 1800,
        ampFall: 0.1,
      }),
      0,
      0.35,
      i,
    ),
    n
  );
}

function m8(i, e, t) {
  let n = St(i, 0.26),
    s = t ? 1.14 : 1;
  return (
    Se(
      n,
      dn(
        i,
        0.2,
        [
          [238 * s, 0.03, 1],
          [512 * s, 0.022, 0.8],
          [893 * s, 0.016, 0.6],
          [1410 * s, 0.01, 0.4],
        ],
        e,
      ),
      0,
      0.6,
      i,
    ),
    Se(
      n,
      at(i, e, 0.03, 0.006, {
        lp: 2100,
      }),
      0,
      0.8,
      i,
    ),
    Se(
      n,
      at(i, e, 0.01, 0.002, {
        hp: 3e3,
      }),
      0,
      0.5,
      i,
    ),
    Se(
      n,
      Jc(i, e, 0.2, 6, {
        from: 0.01,
        fall: 2,
        bp: 2600,
        q: 1.5,
      }),
      0,
      0.3,
      i,
    ),
    n
  );
}

function g8(i, e, t) {
  let n = t_(i, e, 0.5, 0.8 + t * 0.2);
  return (Se(n, jc(i, 0.035, 420, 1150), 0, 0.5, i), n);
}

function v8(i, e, t) {
  let n = St(i, 0.3),
    s = [1, 1.12, 0.9][t % 3];
  (Se(
    n,
    at(i, e, 0.03, 0.007, {
      hp: 4e3,
    }),
    0,
    0.9,
    i,
  ),
    Se(
      n,
      dn(
        i,
        0.12,
        [
          [2920 * s, 0.022, 1],
          [4730 * s, 0.018, 0.8],
          [7310 * s, 0.012, 0.6],
          [1180 * s, 0.03, 0.5],
        ],
        e,
      ),
      0,
      0.4,
      i,
    ),
    Se(
      n,
      at(i, e, 0.05, 0.012, {
        bp: 320 * s,
        q: 1.5,
      }),
      0,
      0.9,
      i,
    ));
  let o = Qn(i, 0.06, e);
  tn(o, "bp", 2400, 1, i);
  for (let r = 0; r < o.length; r++) {
    let a = r / i;
    o[r] *= (Math.sin(vt * 118 * a) > 0.2 ? 1 : 0.1) * Math.exp(-a / 0.02);
  }
  return (
    Se(n, o, 0.004, 0.5, i),
    Se(
      n,
      Jc(i, e, 0.28, 10, {
        from: 0.02,
        fall: 1.6,
        hp: 5e3,
        ampFall: 0.08,
      }),
      0,
      0.3,
      i,
    ),
    n
  );
}

function x8(i, e) {
  let t = St(i, 0.45);
  Se(
    t,
    at(i, e, 0.01, 0.002, {
      hp: 2500,
    }),
    0,
    1,
    i,
  );
  for (let n = 0; n < 9; n++) {
    let s = Xt(e, 3200, 9500);
    Se(
      t,
      dn(
        i,
        0.1,
        [
          [s, Xt(e, 0.01, 0.03), 1],
          [s * 1.47, 0.01, 0.5],
        ],
        e,
      ),
      Math.pow(e(), 2) * 0.3,
      Xt(e, 0.1, 0.35),
      i,
    );
  }
  return t;
}

function y8(i, e, t) {
  let n = St(i, 0.75),
    s = [3300, 2700, 3900][t % 3],
    o = [820, 1100, 700][t % 3],
    r = 0,
    a = Qn(i, 0.75, e);
  for (let l = 0; l < n.length; l++) {
    let c = l / i,
      u = o + (s - o) * Math.exp(-c / 0.16),
      h = 1 + 0.035 * Math.sin(vt * (18 + 30 * c) * c);
    ((r += (vt * u * h) / i),
      (n[l] =
        (Math.sin(r) + 0.3 * Math.sin(2 * r)) *
        (1 - Math.exp(-c / 0.004)) *
        Math.exp(-c / 0.19)));
  }
  return (
    di(a, "bp", (l) => o + (s - o) * Math.exp((-l * 0.75) / 0.16), 6, i),
    Se(n, lo(a, i, co(0.15, 0.003)), 0, 1.6, i),
    Se(
      n,
      at(i, e, 0.01, 0.002, {
        hp: 2500,
      }),
      0,
      0.7,
      i,
    ),
    n
  );
}

var Tv = (i, e) => Math.round(i * e) / e;

function* _8(i, e) {
  let n = i * 2,
    s = new Float32Array(n),
    o = [
      [184, 2.5],
      [207.5, 3.5],
      [233, 2],
      [258.5, 4.5],
    ];
  for (let [l, c] of o) {
    let u = Tv(l, 2),
      h = Tv(c, 2),
      f = e() * vt,
      p = e() * vt;
    for (let d = 0; d < n; d++) {
      let v = d / i,
        g = vt * u * v + f;
      s[d] +=
        (Math.sin(g) +
          0.5 * Math.sin(2 * g + 1) +
          0.3 * Math.sin(3 * g + 2) +
          0.16 * Math.sin(4 * g) +
          0.08 * Math.sin(6 * g)) *
        (0.72 + 0.28 * Math.sin(vt * h * v + p)) *
        0.25;
    }
    yield;
  }
  let r = Zc(
      i,
      2,
      e,
      (l) => {
        (tn(l, "hp", 1100, 0.7, i), tn(l, "lp", 5200, 0.7, i));
      },
      0.25,
    ),
    a = Tv(46, 2);
  for (let l = 0; l < n; l++)
    s[l] += r[l] * (0.55 + 0.45 * Math.sin((vt * a * l) / i)) * 0.5;
  return s;
}

function M8(i, e) {
  let n = i * 2,
    s = new Float32Array(n);
  for (let r = 0; r < n; r++) {
    let a = r / i,
      l = 1.1 * Math.sin(vt * 0.5 * a) + 0.5 * Math.sin(vt * 1.5 * a + 1),
      c = vt * 310 * a + l,
      u = 0.7 + 0.3 * Math.sin(vt * 1.5 * a),
      h =
        (Math.sin(c) +
          0.45 * Math.sin(2 * c + l) +
          0.2 * Math.sin(4 * c + 0.5)) *
        0.3 *
        u,
      f = vt * 62 * a;
    ((h +=
      (Math.sin(f) +
        0.5 * Math.sin(2 * f) +
        0.33 * Math.sin(3 * f) +
        0.2 * Math.sin(5 * f)) *
      0.28),
      (s[r] = h));
  }
  let o = Zc(
    i,
    2,
    e,
    (r) => {
      (tn(r, "hp", 2800, 0.7, i), tn(r, "lp", 7e3, 0.7, i));
    },
    0.25,
  );
  for (let r = 0; r < n; r++)
    s[r] += o[r] * 0.12 * (0.6 + 0.4 * Math.sin((vt * 1.5 * r) / i + 2));
  return s;
}

function w8(i, e) {
  let n = i * 2,
    s = new Float32Array(n);
  for (let r = 0; r < n; r++) {
    let a = r / i,
      l = vt * 50 * a;
    s[r] =
      (Math.sin(l) * 0.5 +
        Math.sin(2 * l + 0.4) +
        0.5 * Math.sin(3 * l + 1) +
        0.3 * Math.sin(4 * l) +
        0.22 * Math.sin(6 * l + 2) +
        0.12 * Math.sin(10 * l)) *
        0.3 *
        (0.9 + 0.1 * Math.sin(vt * 0.5 * a)) +
      Math.sin(vt * 4100 * a) * 0.012 * (0.6 + 0.4 * Math.sin(vt * 1 * a)) +
      Math.sin(vt * 1250 * a + 0.6 * Math.sin(vt * 2 * a)) * 0.02;
  }
  let o = Zc(i, 2, e, (r) => tn(r, "bp", 2100, 1.2, i), 0.25);
  for (let r = 0; r < n; r++)
    s[r] += o[r] * 0.16 * Math.pow(0.5 + 0.5 * Math.sin((vt * 100 * r) / i), 3);
  return s;
}

function T8(i, e, t) {
  let n = St(i, 0.42),
    s = [1, 1.07, 0.93][t % 3];
  Se(n, jc(i, 0.035, 920 * s, 610 * s), 0, 0.06, i);
  let o = 0.03;
  return (
    Se(n, ei(i, 0.2, 84 * s, 41, 0.03, 0.05, 0.002), o, 1.1, i),
    Se(
      n,
      at(i, e, 0.12, 0.03, {
        lp: 360,
      }),
      o,
      1.1,
      i,
    ),
    Se(
      n,
      at(i, e, 0.03, 0.006, {
        lp: 2600,
        hp: 500,
      }),
      o,
      0.4,
      i,
    ),
    Se(
      n,
      dn(
        i,
        0.12,
        [
          [522 * s, 0.026, 1],
          [1133 * s, 0.02, 0.7],
          [1871 * s, 0.014, 0.5],
          [3040 * s, 0.008, 0.3],
        ],
        e,
      ),
      o,
      0.2,
      i,
    ),
    Se(
      n,
      at(i, e, 0.14, 0.04, {
        hp: 3e3,
        att: 0.006,
      }),
      o + 0.01,
      0.06,
      i,
    ),
    Wo(n, 1.5)
  );
}

function A8(i, e) {
  let t = St(i, 1.5),
    n = [0, 0, 0, 0];
  Se(
    t,
    at(i, e, 0.02, 0.004, {
      hp: 2500,
    }),
    0,
    0.9,
    i,
  );
  let s = [184, 207, 233, 258];
  for (let a = 0; a < Math.round(1.1 * i); a++) {
    let l = a / i,
      c = Math.pow(0.16, l / 1) * (1 + 0.06 * Math.sin(vt * (9 - 5 * l) * l)),
      u = 0;
    for (let f = 0; f < 4; f++)
      ((n[f] += (vt * s[f] * c) / i),
        (u +=
          Math.sin(n[f]) +
          0.5 * Math.sin(2 * n[f]) +
          0.3 * Math.sin(3 * n[f])));
    let h = 0.6 + 0.4 * Math.sign(Math.sin(vt * (26 - 16 * l) * l));
    t[a] += u * 0.16 * h * Math.exp(-l / 0.55) * (1 - Math.exp(-l / 0.01));
  }
  let o = Qn(i, 1, e);
  (di(o, "bp", Vo(3200, 500), 1, i),
    Se(t, lo(o, i, co(0.35, 0.01)), 0, 0.3, i));
  let r = 0.72;
  return (
    Se(
      t,
      at(i, e, 0.2, 0.035, {
        lp: 3e3,
      }),
      r,
      1,
      i,
    ),
    Se(t, ei(i, 0.12, 130, 55, 0.02, 0.035), r, 0.8, i),
    Se(
      t,
      dn(
        i,
        0.4,
        [
          [705, 0.07, 1],
          [1490, 0.05, 0.7],
          [2610, 0.035, 0.5],
          [4020, 0.02, 0.3],
        ],
        e,
      ),
      r,
      0.28,
      i,
    ),
    Se(
      t,
      Jc(i, e, 0.7, 26, {
        from: 0.02,
        fall: 1.7,
        hp: 1500,
        ampFall: 0.2,
        maxLen: 0.008,
      }),
      r,
      0.5,
      i,
    ),
    Se(
      t,
      dn(
        i,
        0.2,
        [
          [1900, 0.03, 1],
          [3350, 0.02, 0.6],
        ],
        e,
      ),
      r + 0.19,
      0.14,
      i,
    ),
    Wo(t, 1.4)
  );
}

function R8(i, e) {
  let t = St(i, 1.9),
    n = 0,
    s = 0,
    o = St(i, 1.3);
  for (let r = 0; r < o.length; r++) {
    let a = r / i,
      l = 30 + 112 * Math.pow(1 - a / 1.3, 1.6);
    ((n += l / i),
      (s += (180 + 1050 * Math.exp(-a / 0.3)) / i),
      (o[r] =
        (2 * (n - Math.floor(n)) - 1) *
          (1 - Math.exp(-a / 0.02)) *
          Math.pow(1 - a / 1.3, 0.7) +
        Math.sin(vt * s) * 0.25 * Math.exp(-a / 0.4)));
  }
  (di(o, "lp", Vo(1100, 160), 2.5, i),
    Se(t, o, 0, 0.55, i),
    Se(
      t,
      at(i, e, 0.03, 0.006, {
        hp: 2e3,
      }),
      0,
      0.5,
      i,
    ));
  for (let [r, a, l] of [
    [0.62, 1, 1],
    [0.84, 0.75, 1.22],
    [0.98, 0.5, 0.86],
    [1.17, 0.42, 1.4],
    [1.33, 0.22, 1.1],
  ])
    (Se(t, ei(i, 0.1, 105 * l, 48, 0.02, 0.035), r, a * 0.9, i),
      Se(
        t,
        at(i, e, 0.08, 0.016, {
          lp: 2400,
        }),
        r,
        a * 0.8,
        i,
      ),
      Se(
        t,
        dn(
          i,
          0.3,
          [
            [388 * l, 0.07, 1],
            [861 * l, 0.05, 0.7],
            [1540 * l, 0.035, 0.5],
            [2750 * l, 0.02, 0.35],
          ],
          e,
        ),
        r,
        a * 0.3,
        i,
      ));
  return (
    Se(
      t,
      Jc(i, e, 1, 22, {
        from: 0,
        fall: 1.2,
        hp: 1800,
        ampFall: 0.4,
        maxLen: 0.007,
      }),
      0.62,
      0.3,
      i,
    ),
    Wo(ml(t, 0.55), 1.5)
  );
}

function C8(i, e, t) {
  let n = St(i, 0.52),
    s = t ? 622 : 1320,
    o = s * 1.4142,
    r = 0,
    a = (l, c, u, h) => {
      let f = Math.round(c * i),
        p = Math.round(l * i);
      for (let d = 0; d < f; d++) {
        let v = d / f,
          g = d / i;
        r += (vt * u * (1 + h * v)) / i;
        let x = Math.sin(
          r + 1.6 * Math.sin(r * 0.25) + 0.4 * Math.sin(vt * 71 * g),
        );
        n[p + d] +=
          Math.tanh(x * 2.2) *
          Math.min(1, d / (0.004 * i), (f - d) / (0.012 * i));
      }
    };
  return (
    a(0, 0.09, s, 0),
    a(0.12, 0.17, o, -0.05),
    t && a(0.3, 0.2, s * 0.5, 0.5),
    tn(n, "bp", t ? 1100 : 2100, 0.6, i),
    Se(
      n,
      at(i, e, 0.4, 0.2, {
        hp: 4e3,
        att: 0.02,
      }),
      0,
      0.03,
      i,
    ),
    n
  );
}

function P8(i, e, t) {
  let n = St(i, 0.6),
    s = n.length,
    o = 0.55,
    r = 0,
    a = 0;
  for (let c = 0; c < s; c++) {
    let u = c / i,
      h = Math.min(1, u / o),
      f = Math.pow(h, 1.4) * (u < o ? 1 : Math.exp(-(u - o) / 0.008));
    if (t) {
      ((r += (170 + 380 * h * h) / i), (a += (680 + 900 * h) / i));
      let p = 2 * (r - Math.floor(r)) - 1;
      n[c] =
        (p * (0.7 + 0.3 * Math.sin(vt * 38 * u)) + 0.35 * Math.sin(vt * a)) * f;
    } else
      ((r += (620 + 1900 * h * h * h) / i),
        (a += ((1240 + 3800 * h * h * h) * 1.003) / i),
        (n[c] =
          (Math.sin(vt * r) +
            0.4 * Math.sin(vt * a) +
            0.25 * Math.sign(Math.sin(vt * r * 0.5))) *
          f *
          (0.8 + 0.2 * Math.sin(vt * (20 + 60 * h) * u))));
  }
  (tn(n, "lp", t ? 2600 : 7e3, 0.7, i), tn(n, "hp", t ? 120 : 400, 0.7, i));
  let l = t ? 7 : 5;
  for (let c = 0; c < l; c++) {
    let u = o * Math.sqrt(c / l);
    Se(
      n,
      dn(
        i,
        0.03,
        [
          [t ? 1500 : 3800, 0.004, 1],
          [t ? 2600 : 6100, 0.003, 0.6],
        ],
        e,
      ),
      u,
      0.12 + (0.2 * c) / l,
      i,
    );
  }
  return n;
}

function z8(i, e) {
  let t = St(i, 1.7);
  Se(
    t,
    at(i, e, 0.01, 0.002, {
      hp: 2500,
    }),
    0,
    1,
    i,
  );
  let n = Qn(i, 0.5, e);
  tn(n, "bp", 3e3, 0.8, i);
  let s = 1;
  for (let l = 0; l < n.length; l++) {
    let c = l / i;
    (l % 220 === 0 && (s = e() < 0.55 + 0.4 * (1 - c / 0.5) ? 1 : 0),
      (n[l] =
        (n[l] * (Math.sin(vt * 100 * c) > -0.2 ? 1 : 0.15) +
          0.35 * Math.sign(Math.sin(vt * 100 * c)) * (e() - 0.3)) *
        s *
        Math.exp(-c / 0.3)));
  }
  Se(t, n, 0.005, 0.8, i);
  let o = St(i, 1.25),
    r = 0,
    a = 0;
  for (let l = 0; l < o.length; l++) {
    let c = l / i,
      u = Math.pow(0.22, c / 1.2);
    ((r += (vt * 100 * u) / i),
      (a += (vt * (150 + 1900 * Math.pow(1 - c / 1.25, 2.2))) / i),
      (o[l] =
        ((Math.sin(r) +
          0.6 * Math.sin(2 * r) +
          0.4 * Math.sin(3 * r) +
          0.25 * Math.sin(5 * r)) *
          0.5 +
          Math.sin(a) * 0.22) *
        Math.pow(1 - c / 1.25, 1.2) *
        (1 - Math.exp(-c / 0.03))));
  }
  return (
    Se(t, o, 0.4, 0.8, i),
    Se(t, ei(i, 0.12, 140, 60, 0.03, 0.04), 0.4, 0.5, i),
    Wo(t, 1.3)
  );
}

function* D8(n, e, t) {
  let i = St(n, 6.5),
    s = Qn(n, 6.4, e);
  (yield, di(s, "lp", Vo(t ? 520 : 380, 70, 0.6), 0.7, n), yield);
  let o = [];
  for (let u = 0; u < 9; u++)
    o.push([Xt(e, 0.05, 3.6), Xt(e, 0.12, 0.5), Xt(e, 0.4, 1)]);
  let r = 0,
    a = 0,
    l = (u) => {
      let f = 0;
      for (let [h, p, d] of o) {
        let m = (u - h) / p;
        f += d * Math.exp(-m * m);
      }
      return (0.25 + f) * Math.exp(-u / 1.9) * (1 - Math.exp(-u / 0.05));
    };
  for (let u = 0; u < s.length; u++)
    ((u & 31) === 0 && ((r = l(u / n)), (a = (l((u + 32) / n) - r) / 32)),
      (s[u] *= r),
      (r += a));
  (Se(i, s, 0, 1, n), yield);
  let c = Qn(n, 6, e);
  return (
    tn(c, "bp", 48, 1.2, n),
    Se(i, lo(c, n, co(2, 0.2)), 0.05, 3, n),
    t && Se(i, at(n, e, 0.3, 0.06, { hp: 300, lp: 2500 }), 0.02, 0.25, n),
    i
  );
}

var jb = [0, 1, 0.435, 0.268, 0.19, 0.145, 0.116, 0.097];

function L8(i, e) {
  let t = St(i, 5),
    n = t.length;
  for (let s = 0; s < n; s++) {
    let o = s / i,
      r = 0.0025 * Math.sin(vt * 4.3 * o),
      a =
        Math.min(1, o / 0.45) *
        Math.min(1, (5 - o) / 1.5) *
        (o < 3.2 ? 1 : Math.exp(-(o - 3.2) / 0.7)),
      l = 0;
    for (let c = 1; c <= 7; c++)
      l += Math.sin(vt * 92.5 * c * o * (1 + r) + c) * jb[c];
    for (let c = 1; c <= 4; c++)
      l += 0.45 * Math.sin(vt * 138.6 * c * o + c * 2) * jb[c];
    t[s] = l * a;
  }
  return (tn(t, "lp", 520, 0.7, i), t);
}

function k8(i, e, t) {
  let n = St(i, 1.4),
    s = t ? 3 : 4,
    o = 0.02;
  for (let r = 0; r < s; r++) {
    let a = Xt(e, 0.17, 0.26) * (t ? 1.4 : 1),
      l = Math.round(a * i),
      c = Math.round(o * i),
      u = (t ? 1250 : 1550) * (1 - r * 0.04),
      h = 0;
    for (let f = 0; f < l && c + f < n.length; f++) {
      let p = f / l,
        d = u * (1 + 0.55 * Math.sin(Math.PI * Math.pow(p, 0.6)) - 0.25 * p);
      h += (vt * d) / i;
      let v = 1 + 0.3 * Math.sin((vt * 63 * f) / i);
      n[c + f] +=
        (Math.sin(h) +
          0.6 * Math.sin(2 * h + 0.5) +
          0.35 * Math.sin(3 * h) +
          0.15 * Math.sin(4 * h)) *
        v *
        Math.pow(Math.sin(Math.PI * p), 0.7) *
        (1 - r * 0.14);
    }
    o += a + Xt(e, 0.05, 0.12);
  }
  return (tn(n, "lp", 4200, 0.7, i), n);
}

function F8(i, e, t) {
  let n = St(i, 1.1),
    s = t ? 1.19 : 1,
    o = 0.01,
    r = t ? 3 : 4;
  for (let a = 0; a < r; a++)
    (Se(
      n,
      dn(
        i,
        0.5,
        [
          [2310 * s, Xt(e, 0.06, 0.13), 1],
          [3740 * s, 0.07, 0.7],
          [5910 * s, 0.04, 0.5],
          [8130 * s, 0.025, 0.3],
          [1012 * s, 0.03, 0.3],
        ],
        e,
      ),
      o,
      Xt(e, 0.35, 1),
      i,
    ),
      Se(
        n,
        at(i, e, 0.004, 0.001, {
          hp: 3e3,
        }),
        o,
        0.3,
        i,
      ),
      (o += Xt(e, 0.09, 0.26)));
  return n;
}

function U8(i, e) {
  let t = St(i, 2.8),
    n = St(i, 2.2);
  return (
    Se(
      n,
      dn(
        i,
        2.2,
        [
          [47, 0.7, 1],
          [77, 0.55, 0.9],
          [121, 0.4, 0.7],
          [163, 0.3, 0.5],
          [214, 0.22, 0.4],
          [330, 0.12, 0.25],
        ],
        e,
      ),
      0,
      0.5,
      i,
    ),
    Se(
      n,
      at(i, e, 0.5, 0.11, {
        lp: 420,
      }),
      0,
      1,
      i,
    ),
    Se(t, n, 0, 1, i),
    Se(t, n, 0.36, 0.3, i),
    Se(t, n, 0.61, 0.12, i),
    t
  );
}

function N8(i, e) {
  let t = St(i, 0.09);
  return (
    Se(
      t,
      dn(
        i,
        0.08,
        [
          [1820, 0.009, 1],
          [2730, 0.007, 0.6],
          [640, 0.012, 0.5],
        ],
        e,
      ),
      0,
      1,
      i,
    ),
    Se(
      t,
      at(i, e, 0.004, 0.001, {
        hp: 2500,
      }),
      0,
      0.5,
      i,
    ),
    t
  );
}

function B8(i, e) {
  let t = St(i, 0.06);
  return (
    Se(
      t,
      dn(
        i,
        0.05,
        [
          [3200, 0.008, 1],
          [4800, 0.005, 0.3],
        ],
        e,
      ),
      0,
      1,
      i,
    ),
    t
  );
}

function* O8(i, e) {
  let n = function* (s) {
    let o = Zc(i, 6, s, (u) => {
      (tn(u, "hp", 900, 0.6, i), tn(u, "lp", 8500, 0.6, i));
    });
    yield;
    let r = Zc(i, 6, s, (u) => {
        tn(u, "bp", 420, 0.5, i);
      }),
      a = o.length,
      l = Q1(a, [o, 0.5], [r, 0.75]),
      c = new Float32Array(a);
    for (let u = 0; u < 1020; u++) {
      let h = Math.floor(s() * a),
        f = Math.round(Xt(s, 6e-4, 0.003) * i),
        p = Math.pow(s(), 3) * 1.6 + 0.15;
      for (let d = 0; d < f; d++)
        ((c[h] += (s() * 2 - 1) * p * Math.exp((-5 * d) / f)),
          ++h >= a && (h = 0));
    }
    (yield, di(c, "hp", () => 2200, 0.7, i, 2), yield);
    for (let u = 0; u < 30; u++) {
      let h = Xt(s, 700, 2100);
      Us(
        c,
        jc(i, Xt(s, 0.008, 0.02), h, h * 1.7),
        s() * 6,
        Xt(s, 0.08, 0.3),
        i,
      );
    }
    for (let u = 0; u < a; u++) l[u] += c[u] * 0.55;
    return l;
  };
  return [
    yield* n(ao(Math.floor(e() * 1e9))),
    yield* n(ao(Math.floor(e() * 1e9))),
  ];
}

function* H8(i, e) {
  let n = function* (s) {
    let o = Zc(i, 6, s, (c) => {
        (tn(c, "lp", 1300, 0.6, i), tn(c, "hp", 110, 0.7, i));
      }),
      r = o.length,
      a = new Float32Array(r);
    for (let c = 0; c < 1560; c++)
      a[Math.floor(s() * r)] += (s() * 2 - 1) * (0.2 + Math.pow(s(), 4) * 3);
    let l = Q1(r, [o, 0.8]);
    for (let [c, u, h] of [
      [1820, 14, 1],
      [2740, 16, 0.8],
      [4150, 18, 0.6],
      [6200, 14, 0.35],
      [940, 8, 0.7],
    ]) {
      let f = Float32Array.from(a);
      di(f, "bp", () => c, u, i, 2);
      for (let p = 0; p < r; p++) l[p] += f[p] * h * 5;
      yield;
    }
    for (let c = 0; c < 4; c++) {
      let u = Xt(s, 900, 1600);
      Us(l, jc(i, 0.014, u, u * 1.8), s() * 6, 0.25, i);
    }
    return l;
  };
  return [
    yield* n(ao(Math.floor(e() * 1e9))),
    yield* n(ao(Math.floor(e() * 1e9))),
  ];
}

function V8(i, e) {
  let s = Qn(i, 8.5, e),
    o = Float32Array.from(s);
  (di(
    s,
    "bp",
    (r) => {
      let a = r * 8.5;
      return (
        380 + 190 * Math.sin((vt * a) / 8) + 90 * Math.sin((vt * a) / 2.667 + 1)
      );
    },
    1.3,
    i,
  ),
    di(
      o,
      "bp",
      (r) => {
        let a = r * 8.5;
        return 1350 + 260 * Math.sin((vt * a) / 4 + 2);
      },
      9,
      i,
    ));
  for (let r = 0; r < s.length; r++) {
    let a = r / i;
    s[r] =
      s[r] * (0.7 + 0.3 * Math.sin((vt * a) / 8 + 0.5)) +
      o[r] * 0.22 * Math.pow(0.5 + 0.5 * Math.sin((vt * a) / 4 + 1), 2);
  }
  return Rv(s, i * 8, !0);
}

function* W8(i, e) {
  let s = Qn(i, 8.5, e),
    o = Qn(i, 8 + 0.5, e),
    r = Qn(i, 8 + 0.5, e);
  (yield,
    tn(s, "lp", 1100, 0.6, i),
    tn(s, "hp", 70, 0.7, i),
    tn(o, "hp", 2400, 0.7, i),
    tn(r, "bp", 520, 1.2, i),
    yield);
  for (let a = 0; a < s.length; a++) {
    let l = a / i,
      c = (l % 4) / 4,
      u = Math.pow(0.5 - 0.5 * Math.cos(vt * c), 1.5),
      h = Math.exp(-Math.pow((c - 0.5) / 0.05, 2)),
      f = Math.exp(-Math.pow((c - 0.68) / 0.16, 2)),
      p = 0.5 - 0.5 * Math.cos((vt * ((l + 1.3) % 2.667)) / 2.667);
    s[a] = s[a] * (0.3 + 0.7 * u + 0.25 * p) + r[a] * h * 1.8 + o[a] * f * 0.35;
  }
  return Rv(s, i * 8, !0);
}

export {
  $l,
  A6,
  A8,
  Av,
  B8,
  C6,
  C8,
  Ci,
  D6,
  D8,
  E6,
  F6,
  F8,
  H8,
  I6,
  KR,
  Kb,
  L6,
  L8,
  M6,
  M8,
  N8,
  Ns,
  O8,
  P6,
  P8,
  Q1,
  QR,
  Qb,
  Qn,
  R6,
  R8,
  S6,
  Se,
  St,
  T6,
  T8,
  U8,
  Us,
  V8,
  Vo,
  W8,
  Wo,
  Xt,
  _6,
  _8,
  a6,
  a8,
  ao,
  at,
  b6,
  c8,
  co,
  d6,
  d8,
  di,
  dn,
  e8,
  ei,
  em,
  f8,
  g6,
  g8,
  h6,
  h8,
  i8,
  k6,
  k8,
  l6,
  l8,
  lo,
  m6,
  m8,
  ml,
  n8,
  o8,
  p6,
  p8,
  q6_2,
  r8,
  s8,
  t8,
  tn,
  u8,
  v6,
  v8,
  vt,
  w6,
  w8,
  x6,
  x8,
  y6,
  y8,
  z6,
  z8,
};
