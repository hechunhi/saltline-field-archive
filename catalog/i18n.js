export const languages = ["en", "de", "zh"];
export const languageTags = { en: "en", de: "de", zh: "zh-Hans" };
const numberLocales = { en: "en-US", de: "de-DE", zh: "zh-CN" };
export const languageStorageKey = "saltline.catalog.language";
let currentLanguage = "en";

// The German message is the source key; the other columns are English and Chinese.
export const messages = {
  "Saltline — Objekt- & Klangkatalog": [
    "Saltline — Object & Sound Catalog",
    "Saltline — 物体与声音图鉴",
  ],
  Sprache: ["Language", "语言"],
  "Objekt- & Klangkatalog ↗": ["Object & Sound Catalog ↗", "物体与声音图鉴 ↗"],
  "Saltline Spiel öffnen": ["Open the Saltline game", "打开 Saltline 游戏"],
  "DIE MATHEMATIK DES HAFENS": [
    "THE MATHEMATICS OF THE HARBOR",
    "港口背后的数学",
  ],
  "ZUM SPIEL": ["PLAY THE GAME", "进入游戏"],
  "FIELD ARCHIVE / 01": ["FIELD ARCHIVE / 01", "实地档案 / 01"],
  "PROZEDURALES ARCHIV": ["PROCEDURAL ARCHIVE", "程序化生成档案"],
  "Form. Funktion.": ["Form. Function.", "形态。函数。"],
  "Frequenz.": ["Frequency.", "频率。"],
  "Die Objekte und Klänge von Saltline, aus ihrem Code herausgelöst.": [
    "The objects and sounds of Saltline, extracted from their code.",
    "从代码中提取 Saltline 的物体与声音。",
  ],
  "Geometrie untersuchen, Formeln verstehen, Synthese hören.": [
    "Explore geometry, understand the formulas, hear the synthesis.",
    "探索几何，理解公式，聆听合成音效。",
  ],
  "Umfang des Katalogs": ["Catalog contents", "图鉴内容统计"],
  HAFENOBJEKTE: ["HARBOR OBJECTS", "港口物体"],
  KLÄNGE: ["SOUNDS", "声音"],
  FUNKTIONEN: ["FUNCTIONS", "函数"],
  "Katalog durchsuchen": ["Search the catalog", "搜索图鉴"],
  "Objekt, Klang oder Funktion …": [
    "Object, sound or function …",
    "物体、声音或函数…",
  ],
  Kategorien: ["Categories", "分类"],
  Alle: ["All", "全部"],
  Logistik: ["Logistics", "物流"],
  Infrastruktur: ["Infrastructure", "基础设施"],
  Technik: ["Equipment", "设备"],
  Modelle: ["Models", "模型"],
  Umwelt: ["Environment", "环境"],
  Mathematik: ["Mathematics", "数学"],
  Sound: ["Sound", "声音"],
  VERZEICHNIS: ["INDEX", "目录"],
  "{count} EINTRÄGE": ["{count} ENTRIES", "{count} 个条目"],
  "Keine Einträge gefunden.": ["No entries found.", "未找到条目。"],
  "Suchbegriff oder Kategorie ändern.": [
    "Try a different search or category.",
    "请更换关键词或分类。",
  ],
  "Geometrie und Sound entstehen lokal.": [
    "Geometry and sound are generated locally.",
    "几何与声音均在本地生成。",
  ],
  "Keine externen Modelle oder Audiodateien.": [
    "No external models or audio files.",
    "无需外部模型或音频文件。",
  ],
  "Archiv wird geöffnet …": ["Opening the archive …", "正在打开档案…"],
  "Drehbare 3D-Vorschau": ["Interactive 3D preview", "可旋转的三维预览"],
  "Wellenform oder Funktionsgraph": [
    "Waveform or function plot",
    "波形或函数图像",
  ],
  "LIVE / GEOMETRIE": ["LIVE / GEOMETRY", "实时 / 几何"],
  "Wird geladen": ["Loading", "加载中"],
  "ZIEHEN · DREHEN / SCROLLEN · ZOOM": [
    "DRAG · ROTATE / SCROLL · ZOOM",
    "拖动旋转 / 滚动缩放",
  ],
  "↻ Rotation": ["↻ Rotate", "↻ 自动旋转"],
  Drahtgitter: ["Wireframe", "线框"],
  "Ansicht zurücksetzen": ["Reset view", "重置视图"],
  Details: ["Details", "详情"],
  Quellcode: ["Source code", "源代码"],
  "SALTLINE / LOKALES ARCHIV": [
    "SALTLINE / LOCAL ARCHIVE",
    "SALTLINE / 本地档案",
  ],
  "Extraktionsnachweis ↗": ["Extraction manifest ↗", "提取清单 ↗"],
  Audiosteuerung: ["Audio controls", "音频控制"],
  "SOUND BEREIT · START PER KLICK": [
    "AUDIO READY · CLICK TO PLAY",
    "音频就绪 · 点击播放",
  ],
  LAUTSTÄRKE: ["VOLUME", "音量"],
  "■ Alles stoppen": ["■ Stop all", "■ 全部停止"],
  "Der interaktive Katalog benötigt JavaScript.": [
    "The interactive catalog requires JavaScript.",
    "交互式图鉴需要启用 JavaScript。",
  ],
  "Aus den Konstruktions- und Synthesefunktionen": [
    "From the construction and synthesis functions",
    "源自构造与合成函数",
  ],
  "Die Formeln erläutern die Originalimplementierung. Vereinfachungen und Auszüge sind beschrieben. Der Tab „Quellcode“ enthält die ausführbaren Funktionen mit ihren ursprünglichen Variablennamen.":
    [
      "The formulas explain the original implementation. Simplifications and excerpts are identified. The Source code tab contains the executable functions with their original variable names.",
      "这些公式解释了原始实现，并标明简化与节选部分。“源代码”选项卡展示可执行函数，保留原始变量名。",
    ],
  "Quellfunktion auswählen": ["Select a source function", "选择源函数"],
  "Parameter: {name}": ["Parameters: {name}", "参数：{name}"],
  "Soundbank-Eintrag": ["Sound bank entry", "声音库条目"],
  "Code kopieren": ["Copy code", "复制代码"],
  "Parameterblock {name} aus game.js": [
    "Parameter block {name} from game.js",
    "game.js 中的参数块 {name}",
  ],
  "{name} aus game.js": ["{name} from game.js", "game.js 中的 {name}"],
  "Originalzeile {line} · Byte {byte}": [
    "Original line {line} · byte {byte}",
    "原始行号 {line} · 字节偏移 {byte}",
  ],
  "Für die Lesbarkeit formatiert. SHA-256 der Quelldatei: {hash}": [
    "Formatted for readability. Source file SHA-256: {hash}",
    "已格式化以便阅读。源文件 SHA-256：{hash}",
  ],
  "Kopiert ✓": ["Copied ✓", "已复制 ✓"],
  "Bitte Code markieren": [
    "Please select the code to copy",
    "请选中代码后复制",
  ],
  "Web Audio ist in diesem Browser nicht verfügbar.": [
    "Web Audio is not available in this browser.",
    "此浏览器不支持 Web Audio。",
  ],
  "Audio konnte nicht gestartet werden. Erneut auf Abspielen klicken.": [
    "Audio could not start. Click Play again.",
    "音频无法启动，请再次点击播放。",
  ],
  "Klang nicht gefunden: {name}": [
    "Sound not found: {name}",
    "未找到声音：{name}",
  ],
  "Ungültige Audiodaten: {name}": [
    "Invalid audio data: {name}",
    "音频数据无效：{name}",
  ],
  "SOUND GESTOPPT": ["AUDIO STOPPED", "音频已停止"],
  "SYNTHETISIERE · {name}": ["SYNTHESIZING · {name}", "正在合成 · {name}"],
  "BEENDET · {name}": ["FINISHED · {name}", "播放结束 · {name}"],
  LOOP: ["LOOP", "循环"],
  SPIELT: ["PLAYING", "播放中"],
  "VARIANTE {number}": ["VARIANT {number}", "变体 {number}"],
  "{duration} s · {count} KANÄLE": [
    "{duration} s · {count} CHANNELS",
    "{duration} 秒 · {count} 声道",
  ],
  "{duration} s · 1 KANAL": [
    "{duration} s · 1 CHANNEL",
    "{duration} 秒 · 单声道",
  ],
  "Originale Synthese, ohne Raumpositionierung oder zusätzlichen Spielmix. Loops laufen bis zum Stoppen.":
    [
      "Original synthesis, without spatial positioning or the additional game mix. Loops continue until stopped.",
      "原始合成音效，不含空间定位与额外游戏混音。循环音效将持续播放，直到手动停止。",
    ],
  "Dieser Geometriefunktion ist kein eigener Klang zugeordnet.": [
    "No dedicated sound is assigned to this geometry function.",
    "此几何函数未关联专属声音。",
  ],
  "{name} abspielen": ["Play {name}", "播放{name}"],
  "{name} stoppen": ["Stop {name}", "停止{name}"],
  "Variante für {name}": ["Variant for {name}", "{name}的变体"],
  "{name} als WAV herunterladen": [
    "Download {name} as WAV",
    "将{name}下载为 WAV",
  ],
  IMPULSANTWORT: ["IMPULSE RESPONSE", "脉冲响应"],
  "ONE SHOT": ["ONE SHOT", "单次播放"],
  Samplerate: ["Sample rate", "采样率"],
  Varianten: ["Variants", "变体"],
  Wiedergabe: ["Playback", "播放方式"],
  Loop: ["Loop", "循环"],
  Impulsantwort: ["Impulse response", "脉冲响应"],
  Einzelklang: ["One shot", "单次音效"],
  Generator: ["Generator", "生成函数"],
  Dauer: ["Duration", "时长"],
  Kanäle: ["Channels", "声道"],
  "Samples / Kanal": ["Samples / channel", "每声道采样数"],
  "3D-Kontext unterbrochen. Seite zum Wiederherstellen neu laden.": [
    "3D context lost. Reload the page to restore it.",
    "三维渲染上下文已中断，请重新加载页面。",
  ],
  "Für diesen Eintrag wurde keine Geometrie erzeugt.": [
    "No geometry was generated for this entry.",
    "未能为此条目生成几何体。",
  ],
  "Die Objektgrenzen konnten nicht bestimmt werden.": [
    "The object bounds could not be determined.",
    "无法确定物体的边界。",
  ],
  "{count} DREIECKE": ["{count} TRIANGLES", "{count} 个三角形"],
  "Nennmaß / m": ["Nominal size / m", "标称尺寸 / 米"],
  "Abmessung / m": ["Dimensions / m", "尺寸 / 米"],
  Konstruktor: ["Constructor", "构造函数"],
  Geometrien: ["Geometries", "几何体数量"],
  Material: ["Material", "材质"],
  Darstellung: ["Display", "显示方式"],
  Originalskelett: ["Original skeleton", "原始骨架"],
  Originalgeometrie: ["Original geometry", "原始几何体"],
  "x / 12 Einheiten": ["x / 12 units", "x / 12 单位"],
  "t / 5 Sekunden": ["t / 5 seconds", "t / 5 秒"],
  "t / 0.8 Sekunden": ["t / 0.8 seconds", "t / 0.8 秒"],
  "Auf Abspielen klicken, um die originale Wellenform zu erzeugen.": [
    "Click Play to generate the original waveform.",
    "点击播放以生成原始波形。",
  ],
  SEED: ["SEED", "随机种子"],
  TÜREN: ["DOORS", "箱门开度"],
  FARBE: ["COLOR", "颜色"],
  Blau: ["Blue", "蓝色"],
  Rot: ["Red", "红色"],
  Grün: ["Green", "绿色"],
  Grau: ["Gray", "灰色"],
  Petrol: ["Teal", "蓝绿色"],
  VERSCHLEISS: ["WEAR", "磨损"],
  ZUSTAND: ["STATE", "状态"],
  Live: ["Live", "运行中"],
  "Wird getrennt": ["Disconnecting", "正在断开"],
  Getrennt: ["Disconnected", "已断开"],
  LIEGEND: ["ON ITS SIDE", "横放"],
  OFFEN: ["OPEN", "开口"],
  "ORIGINAL / AUDIOSYNTHESE": ["ORIGINAL / AUDIO SYNTHESIS", "原始 / 音频合成"],
  "LIVE / FUNKTIONSGRAPH": ["LIVE / FUNCTION PLOT", "实时 / 函数图像"],
  "ORIGINALPUFFER · VARIANTE IM TAB SOUND WÄHLEN": [
    "ORIGINAL BUFFER · SELECT A VARIANT IN THE SOUND TAB",
    "原始缓冲区 · 在声音选项卡中选择变体",
  ],
  "ORIGINALFUNKTION · NUMERISCH AUSGEWERTET": [
    "ORIGINAL FUNCTION · NUMERICALLY EVALUATED",
    "原始函数 · 数值计算",
  ],
  FUNKTIONSWERT: ["FUNCTION VALUE", "函数值"],
  "HÖRPROBE PER KLICK": ["CLICK TO PREVIEW AUDIO", "点击试听"],
  Funktion: ["Function", "函数"],
  Auswertung: ["Evaluation", "求值"],
  "600 Stützpunkte": ["600 sample points", "600 个采样点"],
  Quelle: ["Source", "来源"],
  Typ: ["Type", "类型"],
  Originalfunktion: ["Original function", "原始函数"],
  "GEOMETRIE WIRD ERZEUGT": ["GENERATING GEOMETRY", "正在生成几何体"],
  "VORSCHAU NICHT VERFÜGBAR": ["PREVIEW UNAVAILABLE", "预览不可用"],
  "Siehe unten": ["See below", "见下方"],
  "Separat abspielbar": ["Available separately", "可单独播放"],
};

export function normalizeLanguage(value) {
  if (typeof value !== "string") return null;
  const language = value.toLowerCase().split(/[-_]/)[0];
  return languages.includes(language) ? language : null;
}
export function getLanguage() {
  return currentLanguage;
}
export function setLanguage(value) {
  currentLanguage = normalizeLanguage(value) || "en";
  return currentLanguage;
}
export function initializeLanguage() {
  let saved;
  try {
    saved = localStorage.getItem(languageStorageKey);
  } catch {}
  return setLanguage(
    normalizeLanguage(new URL(location.href).searchParams.get("lang")) || saved,
  );
}
export function rememberLanguage(value) {
  setLanguage(value);
  try {
    localStorage.setItem(languageStorageKey, currentLanguage);
  } catch {}
  const url = new URL(location.href);
  url.searchParams.set("lang", currentLanguage);
  history.replaceState(null, "", url);
}
export function t(message, values = {}, language = currentLanguage) {
  if (language !== "de" && !Object.hasOwn(messages, message))
    throw new Error("Missing translation: " + message);
  const text =
    language === "de" ? message : messages[message][language === "zh" ? 1 : 0];
  return text.replace(/\{(\w+)\}/g, (_, key) =>
    String(values[key] ?? `{${key}}`),
  );
}
export function formatNumber(value, options = {}) {
  return Number(value).toLocaleString(numberLocales[currentLanguage], options);
}
export function applyStaticTranslations(root = document) {
  document.documentElement.lang = languageTags[currentLanguage];
  document.title = t("Saltline — Objekt- & Klangkatalog");
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  for (const attribute of ["aria-label", "placeholder"])
    root.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
      element.setAttribute(
        attribute,
        t(element.getAttribute(`data-i18n-${attribute}`)),
      );
    });
  document.getElementById("language").value = currentLanguage;
}
export function translateTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const key = node.textContent.trim();
    if (Object.hasOwn(messages, key))
      node.textContent = node.textContent.replace(key, t(key));
  }
}
