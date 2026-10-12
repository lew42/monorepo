// ONE script that merges ai2 into ai: git mv + shims + exact-path rewrites + manifest.
//   node migrate.mjs            dry run (counts only, changes nothing)
//   node migrate.mjs --apply    do it; writes manifest.json beside this file
//   node migrate.mjs --revert   undo from manifest.json (moves back, removes shims, restores edited files)
// Nothing is deleted: every ai2 file moves (git mv) or stays; shims are new one-line files.
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.resolve(here, "../../../../..");
const FW = "public/framework", A2 = `${FW}/ai2`;
const apply = process.argv.includes("--apply"), revert = process.argv.includes("--revert");
const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 28 });
const MAN = path.join(here, "manifest.json");

// ---- the plan: where each ai2 file goes --------------------------------------------
const CARDS = "card outline activity tasks workspace fold faces real floating meter chat compose agents rules".split(" ");
const RAIL = "rail inbox groups live needs needs-rule log overview processes".split(" ");
const moves = {};                       // old rel (inside framework/) -> new rel
for (const n of CARDS) moves[`ai2/${n}.js`] = `ai/cards/${n}.js`;
for (const n of RAIL) moves[`ai2/${n}.js`] = `ai/rail/${n}.js`;
for (const f of ["rail.css", "processes.css", "groups.json", "overview/overview.json"]) moves[`ai2/${f}`] = `ai/rail/${f}`;
// the long old readme + decisions + images are the module's memory: they move to ai/doc/ai2/
const docFiles = []; (function w(d){ for (const e of fs.readdirSync(path.join(root, FW, d), { withFileTypes: true })) { const p = `${d}/${e.name}`; e.isDirectory() ? w(p) : docFiles.push(p); } })("ai2/doc");
for (const f of docFiles) moves[f] = f.replace("ai2/doc/", "ai/doc/ai2/");
moves["ai2/readme.md"] = "ai/doc/ai2/history.md";

if (revert) {
	const m = JSON.parse(fs.readFileSync(MAN, "utf8"));
	for (const s of m.shims) fs.rmSync(path.join(root, s), { force: true });
	for (const [o, n] of Object.entries(m.moves).reverse()) git("mv", `${FW}/${n}`, `${FW}/${o}`);
	for (const f of m.edited) git("checkout", "HEAD", "--", f);
	for (const f of m.created) fs.rmSync(path.join(root, f), { force: true });
	console.log("reverted"); process.exit(0);
}

// ---- 1. rewrite specs inside the files that move (and ai2/page.js, which stays) ----
const newOf = rel => moves[rel] ?? rel;
const SPEC = /((?:from\s*|import\s*\(\s*|import\s+|new URL\(\s*)["'])(\.{1,2}\/[^"']*)(["'])/g;
const edits = new Map();                // rel path (from repo root) -> new text
const textOf = rel => edits.get(rel) ?? fs.readFileSync(path.join(root, rel), "utf8");
const respec = (oldRel, text) => text.replace(SPEC, (all, pre, spec, post) => {
	const target = path.posix.normalize(path.posix.join(path.posix.dirname(oldRel), spec));
	const dest = newOf(target) ;
	const from = path.posix.dirname(newOf(oldRel));
	let r = path.posix.relative(from, dest); if (!r.startsWith(".")) r = "./" + r;
	if (spec.endsWith("/") && !r.endsWith("/")) r += "/";
	return pre + r + post;
});
for (const old of [...Object.keys(moves).filter(f => /\.js$/.test(f)), "ai2/page.js"]) {
	const rel = `${FW}/${old}`, t = fs.readFileSync(path.join(root, rel), "utf8"), n = respec(old, t);
	if (n !== t) edits.set(rel, n);
}
// the old readme moves to ai/doc/ai2/history.md: its ./doc/ links lose that segment
{ const rel = `${FW}/ai2/readme.md`; let t = fs.readFileSync(path.join(root, rel), "utf8");
  edits.set(rel, t.replaceAll("](./doc/", "](./").replaceAll("](doc/", "](./")); }

// ---- 2. exact-path rewrites everywhere that is not history ---------------------------
const SKIP_DIR = /(^|\/)(\.git|node_modules|worktrees|logs|sessions)(\/|$)|^public\/framework\/ai\/(\d{4}-\d\d-\d\d|\d{4})\//;
const ALLOW = /\.(m?js|json|md|css|html|mjs)$/;
const all = git("ls-files").split("\n").filter(f => f && ALLOW.test(f) && !SKIP_DIR.test(f) && !/^public\/framework\/ai2\/doc\/img\//.test(f));
const keys = Object.keys(moves).sort((a, b) => b.length - a.length);
const pathRe = new RegExp("framework/ai2/(" + keys.map(k => k.slice(4).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")(?![\\w.-])", "g");
const rewritten = {};
for (const f of all) {
	if (f.startsWith(`${FW}/ai2/`) && !f.startsWith(`${FW}/ai2/doc/`) && !/readme\.md$/.test(f)) { /* handled by respec, but path strings too */ }
	let t; try { t = textOf(f); } catch { continue; }
	let n = 0;
	const u = t.replace(pathRe, (m, rest) => { n++; return "framework/" + moves["ai2/" + rest]; });
	if (n) { edits.set(f, u); rewritten[f] = n; }
}
// Server/ai2-overview.mjs and Servex/agents/Assistant.js build these paths without the "framework/ai2/" prefix literal in one piece; they are matched above when written in full.

// ---- 3. shims ---------------------------------------------------------------------
const shims = {};
for (const old of Object.keys(moves).filter(f => /^ai2\/[^/]+\.js$/.test(f))) {
	const t = fs.readFileSync(path.join(root, FW, old), "utf8");
	const dest = "../" + moves[old];
	shims[`${FW}/${old}`] = `// Moved to ${moves[old]} (ai2 merged into ai, 2026-10-09). Old path kept so imports keep working.\nexport * from "${dest}";\n` + (/export\s+default\b|export\s*\{[^}]*\bdefault\b/.test(t) ? `export { default } from "${dest}";\n` : "");
}
const created = [];

console.log(JSON.stringify({ filesToMove: Object.keys(moves).length, shims: Object.keys(shims).length, filesEdited: edits.size, pathRewrites: Object.values(rewritten).reduce((a, b) => a + b, 0), mode: apply ? "apply" : "dry-run" }));
if (!apply) { console.log("rewritten files:\n" + Object.entries(rewritten).map(([f, n]) => `  ${n}  ${f}`).join("\n")); process.exit(0); }

// ---- apply ------------------------------------------------------------------------
for (const [o, n] of Object.entries(moves)) {
	fs.mkdirSync(path.dirname(path.join(root, FW, n)), { recursive: true });
	git("mv", `${FW}/${o}`, `${FW}/${n}`);
}
const editedNow = [];
for (const [f, t] of edits) {
	// an edited file may itself have moved: write at its new location
	const old = f.startsWith(FW + "/") ? f.slice(FW.length + 1) : null;
	const where = old && moves[old] ? `${FW}/${moves[old]}` : f;
	fs.writeFileSync(path.join(root, where), t); if (where === f) editedNow.push(f);
}
for (const [f, t] of Object.entries(shims)) fs.writeFileSync(path.join(root, f), t);
// file listings (files.jsonl) for the new/emptied folders
const list = d => { const dir = path.join(root, FW, d); const names = fs.readdirSync(dir, { withFileTypes: true }).filter(e => !/^(files|page)\.jsonl$/.test(e.name)).map(e => e.name + (e.isDirectory() ? "/" : "")).sort(); fs.writeFileSync(path.join(dir, "files.jsonl"), names.map(n => JSON.stringify({ file: n })).join("\n") + "\n"); created.push(`${FW}/${d}/files.jsonl`); };
for (const d of ["ai/cards", "ai/rail", "ai/rail/overview", "ai/doc/ai2", "ai/doc/ai2/img"]) if (fs.existsSync(path.join(root, FW, d))) list(d);
{ const dir = path.join(root, FW, "ai2"); const names = fs.readdirSync(dir, { withFileTypes: true }).filter(e => !/^(files|page)\.jsonl$/.test(e.name)).map(e => e.name + (e.isDirectory() ? "/" : "")).sort(); fs.writeFileSync(path.join(dir, "files.jsonl"), names.map(n => JSON.stringify({ file: n })).join("\n") + "\n"); }
fs.writeFileSync(MAN, JSON.stringify({ at: new Date().toISOString(), moves, shims: Object.keys(shims), edited: editedNow, created, rewritten }, null, 1));
console.log("applied; manifest.json written");
