/* Who may message and spawn whom. Kept as one small class so the rules are data
 * a page can show (`rules()`) and a test can walk. `SERVEX_POLICY=off` disables it. */

const REPLY_MS = 30 * 60 * 1000;
const NO_SPAWN = ["task-mastermind", "manager", "mastermind", "master-assistant", "assistant"];

export class Policy {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }
	defaults(){ return { agents: null, told: new Map(), refused: [], onrefuse: null }; }

	off(){ return process.env.SERVEX_POLICY === "off"; }

	kind(id){
		if(id == null || id === "owner") return "owner";
		if(id.startsWith("assistant-")) return "assistant";
		if(id.startsWith("manager-")) return "manager";
		if(id.startsWith("master-assistant")) return "master";
		if(id === "mastermind-servex" || id === "servex-mastermind") return "servex";
		if(id.startsWith("task-mastermind-")) return "task-mastermind";
		if(id === "dispatcher") return "system";
		return "worker";
	}

	/* `assistant-X` and `manager-X` are a pair sharing the card X. */
	card(id){ const k = this.kind(id); return k === "assistant" || k === "manager" ? id.slice(id.indexOf("-") + 1) : null; }

	parent(id){ return this.agents?.live?.get(id)?.parent ?? null; }

	/* `from` just messaged `to`: remember it, so `to` may answer. */
	heard(from, to, now = Date.now()){ this.told.set(`${to}→${from}`, now); }

	/* Does the fixed table let `from` message `to`? */
	table(from, to){
		const f = this.kind(from), t = this.kind(to);
		if(t === "servex") return ["assistant", "manager", "master", "task-mastermind"].includes(f);
		if(f === "assistant") return (t === "manager" && this.card(from) === this.card(to)) || t === "master";
		if(f === "manager") return t === "assistant" && this.card(from) === this.card(to);
		if(f === "master") return t === "assistant";
		return false;
	}

	message(from = null, to, now = Date.now()){
		if(this.off()) return { ok: true, rule: "off" };
		const f = this.kind(from);
		const ok = rule => ({ ok: true, rule });
		if(f === "owner") return ok("owner");
		if(f === "system" || f === "servex") return ok("system");
		if(this.parent(from) === to || this.parent(to) === from) return ok("tree");
		if(now - (this.told.get(`${from}→${to}`) ?? -Infinity) < REPLY_MS) return ok("reply");
		if(this.table(from, to)) return ok("table");
		const may = { assistant: "its own manager, master-assistant or mastermind-servex", manager: "its own assistant or mastermind-servex",
			master: "any assistant or mastermind-servex", "task-mastermind": "mastermind-servex, its parent and its own children" }[f]
			?? "its parent, its own children, and anyone who messaged it in the last 30 minutes";
		const entry = { at: new Date(now).toISOString(), from, to, why: `${from} may not message ${to}: it may message ${may}.` };
		this.refuse(entry);
		return { ok: false, why: entry.why };
	}

	spawn(caller = null, role){
		if(this.off()) return { ok: true, rule: "off" };
		const f = this.kind(caller);
		if(["owner", "servex", "system"].includes(f)) return { ok: true };
		const deny = why => {
			const entry = { at: new Date().toISOString(), from: caller, to: `spawn ${role}`, why: `${caller} may not ${why}` };
			this.refuse(entry); return { ok: false, why: entry.why };
		};
		if(f === "assistant" || f === "master") return deny(`spawn agents: ${f === "master" ? "the master assistant" : "an assistant"} has its own tools for that.`);
		if(f === "worker") return ["minion", "helper"].includes(role) ? { ok: true } : deny(`spawn a ${role}: a worker may spawn only a minion or a helper.`);
		return NO_SPAWN.includes(role) ? deny(`spawn a ${role}: only mastermind-servex may.`) : { ok: true };
	}

	refuse(entry){ this.refused.push(entry); if(this.refused.length > 50) this.refused.shift(); this.onrefuse?.(entry); return entry; }

	rules(){ return [
		{ from: "owner", may: "message anyone; spawn anything" },
		{ from: "dispatcher, mastermind-servex", may: "message anyone; spawn anything" },
		{ from: "any agent", may: "message its parent, its own children, and anyone who messaged it in the last 30 minutes" },
		{ from: "assistant-X", may: "message manager-X, master-assistant, mastermind-servex; spawn nothing" },
		{ from: "manager-X", may: "message assistant-X, mastermind-servex; spawn anything except task-mastermind, manager, mastermind, master-assistant, assistant" },
		{ from: "master-assistant", may: "message any assistant, mastermind-servex; spawn nothing" },
		{ from: "task-mastermind-*", may: "message mastermind-servex; spawn like a manager" },
		{ from: "worker", may: "spawn only minion and helper" }
	]; }
}

export default Policy;
