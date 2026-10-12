// Measures Page.class.js per method: code/comment/blank lines, and which other files mention each name.
// usage: node public/framework/core/Page/doc/split-measure.mjs [--callers]
import fs from "node:fs"; import path from "node:path"; import cp from "node:child_process";
const root = path.resolve(import.meta.dirname, "../../../../..");
const file = path.join(root, "public/framework/core/Page/Page.class.js");
const L = fs.readFileSync(file, "utf8").split("\n");
const cls = L.findIndex(l => /^class Page\b|^export default class Page\b/.test(l));
const head = /^\t(?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?(\*?[A-Za-z_$#][\w$]*)\s*\([^)]*\)\s*\{/;
const kw = new Set(["if","for","while","switch","catch","return"]);
const ms = [];
for (let i = cls; i < L.length; i++) { const m = head.exec(L[i]); if (m && !kw.has(m[1])) ms.push({ name: m[1], line: i + 1, static: /^\tstatic/.test(L[i]) }); }
let code = 0, com = 0, blank = 0, inBlock = false;
const kind = l => { const t = l.trim(); if (!t) return "b"; if (inBlock) { if (t.includes("*/")) inBlock = false; return "c"; } if (t.startsWith("//")) return "c"; if (t.startsWith("/*")) { if (!t.includes("*/")) inBlock = true; return "c"; } return "k"; };
const k = L.map(kind);
for (const x of k) x === "k" ? code++ : x === "c" ? com++ : blank++;
console.log(`total ${L.length}: code ${code}, comment ${com}, blank ${blank}, methods ${ms.length}`);
// a method owns its preceding comment block + body up to next method's preceding comment
ms.forEach((m, j) => {
  let s = m.line - 1; while (s > 0 && k[s - 1] === "c") s--;
  const next = ms[j + 1]; let e = next ? next.line - 1 : L.length; if (next) while (e > m.line && k[e - 1] === "c") e--;
  m.start = s + 1; m.end = e; m.code = k.slice(s, e).filter(x => x === "k").length; m.com = k.slice(s, e).filter(x => x === "c").length;
});
let files = [];
if (process.argv.includes("--callers")) files = cp.execSync(`git ls-files "public/*.js" "Servex/*.js" "Servex/*.mjs" "Server/*.mjs"`, { cwd: root, encoding: "utf8", maxBuffer: 1e8 }).split("\n").filter(f => f && !f.endsWith("Page.class.js"));
const text = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(root, f), "utf8")]));
const rows = ms.map(m => { const re = new RegExp("[. ]" + m.name.replace(/[$#]/g, c => String.fromCharCode(92) + c) + " ?[(]"); const c = files.filter(f => re.test(text[f])); return `${String(m.start).padStart(5)}-${String(m.end).padEnd(5)} code ${String(m.code).padStart(3)} com ${String(m.com).padStart(3)} ${m.static ? "static " : ""}${m.name}${files.length ? "  <- " + c.length + " files" + (c.length ? " e.g. " + c.slice(0, 2).join(", ") : "") : ""}`; });
console.log(rows.join("\n"));
