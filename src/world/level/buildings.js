// Ported from the newer Saltline bundle (world/level/buildings.js).
import {
  beveledBoxGeometry,
  boxGeometry,
  colorGeometry,
  createMesh,
  cylinderGeometry,
  tubeGeometry,
} from "../../core/geometry.js";
import {
  Box3,
  BoxGeometry,
  BufferAttribute,
  CanvasTexture,
  ExtrudeGeometry,
  Group,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  Path,
  PlaneGeometry,
  PointLight,
  Shape,
  SphereGeometry,
  THREE,
  TorusGeometry,
  Vector3,
} from "../../vendor/three-r180.js";

var cR = new Set(["traffic_cone", "jerry_can"]);

function ob(n) {
  let e = new Group();
  e.name = "level-static";
  let t = new Group();
  t.name = "level-dynamic";
  let i = [],
    s = [],
    o = [],
    r = [],
    a = n.rng && n.rng.fork ? n.rng.fork() : Math.random,
    l = (C, A) => C + (A - C) * a(),
    c = (C, A) => n.mats.get(C, A),
    u = (C, A) => n.mats.get(C, { interior: !0, ...(A || {}) }),
    f = (C) => (typeof C == "string" ? c(C) : C);
  function h(C, A, F = {}) {
    let H = createMesh(C, f(A), { cast: F.cast !== !1, recv: F.recv !== !1 });
    return (
      F.p && H.position.set(F.p[0], F.p[1], F.p[2]),
      F.r && H.rotation.set(F.r[0] || 0, F.r[1] || 0, F.r[2] || 0),
      (F.parent || e).add(H),
      H
    );
  }
  function p(C, A, F, H, N, Z, Q, W = {}) {
    let J = W.bevel
      ? beveledBoxGeometry(A, F, H, W.bevel)
      : boxGeometry(A, F, H);
    return h(J, C, { ...W, p: [N, Z, Q] });
  }
  function d(C, A, F, H, N, Z, Q, W = {}) {
    return p(
      C,
      Math.abs(N - A),
      Math.abs(Z - F),
      Math.abs(Q - H),
      (A + N) / 2,
      (F + Z) / 2,
      (H + Q) / 2,
      W,
    );
  }
  function m(C, A, F, H, N, Z, Q = {}) {
    let W = cylinderGeometry(Q.rTop ?? A, A, F, Q.seg || 12, !!Q.open),
      J =
        Q.axis === "x"
          ? [0, 0, Math.PI / 2]
          : Q.axis === "z"
            ? [Math.PI / 2, 0, 0]
            : Q.r || [0, 0, 0];
    return h(W, C, { ...Q, p: [H, N, Z], r: J });
  }
  function x(C, A, F = 0.03, H = {}) {
    return h(tubeGeometry(A, F, H.radial || 6, !1, H.tension ?? 0.5), C, H);
  }
  function v(C, A, F, H = 0.015, N = {}) {
    let Z = new Vector3(...A),
      Q = new Vector3(...F),
      W = Z.distanceTo(Q),
      J = cylinderGeometry(H, H, W, N.seg || 6),
      G = h(J, C, N);
    return (
      G.position.copy(Z).add(Q).multiplyScalar(0.5),
      G.quaternion.setFromUnitVectors(
        new Vector3(0, 1, 0),
        Q.sub(Z).normalize(),
      ),
      G
    );
  }
  function y(
    C,
    A,
    F,
    H,
    N,
    Z,
    {
      depth: Q = 0.4,
      width: W = 0.2,
      tf: J = 0.02,
      tw: G = 0.012,
      depthAxis: te = null,
      r: oe = null,
    } = {},
  ) {
    let ee = new Group();
    (ee.position.set(H, N, Z),
      oe && ee.rotation.set(oe[0] || 0, oe[1] || 0, oe[2] || 0));
    let le = te || (A === "y" ? "z" : "y"),
      xe = ["x", "y", "z"].find((ue) => ue !== A && ue !== le),
      j = (ue, de, $) => {
        let se = {};
        return ((se[A] = ue), (se[le] = de), (se[xe] = $), [se.x, se.y, se.z]);
      },
      O = (ue) => {
        let de = { x: 0, y: 0, z: 0 };
        return ((de[le] = ue), [de.x, de.y, de.z]);
      },
      q = f(C);
    for (let ue of [-1, 1])
      h(boxGeometry(...j(F, J, W)), q, {
        parent: ee,
        p: O(ue * (Q / 2 - J / 2)),
      });
    return (
      h(boxGeometry(...j(F, Q - 2 * J, G)), q, { parent: ee }),
      e.add(ee),
      ee
    );
  }
  function b(C, A, F, H, N, Z, Q = "z+", W = 0) {
    let J = new PlaneGeometry(A, F),
      G = new Mesh(J, C);
    return (
      (G.castShadow = !1),
      (G.receiveShadow = !0),
      G.position.set(H, N, Z),
      Q === "z-"
        ? (G.rotation.y = Math.PI)
        : Q === "x+"
          ? (G.rotation.y = Math.PI / 2)
          : Q === "x-"
            ? (G.rotation.y = -Math.PI / 2)
            : Q === "y+" && ((G.rotation.x = -Math.PI / 2), (G.rotation.z = W)),
      e.add(G),
      G
    );
  }
  function g(C, A, F, H, N, Z, Q) {
    try {
      let W = n.mats.decal(C);
      return !W || !W.material
        ? null
        : b(W.material, A, A / (W.aspect || 1), F, H, N, Z, Q);
    } catch {
      return null;
    }
  }
  function E(C, A, F, H, N, Z, Q) {
    try {
      let W = n.mats.label(C, Q || {});
      return !W || !W.material
        ? null
        : b(W.material, A * (W.aspect || 4), A, F, H, N, Z);
    } catch {
      return null;
    }
  }
  function M(C, A, F, H, N, Z, Q = "concrete", W = {}) {
    return n.physics.addBox([C, A, F], [H, N, Z], { surface: Q, ...W });
  }
  let _ = new Box3();
  function T(C, A, F = {}) {
    let H = C.userData.colliders || [],
      N = Math.abs(Math.sin(2 * A)) > 0.2;
    for (let Z of H) {
      let Q = [Z];
      if (N) {
        let W = Z.max[0] - Z.min[0],
          J = Z.max[2] - Z.min[2],
          G = W >= J ? 0 : 2,
          te = Math.max(W, J),
          oe = Math.max(0.25, Math.min(W, J)),
          ee = Math.min(10, Math.max(1, Math.round(te / oe)));
        if (ee > 1) {
          Q = [];
          for (let le = 0; le < ee; le++) {
            let xe = Z.min.slice(),
              j = Z.max.slice();
            ((xe[G] = Z.min[G] + (te * le) / ee),
              (j[G] = Z.min[G] + (te * (le + 1)) / ee),
              Q.push({ min: xe, max: j, surface: Z.surface }));
          }
        }
      }
      for (let W of Q)
        if (
          (_.min.set(W.min[0], W.min[1], W.min[2]),
          _.max.set(W.max[0], W.max[1], W.max[2]),
          _.applyMatrix4(C.matrixWorld),
          !(_.max.y - _.min.y < 0.2 && _.max.y < 0.3))
        ) {
          if (N) {
            let J = (_.max.x - _.min.x) * 0.07,
              G = (_.max.z - _.min.z) * 0.07;
            ((_.min.x += J), (_.max.x -= J), (_.min.z += G), (_.max.z -= G));
          }
          n.physics.addBox(_.min, _.max, {
            surface: W.surface || Z.surface || "metal",
            ...(F.colOpts || {}),
          });
        }
    }
  }
  function w(C, A, F, H = 0, N = {}, Z = 0, Q = {}) {
    if (
      !Q.inert &&
      ((C === "barrel" && N.color === "red" && !N.lying && !N.open) ||
        C === "gas_cylinders")
    )
      return (
        r.push({ name: C, x: A, y: Z, z: F, yaw: H, opts: { ...N } }),
        o.push({ name: C, x: A, y: Z, z: F, yaw: H }),
        new Group()
      );
    let W = n.props.build(C, N);
    return (
      W.position.set(A, Z, F),
      (W.rotation.y = H),
      (Q.dynamic ? t : e).add(W),
      W.updateMatrixWorld(!0),
      !Q.noCol && !cR.has(C) && T(W, H, Q),
      typeof W.userData.update == "function" &&
        s.push((J) => W.userData.update(J)),
      o.push({ name: C, x: A, y: Z, z: F, yaw: H }),
      W
    );
  }
  function S(C, A, F = 0, H = 0, N = {}) {
    let Z = w("stairs_metal", C, A, F, N, H),
      Q = Math.abs(Math.cos(F)) > 0.5;
    return (
      i.push(
        Q
          ? [C - 1.5, A - 0.5, C + 1.5, A + 0.5]
          : [C - 0.5, A - 1.5, C + 0.5, A + 1.5],
      ),
      Z
    );
  }
  function R(C, A, F = 0, H = 0, N = {}, Z = [!0, !0]) {
    let Q = Z[0] && Z[1] ? "both" : Z[0] ? "left" : Z[1] ? "right" : "none",
      W = w("catwalk", C, A, F, { ...N, rails: Q }, H),
      J = Math.abs(Math.cos(F)) > 0.5,
      G = J ? 1.5 : 0.6,
      te = J ? 0.6 : 1.5;
    return (i.push([C - G, A - te, C + G, A + te]), W);
  }
  let z = { 20: "container20", 40: "container40", hc: "container40hc" },
    I = { container20: 2.59, container40: 2.59, container40hc: 2.9 },
    L = { container20: 6.06, container40: 12.19, container40hc: 12.19 };
  function U(C, A, F, H = 0, N = 1) {
    let Z = 0,
      Q = [];
    for (let W = 0; W < F.length; W++) {
      let [J, G, te = {}] = F[W],
        oe = z[J],
        ee = (te.dx || 0) + (W ? l(-0.05, 0.05) * N : 0),
        le = (te.dz || 0) + (W ? l(-0.04, 0.04) * N : 0),
        xe = H + l(-1, 1) * 0.022 * N * (W ? 0.6 : 1) + (te.flip ? Math.PI : 0),
        j = w(
          oe,
          C + ee,
          A + le,
          xe,
          {
            color: G,
            seed: Math.floor(l(1, 99999)),
            wear: te.wear ?? l(0.2, 0.85),
            doors: te.doors || 0,
          },
          Z,
        ),
        O = L[oe],
        q = I[oe],
        ue = Math.abs(Math.cos(H)) > 0.5,
        de = (ue ? O : 2.44) / 2,
        $ = (ue ? 2.44 : O) / 2;
      if (
        (i.push([C + ee - de, A + le - $, C + ee + de, A + le + $]), te.reefer)
      ) {
        let se = -(O / 2 + 0.2),
          fe = Math.cos(xe),
          me = Math.sin(xe);
        w(
          "reefer_unit",
          C + ee + se * fe,
          A + le - se * me,
          xe,
          { seed: W + 3 },
          Z + 0.14,
        );
      }
      (Q.push(j), (Z += q));
    }
    return { top: Z, objs: Q };
  }
  function k(C, A) {
    for (let F of i)
      if (C >= F[0] && C <= F[2] && A >= F[1] && A <= F[3]) return !0;
    return !1;
  }
  return {
    G: n,
    THREE: THREE,
    staticRoot: e,
    dynRoot: t,
    metalRects: i,
    updaters: s,
    placed: o,
    explosives: r,
    rng: a,
    rnd: l,
    M: c,
    MI: u,
    add: h,
    box: p,
    slab: d,
    cyl: m,
    tube: x,
    rod: v,
    ibeam: y,
    quad: b,
    decal: g,
    label: E,
    col: M,
    place: w,
    stairs: S,
    catwalk: R,
    stack: U,
    isMetal: k,
  };
}

var Dr = 4;

function rb(i, { scale: e = 0.5, maxW: t = 2048 } = {}) {
  let n = {
    count: 0,
    material: null,
    update() {},
  };
  if (typeof document > "u") return n;
  let s = new Map();
  if (
    (i.traverse((b) => {
      if (!b.isMesh || Array.isArray(b.material)) return;
      let m = b.material;
      if (
        !m ||
        m.name !== "label" ||
        !m.map ||
        !m.map.image ||
        !m.map.image.width
      )
        return;
      let A = b,
        _ = !1;
      for (; A;) {
        if (A.userData && A.userData.noMerge) {
          _ = !0;
          break;
        }
        A = A.parent;
      }
      _ || (s.has(m) || s.set(m, []), s.get(m).push(b));
    }),
    s.size < 2)
  )
    return n;
  let o = [...s.keys()].map((b) => {
    let m = b.map.image;
    return {
      m: b,
      img: m,
      w: Math.max(4, Math.ceil(m.width * e)),
      h: Math.max(4, Math.ceil(m.height * e)),
    };
  });
  o.sort((b, m) => m.h - b.h || m.w - b.w);
  let r = 0,
    a = 0,
    l = 0;
  for (let b of o) {
    let m = Math.min(b.w, t - 2 * Dr);
    (m < b.w && ((b.h = Math.max(4, Math.round((b.h * m) / b.w))), (b.w = m)),
      r + b.w + 2 * Dr > t && ((r = 0), (a += l), (l = 0)),
      (b.x = r + Dr),
      (b.y = a + Dr),
      (r += b.w + 2 * Dr),
      (l = Math.max(l, b.h + 2 * Dr)));
  }
  let c = t,
    u = MathUtils.ceilPowerOfTwo(Math.max(16, a + l));
  if (u > 4096) return n;
  let h = document.createElement("canvas");
  ((h.width = c), (h.height = u));
  let f = h.getContext("2d"),
    p = () => {
      (f.setTransform(1, 0, 0, 1, 0, 0),
        (f.globalAlpha = 1),
        (f.globalCompositeOperation = "source-over"),
        f.clearRect(0, 0, c, u));
      for (let b of o)
        (f.drawImage(b.img, b.x - Dr, b.y - Dr, b.w + 2 * Dr, b.h + 2 * Dr),
          f.clearRect(b.x, b.y, b.w, b.h),
          f.drawImage(b.img, b.x, b.y, b.w, b.h),
          (b.version = b.m.map.version));
    };
  p();
  let d = o[0].m,
    v = new CanvasTexture(h);
  ((v.colorSpace = d.map.colorSpace),
    (v.anisotropy = d.map.anisotropy),
    (v.generateMipmaps = !0),
    (v.minFilter = LinearMipmapLinearFilter));
  let g = d.clone();
  ((g.map = v), (g.name = "label_atlas"));
  let x = new Map();
  for (let b of o) {
    let m = b.x / c,
      A = (b.x + b.w) / c,
      _ = 1 - b.y / u,
      M = 1 - (b.y + b.h) / u;
    for (let E of s.get(b.m)) {
      let w = E.geometry.uuid + "|" + b.m.uuid,
        S = x.get(w);
      if (!S) {
        S = E.geometry.clone();
        let z = S.attributes.uv;
        if (z) {
          for (let H = 0; H < z.count; H++)
            z.setXY(
              H,
              m + MathUtils.clamp(z.getX(H), 0, 1) * (A - m),
              M + MathUtils.clamp(z.getY(H), 0, 1) * (_ - M),
            );
          z.needsUpdate = !0;
        }
        x.set(w, S);
      }
      ((E.geometry = S), (E.material = g));
    }
  }
  let y = 0;
  return {
    count: o.length,
    material: g,
    size: [c, u],
    update(b) {
      if (!(y > 8)) {
        y += b;
        for (let m of o)
          if (m.m.map.version !== m.version) {
            (p(), (v.needsUpdate = !0));
            break;
          }
      }
    },
  };
}

var cP = {
  FY: 2.6,
  CY: 4.95,
  RY: 5.08,
  TW: 0.08,
  X0: -15.7,
  X1: -10.3,
  Z0: -27.24,
  Z1: -23.8,
  DX0: -11.6,
  DX1: -10.58,
  DH: 2.1,
  SW0: -15.25,
  SW1: -12.45,
  EW0: -26.95,
  EW1: -24.1,
  SILL: 0.9,
  HEAD: 1.95,
  DESK: { x0: -14.95, x1: -12.25, d: 0.76, h: 0.74 },
};

function hw(n, e, t) {
  let {
      M: i,
      MI: s,
      add: o,
      box: r,
      slab: a,
      cyl: l,
      rod: c,
      tube: u,
      col: f,
      G: h,
    } = n,
    { mFrame: p, mGalv: d, mDark: m } = t,
    x = 0.25,
    v = cP,
    y = v.FY,
    b = v.CY,
    g = v.RY,
    E = v.TW,
    M = y,
    _ = e.X0 + x + 0.02,
    T = -10.25,
    w = e.Z0 + x + 0.02,
    S = -23.75,
    R = v.X0,
    z = v.X1,
    I = v.Z0,
    L = v.Z1,
    U = R + E,
    k = z - E,
    C = I + E,
    A = L - E,
    F = y + v.SILL,
    H = y + v.HEAD,
    N = v.DX0,
    Z = v.DX1,
    Q = y + v.DH,
    W = 0.05,
    J = v.SW0,
    G = v.SW1,
    te = v.EW0,
    oe = v.EW1,
    ee = { vertexColors: !0 },
    le = s("armor_white", { color: 13159367, vertexColors: !0 }),
    xe = s("plastic_grey", ee),
    j = s("aluminium"),
    O = s("rubber"),
    q = s("glass"),
    ue = s("wood_dark"),
    de = s("diamond_plate"),
    $ = s("paint_teal"),
    se = s("paint_red"),
    fe = s("paint_yellow"),
    me = s("paint_green"),
    ge = s("cardboard"),
    ce = i("paint_yellow"),
    P = h.mats.emissive(14674420, 1.9),
    D = h.mats.emissive(16773328, 3),
    B = h.mats.emissive(529180, 1),
    X = h.mats.emissive(5810360, 0.8),
    re = h.mats.emissive(13666864, 0.9),
    Y = h.mats.emissive(9411234, 0.55),
    he = (ve) => ((ve = Math.max(0, Math.min(1, ve))), ve * ve * (3 - 2 * ve)),
    V = [-13, b, -25.5],
    ne = [(N + Z) / 2, Q + 0.14, L + 0.06],
    ye = (ve, we, Ae) => {
      let ie = ve - V[0],
        ae = (we - V[1]) * 1.15,
        pe = Ae - V[2],
        Ee = 1.15 + 1.5 / (1 + 0.35 * (ie * ie + ae * ae + pe * pe));
      Ee *= 0.8 + 0.2 * he((we - y) / 0.4);
      let Me = Math.min(ve - U, k - ve),
        Ie = Math.min(Ae - C, A - Ae);
      return (
        (Ee *= 0.86 + 0.14 * he(Math.max(Me, Ie) / 0.45)),
        [Ee * 0.97, Ee, Ee * 1.035]
      );
    },
    Te = (ve, we, Ae) => {
      let ie =
          (0.86 + 0.14 * he((we - y) / 0.6)) *
          (1 - 0.08 * he((we - (b - 0.3)) / 0.4)),
        ae = ve - ne[0],
        pe = we - ne[1],
        Ee = Ae - ne[2],
        Me = 0.6 / (1 + 6 * (ae * ae + pe * pe + Ee * Ee));
      return [
        ie * (1 + Me),
        ie * 0.99 * (1 + Me * 0.85),
        ie * 0.965 * (1 + Me * 0.6),
      ];
    },
    Re = () => [0.7, 0.69, 0.66];
  function Ue(ve) {
    let we = ve.attributes.uv,
      Ae = ve.attributes.position,
      ie = ve.attributes.normal;
    for (let ae = 0; ae < we.count; ae++) {
      let pe = Math.abs(ie.getX(ae)),
        Ee = Math.abs(ie.getY(ae)),
        Me = Ae.getX(ae),
        Ie = Ae.getY(ae),
        Ce = Ae.getZ(ae);
      pe > 0.5
        ? we.setXY(ae, Ce, Ie)
        : Ee > 0.5
          ? we.setXY(ae, Me, Ce)
          : we.setXY(ae, Me, Ie);
    }
    return ve;
  }
  function Ve(ve, we, Ae, ie, ae, pe, Ee, Me, Ie = 0.45, Ce = {}) {
    let Ye = Math.abs(ae - we),
      rt = Math.abs(pe - Ae),
      Be = Math.abs(Ee - ie),
      _t = (z0) => Math.max(1, Math.min(14, Math.round(z0 / Ie))),
      wt = new BoxGeometry(Ye, rt, Be, _t(Ye), _t(rt), _t(Be));
    return (
      wt.translate((we + ae) / 2, (Ae + pe) / 2, (ie + Ee) / 2),
      o(colorGeometry(Ue(wt), Me), ve, Ce)
    );
  }
  function ze(ve, we, Ae, ie, ae, pe, Ee, Me, Ie = 0.012, Ce = {}) {
    let Ye = beveledBoxGeometry(we, Ae, ie, Ie);
    return (Ye.translate(ae, pe, Ee), o(colorGeometry(Ye, Me), ve, Ce));
  }
  function Ge(ve, we, Ae, ie, ae, pe, Ee, Me, Ie = 16) {
    let Ce = cylinderGeometry(we, we, Ae, Ie);
    return (
      Ee === "x"
        ? Ce.rotateZ(Math.PI / 2)
        : Ee === "z" && Ce.rotateX(Math.PI / 2),
      Ce.translate(ie, ae, pe),
      o(colorGeometry(Ce, Me), ve)
    );
  }
  function _e(ve, we, Ae, ie = 0) {
    let ae = new Group();
    return (
      ae.position.set(ve, we, Ae),
      (ae.rotation.y = ie),
      n.staticRoot.add(ae),
      ae
    );
  }
  function Ne(ve, we, Ae, ie, ae, pe, Ee) {
    let Me = new Mesh(new PlaneGeometry(Ae, ie), we);
    return (
      (Me.castShadow = !1),
      (Me.receiveShadow = !1),
      Me.position.set(ae, pe, Ee),
      ve.add(Me),
      Me
    );
  }
  function ke(ve, we, Ae, ie, ae, pe, Ee, Me) {
    try {
      let Ie = h.mats.label(ve, Ee || {});
      if (!Ie || !Ie.material) return 0;
      let Ce = we * (Ie.aspect || 4);
      return (
        Me && Ce > Me && ((we *= Me / Ce), (Ce = Me)),
        pe === "z+"
          ? n.quad(Ie.material, Ce, we, Ae + Ce / 2, ie, ae, pe)
          : pe === "z-"
            ? n.quad(Ie.material, Ce, we, Ae - Ce / 2, ie, ae, pe)
            : pe === "x+"
              ? n.quad(Ie.material, Ce, we, ae, ie, Ae - Ce / 2, pe)
              : n.quad(Ie.material, Ce, we, ae, ie, Ae + Ce / 2, pe),
        Ce
      );
    } catch {
      return 0;
    }
  }
  function je(ve, we, Ae, ie, ae, pe, Ee) {
    try {
      let Me = h.mats.decal(ve);
      if (!Me || !Me.material) return;
      let Ie = Me.aspect || 1,
        Ce = we,
        Ye = Ce / Ie;
      (Ye > Ae && ((Ye = Ae), (Ce = Ye * Ie)),
        n.quad(Me.material, Ce, Ye, ie, ae - Ye / 2, pe, Ee));
    } catch {}
  }
  let Ze = n.staticRoot.children.length;
  (a(de, _, M - 0.1, w, T, M, S),
    a(d, _ + 0.2, M - 0.112, w + 0.1, T - 0.16, M - 0.1, S - 0.16, {
      cast: !1,
    }));
  let qe = [_ + 0.1, -13, T - 0.08];
  for (let ve of qe)
    n.ibeam(p, "z", S - w, ve, M - 0.2, (w + S) / 2, {
      depth: 0.2,
      width: 0.14,
      tf: 0.014,
      tw: 0.01,
    });
  n.ibeam(p, "x", T - _, (_ + T) / 2, M - 0.2, S - 0.08, {
    depth: 0.2,
    width: 0.14,
    tf: 0.014,
    tw: 0.01,
  });
  for (let ve = w + 0.35; ve < S - 0.4; ve += 0.56)
    a(d, _ + 0.17, M - 0.22, ve - 0.025, T - 0.15, M - 0.11, ve + 0.025);
  a(p, T - 0.012, M - 0.3, w, T + 0.012, M + 0.004, S, { bevel: 0.004 });
  for (let ve = w + 0.3; ve < S; ve += 0.62)
    l(d, 0.014, 0.012, T + 0.016, M - 0.15, ve, { axis: "x", seg: 6 });
  let Oe = [
    [T - 0.08, S - 0.08],
    [T - 0.08, w + 0.3],
    [-13, S - 0.08],
  ];
  for (let [ve, we] of Oe) {
    (r(p, 0.14, M - 0.3, 0.14, ve, (M - 0.3) / 2, we, { bevel: 0.01 }),
      f(ve - 0.08, 0, we - 0.08, ve + 0.08, M, we + 0.08, "metal", {
        noNav: !0,
      }),
      r(m, 0.3, 0.02, 0.3, ve, e.FLOOR + 0.01, we, { bevel: 0.004 }));
    for (let Ae of [-1, 1])
      for (let ie of [-1, 1])
        l(d, 0.013, 0.02, ve + Ae * 0.11, e.FLOOR + 0.03, we + ie * 0.11, {
          seg: 6,
        });
    r(p, 0.22, 0.014, 0.22, ve, M - 0.307, we);
  }
  let mt = (ve, we, Ae, ie) =>
    c(
      p,
      [ve + Ae * 0.05, M - 1, we + ie * 0.05],
      [ve + Ae * 0.68, M - 0.31, we + ie * 0.68],
      0.028,
      { seg: 6 },
    );
  (mt(Oe[0][0], Oe[0][1], -1, 0),
    mt(Oe[0][0], Oe[0][1], 0, -1),
    mt(Oe[1][0], Oe[1][1], 0, 1),
    mt(Oe[2][0], Oe[2][1], -1, 0),
    mt(Oe[2][0], Oe[2][1], 1, 0),
    mt(Oe[2][0], Oe[2][1], 0, -1),
    f(_, M - 0.12, w, T, M, S, "metal", { noNav: !0 }));
  let $e = m,
    Ke = 0.9;
  function Bt(ve, we, Ae, ie, ae, pe) {
    let Ee = ve - (we * E) / 2,
      Me = ve - we * E;
    (Ve(le, Ae, ae, Math.min(ve, Ee), ie, pe, Math.max(ve, Ee), Te),
      Ve(le, Ae, ae, Math.min(Ee, Me), ie, pe, Math.max(Ee, Me), ye));
    for (let Ie = R + Ke; Ie < ie - 0.1; Ie += Ke)
      Ie > Ae + 0.1 &&
        (a($e, Ie - 0.009, ae, ve, Ie + 0.009, pe, ve + we * 0.0015, {
          cast: !1,
        }),
        a($e, Ie - 0.006, ae, Me - we * 0.0015, Ie + 0.006, pe, Me, {
          cast: !1,
        }));
  }
  function Gt(ve, we, Ae, ie, ae, pe) {
    let Ee = ve - (we * E) / 2,
      Me = ve - we * E;
    (Ve(le, Math.min(ve, Ee), ae, Ae, Math.max(ve, Ee), pe, ie, Te),
      Ve(le, Math.min(Ee, Me), ae, Ae, Math.max(Ee, Me), pe, ie, ye));
    for (let Ie = I + Ke; Ie < ie - 0.1; Ie += Ke)
      Ie > Ae + 0.1 &&
        (a($e, ve, ae, Ie - 0.009, ve + we * 0.0015, pe, Ie + 0.009, {
          cast: !1,
        }),
        a($e, Me - we * 0.0015, ae, Ie - 0.006, Me, pe, Ie + 0.006, {
          cast: !1,
        }));
  }
  (Bt(L, 1, R, J, y, b),
    Bt(L, 1, J, G, y, F),
    Bt(L, 1, J, G, H, b),
    Bt(L, 1, G, N - W, y, b),
    Bt(L, 1, N - W, Z + W, Q + W, b),
    Bt(L, 1, Z + W, z, y, b),
    Gt(z, 1, I, te, y, b),
    Gt(z, 1, te, oe, y, F),
    Gt(z, 1, te, oe, H, b),
    Gt(z, 1, oe, L, y, b),
    Bt(I, -1, R, z, y, b),
    Gt(R, -1, I, L, y, b),
    Ve(
      xe,
      U,
      y - 0.004,
      C,
      k,
      y + 0.006,
      A,
      (ve, we, Ae) => {
        let ie = ye(ve, y + 0.4, Ae);
        return [ie[0] * 1.25, ie[1] * 1.25, ie[2] * 1.25];
      },
      0.5,
      { cast: !1 },
    ),
    Ve(le, U, b - 0.02, C, k, b, A, ye, 0.4, { cast: !1 }));
  for (let ve = U + 0.62; ve < k - 0.1; ve += 0.6)
    a(j, ve - 0.012, b - 0.024, C, ve + 0.012, b - 0.02, A, { cast: !1 });
  for (let ve = C + 0.58; ve < A - 0.1; ve += 0.6)
    a(j, U, b - 0.0245, ve - 0.012, k, b - 0.0205, ve + 0.012, { cast: !1 });
  (Ve(le, R - 0.03, b, I - 0.02, z + 0.05, g, L + 0.05, Re, 0.7),
    a(d, R - 0.035, g - 0.05, L + 0.05, z + 0.062, g + 0.012, L + 0.062),
    a(d, z + 0.05, g - 0.05, I - 0.02, z + 0.062, g + 0.012, L + 0.05),
    a(d, R - 0.035, b - 0.012, L, z + 0.05, b, L + 0.05, { cast: !1 }),
    a(d, z, b - 0.012, I, z + 0.05, b, L, { cast: !1 }),
    a(d, R, y, L, N - W, y + 0.07, L + 0.012, { bevel: 0.003 }),
    a(d, Z + W, y, L, z, y + 0.07, L + 0.012, { bevel: 0.003 }),
    a(d, z, y, I, z + 0.012, y + 0.07, L + 0.012, { bevel: 0.003 }),
    a(d, z - 0.07, y + 0.07, L - 0.07, z + 0.006, b - 0.012, L + 0.006),
    a(d, R - 0.006, y + 0.07, L - 0.07, R + 0.07, b - 0.012, L + 0.006),
    a(d, z - 0.07, y, I - 0.006, z + 0.006, b - 0.012, I + 0.07));
  let vi =
      (ve, we) =>
      (Ae, ie, ae, pe, Ee, Me, Ie, Ce = {}) =>
        Ce.fn
          ? Ve(
              Ae,
              ie,
              pe,
              ve + we * Math.min(Me, Ie),
              ae,
              Ee,
              ve + we * Math.max(Me, Ie),
              Ce.fn,
              0.4,
            )
          : a(Ae, ie, pe, ve + we * Me, ae, Ee, ve + we * Ie, Ce),
    q0 =
      (ve, we) =>
      (Ae, ie, ae, pe, Ee, Me, Ie, Ce = {}) =>
        Ce.fn
          ? Ve(
              Ae,
              ve + we * Math.min(Me, Ie),
              pe,
              ie,
              ve + we * Math.max(Me, Ie),
              Ee,
              ae,
              Ce.fn,
              0.4,
            )
          : a(Ae, ve + we * Me, pe, ie, ve + we * Ie, Ee, ae, Ce);
  function yi(ve, we, Ae, ie) {
    let ae = E / 2,
      pe = 0.05,
      Ee = { bevel: 0.006 },
      Me = (Ae - we - pe) / ie,
      Ie = 0.012,
      Ce = [];
    (ve(j, we, Ae, H - pe, H, -ae - 0.012, ae + 0.014, Ee),
      ve(j, we, Ae, F, F + pe, -ae - 0.012, ae + 0.014, Ee));
    for (let Ye = 0; Ye <= ie; Ye++) {
      let rt = we + Ye * Me;
      ve(j, rt, rt + pe, F + pe, H - pe, -ae - 0.012, ae + 0.014, Ee);
    }
    for (let Ye = 0; Ye < ie; Ye++) {
      let rt = we + Ye * Me + pe,
        Be = we + (Ye + 1) * Me;
      (Ce.push([rt, Be]),
        ve(q, rt, Be, F + pe, H - pe, -0.004, 0.004, { cast: !1 }),
        ve(O, rt, rt + Ie, F + pe, H - pe, -0.013, 0.013, { cast: !1 }),
        ve(O, Be - Ie, Be, F + pe, H - pe, -0.013, 0.013, { cast: !1 }),
        ve(O, rt, Be, F + pe, F + pe + Ie, -0.013, 0.013, { cast: !1 }),
        ve(O, rt, Be, H - pe - Ie, H - pe, -0.013, 0.013, { cast: !1 }));
    }
    return (
      ve(j, we - 0.03, Ae + 0.03, F - 0.02, F, ae, ae + 0.07, {
        bevel: 0.005,
      }),
      ve(j, we - 0.03, Ae + 0.03, F - 0.05, F - 0.02, ae, ae + 0.012),
      ve(le, we - 0.03, Ae + 0.03, F - 0.03, F, -ae - 0.11, -ae, { fn: ye }),
      Ce
    );
  }
  (yi(vi(L - E / 2, 1), J, G, 3),
    yi(q0(z - E / 2, 1), te, oe, 3),
    r(j, 0.03, 0.06, 0.02, J + 0.95, F + 0.5, A - 0.02),
    r(j, 0.02, 0.06, 0.03, k - 0.02, F + 0.5, te + 0.96),
    a(p, N - W, y, A - 0.015, N, Q + W, L + 0.015, { bevel: 0.006 }),
    a(p, Z, y, A - 0.015, Z + W, Q + W, L + 0.015, { bevel: 0.006 }),
    a(p, N - W, Q, A - 0.015, Z + W, Q + W, L + 0.015, { bevel: 0.006 }),
    a(O, N, y, A + 0.004, N + 0.012, Q, A + 0.02, { cast: !1 }),
    a(O, Z - 0.012, y, A + 0.004, Z, Q, A + 0.02, { cast: !1 }),
    a(O, N, Q - 0.012, A + 0.004, Z, Q, A + 0.02, { cast: !1 }),
    a(j, N, y - 0.002, A - 0.03, Z, y + 0.008, L + 0.04, { bevel: 0.003 }));
  let sn = (98 * Math.PI) / 180,
    P0 = 0.985,
    $t = 0.044,
    Sn = 0.012,
    bi = 2.085,
    oi = _e(N - 0.012, y, A - 0.03, sn),
    xn = (ve, we, Ae, ie, ae, pe, Ee, Me = {}) =>
      r(
        ve,
        Math.abs(ae - we),
        Math.abs(pe - Ae),
        Math.abs(Ee - ie),
        (we + ae) / 2,
        (Ae + pe) / 2,
        (ie + Ee) / 2,
        { ...Me, parent: oi },
      ),
    Zt = { x0: 0.6, x1: 0.84, y0: 1.15, y1: 1.8 };
  (xn($, 0, Sn, -$t / 2, P0, Zt.y0, $t / 2),
    xn($, 0, Zt.y1, -$t / 2, P0, bi, $t / 2),
    xn($, 0, Zt.y0, -$t / 2, Zt.x0, Zt.y1, $t / 2),
    xn($, Zt.x1, Zt.y0, -$t / 2, P0, Zt.y1, $t / 2),
    xn(q, Zt.x0, Zt.y0, -0.004, Zt.x1, Zt.y1, 0.004, { cast: !1 }));
  for (let ve of [-1, 1]) {
    let we = ve * ($t / 2 - 0.004),
      Ae = ve * ($t / 2 + 0.006),
      ie = 0.018;
    (xn(j, Zt.x0 - ie, Zt.y0 - ie, we, Zt.x1 + ie, Zt.y0, Ae),
      xn(j, Zt.x0 - ie, Zt.y1, we, Zt.x1 + ie, Zt.y1 + ie, Ae),
      xn(j, Zt.x0 - ie, Zt.y0, we, Zt.x0, Zt.y1, Ae),
      xn(j, Zt.x1, Zt.y0, we, Zt.x1 + ie, Zt.y1, Ae),
      xn(j, 0.04, 0.05, (ve * $t) / 2, P0 - 0.04, 0.27, ve * ($t / 2 + 0.002)),
      xn(
        j,
        P0 - 0.115,
        0.95,
        (ve * $t) / 2,
        P0 - 0.065,
        1.13,
        ve * ($t / 2 + 0.003),
      ),
      l(j, 0.011, 0.05, P0 - 0.09, 1.07, ve * ($t / 2 + 0.027), {
        axis: "z",
        seg: 8,
        parent: oi,
      }),
      xn(
        j,
        P0 - 0.22,
        1.06,
        ve * ($t / 2 + 0.042),
        P0 - 0.078,
        1.08,
        ve * ($t / 2 + 0.06),
        { bevel: 0.006 },
      ),
      l(m, 0.011, 0.016, P0 - 0.09, 0.985, ve * ($t / 2 + 0.005), {
        axis: "z",
        seg: 8,
        parent: oi,
      }));
  }
  for (let ve of [0.25, 1.05, 1.85])
    l(j, 0.009, 0.1, -0.004, ve, -$t / 2 - 0.004, { seg: 8, parent: oi });
  (xn(j, 0.07, 1.975, -$t / 2 - 0.048, 0.31, 2.035, -$t / 2, {
    bevel: 0.006,
  }),
    xn(j, 0.08, 1.5, $t / 2, 0.54, 1.74, $t / 2 + 0.003));
  for (let [ve, we, Ae] of [
    ["SITE OFFICE", 0.075, 1.665],
    ["BERTH 4", 0.055, 1.565],
  ])
    try {
      let ie = h.mats.label(ve, {
        color: "black",
        font: "sans",
        distress: 0.12,
      });
      if (ie && ie.material) {
        let ae = we,
          pe = ae * (ie.aspect || 4);
        (pe > 0.42 && ((ae *= 0.42 / pe), (pe = 0.42)),
          (Ne(
            oi,
            ie.material,
            pe,
            ae,
            0.1 + pe / 2,
            Ae,
            $t / 2 + 0.0055,
          ).receiveShadow = !0));
      }
    } catch {}
  oi.updateMatrixWorld(!0);
  let Vs = new Vector3(0.12, 2.045, -$t / 2 - 0.03).applyMatrix4(
      oi.matrixWorld,
    ),
    ws = [N + 0.24, Q + 0.022, A - 0.022],
    cl = [N + 0.2, Vs.y + 0.008, A - 0.2];
  (c(j, [Vs.x, Vs.y, Vs.z], cl, 0.007),
    c(j, cl, ws, 0.007),
    r(j, 0.07, 0.02, 0.03, ws[0], ws[1], ws[2] + 0.004),
    l(O, 0.02, 0.035, N - 0.26, y + 0.022, A - 0.93, { seg: 8 }),
    a(O, N + 0.08, y + 0.006, A - 0.78, Z - 0.06, y + 0.016, A - 0.1, {
      bevel: 0.004,
      cast: !1,
    }));
  {
    let ve = (N + Z) / 2,
      we = Q + 0.135,
      Ae = L;
    (r(m, 0.3, 0.13, 0.05, ve, we, Ae + 0.025, { bevel: 0.012 }),
      r(D, 0.23, 0.08, 0.04, ve, we, Ae + 0.055, { cast: !1, recv: !1 }));
    for (let ie of [-0.028, 0, 0.028])
      r(d, 0.27, 0.006, 0.006, ve, we + ie, Ae + 0.082, { cast: !1 });
    for (let ie of [-0.135, 0.135])
      r(d, 0.006, 0.09, 0.05, ve + ie, we, Ae + 0.06, { cast: !1 });
  }
  (a(j, -12.34, y + 1.42, L, -11.76, y + 1.76, L + 0.004),
    ke(
      "SITE OFFICE",
      0.095,
      -12.31,
      y + 1.655,
      L + 0.007,
      "z+",
      { color: "black", font: "sans", distress: 0.15 },
      0.52,
    ),
    ke(
      "BERTH 4 CONTROL",
      0.06,
      -12.31,
      y + 1.515,
      L + 0.007,
      "z+",
      { color: "black", font: "sans", distress: 0.15 },
      0.52,
    ),
    n.decal("hazard_general", 0.2, -12.2, y + 1.2, L + 0.003, "z+"),
    ke(
      "AUTHORISED STAFF ONLY",
      0.04,
      -12.05,
      y + 1.2,
      L + 0.003,
      "z+",
      { color: "red", font: "sans", distress: 0.25 },
      0.34,
    ));
  {
    let we = L + 0.085,
      Ae = y + 0.62;
    (l(se, 0.065, 0.4, -10.425, Ae + 0.2, we, { seg: 14 }),
      l(se, 0.065, 0.05, -10.425, Ae + 0.425, we, { rTop: 0.03, seg: 14 }),
      l(m, 0.02, 0.05, -10.425, Ae + 0.475, we, { seg: 8 }),
      r(m, 0.11, 0.016, 0.022, -10.425 + 0.03, Ae + 0.505, we),
      r(m, 0.09, 0.014, 0.02, -10.425 + 0.035, Ae + 0.535, we, {
        r: [0, 0, 0.25],
      }),
      u(
        O,
        [
          [-10.425 - 0.02, Ae + 0.47, we + 0.01],
          [-10.425 - 0.085, Ae + 0.4, we + 0.01],
          [-10.425 - 0.082, Ae + 0.2, we + 0.02],
          [-10.425 - 0.075, Ae + 0.1, we + 0.02],
        ],
        0.008,
        { cast: !1 },
      ),
      r(d, 0.15, 0.03, 0.006, -10.425, Ae + 0.3, we - 0.07),
      r(d, 0.02, 0.5, 0.008, -10.425, Ae + 0.25, L + 0.006),
      a(
        j,
        -10.425 - 0.045,
        Ae + 0.13,
        we + 0.062,
        -10.425 + 0.045,
        Ae + 0.27,
        we + 0.066,
        { cast: !1 },
      ),
      a(se, -10.425 - 0.085, y + 1.42, L, -10.425 + 0.085, y + 1.62, L + 0.004),
      ke(
        "FIRE",
        0.055,
        -10.425 - 0.07,
        y + 1.52,
        L + 0.007,
        "z+",
        { color: "white", font: "sans", distress: 0.1 },
        0.14,
      ));
  }
  {
    let ve = z,
      we = ve + 0.016;
    (r(p, 0.11, 0.45, 0.38, ve + 0.055, y + 0.575, -24.11, { bevel: 0.012 }),
      a(m, ve + 0.11, y + 0.38, -24.275, ve + 0.1115, y + 0.77, -24.268, {
        cast: !1,
      }),
      r(j, 0.012, 0.05, 0.02, ve + 0.114, y + 0.575, -24.25),
      n.decal("hazard_voltage", 0.16, ve + 0.113, y + 0.6, -24.09, "x+"),
      c(d, [we, y + 0.8, -23.96], [we, Q + 0.135, -23.96], 0.011),
      c(d, [we, Q + 0.135, -23.96], [we, Q + 0.135, L + 0.016], 0.011),
      r(d, 0.04, 0.04, 0.04, we, Q + 0.135, L + 0.016),
      c(
        d,
        [we, Q + 0.135, L + 0.016],
        [(N + Z) / 2 + 0.15, Q + 0.135, L + 0.016],
        0.011,
      ));
    for (let Me of [y + 1.1, y + 1.6, y + 2.05])
      r(d, 0.012, 0.022, 0.05, ve + 0.006, Me, -23.96);
    c(d, [we, y + 0.68, -24.3], [we, y + 0.68, -25.84], 0.011);
    for (let Me of [-24.7, -25.3])
      r(d, 0.012, 0.05, 0.022, ve + 0.006, y + 0.68, Me);
    (r(p, 0.07, 0.14, 0.1, ve + 0.035, y + 0.68, -25.89, { bevel: 0.008 }),
      l(se, 0.022, 0.02, ve + 0.078, y + 0.68, -25.89, {
        axis: "x",
        seg: 10,
      }),
      c(d, [we, y + 0.35, -24.02], [we, y + 0.06, -24.02], 0.011),
      c(d, [we, y + 0.35, -24.12], [we, y + 0.06, -24.12], 0.011));
    let Ae = T + 0.05,
      ie = -24.12,
      ae = M + 0.06,
      pe = 0.16;
    for (let Me of [-1, 1])
      a(
        d,
        Ae - 0.022,
        pe,
        ie + Me * 0.15 - 0.008,
        Ae + 0.03,
        ae,
        ie + Me * 0.15 + 0.008,
      );
    for (let Me = pe + 0.14; Me < ae - 0.05; Me += 0.3)
      a(d, Ae - 0.016, Me - 0.01, ie - 0.15, Ae + 0.004, Me + 0.01, ie + 0.15);
    for (let Me of [0.9, M - 0.5])
      a(d, T - 0.02, Me - 0.02, ie - 0.19, Ae + 0.03, Me + 0.02, ie - 0.158);
    r(d, 0.14, 0.012, 0.4, Ae + 0.02, e.FLOOR + 0.006, ie);
    let Ee = [ie - 0.09, ie - 0.01, ie + 0.085];
    for (let Me = 0; Me < 3; Me++)
      c(
        O,
        [Ae + 0.018, ae, Ee[Me]],
        [Ae + 0.018, 0.34, Ee[Me]],
        Me ? 0.019 : 0.011,
        { cast: !1 },
      );
    (u(
      O,
      [
        [Ae + 0.018, 0.36, Ee[1]],
        [Ae + 0.03, 0.14, Ee[1] - 0.05],
        [Ae + 0.16, 0.05, Ee[1] - 0.5],
        [Ae + 0.1, 0.048, -25.6],
        [Ae + 0.32, 0.048, -26.7],
        [Ae + 0.22, 0.048, -27.45],
      ],
      0.022,
      { cast: !1, radial: 5 },
    ),
      u(
        O,
        [
          [Ae + 0.018, 0.36, Ee[2]],
          [Ae + 0.06, 0.1, Ee[2] + 0.1],
          [Ae + 0.5, 0.05, Ee[2] + 0.5],
          [Ae + 1.3, 0.05, Ee[2] + 0.6],
        ],
        0.02,
        { cast: !1, radial: 5 },
      ));
  }
  {
    let ve = z + 0.07,
      we = z + 0.37,
      Ae = -26.4,
      ie = y + 0.48,
      ae = 0.8,
      pe = 0.55;
    (ze(le, we - ve, pe, ae, (ve + we) / 2, ie, Ae, Te, 0.018),
      l(m, 0.215, 0.006, we + 0.002, ie, Ae - 0.08, {
        axis: "x",
        seg: 20,
        cast: !1,
      }));
    for (let Ee of [0.21, 0.14, 0.07]) {
      let Me = new TorusGeometry(Ee, 0.006, 4, 20);
      (Me.rotateY(Math.PI / 2),
        o(Me, d, { p: [we + 0.016, ie, Ae - 0.08], cast: !1 }));
    }
    for (let Ee = 0; Ee < 4; Ee++) {
      let Me = (Ee * Math.PI) / 4,
        Ie = Math.cos(Me) * 0.21,
        Ce = Math.sin(Me) * 0.21;
      c(
        d,
        [we + 0.016, ie - Ce, Ae - 0.08 - Ie],
        [we + 0.016, ie + Ce, Ae - 0.08 + Ie],
        0.004,
        { cast: !1, seg: 4 },
      );
    }
    l(m, 0.045, 0.02, we + 0.014, ie, Ae - 0.08, { axis: "x", seg: 10 });
    for (let Ee = 0; Ee < 6; Ee++)
      a(
        m,
        ve + 0.03,
        ie - 0.2 + Ee * 0.07,
        Ae + ae / 2,
        we - 0.03,
        ie - 0.185 + Ee * 0.07,
        Ae + ae / 2 + 0.0015,
        { cast: !1 },
      );
    for (let Ee of [Ae - 0.3, Ae + 0.3])
      (a(
        d,
        z + 0.012,
        ie - pe / 2 - 0.035,
        Ee - 0.02,
        we + 0.03,
        ie - pe / 2 - 0.005,
        Ee + 0.02,
      ),
        c(d, [we, ie - pe / 2 - 0.02, Ee], [z + 0.02, y - 0.22, Ee], 0.012, {
          seg: 5,
        }));
    (u(
      O,
      [
        [ve + 0.12, ie - 0.12, Ae + ae / 2],
        [ve + 0.12, ie - 0.1, Ae + ae / 2 + 0.07],
        [ve + 0.03, ie + 0.12, Ae + ae / 2 + 0.1],
        [z - 0.01, ie + 0.2, Ae + ae / 2 + 0.1],
      ],
      0.014,
      { cast: !1 },
    ),
      u(
        O,
        [
          [z + 0.035, y + 0.63, -25.93],
          [z + 0.1, y + 0.5, -25.96],
          [ve + 0.2, ie - 0.05, Ae + ae / 2 - 0.002],
        ],
        0.008,
        { cast: !1 },
      ),
      f(ve, ie - pe / 2, Ae - ae / 2, we, ie + pe / 2, Ae + ae / 2, "metal", {
        bulletOnly: !0,
      }));
  }
  (je("grime_streak", 0.26, 0.4, -14.5, F - 0.05, L + 0.003, "z+"),
    je("grime_streak", 0.22, 0.34, z + 0.003, F - 0.05, -25.3, "x+"),
    je("rust_run", 0.18, 0.3, z + 0.003, y + 0.2, -26.72, "x+"),
    je("rust_run", 0.16, 0.3, -15.42, b - 0.02, L + 0.003, "z+"),
    je("leak_stain", 0.3, 0.26, z + 0.003, b - 0.02, -26.9, "x+"),
    n.place("cardboard_boxes", -14.5, -26.3, 0.35, { seed: 41 }, g, {
      colOpts: { noNav: !0 },
    }),
    r(s("wood_pallet"), 2.4, 0.045, 0.095, -12.4, g + 0.024, -26.6, {
      r: [0, 0.12, 0],
    }),
    r(s("wood_pallet"), 2.1, 0.045, 0.095, -12.5, g + 0.024, -26.42, {
      r: [0, 0.07, 0],
    }),
    r(s("wood_pallet"), 1.8, 0.045, 0.095, -12.45, g + 0.069, -26.52, {
      r: [0, 0.2, 0],
    }));
  for (let [ve, we] of [
    [0.022, 0.2],
    [0.06, 0.19],
  ]) {
    let Ae = new TorusGeometry(we, 0.02, 5, 16);
    (Ae.rotateX(Math.PI / 2), o(Ae, O, { p: [-11.2, g + ve, -25.2] }));
  }
  let I0 = y + v.DESK.h,
    Kt = v.DESK,
    be = C + Kt.d;
  r(P, 1.16, 0.006, 0.56, V[0], b - 0.026, V[2], { cast: !1, recv: !1 });
  for (let ve of [-1, 1])
    (a(
      j,
      V[0] - 0.6,
      b - 0.034,
      V[2] + ve * 0.3 - 0.02,
      V[0] + 0.6,
      b - 0.02,
      V[2] + ve * 0.3 + 0.02,
      { cast: !1 },
    ),
      a(
        j,
        V[0] + ve * 0.6 - 0.02,
        b - 0.034,
        V[2] - 0.3,
        V[0] + ve * 0.6 + 0.02,
        b - 0.02,
        V[2] + 0.3,
        { cast: !1 },
      ));
  (ze(le, 0.2, 0.27, 0.8, k - 0.1, H + 0.2, -26.4, ye, 0.03),
    a(m, k - 0.19, H + 0.075, -26.75, k - 0.06, H + 0.085, -26.05, {
      cast: !1,
    }),
    ze(le, 0.07, 0.5, 0.95, k - 0.045, y + 0.42, -25.5, ye, 0.012));
  for (let ve = 0; ve < 8; ve++)
    a(
      m,
      k - 0.07,
      y + 0.672,
      -25.92 + ve * 0.11,
      k - 0.02,
      y + 0.674,
      -25.84 + ve * 0.11,
      { cast: !1 },
    );
  (Ve(le, -15.1, y + 0.98, C, -11, y + 1.045, C + 0.035, ye, 0.5, {
    cast: !1,
  }),
    Ve(le, -11.19, y + 1.045, C, -11.13, b - 0.02, C + 0.03, ye, 0.5, {
      cast: !1,
    }));
  for (let ve of [-14.45, -12.9, -11.6]) {
    Ve(le, ve - 0.075, y + 0.878, C, ve + 0.075, y + 0.962, C + 0.012, ye);
    for (let we of [-0.035, 0.035])
      r(m, 0.012, 0.02, 0.004, ve + we, y + 0.935, C + 0.013, { cast: !1 });
  }
  (Ve(le, -10.512, y + 1.208, A - 0.012, -10.428, y + 1.292, A, ye),
    r(m, 0.012, 0.03, 0.004, -10.47, y + 1.25, A - 0.013, { cast: !1 }),
    a(ue, Kt.x0, I0 - 0.032, C + 0.01, Kt.x1, I0, be, { bevel: 0.008 }));
  for (let ve of [Kt.x0 + 0.04, Kt.x1 - 0.04])
    (a(m, ve - 0.02, y, C + 0.06, ve + 0.02, I0 - 0.032, be - 0.06),
      a(m, ve - 0.03, y, C + 0.04, ve + 0.03, y + 0.02, be - 0.02));
  (a(m, Kt.x0 + 0.06, y + 0.3, C + 0.07, Kt.x1 - 0.06, I0 - 0.05, C + 0.085),
    r(p, 0.42, 0.56, 0.58, Kt.x1 - 0.3, y + 0.32, C + 0.4, { bevel: 0.01 }));
  for (let ve of [y + 0.23, y + 0.42])
    a(m, Kt.x1 - 0.5, ve, be - 0.071, Kt.x1 - 0.1, ve + 0.006, be - 0.0695, {
      cast: !1,
    });
  for (let ve of [y + 0.14, y + 0.33, y + 0.5])
    r(j, 0.14, 0.014, 0.016, Kt.x1 - 0.3, ve, be - 0.062);
  (r(m, 0.19, 0.44, 0.42, Kt.x0 + 0.3, y + 0.24, C + 0.35, { bevel: 0.01 }),
    r(re, 0.006, 0.006, 0.002, Kt.x0 + 0.3, y + 0.4, C + 0.561, {
      cast: !1,
      recv: !1,
    }),
    l(m, 0.13, 0.3, Kt.x1 + 0.22, y + 0.15, C + 0.22, {
      rTop: 0.15,
      seg: 12,
    }),
    u(
      O,
      [
        [Kt.x0 + 0.3, y + 0.3, C + 0.13],
        [Kt.x0 + 0.5, y + 0.05, C + 0.12],
        [Kt.x0 + 1.2, y + 0.03, C + 0.1],
        [Kt.x0 + 1.25, y + 0.5, C + 0.05],
        [Kt.x0 + 1.25, y + 0.98, C + 0.04],
      ],
      0.008,
      { cast: !1 },
    ));
  function Le(ve, we, Ae, ie) {
    let ae = _e(ve, I0, we, Ae),
      pe = { parent: ae };
    (r(m, 0.25, 0.012, 0.18, 0, 0.006, 0, { ...pe, bevel: 0.004 }),
      r(m, 0.05, 0.17, 0.03, 0, 0.09, -0.025, pe),
      r(m, 0.56, 0.335, 0.03, 0, 0.3, 0, { ...pe, bevel: 0.006 }));
    let Ee = 0.0156;
    if (!ie) {
      Ne(ae, O, 0.53, 0.305, 0, 0.3, Ee).receiveShadow = !0;
      return;
    }
    let Me = (Ce, Ye, rt, Be, _t, wt = 1) =>
      Ne(
        ae,
        Ce,
        Math.abs(Be - Ye),
        Math.abs(_t - rt),
        (Ye + Be) / 2,
        0.3 + (rt + _t) / 2,
        Ee + wt * 0.0012,
      );
    (Me(B, -0.265, -0.1525, 0.265, 0.1525, 0),
      Me(X, -0.25, 0.128, -0.12, 0.14),
      Me(Y, -0.105, 0.13, -0.02, 0.138),
      Me(re, 0.205, 0.128, 0.25, 0.14),
      Me(Y, -0.25, 0.1175, 0.25, 0.119),
      Me(Y, 0.082, -0.14, 0.0832, 0.11),
      Me(X, -0.25, -0.0215, 0.07, -0.019));
    for (let Ce = 0; Ce < 5; Ce++)
      Me(
        Y,
        -0.25 + Ce * 0.08 - 8e-4,
        -0.032,
        -0.25 + Ce * 0.08 + 8e-4,
        -0.0215,
      );
    (Me(Y, -0.236, -0.012, -0.106, 0.014),
      Me(Y, -0.106, -0.006, -0.094, 0.008),
      Me(re, -0.074, -0.012, 0.05, 0.017),
      Me(re, 0.05, -0.006, 0.062, 0.011),
      Me(B, -0.225, -0.004, -0.12, 0.006, 2),
      Me(B, -0.066, -0.004, 0.04, 0.009, 2));
    for (let Ce of [-0.19, -0.035, 0.022])
      (Me(X, Ce - 0.002, -0.046, Ce + 0.002, 0.034, 3),
        Me(X, Ce - 0.012, 0.031, Ce + 0.012, 0.034, 3));
    for (let Ce = 0; Ce < 3; Ce++)
      for (let Ye = 0; Ye < 5; Ye++) {
        let rt = -0.245 + Ye * 0.063,
          Be = -0.068 - Ce * 0.027;
        Me(
          (Ce * 5 + Ye) % 7 === 3 ? re : (Ce + Ye) % 4 === 0 ? X : Y,
          rt,
          Be - 0.018,
          rt + 0.05,
          Be,
        );
      }
    (Me(Y, -0.25, 0.09, -0.16, 0.097),
      Me(Y, -0.25, 0.074, -0.19, 0.08),
      Me(Y, -0.04, 0.09, 0.03, 0.097));
    let Ie = [0.11, 0.075, 0.125, 0.09, 0.06, 0.115, 0.082, 0.1];
    for (let Ce = 0; Ce < 8; Ce++) {
      let Ye = 0.098 - Ce * 0.029;
      (Me(
        Ce === 2 || Ce === 5 ? re : Ce === 6 ? Y : X,
        0.096,
        Ye - 0.011,
        0.108,
        Ye,
      ),
        Me(Y, 0.116, Ye - 0.009, 0.116 + Ie[Ce], Ye - 0.002));
    }
  }
  (Le(-13.86, C + 0.24, 0.17, !0),
    Le(-13.22, C + 0.22, -0.15, !1),
    r(m, 0.44, 0.02, 0.14, -13.56, I0 + 0.012, C + 0.56, {
      bevel: 0.005,
      r: [0.03, 0.04, 0],
    }),
    r(O, 0.4, 0.004, 0.1, -13.56, I0 + 0.024, C + 0.555, {
      r: [0.03, 0.04, 0],
      cast: !1,
    }),
    r(m, 0.06, 0.03, 0.1, -13.22, I0 + 0.015, C + 0.58, {
      bevel: 0.012,
      r: [0, -0.2, 0],
    }));
  let Fe = (ve, we, Ae, ie) => {
    (l(ie, 0.04, 0.09, ve, we + 0.045, Ae, { seg: 12 }),
      l(m, 0.034, 0.004, ve, we + 0.089, Ae, { seg: 12, cast: !1 }),
      r(ie, 0.012, 0.05, 0.03, ve + 0.03, we + 0.048, Ae + 0.035));
  };
  (Fe(-12.98, I0, C + 0.52, $),
    r(m, 0.27, 0.085, 0.2, -14.55, I0 + 0.043, C + 0.2, { bevel: 0.008 }),
    r(O, 0.11, 0.05, 0.004, -14.6, I0 + 0.045, C + 0.302, { cast: !1 }),
    r(re, 0.02, 0.008, 0.002, -14.49, I0 + 0.06, C + 0.301, {
      cast: !1,
      recv: !1,
    }),
    l(m, 0.012, 0.012, -14.46, I0 + 0.035, C + 0.303, { axis: "z", seg: 8 }),
    c(O, [-14.44, I0 + 0.085, C + 0.13], [-14.44, I0 + 0.33, C + 0.13], 0.005, {
      cast: !1,
    }),
    r(m, 0.06, 0.035, 0.09, -14.3, I0 + 0.018, C + 0.36, {
      bevel: 0.01,
      r: [0, 0.4, 0],
    }),
    u(
      O,
      [
        [-14.42, I0 + 0.03, C + 0.3],
        [-14.38, I0 + 0.012, C + 0.4],
        [-14.31, I0 + 0.02, C + 0.41],
      ],
      0.004,
      { cast: !1 },
    ));
  {
    let ve = _e(-14.4, I0, C + 0.56, 0.3);
    (r(ue, 0.23, 0.006, 0.32, 0, 0.003, 0, { parent: ve }),
      r(le, 0.21, 0.003, 0.29, 0, 0.0075, 0.008, { parent: ve, cast: !1 }),
      r(j, 0.1, 0.012, 0.03, 0, 0.014, -0.14, { parent: ve }));
  }
  (r(m, 0.25, 0.05, 0.33, -12.72, I0 + 0.025, C + 0.22, { bevel: 0.006 }),
    r(le, 0.22, 0.012, 0.3, -12.72, I0 + 0.054, C + 0.22, {
      r: [0, 0.06, 0],
      cast: !1,
    }));
  {
    let we = C + 0.5,
      Ae = new SphereGeometry(0.115, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    (Ae.scale(1, 0.95, 1.18),
      o(Ae, fe, { p: [-12.47, I0 + 0.03, we], r: [0, 0.5, 0] }),
      l(fe, 0.125, 0.03, -12.47, I0 + 0.016, we, { seg: 14, r: [0, 0.5, 0] }),
      r(fe, 0.2, 0.01, 0.1, -12.47 + 0.09, I0 + 0.012, we + 0.05, {
        bevel: 0.004,
        r: [0, 0.5, 0],
      }),
      r(fe, 0.02, 0.022, 0.25, -12.47, I0 + 0.128, we, {
        bevel: 0.008,
        r: [0, 0.5, 0],
      }));
  }
  {
    let ve = _e(-13.52, y, -25.93, 0.5),
      we = { parent: ve };
    for (let Ae = 0; Ae < 5; Ae++) {
      let ie = (Ae * Math.PI * 2) / 5 + 0.3,
        ae = Math.cos(ie),
        pe = Math.sin(ie);
      (c(m, [0, 0.1, 0], [ae * 0.29, 0.065, pe * 0.29], 0.017, {
        ...we,
        seg: 5,
      }),
        l(O, 0.027, 0.04, ae * 0.29, 0.027, pe * 0.29, {
          ...we,
          axis: "x",
          seg: 8,
        }));
    }
    (l(j, 0.024, 0.32, 0, 0.26, 0, { ...we, seg: 8 }),
      r(m, 0.2, 0.03, 0.2, 0, 0.425, 0, we),
      r(O, 0.47, 0.075, 0.45, 0, 0.475, 0, { ...we, bevel: 0.025 }),
      r(O, 0.43, 0.5, 0.06, 0, 0.86, 0.225, {
        ...we,
        bevel: 0.025,
        r: [0.14, 0, 0],
      }),
      r(m, 0.05, 0.3, 0.02, 0, 0.62, 0.245, { ...we, r: [0.1, 0, 0] }));
    for (let Ae of [-1, 1])
      (r(m, 0.02, 0.2, 0.03, Ae * 0.255, 0.56, 0.05, we),
        r(O, 0.05, 0.03, 0.26, Ae * 0.255, 0.67, 0.02, we));
  }
  {
    let ve = U + 0.02,
      we = U + 0.49,
      Ae = C + 0.02,
      ie = C + 0.64,
      ae = 1.32;
    r(p, we - ve, ae, ie - Ae, (ve + we) / 2, y + ae / 2, (Ae + ie) / 2, {
      bevel: 0.012,
    });
    for (let Ie = 0; Ie < 4; Ie++) {
      let Ce = y + 0.04 + Ie * 0.315;
      (Ie &&
        a(m, ve + 0.015, Ce - 0.004, ie, we - 0.015, Ce + 0.004, ie + 0.0015, {
          cast: !1,
        }),
        r(j, 0.15, 0.016, 0.018, (ve + we) / 2, Ce + 0.23, ie + 0.012),
        a(
          le,
          (ve + we) / 2 - 0.04,
          Ce + 0.13,
          ie,
          (ve + we) / 2 + 0.04,
          Ce + 0.17,
          ie + 0.002,
          { cast: !1 },
        ));
    }
    let pe = y + ae,
      Ee = (ve + we) / 2,
      Me = Ae + 0.46;
    r(m, 0.42, 0.05, 0.2, Ee, pe + 0.025, Me, { bevel: 0.008 });
    for (let Ie = 0; Ie < 4; Ie++) {
      let Ce = Ee - 0.15 + Ie * 0.1;
      (Ie !== 2 &&
        (r(m, 0.058, 0.13, 0.036, Ce, pe + 0.105, Me - 0.01, {
          r: [-0.12, 0, 0],
        }),
        c(
          O,
          [Ce + 0.018, pe + 0.16, Me - 0.02],
          [Ce + 0.018, pe + 0.26, Me - 0.035],
          0.005,
          { cast: !1 },
        ),
        l(m, 0.008, 0.014, Ce - 0.015, pe + 0.175, Me - 0.022, { seg: 6 })),
        r(Ie === 2 ? Y : re, 0.008, 0.004, 0.002, Ce, pe + 0.03, Me + 0.101, {
          cast: !1,
          recv: !1,
        }));
    }
    for (let [Ie, Ce, Ye] of [
      [-0.1, $, 0.3],
      [-0.03, se, 0.29],
      [0.04, p, 0.31],
      [0.11, $, 0.3],
    ])
      r(Ce, 0.062, Ye, 0.24, Ee + Ie, pe + Ye / 2, Ae + 0.16, {
        r: [0, 0, Ie > 0.1 ? 0.08 : 0],
      });
    f(U, y, C, we + 0.01, y + ae, ie + 0.01, "metal");
  }
  {
    let ve = U + 0.46,
      we = -26.36,
      Ae = -25.14,
      ie = 1.8;
    (r(
      $,
      ve - U - 0.01,
      ie,
      Ae - we,
      (U + 0.01 + ve) / 2,
      y + 0.03 + ie / 2,
      (we + Ae) / 2,
      { bevel: 0.01 },
    ),
      a(m, U + 0.04, y, we + 0.03, ve - 0.03, y + 0.03, Ae - 0.03),
      a(
        m,
        ve,
        y + 0.05,
        (we + Ae) / 2 - 0.004,
        ve + 0.0015,
        y + ie + 0.01,
        (we + Ae) / 2 + 0.004,
        { cast: !1 },
      ));
    for (let ae of [-1, 1]) {
      let pe = (we + Ae) / 2 + ae * 0.305;
      for (let Ee of [y + 0.2, y + 1.6])
        for (let Me = 0; Me < 3; Me++)
          a(
            m,
            ve,
            Ee + Me * 0.035,
            pe - 0.11,
            ve + 0.0015,
            Ee + Me * 0.035 + 0.012,
            pe + 0.11,
            { cast: !1 },
          );
      (r(j, 0.02, 0.11, 0.022, ve + 0.01, y + 1, (we + Ae) / 2 + ae * 0.06),
        ke(ae < 0 ? "08" : "07", 0.05, pe + 0.04, y + 1.45, ve + 0.003, "x+", {
          color: "white",
          font: "stencil",
          distress: 0.3,
        }));
    }
    f(U, y, we, ve, y + ie + 0.03, Ae, "metal");
  }
  {
    let ve = U + 0.5,
      we = A - 0.92,
      Ae = A - 0.01,
      ie = 0.84;
    (r(
      p,
      ve - U - 0.03,
      ie - 0.03,
      Ae - we - 0.02,
      (U + 0.01 + ve - 0.02) / 2,
      y + (ie - 0.03) / 2,
      (we + Ae) / 2,
      { bevel: 0.008 },
    ),
      a(ue, U + 0.005, y + ie - 0.03, we - 0.01, ve + 0.01, y + ie, Ae, {
        bevel: 0.008,
      }),
      a(
        m,
        ve - 0.02,
        y + 0.06,
        (we + Ae) / 2 - 0.003,
        ve - 0.0185,
        y + ie - 0.05,
        (we + Ae) / 2 + 0.003,
        { cast: !1 },
      ));
    for (let Me of [-1, 1])
      r(j, 0.016, 0.1, 0.014, ve - 0.012, y + 0.62, (we + Ae) / 2 + Me * 0.05);
    let ae = y + ie,
      pe = U + 0.24,
      Ee = we + 0.25;
    (l(j, 0.075, 0.17, pe, ae + 0.085, Ee, { rTop: 0.062, seg: 14 }),
      l(m, 0.064, 0.02, pe, ae + 0.18, Ee, { seg: 14 }),
      l(m, 0.085, 0.02, pe, ae + 0.01, Ee, { seg: 14 }),
      r(m, 0.02, 0.13, 0.03, pe + 0.01, ae + 0.1, Ee + 0.095),
      r(j, 0.03, 0.03, 0.05, pe - 0.01, ae + 0.15, Ee - 0.085),
      Fe(U + 0.3, ae, we + 0.52, le),
      Fe(U + 0.18, ae, we + 0.62, se),
      r(ge, 0.14, 0.2, 0.09, U + 0.12, ae + 0.1, we + 0.8, {
        r: [0, 0.2, 0],
      }),
      f(U, y, we - 0.01, ve + 0.01, y + ie, A, "wood"));
  }
  {
    let ve = U,
      we = -24.74,
      Ae = -24,
      ie = y + 1.12,
      ae = y + 1.74;
    (a(j, ve, ie - 0.02, we - 0.02, ve + 0.012, ae + 0.02, Ae + 0.02),
      a(ge, ve + 0.012, ie, we, ve + 0.016, ae, Ae, { cast: !1 }));
    let pe = (Ee, Me, Ie, Ce, Ye) =>
      r(le, 0.002, Ce, Ie, ve + 0.018, Me, Ee, { r: [Ye, 0, 0], cast: !1 });
    (pe(we + 0.16, ae - 0.2, 0.21, 0.297, 0.03),
      pe(we + 0.42, ae - 0.2, 0.21, 0.297, -0.02),
      pe(we + 0.63, ae - 0.15, 0.18, 0.15, 0.04),
      pe(we + 0.6, ie + 0.14, 0.16, 0.2, -0.05),
      pe(we + 0.3, ie + 0.08, 0.3, 0.1, 0.01),
      ke(
        "SAFETY NOTICE",
        0.035,
        we + 0.71,
        ae - 0.11,
        ve + 0.021,
        "x+",
        { color: "red", font: "sans", distress: 0.1 },
        0.16,
      ),
      ke(
        "TIDE TABLE",
        0.03,
        we + 0.515,
        ae - 0.09,
        ve + 0.021,
        "x+",
        { color: "black", font: "sans", distress: 0.1 },
        0.18,
      ),
      ke(
        "MUSTER  GATE 1",
        0.03,
        we + 0.44,
        ie + 0.085,
        ve + 0.021,
        "x+",
        { color: "black", font: "sans", distress: 0.1 },
        0.27,
      ),
      n.decal("hazard_general", 0.1, ve + 0.021, ie + 0.16, we + 0.6, "x+"));
    for (let Ee = 0; Ee < 6; Ee++)
      (a(
        m,
        ve + 0.019,
        ae - 0.15 - Ee * 0.03,
        we + 0.37 - (Ee % 2) * 0.03,
        ve + 0.0195,
        ae - 0.147 - Ee * 0.03,
        we + 0.51,
        { cast: !1 },
      ),
        a(
          m,
          ve + 0.019,
          ae - 0.1 - Ee * 0.035,
          we + 0.08 + (Ee % 3) * 0.02,
          ve + 0.0195,
          ae - 0.097 - Ee * 0.035,
          we + 0.25,
          { cast: !1 },
        ));
    (r(me, 0.09, 0.26, 0.3, ve + 0.045, y + 1.45, -24.96, { bevel: 0.01 }),
      a(le, ve + 0.09, y + 1.43, -25.025, ve + 0.092, y + 1.47, -24.895, {
        cast: !1,
      }),
      a(le, ve + 0.09, y + 1.385, -24.98, ve + 0.092, y + 1.515, -24.94, {
        cast: !1,
      }));
  }
  {
    let Ae = y + 1.3,
      ie = y + 2,
      ae = C;
    (a(j, -14.8 - 0.02, Ae - 0.02, ae, -13.62 + 0.02, ie + 0.02, ae + 0.014),
      Ve(le, -14.8, Ae, ae + 0.014, -13.62, ie, ae + 0.018, ye, 0.3, {
        cast: !1,
      }));
    let pe = (Lt, o0, g0, M0, on, Tn = 1) =>
      a(
        Lt,
        -14.8 + o0,
        ie - on,
        ae + 0.018,
        -14.8 + M0,
        ie - g0,
        ae + 0.018 + 0.0012 * Tn,
        { cast: !1 },
      );
    (ke(
      "BERTH 4  YARD PLAN",
      0.045,
      -14.8 + 0.04,
      ie - 0.05,
      ae + 0.021,
      "z+",
      { color: "black", font: "sans", distress: 0.1 },
      0.6,
    ),
      pe($, 0.03, 0.1, 1.15, 0.27),
      pe(m, 0.03, 0.27, 1.15, 0.278, 2),
      pe(p, 0.1, 0.15, 0.5, 0.225, 2),
      pe(se, 0.6, 0.15, 1, 0.225, 2));
    for (let Lt of [0.2, 0.68, 0.86]) pe(fe, Lt, 0.24, Lt + 0.03, 0.31, 3);
    let Ee = [$, p, fe, se, p, $, p];
    for (let Lt = 0; Lt < 3; Lt++)
      for (let o0 = 0; o0 < 7; o0++)
        (Lt * 7 + o0) % 5 !== 4 &&
          pe(
            Ee[(o0 + Lt * 3) % 7],
            0.05 + o0 * 0.155,
            0.33 + Lt * 0.075,
            0.05 + o0 * 0.155 + 0.13,
            0.385 + Lt * 0.075,
            2,
          );
    (pe(m, 0.05, 0.57, 0.5, 0.66, 2),
      ke("SHED", 0.035, -14.8 + 0.08, ie - 0.615, ae + 0.0215, "z+", {
        color: "white",
        font: "stencil",
        distress: 0.2,
      }),
      pe(m, 0.6, 0.6, 1.12, 0.606, 2),
      pe(m, 0.6, 0.63, 0.98, 0.636, 2));
    for (let [Lt, o0] of [
      [0.02, 0.02],
      [1.16, 0.02],
      [0.02, 0.68],
      [1.16, 0.68],
    ])
      l(se, 0.008, 0.008, -14.8 + Lt, ie - o0, ae + 0.022, {
        axis: "z",
        seg: 6,
        cast: !1,
      });
    let Me = -13.42,
      Ie = -11.92,
      Ce = y + 1.25,
      Ye = y + 2;
    (a(j, Me - 0.02, Ce - 0.02, ae, Ie + 0.02, Ye + 0.02, ae + 0.014),
      Ve(
        le,
        Me,
        Ce,
        ae + 0.014,
        Ie,
        Ye,
        ae + 0.018,
        (Lt, o0, g0) => {
          let M0 = ye(Lt, o0, g0);
          return [M0[0] * 1.12, M0[1] * 1.12, M0[2] * 1.12];
        },
        0.3,
        { cast: !1 },
      ),
      a(j, Me + 0.3, Ce - 0.04, ae, Ie - 0.3, Ce - 0.02, ae + 0.06),
      l(se, 0.008, 0.12, Me + 0.5, Ce - 0.012, ae + 0.04, {
        axis: "x",
        seg: 6,
      }),
      l(m, 0.008, 0.12, Me + 0.66, Ce - 0.012, ae + 0.035, {
        axis: "x",
        seg: 6,
      }),
      r(O, 0.11, 0.03, 0.045, Ie - 0.45, Ce - 0.005, ae + 0.035));
    let rt = (Lt, o0, g0, M0) =>
      a(m, Me + Lt, Ye - M0, ae + 0.018, Me + g0, Ye - o0, ae + 0.0188, {
        cast: !1,
      });
    for (let Lt of [0.14, 0.28, 0.42, 0.56]) rt(0.04, Lt, 1.46, Lt + 0.004);
    (rt(0.52, 0.14, 0.524, 0.7), rt(1.02, 0.14, 1.024, 0.7));
    let Be = { color: "black", font: "sans", distress: 0.2 },
      _t = { color: "red", font: "sans", distress: 0.2 };
    (ke(
      "BERTH 4  NIGHT SHIFT",
      0.06,
      Me + 0.06,
      Ye - 0.075,
      ae + 0.021,
      "z+",
      Be,
      0.7,
    ),
      [
        ["MV TESSALY", "ETA 0540", "PILOT 0500"],
        ["CRANE 2", "SPREADER FAULT", "TAG OUT"],
        ["RELAY B", "SHED MEZZ", "CHECK 0300"],
        ["GATE 1", "CLOSED 2200", ""],
      ].forEach((Lt, o0) => {
        let g0 = Ye - 0.21 - o0 * 0.14;
        (ke(Lt[0], 0.05, Me + 0.06, g0, ae + 0.021, "z+", Be, 0.42),
          ke(
            Lt[1],
            0.05,
            Me + 0.56,
            g0,
            ae + 0.021,
            "z+",
            o0 === 1 ? _t : Be,
            0.42,
          ),
          Lt[2] &&
            ke(
              Lt[2],
              0.05,
              Me + 1.06,
              g0,
              ae + 0.021,
              "z+",
              o0 === 1 ? _t : Be,
              0.38,
            ));
      }));
    let z0 = -11.5,
      Pi = y + 1.88;
    (l(j, 0.15, 0.035, z0, Pi, ae + 0.0175, { axis: "z", seg: 20 }),
      Ge(le, 0.135, 0.004, z0, Pi, ae + 0.037, "z", ye, 20),
      r(m, 0.009, 0.085, 0.003, z0 - 0.03, Pi + 0.028, ae + 0.041, {
        r: [0, 0, 0.8],
        cast: !1,
      }),
      r(m, 0.007, 0.115, 0.003, z0 + 0.012, Pi + 0.052, ae + 0.042, {
        r: [0, 0, -0.22],
        cast: !1,
      }));
    for (let Lt = 0; Lt < 12; Lt++) {
      let o0 = (Lt * Math.PI) / 6;
      r(
        m,
        0.006,
        0.018,
        0.002,
        z0 + Math.sin(o0) * 0.118,
        Pi + Math.cos(o0) * 0.118,
        ae + 0.04,
        { r: [0, 0, -o0], cast: !1 },
      );
    }
  }
  {
    let ve = k - 0.06,
      we = F,
      Ae = -25.1;
    for (let ie of [-0.035, 0.035])
      (l(m, 0.028, 0.13, ve + ie * 0.3, we + 0.03, Ae + ie, {
        axis: "x",
        seg: 10,
      }),
        l(m, 0.034, 0.04, ve + 0.05 + ie * 0.3, we + 0.035, Ae + ie, {
          axis: "x",
          seg: 10,
        }));
    (r(m, 0.05, 0.02, 0.05, ve, we + 0.04, Ae), Fe(ve - 0.01, we, -26.2, p));
  }
  {
    let ve = new Vector3(),
      we = new Box3(),
      Ae = new Vector3();
    for (let ie = Ze; ie < n.staticRoot.children.length; ie++)
      n.staticRoot.children[ie].traverse((ae) => {
        if (
          !ae.isMesh ||
          !ae.material ||
          !ae.material.isMeshStandardMaterial ||
          ae.material.transparent ||
          ae.geometry.attributes.color ||
          (ae.updateWorldMatrix(!0, !1),
          we
            .setFromBufferAttribute(ae.geometry.attributes.position)
            .applyMatrix4(ae.matrixWorld)
            .getCenter(Ae),
          Ae.x < U ||
            Ae.x > k ||
            Ae.z < C ||
            Ae.z > A ||
            Ae.y < y - 0.01 ||
            Ae.y > b)
        )
          return;
        if (!ae.material.vertexColors) {
          let Me = null;
          try {
            Me = h.mats.get(ae.material.name, {
              ...(ae.material.userData && ae.material.userData.interior
                ? { interior: !0 }
                : {}),
              vertexColors: !0,
            });
          } catch {
            Me = null;
          }
          if (!Me || !Me.vertexColors) return;
          ae.material = Me;
        }
        let pe = ae.geometry.attributes.position,
          Ee = new Float32Array(pe.count * 3);
        for (let Me = 0; Me < pe.count; Me++) {
          ve.fromBufferAttribute(pe, Me).applyMatrix4(ae.matrixWorld);
          let Ie = ye(ve.x, ve.y, ve.z);
          ((Ee[Me * 3] = Ie[0]),
            (Ee[Me * 3 + 1] = Ie[1]),
            (Ee[Me * 3 + 2] = Ie[2]));
        }
        ae.geometry.setAttribute("color", new BufferAttribute(Ee, 3));
      });
  }
  let He = (ve, we, Ae, ie, ae, pe, Ee) =>
    f(ve, we, Ae, ie, ae, pe, "metal", { noNav: !0, ...(Ee || {}) });
  (He(R, y, I, U, g, L),
    He(R, y, I, z, g, C),
    He(k, y, I, z, g, te),
    He(k, y, oe, z, g, L),
    He(k, y, te, z, F + 0.05, oe),
    He(k, H - 0.05, te, z, g, oe),
    He(R, y, A, J, g, L),
    He(J, y, A, G, F + 0.05, L),
    He(J, H - 0.05, A, G, g, L),
    He(G, y, A, N, g, L),
    He(N, Q, A, Z, g, L),
    He(Z, y, A, z, g, L),
    He(R - 0.03, b, I - 0.02, z + 0.05, g, L + 0.05),
    f(k + 0.02, F + 0.05, te, z - 0.02, H - 0.05, oe, "glass", {
      noNav: !0,
      playerOnly: !0,
    }),
    f(J, F + 0.05, A + 0.02, G, H - 0.05, L - 0.02, "glass", {
      noNav: !0,
      playerOnly: !0,
    }),
    He(N - 0.18, y, A - 1, N + 0.01, y + 2.085, A),
    f(Kt.x0, y, C, Kt.x1, I0, be, "wood", { noNav: !0 }),
    f(-13.76, y, -26.17, -13.28, y + 0.5, -25.69, "rubber", { noNav: !0 }));
  let De = S + 0.6;
  (n.catwalk(-14.25, De, 0, M - 0.05, { seed: 2 }, [!1, !0]),
    n.catwalk(-11.25, De, 0, M - 0.05, { seed: 3 }, [!1, !0]));
  for (let ve of [-15.6, -12.75, -9.85])
    (r(p, 0.1, M - 0.12, 0.1, ve, (M - 0.12) / 2, De + 0.5, { bevel: 0.01 }),
      r(m, 0.24, 0.016, 0.24, ve, e.FLOOR + 0.008, De + 0.5));
  a(p, -15.75, M - 0.26, De + 0.44, -9.75, M - 0.12, De + 0.56);
  for (let ve of [-12.75, -9.85])
    for (let we of [-1, 1])
      ve + we * 0.6 > -9.75 ||
        c(
          p,
          [ve + we * 0.04, M - 0.9, De + 0.5],
          [ve + we * 0.6, M - 0.27, De + 0.5],
          0.024,
          { seg: 6 },
        );
  (n.stairs(-8.25, De, Math.PI, 0, { seed: 4 }),
    n.metalRects.push([_, w, -6.7, De + 0.6]));
  {
    let ve = S + 0.02,
      we = z + 0.04,
      Ae = -9.77;
    for (let ie of [we + 0.03, Ae - 0.03])
      r(ce, 0.045, 1.07, 0.045, ie, M + 0.535, ve, { bevel: 0.006 });
    (c(ce, [we, M + 1.05, ve], [Ae, M + 1.05, ve], 0.021, { seg: 7 }),
      c(ce, [we, M + 0.55, ve], [Ae, M + 0.55, ve], 0.016, { seg: 6 }),
      a(m, we, M, ve - 0.004, Ae, M + 0.1, ve + 0.004),
      f(z, M, ve - 0.035, -9.75, M + 1.05, ve + 0.035, "metal", {
        noNav: !0,
      }));
  }
}

var no = {
  X0: -16,
  X1: 12,
  Z0: -28,
  Z1: -11,
  EAVE: 7,
  RIDGE: 9.5,
  ZR: -19.5,
  FLOOR: 0.03,
};

var No = [-16, -11.1, -6.2, -0.8, 5.6, 12];

var yt = {
  x0: -6,
  x1: -1,
  h: 5,
};

var Yt = {
  z0: -22,
  z1: -17,
  h: 4.5,
};

var iv = [
  ["S", 1, 4],
  ["S", 2, 5],
  ["S", 1, 11],
  ["S", 2, 15],
  ["S", 3, 8],
  ["N", 2, 7],
  ["N", 1, 13],
  ["N", 3, 17],
];

var A1 = [-0.04, 0.25, 0.5, 0.75, 1];

var sv = 20;

function ab(n) {
  let {
      M: e,
      MI: t,
      box: i,
      slab: s,
      cyl: o,
      rod: r,
      ibeam: a,
      col: l,
      add: c,
      G: u,
    } = n,
    { X0: f, X1: h, Z0: p, Z1: d, EAVE: m, RIDGE: x, ZR: v, FLOOR: y } = no,
    b = (d - p) / 2,
    g = x - m,
    E = Math.atan2(g, b),
    M = Math.hypot(b, g),
    _ = ($) => m + g * (1 - Math.abs($ - v) / b),
    T = e("corrugated_roof"),
    w = t("corrugated_roof"),
    S = e("concrete"),
    R = t("concrete_painted"),
    z = t("paint_grey"),
    I = t("steel_galv"),
    L = e("steel_galv"),
    U = t("steel_dark"),
    k = 0.25;
  (s(t("floor_epoxy"), f, -0.25, p, h, y, d, { cast: !1 }),
    l(f, -0.5, p, h, y, d, "concrete"),
    s(S, yt.x0 - 0.4, -0.2, d, yt.x1 + 0.4, 0.02, d + 1.4, { cast: !1 }),
    s(S, h, -0.2, Yt.z0 - 0.4, h + 1.4, 0.02, Yt.z1 + 0.4, { cast: !1 }));
  function C($, se, fe, me, ge, ce) {
    if (me - fe < 0.02 || ce - ge < 0.02) return;
    let P = $,
      D = $ - se * k;
    if (ge < 1.2) {
      let X = $ - se * k * 0.5;
      (s(
        S,
        fe,
        y - 0.2,
        Math.min(P, X),
        me,
        Math.min(1.2, ce),
        Math.max(P, X),
        { bevel: 0.015 },
      ),
        s(
          R,
          fe,
          y - 0.2,
          Math.min(X, D),
          me,
          Math.min(1.2, ce),
          Math.max(X, D),
          { bevel: 0.015 },
        ));
    }
    let B = Math.max(ge, 1.2);
    ce <= B ||
      (s(
        T,
        fe,
        B - 0.03,
        Math.min(P + se * 0.02, P + se * 0.06),
        me,
        ce,
        Math.max(P + se * 0.02, P + se * 0.06),
      ),
      s(
        w,
        fe,
        B,
        Math.min(P - se * 0.1, P - se * 0.13),
        me,
        ce,
        Math.max(P - se * 0.1, P - se * 0.13),
      ));
  }
  function A($, se, fe, me, ge, ce) {
    if (me - fe < 0.02 || ce - ge < 0.02) return;
    let P = $,
      D = $ - se * k;
    if (ge < 1.2) {
      let X = $ - se * k * 0.5;
      (s(
        S,
        Math.min(P, X),
        y - 0.2,
        fe,
        Math.max(P, X),
        Math.min(1.2, ce),
        me,
        { bevel: 0.015 },
      ),
        s(
          R,
          Math.min(X, D),
          y - 0.2,
          fe,
          Math.max(X, D),
          Math.min(1.2, ce),
          me,
          { bevel: 0.015 },
        ));
    }
    let B = Math.max(ge, 1.2);
    ce <= B ||
      (s(
        T,
        Math.min(P + se * 0.02, P + se * 0.06),
        B - 0.03,
        fe,
        Math.max(P + se * 0.02, P + se * 0.06),
        ce,
        me,
      ),
      s(
        w,
        Math.min(P - se * 0.1, P - se * 0.13),
        B,
        fe,
        Math.max(P - se * 0.1, P - se * 0.13),
        ce,
        me,
      ));
  }
  function F($, se, fe, me, ge, ce, P = 0.25, D = 0.45, B = 0.26) {
    let X = Math.max(1, Math.floor((ce - ge - 0.1) / D));
    for (let re = 0; re <= X; re++) {
      let Y = ge + 0.08 + ((ce - ge - 0.16) * re) / X;
      i(L, me - fe, 0.018, B, (fe + me) / 2, Y, $ - se * 0.06, {
        r: [se * P, 0, 0],
      });
    }
    for (let re of [fe + 0.03, me - 0.03, (fe + me) / 2])
      s(L, re - 0.03, ge, $ - se * 0.2, re + 0.03, ce, $ + se * 0.06);
    (s(L, fe, ge - 0.05, $ - se * 0.2, me, ge, $ + se * 0.07),
      s(L, fe, ce, $ - se * 0.2, me, ce + 0.05, $ + se * 0.07));
  }
  function H($, se, fe, me, ge, ce, P = 0.5, D = 0.45, B = 0.26) {
    let X = Math.max(1, Math.floor((ce - ge - 0.1) / D));
    for (let re = 0; re <= X; re++) {
      let Y = ge + 0.08 + ((ce - ge - 0.16) * re) / X;
      i(L, B, 0.018, me - fe, $ - se * 0.06, Y, (fe + me) / 2, {
        r: [0, 0, -se * P],
      });
    }
    for (let re of [fe + 0.03, me - 0.03, (fe + me) / 2])
      s(L, $ - se * 0.2, ge, re - 0.03, $ + se * 0.06, ce, re + 0.03);
    (s(L, $ - se * 0.2, ge - 0.05, fe, $ + se * 0.07, ge, me),
      s(L, $ - se * 0.2, ce, fe, $ + se * 0.07, ce + 0.05, me));
  }
  let N = 5.45,
    Z = 6.8;
  for (let $ = 0; $ < No.length - 1; $++) {
    let se = No[$],
      fe = No[$ + 1];
    $ === 2
      ? (C(d, 1, se, yt.x0, 0, m),
        C(d, 1, yt.x1, fe, 0, m),
        C(d, 1, yt.x0, yt.x1, yt.h, m))
      : (C(d, 1, se, fe, 0, N - 0.05),
        C(d, 1, se, fe, Z + 0.05, m),
        F(d, 1, se + 0.15, fe - 0.15, N, Z));
  }
  (C(p, -1, f, h, 0, m),
    s(t("paint_grey"), 6.2, y, p + k, 7.2, 2.1, p + k + 0.04),
    s(e("paint_grey"), 6.2, 0, p - 0.09, 7.2, 2.1, p - 0.05),
    A(f, -1, p, d, 0, m),
    A(h, 1, p, Yt.z0, 0, N - 0.05));
  let Q = { z0: -15.55, z1: -13.35, y0: 3.3 };
  (A(h, 1, Yt.z1, Q.z0, 0, N - 0.05),
    A(h, 1, Q.z1, d, 0, N - 0.05),
    A(h, 1, Q.z0, Q.z1, 0, Q.y0),
    i(T, 0.03, 1.5, 1.05, h + 0.2, Q.y0 - 0.55, Q.z0 + 0.5, {
      r: [0.25, 0.1, -0.22],
    }),
    i(T, 1, 0.03, 2, h + 1.3, 0.05, Q.z0 + 1.6, { r: [0.02, 0.5, 0.03] }));
  for (let $ of [Q.z0, Q.z1])
    s(I, h - 0.16, Q.y0, $ - 0.03, h - 0.1, N - 0.05, $ + 0.03);
  (A(h, 1, Yt.z0, Yt.z1, Yt.h, N - 0.05), A(h, 1, p, d, Z + 0.05, m));
  for (let [$, se] of [
    [p + 0.3, -22.45],
    [-22.15, -16.85],
    [-16.55, d - 0.3],
  ])
    H(h, 1, $, se, N, Z);
  let W = { y: 8.02, r: 0.56 };
  function J($, se, fe) {
    let me = (ge, ce, P) => {
      let D = new Shape();
      if (
        (D.moveTo(-(d + 0.05), m - 0.02),
        D.lineTo(-v, x),
        D.lineTo(-(p - 0.05), m - 0.02),
        D.closePath(),
        fe)
      ) {
        let X = new Path();
        (X.absarc(-v, W.y, W.r, 0, Math.PI * 2, !0), D.holes.push(X));
      }
      let B = new ExtrudeGeometry(D, {
        depth: ge,
        bevelEnabled: !1,
        curveSegments: 20,
      });
      (B.rotateY(Math.PI / 2), B.translate($ + P, 0, 0), c(B, ce));
    };
    (me(0.04, T, se > 0 ? 0.02 : -0.06), me(0.03, w, se > 0 ? -0.13 : 0.1));
  }
  (J(h, 1, !0),
    J(f, -1, !1),
    l(f, 0, d - k, yt.x0, m, d + 0.06, "metal"),
    l(yt.x1, 0, d - k, h, m, d + 0.06, "metal"),
    l(yt.x0, yt.h - 0.5, d - 0.6, yt.x1, m, d + 0.06, "metal"),
    l(f, 0, p - 0.06, h, m, p + k, "metal"),
    l(f - 0.06, 0, p, f + k, x, d, "metal"),
    l(h - k, 0, p, h + 0.06, x, Yt.z0, "metal"),
    l(h - k, 0, Yt.z1, h + 0.06, x, -15.55, "metal"),
    l(h - k, 0, -13.35, h + 0.06, x, d, "metal"),
    l(h - k, 0, -15.55, h + 0.06, 3.3, -13.35, "metal"),
    l(h - k, 5.4, -15.55, h + 0.06, x, -13.35, "metal"),
    l(h - k, Yt.h, Yt.z0, h + 0.06, x, Yt.z1, "metal"));
  let G = [],
    te = (h - f + 0.6) / sv,
    oe = f - 0.3;
  for (let $ of ["S", "N"]) {
    let se = $ === "S" ? 1 : -1,
      fe = [se * E, 0, 0],
      me = Math.cos(E),
      ge = se * Math.sin(E);
    for (let P = 0; P < 4; P++) {
      let D = A1[P],
        B = A1[P + 1],
        X = (D + B) / 2,
        re = (B - D) * M,
        Y = v + se * b * (1 - X),
        he = m + g * X,
        V = 0;
      for (; V < sv;) {
        if (iv.some((ze) => ze[0] === $ && ze[1] === P && ze[2] === V)) {
          V++;
          continue;
        }
        let ne = V;
        for (
          ;
          ne + 1 < sv &&
          !iv.some((ze) => ze[0] === $ && ze[1] === P && ze[2] === ne + 1);
        )
          ne++;
        let ye = oe + V * te,
          Te = oe + (ne + 1) * te,
          Re = (ye + Te) / 2;
        (i(T, Te - ye, 0.04, re + 0.02, Re, he + me * 0.03, Y + ge * 0.03, {
          r: fe,
        }),
          i(w, Te - ye, 0.02, re + 0.02, Re, he - me * 0.02, Y - ge * 0.02, {
            r: fe,
          }));
        let Ue = v + se * b * (1 - D),
          Ve = v + se * b * (1 - B);
        (l(
          Math.max(ye, f - 0.3),
          m + g * Math.max(0, D) - 0.05,
          Math.min(Ue, Ve),
          Te,
          m + g * B + 0.08,
          Math.max(Ue, Ve),
          "metal",
          { noNav: !0 },
        ),
          (V = ne + 1));
      }
    }
    for (let P of iv)
      if (P[0] === $) {
        let D = A1[P[1]],
          B = A1[P[1] + 1],
          X = oe + P[2] * te,
          re = (D + B) / 2,
          Y = v + se * b * (1 - re),
          he = m + g * re;
        (G.push({ x: X + te / 2, y: he, z: Y, w: te, d: (B - D) * b }),
          n.decal(
            "leak_stain",
            1.9,
            X + te / 2 + 0.2,
            y + 0.004,
            Y,
            "y+",
            P[2] * 1.7,
          ),
          i(
            I,
            0.05,
            0.05,
            (B - D) * M,
            X + 0.02,
            he - me * 0.06,
            Y - ge * 0.06,
            { r: fe },
          ),
          i(
            I,
            0.05,
            0.05,
            (B - D) * M,
            X + te - 0.02,
            he - me * 0.06,
            Y - ge * 0.06,
            { r: fe },
          ));
      }
    for (let P of [0.03, 0.2, 0.37, 0.54, 0.71, 0.88, 0.985]) {
      let D = v + se * b * (1 - P),
        B = m + g * P;
      i(I, h - f - 0.3, 0.17, 0.06, (f + h) / 2, B - me * 0.13, D - ge * 0.13, {
        r: fe,
      });
    }
    let ce = v + se * (b + 0.38);
    (s(
      L,
      f - 0.3,
      m - 0.22,
      Math.min(ce, ce + se * 0.16),
      h + 0.3,
      m - 0.08,
      Math.max(ce, ce + se * 0.16),
    ),
      s(
        L,
        f - 0.3,
        m - 0.22,
        Math.min(ce - se * 0.05, ce + se * 0.21),
        h + 0.3,
        m - 0.19,
        Math.max(ce - se * 0.05, ce + se * 0.21),
      ));
    for (let P = 0; P < No.length; P++) {
      if ($ === "S" && (P === 2 || P === 3)) continue;
      let D = Math.min(h - 0.5, Math.max(f + 0.5, No[P])) + 0.42,
        B = v + se * (b + 0.13);
      (o(L, 0.055, m - 0.4, D, (m - 0.4) / 2 + 0.2, B, { seg: 8 }),
        r(L, [D, m - 0.2, B], [D, m - 0.12, ce + se * 0.08], 0.05));
      for (let X of [1.6, 3.6, 5.6])
        i(L, 0.16, 0.04, 0.14, D, X, B - se * 0.02);
      r(L, [D, 0.2, B], [D + 0.02, 0.06, B + se * 0.22], 0.055);
    }
  }
  for (let $ of [-1, 1])
    i(L, h - f + 0.7, 0.03, 0.34, (f + h) / 2, x + 0.03, v + $ * 0.15, {
      r: [$ * E, 0, 0],
    });
  for (let $ of [f - 0.31, h + 0.31])
    for (let se of [-1, 1])
      i(L, 0.04, 0.22, M + 0.4, $, (m + x) / 2 - 0.05, v + se * (b / 2 + 0.1), {
        r: [se * E, 0, 0],
      });
  let ee = [d - k - 0.24, p + k + 0.24];
  for (let $ = 0; $ < No.length; $++) {
    let se =
      $ === 0 ? f + k + 0.12 : $ === No.length - 1 ? h - k - 0.12 : No[$];
    for (let fe of ee)
      (a(z, "y", m - 0.35, se, y + (m - 0.35) / 2, fe, {
        depth: 0.46,
        width: 0.22,
        depthAxis: "z",
      }),
        i(U, 0.36, 0.03, 0.62, se, y + 0.015, fe),
        l(se - 0.12, 0, fe - 0.24, se + 0.12, m, fe + 0.24, "metal"));
    for (let fe of [1, -1]) {
      let me = v + (fe * b) / 2 - fe * 0.14,
        ge = m + g / 2 - 0.42;
      (a(z, "z", M - 0.5, se, ge, me, {
        depth: 0.4,
        width: 0.2,
        depthAxis: "y",
        r: [fe * E, 0, 0],
      }),
        i(z, 0.014, 0.5, 1.5, se, m - 0.55, v + fe * (b - k - 0.9), {
          r: [fe * (E + 0.22), 0, 0],
        }),
        i(z, 0.2, 0.02, 1.55, se, m - 0.82, v + fe * (b - k - 0.95), {
          r: [fe * (E + 0.42), 0, 0],
        }));
    }
    i(z, 0.22, 0.5, 0.03, se, x - 0.55, v);
  }
  for (let $ of [f + k + 0.12, h - k - 0.12])
    for (let se of [-22.3, -16.7]) {
      let fe = _(se) - 0.55;
      (a(z, "y", fe, $, y + fe / 2, se, {
        depth: 0.3,
        width: 0.18,
        depthAxis: "x",
      }),
        l($ - 0.16, 0, se - 0.1, $ + 0.16, fe, se + 0.1, "metal"));
    }
  for (let $ of ee) {
    let se = $ > v ? 1 : -1;
    for (let fe of [2.3, 3.7, 5.15])
      se > 0
        ? (s(I, f + 0.3, fe - 0.08, d - 0.2, yt.x0 - 0.2, fe + 0.08, d - 0.14),
          s(I, yt.x1 + 0.2, fe - 0.08, d - 0.2, h - 0.3, fe + 0.08, d - 0.14))
        : s(I, f + 0.3, fe - 0.08, p + 0.14, h - 0.3, fe + 0.08, p + 0.2);
    i(z, h - f - 0.6, 0.14, 0.14, (f + h) / 2, m - 0.25, $);
  }
  for (let $ of [f + 0.17, h - 0.17])
    for (let se of [2.3, 3.7, 5.15])
      $ > 0
        ? (s(I, $ - 0.03, se - 0.08, p + 0.3, $ + 0.03, se + 0.08, Yt.z0 - 0.2),
          s(I, $ - 0.03, se - 0.08, Yt.z1 + 0.2, $ + 0.03, se + 0.08, d - 0.3))
        : s(I, $ - 0.03, se - 0.08, p + 0.3, $ + 0.03, se + 0.08, d - 0.3);
  for (let [$, se] of [
    [No[0] + 0.4, No[1]],
    [No[4], No[5] - 0.4],
  ]) {
    for (let fe of ee)
      (r(I, [$, 1.35, fe], [se, 5.3, fe], 0.016),
        r(I, [se, 1.35, fe + 0.04], [$, 5.3, fe + 0.04], 0.016));
    for (let fe of [1, -1]) {
      let me = v + fe * (b - 0.6),
        ge = -0.3;
      (r(I, [$, m + ge + 0.1, me], [se, x + ge - 0.1, v + fe * 0.3], 0.014),
        r(I, [se, m + ge + 0.1, me], [$, x + ge - 0.1, v + fe * 0.3], 0.014));
    }
  }
  {
    let $ = d - k;
    for (let se of [yt.x0 - 0.07, yt.x1 + 0.07])
      (s(U, se - 0.07, y, $ - 0.16, se + 0.07, yt.h + 0.75, d + 0.07),
        s(e("hazard_stripes"), se - 0.11, y, $ - 0.2, se + 0.11, 1.3, d + 0.1, {
          bevel: 0.01,
        }));
    (s(U, yt.x0 - 0.2, yt.h, $ - 0.1, yt.x1 + 0.2, yt.h + 0.14, d + 0.08),
      s(I, yt.x0 - 0.25, yt.h + 0.78, $ - 0.72, yt.x1 + 0.25, yt.h + 0.81, $),
      s(
        I,
        yt.x0 - 0.25,
        yt.h + 0.3,
        $ - 0.72,
        yt.x1 + 0.25,
        yt.h + 0.81,
        $ - 0.69,
      ));
    for (let se of [yt.x0 - 0.24, yt.x1 + 0.24])
      s(I, se - 0.012, yt.h + 0.05, $ - 0.72, se + 0.012, yt.h + 0.81, $);
    (o(
      w,
      0.3,
      yt.x1 - yt.x0 + 0.3,
      (yt.x0 + yt.x1) / 2,
      yt.h + 0.44,
      $ - 0.36,
      { axis: "x", seg: 18 },
    ),
      o(
        U,
        0.05,
        yt.x1 - yt.x0 + 0.46,
        (yt.x0 + yt.x1) / 2,
        yt.h + 0.44,
        $ - 0.36,
        { axis: "x", seg: 8 },
      ),
      s(
        w,
        yt.x0 + 0.02,
        yt.h - 0.42,
        $ - 0.09,
        yt.x1 - 0.02,
        yt.h + 0.42,
        $ - 0.06,
      ),
      s(
        e("hazard_stripes"),
        yt.x0 + 0.02,
        yt.h - 0.52,
        $ - 0.12,
        yt.x1 - 0.02,
        yt.h - 0.42,
        $ - 0.03,
      ),
      s(
        U,
        yt.x1 + 0.28,
        yt.h + 0.2,
        $ - 0.6,
        yt.x1 + 0.7,
        yt.h + 0.7,
        $ - 0.15,
        { bevel: 0.02 },
      ),
      r(
        U,
        [yt.x1 + 0.5, yt.h + 0.2, $ - 0.3],
        [yt.x1 + 0.5, 1.2, $ - 0.3],
        0.008,
      ));
    for (let se of [yt.x0 - 0.45, yt.x1 + 0.45])
      n.place("bollard_post", se, d + 0.55, 0, { seed: 5 });
  }
  {
    let $ = h + 0.12,
      se = Yt.z0 - 0.25,
      fe = se - 5.1;
    s(T, $, 0.12, fe, $ + 0.05, Yt.h + 0.1, se);
    for (let me of [fe, se, (fe + se) / 2])
      s(L, $ - 0.02, 0.1, me - 0.05, $ + 0.09, Yt.h + 0.12, me + 0.05);
    for (let me of [0.14, Yt.h + 0.08, Yt.h * 0.5])
      s(L, $ - 0.02, me - 0.05, fe, $ + 0.09, me + 0.05, se);
    (r(L, [$ + 0.02, 0.2, fe + 0.1], [$ + 0.02, Yt.h, (fe + se) / 2], 0.02),
      r(L, [$ + 0.02, 0.2, se - 0.1], [$ + 0.02, Yt.h, (fe + se) / 2], 0.02),
      s(U, $ - 0.04, Yt.h + 0.16, fe - 0.2, $ + 0.12, Yt.h + 0.3, Yt.z1 + 0.3),
      s(U, h - k - 0.02, y, Yt.z0 - 0.12, h + 0.08, Yt.h + 0.1, Yt.z0),
      s(U, h - k - 0.02, y, Yt.z1, h + 0.08, Yt.h + 0.1, Yt.z1 + 0.12),
      s(
        U,
        h - k - 0.02,
        Yt.h,
        Yt.z0 - 0.12,
        h + 0.08,
        Yt.h + 0.12,
        Yt.z1 + 0.12,
      ));
    for (let me of [Yt.z0 - 0.06, Yt.z1 + 0.06])
      s(
        e("hazard_stripes"),
        h - k - 0.05,
        y,
        me - 0.1,
        h + 0.1,
        1.3,
        me + 0.1,
        { bevel: 0.01 },
      );
    (l($ - 0.05, 0, fe, $ + 0.12, Yt.h + 0.3, se, "metal"),
      n.place("bollard_post", h + 0.6, Yt.z0 - 0.4, 0, { seed: 6 }));
  }
  let le = new Group();
  (le.position.set(h - 0.05, W.y, v), (le.userData.noMerge = !0));
  {
    let $ = new TorusGeometry(W.r + 0.02, 0.05, 8, 28);
    ($.rotateY(Math.PI / 2), c($, L, { p: [h + 0.04, W.y, v] }));
    let se = new TorusGeometry(W.r + 0.02, 0.035, 6, 28);
    (se.rotateY(Math.PI / 2), c(se, I, { p: [h - 0.16, W.y, v] }));
    for (let ge of [0.4, 0.4 + Math.PI / 2])
      r(
        L,
        [h + 0.1, W.y - Math.sin(ge) * W.r, v - Math.cos(ge) * W.r],
        [h + 0.1, W.y + Math.sin(ge) * W.r, v + Math.cos(ge) * W.r],
        0.012,
      );
    for (let ge of [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3])
      r(
        I,
        [h - 0.18, W.y + Math.sin(ge) * W.r, v + Math.cos(ge) * W.r],
        [h - 0.18, W.y, v],
        0.014,
      );
    o(U, 0.13, 0.26, h - 0.22, W.y, v, { axis: "x", seg: 12 });
    let fe = t("steel_worn");
    for (let ge = 0; ge < 5; ge++) {
      let ce = boxGeometry(0.012, 0.42, 0.2);
      (ce.rotateY(0.5),
        ce.translate(0, 0.3, 0),
        ce.rotateX((ge / 5) * Math.PI * 2));
      let P = new Mesh(ce, fe);
      ((P.castShadow = !0), (P.receiveShadow = !0), le.add(P));
    }
    let me = new Mesh(
      cylinderGeometry(0.1, 0.1, 0.1, 12).rotateZ(Math.PI / 2),
      U,
    );
    ((me.castShadow = !0), le.add(me), n.dynRoot.add(le));
  }
  let xe = u.mats.emissive(16757864, 7),
    j = t("aluminium"),
    O = [];
  for (let $ of [-15.4, -23.6])
    for (let se of [-13.6, -8.5, -3.5, 2.6, 8.6])
      ($ < -20 && se < -10) || O.push([se, $]);
  for (let [$, se] of O) {
    let fe = _(se) - 0.3,
      me = 6.05;
    (r(U, [$, fe, se], [$, me + 0.3, se], 0.012, { cast: !1 }),
      o(j, 0.33, 0.3, $, me + 0.15, se, { rTop: 0.09, seg: 14 }),
      o(U, 0.09, 0.14, $, me + 0.37, se, { seg: 10 }),
      o(xe, 0.24, 0.02, $, me + 0.02, se, { seg: 14, cast: !1, recv: !1 }));
  }
  let q = [];
  for (let [$, se] of [
    [-8.5, -15.4],
    [2.6, -15.4],
    [-3.5, -23.6],
    [8.6, -23.6],
  ]) {
    let fe = new PointLight(16761994, 34, 13, 2);
    (fe.position.set($, 5.75, se),
      (fe.castShadow = !1),
      fe.layers.enable(1),
      n.dynRoot.add(fe),
      q.push(fe));
  }
  hw(n, no, { mFrame: z, mGalv: I, mDark: U });
  {
    let fe = d - k - 0.05,
      me = fe - 0.75;
    s(t("wood_dark"), 1.6, 0.88, me, 5, 0.94, fe, { bevel: 0.012 });
    for (let ge of [1.6 + 0.06, 5 - 0.06, (1.6 + 5) / 2])
      for (let ce of [me + 0.06, fe - 0.06])
        i(U, 0.05, 0.86, 0.05, ge, y + 0.43, ce);
    (s(U, 1.6 + 0.04, 0.2, me + 0.06, 5 - 0.04, 0.23, fe - 0.04),
      s(
        t("paint_grey"),
        1.6 + 0.1,
        0.55,
        me + 0.04,
        1.6 + 1.3,
        0.86,
        fe - 0.05,
        { bevel: 0.01 },
      ),
      s(t("wood_pallet"), 1.6, 1.25, fe - 0.02, 5, 2.3, fe + 0.01));
    for (let ge = 0; ge < 7; ge++)
      r(
        I,
        [1.6 + 0.3 + ge * 0.42, 1.5 + (ge % 3) * 0.12, fe - 0.04],
        [1.6 + 0.3 + ge * 0.42, 2.05 + (ge % 2) * 0.1, fe - 0.04],
        0.012 + (ge % 2) * 0.006,
        { cast: !1 },
      );
    (i(U, 0.16, 0.14, 0.3, 5 - 0.5, 1.01, me + 0.2, { bevel: 0.015 }),
      i(I, 0.03, 0.03, 0.34, 5 - 0.5, 1.1, me + 0.12),
      i(t("paint_red"), 0.45, 0.22, 0.24, 1.6 + 1.9, 1.05, me + 0.35, {
        bevel: 0.02,
        r: [0, 0.3, 0],
      }),
      s(U, 1.6, 2.5, fe - 0.3, 5, 2.53, fe),
      i(
        u.mats.emissive(16773328, 3),
        5 - 1.6 - 0.4,
        0.03,
        0.1,
        (1.6 + 5) / 2,
        2.48,
        fe - 0.18,
        { cast: !1, recv: !1 },
      ),
      l(1.6, 0, me, 5, 0.94, fe, "wood"));
  }
  {
    for (let ge of [-1, 1]) {
      let ce = -11.6 + (ge * 2.6) / 2;
      (r(t("paint_yellow"), [ce, y, -17.6 - 0.9], [ce, 3.3, -17.6], 0.045),
        r(t("paint_yellow"), [ce, y, -17.6 + 0.9], [ce, 3.3, -17.6], 0.045),
        r(
          t("paint_yellow"),
          [ce, 1, -17.6 - 0.62],
          [ce, 1, -17.6 + 0.62],
          0.03,
        ));
      for (let P of [-17.6 - 0.9, -17.6 + 0.9])
        o(U, 0.07, 0.1, ce, y + 0.05, P, { axis: "x", seg: 8 });
    }
    (a(t("paint_yellow"), "x", 2.6 + 0.5, -11.6, 3.3 + 0.1, -17.6, {
      depth: 0.22,
      width: 0.14,
    }),
      i(U, 0.3, 0.26, 0.24, -11.6 + 0.2, 3.3 - 0.14, -17.6, { bevel: 0.02 }),
      r(I, [-11.6 + 0.2, 3.3 - 0.26, -17.6], [-11.6 + 0.2, 1.75, -17.6], 0.012),
      r(
        I,
        [-11.6 + 0.32, 3.3 - 0.26, -17.6],
        [-11.6 + 0.34, 2.2, -17.6 + 0.02],
        0.008,
      ),
      i(U, 0.85, 0.5, 0.55, -11.6 + 0.2, 1.42, -17.6, {
        bevel: 0.03,
        r: [0, 0.2, 0.05],
      }),
      i(t("steel_worn"), 0.7, 0.16, 0.42, -11.6 + 0.2, 1.74, -17.6, {
        bevel: 0.02,
        r: [0, 0.2, 0.05],
      }),
      o(t("steel_bare"), 0.16, 0.12, -11.6 - 0.28, 1.4, -17.6 - 0.08, {
        axis: "x",
        seg: 12,
      }),
      l(
        -11.6 - 2.6 / 2 - 0.1,
        0,
        -17.6 - 0.35,
        -11.6 + 2.6 / 2 + 0.1,
        1.9,
        -17.6 + 0.35,
        "metal",
      ));
  }
  let ue = Math.PI / 2,
    de = ($, se, fe, me, ge, ce = y, P) => n.place($, se, fe, me, ge, ce, P);
  for (let $ of [-8.4, -5.6, -2.8, 2.8, 5.6, 8.4])
    de("shelf_rack", $, p + k + 0.62, 0, { seed: Math.round($ * 7 + 90) });
  for (let $ of [2.8, 5.6, 8.4])
    de("shelf_rack", $, -23.45, 0, { seed: Math.round($ * 5 + 40) });
  return (
    de("pallet_stack", 0, -26.9, 0.1, { seed: 3 }),
    de("cardboard_boxes", -0.05, -26.9, 0.5, { seed: 4 }, y + 1.15, {
      noCol: !0,
    }),
    de("crate_stack", 2.9, -15.9, 0.12, { seed: 11 }),
    de("crate_wood", 4.15, -16.3, -0.25, { seed: 12 }),
    de("pallet_stack", 2, -17.3, 1.45, { seed: 13 }),
    de("ibc_tote", 6.9, -19.6, 0.1, { seed: 14 }),
    de("barrel", 7.9, -18.5, 0, { seed: 15, color: "blue" }),
    de("barrel", 6, -18.4, 0.6, { seed: 16, color: "red" }),
    de("ibc_tote", -7.6, -16.4, -0.08, { seed: 17 }),
    de("barrel", -8.6, -15.3, 0, { seed: 18 }),
    de("barrel", -7.9, -15, 0.9, { seed: 19, color: "yellow" }),
    de("sandbags", 10.2, -16.4, ue + 0.05, { seed: 20 }),
    de("forklift", 8.3, -13.9, 2.75, { seed: 21 }),
    de("toolbox_cart", 6, -12.2, 0.15, { seed: 22 }),
    de("gas_cylinders", 10.9, -11.9, 0, { seed: 23 }),
    de("tarp_cargo", -13.2, -13.2, 0.12, { seed: 24 }),
    de("tire_stack", -15, -15.6, 0, { seed: 25 }),
    de("tire_stack", -14.9, -16.6, 0.4, { seed: 26 }),
    de("cardboard_boxes", -14.6, -26.6, 0.2, { seed: 27 }),
    de("crate_wood", -12.4, -26.9, -0.1, { seed: 28 }),
    de("barrel", -10.9, -27, 0, { seed: 29, color: "green" }),
    de("crate_wood", -14.7, -24.6, 0.3, { seed: 30 }),
    de("jerry_can", -9.3, -12, 0.4, { seed: 31 }),
    de("jerry_can", -9.7, -12.1, 1.2, { seed: 32 }),
    de("pallet", 10.6, -13.6, 0.2, { seed: 33 }),
    de("cardboard_boxes", 10.6, -13.6, 0.3, { seed: 34 }, 0.17),
    de("traffic_cone", -6.6, -12.2, 0, { seed: 35 }),
    de("traffic_cone", -0.4, -12.3, 0, { seed: 36 }),
    n.tube(
      t("rubber"),
      [
        [1.7, 0.9, -11.9],
        [1.4, 0.4, -12.3],
        [1.2, 0.06, -13.2],
        [2.4, 0.055, -14],
        [1, 0.055, -14.9],
        [-0.8, 0.055, -14.4],
        [-1.6, 0.055, -15.6],
      ],
      0.018,
      { cast: !1 },
    ),
    s(U, 7.2, y, -14.6, 8.4, y + 0.04, -13.6),
    n.decal("oil_stain", 2.2, 7.6, y + 0.004, -15.2, "y+", 0.6),
    n.decal("oil_stain", 1.6, -3.8, y + 0.004, -13.6, "y+", 2.1),
    n.decal("hazard_voltage", 0.5, -1.25, 1.9, d - k - 0.142, "z-"),
    n.decal("caution_stripes", 2.4, -3.5, y + 0.004, -11.9, "y+", 0),
    {
      fan: le,
      lights: q,
      skylights: G,
      relayPos: new Vector3(-2, y, -19.5),
      update($) {
        le.rotation.x += $ * 1.7;
      },
    }
  );
}

export { ab, no, ob, rb };
