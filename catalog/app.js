import { buildEntries, categories, soundTitle } from "./data.js";
import { mathMarkup } from "./math.js";
import { initializeSelects } from "./select.js";
import {
  t,
  messages,
  formatNumber,
  getLanguage,
  initializeLanguage,
  rememberLanguage,
  applyStaticTranslations,
  translateTextNodes,
} from "./i18n.js";

const api = globalThis.SaltlineCatalog;
const $ = (id) => document.getElementById(id);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
initializeLanguage();
let entries = buildEntries(api);
let byId = new Map(entries.map((entry) => [entry.id, entry]));
let activeEntry,
  category = "Alle",
  seed = 7,
  renderVersion = 0,
  tab = "math",
  wireframe = false,
  autoRotate = false;
let currentSignal = null,
  activeSound = null,
  waveformProgress = 0;
const counts = {
  props: entries.filter((e) => e.kind === "prop").length,
  sounds: Object.keys(api.audioBank).length,
  functions: Object.keys(api.functions).length,
};
function renderCounts() {
  $("counts").innerHTML = [
    [counts.props, "HAFENOBJEKTE"],
    [counts.sounds, "KLÄNGE"],
    [counts.functions, "FUNKTIONEN"],
  ]
    .map(
      ([n, label]) =>
        `<div><b>${formatNumber(n)}</b><span>${t(label)}</span></div>`,
    )
    .join("");
}
$("provenance").textContent =
  `game.js · SHA-256 ${api.source.sha256.slice(0, 16)}…`;

function renderIndex() {
  $("categories").innerHTML = categories
    .map(
      (c) =>
        `<button type="button" class="${category === c ? "active" : ""}" data-category="${c}" aria-pressed="${category === c}">${t(c)}<small>${formatNumber(c === "Alle" ? entries.length : entries.filter((e) => e.category === c).length)}</small></button>`,
    )
    .join("");
  const query = $("search").value.trim().toLocaleLowerCase(getLanguage());
  const visible = entries.filter(
    (e) =>
      (category === "Alle" || e.category === category) &&
      `${e.title} ${e.id} ${t(e.category)} ${e.sources.join(" ")}`
        .toLocaleLowerCase(getLanguage())
        .includes(query),
  );
  $("result-count").textContent = t("{count} EINTRÄGE", {
    count: formatNumber(visible.length),
  });
  $("entry-list").innerHTML = visible.length
    ? visible
        .map(
          (e) =>
            `<button type="button" data-entry="${e.id}" class="entry-item ${activeEntry?.id === e.id ? "active" : ""}" ${activeEntry?.id === e.id ? 'aria-current="true"' : ""}><span class="item-number">${e.number}</span><span><strong>${escape(e.title)}</strong><small>${escape(e.kind === "sound" ? e.soundId : e.builder + "(…) · " + t(e.category))}</small></span><span class="item-arrow" aria-hidden="true">↗</span></button>`,
        )
        .join("")
    : `<p class="empty-results">${t("Keine Einträge gefunden.")}<br>${t("Suchbegriff oder Kategorie ändern.")}</p>`;
}
$("categories").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) {
    category = button.dataset.category;
    renderIndex();
  }
});
$("entry-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-entry]");
  if (button) location.hash = button.dataset.entry;
});
$("search").addEventListener("input", renderIndex);
document.addEventListener("keydown", (event) => {
  if (
    !event.defaultPrevented &&
    event.key === "/" &&
    !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)
  ) {
    event.preventDefault();
    $("search").focus();
  }
});

function setTab(name, focus = false) {
  tab = name;
  for (const key of ["math", "source", "audio"]) {
    const selected = key === name;
    $("tab-" + key).setAttribute("aria-selected", String(selected));
    $("tab-" + key).tabIndex = selected ? 0 : -1;
    $("panel-" + key).hidden = !selected;
  }
  if (focus) $("tab-" + name).focus();
}
document.querySelector(".detail-tabs").addEventListener("click", (event) => {
  const button = event.target.closest('[role="tab"]');
  if (button) setTab(button.id.slice(4));
});
document.querySelector(".detail-tabs").addEventListener("keydown", (event) => {
  const keys = ["math", "source", "audio"],
    i = keys.indexOf(tab);
  const next =
    event.key === "ArrowRight"
      ? keys[(i + 1) % 3]
      : event.key === "ArrowLeft"
        ? keys[(i + 2) % 3]
        : event.key === "Home"
          ? keys[0]
          : event.key === "End"
            ? keys[2]
            : null;
  if (next) {
    event.preventDefault();
    setTab(next, true);
  }
});

function renderMath(entry) {
  $("panel-math").innerHTML =
    `<p class="section-label">${t("Aus den Konstruktions- und Synthesefunktionen")}</p>` +
    entry.formulas
      .map(
        (f, i) =>
          `<div class="formula"><span class="formula-index">${String(i + 1).padStart(2, "0")}</span><div><h3>${escape(f.title)}</h3><div class="equation">${mathMarkup[f.equation]}</div><p>${escape(f.explanation)}</p><span class="source-chip">${f.sources.length ? "↳ " + f.sources.map((n) => escape(n) + "(…)").join(" · ") : "↳ " + escape(entry.builder) + "(…)"}</span></div></div>`,
      )
      .join("") +
    `<p class="reading-note">${t("Die Formeln erläutern die Originalimplementierung. Vereinfachungen und Auszüge sind beschrieben. Der Tab „Quellcode“ enthält die ausführbaren Funktionen mit ihren ursprünglichen Variablennamen.")}</p>`;
}
function sourceNames(entry) {
  const names = [...entry.sources];
  for (const f of entry.formulas)
    for (const name of f.sources)
      if (api.functions[name] && !names.includes(name)) names.push(name);
  // Include direct application dependencies, while retaining the primary constructor first.
  for (const name of [...names]) {
    const code = api.functions[name]?.toString() || "";
    for (const match of code.matchAll(/([\w$]+)\s*\(/g))
      if (Object.hasOwn(api.functions, match[1]) && !names.includes(match[1]))
        names.push(match[1]);
  }
  return names;
}
function renderSource(entry) {
  const functions = sourceNames(entry);
  const constants = entry.constants || [];
  $("panel-source").innerHTML =
    `<div class="source-tools"><select id="source-select" aria-label="${t("Quellfunktion auswählen")}">${functions.map((n) => `<option value="${escape(n)}">${escape(n)}(…)</option>`).join("")}${constants.map((n) => `<option value="constant:${n}">${escape(t("Parameter: {name}", { name: n }))}</option>`).join("")}${entry.kind === "prop" ? `<option value="constant:Yi">${t("Parameter: {name}", { name: "PROP_SIZES / Yi" })}</option>` : ""}${entry.kind === "sound" ? `<option value="sound-spec">${t("Parameter: {name}", { name: t("Soundbank-Eintrag") })}</option>` : ""}</select><button type="button" id="copy-source">${t("Code kopieren")}</button></div><div class="source-location" id="source-location"></div><pre><code id="source-code"></code></pre>`;
  function update() {
    const name = $("source-select").value;
    let code, location;
    if (name.startsWith("constant:")) {
      const key = name.slice(9);
      code = JSON.stringify(api.constants[key], null, 2);
      location = escape(t("Parameterblock {name} aus game.js", { name: key }));
    } else if (name === "sound-spec") {
      code = JSON.stringify(
        entry.spec,
        (_key, value) =>
          typeof value === "function" ? value.name + "(…)" : value,
        2,
      );
      location = escape(
        t("{name} aus game.js", { name: `Ir.${entry.soundId}` }),
      );
    } else {
      code = api.functions[name].toString();
      const source = api.source.locations[name];
      location = `<a href="original/game.js" target="_blank" rel="noopener">game.js</a> · ${escape(name)} · ${escape(t("Originalzeile {line} · Byte {byte}", { line: source?.line ?? "?", byte: source?.byte ?? "?" }))}<br>${escape(t("Für die Lesbarkeit formatiert. SHA-256 der Quelldatei: {hash}", { hash: api.source.sha256 }))}`;
    }
    $("source-code").textContent = code;
    $("source-location").innerHTML = location;
  }
  $("source-select").addEventListener("change", update);
  update();
  $("copy-source").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("source-code").textContent);
      $("copy-source").textContent = t("Kopiert ✓");
    } catch {
      $("copy-source").textContent = t("Bitte Code markieren");
    }
  });
}

class CatalogAudio {
  context = null;
  gain = null;
  current = null;
  cache = new Map();
  pending = new Map();
  token = 0;
  async unlock() {
    if (!this.context) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio)
        throw new Error(t("Web Audio ist in diesem Browser nicht verfügbar."));
      this.context = new Audio();
      this.gain = this.context.createGain();
      this.gain.gain.value = Number($("volume").value) / 100;
      this.gain.connect(this.context.destination);
    }
    await this.context.resume();
    if (this.context.state !== "running")
      throw new Error(
        t("Audio konnte nicht gestartet werden. Erneut auf Abspielen klicken."),
      );
  }
  async synthesize(name, variant) {
    const key = name + "#" + variant;
    if (this.cache.has(key)) return this.cache.get(key);
    if (this.pending.has(key)) return this.pending.get(key);
    const pending = (async () => {
      // Yield between original generator steps so long ambience sounds keep the UI usable.
      const generator = api.synthesizeSteps(name, variant);
      if (!generator)
        throw new Error(t("Klang nicht gefunden: {name}", { name }));
      let samples;
      do {
        await new Promise((resolve) => setTimeout(resolve, 0));
        samples = generator.step();
      } while (!samples);
      if (
        samples.ch.some((channel) =>
          channel.some((sample) => !Number.isFinite(sample)),
        )
      )
        throw new Error(t("Ungültige Audiodaten: {name}", { name }));
      this.cache.set(key, samples);
      // Bound retained PCM data when browsing many long music/ambience entries.
      let bytes = 0;
      for (const data of [...this.cache.values()].reverse())
        bytes += data.ch.reduce((n, ch) => n + ch.byteLength, 0);
      while (bytes > 48 * 1024 * 1024 && this.cache.size > 1) {
        const first = this.cache.keys().next().value;
        const data = this.cache.get(first);
        bytes -= data.ch.reduce((n, ch) => n + ch.byteLength, 0);
        this.cache.delete(first);
      }
      return samples;
    })();
    this.pending.set(key, pending);
    try {
      return await pending;
    } finally {
      this.pending.delete(key);
    }
  }
  stop() {
    this.token++;
    if (this.current) {
      const current = this.current;
      this.current = null;
      current.source.onended = null;
      try {
        current.source.stop();
      } catch {}
      current.source.disconnect();
    }
    activeSound = null;
    waveformProgress = 0;
    $("audio-status").textContent = t("SOUND GESTOPPT");
    $("audio-dot").classList.remove("playing");
    document.querySelectorAll(".play-sound").forEach((button) => {
      button.textContent = "▶";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute(
        "aria-label",
        t("{name} abspielen", {
          name: soundTitle(button.closest("[data-sound]").dataset.sound),
        }),
      );
    });
  }
  async play(name, variant = 0) {
    if (this.current?.name === name && this.current.variant === variant) {
      this.stop();
      return;
    }
    this.stop();
    const token = this.token;
    $("audio-status").textContent = t("SYNTHETISIERE · {name}", {
      name: soundTitle(name),
    });
    try {
      await this.unlock();
      const data = await this.synthesize(name, variant);
      if (token !== this.token) return;
      const buffer = this.context.createBuffer(
        data.ch.length,
        data.ch[0].length,
        data.sr,
      );
      data.ch.forEach((channel, index) => buffer.copyToChannel(channel, index));
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.loop = data.loop;
      source.connect(this.gain);
      this.current = {
        source,
        name,
        variant,
        duration: buffer.duration,
        started: this.context.currentTime,
      };
      activeSound = name;
      if (activeEntry?.kind === "sound") {
        currentSignal = {
          kind: "waveform",
          samples: data.ch[0],
          duration: buffer.duration,
        };
        $("stage-status").textContent = t(
          data.ch.length === 1
            ? "{duration} s · 1 KANAL"
            : "{duration} s · {count} KANÄLE",
          {
            duration: formatNumber(buffer.duration, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            count: formatNumber(data.ch.length),
          },
        );
        updateSoundFacts(data);
      }
      source.onended = () => {
        if (this.current?.source === source) {
          this.stop();
          $("audio-status").textContent = t("BEENDET · {name}", {
            name: soundTitle(name),
          });
        }
      };
      source.start();
      $("audio-status").textContent =
        `${t(data.loop ? "LOOP" : "SPIELT")} · ${soundTitle(name)} · ${t("VARIANTE {number}", { number: formatNumber(variant + 1) })}`;
      $("audio-dot").classList.add("playing");
      document
        .querySelectorAll(`[data-sound="${name}"] .play-sound`)
        .forEach((button) => {
          button.textContent = "■";
          button.setAttribute("aria-pressed", "true");
          button.setAttribute(
            "aria-label",
            t("{name} stoppen", { name: soundTitle(name) }),
          );
        });
    } catch (error) {
      if (token === this.token) $("audio-status").textContent = error.message;
      console.error(error);
    }
  }
  async download(name, variant) {
    const data = await this.synthesize(name, variant),
      channels = data.ch.length,
      frames = data.ch[0].length;
    const bytes = new ArrayBuffer(44 + frames * channels * 2),
      view = new DataView(bytes);
    const ascii = (offset, value) => {
      for (let i = 0; i < value.length; i++)
        view.setUint8(offset + i, value.charCodeAt(i));
    };
    ascii(0, "RIFF");
    view.setUint32(4, bytes.byteLength - 8, true);
    ascii(8, "WAVE");
    ascii(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, data.sr, true);
    view.setUint32(28, data.sr * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    ascii(36, "data");
    view.setUint32(40, frames * channels * 2, true);
    let offset = 44;
    for (let frame = 0; frame < frames; frame++)
      for (let ch = 0; ch < channels; ch++) {
        const sample = Math.max(-1, Math.min(1, data.ch[ch][frame]));
        view.setInt16(
          offset,
          sample < 0 ? sample * 32768 : sample * 32767,
          true,
        );
        offset += 2;
      }
    const url = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `saltline-${name}-v${variant + 1}.wav`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
const audio = new CatalogAudio();
$("stop-audio").addEventListener("click", () => audio.stop());
$("volume").addEventListener("input", () => {
  if (audio.gain)
    audio.gain.gain.setTargetAtTime(
      Number($("volume").value) / 100,
      audio.context.currentTime,
      0.02,
    );
});
window.addEventListener("pagehide", () => {
  audio.stop();
  const context = audio.context;
  audio.context = null;
  audio.gain = null;
  context?.close();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) audio.stop();
});
function renderAudio(entry) {
  const sounds = entry.sounds.filter((name) => api.audioBank[name]);
  $("sound-count").textContent = sounds.length;
  $("panel-audio").innerHTML =
    `<p class="audio-note">${escape(entry.soundNote || t(sounds.length ? "Originale Synthese, ohne Raumpositionierung oder zusätzlichen Spielmix. Loops laufen bis zum Stoppen." : "Dieser Geometriefunktion ist kein eigener Klang zugeordnet."))}</p>` +
    sounds
      .map((name) => {
        const spec = api.audioBank[name];
        return `<div class="audio-row" data-sound="${name}"><button type="button" class="play-sound" aria-label="${escape(t("{name} abspielen", { name: soundTitle(name) }))}" aria-pressed="false">▶</button><div><strong>${escape(soundTitle(name))}</strong><small>${name} · ${formatNumber(spec.sr)} Hz · ${t(spec.loop ? "LOOP" : spec.ir ? "IMPULSANTWORT" : "ONE SHOT")} · ${spec.gen.name}(…)</small></div><select aria-label="${escape(t("Variante für {name}", { name: soundTitle(name) }))}">${Array.from({ length: spec.n }, (_, i) => `<option value="${i}">V${i + 1}</option>`).join("")}</select><button type="button" class="download-sound" aria-label="${escape(t("{name} als WAV herunterladen", { name: soundTitle(name) }))}">WAV ↓</button></div>`;
      })
      .join("");
}
$("panel-audio").addEventListener("click", async (event) => {
  const row = event.target.closest("[data-sound]");
  if (!row) return;
  const variant = Number(row.querySelector("select").value),
    name = row.dataset.sound;
  if (event.target.closest(".play-sound")) audio.play(name, variant);
  if (event.target.closest(".download-sound")) {
    const button = row.querySelector(".download-sound");
    button.disabled = true;
    button.textContent = "…";
    try {
      await audio.download(name, variant);
    } catch (error) {
      $("audio-status").textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "WAV ↓";
    }
  }
});

function facts(values) {
  $("facts").innerHTML = values
    .map(
      ([label, value]) =>
        `<div class="fact"><dt>${escape(t(label))}</dt><dd>${escape(typeof value === "number" ? formatNumber(value) : Object.hasOwn(messages, value) ? t(value) : value)}</dd></div>`,
    )
    .join("");
}
function updateSoundFacts(data) {
  facts([
    ["Samplerate", `${formatNumber(data.sr)} Hz`],
    [
      "Dauer",
      `${formatNumber(data.ch[0].length / data.sr, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} s`,
    ],
    ["Kanäle", data.ch.length],
    ["Samples / Kanal", formatNumber(data.ch[0].length)],
  ]);
}

let viewer;
class ObjectViewer {
  constructor() {
    const T = api.THREE;
    this.T = T;
    this.renderer = new T.WebGLRenderer({
      canvas: $("object-view"),
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0, 0);
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(38, 1, 0.01, 150);
    this.scene.add(new T.HemisphereLight(0xeaf2d9, 0x536448, 3));
    const key = new T.DirectionalLight(0xffe5c2, 4);
    key.position.set(4, 7, 3);
    this.scene.add(key);
    const fill = new T.DirectionalLight(0xc4d9ed, 2);
    fill.position.set(-5, 3, -4);
    this.scene.add(fill);
    const grid = new T.GridHelper(14, 28, 0x5d7058, 0x344637);
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    this.scene.add(grid);
    this.group = new T.Group();
    this.scene.add(this.group);
    this.target = new T.Vector3(0, 1, 0);
    this.reset();
    this.game = {
      THREE: T,
      params: { tex: "256", wet: "0.5" },
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      quality: { tex: 256 },
      events: api.createEvents(),
      rng: api.random(4207),
      time: { t: 0, dt: 0, frame: 0, real: 0 },
    };
    this.game.physics = {
      addBox() {
        return {};
      },
    };
    this.ready = api.createMaterials(this.game).then((mats) => {
      this.game.mats = mats;
      this.game.props = api.createProps(this.game);
    });
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe($("stage"));
    this.resize();
    let pointer = null;
    const canvas = $("object-view");
    canvas.addEventListener("pointerdown", (event) => {
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (pointer?.id !== event.pointerId) return;
      this.theta -= (event.clientX - pointer.x) * 0.008;
      this.phi = Math.max(
        0.12,
        Math.min(1.5, this.phi + (event.clientY - pointer.y) * 0.008),
      );
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    });
    const release = () => {
      pointer = null;
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("lostpointercapture", release);
    canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        this.distance = Math.max(
          2.5,
          Math.min(25, this.distance * Math.exp(event.deltaY * 0.001)),
        );
      },
      { passive: false },
    );
    canvas.addEventListener("keydown", (event) => {
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "+",
          "-",
          "Home",
        ].includes(event.key)
      ) {
        event.preventDefault();
        if (event.key === "ArrowLeft") this.theta -= 0.15;
        if (event.key === "ArrowRight") this.theta += 0.15;
        if (event.key === "ArrowUp") this.phi = Math.max(0.12, this.phi - 0.1);
        if (event.key === "ArrowDown") this.phi = Math.min(1.5, this.phi + 0.1);
        if (event.key === "+")
          this.distance = Math.max(2.5, this.distance * 0.9);
        if (event.key === "-")
          this.distance = Math.min(25, this.distance * 1.1);
        if (event.key === "Home") this.reset();
      }
    });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      $("stage-message").textContent = t(
        "3D-Kontext unterbrochen. Seite zum Wiederherstellen neu laden.",
      );
    });
  }
  reset() {
    this.theta = 0.8;
    this.phi = 1.03;
    this.distance = 8;
  }
  resize() {
    const width = $("stage").clientWidth,
      height = $("stage").clientHeight;
    if (width && height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      if (width / height < 1.2) this.distance = Math.max(this.distance, 10);
    }
  }
  clear() {
    const geometries = new Set(),
      materials = new Set(),
      skeletons = new Set();
    this.group.traverse((node) => {
      if (node.geometry) geometries.add(node.geometry);
      if (node.skeleton) skeletons.add(node.skeleton);
      if (node.userData.catalogMaterial)
        for (const material of Array.isArray(node.material)
          ? node.material
          : [node.material])
          materials.add(material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    skeletons.forEach((skeleton) => skeleton.dispose());
    this.group.clear();
    this.group.scale.setScalar(1);
    this.group.position.set(0, 0, 0);
    this.animate = null;
    this.game.time.t = 0;
  }
  material(color, vertexColors = false) {
    const material = new this.T.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.35,
      vertexColors,
      side: this.T.DoubleSide,
    });
    return material;
  }
  addMesh(geometry, color) {
    const node = new this.T.Mesh(
      geometry,
      this.material(color, !!geometry.attributes.color),
    );
    node.userData.catalogMaterial = true;
    return node;
  }
  async show(entry, options = {}) {
    await this.ready;
    this.clear();
    const T = this.T;
    let object;
    if (entry.kind === "prop") {
      object = this.game.props.build(entry.id, { seed, ...options });
      this.animate = (dt) => object.userData.update?.(dt);
    } else if (entry.kind === "weapon") {
      object = new T.Group();
      const parts = api.geometry[entry.id]();
      for (const [key, geometry] of Object.entries(parts))
        if (geometry?.isBufferGeometry) {
          const color = /brass|round/.test(key)
            ? 0xcbb36d
            : /tan|mag/.test(key)
              ? 0x978b65
              : /poly|frame/.test(key)
                ? 0x383d37
                : /plain/.test(key)
                  ? 0x8e9890
                  : 0x606b68;
          const node = this.addMesh(geometry, color);
          if (key === "mag" || key === "round")
            node.position.fromArray(
              api.constants[entry.id === "rifle" ? "wn" : "G0"].magPos,
            );
          object.add(node);
        }
    } else if (entry.kind === "robot") {
      const name = entry.model || entry.id,
        definition = api.geometry[name]();
      const materials = {
        shell: this.material(0xb5bbb0, true),
        metal: this.material(0x5c6964, true),
        glow: new T.MeshBasicMaterial({ color: 0xffa35c, vertexColors: true }),
        lens: this.material(0xf3a665, true),
      };
      const rig = api.geometry.skin(definition, materials);
      object = rig.group;
      object.traverse((node) => {
        if (node.isMesh) node.userData.catalogMaterial = true;
      });
      if (name === "gull")
        this.animate = (dt) => {
          for (let i = 0; i < 4; i++)
            rig.bones["rotor" + i].rotation.y += dt * 20 * (i % 2 ? 1 : -1);
        };
    } else if (entry.kind === "hands") {
      this.game.viewCamera = this.camera;
      const hand = api.functions.Fh(this.game, { side: "right" });
      object = hand.group;
      object.visible = true;
      object.traverse((node) => {
        node.layers.enable(0);
      });
    } else if (entry.kind === "backdrop") {
      const originalScene = this.game.scene;
      const scene = new T.Scene();
      this.game.scene = scene;
      let backdrop;
      try {
        backdrop = api.backdrop(this.game, { only: entry.id, showcase: true });
      } finally {
        this.game.scene = originalScene;
      }
      object = backdrop.root;
      // The crane showcase includes distant shader-animated gulls. Keep the object framing local.
      if (backdrop.gulls) backdrop.gulls.removeFromParent();
      this.animate = (dt) => backdrop.update(dt);
    } else if (entry.kind === "waves") {
      const geometry = new T.PlaneGeometry(20, 14, 80, 56);
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(36, 0, 0);
      object = new T.Mesh(geometry, this.material(0x7caaa0));
      object.userData.catalogMaterial = true;
      const positions = geometry.attributes.position;
      this.animate = () => {
        for (let i = 0; i < positions.count; i++)
          positions.setY(
            i,
            api.waves(positions.getX(i), positions.getZ(i), this.game.time.t) -
              api.constants.Kn.seaY,
          );
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
      };
      this.animate();
    } else if (entry.kind === "primitive") {
      if (entry.primitive === "box")
        object = this.addMesh(api.functions.Ei(2, 1.4, 1, 0.08), 0xc4d591);
      if (entry.primitive === "lathe")
        object = this.addMesh(
          api.functions.vg(
            [
              [0, 0],
              [0.55, 0],
              [0.65, 0.1],
              [0.65, 1.3],
              [0.5, 1.45],
              [0.2, 1.6],
              [0, 1.6],
            ],
            32,
          ),
          0xc4d591,
        );
      if (entry.primitive === "tube")
        object = this.addMesh(
          api.functions.bn(
            [
              [-1.5, 0, 0],
              [-0.6, 1, 0.3],
              [0.5, 0.3, -0.3],
              [1.4, 1.4, 0],
            ],
            0.09,
            10,
            false,
            0.5,
          ),
          0xc4d591,
        );
    }
    if (!object)
      throw new Error(t("Für diesen Eintrag wurde keine Geometrie erzeugt."));
    this.group.add(object);
    this.group.updateMatrixWorld(true);
    object.traverse((node) => {
      if (node.isSkinnedMesh) node.computeBoundingBox();
    });
    const bounds = new T.Box3().setFromObject(object, true),
      size = bounds.getSize(new T.Vector3());
    if (bounds.isEmpty() || !Number.isFinite(size.length()))
      throw new Error(t("Die Objektgrenzen konnten nicht bestimmt werden."));
    const scale = 4 / Math.max(size.x, size.y, size.z, 0.001),
      center = bounds.getCenter(new T.Vector3());
    // Group offset does not interfere with the object's original animation coordinates.
    this.group.scale.setScalar(scale);
    this.group.position.set(
      -center.x * scale,
      -bounds.min.y * scale + 0.015,
      -center.z * scale,
    );
    this.target.set(0, size.y * scale * 0.46, 0);
    this.reset();
    this.resize();
    this.setWireframe(wireframe);
    let triangles = 0,
      meshes = 0;
    object.traverse((node) => {
      if (node.isMesh) {
        meshes++;
        triangles +=
          (node.geometry.index?.count ??
            node.geometry.attributes.position.count) / 3;
      }
    });
    $("stage-status").textContent = t("{count} DREIECKE", {
      count: formatNumber(Math.round(triangles)),
    });
    facts([
      [
        entry.size ? "Nennmaß / m" : "Abmessung / m",
        (entry.size || size.toArray())
          .map((n) => formatNumber(n, { maximumFractionDigits: 3 }))
          .join(" × "),
      ],
      ["Konstruktor", entry.builder + "(…)"],
      ["Geometrien", meshes],
      [
        entry.material ? "Material" : "Darstellung",
        (object.userData.color
          ? "paint_" + object.userData.color
          : entry.material) ||
          (entry.kind === "robot" ? "Originalskelett" : "Originalgeometrie"),
      ],
    ]);
  }
  setWireframe(value) {
    this.group.traverse((node) => {
      if (node.isMesh)
        for (const material of Array.isArray(node.material)
          ? node.material
          : [node.material])
          material.wireframe = value;
    });
  }
  frame(dt) {
    this.game.time.t += dt;
    this.game.time.dt = dt;
    this.game.time.frame++;
    this.animate?.(dt);
    this.game.mats?.update(dt);
    if (autoRotate) this.theta += dt * 0.18;
    this.camera.position.set(
      this.target.x + this.distance * Math.sin(this.phi) * Math.sin(this.theta),
      this.target.y + this.distance * Math.cos(this.phi),
      this.target.z + this.distance * Math.sin(this.phi) * Math.cos(this.theta),
    );
    this.camera.lookAt(this.target);
    this.renderer.render(this.scene, this.camera);
  }
}

function plotFor(entry) {
  const count = 600;
  if (entry.plot === "noise")
    return {
      kind: "plot",
      values: Array.from({ length: count }, (_, i) =>
        api.functions.Jn((i / count) * 12 + seed, seed * 0.17),
      ),
      label: "Jn(x, seed × 0.17)",
      x: t("x / 12 Einheiten"),
      min: 0,
      max: 1,
    };
  if (entry.plot === "spring") {
    const state = { x: 0, v: 0 };
    return {
      kind: "plot",
      values: Array.from({ length: count }, () =>
        api.functions.ll(state, 1, 45, 8, 1 / 120),
      ),
      label: "ll · k = 45 · c = 8",
      x: t("t / 5 Sekunden"),
      min: 0,
      max: 1.35,
    };
  }
  const curve = api.dsp.envelope(0.12, 0.01);
  return {
    kind: "plot",
    values: Array.from({ length: count }, (_, i) => curve((i / count) * 0.8)),
    label: "ms(0.12, 0.01)",
    x: t("t / 0.8 Sekunden"),
    min: 0,
    max: 1,
  };
}
function drawSignal() {
  if ($("signal-view").hidden) return;
  const canvas = $("signal-view"),
    width = canvas.clientWidth,
    height = canvas.clientHeight,
    ratio = Math.min(devicePixelRatio, 2);
  if (
    canvas.width !== Math.round(width * ratio) ||
    canvas.height !== Math.round(height * ratio)
  ) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const left = 42,
    right = width - 25,
    top = 70,
    bottom = height - 65;
  context.lineWidth = 1;
  context.strokeStyle = "#3a493d";
  context.font =
    getLanguage() === "zh"
      ? '10px system-ui,"PingFang SC",sans-serif'
      : '9px "IBM Plex Mono",monospace';
  context.fillStyle = "#a5b4a3";
  for (let i = 0; i <= 4; i++) {
    const y = top + ((bottom - top) * i) / 4;
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.stroke();
  }
  for (let i = 0; i <= 8; i++) {
    const x = left + ((right - left) * i) / 8;
    context.beginPath();
    context.moveTo(x, top);
    context.lineTo(x, bottom);
    context.stroke();
  }
  if (!currentSignal) {
    context.fillText(
      t("Auf Abspielen klicken, um die originale Wellenform zu erzeugen."),
      left,
      top + 40,
    );
    return;
  }
  context.strokeStyle = "#d4f392";
  context.lineWidth = 1.6;
  context.beginPath();
  if (currentSignal.kind === "waveform") {
    const samples = currentSignal.samples,
      bins = Math.max(1, Math.floor(right - left)),
      middle = (top + bottom) / 2,
      amplitude = (bottom - top) * 0.45;
    for (let x = 0; x < bins; x++) {
      const start = Math.floor((x / bins) * samples.length),
        end = Math.max(
          start + 1,
          Math.floor(((x + 1) / bins) * samples.length),
        );
      let low = 0,
        high = 0;
      for (let i = start; i < end; i++) {
        low = Math.min(low, samples[i]);
        high = Math.max(high, samples[i]);
      }
      context.moveTo(left + x, middle - low * amplitude);
      context.lineTo(left + x, middle - high * amplitude);
    }
    context.stroke();
    context.fillText("+1", 12, top + 5);
    context.fillText("−1", 12, bottom);
    context.fillText("0 s", left, bottom + 20);
    context.fillText(
      formatNumber(currentSignal.duration, { maximumFractionDigits: 2 }) + " s",
      right - 40,
      bottom + 20,
    );
    if (audio.current && audio.current.name === activeSound) {
      const elapsed =
        (audio.context.currentTime - audio.current.started) /
        audio.current.duration;
      waveformProgress = audio.current.source.loop
        ? elapsed % 1
        : Math.min(1, elapsed);
      context.strokeStyle = "#eba46c";
      context.beginPath();
      context.moveTo(left + (right - left) * waveformProgress, top);
      context.lineTo(left + (right - left) * waveformProgress, bottom);
      context.stroke();
    }
  } else {
    const { values, min, max } = currentSignal;
    values.forEach((value, index) => {
      const x = left + (index / (values.length - 1)) * (right - left),
        y = bottom - ((value - min) / (max - min)) * (bottom - top);
      index ? context.lineTo(x, y) : context.moveTo(x, y);
    });
    context.stroke();
    context.fillText(formatNumber(max), 10, top + 4);
    context.fillText(formatNumber(min), 10, bottom);
    context.fillText(currentSignal.x, left, bottom + 22);
    context.fillText(currentSignal.label, left, top - 15);
  }
}

function renderParameters(entry) {
  const controls = [];
  if (entry.kind === "prop" || entry.plot === "noise")
    controls.push(
      `<label>SEED <input id="seed" type="number" min="0" max="99999" step="1" value="${seed}"></label>`,
    );
  if (entry.id.startsWith("container"))
    controls.push(
      '<label>TÜREN <input id="doors" type="range" min="0" max="1" step="0.1" value="0.3"><output id="doors-value">0.3</output></label><label>FARBE <select id="color"><option value="blue">Blau</option><option value="red">Rot</option><option value="green">Grün</option><option value="grey">Grau</option><option value="teal">Petrol</option></select></label><label>VERSCHLEISS <input id="wear" type="range" min="0" max="1" step="0.5" value="0.5"><output id="wear-value">0.5</output></label>',
    );
  if (entry.id === "relay_node")
    controls.push(
      '<label>ZUSTAND <select id="relay-state"><option value="live">Live</option><option value="cutting">Wird getrennt</option><option value="cut">Getrennt</option></select></label>',
    );
  if (entry.id === "barrel")
    controls.push(
      '<label>FARBE <select id="color"><option value="blue">Blau</option><option value="red">Rot</option><option value="green">Grün</option></select></label><label><input id="lying" type="checkbox"> LIEGEND</label><label><input id="open" type="checkbox"> OFFEN</label>',
    );
  $("parameters").innerHTML = controls.join("");
  translateTextNodes($("parameters"));
}
let parameterTimer;
$("parameters").addEventListener("input", () => {
  if ($("seed")) {
    seed = Math.max(
      0,
      Math.min(99999, Math.round(Number($("seed").value) || 0)),
    );
  }
  if ($("doors-value"))
    $("doors-value").textContent = formatNumber($("doors").value);
  if ($("wear-value"))
    $("wear-value").textContent = formatNumber($("wear").value);
  clearTimeout(parameterTimer);
  parameterTimer = setTimeout(() => updatePreview(), 140);
});
function options() {
  return {
    doors: Number($("doors")?.value ?? 0),
    wear: Number($("wear")?.value ?? 0.5),
    ...($("color") ? { color: $("color").value } : {}),
    state: $("relay-state")?.value ?? "live",
    lying: $("lying")?.checked ?? false,
    open: $("open")?.checked ?? false,
  };
}
async function updatePreview() {
  const entry = activeEntry,
    version = ++renderVersion;
  const signal = entry.kind === "sound" || entry.kind === "plot";
  $("object-view").hidden = signal;
  $("signal-view").hidden = !signal;
  $("view-controls").hidden = signal;
  $("stage-message").textContent = "";
  $("stage-label").textContent =
    entry.kind === "sound"
      ? t("ORIGINAL / AUDIOSYNTHESE")
      : entry.kind === "plot"
        ? t("LIVE / FUNKTIONSGRAPH")
        : t("LIVE / GEOMETRIE");
  $("stage-hint").textContent =
    entry.kind === "sound"
      ? t("ORIGINALPUFFER · VARIANTE IM TAB SOUND WÄHLEN")
      : entry.kind === "plot"
        ? t("ORIGINALFUNKTION · NUMERISCH AUSGEWERTET")
        : t("ZIEHEN · DREHEN / SCROLLEN · ZOOM");
  if (signal) {
    viewer?.clear();
    currentSignal = entry.kind === "plot" ? plotFor(entry) : null;
    $("stage-status").textContent = t(
      entry.kind === "plot" ? "FUNKTIONSWERT" : "HÖRPROBE PER KLICK",
    );
    if (entry.kind === "sound") {
      const data = audio.cache.get(entry.soundId + "#0");
      if (data) {
        currentSignal = {
          kind: "waveform",
          samples: data.ch[0],
          duration: data.ch[0].length / data.sr,
        };
        updateSoundFacts(data);
      } else
        facts([
          ["Samplerate", `${formatNumber(entry.spec.sr)} Hz`],
          ["Varianten", entry.spec.n],
          [
            "Wiedergabe",
            entry.spec.loop
              ? "Loop"
              : entry.spec.ir
                ? "Impulsantwort"
                : "Einzelklang",
          ],
          ["Generator", entry.builder + "(…)"],
        ]);
    } else
      facts([
        ["Funktion", entry.builder + "(…)"],
        ["Auswertung", "600 Stützpunkte"],
        ["Quelle", "game.js"],
        ["Typ", "Originalfunktion"],
      ]);
    drawSignal();
    return;
  }
  $("stage-status").textContent = t("GEOMETRIE WIRD ERZEUGT");
  try {
    if (!viewer) viewer = new ObjectViewer();
    await viewer.ready;
    if (version !== renderVersion) return;
    await viewer.show(entry, options());
    if (version !== renderVersion) return;
  } catch (error) {
    if (version !== renderVersion) return;
    $("stage-status").textContent = t("VORSCHAU NICHT VERFÜGBAR");
    $("stage-message").textContent = error.message;
    facts([
      ["Konstruktor", entry.builder + "(…)"],
      ["Quelle", "game.js"],
      ["Mathematik", "Siehe unten"],
      ["Sound", "Separat abspielbar"],
    ]);
    console.error(error);
  }
}
async function selectEntry(entry, preserveState = false) {
  const saved = preserveState
    ? {
        controls: [...$("parameters").querySelectorAll("input,select")].map(
          (element) => ({
            id: element.id,
            value: element.value,
            checked: element.checked,
          }),
        ),
        source: $("source-select")?.value,
        variants: [...document.querySelectorAll("[data-sound]")].map((row) => [
          row.dataset.sound,
          row.querySelector("select").value,
        ]),
        tab,
        camera: viewer ? [viewer.theta, viewer.phi, viewer.distance] : null,
        scroll: window.scrollY,
        indexScroll: $("entry-list").scrollTop,
      }
    : null;
  clearTimeout(parameterTimer);
  audio.stop();
  activeEntry = entry;
  $("entry-title").textContent = entry.title;
  $("entry-description").textContent = entry.description;
  $("entry-category").textContent =
    t(entry.category) +
    " / " +
    (entry.kind === "sound" ? entry.soundId : entry.id);
  $("entry-number").textContent = entry.number;
  renderIndex();
  renderMath(entry);
  renderSource(entry);
  renderAudio(entry);
  renderParameters(entry);
  if (saved) {
    for (const control of saved.controls) {
      const element = $(control.id);
      if (element) {
        element.value = control.value;
        element.checked = control.checked;
      }
    }
    for (const id of ["doors", "wear"])
      if ($(id + "-value"))
        $(id + "-value").textContent = formatNumber($(id).value);
    if (
      saved.source &&
      [...$("source-select").options].some(
        (option) => option.value === saved.source,
      )
    ) {
      $("source-select").value = saved.source;
      $("source-select").dispatchEvent(new Event("change"));
    }
    for (const [name, variant] of saved.variants) {
      const select = document.querySelector(`[data-sound="${name}"] select`);
      if (select) select.value = variant;
    }
    $("entry-list").scrollTop = saved.indexScroll;
  }
  setTab(saved ? saved.tab : entry.kind === "sound" ? "audio" : "math");
  await updatePreview();
  if (saved && activeEntry.id === entry.id) {
    if (viewer && saved.camera)
      [viewer.theta, viewer.phi, viewer.distance] = saved.camera;
    window.scrollTo({ top: saved.scroll, behavior: "instant" });
  }
}
$("rotate").addEventListener("click", () => {
  autoRotate = !autoRotate;
  $("rotate").setAttribute("aria-pressed", String(autoRotate));
});
$("wireframe").addEventListener("click", () => {
  wireframe = !wireframe;
  $("wireframe").setAttribute("aria-pressed", String(wireframe));
  viewer?.setWireframe(wireframe);
});
$("reset-view").addEventListener("click", () => {
  viewer?.reset();
  viewer?.resize();
});
function fromHash() {
  const entry = byId.get(location.hash.slice(1));
  if (entry) selectEntry(entry);
  else {
    if (location.hash)
      history.replaceState(
        null,
        "",
        location.pathname + location.search + "#container20",
      );
    selectEntry(entries[0]);
  }
}
window.addEventListener("hashchange", fromHash);
$("language").addEventListener("change", async (event) => {
  const id = activeEntry.id;
  rememberLanguage(event.target.value);
  entries = buildEntries(api);
  byId = new Map(entries.map((entry) => [entry.id, entry]));
  applyStaticTranslations();
  renderCounts();
  await selectEntry(byId.get(id), true);
});
applyStaticTranslations();
renderCounts();
fromHash();
initializeSelects();
let previous = performance.now(),
  lastSignal = 0,
  loopError = false;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - previous) / 1000, 0.05);
  previous = now;
  if (document.hidden) return;
  try {
    if (viewer && !$("object-view").hidden) viewer.frame(dt);
    if (!$("signal-view").hidden && now - lastSignal > 60) {
      drawSignal();
      lastSignal = now;
    }
  } catch (error) {
    if (!loopError) {
      loopError = true;
      $("stage-message").textContent = error.message;
      console.error(error);
    }
  }
}
requestAnimationFrame(frame);
