// Ported from the newer Saltline bundle (ui/menus.js).
import { PLAYER_DIMENSIONS, QUALITY_PRESETS } from "../core/config.js";
import { aT, rT } from "./hud.js";

var SETTINGS_KEY = "saltline.settings.v1";

var DEFAULT_SETTINGS = {
  quality: "auto",
  sens: 1,
  invertY: !1,
  volume: 0.8,
  fov: PLAYER_DIMENSIONS.fov,
  difficulty: "hard",
  mode: "mission",
  view: 1,
};

var cT = [
  [1, "Close"],
  [2, "Three-quarter"],
  [3, "Compact"],
];

var uT = [
  ["mission", "Mission"],
  ["holdout", "Holdout"],
];

var nL = {
  mission: "Cut three relays and reach the boat. About five minutes.",
  holdout:
    "Endless waves that keep growing. Resupply between waves. How long can you hold?",
};

var ab_2 = [
  ["standard", "Standard"],
  ["hard", "Hard"],
  ["brutal", "Brutal"],
];

var QUALITY_NAMES = ["low", "medium", "high", "ultra"];

function loadSettings() {
  let n = { ...DEFAULT_SETTINGS };
  try {
    let e = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    e &&
      typeof e == "object" &&
      ((e.quality === "auto" || QUALITY_NAMES.includes(e.quality)) &&
        (n.quality = e.quality),
      Number.isFinite(e.sens) && (n.sens = Math.min(3, Math.max(0.2, e.sens))),
      (n.invertY = !!e.invertY),
      Number.isFinite(e.volume) &&
        (n.volume = Math.min(1, Math.max(0, e.volume))),
      Number.isFinite(e.fov) && (n.fov = Math.min(95, Math.max(60, e.fov))),
      ab_2.some((t) => t[0] === e.difficulty) && (n.difficulty = e.difficulty),
      uT.some((t) => t[0] === e.mode) && (n.mode = e.mode),
      cT.some((t) => t[0] === e.view) && (n.view = e.view));
  } catch {}
  return n;
}

function saveSettings(i) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(i));
  } catch {}
}

var KEYBOARD_CONTROLS_HTML = `
  <dl class="keys">
    <div><dt>Move</dt><dd><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dd></div>
    <div><dt>Look</dt><dd>Mouse</dd></div>
    <div><dt>Fire</dt><dd>Left button</dd></div>
    <div><dt>Aim</dt><dd>Right button</dd></div>
    <div><dt>Reload</dt><dd><kbd>R</kbd></dd></div>
    <div><dt>Swap weapon</dt><dd><kbd>Q</kbd>, wheel, or <kbd>1</kbd> <kbd>2</kbd></dd></div>
    <div><dt>Cut relay</dt><dd>Hold <kbd>E</kbd></dd></div>
    <div><dt>Jump</dt><dd><kbd>Space</kbd></dd></div>
    <div><dt>Sprint</dt><dd><kbd>Shift</kbd></dd></div>
    <div><dt>Crouch</dt><dd><kbd>C</kbd> or <kbd>Ctrl</kbd></dd></div>
    <div><dt>Melee</dt><dd><kbd>F</kbd></dd></div>
    <div><dt>Pause</dt><dd><kbd>Esc</kbd> or <kbd>P</kbd></dd></div>
  </dl>`;

var oL = `
  <dl class="keys">
    <div><dt>Move \xB7 Look</dt><dd>Left stick \xB7 Right stick</dd></div>
    <div><dt>Fire \xB7 Aim</dt><dd><kbd>RT</kbd> \xB7 <kbd>LT</kbd></dd></div>
    <div><dt>Reload</dt><dd><kbd>X</kbd></dd></div>
    <div><dt>Cut relay</dt><dd>Hold <kbd>X</kbd> at a relay</dd></div>
    <div><dt>Swap weapon</dt><dd><kbd>Y</kbd> or D-pad</dd></div>
    <div><dt>Jump</dt><dd><kbd>A</kbd></dd></div>
    <div><dt>Crouch</dt><dd><kbd>B</kbd> or <kbd>LB</kbd></dd></div>
    <div><dt>Sprint</dt><dd>Click the left stick</dd></div>
    <div><dt>Melee</dt><dd><kbd>RB</kbd> or click the right stick</dd></div>
    <div><dt>Pause</dt><dd><kbd>Start</kbd></dd></div>
  </dl>`;

var TOUCH_CONTROLS_HTML = `
  <dl class="keys">
    <div><dt>Move</dt><dd>Left thumb, anywhere</dd></div>
    <div><dt>Look</dt><dd>Drag the right side</dd></div>
    <div><dt>Fire</dt><dd>Hold FIRE, drag to track</dd></div>
    <div><dt>Aim</dt><dd>AIM toggles</dd></div>
    <div><dt>Reload</dt><dd>RLD</dd></div>
    <div><dt>Jump</dt><dd>JUMP</dd></div>
    <div><dt>Cut relay</dt><dd>Hold USE at a relay</dd></div>
    <div><dt>Sprint</dt><dd>Push the stick fully forward</dd></div>
  </dl>`;

function createMenus(n, e) {
  let t = document.getElementById("ui"),
    i = loadSettings(),
    s = document.createElement("div");
  ((s.className = "menu"),
    (s.dataset.screen = "none"),
    (s.innerHTML = `
    <div class="m-veil"></div>
    <div class="m-bars"><i></i><i></i></div>

    <section class="m-screen m-title" data-s="title" aria-label="Saltline">
      <div class="m-title-main">
        <div class="m-eyebrow"><span class="m-tag">B4</span><span>Port Authority Breach Unit</span><span class="m-dim">Saltline Terminal \xB7 05:42</span></div>
        <h1 class="m-word">SALTLINE</h1>
        <p class="m-premise">The port\u2019s security net has gone feral. Cut its three uplinks. Reach the boat.</p>
        <div class="m-actions">
          <button class="btn primary" data-act="deploy">Deploy</button>
          <button class="btn" data-act="settings">Settings</button>
          <button class="btn m-only-narrow" data-act="controls">Controls</button>
        </div>
        <div class="m-pick">
          <label id="l-tm">Mode</label><div class="seg" role="group" aria-labelledby="l-tm">${uT.map((W) => `<button data-m="${W[0]}" aria-pressed="false">${W[1]}</button>`).join("")}</div>
          <label id="l-td">Difficulty</label><div class="seg" role="group" aria-labelledby="l-td">${ab_2.map((W) => `<button data-d="${W[0]}" aria-pressed="false">${W[1]}</button>`).join("")}</div>
          <div class="m-pick-note" data-f="modenote"></div>
        </div>
        <p class="m-note">Every surface, machine and sound is generated in your browser. Nothing is downloaded.</p>
      </div>
      <aside class="m-legend" aria-label="Controls at a glance">
        <div><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</span><span><kbd>Mouse</kbd> Look</span><span><kbd>LMB</kbd> Fire</span><span><kbd>RMB</kbd> Aim</span><span><kbd>R</kbd> Reload</span></div>
        <div><span><kbd>Q</kbd> Sidearm</span><span><kbd>E</kbd> Cut relay</span><span><kbd>Space</kbd> Jump</span><span><kbd>Shift</kbd> Sprint</span><span><kbd>C</kbd> Crouch</span><span><kbd>Esc</kbd> Pause</span></div>
        <div class="lg-pad"><em>Controller</em><span>Sticks move and look</span><span><kbd>RT</kbd> Fire</span><span><kbd>LT</kbd> Aim</span><span><kbd>X</kbd> Reload / cut</span><span><kbd>Y</kbd> Sidearm</span><span><kbd>A</kbd> Deploy</span></div>
        <div class="lg-touch"><em>Touch</em><span>Left thumb moves</span><span>Right thumb looks</span><span>Fire \xB7 Aim \xB7 Reload \xB7 Jump on screen</span></div>
      </aside>
      <aside class="m-callout" aria-label="A note from Felix" hidden>
        <button class="m-callout-tab" data-act="note" aria-expanded="false">A note from Felix</button>
        <div class="m-callout-body">
          <button class="m-callout-x" data-act="note" aria-label="Dismiss this note">&times;</button>
          <p>Hi, Felix here. People online were impressed with the one-shotted version of this game - Claude Fable 5.2 built something pretty good without any human feedback. However, I really wanted to fix the weapon models, sounds, and some gameplay work. I spent an additional two hours to improve this game.</p>
          <p>If you'd rather see the first version that didn't receive any human feedback, click here:</p>
          <a class="btn small" href="https://claude.ai/artifact/2UXyB49DrVHFfhTMdNDFTA" style="display:flex;align-items:center;justify-content:center;text-align:center;padding-left:18px;padding-right:18px;text-decoration:none">See the one-shotted version</a>
        </div>
      </aside>
    </section>

    <section class="m-screen m-card" data-s="paused" aria-label="Paused">
      <div class="m-k">Operation on hold</div>
      <h2 class="m-h">Paused</h2>
      <p class="m-line" data-f="lookmode"></p>
      <div class="m-actions col">
        <button class="btn primary" data-act="resume">Resume</button>
        <button class="btn" data-act="settings">Settings</button>
        <button class="btn" data-act="controls">Controls</button>
        <button class="btn" data-act="restart">Restart mission</button>
      </div>
    </section>

    <section class="m-screen m-card m-dead" data-s="dead" aria-label="Signal lost">
      <div class="m-k">Breacher down</div>
      <h2 class="m-h">Signal lost</h2>
      <dl class="m-stats"><div><dt>Time survived</dt><dd data-f="dead-time">00:00</dd></div><div data-only="mission"><dt>Relays cut</dt><dd data-f="dead-relays">0/3</dd></div><div data-only="holdout"><dt>Waves cleared</dt><dd data-f="dead-wave">0</dd></div><div data-only="holdout"><dt>Machines destroyed</dt><dd data-f="dead-kills">0</dd></div><div data-only="holdout"><dt>Score</dt><dd data-f="dead-score">0</dd></div><div data-only="holdout"><dt>Best</dt><dd data-f="dead-best">0</dd></div></dl>
      <div class="m-actions col"><button class="btn primary" data-act="retry">Retry</button></div>
    </section>

    <section class="m-screen m-card m-debrief" data-s="complete" aria-label="Debrief">
      <div class="m-k">Berth 4 \xB7 Debrief</div>
      <h2 class="m-h">Saltline is dark</h2>
      <div class="m-rating"><span>Rating</span><b data-f="rating">Clean</b></div>
      <dl class="m-stats">
        <div><dt>Time</dt><dd data-f="time">00:00</dd></div>
        <div><dt>Accuracy</dt><dd data-f="acc">0%</dd></div>
        <div><dt>Machines destroyed</dt><dd data-f="kills">0</dd></div>
        <div><dt>Retries</dt><dd data-f="retries">0</dd></div>
      </dl>
      <div class="m-actions col"><button class="btn primary" data-act="redeploy">Redeploy</button></div>
    </section>

    <div class="panel" role="dialog" aria-modal="true" aria-label="Settings and controls" tabindex="-1" hidden>
      <header class="panel-h">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" data-tab="settings" aria-selected="true">Settings</button>
          <button class="tab" role="tab" data-tab="controls" aria-selected="false">Controls</button>
        </div>
        <button class="btn small" data-act="close-panel">Close</button>
      </header>
      <div class="panel-b" data-pane="settings">
        <div class="row"><label id="l-d">Difficulty</label>
          <div class="seg" role="group" aria-labelledby="l-d">${ab_2.map((W) => `<button data-d="${W[0]}" aria-pressed="false">${W[1]}</button>`).join("")}</div></div>
        <div class="row"><label id="l-v">Weapon position</label>
          <div class="seg" role="group" aria-labelledby="l-v">${cT.map((W) => `<button data-v="${W[0]}" aria-pressed="false">${W[1]}</button>`).join("")}</div></div>
        <div class="row"><label id="l-q">Graphics quality</label>
          <div class="seg" role="group" aria-labelledby="l-q">${QUALITY_NAMES.map((W) => `<button data-q="${W}" aria-pressed="false">${W}</button>`).join("")}</div></div>
        <div class="row"><label for="s-sens">Mouse sensitivity</label><div class="slider"><input id="s-sens" type="range" min="0.2" max="3" step="0.05"><output data-o="sens"></output></div></div>
        <div class="row"><label id="l-inv">Invert Y</label><button class="toggle" data-act="invert" aria-labelledby="l-inv" aria-pressed="false"><i></i><span>Off</span></button></div>
        <div class="row"><label for="s-vol">Master volume</label><div class="slider"><input id="s-vol" type="range" min="0" max="100" step="1"><output data-o="vol"></output></div></div>
        <div class="row"><label for="s-fov">Field of view</label><div class="slider"><input id="s-fov" type="range" min="60" max="95" step="1"><output data-o="fov"></output></div></div>
        <div class="row" data-row="fs"><label id="l-fs">Display</label><button class="btn small" data-act="fullscreen" aria-labelledby="l-fs fs-t"><span id="fs-t">Enter fullscreen</span></button></div>
        <p class="panel-note" data-f="qnote"></p>
      </div>
      <div class="panel-b" data-pane="controls" hidden>
        <h3>Keyboard \xB7 Mouse</h3>${KEYBOARD_CONTROLS_HTML}
        <p class="panel-note">If the browser will not capture the mouse, hold a mouse button and drag to look (left also fires, right also aims). Arrow keys or <kbd>I</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> turn, <kbd>Enter</kbd> fires.</p>
        <h3>Touch</h3>${TOUCH_CONTROLS_HTML}
        <h3>Controller</h3>${oL}
        <p class="panel-note">In menus the D-pad or left stick moves the selection, <kbd>A</kbd> accepts and <kbd>B</kbd> goes back. Browsers only start sound after a click or key press, so click once if a controller-only start is silent.</p>
      </div>
    </div>

    <div class="loc-card" aria-hidden="true"><i></i><b>Saltline Terminal \xB7 Berth 4 \xB7 05:42</b><span>Port Authority Breach Unit \u2014 one breacher, no backup</span></div>
  `),
    t.appendChild(s));
  let o = (W) => s.querySelector(W),
    r = (W) => [...s.querySelectorAll(W)],
    a = o(".panel"),
    l = o(".loc-card"),
    c = (W) => s.querySelector(`[data-f="${W}"]`),
    u = o("#s-sens"),
    f = o("#s-vol"),
    h = o("#s-fov"),
    p = "none",
    d = null;
  function m(W) {
    if (
      ((!W || W === "sens") && (n.input.sensitivity = i.sens),
      (!W || W === "invertY") && (n.input.invertY = i.invertY),
      !W || W === "volume")
    )
      try {
        n.audio && n.audio.setVolume && n.audio.setVolume(i.volume);
      } catch (J) {
        console.error(J);
      }
    if (!W || W === "view")
      try {
        n.weapon && n.weapon.setView && n.weapon.setView(i.view);
      } catch (J) {
        console.error(J);
      }
    if (
      ((!W || W === "fov") &&
        n.player &&
        n.player.setFov &&
        n.player.setFov(i.fov),
      W === "quality" ||
        (!W &&
          i.quality !== "auto" &&
          !n.params.shot &&
          !n.params.q &&
          i.quality !== (n.quality && n.quality.name)))
    ) {
      let J = QUALITY_PRESETS[i.quality];
      if (J)
        try {
          n.render && n.render.setQuality
            ? n.render.setQuality({ ...J })
            : (n.quality = { ...J });
        } catch (G) {
          console.error("[game] setQuality failed", G);
        }
    }
  }
  function x() {
    let W = i.quality === "auto" ? n.quality && n.quality.name : i.quality;
    for (let G of r(".seg button[data-q]"))
      G.setAttribute("aria-pressed", String(G.dataset.q === W));
    for (let G of r(".seg button[data-d]"))
      G.setAttribute("aria-pressed", String(G.dataset.d === i.difficulty));
    for (let G of r(".seg button[data-v]"))
      G.setAttribute("aria-pressed", String(+G.dataset.v === i.view));
    for (let G of r(".seg button[data-m]"))
      G.setAttribute("aria-pressed", String(G.dataset.m === i.mode));
    ((s.dataset.mode = i.mode),
      (c("modenote").textContent = nL[i.mode] || ""),
      (u.value = i.sens),
      (f.value = Math.round(i.volume * 100)),
      (h.value = i.fov),
      (o('[data-o="sens"]').textContent = i.sens.toFixed(2) + "\xD7"),
      (o('[data-o="vol"]').textContent = Math.round(i.volume * 100) + "%"),
      (o('[data-o="fov"]').textContent = Math.round(i.fov) + "\xB0"));
    let J = o('[data-act="invert"]');
    (J.setAttribute("aria-pressed", String(i.invertY)),
      (J.querySelector("span").textContent = i.invertY ? "On" : "Off"),
      (c("qnote").textContent =
        i.quality === "auto"
          ? `Quality was picked for this device (${W || "default"}). Lower it if the frame rate struggles.`
          : "Quality changes apply at once; shadows and reflections may take a moment to rebuild."),
      (c("qnote").textContent +=
        " Difficulty applies to machines that arrive from now on."));
  }
  (u.addEventListener("input", () => {
    ((i.sens = +u.value), m("sens"), x(), saveSettings(i));
  }),
    f.addEventListener("input", () => {
      ((i.volume = +f.value / 100), m("volume"), x(), saveSettings(i));
    }),
    h.addEventListener("input", () => {
      ((i.fov = +h.value), m("fov"), x(), saveSettings(i));
    }));
  let v = o('[data-row="fs"]'),
    y = o("#fs-t"),
    b = () =>
      document.fullscreenElement || document.webkitFullscreenElement || null,
    g = document.getElementById("app") || document.documentElement;
  (g &&
    (g.requestFullscreen || g.webkitRequestFullscreen) &&
    document.fullscreenEnabled !== !1 &&
    document.webkitFullscreenEnabled !== !1) ||
    (v.hidden = !0);
  function M() {
    y.textContent = "Fullscreen is not available here";
  }
  function _() {
    try {
      if (b()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(
          document,
        );
        return;
      }
      let W = (g.requestFullscreen || g.webkitRequestFullscreen).call(g);
      W && W.catch && W.catch(M);
    } catch {
      M();
    }
  }
  let T = () => {
    y.textContent = b() ? "Exit fullscreen" : "Enter fullscreen";
  };
  (document.addEventListener("fullscreenchange", T),
    document.addEventListener("webkitfullscreenchange", T));
  function w(W) {
    ((d = document.activeElement),
      (a.hidden = !1),
      s.classList.add("panel-open"),
      R(W || "settings"));
    try {
      a.focus({ preventScroll: !0 });
    } catch {}
  }
  function S() {
    return a.hidden
      ? !1
      : ((a.hidden = !0),
        s.classList.remove("panel-open"),
        d && d.focus && s.contains(d) ? d.focus() : z(),
        !0);
  }
  function R(W) {
    for (let J of r(".tab"))
      J.setAttribute("aria-selected", String(J.dataset.tab === W));
    for (let J of r(".panel-b")) J.hidden = J.dataset.pane !== W;
  }
  function z() {
    let W = s.querySelector(`.m-screen[data-s="${p}"] .btn.primary`);
    if (W)
      try {
        W.focus({ preventScroll: !0 });
      } catch {}
  }
  let I = s.querySelector(".m-callout"),
    L = I.querySelector(".m-callout-tab"),
    U = "saltline.note";
  function k(W, J) {
    if (
      (I.classList.toggle("open", W),
      L.setAttribute("aria-expanded", String(W)),
      J)
    )
      try {
        localStorage.setItem(U, W ? "1" : "0");
      } catch {}
  }
  {
    let W = null;
    try {
      W = localStorage.getItem(U);
    } catch {}
    (k(
      W
        ? W === "1"
        : typeof matchMedia == "function" &&
            matchMedia("(min-width: 1100px) and (min-height: 600px)").matches,
      !1,
    ),
      (I.hidden = !rT()));
  }
  (s.addEventListener("click", (W) => {
    let J = W.target.closest("button");
    if (!J || !s.contains(J)) return;
    if ((n.events.emit("ui:click", {}), J.dataset.q)) {
      ((i.quality = J.dataset.q), m("quality"), x(), saveSettings(i));
      return;
    }
    if (J.dataset.v) {
      ((i.view = +J.dataset.v), m("view"), x(), saveSettings(i));
      return;
    }
    if (J.dataset.m) {
      ((i.mode = J.dataset.m), x(), saveSettings(i));
      return;
    }
    if (J.dataset.d) {
      ((i.difficulty = J.dataset.d),
        e.difficulty && e.difficulty(i.difficulty),
        x(),
        saveSettings(i));
      return;
    }
    if (J.dataset.tab) {
      R(J.dataset.tab);
      return;
    }
    let G = J.dataset.act;
    G === "settings"
      ? w("settings")
      : G === "controls"
        ? w("controls")
        : G === "close-panel"
          ? S()
          : G === "invert"
            ? ((i.invertY = !i.invertY), m("invertY"), x(), saveSettings(i))
            : G === "fullscreen"
              ? _()
              : G === "note"
                ? (k(!I.classList.contains("open"), !0),
                  (I.classList.contains("open")
                    ? I.querySelector(".m-callout-x")
                    : L
                  ).focus())
                : G === "legacy"
                  ? ((J.disabled = !0),
                    (J.textContent = "Loading version 8"),
                    requestAnimationFrame(() => setTimeout(() => aT(n), 30)))
                  : G && e[G] && e[G](W);
  }),
    s.addEventListener("mouseover", (W) => {
      let J = W.target.closest("button");
      J &&
        W.relatedTarget &&
        !J.contains(W.relatedTarget) &&
        n.events.emit("ui:hover", {});
    }),
    s.addEventListener("keydown", (W) => {
      if (
        (W.code === "Escape" &&
          !a.hidden &&
          (S(), W.stopPropagation(), W.preventDefault()),
        W.code === "Tab" && !a.hidden)
      ) {
        let J = [...a.querySelectorAll("button, input")].filter(
          (oe) => oe.offsetParent !== null,
        );
        if (!J.length) return;
        let G = J[0],
          te = J[J.length - 1];
        W.shiftKey && document.activeElement === G
          ? (te.focus(), W.preventDefault())
          : !W.shiftKey &&
            document.activeElement === te &&
            (G.focus(), W.preventDefault());
      }
    }));
  let C = () => {
    let W = a.hidden ? s.querySelector(`.m-screen[data-s="${p}"]`) : a;
    return W
      ? [...W.querySelectorAll("button, input")].filter(
          (J) => !J.disabled && J.offsetParent !== null,
        )
      : [];
  };
  function A(W) {
    let J = C();
    if (!J.length) return;
    s.classList.add("pad-nav");
    let G = J.indexOf(document.activeElement);
    G = G < 0 ? (W > 0 ? 0 : J.length - 1) : (G + W + J.length) % J.length;
    try {
      (J[G].focus({ preventScroll: !1 }),
        J[G].scrollIntoView && J[G].scrollIntoView({ block: "nearest" }));
    } catch {}
    n.events.emit("ui:hover", {});
  }
  function F(W) {
    let J = document.activeElement;
    if (J && J.tagName === "INPUT" && J.type === "range" && s.contains(J)) {
      let G =
        (+J.step || 1) * (J.id === "s-vol" ? 5 : J.id === "s-sens" ? 2 : 1);
      ((J.value = String(Math.min(+J.max, Math.max(+J.min, +J.value + W * G)))),
        J.dispatchEvent(new Event("input", { bubbles: !0 })));
    } else A(W);
  }
  function H() {
    let W = s.querySelector(`.m-screen[data-s="${p}"] .btn.primary`);
    W && W.click();
  }
  function N() {
    let W = document.activeElement;
    W && W.tagName === "BUTTON" && s.contains(W) && W.offsetParent !== null
      ? W.click()
      : H();
  }
  s.addEventListener(
    "mousemove",
    () => {
      s.classList.toggle("pad-nav", !1);
    },
    { passive: !0 },
  );
  let Z = (W) => (
      (W = Math.max(0, Math.floor(W))),
      String(Math.floor(W / 60)).padStart(2, "0") +
        ":" +
        String(W % 60).padStart(2, "0")
    ),
    Q = {
      root: s,
      settings: i,
      fmtTime: Z,
      get screen() {
        return p;
      },
      get panelOpen() {
        return !a.hidden;
      },
      closePanel: S,
      nav: A,
      adjust: F,
      accept: N,
      primary: H,
      show(W) {
        W !== p &&
          ((p = W),
          (s.dataset.screen = W),
          S(),
          s.classList.toggle("open", W !== "none"),
          W !== "none"
            ? (x(), setTimeout(z, 30))
            : document.activeElement &&
              s.contains(document.activeElement) &&
              document.activeElement.blur());
      },
      locationCard(W) {
        l.classList.toggle("on", !!W);
      },
      setLookMode(W) {
        c("lookmode").textContent = W || "";
      },
      setDead({ time: W, relays: J, total: G, holdout: te }) {
        ((c("dead-time").textContent = Z(W)),
          (c("dead-relays").textContent = `${J}/${G}`),
          te &&
            ((c("dead-wave").textContent = String(te.waves)),
            (c("dead-kills").textContent = String(te.kills)),
            (c("dead-score").textContent = te.score.toLocaleString("en-US")),
            (c("dead-best").textContent =
              te.best.toLocaleString("en-US") + (te.record ? "  NEW" : ""))));
      },
      setDebrief({ time: W, accuracy: J, kills: G, retries: te, rating: oe }) {
        ((c("time").textContent = Z(W)),
          (c("acc").textContent =
            J == null ? "\u2014" : Math.round(J * 100) + "%"),
          (c("kills").textContent = String(G)),
          (c("retries").textContent = String(te)),
          (c("rating").textContent = oe));
      },
      applySettings: m,
    };
  return (x(), Q);
}

export {
  DEFAULT_SETTINGS,
  KEYBOARD_CONTROLS_HTML,
  QUALITY_NAMES,
  SETTINGS_KEY,
  TOUCH_CONTROLS_HTML,
  createMenus,
  loadSettings,
  saveSettings,
};
