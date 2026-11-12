// Ported from the newer Saltline bundle (combat/combat.js).
import { batchStaticMeshes } from "../core/geometry.js";
import {
  Box3,
  Group,
  InstancedMesh,
  Matrix4,
  Vector3,
} from "../vendor/three-r180.js";

function createCombat(n) {
  let e = { shots: 0, hits: 0, kills: 0 };
  return (
    n.events.on("enemy:killed", () => {
      e.kills++;
    }),
    {
      stats: e,
      reset() {
        e.shots = e.hits = e.kills = 0;
      },
      playerShot(
        i,
        s,
        { damage: o = 28, range: r = 300, impulse: a = 1 } = {},
      ) {
        e.shots++;
        let l = n.physics.raycast(i, s, r),
          c = n.enemies.raycast(i, s, l ? l.dist : r);
        if (c) {
          e.hits++;
          let u = c.part === "weak" ? 2.2 : 1,
            f = c.enemy.damage(o * u, c.point, s, c.part) === !0,
            h = {
              point: c.point,
              normal: c.normal || s.clone().negate(),
              dist: c.dist,
              surface: "enemy",
              enemy: c.enemy,
              part: c.part,
              dir: s,
              from: "player",
              killed: f,
            };
          return (
            n.events.emit("impact", h),
            n.events.emit("player:hitEnemy", {
              enemy: c.enemy,
              part: c.part,
              killed: f,
              weak: c.part === "weak",
            }),
            h
          );
        }
        if (l) {
          let u = {
            point: l.point,
            normal: l.normal,
            dist: l.dist,
            surface: l.surface,
            enemy: null,
            dir: s,
            from: "player",
            box: l.box,
          };
          return (n.events.emit("impact", u), u);
        }
        return null;
      },
      enemyShot(i, s, { damage: o = 6, range: r = 200 } = {}) {
        let a = n.physics.raycast(i, s, r),
          l = a ? a.dist : r,
          c = n.player;
        if (c && c.alive) {
          let u = nm.copy(c.pos);
          u.y += 1;
          let f = u.sub(i).dot(s);
          if (f > 0 && f < l) {
            zf.copy(i).addScaledVector(s, f);
            let h = Math.abs(zf.y - (c.pos.y + 0.95));
            if (Math.hypot(zf.x - c.pos.x, zf.z - c.pos.z) < 0.38 && h < 0.95)
              return (c.damage(o, i), !0);
          }
        }
        return (
          a &&
            n.events.emit("impact", {
              point: a.point,
              normal: a.normal,
              dist: a.dist,
              surface: a.surface,
              enemy: null,
              dir: s,
              from: "enemy",
              box: a.box,
            }),
          !1
        );
      },
      explode(i, s = 5, o = 80, r = "player") {
        for (let l of n.enemies.list) {
          if (!l.alive) continue;
          let c = l.pos.distanceTo(i);
          c < s &&
            n.physics.lineOfSight(i, nm.copy(l.pos).setY(l.pos.y + 0.5)) &&
            l.damage(
              o * (1 - c / s),
              l.pos,
              zf.copy(l.pos).sub(i).normalize(),
              "body",
            );
        }
        let a = n.player;
        if (a && a.alive) {
          let l = nm
            .copy(a.pos)
            .setY(a.pos.y + 1)
            .distanceTo(i);
          l < s &&
            n.physics.lineOfSight(i, nm.copy(a.pos).setY(a.pos.y + 1)) &&
            a.damage(o * 0.5 * (1 - l / s), i);
        }
        r === "explosive" && (e.blasts = (e.blasts || 0) + 1);
      },
    }
  );
}

var nm = new Vector3();

var zf = new Vector3();

var vE = {
  barrel: {
    hp: 50,
    fuse: 1.6,
    size: 1.9,
    radius: 6.5,
    damage: 170,
    chain: 5.2,
  },
  gas_cylinders: {
    hp: 70,
    fuse: 1.1,
    size: 2.3,
    radius: 7.5,
    damage: 210,
    chain: 6,
  },
};

var Dz = [
  [-12, 6.5],
  [-5, 1.5],
  [9, 7],
  [13, 13],
  [-14, 13],
  [1, 20],
  [11, 21],
  [-20, 19],
  [19, 9],
  [21, -6],
  [24, 11],
  [-21, -5],
  [0, -14.5],
  [-11, -21],
  [9, -24.5],
];

var xh = Vector3;

function yE(n) {
  let e = new Group();
  ((e.name = "explosives"), n.scene.add(e));
  let t = [],
    i = new Map(),
    s = n.rng && n.rng.fork ? n.rng.fork() : Math.random,
    o = new Box3(),
    r = new Box3(),
    a = new xh(),
    l = new xh(),
    c = new xh(0, 1, 0);
  function u(v) {
    let y = null;
    try {
      y = n.props.build(v.name, {
        ...(v.opts || {}),
        ...(v.name === "barrel" ? { color: "red" } : {}),
      });
    } catch (M) {
      return (console.warn("[explosives] build failed: " + M), null);
    }
    (y.position.set(v.x, v.y || 0, v.z),
      (y.rotation.y = v.yaw || 0),
      e.add(y),
      y.updateMatrixWorld(!0),
      o.makeEmpty());
    let b = y.userData.colliders || [];
    for (let M of b)
      (r.min.fromArray(M.min),
        r.max.fromArray(M.max),
        r.applyMatrix4(y.matrixWorld),
        o.union(r));
    if (o.isEmpty()) {
      let M = y.userData.size || [0.6, 0.9, 0.6];
      (o.min.set(v.x - M[0] / 2, v.y || 0, v.z - M[2] / 2),
        o.max.set(v.x + M[0] / 2, (v.y || 0) + M[1], v.z + M[2] / 2));
    }
    let g = vE[v.name] || vE.barrel,
      E = {
        def: v,
        obj: y,
        inst: null,
        kind: v.name,
        spec: g,
        min: o.min.clone(),
        max: o.max.clone(),
        pos: o.getCenter(new xh()),
        hp: g.hp,
        fuse: -1,
        alive: !0,
        box: null,
        leak: new xh(),
        leakDir: new xh(0, 1, 0),
        tick: 0,
      };
    return (t.push(E), f(E), E);
  }
  function f(v) {
    v.box ||
      ((v.box = n.physics.addBox(v.min, v.max, {
        surface: "metal",
        tag: "explosive",
      })),
      i.set(v.box, v));
  }
  for (let v of (n.level && n.level.explosives) || []) u(v);
  try {
    let v = n.physics.nav,
      y = n.level && n.level.playerStart && n.level.playerStart.pos,
      b = (M, _) =>
        v.isWalkable(M, _) &&
        v.isWalkable(M + 0.3, _) &&
        v.isWalkable(M - 0.3, _) &&
        v.isWalkable(M, _ + 0.3) &&
        v.isWalkable(M, _ - 0.3),
      g = (M, _) =>
        M < 28 &&
        M > -37 &&
        Math.abs(_) < 27 &&
        (!v.isWalkable(M + 0.6, _) ||
          !v.isWalkable(M - 0.6, _) ||
          !v.isWalkable(M, _ + 0.6) ||
          !v.isWalkable(M, _ - 0.6)),
      E = 0;
    for (let [M, _] of Dz) {
      let T = null,
        w = 1e9;
      for (let I = -3; I <= 3; I += 0.5)
        for (let L = -3; L <= 3; L += 0.5) {
          let U = M + L,
            k = _ + I,
            C = L * L + I * I;
          if (
            C >= w ||
            !b(U, k) ||
            !g(U, k) ||
            (y && Math.hypot(U - y.x, k - y.z) < 7)
          )
            continue;
          let A = !1;
          for (let F of t)
            if (Math.hypot(F.pos.x - U, F.pos.z - k) < 1.1) {
              A = !0;
              break;
            }
          for (let F of (n.level && n.level.objectives) || [])
            F.pos && Math.hypot(F.pos.x - U, F.pos.z - k) < 2.2 && (A = !0);
          A || ((T = [U, k]), (w = C));
        }
      if (!T) continue;
      let [S, R] = T;
      v.isWalkable(S + 0.6, R)
        ? v.isWalkable(S - 0.6, R)
          ? v.isWalkable(S, R + 0.6)
            ? (R -= 0.2)
            : (R += 0.2)
          : (S -= 0.2)
        : (S += 0.2);
      let z =
        n.level &&
        n.level.interiorBoxes &&
        n.level.interiorBoxes[0] &&
        S > n.level.interiorBoxes[0].min.x &&
        S < n.level.interiorBoxes[0].max.x &&
        R > n.level.interiorBoxes[0].min.z &&
        R < n.level.interiorBoxes[0].max.z
          ? 0.03
          : 0;
      (u({
        name: "barrel",
        x: S,
        y: z,
        z: R,
        yaw: s() * 6.28,
        opts: { seed: 100 + (E % 2) },
      }),
        E++);
    }
  } catch (v) {
    console.warn(
      "[explosives] extra barrels skipped: " + ((v && v.message) || v),
    );
  }
  let h = new Matrix4().makeScale(0, 0, 0);
  try {
    let v = new Map();
    for (let y of t) {
      if ((y.obj.updateMatrixWorld(!0), y.kind !== "barrel")) {
        let b = batchStaticMeshes(y.obj);
        (e.remove(y.obj), e.add(b), (y.obj = b));
        continue;
      }
      ((y.inst = []),
        y.obj.traverse((b) => {
          if (!b.isMesh || Array.isArray(b.material)) return;
          let g = b.geometry.uuid + "|" + b.material.uuid,
            E = v.get(g);
          (E ||
            v.set(
              g,
              (E = {
                geo: b.geometry,
                mat: b.material,
                cast: b.castShadow,
                recv: b.receiveShadow,
                list: [],
              }),
            ),
            E.list.push({ it: y, m: b.matrixWorld.clone() }));
        }),
        e.remove(y.obj));
    }
    for (let y of v.values()) {
      let b = new InstancedMesh(y.geo, y.mat, y.list.length);
      ((b.castShadow = y.cast),
        (b.receiveShadow = y.recv),
        (b.frustumCulled = !1),
        y.list.forEach((g, E) => {
          (b.setMatrixAt(E, g.m), g.it.inst.push({ im: b, i: E, m: g.m }));
        }),
        (b.instanceMatrix.needsUpdate = !0),
        e.add(b));
    }
  } catch (v) {
    console.error(
      "[explosives] instancing failed, barrels stay as plain meshes: " +
        ((v && v.stack) || v),
    );
    for (let y of t) y.inst && ((y.inst = null), y.obj.parent || e.add(y.obj));
  }
  function p(v, y) {
    if (!v.inst) {
      v.obj.visible = y;
      return;
    }
    for (let b of v.inst)
      (b.im.setMatrixAt(b.i, y ? b.m : h),
        (b.im.instanceMatrix.needsUpdate = !0));
  }
  function d(v, y, b, g) {
    if (v.alive) {
      if (((v.hp -= y), v.hp <= 0)) {
        v.fuse = v.fuse < 0 ? 0.06 : Math.min(v.fuse, 0.06);
        return;
      }
      v.fuse < 0 &&
        ((v.fuse = v.spec.fuse),
        b
          ? (v.leak.copy(b),
            v.leakDir.set(b.x - v.pos.x, 0.35, b.z - v.pos.z).normalize())
          : (v.leak.copy(v.pos), (v.leak.y = v.max.y), v.leakDir.copy(c)),
        n.events.emit("explosive:lit", { pos: v.pos, kind: v.kind }));
    }
  }
  (n.events.on("impact", (v) => {
    let y = v && v.box && i.get(v.box);
    y &&
      d(
        y,
        v.from === "player" ? (n.weapon && n.weapon.damage) || 26 : 9,
        v.point,
        v.dir,
      );
  }),
    n.events.on("explosion", (v) => {
      if (!v || !v.pos) return;
      let y = 2.2 + (v.size || 1) * 1.6;
      for (let b of t) {
        if (!b.alive) continue;
        let g = b.pos.distanceTo(v.pos);
        if (g > y || g < 0.05) continue;
        let E = 0.14 + s() * 0.3 + g * 0.03;
        b.fuse = b.fuse < 0 ? E : Math.min(b.fuse, E);
      }
    }));
  function m(v) {
    ((v.alive = !1),
      (v.fuse = -1),
      p(v, !1),
      v.box && (n.physics.removeBox(v.box), i.delete(v.box), (v.box = null)));
    let y = v.spec;
    l.copy(v.pos);
    try {
      n.fx.explosion(l, y.size);
    } catch (g) {
      console.error("[explosives] fx.explosion threw", g);
    }
    try {
      n.fx.debris(l, {
        count: 14,
        color: v.kind === "barrel" ? 3804938 : 3159098,
        size: 0.09,
        speed: 9,
        spread: 1.4,
      });
    } catch {}
    try {
      n.combat.explode(l, y.radius, y.damage, "explosive");
    } catch (g) {
      console.error("[explosives] combat.explode threw", g);
    }
    let b = n.player;
    if (b && b.addShake) {
      let g = Math.max(0, 1 - b.pos.distanceTo(l) / 28);
      g > 0 && b.addShake(0.15 + 0.9 * g * g);
    }
    try {
      n.enemies.alert && n.enemies.alert(l, 60);
    } catch {}
    n.events.emit("explosive:blast", { pos: l, kind: v.kind });
  }
  return {
    items: t,
    root: e,
    count() {
      let v = 0;
      for (let y of t) y.alive && v++;
      return v;
    },
    reset() {
      for (let v of t)
        ((v.alive = !0), (v.hp = v.spec.hp), (v.fuse = -1), p(v, !0), f(v));
    },
    debugBlast(v = 0, y = !0) {
      let b = t.filter((E) => E.alive),
        g = b[v % Math.max(1, b.length)];
      return (g && (y ? m(g) : d(g, 1, null, null)), g ? g.pos.clone() : null);
    },
    update(v) {
      for (let y = 0; y < t.length; y++) {
        let b = t[y];
        if (!(!b.alive || b.fuse < 0)) {
          if (((b.fuse -= v), b.fuse <= 0)) {
            m(b);
            continue;
          }
          if (((b.tick -= v), b.tick <= 0)) {
            b.tick = 0.07;
            try {
              (n.fx.sparks(b.leak, b.leakDir, 3),
                n.fx.smoke(b.leak, {
                  size: 0.3,
                  life: 0.9,
                  rise: 1.4,
                  count: 1,
                  color: 1381653,
                  vel: a.copy(b.leakDir).multiplyScalar(1.5),
                }),
                n.render &&
                  n.render.lightPool &&
                  n.render.lightPool.flash(b.leak, 16742944, 5, 4, 0.09));
            } catch {}
          }
        }
      }
    },
  };
}

export { createCombat, yE };
