// Touch layout editor + gyro aim for tablets (iPad 3-4 finger play).
//
// Every touch button gets a corner anchor and an offset from that corner (px, plus the safe-area
// inset), so a layout keeps its shape when the iPad rotates or the window resizes. The editor is
// reached from the title screen and the pause menu ("Touch Layout"). Settings live in localStorage.
//
// Gyro aim reads DeviceMotionEvent.rotationRate (deg/s), maps it to the screen axes using the
// current orientation, and adds radians to input.look, the same units as stick/drag aiming.
// iOS only delivers motion on HTTPS pages and after DeviceMotionEvent.requestPermission(), which
// must run inside a tap; we ask when gyro is switched on and again on the first tap of a session.

const KEY = "saltline.touchLayout.v1";

// key -> label, default anchor/offset/size. dx/dy: distance from the anchored edges to the button centre.
const BUTTONS = {
  fire: { label: "FIRE", ax: "r", ay: "b", dx: 63, dy: 105, s: 86, on: true },
  fire2: { label: "FIRE 2", ax: "l", ay: "t", dx: 110, dy: 120, s: 80, on: false },
  ads: { label: "AIM", ax: "r", ay: "b", dx: 150, dy: 64, s: 60, on: true },
  jump: { label: "JUMP", ax: "r", ay: "b", dx: 50, dy: 194, s: 60, on: true },
  reload: { label: "RLD", ax: "r", ay: "b", dx: 135, dy: 153, s: 54, on: true },
  swap: { label: "SWAP", ax: "r", ay: "b", dx: 119, dy: 223, s: 54, on: true },
  crouch: { label: "CRCH", ax: "r", ay: "b", dx: 230, dy: 40, s: 54, on: false },
  interact: { label: "USE", ax: "r", ay: "b", dx: 220, dy: 130, s: 68, on: true },
  pause: { label: "II", ax: "r", ay: "t", dx: 33, dy: 33, s: 42, on: true, fixed: true },
};

// 4-finger preset: left thumb moves, right thumb looks, index fingers fire (top-left) and aim (top-right)
const PRESETS = {
  default: {},
  claw: {
    // below the objective / ammo HUD in the top corners
    fire2: { ax: "l", ay: "t", dx: 96, dy: 180, s: 96, on: true },
    ads: { ax: "r", ay: "t", dx: 110, dy: 240, s: 88, on: true },
    pause: { ax: "r", ay: "t", dx: 33, dy: 33 },
    crouch: { ax: "r", ay: "b", dx: 230, dy: 40, s: 58, on: true },
  },
};

const GLOBAL_DEFAULTS = {
  stickZone: 0.45,
  adsHold: false,
  opacity: 1,
  gyro: "off", // off | always | ads
  gyroSens: 1,
  gyroInvX: false,
  gyroInvY: false,
};

function defaults(preset = "default") {
  const b = {};
  for (const k in BUTTONS) {
    const { label, fixed, ...d } = BUTTONS[k];
    b[k] = { ...d, ...(PRESETS[preset][k] || {}) };
  }
  return { ...GLOBAL_DEFAULTS, buttons: b };
}

function load() {
  const d = defaults();
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || "null");
    if (j && typeof j === "object") {
      const out = { ...d, ...j, buttons: { ...d.buttons } };
      for (const k in d.buttons) if (j.buttons && j.buttons[k]) out.buttons[k] = { ...d.buttons[k], ...j.buttons[k] };
      return out;
    }
  } catch {}
  return d;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {}
}

let cfg = load();
let G = null;

// ------------------------------------------------------------------ styles
const css = document.createElement("style");
css.textContent = `
.touch .t-btn, .touch .t-ring, .touch .t-nub { border-radius: 0; }
.touch .t-btn.tl-off { display: none !important; }
.touch .t-fire2 { font-size: 14px; }
/* arena scoreboard sits on the pause button on touch: move it under the compass */
.is-touch .arena-board { right: auto !important; left: 50% !important; transform: translateX(-50%); top: calc(54px + var(--sat, 0px)) !important; }
html:not(.is-touch) [data-s="paused"] .tl-open { display: none; }
.tl { position: fixed; inset: 0; z-index: 9999; background: rgba(11,13,15,.62); color: var(--bone, #e8e4da);
  font: 500 13px/1.3 var(--f-label, system-ui); touch-action: none; user-select: none; -webkit-user-select: none; }
.tl * { border-radius: 0; box-sizing: border-box; }
.tl-zone { position: absolute; left: 0; top: 0; bottom: 0; border-right: 1.5px dashed rgba(232,228,218,.45); background: rgba(232,228,218,.05); }
.tl-zone span { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); opacity: .6; letter-spacing: .2em; font-size: 11px; white-space: nowrap; }
.tl-b { position: absolute; display: flex; align-items: center; justify-content: center; border: 1.5px solid rgba(232,228,218,.7);
  background: rgba(11,13,15,.55); font: 600 12px/1 var(--f-label, system-ui); letter-spacing: .12em; touch-action: none; cursor: grab; }
.tl-b.sel { border-color: var(--signal, #ffb347); color: var(--signal, #ffb347); background: rgba(255,179,71,.18); }
.tl-p { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: min(380px, calc(100vw - 32px)); max-height: calc(100vh - 32px);
  overflow: auto; background: rgba(11,13,15,.92); border: 1px solid rgba(232,228,218,.3); padding: 14px 16px; }
.tl-p h3 { margin: 0 0 8px; font: 600 12px/1 var(--f-label, system-ui); letter-spacing: .28em; text-transform: uppercase; color: var(--signal, #ffb347); }
.tl-p .tl-sec { border-top: 1px solid rgba(232,228,218,.15); margin-top: 10px; padding-top: 10px; }
.tl-row { display: flex; align-items: center; gap: 8px; margin: 6px 0; min-height: 30px; }
.tl-row > label { flex: 0 0 104px; opacity: .8; }
.tl-row input[type=range] { flex: 1; min-width: 0; }
.tl-row output { flex: 0 0 42px; text-align: right; font-variant-numeric: tabular-nums; }
.tl-seg { display: flex; flex: 1; flex-wrap: wrap; gap: 4px; }
.tl-seg button, .tl-act button { flex: 1; min-height: 32px; padding: 4px 8px; border: 1px solid rgba(232,228,218,.35); background: transparent; color: inherit; font: inherit; }
.tl-seg button.on { border-color: var(--signal, #ffb347); color: var(--signal, #ffb347); background: rgba(255,179,71,.14); }
.tl-act { display: flex; gap: 6px; margin-top: 12px; }
.tl-act button.pri { border-color: var(--signal, #ffb347); color: #0b0d0f; background: var(--signal, #ffb347); font-weight: 600; }
.tl-hint { opacity: .65; font-size: 11px; margin: 4px 0 0; }
.tl-p.min > :not(.tl-head) { display: none; }
.tl-head { display: flex; align-items: center; justify-content: space-between; }
.tl-head button { border: 1px solid rgba(232,228,218,.35); background: transparent; color: inherit; font: inherit; padding: 2px 10px; min-height: 28px; }
`;
document.head.appendChild(css);

// ------------------------------------------------------------------ apply to the real touch UI
function posStyle(el, b) {
  const h = b.s / 2;
  el.style.width = el.style.height = b.s + "px";
  el.style.left = b.ax === "l" ? `calc(${b.dx - h}px + var(--sal, 0px))` : "auto";
  el.style.right = b.ax === "r" ? `calc(${b.dx - h}px + var(--sar, 0px))` : "auto";
  el.style.top = b.ay === "t" ? `calc(${b.dy - h}px + var(--sat, 0px))` : "auto";
  el.style.bottom = b.ay === "b" ? `calc(${b.dy - h}px + var(--sab, 0px))` : "auto";
}

function apply() {
  if (G && G.input) {
    G.input.stickZone = cfg.stickZone;
    G.input.adsHold = cfg.adsHold;
  }
  const root = document.querySelector(".touch");
  if (!root) return;
  root.style.opacity = cfg.opacity;
  for (const k in BUTTONS) {
    const el = root.querySelector(".t-" + k);
    if (!el) continue;
    const b = cfg.buttons[k];
    posStyle(el, b);
    el.style.fontSize = Math.round(Math.max(9, Math.min(16, b.s / 6))) + "px";
    el.classList.toggle("tl-off", !BUTTONS[k].fixed && !b.on);
  }
}

// ------------------------------------------------------------------ editor
let ed = null;

function openEditor() {
  if (ed) return;
  const vw = () => innerWidth,
    vh = () => innerHeight;
  const ins = (() => {
    const s = getComputedStyle(document.documentElement);
    const v = (n) => parseFloat(s.getPropertyValue(n)) || 0;
    return { l: v("--sal"), r: v("--sar"), t: v("--sat"), b: v("--sab") };
  })();
  let sel = "fire";
  const root = document.createElement("div");
  root.className = "tl";
  root.innerHTML = `<div class="tl-zone"><span>MOVE STICK AREA</span></div><div class="tl-btns"></div>
  <div class="tl-p">
    <div class="tl-head"><h3>Touch Layout</h3><button data-x="min">Hide panel</button></div>
    <p class="tl-hint">Drag the squares to move them. Tap one to resize or hide it.</p>
    <div class="tl-sec">
      <div class="tl-row"><label>Selected</label><b data-f="sel"></b></div>
      <div class="tl-row"><label>Size</label><input type="range" min="36" max="150" step="2" data-k="size"><output data-o="size"></output></div>
      <div class="tl-row"><label>Show</label><div class="tl-seg" data-seg="show"><button data-v="1">On</button><button data-v="0">Off</button></div></div>
      <div class="tl-row"><label>Hidden</label><div class="tl-seg" data-f="hidden"></div></div>
    </div>
    <div class="tl-sec">
      <div class="tl-row"><label>Stick area</label><input type="range" min="0.2" max="0.6" step="0.01" data-k="stickZone"><output data-o="stickZone"></output></div>
      <div class="tl-row"><label>Aim button</label><div class="tl-seg" data-seg="adsHold"><button data-v="0">Toggle</button><button data-v="1">Hold</button></div></div>
      <div class="tl-row"><label>Opacity</label><input type="range" min="0.2" max="1" step="0.05" data-k="opacity"><output data-o="opacity"></output></div>
    </div>
    <div class="tl-sec">
      <div class="tl-row"><label>Gyro aim</label><div class="tl-seg" data-seg="gyro"><button data-v="off">Off</button><button data-v="always">Always</button><button data-v="ads">While aiming</button></div></div>
      <div class="tl-row"><label>Gyro speed</label><input type="range" min="0.2" max="3" step="0.05" data-k="gyroSens"><output data-o="gyroSens"></output></div>
      <div class="tl-row"><label>Invert gyro</label><div class="tl-seg" data-seg="inv"><button data-v="x">Left/Right</button><button data-v="y">Up/Down</button></div></div>
      <p class="tl-hint" data-f="gyroNote"></p>
    </div>
    <div class="tl-sec">
      <div class="tl-row"><label>Preset</label><div class="tl-seg" data-seg="preset"><button data-v="default">Default</button><button data-v="claw">4-finger</button></div></div>
    </div>
    <div class="tl-act"><button data-x="reset">Reset all</button><button class="pri" data-x="done">Done</button></div>
  </div>`;
  document.body.appendChild(root);
  const q = (s) => root.querySelector(s);
  const panel = q(".tl-p"),
    btns = q(".tl-btns");

  function draw() {
    q(".tl-zone").style.width = cfg.stickZone * 100 + "%";
    btns.innerHTML = "";
    for (const k in BUTTONS) {
      const b = cfg.buttons[k];
      if (!b.on && !BUTTONS[k].fixed) continue;
      const el = document.createElement("div");
      el.className = "tl-b" + (k === sel ? " sel" : "");
      el.dataset.k = k;
      el.textContent = BUTTONS[k].label;
      posStyle(el, b);
      el.style.fontSize = Math.round(Math.max(9, Math.min(16, b.s / 6))) + "px";
      btns.appendChild(el);
    }
    const b = cfg.buttons[sel];
    q('[data-f="sel"]').textContent = BUTTONS[sel].label;
    q('[data-k="size"]').value = b.s;
    q('[data-o="size"]').textContent = b.s;
    for (const k of ["stickZone", "opacity", "gyroSens"]) {
      q(`[data-k="${k}"]`).value = cfg[k];
      q(`[data-o="${k}"]`).textContent = k === "stickZone" ? Math.round(cfg[k] * 100) + "%" : (+cfg[k]).toFixed(2);
    }
    const seg = (name, v) => root.querySelectorAll(`[data-seg="${name}"] button`).forEach((x) => x.classList.toggle("on", v(x.dataset.v)));
    seg("show", (v) => (v === "1") === !!b.on);
    q('[data-seg="show"]').style.opacity = BUTTONS[sel].fixed ? 0.35 : 1;
    seg("adsHold", (v) => (v === "1") === !!cfg.adsHold);
    seg("gyro", (v) => v === cfg.gyro);
    seg("inv", (v) => (v === "x" ? cfg.gyroInvX : cfg.gyroInvY));
    seg("preset", () => false);
    const hidden = Object.keys(BUTTONS).filter((k) => !cfg.buttons[k].on && !BUTTONS[k].fixed);
    q('[data-f="hidden"]').innerHTML = hidden.length
      ? hidden.map((k) => `<button data-show="${k}">+ ${BUTTONS[k].label}</button>`).join("")
      : '<span style="opacity:.5">none</span>';
    q('[data-f="gyroNote"]').textContent = gyroNote();
  }

  function changed() {
    save();
    apply();
    draw();
  }

  // drag
  let drag = null;
  btns.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".tl-b");
    if (!el) return;
    e.preventDefault();
    sel = el.dataset.k;
    const r = el.getBoundingClientRect();
    drag = { el, k: sel, id: e.pointerId, ox: e.clientX - (r.left + r.width / 2), oy: e.clientY - (r.top + r.height / 2) };
    el.setPointerCapture(e.pointerId);
    btns.querySelectorAll(".tl-b").forEach((x) => x.classList.toggle("sel", x === el));
    draw();
    drag.el = btns.querySelector(`[data-k="${sel}"]`);
    drag.el.setPointerCapture(e.pointerId);
  });
  const move = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const b = cfg.buttons[drag.k],
      h = b.s / 2;
    const cx = Math.max(ins.l + h, Math.min(vw() - ins.r - h, e.clientX - drag.ox));
    const cy = Math.max(ins.t + h, Math.min(vh() - ins.b - h, e.clientY - drag.oy));
    // re-anchor to the nearest corner so the layout survives rotation
    b.ax = cx < vw() / 2 ? "l" : "r";
    b.ay = cy < vh() / 2 ? "t" : "b";
    b.dx = Math.round(b.ax === "l" ? cx - ins.l : vw() - ins.r - cx);
    b.dy = Math.round(b.ay === "t" ? cy - ins.t : vh() - ins.b - cy);
    posStyle(drag.el, b);
  };
  const up = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    changed();
  };
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", up);

  root.addEventListener("input", (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    if (k === "size") cfg.buttons[sel].s = +e.target.value;
    else cfg[k] = +e.target.value;
    changed();
  });
  root.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    e.stopPropagation();
    const seg = t.parentElement.dataset.seg,
      v = t.dataset.v;
    if (t.dataset.show) {
      cfg.buttons[t.dataset.show].on = true;
      sel = t.dataset.show;
    } else if (seg === "show") {
      if (!BUTTONS[sel].fixed) cfg.buttons[sel].on = v === "1";
    } else if (seg === "adsHold") cfg.adsHold = v === "1";
    else if (seg === "gyro") {
      cfg.gyro = v;
      if (v !== "off") askMotion();
    } else if (seg === "inv") {
      if (v === "x") cfg.gyroInvX = !cfg.gyroInvX;
      else cfg.gyroInvY = !cfg.gyroInvY;
    } else if (seg === "preset") {
      const keep = { ...cfg };
      cfg = { ...defaults(v), stickZone: keep.stickZone, adsHold: keep.adsHold, opacity: keep.opacity, gyro: keep.gyro, gyroSens: keep.gyroSens, gyroInvX: keep.gyroInvX, gyroInvY: keep.gyroInvY };
      if (v === "claw") sel = "fire2";
    } else if (t.dataset.x === "reset") {
      cfg = defaults();
      sel = "fire";
    } else if (t.dataset.x === "min") {
      panel.classList.toggle("min");
      t.textContent = panel.classList.contains("min") ? "Show panel" : "Hide panel";
      return;
    } else if (t.dataset.x === "done") return closeEditor();
    changed();
  });
  // keep the game from seeing editor touches
  for (const ev of ["touchstart", "touchmove", "touchend"]) root.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });
  const onResize = () => draw();
  addEventListener("resize", onResize);
  ed = { root, onResize };
  draw();
}

function closeEditor() {
  if (!ed) return;
  removeEventListener("resize", ed.onResize);
  ed.root.remove();
  ed = null;
  apply();
}

// ------------------------------------------------------------------ gyro
let motionState = typeof DeviceMotionEvent === "undefined" ? "none" : "unknown"; // none | unknown | granted | denied
let lastMotion = 0,
  sawMotion = false;

function gyroNote() {
  if (cfg.gyro === "off") return "Tilt the iPad to fine-tune aim. Needs the game opened over HTTPS.";
  if (motionState === "none" || !window.isSecureContext) return "Gyro is not available here: open the game over HTTPS (not http://LAN-IP).";
  if (motionState === "denied") return "Motion access was refused. Close Safari tabs for this site and allow it when asked.";
  if (!sawMotion) return "Waiting for motion data… (tap once in game if iOS asks for permission)";
  return "Gyro active.";
}

function askMotion() {
  if (motionState === "granted" || motionState === "none") return;
  const D = window.DeviceMotionEvent;
  if (D && typeof D.requestPermission === "function") {
    D.requestPermission()
      .then((r) => {
        motionState = r === "granted" ? "granted" : "denied";
        ed && ed.root.isConnected && openEditorRefresh();
      })
      .catch(() => {});
  } else motionState = "granted";
}
function openEditorRefresh() {
  const n = ed && ed.root.querySelector('[data-f="gyroNote"]');
  n && (n.textContent = gyroNote());
}

// iOS wants the permission request inside a tap; retry on taps until it is settled
addEventListener("touchend", () => cfg.gyro !== "off" && motionState === "unknown" && askMotion(), { capture: true, passive: true });

function orientationAngle() {
  const a = screen.orientation && typeof screen.orientation.angle === "number" ? screen.orientation.angle : window.orientation || 0;
  return ((a % 360) + 360) % 360;
}

addEventListener("devicemotion", (e) => {
  const now = performance.now();
  const dt = Math.min(0.1, lastMotion ? (now - lastMotion) / 1000 : 0);
  lastMotion = now;
  const r = e.rotationRate;
  if (!r || r.alpha == null) return;
  sawMotion = true;
  motionState = "granted";
  if (!G || cfg.gyro === "off" || !dt) return;
  const inp = G.input,
    st = G.game && G.game.state;
  if (st !== "playing" || !inp.touch || (cfg.gyro === "ads" && !inp.ads)) return;
  // device axes -> screen axes. look.dx > 0 turns right, look.dy > 0 looks down.
  const b = r.beta || 0,
    g = r.gamma || 0;
  let yaw, pitch;
  switch (orientationAngle()) {
    case 90:
      yaw = -b;
      pitch = g;
      break;
    case 270:
      yaw = b;
      pitch = -g;
      break;
    case 180:
      yaw = g;
      pitch = b;
      break;
    default:
      yaw = -g;
      pitch = -b;
  }
  const k = (Math.PI / 180) * dt * cfg.gyroSens;
  inp.look.dx += yaw * k * (cfg.gyroInvX ? -1 : 1);
  inp.look.dy += pitch * k * (cfg.gyroInvY ? -1 : 1);
});

// ------------------------------------------------------------------ hooks
// Safari pinch / double-tap zoom would steal a 3rd or 4th finger
document.addEventListener("gesturestart", (e) => e.preventDefault());

function menuButton(container, cls) {
  if (!container || container.querySelector(".tl-open")) return;
  const b = document.createElement("button");
  b.className = "btn tl-open " + (cls || "");
  b.textContent = "Touch Layout";
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    openEditor();
  });
  container.appendChild(b);
}

const coarse = () => (window.matchMedia && matchMedia("(pointer: coarse)").matches) || navigator.maxTouchPoints > 1;

function boot() {
  G = window.__G;
  if (!G || !G.input) return setTimeout(boot, 100);
  apply();
  // menus are built after __G appears (and may be rebuilt): keep the entry buttons in place
  const ensure = () => {
    if (coarse()) menuButton(document.querySelector(".m-title .m-actions"));
    menuButton(document.querySelector('[data-s="paused"] .m-actions'));
  };
  ensure();
  setInterval(ensure, 1000);
  G.events && G.events.on && G.events.on("input:device", () => setTimeout(apply, 0));
  // the touch UI is created on the first touch
  new MutationObserver(() => {
    const r = document.querySelector(".touch");
    if (r && !r.dataset.tl) {
      r.dataset.tl = "1";
      apply();
    }
  }).observe(document.getElementById("ui") || document.body, { childList: true });
}
boot();

window.__touchLayout = { open: openEditor, close: closeEditor, get cfg() { return cfg; }, apply };
