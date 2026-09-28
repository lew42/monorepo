/* `node Server/merge.mjs <worktree dir> [paths...] [--main <dir>] [--skip-smoke] [--dry-run]` — the one serialized way to land a worktree.
 * It takes a lock (.merge.lock at the main repo root) so two merges never run at once, refuses
 * uncommitted work in the worktree, smoke-tests it (Server/smoke.mjs), then lands its branch on
 * michael/dev with the live-reload hold on. It NEVER runs `git merge` over uncommitted edits in the
 * main tree (2026-09-25: that reset 85 of the owner's files): it compares the branch's files with
 * the main tree's dirty files FIRST.
 *
 * `--no-review "why"` is also a flag, alongside the ones above — see below.
 *
 * REVIEW GATE (2026-09-28, fresh-eyes-review), before the smoke test: a light or full-size branch
 * (`Server/review.mjs`'s `sizeOf`) needs a review newer than its head with every `[fix]` finding
 * answered, or the merge refuses with the one command to fix that; `--no-review "why"` or `--main`
 * skip it, loudly.
 *
 * IT FINDS THE CHANGED PAGES ITSELF (2026-09-28, smoke-links): every `page.js`/`page.jsonl` the
 * branch touches, from `git diff --name-only BASE...branch`, is turned into that page's own site
 * url (`pageUrlFor()` below — a card folder under `public/framework/ai/YYYY/MM/DD/…` maps to
 * `/framework/ai2/YYYY/MM/DD/…`; anything else's url is just the directory holding the page.js)
 * and handed to `smoke.mjs` alongside any paths given by hand — which now also FOLLOWS every
 * link on each page it loads, one level deep. Why: 7 concept-tile links shipped 404ing because
 * nothing had ever clicked them — not the landing screenshot, not the old smoke test (which only
 * loaded the pages an agent remembered to list). Every NEW page.js in the diff (added, not
 * modified) then gets a 1920 screenshot via `layout-check.mjs`, in `.merge-shots/` at the repo
 * root, and the file paths print at the end.
 *   No overlap: `git merge-tree` proves the merge is clean, then `git merge --no-ff` commits it.
 *   Overlap:    a three-way merge per file (`git merge-file`: base = the merge base, ours = the main
 *               tree's working file, theirs = the branch), computed for EVERY file in memory first;
 *               one conflict and nothing is written. Working tree only (no index, no commit); the
 *               branch head is recorded in .merge-landed.json; the owner commits. (`git apply` was
 *               dropped 2026-09-25: it refused whenever an owner edit sat on a line next to a hunk.)
 * Nothing is ever reset, stashed, checked out, forced or rewritten. `--main` points at another repo
 * (for proofs on a scratch repo); `--skip-smoke` is for those proofs only; `--dry-run` computes and
 * prints every file's result and writes nothing (no lock, no hold).
 * Exit: 0 landed (or dry run clean), 1 refused or smoke failed, 3 lock wait timed out, 4 would conflict (nothing touched). */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sizeOf, status as reviewStatus, diffStat } from "./review.mjs";

const BASE = "michael/dev";
const argv = process.argv.slice(2);
const flag = name => { const i = argv.indexOf(name); if (i < 0) return undefined; const [, v] = argv.splice(i, 2); return v; };
const bool = name => argv.includes(name) && (argv.splice(argv.indexOf(name), 1), true);
const skipSmoke = bool("--skip-smoke");
const dryRun = bool("--dry-run");
const mainArg = flag("--main");
const noReview = flag("--no-review");
const [dirArg, ...paths] = argv;
if (!dirArg) { console.error("usage: node Server/merge.mjs <worktree dir> [paths...] [--main <dir>] [--skip-smoke] [--dry-run]"); process.exit(1); }
// (also --no-review "why": see the review-gate paragraph in the header above)
const dir = path.resolve(dirArg);
const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 });
const git = (cwd, ...a) => run("git", a, cwd);
// the main repo: the one this worktree belongs to, unless --main says otherwise
const MAIN = mainArg ? path.resolve(mainArg)
	: path.dirname(git(dir, "rev-parse", "--path-format=absolute", "--git-common-dir").stdout.trim());
const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const lockFile = path.join(MAIN, ".merge.lock");
const lines = s => s.split(/\r?\n/).filter(Boolean);

/* A changed page.js/page.jsonl's own site url, or null. The no-build site has no routing table
 * besides "the url IS the directory that holds the page.js" (same rule health.mjs's
 * nearest_page_url() walks live) — except an AI card folder, which core/Page's own AITask
 * renders under /framework/ai2/, never at its filesystem path. */
const CARD_RE = /^public\/framework\/ai\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)\/page\.(?:js|jsonl)$/;
function pageUrlFor(f){
	const card = CARD_RE.exec(f);
	if (card) return `/framework/ai2/${card[1]}/${card[2]}/${card[3]}/${card[4]}/`;
	if (!f.startsWith("public/") || !/\/page\.(?:js|jsonl)$/.test(f)) return null;
	return "/" + f.slice("public/".length).replace(/page\.(?:js|jsonl)$/, "");
}

// The worktree's own dev server — same lookup smoke.mjs makes, so a screenshot loads the branch's
// own pages, not the main tree's.
function worktreeBase(dir){
	const f = path.join(MAIN, ".worktrees.json");
	if (!fs.existsSync(f)) return null;
	const norm = p => path.resolve(p).replace(/\\/g, "/").toLowerCase();
	const entry = Object.values(JSON.parse(fs.readFileSync(f, "utf8"))).find(e => norm(e.path) === norm(dir));
	return entry ? `http://127.0.0.1:${entry.port}` : null;
}

/* The review gate. null = ok to merge (nothing needed, or --main/--no-review skipped it).
 * A string = the refusal to print. Scans the last 4 days of task dirs for the newest
 * `{"review":…}` line (not an `answer`) naming this branch, then requires its `head` to be
 * this branch's head, or an ancestor of it with every `[fix]` finding answered (`review.mjs`'s
 * own `status()`, so the phrase and the gate can never disagree). */
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
			else if (e.name === "task.jsonl") out.push(p);
		}
		return out;
	}
	let best = null;
	for (const day of fs.readdirSync(aiDir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && daysAgo(d) <= 3 && daysAgo(d) >= 0))
		for (const tj of taskLogs(path.join(aiDir, day))) {
			const td = path.dirname(tj);
			for (const l of lines(fs.readFileSync(tj, "utf8"))) {
				let e; try { e = JSON.parse(l); } catch { continue; }
				if (e.review?.verdict && !e.review.answer && e.review.branch === branch && (!best || e.review.at > best.e.review.at)) best = { td, e };
			}
		}
	// no review yet: guess the task dir from the branch name (worktree/<slug> -> the most recent
	// public/framework/ai/<date>/<slug> that actually exists) so the printed command is runnable as-is
	let guessedTd = null;
	const wtSlug = /^worktree\/(.+)$/.exec(branch)?.[1];
	if (!best && wtSlug)
		for (const day of fs.readdirSync(aiDir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && daysAgo(d) <= 3 && daysAgo(d) >= 0).sort().reverse()) {
			const p = path.join(aiDir, day, wtSlug);
			if (fs.existsSync(p)) { guessedTd = p; break; }
		}
	const cmd = `node Server/review.mjs ${best ? path.relative(MAIN, best.td).replaceAll("\\", "/") : guessedTd ? path.relative(MAIN, guessedTd).replaceAll("\\", "/") : "<taskdir or public/framework/ai/<date>/<slug>>"} ${dir}`;
	if (!best) return `refused: ${branch} is size ${sizeOf(nameStatus, numstat)} and has no review; run: ${cmd}`;
	const current = best.e.review.head === head || git(MAIN, "merge-base", "--is-ancestor", best.e.review.head, head).status === 0;
	if (!current || /unanswered/.test(reviewStatus(best.td))) return `refused: ${branch}'s review is stale or has an unanswered finding; run: ${cmd}`;
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
const readWork = f => { const p = path.join(MAIN, f); try { return fs.statSync(p).isFile() ? fs.readFileSync(p) : null; } catch { return null; } };
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
	finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

/* Write every planned file; if one write throws, put back what was already written, then rethrow. */
function writeAll(plan) {
	const done = [];
	try {
		for (const p of plan) {
			if (p.action !== "write" && p.action !== "delete") continue;
			const full = path.join(MAIN, p.f);
			done.push([full, readWork(p.f)]);
			if (p.action === "delete") fs.rmSync(full, { force: true });
			else { fs.mkdirSync(path.dirname(full), { recursive: true }); fs.writeFileSync(full, p.data); }
		}
	} catch (e) {
		for (const [full, old] of done.reverse()) { try { old === null ? fs.rmSync(full, { force: true }) : fs.writeFileSync(full, old); } catch {} }
		throw e;
	}
}

const printPlan = plan => console.log(plan.map(p => `  ${p.action.toUpperCase().padEnd(8)} ${p.f} — ${p.why}`).join("\n"));

if (skipSmoke) console.warn("\n!!! --skip-smoke: NO SMOKE TEST WILL RUN. This flag is for proofs on a scratch repo only. !!!\n");
if (dryRun) console.log("DRY RUN: computing only; no lock, no hold, nothing written.");
if (!dryRun && !(await takeLock())) { console.error("gave up waiting for .merge.lock"); process.exit(3); }
let code = 0, held = false;
const holdScript = path.join(MAIN, "Server", "hold.mjs");   // the main repo's own hold; a scratch repo has none
const hold = (state, why, files = []) => {
	if (!fs.existsSync(holdScript)) return false;
	run("node", [holdScript, state, why, ...(state === "on" && files.length ? ["--paths", files.join(",")] : [])], MAIN);
	return true;
};
try {
	const branch = git(dir, "rev-parse", "--abbrev-ref", "HEAD").stdout.trim();
	const head = git(dir, "rev-parse", "HEAD").stdout.trim();
	// .jsonl streams are appended to by the running site itself, so they never count as your changes
	if (git(dir, "status", "--porcelain", "--untracked-files=no").stdout.split(/\r?\n/).some(l => l.trim() && !l.trim().endsWith(".jsonl"))) { console.error("refused: the worktree has uncommitted changes"); code = 1; }
	else if (git(MAIN, "rev-parse", "--abbrev-ref", "HEAD").stdout.trim() !== BASE) { console.error(`refused: the main repo is not on ${BASE}`); code = 1; }
	else {
		const gateWhy = reviewGate(branch, head);
		if (gateWhy) { console.error(gateWhy); code = 1; }
		else {
		// --no-renames: a renamed file must list its old path too, or the old one would never be deleted
		const changed = lines(git(MAIN, "diff", "--name-only", "--no-renames", `${BASE}...${branch}`).stdout);
		const status = lines(git(MAIN, "diff", "--name-status", "--no-renames", `${BASE}...${branch}`).stdout)
			.map(l => { const [s, ...f] = l.split("\t"); return { status: s[0], f: f.join("\t") }; });
		// every page.js/page.jsonl the branch touches, as its own url — de-duped against paths given by hand
		const autoPages = [...new Set(changed.map(pageUrlFor).filter(Boolean))].filter(u => !paths.includes(u));
		if (autoPages.length) console.log(`merge.mjs found ${autoPages.length} changed page(s) from the diff: ${autoPages.join(", ")}`);
		const smoke = skipSmoke ? { status: 0, stdout: "", stderr: "" }
			: run("node", [path.join(path.dirname(fileURLToPath(import.meta.url)), "smoke.mjs"), dir, ...paths, ...autoPages], MAIN);
		console.log(smoke.stdout + smoke.stderr);
		const dirty = dirtyFiles();
		const overlap = changed.filter(f => dirty.has(f));
		const staged = lines(git(MAIN, "diff", "--cached", "--name-only").stdout);   // git merge refuses any staged change, so treat it like overlap
		// a NEW page (status "A") gets a 1920 screenshot, against the worktree's own server, before the merge touches anything
		if (smoke.status === 0 && !skipSmoke) {
			const newPages = [...new Set(status.filter(s => s.status === "A").map(s => pageUrlFor(s.f)).filter(Boolean))];
			const wtBase = newPages.length ? worktreeBase(dir) : null;
			if (newPages.length && !wtBase) console.log(`${newPages.length} new page(s) but no worktree server found for ${dir} — skipping screenshots`);
			else if (newPages.length) {
				const shotDir = path.join(MAIN, ".merge-shots", `${branch.replace(/[^\w.-]/g, "_")}-${Date.now()}`);
				// layout-check.mjs prints each file's own path (it slugs the url itself); this just says where they landed
				console.log(`new page(s) — 1920 screenshot(s) into ${shotDir}:`);
				const lc = run("node", [path.join(MAIN, "Server", "layout-check.mjs"), ...newPages.map(u => wtBase + u), "--widths", "1920", "--out", shotDir], MAIN);
				console.log(lc.stdout + lc.stderr);
			}
		}
		if (smoke.status !== 0) { console.error("smoke test failed; nothing merged"); code = 1; }
		else if (!changed.length) console.log(`nothing to land: ${branch} changes no file against ${BASE}`);
		else if (!overlap.length && !staged.length) {
			// prove the merge is clean BEFORE git merge touches anything
			const mt = git(MAIN, "merge-tree", "--write-tree", "--name-only", "--no-messages", BASE, branch);
			if (mt.status !== 0) {
				console.error(`refused: ${branch} conflicts with ${BASE}; nothing was touched. Conflicting files:\n` + lines(mt.stdout).slice(1).join("\n"));
				code = 4;
			} else if (dryRun) {
				console.log(`no overlap with the main tree's uncommitted edits: would run git merge --no-ff (merge-tree says clean). Files:\n  ${changed.join("\n  ")}`);
			} else {
				held = hold("on", "merge — " + branch, changed);
				const m = git(MAIN, "merge", "--no-ff", "--no-edit", branch);
				console.log(m.stdout + m.stderr);
				if (m.status !== 0) {
					// should be impossible after merge-tree; abort only a merge that actually started
					if (fs.existsSync(path.join(MAIN, ".git", "MERGE_HEAD"))) git(MAIN, "merge", "--abort");
					console.error("git merge failed after merge-tree said it was clean — look at the output above");
					code = 4;
				}
			}
		} else {
			// the main tree has uncommitted edits to files this branch changes: never git merge
			console.log(`the main tree has uncommitted edits to ${overlap.length ? overlap.join(", ") : "staged files"}; three-way merging each file into the working tree instead`);
			const plan = planAll(changed, branch);
			printPlan(plan);
			const conflicts = plan.filter(p => p.action === "conflict");
			if (conflicts.length) {
				console.error(`refused: ${conflicts.length} file(s) conflict; nothing was touched:\n${conflicts.map(p => `  ${p.f} — ${p.why}`).join("\n")}`);
				code = 4;
			} else if (dryRun) {
				console.log("dry run: every file merges cleanly; nothing was written");
			} else {
				held = hold("on", "merge — three-way " + branch, changed);
				writeAll(plan);
				const ledger = path.join(MAIN, ".merge-landed.json");
				let landed; try { landed = JSON.parse(fs.readFileSync(ledger, "utf8")); } catch { landed = []; }
				landed.push({ branch, head, at: new Date().toISOString(), files: changed });
				fs.writeFileSync(ledger, JSON.stringify(landed, null, "\t"));
				console.log(`applied over uncommitted edits, not committed: the owner commits\n${changed.join("\n")}`);
			}
		}
		}
	}
} finally {
	if (held) hold("off", "merge");
	if (!dryRun) try { fs.unlinkSync(lockFile); } catch {}
}
process.exit(code);
