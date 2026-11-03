import fs from "fs";
import path from "path";
import { stamp } from "./home.js";
import Landed from "./Landed.js";

/* BUDGETS ARE ESTIMATES, NOT CAPS (the owner, 2026-10-22). At 100% the task's owner and its parent are told once;
 * nothing is refused or stopped. Only at HARD_X (SERVEX_GATE_HARD_X, default 10) times the budget are new spawns
 * refused and the task's minions stopped. The history below explains the old 150% stop, removed 2026-10-22.
 * Doc: Servex/doc/budget.md.
 *
 * BUDGETS, ENFORCED (node-reliability, 2026-09-29). Overruns were systemic:
 * audio spent $75 against $15, prompt-refine $47 against $10, the page
 * mastermind $37 against $12, with the week at 68%. A budget written in a brief
 * was a wish; this makes it a limit node keeps.
 *
 * Every heartbeat tick, for each open task:
 *   cost    — the task's running cost, `cost_usd` on its assign lines
 *             (Server/task-cost.mjs writes it after every agent result: the
 *             root agent's share plus every minion it spawned).
 *   budget  — `budget_usd` on an assign line, else a line starting "Budget: $N"
 *             in its requirements.md, else a default by the
 *             owner's role (DEFAULTS). No budget, no enforcement.
 *   100%    — the owner AND the owner's own parent hear once: land what you
 *             have, or write in task.jsonl why you need more and how much
 *             (raise it: an assign line with a new `budget_usd`; the 150% line
 *             moves with it). From then on a NEW spawn under the owner (its
 *             child, or any live descendant's) is REFUSED, not queued — a
 *             queued one would wait forever — until the budget is raised
 *             (`refuse()`, called by Servex's spawn gate). A resume (a revive)
 *             is never refused, so the owner can still land.
 *   150%    — the task's minions (every live descendant of the owner, never the
 *             owner, so it can still land) are stopped, and card "live" hears.
 * Each step is logged once per budget on the task's own task.jsonl, as a
 * `{"log":{"budget":"reached"|"over", …}}` line — which is also its memory. */
export const DEFAULTS = { "task-mastermind": 15, minion: 5 };
const FROM = "servex-budget";

export function budget_of(state, dir, role){
	if (Number(state.budget_usd) > 0) return { usd: Number(state.budget_usd), from: "assign" };
	try {
		const m = fs.readFileSync(path.join(dir, "requirements.md"), "utf8").match(/^[\s*#>-]*budget\W{0,4}\$\s*(\d+(?:\.\d+)?)/im);   // a line that STARTS "Budget: $N", never prose about budgets
		if (m) return { usd: Number(m[1]), from: "requirements.md" };
	} catch {}
	return DEFAULTS[role] ? { usd: DEFAULTS[role], from: `default for ${role}` } : null;
}

/* What to do for one task now: null, "reached" or "over". `told` = the budget
 * steps already logged for THIS budget figure. Pure, so the proof can call it. */
export const HARD_X = () => Number(process.env.SERVEX_GATE_HARD_X) || 10;
export function judge(cost, budget, told = new Set()){
	if (!budget || !(cost > 0)) return null;
	if (cost >= HARD_X() * budget.usd && !told.has("over")) return "over";
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
	constructor(...args){ Object.assign(this, ...args); this.capped ??= new Map(); }   // { heartbeat }; capped: owner -> { slug, cost, usd }
	get hb(){ return this.heartbeat; }
	get agents(){ return this.heartbeat.agents; }

	row(id){ return this.agents.live.get(id) ?? this.agents.reg().read()[id]; }
	/* a parent recorded before a resume still names the old id: read it as the new one */
	up(id){ return id && (this.agents.successor?.(id) ?? id); }

	descendants(id){
		const out = [], seen = new Set([id]);
		for (let grew = true; grew;){
			grew = false;
			for (const a of this.agents.live.values())
				if (!seen.has(a.id) && seen.has(this.up(a.parent)) && a.state !== "stopped"){ seen.add(a.id); out.push(a); grew = true; }
		}
		return out;
	}

	/* The spawn gate asks this first. A fresh spawn whose parent is a capped owner, or
	 * sits anywhere under one, is refused with the reason; null = go ahead. A resume
	 * (a revive) and a spawn with no parent are never refused. */
	refuse(spec = {}){
		if (!spec.parent || spec.resume || !this.capped.size) return null;
		for (let id = this.up(spec.parent), hops = 0; id && hops < 12; id = this.up(this.row(id)?.parent), hops++){
			const c = this.capped.get(id);
			if (c) return `budget: ${c.slug} spent $${c.cost.toFixed(2)} of $${c.usd.toFixed(2)} — land it, or raise budget_usd in its task.jsonl (an assign line); no new spawns under ${id} until then`;
		}
		return null;
	}

	async sweep(){
		const capped = new Map();
		for (const file of this.hb.files()){
			const t = read_task(file);
			if (!t || Landed.of_file(file)) continue;
			const named = t.state.agent;
			if (!named || !this.hb.opted_in(t.state)) continue;
			const owner = this.agents.successor?.(named) ?? named;   // a resumed session's old id means its new one
			const role = this.row(owner)?.role ?? (owner.startsWith("task-mastermind") ? "task-mastermind" : null);
			const budget = budget_of(t.state, path.dirname(file), role);
			const cost = Number(t.state.cost_usd) || 0;
			const slug = path.basename(path.dirname(file)), $ = n => `$${n.toFixed(2)}`;
			if (budget && cost >= HARD_X() * budget.usd) capped.set(owner, { slug, cost, usd: budget.usd });
			const step = judge(cost, budget, t.told.get(budget?.usd) ?? new Set());
			if (!step) continue;
			const line = { at: stamp(), budget: step, budget_usd: budget.usd, cost_usd: cost, from: budget.from };
			if (step === "reached"){
				const text = `Budget estimate reached on ${slug}: ${$(cost)} spent of an estimated ${$(budget.usd)} (${budget.from}). It is an estimate, not a cap: keep going if the work is working, and note in task.jsonl why it costs more. At ${$(HARD_X() * budget.usd)} (${HARD_X()}x) Servex refuses new spawns under you and stops your minions.`;
				const told = [];
				for (const [who, say] of [[owner, text], [this.row(owner)?.parent, `${owner}'s task ${slug} reached its budget estimate: ${$(cost)} of ${$(budget.usd)}. Nothing is stopped below ${HARD_X()}x.`]]){
					if (!who || told.includes(who)) continue;
					try { this.agents.send(who, say, { from: FROM }); told.push(who); } catch (e){ line.err = `could not tell ${who}: ${e.message || e}`; }
				}
				line.msg = `told ${told.join(" + ") || "nobody"}; nothing refused (an estimate)`;
			} else {
				const stopped = [];
				for (const a of this.descendants(owner)) try { this.agents.stop(a.id, { by: FROM }); stopped.push(a.id); } catch {}
				line.stopped = stopped;
				line.msg = `over ${HARD_X()}x: new spawns refused, stopped ${stopped.length} minion(s); ${owner} is left running to land`;
				const text = `${slug} is at ${$(cost)} against a budget of ${$(budget.usd)} (${Math.round(100 * cost / budget.usd)}%). Servex stopped its minions${stopped.length ? ` (${stopped.join(", ")})` : ""}; ${owner} can still land.`;
				try { this.agents.send(owner, text, { from: FROM }); } catch {}
				const parent = this.up(this.row(owner)?.parent);   // the 100% step was skipped (first seen past 150%): the parent still hears once
				if (parent && !(t.told.get(budget.usd) ?? new Set()).has("reached")) try { this.agents.send(parent, text, { from: FROM }); } catch {}
				await this.hb.post("live", text);
			}
			await this.hb.servex.task_loop.write_line(file, { log: line });
		}
		this.capped = capped;
	}
}
