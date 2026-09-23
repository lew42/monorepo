import { query } from "@anthropic-ai/claude-agent-sdk";
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

	constructor(...args){ this.assign({ live: new Map() }, ...args); }
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
	reg(){ return this.registry ??= new this.constructor.Registry(); }

	register(agent){
		const row = this.reg().write(agent);
		this.store().append("servex", { type: "registry", ...row }).catch(() => {});
		return row;
	}

	registry_list(){ return this.reg().list(); }

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
	 * terminal it does not have. */
	spawn(spec){
		const agent = new this.constructor.Agent({
			...role_defaults(spec.role), ...spec,
			prompt: spec.system ? spec.prompt : opening(spec.role, spec.prompt),
			id: this.name(spec)
		});
		agent.host = this;
		this.live.set(agent.id, agent);
		agent.start();
		this.register(agent);
		return agent;
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
		let parent;
		try { parent = this.get(child.parent); }
		catch { return; }
		const text = kind === "error" ? child.last_error : child.last_text;
		const body = `${kind}: ${(text ?? "").slice(0, 300)}`;
		try { parent.send(body, { from: child.id, reply_to: `log agent-${child.parent}` }); }
		catch {}
	}
}

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

	start(){
		this.queue = new this.constructor.Queue();
		this.aborter = new AbortController();
		this.query = query({ prompt: this.queue.stream(), options: this.options() });
		this.emit({ type: "agent_msg", from: "host", reply_to: null, text: this.prompt, first: true });
		this.queue.push(this.turn(this.prompt));
		this.state = "working";
		this.pump();
		return this;
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
			...this.sdk
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
		if (!url) return {};

		return {
			mcpServers: { servex: { type: "http", url }, ...this.mcp_servers },
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
		this.state = "stopped";
		this.emit({ type: "result", stopped: true, turns: this.turns, cost: this.cost });
		this.host?.register?.(this);
		return this;
	}

	card(){
		const { id, role, model, state, visibility, started_at, turns, session_id, cost, parent } = this;
		return { id, role, model, state, visibility, started_at, turns, session_id, cost, parent: parent ?? null };
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
		if (event.type === "transcript") this.last_text = event.text;
		if (event.type === "error") this.last_error = event.text;
		this.host?.watch(event, this);
		this.log(event);
		if (event.type === "result") this.host?.wake_parent?.(this, this.last_text?.startsWith("BLOCKED") ? "blocked" : "done");
		if (event.type === "error") this.host?.wake_parent?.(this, "error");
		return event;
	}

	async pump(){
		try {
			for await (const message of this.query) this.receive(message);
		} catch (e){
			this.emit({ type: "error", where: "session", text: String(e.message || e) });
		}
		if (this.state !== "stopped") this.state = "stopped";
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
	}

	delta(message){
		const event = message.event;
		if (event?.type !== "content_block_delta") return;
		if (event.delta?.type !== "text_delta") return;
		this.emit({ type: "delta", text: event.delta.text, nested: !!message.parent_tool_use_id });
	}

	assistant(message){
		const nested = !!message.parent_tool_use_id;
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
		this.emit({
			type: "result",
			ok: !message.is_error,
			cost: this.cost,
			duration_ms: message.duration_ms,
			turns: this.turns,
			api_turns: message.num_turns,
			queued: this.queued,
			text: message.result ?? null
		});
		this.host?.register?.(this);
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
