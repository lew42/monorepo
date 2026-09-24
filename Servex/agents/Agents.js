import { query, getSessionInfo, getSessionMessages } from "@anthropic-ai/claude-agent-sdk";
import Log from "../Log.js";
import { stamp } from "../home.js";
import Registry from "./registry.js";
import { defaults as role_defaults, opening } from "./roles.js";

/* Raw Claude transcripts stay in the SDK's own session store, outside the repo.
 * What lands here is the PROJECTION: one typed event per SDK message, written
 * through Servex's single writer to %LOCALAPPDATA%/lew42/servex/logs/. */

/* The host. One process holds every live Claude session in a Map, so a normal
 * Claude session — which cannot hold a child's stdin — can still spawn one,
 * talk to it mid-run, and stop it, by calling in here over MCP. */
export class Agents {

	/* `boot` names THIS host process — every registry row it writes carries it,
	 * so the next boot can tell "alive a moment ago" from "long dead". */
	constructor(...args){ this.assign({ live: new Map(), boot: `${Date.now().toString(36)}-${process.pid}` }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* THE SINGLE WRITER, and the reason an agent never opens a file itself.
	 * Servex hands its own `Log` in (`new Agents({ log: servex.log })`) so every
	 * agent event, every dev server's stdout and every `POST /log/<name>` go
	 * through one object with one open stream per file — two of them appending at
	 * once cannot tear a line. A host built with no `log` (demo.mjs, a test) makes
	 * its own, which is the same guarantee inside that one process. */
	store(){ return this.log ??= new Log(); }

	/* The registry — every agent this process has ever spawned, keyed by id, so
	 * something outside this process (the dashboard's fast assistant, a fresh
	 * `say.mjs state`) can still see who is alive after Servex restarts and the
	 * `live` Map is empty again. */
	reg(){ return this.registry ??= new this.constructor.Registry({ dir: this.registry_dir }); }

	register(agent){
		const row = this.reg().write(agent);
		this.store().append("servex", { type: "registry", ...row }).catch(() => {});
		return row;
	}

	/* A row whose host process has died is marked `gone` before it is shown —
	 * `list_agents` never calls a dead agent idle or working. */
	registry_list(){
		this.reg().sweep(this.live, this.boot);
		return this.reg().list();
	}

	/* `role`'s defaults (model, effort, permission mode) fill in what the caller
	 * left out, and its skill is loaded by putting "Load the `<skill>` skill,
	 * then: …" in front of the prompt — the load IS the agent's first turn, not a
	 * setting nothing enforces (see roles.js for why nothing else in the SDK does
	 * this for a top-level session).
	 *
	 * ⚠ A spawn that brings its OWN `system` brief skips that skill load, because
	 * the brief already IS the posture — and a session given a replacement system
	 * prompt usually has no file tools to read a skill with anyway. The fast
	 * assistant (`Assistant.js`) is the one that does this today: telling it to
	 * "load the every-prompt skill first" would spend its first turn failing to
	 * read a file, and then hand it instructions written for an agent with a
	 * terminal it does not have.
	 *
	 * RESUME AND FORK. `resume: <session uuid>` reopens an existing session —
	 * its whole conversation — instead of starting a blank one; add `fork: true`
	 * and it continues as a NEW session id, leaving the original untouched.
	 * Both skip the skill-load preamble (the session already has its posture),
	 * and a resume with no `prompt` sends nothing: it is held open, idle, until
	 * someone talks to it. ⚠ A resume must run in the session's ORIGINAL `cwd`
	 * — the SDK stores sessions per project directory and will not find it from
	 * anywhere else. `id` (revive's) keeps a known id when nothing live has it. */
	spawn(spec){
		const again = spec.resume;
		const taken = spec.id && this.live.has(spec.id) && this.live.get(spec.id).state !== "stopped";
		const id = spec.id && !taken ? spec.id : this.name(spec);
		const agent = new this.constructor.Agent({
			...role_defaults(spec.role), ...spec, id,
			prompt: again || spec.system ? spec.prompt : this.whoami(id) + opening(spec.role, spec.prompt),
			...(again ? { [spec.fork ? "forked_from" : "resumed_from"]: again } : {})
		});
		agent.host = this;
		this.live.set(agent.id, agent);
		agent.start();
		this.register(agent);
		return agent;
	}

	/* An agent has to know its own id to pass it as `from` to fork_self or as
	 * `parent` to spawn_agent — nothing else tells it. One line, first turn only. */
	whoami(id){ return `[You are Servex agent ${id}.]\n`; }

	/* FORK_SELF — a copy of a session, asked ONE question in the background.
	 *
	 * The fork resumes the caller's session with `forkSession: true`: a new
	 * session id, the whole conversation so far, and — because the prefix is
	 * byte-identical — the prompt cache. It answers once and stops itself; the
	 * answer reaches the caller through the ordinary wake (`fork answer: …`),
	 * queued behind whatever the caller is doing by then. The caller is usually
	 * MID-TURN (its transcript ends in the unanswered fork_self call): measured
	 * 2026-09-24, a plain resume+fork handles that — no `resumeSessionAt`.
	 *
	 * ⚠ THE CACHE NEEDS THE SAME TOOLS. The fork runs with the caller's own
	 * model, effort, cwd, settings and MCP servers, because the tool list is the
	 * first thing in the cached prefix: measured 2026-09-24, a fork passed
	 * `tools: []` read 0 cached tokens and wrote 44,268; the same fork with the
	 * caller's tools read 35,534 and wrote 3,550. So "no tools" is done by a
	 * PreToolUse hook that REFUSES every call not in `tools` — the tools stay
	 * in the prompt, unusable.
	 *
	 * Caller: `from` (a live agent here) or `session_id` (any Claude session on
	 * this machine, e.g. a VS Code tab's `$CLAUDE_CODE_SESSION_ID`); the cwd and
	 * model of an outside session are read from its own session file. */
	async fork({ question, from, session_id, model, cwd, tools = [] }){
		if (!question) throw new Error("fork needs a question.");
		const caller = from ? this.get(from)
			: [...this.live.values()].find(a => a.session_id && a.session_id === session_id && a.query);
		const sid = caller?.session_id ?? session_id;
		if (!sid) throw new Error(from
			? `Agent ${from} has no session yet — it has not finished starting.`
			: "fork needs `from` (a Servex agent id) or `session_id` (a Claude session uuid).");

		const who = caller?.id ?? `session ${sid.slice(0, 8)}`;
		const posture = caller ? this.posture(caller) : await this.outside(sid);
		const prompt = `You are a fork of ${who}. Answer this one question and stop.`
			+ " Do not take actions the original would take."
			+ (tools.length ? ` You may use only these tools: ${tools.join(", ")}.`
				: " You have no tools: decide from what you already know.")
			+ `\n\nQuestion: ${question}`;

		return this.spawn({
			...posture,
			...(model ? { model } : {}), ...(cwd ? { cwd } : {}),
			role: "fork", name: caller?.id ?? `session-${sid.slice(0, 8)}`,
			resume: sid, fork: true, one_shot: true, fork_tools: tools,
			parent: caller?.id ?? null, prompt
		});
	}

	/* Everything that shapes the cached prefix, copied off the caller. */
	posture(agent){
		const keys = ["model", "effort", "cwd", "permission_mode", "allowed_tools", "setting_sources",
			"system", "mcp_servers", "sdk", "env", "mcp_url", "visibility"];
		return strip(Object.fromEntries(keys.map(k => [k, agent[k]])));
	}

	/* A session Servex does not hold: the SDK finds its file under any project
	 * dir, and records the cwd it ran in. Its model is the last one that
	 * answered in it — the cache is per model. The CLI's own system prompt,
	 * because a terminal or VS Code session ran with it. */
	async outside(sid){
		const info = await getSessionInfo(sid).catch(() => null);
		if (!info?.cwd) throw new Error(`No Claude session ${sid} found on this machine.`);
		let model;
		try {
			const messages = await getSessionMessages(sid, { dir: info.cwd });
			model = messages.map(m => m.message?.model).filter(Boolean).pop();
		} catch {}
		return strip({ cwd: info.cwd, model, permission_mode: "default",
			system: { type: "preset", preset: "claude_code" } });
	}

	/* WAIT_FOR_AGENT — resolves when the agent's current turn has ended and
	 * nothing is queued behind it (idle), or it stopped. Already idle: at once.
	 * No polling: `Agent.idle()` is a promise that `result()` and `stop()`
	 * resolve. On timeout it answers anyway, marked `timed_out`. */
	async wait(id, timeout_s = 600){
		const agent = this.live.get(id);
		if (!agent?.idle){
			const row = this.registry_list().find(r => r.id === id);
			if (!row) throw new Error(`No agent "${id}", live or in the registry.`);
			return { id, state: row.state, words: null, note: "not held by this Servex process" };
		}
		const began = Date.now();
		let timer;
		const settled = await Promise.race([
			agent.idle(),
			new Promise(r => { timer = setTimeout(() => r(false), timeout_s * 1000); })
		]);
		clearTimeout(timer);
		return { id, state: agent.state, timed_out: settled === false, waited_ms: Date.now() - began,
			words: agent.words ?? agent.last_text ?? null, turns: agent.turns, cost: agent.cost };
	}

	/* SURVIVING A RESTART — called once at Servex boot, before anything reads
	 * the registry. Every row the PREVIOUS boot left open (not stopped) and
	 * touched in the last 30 minutes is reopened: the same id, parent, role,
	 * model, effort, cwd and permission mode, `resume` = its own session, and
	 * no skill-load preamble. One that was mid-turn is told so; an idle one is
	 * just held open again. Everything else still open is dead: `gone`.
	 *
	 * Not revivable (so `gone`): a spawn that brought its own `system`, `sdk`
	 * options or in-process MCP servers — those are code, not data, and their
	 * owners (Assistant.js) spawn them again themselves — and a fork. */
	revive({ window_min = 30 } = {}){
		const reg = this.reg(), prev = reg.last_boot();
		reg.mark_boot(this.boot);
		const out = { revived: [], told: [], gone: [] };
		for (const row of reg.list()){
			if (this.live.has(row.id) || row.state === "stopped") continue;
			if (SELF_RESTARTED.some(prefix => row.id.startsWith(prefix))){
				if (row.state !== "gone") out.gone.push(row.id);
				continue;
			}
			const swept = row.state === "gone" && row.ended === "host process exited";
			if (row.state === "gone" && !(swept && prev?.boot && row.boot === prev.boot)) continue;
			const fresh = Date.now() - Date.parse(row.last_at ?? 0) < window_min * 60000;
			if (!(prev?.boot && row.boot === prev.boot && fresh && row.revivable && row.session_id)){
				if (row.state !== "gone") out.gone.push(row.id);
				continue;
			}
			const { id, role, name, topics, page, parent, visibility, model, effort, cwd,
				permission_mode, allowed_tools, setting_sources, started_at, session_id } = row;
			const agent = this.spawn(strip({ id, role, name, topics, page, parent, visibility, model, effort, cwd,
				permission_mode, allowed_tools, setting_sources, started_at, resume: session_id }));
			out.revived.push(id);
			if (row.state === "working"){
				agent.send("Servex restarted mid-turn; your last tool call may not have finished. Check and continue.",
					{ from: "servex" });
				out.told.push(id);
			}
		}
		reg.bury(out.gone, "servex restarted");
		this.store().append("servex", { type: "revive", boot: this.boot, previous: prev?.boot ?? null, ...out }).catch(() => {});
		return out;
	}

	/* Human-readable, never a uuid: `<role>-<name>`, and a collision takes `-2`.
	 * The SDK's own session uuid lands on the agent as `session_id`, so
	 * `claude --resume <uuid>` still reaches it from a terminal. */
	name({ role = "agent", name = "" }){
		const base = [role, name].filter(Boolean).join("-")
			.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "agent";
		if (!this.live.has(base)) return base;
		let n = 2;
		while (this.live.has(`${base}-${n}`)) n++;
		return `${base}-${n}`;
	}

	get(id){
		const agent = this.live.get(id);
		if (agent) return agent;
		const open = [...this.live.keys()].join(", ") || "none";
		throw new Error(`No agent "${id}". Live now: ${open}`);
	}

	send(id, text, note){ return this.get(id).send(text, note); }
	interrupt(id){ return this.get(id).interrupt(); }
	stop(id){ return this.get(id).stop(); }

	list(){ return [...this.live.values()].map(agent => agent.card()); }

	/* Every event from every agent passes through here on its way to the log.
	 * Override it — the dashboard's socket, a test's stdout — and you see the
	 * whole switchboard. */
	watch(){}

	/* THE WAKE — a child with a `parent` that just ended a turn, stopped, or
	 * errored gets ONE message, so the parent's own turn ends on real news
	 * instead of silence. `kind` is "done", "blocked" (the child's last words
	 * started with that word) or "error"; the body is the child's own last
	 * words, first 300 chars — a parent reading its own log wants the
	 * headline, not a replay. Queued behind whatever the parent is doing
	 * (`Agent.send()`'s own default), never dropped. Off with
	 * `SERVEX_DISABLE_WAKE=1` or `{ no_wake: true }` on the host — the proof
	 * for this reproduces the old parking by disabling it first. */
	wake_parent(child, kind){
		if (this.no_wake || process.env.SERVEX_DISABLE_WAKE) return;
		if (!child.parent || child.parent === child.id) return;
		if (child.one_shot && child.woke) return;
		let parent;
		try { parent = this.get(child.parent); }
		catch { return; }
		/* A fork's answer IS the payload, so it goes whole (to 4000 chars) — the
		 * whole turn's text, not only its last block. Any other wake is a headline. */
		const fork = child.one_shot && kind !== "error";
		const text = kind === "error" ? child.last_error : fork ? (child.words ?? child.last_text) : child.last_text;
		const body = fork ? `fork answer: ${(text ?? "").slice(0, 4000)}` : `${kind}: ${(text ?? "").slice(0, 300)}`;
		child.woke = true;
		try { parent.send(body, { from: child.id, reply_to: `log agent-${child.parent}` }); }
		catch {}
	}
}

/* Agents whose owner (Layers.js, Assistant.js) spawns them again itself at
 * boot — `revive()` never reopens these; it only marks the old row gone. */
export const SELF_RESTARTED = ["assistant-", "manager-", "master-assistant", "servex-mastermind"];

/* Drop the undefined and null fields, so a role's defaults can fill them. */
const strip = spec => Object.fromEntries(Object.entries(spec).filter(([, v]) => v != null));

Agents.Registry = Registry;

/* One Claude session, held open. The SDK's `query()` runs in streaming-input
 * mode: its prompt is an async iterable we never finish, so the session stays
 * alive and steerable between turns instead of ending after the first answer. */
Agents.Agent = class Agent {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return {
			role: "agent",
			model: "claude-sonnet-5",
			effort: "high",
			visibility: "team",
			cwd: process.cwd(),
			permission_mode: "acceptEdits",
			state: "starting",
			turns: 0,
			cost: 0,
			session_id: null,
			started_at: new Date().toISOString()
		};
	}

	/* A resume keeps its session id (the SDK appends to the same session); a
	 * fork learns its new one from the first `system/init`. A resume with no
	 * prompt sends nothing — it is held open, idle, until somebody talks. */
	start(){
		this.queue = new this.constructor.Queue();
		this.aborter = new AbortController();
		if (this.resume && !this.fork) this.session_id ??= this.resume;
		this.query = query({ prompt: this.queue.stream(), options: this.options() });
		this.pump();
		if (!this.prompt){ this.state = "idle"; return this; }
		this.emit({ type: "agent_msg", from: "host", reply_to: null, text: this.prompt, first: true });
		this.queue.push(this.turn(this.prompt));
		this.state = "working";
		return this;
	}

	/* Only a plain spawn can be reopened from its registry row after a
	 * restart: `system`, `sdk` and in-process MCP servers are code, not data. */
	revivable(){
		return !!this.session_id && !this.system && !this.sdk && !this.mcp_servers && !this.one_shot;
	}

	/* Resolves when this agent is idle (turn over, nothing queued) or stopped
	 * — at once if it already is. `settle()` is what resolves it. */
	idle(){
		if (this.state === "idle" || this.state === "stopped") return Promise.resolve(true);
		return new Promise(resolve => (this.waiters ??= []).push(resolve));
	}

	settle(){
		if (this.state !== "idle" && this.state !== "stopped") return;
		(this.waiters ?? []).splice(0).forEach(resolve => resolve(true));
	}

	/* A fork's "no tools": every call not in `fork_tools` is refused before it
	 * runs. The tools stay IN the prompt — removing them breaks the cache. */
	refusal(){
		const allowed = this.fork_tools ?? [];
		const deny = async input => allowed.includes(input.tool_name) ? {} : {
			hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny",
				permissionDecisionReason: `You are a fork answering one question; ${input.tool_name} is not allowed.`
					+ (allowed.length ? ` Only: ${allowed.join(", ")}.` : " Answer from what you already know.") }
		};
		const theirs = this.sdk?.hooks ?? {};
		return { hooks: { ...theirs, PreToolUse: [...(theirs.PreToolUse ?? []), { hooks: [deny] }] } };
	}

	/* The SDK options, in one overridable place. `includePartialMessages` gives a
	 * UI its token stream; `forwardSubagentText` gives it the nested transcript of
	 * anything this agent itself spawns. Both names verified against 0.3.280. */
	options(){
		return {
			model: this.model,
			effort: this.effort,
			cwd: this.cwd,
			abortController: this.aborter,
			includePartialMessages: true,
			forwardSubagentText: true,
			permissionMode: this.permission_mode,
			...this.door(),
			...(this.permission_mode === "bypassPermissions" ? { allowDangerouslySkipPermissions: true } : {}),
			...(this.allowed_tools ? { allowedTools: this.allowed_tools } : {}),
			...(this.setting_sources ? { settingSources: this.setting_sources } : {}),
			...(this.system ? { systemPrompt: this.system } : {}),
			...(this.resume ? { resume: this.resume } : {}),
			...(this.resume && this.fork ? { forkSession: true } : {}),
			...this.sdk,
			...(this.one_shot ? this.refusal() : {})
		};
	}

	/* MINIONS THAT SPAWN MINIONS, in one method.
	 *
	 * An agent running inside Servex is handed Servex's own `/mcp` url two ways,
	 * because two different things inside it need it: the SDK gets an `mcpServers`
	 * entry, so `spawn_agent` and the other nine tools are simply there in the
	 * agent's tool list; and `SERVEX_MCP` goes into its environment, so anything
	 * it shells out to — a `claude -p` of its own — can find the same door with
	 * `--mcp-config`. Without this an agent is a leaf: it can be steered but can
	 * never build a team of its own.
	 *
	 * ⚠ `strictMcpConfig` is deliberately NOT set. It would mean "these servers
	 * and nothing else", throwing away the project's own MCP servers that the
	 * agent may well need. Servex's door is added BESIDE whatever it already has. */
	door(){
		const url = this.mcp_url ?? this.host?.mcp_url;
		// a host with no HTTP door (fork-proof.mjs) still passes the spawn's own in-process servers
		if (!url) return this.mcp_servers ? { mcpServers: this.mcp_servers } : {};

		return {
			mcpServers: { servex: { type: "http", url: url + (url.includes("?") ? "&" : "?") + "as=" + encodeURIComponent(this.id) }, ...this.mcp_servers },
			env: { ...process.env, SERVEX_MCP: url, ...this.env }
		};
	}

	/* `priority: "now"` CANCELS whatever the agent is saying and delivers this
	 * immediately — measured 2026-09-22: the running turn ends with a null result
	 * and the next turn starts on your text. Leave it off and the message waits
	 * its turn: the agent finishes what it was doing, then answers. "Stop" is a
	 * `now`; "when you're done, also…" is not. */
	turn(text, priority){
		return { type: "user", message: { role: "user", content: text }, parent_tool_use_id: null,
			...(priority ? { priority } : {}) };
	}

	/* A message from somewhere else in the system, wrapped so the agent can read
	 * who asked and where the answer goes. Plain text on purpose: the agent has
	 * to understand it with no schema and no training. */
	envelope(text, { from, reply_to } = {}){
		const head = [from && `from: ${from}`, reply_to && `reply to: ${reply_to}`].filter(Boolean).join(" · ");
		return head ? `[${head}]\n${text}` : text;
	}

	send(text, { from, reply_to, priority } = {}){
		if (this.state === "stopped") throw new Error(`Agent ${this.id} has stopped.`);
		this.emit({ type: "agent_msg", from: from ?? null, reply_to: reply_to ?? null, priority: priority ?? null, text });
		this.queue.push(this.turn(this.envelope(text, { from, reply_to }), priority));
		this.state = "working";
		this.host?.register?.(this);
		return this;
	}

	async interrupt(){
		try { await this.query.interrupt(); }
		catch (e){ this.emit({ type: "error", where: "interrupt", text: String(e.message || e) }); }
		this.state = "idle";
		this.host?.register?.(this);
		this.settle();
		return this;
	}

	/* Three things end a session, and a long-lived host needs all three: close the
	 * prompt stream so nothing new starts, close the query so the SDK tears its
	 * transport down, and abort so the `claude` child process actually exits —
	 * one survived `close()` alone on 2026-09-22 and sat there burning memory. */
	stop(){
		this.queue.close();
		try { this.query.close(); } catch {}
		try { this.aborter.abort(); } catch {}
		if (this.state === "stopped") return this;
		this.state = "stopped";
		this.emit({ type: "result", stopped: true, turns: this.turns, cost: this.cost });
		this.host?.register?.(this);
		this.settle();
		return this;
	}

	card(){
		const { id, role, model, state, visibility, started_at, turns, session_id, cost, parent,
			forked_from, resumed_from } = this;
		return { id, role, model, state, visibility, started_at, turns, session_id, cost, parent: parent ?? null,
			revivable: this.revivable(), forked_from: forked_from ?? null, resumed_from: resumed_from ?? null,
			context: this.context ?? null };
	}

	/* The one seam every event goes through — one line in the agent's own JSONL,
	 * written by the host's single writer. It returns the promise that resolves
	 * when the line is actually on disk, and swallows a write error rather than
	 * taking the session down: a log that cannot be written is not a reason to
	 * lose the agent doing the work. */
	log(entry){
		return this.host.store().append(this.log_name(), entry).catch(() => {});
	}

	log_name(){ return `agent-${this.id}`; }

	file(){ return this.host.store().file(this.log_name()).path; }

	/* `stamp()` is Servex's clock, not `new Date().toISOString()` — local time with
	 * its offset, so an agent's line sorts and reads the same as every other line
	 * in every other log this machine writes. */
	emit(entry){
		const event = { at: stamp(), agent: this.id, ...entry };
		if (event.type === "transcript" && !event.meta){
			this.last_text = event.text;
			(this.said ??= []).push(event.text);
		}
		if (event.type === "error") this.last_error = event.text;
		this.host?.watch(event, this);
		this.log(event);
		if (event.type === "result") this.host?.wake_parent?.(this,
			this.one_shot && event.ok === false ? "error"
			: this.last_text?.startsWith("BLOCKED") ? "blocked" : "done");
		if (event.type === "error") this.host?.wake_parent?.(this, "error");
		return event;
	}

	async pump(){
		try {
			for await (const message of this.query) this.receive(message);
		} catch (e){
			// the abort that `stop()` itself fires is not news — and would wake a parent with a false "error"
			if (this.state !== "stopped") this.emit({ type: "error", where: "session", text: String(e.message || e) });
		}
		if (this.state === "stopped") return;
		this.state = "stopped";
		this.host?.register?.(this);
		this.settle();
	}

	/* Every SDK message becomes exactly one typed event — or none, for the kinds
	 * a dashboard has no use for. The SDK's message set grows over time, so an
	 * unrecognised type is dropped, never thrown on. */
	receive(message){
		if (message.type === "system" && message.subtype === "init") return this.began(message);
		if (message.type === "stream_event") return this.delta(message);
		if (message.type === "assistant") return this.assistant(message);
		if (message.type === "result") return this.result(message);
	}

	/* The CLI re-announces itself at the top of EVERY turn, not just the first.
	 * Only the first one is news. */
	began(message){
		if (this.session_id === message.session_id) return;
		this.session_id = message.session_id;
		this.emit({ type: "transcript", text: `session ${message.session_id} · ${message.model} · ${message.permissionMode}`, meta: true });
		// the row needs the session id NOW: a host killed during this first turn must still be able to revive it
		this.host?.register?.(this);
	}

	delta(message){
		const event = message.event;
		if (event?.type !== "content_block_delta") return;
		if (event.delta?.type !== "text_delta") return;
		this.emit({ type: "delta", text: event.delta.text, nested: !!message.parent_tool_use_id });
	}

	assistant(message){
		const nested = !!message.parent_tool_use_id;
		if (!nested && message.message?.usage) this.last_usage = message.message.usage;
		for (const block of message.message?.content ?? []){
			if (block.type === "text" && block.text.trim())
				this.emit({ type: nested ? "subagent" : "transcript", text: block.text });
			if (block.type === "tool_use")
				this.emit({ type: "tool", name: block.name, input: this.summary(block.input), nested });
		}
		if (message.error) this.emit({ type: "error", where: "assistant", text: String(message.error.message || message.error) });
	}

	/* A tool call's input can be a whole file; the log wants a glance at it. */
	summary(input, max = 200){
		const text = Object.entries(input ?? {})
			.map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
			.join(" ").replace(/\s+/g, " ");
		return text.length > max ? text.slice(0, max) + "…" : text;
	}

	/* A turn ended — but the agent is only IDLE if nothing is queued behind it.
	 * `queued_turn_count` is how the CLI says "another turn follows without
	 * further input"; without that check a watcher reads the gap between two
	 * queued turns as "finished" and acts on a half-done agent. */
	result(message){
		this.turns += 1;
		this.cost = message.total_cost_usd ?? this.cost;
		this.queued = message.queued_turn_count ?? 0;
		this.state = this.queued > 0 ? "working" : "idle";
		/* `words` = everything said this turn, which is what a fork's wake and
		 * `wait_for_agent` hand back; `last_text` is only its final block. */
		this.words = (this.said ?? []).join("\n\n") || null;
		this.said = [];
		if (message.is_error) this.last_error = (message.errors ?? []).join("; ") || message.subtype || "turn failed";
		const u = message.usage ?? {};
		this.emit({
			type: "result",
			ok: !message.is_error,
			cost: this.cost,
			duration_ms: message.duration_ms,
			turns: this.turns,
			api_turns: message.num_turns,
			queued: this.queued,
			text: message.result ?? null,
			usage: { input_tokens: u.input_tokens ?? 0, cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
				cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0, output_tokens: u.output_tokens ?? 0 }
		});
		this.usage = u;
		/* CONTEXT — the tokens this agent holds now, i.e. what its next request
		 * re-sends: the LAST main-thread response's input + cache_read +
		 * cache_creation + output (the SDK's own definition of `context_tokens`,
		 * which only hook inputs carry, never a result message). Not the result's
		 * usage: that sums every API call in the turn and over-counts. */
		const c = this.last_usage;
		if (c) this.context = (c.input_tokens ?? 0) + (c.cache_read_input_tokens ?? 0)
			+ (c.cache_creation_input_tokens ?? 0) + (c.output_tokens ?? 0);
		this.host?.register?.(this);
		this.settle();
		/* ONE-SHOT (a fork): its first result is its answer — the wake above has
		 * already carried it to the parent — so it stops itself. */
		if (this.one_shot) setImmediate(() => this.stop());
	}
};

/* The open end of the session: an async iterable that waits instead of
 * finishing, so `query()` never sees the prompt stream end and never closes. */
Agents.Agent.Queue = class AgentQueue {

	constructor(...args){ this.assign({ items: [], waiting: [], done: false }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	push(item){
		if (this.done) return this;
		const wake = this.waiting.shift();
		if (wake) wake({ value: item, done: false });
		else this.items.push(item);
		return this;
	}

	close(){
		this.done = true;
		this.waiting.splice(0).forEach(wake => wake({ value: undefined, done: true }));
		return this;
	}

	next(){
		if (this.items.length) return Promise.resolve({ value: this.items.shift(), done: false });
		if (this.done) return Promise.resolve({ value: undefined, done: true });
		return new Promise(resolve => this.waiting.push(resolve));
	}

	async *stream(){
		while (true){
			const { value, done } = await this.next();
			if (done) return;
			yield value;
		}
	}
};

/* One host per process. Import this; construct your own only in a test. */
export const agents = new Agents();
export default agents;
