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
const HEARD = ["task", "landed", "blocked", "error"];
const WORKER = /^(minion|helper|fork)/;
const env = (name, dflt) => Number(process.env[name]) || dflt;
const today = () => new Date().toLocaleDateString("en-CA");

/* THE TWO AGENTS ACROSS ALL CARDS (design: ai/2026-09-24/assistant-layers/doc/design.md).
 *
 * - `master-assistant` (fast tier, medium effort) hears every card at once — each
 *   fresh owner prompt and every task, landing, block or error — batched into at
 *   most one message every 20 seconds, and stays silent unless it earns a line.
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
		const spec = { id, role: "master-assistant", name: "", model: model("fast"), effort: "medium",
			permission_mode: "bypassPermissions", system: this.system("master-assistant.md"),
			allowed_tools: ["mcp__servex__card_reply", "mcp__servex__send_to_agent", "mcp__servex__list_claims"] };
		this.master_day = day;
		agent = started === day && saved.session_id && !agent
			? this.agents.spawn({ ...spec, resume: saved.session_id, cwd: saved.cwd ?? REPO })
			: (this.save("master", { day, session_id: null }), this.agents.spawn({ ...spec, cwd: REPO, prompt: "You are on duty. Answer nothing now." }));
		return this.touch(id, this.remember(agent, "master"));
	}

	mastermind(){
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
	 * stopped; the master and the mastermind are stopped after `idle_ms` of quiet
	 * and resumed on the next message. */
	reaper(){
		this.reap_timer = setInterval(() => this.sweep(), this.reap_every_ms);
		this.reap_timer.unref?.();
	}

	sweep(now = Date.now()){
		for (const agent of [...this.agents.live.values()]){
			if (agent.state !== "idle") continue;
			const worker = WORKER.test(agent.role ?? "") || WORKER.test(agent.id ?? "");
			const global = agent.id === this.master_id || agent.id === this.mastermind_id;
			if (!worker && !global) continue;
			if (worker && !(agent.turns >= 1)) continue;
			if (now - this.last_active(agent, now) <= (worker ? this.reap_ms : this.idle_ms)) continue;
			try { agent.stop(); } catch {}
			if (worker) this.servex.log.append("servex", { type: "reaped", id: agent.id })?.catch?.(() => {});
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

	/* Every card, at once — a little context about everything. */
	listen(tries = 0){
		const cards = this.servex.cards;
		if (!cards?.on){
			if (tries < 30) setTimeout(() => this.listen(tries + 1), 1000).unref?.();
			return;
		}
		cards.on((cardId, line, info = {}) => this.heard(cards.canonical?.(cardId) ?? cardId, line, info));
	}

	heard(card, line = {}, info = {}){
		if (info.fresh && line.prompt) return this.queue(`card ${card}: ${line.prompt.text ?? line.prompt.raw ?? ""}`, "owner");
		const m = line.message;
		if (m && HEARD.includes(m.kind)) this.queue(`card ${card}, ${m.kind} from ${m.by ?? "someone"}: ${m.text ?? ""}`, "servex");
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
