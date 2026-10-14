// Server/LandingCheck.mjs — is a branch's WORK on michael/dev? Checked by file content, never commit count
// (merge.mjs sometimes lands a branch by applying its diff). Doc: Servex/doc/landing.md
//   node Server/LandingCheck.mjs <branch|taskDir>...      print verdicts as JSON
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import SessionIndex from "./SessionIndex.mjs";

const REPO = path.resolve(import.meta.dirname, "..");

export default class LandingCheck {
	static BASE = "michael/dev";

	static git(...a){
		try { return execFileSync("git", a, { cwd: LandingCheck.REPO, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).trim(); }
		catch { return null; }
	}
	static REPO = REPO;

	/** A branch name, or a task dir (absolute, or relative to the repo) whose task.jsonl names its branch. */
	static branch_of(arg){
		const dir = path.resolve(LandingCheck.REPO, arg), file = path.join(dir, "task.jsonl");
		if (fs.existsSync(file)) return SessionIndex.reduce(path.basename(dir), fs.readFileSync(file, "utf8")).branch || null;
		return arg;
	}

	static ledger(){
		try { return JSON.parse(fs.readFileSync(path.join(LandingCheck.REPO, ".merge-landed.json"), "utf8")); } catch { return []; }
	}

	/** {landed, branch, ahead, changed, checked, missing:[files], via} — `changed` and `checked` must agree. */
	static verify(arg, { base = LandingCheck.BASE } = {}){
		const g = LandingCheck.git, branch = LandingCheck.branch_of(arg);
		if (!branch) return { landed: true, branch: null, changed: 0, checked: 0, missing: [], via: "no branch" };
		const head = g("rev-parse", "--verify", "--quiet", branch + "^{commit}");
		if (!head) return { landed: true, branch, changed: 0, checked: 0, missing: [], via: "branch gone" };
		const ahead = Number(g("rev-list", "--count", `${base}..${branch}`));
		const out = { landed: true, branch, ahead, changed: 0, checked: 0, missing: [], via: "content" };
		if (!ahead) return { ...out, via: "ancestor" };
		const entry = LandingCheck.ledger().find(e => e.branch === branch && e.head === head);
		if (entry) return { ...out, changed: entry.files?.length ?? 0, checked: entry.files?.length ?? 0, via: ".merge-landed.json" };
		const mb = g("merge-base", base, branch);
		const rows = (g("diff", "--name-status", "--no-renames", "-z", mb, branch) ?? "").split("\0").filter(Boolean);
		const files = [];
		for (let i = 0; i + 1 < rows.length; i += 2) files.push({ st: rows[i][0], f: rows[i + 1] });
		out.changed = files.length;
		const tip = new Map(), now = new Map();
		const ls = (ref, fs_) => { const m = new Map(); for (const l of (g("ls-tree", "-r", ref, "--", ...fs_) ?? "").split("\n")) { const x = /^\d+ blob (\w+)\t(.*)$/.exec(l); if (x) m.set(x[2], x[1]); } return m; };
		const live = files.filter(x => x.st !== "D").map(x => x.f), all = files.map(x => x.f);
		for (let i = 0; i < all.length; i += 200) { const c = all.slice(i, i + 200); for (const [k, v] of ls(base, c)) now.set(k, v); }
		for (let i = 0; i < live.length; i += 200) { const c = live.slice(i, i + 200); for (const [k, v] of ls(branch, c)) tip.set(k, v); }
		const differ = live.filter(f => tip.get(f) !== now.get(f));
		const seen = LandingCheck.history(differ, base);
		for (const { st, f } of files) {
			out.checked++;
			if (st === "D") { if (now.has(f)) out.missing.push(f); continue; }
			if (tip.get(f) === now.get(f) || seen.has(f + "\0" + tip.get(f))) continue;
			out.missing.push(f);
		}
		out.landed = out.missing.length === 0;
		return out;
	}

	/** Every (path, blob) michael/dev ever held for these paths: one `git log --raw` per 200 paths. */
	static history(paths, base){
		const set = new Set();
		for (let i = 0; i < paths.length; i += 200) {
			const out = LandingCheck.git("log", base, "--no-renames", "--no-abbrev", "--raw", "-z", "--format=", "--diff-filter=AMT", "--", ...paths.slice(i, i + 200)) ?? "";
			const t = out.split("\0").filter(Boolean);
			for (let k = 0; k + 1 < t.length; k += 2) { const m = /^\n?:\d+ \d+ \w+ (\w+) /.exec(t[k]); if (m) set.add(t[k + 1] + "\0" + m[1]); }
		}
		return set;
	}

	/** One line for a log: "landing line written but N files are not on michael/dev: a, b…". */
	static sentence(v){
		const list = v.missing.slice(0, 6).join(", ") + (v.missing.length > 6 ? ` …+${v.missing.length - 6}` : "");
		return `landing line written but ${v.missing.length} of ${v.changed} files on ${v.branch} are not on ${LandingCheck.BASE}: ${list}`;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
	for (const a of process.argv.slice(2)) console.log(JSON.stringify(LandingCheck.verify(a)));
}
