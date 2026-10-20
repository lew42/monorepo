#!/usr/bin/env node
// Server/Steps.mjs — THE STEP RUNNER's data class: a task's plan (`steps` + `step` in task.jsonl), where it stands, who is overdue.
// Plan: public/framework/ai/sessions/2026/10/12/session-87bec773/step-runner/plan.md
//   node Server/Steps.mjs --report [days]                         followed-rate over the last N days (default 7)
//   node Server/Steps.mjs --show <task dir>                       the steps with ✅/⬜ and the current one
//   node Server/Steps.mjs --plan <task dir> [--kind ui] "step (N min)" ...   append ONE assign line (steps + template) via append.mjs
// A step is a string with its estimate, "Build the parser (20 min)"; strings stay strings for every other reader.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import TaskDirs from "./TaskDirs.mjs";
import SessionRecord from "./SessionRecord.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = "/framework/ext/Shots/";
const MIN = /\s*(?:\((\d+(?:\.\d+)?)\s*(?:min|m)\)|~\s*(\d+(?:\.\d+)?)\s*m(?:in)?)\s*$/i;

export default class Steps {
	static TEMPLATES = {
		base: ["Smoke test (5 min)", "Commit and merge (5 min)", "Land with finish-task (5 min)"],
		ui: ["Shoot the page at its widths (5 min)", "Read the shots and judge (5 min)", "Fix and re-shoot (15 min)", "Compare before/after (5 min)"],
	};
	// the note a template step carries into its prompt, keyed by the step text without its estimate
	static NOTES = {
		"Shoot the page at its widths": `Run node Server/shots.mjs <page url> --task <this task dir> --by <you>: it shoots the template's widths into the page's screenshots/ folder and diffs against the last round (${SHOTS}).`,
		"Read the shots and judge": `Read every png and the diff-<width>.png overlay (red = changed, blue = moved) for wasted space and breakage, then record it: node Server/shots.mjs --judge <round> better|worse|same "why" (${SHOTS}).`,
		"Fix and re-shoot": "Fix what the shots showed, then run the same node Server/shots.mjs command again; it diffs against the round before.",
		"Compare before/after": "Read the last round's overlay and diff line against the first round (--vs <first round id>) and say what changed; the owner gives the last word in the Screenshots tab.",
		"Smoke test": "Run node Server/smoke.mjs on your worktree and your tests.",
		"Commit and merge": "Commit by exact path, then node Server/merge.mjs.",
		"Land with finish-task": "Run finish-task; the last line carries landed_at and an outcome.",
	};

	/** "Build it (20 min)" | {do|title, min} -> {n, do, min}. n is 1-based. */
	static parse(steps){
		return (Array.isArray(steps) ? steps : []).map((s, i) => {
			if (s && typeof s === "object"){
				const raw = String(s.do ?? s.title ?? ""), tail = MIN.exec(raw), m = s.min ?? s.minutes ?? (tail ? tail[1] ?? tail[2] : null);
				return { n: i + 1, do: raw.replace(MIN, "").trim(), min: m !== null && m !== undefined && Number.isFinite(Number(m)) ? Number(m) : null };
			}
			const str = String(s), m = MIN.exec(str);
			return { n: i + 1, do: str.replace(MIN, "").trim(), min: m ? Number(m[1] ?? m[2]) : null };
		});
	}

	/** The steps a task gets for a kind: the given ones, then (ui) the screenshot steps, then the base close-out. */
	static template(kind, given = []){
		const have = new Set(given.map(g => String(g).replace(MIN, "").trim().toLowerCase()));
		const add = [...(kind === "ui" ? this.TEMPLATES.ui : []), ...this.TEMPLATES.base].filter(t => !have.has(t.replace(MIN, "").trim().toLowerCase()));
		return add;
	}

	/** One task.jsonl -> {state, steps, step, started_at, nudged:Set, landed, closed, kind}. null when unreadable.
	 *  started_at (ms): lines carry no clock, so for the latest line that set the current step we take its own at/ts/requested_at,
	 *  else the nearest EARLIER line's `at`, else the nearest later one, else line 1's requested_at, else the file's mtime. */
	static read(file){
		let text, mtime;
		try { text = fs.readFileSync(file, "utf8"); mtime = fs.statSync(file).mtimeMs; } catch { return null; }
		const state = {}, nudged = new Set(), seen = new Set(), rows = [];
		for (const raw of text.split("\n")){
			if (!raw.trim()) continue;
			let o; try { o = JSON.parse(raw); } catch { continue; }
			if (!o || typeof o !== "object") continue;
			rows.push(o);
			const a = o.assign;
			if (a && typeof a === "object"){ Object.assign(state, a); if (a.step !== undefined) seen.add(Number(a.step)); }
			if (o.log && o.log.nudge !== undefined) nudged.add(Number(o.log.nudge));
		}
		const steps = this.parse(state.steps), step = Number(state.step) || 1;
		const t = o => { for (const v of [o.assign?.at, o.assign?.ts, o.at, o.ts, o.log?.at, o.assign?.requested_at, o.assign?.started_at]){ const ms = v ? Date.parse(v) : NaN; if (Number.isFinite(ms)) return ms; } return NaN; };
		let idx = -1;
		rows.forEach((o, i) => { if (o.assign && Number(o.assign.step) === step) idx = i; });
		let started = NaN;
		if (idx >= 0){
			started = t(rows[idx]);
			for (let i = idx - 1; i >= 0 && !Number.isFinite(started); i--) started = t(rows[i]);
			for (let i = idx + 1; i < rows.length && !Number.isFinite(started); i++) started = t(rows[i]);
		}
		if (!Number.isFinite(started)) started = rows.length ? Date.parse(rows[0].assign?.requested_at ?? "") : NaN;
		if (!Number.isFinite(started)) started = mtime;
		const landed = !!state.landed_at && !!String(state.outcome ?? "").trim();
		return { state, steps, step, seen, started_at: started, nudged, landed, closed: !!state.closed_by, kind: state.kind ?? null };
	}

	/** The current step when it has run past twice its estimate and has not been nudged yet; else null. */
	static overdue(info, now = Date.now()){
		if (!info || info.landed || info.closed) return null;
		const cur = info.steps.find(s => s.n === info.step);
		if (!cur || cur.min == null || info.nudged.has(cur.n)) return null;
		const since = now - info.started_at;
		return since >= 2 * cur.min * 60000 ? { n: cur.n, do: cur.do, min: cur.min, since_ms: since } : null;
	}

	/** What the agent is told when step n starts: the step, its estimate, its template note, how to move on. */
	static prompt(info, n){
		const s = info.steps.find(x => x.n === n);
		if (!s) return "";
		const note = this.NOTES[s.do] ? ` ${this.NOTES[s.do]}` : "";
		const last = n >= info.steps.length;
		return `Step ${n} of ${info.steps.length}: ${s.do}${s.min != null ? ` (~${s.min} min)` : ""}.${note} ` +
			(last ? `This is the last step: land with a final {"assign":{"step":${n},"landed_at":"NOW","outcome":"…"}}.`
				: `When it starts the next one, log {"assign":{"step":${n + 1},"now":"…","at":"NOW"}}.`);
	}

	/** Followed-rate over the task dirs of the last `days` days. */
	static report(days = 7){
		const r = { tasks: 0, with_steps: 0, with_estimates: 0, landed: 0, all_reported: 0, followed_fully: 0, rate: null, rate_all_with_steps: null };
		let fully_steps = 0;
		for (const t of TaskDirs.list(days)){
			const info = this.read((SessionRecord.log_file(t.dir) ?? path.join(t.dir, "task.jsonl")));
			if (!info) continue;
			r.tasks++;
			if (!info.steps.length) continue;
			r.with_steps++;
			const est = info.steps.some(s => s.min != null);
			if (est) r.with_estimates++;
			if (info.landed) r.landed++;
			// every step after the first was bumped to on its own line (a jump from 1 to the last does not count)
			const reported = info.steps.every(s => s.n === 1 || info.seen.has(s.n));
			if (reported) r.all_reported++;
			const fully = reported && info.landed;
			if (fully) fully_steps++;
			if (fully && est) r.followed_fully++;
		}
		r.rate = r.with_estimates ? r.followed_fully / r.with_estimates : null;
		r.rate_all_with_steps = r.with_steps ? fully_steps / r.with_steps : null;
		return r;
	}

	/** ✅/⬜ lines for --show. */
	static show(info){
		return info.steps.map(s => `${s.n < info.step || info.landed ? "✅" : "⬜"} ${s.n}. ${s.do}${s.min != null ? ` (${s.min} min)` : ""}${s.n === info.step && !info.landed ? "   <- current" : ""}`).join("\n");
	}

	/** Append ONE assign line through the validated path (.claude/hooks/append.mjs). Returns the spawn result. */
	static plan(dir, given, kind){
		const file = SessionRecord.log_or_old(path.resolve(TaskDirs.REPO, dir));
		const line = { assign: { steps: [...given, ...this.template(kind, given)], step: 1, ...(kind ? { kind } : {}), at: "NOW" } };
		const tmp = path.join(os.tmpdir(), `steps-plan-${process.pid}.json`);
		fs.writeFileSync(tmp, JSON.stringify(line));
		try { return spawnSync(process.execPath, [path.join(here, "..", ".claude", "hooks", "append.mjs"), file, tmp], { encoding: "utf8", windowsHide: true }); }
		finally { fs.rmSync(tmp, { force: true }); }
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), has = n => argv.includes(n), after = n => argv[argv.indexOf(n) + 1];
	if (has("--report")){
		const days = Number(after("--report")) || 7, r = Steps.report(days), pct = x => x == null ? "n/a" : Math.round(x * 100) + "%";
		console.log(`Step runner, last ${days} days\n  tasks ${r.tasks} | with steps ${r.with_steps} | with estimates ${r.with_estimates} | landed ${r.landed} | all steps reported ${r.all_reported}\n  followed fully ${r.followed_fully} | rate (of estimated) ${pct(r.rate)} | rate (of all with steps) ${pct(r.rate_all_with_steps)}`);
		console.log(JSON.stringify(r));
	} else if (has("--show")){
		const info = Steps.read(SessionRecord.log_or_old(path.resolve(TaskDirs.REPO, after("--show"))));
		console.log(info ? (Steps.show(info) || "(no steps)") : "no task.jsonl or session.jsonl there");
	} else if (has("--plan")){
		const rest = argv.slice(argv.indexOf("--plan") + 1), dir = rest[0], kind = rest.includes("--kind") ? rest[rest.indexOf("--kind") + 1] : undefined;
		const given = rest.slice(1).filter((x, i, a) => x !== "--kind" && a[i - 1] !== "--kind");
		const r = Steps.plan(dir, given, kind);
		process.stdout.write(r.stdout ?? ""); process.stderr.write(r.stderr ?? ""); process.exit(r.status ?? 1);
	} else console.log("usage: --report [days] | --show <task dir> | --plan <task dir> [--kind ui] \"step (N min)\" ...");
}
