import fs from "node:fs";
import path from "node:path";
import SessionRecord from "../Server/SessionRecord.mjs";
import Task from "../public/framework/core/Task/Task.js";
import LandingCheck from "../Server/LandingCheck.mjs";

/* THE ONE RULE FOR "LANDED" (2026-10-17, Servex/doc/heartbeat.md): a task has landed when its log, folded through
 * Task.replay, ends `complete` (landed_at, or a finish/complete line) or `stopped` (closed_by, or a stop line).
 * Every Servex reader asks here, so the heartbeat, TaskLoop and the budget can never disagree. */
export default class Landed {

	static cache = new Map();   // file -> { key: "mtime:size", state }
	static checks = new Map();   // dir -> { at, verdict }   (the git check below, kept 30 s)

	/* The file a dir's task log lives in. */
	static file(dir){ return SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl"); }

	/* The Task state a log file replays to, or null when it cannot be read. Cached by mtime and size. */
	static state(file){
		let st; try { st = fs.statSync(file); } catch { return null; }
		const key = `${st.mtimeMs}:${st.size}`, hit = this.cache.get(file);
		if (hit?.key === key) return hit.state;
		let text; try { text = fs.readFileSync(file, "utf8"); } catch { return null; }
		const lines = [];
		for (const raw of text.split("\n")){ if (!raw.trim()) continue; try { lines.push(JSON.parse(raw)); } catch {} }
		let state;
		try { state = Task.replay(lines).state; }
		catch { state = this.legacy(lines); }   // replay threw: the old landed_at / closed_by answer
		this.cache.set(file, { key, state });
		return state;
	}

	/* Fallback only: assigns merged say landed_at + an outcome, or closed_by. */
	static legacy(lines){
		const s = {};
		for (const o of lines){
			if (o.assign) Object.assign(s, o.assign);
			if (o.landed_at) s.landed_at = o.landed_at, s.outcome ??= o.outcome ?? "landed";
		}
		return (s.landed_at && String(s.outcome ?? "").trim()) ? "complete" : s.closed_by ? "stopped" : "running";
	}

	static done(state){ return state === "complete" || state === "stopped"; }

	/* True when the task log (a file) has landed or been stopped. A landing whose branch is NOT on michael/dev
	 * does not count (todo 207): a Servex-side gate only; Task.replay and Server/AIIndex.mjs stay pure because a
	 * browser cannot run git. Servex/doc/landing.md. */
	static of_file(file){
		const state = this.state(file);
		return state === "stopped" || (state === "complete" && this.verdict(path.dirname(file)).landed);
	}

	/* The same, for a task dir. */
	static of_dir(dir){ return this.of_file(this.file(dir)); }

	/* True when the log SAYS landed, merged or not: the landing nag and check ask this, not of_dir. */
	static logged(dir){ return this.done(this.state(this.file(dir))); }

	/* LandingCheck.verify for the task's branch (assign.branch), by file content; fails open (landed). */
	static verdict(dir){
		const hit = this.checks.get(dir);
		if (hit && Date.now() - hit.at < 30000) return hit.verdict;
		let verdict; try { verdict = LandingCheck.verify(dir); } catch { verdict = { landed: true, via: "check failed" }; }
		this.checks.set(dir, { at: Date.now(), verdict });
		return verdict;
	}
}
