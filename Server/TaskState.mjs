// TaskState — the tasks dashboard's writer, now a caller of State (Server/State.mjs, doc Server/doc/state.md): one structure for every task
// in both stores, folded through Task.js's rules, with a self-check. Kept by name and flags because Servex's TaskLoop runs this file.
//   node Server/TaskState.mjs --print    one snapshot to stdout
//   node Server/TaskState.mjs --once     write state.json and one ai/tasks/state.jsonl line
//   node Server/TaskState.mjs --watch    append on change every 5 s; the newest watcher takes the lock and the older one stops
import path from "node:path";
import { fileURLToPath } from "node:url";
import State from "./State.mjs";

const ROOT = process.env.TASKSTATE_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESS = path.join(ROOT, "public", "framework", "ai", "sessions");
const slash = s => s.split(path.sep).join("/");

export default class TaskState {
	static REGISTRY = State.REGISTRY;
	static QUIET_MIN = State.QUIET_MIN;
	static BEAT = State.BEAT;
	static DAYS = State.DAYS;

	/** `sess` points at a scratch sessions store (a test); then no module homes are read. */
	constructor({ registry = null, now = Date.now(), sess = null } = {}){
		this.state = new State(sess ? { root: ROOT, sess, framework: sess, index: path.join(sess, "no-index.jsonl"), registry, now } : { root: ROOT, registry, now });
	}

	static fetch_registry(){ return State.fetch_registry(); }
	static below(dir){ return slash(String(dir)).split("/ai/sessions/").pop(); }
	static url(dir){ return "/framework/ai/sessions/" + this.below(dir) + "/"; }
	static id(dir){ return this.below(dir).replaceAll("/", "~"); }
	static dir_of(id){ return path.join(SESS, ...id.split("~")); }
	static first_sentence(md){ return State.first_sentence(md); }
	static day(iso){ return State.day(iso); }
	static sig(s){ return State.sig(s); }

	snapshot(){ return this.state.snapshot(); }
	landed_window(){ return this.snapshot().landed; }
	landed_today(){ const s = this.snapshot(); return s.landed.filter(r => r.day === s.today); }
	waiting(){ return this.snapshot().waiting; }

	static async now(){ return new TaskState({ registry: await this.fetch_registry() }).snapshot(); }
	static async write(){ return new State({ root: ROOT }).write(); }
	static watch(every = 5000){ return new State({ root: ROOT }).watch(every); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	if (process.argv.includes("--watch")) TaskState.watch();
	else if (process.argv.includes("--once")){ const s = await TaskState.write(); console.log(`landed today ${s.counts.landed}, check.ok ${s.check.ok}`); }
	else { const s = await TaskState.now(); console.log(JSON.stringify(State.stream_line(s), null, 1)); }
}
