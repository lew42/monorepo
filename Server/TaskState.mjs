// TaskState — what is in flight, queued and landed today, computed from the real state (CLAUDE.md law 7).
// Reads Servex's agent registry (GET /agents) and each task.jsonl; appends one line to ai/tasks/state.jsonl
// only when the picture changed, so /framework/ai/tasks/ tails it live. Doc: public/framework/ai/tasks/doc/architecture.md
//   node Server/TaskState.mjs --print    one snapshot to stdout
//   node Server/TaskState.mjs --watch    append on change (re-checks every 5 s; the registry has no push to subscribe to)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.env.TASKSTATE_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESS = path.join(ROOT, "public", "framework", "ai", "sessions");
const OUT = path.join(ROOT, "public", "framework", "ai", "tasks", "state.jsonl");
const slash = s => s.split(path.sep).join("/");

export default class TaskState {
	static REGISTRY = process.env.SERVEX_URL ?? "http://localhost:8090";
	static QUIET_MIN = 5;      // a working agent with no log line for this long is marked ⚠
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
		let text; try { text = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8"); } catch { return []; }
		return text.split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	}

	/** A task.jsonl folded: title, landing line, the time of its last line (or of the file). */
	static facts(dir){
		const f = { dir, title: null, landed_at: null, outcome: null, last: null };
		for (const e of this.lines(dir)){
			const a = e.assign ?? {};
			f.title = a.title ?? f.title;
			if (a.landed_at){ f.landed_at = a.landed_at; f.outcome = a.outcome ?? f.outcome; }
			const at = e.at ?? a.landed_at ?? a.requested_at ?? e.log?.at ?? e.decision?.at ?? e.action?.at ?? e.step?.at;
			if (at && !(Date.parse(at) < Date.parse(f.last))) f.last = at;
		}
		if (!f.last) try { f.last = new Date(fs.statSync(path.join(dir, "task.jsonl")).mtimeMs).toISOString(); } catch {}
		f.title ??= path.basename(dir).replaceAll("-", " ");
		return f;
	}

	static first_sentence(md){
		const s = String(md ?? "").replace(/^[#*\s>-]+/, "").replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").split(/\n/)[0];
		return (s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).trim().slice(0, 200);
	}

	/** Every task.jsonl under the sessions store whose file changed since local midnight (any depth). */
	landed_today(){
		const mid = new Date(this.now); mid.setHours(0, 0, 0, 0);
		const out = [], walk = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents){
				if (e.isDirectory()) walk(path.join(dir, e.name));
				else if (e.name === "task.jsonl" && fs.statSync(path.join(dir, e.name)).mtimeMs >= mid.getTime()) out.push(dir);
			}
		};
		const d = new Date(this.now), p2 = n => String(n).padStart(2, "0");
		for (const back of [0, 1]){   // yesterday's folder too: a session started yesterday lands tasks today
			const day = new Date(d.getTime() - back * 864e5);
			walk(path.join(this.sess, String(day.getFullYear()), p2(day.getMonth() + 1), p2(day.getDate())));
		}
		return out.map(dir => TaskState.facts(dir)).filter(f => f.landed_at && Date.parse(f.landed_at) >= mid.getTime())
			.sort((a, b) => Date.parse(b.landed_at) - Date.parse(a.landed_at))
			.map(f => ({ id: TaskState.id(f.dir), title: f.title, line: TaskState.first_sentence(f.outcome), landed_at: f.landed_at, url: TaskState.url(f.dir) }));
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
		const landed = this.landed_today();
		return { at: new Date(this.now).toISOString(), in_flight, queued, landed, counts: { in_flight: in_flight.length, queued: queued.length, landed: landed.length } };
	}

	/** The picture without its clock, to tell whether anything changed. */
	static sig(s){ return JSON.stringify([s.in_flight.map(r => [r.agent, r.quiet_min, r.title]), s.queued.map(r => r.agent), s.landed.map(r => r.id)]); }

	static async now(){ return new TaskState({ registry: await this.fetch_registry() }).snapshot(); }

	static async write(out = OUT, prev = null){
		const s = await this.now();
		if (prev && this.sig(prev) === this.sig(s)) return prev;
		fs.mkdirSync(path.dirname(out), { recursive: true });
		fs.appendFileSync(out, JSON.stringify(s) + "\n");
		const lines = fs.readFileSync(out, "utf8").split("\n").filter(Boolean);
		if (lines.length > this.KEEP * 2) fs.writeFileSync(out, lines.slice(-this.KEEP).join("\n") + "\n");
		return s;
	}

	static async watch(every = 5000){
		let prev = null;
		for (;;){ try { prev = await this.write(OUT, prev); } catch (e) { console.error("TaskState:", e.message); } await new Promise(r => setTimeout(r, every)); }
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	if (process.argv.includes("--watch")) TaskState.watch();
	else if (process.argv.includes("--once")) console.log(JSON.stringify(await TaskState.write()).slice(0, 200));
	else { const s = await TaskState.now(); console.log(JSON.stringify(s, null, 1)); }
}
