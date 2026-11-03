// Merges the Haiku outputs (categories, suggested fixes) into loose-ends.jsonl and applies the mastermind's verdict rules.
// Usage: node ledger.mjs <dir holding cat1-4.out.txt fix1-2.out.txt>   (reruns safely: it recomputes the columns every time)
// Verdict rules (judgement written once, applied by code):
//   dead -> superseded; second and later rows with the same title -> superseded by the first;
//   fix text says an owner agent is building -> in-flight; small -> now; everything else -> later.
//   route = the running agent to message instead of building, by category.
import fs from "fs"; import path from "path";
const T = process.argv[2], here = import.meta.dirname;
const rd = f => fs.readFileSync(path.join(T, f), "utf8").split("\n").filter(Boolean).map(l => l.split("\t"));
const cat = new Map(); for (let i = 1; i <= 4; i++) for (const [id, c, a] of rd(`cat${i}.out.txt`)) cat.set(id, { category: c, asked: a });
const fixes = [...rd("fix1.out.txt"), ...rd("fix2.out.txt")].map(([n, kind, fix]) => ({ n: +n, kind, fix }));
const rows = fs.readFileSync(path.join(here, "loose-ends.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
const route = { sessions: "minion-session-class", "docs-readmes": "mastermind-ai-system-docs", "ai-servex": null };
let k = 0; const firstTitle = new Map(); const out = [];
for (const r of rows) {
	const c = cat.get(r.dir); if (c) { r.category = c.category; r.asked = r.asked || c.asked }
	if (!r.category) r.category = /refine|dictat|voice|transcri/i.test((r.tag||"")+" "+(r.title||"")) ? "transcription-refinement" : /session/i.test(r.tag||"") ? "sessions" : /readme|docs?/i.test(r.tag||"") ? "docs-readmes" : /page/i.test(r.tag||"") ? "page" : /servex|ai/i.test(r.tag||"") ? "ai-servex" : "other";
	if (r.state === "scratch") { r.verdict = "scratch"; r.reason = "test or probe run, not an owner ask"; out.push(r); continue }
	const f = fixes[k++]; r.fix = f.fix; r.fixkind = f.kind;
	const key = (r.title || "").toLowerCase().replace(/\W+/g, " ").trim();
	if (firstTitle.has(key) && key.length > 12) { r.verdict = "superseded"; r.reason = "same title as an earlier row; fix that one"; r.dup_of = firstTitle.get(key) }
	else {
		firstTitle.set(key, r.dir || r.title);
		if (f.kind === "dead") { r.verdict = "superseded"; r.reason = "Haiku: probably obsolete; confirm before dropping (nothing is deleted)" }
		else if (/\b(owner|is building|building)\b/i.test(f.fix) && /task-mastermind|ask is building/i.test(f.fix)) { r.verdict = "in-flight"; r.reason = "an agent is already on it" }
		else if (f.kind === "small") { r.verdict = "now"; r.reason = /landed_at/.test(f.fix) ? "record-keeping only: work exists, one log line missing" : "a lot is done, one small step is missing" }
		else { r.verdict = "later"; r.reason = "real building remains; rank in the next prioritising step" }
	}
	if (route[r.category]) r.route = route[r.category];
	out.push(r);
}
if (k !== fixes.length) throw new Error(`fix rows ${fixes.length} != open rows ${k}`);
fs.writeFileSync(path.join(here, "loose-ends.jsonl"), out.map(r => JSON.stringify(r)).join("\n") + "\n");
const tc = {}, vc = {}; for (const r of out) { vc[r.verdict] = (vc[r.verdict] || 0) + 1 }
for (const [, v] of cat) tc[v.category] = (tc[v.category] || 0) + 1;
fs.writeFileSync(path.join(here, "categories.json"), JSON.stringify([...cat].map(([id, v]) => ({ id, ...v }))));
console.log("verdicts", vc, "\ncategories (all", cat.size, "tasks)", tc);
