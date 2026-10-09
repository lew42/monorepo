// Builds briefs for Haiku verifiers: 2-3 loose-end rows each, with the ask, the old label and fix, and the exact steps.
// Usage: node verify-brief.mjs <verdict|category> <value> <outDir> [perBrief=3] [limit]   e.g.  node verify-brief.mjs verdict now $TEMP/ta3
//   or:  node verify-brief.mjs category transcription-refinement $TEMP/ta3 3 12   (rows with verdict later, not yet verified)
import fs from "fs"; import path from "path";
const [by, val, out, per = 3, limit = 999] = process.argv.slice(2);
const here = import.meta.dirname;
const rows = fs.readFileSync(path.join(here, "loose-ends.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
const done = new Set(fs.existsSync(path.join(here, "verified.jsonl")) ? fs.readFileSync(path.join(here, "verified.jsonl"), "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l).row) : []);
const pick = rows.map((r, i) => ({ r, i })).filter(({ r, i }) => !done.has(i) && r.fix && (by === "verdict" ? r.verdict === val : r.category === val && r.verdict === "later")).slice(0, +limit);
fs.mkdirSync(out, { recursive: true });
const S = v => String(v || "").replace(/\s+/g, " ").slice(0, 400);
const head = `You verify loose ends in the Lew42 repo (C:/Code/lew42/monorepo). An earlier pass labelled each task from a few words of text and was only about 58% right, so DO NOT trust the old label or the task's own status text; look at the real files and git. You have Read, Grep, Glob and read-only git (git log, git show, git status; never write or run anything else in the repo).

For EACH task below:
1. Find its folder or module (dir is relative to public/framework/ai/ unless it starts with public/; for a /framework/... tag look in public/framework/...). Read its requirements.md, report.md, readme.md or page.jsonl if present.
2. Check the ask against reality: do the files it should have created exist and contain the thing? Run git log -- <dir> and git log --all --oneline --grep=<slug> to find commits. NOTE: a child folder shares its parent's commits, so only count commits whose subject names this task or whose diff touches this task's files.
3. Write a receipt file with the Write tool at the path given below (JSON, one object). Fields:
   row (number, as given), searched (list: the exact patterns/commands you ran), found (list: real file paths relative to the repo root, and commit hashes), missing (list: what you looked for and could NOT find), verdict (one of done, partial, not-started, superseded, unclear), confidence (high, medium or low), next_step (the smallest step that would land it, one sentence), agrees (true if your verdict matches the old label, else false), why (required when agrees is false).
4. Record it by running: node public/framework/ai/2026-10-08/task-audit/receipts.mjs add <receipt file>
   If it says REJECTED, fix the receipt and run it again. If it prints WARNING about a cited path, you cited something that does not exist: correct the receipt and add it again.
Never hand-write verified.jsonl. Say "unclear" with low confidence rather than guess. Stay under about 40k tokens of reading: read headers and the first 80 lines of big files.
When done, reply with exactly 3 lines: what you found (verdicts), how many receipts recorded, your confidence.

`;
let n = 0;
for (let s = 0; s < pick.length; s += +per) {
	const grp = pick.slice(s, s + +per); n++;
	const name = `brief-${String(n).padStart(2, "0")}`;
	let t = head;
	for (const { r, i } of grp) {
		t += `## Task, row ${i}: ${S(r.title)}\n- where: dir ${r.dir || "(none)"}; tag ${r.tag || ""}\n- the ask: ${S(r.ask)}\n- old label: ${r.state} (${S(r.evidence)})\n- old suggested fix: ${S(r.fix)}\n- write the receipt to: ${path.join(out, `r${i}.json`).replace(/\\/g, "/")}\n\n`;
	}
	fs.writeFileSync(path.join(out, name + ".md"), t);
}
console.log(pick.length, "rows ->", n, "briefs in", out);
