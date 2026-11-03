// page-size.mjs — a REPORT, never a gate: every page.jsonl under public/ bigger than a
// threshold, largest first, with its line count. Nothing is purged; this only counts.
// Read the doc first: public/framework/core/Page/doc/page-jsonl.md
//
// usage:
//   node Server/page-size.mjs                     every page.jsonl over 100 KB in this repo
//   node Server/page-size.mjs --kb 50              a different threshold
//   node Server/page-size.mjs --root <repo>        a different checkout (main tree or a worktree)
//   node Server/page-size.mjs --json               machine-readable, same rows
//
// Always exits 0, even when it finds nothing over the threshold — a non-zero exit would make
// this look like a check that can fail a build, and it is only ever a report to read.
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// ---- arguments ----
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); if (i < 0) return null; return args[i + 1]; };
const json = args.includes("--json");
const kb = Number(flag("--kb")) || 100;
const root = flag("--root") || join(here, "..");
const publicDir = join(root, "public");

// Walk `public/` for every page.jsonl, skipping node_modules — the only dir this large tree
// can grow that isn't ours to count.
function walk(dir, out) {
	let entries;
	try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const e of entries) {
		if (e.name === "node_modules" || e.name.startsWith(".")) continue;
		const p = join(dir, e.name);
		if (e.isDirectory()) walk(p, out);
		else if (e.name === "page.jsonl") out.push(p);
	}
}

const lineCount = file => {
	const text = readFileSync(file, "utf8");
	return text.split("\n").filter(l => l.trim()).length;
};

const files = [];
walk(publicDir, files);

const threshold = kb * 1024;
const rows = files
	.map(f => ({ path: relative(root, f).replace(/\\/g, "/"), bytes: statSync(f).size }))
	.filter(r => r.bytes >= threshold)
	.sort((a, b) => b.bytes - a.bytes)
	.map(r => ({ ...r, kb: Math.round(r.bytes / 1024), lines: lineCount(join(root, r.path)) }));

if (json) {
	console.log(JSON.stringify({ root, threshold_kb: kb, scanned: files.length, over: rows.length, rows }, null, 2));
} else {
	console.log(`page-size: ${files.length} page.jsonl files under ${relative(root, publicDir) || "public"}, ${rows.length} over ${kb} KB`);
	if (rows.length) {
		const w = { path: Math.max(...rows.map(r => r.path.length)), kb: 2, lines: 5 };
		for (const r of rows) console.log(`${r.path.padEnd(w.path)}  ${String(r.kb).padStart(w.kb)} KB  ${String(r.lines).padStart(w.lines)} lines`);
	}
}
process.exit(0);
