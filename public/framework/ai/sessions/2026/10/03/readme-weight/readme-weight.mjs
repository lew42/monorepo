// readme-weight.mjs — every readme an agent auto-loads, and every local file it links to, measured.
// Law 7: computed, never recalled. Run from the repo root:
//   node public/framework/ai/sessions/2026/10/03/readme-weight/readme-weight.mjs
// Writes readme-weight.json beside itself and prints the heaviest offenders.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKIP = /[\\/](node_modules|\.git|worktrees|ai[\\/]20\d\d-\d\d-\d\d|ai[\\/]20\d\d[\\/])/;
const SCAN = ["CLAUDE.md", "public", "Server", "Servex", ".claude"];

const readmes = [];
const walk = dir => {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })){
		const p = path.join(dir, e.name);
		if (SKIP.test(p)) continue;
		if (e.isDirectory()) walk(p);
		else if (/^(readme|claude|skill)\.md$/i.test(e.name)) readmes.push(p);
	}
};
for (const s of SCAN){
	const p = path.join(ROOT, s);
	if (!fs.existsSync(p)) continue;
	fs.statSync(p).isDirectory() ? walk(p) : readmes.push(p);
}

const rel = p => path.relative(ROOT, p).replaceAll("\\", "/");
const lines_of = p => fs.readFileSync(p, "utf8").split("\n").length;

const rows = readmes.map(p => {
	const text = fs.readFileSync(p, "utf8");
	const links = [...text.matchAll(/\]\(([^)\s#]+)/g)].map(m => m[1]).filter(u => !/^[a-z]+:/i.test(u));
	const refs = [...new Set(links)].map(u => {
		const target = u.startsWith("/") ? path.join(ROOT, "public", u) : path.resolve(path.dirname(p), u);
		let t = target;
		if (fs.existsSync(t) && fs.statSync(t).isDirectory()) t = ["readme.md", "page.js"].map(f => path.join(t, f)).find(fs.existsSync) ?? null;
		if (!t || !fs.existsSync(t)) return { link: u, missing: true };
		const bytes = fs.statSync(t).size;
		return { link: u, file: rel(t), bytes, lines: bytes < 5e6 ? lines_of(t) : null };
	});
	return { readme: rel(p), lines: text.split("\n").length, bytes: Buffer.byteLength(text), refs };
});

// Directories under public/framework with code but no readme
const missing = [];
const scan_missing = dir => {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })){
		if (!e.isDirectory()) continue;
		const p = path.join(dir, e.name);
		if (SKIP.test(p) || /[\\/](doc|shots|review|studies|test)$/.test(p)) continue;
		const files = fs.readdirSync(p);
		if (files.some(f => f.endsWith(".js")) && !files.some(f => /^readme\.md$/i.test(f))) missing.push(rel(p));
		scan_missing(p);
	}
};
scan_missing(path.join(ROOT, "public", "framework"));

const long_readmes = rows.filter(r => r.lines > 100).sort((a, b) => b.lines - a.lines);
const heavy_refs = rows.flatMap(r => r.refs.filter(x => x.bytes > 30_000).map(x => ({ from: r.readme, ...x }))).sort((a, b) => b.bytes - a.bytes);
const broken = rows.flatMap(r => r.refs.filter(x => x.missing).map(x => ({ from: r.readme, link: x.link })));

const summary = {
	at: new Date().toISOString(),
	readmes: rows.length,
	total_readme_lines: rows.reduce((s, r) => s + r.lines, 0),
	over_100_lines: long_readmes.length,
	refs_over_30kb: heavy_refs.length,
	broken_links: broken.length,
	dirs_with_js_but_no_readme: missing.length,
};
fs.writeFileSync(path.join(HERE, "readme-weight.json"), JSON.stringify({ summary, long_readmes: long_readmes.map(({ refs, ...r }) => r), heavy_refs, broken, missing, rows }, null, 1));

console.log(summary);
console.log("\nlongest readmes:"); long_readmes.slice(0, 15).forEach(r => console.log(String(r.lines).padStart(5), r.readme));
console.log("\nheaviest linked files:"); heavy_refs.slice(0, 15).forEach(r => console.log(String(Math.round(r.bytes / 1024)).padStart(6) + " KB", r.file, "<-", r.from));
