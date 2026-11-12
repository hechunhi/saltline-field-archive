// Ported from the newer Saltline bundle (weapons/weapon.js).
import {
  beveledBoxGeometry,
  mergeGeometries,
  tubeGeometry,
} from "../core/geometry.js";
import {
  BufferAttribute,
  BufferGeometry,
  Euler,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Matrix4,
  Path,
  Quaternion,
  Shape,
  ShapeUtils,
  Vector2,
} from "../vendor/three-r180.js";
import { AC, Bf, CC, RC, Wv } from "./rig.js";

var weaponShowcaseModule = {};

var gi = `
reflectedLight.indirectDiffuse *= dOcc; reflectedLight.indirectSpecular *= dOcc * dOcc;
reflectedLight.directDiffuse *= mix(1.0, dOcc, 0.35); reflectedLight.directSpecular *= mix(1.0, dOcc, 0.6);
`;

function fm(n, e) {
  let t = AC[n.name];
  return (
    t &&
      ((e = t.kind),
      n.color.setRGB(t.color[0], t.color[1], t.color[2]),
      (n.roughness = t.roughness),
      (n.metalness = t.metalness)),
    (n.onBeforeCompile = (i) => {
      ((i.uniforms.uRain = Wv),
        (i.vertexShader = i.vertexShader
          .replace(
            "#include <common>",
            `#include <common>
attribute vec4 aSurf; varying vec3 vObjP; varying vec3 vWNrm; varying vec3 vONrm; varying vec4 vSurf;`,
          )
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
vObjP = position; vONrm = normal; vWNrm = normalize(mat3(modelMatrix) * normal); vSurf = aSurf;`,
          )),
        (i.fragmentShader = i.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>
#define D_KIND ` +
              (e | 0) +
              `
` +
              RC,
          )
          .replace(
            "#include <metalnessmap_fragment>",
            `#include <metalnessmap_fragment>
` + CC,
          )
          .replace(
            "#include <normal_fragment_maps>",
            `#include <normal_fragment_maps>
` + Bf,
          )
          .replace(
            "#include <aomap_fragment>",
            `#include <aomap_fragment>
` + gi,
          )));
    }),
    (n.customProgramCacheKey = () => "pac-detail-3-" + e),
    n
  );
}

var Gv = (n, e, t) => {
  let i = Math.min(1, Math.max(0, (t - n) / (e - n)));
  return i * i * (3 - 2 * i);
};

function B_(n, e) {
  let t = n.attributes.position.array,
    i = t.length / 3,
    s = i / 3,
    o = new Float32Array(s * 3),
    r = new Float32Array(s);
  for (let f = 0; f < s; f++) {
    let h = f * 9,
      p = t[h + 3] - t[h],
      d = t[h + 4] - t[h + 1],
      m = t[h + 5] - t[h + 2],
      x = t[h + 6] - t[h],
      v = t[h + 7] - t[h + 1],
      y = t[h + 8] - t[h + 2],
      b = d * y - m * v,
      g = m * x - p * y,
      E = p * v - d * x,
      M = Math.hypot(b, g, E) || 1;
    ((o[f * 3] = b / M),
      (o[f * 3 + 1] = g / M),
      (o[f * 3 + 2] = E / M),
      (r[f] = M));
  }
  let a = Math.cos((e * Math.PI) / 180),
    l = new Map(),
    c = 5e4;
  for (let f = 0; f < i; f++) {
    let h =
        (Math.round(t[f * 3] * c) + 65536) * 17179869184 +
        (Math.round(t[f * 3 + 1] * c) + 65536) * 131072 +
        (Math.round(t[f * 3 + 2] * c) + 65536),
      p = l.get(h);
    p ? p.push(f) : l.set(h, [f]);
  }
  let u = new Float32Array(i * 3);
  for (let f of l.values())
    for (let h of f) {
      let p = (h / 3) | 0,
        d = o[p * 3],
        m = o[p * 3 + 1],
        x = o[p * 3 + 2],
        v = 0,
        y = 0,
        b = 0;
      for (let E of f) {
        let M = (E / 3) | 0;
        if (d * o[M * 3] + m * o[M * 3 + 1] + x * o[M * 3 + 2] >= a) {
          let _ = r[M];
          ((v += o[M * 3] * _),
            (y += o[M * 3 + 1] * _),
            (b += o[M * 3 + 2] * _));
        }
      }
      let g = Math.hypot(v, y, b);
      g > 1e-20
        ? ((u[h * 3] = v / g), (u[h * 3 + 1] = y / g), (u[h * 3 + 2] = b / g))
        : ((u[h * 3] = d), (u[h * 3 + 1] = m), (u[h * 3 + 2] = x));
    }
  n.setAttribute("normal", new BufferAttribute(u, 3));
}

function O_(n, e, t = {}) {
  let i = n.index ? n.toNonIndexed() : n,
    s = i.attributes.position.array,
    o = i.attributes.normal ? i.attributes.normal.array : null,
    r = [],
    a = [];
  for (let b = 0; b < s.length; b += 9) {
    let g = s[b + 3] - s[b],
      E = s[b + 4] - s[b + 1],
      M = s[b + 5] - s[b + 2],
      _ = s[b + 6] - s[b],
      T = s[b + 7] - s[b + 1],
      w = s[b + 8] - s[b + 2];
    if (!(Math.hypot(E * w - M * T, M * _ - g * w, g * T - E * _) < 1e-11))
      for (let S = 0; S < 9; S++) (r.push(s[b + S]), o && a.push(o[b + S]));
  }
  let l = new BufferGeometry();
  (l.setAttribute("position", new BufferAttribute(new Float32Array(r), 3)),
    t.keepN && o
      ? l.setAttribute("normal", new BufferAttribute(new Float32Array(a), 3))
      : B_(l, t.crease || 50));
  let c = r.length / 3,
    u = l.attributes.normal.array,
    f = new Float32Array(c * 3),
    h = new Float32Array(c * 4),
    p = new Float32Array(c),
    d = new Float32Array(c),
    m = t.wear == null ? 1 : t.wear,
    x = t.bare || 0,
    v = t.zone || 0,
    y = t.ao || 0;
  for (let b = 0; b < c; b += 3) {
    let g = 0,
      E = 0;
    for (let M = 0; M < 3; M++) {
      let _ = b + M,
        T = b + ((M + 1) % 3),
        w = r[T * 3] - r[_ * 3],
        S = r[T * 3 + 1] - r[_ * 3 + 1],
        R = r[T * 3 + 2] - r[_ * 3 + 2],
        z = w * w + S * S + R * R,
        I =
          ((u[T * 3] - u[_ * 3]) * w +
            (u[T * 3 + 1] - u[_ * 3 + 1]) * S +
            (u[T * 3 + 2] - u[_ * 3 + 2]) * R) /
          z;
      (I > g && (g = I), I < E && (E = I));
    }
    ((p[b] = p[b + 1] = p[b + 2] = g), (d[b] = d[b + 1] = d[b + 2] = E));
  }
  for (let b = 0; b < c; b++)
    ((f[b * 3] = e[0]),
      (f[b * 3 + 1] = e[1]),
      (f[b * 3 + 2] = e[2]),
      (h[b * 4] = Math.min(1, Gv(110, 520, p[b]) * m)),
      (h[b * 4 + 1] = Math.min(
        1,
        (t.aoFn
          ? Math.max(y, t.aoFn(r[b * 3], r[b * 3 + 1], r[b * 3 + 2]))
          : y) +
          0.7 * Gv(110, 520, -d[b]),
      )),
      (h[b * 4 + 2] = x),
      (h[b * 4 + 3] = v));
  return (
    l.setAttribute("color", new BufferAttribute(f, 3)),
    l.setAttribute("aSurf", new BufferAttribute(h, 4)),
    l
  );
}

var H_ = new Euler();

var V_ = new Matrix4();

var eu = (n, e, t, i, s) => (
  s && (H_.set(s[0], s[1], s[2]), n.applyMatrix4(V_.makeRotationFromEuler(H_))),
  n.translate(e, t, -i),
  n
);

function qv(n, e, t, i, s, o, r, a, l = {}, c = null) {
  return eu(
    O_(beveledBoxGeometry(n, e, t, i), a, { keepN: !0, ...l }),
    s,
    o,
    r,
    c,
  );
}

function tu(n, e, t = 2) {
  let i = n.length,
    s = [];
  for (let o = 0; o < i; o++) {
    let r = n[o],
      a = n[(o + i - 1) % i],
      l = n[(o + 1) % i],
      c = typeof e == "number" ? e : e[o] || 0,
      u = a[0] - r[0],
      f = a[1] - r[1],
      h = l[0] - r[0],
      p = l[1] - r[1],
      d = Math.hypot(u, f),
      m = Math.hypot(h, p),
      x =
        d > 1e-9 && m > 1e-9
          ? Math.acos(Math.max(-1, Math.min(1, (u * h + f * p) / (d * m))))
          : Math.PI;
    if (c <= 0 || x > 3.05) {
      for (let z = 0; z <= t; z++) s.push([r[0], r[1]]);
      continue;
    }
    let v = c / Math.tan(x / 2),
      y = 0.45 * Math.min(d, m);
    v > y && ((v = y), (c = v * Math.tan(x / 2)));
    let b = u / d + h / m,
      g = f / d + p / m,
      E = Math.hypot(b, g),
      M = c / Math.sin(x / 2),
      _ = r[0] + (b / E) * M,
      T = r[1] + (g / E) * M,
      w = Math.atan2(r[1] + (f / d) * v - T, r[0] + (u / d) * v - _),
      R = Math.atan2(r[1] + (p / m) * v - T, r[0] + (h / m) * v - _) - w;
    for (; R > Math.PI;) R -= 2 * Math.PI;
    for (; R < -Math.PI;) R += 2 * Math.PI;
    for (let z = 0; z <= t; z++) {
      let I = w + (R * z) / t;
      s.push([_ + Math.cos(I) * c, T + Math.sin(I) * c]);
    }
  }
  return s;
}

var nu = (n) =>
  n.filter((e, t) => {
    let i = n[(t + n.length - 1) % n.length];
    return Math.hypot(e[0] - i[0], e[1] - i[1]) > 1e-7;
  });

function W_(n, e) {
  let t = new Shape();
  if (
    (nu(n).forEach((i, s) => (s ? t.lineTo(i[0], i[1]) : t.moveTo(i[0], i[1]))),
    t.closePath(),
    e)
  )
    for (let i of e)
      t.holes.push(new Path(nu(i).map((s) => new Vector2(s[0], s[1]))));
  return t;
}

function G_(n, e, t, i, s) {
  return new ExtrudeGeometry(W_(n, i), {
    depth: Math.max(1e-4, e - 2 * t),
    bevelEnabled: t > 0,
    bevelThickness: t,
    bevelSize: t,
    bevelOffset: -t,
    bevelSegments: s || 1,
    steps: 1,
    curveSegments: 6,
  });
}

function Q0(n, e, t, i, s, o = {}) {
  let r = O_(G_(n, t - e, i, o.holes, o.bs), s, o);
  return (r.translate(0, 0, e + i), r.rotateY(Math.PI / 2), r);
}

function Nn(n, e, t, i, s, o = {}) {
  let r = O_(G_(n, t - e, i, o.holes, o.bs), s, o);
  return (r.translate(0, 0, -t + i), r);
}

function h0(n, e, t, i = {}) {
  let s = [],
    o = [],
    r = [],
    a = [],
    l = 0;
  for (let d = 0; d < n.length - 1; d++) {
    let m = n[d + 1][0] - n[d][0],
      x = n[d + 1][1] - n[d][1],
      v = Math.hypot(m, x);
    s.push(v < 1e-8 ? null : { nr: x / v, nf: -m / v, len: v });
  }
  let c = Math.cos(((i.crease || 50) * Math.PI) / 180),
    u = i.ox || 0,
    f = i.oy || 0,
    h = (d, m) => {
      let x = s[d],
        v = m >= 0 && m < s.length ? s[m] : null,
        y = x.nr * x.len,
        b = x.nf * x.len;
      v &&
        x.nr * v.nr + x.nf * v.nf >= c &&
        ((y += v.nr * v.len), (b += v.nf * v.len));
      let g = Math.hypot(y, b);
      return [y / g, b / g];
    };
  for (let d = 0; d < s.length; d++) {
    if (!s[d]) continue;
    let m = d - 1,
      x = d + 1;
    for (; m >= 0 && !s[m];) m--;
    for (; x < s.length && !s[x];) x++;
    let v = h(d, m),
      y = h(d, x),
      [b, g] = n[d],
      [E, M] = n[d + 1];
    for (let _ = 0; _ <= e; _++) {
      let T = (_ / e) * Math.PI * 2,
        w = Math.cos(T),
        S = Math.sin(T);
      (o.push(u + b * w, f + b * S, -g, u + E * w, f + E * S, -M),
        r.push(v[0] * w, v[0] * S, -v[1], y[0] * w, y[0] * S, -y[1]));
    }
    for (let _ = 0; _ < e; _++) {
      let T = l + _ * 2,
        w = T + 2,
        S = T + 1,
        R = T + 3;
      a.push(T, S, w, w, S, R);
    }
    l += (e + 1) * 2;
  }
  let p = new BufferGeometry();
  return (
    p.setAttribute("position", new Float32BufferAttribute(o, 3)),
    p.setAttribute("normal", new Float32BufferAttribute(r, 3)),
    p.setIndex(a),
    O_(p, t, { keepN: !0, ...i })
  );
}

function m0(n, e, t, i, s, o, r = 12, a = {}) {
  let l = Math.min(n * 0.25, e * 0.25),
    c = e / 2,
    u = h0(
      [
        [0, -c],
        [n - l, -c],
        [n, -c + l],
        [n, c - l],
        [n - l, c],
        [0, c],
      ],
      r,
      o,
      a,
    );
  return (u.rotateY(Math.PI / 2), u.translate(t, i, -s), u);
}

function Eu(n, e, t = {}) {
  let i = n[0].length,
    s = [],
    o = n.length,
    r = t.caps || [!0, !0],
    a = (f) => {
      let h = 0,
        p = 0,
        d = 0;
      for (let m of f) ((h += m[0]), (p += m[1]), (d += m[2]));
      return [h / i, p / i, d / i];
    },
    l = 0,
    c = n.map(a);
  for (let f = 0; f < o - 1; f++)
    for (let h = 0; h < i; h++) {
      let p = n[f][h],
        d = n[f][(h + 1) % i],
        m = n[f + 1][h],
        x = d[0] - p[0],
        v = d[1] - p[1],
        y = d[2] - p[2],
        b = m[0] - p[0],
        g = m[1] - p[1],
        E = m[2] - p[2];
      l +=
        (v * E - y * g) * (p[0] - c[f][0]) +
        (y * b - x * E) * (p[1] - c[f][1]) +
        (x * g - v * b) * (p[2] - c[f][2]);
    }
  for (let f = 0; f < o - 1; f++)
    for (let h = 0; h < i; h++) {
      let p = n[f][h],
        d = n[f][(h + 1) % i],
        m = n[f + 1][(h + 1) % i],
        x = n[f + 1][h];
      l >= 0
        ? s.push(...p, ...d, ...m, ...p, ...m, ...x)
        : s.push(...p, ...m, ...d, ...p, ...x, ...m);
    }
  for (let f of [0, 1]) {
    if (!r[f]) continue;
    let h = n[f ? o - 1 : 0],
      p = c[f ? o - 1 : 0],
      d = c[f ? o - 2 : 1],
      m = [p[0] - d[0], p[1] - d[1], p[2] - d[2]],
      x = Math.abs(m[0]),
      v = Math.abs(m[1]),
      y = Math.abs(m[2]),
      b = x > v && x > y ? 1 : 0,
      g = (v > x && v > y) || b === 1 ? 2 : 1,
      E = [],
      M = [];
    h.forEach((_, T) => {
      let w = h[(T + i - 1) % i];
      Math.hypot(_[0] - w[0], _[1] - w[1], _[2] - w[2]) > 1e-7 &&
        (E.push(T), M.push(new Vector2(_[b], _[g])));
    });
    for (let _ of ShapeUtils.triangulateShape(M, [])) {
      let T = h[E[_[0]]],
        w = h[E[_[1]]],
        S = h[E[_[2]]],
        R = w[0] - T[0],
        z = w[1] - T[1],
        I = w[2] - T[2],
        L = S[0] - T[0],
        U = S[1] - T[1],
        k = S[2] - T[2];
      (z * k - I * U) * m[0] +
        (I * L - R * k) * m[1] +
        (R * U - z * L) * m[2] >=
      0
        ? s.push(...T, ...w, ...S)
        : s.push(...T, ...S, ...w);
    }
  }
  let u = new BufferGeometry();
  return (
    u.setAttribute("position", new Float32BufferAttribute(s, 3)),
    O_(u, e, t)
  );
}

function $a_2(n, e, t, i, s, o = 3) {
  let r = [],
    a = (l, c, u, f) => {
      for (let h = 0; h <= o; h++) {
        let p = f + ((h / o) * Math.PI) / 2;
        r.push([l + Math.cos(p) * u, c + Math.sin(p) * u]);
      }
    };
  return (
    a(-n + s, e + s, s, Math.PI),
    a(n - s, e + s, s, Math.PI * 1.5),
    a(n - i, t - i, i, 0),
    a(-n + i, t - i, i, Math.PI / 2),
    r
  );
}

var kn = (n, e, t = {}) =>
  n.map((i) => [
    i[0] * (t.sx || 1) + (t.dx || 0),
    (i[1] - (t.cy || 0)) * (t.sy || 1) + (t.cy || 0) + (t.dy || 0),
    -e + (t.rake || 0) * i[1],
  ]);

function c5(n, e, t, i, s = 4) {
  let o = [],
    r = i / 2,
    a = t / 2 - r;
  for (let l = 0; l <= s; l++) {
    let c = -Math.PI / 2 + (l / s) * Math.PI;
    o.push([n + a + Math.cos(c) * r, e + Math.sin(c) * r]);
  }
  for (let l = 0; l <= s; l++) {
    let c = Math.PI / 2 + (l / s) * Math.PI;
    o.push([n - a + Math.cos(c) * r, e + Math.sin(c) * r]);
  }
  return o;
}

var Su = (n, e, t, i, s, o = 2) =>
  tu(
    [
      [n, e],
      [t, e],
      [t, i],
      [n, i],
    ],
    s,
    o,
  );

var $z = (n, e, t, i = 10) => {
  let s = [];
  for (let o = 0; o < i; o++) {
    let r = (o / i) * Math.PI * 2;
    s.push([n + Math.cos(r) * t, e + Math.sin(r) * t]);
  }
  return s;
};

function Fs_2(n) {
  let e = n.filter(Boolean);
  if (!e.length) return new BufferGeometry();
  for (let t of e)
    for (let i of Object.keys(t.attributes))
      ["position", "normal", "color", "aSurf"].includes(i) ||
        t.deleteAttribute(i);
  return mergeGeometries(e, !1);
}

function sy(n, e = null, t = 0.002) {
  let i = [1e9, 1e9, 1e9],
    s = [-1e9, -1e9, -1e9],
    o = [];
  for (let E of n) {
    let M = E.g.attributes.position.array,
      _ = E.g.attributes.normal.array,
      T = new Float32Array(M.length),
      w = new Float32Array(M.length),
      S = Math.cos(E.rx || 0),
      R = Math.sin(E.rx || 0),
      z = E.off || [0, 0, 0];
    for (let I = 0; I < M.length; I += 3) {
      ((T[I] = M[I] + z[0]),
        (T[I + 1] = M[I + 1] * S - M[I + 2] * R + z[1]),
        (T[I + 2] = M[I + 1] * R + M[I + 2] * S + z[2]),
        (w[I] = _[I]),
        (w[I + 1] = _[I + 1] * S - _[I + 2] * R),
        (w[I + 2] = _[I + 1] * R + _[I + 2] * S));
      for (let L = 0; L < 3; L++)
        (T[I + L] < i[L] && (i[L] = T[I + L]),
          T[I + L] > s[L] && (s[L] = T[I + L]));
    }
    o.push({ w: T, wn: w });
  }
  let r = 8,
    a = Math.ceil((s[0] - i[0]) / t) + 2 * r,
    l = Math.ceil((s[1] - i[1]) / t) + 2 * r,
    c = Math.ceil((s[2] - i[2]) / t) + 2 * r,
    u = new Uint8Array(a * l * c),
    f = i[0] - r * t,
    h = i[1] - r * t,
    p = i[2] - r * t,
    d = 1 / t,
    m = t * 0.9;
  for (let { w: E } of o)
    for (let M = 0; M < E.length; M += 9) {
      let _ = E[M],
        T = E[M + 1],
        w = E[M + 2],
        S = E[M + 3] - _,
        R = E[M + 4] - T,
        z = E[M + 5] - w,
        I = E[M + 6] - _,
        L = E[M + 7] - T,
        U = E[M + 8] - w,
        k = Math.max(1, Math.ceil(Math.hypot(S, R, z) / m)),
        C = Math.max(1, Math.ceil(Math.hypot(I, L, U) / m));
      for (let A = 0; A <= k; A++) {
        let F = A / k,
          H = Math.max(1, Math.ceil(C * (1 - F)));
        for (let N = 0; N <= H; N++) {
          let Z = (N / H) * (1 - F);
          u[
            ((((w + z * F + U * Z - p) * d) | 0) * l +
              (((T + R * F + L * Z - h) * d) | 0)) *
              a +
              (((_ + S * F + I * Z - f) * d) | 0)
          ] = 1;
        }
      }
    }
  let x = (E, M, _) =>
      u[
        ((((_ - p) * d) | 0) * l + (((M - h) * d) | 0)) * a +
          (((E - f) * d) | 0)
      ],
    v = [0.0032, 0.007],
    y = [1, 0.6],
    b = [1, -0.5, -0.5],
    g = [0, 0.866, -0.866];
  n.forEach((E, M) => {
    let { w: _, wn: T } = o[M],
      w = E.g.attributes.aSurf.array;
    for (let S = 0; S < _.length; S += 9) {
      let R = Math.max(
          Math.hypot(_[S + 3] - _[S], _[S + 4] - _[S + 1], _[S + 5] - _[S + 2]),
          Math.hypot(
            _[S + 6] - _[S + 3],
            _[S + 7] - _[S + 4],
            _[S + 8] - _[S + 5],
          ),
          Math.hypot(_[S] - _[S + 6], _[S + 1] - _[S + 7], _[S + 2] - _[S + 8]),
        ),
        z = 1 - Gv(0.012, 0.045, R);
      for (let I = 0; I < 3; I++) {
        let L = S + I * 3,
          U = L / 3,
          k = _[L],
          C = _[L + 1],
          A = _[L + 2],
          F = T[L],
          H = T[L + 1],
          N = T[L + 2];
        if (e) {
          let ue = e(k, C, A, E.key);
          ue > w[U * 4 + 3] && (w[U * 4 + 3] = ue);
        }
        if (z <= 0) continue;
        let Z, Q, W;
        Math.abs(F) < 0.8
          ? ((Z = 0), (Q = -N), (W = H))
          : ((Z = N), (Q = 0), (W = -F));
        let J = Math.hypot(Z, Q, W) || 1;
        ((Z /= J), (Q /= J), (W /= J));
        let G = H * W - N * Q,
          te = N * Z - F * W,
          oe = F * Q - H * Z,
          ee = 0,
          le = 0,
          xe = k + F * t * 1.3,
          j = C + H * t * 1.3,
          O = A + N * t * 1.3;
        for (let ue = 0; ue < 4; ue++) {
          let de = F,
            $ = H,
            se = N;
          if (ue) {
            let fe = b[ue - 1] * 0.78,
              me = g[ue - 1] * 0.78;
            ((de = F * 0.62 + Z * fe + G * me),
              ($ = H * 0.62 + Q * fe + te * me),
              (se = N * 0.62 + W * fe + oe * me));
          }
          ((le += 1.6),
            x(xe + de * v[0], j + $ * v[0], O + se * v[0])
              ? (ee += 1.6)
              : x(xe + de * v[1], j + $ * v[1], O + se * v[1]) && (ee += 0.6));
        }
        let q = Math.min(1, (ee / le) * 1.4) * z;
        q > w[U * 4 + 1] &&
          (w[U * 4 + 1] = Math.min(1, q + w[U * 4 + 1] * 0.4));
      }
    }
  });
}

var Zl = (n, e, t, i, s, o, r, a, l, c = 0.012) => {
  let u = Math.max(i - n, 0, n - s),
    f = Math.max(o - e, 0, e - r),
    h = Math.max(a + t, 0, -t - l);
  return 1 - Gv(0, c, Math.hypot(u, f, h));
};

var wn_2 = {
  name: "PAC-9 Longshore",
  muzzle: [0, 0, -0.531],
  eject: [0.023, 0.004, -0.028],
  sightY: 0.069,
  lensF: 0.0285,
  window: [
    [-0.016, 0.057],
    [0.016, 0.057],
    [0.016, 0.0772],
    [0.0122, 0.081],
    [-0.0122, 0.081],
    [-0.016, 0.0772],
  ],
  magPos: [0, -0.02, -0.0665],
  boltTravel: 0.062,
  railTop: 0.0435,
  grip: [0, -0.1, 0.073],
  handguard: [0, 0, -0.255],
  handguardR: 0.021,
  handlePos: [-0.026, 0.007, -0.078],
  squeeze: 0.86,
};

function TE() {
  let n = [1, 1, 1],
    e = [1.16, 1.05, 0.98],
    t = [0.86, 0.93, 1.04],
    i = [0.8, 0.8, 0.84],
    s = [0.94, 0.92, 0.88],
    o = [1.25, 1.2, 1.15],
    r = [1, 1, 1],
    a = [2.6, 2.6, 2.7],
    l = [11, 11, 11.4],
    c = [0.3, 0.3, 0.31],
    u = [1, 1, 1],
    f = [0.03, 0.03, 0.031],
    h = [0.016, 0.016, 0.017],
    p = { wear: 0.8 },
    d = { wear: 1, zone: 0.5 },
    m = { wear: 0.5, ao: 0.28 },
    x = { wear: 0.55 },
    v = { wear: 0.9 },
    y = { bare: 0.45, wear: 1.2 },
    b = { wear: 0.8 },
    g = { wear: 0, ao: 0.75 },
    E = { wear: 0 },
    M = [],
    _ = [],
    T = [],
    w = [],
    S = [],
    R = [],
    z = [],
    I = 0.0176,
    L = 0.0163,
    U = 0.0012,
    k = (V, ne, ye, Te, Re = 0.0022) => Su(V, ne, ye, Te, Re, 2),
    C = (V, ne, ye, Te, Re, Ue, Ve, ze) => {
      let Ge = Math.min(V * 0.25, (ye - ne) * 0.25);
      return h0(
        [
          [0, ne],
          [V - Ge, ne],
          [V, ne + Ge],
          [V, ye - Ge],
          [V - Ge, ye],
          [0, ye],
        ],
        Ve,
        Ue,
        { ...ze, ox: Te, oy: Re },
      );
    },
    A = (V, ne, ye, Te, Re, Ue, Ve, ze) => {
      let Ge = C(V, -ne / 2, ne / 2, 0, 0, Ue, Ve, ze);
      return (Ge.rotateX(Math.PI / 2), Ge.translate(ye, Te, -Re), Ge);
    },
    F = tu(
      [
        [-0.1, -0.02],
        [0.1, -0.02],
        [0.1, 0.0245],
        [-0.1, 0.0245],
      ],
      8e-4,
      1,
    ),
    H = c5(0.032, 0.007, 0.112, 0.0075, 4),
    N = Su(-0.012, -0.01, 0.06, 0.012, 0.003, 2);
  (M.push(Q0(F, 0, I - U + 1e-4, 5e-4, n, { ...m, holes: [N] })),
    M.push(Q0(F, -(I - U + 1e-4), 0, 5e-4, n, { ...m, holes: [H] })),
    M.push(
      Q0(F, -I, -(I - U), 45e-5, n, {
        ...x,
        holes: [
          H,
          k(-0.094, -0.015, -0.033, 0.017),
          k(-0.0225, -0.0155, 0.093, -8e-4),
        ],
      }),
    ),
    M.push(
      Q0(F, I - U, I, 45e-5, n, {
        ...x,
        holes: [
          N,
          k(0.0675, -0.015, 0.094, 0.017),
          k(-0.094, -0.0155, -0.04, -0.004),
        ],
      }),
    ));
  {
    let V = I + 4e-4,
      ne = (ye, Te, Re) =>
        tu(
          [
            [-V, 0.0226],
            [V, 0.0226],
            [V, Re],
            [Te, ye],
            [-Te, ye],
            [-V, Re],
          ],
          7e-4,
          1,
        );
    M.push(
      Eu(
        [
          kn(ne(0.0252, 0.015, 0.024), -0.1004),
          kn(ne(0.0335, 0.011, 0.0262), -0.0885),
          kn(ne(0.0335, 0.011, 0.0262), 0.0935),
          kn(ne(0.0276, 0.0142, 0.025), 0.1004),
        ],
        n,
        p,
      ),
    );
  }
  (_.push(qv(0.0034, 0.036, 0.19, 4e-4, -0.0116, 0.006, 0, c, g)),
    _.push(qv(0.0034, 0.012, 0.19, 4e-4, 0.0125, 0.022, 0, c, g)),
    _.push(qv(0.0034, 0.008, 0.19, 4e-4, 0.0125, -0.014, 0, c, g)),
    _.push(qv(0.02, 0.001, 0.196, 2e-4, 0, -0.0203, 0, c, g)),
    _.push(
      h0(
        [
          [0, 0.058],
          [0.0118, 0.058],
          [0.0118, 0.099],
          [0, 0.099],
        ],
        16,
        [0.8, 0.8, 0.82],
        E,
      ),
    ),
    M.push(
      Q0(
        tu(
          [
            [-0.04, -0.008],
            [-0.0165, -0.011],
            [-0.0145, 0.013],
            [-0.034, 0.016],
          ],
          0.002,
          2,
        ),
        I - 0.001,
        I + 0.0052,
        0.0022,
        n,
        { ...d, bs: 2 },
      ),
    ),
    M.push(
      h0(
        [
          [0, -0.086],
          [0.0058, -0.086],
          [0.0066, -0.0845],
          [0.0066, -0.06],
          [0.004, -0.0565],
          [0, -0.0565],
        ],
        14,
        n,
        { ...p, ox: 0.0182, oy: 0.012 },
      ),
    ),
    _.push(
      h0(
        [
          [0, -0.0945],
          [0.004, -0.0945],
          [0.0048, -0.0935],
          [0.0048, -0.0905],
          [0.0042, -0.09],
          [0.0042, -0.0885],
          [0.0048, -0.088],
          [0.0048, -0.086],
          [0, -0.086],
        ],
        12,
        r,
        { ...v, ox: 0.0182, oy: 0.012 },
      ),
    ),
    _.push(
      qv(
        0.0016,
        0.02,
        0.07,
        5e-4,
        I + 0.0042,
        -0.0212,
        0.024,
        r,
        v,
        [0, 0, 0.3],
      ),
    ),
    _.push(
      qv(
        0.0012,
        0.013,
        0.056,
        4e-4,
        I + 0.0056,
        -0.0208,
        0.024,
        r,
        v,
        [0, 0, 0.3],
      ),
    ),
    _.push(C(0.0015, -0.014, 0.062, I + 0.0012, -0.0116, a, 8, y)));
  for (let V of [-0.0115, 0.0245, 0.0595])
    _.push(C(0.0023, V - 0.0035, V + 0.0035, I + 0.0012, -0.0116, r, 8, v));
  _.push(m0(0.0016, 0.0016, I + 0.0068, -0.0285, 0.024, a, 8, y));
  for (let V of [-0.06, -0.072])
    _.push(m0(0.0019, 8e-4, -I + U - 2e-4, 0.011, V, c, 8, g));
  {
    let V = h0(
      [
        [0.0042, -0.0016],
        [0.0064, -0.0016],
        [0.0068, -0.0012],
        [0.0068, 6e-4],
        [0.0062, 0.0012],
        [0.0046, 0.0012],
        [0.0042, 4e-4],
      ],
      14,
      r,
      v,
    );
    (V.rotateY(-Math.PI / 2),
      V.translate(-(I - U) - 4e-4, 0.0035, 0.064),
      _.push(V),
      _.push(m0(0.0044, 6e-4, -(I - U) + 2e-4, 0.0035, -0.064, c, 10, g)));
  }
  let Z = [
    [-0.0078, 0.0333],
    [0.0078, 0.0333],
    [0.0106, 0.0402],
    [-0.0106, 0.0402],
  ];
  (M.push(Nn(Z, -0.096, 0.1003, 4e-4, n, { wear: 1, ao: 0.42 })),
    M.push(Nn(Z, 0.1008, 0.397, 4e-4, t, { wear: 1, ao: 0.42 })));
  let Q = tu(
    [
      [-0.0102, 0.0398],
      [0.0102, 0.0398],
      [0.0106, 0.0408],
      [0.008, 0.0435],
      [-0.008, 0.0435],
      [-0.0106, 0.0408],
    ],
    [0, 0, 3e-4, 5e-4, 5e-4, 3e-4],
    1,
  );
  {
    let V = Nn(Q, 0, 0.00478, 6e-4, n, { wear: 1, zone: 0.45 }),
      ne = Nn(Q, 0, 0.00478, 6e-4, t, { wear: 1, zone: 0.45 });
    for (let ye = 0; ye < 49; ye++) {
      let Te = -0.0945 + ye * 0.01001;
      M.push((Te < 0.1 ? V : ne).clone().translate(0, 0, -Te));
    }
  }
  let W = tu(
    [
      [-0.1, -0.0203],
      [0.099, -0.0203],
      [0.101, -0.03],
      [0.098, -0.088],
      [0.036, -0.082],
      [0.031, -0.058],
      [-0.03, -0.058],
      [-0.04, -0.066],
      [-0.078, -0.055],
      [-0.1, -0.044],
    ],
    [8e-4, 8e-4, 0.004, 0.003, 0.003, 0.004, 0.004, 0.004, 0.006, 0.003],
    2,
  );
  M.push(Q0(W, -(L - U + 1e-4), L - U + 1e-4, 5e-4, e, m));
  for (let V of [-1, 1]) {
    let ne = [
        k(0.0405, -0.077, 0.0945, -0.0265, 0.003),
        $z(-0.048, -0.036, 0.0074, 14),
      ],
      ye = Q0(W, L - U, L, 45e-5, e, { ...x, holes: ne });
    (V < 0 && (ye.scale(-1, 1, 1), Zz(ye)), M.push(ye));
  }
  (M.push(
    qv(
      0.0372,
      0.0095,
      0.0665,
      0.0022,
      0,
      -0.0838,
      0.0668,
      e,
      { wear: 0.82, zone: 1 },
      [-0.095, 0, 0],
    ),
  ),
    M.push(qv(0.0348, 0.05, 0.0044, 0.001, 0, -0.053, 0.099, e, p)));
  for (let V = 0; V < 7; V++)
    M.push(
      qv(
        0.024,
        0.003,
        0.0016,
        6e-4,
        0,
        -0.0345 - V * 0.006,
        0.1012 - V * 3e-4,
        e,
        { wear: 1.4 },
      ),
    );
  M.push(qv(0.0348, 0.038, 0.0044, 0.001, 0, -0.048, 0.0345, e, p));
  for (let [V, ne] of [
    [0.087, -0.029],
    [-0.086, -0.031],
  ])
    (_.push(m0(0.0036, 0.0336, 0, ne, V, a, 12, y)),
      _.push(m0(0.005, 0.0016, L + 0.0012, ne, V, r, 14, v)),
      _.push(m0(0.0011, 0.001, -L - 8e-4, ne, V, c, 8, g)));
  (_.push(m0(0.0021, 0.0334, 0, -0.04, 0.012, a, 10, y)),
    _.push(m0(0.0021, 0.0334, 0, -0.032, 0.032, a, 10, y)));
  for (let V of [-1, 1])
    (_.push(m0(0.0062, 0.003, V * (L + 2e-4), -0.036, -0.048, r, 16, v)),
      _.push(
        qv(
          0.0036,
          0.0058,
          0.022,
          0.0014,
          V * (L + 0.0026),
          -0.036,
          -0.037,
          r,
          { wear: 1.2 },
          [0.5, 0, 0],
        ),
      ),
      _.push(m0(0.0016, 0.001, V * (L + 0.002), -0.036, -0.048, a, 8, y)));
  _.push(
    Q0(
      tu(
        [
          [0.0155, -0.019],
          [0.0285, -0.019],
          [0.029, -0.033],
          [0.025, -0.0415],
          [0.019, -0.0415],
          [0.015, -0.033],
        ],
        0.0015,
        1,
      ),
      -L - 0.0032,
      -L + 2e-4,
      9e-4,
      r,
      v,
    ),
  );
  for (let V = 0; V < 4; V++)
    _.push(
      qv(
        0.0012,
        0.0016,
        0.0105,
        5e-4,
        -L - 0.0036,
        -0.0215 - V * 0.0036,
        0.022,
        r,
        { wear: 1.3 },
      ),
    );
  (_.push(m0(0.0015, 0.034, 0, -0.0375, 0.022, a, 8, y)),
    _.push(
      m0(0.0054, 0.0044, L + 0.0014, -0.042, 0.016, r, 14, { wear: 1.2 }),
    ));
  for (let V = 0; V < 3; V++)
    _.push(
      qv(
        6e-4,
        0.0076 - Math.abs(V - 1) * 0.0018,
        0.001,
        2e-4,
        L + 0.0037,
        -0.042,
        0.0138 + V * 0.0022,
        r,
        E,
      ),
    );
  (M.push(
    Q0(
      tu(
        [
          [0.004, -0.0325],
          [0.029, -0.0335],
          [0.029, -0.053],
          [0.004, -0.053],
          [0.004, -0.05],
          [0.0245, -0.05],
          [0.0245, -0.0365],
          [0.004, -0.036],
        ],
        8e-4,
        1,
      ),
      L - 4e-4,
      L + 0.003,
      0.001,
      e,
      p,
    ),
  ),
    M.push(
      Q0(
        tu(
          [
            [0.033, -0.056],
            [0.033, -0.093],
            [0.024, -0.1005],
            [-0.031, -0.1005],
            [-0.041, -0.09],
            [-0.041, -0.06],
          ],
          0.003,
          2,
        ),
        -0.007,
        0.007,
        0.0014,
        e,
        {
          ...p,
          bs: 2,
          holes: [
            tu(
              [
                [0.029, -0.059],
                [0.029, -0.0915],
                [0.0225, -0.0968],
                [-0.0295, -0.0968],
                [-0.0372, -0.0885],
                [-0.0372, -0.061],
              ],
              0.004,
              3,
            ),
          ],
        },
      ),
    ),
    _.push(
      Q0(
        tu(
          [
            [-0.006, -0.057],
            [0.004, -0.057],
            [0.003, -0.069],
            [0.0065, -0.079],
            [0.01, -0.086],
            [0.0065, -0.088],
            [0.001, -0.081],
            [-0.004, -0.07],
          ],
          [0, 0, 0.004, 0.006, 8e-4, 8e-4, 0.006, 0.004],
          2,
        ),
        -0.0031,
        0.0031,
        0.0011,
        r,
        { wear: 0.6, bs: 2 },
      ),
    ));
  let J = tu(
    [
      [-0.038, -0.05],
      [-0.045, -0.074],
      [-0.049, -0.086],
      [-0.049, -0.1],
      [-0.054, -0.112],
      [-0.057, -0.13],
      [-0.064, -0.158],
      [-0.11, -0.152],
      [-0.102, -0.112],
      [-0.096, -0.082],
      [-0.095, -0.064],
      [-0.103, -0.046],
      [-0.08, -0.044],
    ],
    [
      0.002, 0.006, 0.004, 0.004, 0.006, 0.008, 0.003, 0.004, 0.02, 0.02, 0.006,
      0.003, 0.004,
    ],
    2,
  );
  T.push(Q0(J, -0.0142, 0.0142, 0.005, u, { ...b, bs: 3 }));
  {
    let V = tu(
      [
        [-0.0565, -0.085],
        [-0.061, -0.109],
        [-0.068, -0.149],
        [-0.101, -0.145],
        [-0.095, -0.112],
        [-0.09, -0.085],
      ],
      0.004,
      2,
    );
    for (let ne of [-1, 1])
      T.push(
        Q0(V, ne > 0 ? 0.0138 : -0.0146, ne > 0 ? 0.0146 : -0.0138, 4e-4, u, {
          wear: 0.8,
          zone: 1,
        }),
      );
  }
  for (let V = 0; V < 7; V++) {
    let ne = -0.084 - V * 0.0098,
      ye = -0.0527 + (ne + 0.084) * 0.21;
    T.push(qv(0.015, 0.0034, 0.003, 0.0012, 0, ne, ye, u, b, [-0.21, 0, 0]));
  }
  for (let V = 0; V < 7; V++) {
    let ne = -0.078 - V * 0.01,
      ye = -0.0962 + (ne + 0.078) * 0.16;
    T.push(qv(0.016, 0.004, 0.0034, 0.0014, 0, ne, ye, u, b, [-0.16, 0, 0]));
  }
  (T.push(
    qv(0.03, 0.0056, 0.049, 0.002, 0, -0.1568, -0.087, u, b, [0.13, 0, 0]),
  ),
    _.push(m0(0.0028, 0.0296, 0, -0.15, -0.085, a, 8, y)));
  let G = wn_2.handguardR,
    te = 0.00885,
    oe = 0.0028,
    ee = 0.101,
    le = 0.398,
    xe = tu(
      [
        [ee, -te],
        [le, -te],
        [le, te],
        [ee, te],
      ],
      0.001,
      1,
    );
  for (let V = 0; V < 8; V++) {
    let ne = [];
    if (V === 0 || V === 4 || V === 6)
      for (let Re = 0; Re < 7; Re++)
        ne.push(c5(0.13 + Re * 0.04, 0, 0.032, 0.007, 4));
    else if (V !== 2)
      for (let Re = 0; Re < 10; Re++) {
        let Ue = 0.124 + Re * 0.027;
        (V === 3 && Ue > 0.3) || ne.push(c5(Ue, 0, 0.013, 0.0052, 3));
      }
    let ye = Q0(xe, G - oe, G, 8e-4, t, { ...p, holes: ne });
    (ye.rotateZ((V * Math.PI) / 4), M.push(ye));
    let Te = ((V + 0.5) * Math.PI) / 4;
    M.push(
      C(0.003, ee, le, Math.cos(Te) * 0.0197, Math.sin(Te) * 0.0197, t, 8, {
        wear: 1.2,
      }),
    );
  }
  (M.push(
    Nn(
      tu(
        [
          [-0.0088, 0.02],
          [0.0088, 0.02],
          [0.0106, 0.029],
          [0.0082, 0.0336],
          [-0.0082, 0.0336],
          [-0.0106, 0.029],
        ],
        8e-4,
        1,
      ),
      0.1012,
      0.3978,
      0.001,
      t,
      p,
    ),
  ),
    M.push(
      h0(
        [
          [0.016, 0.096],
          [0.0236, 0.096],
          [0.0243, 0.0967],
          [0.0243, 0.101],
          [0.0236, 0.1016],
          [0.0236, 0.1062],
          [0.0228, 0.1075],
          [0.016, 0.1075],
        ],
        16,
        t,
        { wear: 1.3 },
      ),
    ));
  for (let V of [-1, 1]) {
    M.push(qv(0.005, 0.015, 0.03, 0.0014, V * 0.0222, -0.003, 0.119, t, p));
    for (let ne of [0.112, 0.126])
      (_.push(m0(0.0027, 0.0016, V * 0.0252, -0.003, ne, a, 6, y)),
        _.push(m0(0.0012, 6e-4, V * 0.026, -0.003, ne, c, 6, g)));
    M.push(qv(0.003, 0.006, 0.008, 0.001, V * 0.015, -0.019, 0.1, t, p));
  }
  M.push(
    h0(
      [
        [0.018, 0.3985],
        [0.0222, 0.3985],
        [0.0226, 0.399],
        [0.0226, 0.4004],
        [0.022, 0.4012],
        [0.018, 0.4012],
        [0.018, 0.3985],
      ],
      8,
      t,
      { wear: 1.4 },
    ),
  );
  for (let V of [0.115, 0.215, 0.3, 0.385])
    for (let ne of [-1, 1])
      (_.push(A(0.0019, 0.0012, ne * 0.0098, 0.0314, V, a, 6, y)),
        _.push(A(9e-4, 4e-4, ne * 0.0098, 0.0321, V, c, 6, g)));
  {
    let V = Q.map((Re) => [Re[0], Re[1] - 0.016]),
      ne = Z.map((Re) => [Re[0], Re[1] - 0.0128]),
      ye = [Nn(ne, 0.318, 0.396, 4e-4, t, p)];
    for (let Re = 0; Re < 8; Re++) {
      let Ue = 0.319 + Re * 0.01001;
      ye.push(Nn(V, Ue, Ue + 0.00478, 6e-4, t, { wear: 1.3 }));
    }
    for (let Re of ye) (Re.rotateZ(Math.PI / 4), M.push(Re));
    let Te = [Nn(ne, 0.35, 0.392, 4e-4, t, p)];
    for (let Re = 0; Re < 4; Re++) {
      let Ue = 0.352 + Re * 0.01001;
      Te.push(Nn(V, Ue, Ue + 0.00478, 6e-4, t, { wear: 1.3 }));
    }
    for (let Re of Te) (Re.rotateZ(Math.PI), M.push(Re));
  }
  (T.push(
    Q0(
      tu(
        [
          [0.35, -0.026],
          [0.392, -0.026],
          [0.388, -0.036],
          [0.372, -0.05],
          [0.362, -0.05],
          [0.354, -0.036],
        ],
        0.003,
        2,
      ),
      -0.011,
      0.011,
      0.0032,
      u,
      { ...b, bs: 2, zone: 0.6 },
    ),
  ),
    T.push(
      Q0(
        tu(
          [
            [0.2395, -0.0215],
            [0.2725, -0.0215],
            [0.2725, -0.03],
            [0.27, -0.092],
            [0.2665, -0.0965],
            [0.2455, -0.0975],
            [0.242, -0.093],
            [0.2395, -0.03],
          ],
          0.0025,
          2,
        ),
        -0.014,
        0.014,
        0.0045,
        u,
        { ...b, bs: 3, zone: 0.7 },
      ),
    ));
  for (let V = 0; V < 6; V++)
    T.push(
      qv(
        0.0288,
        0.0024,
        0.0312,
        0.001,
        0,
        -0.04 - V * 0.0085,
        0.256 - V * 3e-4,
        u,
        b,
      ),
    );
  (T.push(qv(0.03, 0.005, 0.04, 0.0016, 0, -0.024, 0.256, u, b)),
    _.push(m0(0.003, 0.031, 0, -0.025, 0.256, a, 8, y)),
    _.push(
      h0(
        [
          [0.0115, 0.095],
          [0.0115, 0.15],
          [0.0095, 0.153],
          [0.0095, 0.285],
          [0.009, 0.288],
          [0.009, 0.322],
          [0.0086, 0.326],
          [0.0086, 0.435],
          [0.0092, 0.437],
          [0.0092, 0.453],
          [0.0075, 0.455],
          [0.0075, 0.461],
        ],
        20,
        r,
        v,
      ),
    ),
    _.push(
      h0(
        [
          [0.0092, 0.286],
          [0.0135, 0.286],
          [0.0142, 0.2875],
          [0.0142, 0.3165],
          [0.0135, 0.318],
          [0.0092, 0.318],
        ],
        16,
        r,
        v,
      ),
    ),
    _.push(qv(0.014, 0.009, 0.03, 0.002, 0, 0.0145, 0.302, r, v)),
    _.push(C(0.0026, 0.1, 0.3, 0, 0.0172, l, 8, { bare: 0.8, wear: 0.4 })),
    _.push(m0(0.002, 0.0145, 0, 0.012, 0.308, a, 6, y)));
  for (let V of [0.2925, 0.3115])
    _.push(A(0.0017, 0.001, 0, -0.0143, V, c, 6, g));
  (_.push(
    h0(
      [
        [0.0075, 0.459],
        [0.0104, 0.459],
        [0.0112, 0.4598],
        [0.0112, 0.4628],
        [0.0104, 0.4636],
        [0.0104, 0.4644],
        [0.011, 0.465],
        [0.0116, 0.4656],
        [0.0116, 0.477],
        [0.011, 0.478],
        [0.0052, 0.478],
      ],
      20,
      r,
      { wear: 1.1, zone: 0.6 },
    ),
  ),
    _.push(
      h0(
        [
          [0.0052, 0.477],
          [0.0052, 0.517],
        ],
        12,
        c,
        g,
      ),
    ));
  for (let V of [0.4865, 0.4965, 0.5065])
    _.push(
      h0(
        [
          [0.0052, V - 0.0019],
          [0.011, V - 0.0019],
          [0.0116, V - 0.0012],
          [0.0116, V + 0.0012],
          [0.011, V + 0.0019],
          [0.0052, V + 0.0019],
        ],
        20,
        r,
        { wear: 1.1, zone: 0.9 },
      ),
    );
  (_.push(
    h0(
      [
        [0.0052, 0.5145],
        [0.011, 0.5145],
        [0.0116, 0.5155],
        [0.0116, 0.527],
        [0.0102, 0.5305],
        [0.0062, 0.5305],
        [0.0048, 0.5285],
      ],
      20,
      r,
      { wear: 1.1, zone: 0.9 },
    ),
  ),
    _.push(
      h0(
        [
          [0.0048, 0.5285],
          [0.0036, 0.526],
          [0.0036, 0.495],
        ],
        14,
        c,
        g,
      ),
    ));
  for (let V of [-1, 1])
    _.push(
      qv(0.0125, 0.0042, 0.042, 0.0012, 0, V * 0.0096, 0.496, r, {
        wear: 1.1,
        zone: 0.9,
      }),
    );
  for (let V = 0; V < 3; V++)
    _.push(m0(0.0016, 0.0236, 0, 0, 0.4675 + V * 0.0035, c, 6, g));
  M.push(
    h0(
      [
        [0, -0.292],
        [0.0138, -0.292],
        [0.0146, -0.291],
        [0.0146, -0.1],
      ],
      20,
      o,
      p,
    ),
  );
  {
    let V = [[0.0146, -0.122]];
    for (let ne = 0; ne < 1; ne++)
      V.push(
        [0.0183, -0.122],
        [0.019, -0.1212],
        [0.019, -0.112],
        [0.0183, -0.111],
        [0.0146, -0.111],
      );
    _.push(h0(V, 12, r, { wear: 1.4, crease: 20 }));
    for (let ne = 0; ne < 6; ne++) {
      let ye = (ne * Math.PI) / 3 + 0.3;
      _.push(
        qv(
          0.004,
          0.0022,
          0.005,
          4e-4,
          Math.cos(ye) * 0.0186,
          Math.sin(ye) * 0.0186,
          -0.1192,
          c,
          g,
          [0, 0, ye + Math.PI / 2],
        ),
      );
    }
  }
  {
    let V = [
        [-0.0163, -0.024],
        [0.0163, -0.024],
        [0.018, -0.018],
        [0.018, 0.018],
        [0.0138, 0.024],
        [-0.0138, 0.024],
        [-0.018, 0.018],
        [-0.018, 0.006],
        [-0.031, 0.004],
        [-0.0344, -0.002],
        [-0.0344, -0.014],
        [-0.0292, -0.02],
        [-0.018, -0.02],
      ],
      ne = [
        [-0.0215, -0.014],
        [-0.0215, -0.002],
        [-0.0284, -5e-4],
        [-0.031, -0.004],
        [-0.031, -0.012],
        [-0.0275, -0.016],
      ];
    _.push(
      Nn(tu(V, 0.0015, 1), -0.1095, -0.1045, 8e-4, r, {
        ...v,
        holes: [tu(ne, 0.0012, 1)],
      }),
    );
  }
  (z.push(
    qv(
      0.003,
      8e-4,
      0.015,
      3e-4,
      0.0062,
      0.0182,
      -0.115,
      [0.5, 0.36, 0.03],
      E,
      [0, 0, -0.33],
    ),
  ),
    z.push(
      qv(0.0022, 6e-4, 0.0022, 2e-4, 0, -0.0146, 0.2925, [0.42, 0.05, 0.03], E),
    ));
  let j = 0.0163;
  T.push(
    Q0(
      tu(
        [
          [-0.146, 0.024],
          [-0.3, 0.024],
          [-0.331, 0.014],
          [-0.334, -0.086],
          [-0.318, -0.101],
          [-0.29, -0.096],
          [-0.232, -0.04],
          [-0.146, -0.024],
        ],
        [0.004, 0.02, 0.006, 0.006, 0.006, 0.02, 0.03, 0.006],
        3,
      ),
      -j,
      j,
      0.0042,
      u,
      {
        ...b,
        bs: 3,
        holes: [
          tu(
            [
              [-0.262, -0.036],
              [-0.306, -0.036],
              [-0.306, -0.074],
              [-0.292, -0.074],
            ],
            0.005,
            2,
          ),
          c5(0.004, -0.3185, 0.022, 0.0055, 3).map((V) => [V[1], V[0]]),
        ],
      },
    ),
  );
  for (let V of [-1, 1])
    (T.push(
      Q0(
        tu(
          [
            [-0.156, 0.017],
            [-0.25, 0.017],
            [-0.25, -0.022],
            [-0.228, -0.026],
            [-0.156, -0.016],
          ],
          0.004,
          2,
        ),
        V > 0 ? j - 3e-4 : -j - 6e-4,
        V > 0 ? j + 6e-4 : -j + 3e-4,
        5e-4,
        u,
        { wear: 0.8, zone: 0.55 },
      ),
    ),
      _.push(
        m0(0.0064, 0.002, V * (j + 2e-4), -0.06, -0.318, r, 14, {
          wear: 1.3,
        }),
      ),
      _.push(m0(0.0044, 0.001, V * (j + 0.001), -0.06, -0.318, c, 12, g)));
  T.push(
    Eu(
      [
        kn($a_2(0.012, 0.0215, 0.033, 0.005, 0.001, 3), -0.158, {
          sy: 0.25,
          cy: 0.0215,
        }),
        kn($a_2(0.0132, 0.0215, 0.0352, 0.0058, 0.001, 3), -0.166, {
          sy: 0.7,
          cy: 0.0215,
        }),
        kn($a_2(0.0138, 0.0215, 0.0372, 0.0062, 0.001, 3), -0.184),
        kn($a_2(0.0142, 0.0215, 0.038, 0.0064, 0.001, 3), -0.288),
        kn($a_2(0.0138, 0.0215, 0.0372, 0.0062, 0.001, 3), -0.298, {
          sy: 0.7,
          cy: 0.0215,
        }),
        kn($a_2(0.0128, 0.0215, 0.034, 0.005, 0.001, 3), -0.304, {
          sy: 0.25,
          cy: 0.0215,
        }),
      ],
      u,
      b,
    ),
  );
  for (let V of [-0.196, -0.268])
    _.push(m0(0.0028, 0.029, 0, 0.0295, V, a, 8, y));
  (T.push(qv(0.0105, 0.011, 0.04, 0.003, 0, -0.033, -0.19, u, b, [0.2, 0, 0])),
    _.push(m0(0.0022, 0.02, 0, -0.029, -0.174, a, 8, y)),
    z.push(qv(0.0322, 0.12, 0.011, 0.0042, 0, -0.04, -0.3395, f, E)));
  for (let V = 0; V < 9; V++)
    z.push(qv(0.027, 0.004, 0.003, 0.001, 0, 0.004 - V * 0.011, -0.3455, f, E));
  let O = wn_2.sightY,
    q = wn_2.window;
  (M.push(
    Nn(
      tu(
        [
          [-0.015, 0.0436],
          [0.015, 0.0436],
          [0.015, 0.05],
          [0.0176, 0.053],
          [-0.0176, 0.053],
          [-0.015, 0.05],
        ],
        8e-4,
        1,
      ),
      0.001,
      0.041,
      0.001,
      i,
      p,
    ),
  ),
    M.push(qv(0.0044, 0.0086, 0.034, 0.001, -0.0164, 0.045, 0.021, i, p)));
  for (let V of [0.009, 0.033])
    (_.push(m0(0.004, 0.004, -0.0204, 0.045, V, r, 6, { wear: 1.3 })),
      _.push(m0(0.0019, 0.0012, -0.0228, 0.045, V, a, 8, y)),
      _.push(m0(0.003, 0.002, 0.016, 0.045, V, a, 10, y)));
  let ue = tu(
    [
      [-0.0192, 0.0525],
      [0.0192, 0.0525],
      [0.0192, 0.0788],
      [0.0138, 0.0842],
      [-0.0138, 0.0842],
      [-0.0192, 0.0788],
    ],
    [0.001, 0.001, 0.0022, 0.0022, 0.0022, 0.0022],
    2,
  );
  (M.push(Nn(ue, 0.008, 0.034, 0.0012, i, { ...p, bs: 2, holes: [q] })),
    M.push(qv(0.042, 0.0052, 0.03, 0.0012, 0, 0.0546, 0.021, i, p)),
    z.push(
      Nn(
        q.map((V) => [V[0] * 1.004, (V[1] - O) * 1.004 + O]),
        0.0078,
        0.0342,
        0,
        h,
        {
          wear: 0,
          holes: [q.map((V) => [V[0] * 0.982, (V[1] - O) * 0.982 + O])],
        },
      ),
    ));
  let de = [
    [-0.0204, 0.06],
    [-0.0204, 0.0792],
    [-0.0143, 0.0854],
    [0.0143, 0.0854],
    [0.0204, 0.0792],
    [0.0204, 0.06],
    [0.0193, 0.06],
    [0.0193, 0.0788],
    [0.0138, 0.0843],
    [-0.0138, 0.0843],
    [-0.0193, 0.0788],
    [-0.0193, 0.06],
  ];
  M.push(Nn(de, 0.0285, 0.0385, 3e-4, i, { wear: 1.3 }));
  {
    let V = h0(
      [
        [0, -0.0058],
        [0.005, -0.0058],
        [0.0057, -0.0052],
        [0.0057, -0.003],
        [0.0052, -0.0026],
        [0.0052, -0.0018],
        [0.0057, -0.0014],
        [0.0057, 0.0034],
        [0.005, 0.0042],
        [0, 0.0042],
      ],
      16,
      r,
      { wear: 1.3 },
    );
    (V.rotateY(Math.PI / 2),
      V.translate(0.0222, 0.0625, -0.021),
      _.push(V),
      _.push(qv(6e-4, 0.0012, 0.0074, 2e-4, 0.0281, 0.0625, 0.021, c, g)));
  }
  for (let V of [0.0165, 0.0245])
    z.push(qv(0.0022, 0.0055, 0.0055, 0.001, -0.0197, 0.064, V, f, E));
  for (let V of [0.012, 0.03])
    for (let ne of [-1, 1])
      _.push(m0(0.0016, 0.0012, ne * 0.0212, 0.0546, V, a, 6, y));
  z.push(qv(0.009, 0.0026, 0.006, 6e-4, 0, 0.058, 0.0115, h, E));
  for (let V of [0.0128, -0.0128]) {
    let ne = h0(
      [
        [0, -6e-4],
        [0.0019, -6e-4],
        [0.0022, -2e-4],
        [0.0022, 7e-4],
        [0, 7e-4],
      ],
      10,
      a,
      { ...y, ox: V, oy: 0.0546 },
    );
    (ne.translate(0, 0, -0.006), _.push(ne));
  }
  (_.push(A(0.003, 0.0022, 0.009, 0.0846, 0.014, a, 12, y)),
    z.push(qv(0.0044, 3e-4, 9e-4, 1e-4, 0.009, 0.0858, 0.014, h, E)),
    z.push(
      qv(
        0.016,
        5e-4,
        0.01,
        1e-4,
        -0.003,
        0.08435,
        0.025,
        [0.012, 0.016, 0.03],
        E,
      ),
    ));
  {
    let V = h0(
      [
        [0, -0.0012],
        [0.0034, -0.0012],
        [0.004, -6e-4],
        [0.004, 0.0026],
        [0.0034, 0.0032],
        [0, 0.0032],
      ],
      12,
      r,
      { wear: 1.3 },
    );
    (V.rotateY(-Math.PI / 2),
      V.translate(0.0196, 0.0755, -0.0125),
      _.push(V),
      _.push(qv(5e-4, 0.001, 0.0052, 2e-4, 0.0228, 0.0755, 0.0125, c, g)));
  }
  z.push(
    Nn(q, 0.0304, 0.0318, 0, h, {
      wear: 0,
      holes: [q.map((V) => [V[0] * 0.955, (V[1] - O) * 0.955 + O])],
    }),
  );
  for (let [V, ne] of [
    [-0.03, 1],
    [0.372, -1],
  ]) {
    (_.push(
      Nn(
        tu(
          [
            [-0.0106, 0.0437],
            [0.0106, 0.0437],
            [0.0112, 0.0462],
            [0.009, 0.0508],
            [-0.009, 0.0508],
            [-0.0112, 0.0462],
          ],
          8e-4,
          1,
        ),
        V - 0.015,
        V + 0.015,
        8e-4,
        r,
        v,
      ),
    ),
      _.push(
        Q0(
          tu(
            [
              [V - ne * 0.0165, 0.0506],
              [V + ne * 0.0215, 0.0506],
              [V + ne * 0.0215, 0.053],
              [V + ne * 0.018, 0.0549],
              [V - ne * 0.01, 0.0549],
              [V - ne * 0.0165, 0.0532],
            ],
            8e-4,
            1,
          ),
          -0.006,
          0.006,
          9e-4,
          r,
          { wear: 1.1 },
        ),
      ));
    for (let ye of [-1, 1])
      _.push(
        qv(
          0.0022,
          0.0034,
          0.02,
          8e-4,
          ye * 0.0071,
          0.0524,
          V + ne * 0.009,
          r,
          v,
        ),
      );
    (_.push(
      m0(0.0029, 0.0236, 0, 0.052, V - ne * 0.0125, r, 10, { wear: 1.2 }),
    ),
      _.push(qv(0.004, 0.006, 0.006, 0.001, ne * 0.0128, 0.0472, V, r, v)),
      _.push(m0(0.004, 0.0044, -0.0128, 0.0472, V + 0.006, a, 6, y)),
      _.push(m0(0.0016, 0.0014, 0.0122, 0.0478, V - 0.007, a, 8, y)));
  }
  {
    let V = h0(
      [
        [0.0016, -0.0012],
        [0.0034, -0.0012],
        [0.0038, -8e-4],
        [0.0038, 8e-4],
        [0.0034, 0.0012],
        [0.0016, 0.0012],
        [0.0016, -0.0012],
      ],
      12,
      r,
      v,
    );
    (V.rotateX(Math.PI / 2), V.translate(0, 0.0553, 0.016), _.push(V));
  }
  _.push(m0(0.0048, 0.005, 0.015, 0.049, -0.036, r, 12, { wear: 1.4 }));
  for (let V = 0; V < 6; V++)
    _.push(
      qv(
        0.0044,
        0.001,
        0.001,
        3e-4,
        0.015,
        0.049 + Math.sin(V * 1.047) * 0.0046,
        -0.036 + Math.cos(V * 1.047) * 0.0046,
        r,
        v,
      ),
    );
  (M.push(qv(0.016, 0.005, 0.02, 0.0014, 0, 0.0352, -0.0975, n, p)),
    _.push(A(0.003, 0.0012, 0, 0.038, -0.0985, a, 6, y)));
  let $ = -0.0267,
    se = 0.0267;
  (M.push(
    h0(
      [
        [0, 0.308],
        [0.0095, 0.308],
        [0.0108, 0.3095],
        [0.0108, 0.322],
        [0.0118, 0.323],
        [0.0118, 0.378],
        [0.0128, 0.38],
        [0.0142, 0.382],
        [0.0142, 0.404],
        [0.0136, 0.406],
        [0.0142, 0.408],
        [0.0142, 0.412],
        [0.0128, 0.4135],
        [0.0118, 0.4135],
        [0.0112, 0.409],
      ],
      18,
      s,
      { wear: 1.2, ox: $, oy: se },
    ),
  ),
    z.push(
      h0(
        [
          [0.0112, 0.409],
          [0, 0.409],
        ],
        18,
        [0.1, 0.12, 0.14],
        { wear: 0, ox: $, oy: se },
      ),
    ));
  for (let V = 0; V < 5; V++)
    M.push(
      h0(
        [
          [0.0118, 0.33 + V * 0.008],
          [0.0124, 0.3305 + V * 0.008],
          [0.0124, 0.3335 + V * 0.008],
          [0.0118, 0.334 + V * 0.008],
        ],
        18,
        s,
        { wear: 1.4, ox: $, oy: se },
      ),
    );
  {
    let V = qv(0.02, 0.008, 0.04, 0.0012, 0, 0.028, 0.352, s, p);
    (V.rotateZ(Math.PI / 4), M.push(V));
  }
  {
    let V = m0(0.004, 0.006, 0.0135, 0.028, 0.352, a, 6, y);
    (V.rotateZ(Math.PI / 4), _.push(V));
  }
  z.push(qv(0.0185, 0.0065, 0.07, 0.0025, 0, 0.0468, 0.214, f, E));
  for (let V = 0; V < 6; V++)
    z.push(qv(0.014, 0.0012, 0.004, 5e-4, 0, 0.0503, 0.192 + V * 0.009, f, E));
  z.push(
    O_(
      tubeGeometry(
        [
          [$, se, -0.308],
          [$ - 0.001, se + 0.002, -0.296],
          [-0.0265, 0.0235, -0.284],
          [-0.0255, 0.0215, -0.272],
          [-0.0235, 0.027, -0.262],
          [-0.016, 0.04, -0.256],
          [-0.007, 0.0465, -0.252],
          [-0.002, 0.047, -0.247],
        ],
        0.0018,
        6,
      ),
      f,
      { keepN: !0, wear: 0 },
    ),
  );
  for (let V of [
    [-0.0262, 0.0228, 0.28],
    [-0.0242, 0.0255, 0.265],
  ]) {
    let ne = qv(0.0065, 0.0026, 0.0035, 8e-4, 0, 0, 0, [0.04, 0.04, 0.04], E);
    (ne.rotateZ(Math.PI / 4), ne.translate(V[0], V[1], -V[2]), z.push(ne));
  }
  let fe = [9.5, 9.5, 9.9];
  w.push(
    h0(
      [
        [0, -0.058],
        [0.0108, -0.058],
        [0.0114, -0.057],
        [0.0114, -0.01],
        [0.0106, -0.008],
        [0.0106, -0.002],
        [0.0114, 0],
        [0.0114, 0.046],
        [0.0098, 0.048],
        [0.0098, 0.056],
        [0.0058, 0.056],
        [0.0058, 0.06],
        [0, 0.06],
      ],
      16,
      fe,
      { bare: 1, wear: 0.5, oy: 0.001 },
    ),
  );
  for (let V = 0; V < 6; V++)
    w.push(
      qv(
        0.0014,
        0.008,
        0.0026,
        5e-4,
        0.0112,
        0.001,
        0.008 + V * 0.0062,
        [2.2, 2.2, 2.3],
        { bare: 0.6, wear: 0 },
      ),
    );
  w.push(qv(0.01, 0.0054, 0.014, 0.0015, -0.0142, 0.007, 0.078, r, v));
  {
    let V = h0(
      [
        [0, -0.0078],
        [0.0042, -0.0078],
        [0.0056, -0.0066],
        [0.0056, -0.0046],
        [0.005, -0.004],
        [0.005, -0.0026],
        [0.0056, -0.002],
        [0.0056, 0],
        [0.005, 6e-4],
        [0.005, 0.002],
        [0.0056, 0.0026],
        [0.0056, 0.0062],
        [0.0046, 0.0078],
        [0, 0.0078],
      ],
      14,
      r,
      { wear: 1.5, zone: 1 },
    );
    (V.rotateY(Math.PI / 2), V.translate(-0.0267, 0.007, -0.078), w.push(V));
  }
  let me = (V) => 1.5 * Math.pow(Math.max(0, V - 0.07), 2),
    ge = (V) => 3 * Math.max(0, V - 0.07),
    ce = [1, 1, 1],
    P = [],
    D = 0.212,
    B = 12,
    X = { wear: 0.8, zone: 0.25 };
  for (let V = 0; V <= B; V++) {
    let ne = -0.004 + ((D + 0.004) * V) / B;
    P.push([me(ne) + 0.0298, -ne]);
  }
  for (let V = B; V >= 0; V--) {
    let ne = -0.004 + ((D + 0.004) * V) / B;
    P.push([me(ne) - 0.0298, -ne]);
  }
  S.push(Q0(P, -0.0113, 0.0113, 0.0022, ce, { ...X, bs: 2, crease: 40 }));
  for (let V = 0; V < 8; V++) {
    let ne = 0.082 + V * 0.0155;
    S.push(
      qv(0.0244, 0.0056, 0.05, 0.0018, 0, -ne, me(ne), ce, X, [
        Math.atan(ge(ne)),
        0,
        0,
      ]),
    );
  }
  for (let V = 0; V < 10; V++) {
    let ne = 0.078 + V * 0.013;
    S.push(
      qv(0.012, 0.011, 0.004, 0.0012, 0, -ne, me(ne) + 0.0302, ce, X, [
        Math.atan(ge(ne)),
        0,
        0,
      ]),
    );
  }
  (S.push(
    qv(
      0.027,
      0.009,
      0.068,
      0.003,
      0,
      -D - 0.003,
      me(D) + 0.001,
      ce,
      { wear: 1, zone: 0.6 },
      [Math.atan(ge(D)), 0, 0],
    ),
  ),
    S.push(
      qv(
        0.01,
        0.004,
        0.012,
        0.001,
        0,
        -D - 0.008,
        me(D) - 0.01,
        [0.6, 0.6, 0.6],
        b,
        [Math.atan(ge(D)), 0, 0],
      ),
    ),
    S.push(qv(0.003, 0.006, 0.04, 0.001, -0.0085, 0.0045, 0.004, ce, X)),
    S.push(qv(0.003, 0.006, 0.04, 0.001, 0.0085, 0.0045, 0.004, ce, X)));
  let re = [1.25, 0.72, 0.5];
  (R.push(
    h0(
      [
        [0, -0.02],
        [0.004, -0.02],
        [0.0047, -0.019],
        [0.0047, 0.01],
        [0.0034, 0.014],
        [0.0034, 0.018],
      ],
      12,
      [1, 1, 1],
      { wear: 0, ox: 0.002, oy: 0.0062 },
    ),
  ),
    R.push(
      h0(
        [
          [0.003, 0.018],
          [0.0029, 0.024],
          [0.0022, 0.03],
          [0.001, 0.0345],
          [0, 0.0352],
        ],
        12,
        re,
        { wear: 0, ox: 0.002, oy: 0.0062 },
      ),
    ),
    R.push(
      h0(
        [
          [0, -0.02],
          [0.004, -0.02],
          [0.0047, -0.019],
          [0.0047, 0.01],
        ],
        10,
        [0.8, 0.8, 0.8],
        { wear: 0, ox: -0.003, oy: 5e-4 },
      ),
    ));
  let Y = {
      ano: Fs_2(M),
      gun: Fs_2(_),
      poly: Fs_2(T),
      plain: Fs_2(z),
      bolt: Fs_2(w),
      mag: Fs_2(S),
      round: Fs_2(R),
    },
    he = (V, ne, ye, Te) =>
      Te === "poly" || Te === "plain" || Te === "round" || Te === "mag"
        ? 0
        : Math.max(
            Zl(V, ne, ye, -0.03, 0.03, -0.095, -0.074, 0.03, 0.104, 0.014),
            0.85 *
              Zl(V, ne, ye, 0.012, 0.03, -0.014, 0.016, -0.016, 0.066, 0.012),
            0.85 *
              Zl(V, ne, ye, -0.03, -0.012, 5e-4, 0.0135, -0.028, 0.092, 0.01),
            0.5 * Zl(V, ne, ye, -0.03, 0.03, -0.026, -0.016, -0.1, 0.1, 0.004),
          );
  sy(
    Object.keys(Y).map((V) => ({
      key: V,
      g: Y[V],
      off: V === "mag" || V === "round" ? wn_2.magPos : null,
    })),
    he,
  );
  for (let V in Y) Y[V].computeBoundingSphere();
  return Y;
}

function Zz(n) {
  let e = n.attributes.position.array,
    t = n.attributes.normal.array,
    i = n.attributes.color.array,
    s = n.attributes.aSurf.array,
    o = (r, a, l, c) => {
      for (let u = 0; u < c; u++) {
        let f = r[a * c + u];
        ((r[a * c + u] = r[l * c + u]), (r[l * c + u] = f));
      }
    };
  for (let r = 0; r < e.length / 3; r += 3)
    (o(e, r + 1, r + 2, 3),
      o(t, r + 1, r + 2, 3),
      o(i, r + 1, r + 2, 3),
      o(s, r + 1, r + 2, 4));
}

var Tu = (n) => (n.index ? n.index.count : n.attributes.position.count) / 3;

var RE = Quaternion;

var _1_2 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

var Yo = (n) => ((n = _1_2(n)), n * n * n * (n * (6 * n - 15) + 10));

var pa = (n) => ((n = _1_2(n)), n * n);

var ma = (n) => ((n = _1_2(n)), 1 - (1 - n) * (1 - n));

var dn_2 = (n, e, t) => _1_2((n - e) / (t - e));

var oy = (n, e) => {
  n = _1_2(n);
  let t = n - 1;
  return 1 + (e + 1) * t * t * t + e * t * t;
};

var pn = (n, e = 1) => ({ x: 0, v: 0, w: n, z: e });

function en(n, e, t, i = n.w, s = n.z) {
  let o = n.x - e,
    r = n.v;
  if (s >= 0.999) {
    let a = Math.exp(-i * t),
      l = r + i * o;
    ((n.x = e + (o + l * t) * a), (n.v = (r - i * l * t) * a));
  } else {
    let a = i * Math.sqrt(1 - s * s),
      l = Math.exp(-s * i * t),
      c = Math.cos(a * t),
      u = Math.sin(a * t),
      f = (r + s * i * o) / a;
    ((n.x = e + l * (o * c + f * u)),
      (n.v = l * (a * (f * c - o * u) - s * i * (o * c + f * u))));
  }
  return n.x;
}

var Xn_2 = (n, e = 0) => {
  ((n.x = e), (n.v = 0));
};

var AE = (n) => {
  let e = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return (e - Math.floor(e)) * 2 - 1;
};

function sa(n, e = 0) {
  let t = Math.floor(n),
    i = n - t,
    s = i * i * i * (i * (6 * i - 15) + 10);
  return (
    2 * ((1 - s) * AE(t + e * 57.31) * i + s * AE(t + 1 + e * 57.31) * (i - 1))
  );
}

var ry = (n, e) => e * Math.tanh(n / e);

var i0 = (n, e, t, i = "XYZ") => new RE().setFromEuler(new Euler(n, e, t, i));

function createWeapon(n, e, t, i) {
  let s = 0;
  for (; s < n.length - 2 && e > n[s + 1][0];) s++;
  let o = n[s],
    r = n[s + 1],
    a = Yo((e - o[0]) / Math.max(1e-4, r[0] - o[0]));
  (t.copy(o[1].p).lerp(r[1].p, a), i.copy(o[1].q).slerp(r[1].q, a));
}

var showcaseWeapon = { holster: 0.28, draw: 0.32 };

export {
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
};
