import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { place } from "../home.js";
import Registry from "./registry.js";
import { Claims } from "./claims.js";
import { page_tools } from "../pages.js";
import { brief, remember_focus } from "./brief.js";
import { model } from "./tiers.js";
import { Policy } from "./policy.js";
import { queued } from "./Layers.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* The repo Servex runs from — the main tree, C:/Code/lew42/monorepo, in normal use.
 * A resume must run in the session's ORIGINAL cwd, and mastermind-servex was made there. */
const REPO = path.join(HERE, "../..");
/* Only a direct child's landing, block or error reaches the root assistant now
 * (D3, doc/page-roles.md) — "task" (a queued-state change) is noise at this
 * level and is dropped; a deeper page's own assistant hears its own "task". */
const HEARD = ["landed", "blocked", "error"];
/* Reaped 3 min after their last turn: EVERY agent that is not one of the long-lived kinds below, so a new one-shot role (voter, clarity, reviewer, …) is covered without being listed. `page-` covers the recursive-pairs role words (page-assistant, page-mastermind); their ids already start with assistant-/manager-. */
const LONG = /^(assistant|manager|master-assistant|mastermind|task-mastermind|dispatcher|page-)/;
const is_worker = agent => !LONG.test(agent.role ?? "") && !LONG.test(agent.id ?? "");
const TASK_MASTERMIND = /^task-mastermind-/;
const env = (name, dflt) => Number(process.env[name]) || dflt;
const today = () => new Date().toLocaleDateString("en-CA");

/* THE TWO ROOT AGENTS (design: ai/2026-09-24/assistant-layers/doc/design.md;
 * narrowed 2026-09-25/28 by the recursive-pairs work, doc/page-roles.md).
 *
 * - `master-assistant` (architect tier, medium effort) is the root page's own
 *   assistant: a send to the page `/` reaches it straight from Layers.js
 *   (ROOT_ASSISTANT), and Layers never spawns a second one. It no longer hears
 *   every card: only the owner's page-less prompts (`page_less()`) and a
 *   landing, block or error from a DIRECT CHILD of the root (`direct_child()`)
 *   are batched to it, at most one message every 20 seconds, and it stays
 *   silent unless it earns a line. Every other page has its own assistant
 *   hearing its own prompts (Layers.js).
 * - `mastermind-servex` (architect tier) is the persistent systems architect. It
 *   already exists; Global never makes a second one. It is resumed under the same
 *   id from its recorded session, and spawned fresh only when there is none.
 *
 * Neither launches anything. Global also owns the claims list and its tools,
 * `set_focus`, and the policy's refusal log and `/api/policy` page. */
export default class Global {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return { servex: null, master_id: "master-assistant", mastermind_id: "mastermind-servex",
			batch_ms: Number(process.env.SERVEX_MASTER_BATCH_MS) || 20000,
			idle_ms: env("SERVEX_GLOBAL_IDLE_MS", 15 * 60000), reap_every_ms: env("SERVEX_REAP_EVERY_MS", 60000),
			reap_ms: env("SERVEX_REAP_MS", 180000), cap: env("SERVEX_AGENT_CAP", 30), min_free_mb: env("SERVEX_MIN_FREE_MB", 4096),
			pending: [], timer: null, last_sent: 0, touched: new Map(), idle_seen: new Map(), ready: null };
	}

	install(){
		this.claims(); this.tools(); this.policy(); this.route(); this.listen(); this.revive(); this.check(); this.reaper();
		this.servex.on?.("admitted", (spec, agent) => this.admitted(spec, agent));
		this.ready = this.load_focus().then(() => { if (!process.env.SERVEX_NO_ASSISTANT) this.boot(); });
		return this;
	}

	get agents(){ return this.servex.agents; }

	claims(){ return this.servex.claims ??= new Claims({ agents: this.agents }); }

	boot(){
		try { this.master(); } catch (e){ this.say(`master assistant could not start: ${e.message || e}`); }
		try { this.mastermind(); } catch (e){ this.say(`mastermind-servex could not start: ${e.message || e}`); }
	}

	say(text){ this.servex.say?.(text); }

	/* `global.json` keeps mastermind-servex's session id and cwd across restarts. */
	file(){ return this.state_file ??= place("global.json"); }
	state(){ try { return JSON.parse(fs.readFileSync(this.file(), "utf8")); } catch { return {}; } }
	save(key, value){
		const all = this.state();
		all[key] = { ...all[key], ...value };
		try { fs.writeFileSync(this.file(), JSON.stringify(all, null, 2)); } catch {}
	}

	registry_row(id){
		try { return (this.agents.reg?.() ?? new Registry()).read()[id] ?? null; } catch { return null; }
	}

	/* A live, non-stopped agent under `id`, or null. A stopped one is cleared out
	 * of `live` so the next spawn keeps the exact id instead of drifting to `-2`. */
	live(id){
		const a = this.agents.live.get(id);
		if (a && a.state !== "stopped") return a;
		this.agents.live.delete(id);
		return null;
	}

	/* The session id is only known after the SDK's first `system/init`, so it is
	 * recorded from there. */
	remember(agent, key){
		const save = () => agent.session_id && this.save(key, { session_id: agent.session_id, cwd: agent.cwd ?? REPO });
		const began = agent.began?.bind(agent);
		if (began) agent.began = message => { began(message); save(); };
		save();
		return agent;
	}

	system(file){ return fs.readFileSync(path.join(HERE, file), "utf8") + "\n\n" + brief(this.servex); }

	/* Fresh once a day; between times, stopped when idle and resumed by its
	 * session id (kept in global.json with the day it started). */
	master(){
		const id = this.master_id, day = today();
		const saved = this.state().master ?? {};
		const started = saved.day ?? this.master_day;   // in memory too, in case global.json cannot be written
		let agent = this.live(id);
		if (agent && started === day) return this.touch(id, agent);
		if (agent){ try { agent.stop(); } catch {} this.agents.live.delete(id); }   // a new day: recycled
		const master_tools = ["card_reply", "send_to_agent", "list_claims", "page_reply", "ask_manager"].map(t => `mcp__servex__${t}`);
		const spec = { id, role: "master-assistant", name: "", model: model("architect"), effort: "medium",
			permission_mode: "bypassPermissions", system: this.system("master-assistant.md"),
			/* page_reply and ask_manager: it is also the page `/`'s assistant (Layers.js ROOT_ASSISTANT). */
			allowed_tools: master_tools,
			/* LEAN, like a page assistant (Layers.spec): no settings files, no claude.ai connectors,
			 * no auto-memory, no built-in tools (it reads no files), and every other Servex tool
			 * denied so its schema is not sent. Measured 2026-09-29 (fix/proof.txt): it began
			 * at about 52k tokens without these. */
			setting_sources: [], env: { ENABLE_CLAUDEAI_MCP_SERVERS: "false", CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" },
			sdk: { tools: [], disallowedTools: (this.servex.mcp?.tools ?? []).map(t => `mcp__servex__${t.name}`).filter(t => !master_tools.includes(t)) } };
		this.master_day = day;
		agent = started === day && saved.session_id && !agent
			? this.agents.spawn({ ...spec, resume: saved.session_id, cwd: saved.cwd ?? REPO })
			: (this.save("master", { day, session_id: null }), this.agents.spawn({ ...spec, cwd: REPO, prompt: "You are on duty. Answer nothing now." }));
		return this.touch(id, this.remember(agent, "master"));
	}

	/* THE HOLDER. "mastermind-servex" is a role: when the owner starts a fresh
	 * session for it as mastermind-servex-N (the old one stood down at a full
	 * context), the highest N in the registry holds it, and a boot or a wake
	 * resumes THAT session, never the retired one. */
	holder(){
		const n = id => +(/^mastermind-servex-(\d+)$/.exec(id)?.[1] ?? -1);
		let ids = [...this.agents.live.keys()];
		try { ids = ids.concat(Object.keys((this.agents.reg?.() ?? new Registry()).read())); } catch {}
		return ids.filter(id => n(id) >= 0).sort((x, y) => n(y) - n(x))[0] ?? this.mastermind_id;
	}

	mastermind(){
		const h = this.holder();
		if (h !== this.mastermind_id){
			const live = this.live(h);
			if (live) return live;
			const row = this.registry_row(h);
			if (row?.session_id) return this.touch(h, this.agents.reopen(row));
		}
		const id = this.mastermind_id;
		const live = this.live(id);
		if (live) return live;
		if (this.held) return this.held.agent;   // already waiting at the spawn gate: never a second spawn
		const row = this.registry_row(id), saved = this.state().mastermind ?? {};
		const sid = row?.session_id ?? saved.session_id ?? null;
		const tools = ["list_agents", "send_to_agent", "card_reply", "append_log", "claim_topic", "release_topic",
			"list_claims", "set_focus", "fork_self", "start_job"].map(t => `mcp__servex__${t}`);
		const spec = { id, role: "mastermind", name: "servex", model: model("architect"), effort: "medium",
			permission_mode: "bypassPermissions", system: this.system("mastermind-servex.md"),
			allowed_tools: ["Read", "Grep", "Glob", ...tools] };
		const full = sid ? { ...spec, resume: sid, cwd: row?.cwd ?? saved.cwd ?? REPO } : { ...spec, cwd: REPO, prompt: "You are on duty. Answer nothing now." };
		const agent = this.agents.spawn(full);
		if (queued(agent)){
			/* THE SPAWN GATE held it: a stand-in with no session and no `.send`.
			 * Kept by its spec OBJECT, which `admitted` hands back; messages wait. */
			this.held = { spec: agent.spec ?? full, agent, texts: [] };
			this.say(`mastermind-servex is queued at the spawn gate: ${agent.card?.().reason ?? "no reason given"}`);
			return agent;
		}
		return this.touch(id, this.remember(agent, "mastermind"));
	}

	/* The gate started the held mastermind-servex: remember its session and hand
	 * it what was said to it while it waited, oldest first. */
	admitted(spec, agent){
		if (!this.held || this.held.spec !== spec) return null;
		const { texts } = this.held;
		this.held = null;
		this.touch(this.mastermind_id, this.remember(agent, "mastermind"));
		for (const { text, note } of texts) this.agents.send(this.mastermind_id, text, note);
		return agent;
	}

	/* What `Agents.send` gets back for a held mastermind-servex: `send()` keeps the
	 * message for `admitted`, `card()` is the stand-in's own (queued, reason). */
	door(){
		const held = this.held;
		const door = { id: this.mastermind_id, queued: true, card: () => held.agent.card(),
			send: (text, note) => { held.texts.push({ text, note }); return door; } };
		return door;
	}

	touch(id, agent){ this.touched.set(id, Date.now()); return agent; }

	/* A message to a stopped master or mastermind wakes it: `agents.get` is what
	 * `send_to_agent` goes through, so the two ids resume there, by session id. */
	revive(){
		const agents = this.agents, get = agents.get?.bind(agents), wake = agents.wake?.bind(agents);
		if (!get) return;
		/* `Agents.send` to a stopped agent goes through `wake`, and `wake` reopens it
		 * through the gated spawn: routed here instead, so a held mastermind-servex
		 * is spawned once and its messages wait instead of hitting a stand-in. */
		const ours = id => {
			if (process.env.SERVEX_NO_ASSISTANT || this.live(id)) return null;
			if (id === this.master_id) return this.master();
			if (id === this.mastermind_id){ const a = this.mastermind(); return queued(a) ? this.door() : a; }
			return null;
		};
		agents.get = id => ours(id) ?? get(id);
		if (wake) agents.wake = id => ours(id) ?? wake(id);
	}

	/* Last sign of life: what Agents.js keeps is the agent's own log file, written
	 * on every event, so its mtime is the time; our own touch and the first time
	 * we saw it idle are the fallbacks. */
	last_active(agent, now = Date.now()){
		let t = Math.max(agent.last_at ? Date.parse(agent.last_at) || 0 : 0, this.touched.get(agent.id) ?? 0);
		try { t = Math.max(t, fs.statSync(agent.file()).mtimeMs); } catch {}
		const key = `${agent.id}:${agent.turns}`;
		if (!this.idle_seen.has(key)) this.idle_seen.set(key, now);
		return Math.max(t, t ? 0 : this.idle_seen.get(key));
	}

	/* THE REAPER — every minute: an idle minion, helper or fork that has
	 * finished a turn (its parent was woken then) and sat idle past `reap_ms` is
	 * stopped; the master, the mastermind, AND any idle `task-mastermind-*` (D5,
	 * 2026-09-25/28: the same 15-minute rule, not just the two global agents) are
	 * stopped after `idle_ms` of quiet. All of them resume on the next message —
	 * that wake is generic (`Agents.wake`/`reopen`, by session id), not special
	 * to the two ids this file spawns itself. */
	reaper(){
		this.reap_timer = setInterval(() => this.sweep(), this.reap_every_ms);
		this.reap_timer.unref?.();
	}

	sweep(now = Date.now()){
		for (const agent of [...this.agents.live.values()]){
			if (agent.state !== "idle") continue;
			const worker = is_worker(agent);
			const global = agent.id === this.master_id || agent.id === this.mastermind_id || /^mastermind-servex-\d+$/.test(agent.id ?? "");   // 15 min idle; a message wakes them
			const task_mastermind = !global && TASK_MASTERMIND.test(agent.id ?? "");   // D5: the same 15 minutes, and its reap is logged
			if (!worker && !global && !task_mastermind) continue;
			if (worker && !(agent.turns >= 1)) continue;
			if (now - this.last_active(agent, now) <= (worker ? this.reap_ms : this.idle_ms)) continue;
			try { agent.stop(); } catch {}
			if (worker || task_mastermind) this.servex.log.append("servex", { type: "reaped", id: agent.id })?.catch?.(() => {});
		}
		for (const key of this.idle_seen.keys()) if (!this.agents.live.get(key.split(":")[0])) this.idle_seen.delete(key);
	}

	/* THE ADMISSION CHECK, when Servex has one (`servex.checks`): free memory
	 * first, always; then a ceiling on live agents that a child of a live parent
	 * skips, so parents waiting on their children can never starve. */
	check(){
		const checks = this.servex.checks;
		if (!Array.isArray(checks)) return;
		checks.push(spec => this.admit(spec));
	}

	admit(spec = {}, free_mb = os.freemem() / 1048576){
		if (free_mb < this.min_free_mb) return `only ${Math.round(free_mb)} MB of memory is free; waiting for ${this.min_free_mb} MB`;
		const live = [...this.agents.live.values()].filter(a => a.state !== "stopped").length;
		const parent = spec.parent && this.agents.live.get(spec.parent);
		if (live >= this.cap && !(parent && parent.state !== "stopped")) return `${live} agents are running, the ceiling is ${this.cap}`;
		return null;
	}

	/* THE EVERY-CARD FEED IS GONE (D3, 2026-09-25/28, doc/page-roles.md). Every
	 * page now has its own assistant hearing its own fresh prompts (Layers.js),
	 * so the root has no reason to hear them a second time — this class only
	 * still listens for what a DIRECT CHILD of the root reports: a landing, a
	 * block, or an error. Everything about a page deeper than that is read on
	 * demand (`list_cards`, `list_agents`), never pushed here. */
	listen(tries = 0){
		const cards = this.servex.cards;
		if (!cards?.on){
			if (tries < 30) setTimeout(() => this.listen(tries + 1), 1000).unref?.();
			return;
		}
		cards.on((cardId, line, info = {}) => this.heard(cards.canonical?.(cardId) ?? cardId, line, info));
	}

	/* A direct child of the root pair: spawned by the Dispatcher (today's
	 * `task-mastermind`s, `parent: "dispatcher"`), by `mastermind-servex`, or by
	 * `master-assistant` itself. A grandchild's own report is for its own
	 * page's assistant to hear, not the root's — this is what makes the feed
	 * "direct children only" instead of "every card" again by another name. */
	direct_child(id){
		const parent = this.agents.live?.get(id)?.parent;
		if (parent === "dispatcher" || parent === this.mastermind_id || parent === this.master_id) return true;
		return this.top_manager(id);
	}

	/* A top-level page's or a card's manager (`manager-<card>`, `manager-framework`):
	 * spawned by its own assistant, so its live parent says nothing about the tree —
	 * but its layers.json `parent` is the root's manager. A deeper page's manager
	 * (`manager-dictate`, parent `manager-ux`) is not a direct child. */
	top_manager(id){
		const layers = this.servex.layers, who = layers?.owner?.(id);
		if (!who || who.role !== "manager" || who.card === "/") return false;
		const root = layers.state?.cards?.["/"];
		const parent = layers.state.cards[who.card]?.parent;
		return !!parent && (parent === root?.manager?.id || parent === this.master_id);
	}

	/* A PAGE-LESS PROMPT: a fresh owner prompt on a card no page pair hears —
	 * Layers keys a pair on a root card (four path segments), so a shorter id (a
	 * day's own page, a lobby group card) reaches nobody else. With Layers off,
	 * every prompt is page-less. This is the one part of the old every-card feed
	 * that is kept (recursive-pairs fix, 2026-09-29). A send to the page `/`
	 * reaches master-assistant straight from Layers, not through here. */
	page_less(card){
		const layers = this.servex.layers;
		if (!layers?.root) return true;
		try { return !layers.root(card); } catch { return true; }
	}

	heard(card, line = {}, info = {}){
		if (info.fresh && line.prompt && this.page_less(card)) return this.queue(`card ${card}: ${line.prompt.text ?? line.prompt.raw ?? ""}`, "owner");
		const m = line.message;
		if (m && HEARD.includes(m.kind) && this.direct_child(m.by)) this.queue(`card ${card}, ${m.kind} from ${m.by ?? "someone"}: ${m.text ?? ""}`, "servex");
	}

	/* At most one message every `batch_ms`: what arrives meanwhile rides in the next one. */
	queue(text, from){
		this.pending.push({ text: String(text).replace(/\s+/g, " ").trim(), from });
		if (this.timer) return;
		const wait = Math.max(0, this.last_sent + this.batch_ms - Date.now());
		this.timer = setTimeout(() => this.flush(), wait);
		this.timer.unref?.();
	}

	flush(){
		this.timer = null;
		const items = this.pending.splice(0);
		if (!items.length || process.env.SERVEX_NO_ASSISTANT) return;
		this.last_sent = Date.now();
		const from = items.some(i => i.from === "owner") ? "owner" : "servex";
		try { this.master().send(items.map(i => i.text).join("\n"), { from, reply_to: null }); }
		catch (e){ this.say(`master assistant could not hear the cards: ${e.message || e}`); }
	}

	async load_focus(){
		try {
			const rows = await this.servex.log.tail("servex", 300);
			const last = rows.filter(r => r.type === "focus").pop();
			if (last) remember_focus(last.text);
		} catch {}
	}

	tools(){
		for (const tool of this.claims().tools()) this.servex.mcp.tool(tool.name === "claim_topic" ? this.logged(tool) : tool);
		for (const tool of page_tools()) this.servex.mcp.tool(tool);
		this.servex.mcp.tool({
			name: "set_focus",
			description: "Write today's focus: one plain sentence every agent sees in its one-screen brief.",
			inputSchema: { type: "object", required: ["text"], properties: { text: { type: "string" } } },
			handler: async (args = {}, ctx) => {
				if (!args.text) return JSON.stringify({ ok: false, why: "text is required" });
				const out = await this.servex.log.append("servex", { type: "focus", by: ctx?.caller ?? "owner", text: args.text });
				remember_focus(args.text);
				return JSON.stringify({ ok: out?.ok !== false });
			}
		});
	}

	/* A refused claim is a collision between two cards: it goes in the `policy`
	 * log beside refused messages, so it is seen by more than the one caller. */
	logged(tool){
		return { ...tool, handler: async (args = {}, ctx) => {
			const out = await tool.handler(args, ctx);
			try {
				const r = JSON.parse(out);
				if (r && r.ok === false && r.holder) this.servex.log.append("policy", { at: new Date().toISOString(), from: ctx?.caller ?? "owner",
					to: `claim ${args.thing ?? args.topic}`, holder: r.holder, card: args.card ?? null, why: r.why })?.catch?.(() => {});
			} catch {}
			return out;
		} };
	}

	/* Every refused message is logged, and the live rules are one GET away. */
	policy(){
		/* ⚠ Global installs BEFORE Servex.tools() runs tools.js, which is what used to
		 * create `agents.policy` — so the hook landed on nothing and no refused message
		 * was ever logged (layers proof, 2026-09-24). Create it here; tools.js's `??=`
		 * then keeps this same object. */
		const p = this.agents && (this.agents.policy ??= new Policy({ agents: this.agents }));
		if (p) p.onrefuse = e => this.servex.log.append("policy", e)?.catch?.(() => {});
	}

	route(){
		const router = this.servex.dashboard?.router;
		if (!router) return;
		const cors = (req, res, next) => {
			res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" });
			next();
		};
		router.get("/api/policy", cors, (req, res) => {
			const p = this.agents.policy;
			res.json({ rules: p?.rules?.() ?? [], refused: p?.refused ?? [] });
		});
	}
}
