import fs from "fs";
import path from "path";
import { stamp } from "./home.js";

/* BUDGETS, ENFORCED (node-reliability, 2026-09-29). Overruns were systemic:
 * audio spent $75 against $15, prompt-refine $47 against $10, the page
 * mastermind $37 against $12, with the week at 68%. A budget written in a brief
 * was a wish; this makes it a limit node keeps.
 *
 * Every heartbeat tick, for each open task:
 *   cost    — the task's running cost, `cost_usd` on its assign lines
 *             (Server/task-cost.mjs writes it after every agent result: the
 *             root agent's share plus every minion it spawned).
 *   budget  — `budget_usd` on an assign line, else the first "$N" after the
 *             word "budget" in its requirements.md, else a default by the
 *             owner's role (DEFAULTS). No budget, no enforcement.
 *   100%    — the owner hears once: land what you have, or write in task.jsonl
 *             why you need more and how much (raise it: an assign line with a
 *             new `budget_usd`; the 150% line moves with it).
 *   150%    — the task's minions (every live descendant of the owner, never the
 *             owner, so it can still land) are stopped, and card "live" hears.
 * Each step is logged once per budget on the task's own task.jsonl, as a
 * `{"log":{"budget":"reached"|"over", …}}` line — which is also its memory. */
export const DEFAULTS = { "task-mastermind": 15, minion: 5 };
const FROM = "servex-budget";

export function budget_of(state, dir, role){
	if (Number(state.budget_usd) > 0) return { usd: Number(state.budget_usd), from: "assign" };
	try {
		const m = fs.readFileSync(path.join(dir, "requirements.md"), "utf8").match(/budget[^$\n]{0,40}\$\s*(\d+(?:\.\d+)?)/i);
		if (m) return { usd: Number(m[1]), from: "requirements.md" };
	} catch {}
	return DEFAULTS[role] ? { usd: DEFAULTS[role], from: `default for ${role}` } : null;
}

/* What to do for one task now: null, "reached" or "over". `told` = the budget
 * steps already logged for THIS budget figure. Pure, so the proof can call it. */
export function judge(cost, budget, told = new Set()){
	if (!budget || !(cost > 0)) return null;
	if (cost >= 1.5 * budget.usd && !told.has("over")) return "over";
	if (cost >= budget.usd && !told.has("reached") && !told.has("over")) return "reached";
	return null;
}

export function read_task(file){
	const state = {}, told = new Map();
	let text; try { text = fs.readFileSync(file, "utf8"); } catch { return null; }
	for (const raw of text.split("\n")){
		let o; try { o = raw.trim() && JSON.parse(raw); } catch {}
		if (!o) continue;
		if (o.assign) Object.assign(state, o.assign);
		if (o.landed_at) state.landed_at = o.landed_at, state.outcome ??= o.outcome ?? "landed";
		if (o.log?.budget) (told.get(o.log.budget_usd) ?? told.set(o.log.budget_usd, new Set()).get(o.log.budget_usd)).add(o.log.budget);
	}
	return { state, told };
}

export default class Budget {
	constructor(...args){ Object.assign(this, ...args); }   // { heartbeat }
	get hb(){ return this.heartbeat; }
	get agents(){ return this.heartbeat.agents; }

	descendants(id){
		const out = [], seen = new Set([id]);
		for (let grew = true; grew;){
			grew = false;
			for (const a of this.agents.live.values())
				if (!seen.has(a.id) && seen.has(a.parent) && a.state !== "stopped"){ seen.add(a.id); out.push(a); grew = true; }
		}
		return out;
	}

	async sweep(){
		for (const file of this.hb.files()){
			const t = read_task(file);
			if (!t || (t.state.landed_at && String(t.state.outcome ?? "").trim()) || t.state.closed_by) continue;
			const owner = t.state.agent;
			if (!owner || !this.hb.opted_in(t.state)) continue;
			const role = this.agents.live.get(owner)?.role ?? this.agents.reg().read()[owner]?.role ?? (owner.startsWith("task-mastermind") ? "task-mastermind" : null);
			const budget = budget_of(t.state, path.dirname(file), role);
			const cost = Number(t.state.cost_usd) || 0;
			const step = judge(cost, budget, t.told.get(budget?.usd) ?? new Set());
			if (!step) continue;
			const slug = path.basename(path.dirname(file)), $ = n => `$${n.toFixed(2)}`;
			const line = { at: stamp(), budget: step, budget_usd: budget.usd, cost_usd: cost, from: budget.from };
			if (step === "reached"){
				const text = `Budget reached on ${slug}: ${$(cost)} spent of ${$(budget.usd)} (${budget.from}). Land what you have, or write in task.jsonl why you need more, and how much (an assign line with a new budget_usd). At ${$(1.5 * budget.usd)} Servex stops your minions.`;
				try { this.agents.send(owner, text, { from: FROM }); line.msg = `told ${owner}`; }
				catch (e){ line.msg = `could not tell ${owner}: ${e.message || e}`; }
			} else {
				const stopped = [];
				for (const a of this.descendants(owner)) try { this.agents.stop(a.id, { by: FROM }); stopped.push(a.id); } catch {}
				line.stopped = stopped;
				line.msg = `over 150%: stopped ${stopped.length} minion(s); ${owner} is left running to land`;
				const text = `${slug} is at ${$(cost)} against a budget of ${$(budget.usd)} (${Math.round(100 * cost / budget.usd)}%). Servex stopped its minions${stopped.length ? ` (${stopped.join(", ")})` : ""}; ${owner} can still land.`;
				try { this.agents.send(owner, text, { from: FROM }); } catch {}
				await this.hb.post("live", text);
			}
			await this.hb.servex.task_loop.write_line(file, { log: line });
		}
	}
}
