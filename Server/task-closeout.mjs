// Done vs waiting for a day's tasks, computed from the real task.jsonl files (classes: public/live/TaskState.js).
// usage: node Server/task-closeout.mjs [YYYY-MM-DD] [--close]
// --close appends a landing line (via .claude/hooks/append.mjs) to every task that is "finished" (its own log says done and names a commit).
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import TaskState from "../public/live/TaskState.js";
import SessionRecord from "./SessionRecord.mjs";

const root = join(import.meta.dirname, "..");
const day = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? new Date().toISOString().slice(0, 10);
const [y, m, d] = day.split("-");
const base = join(root, "public/framework/ai/sessions", y, m, d);

function* walk(dir){
	for (const e of readdirSync(dir, { withFileTypes: true })){
		if (e.isDirectory()) yield* walk(join(dir, e.name));
		else if (SessionRecord.is_log_entry(dir, e.name)) yield join(dir, e.name);
	}
}

const index = JSON.parse(readFileSync(join(base, "index.json"), "utf8"));
const usd_of = id => index.snapshots.find(s => s.id === id)?.tree_usd;
// every task any of the day's sessions worked on, wherever it lives under sessions/ (matched by session id or agent name, as LiveToday does)
const today = index.snapshots.filter(s => s.first_at);
const ids = new Set(today.map(s => s.id)), agents = new Set(today.map(s => s.agent).filter(Boolean));
const mine = file => { const a = TaskState.parse(readFileSync(file, "utf8")).flatMap(l => [l.assign, l.agent].filter(Boolean)); return a.some(x => ids.has(x.session_id) || agents.has(x.agent ?? x.id)); };
const rows = [...walk(join(root, "public/framework/ai/sessions")) ].filter(f => f.startsWith(base) || mine(f)).map(file => {
	const lines = TaskState.parse(readFileSync(file, "utf8"));
	const a = lines.map(l => l.assign).filter(Boolean);
	const dir = relative(root, join(file, ".."));
	const brief = join(root, dir, "requirements.md");
	const heading = existsSync(brief) ? /^#\s+(.+)$/m.exec(readFileSync(brief, "utf8"))?.[1] : null;
	const sid = a.find(x => x.session_id)?.session_id;
	return { file, dir: dir.replaceAll("\\", "/"), agent: a.find(x => x.agent)?.agent, title: a.find(x => x.title)?.title ?? heading ?? dir.split(/[\\/]/).at(-1),
		sid, usd: usd_of(sid), ...TaskState.classify(lines) };
}).map(r => {   // a task whose session is still active is in flight, whatever its log says
	const live = index.snapshots.some(s => s.state === "active" && (s.id === r.sid || s.agent === r.agent));
	return live && r.state !== "done" ? { ...r, state: "waiting", on: "its own agent (still active)" } : r;
});

const by = new Map();   // session -> its tasks
for (const r of rows) for (const sn of today.filter(sn => sn.id === r.sid || (sn.agent && sn.agent === r.agent))) (by.get(sn) ?? by.set(sn, []).get(sn)).push(r);
if (process.argv.includes("--sessions")){
	for (const sn of today) console.log(`${(sn.agent ?? sn.id.slice(0, 8)).padEnd(32)} ${(by.get(sn) ?? []).map(r => r.state === "waiting" ? `waiting on ${r.on}` : r.state).join("; ") || "no task"}`);
}
const count = s => rows.filter(r => r.state === s).length;
console.log(`${day}: ${count("done")} done, ${count("finished")} finished-not-landed, ${count("waiting")} waiting`);
for (const r of rows) console.log(`${r.state.padEnd(8)} ${r.dir.split("/").slice(-2).join("/")}  ${TaskState.label(r)}`);

if (process.argv.includes("--close")){
	for (const r of rows.filter(r => r.state === "finished")){
		const cost = r.usd == null ? "cost unknown" : `$${r.usd.toFixed(2)}`;
		const line = { assign: { landed_at: "NOW", title: r.title, outcome: `**${r.title}** — closed out by mastermind-task-closeout: the task's own log says it finished and names its commit, but no landing line was written. Cost ${cost}${r.sid ? ` (session ${r.sid.slice(0, 8)})` : ""}. The log has the details.`, closed_by: "mastermind-task-closeout" } };
		const tmp = join(mkdtempSync(join(tmpdir(), "closeout-")), "lines.json");
		writeFileSync(tmp, JSON.stringify([line]));
		console.log("closing", r.dir, execFileSync("node", [join(root, ".claude/hooks/append.mjs"), r.file, tmp], { encoding: "utf8", windowsHide: true }).trim());
	}
}
