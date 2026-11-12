// One-off porting tool: rebuild src/ modules from the newer published bundle
// (original/game.js), reusing the existing module layout and readable names
// where statements are unchanged. Writes src/ and scripts/refactor-map.json.
//   node scripts/port-modules.mjs --dry   (report only)
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import prettier from "prettier";

const traverse = traverseModule.default ?? traverseModule;
const root = new URL("../", import.meta.url);
const DRY = process.argv.includes("--dry");
const VENDOR = "vendor/three-r180.js";

const oldMap = JSON.parse(await readFile(new URL("scripts/refactor-map.json", root), "utf8"));
if (oldMap.originalArchive !== "archive/original.html") {
  console.error("Already ported: refactor-map.json targets " + oldMap.originalArchive + ". Restore the fps3ademo map/src to re-run.");
  process.exit(1);
}
const al = JSON.parse(await readFile(new URL("scripts/.align.json", root), "utf8"));
const NEW = await readFile(new URL("scripts/.new-formatted.js", root), "utf8");

// Where inserted runs go when the neighbouring module is the wrong home.
// key: first new statement index of the run -> module file
const RUN_OVERRIDES = JSON.parse(process.env.RUN_OVERRIDES || "{}");
try {
  Object.assign(RUN_OVERRIDES, JSON.parse(await readFile(new URL("scripts/port-overrides.json", root), "utf8")));
} catch {}

// ---------- new bundle statements + root bindings ----------
const newAst = parse(NEW);
let rootFn;
traverse(newAst, {
  ArrowFunctionExpression(p) { rootFn = p; p.stop(); },
});
const rootScope = rootFn.scope;
const newStmts = [];
for (const node of rootFn.node.body.body) {
  if (node.type === "VariableDeclaration")
    for (const d of node.declarations) newStmts.push({ node, decl: d, kind: node.kind });
  else newStmts.push({ node, decl: null });
}
const newGlobals = new Set(Object.keys(traverse.NodePath ? {} : {}));
// root binding references: collect per statement
const stmtIndexAt = (pos) => {
  let lo = 0, hi = newStmts.length - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (stmtStart(m) <= pos) lo = m; else hi = m - 1;
  }
  return lo;
};
function stmtStart(i) { const s = newStmts[i]; return s.decl ? s.decl.start : s.node.start; }
function stmtEnd(i) { const s = newStmts[i]; return s.decl ? s.decl.end : s.node.end; }

const refs = newStmts.map(() => []); // {start,end,name,shorthandKey}
const programGlobals = new Set();
traverse(newAst, {
  Program(p) { for (const g of Object.keys(p.scope.globals)) programGlobals.add(g); },
  Identifier(p) {
    if (!p.isReferencedIdentifier() && !p.isBindingIdentifier()) return;
    const b = p.scope.getBinding(p.node.name);
    if (!b || b.scope !== rootScope) return;
    const parent = p.parent;
    if ((parent.type === "ObjectProperty") && parent.shorthand && p.key === "key") return;
    const i = stmtIndexAt(p.node.start);
    refs[i].push({
      start: p.node.start, end: p.node.end, name: p.node.name,
      shorthand: parent.type === "ObjectProperty" && parent.shorthand && p.key === "value",
      path: p,
    });
  },
});

// ---------- old modules: statement text by original index ----------
const oldText = new Map(); // oldIdx -> text (with leading comments)
const oldHeader = new Map(); // file -> header comment text
const oldExports = new Map(); // file -> Map(local -> exported)
for (const m of oldMap.modules) {
  const code = await readFile(new URL(`src/${m.file}`, root), "utf8");
  const ast = parse(code, { sourceType: "module" });
  const body = ast.program.body;
  const first = body[0];
  const header = first ? code.slice(0, (first.leadingComments?.[0]?.start ?? first.start)) : "";
  oldHeader.set(m.file, header.trim());
  const ex = new Map();
  for (const n of body)
    if (n.type === "ExportNamedDeclaration")
      for (const s of n.specifiers) ex.set(s.local.name, s.exported.name);
  oldExports.set(m.file, ex);
  const stmts = body.filter((n) => !["ImportDeclaration", "ExportNamedDeclaration"].includes(n.type));
  if (stmts.length !== m.statements.length) throw new Error(`count mismatch ${m.file}`);
  stmts.forEach((n, k) => {
    const lead = n.leadingComments?.filter((c) => c.start >= (k ? stmts[k - 1].end : header.length));
    const start = lead?.length ? lead[0].start : n.start;
    oldText.set(m.statements[k], code.slice(start, n.end));
  });
}
const oldModuleOf = new Map();
for (const m of oldMap.modules) for (const s of m.statements) oldModuleOf.set(s, m.file);

// ---------- module assignment ----------
const assign = new Array(newStmts.length);
const kindOf = new Array(newStmts.length);
const oldOf = new Array(newStmts.length).fill(null);
{
  let last = null;
  const runs = [];
  let run = null;
  for (const [op, i, j] of al.ops) {
    if (i != null) last = oldModuleOf.get(i);
    if (op === "insert") {
      if (!run) { run = { start: j, prev: last, items: [] }; runs.push(run); }
      run.items.push(j);
    } else {
      if (run) run.next = i != null ? oldModuleOf.get(i) : null;
      run = null;
    }
    if (j != null) {
      kindOf[j] = op;
      if (op === "equal" || op === "replace") { assign[j] = oldModuleOf.get(i); oldOf[j] = i; }
    }
  }
  for (const r of runs) {
    const target = RUN_OVERRIDES[r.start] || r.prev || r.next;
    for (const j of r.items) assign[j] = target;
    if (DRY) console.log(`run @${r.start} (${r.items.length}) prev=${r.prev} next=${r.next} -> ${target}`);
  }
}
for (const [k, v] of Object.entries(RUN_OVERRIDES)) {
  // single-statement override form "s:<idx>"
  if (k.startsWith("s:")) assign[+k.slice(2)] = v;
}

// ---------- names ----------
const declOf = (j) => {
  const s = newStmts[j];
  if (s.decl) return s.decl.id.type === "Identifier" ? [s.decl.id.name] : [];
  if (s.node.id && (s.node.type === "FunctionDeclaration" || s.node.type === "ClassDeclaration")) return [s.node.id.name];
  return [];
};
const entity = new Map(); // newName -> {module, internal, external}
const usedExternal = new Set();
for (let j = 0; j < newStmts.length; j++) {
  const names = declOf(j);
  const oi = oldOf[j];
  names.forEach((nm, k) => {
    const mod = assign[j];
    let internal, external;
    if (oi != null && al.oldDecl[oi][k] != null) {
      const old = al.oldDecl[oi][k];
      const alias = oldMap.rootAliases[old] || old;
      if (mod === VENDOR) {
        internal = nm;
        external = oldExports.get(VENDOR).get(old) || nm;
      } else { internal = external = alias; }
    } else {
      internal = external = nm;
    }
    entity.set(nm, { module: mod, internal, external, inserted: oi == null });
  });
}
// dedupe external names (inserted entities yield)
const byExt = new Map();
for (const [nm, e] of entity) {
  if (!byExt.has(e.external)) byExt.set(e.external, []);
  byExt.get(e.external).push(nm);
}
const reserved = new Set([...programGlobals]);
for (const [ext, list] of byExt) {
  if (list.length === 1 && !reserved.has(ext)) continue;
  const keep = list.find((n) => !entity.get(n).inserted && entity.get(n).module !== VENDOR) ?? list.find((n) => !entity.get(n).inserted) ?? (reserved.has(ext) ? null : list[0]);
  let c = 2;
  for (const n of list) {
    if (n === keep) continue;
    const e = entity.get(n);
    if (!e.inserted && e.module !== VENDOR) console.warn(`!! name clash on non-inserted ${ext}`);
    let alt;
    do alt = `${ext}_${c++}`; while (byExt.has(alt) || reserved.has(alt));
    e.internal = e.external = alt;
  }
}
// vendor internals must not collide with any external name elsewhere
{
  const taken = new Set([...reserved]);
  for (const [, e] of entity) taken.add(e.external);
  for (const [nm, e] of entity) {
    if (e.module !== VENDOR || e.internal === e.external) continue;
    if (!taken.has(e.internal)) continue;
    let c = 1, alt;
    do alt = `${nm}$v${c++}`; while (taken.has(alt));
    taken.add(alt);
    e.internal = alt;
  }
}
// local shadowing check for renamed refs in new text
const conflicts = [];
function finalName(newName, fromModule) {
  const e = entity.get(newName);
  return e.module === fromModule ? e.internal : e.external;
}

// ---------- emit statement text ----------
function newTextOf(j) {
  const s = newStmts[j];
  const mod = assign[j];
  const start = stmtStart(j), end = stmtEnd(j);
  let out = "", pos = start;
  for (const r of refs[j].sort((a, b) => a.start - b.start)) {
    const fn = finalName(r.name, mod);
    if (fn !== r.name) {
      const shadow = r.path.scope.getBinding(fn);
      if (shadow && shadow.scope !== rootScope) conflicts.push(`${mod}: ${r.name}->${fn} shadowed`);
    }
    out += NEW.slice(pos, r.start) + (r.shorthand ? `${r.name}: ${fn}` : fn);
    pos = r.end;
  }
  out += NEW.slice(pos, end);
  if (s.decl) out = `${s.kind} ${out};`;
  // leading comments are not present in minified bundle
  return out;
}

let refFallbacks = 0;
function rootRefs(code) {
  const ast = parse(code, { sourceType: "module" });
  const out = [];
  traverse(ast, {
    Identifier(p) {
      if (!p.isReferencedIdentifier() && !p.isBindingIdentifier()) return;
      if (p.parent.type === "ObjectProperty" && p.parent.shorthand && p.key === "key") return;
      const b = p.scope.getBinding(p.node.name);
      if (!b || b.scope.path.isProgram()) out.push(p.node.name);
    },
  });
  return out.join(",");
}
const modules = new Map(); // file -> {stmts: [j], text: []}
for (let j = 0; j < newStmts.length; j++) {
  const f = assign[j];
  if (!f) throw new Error(`unassigned statement ${j}`);
  if (!modules.has(f)) modules.set(f, { stmts: [], text: [] });
  const m = modules.get(f);
  m.stmts.push(j);
  const fresh = newTextOf(j);
  let text = fresh;
  if (kindOf[j] === "equal" && f !== VENDOR) {
    const kept = oldText.get(oldOf[j]);
    if (rootRefs(kept) === rootRefs(fresh)) text = kept; else refFallbacks++;
  }
  m.text.push(text);
}

// ---------- imports / exports ----------
const extOwner = new Map();
for (const [, e] of entity) extOwner.set(e.external, e.module);
const imports = new Map(); // file -> Map(src -> Set(name))
const exportsOf = new Map(); // file -> Set(internal)
for (const f of modules.keys()) { imports.set(f, new Map()); exportsOf.set(f, new Set()); }
const internalByExt = new Map();
for (const [, e] of entity) internalByExt.set(`${e.module}|${e.external}`, e.internal);

const unresolved = [];
for (const [f, m] of modules) {
  const code = m.text.join("\n\n");
  let ast;
  try { ast = parse(code, { sourceType: "module" }); } catch (e) { throw new Error(`${f}: ${e.message}`); }
  let globals;
  traverse(ast, { Program(p) { globals = Object.keys(p.scope.globals); p.stop(); } });
  for (const g of globals) {
    const owner = extOwner.get(g);
    if (owner && owner !== f) {
      const im = imports.get(f);
      if (!im.has(owner)) im.set(owner, new Set());
      im.get(owner).add(g);
      exportsOf.get(owner).add(g);
    } else if (!programGlobals.has(g)) unresolved.push(`${f}: ${g}`);
  }
}
// keep previous exports that still exist (showcase hooks etc.)
for (const [f, ex] of oldExports) {
  if (!modules.has(f)) continue;
  for (const [, exported] of ex) if (extOwner.get(exported) === f) exportsOf.get(f).add(exported);
}

// cycle check
const deps = new Map([...imports].map(([f, im]) => [f, [...im.keys()]]));
const cycles = [];
{
  const state = new Map();
  const visit = (f, stack) => {
    if (state.get(f) === 1) { cycles.push([...stack.slice(stack.indexOf(f)), f].join(" -> ")); return; }
    if (state.get(f) === 2) return;
    state.set(f, 1);
    for (const d of deps.get(f) || []) visit(d, [...stack, f]);
    state.set(f, 2);
  };
  for (const f of deps.keys()) visit(f, []);
}

console.log(`equal statements re-emitted from new text (refs changed): ${refFallbacks}`);
console.log(`modules ${modules.size}; statements ${newStmts.length}`);
console.log(`unresolved ${unresolved.length}`, unresolved.slice(0, 20));
console.log(`shadow conflicts ${conflicts.length}`, [...new Set(conflicts)].slice(0, 20));
console.log(`cycles ${cycles.length}`, [...new Set(cycles)].slice(0, 10));
const newModules = [...modules.keys()].filter((f) => !oldExports.has(f));
console.log("new module files", newModules);
if (DRY) process.exit(0);
if (unresolved.length || cycles.length || conflicts.length) { console.error("refusing to write"); process.exit(1); }

// ---------- write ----------
for (const [f, m] of modules) {
  const rel = (to) => {
    let r = path.relative(path.dirname(f), to);
    if (!r.startsWith(".")) r = "./" + r;
    return r;
  };
  const im = [...imports.get(f)].sort(([a], [b]) => a.localeCompare(b))
    .map(([src, names]) => {
      const list = [...names].sort();
      return `import { ${list.join(", ")} } from "${rel(src)}";`;
    });
  const ex = [...exportsOf.get(f)].sort().map((ext) => {
    const internal = internalByExt.get(`${f}|${ext}`) ?? ext;
    return internal === ext ? ext : `${internal} as ${ext}`;
  });
  const header = oldHeader.get(f) || `// Ported from the newer Saltline bundle (${f}).`;
  let code = `${header}\n${im.join("\n")}\n\n${m.text.join("\n\n")}\n${ex.length ? `\nexport { ${ex.join(", ")} };\n` : ""}`;
  code = await prettier.format(code, { parser: "babel" });
  const url = new URL(`src/${f}`, root);
  await mkdir(new URL(".", url), { recursive: true });
  await writeFile(url, code);
}
const aliases = {};
for (const [nm, e] of entity) if (e.external !== nm) aliases[nm] = e.external;
await writeFile(new URL("scripts/refactor-map.json", root), JSON.stringify({
  originalArchive: "original/game.js",
  rootAliases: aliases,
  // module-local names that differ from the bundle (vendor internals renamed
  // to avoid clashing with readable root names); maps module name -> bundle name
  moduleAliases: { [VENDOR]: Object.fromEntries([...entity].filter(([nm, e]) => e.module === VENDOR && e.internal !== nm).map(([nm, e]) => [e.internal, nm])) },
  modules: [...modules].map(([file, m]) => ({ file, statements: m.stmts })),
}, null, 2) + "\n");
console.log("written");
