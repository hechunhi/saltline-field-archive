// Ported from the newer Saltline bundle (ui/hud.js).
import { Vector3 } from "../vendor/three-r180.js";

var tx = 4;

var nx = -90;

var WC = 450;

var GC = {
  0: "N",
  45: "NE",
  90: "E",
  135: "SE",
  180: "S",
  225: "SW",
  270: "W",
  315: "NW",
};

var ix = 2 * Math.PI * 19;

function createElement(i, e, t) {
  let n = document.createElement(i);
  return (e && (n.className = e), t != null && (n.innerHTML = t), n);
}

function createHUD(n) {
  let e = document.getElementById("ui"),
    t = createElement("div", "hud");
  t.setAttribute("aria-hidden", "true");
  let i = createElement("div", "h-compass"),
    s = createElement("div", "h-tape"),
    o = "";
  for (let he = nx; he <= WC; he += 5) {
    let V = (he - nx) * tx,
      ne = ((he % 360) + 360) % 360,
      ye = ne % 45 === 0,
      Te = ne % 15 === 0;
    ((o += `<i class="${ye ? "mj" : Te ? "md" : "mn"}" style="left:${V}px"></i>`),
      ye
        ? (o += `<b class="${ne % 90 === 0 ? "card" : "ic"}" style="left:${V}px">${GC[ne]}</b>`)
        : ne % 15 === 0 &&
          (o += `<b class="num" style="left:${V}px">${String(ne).padStart(3, "0")}</b>`));
  }
  s.innerHTML = o;
  let r = createElement("div", "h-tape-wrap");
  r.appendChild(s);
  let a = createElement("div", "h-cmarks"),
    l = createElement("div", "h-heading", "000");
  i.append(r, createElement("i", "h-needle"), a, l);
  let c = createElement(
      "div",
      "h-obj",
      '<div class="h-k">Objective</div><div class="h-obj-t"></div><div class="h-relays"><span>Relays</span><i></i><i></i><i></i><b>0/3</b></div>',
    ),
    u = c.querySelector(".h-obj-t"),
    f = c.querySelector(".h-relays"),
    h = f.querySelector("b"),
    p = f.querySelector("span"),
    d = [...f.querySelectorAll("i")],
    m = createElement("div", "h-warn"),
    x = createElement(
      "div",
      "h-cross",
      '<i class="c-t"></i><i class="c-b"></i><i class="c-l"></i><i class="c-r"></i><i class="c-dot"></i>',
    ),
    v = x.querySelectorAll("i"),
    y = createElement("div", "h-hit", "<i></i><i></i><i></i><i></i>"),
    b = createElement("div", "h-arcs"),
    g = [];
  for (let he = 0; he < 4; he++) {
    let V = createElement(
      "div",
      "h-arc",
      '<svg viewBox="-100 -100 200 200"><path d="M -38 -84 A 92 92 0 0 1 38 -84" /><path class="tip" d="M -7 -97 L 0 -106 L 7 -97" /></svg>',
    );
    (b.appendChild(V),
      g.push({ el: V, life: 0, src: new Vector3(), op: -1, rot: 1e9 }));
  }
  let E = createElement(
      "div",
      "h-prompt",
      `<svg viewBox="-24 -24 48 48"><circle class="bg" r="19"/><circle class="fg" r="19" stroke-dasharray="${ix.toFixed(2)}" stroke-dashoffset="${ix.toFixed(2)}" transform="rotate(-90)"/></svg><span class="h-key">E</span><span class="h-plabel"></span>`,
    ),
    M = E.querySelector(".fg"),
    _ = E.querySelector(".h-key"),
    T = E.querySelector(".h-plabel"),
    w = createElement("div", "h-feed"),
    S = createElement("div", "h-msg"),
    R = createElement(
      "div",
      "h-health",
      '<div class="h-k">Vitals</div><div class="h-hp-row"><b class="h-hp-n">100</b><div class="h-hp-bar">' +
        "<i></i>".repeat(10) +
        "</div></div>",
    ),
    z = R.querySelector(".h-hp-n"),
    I = [...R.querySelectorAll(".h-hp-bar i")],
    L = createElement(
      "div",
      "h-ammo",
      '<div class="h-cue"></div><div class="h-ammo-row"><b class="h-ammo-n">30</b><span class="h-ammo-r">120</span></div><div class="h-pips"></div><div class="h-wname"></div><div class="h-alt"></div>',
    ),
    U = L.querySelector(".h-ammo-n"),
    k = L.querySelector(".h-ammo-r"),
    C = L.querySelector(".h-pips"),
    A = L.querySelector(".h-wname"),
    F = L.querySelector(".h-cue"),
    H = L.querySelector(".h-alt"),
    N = createElement("div", "h-marks");
  (t.append(N, i, c, m, b, x, y, E, w, S, R, L), e.appendChild(t));
  let Z = createElement(
    "div",
    "comms",
    '<span class="comms-who">Control</span><span class="comms-t"></span>',
  );
  (Z.setAttribute("role", "status"), Z.setAttribute("aria-live", "polite"));
  let Q = Z.querySelector(".comms-t");
  e.appendChild(Z);
  let W = !1,
    J = 420,
    G = innerWidth,
    te = innerHeight,
    oe = {
      ammo: -1,
      mag: -1,
      reserve: -1,
      name: null,
      cue: null,
      low: null,
      hp: -1,
      hpSeg: -1,
      hurt: null,
      head: -1,
      tapeX: 1e9,
      gap: -1,
      crossOn: null,
      promptOn: null,
      promptText: null,
      promptT: -1,
      promptKey: null,
      marksOn: null,
      done: -1,
      total: -1,
    },
    ee = [],
    le = "",
    xe = 0,
    j = 0,
    O = [],
    q = null,
    ue = 0,
    de = 0,
    $ = 0,
    se = 0,
    fe = 0,
    me = [],
    ge = [],
    ce = new Vector3(),
    P = null,
    D = -1;
  function B() {
    ((G = innerWidth),
      (te = innerHeight),
      (J = i.clientWidth || Math.min(420, G * 0.6)),
      (oe.tapeX = 1e9),
      (oe.gap = -1));
    for (let he of ge) ((he.lastC = 1e9), (he.lastW = ""));
  }
  (addEventListener("resize", B),
    n.events.on("player:hitEnemy", (he) => {
      (X.hitmarker(
        he && he.killed
          ? "kill"
          : he && (he.weak || he.part === "weak")
            ? "weak"
            : "hit",
      ),
        he &&
          he.killed &&
          he.weak &&
          P &&
          D === n.time.frame &&
          !P.weak &&
          ((P.weak = !0), (P.el.innerHTML += "<em>Weak point</em>")));
    }),
    n.events.on("enemy:killed", (he) => {
      let V = String(
        (he && (he.type || (he.enemy && he.enemy.type))) || "machine",
      ).toUpperCase();
      ((P = X.feed(`<b>${V}</b> destroyed`)), (D = n.time.frame));
    }),
    n.events.on("player:hit", (he) => {
      if (!he || !he.fromPos) return;
      let V = g[0];
      for (let ne of g) {
        if (ne.life <= 0) {
          V = ne;
          break;
        }
        ne.life < V.life && (V = ne);
      }
      (V.src.copy(he.fromPos), (V.life = 1.5), (V.max = 1.5));
    }));
  let X = {
    root: t,
    show(he) {
      ((he = !!he),
        he !== W && ((W = he), t.classList.toggle("on", he), he && B()));
    },
    setObjective(he) {
      ((he = he || ""),
        he !== le &&
          ((le = he),
          (xe = 0),
          (j = 0),
          (u.textContent = ""),
          c.classList.toggle("has", !!he),
          c.classList.remove("flash"),
          c.offsetWidth,
          c.classList.add("flash")));
    },
    setTally(he) {
      let V = he != null;
      (f.classList.toggle("tally", V), (p.textContent = V ? he : "Relays"));
    },
    setRelays(he, V) {
      if (!(he === oe.done && V === oe.total)) {
        if (V !== oe.total) {
          (d.forEach((ne) => ne.remove()), (d = []));
          for (let ne = 0; ne < V; ne++) {
            let ye = document.createElement("i");
            (f.insertBefore(ye, h), d.push(ye));
          }
        }
        ((oe.done = he),
          (oe.total = V),
          d.forEach((ne, ye) => ne.classList.toggle("cut", ye < he)),
          (h.textContent = `${he}/${V}`),
          f.classList.toggle("all", he >= V && V > 0));
      }
    },
    setMarkers(he) {
      for (let V of ge) (V.cEl.remove(), V.wEl.remove());
      ge = (he || []).map((V) => {
        let ne = createElement(
            "div",
            "h-cm " + (V.kind || "relay"),
            `<i></i><b>${V.short || ""}</b><span></span>`,
          ),
          ye = createElement(
            "div",
            "h-wm " + (V.kind || "relay"),
            `<i></i><b>${V.short || ""}</b><span></span>`,
          );
        return (
          a.appendChild(ne),
          N.appendChild(ye),
          {
            ...V,
            cEl: ne,
            wEl: ye,
            cDist: ne.querySelector("span"),
            wDist: ye.querySelector("span"),
            lastD: -1,
            lastC: 1e9,
            lastW: "",
            vis: null,
          }
        );
      });
    },
    setPrompt(he, V = 0) {
      let ne = !!he;
      if (
        (ne !== oe.promptOn &&
          ((oe.promptOn = ne),
          E.classList.toggle("on", ne),
          n.input.setPrompt && n.input.setPrompt(ne)),
        !ne)
      )
        return;
      let ye = n.input.touch ? "USE" : n.input.device === "pad" ? "X" : "E";
      ye !== oe.promptKey &&
        ((oe.promptKey = ye),
        (_.textContent = ye),
        _.classList.toggle("wide", ye.length > 1));
      let Te = `Hold ${ye} \u2014 ${he}`;
      Te !== oe.promptText && ((oe.promptText = Te), (T.textContent = Te));
      let Re = Math.round(V * 200) / 200;
      Re !== oe.promptT &&
        ((oe.promptT = Re),
        M.setAttribute("stroke-dashoffset", (ix * (1 - Re)).toFixed(2)),
        E.classList.toggle("busy", Re > 0));
    },
    radio(he, V = 4.5) {
      he && O.push({ text: he, secs: V });
    },
    clearRadio() {
      ((O.length = 0), (q = null), Z.classList.remove("on"));
    },
    warn(he, V = 3) {
      ((m.textContent = he),
        (se = V),
        m.classList.remove("on"),
        m.offsetWidth,
        m.classList.add("on"));
    },
    message(he, V = 3) {
      ((S.textContent = he || ""),
        (fe = he ? V : 0),
        S.classList.toggle("on", !!he));
    },
    feed(he) {
      let V = createElement("div", "h-fl", he);
      w.appendChild(V);
      let ne = { el: V, life: 4.2, weak: !1 };
      for (me.push(ne); me.length > 4;) me.shift().el.remove();
      return ne;
    },
    hitmarker(he = "hit") {
      y.className = "h-hit " + he;
      let V = he === "weak" || he === "kill" ? 1.5 : 1.15;
      try {
        y.animate(
          [
            { opacity: 1, transform: `translate(-50%,-50%) scale(${V})` },
            {
              opacity: 1,
              transform: "translate(-50%,-50%) scale(1)",
              offset: 0.35,
            },
            { opacity: 0, transform: "translate(-50%,-50%) scale(0.92)" },
          ],
          { duration: he === "kill" ? 420 : 240, easing: "ease-out" },
        );
      } catch {}
    },
    reset() {
      ((O.length = 0), (q = null), Z.classList.remove("on"));
      for (let he of me) he.el.remove();
      me.length = 0;
      for (let he of g) he.life = 0;
      ((se = 0),
        m.classList.remove("on"),
        X.message(""),
        X.setPrompt(null),
        X.setObjective(""),
        (oe.hp = -1));
    },
    update: re,
  };
  function re(he) {
    if ((Y(he), !W)) return;
    let V = n.player,
      ne = n.weapon || {},
      ye = n.camera,
      Te = V.ads || 0,
      Re = ((-V.yaw * 180) / Math.PI) % 360;
    Re < 0 && (Re += 360);
    let Ue = Math.round((J / 2 - (Re - nx) * tx) * 2) / 2;
    Ue !== oe.tapeX &&
      ((oe.tapeX = Ue), (s.style.transform = `translate3d(${Ue}px,0,0)`));
    let Ve = Math.round(Re) % 360;
    Ve !== oe.head &&
      ((oe.head = Ve), (l.textContent = String(Ve).padStart(3, "0")));
    let ze = Te < 0.5;
    if (
      (ze !== oe.marksOn && ((oe.marksOn = ze), N.classList.toggle("off", !ze)),
      ge.length)
    ) {
      (ye.updateMatrixWorld(),
        ye.matrixWorldInverse.copy(ye.matrixWorld).invert());
      let $e = J / 2 - 14;
      for (let Ke of ge) {
        let Bt = Ke.pos.x - V.pos.x,
          Gt = Ke.pos.z - V.pos.z,
          vi = Math.round(Math.hypot(Bt, Gt));
        if (vi !== Ke.lastD) {
          Ke.lastD = vi;
          let oi = vi + "m";
          ((Ke.cDist.textContent = oi), (Ke.wDist.textContent = oi));
        }
        let q0 = (Math.atan2(Bt, -Gt) * 180) / Math.PI - Re;
        q0 = ((q0 + 540) % 360) - 180;
        let yi = Math.round(Math.max(-$e, Math.min($e, q0 * tx)));
        (yi !== Ke.lastC &&
          ((Ke.lastC = yi),
          (Ke.cEl.style.transform = `translate3d(${yi}px,0,0)`),
          Ke.cEl.classList.toggle("edge", Math.abs(yi) >= $e)),
          ce
            .set(
              Ke.pos.x,
              Ke.pos.y + (Ke.kind === "extract" ? 1.2 : 1.9),
              Ke.pos.z,
            )
            .project(ye));
        let sn,
          P0,
          $t = !1;
        if (
          (ce.z > 1 && (($t = !0), (ce.x = -ce.x), (ce.y = -ce.y)),
          $t || Math.abs(ce.x) > 0.9 || Math.abs(ce.y) > 0.82)
        ) {
          $t = !0;
          let oi = Math.max(Math.abs(ce.x) / 0.9, Math.abs(ce.y) / 0.82, 0.001);
          if (((ce.x /= oi), (ce.y /= oi), ce.z > 1)) {
            let xn = Math.max(Math.abs(ce.x) / 0.9, Math.abs(ce.y) / 0.82);
            xn < 0.999 && ((ce.x /= xn), (ce.y /= xn));
          }
        }
        ((sn = Math.round((ce.x * 0.5 + 0.5) * G)),
          (P0 = Math.round((-ce.y * 0.5 + 0.5) * te)));
        let Sn = !$t && Math.hypot(ce.x, ce.y * 0.6) < 0.16,
          bi =
            sn +
            "," +
            P0 +
            ($t ? "o" : "") +
            (vi < 3 ? "n" : "") +
            (Sn ? "d" : "");
        bi !== Ke.lastW &&
          ((Ke.lastW = bi),
          (Ke.wEl.style.transform = `translate3d(${sn}px,${P0}px,0)`),
          Ke.wEl.classList.toggle("offscreen", $t),
          Ke.wEl.classList.toggle("near", vi < 3),
          Ke.wEl.classList.toggle("dim", Sn));
      }
    }
    let Ge = Te <= 0.6 && V.alive && ne.state !== "reloading_hidden";
    if (
      (Ge !== oe.crossOn && ((oe.crossOn = Ge), x.classList.toggle("off", !Ge)),
      Ge)
    ) {
      let $e = typeof ne.spread == "number" ? ne.spread : 0.012,
        Ke = (ye.fov * Math.PI) / 360,
        Bt =
          (Math.tan($e) / Math.tan(Ke)) * (te / 2) + 4 + (V.sprinting ? 10 : 0);
      ((Bt = Math.round(Math.max(4, Math.min(70, Bt)) * 2) / 2),
        Bt !== oe.gap &&
          ((oe.gap = Bt),
          (v[0].style.transform = `translate3d(-50%,${-Bt}px,0) translateY(-100%)`),
          (v[1].style.transform = `translate3d(-50%,${Bt}px,0)`),
          (v[2].style.transform = `translate3d(${-Bt}px,-50%,0) translateX(-100%)`),
          (v[3].style.transform = `translate3d(${Bt}px,-50%,0)`)));
    }
    let _e = Math.max(1, Math.min(60, ne.magSize | 0 || 30)),
      Ne = Math.max(0, ne.ammo | 0),
      ke = ne.reserve === 1 / 0 ? 9999 : Math.max(0, ne.reserve | 0);
    if (
      (_e !== oe.mag &&
        ((oe.mag = _e),
        (C.innerHTML = "<i></i>".repeat(_e)),
        (ee = [...C.children]),
        (oe.ammo = -1)),
      Ne !== oe.ammo)
    ) {
      ((oe.ammo = Ne), (U.textContent = String(Ne).padStart(2, "0")));
      for (let $e = 0; $e < ee.length; $e++)
        ee[$e].className = $e < Ne ? "" : "off";
    }
    (ke !== oe.reserve &&
      ((oe.reserve = ke),
      (k.textContent = ke >= 9999 ? "\u221E" : String(ke).padStart(3, "0"))),
      ne.name !== oe.name &&
        ((oe.name = ne.name), (A.textContent = ne.name || "")));
    let je = "";
    if (ne.slots && ne.slots.length > 1) {
      let $e = ne.slots[0].id === ne.current ? ne.slots[1] : ne.slots[0],
        Ke = n.input.device;
      je =
        (Ke === "pad"
          ? "<kbd>Y</kbd>"
          : Ke === "touch" || n.input.touch
            ? ""
            : "<kbd>Q</kbd>") +
        `<b>${$e.name || ""}</b> ${String(Math.max(0, $e.ammo | 0)).padStart(2, "0")} / ${$e.reserve === 1 / 0 ? "\u221E" : Math.max(0, $e.reserve | 0)}`;
    }
    je !== oe.alt && ((oe.alt = je), (H.innerHTML = je));
    let Ze = Ne <= Math.ceil(_e * 0.27),
      qe =
        ne.state === "reloading"
          ? "Reloading"
          : ne.state === "switching"
            ? ""
            : Ne === 0
              ? ke > 0
                ? n.input.touch
                  ? "Reload"
                  : n.input.device === "pad"
                    ? "X \u2014 Reload"
                    : "R \u2014 Reload"
                : ne.slots && ne.slots.length > 1
                  ? n.input.device === "pad"
                    ? "Empty \u2014 Y swaps"
                    : n.input.touch
                      ? "Empty \u2014 swap"
                      : "Empty \u2014 Q swaps"
                  : "Empty"
              : Ze
                ? "Low ammo"
                : "";
    (qe !== oe.cue &&
      ((oe.cue = qe),
      (F.textContent = qe),
      (F.className =
        "h-cue" +
        (qe ? " on" : "") +
        (Ne === 0 && ne.state !== "reloading" ? " urgent" : ""))),
      Ze !== oe.low && ((oe.low = Ze), L.classList.toggle("low", Ze)));
    let Oe = Math.max(0, Math.ceil(V.health)),
      mt = V.health < V.maxHealth - 0.5;
    if (Oe !== oe.hp) {
      ((oe.hp = Oe), (z.textContent = String(Oe)));
      let $e = Math.ceil((Oe / V.maxHealth) * I.length);
      if ($e !== oe.hpSeg) {
        oe.hpSeg = $e;
        for (let Ke = 0; Ke < I.length; Ke++)
          I[Ke].className = Ke < $e ? "" : "off";
        R.classList.toggle("crit", $e <= 3);
      }
    }
    mt !== oe.hurt && ((oe.hurt = mt), R.classList.toggle("on", mt));
    for (let $e of g) {
      if ($e.life <= 0) {
        $e.op !== 0 && (($e.op = 0), ($e.el.style.opacity = "0"));
        continue;
      }
      $e.life -= he;
      let Ke = Math.atan2($e.src.x - V.pos.x, -($e.src.z - V.pos.z)) + V.yaw,
        Bt = Math.round((Ke * 180) / Math.PI);
      Bt !== $e.rot &&
        (($e.rot = Bt),
        ($e.el.style.transform = `translate(-50%,-50%) rotate(${Bt}deg)`));
      let Gt = Math.round(Math.min(1, Math.max(0, $e.life / 0.6)) * 20) / 20;
      Gt !== $e.op && (($e.op = Gt), ($e.el.style.opacity = String(Gt)));
    }
    if (xe < le.length) {
      j += he * 46;
      let $e = Math.min(le.length, Math.floor(j));
      $e !== xe && ((xe = $e), (u.textContent = le.slice(0, $e)));
    }
    (se > 0 && ((se -= he), se <= 0 && m.classList.remove("on")),
      fe > 0 && ((fe -= he), fe <= 0 && S.classList.remove("on")));
    for (let $e = me.length - 1; $e >= 0; $e--) {
      let Ke = me[$e];
      ((Ke.life -= he),
        Ke.life <= 0
          ? (Ke.el.remove(), me.splice($e, 1))
          : Ke.life < 0.6 &&
            !Ke.out &&
            ((Ke.out = !0), Ke.el.classList.add("out")));
    }
  }
  function Y(he) {
    if (!q) {
      if (!O.length) return;
      ((q = O.shift()),
        (ue = 0),
        (de = 0),
        ($ = q.secs),
        (Q.textContent = ""),
        Z.classList.add("on"),
        n.events.emit("radio:line", { text: q.text }));
    }
    let V = q.text;
    if (ue < V.length) {
      de += he * 58;
      let ne = Math.min(V.length, Math.floor(de));
      ne !== ue && ((ue = ne), (Q.textContent = V.slice(0, ne)));
    } else
      (($ -= he), $ <= 0 && ((q = null), O.length || Z.classList.remove("on")));
  }
  return (B(), X);
}

var oT = "legacy-v8";

function rT() {
  return !!document.getElementById(oT);
}

function aT(n) {
  let e = document.getElementById(oT);
  if (!e) return !1;
  let t = atob(e.textContent.replace(/\s+/g, "")),
    i = new Uint8Array(t.length);
  for (let o = 0; o < t.length; o++) i[o] = t.charCodeAt(o);
  let s = new TextDecoder("utf-8").decode(i);
  n.dead = !0;
  try {
    n.renderer.setAnimationLoop(null);
  } catch {}
  try {
    n.audio && n.audio.ctx && n.audio.ctx.close && n.audio.ctx.close();
  } catch {}
  try {
    document.pointerLockElement && document.exitPointerLock();
  } catch {}
  try {
    n.renderer.forceContextLoss();
  } catch {}
  return (document.open(), document.write(s), document.close(), !0);
}

export { aT, createElement, createHUD, rT };
