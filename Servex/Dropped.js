import fs from "node:fs";
import path from "node:path";
import SessionRecord from "../Server/SessionRecord.mjs";
import Task from "../public/framework/core/Task/Task.js";

/* THE RED FLAG FOR DROPPED WORK (the owner, 2026-10-25, "100% completion"). Doc: core/Task/doc/completion.md.
 * Plain node over the task logs and the agent registry, no AI. Every `tick` it finds each OPEN task whose owner agent is not working and
 * nobody is about to pick up, writes ONE line into the task's parent log, and writes the whole list to queue/dropped.json for the queue page.
 *
 * A task is dropped when it is open (idle or running) and its owner is: missing from the registry (gone), stopped, dormant, or never assigned,
 * and its log has been quiet for `grace_min`. An `idle` task with a `priority` is QUEUED (the queue starts it), not dropped.
 * A DEFERRED task (`wait` with `deferred`/`decide_by`, Task.js) is dropped when it has no home (`on` empty or "owner") or is past `decide_by`.
 * Other waiting tasks are left to TaskLoop (owner waits and reminders); paused, stopped and complete ones are settled.
 * A SESSION log (no `assign`, at least Task.RATES.min filed tasks) is read too, for its rates (Task.rates): when more than 20% of the owner's asks are deferred
 * or stopped it is red-flagged: one `{log:{red:"rate"}}` line in its own log, and a row in `red` of the snapshot. */
export const WORKING = new Set(["starting", "started", "working", "idle", "queued"]);

export default class Dropped {

	constructor(...args){ Object.assign(this, ...args); this.initialize(); }

	initialize(){
		this.root ??= process.cwd();
		this.days ??= Number(process.env.SERVEX_DROPPED_DAYS) || 30;        // session day folders this recent are walked
		this.grace_min ??= Number(process.env.SERVEX_DROPPED_GRACE_MIN) || 60;   // a log quiet this long, with no working owner, is dropped
		this.clock ??= () => Date.now();
		this.write ??= (file, obj) => fs.promises.appendFile(file, JSON.stringify(obj) + "\n");
		this.out ??= path.join(this.root, "public", "framework", "ai", "queue", "dropped.json");
		this.cache = new Map();   // log file -> { key: "mtime:size", rec }
	}

	get sessions_dir(){ return path.join(this.root, "public", "framework", "ai", "sessions"); }
	url_of(dir){ return "/" + path.relative(path.join(this.root, "public"), dir).split(path.sep).join("/") + "/"; }
	dir_of(url){ return path.join(this.root, "public", String(url).replace(/^\/+/, "")); }

	/* Every session day folder from the last `days` days. */
	day_dirs(now){
		const out = [], cut = new Date(now - this.days * 864e5).toISOString().slice(0, 10), ls = d => { try { return fs.readdirSync(d); } catch { return []; } };
		for (const y of ls(this.sessions_dir).filter(n => /^\d{4}$/.test(n)))
			for (const m of ls(path.join(this.sessions_dir, y)).filter(n => /^\d\d$/.test(n)))
				for (const d of ls(path.join(this.sessions_dir, y, m)).filter(n => /^\d\d$/.test(n)))
					if (`${y}-${m}-${d}` >= cut) out.push(path.join(this.sessions_dir, y, m, d));
		return out;
	}

	/* A log parsed and replayed once per mtime: { lines, task, refs, assigned } or null when it holds no assign and too few filed tasks to rate (a voice call). */
	read(file){
		let st; try { st = fs.statSync(file); } catch { return null; }
		const key = `${st.mtimeMs}:${st.size}`, hit = this.cache.get(file);
		if (hit?.key === key) return hit.rec;
		const lines = [];
		try { for (const raw of fs.readFileSync(file, "utf8").split("\n")){ if (!raw.trim()) continue; try { lines.push(JSON.parse(raw)); } catch {} } } catch { return null; }
		let rec = null;
		const assigned = lines.some(l => l.assign);
		if (assigned || lines.filter(l => l.tasks?.add).length >= Task.RATES.min){
			let task; try { task = Task.replay(lines); } catch { task = null; }
			const refs = lines.flatMap(l => [l.tasks?.add?.path, typeof l.task === "string" ? l.task : null, l.task?.path].filter(p => typeof p === "string" && p.startsWith("/")));
			if (task) rec = { lines, task, refs, assigned, mtime: st.mtimeMs };
		}
		this.cache.set(file, { key, rec });
		return rec;
	}

	/* Walk the day folders (every nested folder with a log) and follow `path` references to module-homed tasks. Returns [{dir, file, rec, parent}]. */
	collect(now){
		const seen = new Map(), out = [], ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }); } catch { return []; } };
		const visit = (dir, parent, depth) => {
			dir = path.resolve(dir);
			if (seen.has(dir) || depth > 12) return;
			seen.set(dir, true);
			const file = SessionRecord.log_file(dir);
			let here = parent;
			if (file){
				const rec = this.read(file);
				if (rec){
					out.push({ dir, file, rec, parent });
					here = file;
					for (const ref of rec.refs){ const d = this.dir_of(ref); if (fs.existsSync(d)) visit(d, file, depth + 1); }
				} else here = parent;
			}
			for (const e of ls(dir)) if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") visit(path.join(dir, e.name), here, depth + 1);
		};
		for (const d of this.day_dirs(now)) visit(d, null, 0);
		return out;
	}

	/* The owning agent's registry row, or null. `agent` is an id on most tasks and a spawn config (an object) on a templated one. */
	owner_of(data, registry){
		const id = (typeof data.agent === "string" && data.agent) || registry.find(r => data.session_id && r.session_id === data.session_id)?.id
			|| registry.find(r => data.session && r.session_id === data.session)?.id || null;
		return { id, row: id ? registry.find(r => r.id === id) ?? null : null };
	}

	/* The verdict for one task: { code, why } when it is dropped, null when not. `queued` is counted by the caller. */
	judge(e, registry, now){
		const t = e.rec.task, d = t.data, state = t.state;
		if (state === "waiting"){
			if (!d.deferred) return null;
			const home = d.waiting_on;
			if (!home || home === "owner") return { code: "deferral-no-home", why: "deferred with no home (the module or task that will decide it)" };
			const by = Date.parse(d.decide_by);
			if (by && now > by) return { code: "deferral-overdue", why: `deferral to ${home} is past its decide-by time (${d.decide_by})` };
			return null;
		}
		if (state !== "idle" && state !== "running") return null;
		if (state === "idle" && d.priority !== undefined && d.priority !== null) return { queued: true };
		if (now - e.rec.mtime < this.grace_min * 60000) return null;
		const { id, row } = this.owner_of(d, registry);
		if (!id) return { code: "never-assigned", why: "no owner agent was ever assigned" };
		if (!row) return { code: "owner-gone", why: `owner ${id} is gone from the registry` };
		if (WORKING.has(row.state)) return null;
		if (row.state === "dormant") return { code: "owner-dormant", why: `owner ${id} is dormant and the task is untouched` };
		return { code: "owner-stopped", why: `owner ${id} is ${row.state}` };
	}

	scan(registry, now = this.clock()){
		const rows = [], red = [], unproven = [];
		let checked = 0, queued = 0;
		for (const e of this.collect(now)){
			for (const { task, problem } of e.rec.task.unproven()) unproven.push({ url: this.url_of(e.dir), id: task.id, title: task.get_one("title") ?? task.id, code: "no-proof", why: `completed owner ask with ${problem}` });
			const rates = e.rec.task.rates();
			if (rates.red) red.push({ url: this.url_of(e.dir), title: e.rec.task.data.title ?? path.basename(e.dir), rates, file: e.file });
			if (!e.rec.assigned) continue;
			const state = e.rec.task.state;
			if (state === "complete" || state === "stopped") continue;
			checked++;
			const v = this.judge(e, registry, now);
			if (!v) continue;
			if (v.queued){ queued++; continue; }
			const d = e.rec.task.data;
			rows.push({ url: this.url_of(e.dir), title: d.title ?? path.basename(e.dir), state, code: v.code, why: v.why, owner: this.owner_of(d, registry).id,
				quiet_min: Math.round((now - e.rec.mtime) / 60000), parent: e.parent, file: e.file });
		}
		return { rows, red, checked, queued, unproven };
	}

	/* Every completed owner ask that claims proof: [{url, id, title, expected, outcome, evidence, file}] (Server/DoneCheck.mjs compares each with the owner's words). */
	completed_asks(now = this.clock()){
		const out = [], walk = (list, e) => { for (const t of list ?? []){
			if (Task.is_child_session(t)) continue;
			if (t.state === "complete" && Task.is_owner_ask(t) && !Task.proof_problem(t))
				out.push({ url: this.url_of(e.dir), id: t.id, title: t.get_one("title") ?? t.id, expected: t.get_one("expected") ?? null, outcome: String(t.get_one("outcome")), evidence: [].concat(t.get_one("evidence")), file: e.file });
			walk(t._tasks, e);
		} };
		for (const e of this.collect(now)) walk(e.rec.task._tasks, e);
		return out;
	}

	/* Scan, write ONE line per newly dropped task into its parent's log (never twice for the same task and reason), and refresh queue/dropped.json. */
	async tick(registry, now = this.clock()){
		const { rows, red, checked, queued, unproven } = this.scan(registry, now);
		const by_parent = new Map();
		for (const r of rows) if (r.parent) (by_parent.get(r.parent) ?? by_parent.set(r.parent, []).get(r.parent)).push(r);
		let flagged = 0;
		for (const [parent, list] of by_parent){
			let text = ""; try { text = fs.readFileSync(parent, "utf8"); } catch {}
			for (const r of list){
				if (text.includes(`"dropped":${JSON.stringify(r.url)},"reason":${JSON.stringify(r.code)}`)) continue;
				await this.write(parent, { log: { at: this.stamp(now), msg: `dropped: ${String(r.title).slice(0, 120)}: ${r.why}`, dropped: r.url, reason: r.code } });
				flagged++;
			}
		}
		for (const r of red){
			let text = ""; try { text = fs.readFileSync(r.file, "utf8"); } catch {}
			if (text.includes('"red":"rate"')) continue;
			const o = r.rates.owner;
			await this.write(r.file, { log: { at: this.stamp(now), msg: `red flag: ${o.deferred + o.stopped} of ${o.total} owner asks are deferred or stopped (${Math.round(o.rate * 100)}%, over 20%)`, red: "rate", rate: o.rate } });
			flagged++;
		}
		const snapshot = { at: this.stamp(now), checked, queued, dropped: rows.length, unproven, red: red.map(({ file, ...r }) => r), rows: rows.map(({ file, parent, ...r }) => ({ ...r, parent: parent && this.url_of(path.dirname(parent)) })) };
		try { fs.mkdirSync(path.dirname(this.out), { recursive: true }); fs.writeFileSync(this.out, JSON.stringify(snapshot)); } catch {}
		return { ...snapshot, flagged };
	}

	stamp(ms){
		const d = new Date(ms), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
		return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
	}
}
