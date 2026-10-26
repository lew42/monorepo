// AIIndex: every task in both stores (the sessions store and every module's tasks/), folded through Task.js's one rule set,
// written to public/framework/ai/index.json with a self-check that fails loudly. Doc: Server/doc/ai-index.md
//   node Server/AIIndex.mjs            write index.json, append ai/index.jsonl when the picture changed
//   node Server/AIIndex.mjs --print    counts and the check
//   node Server/AIIndex.mjs --watch   keep writing on change (Servex/TaskLoop.js keeps this alive); the newest watcher takes the lock
//   node Server/AIIndex.mjs --time     a full build and a tick, both timed
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SessionRecord from "./SessionRecord.mjs";
import Day from "../public/framework/core/Session/Day.js";
import Task from "../public/framework/core/Task/Task.js";
import DashRow from "../public/framework/ai/rail/DashRow.js";
import AskFold from "../public/framework/ai/asks/AskFold.js";
import AIIndexStream from "./AIIndexStream.mjs";

const SELF = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slash = s => String(s).split(path.sep).join("/");
const p2 = n => String(n).padStart(2, "0");

export default class AIIndex {
	static REGISTRY = process.env.SERVEX_URL ?? "http://localhost:8090";
	static VERBS = ["start", "pause", "resume", "stop", "complete", "finish", "wait", "approve", "improve", "reject"];
	static BUCKETS = ["landed", "in_flight", "queued", "waiting", "idle", "stopped", "stale"];
	static DAYS = 7;            // the landed window the dashboard can filter
	static QUIET_MIN = 5;       // a working agent with no line for this long is marked ⚠
	static BEAT = 60000;        // a quiet picture is still appended once a minute, so the page knows the writer is alive
	static REWALK = 600000;     // a full walk of both stores every ten minutes, under the fs.watch ticks
	static KEEP = 200;          // index.jsonl is cut back to this many lines when it passes twice that

	static WAKE_MIN = 250;      // an fs.watch change wakes the loop after this many ms (a debounce), not at the next 5 s tick

	constructor({ root = process.env.STATE_ROOT ?? process.env.TASKSTATE_ROOT ?? SELF, sess, framework, index, out, stream, cards, asks, registry = null, now = null } = {}){
		this.root = path.resolve(root);
		this.public = path.join(this.root, "public");
		this.framework = framework ?? path.join(this.public, "framework");
		this.sess = sess ?? path.join(this.framework, "ai", "sessions");
		this.index = index ?? path.join(this.public, "tasks", "task.jsonl");
		this.out = out ?? path.join(this.framework, "ai", "index.json");
		this.stream = stream ?? path.join(this.framework, "ai", "index.jsonl");
		this.cards = cards ?? path.join(this.framework, "ai", "cards.jsonl");
		this.asks = asks ?? path.join(this.framework, "ai", "asks.jsonl");
		this.registry = registry; this.fixed_now = now;
		this.stores = new Map();    // cards.jsonl / asks.jsonl -> { size, mtime, out }
		this.cache = new Map();     // log file -> { size, mtime, row }
		this.rows = null;           // log file -> row, from the last walk plus the files fs.watch marked
		this.dirty = new Set(); this.walked = 0; this.last_check = null;
	}
	get now(){ return this.fixed_now ?? Date.now(); }

	// ---- small rules -----------------------------------------------------------------------------------------------
	/** The owner's local calendar day of a time (this machine's clock). */
	static day(t){ return Day.of(t); }   // the same rule TaskDirs.day uses
	static parse(text){ return String(text).split(/\r?\n/).filter(l => l.startsWith("{")).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
	static read_lines(file){ try { return this.parse(fs.readFileSync(file, "utf8")); } catch { return []; } }
	static first_sentence(md){
		const s = String(md ?? "").replace(/^[#*\s>-]+/, "").replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").split(/\n/)[0];
		return (s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).trim().slice(0, 200);
	}
	/** The landing line, one rule (Server/doc/ai-index.md): assign.outcome, else the finish/complete line's first non-empty of these keys, else the last log msg. The brief's heading is the row's last resort. */
	static NO_SUMMARY = "Completed; the log records no summary.";   // an empty complete line: said plainly, never blank
	static LANDING_KEYS = ["outcome", "msg", "text", "summary", "merged", "checked"];
	static landing_text(d, f, lines){
		const ok = v => typeof v === "string" && v.trim() ? v : null;
		const fin = this.LANDING_KEYS.map(k => ok(f[k])).find(Boolean);
		const logs = [...lines].reverse().map(l => ok(l.log?.msg)).find(Boolean);
		return ok(d.outcome) ?? fin ?? logs ?? null;
	}
	/** The route id on /framework/ai/tasks/: the folder below `sessions/` (or below `framework/` for a module home), `/` as `~`. */
	static id(rel){ const r = slash(rel); return (r.includes("/ai/sessions/") ? r.split("/ai/sessions/").pop() : r.replace(/^public\/framework\//, "")).replaceAll("/", "~"); }
	static url(rel){ return "/" + slash(rel).replace(/^public\//, "") + "/"; }

	/** Which store a log file belongs to, or null when it is not a task: a session-store log, or a module task below a `tasks/` folder. */
	kind(file){
		const dir = path.dirname(file), name = path.basename(file), rel = slash(path.relative(this.framework, dir));
		if (!SessionRecord.is_record(name) || rel.startsWith("..")) return null;
		if (!slash(path.relative(this.sess, dir)).startsWith("..")) return SessionRecord.is_log_entry(dir, name) ? "session" : null;
		return name === "task.jsonl" && /(^|\/)tasks\/[^/]/.test(rel) && path.basename(dir) !== "tasks" ? "module" : null;
	}

	// ---- discovery -------------------------------------------------------------------------------------------------
	/** Every task log in both stores. */
	walk(){
		const out = [], go = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents){
				if (e.name === "node_modules" || e.name === ".git") continue;
				const p = path.join(dir, e.name);
				if (e.isDirectory()) go(p);
				else if (this.kind(p)) out.push(p);
			}
		};
		go(this.framework);
		if (slash(path.relative(this.framework, this.sess)).startsWith("..")) go(this.sess);   // a test's sessions store outside the framework
		return out;
	}

	/** Every module home: a `tasks/` folder that holds a list file, as an app path (`/framework/core/Task/tasks/`). TaskHomes.sync calls this. */
	homes(){
		const out = new Set(), go = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents){
				if (!e.isDirectory() || e.name === "node_modules" || e.name === ".git") continue;
				const p = path.join(dir, e.name);
				if (p === this.sess) continue;
				if (e.name === "tasks" && fs.existsSync(path.join(p, "task.jsonl"))) out.add("/" + slash(path.relative(this.public, p)) + "/");
				go(p);
			}
		};
		go(this.framework);
		return [...out].sort();
	}

	// ---- the fold: one task's lines through Task.replay -----------------------------------------------------------
	/** Task.replay over the lines, a child's own file read from this root; console quiet (a refused verb warns once per message). */
	static replay(lines, pub = path.join(SELF, "public")){
		const keep = [Task.resolver, console.warn];
		Task.resolver = ref => { const ls = this.read_lines(path.join(pub, String(ref).replace(/^\//, ""), "task.jsonl")); return ls.length ? ls : null; };
		console.warn = () => {};
		try { return Task.replay(lines); } finally { [Task.resolver, console.warn] = keep; }
	}

	/** The state facts of a task from its lines alone: what SessionIndex.reduce and every other caller asks. */
	static fold(lines, pub){
		const t = this.replay(lines, pub), d = t.data, state = t.state;
		const fin = [...lines].reverse().find(l => (l.finish ?? l.complete) && typeof (l.finish ?? l.complete) === "object");
		const f = fin ? (fin.finish ?? fin.complete) : {};
		const times = lines.map(l => l.at ?? l.ts ?? l.assign?.landed_at ?? l.assign?.requested_at ?? l.log?.at ?? l.action?.at).filter(v => !isNaN(Date.parse(v)));
		const landed_at = state === "complete" ? (d.completed_at ?? null) : null;
		const agent = typeof d.agent === "string" ? d.agent : d.agent?.id ?? null;
		return { state, landed_at, started: d.started_at ?? d.requested_at ?? times[0] ?? null, last: times.length ? times.reduce((a, b) => Date.parse(b) > Date.parse(a) ? b : a) : null,
			title: d.title ?? null, agent, session: t.session ?? d.sessions?.[0]?.id ?? null, module: d.module ?? null,
			outcome: AIIndex.landing_text(d, f, lines), now: typeof d.now === "string" ? d.now : null,
			waiting_on: d.waiting_on ?? null, waiting_since: d.waiting_since ?? null, alias: lines.find(l => typeof l.home === "string")?.home ?? null,
			nested: this.nested(t) };
	}

	/** The open tasks written as lines inside a session.jsonl (a task with its own folder has its own row): a task filed in its session has no file of its own, so this is how the index and the module pages find it. */
	static nested(t, out = []){
		for (const k of t._tasks ?? []){
			if (!k.data.path && !["complete", "stopped"].includes(k.state))
				out.push({ id: k.id, title: k.data.title ?? k.id, state: k.state, module: k.data.module ?? null, waiting_on: k.data.waiting_on ?? null, waiting_since: k.data.waiting_since ?? null });
			this.nested(k, out);
		}
		return out;
	}

	/** The first heading of the task dir's requirements.md, or null. */
	static brief_heading(file){ try { return fs.readFileSync(path.join(path.dirname(file), "requirements.md"), "utf8").split(/\r?\n/).find(l => /^#+\s+\S/.test(l)) ?? null; } catch { return null; } }

	/** One row, cached by the file's size and mtime. */
	row(file){
		let st; try { st = fs.statSync(file); } catch { return null; }
		const hit = this.cache.get(file);
		if (hit && hit.size === st.size && hit.mtime === st.mtimeMs) return hit.row;
		const home = this.kind(file) === "module" ? "module" : "session";
		const rel = slash(path.relative(this.root, path.dirname(file))), f = AIIndex.fold(AIIndex.read_lines(file), this.public);
		let started = f.started; if (!started) started = new Date(st.mtimeMs).toISOString();
		const row = { id: AIIndex.id(rel), home, dir: rel, url: AIIndex.url(rel), title: f.title ?? path.basename(rel).replaceAll("-", " "), state: f.state, bucket: null,
			started, landed_at: f.landed_at, last: f.last ?? new Date(st.mtimeMs).toISOString(), day: AIIndex.day(f.landed_at ?? started),
			agent: f.agent, session: f.session, module: f.module ?? (home === "module" ? rel.replace(/^public\/framework\//, "").split("/tasks/")[0] : null),
			line: AIIndex.first_sentence(f.state === "complete" ? (f.outcome ?? AIIndex.brief_heading(file) ?? AIIndex.NO_SUMMARY) : f.now), waiting_on: f.waiting_on, waiting_since: f.waiting_since, alias: home === "session" ? f.alias : null,
			nested: home === "session" ? f.nested : [] };
		this.cache.set(file, { size: st.size, mtime: st.mtimeMs, row });
		return row;
	}

	// ---- the second count: no Task.js, a different discovery --------------------------------------------------------
	/** When the lines say the task landed, read plainly: the last state verb is complete/finish (its line's time), or no verb at all
	 *  and `landed_at` with an outcome. Null when it has not. */
	static landed_by_lines(lines){
		let t = null, last = null, at = null; const m = {};
		for (const l of lines){
			const a = l.assign && typeof l.assign === "object" ? l.assign : null;
			t = l.at ?? l.ts ?? a?.at ?? a?.landed_at ?? a?.requested_at ?? t;
			if (a) Object.assign(m, a);
			if (l.set && typeof l.set === "object") Object.assign(m, l.set);
			const v = AIIndex.VERBS.find(k => l[k] && typeof l[k] === "object") ?? (["approve", "improve", "reject"].includes(l.verdict?.is) ? l.verdict.is : null);
			if (v){ last = v; at = l.at ?? l.ts ?? a?.at ?? a?.landed_at ?? a?.requested_at ?? l[v]?.at ?? t; t = at; }
		}
		if (last) return last === "complete" || last === "finish" ? at : null;
		return m.landed_at && String(m.outcome ?? "").trim() ? m.landed_at : null;
	}

	/** id -> landed_at for every task that landed on `day`, found by a plain walk of the sessions store plus the /tasks/ index. */
	walk_landed(day){
		const all = this.walk_all = new Map(), take = (file, rel) => this.walk_take(file, rel);
		const go = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			const log = ents.some(e => SessionRecord.is_record(e.name)) ? SessionRecord.log_file(dir) : null;
			if (log && dir !== this.sess) take(log, slash(path.relative(this.root, dir)));
			for (const e of ents) if (e.isDirectory()) go(path.join(dir, e.name));
		};
		go(this.sess);
		const seen = new Set(), follow = (ref, task) => {
			const dir = path.join(this.public, ref.replace(/^\//, "")), file = path.join(dir, "task.jsonl");
			if (seen.has(file)) return; seen.add(file);
			if (task) take(file, slash(path.relative(this.root, dir)));
			for (const l of AIIndex.read_lines(file)) if (typeof l.task === "string") follow(l.task, true);
		};
		for (const l of AIIndex.read_lines(this.index)) if (typeof l.task === "string") follow(l.task, false);
		return this.walk_day(day);
	}

	/** One log read plainly, kept in walk_all: its id and when it landed (null if not, or if it moved to a module home). */
	walk_take(file, rel){
		const lines = AIIndex.read_lines(file);
		if (lines.some(l => typeof l.home === "string") && rel.includes("/ai/sessions/")) return this.walk_all.delete(file);
		this.walk_all.set(file, { id: AIIndex.id(rel), at: AIIndex.landed_by_lines(lines) });
	}
	walk_day(day){ const hit = new Map(); for (const { id, at } of this.walk_all.values()) if (at && AIIndex.day(at) === day) hit.set(id, at); return hit; }

	/** After a tick: only the files fs.watch marked are read again; a full walk_landed (start, every REWALK) re-finds every file. */
	walk_dirty(files, day){
		for (const f of files) if (SessionRecord.is_record(path.basename(f)) && this.kind(f)){
			const dir = path.dirname(f);
			if (this.walk_all.has(f) || SessionRecord.log_file(dir) === f) this.walk_take(f, slash(path.relative(this.root, dir)));
		}
		return this.walk_day(day);
	}

	// ---- cards and asks: two stores folded into the same row (ai/rail/DashRow.js), each counted a second way ----------
	/** A store file's folded result, re-read only when its size or mtime moved (a stat is not a read, so Windows' read events cannot loop). */
	store(file, fold){
		let st; try { st = fs.statSync(file); } catch { return fold(""); }
		const hit = this.stores.get(file);
		if (hit && hit.size === st.size && hit.mtime === st.mtimeMs) return hit.out;
		let text = ""; try { text = fs.readFileSync(file, "utf8"); } catch {}
		const out = fold(text);
		this.stores.set(file, { size: st.size, mtime: st.mtimeMs, out });
		return out;
	}
	static by_bucket(rows, buckets){ const n = Object.fromEntries(buckets.map(b => [b, 0])); for (const r of rows) if (r.bucket in n) n[r.bucket]++; return n; }
	/** The second count: no JSON, no fold, a text scan of the first `"id"` on each line. */
	static scan_ids(text, re){ const ids = new Set(); for (const l of String(text).split(/\r?\n/)){ const m = l.match(re); if (m) ids.add(m[1]); } return ids.size; }

	/** cards.jsonl: the latest line per id (the file is the Inbox's index), one row each. */
	fold_cards(){
		return this.store(this.cards, text => {
			const by = new Map(); for (const c of AIIndex.parse(text)) if (c.id) by.set(c.id, c);
			const rows = [...by.values()].map(c => DashRow.of_card(c, AIIndex.day));
			const counts = AIIndex.by_bucket(rows, DashRow.CARD_BUCKETS);
			return { rows, check: { rows: rows.length, sum: Object.values(counts).reduce((a, b) => a + b, 0), ids: AIIndex.scan_ids(text, /^\{"id":"((?:[^"\\]|\\.)*)"/), counts } };
		});
	}
	/** asks.jsonl through AskFold (latest line wins). An ask's id is its own `id` or a slug of its title, the scan applies the same rule to the text. */
	fold_asks(){
		return this.store(this.asks, text => {
			const rows = Object.values(AskFold.fold(AIIndex.parse(text))).map(a => DashRow.of_ask(a, AIIndex.day));
			const counts = AIIndex.by_bucket(rows, DashRow.ASK_BUCKETS);
			const seen = new Set();
			for (const l of text.split(/\r?\n/)){
				if (!l.startsWith('{"ask"') || !/"title":"/.test(l)) continue;
				const id = l.match(/"id":"((?:[^"\\]|\\.)*)"/)?.[1] ?? AskFold.id({ title: JSON.parse('"' + l.match(/"title":"((?:[^"\\]|\\.)*)"/)[1] + '"') });
				if (id) seen.add(id);
			}
			return { rows, check: { rows: rows.length, sum: Object.values(counts).reduce((a, b) => a + b, 0), ids: seen.size, counts } };
		});
	}

	// ---- the whole picture -------------------------------------------------------------------------------------------
	static async fetch_registry(){
		try { return await (await fetch(this.REGISTRY + "/agents", { signal: AbortSignal.timeout(3000) })).json(); } catch { return []; }
	}

	/** Re-read what changed: everything on a full walk (first time, or every REWALK), else only the files fs.watch marked. */
	refresh(full = !this.rows || this.now - this.walked > AIIndex.REWALK){
		if (full){ this.rows = new Map(); for (const f of this.walk()) this.rows.set(f, this.row(f)); this.walked = this.now; this.dirty.clear(); this.changed = []; return true; }
		this.changed = [...this.dirty];
		for (const f of this.dirty){
			const r = this.kind(f) && this.row(f), prev = this.rows.get(f);
			if (r){
				this.rows.set(f, r);
				const line = !r.alias && AIIndexStream.task_line(prev, r);   // a new or changed task: one line on today's day stream (the browser patches its row from it)
				if (line) try { AIIndexStream.append(this.sess, "task", line, new Date(this.now).toISOString()); } catch (e) { console.error("AIIndex: day stream -", e.message); }
			} else this.rows.delete(f);
		}
		this.dirty.clear();
		return false;
	}

	snapshot({ full } = {}){
		const t0 = performance.now(), walked = this.refresh(full), now = this.now, today = AIIndex.day(now);
		const reg = this.registry ?? [], held = new Map();
		for (const a of reg) if (a.task_dir) held.set(slash(path.relative(this.root, path.resolve(a.task_dir))), a);
		const all = [...this.rows.values()].filter(Boolean), tasks = [], aliases = [], open_nested = [];
		for (const r0 of all){
			if (r0.alias){ aliases.push(r0.id); continue; }
			const a = held.get(r0.dir), working = a?.state === "working", queued = a?.state === "queued";
			const bucket = { complete: "landed", stopped: "stopped", waiting: "waiting", running: working ? "in_flight" : "stale", paused: working ? "in_flight" : "stale", idle: queued ? "queued" : "idle" }[r0.state] ?? null;
			const { nested = [], ...r1 } = r0;
			tasks.push({ ...r1, bucket });
			for (const n of nested) open_nested.push({ ...n, id: r0.id + "~" + n.id, session: r0.session ?? r0.id, url: r0.url, home: "session" });
		}
		const counts = { tasks: Object.fromEntries(AIIndex.BUCKETS.map(b => [b, 0])), landed_by_day: {} };
		for (const r of tasks) if (r.bucket) counts.tasks[r.bucket]++;
		for (let i = 0; i < AIIndex.DAYS; i++) counts.landed_by_day[AIIndex.day(now - i * 864e5)] = 0;
		for (const r of tasks) if (r.bucket === "landed" && r.day in counts.landed_by_day) counts.landed_by_day[r.day]++;

		// the dashboard's own lists (ai/tasks/TasksPage.js): working and queued agents, tasks waiting on the owner, the landed window
		const by_dir = new Map(tasks.map(r => [r.dir, r]));
		const agent_row = a => {
			const r = a.task_dir ? by_dir.get(slash(path.relative(this.root, path.resolve(a.task_dir)))) : null;
			const last = Math.max(Date.parse(a.last_at) || 0, Date.parse(r?.last) || 0), quiet_min = last ? Math.max(0, Math.round((now - last) / 60000)) : null;
			return { id: r?.id ?? a.id, agent: a.id, title: r?.title ?? a.name, model: a.model, cost: a.cost ?? 0, quiet_min, url: r?.url ?? null, home: r?.home ?? null };
		};
		const live = reg.filter(a => a.task_dir || a.role !== "minion");
		const in_flight = live.filter(a => a.state === "working").map(a => { const r = agent_row(a); return { ...r, quiet: r.quiet_min >= AIIndex.QUIET_MIN }; })
			.sort((a, b) => (b.quiet - a.quiet) || (b.quiet_min - a.quiet_min));
		const queued = live.filter(a => a.state === "queued").map(agent_row);
		const waiting = [...tasks.filter(r => r.bucket === "waiting" && r.waiting_on === "owner")
			.map(r => ({ id: r.id, title: r.title, waiting_on: "owner", since: r.waiting_since, url: r.url, home: r.home })),
			...open_nested.filter(n => n.state === "waiting" && n.waiting_on === "owner").map(n => ({ id: n.id, title: n.title, waiting_on: "owner", since: n.waiting_since, url: n.url, home: "session" }))].sort((a, b) => Date.parse(a.since) - Date.parse(b.since));
		const since = AIIndex.day(now - (AIIndex.DAYS - 1) * 864e5);
		const landed = tasks.filter(r => r.bucket === "landed" && r.day >= since && r.day <= today).sort((a, b) => Date.parse(b.landed_at) - Date.parse(a.landed_at))
			.map(r => ({ id: r.id, title: r.title, line: r.line, landed_at: r.landed_at, day: r.day, url: r.url, home: r.home }));
		Object.assign(counts, { in_flight: in_flight.length, queued: queued.length, waiting: waiting.length, landed: counts.landed_by_day[today] ?? 0 });

		// the check: every row in one bucket, every file accounted for, today's landings counted a second way
		const sum = Object.values(counts.tasks).reduce((a, b) => a + b, 0);
		const mine = tasks.filter(r => r.bucket === "landed" && r.day === today).map(r => r.id).sort();
		if (walked || !this.last_check || this.last_check.day !== today || this.last_check.ids !== mine.join()){
			const found = walked || !this.walk_all || this.last_check?.day !== today ? this.walk_landed(today) : this.walk_dirty(this.changed ?? [], today);
			const walk = [...found.keys()].sort();
			this.last_check = { day: today, ids: mine.join(), walk, at: new Date(now).toISOString() };
		}
		const walk = this.last_check.walk, ws = new Set(walk), ms = new Set(mine);
		const unbucketed = tasks.filter(r => !r.bucket).map(r => r.id);
		const check = { ok: true, total: tasks.length, sum, files: all.length, aliases: aliases.length, unbucketed,
			landed_today: { state: mine.length, walk: walk.length, only_state: mine.filter(i => !ws.has(i)), only_walk: walk.filter(i => !ms.has(i)), at: this.last_check.at } };
		check.ok = check.total === check.sum && check.files === check.total + check.aliases && !unbucketed.length && !check.landed_today.only_state.length && !check.landed_today.only_walk.length;

		const sessions = new Map();
		for (const r of tasks) if (r.session){
			const s = sessions.get(r.session) ?? { id: r.session, title: null, tasks: 0, landed: 0, last_landed: null, last: null, day: null };
			s.tasks++;
			if (r.bucket === "landed"){ s.landed++; if (!s.last_landed || r.landed_at > s.last_landed) s.last_landed = r.landed_at; }
			if (!s.last || Date.parse(r.last) > Date.parse(s.last)){ s.last = r.last; s.title = r.title; s.day = AIIndex.day(r.last); }
			sessions.set(r.session, s);
		}

		// cards and asks: the same row the dashboard draws, each with its own two-way count (ai/doc/one-dashboard.md)
		const cards = this.fold_cards(), asks = this.fold_asks();
		const in_sessions = [...sessions.values()].reduce((a, s) => a + s.tasks, 0), with_session = all.filter(r => r.session && !r.alias).length;
		check.cards = { ...cards.check, ok: cards.check.rows === cards.check.sum && cards.check.rows === cards.check.ids };
		check.asks = { ...asks.check, ok: asks.check.rows === asks.check.sum && asks.check.rows === asks.check.ids };
		check.sessions = { in_sessions, with_session, ok: in_sessions === with_session };
		check.ok = check.ok && check.cards.ok && check.asks.ok && check.sessions.ok;
		const off = -new Date(now).getTimezoneOffset(), tz = (off < 0 ? "-" : "+") + p2(Math.floor(Math.abs(off) / 60)) + ":" + p2(Math.abs(off) % 60);
		return { at: new Date(now).toISOString(), today, tz, in_flight, queued, waiting, open_nested, landed, counts, check,
			tasks: tasks.map(({ alias, ...r }) => r), sessions: [...sessions.values()], cards: cards.rows, asks: asks.rows,
			agents: reg.map(a => ({ id: a.id, state: a.state, task_dir: a.task_dir ?? null, model: a.model ?? null, cost: a.cost ?? 0 })),
			timing: { ms: +(performance.now() - t0).toFixed(1), full: walked, files: all.length } };
	}

	/** The line the dashboard tails: its old keys, plus the bucket counts and the check (never the whole task list). */
	static stream_line(s){ const { tasks, sessions, agents, cards, asks, ...line } = s; return line; }
	/** The picture without its clock, to tell whether anything changed. Cards and asks: their bucket counts and newest change. */
	static sig(s){
		const newest = rows => (rows ?? []).reduce((a, r) => r.when && r.when > a ? r.when : a, "");
		return JSON.stringify([s.in_flight.map(r => [r.agent, r.quiet_min, r.title]), s.queued.map(r => r.agent), (s.waiting ?? []).map(r => [r.id, r.since]), s.landed.map(r => r.id), s.counts?.tasks, s.check?.ok, s.check?.landed_today?.walk,
			s.check?.cards?.counts, s.check?.asks?.counts, newest(s.cards), newest(s.asks)]);
	}

	/** Build, then write index.json (whole, atomically) and append one stream line, only when the picture changed or a BEAT passed. */
	async write(prev = null){
		this.registry = await AIIndex.fetch_registry();
		const s = this.snapshot();
		if (prev && AIIndex.sig(prev) === AIIndex.sig(s) && Date.parse(s.at) - Date.parse(prev.at) < AIIndex.BEAT) return prev;
		fs.mkdirSync(path.dirname(this.out), { recursive: true }); fs.mkdirSync(path.dirname(this.stream), { recursive: true });
		fs.writeFileSync(this.out + ".tmp", JSON.stringify(s)); fs.renameSync(this.out + ".tmp", this.out);
		fs.appendFileSync(this.stream, JSON.stringify(AIIndex.stream_line(s)) + "\n");
		const lines = fs.readFileSync(this.stream, "utf8").split("\n").filter(Boolean);
		if (lines.length > AIIndex.KEEP * 2) fs.writeFileSync(this.stream, lines.slice(-AIIndex.KEEP).join("\n") + "\n");
		return s;
	}

	/** fs.watch marks a changed log file; the next tick re-folds only that file. */
	watch_files(){
		try {
			this.watcher = fs.watch(this.framework, { recursive: true }, (_, name) => {
				if (!name) return;
				const file = path.join(this.framework, String(name));
				if (SessionRecord.is_record(path.basename(file))) this.dirty.add(file);
				else if (file !== this.cards && file !== this.asks) return;
				if (this.wake) this.wake(); else this.pending = true;   // the loop re-folds now, not at the next beat; mid-write it flags the next sleep short
			});
			this.watcher.unref?.();
		} catch (e) { console.error("AIIndex: watch failed, full walks only -", e.message); this.walked = 0; }
	}

	/** One writer per stream: the newest watcher claims the lock and an older one stops at its next beat. Servex's TaskLoop starts one. */
	watch(every = 5000){
		const lock = this.stream + ".lock", me = `${process.pid}:${Date.now()}`, handle = { stopped: false, stop(){ this.stopped = true; } };
		fs.mkdirSync(path.dirname(lock), { recursive: true }); fs.writeFileSync(lock, me);
		this.watch_files();
		handle.done = (async () => {
			let prev = null;
			while (!handle.stopped){
				let owner = null; try { owner = fs.readFileSync(lock, "utf8"); } catch {}
				if (owner !== me){ console.error("AIIndex: a newer watcher took over; stopping"); break; }
				this.pending = false;
				try { prev = await this.write(prev); } catch (e) { console.error("AIIndex:", e.message); }
				await new Promise(r => {   // a change that landed during the write (this.pending) is not lost: sleep only WAKE_MIN
					const done = () => { clearTimeout(timer); clearTimeout(this.wake_timer); this.wake = this.wake_timer = null; r(); }, timer = setTimeout(done, this.pending ? AIIndex.WAKE_MIN : every);
					this.wake = () => { this.wake_timer ??= setTimeout(done, AIIndex.WAKE_MIN); };
				});
			}
			this.watcher?.close();
		})();
		return handle;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const st = new AIIndex();
	if (process.argv.includes("--watch")) await st.watch(5000);
	else if (process.argv.includes("--time")){
		st.registry = await AIIndex.fetch_registry();
		let t = performance.now(); const a = st.snapshot({ full: true }), full_ms = performance.now() - t;
		st.watch_files(); await new Promise(r => setTimeout(r, 200));
		t = performance.now(); st.snapshot({ full: false }); const tick_ms = performance.now() - t;
		st.watcher?.close();
		console.log(`full build ${full_ms.toFixed(0)} ms (${a.check.files} files) · tick ${tick_ms.toFixed(1)} ms · check.ok ${a.check.ok}`);
	} else if (process.argv.includes("--print")){
		st.registry = await AIIndex.fetch_registry();
		const s = st.snapshot();
		console.log(JSON.stringify({ at: s.at, today: s.today, tz: s.tz, counts: s.counts, check: s.check, timing: s.timing }, null, 1));
	} else {
		const s = await st.write(), c = s.check, two = (k, x) => `check.${k}: ${x.rows} rows = ${x.sum} in buckets = ${x.ids} found by a text scan ${x.ok ? "ok" : "MISMATCH"}`;
		console.log(`index.json: ${c.total} tasks, landed today ${s.counts.landed}, check.ok ${c.ok}`);
		console.log(two("cards", c.cards)); console.log(two("asks", c.asks));
		console.log(`check.sessions: ${c.sessions.in_sessions} tasks in sessions = ${c.sessions.with_session} task rows with a session ${c.sessions.ok ? "ok" : "MISMATCH"}`);
	}
}
