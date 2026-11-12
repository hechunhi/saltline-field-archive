import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { buildEntries } from "../catalog/data.js";
import { mathMarkup } from "../catalog/math.js";
import { languages, messages, getLanguage } from "../catalog/i18n.js";

const root = resolve(import.meta.dir, "..");
const original = await Bun.file(resolve(root, "original/game.js")).text();
const engine = await Bun.file(resolve(root, "catalog/engine.js")).text();
const manifest = await Bun.file(resolve(root, "catalog/manifest.json")).json();
const hash = new Bun.CryptoHasher("sha256").update(original).digest("hex");
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
check(
  hash === manifest.sha256,
  "Katalog veraltet. Zuerst bun run catalog:extract ausführen.",
);
function load(source: string) {
  const sandbox: any = {
    window: { addEventListener() {} },
    document: {
      getElementById() {
        return null;
      },
    },
    console: { log() {}, warn() {}, error() {} },
    setTimeout,
    clearTimeout,
    performance,
    AbortController,
    URL,
  };
  runInNewContext(source, sandbox);
  return sandbox.SaltlineCatalog;
}
const reference = load(
  original.replace(
    "cL().catch(n=>yT(n&&n.stack||n));",
    "globalThis.SaltlineCatalog={synthesize:K6,audioBank:Ir};",
  ),
);
const catalog = load(engine);
check(
  catalog.source.sha256 === hash,
  "Die Engine gehört nicht zum aktuellen Quellcode.",
);
const sourceBytes = new TextEncoder().encode(original);
for (const [name, location] of Object.entries(catalog.source.locations) as [
  string,
  any,
][]) {
  const prefix = new TextDecoder().decode(
    sourceBytes.subarray(location.byte, location.byte + 160),
  );
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  check(
    new RegExp(
      "^(?:(?:async\\s+)?function(?:\\s+|\\s*\\*\\s*)" +
        escaped +
        "\\(|" +
        escaped +
        "=)",
    ).test(prefix),
    `Falsche Byte-Fundstelle: ${name}`,
  );
}
const entries = buildEntries(catalog);
check(getLanguage() === "en", "Die Standardsprache muss Englisch sein.");
const referenceEntries = buildEntries(catalog, "de");
for (const language of languages) {
  const localized = buildEntries(catalog, language);
  check(
    localized.length === entries.length,
    `Unvollständiger Katalog: ${language}`,
  );
  for (const [index, entry] of localized.entries()) {
    const reference = referenceEntries[index];
    check(
      entry.id === reference.id && entry.builder === reference.builder,
      `Geänderte Objektzuordnung: ${language}/${entry.id}`,
    );
    check(
      JSON.stringify(entry.sounds) === JSON.stringify(reference.sounds),
      `Geänderte Klangzuordnung: ${language}/${entry.id}`,
    );
    check(
      entry.description.length > 0 && entry.title.length > 0,
      `Fehlender Text: ${language}/${entry.id}`,
    );
    if (language === "zh")
      check(
        /[\u3400-\u9fff]/u.test(entry.title) &&
          /[\u3400-\u9fff]/u.test(entry.description),
        `Chinesischer Text fehlt: ${entry.id}`,
      );
    for (const [i, formula] of entry.formulas.entries()) {
      check(
        formula.equation === reference.formulas[i].equation,
        `Geänderte Formel: ${language}/${entry.id}`,
      );
      check(
        formula.title.length > 0 && formula.explanation.length > 0,
        `Formelübersetzung fehlt: ${language}/${entry.id}`,
      );
    }
  }
}
for (const [source, translations] of Object.entries(messages)) {
  const placeholders = (text: string) =>
    [...text.matchAll(/\{(\w+)\}/g)]
      .map((match) => match[1])
      .sort()
      .join(",");
  for (const text of translations)
    check(
      text.length > 0 && placeholders(text) === placeholders(source),
      `Unvollständige UI-Übersetzung: ${source}`,
    );
}
check(
  new Set(entries.map((entry) => entry.id)).size === entries.length,
  "Doppelte Katalog-IDs.",
);
check(
  entries.filter((entry) => entry.kind === "prop").length ===
    Object.keys(catalog.sizes).length,
  "Hafenobjekte fehlen.",
);
for (const entry of entries) {
  check(
    catalog.functions[entry.builder],
    `Quellfunktion fehlt: ${entry.id} / ${entry.builder}`,
  );
  check(
    entry.sounds.every((name) => catalog.audioBank[name]),
    `Unbekannter Klang: ${entry.id}`,
  );
  for (const formula of entry.formulas)
    check(
      mathMarkup[formula.equation]?.includes("<math"),
      `Gesetzte Formel fehlt: ${formula.title}`,
    );
  for (const name of entry.sources) {
    const location = catalog.source.locations[name];
    check(location && location.byte >= 0, `Fundstelle fehlt: ${name}`);
  }
}
let variants = 0,
  samples = 0;
for (const [name, spec] of Object.entries(catalog.audioBank) as [
  string,
  any,
][]) {
  check(reference.audioBank[name], `Klang nicht im Original: ${name}`);
  for (let variant = 0; variant < spec.n; variant++) {
    const actual = catalog.synthesize(name, variant);
    const expected = reference.synthesize(name, variant);
    check(
      actual.sr === expected.sr &&
        actual.loop === expected.loop &&
        actual.ch.length === expected.ch.length,
      `Audioformat verändert: ${name} / ${variant}`,
    );
    for (let channel = 0; channel < actual.ch.length; channel++) {
      const a = actual.ch[channel],
        e = expected.ch[channel];
      check(
        a.length === e.length && a.length > 0,
        `Audiolänge verändert: ${name} / ${variant}`,
      );
      let energy = 0;
      for (let i = 0; i < a.length; i++) {
        check(Number.isFinite(a[i]), `Ungültiges Sample: ${name} / ${variant}`);
        check(
          a[i] === e[i],
          `Audiosynthese verändert: ${name} / ${variant} / Sample ${i}`,
        );
        energy += a[i] * a[i];
      }
      check(energy > 0, `Stummer Puffer: ${name} / ${variant}`);
      samples += a.length;
    }
    variants++;
  }
}
console.log(
  `${entries.length} Einträge, ${Object.keys(catalog.audioBank).length} Klänge, ${variants} Varianten geprüft.`,
);
console.log(
  `${samples.toLocaleString("de")} Samples sind endlich, nicht stumm und exakt gleich dem Original.`,
);
console.log(`Original game.js unverändert: SHA-256 ${hash}`);
