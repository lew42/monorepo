// restore.mjs — bring the unlanded task records (verdicts.jsonl, "has unique work") onto michael/dev, safely.
// Dry run by default: prints and writes restore-manifest.jsonl. `--apply <root>` also writes the files under <root> (a worktree).
// A file is restored only when the branch's copy is surely the newer one:
//   - michael/dev lacks it, the file did not exist at the merge base (so dev never deleted it), and its folder was not moved
//     (a moved task folder, per sessions/task-moves.jsonl, gets the file at its new path, under the same rules);
//   - or michael/dev has it unchanged since the merge base (only the branch moved on);
//   - or it is a .jsonl log and michael/dev's lines are a prefix of the branch's (the branch only appended).
// Skipped: the AI dashboard plan's screenshot rounds (shotsN, linked from nowhere), and a task.jsonl that never landed and is new to michael/dev
// (restoring it would add an old open task to the queue and the sessions views).
import fs from "fs"; import path from "path"; import { execFileSync } from "child_process";

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const REPO = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: HERE, windowsHide: true }).toString().trim();
const git = (...a) => { try { return execFileSync("git", a, { cwd: REPO, maxBuffer: 1 << 28, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }); } catch { return null; } };
const blob = (ref, p) => git("rev-parse", "--verify", "-q", `${ref}:${p}`)?.toString().trim() || null;
const moves = fs.readFileSync(path.join(REPO, "public/framework/ai/sessions/task-moves.jsonl"), "utf8").trim().split("\n").map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(m => m?.from && m?.to);
const moved = p => { for (const m of moves) if (p.startsWith(m.from + "/")) return m.to + p.slice(m.from.length); return p; };
const lines = b => b.toString("utf8").split("\n").filter(Boolean);

const apply = process.argv.indexOf("--apply") > -1 ? process.argv[process.argv.indexOf("--apply") + 1] : null;
const out = [];
for (const l of fs.readFileSync(path.join(HERE, "verdicts.jsonl"), "utf8").trim().split("\n")){
	const v = JSON.parse(l); if (v.verdict !== "has unique work") continue;
	const base = git("merge-base", "michael/dev", v.sha)?.toString().trim();
	for (const from of v.unique_files){
		const to = moved(from), row = { branch: v.branch, sha: v.sha.slice(0, 9), from, to };
		const mine = git("show", `${v.sha}:${from}`), dev = blob("michael/dev", to), at_base = base && blob(base, to);
		if (/\/shots\d+\//.test(from)) row.why = "skip: contact sheets and screenshots of earlier rounds, linked from nowhere (3.9 MB; the AI readme's shots3 images are already on michael/dev)";
		else if (!dev){
			if (at_base) row.why = "skip: michael/dev deleted it after the branch forked";
			else if (from.endsWith("task.jsonl") && !/landed_at/.test(mine)) row.why = "skip: a task that never landed and is new to michael/dev (it would show as an open task)";
			else row.restore = true, row.why = to === from ? "new to michael/dev" : "new to michael/dev, at its moved folder";
		}
		else if (dev === blob(v.sha, from)) row.why = "skip: already equal";
		else if (dev === at_base) row.restore = true, row.why = "michael/dev unchanged since the fork; the branch's copy is newer";
		else if (to.endsWith(".jsonl")){
			const d = lines(git("show", `michael/dev:${to}`)), b = lines(mine);
			if (d.length < b.length && d.every((x, i) => x === b[i])) row.restore = true, row.why = `the branch appended ${b.length - d.length} line(s)`;
			else row.why = "skip: both sides changed the log";
		}
		else row.why = "skip: both sides changed it";
		if (row.restore && apply){ const f = path.join(apply, to); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, mine); }
		out.push(row);
	}
}
fs.writeFileSync(path.join(HERE, "restore-manifest.jsonl"), out.map(r => JSON.stringify(r)).join("\n") + "\n");
for (const r of out) console.log(`${r.restore ? "RESTORE" : "skip   "} ${r.branch.padEnd(26)} ${r.to.replace("public/framework/ai/", "ai/")}  (${r.why})`);
console.log(`${out.filter(r => r.restore).length} restore, ${out.filter(r => !r.restore).length} skip, ${out.length} rows${apply ? `; written under ${apply}` : " (dry run)"}`);
