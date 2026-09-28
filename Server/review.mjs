/* `node Server/review.mjs <taskdir> [<worktree dir>] [--range A..B] [--size none|light|full] [--why "..."] [--model <id>]`
 * Fresh eyes on a finished task: an agent that never saw the author's conversation reads only the
 * brief, the diff and (for a new page/module) screenshots, then says pass or fix. Why fresh: an
 * agent that reviews its own code agrees with itself.
 *
 * SIZE (`sizeOf`, exported): `none` — only .css/.md changed, 20 changed lines or fewer, no added
 * file: no agent runs, review.md just says so. `light` — code changed, but no new page/module/
 * Servex file: a fresh Sonnet reads the brief and the diff. `full` — a new page.js, a new .js/.mjs
 * module, or anything under Servex/: a fresh Opus also gets 1280/1920/3440 screenshots and the four
 * layout questions. `--size` may only RAISE the computed size; lowering it needs `--why`, logged as
 * a `{"decision":…}` line so the reason survives.
 *
 * DIFF: normally `git diff michael/dev...<branch>` run INSIDE the worktree (default: cwd) — the
 * worktree shares the main repo's objects, so `michael/dev` is visible from there. `--range A..B`
 * instead diffs two commits in the MAIN repo, for a task that already landed (the proof runs use
 * this on old merge commits).
 *
 * The reviewer is a brand-new Servex agent (`spawn_agent` over the loopback MCP at
 * http://127.0.0.1:8090/mcp, then `wait_for_agent`, then `stop_agent` — the same three calls
 * `Server/clarity.mjs` makes) — never a `resume` or `fork`, so it truly has not seen the author's
 * turns. It writes `<taskdir>/review.md` (first line `verdict: pass` or `verdict: fix`, then
 * findings `N. [fix] …` / `N. [note] …`) and this script parses that (`parseReview`, exported) into
 * one `{"review":{…}}` line appended to the task's task.jsonl.
 *
 * `--status <taskdir>` (no other args) prints one phrase for the dashboard card: `reviewed: pass`,
 * `reviewed: 2 fixed, 1 declined`, `reviewed: 1 unanswered`, or `not reviewed` (`status`, exported;
 * see doc/review.md for how a finding is answered). Every Node spawn here sets `windowsHide: true`.
 * Never throws: a Servex problem becomes a `fix` finding saying so, not a crash. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const BASE = "michael/dev";
const MCP = "http://127.0.0.1:8090/mcp";
const WIDTHS = [1280, 1920, 3440];
const lines = s => s.split(/\r?\n/).filter(Boolean);
const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 });
const git = (cwd, ...a) => run("git", a, cwd);
const slug = u => u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "page";
const now = () => { const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`; };
function appendJSON(file, obj) {
	let lead = ""; try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.appendFileSync(file, lead + JSON.stringify(obj) + "\n");
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
	let fixed = 0, declined = 0, unanswered = 0;
	for (const f of findings) {
		const a = answers.filter(x => x.n === f.n).at(-1);
		if (!a) unanswered++; else if (/^fixed\b/i.test(a.reply)) fixed++; else if (/^declined\b/i.test(a.reply)) declined++; else unanswered++;
	}
	if (unanswered) return `reviewed: ${unanswered} unanswered`;
	return `reviewed: ${[fixed && `${fixed} fixed`, declined && `${declined} declined`].filter(Boolean).join(", ")}`;
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

async function main() {
	const argv = process.argv.slice(2);
	if (argv[0] === "--status") { console.log(status(path.resolve(argv[1]))); return; }
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
		appendJSON(taskJsonl, { review: { at: now(), size, verdict: "pass", findings: [], branch, head, model: null, cost: 0, file: "review.md" } });
		console.log(`review.mjs: size none — ${branch} — pass, no agent`);
		return;
	}

	fs.mkdirSync(path.join(taskDir, "review"), { recursive: true });
	const diffPath = path.join(taskDir, "review", "diff.patch");
	fs.writeFileSync(diffPath, git(cwd, "diff", "--no-renames", spec).stdout);

	let shotFiles = [];
	if (size === "full") {
		const pages = [...new Set(files.map(pageUrlFor).filter(Boolean))];
		const HOST = "http://monorepo.localhost";
		const already = pages.length && pages.every(p => WIDTHS.every(w => fs.existsSync(path.join(taskDir, "layout-check", slug(HOST + p), `${w}.png`))));
		if (pages.length && already) shotFiles = pages.map(p => path.join(taskDir, "layout-check", slug(HOST + p), "sheet.png"));
		else if (pages.length) {
			const base = worktreeBase(root, worktreeDir) ?? HOST;
			const shots = path.join(taskDir, "review", "shots");
			fs.mkdirSync(shots, { recursive: true });
			const lc = run("node", [path.join(root, "Server", "layout-check.mjs"), ...pages.map(p => base + p), "--widths", WIDTHS.join(","), "--out", shots]);
			console.log(lc.stdout + lc.stderr);
			shotFiles = pages.map(p => path.join(shots, slug(base + p), "sheet.png"));
		}
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
	const prompt = buildPrompt(root, taskDir, cardDir, ownerWordsFiles, diffPath, shotFiles, size);
	let verdict = "fix", findings = [{ n: 1, kind: "fix", text: "the reviewer never ran" }], cost = 0;
	// a stale review.md from a previous run must never be read as if it answered THIS head
	try { fs.unlinkSync(path.join(taskDir, "review.md")); } catch {}
	try {
		const spawned = await mcp("spawn_agent", { role: "reviewer", name, prompt, model, effort: "medium", permission_mode: "bypassPermissions", cwd: root });
		if (!spawned.id) throw new Error(spawned.raw || spawned.why || "spawn_agent did not return an id");
		const waited = await mcp("wait_for_agent", { id: spawned.id, timeout_s: 900 }, 910000);
		cost = waited.cost ?? 0;   // list_agents' row carries no cost field today; wait_for_agent's own answer does
		await mcp("stop_agent", { id: spawned.id }, 20000);
		const reviewPath = path.join(taskDir, "review.md");
		if (fs.existsSync(reviewPath)) ({ verdict, findings } = parseReview(fs.readFileSync(reviewPath, "utf8")));
		else findings = [{ n: 1, kind: "fix", text: "the reviewer wrote no review.md" }];
	} catch (e) {
		findings = [{ n: 1, kind: "fix", text: `reviewer failed to run: ${String(e?.message || e).slice(0, 200)}` }];
		fs.writeFileSync(path.join(taskDir, "review.md"), `verdict: fix\n\n1. [fix] reviewer failed to run: ${String(e?.message || e).slice(0, 200)}\n`);
	}
	appendJSON(taskJsonl, { review: { at: now(), size, verdict, findings, branch, head, model, cost, file: "review.md" } });
	console.log(`review.mjs: size ${size} — ${branch} — ${verdict}, ${findings.length} finding(s), $${cost}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });
