import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { model } from "./tiers.js";
import { brief } from "./brief.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "../..");
const STATE = path.join(process.env.LOCALAPPDATA || "", "lew42", "servex", "layers.json");

/* A card id is a path: `2026/09/24/fix-the-sidebar`, a sub-card deeper. The ROOT
 * card is the first four segments; anything shorter (a day's own page) has none. */
const root_of = id => { const parts = String(id ?? "").split("/"); return parts.length >= 4 ? parts.slice(0, 4).join("/") : null; };
const within = (id, root) => id === root || String(id).startsWith(root + "/");
const json = value => JSON.stringify(value);

/* THE ASSISTANT LAYERS — two agents on every card (design:
 * public/framework/ai/2026-09-24/assistant-layers/doc/design.md).
 *
 * The card's ASSISTANT is fast and small: it hears every owner prompt on its
 * card and turns it into UI. The card's MANAGER is started by the assistant
 * (`ask_manager`) the moment something needs doing, and its session is kept for
 * the card's whole life: stopped when quiet, resumed by its session id, so every
 * earlier request on the card is still in its context.
 *
 * Plain code, no Claude session of its own. Its only memory is one small file,
 * `layers.json`, which says which agent id and session id belong to which card.
 *
 * ⚠ Never `attach` these agents to their card: Cards forwards every new prompt
 * to attached agents, and `heard()` below already delivers it, so each prompt
 * would arrive twice. The context panel reads our state file instead. */
/* The spawn gate's stand-in for a held spawn: no id, `queued: true`, and its
 * state only through `card()`. Nothing else may be read off it. */
export const queued = agent => !!agent && (agent.queued === true || agent.card?.()?.state === "queued");

export default class Layers {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return { file: STATE, repo: REPO, idle_ms: Number(process.env.SERVEX_CARD_IDLE_MS) || 10 * 60 * 1000,
			state: null, touched: new Map(), recycling: new Set(), timer: null, pending: new Map() };
	}

	/* `features` says "this Servex has card agents": the card view shows its agent panel only then. */
	install(){
		this.load(); this.listen(); this.tools(); this.route(); this.watch();
		this.servex.on?.("admitted", (spec, agent) => this.admitted(spec, agent));
		this.wakes();
		this.servex.log?.append?.("features", { card_agents: 1 })?.catch?.(() => {});
		return this;
	}

	// ── state ────────────────────────────────────────────────────────────────

	load(){
		try { this.state = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { this.state = null; }
		this.state ??= {};
		this.state.cards ??= {};
		return this.state;
	}

	save(){
		fs.mkdirSync(path.dirname(this.file), { recursive: true });
		fs.writeFileSync(this.file, JSON.stringify(this.state, null, 2));
	}

	/* Ids are minted ONCE per card, from its last segment; a name already
	 * recorded for a different card takes `-2`, `-3`. */
	record(card){
		const cards = this.state.cards;
		if (cards[card]) return cards[card];
		const taken = new Set(Object.values(cards).flatMap(r => [r.assistant.id, r.manager.id]));
		const base = card.split("/").pop();
		let n = 1, suffix = "";
		while (taken.has(`assistant-${base}${suffix}`) || taken.has(`manager-${base}${suffix}`)) suffix = `-${++n}`;
		cards[card] = {
			assistant: { id: `assistant-${base}${suffix}`, session_id: null, cwd: this.repo },
			manager: { id: `manager-${base}${suffix}`, session_id: null, cwd: this.repo }
		};
		this.save();
		return cards[card];
	}

	/* Which card and role an agent id belongs to — `{card, role, slot}` or null. */
	owner(id){
		if (!id) return null;
		for (const [card, rec] of Object.entries(this.state.cards))
			for (const role of ["assistant", "manager"])
				if (rec[role].id === id) return { card, role, slot: rec[role] };
		return null;
	}

	/* A session id appears on the agent a moment after it starts; copy it into the file. */
	sync(card){
		const rec = this.state.cards[card];
		let changed = false;
		for (const role of ["assistant", "manager"]){
			const sid = this.servex.agents.live.get(rec[role].id)?.session_id;
			if (sid && sid !== rec[role].session_id){ rec[role].session_id = sid; changed = true; }
		}
		if (changed) this.save();
	}

	root(id){ return root_of(this.servex.cards.canonical(id)); }

	live(id){ const a = this.servex.agents.live.get(id); return a && a.state !== "stopped" ? a : null; }

	touch(id){ this.touched.set(id, Date.now()); }

	// ── hearing the owner ────────────────────────────────────────────────────

	/* Dictation arrives in fragments: one spoken thought can land as several
	 * prompt lines a second or two apart, and the assistant used to answer each
	 * one (2026-09-24, card layout-columns). So a card's prompts wait until the
	 * owner has been quiet for SERVEX_PROMPT_QUIET_MS (default 1.5 s), then go out
	 * joined as one. 0 sends each one at once, as before.
	 * ⚠ It was 4 s, and every reply started 4 s late (measured 2026-09-29, card
	 * new-card: prompt logged 00:00:59, the assistant heard it 00:01:03). Since
	 * 2026-09-25 the microphone itself joins a thought into one message before it
	 * sends (ext/Chat/Mic.js, `paragraph_pause_ms`), so this only has to catch the
	 * lines one send writes together — they land in the same second. */
	listen(){
		const quiet = Number(process.env.SERVEX_PROMPT_QUIET_MS ?? 1500);
		const waiting = new Map();   // card → { prompt, texts, timer }
		const flush = card => {
			const w = waiting.get(card); waiting.delete(card);
			if (w) this.heard(card, { ...w.prompt, text: w.texts.join(" "), raw: undefined });
		};
		this.servex.cards.on((id, line, info) => {
			if (!line?.prompt || !info?.fresh) return;
			const card = this.root(id);
			if (!card) return;
			if (!(quiet > 0)) return void this.heard(card, line.prompt);
			const w = waiting.get(card) ?? { prompt: line.prompt, texts: [] };
			w.texts.push(line.prompt.text ?? line.prompt.raw ?? "");
			clearTimeout(w.timer);
			w.timer = setTimeout(() => flush(card), quiet);
			waiting.set(card, w);
		});
	}

	/* A fresh assistant already read the prompt in its first message, so only a
	 * live or resumed one is sent it. A prompt spoken on a sub-card says which. */
	heard(card, prompt){
		const slot = this.record(card).assistant;
		const was = this.live(slot.id);
		const held = this.pending.has(slot.id);
		const agent = this.assistant(card);
		if (!was && !held && (agent.layers_fresh || (queued(agent) && this.pending.get(slot.id)?.fresh))) return agent;
		const on = prompt.on && prompt.on !== card ? `(on ${prompt.on}) ` : "";
		this.deliver(slot.id, on + (prompt.text ?? prompt.raw ?? ""), { from: "owner", reply_to: `card ${card}` });
		this.touch(slot.id);
		return agent;
	}

	// ── the two agents ───────────────────────────────────────────────────────

	spec(card, role){
		const rec = this.record(card);
		if (role === "assistant") return {
			role: "card-assistant", model: model("fast"), effort: "low", permission_mode: "bypassPermissions", urgent: true,
			system: this.system(),
			allowed_tools: ["card_reply", "create_card", "card_set", "add_item", "amend_bubble", "ask_manager", "send_to_agent", "card_summary"].map(t => `mcp__servex__${t}`)
		};
		return { role: "card-manager", model: model("manager"), effort: "medium", permission_mode: "bypassPermissions", parent: rec.assistant.id };
	}

	/* A brief that throws must not stop the assistant starting; it starts without it. */
	system(){
		let screen = "";
		try { screen = brief(this.servex); } catch (e){ screen = `(the one-screen brief failed: ${e.message})`; }
		return fs.readFileSync(path.join(HERE, "card-assistant.md"), "utf8") + "\n\n" + screen;
	}

	/* The live agent, else resume it under its kept id and cwd (held open, idle,
	 * no prompt), else spawn it fresh with `prompt()`. A stopped corpse is cleared
	 * out of `live` first so the id is free to reuse. */
	open(card, role, prompt){
		const slot = this.record(card)[role];
		const live = this.live(slot.id);
		if (live) return live;
		const waiting = this.pending.get(slot.id);
		if (waiting) return waiting.agent;   // already queued at the gate: never a second spawn
		this.servex.agents.live.delete(slot.id);
		if (slot.session_id && !this.session_exists(slot)) this.lost(card, slot);
		const how = slot.session_id ? { resume: slot.session_id } : { prompt: prompt() };
		const spec = { ...this.spec(card, role), id: slot.id, cwd: slot.cwd, ...how };
		const agent = this.servex.agents.spawn(spec);
		if (queued(agent)){
			/* THE SPAWN GATE held it (Servex.admission()): the caller got a stand-in
			 * with no session and no `.send`. Remember it by its spec OBJECT — that
			 * same object comes back on `admitted` — and deliver later words then. */
			this.pending.set(slot.id, { spec: agent.spec ?? spec, agent, card, role, fresh: !how.resume, texts: [] });
			this.log_gate(slot.id, "queued", agent.card?.().reason);
			return agent;
		}
		agent.layers_fresh = !how.resume;   // it read the card's log in its first message: nothing more to send it
		this.touch(slot.id);
		this.sync(card);
		return agent;
	}

	/* The gate started a spec we were holding: the real agent is here now, so the
	 * words that arrived while it waited go to it, oldest first. */
	admitted(spec, agent){
		for (const [id, p] of this.pending){
			if (p.spec !== spec) continue;
			this.pending.delete(id);
			agent.layers_fresh = p.fresh;
			this.log_gate(id, "started");
			for (const { text, note } of p.texts) this.servex.agents.send(id, text, note);
			this.touch(id);
			this.sync(p.card);
			return agent;
		}
		return null;
	}

	log_gate(id, event, reason = null){
		try { this.servex.log?.append?.("servex", { type: "layers", event, id, reason })?.catch?.(() => {}); } catch {}
	}

	/* `Agents.send` to a stopped card agent goes through `wake`, which reopens it
	 * through the gated spawn. For our own ids it goes through `open()` instead,
	 * so a held one is spawned once and its messages wait for `admitted`. */
	wakes(){
		const agents = this.servex.agents, wake = agents.wake?.bind(agents);
		if (!wake) return;
		agents.wake = id => {
			const who = this.owner(id);
			if (!who || this.live(id) || !(who.slot.session_id || this.pending.has(id))) return wake(id);
			const agent = this.open(who.card, who.role, () => "");
			return queued(agent) ? this.door(id) : agent;
		};
	}

	/* A held agent's stand-in, with a `send()` that keeps the words for `admitted`. */
	door(id){
		const p = this.pending.get(id);
		const door = { id, queued: true, card: () => p.agent.card(), send: (text, note) => { p.texts.push({ text, note }); return door; } };
		return door;
	}

	/* Send now, or keep it for when the gate starts this agent. */
	deliver(id, text, note){
		const p = this.pending.get(id);
		if (p) return void p.texts.push({ text, note });
		this.servex.agents.send(id, text, note);
	}

	/* Where the Claude CLI keeps a session: <config>/projects/<cwd, every
	 * non-alphanumeric a dash>/<session id>.jsonl. A resume of a missing file
	 * dies on its first message and takes that message with it. */
	session_file(slot){
		const home = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
		return path.join(home, "projects", String(slot.cwd).replace(/[^a-zA-Z0-9]/g, "-"), slot.session_id + ".jsonl");
	}

	session_exists(slot){ try { return fs.existsSync(this.session_file(slot)); } catch { return true; } }

	/* The session is gone (deleted, or another machine's): say so in the log and
	 * start the same id fresh from the card's log, never throw. */
	lost(card, slot){
		const entry = { type: "layers", event: "session-missing", card, id: slot.id, session_id: slot.session_id,
			file: this.session_file(slot), text: `${slot.id}'s session ${slot.session_id} is gone; starting it fresh from the card's log` };
		try { this.servex.log?.append?.("servex", entry)?.catch?.(() => {}); } catch {}
		slot.session_id = null;
		this.save();
	}

	assistant(card){
		return this.open(card, "assistant", () => this.transcript(card) + "\n\nThe owner's newest words are the last prompt line. Answer them.");
	}

	/* The card's log, from its LAST `summary` line onward when there is one —
	 * that is what a compacted or recycled agent restarts from. */
	transcript(card){
		const lines = this.log_text(card).split("\n");
		const at = lines.findLastIndex(l => { try { return !!JSON.parse(l).summary; } catch { return false; } });
		return (at > 0 ? lines.slice(at) : lines).join("\n");
	}

	/* The card's log as text, read SYNCHRONOUSLY. ⚠ `Cards.transcript()` is async
	 * and `open()` is not, so calling it here handed a fresh agent "[object Promise]"
	 * instead of the log (found by the layers proof, 2026-09-24). A card host with
	 * no `file`/`parse` (the unit test's fake) still answers through `transcript`. */
	log_text(card){
		const cards = this.servex.cards, id = cards.canonical(card);
		if (!id || !cards.file || !cards.parse) return String(cards.transcript(card) ?? "");
		const lines = cards.parse(fs.readFileSync(cards.file(id), "utf8"));
		return `Card ${id} — its whole log, ${lines.length} lines, oldest first:\n` + lines.map(l => JSON.stringify(l)).join("\n");
	}

	/* The door to a card's manager, for the assistant's tool and for code (the
	 * Dispatcher). The first ask spawns it with the card's log; every later ask
	 * is a message into the same, recycled session. */
	ask_manager({ card, text, from = "owner", task }){
		const sub = this.servex.cards.canonical(card) ?? card;
		const root = root_of(sub);
		if (!root) throw new Error(`"${card}" is not a card; a card id has at least four segments`);
		const slot = this.record(root).manager;
		const was = this.live(slot.id), held = this.pending.has(slot.id);
		const request = `Request from ${from} on ${sub}${task ? ` (task ${task})` : ""}: ${text}`;
		const agent = this.open(root, "manager", () => `Load the \`sub-mastermind\` skill. You are ${slot.id}, the manager of card ${root}.`
			+ " Your session is kept for this card's whole life: every later request on this card comes to you, so keep what you learn."
			+ " First call `claim_topic({thing, change, card})`: `thing` is what you will change, as a short noun anyone would use (the site header, policy.js, the AI 2 rail), never the change itself."
			+ " If it is refused, message mastermind-servex instead of starting."
			+ ` Start minions with spawn_agent({parent: "${slot.id}"}). Report on the card with card_reply. Keep your own turns short.\n\n`
			+ this.transcript(root) + "\n\n" + request);
		const note = { from, reply_to: `card ${sub}` };
		if (queued(agent)){
			// a fresh spec already carries this request in its prompt; a resume, or a later ask, is kept for `admitted`
			if (held || !this.pending.get(slot.id)?.fresh) this.deliver(slot.id, request, note);
			this.touch(slot.id);
			return { ok: true, manager: slot.id, state: "queued", reason: agent.card?.().reason ?? null };
		}
		if (was || !agent.layers_fresh) this.servex.agents.send(slot.id, request, note);
		this.touch(slot.id);
		return { ok: true, manager: slot.id, state: agent.state };
	}

	// ── idle stop, recycle, compact ──────────────────────────────────────────

	/* One cheap timer: a working agent is active; a quiet one past the limit
	 * (10 minutes: an idle session holds about 250 MB) is stopped, session id kept, except an assistant whose manager is working;
	 * an agent that called `card_summary` is recycled once its turn has ended. */
	watch(){
		this.timer = setInterval(() => this.sweep(), Math.max(250, Math.min(2000, this.idle_ms / 4)));
		this.timer.unref?.();
	}

	sweep(now = Date.now()){
		for (const [card, rec] of Object.entries(this.state.cards)){
			this.sync(card);
			for (const role of ["assistant", "manager"]){
				const agent = this.live(rec[role].id);
				if (!agent) continue;
				if (agent.state === "working" || agent.state === "starting"){ this.touched.set(agent.id, now); continue; }
				if (this.recycling.has(agent.id)){ this.recycle(agent.id); continue; }
				if (role === "assistant" && this.live(rec.manager.id)?.state === "working") continue;
				if (!this.touched.has(agent.id)) this.touched.set(agent.id, now);
				if (now - this.touched.get(agent.id) >= this.idle_ms) this.stop(agent.id);
			}
		}
	}

	stop(id){
		const who = this.owner(id);
		if (who) this.sync(who.card);
		try { this.servex.agents.stop(id); } catch {}
		return { ok: true };
	}

	/* Stop it and forget its session; its id is kept, and it restarts fresh. */
	recycle(id){
		const who = this.owner(id);
		if (!who) return { ok: false, error: `${id} is not a card agent` };
		this.recycling.delete(id);
		try { if (this.live(id)) this.servex.agents.stop(id); } catch {}
		who.slot.session_id = null;
		this.save();
		return { ok: true };
	}

	/* Our own compaction: the agent logs what matters as a `summary` line, and
	 * `card_summary` marks it for recycling. A stopped agent is resumed first. */
	compact(id){
		const who = this.owner(id);
		if (!who) return { ok: false, error: `${id} is not a card agent` };
		if (!this.live(id) && !who.slot.session_id) return { ok: true, note: "not running and no session: nothing to compact" };
		if (!this.live(id)) this.open(who.card, who.role, () => "");
		this.deliver(id, "Compact now: call card_summary with everything important about this card that is not already in its log:"
			+ " decisions, open questions, and what you were in the middle of. Then stop.", { from: "owner", priority: "next" });
		this.touch(id);
		return { ok: true };
	}

	// ── tools ────────────────────────────────────────────────────────────────

	/* `ctx.caller` is the calling agent's id, stamped by Servex (null from a tab,
	 * which is the owner and may act anywhere). A card agent acts only inside
	 * its own root card. */
	allowed(caller, card){
		if (!caller) return this.root(card);
		const who = this.owner(caller);
		const target = this.servex.cards.canonical(card);
		if (!who || !target || !within(target, who.card)) throw new Error(`${caller} may act only on its own card and its sub-cards, not "${card}"`);
		return who.card;
	}

	tools(){
		const str = { type: "string" };
		const tool = (name, description, properties, required, handler) => this.servex.mcp.tool({ name, description,
			inputSchema: { type: "object", properties, required },
			handler: async (args = {}, ctx = {}) => { try { return json(await handler(args, ctx.caller ?? null)); } catch (e){ return json({ ok: false, error: String(e.message || e) }); } } });

		tool("card_set", "Change a card's type, title, status or tags. Only your own card or one of its sub-cards.",
			{ card: str, type: str, title: str, status: str, tags: { type: "array", items: str } }, ["card"],
			({ card, ...fields }, caller) => {
				this.allowed(caller, card);
				const id = this.servex.cards.canonical(card);
				for (const key of ["type", "title", "status", "tags"]) if (fields[key] !== undefined) this.servex.cards.append(id, { [key]: fields[key] });
				return { ok: true, card: id };
			});

		tool("add_item", "Add one line to the card's outline, or update it: `title` is a short plain name for one thing the owner asked (never a cut-off prompt), `id` a short slug (the same id again updates the line: set `done` true and `proof` to a link when it is delivered). `asked_at` defaults to now. Only your own card or one of its sub-cards.",
			{ card: str, id: str, title: str, asked_at: str, done: { type: "boolean" }, proof: str }, ["card", "id", "title"],
			({ card, id: item, title, asked_at, done, proof }, caller) => {
				this.allowed(caller, card);
				const id = this.servex.cards.canonical(card);
				this.servex.cards.append(id, { item: { id: item, title, asked_at: asked_at ?? new Date().toISOString(), done: !!done, ...(proof ? { proof } : {}) } });
				return { ok: true, card: id };
			});

		tool("amend_bubble", "Amend a chat bubble as a light, lossless cleanup of the owner's raw prompt pieces. `of` = the prompt ids the bubble is merged from; `sections` = one per core concept: `## Title` then a `- [ ] item` checklist (`- [x]` when done or decided), each with the `from` ids it came from; optional `text` = the whole markdown. Nothing is dropped; the raw prompts stay in the log. Only your own card or one of its sub-cards.",
			{ card: str, of: { type: "array", items: str }, text: str,
				sections: { type: "array", items: { type: "object", properties: { text: str, from: { type: "array", items: str } }, required: ["text"] } } }, ["card", "of", "sections"],
			({ card, of, sections, text }, caller) => {
				this.allowed(caller, card);
				const id = this.servex.cards.canonical(card);
				if (!Array.isArray(of) || !of.length) throw new Error("`of` must list at least one prompt id");
				if (!Array.isArray(sections) || !sections.length) throw new Error("`sections` must hold at least one section");
				const raw = new Map();
				for (const l of this.log_text(id).split("\n")) { try { const p = JSON.parse(l).prompt; if (p?.id) raw.set(p.id, String(p.raw ?? p.text ?? "")); } catch {} }
				for (const p of of) if (!raw.has(p)) throw new Error(`"${p}" is not a prompt id on card ${id}`);
				sections.forEach((s, i) => {
					const from = s.from ?? [], body = String(s.text ?? "").trim();
					for (const p of from) if (!of.includes(p)) throw new Error(`section ${i + 1}: "${p}" is in \`from\` but not in \`of\``);
					if (!from.length) {
						if (body.split(/\s+/).filter(Boolean).length >= 8) throw new Error(`section ${i + 1} cites no \`from\` pieces; only a short heading (under 8 words) may`);
						return;
					}
					const size = from.reduce((n, p) => n + raw.get(p).trim().length, 0);
					if (body.length < size * 0.6) throw new Error(`section ${i + 1} is shorter than 60% of its raw pieces (${body.length} of ${size} characters): nothing may be dropped`);
				});
				const curated = text ?? sections.map(s => s.text).join("\n\n");
				this.servex.cards.append(id, { type: "refined", of, sections, text: curated, by: caller ?? "owner", at: new Date().toISOString() });
				return { ok: true, card: id };
			});

		tool("ask_manager", "Hand work to this card's manager. Make a request, question or task sub-card first with create_card, holding the owner's own words, and pass its id as `card`. Pass the path to the card's directory so the manager can read the whole chat, raw words included; your summary may follow, never replace it.",
			{ card: str, text: str }, ["card", "text"],
			({ card, text }, caller) => { this.allowed(caller, card); return this.ask_manager({ card, text, from: caller ?? "owner" }); });

		tool("card_summary", "Write everything important about this card that is not already in its log as one summary line. You are restarted from it once this turn ends.",
			{ text: str }, ["text"],
			({ text }, caller) => {
				const who = this.owner(caller);
				if (!who) throw new Error("card_summary is only for a card's assistant or manager");
				this.servex.cards.append(who.card, { summary: { by: caller, text } });
				this.recycling.add(caller);
				return { ok: true, card: who.card };
			});
	}

	// ── routes ───────────────────────────────────────────────────────────────

	route(){
		const router = this.servex.dashboard?.router;
		if (!router) return;
		const cors = (req, res, next) => {
			res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" });
			next();
		};
		router.get("/api/card-agents", cors, (req, res) => res.json(this.agents_of(req.query.card)));
		router.options("/api/agent/:id/:verb", cors, (req, res) => res.status(204).end());
		for (const verb of ["compact", "recycle"])
			router.post(`/api/agent/:id/${verb}`, cors, (req, res) => {
				try { const out = this[verb](req.params.id); res.status(out.ok ? 200 : 404).json(out); }
				catch (e){ res.status(500).json({ ok: false, error: String(e.message || e) }); }
			});
	}

	/* What each of a card's agents holds: tokens in context and the share of its window. */
	agents_of(card){
		const root = card && this.root(card);
		const rec = root && this.state.cards[root];
		if (!rec) return [];
		this.sync(root);
		return ["assistant", "manager"].map(role => {
			const slot = rec[role], a = this.servex.agents.live.get(slot.id);
			const model_id = a?.model ?? null, context = a?.context ?? null;
			const window = String(model_id).includes("[1m]") ? 1000000 : 200000;
			return { id: slot.id, role, state: a?.state ?? (slot.session_id ? "stopped" : "none"), model: model_id,
				session_id: slot.session_id, context, window, pct: context == null ? null : Math.round(100 * context / window) };
		});
	}
}
