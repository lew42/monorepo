import fs from "node:fs";
import { place, stamp } from "../home.js";

/* WAKE-UPS THAT SURVIVE A RESTART (the owner, 2026-10-22: "a sleeping agent is never forgotten"). An agent that wants to be woken
 * later asks node, with the `wake_me` tool, instead of keeping a sleep or a background shell alive in its own process (which a
 * Servex restart kills, so the agent waits forever). Node writes one line per change to logs/wakeups.jsonl through Servex's single
 * writer, keeps one timer per pending wake-up, and fires it by sending the agent a message (revive: true, so a dormant or restarted
 * agent is reopened). At boot every pending line is armed again; one already due fires at once.
 * Lines: {type:"set", id, agent, due, why, by} · {type:"fired", id} · {type:"cancel", id, by}. Doc: Servex/doc/restart.md. */
export default class Wakeups {

	static LOG = "wakeups";
	static MAX_MS = 2 ** 31 - 1;   // setTimeout's ceiling (~24.8 days): a later wake-up is re-armed when this timer ends

	constructor(...args){ Object.assign(this, ...args); this.timers = new Map(); this.pending = new Map(); }

	get store(){ return this.agents.store(); }
	file(){ return place("logs", `${Wakeups.LOG}.jsonl`); }

	// Pending wake-ups from the log: every set with no fired or cancel after it. Synchronous, so boot can call it first.
	read(){
		const out = new Map();
		let text = "";
		try { text = fs.readFileSync(this.file(), "utf8"); } catch { return out; }
		for (const raw of text.split("\n")) if (raw.trim()) try {
			const l = JSON.parse(raw);
			if (l.type === "set" && l.id) out.set(l.id, l);
			else if ((l.type === "fired" || l.type === "cancel") && l.id) out.delete(l.id);
		} catch { /* a torn line is skipped */ }
		return out;
	}

	// Boot: arm every pending wake-up again. Returns the list, for the revive line.
	start(now = Date.now()){
		this.pending = this.read();
		for (const w of this.pending.values()) this.arm(w, now);
		return [...this.pending.values()];
	}

	stop(){ for (const t of this.timers.values()) clearTimeout(t); this.timers.clear(); }

	// A new wake-up: `in_min` from now, or at `at` (ISO). Returns the line written.
	async set({ agent, in_min, at, why, by } = {}, now = Date.now()){
		if (!agent) throw new Error("wake_me: which agent? (a Servex agent calls it for itself)");
		if (!why) throw new Error("wake_me: say why, in a few words: it is what you will be told when it fires");
		const due = at ? Date.parse(at) : now + Number(in_min) * 60000;
		if (!Number.isFinite(due)) throw new Error("wake_me: give in_min (minutes from now) or at (an ISO time)");
		const w = { type: "set", id: `w-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`, agent, due: new Date(due).toISOString(), why, by: by ?? agent };
		const r = await this.store.append(Wakeups.LOG, w);
		if (r && r.ok === false) throw new Error(`wake_me: the log refused the line: ${r.why}`);
		w.at = r?.entry?.at ?? stamp();   // the writer stamps it; replayed lines carry it too
		this.pending.set(w.id, w);
		this.arm(w, now);
		return w;
	}

	async cancel(id, by){
		if (!this.pending.has(id)) return false;
		clearTimeout(this.timers.get(id)); this.timers.delete(id); this.pending.delete(id);
		await this.store.append(Wakeups.LOG, { type: "cancel", id, by: by ?? null });
		return true;
	}

	list(agent){ return [...this.pending.values()].filter(w => !agent || w.agent === agent); }

	arm(w, now = Date.now()){
		clearTimeout(this.timers.get(w.id));
		const wait = Math.max(0, Date.parse(w.due) - now);
		const t = setTimeout(() => wait > Wakeups.MAX_MS ? this.arm(w) : this.fire(w), Math.min(wait, Wakeups.MAX_MS));
		t.unref?.();
		this.timers.set(w.id, t);
	}

	// Fire: log it first (so a crash right after never fires it twice), then wake the agent with its own words.
	async fire(w){
		if (!this.pending.has(w.id)) return;
		this.pending.delete(w.id); this.timers.delete(w.id);
		await this.store.append(Wakeups.LOG, { type: "fired", id: w.id, agent: w.agent }).catch(() => {});
		const late = Date.now() - Date.parse(w.due) > 120000 ? ` (it was due at ${w.due}; Servex was down then)` : "";
		try { await this.agents.send(w.agent, `Wake-up you set at ${w.at ?? "an earlier time"}${late}: ${w.why}`, { from: "servex", revive: true }); }
		catch (e){ this.store.append("servex", { type: "wakeup-failed", id: w.id, agent: w.agent, why: e.message || String(e) }).catch(() => {}); }
	}
}

/* The tools. A Servex agent wakes itself (ctx.caller); a VS Code tab names the agent. */
const tool = (name, description, properties, required, handler) => ({ name, description, inputSchema: { type: "object", required, properties }, schema: { type: "object", required, properties }, handler });
export function wake_tools(agents){
	const w = () => agents.wakeups ?? (() => { throw new Error("wake-ups are not running in this Servex"); })();
	return [
		tool("wake_me",
			"Ask node to wake you later, instead of sleeping or keeping a background shell waiting (a Servex restart kills those,"
			+ " and you would never wake). Node logs it, keeps it across restarts, and sends you `why` as a message when it is due,"
			+ " reopening your session if it was asleep. Give in_min (minutes from now) or at (an ISO time). Returns the wake-up's id.",
			{ in_min: { type: "number", description: "Minutes from now." }, at: { type: "string", description: "An ISO time, instead of in_min." },
				why: { type: "string", description: "What to check when you wake, in a few words. It is the message you get." },
				agent: { type: "string", description: "Only from outside Servex (a VS Code tab): the agent id to wake. A Servex agent leaves it out." } },
			["why"],
			async ({ in_min, at, why, agent }, ctx = {}) => JSON.stringify(await w().set({ agent: ctx.caller ?? agent, in_min, at, why, by: ctx.caller ?? "tab" }))),
		tool("cancel_wake", "Cancel a wake-up by the id wake_me returned.",
			{ id: { type: "string", description: "The wake-up's id (w-…)." } }, ["id"],
			async ({ id }, ctx = {}) => JSON.stringify({ cancelled: await w().cancel(id, ctx.caller ?? "tab") })),
		tool("list_wakes", "The wake-ups still pending: yours, or every agent's when you leave `agent` out and are not a Servex agent.",
			{ agent: { type: "string", description: "Only this agent's." } }, [],
			async ({ agent } = {}, ctx = {}) => JSON.stringify(w().list(agent ?? ctx.caller), null, 2)),
	];
}
