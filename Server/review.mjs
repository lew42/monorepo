/* `node Server/review.mjs <taskdir> [<worktree dir>] [--range A..B] [--size none|light|full] [--why "..."] [--model <id>]`
 * Fresh eyes on a finished task: an agent that never saw the author's conversation reads only the
 * brief, the diff and (for a page it touched) screenshots, then says pass or fix. Why fresh: an
 * agent that reviews its own code agrees with itself.
 *
 * SIZE (`sizeOf`, exported): `none` — only .css/.md changed, 20 changed lines or fewer, no added
 * file: no agent runs, review.md just says so. `light` — code changed, but no new page/module/
 * Servex file: a fresh Sonnet reads the brief and the diff. `full` — a new page.js, a new .js/.mjs
 * module, or anything under Servex/: a fresh Opus. `--size` may only RAISE the computed size;
 * lowering it needs `--why`, logged as a `{"decision":…}` line so the reason survives.
 *
 * SHOTS: any review — `light` or `full` — whose diff touches a page (`pageUrlFor` finds one) gets
 * screenshots first, at `WIDTHS` (400, 1200, 1920, 3440) via `Server/layout-check.mjs --bands`,
 * saved to `<taskdir>/shots/<page-slug>/` (`400.png` … `sheet.png` … `layout.json`, the last
 * carrying `--bands`' `tab_rows`/`left_stack`/`bands`/`wraps` numbers). Skipped if every page
 * already has all four pngs there — the task mastermind may have shot them first. One
 * `{"shots":{...}}` line is appended to task.jsonl naming every page, the shots dir, the first
 * page's sheet, every page's sheet, and every `layout.json` that exists.
 *
 * REVIEWER: when shots were taken, the prompt tells the reviewer to load the `review` skill — its
 * own absolute path, resolved from the tree THIS file lives in (`new URL("../.claude/skills/
 * review/SKILL.md", import.meta.url)`), so a worktree's copy reviews with the worktree's own copy
 * of the skill — and follow it: read the brief, the owner's words, the diff, `shots/` and each
 * page's `layout.json`, then write `<taskdir>/review/report.md`. A review that touches no page
 * keeps the plain brief-and-diff prompt and writes `<taskdir>/review.md`, same as always. Either
 * file's first line is `verdict: pass` or `verdict: fix`, then findings `N. [fix] …` / `N. [note]
 * …`; `parseReview` (exported) reads both the same way into one `{"review":{…}}` line appended to
 * the task's task.jsonl — its `file` names whichever file was actually used, plus `report` and
 * `shots` pointers when shots were taken.
 *
 * DIFF: normally `git diff michael/dev...<branch>` run INSIDE the worktree (default: cwd) — the
 * worktree shares the main repo's objects, so `michael/dev` is visible from there. `--range A..B`
 * instead diffs two commits in the MAIN repo, for a task that already landed (the proof runs use
 * this on old merge commits).
 *
 * The reviewer is a brand-new Servex agent (`spawn_agent` over the loopback MCP at
 * http://127.0.0.1:8090/mcp, then `wait_for_agent`, then `stop_agent` — the same three calls
 * `Server/clarity.mjs` makes) — never a `resume` or `fork`, so it truly has not seen the author's
 * turns.
 *
 * `--status <taskdir>` (no other args) prints one phrase for the dashboard card: `reviewed: pass`,
 * `reviewed: 2 fixed, 1 declined`, `reviewed: 1 unanswered`, or `not reviewed` (`status`, exported;
 * see doc/review.md for how a finding is answered). Every Node spawn here sets `windowsHide: true`.
 * Never throws: a Servex problem becomes a `fix` finding saying so, not a crash.
 *
 * `--questions` reads every skill dir's own `questions.md` under `.claude/skills` (plus the review
 * skill's own SKILL.md, if it ever carries numbered questions the same way) and writes one file
 * everyone else reads live:
 * `public/framework/ai/review/questions.json` — every review question, grouped by system, in the
 * review's own order (requirements, page structure, navigation, layout, sizing, wrapping, spacing
 * and padding, colour and contrast, flow, then anything else not on that list). `main()` runs this
 * at the start of every review too, so the file never goes stale even if nobody runs it by hand.
 * The page at `/framework/ai/review/` reads it.
 *
 * TURNS (doc/review.md has the picture): the findings above are phase 1 of four, all logged to a
 * NEW file, `<taskdir>/review.jsonl` (task.jsonl's own `{"review":…}` line is untouched, still what
 * merge.mjs's gate reads). `node Server/review.mjs --turns <taskdir>` mirrors the author's
 * hand-appended `{"review":{"answer":…}}` task.jsonl lines into review.jsonl as phase 2, then (only
 * for a decline nobody has answered yet) spawns ONE fresh reviewer for phase 3 — accept the decline,
 * or hold. `--rule <taskdir> <n> <fix|stands> "<why>"` is phase 4, the task mastermind's own ruling
 * on a held finding, by hand, no agent. `--score <taskdir>` appends one line to the shared
 * `public/framework/ai/collab/scoreboard.jsonl` once a run is fully settled; `--backfill` does the
 * same for every past review.md that predates this. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const BASE = "michael/dev";
const MCP = "http://127.0.0.1:8090/mcp";
const WIDTHS = [400, 1200, 1920, 3440];
// The review order every system's questions sort into (Server/review.mjs --questions, and the
// review skill's own "## The order"). Anything not on this list (content's "Words" today) sorts
// after it, in the order its file put it.
const SYSTEM_ORDER = ["Requirements", "Page structure", "Navigation", "Layout", "Sizing", "Wrapping", "Spacing and padding", "Colour and contrast", "Flow"];
const lines = s => s.split(/\r?\n/).filter(Boolean);
const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 });
const git = (cwd, ...a) => run("git", a, cwd);
const slug = u => u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "page";
const now = () => { const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`; };
function appendJSON(file, obj) {
	let lead = ""; try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.appendFileSync(file, lead + JSON.stringify(obj) + "\n");
}
const reviewJsonlPath = taskDir => path.join(taskDir, "review.jsonl");
function readJsonl(file) {
	try { return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
	catch { return []; }
}
function readTaskJsonl(taskDir) { return readJsonl(path.join(taskDir, "task.jsonl")); }

/* Phase 1 (findings) written to review.jsonl, from the SAME `review` object that goes into
 * task.jsonl's `{"review":…}` line (never a second source of truth for verdict/findings/cost).
 * Idempotent: skipped if a phase-1 "done" line is already there (readTurns().phase1Done). */
function writePhase1(taskDir, review) {
	const f = reviewJsonlPath(taskDir);
	appendJSON(f, { phase: { at: review.at, n: 1, kind: "findings", status: "start" } });
	for (const fnd of review.findings || []) appendJSON(f, { finding: { at: review.at, n: fnd.n, kind: fnd.kind, text: fnd.text } });
	appendJSON(f, { phase: { at: review.at, n: 1, kind: "findings", status: "done", verdict: review.verdict, cost: review.cost, model: review.model } });
}

/* review.jsonl, replayed: the phase-1 findings (n -> text), the latest answer/reply/ruling per
 * finding number (later line for the same n wins, same merge rule every JSONL log here uses),
 * and whether phase 1 / phase 3 have a "done" line yet. Exported for --rule/--score and testing. */
export function readTurns(taskDir) {
	const entries = readJsonl(reviewJsonlPath(taskDir));
	const findings = new Map(), answers = new Map(), replies = new Map(), rulings = new Map();
	let phase1Done = false, phase3Done = false;
	for (const e of entries) {
		if (e.finding) findings.set(e.finding.n, e.finding.text);
		if (e.answer) answers.set(e.answer.n, e.answer);
		if (e.reply) replies.set(e.reply.n, e.reply);
		if (e.ruling) rulings.set(e.ruling.n, e.ruling);
		if (e.phase?.n === 1 && e.phase.status === "done") phase1Done = true;
		if (e.phase?.n === 3 && e.phase.status === "done") phase3Done = true;
	}
	return { entries, findings, answers, replies, rulings, phase1Done, phase3Done };
}

// A changed page.js/page.jsonl's own site url — the same rule merge.mjs's pageUrlFor() uses.
const CARD_RE = /^public\/framework\/ai\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)\/page\.(?:js|jsonl)$/;
export function pageUrlFor(f) {
	const card = CARD_RE.exec(f);
	if (card) return `/framework/ai2/${card[1]}/${card[2]}/${card[3]}/${card[4]}/`;
	if (!f.startsWith("public/") || !/\/page\.(?:js|jsonl)$/.test(f)) return null;
	return "/" + f.slice("public/".length).replace(/page\.(?:js|jsonl)$/, "");
}
export function worktreeBase(main, dir) {
	const f = path.join(main, ".worktrees.json");
	if (!dir || !fs.existsSync(f)) return null;
	const norm = p => path.resolve(p).replace(/\\/g, "/").toLowerCase();
	try {
		const entry = Object.values(JSON.parse(fs.readFileSync(f, "utf8"))).find(e => norm(e.path) === norm(dir));
		return entry ? `http://127.0.0.1:${entry.port}` : null;
	} catch { return null; }
}

/* Both sides of a diff, parsed: {nameStatus: [{status, f}], numstat: [{added, deleted, f}]}.
 * Exported so merge.mjs's review gate reuses this instead of its own copy. */
export function diffStat(cwd, spec) {
	const nameStatus = lines(git(cwd, "diff", "--name-status", "--no-renames", spec).stdout).map(l => { const [s, ...f] = l.split("\t"); return { status: s[0], f: f.join("\t") }; });
	const numstat = lines(git(cwd, "diff", "--numstat", "--no-renames", spec).stdout).map(l => { const [a, d, ...f] = l.split("\t"); return { added: a === "-" ? 0 : Number(a), deleted: d === "-" ? 0 : Number(d), f: f.join("\t") }; });
	return { nameStatus, numstat };
}

/* The size of a diff. `files`: [{status, f}] from `git diff --name-status`. `numstat`:
 * [{added, deleted, f}] from `git diff --numstat`. Exported so merge.mjs's gate can reuse it. */
export function sizeOf(files, numstat) {
	if (!files.length) return "none";
	const added = files.filter(x => x.status === "A");
	const totalLines = numstat.reduce((n, r) => n + (Number(r.added) || 0) + (Number(r.deleted) || 0), 0);
	if (files.every(x => /\.(css|md)$/i.test(x.f)) && totalLines <= 20 && added.length === 0) return "none";
	const full = files.some(x => x.f.startsWith("Servex/")
		|| (x.status === "A" && (/(^|\/)page\.js$/.test(x.f) || /\.(mjs|js)$/i.test(x.f))));
	return full ? "full" : "light";
}

/* review.md -> {verdict, findings:[{n, kind, text}]}. Exported for testing / --status. */
export function parseReview(text) {
	const rows = text.split(/\r?\n/);
	const verdict = /^verdict:\s*pass/i.test((rows.find(l => l.trim()) || "").trim()) ? "pass" : "fix";
	const findings = [];
	for (const l of rows) {
		const m = /^(\d+)\.\s*\[(fix|note)\]\s*(.+)$/i.exec(l.trim());
		if (m) findings.push({ n: Number(m[1]), kind: m[2].toLowerCase(), text: m[3].trim() });
	}
	return { verdict, findings };
}

/* review/reply.md -> [{n, stance, text}], one per decline the phase-3 reviewer looked at.
 * Mirrors parseReview's regex style exactly, just with accept/hold instead of fix/note. */
export function parseReply(text) {
	const out = [];
	for (const l of text.split(/\r?\n/)) {
		const m = /^(\d+)\.\s*\[(accept|hold)\]\s*(.+)$/i.exec(l.trim());
		if (m) out.push({ n: Number(m[1]), stance: m[2].toLowerCase(), text: m[3].trim() });
	}
	return out;
}

/* Every top-level `[...]` bracket in a line, as [start, end) spans over the FULL string (`]`
 * included) — tracking nesting depth, because a rule tag can itself contain a balanced `[]`
 * (layout/questions.md's own `[measured: layout.json bands[].share, ...]`, an array-index
 * notation, would truncate at that inner `]` under a simple non-greedy regex). A bracket pair
 * immediately followed by `(` is a markdown link (`[page](../page/questions.md)`, in the review
 * skill's own "## Load first" list), never a rule tag, and is skipped. */
function bracketSpans(line) {
	const spans = [];
	let depth = 0, start = -1;
	for (let i = 0; i < line.length; i++) {
		if (line[i] === "[") { if (depth === 0) start = i; depth++; }
		else if (line[i] === "]") {
			depth--;
			if (depth === 0 && start >= 0) { if (line[i + 1] !== "(") spans.push([start, i + 1]); start = -1; }
		}
	}
	return spans;
}

/* One questions.md's own numbered lists, grouped by its `## <Heading>` sections. A line only
 * counts as a review question if it carries at least one `[...]` rule tag — a plain numbered
 * step (like the `review` skill's own "## Load first" list) has no tag and is skipped, so this
 * is safe to run over any skill file, not just a real questions.md. A fenced ```...``` block (the
 * review skill's own example report, which has lines shaped like "1. [fix] ...") is skipped
 * whole, since "[fix]"/"[note]" there are finding kinds, not rule tags. Exported for testing. */
export function parseQuestionsFile(text) {
	const systems = [];
	let current = null, inFence = false;
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (/^```/.test(line)) { inFence = !inFence; continue; }
		if (inFence) continue;
		const h = /^#{2,3}\s+(.+)$/.exec(line);
		if (h) { current = { heading: h[1].trim(), questions: [] }; systems.push(current); continue; }
		const m = /^(\d+)\.\s*(.+)$/.exec(line);
		if (!m || !current) continue;
		const spans = bracketSpans(m[2]);
		if (!spans.length) continue;
		const rules = spans.map(([a, b]) => m[2].slice(a + 1, b - 1).trim());
		let qtext = "";
		let last = 0;
		for (const [a, b] of spans) { qtext += m[2].slice(last, a); last = b; }
		qtext += m[2].slice(last);
		current.questions.push({ n: Number(m[1]), text: qtext.trim(), rules });
	}
	return systems.filter(s => s.questions.length);
}

/* `--questions` (also run by main() at the start of every review): every skill dir under
 * `.claude/skills` that has its own `questions.md`, plus the review skill's own SKILL.md (in case
 * it ever grows numbered questions the same way), read live and written to one file the
 * `/framework/ai/review/` page reads — never hand-edited. Exported for testing. */
export function questionsCmd(root) {
	const skillsDir = path.join(root, ".claude/skills");
	const systems = [];
	let dirs = [];
	try { dirs = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch {}
	for (const skill of dirs.sort()) {
		const file = path.join(skillsDir, skill, "questions.md");
		if (!fs.existsSync(file)) continue;
		const rel = path.relative(root, file).replaceAll("\\", "/");
		for (const s of parseQuestionsFile(fs.readFileSync(file, "utf8"))) systems.push({ skill, file: rel, heading: s.heading, questions: s.questions });
	}
	const reviewSkillFile = path.join(skillsDir, "review", "SKILL.md");
	if (fs.existsSync(reviewSkillFile)) {
		const rel = path.relative(root, reviewSkillFile).replaceAll("\\", "/");
		for (const s of parseQuestionsFile(fs.readFileSync(reviewSkillFile, "utf8"))) systems.push({ skill: "review", file: rel, heading: s.heading, questions: s.questions });
	}
	const rank = h => { const i = SYSTEM_ORDER.findIndex(o => o.toLowerCase() === h.toLowerCase()); return i < 0 ? SYSTEM_ORDER.length : i; };
	systems.sort((a, b) => rank(a.heading) - rank(b.heading));
	const out = { generated_at: now(), note: "generated by review.mjs --questions from the files named in source; never edit by hand", systems };
	const outPath = path.join(root, "public/framework/ai/review/questions.json");
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
	return out;
}

/* The dashboard's one-phrase answer, from task.jsonl: the newest {"review":…} line (not an
 * answer), plus every {"review":{"answer":…}} line that answers a finding — `[fix]` or `[note]`,
 * since requirements.md's own deliverable 2 says the author answers EVERY finding, not just the
 * ones that must change. */
export function status(taskDir) {
	let entries;
	try { entries = fs.readFileSync(path.join(taskDir, "task.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
	catch { return "not reviewed"; }
	const reviews = entries.filter(e => e.review && e.review.verdict && !e.review.answer);
	if (!reviews.length) return "not reviewed";
	const latest = reviews.at(-1).review;
	const findings = latest.findings || [];
	// a verdict of "fix" with nothing parsed (an unusual "1) [fix] ..." numbering, say) is not a pass
	if (!findings.length) return latest.verdict === "pass" ? "reviewed: pass" : "reviewed: 1 unanswered (verdict fix, no findings parsed)";
	const answers = entries.filter(e => e.review?.answer).map(e => e.review.answer);
	// A [note] finding may be answered "noted: ..." instead of fixed/declined — a [fix] finding
	// still needs fixed/declined, "noted" never counts for one.
	let fixed = 0, declined = 0, noted = 0, unansweredNums = [];
	for (const f of findings) {
		const a = answers.filter(x => x.n === f.n).at(-1);
		if (!a) { unansweredNums.push(f.n); continue; }
		if (/^fixed\b/i.test(a.reply)) fixed++;
		else if (/^declined\b/i.test(a.reply)) declined++;
		else if (f.kind === "note" && /^noted\b/i.test(a.reply)) noted++;
		else unansweredNums.push(f.n);
	}
	if (unansweredNums.length) return `reviewed: ${unansweredNums.length} unanswered: #${unansweredNums.join(", #")}`;
	return `reviewed: ${[fixed && `${fixed} fixed`, declined && `${declined} declined`, noted && `${noted} noted`].filter(Boolean).join(", ")}`;
}

// The TOP of whichever checkout `cwd` actually lives in — `--show-toplevel`, never
// `--git-common-dir` (that one is shared by every worktree of a repo, so from inside a worktree
// it resolves to the MAIN tree, not this one — a real bug the fresh-eyes review on this task
// caught: `--score`/`--backfill` run from a worktree wrote straight into the main tree's live,
// shared scoreboard.jsonl, invisible to `git status` in the worktree that actually ran them).
// Score and backfill must stay inside whichever tree the taskDir being scored lives in — its own
// worktree until that worktree's branch actually merges, same as every other file here.
function repoRoot(cwd) { return git(cwd, "rev-parse", "--show-toplevel").stdout.trim(); }
const scoreboardPath = root => path.join(root, "public/framework/ai/collab/scoreboard.jsonl");
// The reviewed task's own dir, relative to ai/ — e.g. "2026-09-28/fresh-eyes-review".
const collabIdFor = (root, taskDir) => path.relative(path.join(root, "public/framework/ai"), taskDir).replaceAll("\\", "/");
// Stable per review-run id, so re-running --score/--backfill on the same run never duplicates.
// Keyed by the review's own head commit, not just the task dir: re-running --score on the SAME
// settled run reuses the id (idempotent), but a genuinely second review round on the same task
// (new commits after the first round settled) gets its own id instead of colliding with, and
// silently losing, the first round's usefulness data.
const decisionIdFor = (taskDir, review) => "review-" + slug(path.basename(taskDir)) + "-" + (review.head || "").slice(0, 7);
function readScoreboard(root) { return readJsonl(scoreboardPath(root)).map(l => l.score).filter(Boolean); }
function alreadyScored(root, collab, decision) { return readScoreboard(root).some(s => s.kind === "review" && s.collab === collab && s.decision === decision); }

/* `--turns <taskdir>`: mirrors this run's new `{"review":{"answer":…}}` task.jsonl lines into
 * review.jsonl as phase 2, then (only for a decline that has no reply yet) spawns ONE fresh
 * reviewer to answer accept/hold as phase 3. Idempotent both ways — see readTurns' merge-by-n. */
async function turnsCmd(taskDir) {
	const entries = readTaskJsonl(taskDir);
	if (!entries.length) { console.error(`--turns: no task.jsonl at ${taskDir}`); process.exit(1); }
	const reviewRows = entries.map((e, i) => ({ e, i })).filter(x => x.e.review?.verdict && !x.e.review.answer);
	if (!reviewRows.length) { console.error(`--turns: no review found in ${taskDir}/task.jsonl — run review.mjs <taskdir> <worktree> first`); process.exit(1); }
	const { e: latest, i: reviewIdx } = reviewRows.at(-1);

	let turns = readTurns(taskDir);
	if (!turns.phase1Done) writePhase1(taskDir, latest.review);

	// Phase 2: every answer that comes AFTER this review's own line in task.jsonl (file order —
	// task.jsonl's answer lines carry no timestamp of their own), not yet mirrored (same n + reply).
	const seen = new Set([...readTurns(taskDir).answers.entries()].map(([n, a]) => `${n}:${a.reply}`));
	const newAnswers = [];
	for (const e of entries.slice(reviewIdx + 1)) {
		if (!e.review?.answer) continue;
		const { n, reply } = e.review.answer, key = `${n}:${reply}`;
		if (seen.has(key)) continue;
		seen.add(key);
		newAnswers.push({ n, reply });
	}
	const reviewJsonl = reviewJsonlPath(taskDir);
	if (newAnswers.length) {
		appendJSON(reviewJsonl, { phase: { at: now(), n: 2, kind: "answers", status: "start" } });
		for (const a of newAnswers) appendJSON(reviewJsonl, { answer: { at: now(), n: a.n, reply: a.reply } });
		appendJSON(reviewJsonl, { phase: { at: now(), n: 2, kind: "answers", status: "done" } });
		console.log(`review.mjs --turns: mirrored ${newAnswers.length} answer(s)`);
	} else console.log("review.mjs --turns: no new answers to mirror");

	// Phase 3: only declines from what THIS run just mirrored, and only if nobody has replied yet.
	turns = readTurns(taskDir);
	const declines = newAnswers.filter(a => /^declined\b/i.test(a.reply) && !turns.replies.has(a.n));
	if (!declines.length) { console.log("review.mjs --turns: no new declines needing a reply"); return; }

	const root = repoRoot(taskDir);
	const name = ("reply-" + path.basename(taskDir)).replace(/[^a-z0-9-]+/gi, "-").slice(0, 40);
	const items = declines.map(a => `${a.n}. finding: ${turns.findings.get(a.n) || "(finding text not found)"}\n   declined because: ${a.reply.replace(/^declined:\s*/i, "")}`).join("\n");
	const prompt = `You are a fresh reviewer, judging whether an author was right to decline your colleague's finding. You have NOT seen the finding's original context or conversation — only what is given here.\n\n`
		+ `For each finding below, the author declined to fix it and gave a reason. Decide: is the decline reasonable ("accept"), or do you still think it needs fixing ("hold")?\n\n${items}\n\n`
		+ `Write ${path.join(taskDir, "review", "reply.md").replaceAll("\\", "/")}: one line per finding, "N. [accept] ..." or "N. [hold] ...", one or two plain sentences. Make no code edits. One pass, then stop.`;
	appendJSON(reviewJsonl, { phase: { at: now(), n: 3, kind: "replies", status: "start" } });
	let parsed = [], cost = 0;
	try {
		const spawned = await mcp("spawn_agent", { role: "reviewer", name, prompt, model: "claude-sonnet-5", effort: "medium", permission_mode: "bypassPermissions", cwd: root });
		if (!spawned.id) throw new Error(spawned.raw || spawned.why || "spawn_agent did not return an id");
		const waited = await mcp("wait_for_agent", { id: spawned.id, timeout_s: 900 }, 910000);
		cost = waited.cost ?? 0;
		await mcp("stop_agent", { id: spawned.id }, 20000);
		const replyPath = path.join(taskDir, "review", "reply.md");
		if (fs.existsSync(replyPath)) parsed = parseReply(fs.readFileSync(replyPath, "utf8"));
	} catch (e) {
		console.error(`--turns: phase 3 reviewer failed to run: ${String(e?.message || e).slice(0, 200)}`);
	}
	const perReply = declines.length ? Number((cost / declines.length).toFixed(6)) : 0;
	for (const a of declines) {
		const p = parsed.find(r => r.n === a.n);
		const stance = p?.stance || "hold";
		const text = p?.text || `reviewer gave no answer for finding ${a.n} (spawn failed or wrote nothing)`;
		appendJSON(reviewJsonl, { reply: { at: now(), n: a.n, stance, text, cost: perReply } });
	}
	appendJSON(reviewJsonl, { phase: { at: now(), n: 3, kind: "replies", status: "done" } });
	console.log(`review.mjs --turns: phase 3 replied to ${declines.length} decline(s), $${cost}`);
}

/* `--rule <taskdir> <n> <fix|stands> "<why>"`: the task mastermind's own ruling on a still-held
 * finding — no agent spawned. Refuses if phase 3 never ran, if n was never held, or if n was
 * already ruled on (one round of holds only, per requirements.md point 2). */
function ruleCmd(taskDirArg, nArg, decisionArg, why) {
	if (!taskDirArg || !nArg || !decisionArg || !why || !["fix", "stands"].includes(decisionArg)) {
		console.error('usage: node Server/review.mjs --rule <taskdir> <n> <fix|stands> "<why>"');
		process.exit(1);
	}
	const taskDir = path.resolve(taskDirArg), n = Number(nArg);
	const turns = readTurns(taskDir);
	if (!turns.phase3Done) { console.error(`--rule: refused — phase 3 (replies) hasn't run yet for ${taskDir}; run --turns first`); process.exit(1); }
	const reply = turns.replies.get(n);
	if (!reply || reply.stance !== "hold") { console.error(`--rule: refused — finding ${n} was never held (accepted, not declined, or no such finding)`); process.exit(1); }
	if (turns.rulings.has(n)) { console.error(`--rule: refused — finding ${n} was already ruled "${turns.rulings.get(n).decision}"`); process.exit(1); }
	const reviewJsonl = reviewJsonlPath(taskDir);
	appendJSON(reviewJsonl, { phase: { at: now(), n: 4, kind: "rulings", status: "start" } });
	appendJSON(reviewJsonl, { ruling: { at: now(), n, decision: decisionArg, why, by: "mastermind" } });
	appendJSON(reviewJsonl, { phase: { at: now(), n: 4, kind: "rulings", status: "done" } });
	console.log(`review.mjs --rule: finding ${n} ruled "${decisionArg}" — ${why}`);
}

// One review run's score line, from its task.jsonl review entry + answers. null if unsettled
// (an unanswered finding, or a hold with no ruling yet) — the caller decides what to say about that.
function scoreRow(root, taskDir) {
	const entries = readTaskJsonl(taskDir);
	const reviewRows = entries.filter(e => e.review?.verdict && !e.review.answer);
	if (!reviewRows.length) return { error: "no review found" };
	const review = reviewRows.at(-1).review;
	const findings = review.findings || [];
	const answers = new Map();
	for (const e of entries) if (e.review?.answer) answers.set(e.review.answer.n, e.review.answer.reply);
	let fixed = 0, unansweredNums = [];
	for (const f of findings) {
		const a = answers.get(f.n);
		if (!a) unansweredNums.push(f.n); else if (/^fixed\b/i.test(a)) fixed++;
	}
	if (unansweredNums.length) return { error: `${unansweredNums.length} unanswered: #${unansweredNums.join(", #")}` };
	const turns = readTurns(taskDir);
	for (const [n, r] of turns.replies) if (r.stance === "hold" && !turns.rulings.has(n)) return { error: `finding ${n} is held with no ruling yet` };
	const collab = collabIdFor(root, taskDir), decision = decisionIdFor(taskDir, review);
	return { collab, decision, score: { at: now(), kind: "review", collab, decision, member: review.model, model: review.model, size: review.size, cost: review.cost, findings: findings.length, fixed, changed_outcome: fixed > 0 } };
}

/* `--score <taskdir>`: append one score line for a SETTLED review run (every finding answered,
 * every hold ruled on) to the shared collab scoreboard. Refuses (prints why, exits 1) if the run
 * isn't settled yet, and skips silently — no duplicate — if this exact run was already scored. */
function scoreCmd(taskDirArg) {
	if (!taskDirArg) { console.error("usage: node Server/review.mjs --score <taskdir>"); process.exit(1); }
	const taskDir = path.resolve(taskDirArg), root = repoRoot(taskDir);
	const row = scoreRow(root, taskDir);
	if (row.error) { console.error(`--score: refused — ${row.error}`); process.exit(1); }
	if (alreadyScored(root, row.collab, row.decision)) { console.log(`review.mjs --score: ${row.collab} already scored (${row.decision}) — skipped`); return; }
	fs.mkdirSync(path.dirname(scoreboardPath(root)), { recursive: true });
	appendJSON(scoreboardPath(root), { score: row.score });
	console.log(`review.mjs --score: ${row.collab} — ${row.score.findings} finding(s), ${row.score.fixed} fixed, changed_outcome=${row.score.changed_outcome}`);
}

/* `--backfill`: every past `public/framework/ai/<date>/<slug>/review.md` that has no score row
 * yet gets one, reconstructed from that task's own task.jsonl. Never throws — a task missing
 * task.jsonl, or with an unparseable/unsettled review, is skipped with a printed reason. */
function backfillCmd() {
	const root = repoRoot(process.cwd());
	const aiDir = path.join(root, "public/framework/ai");
	let n = 0, skipped = 0;
	for (const day of fs.readdirSync(aiDir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))) {
		const dayDir = path.join(aiDir, day);
		let slugs; try { slugs = fs.readdirSync(dayDir, { withFileTypes: true }).filter(e => e.isDirectory()); } catch { continue; }
		for (const s of slugs) {
			const taskDir = path.join(dayDir, s.name);
			if (!fs.existsSync(path.join(taskDir, "review.md"))) continue;
			try {
				const row = scoreRow(root, taskDir);
				if (row.error) { console.log(`--backfill: skip ${day}/${s.name} — ${row.error}`); skipped++; continue; }
				if (alreadyScored(root, row.collab, row.decision)) continue;
				fs.mkdirSync(path.dirname(scoreboardPath(root)), { recursive: true });
				appendJSON(scoreboardPath(root), { score: row.score });
				n++;
			} catch (e) { console.log(`--backfill: skip ${day}/${s.name} — ${String(e?.message || e).slice(0, 150)}`); skipped++; }
		}
	}
	console.log(`review.mjs --backfill: ${n} scored, ${skipped} skipped`);
}

async function mcp(name, args, ms = 30000) {
	const r = await fetch(MCP, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }), signal: AbortSignal.timeout(ms) });
	const j = await r.json();
	const text = j.result?.content?.[0]?.text ?? j.error?.message ?? "";
	try { return JSON.parse(text); } catch { return { raw: text }; }
}

function buildPrompt(root, taskDir, cardDir, ownerWordsFiles, diffPath, shotPaths, size) {
	const rel = p => path.relative(root, p).replaceAll("\\", "/");
	const files = [rel(path.join(taskDir, "requirements.md")), ...ownerWordsFiles.map(rel), ...(cardDir ? [rel(cardDir)] : []), rel(diffPath), ...shotPaths.map(rel)];
	const q = "Does it do what the owner asked in requirements.md? Is anything broken? Is there a simpler way?"
		+ (size === "full" && shotPaths.length ? " Also, from the screenshots: is the space used well, is the order right, can the reader find everything, is the navigation clear?" : "");
	return `You are reviewing someone else's finished work with fresh eyes — you have never seen their conversation, only these files. Repo root: ${root.replaceAll("\\", "/")}.\n\n`
		+ `Read: ${files.join(", ")}.\n\n${q}\n\n`
		+ `Write ${rel(path.join(taskDir, "review.md"))}: its first line is exactly "verdict: pass" or "verdict: fix". Then numbered findings, one per line: "N. [fix] ..." for something that must change, or "N. [note] ..." for an observation worth a look — one or two plain sentences each, naming a file:line or a screenshot's file name.\n\n`
		+ `Make no code edits. One pass, then stop.`;
}

// The review skill's own absolute path, resolved from the tree THIS FILE lives in — never the
// main tree — so a worktree's copy of review.mjs hands its reviewer the worktree's own copy of
// the skill (a worktree may be mid-edit on the skill itself).
function reviewSkillPath() { return fileURLToPath(new URL("../.claude/skills/review/SKILL.md", import.meta.url)); }

// A page review's prompt: point the reviewer at the review skill (which already knows the report
// shape and every system's questions) instead of restating any of that here.
function buildPagePrompt(root, taskDir, cardDir, ownerWordsFiles, diffPath, shotsDir) {
	const rel = p => path.relative(root, p).replaceAll("\\", "/");
	const files = [rel(path.join(taskDir, "requirements.md")), ...ownerWordsFiles.map(rel), ...(cardDir ? [rel(cardDir)] : []), rel(diffPath), rel(shotsDir) + "/"];
	return `Load the review skill at ${reviewSkillPath().replaceAll("\\", "/")} and follow it — you are the fresh-eyes reviewer it describes.\n\n`
		+ `Read: ${files.join(", ")} (and each page's own layout.json inside ${rel(shotsDir)}/<page>/, as evidence under the layout, sizing, wrapping and spacing questions).\n\n`
		+ `Write ${rel(path.join(taskDir, "review", "report.md"))} in the exact shape the review skill gives.\n\n`
		+ `Make no code edits. One pass, then stop.`;
}

async function main() {
	const argv = process.argv.slice(2);
	if (argv[0] === "--status") { console.log(status(path.resolve(argv[1]))); return; }
	if (argv[0] === "--turns") { await turnsCmd(path.resolve(argv[1])); return; }
	if (argv[0] === "--rule") { ruleCmd(argv[1], argv[2], argv[3], argv[4]); return; }
	if (argv[0] === "--score") { scoreCmd(argv[1]); return; }
	if (argv[0] === "--backfill") { backfillCmd(); return; }
	if (argv[0] === "--questions") {
		const out = questionsCmd(repoRoot(process.cwd()));
		console.log(`review.mjs --questions: ${out.systems.length} system(s), ${out.systems.reduce((n, s) => n + s.questions.length, 0)} question(s) -> public/framework/ai/review/questions.json`);
		return;
	}
	const flag = name => { const i = argv.indexOf(name); if (i < 0) return undefined; const [, v] = argv.splice(i, 2); return v; };
	const range = flag("--range"), sizeArg = flag("--size"), why = flag("--why"), modelArg = flag("--model");
	const [taskDirArg, worktreeArg] = argv;
	if (!taskDirArg) { console.error('usage: node Server/review.mjs <taskdir> [<worktree dir>] [--range A..B] [--size none|light|full] [--why "..."] [--model <id>]'); process.exit(1); }
	const taskDir = path.resolve(taskDirArg);
	const worktreeDir = range ? null : path.resolve(worktreeArg || process.cwd());
	// The main repo this worktree belongs to (the same trick merge.mjs uses): never assume it is
	// wherever THIS copy of review.mjs happens to live — a worktree carries its own copy of this
	// file, and .worktrees.json / Server/layout-check.mjs / the task's public/framework/ai only
	// exist for certain in the MAIN tree.
	const root = path.dirname(git(worktreeDir || process.cwd(), "rev-parse", "--path-format=absolute", "--git-common-dir").stdout.trim());
	const cwd = range ? root : worktreeDir;
	const spec = range ? range : `${BASE}...${git(worktreeDir, "rev-parse", "--abbrev-ref", "HEAD").stdout.trim()}`;
	const [, rangeB] = range ? range.split(/\.\.\.?/) : [];
	const branch = range ? rangeB : git(worktreeDir, "rev-parse", "--abbrev-ref", "HEAD").stdout.trim();
	const head = range ? git(cwd, "rev-parse", rangeB).stdout.trim() : git(worktreeDir, "rev-parse", "HEAD").stdout.trim();

	// So the questions page never goes stale, even for someone who never runs --questions by hand.
	try { questionsCmd(root); } catch (e) { console.log(`review.mjs: --questions failed to refresh questions.json — ${String(e?.message || e).slice(0, 150)}`); }

	const { nameStatus: status_, numstat } = diffStat(cwd, spec);
	const files = status_.map(x => x.f);
	const computed = sizeOf(status_, numstat);
	let size = computed;
	if (sizeArg) {
		const rank = { none: 0, light: 1, full: 2 };
		if (rank[sizeArg] < rank[computed] && !why) { console.error(`refused: lowering size from ${computed} to ${sizeArg} needs --why`); process.exit(1); }
		if (rank[sizeArg] !== rank[computed]) appendJSON(path.join(taskDir, "task.jsonl"), { decision: { at: now(), question: "review size", computed, chose: sizeArg, why: why ?? "raised, no reason needed" } });
		size = sizeArg;
	}

	const taskJsonl = path.join(taskDir, "task.jsonl");
	if (size === "none") {
		fs.writeFileSync(path.join(taskDir, "review.md"), `verdict: pass\n\nNo review needed: only CSS/docs changed (${numstat.reduce((n, r) => n + r.added + r.deleted, 0)} line(s)), no new file.\n`);
		const review = { at: now(), size, verdict: "pass", findings: [], branch, head, model: null, cost: 0, file: "review.md" };
		appendJSON(taskJsonl, { review });
		writePhase1(taskDir, review);
		console.log(`review.mjs: size none — ${branch} — pass, no agent`);
		return;
	}

	fs.mkdirSync(path.join(taskDir, "review"), { recursive: true });
	const diffPath = path.join(taskDir, "review", "diff.patch");
	fs.writeFileSync(diffPath, git(cwd, "diff", "--no-renames", spec).stdout);

	// A page review: the diff touches at least one page.js/page.jsonl (pageUrlFor finds a URL for
	// it). Every page review — `light` or `full` — gets screenshots at the four widths and uses
	// the review skill; anything else keeps the plain brief-and-diff prompt, same as always.
	const pages = [...new Set(files.map(pageUrlFor).filter(Boolean))];
	const pageReview = pages.length > 0;
	const shotsDir = path.join(taskDir, "shots");
	if (pageReview) {
		const HOST = "http://monorepo.localhost";
		const found = worktreeBase(root, worktreeDir);
		const base = found ?? HOST;
		const already = pages.every(p => WIDTHS.every(w => fs.existsSync(path.join(shotsDir, slug(base + p), `${w}.png`))));
		if (already) console.log(`review.mjs: shots already present for every page under ${path.relative(root, shotsDir)} — skipping layout-check`);
		else {
			// Falling back to the MAIN site's URL when this worktree has no .worktrees.json entry
			// would screenshot the wrong tree with no sign of it — say so instead of staying silent.
			if (!found) console.log(`review.mjs: no worktree entry for ${worktreeDir} in .worktrees.json — screenshotting the MAIN site instead, not this worktree's own copy`);
			fs.mkdirSync(shotsDir, { recursive: true });
			const lc = run("node", [path.join(root, "Server", "layout-check.mjs"), ...pages.map(p => base + p), "--widths", WIDTHS.join(","), "--bands", "--out", shotsDir]);
			console.log(lc.stdout + lc.stderr);
		}
		const sheets = pages.map(p => `shots/${slug(base + p)}/sheet.png`);
		const bands = pages.map(p => `shots/${slug(base + p)}/layout.json`).filter(f => fs.existsSync(path.join(taskDir, f)));
		appendJSON(taskJsonl, { shots: { at: now(), pages, dir: "shots/", sheet: sheets[0], sheets, bands } });
	}

	// cardDir: the "Card: `...`" line. ownerWordsFiles: every "Owner's words: `...`" line, resolved
	// the same way — both live under public/framework/ai/ per the brief's own convention.
	let cardDir = null, ownerWordsFiles = [];
	try {
		const req = fs.readFileSync(path.join(taskDir, "requirements.md"), "utf8");
		const cm = /Card:\s*`([^`]+)`/.exec(req);
		if (cm) { const d = path.join(root, "public/framework/ai", cm[1]); if (fs.existsSync(d)) cardDir = d; }
		for (const m of req.matchAll(/Owner'?s words:[^\n]*?`([^`]+)`/gi)) {
			const f = path.join(root, "public/framework/ai", m[1]);
			if (fs.existsSync(f)) ownerWordsFiles.push(f);
		}
	} catch {}

	const model = modelArg || (size === "full" ? "claude-opus-5-5" : "claude-sonnet-5");
	const name = path.basename(taskDir).replace(/[^a-z0-9-]+/gi, "-").slice(0, 40);
	// A page review writes review/report.md and asks the reviewer to load the review skill;
	// everything else keeps the plain prompt and review.md, exactly as before this task.
	const reviewRelFile = pageReview ? "review/report.md" : "review.md";
	const reviewPath = path.join(taskDir, reviewRelFile);
	const prompt = pageReview
		? buildPagePrompt(root, taskDir, cardDir, ownerWordsFiles, diffPath, shotsDir)
		: buildPrompt(root, taskDir, cardDir, ownerWordsFiles, diffPath, [], size);
	let verdict = "fix", findings = [{ n: 1, kind: "fix", text: "the reviewer never ran" }], cost = 0;
	// a stale report from a previous run must never be read as if it answered THIS head
	try { fs.unlinkSync(reviewPath); } catch {}
	try {
		const spawned = await mcp("spawn_agent", { role: "reviewer", name, prompt, model, effort: "medium", permission_mode: "bypassPermissions", cwd: root });
		if (!spawned.id) throw new Error(spawned.raw || spawned.why || "spawn_agent did not return an id");
		const waited = await mcp("wait_for_agent", { id: spawned.id, timeout_s: 900 }, 910000);
		cost = waited.cost ?? 0;   // list_agents' row carries no cost field today; wait_for_agent's own answer does
		await mcp("stop_agent", { id: spawned.id }, 20000);
		if (fs.existsSync(reviewPath)) ({ verdict, findings } = parseReview(fs.readFileSync(reviewPath, "utf8")));
		else findings = [{ n: 1, kind: "fix", text: `the reviewer wrote no ${reviewRelFile}` }];
	} catch (e) {
		findings = [{ n: 1, kind: "fix", text: `reviewer failed to run: ${String(e?.message || e).slice(0, 200)}` }];
		fs.mkdirSync(path.dirname(reviewPath), { recursive: true });
		fs.writeFileSync(reviewPath, `verdict: fix\n\n1. [fix] reviewer failed to run: ${String(e?.message || e).slice(0, 200)}\n`);
	}
	const review = { at: now(), size, verdict, findings, branch, head, model, cost, file: reviewRelFile, report: pageReview ? reviewRelFile : null, shots: pageReview ? "shots/" : null };
	appendJSON(taskJsonl, { review });
	writePhase1(taskDir, review);
	console.log(`review.mjs: size ${size} — ${branch} — ${verdict}, ${findings.length} finding(s), $${cost}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });
