// Ported from the newer Saltline bundle (weapons/rig.js).
import { SKY_COLORS, SUN_LIGHT } from "../core/config.js";
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
} from "../vendor/three-r180.js";
import { b_, im } from "./geometry.js";

var Uf = 1024;

function Nf() {
  let n = document.createElement("canvas");
  ((n.width = b_), (n.height = Uf));
  let e = n.getContext("2d");
  (e.clearRect(0, 0, b_, Uf), (e.textBaseline = "middle"));
  let t = (h, p, d, m, x = "left") => {
      let [v, y, b, g] = im[h];
      ((e.font = d),
        (e.fillStyle = m),
        (e.textAlign = x),
        e.fillText(p, x === "left" ? v + 4 : v + b / 2, y + g / 2 + 2, b - 8));
    },
    i = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif',
    s = '"IBM Plex Mono", "Courier New", monospace',
    o = '"Big Shoulders Display", "Barlow Condensed", Impact, sans-serif',
    r = "rgba(158,160,158,0.92)",
    a = "rgba(206,198,160,0.92)",
    l = "rgba(196,52,36,0.95)";
  (t("model", "PAC-9", `700 104px ${o}`, r),
    t("maker", "LONGSHORE ARMS WORKS  \xB7  SALTLINE", `600 44px ${i}`, r),
    t("cal", "CAL 5.8\xD740   SN PA-004217", `500 38px ${s}`, r),
    t(
      "prop",
      "PROPERTY OF PORT AUTHORITY \u2014 BERTH 4 ARMOURY",
      `600 40px ${i}`,
      r,
    ),
    t("sn", "PA-004217", `500 40px ${s}`, r, "center"),
    t(
      "nm",
      "BARREL NUT 54 N\xB7m  \xB7  DO NOT OIL THREADS",
      `600 34px ${i}`,
      r,
    ),
    t("safe", "S", `700 46px ${i}`, r, "center"),
    t("semi", "1", `700 46px ${i}`, r, "center"),
    t("auto", "A", `700 46px ${i}`, l, "center"),
    t("rack", "B4-07", `800 142px ${o}`, a, "center"));
  for (let h = 0; h < 20; h++)
    t(
      "r" + (2 + h * 2),
      "T" + (2 + h * 2),
      `600 40px ${s}`,
      "rgba(150,152,150,0.88)",
      "center",
    );
  (t("optic", "HX-2 REFLEX", `700 62px ${i}`, r, "center"),
    t("light", "900 LM  IPX8", `600 56px ${i}`, r, "center"),
    t("p_model", "PAC-4", `700 104px ${o}`, r),
    t("p_name", "BOSUN", `600 70px ${i}`, r),
    t("p_cal", "9\xD719  PA-SVC", `500 38px ${s}`, r),
    t("p_sn", "SN PB-011902", `500 38px ${s}`, r),
    t("p_rack", "B4-11", `800 112px ${o}`, a, "center"),
    t("p_maker", "LONGSHORE ARMS WORKS  \xB7  SALTLINE", `600 44px ${i}`, r),
    t(
      "p_prop",
      "PROPERTY OF PORT AUTHORITY \u2014 BERTH 4",
      `600 40px ${i}`,
      r,
    ));
  {
    let [h, p] = im.warn;
    ((e.fillStyle = r),
      (e.textAlign = "left"),
      (e.font = `600 38px ${i}`),
      [
        "WARNING \u2014 CLEAR CHAMBER BEFORE",
        "STOWAGE. AUTHORISED BREACH",
        "PERSONNEL ONLY. PA-REG 44/7",
      ].forEach((d, m) => e.fillText(d, h + 4, p + 32 + m * 52, 630)));
  }
  {
    let [h, p, d, m] = im.dots;
    ((e.fillStyle = r),
      e.beginPath(),
      e.arc(h + 24, p + m / 2, 11, 0, 7),
      e.fill(),
      (e.fillStyle = l),
      e.beginPath(),
      e.arc(h + 68, p + m / 2, 11, 0, 7),
      e.fill());
  }
  let c = 7,
    u = () => ((c = (c * 16807) % 2147483647), c / 2147483647);
  {
    let [h, p, d] = im.qr,
      m = 16,
      x = (d - 12) / m;
    e.fillStyle = r;
    for (let v = 0; v < m; v++)
      for (let y = 0; y < m; y++)
        (y === 0 ||
          v === m - 1 ||
          (v === 0 && y % 2 === 0) ||
          (y === m - 1 && v % 2 === 1) ||
          (y > 0 && v > 0 && y < m - 1 && v < m - 1 && u() > 0.52)) &&
          e.fillRect(h + 6 + y * x, p + 6 + v * x, x + 0.5, x + 0.5);
  }
  {
    let [h, p, d, m] = im.cart,
      x = h + d / 2,
      v = p + m / 2;
    ((e.strokeStyle = r),
      (e.fillStyle = r),
      (e.lineWidth = 6),
      e.beginPath(),
      e.ellipse(x, v, d / 2 - 8, m / 2 - 8, 0, 0, 7),
      e.stroke(),
      (e.lineWidth = 3),
      e.beginPath(),
      e.ellipse(x, v, d / 2 - 20, m / 2 - 20, 0, 0, 7),
      e.stroke(),
      (e.lineWidth = 7),
      e.beginPath(),
      e.moveTo(x, v - 36),
      e.lineTo(x, v + 30),
      e.moveTo(x - 16, v - 20),
      e.lineTo(x + 16, v - 20),
      e.stroke(),
      e.beginPath(),
      e.arc(x, v + 2, 30, 0.25, Math.PI - 0.25),
      e.stroke(),
      e.beginPath(),
      e.arc(x, v - 42, 7, 0, 7),
      e.stroke(),
      (e.font = `700 30px ${i}`),
      (e.textAlign = "center"),
      e.fillText("L", x - 62, v + 2),
      e.fillText("W", x + 62, v + 2));
  }
  {
    let [h, p, , d] = im.proof,
      m = p + d / 2;
    ((e.strokeStyle = r),
      (e.fillStyle = r),
      (e.lineWidth = 4),
      (e.font = `700 30px ${i}`),
      (e.textAlign = "center"),
      e.beginPath(),
      e.arc(h + 34, m, 24, 0, 7),
      e.stroke(),
      e.fillText("P", h + 34, m + 2),
      e.beginPath(),
      e.moveTo(h + 100, m - 26),
      e.lineTo(h + 126, m),
      e.lineTo(h + 100, m + 26),
      e.lineTo(h + 74, m),
      e.closePath(),
      e.stroke(),
      e.fillText("4", h + 100, m + 2),
      e.strokeRect(h + 144, m - 22, 44, 44),
      e.fillText("N", h + 166, m + 2));
  }
  {
    let [h, p, d, m] = im.tag;
    ((e.fillStyle = "rgba(186,184,174,0.97)"),
      e.fillRect(h + 4, p + 4, d - 8, m - 8),
      (e.fillStyle = "rgba(24,24,26,0.96)"),
      (e.textAlign = "left"),
      (e.font = `700 40px ${i}`),
      e.fillText("PORT AUTHORITY  \xB7  BERTH 4", h + 22, p + 38, d - 44),
      (e.font = `500 30px ${s}`),
      e.fillText("ASSET 0407-A   INSP 11/26", h + 22, p + 172, d - 44));
    let x = h + 22;
    for (; x < h + d - 30;) {
      let v = 2 + Math.floor(u() * 4) * 2;
      (e.fillRect(x, p + 66, v, 78), (x += v + 2 + Math.floor(u() * 3) * 2));
    }
  }
  {
    let [h, p, d, m] = im.arrow;
    ((e.fillStyle = r),
      e.beginPath(),
      e.moveTo(h + 8, p + m / 2 - 7),
      e.lineTo(h + d - 40, p + m / 2 - 7),
      e.lineTo(h + d - 40, p + 8),
      e.lineTo(h + d - 8, p + m / 2),
      e.lineTo(h + d - 40, p + m - 8),
      e.lineTo(h + d - 40, p + m / 2 + 7),
      e.lineTo(h + 8, p + m / 2 + 7),
      e.fill());
  }
  {
    let [h, p, d, m] = im.index;
    ((e.fillStyle = "rgba(214,214,208,0.95)"),
      e.fillRect(h + d / 2 - 5, p + 6, 10, m - 12));
  }
  e.globalCompositeOperation = "destination-out";
  for (let h = 0; h < 5200; h++) {
    e.fillStyle = `rgba(0,0,0,${0.2 + u() * 0.55})`;
    let p = u() < 0.92 ? 1 + u() * 2 : 3 + u() * 7;
    e.fillRect(u() * b_, u() * Uf, p, p * (0.4 + u()));
  }
  {
    let [h, p, d, m] = im.rack;
    for (let x = 0; x < 260; x++) {
      e.fillStyle = `rgba(0,0,0,${0.3 + u() * 0.6})`;
      let v = 2 + u() * 9;
      e.fillRect(h + u() * d, p + u() * m, v * (0.5 + u() * 2), v * 0.6);
    }
  }
  let f = new CanvasTexture(n);
  return (
    (f.colorSpace = SRGBColorSpace),
    (f.anisotropy = 8),
    (f.generateMipmaps = !0),
    (f.minFilter = LinearMipmapLinearFilter),
    f
  );
}

var TC = [
  [2, 1],
  [4, 3],
  [6, 15],
  [8, 17],
  [10, 19],
  [12, 21],
  [14, 23],
  [26, 35],
  [28, 37],
  [30, 39],
  [32, 41],
].map(([n, e]) => ["r" + n, 0, 0.04362, -0.09211 + e * 0.01001, 0.003, "T"]);

var F_ = {
  rifle: [
    ["model", -0.01522, -0.035, 0.066, 0.0092, "L"],
    ["maker", -0.01522, -0.0452, 0.0672, 0.003, "L"],
    ["cal", -0.01522, -0.05, 0.0672, 0.0027, "L"],
    ["prop", -0.01522, -0.0712, 0.0675, 0.0024, "L"],
    ["cart", -0.01522, -0.061, 0.054, 0.008, "L"],
    ["proof", -0.01522, -0.0612, 0.08, 0.0034, "L"],
    ["auto", -0.01642, -0.0262, -0.0335, 0.0038, "L"],
    ["semi", -0.01642, -0.0252, -0.049, 0.0038, "L"],
    ["safe", -0.01642, -0.0362, -0.0605, 0.0038, "L"],
    ["warn", -0.01652, -0.0082, 0.033, 0.0058, "L"],
    ["qr", -0.01652, -0.007, -0.044, 0.0078, "L"],
    ["sn", -0.01652, -0.0098, -0.079, 0.0026, "L"],
    ["cal", -0.01812, 0.0244, 0, 0.0022, "L"],
    ["rack", -0.01702, -0.003, -0.203, 0.019, "L"],
    ["optic", -0.01935, 0.0735, 0.021, 0.0024, "L"],
    ["model", 0.01522, -0.035, 0.069, 0.0092, "R"],
    ["maker", 0.01522, -0.0452, 0.0672, 0.003, "R"],
    ["prop", 0.01522, -0.0712, 0.0675, 0.0024, "R"],
    ["tag", 0.01522, -0.06, 0.067, 0.0094, "R"],
    ["auto", 0.01642, -0.0262, -0.0335, 0.0038, "R"],
    ["semi", 0.01642, -0.0252, -0.049, 0.0038, "R"],
    ["safe", 0.01642, -0.0362, -0.0605, 0.0038, "R"],
    ["sn", 0.01652, -0.0098, -0.067, 0.003, "R"],
    ["proof", 0.01652, 0.001, 0.0808, 0.0036, "R"],
    ["nm", 0.01812, 0.0244, 0.05, 0.002, "R"],
    ["rack", 0.01702, -0.003, -0.203, 0.019, "R"],
    ["optic", 0.01935, 0.0725, 0.025, 0.0022, "R"],
    ...TC,
  ],
  pistolSlide: [
    ["p_model", -0.01292, -6e-4, 0.047, 0.0066, "L"],
    ["p_name", -0.01292, -6e-4, 0.0225, 0.004, "L"],
    ["p_maker", -0.01292, -0.0038, -0.024, 0.0017, "L"],
    ["cart", -0.01292, 6e-4, -0.03, 0.0048, "L"],
    ["p_cal", 0.01292, -6e-4, 0.047, 0.0036, "R"],
    ["proof", 0.01292, -0.001, -0.035, 0.0026, "R"],
  ],
  pistolFrame: [
    ["p_prop", -0.01282, -0.0196, 0.061, 0.002, "L"],
    ["qr", -0.01282, -0.025, 0.086, 0.0048, "L"],
    ["p_sn", 0.01282, -0.0196, 0.064, 0.0024, "R"],
    ["p_rack", 0.01282, -0.025, 0.08, 0.0036, "R"],
  ],
};

var U_ = `vec3 dBump(vec3 N, float h){ vec3 dpdx = dFdx(-vViewPosition), dpdy = dFdy(-vViewPosition); float dhx = dFdx(h), dhy = dFdy(h);
  vec3 r1 = cross(dpdy, N), r2 = cross(N, dpdx); float det = dot(dpdx, r1); vec3 g = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * N - g); }
`;

var ny = null;

function Uz() {
  if (ny) return ny;
  let n = new MeshStandardMaterial({
    map: Nf(),
    transparent: !0,
    roughness: 0.78,
    metalness: 0,
    depthWrite: !1,
    polygonOffset: !0,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: DoubleSide,
  });
  return (
    (n.name = "weapon_markings"),
    (n.onBeforeCompile = (e) => {
      e.fragmentShader = e.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
` + U_,
        )
        .replace(
          "#include <normal_fragment_maps>",
          `#include <normal_fragment_maps>
normal = dBump(normal, -diffuseColor.a * 0.00005);`,
        );
    }),
    (n.customProgramCacheKey = () => "pac-markings-2"),
    (ny = n)
  );
}

function M1_2(n) {
  let e = n && n[0] && n[0][0];
  e === "model"
    ? (n = F_.rifle)
    : e === "p_model"
      ? (n = F_.pistolSlide)
      : e === "p_prop" && (n = F_.pistolFrame);
  let t = [],
    i = [],
    s = [],
    o = [];
  for (let [l, c, u, f, h, p, d = 0] of n) {
    let [m, x, v, y] = im[l],
      b = (h * v) / y,
      g = m / b_,
      E = (m + v) / b_,
      M = 1 - x / Uf,
      _ = 1 - (x + y) / Uf,
      T = t.length / 3,
      w;
    if (
      (p === "L"
        ? (w = [
            [c, u - h / 2, -(f + b / 2)],
            [c, u - h / 2, -(f - b / 2)],
            [c, u + h / 2, -(f - b / 2)],
            [c, u + h / 2, -(f + b / 2)],
          ])
        : p === "R"
          ? (w = [
              [c, u - h / 2, -(f - b / 2)],
              [c, u - h / 2, -(f + b / 2)],
              [c, u + h / 2, -(f + b / 2)],
              [c, u + h / 2, -(f - b / 2)],
            ])
          : (w = [
              [c - b / 2, u, -(f - h / 2)],
              [c + b / 2, u, -(f - h / 2)],
              [c + b / 2, u, -(f + h / 2)],
              [c - b / 2, u, -(f + h / 2)],
            ]),
      d)
    ) {
      let R = Math.cos(d),
        z = Math.sin(d),
        I = u,
        L = -f;
      for (let U of w) {
        let k = U[1] - I,
          C = U[2] - L;
        ((U[1] = I + k * R - C * z), (U[2] = L + k * z + C * R));
      }
    }
    for (let R of w) t.push(R[0], R[1], R[2]);
    i.push(g, _, E, _, E, M, g, M);
    let S = p === "L" ? [-1, 0, 0] : p === "R" ? [1, 0, 0] : [0, 1, 0];
    for (let R = 0; R < 4; R++) s.push(S[0], S[1], S[2]);
    o.push(T, T + 1, T + 2, T, T + 2, T + 3);
  }
  let r = new BufferGeometry();
  (r.setAttribute("position", new Float32BufferAttribute(t, 3)),
    r.setAttribute("uv", new Float32BufferAttribute(i, 2)),
    r.setAttribute("normal", new Float32BufferAttribute(s, 3)),
    r.setIndex(o));
  let a = new Mesh(r, Uz());
  return ((a.renderOrder = 2), a);
}

function ME(n, e) {
  let t = new Shape();
  (n.forEach((a, l) => (l ? t.lineTo(a[0], a[1]) : t.moveTo(a[0], a[1]))),
    t.closePath());
  let i = new ShapeGeometry(t);
  i.translate(0, 0, -e);
  {
    let a = 1e9,
      l = -1e9,
      c = 1e9,
      u = -1e9;
    for (let p of n)
      ((a = Math.min(a, p[0])),
        (l = Math.max(l, p[0])),
        (c = Math.min(c, p[1])),
        (u = Math.max(u, p[1])));
    let f = i.attributes.position,
      h = i.attributes.uv;
    for (let p = 0; p < f.count; p++)
      h.setXY(p, (f.getX(p) - a) / (l - a), (f.getY(p) - c) / (u - c));
  }
  let s = new ShaderMaterial({
      transparent: !0,
      premultipliedAlpha: !0,
      depthWrite: !1,
      side: DoubleSide,
      uniforms: {
        uBright: { value: 7 },
        uSun: { value: SUN_LIGHT.dir.clone() },
        uSunCol: { value: SUN_LIGHT.color.clone() },
        uZen: { value: SKY_COLORS.zenith.clone() },
        uHor: { value: SKY_COLORS.horizonAway.clone() },
        uTilt: { value: 0.1 },
        uEnv: { value: 1 },
      },
      vertexShader: `
      varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
      uniform float uTilt;
      void main(){
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz;
        vFwd = (modelViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz; vRight = (modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz; vUp = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        vWPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vWN = normalize(mat3(modelMatrix) * normalize(vec3(0.0, -uTilt, 1.0)));   // real sights tilt the glass a few degrees
        gl_Position = projectionMatrix * mv;
      }`,
      fragmentShader: `
      varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
      uniform float uBright, uEnv; uniform vec3 uSun, uSunCol, uZen, uHor;
      void main(){
        vec3 d = normalize(vView), fw = normalize(vFwd);
        float k = max(dot(d, fw), 1e-3);
        vec2 a = vec2(dot(d, normalize(vRight)), dot(d, normalize(vUp))) / k;      // tangent of the angle off the bore axis
        float r = length(a), px = max(fwidth(r), 1e-5);
        float dotR = max(0.0011, px * 0.9), ringW = max(0.00045, px * 0.6);
        float dotI = 1.0 - smoothstep(dotR - px, dotR + px, r);
        float ring = 1.0 - smoothstep(ringW - px * 0.5, ringW + px, abs(r - 0.0128));
        float ang = atan(a.y, a.x);
        float tick = (1.0 - smoothstep(0.0, px * 1.2 + 0.0004, min(abs(a.x), abs(a.y)))) * step(0.0128, r) * (1.0 - smoothstep(0.0165, 0.0175, r));
        float ret = clamp(dotI + ring * 0.8 + tick * 0.8, 0.0, 1.0);
        // faint halo so the bloom has something to hold on to
        ret += 0.05 * exp(-r * r / 0.00002);
        vec3 retCol = vec3(1.0, 0.11, 0.045) * ret * uBright;
        // coated glass: sky/sun reflection through a ruby-teal dichroic coating, stronger at grazing angles
        vec3 wv = normalize(vWPos - cameraPosition); vec3 n = normalize(vWN); if (dot(n, wv) > 0.0) n = -n;
        vec3 rf = reflect(wv, n);
        float fres = pow(1.0 - abs(dot(wv, n)), 3.0);
        vec3 sky = mix(uHor, uZen, clamp(rf.y * 1.4 + 0.2, 0.0, 1.0));
        float sd = max(dot(rf, uSun), 0.0);
        sky += uSunCol * (pow(sd, 6.0) * 0.6 + pow(sd, 90.0) * 6.0);
        sky = mix(vec3(0.050, 0.047, 0.043), sky, uEnv); sd *= uEnv;               // under a roof the glass mirrors the room, not the sky
        // multi-layer dichroic coating: the reflected tint walks teal -> violet -> amber as the glass turns away from the
        // eye (thin-film path length grows with the angle), a soft diagonal sheen band, and a thin dark edge
        float band = smoothstep(0.25, 0.5, vUv.x * 0.6 + vUv.y) * (1.0 - smoothstep(0.62, 0.95, vUv.x * 0.6 + vUv.y));
        float ndv = abs(dot(wv, n)), ph = (1.0 - ndv) * 2.6 + vUv.y * 0.35 + vUv.x * 0.12;
        vec3 film = 0.5 + 0.5 * cos(6.2832 * (ph + vec3(0.62, 0.30, 0.12)));
        vec3 coat = mix(mix(vec3(0.30, 0.52, 0.95), vec3(1.0, 0.62, 0.28), clamp(fres * 2.2 + vUv.y * 0.75 - 0.15, 0.0, 1.0)), film * vec3(0.85, 1.0, 0.95), 0.28);
        vec2 e = abs(vUv - 0.5) * 2.0; float edge = smoothstep(0.90, 1.0, max(e.x, e.y));
        float refl = 0.12 + 0.60 * fres + 0.07 * band;
        // dust and a thumb smear on the outer surface: only where light rakes it
        vec2 dc = vUv * vec2(150.0, 100.0), di = floor(dc); float dh = fract(sin(dot(di, vec2(127.1, 311.7))) * 43758.5453);
        float speck = step(0.988, dh) * (1.0 - smoothstep(0.10, 0.36, length(fract(dc) - 0.5 - (fract(dh * 57.3) - 0.5) * 0.5)));
        vec2 sq = (vUv - vec2(0.70, 0.30)) * vec2(1.0, 1.7); float smudge = exp(-dot(sq, sq) * 9.0) * (0.6 + 0.4 * sin(vUv.x * 90.0 + vUv.y * 60.0));
        float lit = 0.06 + 1.6 * pow(sd, 3.0) + fres;
        // faint emitter glow that stays visible off-axis (what you see of a powered sight from the hip)
        vec2 eg = (vUv - vec2(0.5, 0.16)) * vec2(1.0, 1.6); retCol += vec3(1.0, 0.10, 0.04) * 0.20 * exp(-dot(eg, eg) * 60.0) * (1.0 - smoothstep(0.985, 0.9995, k));
        vec3 col = (sky * 1.5 + vec3(0.03, 0.035, 0.045)) * coat * refl * (1.0 - edge) + retCol;
        col += (uHor * 0.5 + uSunCol * 0.25) * lit * (speck * 0.45 + smudge * 0.03);
        float alpha = clamp(0.20 + 0.32 * fres + 0.05 * band + 0.6 * edge + speck * 0.2 * lit + smudge * 0.02, 0.0, 0.94);
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    }),
    o = new Mesh(i, s);
  o.renderOrder = 5;
  let r = 0;
  return (
    (o.onBeforeRender = (a, l) => {
      let c = l.environmentIntensity || 1;
      c > r && (r = c);
      let u = Math.min(1, Math.max(0, (c / r - 0.55) / 0.4));
      s.uniforms.uEnv.value += (u - s.uniforms.uEnv.value) * 0.12;
    }),
    o
  );
}

function N_() {
  let i = [],
    e = [],
    t = [],
    n = [],
    s = (d, v, g, x, y) => {
      let b = i.length / 3;
      for (let m of [d, v, g, x]) i.push(m[0], m[1], m[2]);
      e.push(0, 0, 1, 0, 1, 1, 0, 1);
      for (let m = 0; m < 4; m++) t.push(y);
      n.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
  (s(
    [-0.13, -0.13, -0.03],
    [0.13, -0.13, -0.03],
    [0.13, 0.13, -0.03],
    [-0.13, 0.13, -0.03],
    0,
  ),
    s(
      [-0.13 * 0.7, -0.13 * 0.7, -0.09],
      [0.13 * 0.7, -0.13 * 0.7, -0.09],
      [0.13 * 0.7, 0.13 * 0.7, -0.09],
      [-0.13 * 0.7, 0.13 * 0.7, -0.09],
      0,
    ));
  let r = 0.065,
    a = 0.34;
  (s([-r, 0, 0.01], [r, 0, 0.01], [r, 0, -a], [-r, 0, -a], 1),
    s([0, -r, 0.01], [0, r, 0.01], [0, r, -a], [0, -r, -a], 1));
  let l = 0.17,
    c = 0.05,
    u = 0.035;
  (s([-l, -c, u], [l, -c, u], [l, c, u], [-l, c, u], 2),
    s([-l, 0, u + c], [l, 0, u + c], [l, 0, u - c], [-l, 0, u - c], 2),
    s(
      [-0.05, -0.05, -0.01],
      [0.05, -0.05, -0.01],
      [0.05, 0.05, -0.01],
      [-0.05, 0.05, -0.01],
      3,
    ),
    s(
      [-0.03, -0.03, 0.02],
      [0.03, -0.03, 0.02],
      [0.03, 0.03, 0.02],
      [-0.03, 0.03, 0.02],
      4,
    ));
  let h = new BufferGeometry();
  (h.setAttribute("position", new Float32BufferAttribute(i, 3)),
    h.setAttribute("uv", new Float32BufferAttribute(e, 2)),
    h.setAttribute("aType", new Float32BufferAttribute(t, 1)),
    h.setIndex(n));
  let f = new ShaderMaterial({
      transparent: !0,
      depthWrite: !1,
      blending: AdditiveBlending,
      side: DoubleSide,
      uniforms: {
        uSeed: {
          value: 0,
        },
        uInt: {
          value: 0,
        },
        uHeat: {
          value: 0,
        },
        uJet: {
          value: 1,
        },
      },
      vertexShader: `attribute float aType; varying vec2 vUv; varying float vType;
      void main(){ vUv = uv; vType = aType; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; varying float vType; uniform float uSeed, uInt, uHeat, uJet;
      float h1(float n){ return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453); }
      void main(){
        vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x); float I = 0.0; vec3 tintc = vec3(1.0, 0.50, 0.16);
        if (vType < 0.5) {
          float n1 = 3.0 + floor(h1(1.0) * 3.0), n2 = 5.0 + floor(h1(2.0) * 4.0);
          float pet = pow(abs(cos(a * n1 * 0.5 + h1(3.0) * 6.283)), 5.0) * (0.55 + 0.45 * h1(4.0));
          pet += pow(abs(cos(a * n2 * 0.5 + h1(5.0) * 6.283)), 14.0) * 0.55;
          float reach = 0.35 + 0.65 * pet;
          I = (0.25 + pet) * smoothstep(reach, reach * 0.15, r) * (0.75 + 0.25 * sin(r * 26.0 + h1(6.0) * 20.0));
        } else if (vType < 1.5) {
          float y = vUv.y, x = p.x * (1.0 + 0.5 * sin(y * 17.0 + h1(7.0) * 30.0) * y);
          float wdt = mix(0.20, 0.75, smoothstep(0.0, 0.35, y)) * (1.0 - y * 0.75);
          I = exp(-x * x / (wdt * wdt * 0.35)) * pow(1.0 - y, 1.4) * (0.7 + 0.3 * sin(y * 31.0 + h1(8.0) * 9.0)) * 0.9;
        } else if (vType < 2.5) {
          float u = abs(p.x), len = 0.55 + 0.45 * h1(9.0 + step(0.0, p.x));
          float wv = p.y * (1.0 + u * 3.0) + 0.12 * sin(u * 14.0 + h1(10.0) * 20.0) * u;
          I = exp(-wv * wv * 22.0) * smoothstep(len, 0.06, u) * smoothstep(0.02, 0.10, u) * 0.85 * uJet;
        } else if (vType < 3.5) {
          I = exp(-r * r * 5.0) * 2.4 * smoothstep(1.0, 0.6, r); tintc = vec3(1.0, 0.82, 0.58);
        } else {
          gl_FragColor = vec4(vec3(1.0, 0.28, 0.06) * exp(-r * r * 4.0) * smoothstep(1.0, 0.5, r) * uHeat, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          return;
        }
        vec3 col = mix(tintc, vec3(1.0, 0.90, 0.70), clamp(I * I * 0.7, 0.0, 1.0)) * I * uInt;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    }),
    p = new Mesh(h, f);
  return ((p.renderOrder = 10), (p.frustumCulled = !1), p);
}

var Wv = {
  value: 1,
};

var AC = {
  pac9_anodised: {
    kind: 0,
    color: [0.038, 0.039, 0.043],
    roughness: 0.54,
    metalness: 0.1,
  },
  pac9_phosphate: {
    kind: 1,
    color: [0.042, 0.042, 0.043],
    roughness: 0.66,
    metalness: 0.2,
  },
  pac9_polymer: {
    kind: 2,
    color: [0.034, 0.035, 0.038],
    roughness: 0.6,
    metalness: 0,
  },
  pac9_polymer_tan: {
    kind: 2,
    color: [0.15, 0.112, 0.068],
    roughness: 0.6,
    metalness: 0,
  },
  pac4_nitride: {
    kind: 3,
    color: [0.034, 0.035, 0.039],
    roughness: 0.47,
    metalness: 0.35,
  },
  pac9_matte: { kind: 4, color: [1, 1, 1], roughness: 0.86, metalness: 0 },
};

var RC =
  `
varying vec3 vObjP; varying vec3 vWNrm; varying vec3 vONrm; varying vec4 vSurf; uniform float uRain;
float dh3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float dn3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dh3(i), dh3(i + vec3(1,0,0)), f.x), mix(dh3(i + vec3(0,1,0)), dh3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dh3(i + vec3(0,0,1)), dh3(i + vec3(1,0,1)), f.x), mix(dh3(i + vec3(0,1,1)), dh3(i + vec3(1,1,1)), f.x), f.y), f.z); }
vec2 dh2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
vec2 dDrops(vec2 uv, float cell, float seed, float thr){ vec2 g = uv / cell, i = floor(g), f = fract(g); float best = 0.0;
  for (int a = -1; a <= 1; a++) for (int b = -1; b <= 1; b++) { vec2 o = vec2(float(a), float(b)); vec2 r = dh2(i + o + seed);
    float keep = step(thr, fract(r.x * 7.31 + r.y * 3.17)); vec2 c = o + 0.2 + 0.6 * r; float rad = (0.14 + 0.20 * fract(r.x * 13.7)) * keep;
    float d = length(f - c); best = max(best, sqrt(max(rad * rad - d * d, 0.0))); }
  return vec2(best * cell, step(1e-6, best)); }
` + U_;

var CC = `
vec3 dP = vObjP; vec3 dAn = abs(vONrm);
vec2 dUV = (dAn.y > dAn.x && dAn.y > dAn.z) ? dP.xz : (dAn.x > dAn.z ? dP.zy : dP.xy);
float dEdge = vSurf.x, dCav = vSurf.y, dBare = vSurf.z, dZone = vSurf.w;
float dPx = length(fwidth(dP));                                         // metres of surface per pixel
float dNear = 1.0 - smoothstep(0.00020, 0.00075, dPx);                  // micro detail fades out before it can alias
vec3 dQ = mat3(0.36, 0.48, -0.80, -0.80, 0.60, 0.0, 0.48, 0.64, 0.60) * dP;       // turned domain: the noise lattice never lines up with the gun
float dLo = dn3(dQ * 34.0), dMid = dn3(dQ * 180.0 + 7.0);
float dGr = (dh3(floor(dP * 2900.0)) - 0.5) * dNear;                    // finest grain: one hash
float dScr = dn3(dP * vec3(640.0, 640.0, 21.0) + 3.0);                  // long fine scratches along the bore
float dHt = 0.0, dR = 0.0; vec3 dAlb = diffuseColor.rgb;
float dBreak = dMid * 0.65 + dLo * 0.35;
float dPolish = smoothstep(0.15, 0.85, dEdge) * (0.35 + 0.65 * dLo);     // exposed edges are a little burnished, unevenly
float dWorn = smoothstep(0.60, 0.72, dBreak) * smoothstep(0.55, 0.95, dEdge);   // and worn through in a few patches (high-wear parts only)
float dScratch = smoothstep(0.80, 0.94, dScr) * (0.10 + 0.90 * dZone) * smoothstep(0.30, 0.62, dMid * 0.5 + dLo * 0.5) * (1.0 - smoothstep(0.0007, 0.0020, dPx));
#if D_KIND == 0
  float smear = smoothstep(0.52, 0.82, dn3(dQ * vec3(52.0, 30.0, 15.0) + 11.0));      // palm and finger oil on the flats
  dR = (dLo - 0.5) * 0.14 + (dMid - 0.5) * 0.08 + dGr * 0.10 - smear * 0.12;
  dHt = dGr * 0.000012;
  dAlb *= (0.90 + 0.20 * dLo) * (1.0 - 0.10 * smear);
  dAlb = mix(dAlb, dAlb * 1.7 + 0.005, dPolish * 0.55); dR -= dPolish * 0.06;
  dAlb = mix(dAlb, vec3(0.30, 0.31, 0.33), dScratch * 0.55); dR -= dScratch * 0.10; dHt -= dScratch * 0.000012;
  metalnessFactor = mix(metalnessFactor, 1.0, max(dWorn, dScratch * 0.5));
  dAlb = mix(dAlb, vec3(0.50, 0.51, 0.53), dWorn); dR = mix(dR, -0.10 + 0.12 * dMid, dWorn);
#elif D_KIND == 3
  float lay = dn3(vec3(dP.xy * 2600.0, dP.z * 36.0));                                  // surface-ground lay along the bore
  float smear = smoothstep(0.50, 0.80, dn3(dQ * vec3(60.0, 34.0, 20.0) + 11.0));
  dR = (dLo - 0.5) * 0.10 + (lay - 0.5) * 0.14 * dNear + dGr * 0.04 - smear * 0.11;
  dHt = lay * 0.000007 * dNear;
  dAlb *= (0.92 + 0.16 * dLo) * (1.0 - 0.12 * smear);
  dAlb = mix(dAlb, dAlb * 1.9 + 0.006, dPolish * 0.6); dR -= dPolish * 0.06;
  dAlb = mix(dAlb, vec3(0.16, 0.16, 0.17), dScratch * 0.35); dR -= dScratch * 0.06;
  float through = dWorn * 0.8;                                                         // holster wear: grey steel, not silver
  metalnessFactor = mix(metalnessFactor, 1.0, through); dAlb = mix(dAlb, vec3(0.36, 0.36, 0.37), through); dR = mix(dR, -0.06, through);
#elif D_KIND == 1
  float oil = smoothstep(0.30, 0.72, dn3(dQ * vec3(46.0, 46.0, 30.0) + 5.0));
  float lay = dn3(vec3(dP.xy * 1400.0, dP.z * 60.0));
  // phosphate: crystalline, porous, drinks oil
  float cR = (dLo - 0.5) * 0.14 + dGr * 0.14 - oil * 0.20, cH = dGr * 0.000022 + dMid * 0.000004;
  vec3 cA = dAlb * mix(1.22, 0.72, oil) * (0.94 + 0.12 * dMid);
  cA = mix(cA, cA * 1.8 + 0.006, dPolish * 0.6); cR -= dPolish * 0.10;
  float cM = metalnessFactor; float through = max(dWorn, dScratch * 0.6);
  cM = mix(cM, 1.0, through); cA = mix(cA, vec3(0.40, 0.40, 0.41), through); cR = mix(cR, -0.26 + 0.10 * dMid, through);
  // bare: turned or ground steel, faint lay, a little staining
  float bR = -0.30 + (lay - 0.5) * 0.20 + (dLo - 0.5) * 0.14, bH = lay * 0.000008 * dNear;
  vec3 bA = min(dAlb, vec3(0.78)) * (0.86 + 0.20 * dMid); bA = mix(bA, bA * vec3(0.72, 0.62, 0.50), smoothstep(0.62, 0.9, dLo) * 0.35);
  dAlb = mix(cA, bA, dBare); dR = mix(cR, bR, dBare); dHt = mix(cH, bH, dBare); metalnessFactor = mix(cM, 1.0, dBare);
#elif D_KIND == 4
  // rubber and matte liners (the 'plain' group, absolute vertex albedo): fine moulded grain, chalky bloom, shiny where rubbed
  float bloom = smoothstep(0.45, 0.80, dMid * 0.6 + dLo * 0.4);
  dR = (dLo - 0.5) * 0.10 + dGr * 0.08 - dPolish * 0.22; dHt = dGr * 0.000018;
  dAlb = mix(dAlb, dAlb * 1.5 + 0.012, bloom * 0.35) * (1.0 + 0.35 * dPolish);
#else
  float st = dn3(dP * 1500.0) * 0.6 + dh3(floor(dP * 3300.0)) * 0.4;                    // mould texture (VDI-ish spark finish)
  dR = (dLo - 0.5) * 0.14 + (st - 0.5) * 0.12 * dNear - smoothstep(0.55, 0.90, dMid) * 0.035;
  dHt = st * 0.000045 * dNear;
  dAlb *= 0.92 + 0.16 * dLo;
  // studded grip zones: 1.15 mm pyramids on a diagonal grid; past the range where they resolve they fold into roughness
  float zk = smoothstep(0.35, 0.60, dZone); vec2 q = vec2(dUV.x + dUV.y, dUV.x - dUV.y) / 0.00115, qc = abs(fract(q) - 0.5);
  float stud = 1.0 - smoothstep(0.10, 0.46, max(qc.x, qc.y)), studK = 1.0 - smoothstep(0.00024, 0.00056, dPx);   // gone before a stud is under two pixels: no moire
  dHt += zk * stud * 0.00028 * studK; dR += zk * (0.10 - stud * 0.16 * studK);
  dAlb *= 1.0 - zk * 0.14 * (1.0 - stud * studK);
  // moulding parting line on the centre plane, flash trimmed
  float pl = (1.0 - smoothstep(0.00012, 0.00034, abs(dP.x))) * step(dAn.x, 0.55) * dNear; dHt += pl * 0.00005; dR -= pl * 0.10;
  // handling shine on edges, a few pale scuffs (polymer whitens where it is scraped)
  float scuff = smoothstep(0.86, 0.96, dScr) * smoothstep(0.45, 0.70, dLo) * (1.0 - smoothstep(0.0007, 0.0020, dPx));
  dAlb = mix(dAlb, dAlb * 1.5 + 0.006, dPolish * 0.5); dR -= dPolish * 0.12;
  dAlb = mix(dAlb, dAlb * 2.0 + 0.015, scuff * 0.35 + dWorn * 0.25); dR += scuff * 0.06;
#endif
// recesses: darker, rougher, a little pale dust settled in them
float dGrime = dCav * (0.55 + 0.45 * dMid);
dAlb *= 1.0 - 0.50 * dGrime;
dAlb = mix(dAlb, vec3(0.115, 0.100, 0.082), dCav * smoothstep(0.50, 0.85, dLo * 0.5 + dMid * 0.5) * 0.30);
dR += dGrime * 0.22; metalnessFactor *= 1.0 - 0.5 * dGrime;
// rain
float dUpN = vWNrm.y, dUp = smoothstep(0.30, 0.75, dUpN) * uRain, dSide = (1.0 - smoothstep(0.10, 0.60, abs(dUpN))) * uRain;
float dDrop = 0.0, dDropH = 0.0, dRun = 0.0;
if (dUp > 0.002) { vec2 dD1 = dDrops(dUV, 0.0050, 3.0, 0.80), dD2 = dDrops(dUV + 0.31, 0.0024, 9.0, 0.90); dDrop = max(dD1.y, dD2.y) * dUp; dDropH = max(dD1.x, dD2.x) * dUp; }
if (dSide > 0.002) dRun = smoothstep(0.80, 0.90, dn3(vec3(dP.x * 420.0 + dP.z * 610.0, dP.y * 9.0, dP.z * 37.0))) * smoothstep(0.42, 0.62, dLo) * dSide * (1.0 - smoothstep(0.0008, 0.0024, dPx));   // run-off: thin, sparse, broken trickles
float dWet = max(dUp * (0.5 + 0.5 * smoothstep(0.3, 0.7, dLo)), dRun * 0.55);
diffuseColor.rgb = dAlb * (1.0 - 0.20 * dWet);
roughnessFactor = clamp(roughnessFactor + dR, 0.12, 1.0);
roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.52, dWet);
roughnessFactor = mix(roughnessFactor, 0.20, dDrop * 0.8);
float dOcc = 1.0 - 0.80 * dCav;
`;

var Bf = `
normal = dBump(normal, dHt + dDropH * 0.17);
`;

export { AC, Bf, CC, F_, M1_2, ME, N_, RC, U_, Wv };
