// Review findings vs answers, joined per finding number, since 2026-09-28.
// Answers are read from task.jsonl (where authors write them) AND review.jsonl (the --turns copy).
// Run from anywhere: node public/framework/ai/2026-10-02/servex-mastermind/review-audit.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const AI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lines = f => { try { return fs.readFileSync(f, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else if (e.name === "review.jsonl") out.push(p); } return out; };
const days = fs.readdirSync(AI).filter(d => /^2026-(09-(2[89]|30)|1\d-\d\d)$/.test(d));
const files = days.flatMap(d => walk(path.join(AI, d)));
const T = { review_files: files.length, findings: 0, fix: 0, note: 0, answered: 0, answered_only_in_task_jsonl: 0,
	fixed: 0, declined: 0, noted: 0, other: 0, unanswered_fix: 0, unanswered_note: 0, files_with_no_review_jsonl_answers: 0 };
const per = [];
for (const f of files) {
	const dir = path.dirname(f);
	const finds = new Map(), rjAns = new Map(), tjAns = new Map();
	for (const l of lines(f)) { if (l.finding) finds.set(l.finding.n, l.finding); if (l.answer) rjAns.set(l.answer.n, l.answer.reply); }
	for (const l of lines(path.join(dir, "task.jsonl"))) if (l.review?.answer) tjAns.set(l.review.answer.n, l.review.answer.reply);
	if (!rjAns.size) T.files_with_no_review_jsonl_answers++;
	let uf = 0, un = 0;
	for (const [n, fd] of finds) {
		T.findings++;
		const kind = fd.kind === "note" ? "note" : "fix";
		T[kind]++;
		const r = tjAns.get(n) ?? rjAns.get(n);
		if (r == null) { kind === "fix" ? (T.unanswered_fix++, uf++) : (T.unanswered_note++, un++); continue; }
		T.answered++;
		if (!rjAns.has(n)) T.answered_only_in_task_jsonl++;
		const w = String(r).trim().toLowerCase();
		T[w.startsWith("fixed") ? "fixed" : w.startsWith("declined") ? "declined" : w.startsWith("noted") ? "noted" : "other"]++;
	}
	if (uf || un) per.push({ task: path.relative(AI, dir).replace(/\\/g, "/"), findings: finds.size, unanswered_fix: uf, unanswered_note: un });
}
console.log(JSON.stringify(T, null, 1));
per.sort((a, b) => b.unanswered_fix - a.unanswered_fix || b.unanswered_note - a.unanswered_note);
console.log("tasks with unanswered findings:");
for (const p of per) console.log(JSON.stringify(p));
