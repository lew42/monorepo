// node public/framework/code/patterns/function-bag-census.mjs [--top 40] [--all]
// The refactor backlog for CLAUDE.md "Write classes, not function bags": every .js file under
// public/framework that holds loose functions and no class of its own, ranked worst first.
// Counts are computed from the source text, so they are a ranking, not a verdict.
//   fn       = top-level functions (function declarations, and const x = (...) => / function)
//   exports  = named exports that are functions
//   lines    = file length
//   score    = fn + 2 x exports + lines / 100
// A file with `export class` is skipped; so are the ai/<date> task dirs, shots, runs, worktrees.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : (process.argv[i + 1] ?? true); };
const top = Number(arg("--top")) || 40;
const rows = [];
const skip = /^(\d{4}(-\d\d-\d\d)?|\d\d|node_modules|shots|runs|worktrees|\.git)$/;

function walk(d){
	for (const e of fs.readdirSync(d, { withFileTypes: true })){
		const p = path.join(d, e.name);
		if (e.isDirectory()){ if (!skip.test(e.name)) walk(p); continue; }
		if (!e.name.endsWith(".js") || e.name.endsWith(".test.js")) continue;
		const src = fs.readFileSync(p, "utf8");
		if (/^(export\s+(default\s+)?)?class\s+\w+/m.test(src)) continue;   // has a class: not a bag
		const fn = (src.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*\w+|^(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>|^(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?function/gm) ?? []).length;
		const exports = (src.match(/^export\s+(?:async\s+)?function\s+\w+|^export\s+const\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/gm) ?? []).length;
		if (fn < 3) continue;
		const lines = src.split("\n").length;
		rows.push({ file: path.relative(root, p).replace(/\\/g, "/"), fn, exports, lines, score: fn + 2 * exports + lines / 100 });
	}
}
walk(root);
rows.sort((a, b) => b.score - a.score);
const shown = arg("--all") ? rows : rows.slice(0, top);
console.log(`${rows.length} files hold 3+ loose functions and no class (showing ${shown.length}). score = fn + 2*exports + lines/100`);
console.log("score  fn exports lines  file");
for (const r of shown) console.log(`${r.score.toFixed(1).padStart(5)} ${String(r.fn).padStart(3)} ${String(r.exports).padStart(6)} ${String(r.lines).padStart(5)}  ${r.file}`);
const pages = rows.filter(r => /(^|\/)page\.js$/.test(r.file));
console.log(`\n${pages.length} of these are page.js files (a page.js should only import a class and instantiate it).`);
