import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import katex from "katex";
import { buildEntries, mathFormulas } from "../catalog/data.js";

const root = resolve(import.meta.dir, "..");
// Instantiate the additional model formulas; no renderer or sound synthesis needed.
buildEntries({ sizes: {}, audioBank: {}, functions: {} });
const markup = Object.fromEntries(
  mathFormulas.map((formula) => [
    formula.equation,
    katex.renderToString(formula.equation, {
      displayMode: true,
      output: "htmlAndMathml",
      throwOnError: true,
      strict: "error",
      trust: false,
    }),
  ]),
);
await Bun.write(
  resolve(root, "catalog/math.js"),
  "// Generated with KaTeX; HTML for visual math and MathML for assistive technology.\n" +
    "export const mathMarkup = " +
    JSON.stringify(markup) +
    ";\n",
);
const vendor = resolve(root, "assets/katex");
await mkdir(vendor, { recursive: true });
for (const path of ["katex.min.css", "fonts"]) {
  await cp(
    resolve(root, "node_modules/katex/dist", path),
    resolve(vendor, path),
    { recursive: true },
  );
}
await cp(
  resolve(root, "node_modules/katex/LICENSE"),
  resolve(vendor, "LICENSE"),
);
console.log(
  `${Object.keys(markup).length} Formeln als HTML und MathML gesetzt; Styles und Fonts lokal kopiert.`,
);
