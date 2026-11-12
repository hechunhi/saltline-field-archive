// Ported from the newer Saltline bundle (app/runtime.js).
import { enableBenchmark } from "./benchmark.js";
import { bootElement, setBootProgress } from "./boot-screen.js";
import { showFatalError } from "./diagnostics.js";
import { createShowcaseInput, createShowcasePlayer } from "./showcase-stubs.js";
import { SHOWCASE_MODULES } from "./showcases.js";
import { createAudio } from "../audio/audio.js";
import { createCombat, yE } from "../combat/combat.js";
import { createEventBus } from "../core/events.js";
import { FALLBACKS } from "../core/fallbacks.js";
import { createMesh } from "../core/geometry.js";
import { chooseQuality } from "../core/quality.js";
import { createRandom } from "../core/random.js";
import { createEffects } from "../effects/effects.js";
import { createEnemies } from "../enemies/enemies.js";
import { createGameFlow } from "../game/flow.js";
import { createInput } from "../input/input.js";
import { createPlayer } from "../player/player.js";
import { createMaterials } from "../render/materials/materials.js";
import { createRenderer } from "../render/renderer.js";
import { createHUD } from "../ui/hud.js";
import { PlaneGeometry, THREE, Vector3 } from "../vendor/three-r180.js";
import { I5 } from "../weapons/animation.js";
import { createBackdrop } from "../world/backdrop/backdrop.js";
import { createGround } from "../world/ground/ground.js";
import { createLevel } from "../world/level/level.js";
import { createPhysics } from "../world/physics.js";
import { createProps } from "../world/props/props.js";

async function startGame() {
  let n = Object.fromEntries(new URLSearchParams(location.search)),
    e = !!n.bench || location.hash === "#bench";
  e && ((n.noaudio = "1"), (n.autostart = "1"));
  let t = {
    THREE: THREE,
    params: n,
    events: createEventBus(),
    rng: createRandom(+(n.seed || 4207)),
    time: { t: 0, dt: 0, frame: 0, real: 0 },
    quality: chooseQuality(n.q || (n.shot ? "test" : "")),
  };
  window.__G = t;
  let i = n.show && SHOWCASE_MODULES[n.show] ? n.show : null;
  t.showcase = i;
  let s = null;
  function o(p) {
    if (p.cam) {
      let d = String(p.cam).split(",").map(Number);
      s = {
        pos: new Vector3(d[0], d[1], d[2]),
        look: new Vector3(d[3] ?? 0, d[4] ?? 1, d[5] ?? 0),
      };
    }
    (p.cam === "" && (s = null),
      p.fov && ((t.camera.fov = +p.fov), t.camera.updateProjectionMatrix()),
      p.exposure && (t.render.exposure = +p.exposure));
  }
  window.__setShot = o;
  async function r(p, d, m, x = !1) {
    let v = performance.now();
    try {
      t[p] = await m();
    } catch (b) {
      if (
        (console.error(`[boot] module "${p}" failed: ${(b && b.stack) || b}`),
        x || !FALLBACKS[p])
      )
        throw b;
      t[p] = FALLBACKS[p]();
    }
    let y = performance.now() - v;
    y > 150 && console.log(`[boot] ${p} ${y.toFixed(0)}ms`);
  }
  if (
    (await setBootProgress("Waking the renderer", 0.04),
    await r("render", "render", () => createRenderer(t), !0),
    (t.renderer = t.render.renderer),
    (t.scene = t.render.scene),
    (t.camera = t.render.camera),
    (t.viewCamera = t.render.viewCamera),
    await setBootProgress("Mixing paint, rust and rain", 0.12),
    await r("mats", "materials", () => createMaterials(t)),
    (t.physics = createPhysics(t)),
    (t.props = createProps(t)),
    (t.input = i ? createShowcaseInput() : createInput(t)),
    i)
  ) {
    let p = createMesh(
      new PlaneGeometry(80, 80).rotateX(-Math.PI / 2),
      t.mats.get("concrete"),
      {
        cast: !1,
      },
    );
    if (
      (t.scene.add(p),
      (t.level = {
        stub: !0,
        playerStart: { pos: new Vector3(0, 0, 4), yaw: 0 },
        objectives: [],
        enemySpawns: [],
        zones: [],
        interiorBoxes: [],
        cinematicPath: [],
        extraction: { pos: new Vector3(), radius: 2 },
        groundSurfaceAt: () => "concrete",
        update() {},
      }),
      (t.backdrop = FALLBACKS.backdrop()),
      (t.ground = FALLBACKS.ground()),
      t.physics.build(),
      i === "fx")
    )
      await r("fx", "fx", () => createEffects(t));
    else
      try {
        t.fx = await createEffects(t);
      } catch {
        t.fx = FALLBACKS.fx();
      }
    ((t.audio = FALLBACKS.audio()),
      (t.hud = FALLBACKS.hud()),
      (t.player = createShowcasePlayer(t)),
      (t.combat = createCombat(t)),
      (t.weapon = FALLBACKS.weapon()),
      (t.enemies = FALLBACKS.enemies()),
      (t.game = { state: "showcase", update: () => !1, start() {} }));
    let d = null;
    try {
      d = await SHOWCASE_MODULES[i].showcase(t);
    } catch (m) {
      showFatalError(`showcase "${i}" threw: ${(m && m.stack) || m}`);
    }
    ((t.showcaseInfo = d || {}),
      d &&
        d.cam &&
        o({ cam: [...d.cam, ...(d.target || [0, 1, 0])].join(",") }));
  } else {
    if (
      (await setBootProgress("Stacking containers", 0.34),
      await r("level", "level", () => createLevel(t), !0),
      await setBootProgress("Raising the cranes", 0.5),
      await r("backdrop", "backdrop", () => createBackdrop(t)),
      await setBootProgress("Flooding the apron", 0.58),
      await r("ground", "ground", () => createGround(t)),
      t.ground.stub)
    ) {
      let p = createMesh(
        new PlaneGeometry(400, 400).rotateX(-Math.PI / 2),
        t.mats.get("asphalt"),
        { cast: !1 },
      );
      t.scene.add(p);
    }
    (t.physics.build(),
      await setBootProgress("Loading tracers and smoke", 0.66),
      await r("fx", "fx", () => createEffects(t)),
      await r("audio", "audio", () =>
        n.noaudio ? FALLBACKS.audio() : createAudio(t),
      ),
      (t.player = createPlayer(t)),
      (t.combat = createCombat(t)));
    try {
      t.explosives = yE(t);
    } catch (p) {
      (console.error("[boot] explosives failed: " + ((p && p.stack) || p)),
        (t.explosives = { items: [], reset() {}, update() {} }));
    }
    (await setBootProgress("Checking the rifle", 0.74),
      await r("weapon", "weapon", () => I5(t)),
      await setBootProgress("Waking the Harbormaster", 0.82),
      await r("enemies", "enemies", () => createEnemies(t)),
      await r("hud", "hud", () => createHUD(t)),
      (t.game = createGameFlow(t)));
  }
  await setBootProgress("Waiting for first light", 0.92);
  try {
    await t.render.onLevelReady();
  } catch (p) {
    console.error(
      "[boot] render.onLevelReady failed: " + ((p && p.stack) || p),
    );
  }
  let a = 0;
  if (
    ((window.__stats = () => ({
      ...(t.render.stats ? t.render.stats() : {}),
      fps: a ? +(1 / a).toFixed(1) : 0,
      state: t.game && t.game.state,
    })),
    n.cam && o(n),
    n.fov && o({ fov: n.fov }),
    !i && (n.shot || n.autostart))
  )
    try {
      t.game.start({ skipIntro: !0 });
    } catch (p) {
      console.error("[boot] game.start failed", p);
    }
  (n.noweapon && t.weapon.setVisible && t.weapon.setVisible(!1),
    e && enableBenchmark(t),
    await setBootProgress("Ready", 1),
    bootElement.classList.add("done"),
    setTimeout(() => {
      bootElement.hidden = !0;
    }, 700));
  let l = performance.now(),
    c = 1,
    u = 1.1,
    f = new Vector3();
  n.step && (window.__step = 3);
  let h = (p, d) => {
    let m = t[p];
    if (m && m.update)
      try {
        m.update(d);
      } catch (x) {
        h.err[p] ||
          ((h.err[p] = 1),
          console.error(`[loop] ${p}.update threw: ${(x && x.stack) || x}`));
      }
  };
  ((h.err = {}),
    t.renderer.setAnimationLoop(() => {
      if (n.step) {
        if (!(window.__step > 0)) return;
        window.__step--;
      }
      let p = performance.now(),
        d = (p - l) / 1e3;
      ((l = p), (a = a ? a * 0.95 + d * 0.05 : d));
      let m = Math.min(d, 0.05);
      (n.dt && (m = +n.dt),
        (t.time.dt = m),
        (t.time.t += m),
        (t.time.real = p / 1e3),
        t.time.frame++,
        h("input", m));
      let x = !1;
      try {
        x =
          t.game.update(m) !== !1 &&
          t.game.state !== "title" &&
          t.game.state !== "paused";
      } catch (v) {
        h.err.game ||
          ((h.err.game = 1),
          console.error("[loop] game.update threw: " + ((v && v.stack) || v)));
      }
      if (i) {
        if (t.showcaseInfo.update)
          try {
            t.showcaseInfo.update(m);
          } catch (v) {
            h.err.sc ||
              ((h.err.sc = 1),
              console.error(
                "[loop] showcase update threw: " + ((v && v.stack) || v),
              ));
          }
      } else
        x &&
          (h("player", m), h("weapon", m), h("enemies", m), h("explosives", m));
      if (
        t.weapon &&
        t.weapon.setWetness &&
        t.level &&
        t.level.interiorBoxes &&
        t.level.interiorBoxes[0]
      ) {
        let v = t.level.interiorBoxes[0],
          y = t.camera.position,
          b =
            y.x > v.min.x &&
            y.x < v.max.x &&
            y.z > v.min.z &&
            y.z < v.max.z &&
            y.y < v.max.y;
        c += ((b ? 0.3 : 1) - c) * Math.min(1, m * (b ? 0.25 : 0.6));
        try {
          t.weapon.setWetness(c);
        } catch {}
        if (!n.wfill && t.render.sunDir) {
          let g = t.camera.getWorldDirection(f),
            E = Math.max(0, g.x * t.render.sunDir.x + g.z * t.render.sunDir.z);
          ((u += ((b ? 1.1 : 1.1 + 0.6 * E * E) - u) * Math.min(1, m * 2.5)),
            (t.render.viewFill = u));
        }
      }
      (t.game.state !== "paused" &&
        (h("fx", m),
        h("ground", m),
        h("level", m),
        h("backdrop", m),
        h("mats", m)),
        h("audio", m),
        h("hud", m),
        s && (t.camera.position.copy(s.pos), t.camera.lookAt(s.look)),
        t.bench && t.bench.frame(d));
      try {
        t.render.frame(m);
      } catch (v) {
        h.err.render ||
          ((h.err.render = 1),
          console.error("[loop] render.frame threw: " + ((v && v.stack) || v)));
      }
      (t.input.endFrame && t.input.endFrame(),
        window.__frames++,
        window.__frames === 2 && (window.__ready = !0));
    }));
}

export { startGame };
