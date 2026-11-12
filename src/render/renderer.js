// Ported from the newer Saltline bundle (render/renderer.js).
import {
  PLAYER_DIMENSIONS,
  QUALITY_PRESETS,
  SUN_LIGHT,
  vf,
  zc,
} from "../core/config.js";
import {
  beveledBoxGeometry,
  boxGeometry,
  createMesh,
} from "../core/geometry.js";
import {
  POSTPROCESS_SHADER_MARKER,
  createPostprocessing,
} from "./postprocessing.js";
import { Gy, Xy, Yy, installSoftShadows } from "./shadows.js";
import { Hy, Vy, createNoiseTexture } from "./sky.js";
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  Color,
  CubeCamera,
  DepthTexture,
  DirectionalLight,
  Group,
  HalfFloatType,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  NearestFilter,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  PMREMGenerator,
  PerspectiveCamera,
  PointLight,
  RGBAFormat,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  UnsignedIntType,
  Vector2,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderTarget,
  WebGLRenderer,
  defineModuleExports,
} from "../vendor/three-r180.js";

var rendererShowcaseModule = {};

defineModuleExports(rendererShowcaseModule, {
  create: () => createRenderer,
  showcase: () => showcaseRenderer,
});

var Jy = 2;

var Ky = 1;

async function createRenderer(n) {
  let e = n.params || {},
    t = document.getElementById("view"),
    i = new WebGLRenderer({
      canvas: t,
      antialias: !1,
      powerPreference: "high-performance",
      alpha: !1,
      depth: !0,
      stencil: !1,
    });
  ((i.outputColorSpace = SRGBColorSpace),
    (i.toneMapping = NoToneMapping),
    (i.toneMappingExposure = 1),
    (i.shadowMap.enabled = !0),
    (i.shadowMap.type = PCFShadowMap),
    (i.shadowMap.autoUpdate = !1),
    (i.autoClear = !1),
    (i.info.autoReset = !1),
    i.setClearColor(0, 1));
  let s = i.getContext(),
    o = { post: !1, shadow: !1, sky: !1, other: 0 };
  i.debug.onShaderError = (G, te, oe, ee) => {
    let le = "",
      xe = "";
    try {
      ((le = G.getShaderSource(ee) || ""),
        (xe =
          (G.getShaderInfoLog(ee) || "") +
          " " +
          (G.getShaderInfoLog(oe) || "") +
          " " +
          (G.getProgramInfoLog(te) || "")));
    } catch {}
    let j = "material";
    (le.includes(POSTPROCESS_SHADER_MARKER)
      ? ((o.post = !0),
        (j = "post pass " + (le.match(/SALTLINE_POST (\S+)/) || [])[1]))
      : le.includes("SALTLINE_SKY")
        ? ((o.sky = !0), (j = "sky"))
        : le.includes(Yy)
          ? ((o.shadow = !0), (j = "material (soft shadow chunk active)"))
          : o.other++,
      console.error(
        `[render] shader error in ${j}: ${xe.trim().slice(0, 700)}`,
      ));
  };
  let r = new Scene(),
    a = new PerspectiveCamera(PLAYER_DIMENSIONS.fov, 16 / 9, 0.08, 900);
  (a.layers.set(vf), (a.rotation.order = "YXZ"), r.add(a));
  let l = new PerspectiveCamera(PLAYER_DIMENSIONS.viewFov, 16 / 9, 0.01, 10);
  l.layers.set(zc);
  let c = createNoiseTexture(),
    u = Hy(c);
  r.add(u.mesh);
  let f = new DirectionalLight(SUN_LIGHT.color, SUN_LIGHT.intensity);
  ((f.name = "sun"), (f.castShadow = !0));
  let h = Gy(
      f,
      new Vector3(-41, -0.2, -33),
      new Vector3(37, 32, 31),
      new Vector3(-41, -3, -64),
      new Vector3(72, 36, 34),
    ),
    p = () => Math.min(n.quality.shadow || 2048, i.capabilities.maxTextureSize);
  (f.shadow.mapSize.set(p(), p()),
    (f.shadow.bias = -12e-5),
    (f.shadow.normalBias = 0.02),
    (f.shadow.radius = 1),
    (f.shadow.autoUpdate = !0),
    r.add(f, f.target),
    f.layers.enable(zc));
  let d = !1;
  try {
    d = installSoftShadows(h, {
      taps: n.quality.name === "low" ? 10 : 16,
      searchTaps: 8,
    });
  } catch (G) {
    console.warn("[render] soft shadows unavailable: " + G);
  }
  let m = 6,
    x = [];
  for (let G = 0; G < m; G++) {
    let te = new PointLight(16777215, 0, 12, 2);
    ((te.userData = { busy: !1, ttl: 0, dur: 0, peak: 0, persistent: !1 }),
      te.layers.enable(zc),
      r.add(te),
      x.push(te));
  }
  let v = {
      flash(G, te = 16763008, oe = 30, ee = 10, le = 0.06) {
        let xe =
          x.find((j) => !j.userData.busy) ||
          x
            .filter((j) => !j.userData.persistent)
            .sort((j, O) => j.userData.ttl - O.userData.ttl)[0];
        xe &&
          (xe.position.copy(G),
          xe.color.set(te),
          (xe.distance = ee),
          (xe.intensity = oe),
          Object.assign(xe.userData, {
            busy: !0,
            ttl: le,
            dur: le,
            peak: oe,
            persistent: !1,
          }));
      },
      acquire() {
        let G = x.find((te) => !te.userData.busy);
        return G
          ? ((G.userData.busy = !0),
            (G.userData.persistent = !0),
            (G.intensity = 0),
            {
              light: G,
              release() {
                ((G.userData.busy = !1),
                  (G.userData.persistent = !1),
                  (G.intensity = 0));
              },
            })
          : null;
      },
      update(G) {
        for (let te of x) {
          let oe = te.userData;
          oe.busy &&
            !oe.persistent &&
            ((oe.ttl -= G),
            oe.ttl <= 0
              ? ((oe.busy = !1), (te.intensity = 0))
              : (te.intensity = oe.peak * (oe.ttl / oe.dur)));
        }
      },
    },
    y = null;
  try {
    ((y = Vy(i, u)),
      (r.environment = y.texture),
      (r.environmentIntensity = Jy));
  } catch (G) {
    console.error(
      "[render] environment capture failed: " + ((G && G.stack) || G),
    );
  }
  let b = new DepthTexture(4, 4);
  ((b.type = UnsignedIntType), (b.minFilter = b.magFilter = NearestFilter));
  let g = new WebGLRenderTarget(4, 4, {
      type: HalfFloatType,
      format: RGBAFormat,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: !0,
      stencilBuffer: !1,
      depthTexture: b,
      samples: n.quality.msaa | 0,
      generateMipmaps: !1,
    }),
    E = null,
    M = e.post !== "0";
  if (
    (e.ao === "0" && (n.quality.ao = !1),
    e.vol === "0" && (n.quality.volSteps = 0),
    e.bloom === "0" && (n.quality.bloom = !1),
    e.mb === "1" && (n.quality.motionBlur = !0),
    M)
  )
    try {
      E = createPostprocessing(i, n, { noiseTex: c });
    } catch (G) {
      ((M = !1),
        console.error(
          "[render] post chain failed to initialise, using forward fallback: " +
            ((G && G.stack) || G),
        ));
    }
  let _ = !!(e.shot || e.show),
    T = !1,
    w = { t: 99, power: 0, value: 0 };
  n.events &&
    n.events.on &&
    n.events.on("thunder", (G) => {
      ((w.t = 0), (w.power = Math.min(1, (G && G.intensity) || 0.6)));
      let te = Math.PI * (0.55 + Math.random() * 0.9);
      u.material.uniforms.uFlashDir.value
        .set(
          Math.cos(te),
          0.35 + Math.random() * 0.3,
          Math.sin(te) * (Math.random() < 0.5 ? -1 : 1),
        )
        .normalize();
    });
  let S = {
    scale: 1,
    enabled: !(e.shot || e.show || e.dynres === "0"),
    acc: 0,
    n: 0,
    settle: 3.5,
    upWait: 4,
    upDelay: 4,
  };
  function R(G) {
    if (!S.enabled || !M || G > 1500) return;
    if (((S.settle -= G / 1e3), (S.upWait -= G / 1e3), S.settle > 0)) {
      ((S.acc = 0), (S.n = 0));
      return;
    }
    if (((S.acc += G), S.n++, S.n < 45 && S.acc < 900)) return;
    let te = S.acc / S.n;
    ((S.acc = 0), (S.n = 0));
    let oe = S.scale;
    if (
      (te > 21.5 && oe > 0.6
        ? ((oe = te > 45 ? 0.6 : Math.max(0.6, oe - (te > 30 ? 0.2 : 0.1))),
          (S.upDelay = Math.min(60, S.upDelay * 2)),
          (S.upWait = S.upDelay))
        : te < 17.4 && oe < 1 && S.upWait <= 0
          ? ((oe = Math.min(1, oe + 0.1)), (S.upWait = 2))
          : te < 17.4 && oe >= 1 && (S.upDelay = 4),
      (oe = Math.round(oe * 10) / 10),
      oe <= 0.6 && te > 26)
    ) {
      S.floorHits = (S.floorHits || 0) + 1;
      let ee = { ultra: "high", high: "medium", medium: "low" }[n.quality.name];
      if (S.floorHits >= 2 && ee && QUALITY_PRESETS[ee]) {
        ((S.floorHits = 0),
          (S.scale = 0.8),
          (S.settle = 2),
          (S.upDelay = 4),
          console.log(
            "[render] frame time " +
              te.toFixed(0) +
              " ms at minimum scale: dropping quality to " +
              ee,
          ));
        try {
          (Q.setQuality({ ...QUALITY_PRESETS[ee] }),
            n.events.emit("quality:auto", { name: ee }));
        } catch {}
        return;
      }
    } else S.floorHits = 0;
    oe !== S.scale && ((S.scale = oe), (S.settle = 1), Q.resize());
  }
  let z = [],
    I = {},
    L = (G, te) => {
      I[G] || ((I[G] = 1), console.error(te));
    },
    U = { calls: 0, tris: 0 },
    k = 0,
    C = 0;
  function A() {
    (a.updateMatrixWorld(!0),
      (l.matrixAutoUpdate = !1),
      (l.matrixWorldAutoUpdate = !1),
      l.matrixWorld.copy(a.matrixWorld),
      l.matrixWorldInverse.copy(l.matrixWorld).invert());
  }
  function F() {
    (i.toneMapping !== ACESFilmicToneMapping &&
      (i.toneMapping = ACESFilmicToneMapping),
      (i.toneMappingExposure =
        0.6 * Q.exposure * (1 - Math.min(1, Math.max(0, Q.post.fade)))),
      i.setRenderTarget(null),
      i.clear(),
      (i.shadowMap.needsUpdate = !0),
      i.render(r, a),
      i.clearDepth(),
      i.render(r, l));
  }
  let H = new DirectionalLight(new Color(0.78, 0.86, 1), 0.9);
  ((H.name = "viewmodel-key"),
    (H.castShadow = !1),
    H.layers.set(zc),
    H.position.set(-0.55, 0.75, 0.6),
    H.target.position.set(0.1, -0.1, -0.4),
    a.add(H, H.target));
  let N = () => {
    let G =
      Q.interiorEnv &&
      n.level &&
      n.level.interiorBoxes &&
      n.level.interiorBoxes[0];
    return !!(
      G &&
      G.min &&
      a.position.x > G.min.x &&
      a.position.x < G.max.x &&
      a.position.z > G.min.z &&
      a.position.z < G.max.z &&
      a.position.y < G.max.y
    );
  };
  function Z(G) {
    (i.toneMapping !== NoToneMapping && (i.toneMapping = NoToneMapping),
      (i.toneMappingExposure = 1),
      i.setRenderTarget(g),
      i.clear(!0, !0, !1),
      (n.quality.name === "ultra" ||
        e.shot ||
        (k & 1) === 0 ||
        !f.shadow.map) &&
        (i.shadowMap.needsUpdate = !0),
      i.render(r, a),
      T && (E.copyDepth(b), i.setRenderTarget(g)),
      s.depthRange(0, 0.05));
    let te = r.environmentIntensity,
      oe = r.environment;
    H.intensity = (Q.viewKey == null ? 0.9 : Q.viewKey) * (N() ? 0.55 : 1);
    let ee =
        Q.interiorEnv &&
        n.level &&
        n.level.interiorBoxes &&
        n.level.interiorBoxes[0],
      le = !!(
        ee &&
        ee.min &&
        a.position.x > ee.min.x &&
        a.position.x < ee.max.x &&
        a.position.z > ee.min.z &&
        a.position.z < ee.max.z &&
        a.position.y < ee.max.y
      );
    (le && (r.environment = Q.interiorEnv),
      (r.environmentIntensity = te * (le ? Ky / Jy : 1) * (Q.viewFill || 1.1)));
    try {
      i.render(r, l);
    } finally {
      (s.depthRange(0, 1), (r.environmentIntensity = te), (r.environment = oe));
    }
    if (
      (E.run({
        hdr: g,
        camera: a,
        sun: f,
        dt: G,
        post: Q.post,
        exposure: Q.exposure,
        time: n.time ? n.time.t : k / 60,
        fast: _,
        thunder: w.value,
      }),
      i.setRenderTarget(null),
      o.post)
    )
      throw new Error("a post shader failed to compile");
  }
  let Q = {
      renderer: i,
      scene: r,
      camera: a,
      viewCamera: l,
      sun: f,
      sky: u.mesh,
      sunDir: SUN_LIGHT.dir.clone(),
      lightPool: v,
      post: {
        damage: 0,
        lowHealth: 0,
        ads: 0,
        flash: 0,
        fade: 0,
        saturation: 1,
        focusDist: 0,
        shake: 0,
        wet: 1,
      },
      exposure: 1,
      env: y ? y.texture : null,
      interiorEnv: null,
      resolution: new Vector2(4, 4),
      depthTextureIsLive: !1,
      tune: E ? E.TUNE : {},
      get advanced() {
        return M;
      },
      get autoExposure() {
        return E ? E.autoExposure : !1;
      },
      set autoExposure(G) {
        E && (E.autoExposure = !!G);
      },
      get depthTexture() {
        if (!E) return null;
        T = !0;
        try {
          return E.ensureDepthCopy();
        } catch {
          return null;
        }
      },
      addPrePass(G) {
        z.push(G);
      },
      renderWorld(G, te) {
        let oe = i.getRenderTarget(),
          ee = i.shadowMap.needsUpdate,
          le = i.toneMapping,
          xe = i.toneMappingExposure,
          j = G.layers.mask;
        (G.layers.disable(zc),
          (i.shadowMap.needsUpdate = !1),
          (i.toneMapping = NoToneMapping),
          (i.toneMappingExposure = 1));
        try {
          (i.setRenderTarget(te), i.clear(), i.render(r, G));
        } finally {
          ((G.layers.mask = j),
            i.setRenderTarget(oe),
            (i.shadowMap.needsUpdate = ee),
            (i.toneMapping = le),
            (i.toneMappingExposure = xe));
        }
      },
      async onLevelReady() {
        i.shadowMap.needsUpdate = !0;
        try {
          J();
        } catch (G) {
          console.error(
            "[render] interior probe failed: " + ((G && G.stack) || G),
          );
        }
        try {
          if (
            (M && i.setRenderTarget(g),
            await i.compileAsync(r, a),
            Q.interiorEnv)
          ) {
            let G = r.environment;
            r.environment = Q.interiorEnv;
            try {
              i.compile(r, l);
            } finally {
              r.environment = G;
            }
          }
        } catch {}
        (i.setRenderTarget(null), (S.settle = 3.5), (S.acc = 0), (S.n = 0));
      },
      setQuality(G) {
        n.quality = G;
        let te = p();
        f.shadow.mapSize.x !== te &&
          (f.shadow.mapSize.set(te, te),
          f.shadow.map && (f.shadow.map.dispose(), (f.shadow.map = null)));
        let oe = G.msaa | 0;
        (g.samples !== oe && ((g.samples = oe), g.dispose()),
          E && E.applyQuality(),
          Q.resize());
      },
      resize() {
        let G = Math.max(2, t.clientWidth || window.innerWidth),
          te = Math.max(2, t.clientHeight || window.innerHeight),
          oe = Math.min(window.devicePixelRatio || 1, 2),
          ee = n.quality.scale || 1;
        if (M) {
          (i.setPixelRatio(oe), i.setSize(G, te, !1));
          let le = ee * S.scale,
            xe =
              { low: 1e6, medium: 15e5, high: 23e5, ultra: 37e5 }[
                n.quality.name
              ] || 23e5,
            j = G * oe * te * oe * le * le;
          j > xe && (le *= Math.sqrt(xe / j));
          let O = Math.max(16, Math.round(G * oe * le)),
            q = Math.max(16, Math.round(te * oe * le));
          (g.setSize(O, q),
            (b.image.width !== O || b.image.height !== q) &&
              ((b.image.width = O), (b.image.height = q), (b.needsUpdate = !0)),
            E && E.resize(O, q),
            Q.resolution.set(O, q));
        } else
          (i.setPixelRatio(oe * ee),
            i.setSize(G, te, !1),
            Q.resolution.set(
              Math.round(G * oe * ee),
              Math.round(te * oe * ee),
            ));
        ((a.aspect = l.aspect = G / te),
          a.updateProjectionMatrix(),
          l.updateProjectionMatrix());
      },
      frame(G) {
        let te = performance.now();
        (C && R(te - C), (C = te), k++, i.info.reset(), v.update(G));
        let oe = n.time ? n.time.t : k / 60;
        ((u.material.uniforms.uTime.value = oe),
          (w.t += G),
          (w.value =
            w.t < 0.9
              ? w.power *
                Math.exp(-w.t * 5) *
                (0.55 + 0.45 * Math.sin(w.t * 47) * Math.sin(w.t * 13 + 1)) *
                0.35
              : 0),
          (u.material.uniforms.uFlash.value = Math.max(0, w.value)),
          A());
        for (let ee of z)
          try {
            ee(i, r, a);
          } catch (le) {
            L("pre", "[render] pre-pass threw: " + ((le && le.stack) || le));
          }
        if (M)
          try {
            Z(G);
          } catch (ee) {
            M = !1;
            try {
              (s.depthRange(0, 1), i.setRenderTarget(null));
            } catch {}
            (console.error(
              "[render] advanced pipeline disabled, falling back to forward rendering: " +
                ((ee && ee.stack) || ee),
            ),
              Q.resize());
          }
        (M || F(),
          (U = {
            calls: i.info.render.calls,
            tris: i.info.render.triangles,
          }));
      },
      stats() {
        let G = i.info;
        return {
          calls: U.calls,
          tris: U.tris,
          geos: G.memory.geometries,
          tex: G.memory.textures,
          programs: G.programs ? G.programs.length : 0,
          res: [Q.resolution.x, Q.resolution.y],
          scale: S.scale,
          advanced: M,
          softShadows: d,
          adapt: E && e.shot ? E.readAdapt() : void 0,
        };
      },
    },
    W = null;
  function J() {
    let G = n.level && n.level.interiorBoxes;
    if (!G || !G.length) return;
    let te = G[0],
      oe = (te.min.x + te.max.x) / 2,
      ee = (te.min.z + te.max.z) / 2,
      le = te.min.y + Math.min(2.4, (te.max.y - te.min.y) * 0.4);
    if (!W) {
      let q = new WebGLCubeRenderTarget(128, {
        type: HalfFloatType,
        generateMipmaps: !1,
      });
      ((W = {
        cubeRT: q,
        cam: new CubeCamera(0.15, 300, q),
        pmrem: new PMREMGenerator(i),
        out: null,
      }),
        W.cam.layers.set(vf));
    }
    (W.cam.position.set(oe, le, ee), W.cam.updateMatrixWorld(!0));
    let xe = i.toneMapping;
    ((i.toneMapping = NoToneMapping),
      (u.material.uniforms.uEnv.value = 1),
      (i.shadowMap.needsUpdate = !0));
    try {
      W.cam.update(i, r);
    } finally {
      ((u.material.uniforms.uEnv.value = 0),
        (i.toneMapping = xe),
        i.setRenderTarget(null));
    }
    (W.out && W.out.dispose(),
      (W.out = W.pmrem.fromCubemap(W.cubeRT.texture)),
      (Q.interiorEnv = W.out.texture));
    let j = 0,
      O = new Set();
    (r.traverse((q) => {
      let ue = q.material
        ? Array.isArray(q.material)
          ? q.material
          : [q.material]
        : null;
      if (ue)
        for (let de of ue)
          !de ||
            O.has(de) ||
            !de.userData ||
            de.userData.interior !== !0 ||
            !("envMap" in de) ||
            (O.add(de),
            (de.envMap = Q.interiorEnv),
            de.userData.keepEnvIntensity || (de.envMapIntensity = Ky),
            (de.needsUpdate = !0),
            j++);
    }),
      j && console.log(`[render] interior probe assigned to ${j} material(s)`));
  }
  ((Q.captureInteriorProbe = J),
    Q.resize(),
    window.addEventListener("resize", () => Q.resize()));
  try {
    let G = new MeshStandardMaterial({ color: 8421504 }),
      te = new Mesh(new BoxGeometry(1, 1, 1), G);
    ((te.castShadow = te.receiveShadow = !0),
      te.position.set(0, 0.5, -3),
      r.add(te));
    let oe = () => {
      (A(), M ? Z(0.016) : F());
    };
    try {
      oe();
    } catch (ee) {
      M &&
        ((M = !1),
        console.error(
          "[render] advanced pipeline failed its self test, using forward fallback: " +
            ((ee && ee.message) || ee),
        ));
    }
    if (o.shadow && d) {
      (Xy(),
        (d = !1),
        (o.shadow = !1),
        (i.shadowMap.type = PCFSoftShadowMap),
        (f.shadow.radius = 2),
        G.dispose(),
        (te.material = new MeshStandardMaterial({ color: 8421505 })),
        console.warn(
          "[render] soft shadow chunk rejected by the driver, using stock PCF",
        ));
      try {
        oe();
      } catch {
        M = !1;
      }
    }
    if (
      (o.sky && console.error("[render] sky shader failed to compile"),
      r.remove(te),
      te.geometry.dispose(),
      G.dispose(),
      te.material.dispose(),
      !M)
    ) {
      try {
        (s.depthRange(0, 1), i.setRenderTarget(null));
      } catch {}
      Q.resize();
    }
    k = 0;
  } catch (G) {
    console.error("[render] self test threw: " + ((G && G.stack) || G));
  }
  return Q;
}

function showcaseRenderer(context) {
  let e = new Group();
  e.name = "render-showcase";
  let t = (h) => (e.add(h), h),
    n = new SphereGeometry(0.42, 48, 24);
  for (let h = 0; h < 2; h++)
    for (let f = 0; f < 7; f++) {
      let p = new MeshStandardMaterial({
          color: h ? 12170408 : 8006172,
          roughness: 0.06 + f * 0.15,
          metalness: h ? 1 : 0,
        }),
        d = new Mesh(n, p);
      (d.position.set(-3.6 + f * 1.2, 0.42 + h * 1.05, h * -1.1),
        (d.castShadow = d.receiveShadow = !0),
        t(d));
    }
  let s = [
    ["paint_orange", -5.2, 1.4, 1.3, 1.2, 2.2],
    ["steel_worn", 4.6, 1, 0.9, 1, 1.6],
    ["paint_teal", 5.6, 0.6, 2.4, 0.9, 3.6],
    ["concrete", -2.2, 0.5, 0.5, 2.6, 3.2],
  ];
  for (let [h, f, p, d, v, g] of s) {
    let x = createMesh(
      beveledBoxGeometry(p, d, v, 0.03, "bottom"),
      context.mats.get(h),
    );
    (x.position.set(f, 0, g), (x.rotation.y = f * 0.2), t(x));
  }
  for (let h = 0; h < 5; h++) {
    let f = createMesh(
      beveledBoxGeometry(0.5, 0.5, 0.5, 0.02, "bottom"),
      context.mats.get("wood_pallet"),
    );
    (f.position.set(0.5 + h * 0.52, 0, 3.4 + (h % 2) * 0.04), t(f));
  }
  {
    let h = createMesh(
      beveledBoxGeometry(0.5, 0.5, 0.5, 0.02, "bottom"),
      context.mats.get("wood_pallet"),
    );
    (h.position.set(1.3, 0.5, 3.42), (h.rotation.y = 0.3), t(h));
  }
  let o = context.mats.get("concrete_dirty"),
    r = 9,
    a = 7.5,
    l = [
      [-14, -5.2],
      [-4.7, -1.6],
      [-1.1, 1.9],
      [2.4, 5.6],
      [6.3, 14],
    ];
  for (let [h, f] of l) {
    let p = createMesh(boxGeometry(0.4, a, f - h, "bottom"), o);
    (p.position.set(r, 0, (h + f) / 2), t(p));
  }
  {
    let h = createMesh(boxGeometry(0.4, 1.2, 28, "bottom"), o);
    (h.position.set(r, a, 0), t(h));
  }
  let c = [
    [-12, 0, -9, 6, 4, 0.3],
    [-12, 0, -3, 6, 4, 0.3],
    [-15, 0, -6, 0.3, 4, 6.3],
    [-12, 4, -6, 6.6, 0.3, 6.6],
  ];
  for (let [h, f, p, d, v, g] of c) {
    let x = createMesh(
      boxGeometry(d, v, g, "bottom"),
      context.mats.get("steel_dark"),
    );
    (x.position.set(h, f, p), t(x));
  }
  {
    let h = new Mesh(
      boxGeometry(2.4, 0.06, 0.06),
      context.mats.emissive(16756832, 14),
    );
    (h.position.set(-12, 3.6, -6), t(h));
  }
  {
    let h = new Mesh(
      new SphereGeometry(0.06, 12, 8),
      context.mats.emissive(16726560, 30),
    );
    (h.position.set(4.6, 1.02, 1.6), t(h));
  }
  return (
    context.scene.add(e),
    {
      cam: [-8.5, 1.7, 4.2],
      target: [3, 1.5, 0.4],
      update: () => {
        let h = context.render.post,
          f = Math.round(context.camera.position.y * 1e3) % 10;
        ((h.damage = f === 1 ? 0.8 : 0),
          (h.lowHealth = f === 2 ? 0.85 : 0),
          (h.ads = f === 3 ? 1 : 0),
          (h.flash = f === 4 ? 0.35 : 0),
          (h.fade = f === 5 ? 0.5 : 0));
      },
    }
  );
}

export { createRenderer, rendererShowcaseModule, showcaseRenderer };
