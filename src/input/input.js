// Ported from the newer Saltline bundle (input/input.js).

var KEY_BINDINGS = {
  KeyW: "forward",
  KeyS: "back",
  KeyA: "left",
  KeyD: "right",
  Space: "jump",
  ShiftLeft: "sprint",
  ShiftRight: "sprint",
  KeyC: "crouch",
  ControlLeft: "crouch",
  ControlRight: "crouch",
  KeyR: "reload",
  KeyE: "interact",
  KeyF: "melee",
  KeyV: "melee",
  Escape: "pause",
  KeyP: "pause",
  KeyQ: "swap",
  Digit1: "weapon1",
  Digit2: "weapon2",
  Numpad1: "weapon1",
  Numpad2: "weapon2",
  Enter: "fire",
  NumpadEnter: "fire",
  ArrowLeft: "turnL",
  ArrowRight: "turnR",
  ArrowUp: "turnU",
  ArrowDown: "turnD",
  KeyJ: "turnL",
  KeyL: "turnR",
  KeyI: "turnU",
  KeyK: "turnD",
};

var f_ = 0.0021;

var d_ = 0.0052;

var p_ = 2.1;

var m_ = 2.9;

var Rz = 1.75;

var Cz = 0.45;

var If = 58;

var g_ = {
  pause: 1,
};

function createInput(n) {
  let e =
      (n.renderer && n.renderer.domElement) || document.getElementById("view"),
    t = document.getElementById("ui"),
    i = new Set(),
    s = new Set(),
    o = {
      key: new Set(),
      mouse: new Set(),
      touch: new Set(),
      pad: new Set(),
    },
    r = !1,
    a = !1,
    l = 0,
    c = 0,
    u = 0,
    f = [],
    h = new Set(),
    p = !1;
  function d(ne) {
    if (m.device !== ne) {
      m.device = ne;
      try {
        document.documentElement.dataset.device = ne;
      } catch {}
      n.events.emit("input:device", { device: ne });
    }
  }
  let m = {
    move: { x: 0, y: 0 },
    look: { dx: 0, dy: 0 },
    fire: !1,
    ads: !1,
    sprint: !1,
    crouch: !1,
    locked: !1,
    touch: !1,
    gamepad: !1,
    sensitivity: 1,
    invertY: !1,
    mode: "lock",
    device: "kbm",
    assist: 1,
    padName: "",
    uiPressed(ne) {
      return h.has(ne);
    },
    rumble: Y,
    down(ne) {
      return i.has(ne) && (r || g_[ne] === 1);
    },
    pressed(ne) {
      return s.has(ne) && (r || g_[ne] === 1);
    },
    update: he,
    endFrame: V,
    requestLock: w,
    exitLock: S,
    setGameplay(ne) {
      ((ne = !!ne),
        ne !== r &&
          ((r = ne),
          ne || y(),
          R && R.root.classList.toggle("on", ne && m.touch)));
    },
    setPrompt(ne) {
      ((p = !!ne), R && R.btn.interact.classList.toggle("on", !!ne));
    },
    onModeChange(ne) {
      f.push(ne);
    },
    describeMode() {
      return m.mode === "touch"
        ? "Touch controls active"
        : m.device === "pad"
          ? "Controller active"
          : m.mode === "drag"
            ? "Mouse capture unavailable \u2014 move the mouse to look, rest it at a screen edge to keep turning \xB7 click fires \xB7 arrows or IJKL also turn"
            : m.locked
              ? "Mouse captured \u2014 Esc releases it"
              : "Click once to capture the mouse";
    },
  };
  function x(ne) {
    if (m.mode !== ne) {
      m.mode = ne;
      for (let ye of f)
        try {
          ye(ne);
        } catch (Te) {
          console.error(Te);
        }
    }
  }
  function v(ne, ye, Te) {
    if (!ye) return;
    let Re = o[ne];
    if (Te) {
      if (Re.has(ye)) return;
      (Re.add(ye), i.has(ye) || (i.add(ye), s.add(ye)));
    } else {
      if (!Re.delete(ye)) return;
      !o.key.has(ye) &&
        !o.mouse.has(ye) &&
        !o.touch.has(ye) &&
        !o.pad.has(ye) &&
        i.delete(ye);
    }
  }
  function y() {
    for (let ne in o) o[ne].clear();
    (i.clear(),
      (u = 0),
      (W = !1),
      R && (R.btn.ads.classList.remove("active"), oe(), (A = -1), (N = -1)));
  }
  (addEventListener("keydown", (ne) => {
    let ye = KEY_BINDINGS[ne.code];
    if (!ye) return;
    let Te = ne.target;
    (Te &&
      (Te.tagName === "INPUT" ||
        Te.tagName === "SELECT" ||
        Te.tagName === "TEXTAREA")) ||
      (Te &&
        Te.tagName === "BUTTON" &&
        (ne.code === "Space" ||
          ne.code === "Enter" ||
          ne.code === "NumpadEnter")) ||
      (r &&
        (ne.code === "Space" ||
          ne.code.startsWith("Arrow") ||
          ne.code === "ControlLeft") &&
        ne.preventDefault(),
      !ne.repeat && (d("kbm"), v("key", ye, !0)));
  }),
    addEventListener("keyup", (ne) => {
      v("key", KEY_BINDINGS[ne.code], !1);
    }),
    addEventListener("blur", () => {
      y();
    }));
  let b = (ne) =>
    ne === 0 ? "fire" : ne === 2 ? "ads" : ne === 1 ? "melee" : null;
  (e.addEventListener("mousedown", (ne) => {
    (m.touch && performance.now() - z < 800) ||
      (r &&
        (d("kbm"),
        !m.locked && m.mode === "lock" && w(),
        (u |= 1 << ne.button),
        v("mouse", b(ne.button), !0),
        ne.preventDefault()));
  }),
    addEventListener("mouseup", (ne) => {
      ((u &= ~(1 << ne.button)), v("mouse", b(ne.button), !1));
    }));
  let g = 0;
  (e.addEventListener(
    "wheel",
    (ne) => {
      if (!r) return;
      ne.preventDefault();
      let ye = performance.now();
      ye - g < 280 || Math.abs(ne.deltaY) < 1 || ((g = ye), s.add("swap"));
    },
    { passive: !1 },
  ),
    addEventListener("contextmenu", (ne) => {
      (ne.target === e || r) && ne.preventDefault();
    }),
    addEventListener("mousemove", (ne) => {
      if (
        r &&
        (m.locked ||
          ((E = ne.clientX / Math.max(1, innerWidth)),
          (M = ne.clientY / Math.max(1, innerHeight)),
          (_ = !0)),
        !m.touch || m.locked)
      ) {
        let ye = ne.movementX || 0,
          Te = ne.movementY || 0;
        if (Math.abs(ye) > 400 || Math.abs(Te) > 400) return;
        ((ye || Te) && d("kbm"),
          (m.look.dx += ye * f_ * m.sensitivity),
          (m.look.dy += Te * f_ * m.sensitivity * (m.invertY ? -1 : 1)));
      }
    }),
    document.addEventListener("pointerlockchange", () => {
      if (((m.locked = document.pointerLockElement === e), m.locked))
        ((a = !0), (l = 0), (c = 0), m.touch || x("lock"));
      else {
        (o.mouse.clear(), i.delete("fire"), i.delete("ads"));
        for (let ne of o.key) i.add(ne);
        u = 0;
      }
      n.events.emit("input:lock", { locked: m.locked });
    }),
    document.addEventListener("pointerlockerror", () => T()));
  let E = 0.5,
    M = 0.5,
    _ = !1;
  document.addEventListener("mouseleave", () => {
    _ = !1;
  });
  function T() {
    ((l = 0), !(m.locked || m.touch) && (c++, a || x("drag")));
  }
  function w() {
    if (!(m.touch || m.locked)) {
      if (!e.requestPointerLock) {
        T();
        return;
      }
      try {
        l = performance.now();
        let ne = e.requestPointerLock();
        ne && ne.catch && ne.catch(() => T());
      } catch {
        T();
      }
      try {
        e.focus({ preventScroll: !0 });
      } catch {}
    }
  }
  function S() {
    try {
      document.pointerLockElement && document.exitPointerLock();
    } catch {}
  }
  let R = null,
    z = 0,
    I = -1,
    L = 0,
    U = 0,
    k = 0,
    C = 0,
    A = -1,
    F = 0,
    H = 0,
    N = -1,
    Z = 0,
    Q = 0,
    W = !1;
  function J() {
    let ne = document.createElement("div");
    ((ne.className = "touch"),
      (ne.innerHTML =
        '<div class="t-stick"><i class="t-ring"></i><i class="t-nub"></i></div><button class="t-btn t-fire" data-a="fire" aria-label="Fire"><span>FIRE</span></button><button class="t-btn t-ads" data-a="ads" aria-label="Aim"><span>AIM</span></button><button class="t-btn t-reload" data-a="reload" aria-label="Reload"><span>RLD</span></button><button class="t-btn t-swap" data-a="swap" aria-label="Swap weapon"><span>SWAP</span></button><button class="t-btn t-jump" data-a="jump" aria-label="Jump"><span>JUMP</span></button><button class="t-btn t-interact" data-a="interact" aria-label="Interact"><span>USE</span></button><button class="t-btn t-pause" data-a="pause" aria-label="Pause"><span>II</span></button>'),
      t.appendChild(ne));
    let ye = (Re) => ne.querySelector(Re),
      Te = {
        root: ne,
        stick: ye(".t-stick"),
        nub: ye(".t-nub"),
        btn: {
          fire: ye(".t-fire"),
          ads: ye(".t-ads"),
          reload: ye(".t-reload"),
          swap: ye(".t-swap"),
          jump: ye(".t-jump"),
          interact: ye(".t-interact"),
          pause: ye(".t-pause"),
        },
      };
    for (let Re in Te.btn) {
      let Ue = Te.btn[Re];
      Ue.addEventListener(
        "touchstart",
        (ze) => {
          (ze.preventDefault(), ze.stopPropagation(), (z = performance.now()));
          let Ge = ze.changedTouches[0];
          if (Re === "ads") {
            ((W = !W), Ue.classList.toggle("active", W));
            return;
          }
          (Re === "fire" &&
            ((N = Ge.identifier), (Z = Ge.clientX), (Q = Ge.clientY)),
            Ue.classList.add("active"),
            v("touch", Re, !0));
        },
        { passive: !1 },
      );
      let Ve = (ze) => {
        if ((ze.preventDefault(), ze.stopPropagation(), Re !== "ads")) {
          if (Re === "fire") {
            let Ge = !1;
            for (let _e of ze.changedTouches) _e.identifier === N && (Ge = !0);
            if (!Ge) return;
            N = -1;
          }
          (Ue.classList.remove("active"), v("touch", Re, !1));
        }
      };
      (Ue.addEventListener("touchend", Ve, { passive: !1 }),
        Ue.addEventListener("touchcancel", Ve, { passive: !1 }),
        Ue.addEventListener(
          "touchmove",
          (ze) => {
            if ((ze.preventDefault(), Re === "fire"))
              for (let Ge of ze.changedTouches)
                Ge.identifier === N &&
                  (G(Ge.clientX - Z, Ge.clientY - Q),
                  (Z = Ge.clientX),
                  (Q = Ge.clientY));
          },
          { passive: !1 },
        ),
        Ue.addEventListener("contextmenu", (ze) => ze.preventDefault()));
    }
    return Te;
  }
  function G(ne, ye) {
    ((m.look.dx += ne * d_ * m.sensitivity),
      (m.look.dy += ye * d_ * m.sensitivity * (m.invertY ? -1 : 1)));
  }
  function te() {
    m.touch ||
      ((m.touch = !0),
      S(),
      R || (R = J()),
      R.root.classList.toggle("on", r),
      document.documentElement.classList.add("is-touch"),
      x("touch"),
      d("touch"));
  }
  function oe() {
    ((I = -1), (k = C = 0), R && R.stick.classList.remove("on"));
  }
  (addEventListener(
    "touchstart",
    () => {
      ((z = performance.now()), te());
    },
    { passive: !0, capture: !0 },
  ),
    e.addEventListener(
      "touchstart",
      (ne) => {
        if ((ne.preventDefault(), !!r))
          for (let ye of ne.changedTouches)
            ye.clientX < innerWidth * 0.45 && I < 0
              ? ((I = ye.identifier),
                (L = ye.clientX),
                (U = ye.clientY),
                (k = C = 0),
                R &&
                  ((R.stick.style.transform = `translate3d(${L}px,${U}px,0)`),
                  (R.nub.style.transform = "translate3d(0,0,0)"),
                  R.stick.classList.add("on")))
              : A < 0 &&
                ((A = ye.identifier), (F = ye.clientX), (H = ye.clientY));
      },
      { passive: !1 },
    ),
    e.addEventListener(
      "touchmove",
      (ne) => {
        if ((ne.preventDefault(), !!r))
          for (let ye of ne.changedTouches)
            if (ye.identifier === I) {
              let Te = ye.clientX - L,
                Re = ye.clientY - U,
                Ue = Math.hypot(Te, Re);
              (Ue > If && ((Te *= If / Ue), (Re *= If / Ue)),
                (k = Te / If),
                (C = -Re / If),
                R &&
                  (R.nub.style.transform = `translate3d(${Te.toFixed(1)}px,${Re.toFixed(1)}px,0)`));
            } else
              ye.identifier === A &&
                (G(ye.clientX - F, ye.clientY - H),
                (F = ye.clientX),
                (H = ye.clientY));
      },
      { passive: !1 },
    ));
  let ee = (ne) => {
    for (let ye of ne.changedTouches)
      ye.identifier === I ? oe() : ye.identifier === A && (A = -1);
  };
  (e.addEventListener("touchend", ee, { passive: !1 }),
    e.addEventListener("touchcancel", ee, { passive: !1 }));
  let le = {
      jump: [0],
      crouch: [1, 4],
      swap: [3, 12, 13],
      melee: [5, 11],
      ads: [6],
      fire: [7],
      pause: [9],
      weapon1: [14],
      weapon2: [15],
    },
    xe = {
      0: "accept",
      1: "back",
      9: "start",
      12: "up",
      13: "down",
      14: "left",
      15: "right",
    },
    j = typeof navigator < "u" && !!navigator.getGamepads,
    O = 0,
    q = 0,
    ue = null,
    de = 0,
    $ = !1,
    se = "",
    fe = new Uint8Array(20),
    me = 0,
    ge = 0,
    ce = 0,
    P = (ne, ye = 0.14) => {
      let Te = Math.abs(ne);
      return Te < ye ? 0 : (Math.sign(ne) * (Te - ye)) / (1 - ye);
    },
    D = (ne) => !!ne && (ne.pressed || ne.value > 0.35);
  (addEventListener("gamepadconnected", (ne) => {
    ((j = !0),
      (m.padName = (ne.gamepad && ne.gamepad.id) || "gamepad"),
      n.events.emit("input:pad", { connected: !0, name: m.padName }));
  }),
    addEventListener("gamepaddisconnected", () => {
      n.events.emit("input:pad", { connected: !1 });
    }));
  function B() {
    let ne;
    try {
      ne = navigator.getGamepads();
    } catch {
      return ((j = !1), null);
    }
    let ye = null;
    for (let Te = 0; ne && Te < ne.length; Te++) {
      let Re = ne[Te];
      if (!(
        !Re ||
        !Re.connected ||
        Re.buttons.length < 10 ||
        Re.axes.length < 4
      )) {
        if (Re.mapping === "standard") return Re;
        ye || (ye = Re);
      }
    }
    return ye;
  }
  function X() {
    ((m.gamepad = !1), (ue = null), ($ = !1), (se = ""), fe.fill(0));
    for (let ne of [...o.pad]) v("pad", ne, !1);
    m.device === "pad" && d("kbm");
  }
  function re(ne) {
    if (((O = q = 0), h.clear(), !j)) return;
    let ye = B();
    if (!ye) {
      m.gamepad && X();
      return;
    }
    ((ue = ye), (m.gamepad = !0));
    let Te = P(ye.axes[0] || 0),
      Re = P(ye.axes[1] || 0),
      Ue = P(ye.axes[2] || 0),
      Ve = P(ye.axes[3] || 0),
      ze = !!(Te || Re || Ue || Ve);
    if (((O = Te), (q = -Re), r)) {
      let _e = Math.min(1, Math.hypot(Ue, Ve));
      de = _e > 0.92 ? Math.min(1, de + ne / Cz) : Math.max(0, de - ne * 6);
      let Ne = _e > 0 ? (0.25 * _e + 0.75 * _e * _e * _e) / _e : 0,
        ke = m_ * (1 + (Rz - 1) * de) * Ne * m.assist * m.sensitivity * ne;
      ((m.look.dx += Ue * ke),
        (m.look.dy += Ve * ke * 0.62 * (m.invertY ? -1 : 1)),
        D(ye.buttons[10]) && ($ = !0),
        q < 0.55 && ($ = !1));
    } else $ = !1;
    for (let _e = 0; _e < ye.buttons.length && _e < 20; _e++) {
      let Ne = D(ye.buttons[_e]) ? 1 : 0;
      (Ne && !fe[_e] && ((ze = !0), !r && xe[_e] && h.add(xe[_e])),
        (fe[_e] = Ne));
    }
    let Ge = D(ye.buttons[2]);
    (Ge && !se && (se = p ? "interact" : "reload"),
      v("pad", "interact", Ge && se === "interact"),
      v("pad", "reload", Ge && se === "reload"),
      Ge || (se = ""));
    for (let _e in le) {
      let Ne = le[_e],
        ke = !1;
      for (let je = 0; je < Ne.length; je++) D(ye.buttons[Ne[je]]) && (ke = !0);
      v("pad", _e, ke);
    }
    if ((v("pad", "sprint", $), !r)) {
      let _e = Math.abs(Re) > 0.6 ? Math.sign(Re) : 0,
        Ne = performance.now();
      _e !== me
        ? ((me = _e), (ge = Ne + 380), _e && h.add(_e < 0 ? "up" : "down"))
        : _e && Ne > ge && ((ge = Ne + 170), h.add(_e < 0 ? "up" : "down"));
      let ke = Math.abs(Te) > 0.6 ? Math.sign(Te) : 0;
      ke !== ce && ((ce = ke), ke && h.add(ke < 0 ? "left" : "right"));
    }
    ze && d("pad");
  }
  function Y(ne = 0.5, ye = 0.5, Te = 80) {
    if (!(m.device !== "pad" || !ue))
      try {
        let Re = ue.vibrationActuator;
        if (Re && Re.playEffect) {
          let Ue = Re.playEffect("dual-rumble", {
            startDelay: 0,
            duration: Te,
            strongMagnitude: Math.min(1, ne),
            weakMagnitude: Math.min(1, ye),
          });
          Ue && Ue.catch && Ue.catch(() => {});
        }
      } catch {}
  }
  function he(ne) {
    if (
      (re(ne),
      l && performance.now() - l > 1200 && !m.locked && T(),
      r &&
        _ &&
        !m.locked &&
        !m.touch &&
        m.device === "kbm" &&
        (m.mode === "drag" || l === 0))
    ) {
      let Ue = E < 0.12 ? -(0.12 - E) / 0.12 : E > 0.88 ? (E - 0.88) / 0.12 : 0,
        Ve = M < 0.1 ? -(0.1 - M) / 0.1 : M > 0.9 ? (M - 0.9) / 0.1 : 0;
      ((m.look.dx += Ue * 2.4 * ne * m.sensitivity),
        (m.look.dy += Ve * 1.2 * ne * m.sensitivity * (m.invertY ? -1 : 1)));
    }
    let ye = 0,
      Te = 0,
      Re = !1;
    if (r) {
      ((ye = (i.has("right") ? 1 : 0) - (i.has("left") ? 1 : 0)),
        (Te = (i.has("forward") ? 1 : 0) - (i.has("back") ? 1 : 0)),
        (Re = i.has("sprint")),
        I >= 0 &&
          ((ye += k),
          (Te += C),
          Math.hypot(k, C) > 0.93 && C > 0.8 && (Re = !0)),
        (ye += O),
        (Te += q));
      let Ue = Math.hypot(ye, Te);
      Ue > 1 && ((ye /= Ue), (Te /= Ue));
      let Ve = (i.has("turnR") ? 1 : 0) - (i.has("turnL") ? 1 : 0),
        ze = (i.has("turnD") ? 1 : 0) - (i.has("turnU") ? 1 : 0);
      (Ve && (m.look.dx += Ve * p_ * ne),
        ze && (m.look.dy += ze * p_ * 0.6 * ne));
    }
    ((m.move.x = ye),
      (m.move.y = Te),
      (m.fire = r && i.has("fire")),
      (m.ads = r && (i.has("ads") || W)),
      (m.sprint = r && Re),
      (m.crouch = r && i.has("crouch")));
  }
  function V() {
    (s.clear(), (m.look.dx = 0), (m.look.dy = 0));
  }
  return m;
}

export { KEY_BINDINGS, createInput };
