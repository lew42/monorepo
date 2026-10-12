// Inventory of public/framework/ai2: every file, who imports/links it, live vs dead.
// Usage: node inventory.mjs [--write]   (run from anywhere; finds the repo root itself)
import fs from "node:fs"; import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.resolve(here, "../../../../..");
const AI2 = path.join(root, "public/framework/ai2");
const SKIP = new Set([".git", "node_modules", "worktrees", "sessions", "logs"]);
const TEXT = /\.(m?js|json|jsonl|md|css|html)$/;
const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
	if (SKIP.has(e.name)) continue; const p = path.join(d, e.name);
	e.isDirectory() ? walk(p, out) : out.push(p); } return out; };
const rel = p => path.relative(root, p).split(path.sep).join("/");
const files = walk(AI2);
// scan all code (js/mjs/css/html) in public + Server + Servex; skip dated task dirs (history)
const scan = walk(root).filter(p => /\.(m?js|css|html|json|md)$/.test(p) && !/\/ai\/(\d{4}-\d\d-\d\d|\d{4}\/\d\d)\//.test(rel(p)) && !rel(p).startsWith("public/framework/ai2/ai/") && fs.statSync(p).size < 2e6);
const txt = new Map(scan.map(p => [p, fs.readFileSync(p, "utf8")]));
const rows = files.map(f => {
	const r = rel(f), base = path.basename(f), inAi2 = r.replace("public/framework/ai2/", "");
	const abs = [`/framework/ai2/${inAi2}`, `framework/ai2/${inAi2}`];
	const imp = [];
	for (const [p, t] of txt) {
		if (p === f) continue;
		const rp = rel(p);
		let hit = abs.some(a => t.includes(a));
		if (!hit && rp.startsWith("public/framework/ai2/") && !inAi2.includes("/")) {
			const dir = path.dirname(p) === AI2;
			if (dir) hit = new RegExp(`["'\`]\./${base.replace(/\./g, "\.")}["'\`]`).test(t);
		}
		if (!hit && !rp.startsWith("public/framework/ai2/")) { // relative from outside, e.g. ../ai2/x.js
			hit = new RegExp(`ai2/${inAi2.replace(/\./g, "\.")}`).test(t);
		}
		if (hit) imp.push(rp);
	}
	return { file: r, importers: imp };
});
const ext = rows.filter(r => !/\.(md|png|jpg)$/.test(r.file) && !/files\.jsonl$/.test(r.file));
const live = ext.filter(r => r.importers.length), dead = ext.filter(r => !r.importers.length);
const urlRefs = [...txt].filter(([p, t]) => !rel(p).startsWith("public/framework/ai2/") && t.includes("/framework/ai2")).map(([p]) => rel(p));
const out = { total: rows.length, code: ext.length, live: live.length, dead: dead.length, urlReferrers: urlRefs.length, rows, urlRefs };
if (process.argv.includes("--write")) {
	fs.writeFileSync(path.join(here, "inventory.json"), JSON.stringify(out, null, 1));
	let md = `# ai2 inventory (computed by inventory.mjs)\n\n- files: ${out.total} (code/data ${out.code}: ${out.live} live, ${out.dead} no importers)\n- files outside ai2 naming \`/framework/ai2\`: ${out.urlReferrers}\n\n## Live (has importers)\n\n`;
	for (const r of live) md += `- \`${r.file}\` ← ${r.importers.length}: ${r.importers.slice(0, 4).map(x => "`" + x + "`").join(", ")}${r.importers.length > 4 ? " …" : ""}\n`;
	md += `\n## No importers found (archive candidates)\n\n` + dead.map(r => `- \`${r.file}\``).join("\n") + `\n\n## Files outside ai2 that name /framework/ai2\n\n` + urlRefs.map(x => `- \`${x}\``).join("\n") + "\n";
	fs.writeFileSync(path.join(here, "inventory.md"), md);
}
console.log(JSON.stringify({ total: out.total, code: out.code, live: out.live, dead: out.dead, urlReferrers: out.urlReferrers }));
