// READ-ONLY. For every record .jsonl in public/framework/ai2/ and the old dated places public/framework/ai/{2026,2026-10-13}/
// as they were at the commit before the 2026-11-01 move (fa90c3a41^), count the lines whose exact text is in a .jsonl under
// public/framework/ai/sessions today. Usage: node lines-check.mjs [--list]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const REPO = process.cwd();
const BEFORE = "fa90c3a41^";
const git = (...a) => execFileSync("git", a, { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28, windowsHide: true });
const store = new Set();
(function walk(d) {
	for (const e of fs.readdirSync(d, { withFileTypes: true })) {
		const p = path.join(d, e.name);
		if (e.isDirectory()) walk(p);
		else if (e.name.endsWith(".jsonl")) for (const l of fs.readFileSync(p, "utf8").split("\n")) if (l.trim()) store.add(l.trim());
	}
})(path.join(REPO, "public/framework/ai/sessions"));
const files = git("ls-tree", "-r", "--name-only", BEFORE, "--", "public/framework/ai2", "public/framework/ai/2026", "public/framework/ai/2026-10-13")
	.split("\n").filter(f => f.endsWith(".jsonl") && !f.endsWith("/files.jsonl"));
let total = 0, present = 0; const missing = {};
for (const f of files) {
	for (const l of git("show", `${BEFORE}:${f}`).split("\n")) {
		if (!l.trim()) continue;
		total++;
		if (store.has(l.trim())) present++; else (missing[f] ??= []).push(l.trim());
	}
}
console.log(JSON.stringify({ files: files.length, lines: total, in_store_today: present, missing: total - present, missing_by_file: Object.fromEntries(Object.entries(missing).map(([k, v]) => [k, v.length])) }, null, 1));
if (process.argv.includes("--list")) for (const [f, v] of Object.entries(missing)) for (const l of v) console.log(f, "|", l.slice(0, 200));

// Second pass: a missing line may have been rewritten (stub pointers, path prefixes). Its content counts as present when its
// most distinctive string value (longest leaf, first 80 chars) is found in any store .jsonl; ids for session-start lines.
const text = []; (function w(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name); if(e.isDirectory()) w(p); else if(e.name.endsWith(".jsonl")) text.push(fs.readFileSync(p,"utf8")); } })(path.join(REPO,"public/framework/ai/sessions"));
const blob = text.join("\n");
const leaves = (o, out=[]) => (typeof o==="string" ? out.push(o) : o && typeof o==="object" && Object.values(o).forEach(v=>leaves(v,out)), out);
let rewritten = 0; const gone = [];
for (const [f, ls] of Object.entries(missing)) for (const l of ls) {
	let j; try { j = JSON.parse(l); } catch { gone.push([f, l]); continue; }
	if (j.by === "task-migrate") { const t = (j.sessions||[]).map(s=>s.task)[0]; if (t && fs.existsSync(path.join(REPO,"public",t.replace(/\/$/,""),"task.jsonl"))) { rewritten++; continue; } }
	const best = leaves(j).filter(s=>s.length>=8).sort((a,b)=>b.length-a.length)[0];
	if (best && blob.includes(JSON.stringify(best.slice(0,80)).slice(1,-1))) rewritten++; else gone.push([f, l]);
}
console.log(JSON.stringify({ missing_exact: total-present, content_found_in_store: rewritten, truly_missing: gone.length }));
for (const [f,l] of gone) console.log("GONE", f, "|", l.slice(0,300));
