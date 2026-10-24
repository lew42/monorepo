/* `node Server/ReadyToMerge.mjs [--json] [--days 14]` — the branches an agent said are ready to merge.
 * Source of truth is the `ready:` log line in a task record (session.jsonl / task.jsonl), not the
 * branch list (305 unmerged branches are mostly salvage). Per branch the latest line wins; a branch
 * already in michael/dev, or no longer existing, is dropped. Doc: public/framework/ai/merge/readme.md
 * Row: {branch, sha, at, task_dir, task_url, title, what, review, worktree, stale}. `stale` = the
 * branch head moved past the sha the agent named; the Merge button refuses those. */
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
		let title = null;
		for (const l of lines) {
			if (!l) continue;
			let e; try { e = JSON.parse(l); } catch { continue; }
			if (title === null) title = e.assign?.title || e.session?.title || e.title || "";
			const msg = e.log?.msg; if (typeof msg !== "string" || !msg.startsWith("ready:")) continue;
			const r = parseReady(msg); if (!r) continue;
			const at = e.log.at || "", prev = latest.get(r.branch);
			if (prev && prev.at > at) continue;
			const dir = path.dirname(file);
			latest.set(r.branch, { ...r, at, task_dir: dir, title: title || path.basename(dir), _file: file });
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
		rows.push({ ...r, record: path.basename(_file), task_url: "/" + path.relative(path.join(root, "public"), r.task_dir).split(path.sep).join("/") + "/",
			review: reviewStatus(r.task_dir), worktree: wts.get(r.branch) || null, stale: !head.startsWith(r.sha), head });
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
 * branch not on the list, stale, or with no worktree; otherwise runs ONLY `node Server/merge.mjs <worktree>`
 * and, on exit 0, logs the merge in the task record. `run` is injectable for the test. Answers {ok, out, why?}. */
export async function mergeBranch(branch, opts = {}) {
	const repo = opts.repo || mainRoot(process.cwd());
	const row = (opts.rows || readyRows)({ ...opts, repo }).find(r => r.branch === branch);
	if (!row) return { ok: false, why: "that branch is not on the ready list" };
	if (row.stale) return { ok: false, why: `the branch moved past ${row.sha} since it was marked ready; ask the agent to re-mark it` };
	if (!row.worktree) return { ok: false, why: "no worktree holds that branch" };
	const r = await (opts.run || runAsync)("node", [path.join(repo, "Server/merge.mjs"), row.worktree], repo);
	const out = ((r.stdout || "") + (r.stderr || "")).trim().split(/\r?\n/).slice(-30).join("\n");
	if (r.status !== 0) return { ok: false, why: `merge.mjs refused (exit ${r.status})`, out };
	const msg = `merged: ${branch} ${row.sha} by the owner (Merge button)`;
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
