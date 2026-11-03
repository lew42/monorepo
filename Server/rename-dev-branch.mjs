// node Server/rename-dev-branch.mjs [--to compliance/dev] [--from michael/dev] [--main <repo>] [--manifest <file>] [--apply]
// Renames the PC's dev branch everywhere (git plan step 4, public/framework/doc/git.md). Default is a DRY RUN: it prints the
// manifest, every file that names the branch and what would happen to it, plus the git settings, and changes nothing.
//   rewrite  a live file (code, hook, role, readme, doc): the branch name is replaced in place
//   history  a record of what happened (session and task folders, runs, reviews, archives, dated docs, *.jsonl, patches): left alone
//   by hand  git.md (it tells the plan), CLAUDE.md (the owner's), this script and its test: never rewritten
// --apply then: takes .merge.lock, edits Server/dev-branch.mjs and the rewrite files, `git branch -m`, commits the rewritten paths
// that had no uncommitted edits (a dirty file is rewritten in the tree and left uncommitted for its owner), pushes the new branch,
// sets its upstream, and deletes origin's old branch only when everything on it is inside the new one. Never touches main or production.
// Run it only when no agent is mid-turn (`node Servex/sustain.mjs --restart --dry-run`), then restart Servex and the dev server.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export default class RenameDevBranch {
	static HISTORY_DIRS = ["public/framework/ai/sessions/"];
	static HISTORY_SEGMENTS = ["/tasks/", "/runs/", "/archive/", "/review/", "/seats/", "/research/2026/"];
	static HISTORY_NAMES = /(^|\/)(past-work|requirements|review|report|landing|claude-md-archive|past-work-index)\.md$|(^|\/)readme-before-[^/]*$|-20\d\d-\d\d-\d\d[^/]*\.md$|\.(jsonl|patch|diff)$/;
	static BY_HAND = ["public/framework/doc/git.md", "CLAUDE.md", "Server/rename-dev-branch.mjs", "Server/rename-dev-branch.test.mjs", "Server/dev-branch.mjs"];

	static git(cwd, input, ...a){ return spawnSync("git", a, { cwd, input, encoding: "utf8", windowsHide: true, maxBuffer: 256 << 20 }); }
	static lines(s){ return (s || "").split(/\r?\n/).filter(Boolean); }
	static pattern(from){ return new RegExp("(?<![\\w-])" + from.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&") + "(?![\\w-])", "g"); }

	static kind(file){
		const f = file.replaceAll("\\", "/");
		if (RenameDevBranch.BY_HAND.includes(f)) return "by hand";
		if (RenameDevBranch.HISTORY_DIRS.some(d => f.startsWith(d)) || RenameDevBranch.HISTORY_SEGMENTS.some(s => ("/" + f).includes(s)) || RenameDevBranch.HISTORY_NAMES.test(f)) return "history";
		return "rewrite";
	}

	/** The manifest: every tracked text file naming `from`, with its kind and count, and the git state. Reads only. */
	static plan(main, from, to){
		const g = (...a) => RenameDevBranch.git(main, null, ...a);
		const re = RenameDevBranch.pattern(from);
		const dirty = new Set(RenameDevBranch.lines(g("status", "--porcelain", "--untracked-files=no").stdout).map(l => l.slice(3).replace(/^.* -> /, "").replace(/^"|"$/g, "")));
		const files = [];
		for (const f of RenameDevBranch.lines(g("grep", "-lI", "-e", from, "--").stdout)) {
			let text; try { text = fs.readFileSync(path.join(main, f), "utf8"); } catch { continue; }
			const count = (text.match(re) || []).length;
			if (count) files.push({ file: f, kind: RenameDevBranch.kind(f), count, dirty: dirty.has(f) });
		}
		const current = g("rev-parse", "--abbrev-ref", "HEAD").stdout.trim();
		const exists = ref => !g("rev-parse", "--verify", "-q", ref).status;
		const lock = fs.existsSync(path.join(main, ".merge.lock"));
		const problems = [];
		if (current !== from) problems.push(`the main checkout is on "${current}", not "${from}"`);
		if (exists(`refs/heads/${to}`)) problems.push(`local branch ${to} already exists`);
		if (exists(`refs/remotes/origin/${to}`)) problems.push(`origin/${to} already exists`);
		if (lock) problems.push(".merge.lock is held: a merge is running");
		if (!exists("refs/remotes/origin/" + from)) problems.push(`origin/${from} does not exist here (fetch first), so the remote delete would be skipped`);
		const worktrees = RenameDevBranch.lines(g("worktree", "list", "--porcelain").stdout).filter(l => l === `branch refs/heads/${from}`).length;
		return {
			from, to, main, files, problems, worktrees_on_from: worktrees,
			git: ["git branch -m " + from + " " + to, "git push -u origin " + to, "git push origin --delete " + from + "   (only if origin/" + from + " is inside " + to + ")"],
			after: ["restart Servex: node Servex/sustain.mjs --restart", "restart the dev server (Servex restart_server)", "local clones elsewhere: git fetch origin; git branch -m " + from + " " + to + "; git branch -u origin/" + to + " " + to]
		};
	}

	static print(m, log = console.log){
		const by = k => m.files.filter(f => f.kind === k);
		log(`rename ${m.from} -> ${m.to} in ${m.main}`);
		for (const k of ["rewrite", "by hand", "history"]) {
			const list = by(k);
			log(`\n${k.toUpperCase()}: ${list.length} files, ${list.reduce((n, f) => n + f.count, 0)} mentions` + ({ rewrite: " (replaced in place)", "by hand": " (never rewritten by the script)", history: " (records: left alone)" })[k]);
			if (k !== "history") for (const f of list) log(`  ${f.file}  x${f.count}${f.dirty ? "  [uncommitted edits: rewritten but not committed]" : ""}`);
		}
		log("\nGIT:\n  " + m.git.join("\n  ") + "\nAFTER:\n  " + m.after.join("\n  "));
		log(m.problems.length ? "\nPROBLEMS (apply refuses):\n  " + m.problems.join("\n  ") : "\nno problems found");
	}

	/** Does it. Returns {ok, steps[]}; stops at the first failure and says where. */
	static apply(m, { log = console.log } = {}){
		const { main, from, to } = m, steps = [];
		const g = (...a) => RenameDevBranch.git(main, null, ...a);
		const step = (what, ok, note = "") => { steps.push({ what, ok, note }); log(`${ok ? "ok  " : "FAIL"} ${what}${note ? ": " + note : ""}`); return ok; };
		if (m.problems.some(p => !/origin\/.*does not exist/.test(p))) { step("preconditions", false, m.problems.join("; ")); return { ok: false, steps }; }
		const lockFile = path.join(main, ".merge.lock");
		try { fs.writeFileSync(lockFile, JSON.stringify({ pid: process.pid, dir: "rename-dev-branch", at: Date.now() }), { flag: "wx" }); } catch { step("take .merge.lock", false, "held by a merge"); return { ok: false, steps }; }
		try {
			const re = RenameDevBranch.pattern(from);
			const rewritten = [];
			for (const f of m.files.filter(x => x.kind === "rewrite")) {
				const file = path.join(main, f.file), text = fs.readFileSync(file, "utf8"), next = text.replace(re, to);
				if (next !== text) { fs.writeFileSync(file, next); rewritten.push(f); }
			}
			const devFile = path.join(main, "Server", "dev-branch.mjs");
			if (fs.existsSync(devFile)) {
				const t = fs.readFileSync(devFile, "utf8"), n = t.replace(`DEV_BRANCH = "${from}"`, `DEV_BRANCH = "${to}"`);
				if (n === t) { step("edit Server/dev-branch.mjs", false, "the DEV_BRANCH line was not found"); return { ok: false, steps }; }
				fs.writeFileSync(devFile, n); rewritten.push({ file: "Server/dev-branch.mjs", dirty: m.files.some(x => x.file === "Server/dev-branch.mjs" && x.dirty) });
			}
			step("rewrite files", true, `${rewritten.length} files`);
			const r = g("branch", "-m", from, to);
			if (!step(`git branch -m ${from} ${to}`, !r.status, r.stderr.trim())) return { ok: false, steps };
			const clean = rewritten.filter(f => !f.dirty).map(f => f.file);
			if (clean.length) {
				const a = RenameDevBranch.git(main, clean.join("\n") + "\n", "add", "--pathspec-from-file=-");
				const c = a.status ? a : RenameDevBranch.git(main, clean.join("\n") + "\n", "commit", "-q", "-m", `Rename the dev branch ${from} to ${to} (git plan step 4): ${clean.length} live files\n\nCo-Authored-By: Claude Code <noreply@anthropic.com>`, "--pathspec-from-file=-");
				step("commit the rewritten files", !c.status, c.status ? (c.stderr || c.stdout).trim() : `${clean.length} files; ${rewritten.length - clean.length} dirty ones left uncommitted`);
			}
			const p = g("push", "-u", "origin", to);
			if (!step(`git push -u origin ${to}`, !p.status, (p.stderr || "").trim().split("\n").pop())) return { ok: false, steps };
			const inside = !g("merge-base", "--is-ancestor", `origin/${from}`, to).status;
			if (g("rev-parse", "--verify", "-q", `refs/remotes/origin/${from}`).status) step(`delete origin/${from}`, true, "it was not there");
			else if (!inside) step(`delete origin/${from}`, false, `skipped: origin/${from} has commits that ${to} does not; look first`);
			else { const d = g("push", "origin", "--delete", from); step(`git push origin --delete ${from}`, !d.status, (d.stderr || "").trim().split("\n").pop()); }
			return { ok: steps.every(s => s.ok || /skipped/.test(s.note)), steps };
		} finally { try { fs.unlinkSync(lockFile); } catch {} }
	}
}

if (import.meta.url === `file:///${process.argv[1]?.replaceAll("\\", "/")}`) {
	const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
	const { DEV_BRANCH } = await import("./dev-branch.mjs");
	const main = path.resolve(arg("--main", path.resolve(import.meta.dirname, "..")));
	const m = RenameDevBranch.plan(main, arg("--from", DEV_BRANCH), arg("--to", "compliance/dev"));
	const mf = arg("--manifest");
	if (mf) fs.writeFileSync(mf, JSON.stringify({ ...m, at: new Date().toISOString(), applied: process.argv.includes("--apply") }, null, "\t") + "\n");
	RenameDevBranch.print(m);
	if (process.argv.includes("--apply")) {
		const r = RenameDevBranch.apply(m);
		if (mf) fs.writeFileSync(mf, JSON.stringify({ ...m, at: new Date().toISOString(), applied: true, result: r }, null, "\t") + "\n");
		process.exit(r.ok ? 0 : 1);
	} else console.log("\nDRY RUN: nothing changed. Add --apply to do it.");
}
