/* `node Server/unmerged.mjs [--json] [--write] [--hours N] [--base michael/dev]` — every `worktree/*` branch with commits not on the base:
 * count, age, files, whether the patches are already on the base under other commits (git cherry), the task folder whose log
 * records the branch (its own `branch` field), and that task's state. Read-only. Used by core/Session/InFlight "Built, not merged". Doc: Server/doc/unmerged.md */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_BRANCH } from "./dev-branch.mjs";

const run = (cwd, ...a) => spawnSync("git", a, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 28 }).stdout ?? "";
const arun = (cwd, ...a) => new Promise(res => { let out = ""; const p = spawn("git", a, { cwd, windowsHide: true }); p.stdout.on("data", d => out += d); p.on("close", () => res(out)); });
const lines = s => s.split(/\r?\n/).map(x => x.trim()).filter(Boolean);

/** branch -> {dir, state} from task logs under `logs` (a task or session log whose own "branch" field names it; a log with a finish/complete line or landed_at is complete). */
function owners(cwd, logs){
	const out = run(cwd, "grep", "-I", "-o", "-E", '"branch": ?"worktree/[^"]+"', "--", `${logs}/**/*.jsonl`);
	const found = new Map();
	for (const l of lines(out)){
		const m = /^(.*):"branch": ?"(worktree\/[^"]+)"$/.exec(l); if (!m) continue;
		const file = m[1], branch = m[2];
		if (!found.has(branch)) found.set(branch, new Set());
		found.get(branch).add(file);
	}
	const state = new Map(), done = file => /^\{\s*"(finish|complete)"|"landed_at"\s*:/m.test(run(cwd, "show", `:${file}`) || "");
	const result = new Map();
	for (const [branch, files] of found){
		const list = [...files].sort((a, b) => (/task\.jsonl$/.test(b) - /task\.jsonl$/.test(a)) || b.length - a.length);
		const file = list[0];
		if (!state.has(file)) state.set(file, done(file) ? "complete" : "open");
		result.set(branch, { dir: path.posix.dirname(file), state: state.get(file) });
	}
	return result;
}

export async function unmerged({ cwd = process.cwd(), base = DEV_BRANCH, min_hours = 0, now = Date.now(), logs = "public/framework/ai/sessions" } = {}){
	const own = owners(cwd, logs), rows = [], todo = [];
	for (const branch of lines(run(cwd, "branch", "--list", "worktree/*", "--no-merged", base, "--format=%(refname:short)"))){
		const raw = lines(run(cwd, "log", `${base}..${branch}`, "--format=@%ct", "--name-only")), log = raw.filter(l => l[0] === "@").map(l => l.slice(1));
		if (!log.length) continue;
		const newest = Number(log[0]) * 1000, age_hours = (now - newest) / 3600e3;
		if (age_hours < min_hours) continue;
				const files = [...new Set(raw.filter(l => l[0] !== "@"))];
		const o = own.get(branch);
		const row = { branch, commits: log.length, newest: new Date(newest).toISOString(), age_hours: Math.round(age_hours * 10) / 10, files,
			on_base: false, task: o?.dir ?? null, state: o?.state ?? "unowned" };
		rows.push(row); todo.push(row);
	}
	// git cherry is slow on old branches (seconds each): run 8 at a time
	const queue = [...todo];
	await Promise.all(Array.from({ length: 8 }, async () => { for (let r; (r = queue.shift());) r.on_base = lines(await arun(cwd, "cherry", base, r.branch)).every(l => l.startsWith("-")); }));
	return rows.sort((a, b) => b.age_hours - a.age_hours);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])){
	const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
	const rows = await unmerged({ base: arg("--base") ?? DEV_BRANCH, min_hours: Number(arg("--hours") ?? 0) });
	if (process.argv.includes("--write")){   // the file the In-flight block reads (tracked so the fetch never 404s)
		const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public/framework/ai/unmerged.json");
		const fs = await import("node:fs"), text = JSON.stringify({ rows: rows.map(({ files, ...r }) => ({ ...r, files: files.length })) }) + "\n";
		if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) fs.writeFileSync(file, text);   // only when changed, so a tracked file stays clean
	}
	if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 1));
	else {
		console.log("age_h\tcommits\tfiles\ton_base\tstate\tbranch\ttask");
		for (const r of rows) console.log([r.age_hours, r.commits, r.files.length, r.on_base ? "yes" : "no", r.state, r.branch, r.task ?? "-"].join("\t"));
		console.log(`${rows.length} branches with commits not on the base`);
	}
}
