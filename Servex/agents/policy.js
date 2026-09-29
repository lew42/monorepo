/* Who may message and spawn whom. Kept as one small class so the rules are data
 * a page can show (`rules()`) and a test can walk. `SERVEX_POLICY=off` disables it. */

const REPLY_MS = 30 * 60 * 1000;
/* `page-assistant` / `page-mastermind` are the recursive-pairs words for the same
 * two roles `assistant`/`manager` (and the older `master-assistant`) already name
 * here — kept alongside them, not instead of them, so either spelling a caller
 * passes to `spawn_agent` is refused the same way (roles.js's aliasing is a
 * separate, id-shaped concern; this list is the raw words a caller can type). */
const NO_SPAWN = ["task-mastermind", "manager", "mastermind", "master-assistant", "assistant", "page-mastermind", "page-assistant"];
/* A numbered mastermind-servex instance (another worktree's, or another
 * Servex's own) counts as THE mastermind for messaging purposes (D4,
 * 2026-09-25/28): `task-mastermind-recursive-pairs` was refused when it
 * messaged `mastermind-servex-3` only because the id had a `-3` on it. */
const SERVEX_ID = /^(mastermind-servex|servex-mastermind)(-\d+)?$/;

export class Policy {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }
	defaults(){ return { agents: null, told: new Map(), refused: [], onrefuse: null }; }

	off(){ return process.env.SERVEX_POLICY === "off"; }

	/* A registered external id (`External.js`, D8: a VS Code tab) — read from the
	 * SAME registry Global.js's `registry_row()` reads, never a copy. Checked
	 * only for an id none of the fixed prefixes above already claimed, so an
	 * internal agent's own id is never shadowed by a same-named registry row. */
	registered_external(id){
		try { return (this.agents?.reg?.()?.read?.() ?? {})[id]?.kind === "external"; } catch { return false; }
	}

	kind(id){
		if(id == null || id === "owner") return "owner";
		if(id.startsWith("assistant-")) return "assistant";
		if(id.startsWith("manager-")) return "manager";
		if(id.startsWith("master-assistant")) return "master";
		if(SERVEX_ID.test(id)) return "servex";
		if(id.startsWith("task-mastermind-")) return "task-mastermind";
		if(id === "dispatcher") return "system";
		if(this.registered_external(id)) return "external";
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
		const ok = rule => ({ ok: true, rule });
		/* D8 (2026-09-28, the inbox minion's landing): an external id is just a tab's
		 * inbox line, not a role with something to protect — ANY agent may message
		 * one, checked before anything else so a worker or a stranger is never
		 * refused for it the way it would be for another internal agent. */
		if(this.kind(to) === "external") return ok("external");
		const f = this.kind(from);
		/* And the reverse: a registered tab speaks WITH the owner's own reach — the
		 * owner is exactly who a tab is, whether or not it happened to register. */
		if(f === "owner" || f === "external") return ok(f);
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
		if(["owner", "servex", "system", "external"].includes(f)) return { ok: true };
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
		{ from: "dispatcher, mastermind-servex(-N)", may: "message anyone; spawn anything" },
		{ from: "a registered external id (a VS Code tab)", may: "message anyone, like the owner; spawn anything" },
		{ from: "any agent", may: "message an external id, its parent, its own children, and anyone who messaged it in the last 30 minutes" },
		{ from: "assistant-X", may: "message manager-X, master-assistant, mastermind-servex; spawn nothing" },
		{ from: "manager-X", may: "message assistant-X, mastermind-servex; spawn anything except task-mastermind, manager, mastermind, master-assistant, assistant, page-mastermind, page-assistant" },
		{ from: "master-assistant", may: "message any assistant, mastermind-servex; spawn nothing" },
		{ from: "task-mastermind-*", may: "message mastermind-servex(-N); spawn like a manager" },
		{ from: "worker", may: "spawn only minion and helper" }
	]; }
}

export default Policy;
