import { query, getSessionInfo, getSessionMessages } from "@anthropic-ai/claude-agent-sdk";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import Log from "../Log.js";
import { stamp, place } from "../home.js";
import Registry from "./registry.js";
import { defaults as role_defaults, opening } from "./roles.js";
import { first_prompt } from "./readme-chain.js";

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
	 * anywhere else. `id` (revive's) keeps a known id when nothing live has it.
	 *
	 * OPEN BY NODE. `task: {dir, card, brief}` opens the task's own task.jsonl
	 * ITSELF, before the agent's first turn — the new-task skill then has
	 * nothing to do. This needs the session id before the SDK has even started,
	 * which the SDK's `sessionId` option allows (start() already uses it, the
	 * same thing `claude --session-id` does from a terminal): mint it here,
	 * write the task file, then hand the agent that same id to use.
	 *
	 * README CHAIN. A FRESH spawn (never a resume — a resumed session already
	 * has it, and one bringing its own `system` brief is code, not this path)
	 * whose directory we can name gets the readme chain from the repo root down
	 * to that directory prepended, ahead of everything else, so it knows "where
	 * it is" before its first turn: `spec.task.dir` (a task mastermind, or any
	 * agent opened with `task: {dir, ...}`) or `spec.page` (a page-bound agent;
	 * a URL path like `/framework/ux/Dictate/`, mapped onto the matching repo
	 * dir under `public/`). A plain minion with neither carries its directory
	 * in its own brief text instead, so it is deliberately left untouched here
	 * — `directory_of` returns null for it and nothing is added. */
	spawn(spec){
		const again = spec.resume;
		const taken = spec.id && this.live.has(spec.id) && this.live.get(spec.id).state !== "stopped";
		const id = spec.id && !taken ? spec.id : this.name(spec);
		const model = spec.model ?? role_defaults(spec.role).model ?? "claude-sonnet-5";
		const session_id = spec.task && !again ? (spec.session_id ?? randomUUID()) : spec.session_id;
		if (spec.task && !again) open_task(spec.task, { session_id, agent: id, model, parent_dir: spec.parent ? this.task_dir_of?.(spec.parent) ?? this.live.get(spec.parent)?.task?.dir : null });
		const fresh = !again && !spec.system;
		const dir = fresh ? directory_of(spec) : null;
		const opened = again || spec.system ? spec.prompt : this.whoami(id) + opening(spec.role, spec.prompt);
		const base = dir ? `${first_prompt(dir)}\n\n${opened}` : opened;
		const prompt = spec.task
			? `${base}\n\nYour task is already open at ${spec.task.dir}/task.jsonl; don't run new-task, log there.`
			: base;
		const agent = new this.constructor.Agent({
			...role_defaults(spec.role), ...spec, id, prompt,
			...(session_id ? { session_id } : {}),
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
		const out = { revived: [], told: [], gone: [], legacy: [] };
		for (const row of reg.list()){
			if (this.live.has(row.id) || row.state === "stopped") continue;
			if (self_restarted(row.id)){
				if (row.state !== "gone") out.gone.push(row.id);
				continue;
			}
			const swept = row.state === "gone" && row.ended === "host process exited";
			if (row.state === "gone" && !(swept && prev?.boot && row.boot === prev.boot)) continue;
			/* A LEGACY row — written by the code before this, with no host-process
			 * fields at all — counts as the previous Servex's. The first restart
			 * onto this code is the one with the most agents running, so it must
			 * revive too: it does when the agent's own log was written in the
			 * window, which is the only liveness the old code left behind. It
			 * never recorded system/sdk/in-process servers either; the agents that
			 * had them are the SELF_RESTARTED ones, already skipped above. */
			const legacy = !row.boot && !row.pid;
			const ours = legacy ? this.recent_log(row.id, window_min)
				: !!prev?.boot && row.boot === prev.boot && Date.now() - Date.parse(row.last_at ?? 0) < window_min * 60000;
			let agent = null;
			if (ours && (legacy || row.revivable) && row.session_id)
				try { agent = this.reopen(row); } catch {}
			if (!agent){
				if (row.state !== "gone") out.gone.push(row.id);
				continue;
			}
			const id = row.id;
			out.revived.push(id);
			if (legacy) out.legacy.push(id);
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

	/* WAKE ON MESSAGE — so an idle agent can be STOPPED at no cost (one held
	 * open costs ~250 MB). A message to a stopped agent, or to one that exists
	 * only in the registry, reopens it first: the same id, `resume` = its
	 * session, its own recorded spec, no prompt — then delivers. A fork is never
	 * re-woken. ⚠ `Agent.send()` on a stopped INSTANCE still throws: the live
	 * card's route turns that throw into a 409.
	 *
	 * A registered EXTERNAL id (External.js — a VS Code tab, a terminal) is
	 * never in `live` and has no session for `wake()` to reopen: it is a real
	 * Claude session, just not one this process holds. `external.deliver()`
	 * appends to its inbox file instead and hands back an agent-shaped
	 * stand-in, the same trick the spawn gate's `hold()` stand-in already
	 * uses elsewhere in this file. */
	send(id, text, note){
		id = this.holder(id);
		const agent = this.live.get(id);
		if (agent && agent.state !== "stopped") return agent.send(text, note);
		if (this.external?.has?.(id)) return this.external.deliver(id, text, note);
		return this.wake(id).send(text, note);
	}

	/* "mastermind-servex" is a ROLE: when a fresh session holds it as
	 * mastermind-servex-N (the old one stood down at a full context), a message
	 * to the role goes to the newest live holder instead of waking the old one. */
	holder(id){
		if (id !== "mastermind-servex") return id;
		const n = s => +(s.match(/^mastermind-servex-(\d+)$/)?.[1] ?? -1);
		const best = [...this.live.values()].filter(x => x.state !== "stopped" && n(x.id) >= 0).sort((x, y) => n(y.id) - n(x.id))[0];
		return best?.id ?? id;
	}

	wake(id){
		const live = this.live.get(id);
		const row = this.reg().read()[id];
		if (!live && !row) return this.get(id);          // throws, naming who IS live
		if (live?.one_shot || (live?.role ?? row?.role) === "fork")
			throw new Error(`Agent ${id} is a fork: it answered once and is not woken again.`);
		if (!live?.session_id && !row?.session_id) throw new Error(`Agent ${id} never got a session, so there is nothing to wake.`);
		return this.reopen({ ...row, ...(live ? { spec: live.recipe(), session_id: live.session_id } : {}), id });
	}

	/* Reopen a registry row's session as a live agent under the same id: its
	 * recorded `spec` when it has one, else the row's own fields; where the
	 * session ran and its model come from the session file when the row does
	 * not say. Shared by `wake()` and `revive()`. */
	reopen(row){
		const keys = ["role", "name", "topics", "page", "parent", "visibility", "model", "effort", "cwd",
			"permission_mode", "allowed_tools", "setting_sources"];
		const base = strip(row.spec ?? Object.fromEntries(keys.map(k => [k, row[k]])));
		const facts = base.cwd && base.model ? {} : session_facts(row.session_id);
		const cwd = base.cwd ?? facts.cwd;
		if (!cwd) throw new Error(`Cannot find where session ${row.session_id} ran, so it cannot be resumed.`);
		return this.spawn(strip({ ...base, cwd, model: base.model ?? facts.model,
			id: row.id, started_at: row.started_at, resume: row.session_id }));
	}
	interrupt(id){ return this.get(id).interrupt(); }
	stop(id){ return this.get(id).stop(); }

	list(){ return [...this.live.values()].map(agent => agent.card()); }

	/* Every event from every agent passes through here on its way to the log.
	 * Override it — the dashboard's socket, a test's stdout — and you see the
	 * whole switchboard. */
	watch(){}

	/* Was this agent's own log written in the last `window_min` minutes? The only
	 * liveness a legacy registry row has. Worked out from the path, never through
	 * `Log.file()`, which would open a write stream on it. */
	recent_log(id, window_min){
		const dir = this.store().dir ?? path.dirname(place("logs", "any.jsonl"));
		try { return Date.now() - fs.statSync(path.join(dir, `agent-${id}.jsonl`)).mtimeMs < window_min * 60000; }
		catch { return false; }
	}

	/* THE WAKE — a child with a `parent` that just ended a turn, stopped, or
	 * errored gets ONE message, so the parent's own turn ends on real news
	 * instead of silence. `kind` is "done", "blocked" (the child's last words
	 * started with that word), "error", or "stopped" (stopped MID-TURN; an idle
	 * child's stop wakes nobody); the body is the child's own last
	 * words, first 300 chars — a parent reading its own log wants the
	 * headline, not a replay. Queued behind whatever the parent is doing
	 * (`Agent.send()`'s own default), never dropped. Off with
	 * `SERVEX_DISABLE_WAKE=1` or `{ no_wake: true }` on the host — the proof
	 * for this reproduces the old parking by disabling it first. */
	wake_parent(child, kind){
		if (this.no_wake || process.env.SERVEX_DISABLE_WAKE) return;
		if (!child.parent || child.parent === child.id) return;
		if (child.one_shot && child.woke) return;
		/* A fork's answer IS the payload, so it goes whole (to 4000 chars) — the
		 * whole turn's text, not only its last block. Any other wake is a headline. */
		const fork = child.one_shot && (kind === "done" || kind === "blocked");
		const text = kind === "error" ? child.last_error : fork ? (child.words ?? child.last_text) : child.last_text;
		const body = fork ? `fork answer: ${(text ?? "").slice(0, 4000)}` : `${kind}: ${(text ?? "").slice(0, 300)}`;
		child.woke = true;
		this.inbox(child, kind, text);
		if (this.closing) return;   // Servex is shutting down: the inbox has it; revive nobody
		const parent = this.live.get(child.parent), by = this.stopped_on_purpose?.(child.parent);
		if (by && (!parent || parent.state === "stopped")){   // stopped on purpose: the inbox has it; never revived by a child
			this.store().append("servex", { type: "wake-skipped", child: child.id, parent: child.parent, stopped_by: by.by }).catch(() => {});
			return;
		}
		/* Through the HOST's send(), which revives a stopped parent — `get(parent).send()`
		 * threw "has stopped" into an empty catch, and results were lost (task-loop, 09-29). */
		try { this.send(child.parent, body, { from: child.id, reply_to: `log agent-${child.parent}` }); }
		catch (e){ this.store().append("servex", { type: "wake-failed", child: child.id, parent: child.parent, error: String(e.message || e) }).catch(() => {}); }
	}

	/* A child's result also lands in its parent's task dir as inbox.jsonl
	 * ({at, from, kind, text}), so a stop, a restart or the reaper cannot lose it.
	 * The parent's dir: the heartbeat's owner map, the live parent's own task, or
	 * the directory above the child's own task dir when that holds a task.jsonl. */
	inbox(child, kind, text){
		try {
			const up = child.task?.dir && path.dirname(path.resolve(child.task.dir));
			const dir = this.task_dir_of?.(child.parent) ?? this.live.get(child.parent)?.task?.dir
				?? (up && fs.existsSync(path.join(up, "task.jsonl")) ? up : null);
			if (dir) fs.appendFileSync(path.join(dir, "inbox.jsonl"), JSON.stringify({ at: stamp(), from: child.id, kind, text: text ?? null }) + "\n");
		} catch (e){ this.store().append("servex", { type: "inbox-failed", child: child.id, error: String(e.message || e) }).catch(() => {}); }
	}
}

/* The directory a fresh spawn is FOR, if it names one — `spec.task.dir` as-is
 * (repo-relative or absolute, same as `open_task` accepts), or `spec.page`
 * (a site URL path, e.g. `/framework/ux/Dictate/`) mapped onto the repo dir
 * that URL is served from, `public/<page, leading slash stripped>`. Neither
 * present (a plain minion, most forks, the fast assistant) -> null, and
 * `spawn()` adds nothing. */
function directory_of(spec){
	if (spec.task?.dir) return spec.task.dir;
	// forward slashes always, even on Windows (path.join would use `\`), so the
	// "Where you are" line reads the same as a repo-relative task.dir does.
	if (spec.page) return path.posix.join("public", String(spec.page).replace(/^\/+/, ""));
	return null;
}

/* OPEN BY NODE — `spawn({task: {dir, card, brief}}, ...)` calls this before
 * `agent.start()`, so the task's task.jsonl carries its owning agent from the
 * first line, and the agent's own first turn never has to run new-task.
 * `dir` may be a path relative to this process's own cwd (Servex always runs
 * from the repo root) or absolute; it is created if it does not exist yet.
 * Synchronous — this must be finished before the agent's first turn starts.
 *
 * One assign line, always appended, never rewritten: for a brand-new file
 * `appendFileSync` both creates it and writes this as line 1; for a task dir
 * a caller opened earlier (or a sibling agent shares), it just adds one more
 * assign line with the same facts, exactly like every other `assign` a task
 * log collects over its life — never touching what came before it. */
function open_task(task, { session_id, agent, model, parent_dir }){
	const dir = path.isAbsolute(task.dir) ? task.dir : path.join(process.cwd(), task.dir);
	fs.mkdirSync(dir, { recursive: true });
	/* NESTED TASKS: `parent_task` (the parent's task dir, repo-relative, forward
	 * slashes) and `after` (sibling task dirs this one waits for) — the tree
	 * ext/AITask/tree.js draws. */
	const rel = d => d && path.relative(process.cwd(), path.resolve(d)).split(path.sep).join("/");
	const parent_task = rel(task.parent_task ?? parent_dir);
	const after = Array.isArray(task.after) && task.after.length ? task.after : undefined;
	const line = JSON.stringify({ assign: strip({ session_id, agent, card: task.card, brief: task.brief,
		model, parent_task, after, requested_at: stamp(), now: "starting", steps: [], step: 1 }) });
	fs.appendFileSync(path.join(dir, "task.jsonl"), line + "\n");
	return dir;
}

/* What a session's own file says about it — the `cwd` it ran in (a resume must
 * run there) and the last `model` that answered in it — for a registry row too
 * old to have recorded either. Synchronous on purpose: `revive()` runs inside
 * Servex's constructor. Reads the first 64 KB and the last 256 KB, never the
 * whole file. */
export function session_facts(sid){
	const root = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude"), "projects");
	let file;
	try {
		for (const dir of fs.readdirSync(root)){
			const f = path.join(root, dir, `${sid}.jsonl`);
			if (fs.existsSync(f)){ file = f; break; }
		}
	} catch {}
	if (!file) return {};
	const slice = (from, size) => {
		const fd = fs.openSync(file, "r");
		try { const buf = Buffer.alloc(size); return buf.toString("utf8", 0, fs.readSync(fd, buf, 0, size, from)); }
		finally { fs.closeSync(fd); }
	};
	const size = fs.statSync(file).size;
	const head = slice(0, Math.min(size, 65536));
	const tail = slice(Math.max(0, size - 262144), Math.min(size, 262144));
	const cwd = head.match(/"cwd":"((?:[^"\\]|\\.)*)"/)?.[1];
	const model = [...tail.matchAll(/"model":"(claude-[^"]+)"/g)].pop()?.[1];
	return strip({ cwd: cwd && JSON.parse(`"${cwd}"`), model, file });
}

/* Agents whose owner (Layers.js, Assistant.js) spawns them again itself at
 * boot — `revive()` never reopens these; it only marks the old row gone.
 * Prefixes, plus exact ids. */
export const SELF_RESTARTED = { prefixes: ["assistant-", "manager-", "master-assistant"], ids: ["mastermind-servex"] };
/* Only while the layers run: with `SERVEX_NO_LAYERS` set nothing respawns them,
 * so revive() treats them like any other agent. */
export const self_restarted = id => !process.env.SERVEX_NO_LAYERS && (
	SELF_RESTARTED.ids.includes(id) || /^mastermind-servex-\d+$/.test(id) || SELF_RESTARTED.prefixes.some(prefix => id.startsWith(prefix)));

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
		/* The session id is known AT SPAWN, not at the first `system/init`: a
		 * fresh spawn or a fork mints one and hands it to the SDK as `sessionId`
		 * (allowed beside `forkSession`), so the registry row can be resumed even
		 * if the host dies during the first turn. A plain resume keeps its id;
		 * `spawn()` may also hand in a session id it minted itself (a `task`
		 * spawn, so it can write that same id into task.jsonl before this
		 * runs) — `??=` keeps that one instead of minting a second. */
		if (this.resume && !this.fork) this.session_id ??= this.resume;
		else { this.session_id ??= randomUUID(); this.minted = true; }
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

	/* The spawn spec minus the prompt — what `wake()` reopens it with, kept on
	 * its registry row as `spec`. Data only: `sdk`, in-process `mcp_servers` and
	 * `env` are code or secrets and are not kept; a fork keeps none. */
	recipe(){
		if (this.one_shot) return null;
		const keys = ["role", "name", "topics", "page", "parent", "visibility", "model", "effort", "cwd",
			"permission_mode", "allowed_tools", "setting_sources", "system"];
		return strip(Object.fromEntries(keys.map(k => [k, this[k]])));
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
			...(this.minted ? { sessionId: this.session_id } : {}),
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
		const mid_turn = this.state === "working";
		this.state = "stopped";
		this.emit({ type: "result", stopped: true, mid_turn, turns: this.turns, cost: this.cost });
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
		/* Stopping an IDLE child is not news — its "done" already went out when
		 * its turn ended. Only a child cut off mid-turn wakes the parent, as
		 * `stopped: …` (2026-09-24: five finished minions, stopped, each re-sent
		 * its old "done"). */
		if (event.type === "result" && !(event.stopped && !event.mid_turn)) this.host?.wake_parent?.(this,
			event.stopped ? "stopped"
			: this.one_shot && event.ok === false ? "error"
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
