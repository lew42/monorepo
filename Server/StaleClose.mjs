#!/usr/bin/env node
// Server/StaleClose.mjs — close the tasks nobody will resume: the state's `stale` bucket, quiet over 24 h, gets one `stop` line. Doc: Server/doc/stale-close.md
//   node Server/StaleClose.mjs --plan     list them (and count by age); appends the plan to ai/stale-closes.jsonl
//   node Server/StaleClose.mjs --apply    append {"stop":…} to each log through .claude/hooks/append.mjs; appends the closes to the manifest
//   node Server/StaleClose.mjs --undo     append {"start":…} to every log the manifest closed and nobody undid (the state machine refuses `resume` from stopped)
// Append-only both ways: no log line is rewritten, the manifest only grows. The registry must answer, or nothing is planned (an empty one makes every running task look abandoned).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import TaskDirs from "./TaskDirs.mjs";
import SessionRecord from "./SessionRecord.mjs";
import AIIndex from "./AIIndex.mjs";

const day = () => new Date().toLocaleDateString("sv");   // local YYYY-MM-DD
const ms = s => { const t = Date.parse(s); return Number.isNaN(t) ? 0 : t; };

export default class StaleClose {
	static HOURS = 24;                // a stale task must be silent this long before it is closed
	static BY = "StaleClose";
	static MANIFEST = path.join(TaskDirs.AI, "stale-closes.jsonl");
	static APPEND = path.join(TaskDirs.REPO, ".claude", "hooks", "append.mjs");
	static AGES = [["1-7 days", 1, 7], ["older", 7, Infinity]];

	constructor({ now = Date.now(), hours = StaleClose.HOURS, state = null } = {}){ this.now = now; this.hours = hours; this.state = state; this.plan = []; this.skipped = {}; }

	/** The one state, fresh (ai/index.json is up to a minute old and does not know a close just made). */
	async load(){
		if (this.state) return this;
		const st = new AIIndex({ root: TaskDirs.REPO }); st.registry = await AIIndex.fetch_registry();
		this.registry_ok = st.registry.length > 0;
		this.state = st.snapshot({ full: true });
		return this;
	}

	/** Every stale task silent for `hours`, as manifest rows. */
	async plan_rows(){
		await this.load();
		const s = this.state, by_id = new Map(s.agents.map(a => [a.id, a])), skipped = this.skipped = { waiting: 0, fresh: 0, agent_alive: 0, not_stale: 0 };
		this.plan = [];
		if (!s.agents.length) throw new Error("StaleClose: Servex's registry is empty or down, so no task can be called abandoned. Nothing planned.");
		for (const t of s.tasks){
			if (t.bucket === "waiting") { skipped.waiting++; continue; }
			if (t.bucket !== "stale") continue;
			const age_h = (this.now - ms(t.last)) / 36e5;
			if (age_h < this.hours) { skipped.fresh++; continue; }
			const a = by_id.get(t.agent);
			if (a && (a.state === "working" || a.state === "queued")) { skipped.agent_alive++; continue; }   // its log names a live agent that holds another dir
			this.plan.push({ dir: t.dir, last: t.last, age_days: +(age_h / 24).toFixed(1), agent: t.agent ?? null, agent_state: a?.state ?? (t.agent ? "unknown" : null), reason: `stale: ${t.state}, no agent holds it, last line ${t.last}` });
		}
		return this.plan;
	}

	/** Counts by age band, from the plan. */
	by_age(){ return Object.fromEntries(StaleClose.AGES.map(([k, lo, hi]) => [k, this.plan.filter(r => r.age_days >= lo && r.age_days < hi).length])); }
	summary(){ return { stale_before: this.state.counts.tasks.stale, planned: this.plan.length, by_age: this.by_age(), skipped: this.skipped }; }

	static log_of(dir){ const abs = path.join(TaskDirs.REPO, dir); return SessionRecord.log_file(abs) ?? path.join(abs, "task.jsonl"); }

	/** Append one object to a manifest or log through the one validated writer (.claude/hooks/append.mjs). */
	static append(target, obj){
		const tmp = path.join(os.tmpdir(), `stale-close-${process.pid}-${Math.random().toString(36).slice(2)}.json`);
		fs.writeFileSync(tmp, JSON.stringify([obj]));
		try { execFileSync(process.execPath, [StaleClose.APPEND, target, tmp], { cwd: TaskDirs.REPO, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }); }
		finally { fs.rmSync(tmp, { force: true }); }
	}
	static manifest(){ return AIIndex.read_lines(StaleClose.MANIFEST); }

	write_plan(){ for (const r of this.plan) StaleClose.append(StaleClose.MANIFEST, { op: "plan", at: "NOW", ...r }); }

	/** Append the stop line to each planned log, then record each close. A log whose replay would not end `stopped` is refused and recorded as such. */
	apply(){
		const closed = [], refused = [];
		for (const r of this.plan){
			const file = StaleClose.log_of(r.dir), why = `abandoned: no agent since ${r.last}; closed by StaleClose ${day()}`;
			const stop = { stop: { at: "NOW", why, by: StaleClose.BY } };
			const ends = AIIndex.fold([...AIIndex.read_lines(file), { stop: { at: new Date(this.now).toISOString(), why, by: StaleClose.BY } }], path.join(TaskDirs.REPO, "public")).state;
			if (ends !== "stopped") { refused.push({ dir: r.dir, ends }); StaleClose.append(StaleClose.MANIFEST, { op: "refused", at: "NOW", dir: r.dir, ends, by: StaleClose.BY }); continue; }
			StaleClose.append(file, stop);
			StaleClose.append(StaleClose.MANIFEST, { op: "close", at: "NOW", ...r, file: path.relative(TaskDirs.REPO, file).split(path.sep).join("/"), why, by: StaleClose.BY });
			closed.push(r.dir);
		}
		return { closed, refused };
	}

	/** Reopen every dir the manifest closed and no later `undo` row covers: one `start` line each (stopped -> running, the stale it was). */
	static undo(){
		const open = new Map();
		for (const l of StaleClose.manifest()){ if (l.op === "close") open.set(l.dir, l); else if (l.op === "undo") open.delete(l.dir); }
		const done = [];
		for (const [dir, l] of open){
			StaleClose.append(path.join(TaskDirs.REPO, l.file), { start: { at: "NOW", why: `undo of StaleClose close ${l.why}`, by: StaleClose.BY } });
			StaleClose.append(StaleClose.MANIFEST, { op: "undo", at: "NOW", dir, by: StaleClose.BY });
			done.push(dir);
		}
		return done;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
	const argv = process.argv.slice(2);
	if (argv.includes("--undo")) { const d = StaleClose.undo(); console.log(`undo: ${d.length} tasks reopened (a start line each)`); }
	else if (argv.includes("--plan") || argv.includes("--apply")) {
		const sc = new StaleClose(); await sc.plan_rows();
		const before = sc.summary(); console.log(JSON.stringify(before));
		if (argv.includes("--apply")) {
			const { closed, refused } = sc.apply();
			console.log(JSON.stringify({ closed: closed.length, refused: refused.length }));
		} else { sc.write_plan(); console.log(`planned ${sc.plan.length}; manifest ${path.relative(TaskDirs.REPO, StaleClose.MANIFEST)}`); }
	} else console.log("usage: node Server/StaleClose.mjs --plan | --apply | --undo");
}
