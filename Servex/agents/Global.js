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
import { STANDING } from "./Agents.js";
import { execFile } from "child_process";

/* Every claude.exe: pid, working set in MB, command line. [] when PowerShell fails. */
export function claude_processes(){
	const ps = "Get-CimInstance Win32_Process -Filter \"Name='claude.exe'\" | ForEach-Object { [pscustomobject]@{ pid = $_.ProcessId; mb = [math]::Round($_.WorkingSetSize / 1MB); cmd = $_.CommandLine } } | ConvertTo-Json -Compress";
	return new Promise(resolve => execFile("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { windowsHide: true, timeout: 20000, maxBuffer: 8 << 20 },
		(err, out) => { try { const j = JSON.parse(out || "[]"); resolve((Array.isArray(j) ? j : [j]).map(r => ({ ...r, cmd: String(r.cmd ?? "") }))); } catch { resolve([]); } }));
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* The repo Servex runs from — the main tree, C:/Code/lew42/monorepo, in normal use.
 * A resume must run in the session's ORIGINAL cwd, and mastermind-servex was made there. */
const REPO = path.join(HERE, "../..");
/* Only a direct child's landing, block or error reaches the root assistant now
 * (D3, doc/page-roles.md) — "task" (a queued-state change) is noise at this
 * level and is dropped; a deeper page's own assistant hears its own "task". */
const HEARD = ["landed", "blocked", "error"];
/* The front desk's roles: their spawns are never held by the working cap. */
const DESK = /^(assistant|manager|master-assistant|page-|session|helper)/;
/* THE DEFAULT `dormant_after` BY ROLE (process-monitor, "dormant the moment a turn ends",
 * revised 2026-10-01 16:20). The voice session's own pair stays warm for its whole session —
 * autosend means many small replies, and exiting after each one would restart the process
 * constantly. One-off workers sleep the moment their turn ends: a resume is "a few seconds"
 * and they mostly wait on a child or the owner anyway. Every OTHER role (a manager, an
 * assistant, mastermind-servex, master-assistant, dispatcher) keeps the plain `dormant_ms`
 * timer, below, which the tight-RAM rule (ask 2) still shortens when memory is scarce. */
const SESSION_ROLE = /^session-(fast|smart)$/;
const ONE_SHOT_ROLE = /^(minion|reviewer|task-mastermind)$/;
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
			dormant_ms: env("SERVEX_DORMANT_MS", 180000), reap_every_ms: env("SERVEX_REAP_EVERY_MS", 60000),
			// ask 2 (the RAM squeeze): under this much free RAM, the normal 3-minute dormant timer
			// shortens to 30 s — a dormant agent holds no process, and a resume is cheap.
			tight_mb: env("SERVEX_TIGHT_MB", 6144), dormant_tight_ms: env("SERVEX_DORMANT_TIGHT_MS", 30000), tight: false,
			// ask 2b: what `dormant_after: 0` actually waits. MEASURED 2026-10-01 (two cold
			// resumes, a ~82k-token and a ~215k-token session, both three days stale so past any
			// cache TTL): `time_to_request_ms` (process start + session load — the part that is
			// actually SPECIFIC to being cold, versus already warm) was 139-149 ms either way, well
			// under the "about 3 s" line, so 0 stays a true instant exit by default. (`ttft_ms` /
			// `first_content_frame_ms`, time to the first actual token, was 3.0-3.4 s both times —
			// but that is ordinary first-token API latency, paid on ANY turn whether the process
			// was dormant or already running, not a cost of exiting between turns.) If a later,
			// more direct measurement of resume overhead alone ever crosses 3 s, raise this.
			// Detail and the raw numbers: doc/dormant.md.
			grace_ms: env("SERVEX_DORMANT_GRACE_MS", 0), dormant_freed_mb: 0,
			measure_every_ms: env("SERVEX_MEASURE_EVERY_MS", 5 * 60000), last_measure: 0, cap: env("SERVEX_AGENT_CAP", 30), min_free_mb: env("SERVEX_MIN_FREE_MB", 4096),
			pending: [], timer: null, last_sent: 0, touched: new Map(), idle_seen: new Map(), ready: null };
	}

	install(){
		this.claims(); this.tools(); this.policy(); this.route(); this.listen(); this.revive(); this.check(); this.reaper();
		this.servex.on?.("admitted", (spec, agent) => this.admitted(spec, agent));
		this.ready = this.load_focus().then(() => { if (!process.env.SERVEX_NO_ASSISTANT) this.boot(); });
		return this;
	}

	get agents(){ return this.servex.agents; }

	// `on`: a claim taken or released writes the module's coordinator line (inbox.js).
	claims(){ return this.servex.claims ??= new Claims({ agents: this.agents, on: (event, row) => this.servex.inbox?.coordinator(event, row) }); }

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
		const master_tools = ["card_reply", "send_to_agent", "list_claims", "page_reply", "ask_manager", "list_cards", "list_agents"].map(t => `mcp__servex__${t}`);
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
			if (row?.session_id){
				const no = this.agents.blocked?.(row);   // the revive guard (Agents.blocked): stopped on purpose, or its cwd is gone
				if (no) throw new Error(`${h} was not woken: ${no.text}.`);
				return this.touch(h, this.agents.reopen(row));
			}
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

	/* THE DORMANCY SWEEP — every minute (dormant-idle, 2026-09-30; it replaces the
	 * idle reaper of node-reliability, which STOPPED idle agents on three clocks).
	 * EVERY agent, whatever its role, idle past ITS OWN wait (`wait_ms`, below) goes
	 * DORMANT (`Agent.sleep`): its claude process exits, its object, id and session
	 * stay, and the next message resumes it in place. Because a dormant agent is not
	 * stopped, the heartbeat never reads it as a death, so the old 15-minute
	 * exceptions (no-child task masterminds, the two global agents) are gone.
	 * Kept awake: an agent with a live background task (`Agent.sleep` itself refuses
	 * that), or one whose own child is still working or starting (`has_working_child`
	 * — a reply is likely imminent, and sleeping now would just add resume latency to
	 * delivering it). Every `measure_every_ms` it also reads each claude.exe's memory
	 * (`measure`), and an idle one past `compact_mb` compacts. */
	reaper(){
		this.reap_timer = setInterval(() => this.sweep(), this.reap_every_ms);
		this.reap_timer.unref?.();
		/* A turn ending frees a working slot: drain the spawn queue at once, not on the next
		 * monitor tick. It is ALSO the moment a one-off agent (`dormant_after: 0`) should go
		 * dormant — "act when the turn ends", not wait up to a minute for the next sweep(). */
		const reg = this.agents.register?.bind(this.agents);
		if (reg) this.agents.register = agent => {
			const row = reg(agent);
			if (agent.state !== "working" && agent.state !== "starting") this.kick();
			if (agent.state === "idle") this.maybe_sleep(agent);
			return row;
		};
	}

	kick(){
		if (this.kicked || !this.servex.queue?.length) return;
		this.kicked = setImmediate(() => { this.kicked = null; try { this.servex.drain?.(); } catch {} });
	}

	/* THE DEFAULT `dormant_after` FOR A ROLE that never had one set at spawn: "session" (never
	 * auto-sleep) for the voice pair, 0 (sleep the moment the turn ends) for one-off workers,
	 * `null` for everyone else (the plain `dormant_ms`/tight-RAM timer, in `wait_ms`). An
	 * explicit `agent.dormant_after` from `spawn_agent` or `send_to_agent` always wins over this. */
	default_after(role = ""){
		if (SESSION_ROLE.test(role)) return "session";
		if (ONE_SHOT_ROLE.test(role)) return 0;
		return null;
	}

	/* How long this ONE agent waits, idle, before it goes dormant. `Infinity` means never
	 * (the voice pair, for its whole session). A number of SECONDS from `dormant_after` becomes
	 * ms here; `0` resolves to `grace_ms` (0 by default — see `grace_ms` above for why that
	 * stayed 0, and when to raise it) rather than being read as literal zero everywhere, so one
	 * env var can add a grace period to EVERY zero-wait role at once if a future measurement
	 * ever calls for it. */
	wait_ms(agent){
		const after = agent.dormant_after ?? this.default_after(agent.role ?? "");
		if (after === "session") return Infinity;
		if (typeof after === "number") return after > 0 ? after * 1000 : this.grace_ms;
		return this.tight ? this.dormant_tight_ms : this.dormant_ms;
	}

	/* Free RAM crossing `tight_mb` flips global dormancy into the fast 30-second timer for
	 * every role that uses it (ask 2) — logged once on each flip, never every tick. No reading
	 * yet from the process monitor (`servex.procmon.now`, owned by a sibling module) just
	 * keeps the normal timer: "if the monitor has no reading yet, keep the normal timer." */
	check_tight(){
		const free = this.servex?.procmon?.now?.free_mb;
		const tight = typeof free === "number" && free < this.tight_mb;
		if (tight === this.tight) return;
		this.tight = tight;
		this.servex.log?.append("servex", { type: "dormant-tight", tight, free_mb: free ?? null, tight_mb: this.tight_mb })?.catch?.(() => {});
	}

	/* A live child, of this agent, still working or just starting: sleeping the PARENT right
	 * now would only add a resume delay to delivering the child's report a moment later. */
	has_working_child(id){
		for (const a of this.agents.live.values()) if (a.parent === id && (a.state === "working" || a.state === "starting")) return true;
		return false;
	}

	/* The one check both `sweep()` (every minute, every agent) and the `register` hook (the
	 * instant one agent goes idle) run. Never sleeps a working/starting agent (`agent.sleep`
	 * itself also refuses a live background task), one with a live child, or the voice pair
	 * mid-session (`wait_ms` returns `Infinity` for those). */
	maybe_sleep(agent, now = Date.now()){
		if (agent.state !== "idle" || typeof agent.sleep !== "function") return false;
		if (this.has_working_child(agent.id)) return false;
		const wait = this.wait_ms(agent);
		if (wait === Infinity) return false;
		if (wait > 0 && now - this.last_active(agent, now) <= wait) return false;
		if (!agent.sleep("idle")) return false;
		this.mark_slept(agent, wait);
		return true;
	}

	/* One log line per agent put to sleep, naming how long it waited; the RAM it was last
	 * measured holding (`agent.rss_mb`, set by `measure()`) is summed into `dormant_freed_mb`
	 * for `summary()`, so the monitor can show today's running total. */
	mark_slept(agent, wait){
		this.dormant_freed_mb += agent.rss_mb ?? 0;
		this.servex.log.append("servex", { type: "dormant", id: agent.id, role: agent.role ?? null, context: agent.context ?? null, after: wait, freed_mb: agent.rss_mb ?? null })?.catch?.(() => {});
	}

	/* What the process monitor shows for dormancy: RAM saved so far today, and the two
	 * thresholds in play (tight-RAM state included, since it changes the plain-role timer). */
	summary(){
		return { dormant_freed_mb: Math.round(this.dormant_freed_mb), tight: this.tight, dormant_ms: this.dormant_ms, dormant_tight_ms: this.dormant_tight_ms, grace_ms: this.grace_ms };
	}

	sweep(now = Date.now()){
		this.check_tight();
		for (const agent of [...this.agents.live.values()]) this.maybe_sleep(agent, now);
		for (const key of this.idle_seen.keys()) if (!this.agents.live.get(key.split(":")[0])) this.idle_seen.delete(key);
		if (now - this.last_measure >= this.measure_every_ms){ this.last_measure = now; this.measure().catch(() => {}); }
	}

	/* MEMORY PER AGENT: every claude.exe's working set, matched to an agent by the
	 * session id on its command line (`--resume=<id>` or `--session-id <id>`).
	 * Sets `agent.rss_mb`; an IDLE agent past `compact_mb` compacts now, a working
	 * one at the end of its turn (Agent.oversized). About 1 s of PowerShell. */
	async measure(){
		const rows = await claude_processes();
		const by = new Map();
		for (const r of rows){ const sid = r.cmd.match(/--(?:resume|session-id)[= ]"?([0-9a-f-]{36})/i)?.[1]; if (sid) by.set(sid, Math.max(by.get(sid) ?? 0, r.mb)); }
		for (const agent of this.agents.live.values()){
			if (!agent.session_id || !by.has(agent.session_id)) continue;
			agent.rss_mb = by.get(agent.session_id);
			if (agent.state === "idle" && agent.oversized?.() === "memory") agent.compact("memory");
		}
		return by;
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
		/* THE WORKING CAP (Agents.working). A resume is a wake that must deliver its
		 * message, and the front desk answers the owner: neither is held by it. */
		const wake = !!spec.resume && !spec.fork, desk = DESK.test(spec.role ?? "") || STANDING.test(spec.id ?? "");
		if (!wake && !desk && this.agents.working){
			const working = this.agents.working().length, cap = this.agents.working_cap;
			if (working >= cap) return `working ${working}/${cap}: waits for a working agent to end its turn`;
		}
		const live = [...this.agents.live.values()].filter(a => a.state !== "stopped" && a.state !== "dormant").length;   // a dormant agent holds no process
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
