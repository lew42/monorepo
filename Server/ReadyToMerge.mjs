/* `node Server/ReadyToMerge.mjs [--json] [--days 14]` — the branches an agent said are ready to merge.
 * Source of truth is the `ready:` log line in a task record (session.jsonl / task.jsonl), not the
 * branch list (305 unmerged branches are mostly salvage). Per branch the latest line wins; a branch
 * already in michael/dev, or no longer existing, is dropped. Doc: public/framework/ai/merge/readme.md
 * Row: {branch, sha, at, task_dir, task_url, title, what, review, worktree, stale}. `stale` = the
 * branch head moved past the sha the agent named. A stale row also carries `latest` = {sha, ok, why?}:
 * the review gate's answer for the branch's CURRENT head (merge.mjs --gate-only), so the card can offer
 * "Merge latest" when ok, or say what is missing when not. `agent` = who marked it ready. */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { status as reviewStatus } from "./review.mjs";

const READY = /^ready: (\S+) (?:at )?([0-9a-f]{7,40})\b[;,.:]?\s*(.*)$/s;

/* The one line parser, exported for the test. null when the message is not a ready line. */
export function parseReady(msg) {
	const m = READY.exec(String(msg ?? "").trim());
	if (!m) return null;
	let what = m[3].replace(/^\(worktree [^)]*\)\s*[;,.:]?\s*/, "").trim();
	return { branch: m[1], sha: m[2], what };
}

/* The review gate's answer for a worktree's current head, from merge.mjs itself (one copy of the gate):
 * {ok, why}. `why` is the gate's refusal text in plain words (plainGate). */
export function gateOf(repo, worktree) {
	const merge = path.join(repo, "Server/merge.mjs");
	// an older merge.mjs would read the unknown flag as a path and start a REAL merge: never run it without the flag
	try { if (!fs.readFileSync(merge, "utf8").includes('bool("--gate-only")')) return { ok: false, why: "Servex's merge.mjs is older than the --gate-only check; it will answer after the merge that adds it." }; }
	catch { return { ok: false, why: "no Server/merge.mjs to ask" }; }
	const r = spawnSync("node", [merge, worktree, "--gate-only"], { cwd: repo, encoding: "utf8", windowsHide: true, timeout: 20000 });
	const out = (r.stdout || "").trim().split(/\r?\n/).filter(l => l.startsWith("gate:")).pop();
	if (r.status === 0 && out === "gate: ok") return { ok: true };
	if (!out) return { ok: false, why: "the review gate did not answer: " + ((r.stderr || String(r.error || "")).trim().split(/\r?\n/).pop() || "no output") };
	return { ok: false, why: plainGate(out.slice(5).trim()) };
}

/* A gate refusal in plain words. */
export function plainGate(g) {
	g = g.replace(/^refused:\s*/, "");
	if (/has no review;/.test(g)) return "Nobody has reviewed this branch yet.";
	if (/review is stale/.test(g)) return "The newest review is of an older commit, so the new commits have not been reviewed.";
	const un = /\(reviewed: \d+ unanswered: ([^)]*)\)/.exec(g);
	if (un) return `A review finding is still unanswered (${un[1]}).`;
	if (/no report/.test(g)) return "The branch changes a page, but its review has no page report.";
	const shot = /has no screenshot at ([\d, ]+)px/.exec(g);
	if (shot) return `The branch changes a page, but the review has no screenshot at ${shot[1]}px.`;
	return g.replace(/\s*(Or re-review|run|re-run):.*$/s, "").trim();
}

const git = (cwd, ...a) => spawnSync("git", a, { cwd, encoding: "utf8", windowsHide: true });

/* The main checkout, even when called from a worktree: the parent of the shared .git dir. */
export function mainRoot(cwd) {
	const r = git(cwd, "rev-parse", "--path-format=absolute", "--git-common-dir");
	return r.status === 0 ? path.dirname(r.stdout.trim()) : cwd;
}

function* recordFiles(dir, since) {
	let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const e of ents) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) yield* recordFiles(p, since);
		else if ((e.name === "session.jsonl" || e.name === "task.jsonl")) { try { if (fs.statSync(p).mtimeMs >= since) yield p; } catch {} }
	}
}

/* Date folders YYYY/MM/DD newer than the window only, so a year of records is never walked. */
function dayDirs(sessions, since) {
	const out = [], cut = new Date(since - 864e5).toISOString().slice(0, 10);
	const kids = d => { try { return fs.readdirSync(d).filter(n => /^\d+$/.test(n)).sort(); } catch { return []; } };
	for (const y of kids(sessions)) for (const m of kids(path.join(sessions, y))) for (const d of kids(path.join(sessions, y, m))) {
		if (`${y}-${m}-${d}` >= cut) out.push(path.join(sessions, y, m, d));
	}
	return out;
}

/* opts: {root (where the records live; default the main checkout), repo (where git runs; default root),
 * base (default michael/dev), days (14), now} */
export function readyRows(opts = {}) {
	const repo = opts.repo || mainRoot(process.cwd());
	const root = opts.root || repo, base = opts.base || "michael/dev";
	const since = (opts.now ?? Date.now()) - (opts.days ?? 14) * 864e5;
	const sessions = path.join(root, "public/framework/ai/sessions");
	const latest = new Map();   // branch -> row (latest line wins)
	for (const day of dayDirs(sessions, since)) for (const file of recordFiles(day, since)) {
		let lines; try { lines = fs.readFileSync(file, "utf8").split(/\r?\n/); } catch { continue; }
		let title = null, agent = "";
		for (const l of lines) {
			if (!l) continue;
			let e; try { e = JSON.parse(l); } catch { continue; }
			if (title === null) title = e.assign?.title || e.session?.title || e.title || "";
			if (!agent) agent = e.assign?.agent || "";
			const msg = e.log?.msg; if (typeof msg !== "string" || !msg.startsWith("ready:")) continue;
			const r = parseReady(msg); if (!r) continue;
			const at = e.log.at || "", prev = latest.get(r.branch);
			if (prev && prev.at > at) continue;
			const dir = path.dirname(file);
			latest.set(r.branch, { ...r, at, agent, task_dir: dir, title: title || path.basename(dir), _file: file });
		}
	}
	const wts = new Map();
	let cur = null;
	for (const l of git(repo, "worktree", "list", "--porcelain").stdout.split(/\r?\n/)) {
		if (l.startsWith("worktree ")) cur = l.slice(9); else if (l.startsWith("branch refs/heads/") && cur) wts.set(l.slice(18), cur);
	}
	const rows = [];
	for (const row of latest.values()) {
		const head = git(repo, "rev-parse", "--verify", "--quiet", `refs/heads/${row.branch}`).stdout.trim();
		if (!head) continue;                                                       // branch gone
		if (git(repo, "merge-base", "--is-ancestor", head, base).status === 0) continue;   // already landed
		const { _file, ...r } = row;
		const stale = !head.startsWith(r.sha), worktree = wts.get(r.branch) || null;
		const latest = stale && worktree ? { sha: head.slice(0, 9), ...(opts.gate || gateOf)(repo, worktree) } : null;
		rows.push({ ...r, record: path.basename(_file), task_url: "/" + path.relative(path.join(root, "public"), r.task_dir).split(path.sep).join("/") + "/",
			review: reviewStatus(r.task_dir), worktree, stale, latest, head });
	}
	return rows.sort((a, b) => (b.at > a.at ? 1 : -1));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const argv = process.argv.slice(2), i = argv.indexOf("--days");
	const rows = readyRows({ days: i >= 0 ? Number(argv[i + 1]) : 14 });
	if (argv.includes("--json")) console.log(JSON.stringify(rows, null, 1));
	else if (!rows.length) console.log("Nothing waiting to merge.");
	else for (const r of rows) console.log(`${r.branch}  ${r.sha.slice(0, 9)}${r.stale ? " STALE" : ""}  ${r.review}  ${r.title}\n    ${r.what}\n    ${r.worktree || "(no worktree)"}  ${r.task_url}`);
}

// merge.mjs can take minutes: run it without blocking Servex, so other routes keep answering (and the one-at-a-time guard can fire).
function runAsync(cmd, args, cwd){
	return new Promise(done => {
		const p = spawn(cmd, args, { cwd, windowsHide: true });
		let stdout = "", stderr = "";
		p.stdout.on("data", d => stdout += d); p.stderr.on("data", d => stderr += d);
		const t = setTimeout(() => p.kill(), 9e5);
		p.on("close", status => { clearTimeout(t); done({ status, stdout, stderr }); });
		p.on("error", e => { clearTimeout(t); done({ status: -1, stdout, stderr: String(e.message) }); });
	});
}

/* The Merge button's whole job (Servex's POST /api/merge calls this). Re-reads the rows, refuses a
 * branch not on the list or with no worktree, and a moved (stale) branch unless the card sent its current head
 * (`opts.head`, the "Merge latest" button) and that head passes the review gate; otherwise runs ONLY `node Server/merge.mjs <worktree>`
 * and, on exit 0, logs the merge in the task record. `run` is injectable for the test. Answers {ok, out, why?}. */
export async function mergeBranch(branch, opts = {}) {
	// `opts.head`: the sha the owner saw on the card ("Merge latest"); a moved branch merges only if its current head is that one and passes the gate
	const repo = opts.repo || mainRoot(process.cwd());
	const row = (opts.rows || readyRows)({ ...opts, repo }).find(r => r.branch === branch);
	if (!row) return { ok: false, why: "that branch is not on the ready list" };
	if (row.stale) {
		const now = row.head.slice(0, 9);
		if (!opts.head) return { ok: false, why: `the branch moved past ${row.sha} since it was marked ready; the latest is ${now} (use Merge latest)` };
		if (!row.head.startsWith(opts.head)) return { ok: false, why: `the branch moved again: the card showed ${String(opts.head).slice(0, 9)} but the head is now ${now}; reload the page` };
		if (!row.latest?.ok) return { ok: false, why: `the newest commits (${now}) cannot merge yet: ${row.latest?.why || "no worktree to check them in"}` };
	}
	if (!row.worktree) return { ok: false, why: "no worktree holds that branch" };
	const r = await (opts.run || runAsync)("node", [path.join(repo, "Server/merge.mjs"), row.worktree], repo);
	const out = ((r.stdout || "") + (r.stderr || "")).trim().split(/\r?\n/).slice(-30).join("\n");
	if (r.status !== 0) return { ok: false, why: `merge.mjs refused (exit ${r.status})`, out };
	const msg = `merged: ${branch} ${row.stale ? row.head.slice(0, 9) : row.sha} by the owner (${row.stale ? "Merge latest" : "Merge"} button)`;
	if (opts.log) opts.log(row, msg);
	else {
		const lines = path.join(os.tmpdir(), `merge-log-${Date.now()}.json`);
		fs.writeFileSync(lines, JSON.stringify([{ log: { at: "NOW", msg } }]));
		const ap = spawnSync("node", [path.join(repo, ".claude/hooks/append.mjs"), path.join(row.task_dir, row.record), lines], { cwd: repo, windowsHide: true, encoding: "utf8" });
		fs.rmSync(lines, { force: true });
		if (ap.status !== 0) return { ok: true, out, warn: `merged, but the record line was not written: ${(ap.stderr || "").trim().slice(-200)}` };
	}
	return { ok: true, out };
}
