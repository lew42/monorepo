// TaskState — what is in flight, queued and landed today, computed from the real state (CLAUDE.md law 7).
// Reads Servex's agent registry (GET /agents) and each task.jsonl; appends one line to ai/tasks/state.jsonl
// only when the picture changed, so /framework/ai/tasks/ tails it live. Doc: public/framework/ai/tasks/doc/architecture.md
//   node Server/TaskState.mjs --print    one snapshot to stdout
//   node Server/TaskState.mjs --watch    append on change (re-checks every 5 s; the registry has no push to subscribe to). Servex runs one in TaskLoop; the newest watcher wins
import fs from "node:fs";
import SessionRecord from "./SessionRecord.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Task from "../public/framework/core/Task/Task.js";

const ROOT = process.env.TASKSTATE_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESS = path.join(ROOT, "public", "framework", "ai", "sessions");
const OUT = path.join(ROOT, "public", "framework", "ai", "tasks", "state.jsonl");
const slash = s => s.split(path.sep).join("/");

export default class TaskState {
	static REGISTRY = process.env.SERVEX_URL ?? "http://localhost:8090";
	static QUIET_MIN = 5;      // a working agent with no log line for this long is marked ⚠
	static BEAT = 60000;       // the longest the file goes without a line while the watcher runs
	static CLOSED = ["complete", "stopped"];   // a Task state in none of these groups nor CLOSED would vanish from the dashboard; Task.test.mjs checks
	static OPEN = { running: "in_flight", paused: "in_flight", idle: "queued", waiting: "waiting" };
	static KEEP = 200;         // state.jsonl is rewritten down to this many lines when it passes twice that

	constructor({ registry = null, now = Date.now(), sess = SESS } = {}){ Object.assign(this, { registry, now, sess }); }

	static async fetch_registry(){
		try { return await (await fetch(this.REGISTRY + "/agents", { signal: AbortSignal.timeout(3000) })).json(); } catch { return []; }
	}

	/** `ai/sessions/2026/10/14/x/y` dir → the page url of that task. */
	static below(dir){ return slash(String(dir)).split("/ai/sessions/").pop(); }
	static url(dir){ return "/framework/ai/sessions/" + this.below(dir) + "/"; }
	/** The routed id on /framework/ai/tasks/: the dir below `sessions/`, slashes as `~`. */
	static id(dir){ return this.below(dir).replaceAll("/", "~"); }
	static dir_of(id){ return path.join(SESS, ...id.split("~")); }

	static lines(dir){
		let text; try { text = fs.readFileSync((SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl")), "utf8"); } catch { return []; }
		return text.split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	}

	/** A task.jsonl folded: title, landing line, the time of its last line (or of the file). */
	static facts(dir){
		const f = { dir, title: null, landed_at: null, outcome: null, last: null };
		for (const e of this.lines(dir)){
			const a = e.assign ?? {};
			f.title = a.title ?? f.title;
			if (a.landed_at){ f.landed_at = a.landed_at; f.outcome = a.outcome ?? f.outcome; }
			const fin = e.finish ?? e.complete;   // a worker that ends with a finish/complete line has landed, even with no assign.landed_at (8 of 27 on 10-17 were invisible)
			if (fin?.at && !f.landed_at){ f.landed_at = fin.at; f.outcome = fin.msg ?? fin.summary ?? fin.merged ?? f.outcome; }
			const at = e.at ?? a.landed_at ?? a.requested_at ?? e.log?.at ?? e.decision?.at ?? e.action?.at ?? e.step?.at;
			if (at && !(Date.parse(at) < Date.parse(f.last))) f.last = at;
		}
		if (!f.last) try { f.last = new Date(fs.statSync((SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl"))).mtimeMs).toISOString(); } catch {}
		f.title ??= path.basename(dir).replaceAll("-", " ");
		return f;
	}

	static first_sentence(md){
		const s = String(md ?? "").replace(/^[#*\s>-]+/, "").replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").split(/\n/)[0];
		return (s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).trim().slice(0, 200);
	}

	static DAYS = 7;           // the landed window the page can filter: today, yesterday, this week
	static WEEK_CACHE = { at: 0, sess: null, rows: [] };   // the week walk is the expensive part; it is redone once a BEAT, not every tick

	/** Local calendar day of a stamp, as the owner's clock shows it. */
	static day(iso){ const d = new Date(iso), p2 = n => String(n).padStart(2, "0"); return isNaN(d) ? "" : `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; }

	/** Every task landed in the last DAYS days, newest first, each row with its local `day`. The whole sessions store is walked (a task
	 *  landed today often lives in a session folder from days ago: walking only today's folder showed 0 of 27 on 10-17), reading only
	 *  log files changed inside the window. */
	landed_window(days = TaskState.DAYS){
		const c = TaskState.WEEK_CACHE;
		if (this.now - c.at < TaskState.BEAT && c.sess === this.sess) return c.rows;
		const since = this.now - days * 864e5, out = [];
		const walk = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents){
				if (e.isDirectory()) walk(path.join(dir, e.name));
				else if (SessionRecord.is_log_entry(dir, e.name) && fs.statSync(path.join(dir, e.name)).mtimeMs >= since) out.push(dir);
			}
		};
		walk(this.sess);
		const rows = out.map(dir => TaskState.facts(dir)).filter(f => f.landed_at && Date.parse(f.landed_at) >= since)
			.sort((a, b) => Date.parse(b.landed_at) - Date.parse(a.landed_at))
			.map(f => ({ id: TaskState.id(f.dir), title: f.title, line: TaskState.first_sentence(f.outcome), landed_at: f.landed_at, day: TaskState.day(f.landed_at), url: TaskState.url(f.dir) }));
		Object.assign(c, { at: this.now, sess: this.sess, rows });
		return rows;
	}

	/** Today's slice of the window (what the Lanes view and the counts show). */
	landed_today(){ const today = TaskState.day(this.now); return this.landed_window().filter(r => r.day === today); }

	/** Tasks waiting on the owner (state from Task.replay), from today's and yesterday's folders. */
	waiting(){
		const out = [], walk = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents){
				if (e.isDirectory()) walk(path.join(dir, e.name));
				else if (SessionRecord.is_log_entry(dir, e.name)){
					const t = Task.replay(TaskState.lines(dir));
					if (t.state === "waiting" && t.data.waiting_on === "owner")
						out.push({ id: TaskState.id(dir), title: TaskState.facts(dir).title, waiting_on: "owner", since: t.data.waiting_since ?? null, url: TaskState.url(dir) });
				}
			}
		};
		const d = new Date(this.now), p2 = n => String(n).padStart(2, "0");
		for (const back of [0, 1]){
			const day = new Date(d.getTime() - back * 864e5);
			walk(path.join(this.sess, String(day.getFullYear()), p2(day.getMonth() + 1), p2(day.getDate())));
		}
		return out.sort((a, b) => Date.parse(a.since) - Date.parse(b.since));
	}

	row(a){
		const dir = a.task_dir && fs.existsSync(a.task_dir) ? a.task_dir : null;
		const f = dir ? TaskState.facts(dir) : null;
		const last = Math.max(Date.parse(a.last_at) || 0, Date.parse(f?.last) || 0);
		const quiet_min = last ? Math.max(0, Math.round((this.now - last) / 60000)) : null;
		return { id: dir ? TaskState.id(dir) : a.id, agent: a.id, title: f?.title ?? a.name, model: a.model, cost: a.cost ?? 0,
			quiet_min, url: dir ? TaskState.url(dir) : null };
	}

	snapshot(){
		const live = (this.registry ?? []).filter(a => a.task_dir || a.role !== "minion");
		const in_flight = live.filter(a => a.state === "working").map(a => ({ ...this.row(a), quiet: this.row(a).quiet_min >= TaskState.QUIET_MIN }))
			.sort((a, b) => (b.quiet - a.quiet) || (b.quiet_min - a.quiet_min));
		const queued = live.filter(a => a.state === "queued").map(a => this.row(a));
		const landed = this.landed_window(), waiting = this.waiting(), today = TaskState.day(this.now);
		return { at: new Date(this.now).toISOString(), today, in_flight, queued, waiting, landed, counts: { in_flight: in_flight.length, queued: queued.length, waiting: waiting.length, landed: landed.filter(r => r.day === today).length } };
	}

	/** The picture without its clock, to tell whether anything changed. */
	static sig(s){ return JSON.stringify([s.in_flight.map(r => [r.agent, r.quiet_min, r.title]), s.queued.map(r => r.agent), (s.waiting ?? []).map(r => [r.id, r.since]), s.landed.map(r => r.id)]); }

	static async now(){ return new TaskState({ registry: await this.fetch_registry() }).snapshot(); }

	static async write(out = OUT, prev = null){
		const s = await this.now();
		if (prev && this.sig(prev) === this.sig(s) && Date.parse(s.at) - Date.parse(prev.at) < this.BEAT) return prev;   // a quiet picture still beats once a minute: that is how the page knows the writer is alive
		fs.mkdirSync(path.dirname(out), { recursive: true });
		fs.appendFileSync(out, JSON.stringify(s) + "\n");
		const lines = fs.readFileSync(out, "utf8").split("\n").filter(Boolean);
		if (lines.length > this.KEEP * 2) fs.writeFileSync(out, lines.slice(-this.KEEP).join("\n") + "\n");
		return s;
	}

	/** One writer per state.jsonl: the newest watcher claims the lock and an older one stops at its next beat (a hand-started
	 *  watcher from 10-14 ran stale code for days). `handle.stop()` ends it; Servex's TaskLoop starts one as its child. */
	static watch(every = 5000, { out = OUT, lock = out + ".lock" } = {}){
		const me = `${process.pid}:${Date.now()}`, handle = { stopped: false, stop(){ this.stopped = true; } };
		fs.mkdirSync(path.dirname(lock), { recursive: true });
		fs.writeFileSync(lock, me);
		handle.done = (async () => {
			let prev = null;
			while (!handle.stopped){
				let owner = null; try { owner = fs.readFileSync(lock, "utf8"); } catch {}
				if (owner !== me){ console.error("TaskState: a newer watcher took over; stopping"); break; }
				try { prev = await this.write(out, prev); } catch (e) { console.error("TaskState:", e.message); }
				await new Promise(r => setTimeout(r, every));
			}
		})();
		return handle;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	if (process.argv.includes("--watch")) TaskState.watch();
	else if (process.argv.includes("--once")) console.log(JSON.stringify(await TaskState.write()).slice(0, 200));
	else { const s = await TaskState.now(); console.log(JSON.stringify(s, null, 1)); }
}
