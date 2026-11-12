// Align top-level statements of the old (modularized) bundle with the newer
// published bundle. Writes scripts/.align.json for the porting step.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parse } from "@babel/parser";
import prettier from "prettier";

const root = new URL("../", import.meta.url);
const map = JSON.parse(await readFile(new URL("scripts/refactor-map.json", root), "utf8"));

async function statements(code) {
  const formatted = await prettier.format(code, { parser: "babel" });
  const ast = parse(formatted);
  const body = ast.program.body[0].expression.callee.body.body;
  const out = [];
  for (const node of body) {
    if (node.type === "VariableDeclaration")
      for (const d of node.declarations) out.push({ ...node, declarations: [d] });
    else out.push(node);
  }
  return { formatted, out };
}

const SKIP = new Set(["start", "end", "loc", "range", "extra", "leadingComments", "trailingComments", "innerComments", "comments"]);
function normalize(node) {
  const ids = new Map();
  const parts = [];
  function walk(n, parent, key) {
    if (n === null || typeof n !== "object") { parts.push(String(n)); return; }
    if (Array.isArray(n)) { parts.push("["); for (const c of n) walk(c, parent, key); parts.push("]"); return; }
    if (n.type === "Identifier") {
      const isProp =
        (parent && (parent.type === "MemberExpression" || parent.type === "OptionalMemberExpression") && key === "property" && !parent.computed) ||
        (parent && (parent.type === "ObjectProperty" || parent.type === "ObjectMethod" || parent.type === "ClassMethod" || parent.type === "ClassProperty") && key === "key" && !parent.computed && !parent.shorthand);
      if (isProp) parts.push("P:" + n.name);
      else { if (!ids.has(n.name)) ids.set(n.name, ids.size); parts.push("I" + ids.get(n.name)); }
      return;
    }
    parts.push("(" + n.type);
    for (const k of Object.keys(n)) {
      if (SKIP.has(k) || k === "type") continue;
      parts.push(k + "=");
      walk(n[k], n, k);
    }
    parts.push(")");
  }
  walk(node, null, null);
  return createHash("sha1").update(parts.join(" ")).digest("hex");
}
function declared(node) {
  if (node.type === "VariableDeclaration") {
    const id = node.declarations[0].id;
    return id.type === "Identifier" ? [id.name] : [];
  }
  if ((node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") && node.id) return [node.id.name];
  return [];
}

// The old side is the fps3ademo restoration source (before the port).
const oldHTML = await readFile(new URL("archive/original.html", root), "utf8");
const oldCode = oldHTML.match(/<script>\n?([\s\S]*?)<\/script>/)[1];
const newCode = await readFile(new URL("original/game.js", root), "utf8");
const A = await statements(oldCode);
const B = await statements(newCode);
const ha = A.out.map(normalize), hb = B.out.map(normalize);

// LCS-style alignment on hash lists (Myers via simple DP on anchors of unique hashes)
function align(a, b) {
  // patience-style: unique common hashes as anchors, then recurse; fallback to greedy
  const ops = [];
  function rec(a0, a1, b0, b1) {
    if (a0 >= a1 && b0 >= b1) return;
    if (a0 >= a1) { for (let j = b0; j < b1; j++) ops.push(["insert", null, j]); return; }
    if (b0 >= b1) { for (let i = a0; i < a1; i++) ops.push(["delete", i, null]); return; }
    // trim equal prefix
    if (a[a0] === b[b0]) { ops.push(["equal", a0, b0]); return rec(a0 + 1, a1, b0 + 1, b1); }
    const ca = new Map(), cb = new Map();
    for (let i = a0; i < a1; i++) ca.set(a[i], ca.has(a[i]) ? -1 : i);
    for (let j = b0; j < b1; j++) cb.set(b[j], cb.has(b[j]) ? -1 : j);
    const pairs = [];
    for (const [h, i] of ca) if (i >= 0 && cb.get(h) >= 0) pairs.push([i, cb.get(h)]);
    if (!pairs.length) {
      // no anchors: pair up positionally as replacements
      const n = Math.min(a1 - a0, b1 - b0);
      for (let k = 0; k < n; k++) ops.push(["replace", a0 + k, b0 + k]);
      for (let i = a0 + n; i < a1; i++) ops.push(["delete", i, null]);
      for (let j = b0 + n; j < b1; j++) ops.push(["insert", null, j]);
      return;
    }
    pairs.sort((x, y) => x[0] - y[0]);
    // LIS on b index
    const tails = [], prev = new Array(pairs.length);
    for (let k = 0; k < pairs.length; k++) {
      let lo = 0, hi = tails.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (pairs[tails[m]][1] < pairs[k][1]) lo = m + 1; else hi = m; }
      prev[k] = lo ? tails[lo - 1] : -1; tails[lo] = k;
    }
    const chain = []; for (let k = tails[tails.length - 1]; k >= 0; k = prev[k]) chain.unshift(pairs[k]);
    let pa = a0, pb = b0;
    for (const [i, j] of chain) { rec(pa, i, pb, j); ops.push(["equal", i, j]); pa = i + 1; pb = j + 1; }
    rec(pa, a1, pb, b1);
  }
  rec(0, a.length, 0, b.length);
  return ops;
}
const ops = align(ha, hb);
const moduleOf = new Map();
for (const m of map.modules) for (const s of m.statements) moduleOf.set(s, m.file);

const counts = {}; const perModule = {};
for (const [op, i, j] of ops) {
  counts[op] = (counts[op] || 0) + 1;
  if (op === "equal") continue;
  const file = i != null ? moduleOf.get(i) : null;
  const k = file || "(insert)";
  perModule[k] = (perModule[k] || 0) + 1;
}
const size = (S, i) => S.formatted.slice(S.out[i].start, S.out[i].end).length;
let bytes = { equal: 0, replace: 0, insert: 0, delete: 0 };
for (const [op, i, j] of ops) bytes[op] += op === "delete" ? size(A, i) : size(B, j);
console.log("old statements", A.out.length, "new statements", B.out.length);
console.log("ops", counts);
console.log("bytes (new side, delete=old)", bytes);
console.log("changed per module (top 25):");
for (const [k, v] of Object.entries(perModule).sort((x, y) => y[1] - x[1]).slice(0, 25)) console.log(" ", v, k);

await writeFile(new URL("scripts/.align.json", root), JSON.stringify({
  ops,
  oldDecl: A.out.map(declared),
  newDecl: B.out.map(declared),
}));
await writeFile(new URL("scripts/.new-formatted.js", root), B.formatted);
await writeFile(new URL("scripts/.old-formatted.js", root), A.formatted);
