/* Who may message and spawn whom. Kept as one small class so the rules are data
 * a page can show (`rules()`) and a test can walk. OFF by default (owner, 2026-10-16: voice-app
 * must spawn masterminds of its own); `SERVEX_POLICY=on` turns the rules back on. */

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
const SERVEX_ID = /^(mastermind-servex|servex-mastermind|ai-system-mastermind)(-\d+)?$/;

export class Policy {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }
	defaults(){ return { agents: null, told: new Map(), refused: [], onrefuse: null, bypasses: [], onbypass: null }; }

	off(){ return process.env.SERVEX_POLICY !== "on"; }

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
		if(id.startsWith("session-smart-")) return "smart"; // the voice session's smart assistant: the owner's own mastermind on Opus 5.5 (tier voice_smart, 2026-10-25)
		if(id === "dispatcher") return "system";
		if(this.registered_external(id)) return "external";
		return "worker";
	}

	/* A task mastermind by either spelling: the old `task-mastermind-X` and the ids spawn_agent
	 * mints today (`mastermind-X`, which `kind()` calls a plain worker). Excludes mastermind-servex. */
	is_mastermind(id){ return typeof id === "string" && !SERVEX_ID.test(id) && (id.startsWith("task-mastermind-") || id.startsWith("mastermind-")); }

	/* RELAY RULE (2026-10-12, asks.md mastermind-assistant-relay): the owner or a tab messaging a
	 * mastermind goes through the root assistant, which answers fast, files the card and relays the
	 * ask. Direct stays open when the sender says so (`direct: true`) or names the mastermind with
	 * `@<id>` at the start of the text. Alternative kept: refuse outright (rejected: lockout risk). */
	route(from, to, text = "", { direct = false, assistant_live = true } = {}){
		const f = this.kind(from);
		if(this.off() || process.env.SERVEX_RELAY === "off" || !(f === "owner" || f === "external") || !this.is_mastermind(to)) return null;
		if(direct || !assistant_live || String(text).trimStart().startsWith(`@${to}`)) return null;
		return { to: "master-assistant", text: `RELAY for ${to} (from ${from ?? "owner"}). File or find the card, give a one-line answer, then pass the ask on with send_to_agent({id: "${to}", text, from: "master-assistant"}), keeping the owner's words verbatim:

${text}` };
	}

	/* `assistant-X` and `manager-X` are a pair sharing the card X. */
	card(id){ const k = this.kind(id); return k === "assistant" || k === "manager" ? id.slice(id.indexOf("-") + 1) : null; }

	/* A child still in the spawn queue, or known only to the registry, has a parent too:
	 * a task mastermind could not message its own queued minion (node-reliability, 09-30). */
	parent(id){
		const a = this.agents;
		return a?.live?.get(id)?.parent ?? a?.queued_entry?.(id)?.parent ?? a?.queued_entry?.(id)?.spec?.parent
			?? (() => { try { return a?.reg?.()?.read?.()?.[id]?.parent ?? null; } catch { return null; } })();
	}

	/* A page manager's RECORDED parent (Layers.js, layers.json): the parent page's
	 * manager, `manager-root` for a card or a top-level page. Its live spawn
	 * parent is its own assistant (it must keep waking that assistant), so the
	 * tree rule falls back to this one (recursive-pairs fix, 2026-09-29). */
	recorded_parent(id){
		try {
			const layers = this.agents?.layers, who = layers?.owner?.(id);
			return who?.role === "manager" ? layers.state.cards[who.card]?.parent ?? null : null;
		} catch { return null; }
	}

	tree(from, to){
		return this.parent(from) === to || this.parent(to) === from
			|| this.recorded_parent(from) === to || this.recorded_parent(to) === from;
	}

	/* `from` just messaged `to`: remember it, so `to` may answer. */
	heard(from, to, now = Date.now()){ this.told.set(`${to}→${from}`, now); }

	/* Does the fixed table let `from` message `to`? */
	table(from, to){
		const f = this.kind(from), t = this.kind(to);
		if(t === "servex") return ["assistant", "manager", "master", "task-mastermind"].includes(f);
		if(f === "assistant") return (t === "manager" && this.card(from) === this.card(to)) || t === "master";
		if(f === "manager") return t === "assistant" && this.card(from) === this.card(to);
		if(f === "master") return t === "assistant" || this.is_mastermind(to);
		/* PEERS (brief 19:25 (3), 2026-09-30): two task masterminds talk directly instead of
		 * relaying through mastermind-servex; send_to_agent copies the sender's parent. */
		/* No fence between teammates (2026-10-12): `mastermind-X` ids are kind "worker", so the old
		 * prefix-only test refused every peer. Any mastermind may message another. */
		if(this.is_mastermind(from) && this.is_mastermind(to)) return "peer";
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
		const f = this.kind(from) === "smart" ? "worker" : this.kind(from); // messaging: the smart assistant stays a worker
		/* And the reverse: a registered tab MESSAGES with the owner's own reach — the
		 * owner is exactly who a tab is. It may not SPAWN (spawn() below): anything
		 * that can call register_session would otherwise get "spawn anything". */
		/* RELAY BYPASS (log-only, 2026-10-12, asks.md #2): the owner or a tab messaging a task
		 * mastermind directly skips the card's assistant. Counted, never refused. */
		if((f === "owner" || f === "external") && this.is_mastermind(to)) this.bypass({ at: new Date(now).toISOString(), kind: "relay-bypass", from: from ?? "owner", via: f, to });
		if(f === "owner" || f === "external") return ok(f);
		if(f === "system" || f === "servex") return ok("system");
		if(this.tree(from, to)) return ok("tree");
		if(now - (this.told.get(`${from}→${to}`) ?? -Infinity) < REPLY_MS) return ok("reply");
		const row = this.table(from, to);
		if(row) return ok(row === "peer" ? "peer" : "table");
		const may = { assistant: "its own manager, master-assistant or mastermind-servex", manager: "its own assistant or mastermind-servex",
			master: "any assistant or mastermind-servex", "task-mastermind": "mastermind-servex, another task mastermind, its parent and its own children" }[f]
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
		if(f === "external") return deny(`spawn agents: an external id (a registered tab) may message anyone, but not spawn. Spawn from the tab itself with no id (as the owner), or ask mastermind-servex.`);
		if(f === "assistant" || f === "master") return deny(`spawn agents: ${f === "master" ? "the master assistant" : "an assistant"} has its own tools for that.`);
		if(f === "smart") return ["master-assistant", "assistant", "mastermind", "page-assistant"].includes(role) ? deny(`spawn a ${role}: the smart assistant may spawn task masterminds, managers, minions and helpers.`) : { ok: true };
		/* A mastermind (voice or task) may spawn masterminds (owner, 2026-10-15): ask-00dc4855.md. */
		if(this.is_mastermind(caller) && role === "mastermind") return { ok: true };
		if(f === "worker") return ["minion", "helper"].includes(role) ? { ok: true } : deny(`spawn a ${role}: a worker may spawn only a minion or a helper.`);
		return NO_SPAWN.includes(role) ? deny(`spawn a ${role}: only mastermind-servex may.`) : { ok: true };
	}

	bypass(entry){ this.bypasses.push(entry); if(this.bypasses.length > 50) this.bypasses.shift(); this.onbypass?.(entry); return entry; }

	refuse(entry){ this.refused.push(entry); if(this.refused.length > 50) this.refused.shift(); this.onrefuse?.(entry); return entry; }

	rules(){ return [
		{ from: "owner", may: "message anyone; spawn anything" },
		{ from: "dispatcher, mastermind-servex(-N)", may: "message anyone; spawn anything" },
		{ from: "a registered external id (a VS Code tab)", may: "message anyone, like the owner; spawn nothing" },
		{ from: "any agent", may: "message an external id, its parent, its own children, and anyone who messaged it in the last 30 minutes" },
		{ from: "manager-X", may: "message its recorded parent page's manager (layers.json `parent`, manager-root for a card) and its child pages' managers: the tree rule" },
		{ from: "assistant-X", may: "message manager-X, master-assistant, mastermind-servex; spawn nothing" },
		{ from: "manager-X", may: "message assistant-X, mastermind-servex; spawn anything except task-mastermind, manager, mastermind, master-assistant, assistant, page-mastermind, page-assistant" },
		{ from: "master-assistant", may: "message any assistant, mastermind-servex; spawn nothing" },
		{ from: "task-mastermind-*", may: "message mastermind-servex(-N) and another task mastermind (its parent gets a copy); spawn like a manager, and also a mastermind" },
		{ from: "session-smart-*", may: "spawn task-mastermind, manager, minion, helper and the rest, except assistants and mastermind" },
		{ from: "mastermind-X", may: "spawn mastermind, minion and helper" },
		{ from: "worker", may: "spawn only minion and helper" }
	]; }
}

export default Policy;
