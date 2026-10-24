/* `node Server/merge.mjs <worktree dir> [paths...] [--main <dir>] [--skip-smoke] [--dry-run] [--quick [--asked <iso>]]` — the one serialized way to land a worktree.
 * It takes a lock (.merge.lock at the main repo root) so two merges never run at once, refuses
 * uncommitted work in the worktree, smoke-tests it (Server/smoke.mjs), then lands its branch on
 * michael/dev with the live-reload hold on. It NEVER runs `git merge` over uncommitted edits in the
 * main tree (2026-09-25: that reset 85 of the owner's files): it compares the branch's files with
 * the main tree's dirty files FIRST.
 *
 * `--no-review "why"` is also a flag, alongside the ones above — see below.
 * NAV GATE (the owner, 2026-10-23: a page nobody can click to does not exist): every NEW page.js/page.jsonl must be
 * reachable by an `a[href]` on its parent page, loaded headless on the worktree's own server (`Server/NavCheck.mjs`).
 * An unlinked new page refuses the merge and prints each page with its parent; `--no-nav "why"` merges anyway, loudly.
 *
 * REVIEW GATE (2026-09-28, fresh-eyes-review; page report added 2026-09-30, review-gate): before
 * the smoke test, a light or full-size branch (`Server/review.mjs`'s `sizeOf`) needs a review newer
 * than its head with every `[fix]` finding answered, or the merge refuses with the one command to
 * fix that; a branch that also touches a page (`pageUrlFor`) needs that review's own page report
 * (`review/report.md`), not just the plain review.md a non-page change gets; `--no-review "why"`
 * or `--main` skip it, loudly.
 *
 * IT FINDS THE CHANGED PAGES ITSELF (2026-09-28, smoke-links): every `page.js`/`page.jsonl` the
 * branch touches that still exists on the branch (skipping deleted/moved originals), from `git diff
 * --name-only BASE...branch`, is turned into that page's own site url (`pageUrlFor()` below — a card
 * folder under `public/framework/ai/YYYY/MM/DD/…` maps to `/framework/ai2/YYYY/MM/DD/…`; anything
 * else's url is just the directory holding the page.js) and handed to `smoke.mjs` alongside any
 * paths given by hand — which now also FOLLOWS every link on each page it loads, one level deep. Why:
 * 7 concept-tile links shipped 404ing because nothing had ever clicked them — not the landing
 * screenshot, not the old smoke test (which only loaded the pages an agent remembered to list).
 * Every NEW page.js in the diff (added, not modified) then gets a 1920 screenshot via `layout-check.mjs`,
 * in `.merge-shots/` at the repo root, and the file paths print at the end.
 *   No overlap: `git merge-tree` proves the merge is clean, then the same three-way write below lands it
 *               (2026-10-13: never `git merge` at all; see ai/sessions/doc/commit-rule.md).
 *   Overlap:  a three-way merge per file (`git merge-file`: base = the merge base, ours = the main
 *               tree's working file, theirs = the branch), computed for EVERY file in memory first;
 *               one conflict and nothing is written. If no prior staged files exist, it stages only
 *               the merged files and commits via MERGE_HEAD; otherwise leaves them in the working
 *               tree and prints a one-line summary of what it left. The branch head is recorded in
 *               .merge-landed.json.
 *   A live log is never rewritten: every *.jsonl is read again at write time and any line appended
 *               since planning is kept (jsonl-keep.mjs, 2026-09-29: readme-chain lost its landing line).
 * Nothing is ever reset, stashed, checked out, forced or rewritten. `--main` points at another repo
 * (for proofs on a scratch repo); `--skip-smoke` is for those proofs only; `--dry-run` computes and
 * prints every file's result and writes nothing (no lock, no hold).
 * A page path Git Bash mangled ("C:/Program Files/Git/framework/…", from a /path given without
 * MSYS_NO_PATHCONV=1) is refused before the lock, naming the fix (2026-09-30, node-reliability).
 *
 * `--quick` (2026-10-01, quick-merge): the fast path for a one-line voice fix. Skips the reviewer
 * agent entirely — allowed only when the diff is `sizeOf` none/light, 20 changed lines or fewer,
 * and every file sits under one `public/<a>/<b>/<c>/` module (or it's a single `Server/` file);
 * otherwise refuses with exit 2 (never 1 — the fixer tells "too big for quick" apart from a real
 * failure by this code alone) naming the line count, module count and size, and says to run the
 * normal path. When it IS small enough: the same smoke test every branch gets, then ONE
 * screenshot (`Server/review.mjs`'s `widthsFor` picks the width — normally one, not all four) of
 * the worktree's own version of the page, then a `review.md` line ("size quick — one shot at <w>
 * — pass", `writeNoReviewPass`, the same code `review.mjs --size none` uses) so the dashboard
 * still sees a real record even with no agent — then the ordinary merge below, unchanged.
 * `--asked <iso>` is the moment the fix was asked for (voice → smart assistant), so the final
 * line's `ms` is the owner-felt latency, not just this script's own run time. The LAST line of
 * stdout, only on a landed `--quick`, is one JSON object: `{"merged","shot","width","ms","asked_at"}`.
 * Exit: 0 landed (or dry run clean), 1 refused or smoke failed, 2 too big for --quick, 3 lock wait timed out, 4 would conflict (nothing touched), 5 landed but a file is still untracked (a new file is staged with `git add -A` on every landed path; see Server/doc/review.md). */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sizeOf, status as reviewStatus, diffStat, pageUrlFor, widthsFor, splitPatch, writeNoReviewPass } from "./review.mjs";
import { keepLive } from "./jsonl-keep.mjs";
import TaskDirs from "./TaskDirs.mjs";
import { OrphanCheck } from "./OrphanCheck.mjs";
import NavCheck from "./NavCheck.mjs";
import Browser from "./Browser.mjs";
import { refuse_links_into_main } from "./junction-guard.mjs";
import SessionRecord from "./SessionRecord.mjs";
import MergeTests from "./MergeTests.mjs";

const BASE = "michael/dev";
const argv = process.argv.slice(2);
const flag = name => { const i = argv.indexOf(name); if (i < 0) return undefined; const [, v] = argv.splice(i, 2); return v; };
const bool = name => argv.includes(name) && (argv.splice(argv.indexOf(name), 1), true);
const skipSmoke = bool("--skip-smoke");
const skipTests = bool("--skip-tests");   // for proofs on a scratch repo only, like --skip-smoke
const dryRun = bool("--dry-run");
const mainArg = flag("--main");
const noReview = flag("--no-review");
const noNav = flag("--no-nav");   // "why": merge an unlinked new page anyway (Server/doc/nav-check.md)
const reviewDir = flag("--review-dir");   // the task dir to look in when it sits under a session older than the 4-day scan (a long-lived mastermind's tasks)
const quick = bool("--quick");
const asked = flag("--asked");
const mergeStart = Date.now();
const [dirArg, ...paths] = argv;
if (!dirArg) { console.error("usage: node Server/merge.mjs <worktree dir> [paths...] [--main <dir>] [--skip-smoke] [--skip-tests] [--dry-run] [--quick [--asked <iso>]]"); process.exit(1); }
// Git Bash rewrites "/framework/ai2/" into "C:/Program Files/Git/framework/ai2/"; the smoke run then
// hunts for it while holding everyone's merge lock (node-reliability, 2026-09-30). Refuse before the lock.
const mangled = [...paths, mainArg ?? ""].find(p => /Program Files[\\/]Git[\\/]/i.test(p));
if (mangled) { console.error(`refused: "${mangled}" was rewritten by Git Bash. Rerun as MSYS_NO_PATHCONV=1 node Server/merge.mjs ...`); process.exit(1); }
// (also --no-review "why": see the review-gate paragraph in the header above)
const dir = path.resolve(dirArg);
if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { console.error(`refused: "${dirArg}" is not a directory. merge.mjs takes the worktree's folder (git worktree list), not a branch name.`); process.exit(1); }
const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 });
const git = (cwd, ...a) => run("git", a, cwd);
// the main repo: the one this worktree belongs to, unless --main says otherwise
const MAIN = mainArg ? path.resolve(mainArg)
	: path.dirname(git(dir, "rev-parse", "--path-format=absolute", "--git-common-dir").stdout.trim());
const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const lockFile = path.join(MAIN, ".merge.lock");
const lines = s => s.split(/\r?\n/).filter(Boolean);

// pageUrlFor (a changed page.js/page.jsonl's own site url, or null) is imported from review.mjs
// above, next to sizeOf — the review gate needs the exact same rule, so there is only one copy.

// The worktree's own dev server — same lookup smoke.mjs makes, so a screenshot loads the branch's
// own pages, not the main tree's.
function worktreeBase(dir){
	const f = path.join(MAIN, ".worktrees.json");
	if (!fs.existsSync(f)) return null;
	const norm = p => path.resolve(p).replace(/\\/g, "/").toLowerCase();
	const entry = Object.values(JSON.parse(fs.readFileSync(f, "utf8"))).find(e => norm(e.path) === norm(dir));
	return entry ? `http://127.0.0.1:${entry.port}` : null;
}

// A branch named "worktree/<slug>" usually has a same-slug task dir, if one was ever opened:
// public/framework/ai/<one of the last 4 days>/<slug>/ — the most recent day that actually has
// it. null if the branch isn't shaped that way, or no such day dir exists (most quick fixes:
// they skip new-task entirely, so this is the common case, not the exception). Shared by
// reviewGate (prints it as the runnable command) and the --quick path (where the shot and the
// quick review record land, when there IS a task for them to live beside).
function guessTaskDir(aiDir, branch){
	const slug = /^worktree\/(.+)$/.exec(branch)?.[1];
	if (!slug || !fs.existsSync(aiDir)) return null;   // a scratch/proof repo has no ai/ dir at all yet
	const daysAgo = d => Math.floor((Date.now() - Date.parse(d)) / 86400000);
	for (const day of fs.readdirSync(aiDir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && daysAgo(d) <= 3 && daysAgo(d) >= 0).sort().reverse()) {
		const p = path.join(aiDir, day, slug);
		if (fs.existsSync(p)) return p;
	}
	// the sessions store, where every task has lived since 2026-10-12 (ai/doc/task-folders.md): the slug in the last 3 days
	for (let i = 0; i <= 3; i++){
		const hit = TaskDirs.locate(TaskDirs.day(Date.now() - i * 86400000), slug, path.join(aiDir, "sessions"));
		if (hit) return hit;
	}
	return null;
}

// public/<a>/<b>/<c>/ — the "one module directory" --quick's own gate asks for. null if `f`
// doesn't even reach three segments under public/ (nothing under Server/ does; that path is
// handled separately, by file count, in quickEligible below).
function moduleDirOf(f){
	const m = /^public\/([^/]+)\/([^/]+)\/([^/]+)\//.exec(f);
	return m ? m[0] : null;
}

/* --quick's own gate (requirements.md point 2): allowed only when `sizeOf` is none/light AND the
 * diff is 20 changed lines or fewer AND every file lives under the SAME public/<a>/<b>/<c>/
 * module — or the whole diff is exactly one file under Server/. Never throws; the caller prints
 * `why` and exits 2 on a no. */
function quickEligible(nameStatus, numstat){
	const size = sizeOf(nameStatus, numstat);
	const totalLines = numstat.reduce((n, r) => n + (Number(r.added) || 0) + (Number(r.deleted) || 0), 0);
	const files = nameStatus.map(x => x.f);
	const oneServerFile = files.length === 1 && files[0].startsWith("Server/");
	const dirs = new Set(files.map(f => moduleDirOf(f) ?? f));
	const oneModule = oneServerFile || (dirs.size === 1 && files.every(f => moduleDirOf(f)));
	const ok = (size === "none" || size === "light") && totalLines <= 20 && oneModule;
	return { ok, size, totalLines, dirCount: oneModule ? 1 : dirs.size,
		why: `refused: --quick needs ≤20 lines in one module (this is ${totalLines} lines in ${oneModule ? 1 : dirs.size} dir(s), size ${size}); run the normal path` };
}

/* The review gate. null = ok to merge (nothing needed, or --main/--no-review skipped it).
 * A string = the refusal to print. Scans the last 4 days of task dirs for the newest
 * `{"review":…}` line (not an `answer`) naming this branch, then requires its `head` to be
 * this branch's head, or an ancestor of it with every `[fix]` finding answered (`review.mjs`'s
 * own `status()`, so the phrase and the gate can never disagree). */
/* Shots reminder (screenshot-system, 2026-10-12): a branch that changes CSS or a page's JS should have
 * a Shots round of each changed page since the branch began. A warning, not a refusal — yet.
 * Changes only to page.jsonl content blocks are exempt. Detail: /framework/ext/Shots/ */
function shotsReminder(changed, pages, branch){
	if (!changed.some(f => f.startsWith("public/") && /\.(css|js|mjs|html)$/.test(f)) || !pages.length) return;
	const since = git(MAIN, "log", "-1", "--format=%cI", git(MAIN, "merge-base", BASE, branch).stdout.trim()).stdout.trim();
	let runs = [];
	try { runs = fs.readFileSync(path.join(MAIN, "public/framework/ext/Shots/runs.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l).run).filter(Boolean); } catch {}
	const missing = pages.filter(u => !runs.some(r => r.url === u && (!since || new Date(r.at) >= new Date(since))));
	if (missing.length) console.warn(`!!! Shots: no screenshot round since this branch began for ${missing.join(", ")} — shoot, read, judge: node Server/shots.mjs <url> !!!`);
}

function reviewGate(branch, head){
	if (mainArg) { console.warn(`!!! --main: merging against another repo WITHOUT a fresh-eyes review !!!`); return null; }
	if (noReview) { console.warn(`!!! --no-review: ${noReview} — merging WITHOUT a fresh-eyes review !!!`); return null; }
	const { nameStatus, numstat } = diffStat(MAIN, `${BASE}...${branch}`);
	if (sizeOf(nameStatus, numstat) === "none") return null;
	const daysAgo = d => Math.floor((Date.now() - Date.parse(d)) / 86400000);
	const aiDir = path.join(MAIN, "public/framework/ai");
	// every task.jsonl under a day dir, AT ANY DEPTH — a task's own review lines usually sit one
	// level down, but a proof run (or a sub-task in a subfolder) can nest deeper.
	function taskLogs(dir){
		let out = [];
		for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, e.name);
			if (e.isDirectory()) out.push(...taskLogs(p));
			else if (SessionRecord.is_log_entry(dir, e.name)) out.push(p);
		}
		return out;
	}
	let best = null;
	// Day dirs: ai/YYYY-MM-DD/ and, since sessions moved, ai/sessions/YYYY/MM/DD/ (2026-10-12).
	// Read in BOTH trees (2026-10-23): a review run from the worktree writes its lines into the
	// worktree's copy of the task record and commits them on the branch, so the main tree never
	// sees them until the merge this gate is guarding. The newest review naming the branch wins,
	// in whichever tree it sits; its report, shots and answers are read beside it.
	function dayDirs(root){
		const ai = path.join(root, "public/framework/ai");
		if (!fs.existsSync(ai)) return [];
		const out = fs.readdirSync(ai).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && daysAgo(d) <= 3 && daysAgo(d) >= 0).map(d => path.join(ai, d));
		for (let i = 0; i <= 3; i++) {
			const [y, m, dd] = TaskDirs.day(new Date(Date.now() - i * 86400000)).split("-");
			const p = path.join(ai, "sessions", y, m, dd);
			if (fs.existsSync(p)) out.push(p);
		}
		if (reviewDir && fs.existsSync(path.resolve(root, reviewDir))) out.push(path.resolve(root, reviewDir));
		return out;
	}
	const roots = [MAIN, ...(path.resolve(dir).toLowerCase() === path.resolve(MAIN).toLowerCase() ? [] : [dir])];
	for (const root of roots)
		for (const day of dayDirs(root))
			for (const tj of taskLogs(day)) {
				const td = path.dirname(tj);
				for (const l of lines(fs.readFileSync(tj, "utf8"))) {
					let e; try { e = JSON.parse(l); } catch { continue; }
					if (e.review?.verdict && !e.review.answer && e.review.branch === branch && (!best || (e.review.at ?? "") > (best.e.review.at ?? ""))) best = { td, e, root };   // a hand-written review line with no `at` is oldest; undefined > "…" is always false, so it used to win forever (2026-10-23)
				}
			}
	// no review yet: guess the task dir from the branch name so the printed command is runnable as-is
	const guessedTd = best ? null : guessTaskDir(aiDir, branch);
	const cmd = `node Server/review.mjs ${best ? path.relative(best.root, best.td).replaceAll("\\", "/") : guessedTd ? path.relative(MAIN, guessedTd).replaceAll("\\", "/") : "<taskdir or public/framework/ai/<date>/<slug>>"} ${dir}`;
	if (!best) return `refused: ${branch} is size ${sizeOf(nameStatus, numstat)} and has no review; run: ${cmd}`;
	const current = best.e.review.head === head || git(MAIN, "merge-base", "--is-ancestor", best.e.review.head, head).status === 0;
	if (!current) return `refused: ${branch}'s review is stale; run: ${cmd}`;
	const rs = reviewStatus(best.td);
	// Name which findings, not just how many — so whoever reads the refusal doesn't have to go hunting.
	if (/unanswered/.test(rs)) return `refused: ${branch}'s review has an unanswered finding (${rs}). An answer is a {"review":{"answer":{"n":N,"reply":"fixed: …"}}} line in ${best.td}/task.jsonl (append.mjs; fixed/declined, or noted for a [note]) — a line typed into review.md does not count. Or re-review: ${cmd}`;
	// A branch that touches a page needs the page-shaped report (screenshots at all four widths,
	// every layout question answered), not just the plain brief-and-diff review.md a non-page
	// change gets — review.mjs only writes review/report.md when it saw a page in the diff.
	if (nameStatus.filter(x => x.status !== "D").some(x => pageUrlFor(x.f)) && (!best.e.review.report || !fs.existsSync(path.join(best.td, best.e.review.report))))
		return `refused: ${branch} changes a page and its review has no report (review/report.md); run: ${cmd}`;
	/* Screenshots gate (live-page-error, 2026-10-12): the report must stand on real pictures. Every width
	 * widthsFor picks for this change needs a <width>.png somewhere under the task's shots/, or the
	 * review is refused as unlooked-at. (Slug dirs carry the worktree host, so only the width is matched.) */
	if (nameStatus.filter(x => x.status !== "D").some(x => pageUrlFor(x.f))) {
		const patches = splitPatch(git(MAIN, "diff", "--no-renames", `${BASE}...${branch}`).stdout);
		const pages = [...new Set(nameStatus.filter(x => x.status !== "D").map(x => pageUrlFor(x.f)).filter(Boolean))];
		const need = widthsFor(nameStatus.map(x => ({ ...x, patch: patches.get(x.f) || "" })), numstat, pages);
		const have = new Set();
		const walk = d => { try { for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : /^\d+\.png$/.test(e.name) && have.add(Number(e.name.slice(0, -4))); } catch {} };
		walk(path.join(best.td, "shots"));
		const missing = need.filter(w => !have.has(w));
		if (missing.length) return `refused: ${branch} changes a page but ${path.relative(best.root, best.td).replaceAll("\\", "/")}/shots/ has no screenshot at ${missing.join(", ")}px; re-run: ${cmd}  (--no-review "why" skips, and is logged)`;
	}
	return null;
}

async function takeLock() {
	const deadline = Date.now() + 120000;
	for (;;) {
		try {
			const fd = fs.openSync(lockFile, "wx");
			fs.writeSync(fd, JSON.stringify({ pid: process.pid, dir, at: Date.now() }));
			fs.closeSync(fd);
			return true;
		} catch (e) {
			if (e.code !== "EEXIST") throw e;
			let held; try { held = JSON.parse(fs.readFileSync(lockFile, "utf8")); } catch { held = null; }
			if (!held || Date.now() - held.at > 300000 || !alive(held.pid)) { try { fs.unlinkSync(lockFile); } catch {} continue; }
			if (Date.now() > deadline) return false;
			await new Promise(r => setTimeout(r, 500));
		}
	}
}

/* Every path the main tree has uncommitted: modified, staged, deleted, untracked (and both sides of a rename). */
function dirtyFiles() {
	const parts = git(MAIN, "status", "--porcelain", "-z", "--untracked-files=all").stdout.split("\0").filter(Boolean);
	const out = new Set();
	for (let i = 0; i < parts.length; i++) {
		out.add(parts[i].slice(3));
		if (/^[RC]/.test(parts[i])) out.add(parts[++i]);   // a rename's second entry is its old path
	}
	return out;
}

/* ---- the three-way merge, per file, in memory. Buffers throughout: bytes in, bytes out. ---- */
const blob = (rev, f) => { const r = spawnSync("git", ["cat-file", "blob", `${rev}:${f}`], { cwd: MAIN, windowsHide: true, maxBuffer: 256 << 20 }); return r.status === 0 ? r.stdout : null; };
// Exact case only: on Windows audit.mjs also answers to Audit.mjs, which made a case-only rename read as a conflict with itself.
const exactCase = p => { try { return fs.readdirSync(path.dirname(p)).includes(path.basename(p)); } catch { return false; } };
const readWork = f => { const p = path.join(MAIN, f); try { return exactCase(p) && fs.statSync(p).isFile() ? fs.readFileSync(p) : null; } catch { return null; } };
const same = (a, b) => (a === null || b === null) ? a === b : a.equals(b);
const binary = b => b !== null && b.includes(0);
// latin1 maps every byte to one char and back, so these only touch the line endings
const toLF = b => b === null ? null : Buffer.from(b.toString("latin1").replace(/\r\n/g, "\n"), "latin1");
const toCRLF = b => Buffer.from(b.toString("latin1").replace(/\r?\n/g, "\r\n"), "latin1");

/* One file's plan: { f, action: "write" | "delete" | "none" | "conflict", data?, why }. Touches nothing. */
function planFile(f, baseRev, branch, tmp) {
	const base = blob(baseRev, f), theirs = blob(branch, f), ours = readWork(f);
	if (binary(base) || binary(theirs) || binary(ours)) {
		if (same(ours, base)) return theirs === null ? { f, action: ours === null ? "none" : "delete", why: "binary; main tree unchanged from base: takes the branch's version" }
			: { f, action: "write", data: theirs, why: "binary; main tree unchanged from base: takes the branch's version" };
		if (same(ours, theirs)) return { f, action: "none", why: "binary; main tree already equals the branch" };
		return { f, action: "conflict", why: "binary file edited in the main tree and on the branch" };
	}
	// keep the working file's line endings: compare and merge in LF, write back CRLF if ours had it
	const crlf = ours !== null && ours.includes("\r\n");
	const [b, t, o] = crlf ? [toLF(base), toLF(theirs), toLF(ours)] : [base, theirs, ours];
	const out = data => crlf ? toCRLF(data) : data;
	if (same(o, b)) {
		if (t === null) return { f, action: ours === null ? "none" : "delete", why: "main tree unchanged from base; the branch deletes it" };
		return { f, action: "write", data: out(t), why: ours === null ? "new file from the branch" : "main tree unchanged from base: takes the branch's version" };
	}
	if (same(o, t)) return { f, action: "none", why: "main tree already equals the branch" };
	if (o === null) return { f, action: "conflict", why: "deleted in the main tree, changed on the branch" };
	if (t === null) return { f, action: "conflict", why: "edited in the main tree, deleted on the branch" };
	// base doesn't have this file at all (both sides added it independently): if every line of the
	// main tree's version shows up in the branch's version, in the same order, the branch is just
	// the main tree's file plus additions — nothing of ours is lost, so take theirs outright.
	if (b === null) {
		const oL = o.toString("latin1").split("\n"), tL = t.toString("latin1").split("\n");
		let i = 0; for (const l of tL) if (i < oL.length && l === oL[i]) i++;
		if (i === oL.length) return { f, action: "write", data: out(t), why: "both added; branch = main tree's file plus additions" };
	}
	const n = f.replace(/[^\w.-]/g, "_");
	const [po, pb, pt] = ["ours", "base", "theirs"].map(s => path.join(tmp, `${n}.${s}`));
	fs.writeFileSync(po, o); fs.writeFileSync(pb, b ?? Buffer.alloc(0)); fs.writeFileSync(pt, t);
	// .jsonl is an append-only log: both sides only ever ADD lines, so a "conflict" here is really
	// two different lines appended at the same spot — --union keeps both instead of refusing, since
	// on replay the latest line by its own content wins regardless of which copy comes first.
	if (f.endsWith(".jsonl")) {
		const mu = spawnSync("git", ["merge-file", "-p", "--union", po, pb, pt], { cwd: tmp, windowsHide: true, maxBuffer: 256 << 20 });
		if (mu.status < 0 || mu.status === null || mu.status > 127) return { f, action: "conflict", why: `git merge-file --union failed: ${mu.stderr}` };
		return { f, action: "write", data: out(mu.stdout), why: `jsonl: union merge keeps both sides' appended lines${crlf ? " (CRLF kept)" : ""}` };
	}
	const m = spawnSync("git", ["merge-file", "-p", "--diff3", `--marker-size=${MARK}`, po, pb, pt], { cwd: tmp, windowsHide: true, maxBuffer: 256 << 20 });
	if (m.status < 0 || m.status === null || m.status > 127) return { f, action: "conflict", why: `git merge-file failed: ${m.stderr}` };
	if (m.status === 0) return { f, action: "write", data: out(m.stdout), why: `both changed: merged cleanly${crlf ? " (CRLF kept)" : ""}` };
	// git calls edits on ADJACENT lines a conflict; settle those blocks line by line, refuse the rest
	const settled = settleAdjacent(m.stdout.toString("latin1"));
	if (settled.left) return { f, action: "conflict", why: `${settled.left} conflicting hunk(s): the main tree's edits and the branch change the same lines` };
	return { f, action: "write", data: out(Buffer.from(settled.text, "latin1")), why: `both changed: merged cleanly, ${m.status} adjacent-line block(s) settled line by line${crlf ? " (CRLF kept)" : ""}` };
}

/* ---- adjacent-line blocks. git merge-file refuses a block where one side edits line 2 and the other line 3.
 * Inside each block (--diff3 gives base, ours and theirs), diff each side against the base line by line; if the
 * two sides' edits touch different base lines, apply both; if any edit touches a line the other side touches
 * (or both insert at the same spot), the block stays a conflict and the whole landing is refused. ---- */
const MARK = 41;   // long markers, so a file that itself contains "<<<<<<<" cannot confuse the parser
const splitLines = s => s.match(/[^\n]*\n|[^\n]+$/g) ?? [];

/* The edits that turn a into b, as [{ s, e, add }]: replace a[s..e) with the lines in add. LCS, small blocks only. */
function edits(a, b) {
	const n = a.length, m = b.length;
	if (n * m > 4e6) return null;
	const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
	for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
	const out = []; let i = 0, j = 0, cur = null;
	const flush = () => { if (cur) out.push(cur); cur = null; };
	while (i < n || j < m) {
		if (i < n && j < m && a[i] === b[j]) { flush(); i++; j++; }
		else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) { cur ??= { s: i, e: i, add: [] }; cur.add.push(b[j++]); }
		else { cur ??= { s: i, e: i, add: [] }; cur.e = ++i; }
	}
	flush();
	return out;
}

/* Combine two edit lists on the same base, or null if any pair touches the same base line or insertion point. */
function combine(base, x, y) {
	for (const p of x) for (const q of y) {
		const pIns = p.s === p.e, qIns = q.s === q.e;
		if (pIns && qIns ? p.s === q.s : pIns ? (q.s < p.s && p.s < q.e) : qIns ? (p.s < q.s && q.s < p.e) : (p.s < q.e && q.s < p.e)) return null;
	}
	// at one start, an insertion goes before a replacement
	const all = [...x, ...y].sort((p, q) => p.s - q.s || (p.e - p.s) - (q.e - q.s));
	const out = []; let at = 0;
	for (const c of all) { out.push(...base.slice(at, c.s), ...c.add); at = c.e; }
	return out.concat(base.slice(at));
}

function settleAdjacent(text) {
	const L = splitLines(text), res = []; let left = 0;
	const is = (l, ch) => l.startsWith(ch.repeat(MARK)) && (l.length === MARK || /^[ \r\n]/.test(l.slice(MARK)));
	for (let k = 0; k < L.length; k++) {
		if (!is(L[k], "<")) { res.push(L[k]); continue; }
		const start = k, ours = [], base = [], theirs = []; let part = ours;
		for (k++; k < L.length && !is(L[k], ">"); k++) {
			if (is(L[k], "|")) part = base; else if (is(L[k], "=")) part = theirs; else part.push(L[k]);
		}
		const x = edits(base, ours), y = edits(base, theirs), merged = x && y && combine(base, x, y);
		if (merged) res.push(...merged); else { left++; res.push(...L.slice(start, k + 1)); }
	}
	return { text: res.join(""), left };
}

function planAll(files, branch) {
	const baseRev = git(MAIN, "merge-base", BASE, branch).stdout.trim() || BASE;
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "merge-"));
	try { return files.map(f => planFile(f, baseRev, branch, tmp)); }
	finally {   // guard: never delete through a link; a refusal is printed, not thrown, so it cannot hide planFile's own error
		try { refuse_links_into_main(tmp, "removing the merge temp dir"); fs.rmSync(tmp, { recursive: true, force: true }); }
		catch (e) { console.error(e.message); }
	}
}

/* Write every planned file; if one write throws, put back what was already written, then rethrow. */
function writeAll(plan) {
	const done = [];
	try {
		// deletes first: a case-only rename deletes audit.mjs and writes Audit.mjs, the same file on Windows
		for (const p of [...plan].sort((a, b) => (b.action === "delete") - (a.action === "delete"))) {
			if (p.action !== "write" && p.action !== "delete") continue;
			const full = path.join(MAIN, p.f);
			done.push([full, readWork(p.f)]);
			// an append-only log is read again right now: a line appended since planning is never dropped (jsonl-keep.mjs)
			const live = p.f.endsWith(".jsonl") ? readWork(p.f) : null;
			if (p.action === "delete" && live?.length && p.f.endsWith(".jsonl")) { console.warn(`  KEPT     ${p.f} — the branch deletes a live log; left in place`); continue; }
			if (p.action === "delete") fs.rmSync(full, { force: true });
			else {
				const { data, kept } = live ? keepLive(p.data, live) : { data: p.data, kept: 0 };
				if (kept) console.log(`  KEPT     ${p.f} — ${kept} line(s) appended since planning were kept`);
				fs.mkdirSync(path.dirname(full), { recursive: true }); fs.writeFileSync(full, data);
			}
		}
	} catch (e) {
		for (const [full, old] of done.reverse()) { try { old === null ? fs.rmSync(full, { force: true }) : fs.writeFileSync(full, old); } catch {} }
		throw e;
	}
}

/* git add / status on a long path list, 200 at a time (Windows caps a command line). */
const chunks = list => Array.from({ length: Math.ceil(list.length / 200) }, (_, i) => list.slice(i * 200, i * 200 + 200));
// -f: every path here is one the branch tracks, even under a gitignored folder (a task's shots/, committed with -f); without it the merge commit fails.
const stagePaths = list => chunks(list).every(c => { const a = git(MAIN, "add", "-A", "-f", "--", ...c); if (a.status) console.error(`git add failed: ${a.stderr.trim()}`); return !a.status; });
const untrackedAmong = list => chunks(list).flatMap(c => lines(git(MAIN, "status", "--porcelain", "--untracked-files=all", "--", ...c).stdout).filter(l => l.startsWith("??")).map(l => l.slice(3)));

const printPlan = plan => console.log(plan.map(p => `  ${p.action.toUpperCase().padEnd(8)} ${p.f} — ${p.why}`).join("\n"));

if (skipSmoke) console.warn("\n!!! --skip-smoke: NO SMOKE TEST WILL RUN. This flag is for proofs on a scratch repo only. !!!\n");
if (dryRun) console.log("DRY RUN: computing only; no lock, no hold, nothing written.");
if (!dryRun && !(await takeLock())) { console.error("gave up waiting for .merge.lock"); process.exit(3); }
let code = 0, held = false, quickShot = null, mergedHead = null;
const slugOf = u => u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "page";
const holdScript = path.join(MAIN, "Server", "hold.mjs");   // the main repo's own hold; a scratch repo has none
const hold = (state, why, files = []) => {
	if (!fs.existsSync(holdScript)) return false;
	run("node", [holdScript, state, why, ...(state === "on" && files.length ? ["--paths", files.join(",")] : [])], MAIN);
	return true;
};
try {
	const branch = git(dir, "rev-parse", "--abbrev-ref", "HEAD").stdout.trim();
	const head = git(dir, "rev-parse", "HEAD").stdout.trim();
	mergedHead = head;   // the branch's own head — what --quick's final JSON line calls "merged"
	// .jsonl streams are appended to by the running site itself, so they never count as your changes
	if (git(dir, "status", "--porcelain", "--untracked-files=no").stdout.split(/\r?\n/).some(l => l.trim() && !l.trim().endsWith(".jsonl"))) { console.error("refused: the worktree has uncommitted changes"); code = 1; }
	else if (git(MAIN, "rev-parse", "--abbrev-ref", "HEAD").stdout.trim() !== BASE) { console.error(`refused: the main repo is not on ${BASE}`); code = 1; }
	else {
		// --quick skips the reviewer agent entirely — its own gate below, checked once here, stands
		// in for reviewGate(). Everything after this is the SAME merge every other branch gets.
		let proceed = true, quickInfo = null;
		if (quick) {
			const { nameStatus, numstat } = diffStat(MAIN, `${BASE}...${branch}`);
			const elig = quickEligible(nameStatus, numstat);
			if (!elig.ok) { console.error(elig.why); code = 2; proceed = false; }
			else { console.log(`--quick: ${elig.size}, ${elig.totalLines} line(s), one module — skipping the reviewer agent`); quickInfo = { nameStatus, numstat }; }
		} else {
			const gateWhy = reviewGate(branch, head);
			if (gateWhy) { console.error(gateWhy); code = 1; proceed = false; }
		}
		if (proceed) {
		// Warning only, never a refusal: a changed page.js its parent does not name is invisible in the nav.
		try { const { nameStatus: ns } = diffStat(MAIN, `${BASE}...${branch}`); for (const w of OrphanCheck.warn(ns.filter(x => x.status !== "D").map(x => x.f), path.join(dir, "public", "framework"))) console.warn(w); } catch {}
		// --no-renames: a renamed file must list its old path too, or the old one would never be deleted
		const changed = lines(git(MAIN, "diff", "--name-only", "--no-renames", `${BASE}...${branch}`).stdout);
		const status = lines(git(MAIN, "diff", "--name-status", "--no-renames", `${BASE}...${branch}`).stdout)
			.map(l => { const [s, ...f] = l.split("\t"); return { status: s[0], f: f.join("\t") }; });
		const deleted = new Set(status.filter(s => s.status === "D").map(s => s.f));
		// every page.js/page.jsonl the branch touches that still exists on the branch, as its own url — de-duped against paths given by hand
		const autoPages = [...new Set(changed.filter(f => !deleted.has(f) && fs.existsSync(path.join(dir, f))).map(pageUrlFor).filter(Boolean))].filter(u => !paths.includes(u));
		if (autoPages.length) console.log(`merge.mjs found ${autoPages.length} changed page(s) from the diff: ${autoPages.join(", ")}`);
		shotsReminder(changed, autoPages, branch);
		/* Visibility gate (the owner, 2026-10-12): a branch that touches ext/Figma may not leave a page.js no parent declares. */
		if (changed.some(f => f.startsWith("public/framework/ext/Figma/")) && fs.existsSync(path.join(dir, "public/framework/ext/Figma/visibility.mjs"))) {
			const vis = run("node", [path.join(dir, "public/framework/ext/Figma/visibility.mjs")], dir);
			console.log(vis.stdout + vis.stderr);
			if (vis.status !== 0) { console.error("merge.mjs refused: ext/Figma has a page nothing links to (see HIDDEN above)."); process.exit(1); }
		}
		// a big scripted move changes hundreds of pages; Windows caps a command line at 32k characters (654 urls failed
		// silently, one-tree 2026-10-13), and smoke.mjs caps its own run anyway: pass an even spread of at most SMOKE_MAX
		const SMOKE_MAX = 40, step = Math.ceil(autoPages.length / SMOKE_MAX);
		const smokePages = autoPages.filter((_, i) => i % step === 0);
		if (smokePages.length < autoPages.length) console.log(`smoke checks an even spread of ${smokePages.length} of the ${autoPages.length} changed pages (command-line limit)`);
		const smoke = skipSmoke ? { status: 0, stdout: "", stderr: "" }
			: run("node", [path.join(path.dirname(fileURLToPath(import.meta.url)), "smoke.mjs"), dir, ...paths, ...smokePages, ...(mainArg ? ["--main", MAIN] : [])], MAIN);
		console.log(smoke.stdout + smoke.stderr);
		/* Tests (core/Test): every test that covers the diff runs on the branch; a failing one is run on the merge base too (Server/MergeTests.mjs). Only pass-on-base, fail-on-branch refuses. */
		let testRefusal = null, navRefusal = null;
		if (smoke.status === 0 && !skipTests && !dryRun) {
			try {
				const t = await MergeTests.gate({ dir, main: MAIN, base_ref: BASE, branch, changed: changed.filter(f => !deleted.has(f)) });
				for (const n of t.notes) console.warn(n);
				if (t.refused.length) testRefusal = `merge.mjs refused: ${t.refused.length} test(s) pass on the merge base and fail on ${branch}:\n` + t.refused.map(r => `  ${r.file}\n    ${(r.tail ?? "").split(/\r?\n/).slice(-6).join("\n    ")}`).join("\n");
			} catch (e) { console.warn(`tests: the gate itself failed (${e.message}); not blocking`); }
		}
		const dirty = dirtyFiles();
		const staged = lines(git(MAIN, "diff", "--cached", "--name-only").stdout);   // git merge refuses any staged change, so treat it like overlap
		/* The three-way landing, per file, into the working tree. */
		const threeWay = () => {
			const plan = planAll(changed, branch);
			printPlan(plan);
			const conflicts = plan.filter(p => p.action === "conflict");
			if (conflicts.length) {
				console.error(`refused: ${conflicts.length} file(s) conflict; nothing was touched:\n${conflicts.map(p => `  ${p.f} — ${p.why}`).join("\n")}`);
				code = 4;
			} else if (dryRun) {
				console.log("dry run: every file merges cleanly; nothing was written");
			} else {
				held = held || hold("on", "merge — three-way " + branch, changed);
				writeAll(plan);
				const ledger = path.join(MAIN, ".merge-landed.json");
				let landed; try { landed = JSON.parse(fs.readFileSync(ledger, "utf8")); } catch { landed = []; }
				landed.push({ branch, head, at: new Date().toISOString(), files: changed });
				fs.writeFileSync(ledger, JSON.stringify(landed, null, "\t"));
				/* Stage every landed path whatever happens next: a new file written to the tree but never `add`ed
				 * reached michael/dev untracked three times (2026-10-14; Server/doc/review.md). */
				let committed = false;
				if (!staged.length) {
					const gitDir = path.resolve(MAIN, git(MAIN, "rev-parse", "--git-dir").stdout.trim());
					const mergeHead = path.join(gitDir, "MERGE_HEAD");
					const mergeMsg = path.join(gitDir, "MERGE_MSG");
					try {
						if (stagePaths(changed)) {
							fs.writeFileSync(mergeHead, head + "\n");
							fs.writeFileSync(mergeMsg, `Merge branch '${branch}' into ${BASE}\n`);
							committed = git(MAIN, "commit", "--no-edit").status === 0;
						}
					} catch {}
					if (committed) console.log(`three-way merge committed: Merge branch '${branch}' into ${BASE}`);
					else {
						try { if (fs.existsSync(mergeHead)) fs.unlinkSync(mergeHead); } catch {}
						try { if (fs.existsSync(mergeMsg)) fs.unlinkSync(mergeMsg); } catch {}
					}
				}
				if (!committed) {   // someone else's staged work, or a failed commit: stage ONLY our paths and leave them for that commit
					stagePaths(changed);
					console.log(`left staged, uncommitted in main tree: ${changed.join(", ")}`);
				}
				// the check: nothing the diff touched may be untracked now (a modified live .jsonl is the site's own append, not a miss)
				const untracked = untrackedAmong(changed);
				if (untracked.length) { console.error(`merge FAILED: ${untracked.length} landed file(s) are untracked in the main tree: ${untracked.join(", ")}`); code = 5; }
			}
		};
		const overlap = changed.filter(f => dirty.has(f));
		// a NEW page (status "A") gets a 1920 screenshot, against the worktree's own server, before the merge touches anything
		if (smoke.status === 0 && !skipSmoke) {
			const newPages = [...new Set(status.filter(s => s.status === "A" && fs.existsSync(path.join(dir, s.f))).map(s => pageUrlFor(s.f)).filter(Boolean))];
			const wtBase = newPages.length ? worktreeBase(dir) : null;
			if (newPages.length && !wtBase) console.log(`${newPages.length} new page(s) but no worktree server found for ${dir} — skipping screenshots`);
			else if (newPages.length) {
				const shotDir = path.join(MAIN, ".merge-shots", `${branch.replace(/[^\w.-]/g, "_")}-${Date.now()}`);
				// layout-check.mjs prints each file's own path (it slugs the url itself); this just says where they landed
				console.log(`new page(s) — 1920 screenshot(s) into ${shotDir}:`);
				const lc = run("node", [path.join(MAIN, "Server", "layout-check.mjs"), ...newPages.map(u => wtBase + u), "--widths", "1920", "--out", shotDir], MAIN);
				console.log(lc.stdout + lc.stderr);
			}
			// the click test: every new page must be reachable from its parent page
			const navPages = NavCheck.pages_of(dir, status.filter(s => s.status === "A").map(s => s.f));
			if (navPages.length && wtBase) {
				const results = await NavCheck.check(wtBase, navPages.map(url => ({ url, parent: NavCheck.parent_page(dir, url) })));
				await Browser.close();
				navRefusal = NavCheck.refusal(results);
				if (navRefusal && noNav) { console.warn(`!!! --no-nav: ${noNav} — merging with unlinked new page(s) !!!\n${navRefusal}`); navRefusal = null; }
				else if (!navRefusal) console.log(`NavCheck: ${navPages.length} new page(s), all reachable by a click from their parent.`);
			} else if (navPages.length) console.log(`NavCheck: ${navPages.length} new page(s) but no worktree server — click test skipped`);
		}
		// --quick's own evidence: one screenshot, at whichever width(s) widthsFor picks for THIS
		// change (normally one), from the worktree's own server — before the merge touches
		// anything, same timing as the new-page screenshot above. Then a review.md line the way
		// `review.mjs --size none` writes one, so the dashboard and --status see a real record
		// even though no reviewer agent ran. The record is written whenever smoke really passed
		// (or --skip-smoke stood in for it, on a scratch-repo proof); only the ACTUAL screenshot
		// needs a real worktree server, so --skip-smoke skips just that part, not the record.
		if (quick && smoke.status === 0) {
			const aiDir = path.join(MAIN, "public/framework/ai");
			const taskDir = guessTaskDir(aiDir, branch) ?? path.join(aiDir, "quick-fix");
			const pages = [...new Set(status.filter(s => s.status !== "D" && fs.existsSync(path.join(dir, s.f))).map(s => pageUrlFor(s.f)).filter(Boolean))];
			const diffText = git(MAIN, "diff", "--no-renames", `${BASE}...${branch}`).stdout;
			const patches = splitPatch(diffText);
			const withPatch = quickInfo.nameStatus.map(x => ({ ...x, patch: patches.get(x.f) || "" }));
			const widths = widthsFor(withPatch, quickInfo.numstat, pages);
			// widthsFor normally answers with one width for a quick-eligible change, but on the
			// rare one that still matches a layout word (rule 2: all four), take evidence at every
			// width it named, not just the first — only the JSON line's own `width` field (the
			// fixer's hot-path summary) stays singular, per requirements.md point 2's own schema.
			const width = widths[0];
			const wtBase = !skipSmoke && pages.length ? worktreeBase(dir) : null;
			if (skipSmoke) console.log("--quick: --skip-smoke — no real server, so no screenshot (a scratch-repo proof only)");
			else if (!pages.length) console.log("--quick: no page in this change — nothing to screenshot");
			else if (!wtBase) console.log(`--quick: no worktree server found for ${dir} — skipping the screenshot`);
			else {
				const shotDir = path.join(taskDir, "shots", head);
				fs.mkdirSync(shotDir, { recursive: true });
				const url = wtBase + pages[0];
				const lc = run("node", [path.join(MAIN, "Server", "layout-check.mjs"), url, "--widths", widths.join(","), "--out", shotDir], MAIN);
				console.log(lc.stdout + lc.stderr);
				quickShot = { path: path.join(shotDir, slugOf(url), `${width}.png`), width, shots: widths.map(w => path.join(shotDir, slugOf(url), `${w}.png`)) };
			}
			await writeNoReviewPass(MAIN, taskDir, { size: "quick", branch, head, note: `size quick — ${widths.length === 1 ? `one shot at ${width}` : `shots at ${widths.join(", ")}`} — pass` });
		}
		if (smoke.status !== 0) { console.error("smoke test failed; nothing merged"); code = 1; }
		else if (testRefusal) { console.error(testRefusal); code = 1; }
		else if (navRefusal) { console.error("merge.mjs refused: " + navRefusal); code = 1; }
		else if (!changed.length) console.log(`nothing to land: ${branch} changes no file against ${BASE}`);
		else if (!overlap.length && !staged.length) {
			// prove the merge is clean BEFORE git merge touches anything
			const mt = git(MAIN, "merge-tree", "--write-tree", "--name-only", "--no-messages", BASE, branch);
			if (mt.status !== 0) {
				console.error(`refused: ${branch} conflicts with ${BASE}; nothing was touched. Conflicting files:\n` + lines(mt.stdout).slice(1).join("\n"));
				code = 4;
			} else if (dryRun) {
				console.log(`no overlap with the main tree's uncommitted edits: would land by three-way write (merge-tree says clean). Files:\n  ${changed.join("\n  ")}`);
			} else {
				held = hold("on", "merge — " + branch, changed);
				/* Never `git merge` here, even with no overlap (2026-10-13, ai/sessions/doc/commit-rule.md): git saves
				 * ANY dirty tree as a hidden WIP commit and resets it to HEAD; a live writer touching a file in that
				 * window made the restore fail and wiped other agents' appended lines. threeWay() writes only the
				 * branch's files, re-reads every live log at write time, and commits through the index. */
				threeWay();
			}
		} else {
			// the main tree has uncommitted edits to files this branch changes: never git merge
			console.log(`the main tree has uncommitted edits to ${overlap.length ? overlap.join(", ") : "staged files"}; three-way merging each file into the working tree instead`);
			threeWay();
		}
		}
	}
} finally {
	if (held) hold("off", "merge");
	if (!dryRun) try { fs.unlinkSync(lockFile); } catch {}
}
// --quick's own last word: ONE line of JSON, always last on stdout when it lands, so the fixer
// (or anything else driving this) can read it without parsing the human log above it.
if (quick && code === 0) {
	console.log(JSON.stringify({ merged: mergedHead, shot: quickShot?.path ?? null, width: quickShot?.width ?? null, ms: asked ? Date.now() - Date.parse(asked) : Date.now() - mergeStart, asked_at: asked ?? new Date(mergeStart).toISOString() }));
}
process.exit(code);
