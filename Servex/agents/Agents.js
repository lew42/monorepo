import { query, getSessionInfo, getSessionMessages } from "@anthropic-ai/claude-agent-sdk";
import SessionRecord from "../../Server/SessionRecord.mjs";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Log from "../Log.js";
import { stamp, place } from "../home.js";
import Registry, { alive } from "./Registry.js";
import { defaults as role_defaults, opening, injected, compact_after as role_compact_after, role_system, role_reminder, singleton_id, renew_of } from "./roles.js";
import { OR_ONLY } from "./tiers.js";
import { first_prompt } from "./readme-chain.js";
import Task from "../../public/framework/core/Task/Task.js";
import Session from "../../public/framework/core/Session/Session.js";
import TaskDirs from "../../Server/TaskDirs.mjs";
import DatedFiles from "../../Server/DatedFiles.mjs";
import PastWork from "../../Server/PastWork.mjs";
import LandingCheck from "../../Server/LandingCheck.mjs";
import Landed from "../Landed.js";
import { turn_costs } from "./turn-costs.js";
import { env_for, provider_for, real_turn_cost, generation_cost, message_cost, read_key, disallowed_tools_for, spend_guard } from "../ext/openrouter/provider.js";
import { env_for as local_env_for, is_local_model } from "../ext/local/provider.js";
import { server as sdk_server } from "./tools.js";   // cycle with tools.js is fine: used only at call time
const MAIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");   // Servex runs from the main tree
import { page_tools, move_item } from "./page_tools.js";

/* The in-process caller is the agent itself: its own task.jsonl (its task dir), or null; the item tool files a reference there. */
function agent_log(agent){
	return () => {
		const dir = agent.task?.dir ?? agent.task_dir ?? null;
		return dir ? (SessionRecord.log_file(path.resolve(MAIN_ROOT, dir)) ?? path.resolve(MAIN_ROOT, dir, "task.jsonl")) : null;
	};
}

/* The in-process page tools for one agent, and the names of their HTTP twins. */
function local_page_tools(id, resolve_log){
	const list = page_tools(resolve_log);
	return { server: sdk_server(undefined, { caller: id }, list), twins: list.map(t => "mcp__servex__" + t.name) };
}

/* Raw Claude transcripts stay in the SDK's own session store, outside the repo.
 * What lands here is the PROJECTION: one typed event per SDK message, written
 * through Servex's single writer to %LOCALAPPDATA%/lew42/servex/logs/. */

/* The host. One process holds every live Claude session in a Map, so a normal
 * Claude session — which cannot hold a child's stdin — can still spawn one,
 * talk to it mid-run, and stop it, by calling in here over MCP. */
/* when each OpenRouter agent last settled a turn: lets refresh_or_cost() see who shared a key_diff window */
const OR_SETTLED = new Map();

export class Agents {

	/* `boot` names THIS host process — every registry row it writes carries it,
	 * so the next boot can tell "alive a moment ago" from "long dead". */
	constructor(...args){ this.assign({ live: new Map(), boot: `${Date.now().toString(36)}-${process.pid}` }, ...args); Task.cost_resolver = task => this.task_cost(task); Session.agents_resolver = dir => this.agents_under(dir); setTimeout(() => { try { PastWork.tasks(); } catch {} }, 10000).unref(); }   // warms the past-work cache so the first spawn pays ~0.5 s, not 3 s
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
		if (agent.state === "stopped") try { this.servex?.lifecycle?.agent_ended(agent); } catch {}
		// follow(path), 2026-09-29: a stopped agent's subscriptions end with it — Servex/Follow.js
		if (agent.state === "stopped") try { this.servex?.follow?.agent_ended(agent); } catch {}
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
		/* A SINGLETON ROLE (the owner, 2026-10-23; roles.js `singleton`): its id is the role's own word, never `-2`. A second
		 * spawn while it is live sends it the prompt instead; a stopped or never-started one is spawned under that same id. */
		const renewing = spec.renewing;
		if (renewing){ spec = { ...spec }; delete spec.renewing; }
		const single = !again && singleton_id(spec.role);
		if (single){
			const cur = this.live.get(single), from = spec.parent ?? "spawn";
			if (cur && cur.state !== "stopped"){ if (spec.prompt) cur.send(spec.prompt, { from }); return cur; }
			/* Only in the registry (after a restart): wake it, so it resumes, or renews if it is due (wake() decides). */
			if (!renewing && !cur && this.reg().read()[single]?.session_id) try { const w = this.wake(single); if (spec.prompt) w.send(spec.prompt, { from }); return w; } catch {}
			spec = { ...spec, id: single };
		}
		const taken = spec.id && this.live.has(spec.id) && this.live.get(spec.id).state !== "stopped";
		const id = spec.id && !taken ? spec.id : this.name(spec);
		/* AT MOST 30 RUNNING (An assistant on every page, 2026-09-25): before any spawn,
		 * if 30 agents are live, stop the longest-idle page assistant first. Never stop
		 * a working agent or a mastermind. */
		this.enforce_live_cap(id);
		/* A MINION NEVER GETS THE MAIN TREE (session-gate, 2026-10-01): session-smart.md used to
		 * let a voice session spawn a `minion` straight into the repo root, with no worktree, no
		 * smoke test, no review — it edited the live site directly (registry.json, 2026-10-01:
		 * minion-chat-duplicate-messages and five siblings, all `cwd: C:\Code\lew42\monorepo`).
		 * A FRESH minion (never a resume — `reopen()` needs the session's ORIGINAL cwd, this
		 * file's own comment above), spawned on a host that actually HAS a pool (real Servex —
		 * a demo, a test or a bare `new Agents()` has none, and is left exactly as it was before
		 * this feature), whose `cwd` is not already inside `worktrees/` is moved into a pool slot
		 * before its first turn. `pool.take_sync()` (Servex/Pool.js) claims a READY slot with no
		 * `await` — this function stays synchronous on purpose, same reason as the openrouter
		 * spend guard below (a dozen-plus callers assume a plain return, not a promise).
		 *
		 * ⚠ NONE READY REFUSES THE SPAWN — it does not fall back to the main tree (fresh-eyes
		 * review, finding 1: an earlier version did exactly that, silently recreating the very
		 * incident this feature exists to close, the moment the pool ran dry). The caller sees a
		 * clear error and can wait, retry, or spawn a `task-mastermind` instead (session-smart.md). */
		if (spec.role === "minion" && !again && !worktree_of(spec.cwd) && this.servex?.pool){
			const slot = this.servex.pool.take_sync(spec.parent ?? id);
			if (!slot) throw new Error(`No pool worktree is ready for minion "${id}" — main stays refused for minions. Wait for the pool (take_worktree/return_worktree), or spawn a task-mastermind instead.`);
			spec = { ...spec, cwd: slot.path };
			this.servex.say?.(`minion ${id} moved into pool worktree ${slot.id} — a minion never writes to the main tree`, { event: "pool", id: slot.id });
		}
		const model = spec.model ?? role_defaults(spec.role).model ?? "claude-sonnet-5-5";
		/* THE SLASH RULE (openrouter/provider.js): a caller that only passes a
		 * `model` with a `/` in it (an OpenRouter slug, e.g. `openai/gpt-6-luna`)
		 * gets the openrouter provider for free — nobody has to say `provider`
		 * by hand. An explicit `spec.provider` always wins.
		 *
		 * LOCAL MODELS (ext/local/provider.js, requirements.md Phase 3): a
		 * `local/qwen2.5-coder` id ALSO has a `/` in it, so it has to be
		 * checked FIRST — `provider_for()` itself only knows the OpenRouter
		 * half of the rule and can't be changed from here (outside this file's
		 * fence), so the `local/` prefix is caught here instead, one line
		 * ahead of the generic slash rule. */
		const provider_of = m => is_local_model(m) ? "local" : provider_for(m);
		// the role's provider goes with the role's MODEL: a caller's own `model` (e.g. a slug on a
		// `minion`) picks its provider by the slash rule, or a fast-tier minion sent `openai/...` to Anthropic (2026-10-01)
		const provider = spec.provider ?? (spec.model ? provider_of(model) : role_defaults(spec.role).provider) ?? provider_of(model);
		/* CLAUDE STAYS ON THE SUBSCRIPTION (requirements.md; review.md finding 6):
		 * an explicit `provider: "openrouter"` paired with a Claude model id would
		 * bill that model per token through the gateway instead. The slash rule
		 * above can't cause this by itself (every OpenRouter slug has a `/`), but
		 * a caller or a future tier could still say both — refuse it here, once. */
		if (provider === "openrouter" && !String(model).includes("/"))
			throw new Error(`provider "openrouter" needs an OpenRouter model id (e.g. "openai/gpt-6-luna"), not "${model}" — Claude itself stays on the subscription (openrouter/provider.js)`);
		/* THE SPEND GUARD (openrouter/provider.js, requirements.md Phase 2 item 1 —
		 * the owner's $50 OpenRouter credit): refused BEFORE an agent spends a cent,
		 * not after. spend_guard() answers from a 30s cache, never a live network
		 * call on this hot path, and fails closed — "can't check" refuses, same as
		 * "over the cap" does. */
		if (provider === "openrouter"){
			/* THE SPAWN PAUSE (openrouter-cost-blind, 2026-10-04): refused until
			 * meter() can actually price a call (below) — the same flag Echo.js's
			 * model_for() already checks for echoes, now also covering real spawns.
			 * The cost fix landed 2026-10-04 (meter() reads usage.cost), so the pause is
			 * now opt-in: set SERVEX_OPENROUTER_PAUSED=1 to stop OpenRouter spawns. */
			if (process.env.SERVEX_OPENROUTER_PAUSED !== "0" && !OR_ONLY && !/^session-(fast|smart)$/.test(spec.role ?? ""))   // OR_ONLY = the owner flipped session-backend.txt to openrouter (the wall switch): that IS the consent, or every spawn would be refused.   // the voice roles are exempt (voice model policy, 2026-10-12: the accounting gap is fixed, the owner wants them off Claude); the spend guard below still applies. PAUSED BY DEFAULT (the owner, 2026-10-08: OpenRouter accounting is not trusted; avoid it). SERVEX_OPENROUTER_PAUSED=0 re-enables.
				throw new Error(`OpenRouter spawns are paused: the owner does not trust OpenRouter accounting yet (set SERVEX_OPENROUTER_PAUSED=0 to allow)`);
			const guard = spend_guard();
			if (!guard.ok) throw new Error(`openrouter spawn refused: ${guard.reason}`);
		}
		/* Minted here for every fresh spawn (the constructor would mint the same thing later), so
		 * the first-turn line can tell the agent its own page, /framework/ai/sessions/<session_id>/. */
		const session_id = !again ? (spec.session_id ?? randomUUID()) : spec.session_id;
		/* EVERY SPAWN HAS A TASK DIR (2026-10-18): a bare spawn gets one here, `task: false` opts out (default_task below). */
		if ((spec.task === undefined || (spec.task && !spec.task.dir)) && !again){ const task = this.default_task(spec, id); if (task) spec = { ...spec, task: { ...task, ...(spec.task || {}) } }; }   // a handoff `task: {from, id}` with no dir lands in the default folder
		if (spec.task && !again) open_task(spec.task, { session_id, agent: id, by: spec.parent, model, worktree: worktree_of(spec.cwd), parent_dir: spec.parent ? this.task_dir_of?.(spec.parent) ?? this.live.get(spec.parent)?.task?.dir : null });
		if (spec.task && !again && spec.parent) this.follow_child(spec.parent, spec.task.dir, id);
		const past_work = spec.task && !again ? this.past_work(spec.task, id) : null;
		const fresh = !again && !spec.system;
		const dir = fresh ? directory_of(spec) : null;
		const in_system = !spec.system && process.env.SERVEX_ROLE_IN_SYSTEM !== "0" && !!role_system(spec.role);   // Agent.role_prompt() puts it there
		const opened = again || spec.system ? spec.prompt : this.whoami(id, session_id) + opening(spec.role, spec.prompt, { in_system });
		if (!again && !spec.system) {
			const names = injected(spec.role);
			this.store().append("skills", { at: stamp(), agent: id, role: spec.role ?? null, injected: names, where: in_system ? "system" : "message", fallback: names.length ? undefined : true }).catch(() => {});
		}
		const base = dir ? `${first_prompt(dir)}\n\n${opened}` : opened;
		const prompt = spec.task
			? `${base}\n\nYour task is already open at ${path.relative(process.cwd(), SessionRecord.log_or_old(path.resolve(spec.task.dir))).split(path.sep).join("/")}; don't run new-task, log there.${past_work ? ` Your past-work.md is beside the brief (${past_work}): read it first.` : ""}`
			: base;
		const agent = new this.constructor.Agent({
			...role_defaults(spec.role), ...spec, id, prompt, provider,
			/* NEVER-LOSE-A-WAKE, item 3: the caller's own, UNWRAPPED prompt — `prompt` above is
			 * the skill-load preamble and readme chain already baked in, which a re-queued retry
			 * (`Servex.requeue_stuck_start`) must never wrap a second time. Fresh spawns only — a
			 * resume has no prompt of its own to remember this way. */
			...(fresh && spec.prompt ? { raw_prompt: spec.prompt } : {}),
			...(session_id ? { session_id } : {}),
			...(again ? { [spec.fork ? "forked_from" : "resumed_from"]: again } : {})
		});
		agent.host = this;
		this.live.set(agent.id, agent);
		agent.start();
		this.register(agent);
		try { this.servex?.lifecycle?.agent_started(agent, spec); } catch {}   // lifecycle.jsonl: Servex/Lifecycle.js
		return agent;
	}

	/* THE DEFAULT TASK DIR (todo 178, 2026-10-18): a spawn with no `task` option still gets one, or the agent is invisible to
	 * Server/AIIndex.mjs, Servex/Landed.js, the follow-up and /tasks/. Returns the `task` spec for open_task, or null when this
	 * spawn is not a work agent: a resume, `task: false` (a throwaway probe), a standing desk (STANDING ids), a page-bound
	 * agent (its page is its home), a fork, or any agent with its own `system` brief, `sdk`, in-process tools or no settings.
	 *
	 * HOME: ai/sessions/<local day>/<caller's session folder, else "spawned">/<agent id slug>/ (TaskDirs.dir). The alternative,
	 * nesting under the caller's own task dir (CLAUDE.md: a child task lives inside its parent), is not taken because a caller
	 * with no task, a Dispatcher or a voice session has none, and one rule beats two; the line 1 `parent_task` still links
	 * the caller's task when it has one. Servex's gate may queue a spawn: then the dir opens when it starts, not when it is held.
	 * Side effect worth knowing: a task dir puts the agent under the results-gated spend guard (gated_role). */
	default_task(spec, id){
		if (spec.task === false || spec.resume || spec.system || spec.sdk || spec.mcp_servers || spec.one_shot || spec.page || !spec.prompt) return null;
		if (ONE_PASS.includes(spec.role)) return null;   // 2026-10-18: a reviewer, clarity or checker is a throwaway one-pass; its output goes in the task it reviews, not a dir of its own
		if (STANDING.test(id ?? "") || (Array.isArray(spec.setting_sources) && !spec.setting_sources.length)) return null;
		try {
			const slug = String(id).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[^a-z0-9]+/, "").slice(0, 60) || "agent";
			const caller = spec.parent && this.live.get(spec.parent);
			const in_session = caller?.session_id && fs.existsSync(DatedFiles.sessions.session_dir(caller.session_id));
			const base = in_session ? TaskDirs.dir({ slug, session_id: caller.session_id }) : path.join(DatedFiles.sessions.day_dir(), "spawned", slug);
			let dir = base, n = 1;
			while (fs.existsSync(path.join(dir, "task.jsonl")) || fs.existsSync(path.join(dir, "session.jsonl"))) dir = `${base}-${++n}`;
			const title = String(spec.prompt).split(/\r?\n/).find(l => l.trim())?.trim().slice(0, 120);
			return { dir: path.relative(process.cwd(), dir).split(path.sep).join("/"), brief: null, ...(title ? { title } : {}) };
		} catch (e){ this.store().append("servex", { type: "default-task-failed", agent: id, error: String(e.message || e) }).catch(() => {}); return null; }
	}

	/* "Does it already exist" at birth: writes <task dir>/past-work.md (Server/PastWork.mjs) before the first turn; returns its path, or null. Never fails a spawn. */
	/* LOGS OVER MESSAGES (doc/messaging.md, 2026-10-20): the parent tails its child's session log, 60 s per message,
	 * until the child stops. A real agent or a registered tab only (never the Dispatcher's stand-in). Never fails a spawn. */
	follow_child(parent, dir, child){
		const follow = this.servex?.follow;
		if (!follow || process.env.SERVEX_NO_CHILD_FOLLOW) return null;
		if (!(this.live.get(parent) instanceof this.constructor.Agent) && !this.external?.has?.(parent)) return null;
		try {
			const file = SessionRecord.log_file(path.resolve(dir));
			if (!file) return null;
			const rel = path.relative(process.cwd(), file).split(path.sep).join("/");
			follow.follow({ agent: parent, path: rel, of: child, gather_ms: Number(process.env.SERVEX_CHILD_FOLLOW_MS) || 60000 });
			return rel;
		} catch (e){ this.store().append("servex", { type: "child-follow-failed", child, parent, error: String(e.message || e) }).catch(() => {}); return null; }
	}

	past_work(task, id){
		try {
			const r = PastWork.task(path.resolve(task.dir), { brief: task.brief, title: task.title, skip_unnamed: true });
			if (!r) this.store().append("servex", { type: "past-work-skipped", agent: id, why: "brief has no title" }).catch(() => {});
			return r?.file ?? null;
		} catch (e){ this.store().append("servex", { type: "past-work-failed", agent: id, error: String(e.message || e) }).catch(() => {}); return null; }
	}

	/* An agent has to know its own id to pass it as `from` to fork_self or as
	 * `parent` to spawn_agent — nothing else tells it. One line, first turn only. */
	whoami(id, session_id){
		return `[You are Servex agent ${id}.]\n` + (session_id
			? `[Your own page is /framework/ai/sessions/${session_id}/ — pass it as \`path\` to page_set, page_add, page_call and page_read to change what the owner sees there.]\n` : "");
	}

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
			/* Queued at the spawn gate: wait for it to start, then for its turn (Servex sets when_started). */
			const began = Date.now(), started = await this.when_started?.(id, timeout_s);
			if (started) return this.wait(id, Math.max(1, timeout_s - (Date.now() - began) / 1000));
			if (this.when_started && Date.now() - began >= timeout_s * 1000 - 50) return { id, state: "queued", timed_out: true, words: null };
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
		/* ONCE PER PROCESS (2026-10-18): a second sweep in the same process would treat agents spawned since boot as the
		 * previous boot's. Servex.js calls this once; the guard keeps a reload or a second caller from re-running it. */
		if (this.revived) return this.revived;
		const reg = this.reg(), prev = reg.last_boot();
		reg.mark_boot(this.boot);
		const out = { revived: [], told: [], gone: [], legacy: [], skipped: [] }, reasons = {};
		const boot_at = parseInt(String(this.boot).split("-")[0], 36) || Date.now();   // `boot` = <base36 ms>-<pid>
		/* A restart that took a snapshot first: exactly the agents it listed come back, however long they had been idle. */
		const snap = this.restart_snapshot(prev);
		const listed = id => !!snap?.agents?.some(a => a.id === id);
		if (snap) out.snapshot = { at: snap.at, by: snap.by, agents: snap.agents.length };
		this.mark_legacy_stops(reg);
		for (const row of reg.list()){
			/* A DORMANT row had no process to lose: it stays dormant, and the first
			 * message reopens it (send -> wake -> reopen), never the boot. */
			if (this.live.has(row.id) || row.state === "stopped" || row.state === "dormant") continue;
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
				: !!prev?.boot && row.boot === prev.boot && (listed(row.id) || Date.now() - Date.parse(row.last_at ?? 0) < window_min * 60000);
			let agent = null;
			const no = ours && this.blocked(row, { landed: false });
			if (no){ out.refused = [...(out.refused ?? []), { id: row.id, why: no.why }]; reasons[row.id] = `servex restarted; not revived: ${no.text}`; if (row.state !== "gone") out.gone.push(row.id); continue; }
			/* doc/restart.md "The revive sweep skips…": never tell, or resume, an agent that has no turn to lose. */
			const skip = ours && Agents.revive_skip(row, { boot_at, has_session: !!(row.session_id && session_facts(row.session_id).file) });
			/* NEVER STARTED (the owner, 2026-10-22): it was open but had no turn and no session file, so `resume` cannot work —
			 * but it is not dead either. Start it again fresh from its own spec (same id, role, cwd, task), and point it at its brief. */
			/* Only with a task folder: the registry keeps the spec minus the prompt, so the brief there is all it can be pointed at.
			 * With none it is buried, the reason on its row (review #1). */
			const brief_dir = skip?.dead && row.revivable && (row.spec || row.cwd) ? this.task_dir_for(row) : null;
			if (brief_dir){
				try { agent = this.reopen({ ...row, session_id: undefined }); } catch {}
				if (agent){
					out.revived.push(row.id); out.told.push(row.id); out.restarted = [...(out.restarted ?? []), row.id];
					agent.send(`Servex restarted before your first turn ran, so nothing of it was kept. Start now: your brief is requirements.md in ${brief_dir}.`, { from: "servex" });
					continue;
				}
			}
			if (skip){
				out.skipped.push({ id: row.id, why: skip.why }); reasons[row.id] = `servex restarted; not revived: ${skip.why}`;
				this.store().append("servex", { type: "revive-skip", id: row.id, why: skip.why }).catch(() => {});
				if (skip.dead && row.state !== "gone") out.gone.push(row.id);
				continue;
			}
			if (ours && (legacy || row.revivable) && row.session_id)
				try { agent = this.reopen(row); } catch {}
			if (!agent){
				reasons[row.id] = `servex restarted; not revived: ${!ours ? "not open in the previous boot, or idle past the window" : !row.session_id ? "no session to resume" : "its spawn carried code (system/sdk/in-process tools), its owner spawns it again"}`;
				if (row.state !== "gone") out.gone.push(row.id);
				continue;
			}
			const id = row.id;
			out.revived.push(id);
			if (legacy) out.legacy.push(id);
			/* Every agent that comes back is told (the owner, 2026-10-22). One that was mid-turn checks its last tool call; an idle
			 * one learns its session was resumed, and that a background shell or sleep it started is gone (wake_me survives). */
			const when = snap ? ` at ${snap.at.slice(11, 16)}${snap.by ? ` (asked by ${snap.by})` : ""}` : "";
			agent.send(row.state === "working"
				? `Servex restarted${when} mid-turn; your last tool call may not have finished. Check and continue.`
				: `Servex restarted${when}. Your session was resumed and nothing was lost; any background shell or sleep you had running is gone, so set it again with wake_me if you were waiting on something. If you were idle, there is nothing to do: answer in one line.`,
				{ from: "servex" });
			out.told.push(id);
		}
		reg.bury(out.gone, "servex restarted");
		/* the reason on the row itself, not only in servex.jsonl (the owner, 2026-10-22) */
		const rows = reg.read(); let wrote = false;
		for (const [id, why] of Object.entries(reasons)) if (rows[id] && out.gone.includes(id)){ rows[id].ended = why; wrote = true; }
		if (wrote) reg.save(rows);
		this.store().append("servex", { type: "revive", boot: this.boot, previous: prev?.boot ?? null, ...out }).catch(() => {});
		return this.revived = out;
	}

	/* BEFORE A RESTART (the owner, 2026-10-22: "restarts that lose nothing"): every live agent, its state, and every pending
	 * wake-up (Wakeups.js, so a dormant agent waiting on one is listed too). Kept as restart-snapshot.json beside the registry
	 * and logged once to servex.jsonl. `sustain.mjs --restart` asks for it (POST /api/before-restart) before it kills anything;
	 * the next boot's revive() resumes exactly these agents and tells each one. Doc: Servex/doc/restart.md. */
	snapshot({ by = null } = {}){
		const wakes = this.wakeups?.list() ?? [], rows = this.reg().read();
		const agents = [...this.live.values()].filter(a => a.state !== "stopped")
			.map(a => ({ id: a.id, state: a.state, session_id: a.session_id ?? null, parent: a.parent ?? null }));
		for (const w of wakes) if (!agents.some(a => a.id === w.agent))
			agents.push({ id: w.agent, state: rows[w.agent]?.state ?? "unknown", session_id: rows[w.agent]?.session_id ?? null, parent: rows[w.agent]?.parent ?? null });
		for (const a of agents) a.wakeups = wakes.filter(w => w.agent === a.id).map(w => ({ id: w.id, due: w.due, why: w.why }));
		const snap = { boot: this.boot, at: stamp(), by, agents };
		fs.writeFileSync(this.reg().file("restart-snapshot.json"), JSON.stringify(snap, null, 2));
		this.store().append("servex", { type: "restart-snapshot", boot: this.boot, by,
			agents: agents.map(a => `${a.id}: ${a.state}${a.wakeups.length ? ` + ${a.wakeups.length} wake-up` : ""}`) }).catch(() => {});
		return snap;
	}

	/* The snapshot the previous Servex took just before it was restarted, or null after a crash (none, or an old one). Read once:
	 * the file is then renamed to restart-snapshot.used.json, so a later crash never reuses it. */
	restart_snapshot(prev, now = Date.now()){
		const file = this.reg().file("restart-snapshot.json");
		let snap = null;
		try { snap = JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
		try { fs.renameSync(file, this.reg().file("restart-snapshot.used.json")); } catch {}
		if (!prev?.boot || snap?.boot !== prev.boot || now - Date.parse(snap.at) > 15 * 60000) return null;
		return snap;
	}

	/* THE TWO REVIVE SKIPS (pure; Servex/agents/revive-skip.test.mjs). Null = revive and tell as usual.
	 *   started after this boot  — born under the new host, nothing of it crossed a restart (never buried).
	 *   no turn yet, no session  — `turns` counts COMPLETED turns and the SDK writes the session file
	 *                              only once a turn has begun, so `resume` can only fail ("No conversation
	 *                              found"); a first turn that did get far enough to leave a file is revived. */
	static revive_skip(row, { boot_at = Date.now(), has_session = false } = {}){
		const started = Date.parse(row.started_at ?? "");
		if (started > boot_at) return { why: "started after this boot", dead: false };
		if (!(row.turns > 0) && !has_session) return { why: "no completed turn and no session file to resume", dead: true };
		return null;
	}

	/* Rows stopped BEFORE the revive guard existed carry no `stopped_by` key at
	 * all, so nothing could tell a stop on purpose from a reap: mastermind-servex-6
	 * came back that way at 20:19. At boot each is marked `stopped_by: "legacy"`
	 * once, so the guard treats it as stopped on purpose (revive: true still wakes it). */
	mark_legacy_stops(reg = this.reg()){
		const rows = reg.read();
		let n = 0;
		/* Only RETIRED mastermind-servex-N rows (not the highest N): Layers, Sessions and
		 * Global stop assistants and the current mastermind routinely, and a message must
		 * still wake those. */
		const num = k => +(k.match(/^mastermind-servex-(\d+)$/)?.[1] ?? -1), top = Math.max(-1, ...Object.keys(rows).map(num));
		for (const r of Object.values(rows)) if (num(r.id) >= 0 && num(r.id) < top && ["stopped", "gone"].includes(r.state) && !("stopped_by" in r)){ r.stopped_by = "legacy"; n++; }
		if (n) reg.save(rows);
		return n;
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
		const agent = this.live.get(id) ?? this.live.get(this.successor(id));   // an old id finds its resumed successor
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
		const held = this.queued_entry?.(id);
		if (held) return held.send(text, note);   // queued at the spawn gate: held until it starts
		const no = this.blocked(this.reg().read()[id] ?? (agent ? { id, cwd: agent.cwd, stopped_by: agent.stopped_by, stopped_at: agent.stopped_at, task_dir: agent.task_dir } : null), { force: note?.revive });
		if (no){
			this.store().append("servex", { type: "revive-refused", id, why: no.why, text: no.text, from: note?.from ?? null }).catch(() => {});
			throw new Error(`Agent ${id} was not woken: ${no.text}.${no.why === "cwd-gone" ? "" : " Pass revive: true to wake it anyway."}`);
		}
		if (note?.revive) this.forget_stop?.(id);   // woken on purpose: the heartbeat's in-memory mark goes too
		return this.wake(id).send(text, note);
	}

	/* THE REVIVE GUARD (node-reliability, 2026-09-29) — the one answer to "may this
	 * stopped or gone agent be reopened?", asked by every path that reopens one:
	 * a message (send), a child's done-notice (wake_parent, via send), the boot
	 * revive and the heartbeat. Null means yes; otherwise {why, text}:
	 *   cwd-gone — the session's directory was deleted (a worktree taken down);
	 *              the SDK would fail with a misleading "native binary … libc". Never.
	 *   stopped  — stop_agent was called on it by a human or a mastermind
	 *              (`stopped_by` in its registry row).
	 *   landed   — its task.jsonl has a landing line (or closed_by).
	 * `force` (send_to_agent's `revive: true`) overrides the last two, never the first.
	 * `landed: false` skips only the landing check: the boot sweep asks it so, because a row open at the restart was ALIVE, and
	 * a long-lived mastermind lands its first task and goes on to others (2026-10-22: mastermind-figma-cards and mastermind-test
	 * were buried as "landed" while mid-work).
	 * task-mastermind-mobile-nav, landed and stopped by hand three times, kept coming back. */
	blocked(row, { force = false, landed = true } = {}){
		if (!row) return null;
		const cwd = row.spec?.cwd ?? row.cwd;
		if (cwd && !fs.existsSync(cwd)) return { why: "cwd-gone", text: `its working directory ${cwd} no longer exists` };
		if (force) return null;
		if (row.stopped_by) return { why: "stopped", text: `it was stopped on purpose by ${row.stopped_by}${row.stopped_at ? ` at ${row.stopped_at}` : ""}` };
		const dir = this.task_dir_for(row);
		if (landed && dir && task_landed(dir)) return { why: "landed", text: `its task ${path.basename(dir)} has landed` };
		return null;
	}

	/* The task dir an agent works for: its registry row (spawned with `task`),
	 * the heartbeat's owner map, or a scan of recent task logs naming it (the
	 * heartbeat supplies `find_task_dir`). */
	task_dir_for(row){
		return row.task_dir ?? this.task_dir_of?.(row.id) ?? this.find_task_dir?.(row) ?? null;
	}

	/* "mastermind-servex" is a ROLE: when a fresh session holds it as
	 * mastermind-servex-N (the old one stood down at a full context), a message
	 * to the role goes to the newest live holder instead of waking the old one. */
	/* A RESUMED SESSION'S OLD ID IS AN ALIAS OF THE NEW ONE (node-reliability, 2026-09-30).
	 * spawn_agent resuming task-mastermind-chat-hitl's session as task-mastermind-chat-hitl-2
	 * left its minions with parent = the old id, so each minion's "done" reopened the old,
	 * stopped id: a second process on the same session (12:43). An id that is not running
	 * follows its session to whoever holds it now (same session_id, or resumed_from it),
	 * newest first; chains resolve (a -> a-2 -> a-3). An id nobody resumed stays itself. */
	successor(id){
		const running = x => { const a = this.live.get(x); return a && a.state !== "stopped"; };
		if (!id || running(id)) return id;   // the hot path (every send): no disk read for a running id
		const rows = this.reg().read(), seen = new Set([id]);
		const sess = x => this.live.get(x)?.session_id ?? rows[x]?.session_id;
		const started = x => String(this.live.get(x)?.started_at ?? rows[x]?.started_at ?? "");
		let cur = id;
		while (!running(cur)){
			const s = sess(cur);
			if (!s) break;
			const ids = new Set([...this.live.keys(), ...Object.keys(rows)]);
			const next = [...ids].filter(x => !seen.has(x) && (sess(x) === s || (this.live.get(x)?.resumed_from ?? rows[x]?.resumed_from) === s)
				&& started(x) >= started(cur)).sort((a, b) => (running(b) - running(a)) || started(b).localeCompare(started(a)))[0];
			if (!next) break;
			seen.add(next); cur = next;
		}
		return cur;
	}

	holder(id){
		/* A retired mastermind-servex-N (stopped or gone) is the role too: a message
		 * or a child's report for it goes to the live holder, never reviving the old
		 * one (-4 and -5 kept coming back this way, 09-29). */
		const retired = /^mastermind-servex-\d+$/.test(id ?? "") && !(this.live.get(id) && this.live.get(id).state !== "stopped");
		if (id !== "mastermind-servex" && !retired) return this.successor(id);
		const n = s => +(s.match(/^mastermind-servex-(\d+)$/)?.[1] ?? -1);
		const best = [...this.live.values()].filter(x => x.state !== "stopped" && n(x.id) >= 0).sort((x, y) => n(y.id) - n(x.id))[0];
		if (best) return best.id;
		// nobody holds it live (the current one is idle-swept most of the time): the highest N in the registry
		const rows = Object.keys(this.reg().read()).filter(k => n(k) >= 0).sort((x, y) => n(y) - n(x));
		return rows[0] ?? id;   // nobody holds it live: the old id, which the revive guard then judges
	}

	wake(id){
		const live = this.live.get(id);
		const row = this.reg().read()[id];
		if (!live && !row) return this.get(id);          // throws, naming who IS live
		if (live?.one_shot || (live?.role ?? row?.role) === "fork")
			throw new Error(`Agent ${id} is a fork: it answered once and is not woken again.`);
		if (!live?.session_id && !row?.session_id) throw new Error(`Agent ${id} never got a session, so there is nothing to wake.`);
		const role = live?.role ?? row?.role, why = renew_why(renew_of(role), live?.started_at ?? row?.started_at, live?.context ?? row?.context);
		if (why && (!live || live.state === "stopped")){   // RENEWAL: a stopped one is spawned fresh; a live dormant one renews in awaken()
			const base = strip(live ? live.recipe() : (row.spec ?? {}));
			const fresh = this.spawn(strip({ ...base, role, id, cwd: base.cwd ?? row?.cwd, resume: undefined, fork: undefined, renewing: true,
				prompt: renewal_text(id, live?.session_id ?? row?.session_id, why) }));
			fresh.emit?.({ type: "renew", why, replaces: live?.session_id ?? row?.session_id, session: fresh.session_id });
			return fresh;
		}
		return this.reopen({ ...row, ...(live ? { spec: live.recipe(), session_id: live.session_id } : {}), id });
	}

	/* Reopen a registry row's session as a live agent under the same id: its
	 * recorded `spec` when it has one, else the row's own fields; where the
	 * session ran and its model come from the session file when the row does
	 * not say. Shared by `wake()` and `revive()`. */
	reopen(row){
		const keys = ["role", "name", "topics", "page", "parent", "visibility", "model", "provider", "effort", "cwd",
			"permission_mode", "allowed_tools", "setting_sources", "budget_usd"];
		const base = strip(row.spec ?? Object.fromEntries(keys.map(k => [k, row[k]])));
		const facts = base.cwd && base.model ? {} : session_facts(row.session_id);
		const cwd = base.cwd ?? facts.cwd;
		if (!cwd) throw new Error(`Cannot find where session ${row.session_id} ran, so it cannot be resumed.`);
		const logged = this.log_cost(row.id);   // the log, not row.cost: rows saved before 2026-10-23 carry the inflated wake-up turns
		return this.spawn(strip({ ...base, cwd, model: base.model ?? facts.model,
			id: row.id, started_at: row.started_at, resume: row.session_id,
			cost: logged.cost || Number(row.cost) || 0, proc_cost: logged.sdk_total, turns: row.turns ?? 0 }));
	}

	/* A task's cost: logged_cost summed over the agents whose task dir is this task's (`task` = its app path or dir). Task.cost reads it. */
	task_cost(task){
		if (!task) return 0;
		const want = String(task).startsWith("/") && !fs.existsSync(task) ? path.resolve(MAIN_ROOT, "public", "." + task) : path.resolve(MAIN_ROOT, task);   // resolve, not join: a url path ends in "/", and the keys have no trailing separator
		return (this.task_dirs().get(want.toLowerCase()) ?? []).reduce((s, id) => s + this.logged_cost(id), 0);
	}

	/* Registry rows by task dir (resolved, lower case), rebuilt at most once a minute: a session of 150 tasks asks task_cost 150 times,
	 * and each used to walk all 3,000+ registry rows. */
	task_dirs(){
		if (this._task_dirs && Date.now() - this._task_dirs.at < 60e3) return this._task_dirs.map;
		const map = new Map();
		for (const row of Object.values(this.reg().read())){
			let dir = null; try { dir = this.task_dir_for(row); } catch {}
			if (dir){ const k = path.resolve(MAIN_ROOT, dir).toLowerCase(); (map.get(k) ?? map.set(k, []).get(k)).push(row.id); }
		}
		this._task_dirs = { at: Date.now(), map };
		return map;
	}

	/* The agents whose task lives in or below `dir` (a session's folder): its child sessions, found by place (Session.agents_resolver). */
	agents_under(dir){
		const root = path.resolve(MAIN_ROOT, dir).toLowerCase(), rows = this.reg().read(), out = [];
		for (const [k, ids] of this.task_dirs()) if (k === root || k.startsWith(root + path.sep)) for (const id of ids){
			const r = rows[id] ?? {};
			out.push({ id, parent: r.parent ?? null, role: r.role ?? null, state: this.live.get(id)?.state ?? r.state ?? null, session_id: r.session_id ?? null,
				cost: Math.round(this.logged_cost(id) * 100) / 100, started_at: r.started_at ?? null });
		}
		return out.sort((a, b) => String(a.started_at).localeCompare(String(b.started_at)));
	}

	/* The total recomputed from the records: every `turn_cost` in the agent's own log (Agent.result writes one per turn). */
	logged_cost(id){ return this.log_cost(id).cost; }

	/* { cost, sdk_total } from the agent's log: its turns rebuilt by turn_costs() (turn-costs.js says why a log needs rebuilding). */
	log_cost(id){
		let text; try { text = fs.readFileSync(this.store().file(`agent-${id}`).path, "utf8"); } catch { return { cost: 0, sdk_total: 0 }; }
		const { turns, sdk_total } = turn_costs(text, { openrouter: this.reg().read()[id]?.provider === "openrouter" });
		return { cost: turns.reduce((n, t) => n + t.cost, 0), sdk_total };
	}
	interrupt(id){ return this.get(id).interrupt(); }
	/* Continue (+$5) on a spend-gate card: raise the allowance and send the agent on its
	 * way. The agent was interrupted to be gated, so raising the allowance alone leaves it
	 * sitting idle with more money and nothing telling it to go on — one line does that.
	 * It may also have left `live` by the time the owner answers (idle-swept, or a Servex
	 * restart): revive it first, the same door `send()` uses (review.md finding 2), so a
	 * late Continue is never lost to "No agent …". */
	grant(id, usd = 5){
		id = this.holder(id);
		let agent = this.live.get(id);
		if (!agent || agent.state === "stopped"){
			const row = this.reg().read()[id] ?? (agent ? { id, cwd: agent.cwd, stopped_by: agent.stopped_by, stopped_at: agent.stopped_at, task_dir: agent.task_dir } : null);
			const no = this.blocked(row, { force: true });   // the owner answering IS the reason to wake it
			if (no){
				this.store().append("servex", { type: "spend-gate", event: "grant-refused", agent: id, why: no.why }).catch(() => {});
				return null;
			}
			try { agent = this.wake(id); }
			catch (e){
				this.store().append("servex", { type: "spend-gate", event: "grant-failed", agent: id, why: String(e.message || e) }).catch(() => {});
				return null;
			}
		}
		agent.grant(usd);
		try { agent.send(`Servex: the owner gave you $${usd} more — continue.`, { from: "servex", revive: true }); } catch {}
		return agent;
	}
	/* `by` (the stop_agent tool: who called it) marks a stop ON PURPOSE: it goes
	 * into the registry row, and the revive guard honours it across restarts.
	 * Servex's own stops (reaper, one-pass roles) pass nothing. A row with no
	 * live agent (gone after a restart) can still be marked. */
	stop(id, { by } = {}){
		if (this.unqueue?.(id)) return { card: () => ({ id, state: "stopped", note: "removed from the spawn queue before it started" }) };
		const agent = this.live.get(id);
		if (!agent){
			const rows = this.reg().read();
			if (!rows[id]) return this.get(id);          // throws, naming who IS live
			if (by){ rows[id] = { ...rows[id], stopped_by: by, stopped_at: stamp(), state: rows[id].state === "gone" ? "gone" : "stopped" }; this.reg().save(rows); }
			return { card: () => ({ id, state: rows[id].state, stopped_by: rows[id].stopped_by ?? null }) };
		}
		if (!by) return agent.stop();
		agent.stopped_by = by; agent.stopped_at = stamp();
		const out = agent.stop();
		this.register(agent);   // Agent.stop() returns early for one already stopped (reaped idle): the mark must still be written
		return out;
	}

	list(){ return [...this.live.values()].map(agent => agent.card()); }

	/* THE WORKING CAP (dormant-idle, 2026-09-30): at most `working_cap` agents
	 * WORKING at once (SERVEX_WORKING_CAP, default 5). Every working agent counts
	 * for itself, so a task mastermind with two working minions holds three of
	 * the five. Not counted: the standing front desk (assistants, managers,
	 * master-assistant, voice sessions, the Dispatcher stand-in) and an agent
	 * blocked in wait_for_agent. Global.admit() queues a new spawn above it. */
	get working_cap(){ return Number(process.env.SERVEX_WORKING_CAP) || 5; }

	/* NEVER-LOSE-A-WAKE, item 2 (2026-10-01): a row counts toward the cap only while its
	 * claude.exe is actually alive — `claude_pid` and a direct `process.kill(pid, 0)`, the same
	 * test `Registry.js`'s own sweep uses. Before this, the awaken race (item 1; `sleep()`'s
	 * queue closing a moment before `send()`'s own push, item 5) could leave a row stuck
	 * "working" with no process at all — a PHANTOM that held one of the 5 working slots
	 * forever, with nothing to ever free it. A row just spawned (no pid YET, because
	 * `spawn_claude` has not had its first tick — `pump()` only runs it once this synchronous
	 * call returns) still counts, inside `STARTING_GRACE_MS`, so a burst of spawns in the same
	 * tick cannot slip past the cap in that gap. Past the grace: a WORKING row with no live
	 * process is the phantom (`mark_phantom`, logged once, set idle, never counted again); a
	 * STARTING row that old never got a process at all, which is item 3's job (the one-minute
	 * reconcile in Servex.js owns the actual re-queue — this method only excludes it from the
	 * count, since re-queuing needs the spawn gate's own queue, which this class does not hold). */
	working(){
		const rows = [...this.live.values()].filter(a => (a.state === "working" || a.state === "starting")
			&& !a.waiting_on && !STANDING.test(a.id ?? "") && a instanceof Agents.Agent);
		const out = [];
		for (const a of rows){
			if (a.claude_pid && alive(a.claude_pid)){ out.push(a); continue; }
			const age = Date.now() - (Date.parse(a.started_at) || Date.now());
			if (age < STARTING_GRACE_MS){ out.push(a); continue; }   // just spawned: no pid yet, still counts
			if (a.state === "working") this.mark_phantom(a);        // dead process, holding a slot: freed here
			// a STARTING row this old never started at all: left for item 3's reconcile to re-queue
		}
		return out;
	}

	/* Logged once per phantom. `marked_phantom` is reset the moment this agent next actually
	 * awakens (`awaken()`), so a second, later phantom episode on the SAME agent object is still
	 * caught — it only guards against re-logging the one episode over and over on every
	 * `working()` call.
	 *
	 * ⚠ Set `dormant`, not `idle` (fresh-eyes review finding 3 — the brief's own first sentence
	 * said "idle", and this is the one place this task diverges from it, on purpose): an `idle`
	 * agent's `send()` just pushes straight onto `this.queue` with no further check, so a real
	 * message to this row would land in the SAME dead queue nothing is reading any more —
	 * accepted, never delivered, and with `marked_phantom` already true this method would never
	 * get a second chance to notice. `dormant` makes `send()` call `awaken()` first, which is the
	 * path that actually starts a fresh process and replays anything still waiting — so whatever
	 * was sitting in the dead queue, unconsumed, is carried over to `held_messages` here (the
	 * same mechanism item 5 built for `sleep()`'s own queue.close()), never abandoned with it. */
	mark_phantom(agent){
		if (agent.marked_phantom) return;
		agent.marked_phantom = true;
		const pending = agent.queue?.items?.splice(0) ?? [];
		if (pending.length) (agent.held_messages ??= []).push(...pending);
		try { agent.queue?.close(); } catch {}
		try { agent.query?.close?.(); } catch {}
		try { agent.aborter?.abort?.(); } catch {}
		agent.state = "dormant";
		agent.dormant_at = stamp();
		const msg = `${agent.id} was "working" with no live process (the awaken race) — set dormant, its cap slot freed`;
		this.servex?.say?.(msg, { event: "phantom", id: agent.id });
		this.store().append("servex", { type: "phantom", id: agent.id, role: agent.role ?? null, held: pending.length || undefined }).catch(() => {});
		this.register(agent);
		agent.settle?.();
	}

	counts(){
		const all = [...this.live.values()].filter(a => a instanceof Agents.Agent);
		const n = s => all.filter(a => a.state === s).length;
		return { working: this.working().length, cap: this.working_cap, idle: n("idle"), dormant: n("dormant") };
	}

	get live_cap(){ return Number(process.env.SERVEX_MAX_RUNNING_AGENTS) || 30; }

	/* AT MOST 30 RUNNING (An assistant on every page, 2026-09-25): before any spawn,
	 * if 30 agents are live, stop the longest-idle page assistant first. Never stop
	 * a working agent or a mastermind. */
	enforce_live_cap(except_id = null){
		const live = [...this.live.values()].filter(a => a && a.state !== "stopped" && a.state !== "gone" && a.id !== except_id);
		const over = live.length - (this.live_cap - 1);
		if (over <= 0) return;
		const eligible = live.filter(a => {
			if (a.state === "working" || a.state === "starting") return false;
			if (a.role === "mastermind" || a.role === "task-mastermind" || a.role === "page-mastermind" || a.role?.includes("mastermind") || a.id?.startsWith("mastermind") || a.id?.startsWith("task-mastermind") || a.id?.startsWith("manager-")) return false;
			if (a.id === "master-assistant" || a.role === "master-assistant") return false;
			return a.role === "page-assistant" || a.role === "card-assistant" || a.role === "assistant" || a.id?.startsWith("assistant-");
		});
		const last_time = a => (this.servex?.agents?.layers?.touched?.get(a.id) ?? (a.last_at ? Date.parse(a.last_at) : null) ?? (a.started_at ? Date.parse(a.started_at) : 0));
		eligible.sort((a, b) => last_time(a) - last_time(b));
		for (const a of eligible.slice(0, over)){
			try {
				this.stop(a.id, { by: "cap-30" });
				this.store().append("servex", { type: "cap-30", id: a.id, reason: `cap is ${this.live_cap} live agents: stopped longest-idle page assistant` }).catch(() => {});
			} catch {}
		}
	}

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
		/* A turn that ended with no words and no cost is a start that never happened (a blocked first prompt, a hook timeout), not "done". */
		if (kind === "done" && !fork && !child.last_text?.trim() && !(child.cost > 0)){
			kind = "error";
			child.last_error = "ended its first turn with no output and no cost: its prompt was probably blocked (a hook timeout). Treat it as a failed start and respawn it.";
		}
		const text = kind === "error" ? child.last_error : fork ? (child.words ?? child.last_text) : child.last_text;
		const body =(fork ? `fork answer: ${(text ?? "").slice(0, 4000)}` : `${kind}: ${(text ?? "").slice(0, 4000)}`);
		child.woke = true;
		/* THE NEXT STEP, in node (2026-10-13): a landed task tells its parent which queued sibling it unblocks, with the brief's path. */
		const next = kind === "done" && child.task?.dir && task_landed(child.task.dir) ? next_briefs(child.task.dir) : [];
		const note = next.length ? `\n\nNext: ${next.map(n => `${n.dir}${n.brief ? ` (brief ${n.brief})` : ""}`).join("; ")}. Its \`after\` edge is met; start it.` : "";
		this.inbox(child, kind, text);
		if (this.closing) return;   // Servex is shutting down: the inbox has it; revive nobody
		child.parent = this.holder(child.parent);   // a child of a retired mastermind-servex-N reports to the live one
		const parent = this.live.get(child.parent), by = this.stopped_on_purpose?.(child.parent)
			?? (row => row?.stopped_by ? { by: row.stopped_by } : null)(this.reg().read()[child.parent]);
		if (by && (!parent || parent.state === "stopped")){   // stopped on purpose: the inbox has it; never revived by a child
			this.store().append("servex", { type: "wake-skipped", child: child.id, parent: child.parent, stopped_by: by.by }).catch(() => {});
			return;
		}
		/* Through the HOST's send(), which revives a stopped parent — `get(parent).send()`
		 * threw "has stopped" into an empty catch, and results were lost (task-loop, 09-29). */
		try { this.send(child.parent, body + note, { from: child.id, reply_to: `log agent-${child.parent}` }); }
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
				?? (up && fs.existsSync((SessionRecord.log_file(up) ?? path.join(up, "task.jsonl"))) ? up : null);
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
export function open_task(task, { session_id, agent, by, model, worktree, parent_dir }){
	// An old-shaped dir (ai/YYYY-MM-DD/<slug>/) from a brief goes to the task store instead (Server/TaskDirs.mjs,
	// ai/doc/task-folders.md); task.dir is rewritten so everything after this (directory_of, the inbox) sees the real place.
	const dir = TaskDirs.normalize(path.isAbsolute(task.dir) ? task.dir : path.join(process.cwd(), task.dir), session_id);
	task.dir = path.relative(process.cwd(), dir).split(path.sep).join("/");
	if (task.parent_task) task.parent_task = TaskDirs.follow(path.resolve(task.parent_task));
	fs.mkdirSync(dir, { recursive: true });
	/* NESTED TASKS: `parent_task` (the parent's task dir, repo-relative, forward
	 * slashes) and `after` (sibling task dirs this one waits for) — the tree
	 * ai/AITask/tree.js draws. */
	// `worktree` (lifecycle, 2026-09-29): on-landing.mjs finds the task's worktree through it.
	const rel = d => d && path.relative(process.cwd(), path.resolve(d)).split(path.sep).join("/");
	const parent_task = rel(task.parent_task ?? parent_dir);
	// `after` is task dirs in the same form as parent_task, so the tree matches them exactly.
	const after = Array.isArray(task.after) && task.after.length ? task.after.map(rel) : undefined;
	const line = JSON.stringify({ assign: strip({ session_id, agent, card: task.card, brief: task.brief, title: task.title,
		model, worktree: task.worktree ?? worktree, parent_task, after, home: task.home, requested_at: stamp(), now: "starting" }) });
	/* A new session folder (directly under a day, its own session_id on line 1) starts as session.jsonl; a task folder keeps task.jsonl. */
	fs.appendFileSync(SessionRecord.start_file(dir, JSON.parse(line)), line + "\n");
	// A task folder under a session or another task counts as its task: the parent's log gets one {"task":"<url>"} reference (never twice).
	// A handoff (`task: {from, id}`) is referenced by move_item's own `as` line; a second plain one would replay as a twin child, so link only without a handoff (or when it is refused, below).
	const link = () => { try { SessionRecord.link_parent(dir, "Servex", { parent: parent_task && path.resolve(parent_task), session_id }); } catch (e){ console.warn("link_parent failed for", dir, e); } };
	const handoff = !!(task.from && task.id);
	if (!handoff) link();
	// Handoff by task: `task: {from, id}` moves that subtask out of the spawner's log into this folder (page_tools.js move_item).
	// Not awaited (open_task is synchronous): the history lands just after the first turn starts. A refusal is written into the new log, so it is seen.
	if (handoff){
		const log = SessionRecord.start_file(dir, JSON.parse(line)), refused = why => { fs.appendFileSync(log, JSON.stringify({ handoff: { from: task.from, id: task.id, refused: why }, by: "servex", ts: stamp() }) + "\n"); link(); };
		move_item({ from: task.from, id: task.id, to: "/" + path.relative(path.join(process.cwd(), "public"), dir).split(path.sep).join("/") + "/", by: task.by ?? by ?? "spawn" })
			.then(r => { if (r.why) refused(r.why); }, e => refused(String(e.message || e)));
	}
	return dir;
}

/* Queued siblings a landed task unblocks: task dirs next to it whose `assign.after` names it, that no agent has
 * started, and whose every `after` has landed. [{dir, brief}], repo-relative like `after` itself. */
export function next_briefs(dir){
	const here = path.relative(process.cwd(), path.resolve(dir)).split(path.sep).join("/"), out = [];
	let names; try { names = fs.readdirSync(path.dirname(path.resolve(dir)), { withFileTypes: true }); } catch { return out; }
	for (const e of names){
		if (!e.isDirectory()) continue;
		const sib = path.join(path.dirname(path.resolve(dir)), e.name), file = (SessionRecord.log_file(sib) ?? path.join(sib, "task.jsonl"));
		let state = {}; try { for (const raw of fs.readFileSync(file, "utf8").split("\n")){ const o = raw.trim() && JSON.parse(raw); if (o?.assign) Object.assign(state, o.assign); } } catch { continue; }
		if (state.agent || !Array.isArray(state.after) || !state.after.includes(here)) continue;
		if (!state.after.every(a => task_landed(path.resolve(a)))) continue;
		out.push({ dir: path.relative(process.cwd(), sib).split(path.sep).join("/"), brief: state.brief ?? null });
	}
	return out;
}

/* A task has landed: its log replays (Task.replay) to complete or stopped. The one rule is Servex/Landed.js. */
export function task_landed(dir){ return Landed.of_dir(dir); }

/* The worktree a cwd sits in (C:/Code/lew42/worktrees/<slug>/...), or undefined. */
function worktree_of(cwd){
	const m = String(cwd ?? "").match(/^(.*[\\/]worktrees[\\/][^\\/]+)/);
	return m ? m[1] : undefined;
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

/* The standing front desk: never counted against the working cap. */
export const STANDING = /^(assistant-|manager-|master-assistant|session-|dispatcher$)/;

/* Item 2's own grace window: a row this young with no `claude_pid` yet is just booting, not a
 * phantom — `spawn_claude` only runs once the SDK's async pump gets its first tick, which is
 * always AFTER the synchronous `spawn()` call that started it returns. */
export const STARTING_GRACE_MS = Number(process.env.SERVEX_STARTING_GRACE_MS) || 5000;


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
			model: "claude-sonnet-5-5",
			provider: "anthropic",
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
		/* Baseline for the real-cost diff (see `refresh_or_cost()`): read the
		 * key's running total BEFORE the first turn, so the first result() call
		 * has something to subtract from. Fire-and-forget — a slow or failing
		 * read just means the first turn's cost stays whatever the SDK guessed
		 * until the next turn settles it. */
		if (this.provider === "openrouter") this.refresh_or_cost();
		/* The SDK's total_cost_usd is the SESSION's total: a resumed process (awaken, reopen) starts from the cost the session
		 * already had, not from 0 (measured 2026-10-23: minion-review-page's five wake-up turns each logged the whole session,
		 * $8–12, for a $0.06–0.16 turn). So a resume keeps the last total it saw (reopen seeds it from the log); a fresh session starts
		 * at 0. A fork also starts at 0, so its cost still includes its base's: Experts subtracts that (doc/experts.md), so leave it. */
		if (!this.resume || this.fork) this.proc_cost = 0;
		this.query = query({ prompt: this.queue.stream(), options: this.options() });
		this.pump(this.gen = (this.gen ?? 0) + 1);
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
		const keys = ["role", "name", "topics", "page", "parent", "visibility", "model", "provider", "effort", "cwd",
			"permission_mode", "allowed_tools", "setting_sources", "system"];
		return strip(Object.fromEntries(keys.map(k => [k, this[k]])));
	}

	/* Resolves when this agent is idle (turn over, nothing queued) or stopped
	 * — at once if it already is. `settle()` is what resolves it. */
	idle(){
		if (this.state === "idle" || this.state === "stopped" || this.state === "dormant") return Promise.resolve(true);
		return new Promise(resolve => (this.waiters ??= []).push(resolve));
	}

	settle(){
		if (this.state !== "idle" && this.state !== "stopped" && this.state !== "dormant") return;
		(this.waiters ?? []).splice(0).forEach(resolve => resolve(true));
	}

	/* A fork's "no tools": every call not in `fork_tools` is refused before it
	 * runs. The tools stay IN the prompt — removing them breaks the cache. */
	refusal(theirs = this.sdk?.hooks ?? {}){
		const allowed = this.fork_tools ?? [];
		const deny = async input => allowed.includes(input.tool_name) ? {} : {
			hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny",
				permissionDecisionReason: `You are a fork answering one question; ${input.tool_name} is not allowed.`
					+ (allowed.length ? ` Only: ${allowed.join(", ")}.` : " Answer from what you already know.") }
		};
		return { hooks: { ...theirs, PreToolUse: [...(theirs.PreToolUse ?? []), { hooks: [deny] }] } };
	}

	/* THE ROLE IN THE SYSTEM PROMPT (the owner, 2026-10-23; public/framework/ai/doc/context-drift.md). The role readme and
	 * its skills (roles.js role_system) go into the claude_code preset's `append`. A first message is summarized by
	 * /compact; the system prompt is kept, and re-rendered from these options at each compaction. Before this, a plain
	 * spawn passed no systemPrompt, which the SDK sends as an EMPTY custom prompt (`systemPrompt: [""]` in every Servex
	 * transcript), so these agents ran without Claude Code's own prompt too. The SDK records the prompt on a session's first
	 * request; an older session keeps its recorded one until its next compaction. SERVEX_ROLE_IN_SYSTEM=0 restores the
	 * old way. */
	role_prompt(){
		if (process.env.SERVEX_ROLE_IN_SYSTEM === "0" || this.system) return null;
		const append = role_system(this.role);
		return append ? { type: "preset", preset: "claude_code", append } : null;
	}

	/* THE ROLE REMINDER (context drift, the owner 2026-10-23). A system prompt fades hundreds of thousands of tokens
	 * later, so a few lines (roles.js role_reminder: the readme's path, its top rules and headings) are added as hook
	 * context after each compaction and each time the context grows another `remind_tokens` (SERVEX_REMIND_TOKENS,
	 * 100k). Carried by the next UserPromptSubmit or main-thread PostToolUse hook, so it also reaches a long turn that
	 * no new message interrupts. SERVEX_ROLE_REMINDER=0 turns it off. */
	reminder_text(){
		/* An agent with its own system prompt (the voice pair, the directory mastermind) has no role text to point back to. */
		if (process.env.SERVEX_ROLE_REMINDER === "0" || this.one_shot || this.system) return null;
		const text = role_reminder(this.role);
		return text && !this.role_prompt() ? text.replace("Your full role text is in your system prompt and at", "Your full role text is at") : text;
	}

	live_context(){
		const c = this.last_usage;
		return c ? (c.input_tokens ?? 0) + (c.cache_read_input_tokens ?? 0) + (c.cache_creation_input_tokens ?? 0) + (c.output_tokens ?? 0) : (this.context ?? 0);
	}

	/* "compaction", "tokens" or null. */
	reminder_due(context = this.live_context()){
		if (!this.reminder_text()) return null;
		if (this.remind_compacted) return "compaction";
		const step = this.host?.remind_tokens ?? (Number(process.env.SERVEX_REMIND_TOKENS) || REMIND_TOKENS);
		return context >= (this.reminded_context ?? 0) + step ? "tokens" : null;
	}

	remind_hook(event, input = {}){
		if (input.agent_id) return {};   // a subagent's own tool call: the reminder is for the main thread
		const context = this.live_context(), why = this.reminder_due(context);
		if (!why) return {};
		this.remind_compacted = false;
		this.reminded_context = context;
		this.emit({ type: "role_reminder", why, event, context });
		return { hookSpecificOutput: { hookEventName: event, additionalContext: this.reminder_text() } };
	}

	/* The SDK hooks: the spec's own, the role reminder's two, and a fork's refusal. */
	sdk_hooks(){
		let h = this.sdk?.hooks ?? {};
		if (this.reminder_text()) h = { ...h,
			UserPromptSubmit: [...(h.UserPromptSubmit ?? []), { hooks: [async input => this.remind_hook("UserPromptSubmit", input)] }],
			PostToolUse: [...(h.PostToolUse ?? []), { hooks: [async input => this.remind_hook("PostToolUse", input)] }] };
		return this.one_shot ? this.refusal(h).hooks : h;
	}

	/* The SDK options, in one overridable place. `includePartialMessages` gives a
	 * UI its token stream; `forwardSubagentText` gives it the nested transcript of
	 * anything this agent itself spawns. Both names verified against 0.3.280. */
	options(){
		const door = this.door();
		return {
			model: this.model,
			effort: this.effort,
			cwd: this.cwd,
			abortController: this.aborter,
			includePartialMessages: true,
			forwardSubagentText: true,
			permissionMode: this.permission_mode,
			...door,
			...(this.permission_mode === "bypassPermissions" ? { allowDangerouslySkipPermissions: true } : {}),
			...(this.allowed_tools ? { allowedTools: this.allowed_tools } : {}),
			...(this.setting_sources ? { settingSources: this.setting_sources } : {}),
			...(this.system ? { systemPrompt: this.system } : this.role_prompt() ? { systemPrompt: this.role_prompt() } : {}),
			...(this.resume ? { resume: this.resume } : {}),
			...(this.resume && this.fork ? { forkSession: true } : {}),
			...(this.minted ? { sessionId: this.session_id } : {}),
			spawnClaudeCodeProcess: o => this.spawn_claude(o),
			...this.sdk,
			/* `sdk.env` names the same options key `door.env` just set, so `...this.sdk` above
			 * would otherwise REPLACE it instead of adding to it (review finding 7,
			 * dictate-without-claude 2026-10-04 — found live: a session spec's `sdk.env` wiped
			 * the OpenRouter credentials `door()` had just built). `door.env` goes first so a
			 * caller's own flag can still win a real conflict. */
			...(door.env || this.sdk?.env ? { env: { ...door.env, ...this.sdk?.env } } : {}),
			/* GEMINI TOOL-SCHEMA GAP (openrouter/provider.js): merged in AFTER
			 * `...this.sdk` so it always applies even when a spec sets its own
			 * disallowedTools for an unrelated reason. */
			...(this.provider === "openrouter" && disallowed_tools_for(this.model).length
				? { disallowedTools: [...new Set([...(this.sdk?.disallowedTools ?? []), ...(door.disallowedTools ?? []), ...disallowed_tools_for(this.model)])] }
				: door.disallowedTools ? { disallowedTools: [...new Set([...(this.sdk?.disallowedTools ?? []), ...door.disallowedTools])] } : {}),
			hooks: this.sdk_hooks()
		};
	}

	/* THE REAL PROCESS (process-monitor, 2026-09-30). Servex starts the claude.exe
	 * itself, the way the SDK's own local spawn does (pipes, hidden window, the
	 * SDK's forwarded abort signal), so it knows the PID: `claude_pid` on the
	 * agent and its registry row, and a `process` line in the agent's log.
	 * "Running" on the dashboards means this PID is alive (Servex/Processes.js).
	 * stderr is drained here (an unread pipe would stall the child); its last
	 * 4 KB stay on the agent as `stderr_tail`, and a spec's own `sdk.stderr`
	 * still hears every chunk. */
	spawn_claude({ command, args, cwd, env, signal }){
		const child = spawn(command, args, { cwd, env, signal, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
		child.on("error", e => this.emit({ type: "process", state: "failed", error: e.message }));
		child.stderr.setEncoding("utf8");
		child.stderr.on("data", d => {
			this.stderr_tail = ((this.stderr_tail ?? "") + d).slice(-4000);
			try { this.sdk?.stderr?.(d); } catch {}
		});
		const pid = child.pid ?? null;
		this.claude_pid = pid;
		this.claude_started = stamp();
		this.emit({ type: "process", state: "started", pid });
		try { this.host?.register(this); } catch {}
		child.on("exit", (code, sig) => {
			if (this.claude_pid === pid) this.claude_pid = null;
			this.emit({ type: "process", state: "exited", pid, code, signal: sig ?? null });
		});
		return child;
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
		/* OPENROUTER (Servex/ext/openrouter/provider.js): four env vars swap the
		 * SDK's own Anthropic call for an OpenRouter one; read once here, right
		 * before the process spawns, so a missing key fails this agent's own
		 * start() with one clear line instead of a confusing SDK auth error. */
		const or_env = this.provider === "openrouter" ? env_for("openrouter")
			: this.provider === "local" ? local_env_for("local") : null;   // ext/local/provider.js: same trick, points at Servex's own proxy instead
		const url = this.mcp_url ?? this.host?.mcp_url;
		/* SERVEX_TASK: absolute path of this agent's task.jsonl in the MAIN tree (Servex runs there), read by Server/git-hooks/post-commit.mjs. */
		const task_env = this.task?.dir ? { SERVEX_TASK: SessionRecord.log_file(path.resolve(MAIN_ROOT, this.task.dir)) ?? path.resolve(MAIN_ROOT, this.task.dir, "task.jsonl") } : null;
		/* a host with no HTTP door (fork-proof.mjs) still passes the spawn's own in-process
		 * servers, and still needs the env — `(or_env || this.env)`, not just `or_env` (review
		 * finding 1, dictate-without-claude 2026-10-04): the old check dropped a spec's own
		 * `this.env` whenever there was no provider env to merge it with, silently losing it on
		 * today's default Claude path. */
		if (!url) return strip({ mcpServers: this.mcp_servers, env: (or_env || this.env || task_env) ? { ...process.env, ...or_env, ...task_env, ...this.env } : undefined });

		/* The page tools in-process, as `mcp__local__*` (step 12, Servex/doc/item-tool.md); the HTTP twins are
		 * disallowed so each tool shows once. `SERVEX_LOCAL_TOOLS=0` keeps HTTP only. */
		const local = process.env.SERVEX_LOCAL_TOOLS === "0" ? null : local_page_tools(this.id, agent_log(this));
		return {
			mcpServers: { servex: { type: "http", url: url + (url.includes("?") ? "&" : "?") + "as=" + encodeURIComponent(this.id) }, ...(local ? { local: local.server } : {}), ...this.mcp_servers },
			...(local ? { disallowedTools: local.twins } : {}),
			env: { ...process.env, SERVEX_MCP: url, ...(or_env ?? {}), ...task_env, ...this.env }
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
		const head = [from && `from: ${from}`, reply_to && `reply to: ${reply_to} (once: in the turn that answers this message, never after it unless a new message arrives)`].filter(Boolean).join(" · ");
		return head ? `[${head}]\n${text}` : text;
	}

	/* NEVER-LOSE-A-WAKE, item 5 (2026-10-01): `awaken()`, called just above when this agent was
	 * dormant, can — through `register()`'s own idle sweep, in the very same tick — decide to go
	 * straight back to sleep before this method ever gets to push its own turn (the exact race
	 * that started this task: the register() call INSIDE awaken() used to find a stale idle
	 * clock and re-close the brand new queue before the line below could use it). Item 1's clock
	 * reset and the belt in `sleep()` close that window; this is the second, independent net —
	 * `queue.push()` now says whether the queue was actually open to take it, and a push that
	 * missed is held on `held_messages`, never silently gone. The very next `awaken()` replays
	 * it first, before anything else. */
	send(text, { from, reply_to, priority } = {}){
		if (this.state === "stopped") throw new Error(`Agent ${this.id} has stopped.`);
		const skip = this.watchdog_refusal(from);
		if (skip) return this.watchdog_skipped(from, skip);
		if (this.state === "dormant") this.awaken(from);
		this.emit({ type: "agent_msg", from: from ?? null, reply_to: reply_to ?? null, priority: priority ?? null, text });
		const turn = this.turn(this.envelope(text, { from, reply_to }), priority);
		if (!this.queue.push(turn)){
			(this.held_messages ??= []).push(turn);
			this.emit({ type: "held", why: "the queue closed before this message could be pushed; it will be replayed on the next awaken" });
			this.state = "dormant";   // honest: nothing is running to receive it right now
			this.host?.register?.(this);
			return this;
		}
		this.state = "working";
		this.host?.register?.(this);
		return this;
	}

	async interrupt(){
		if (this.state === "dormant") return this;   // no process, no turn to cut
		try { await this.query.interrupt(); }
		catch (e){ this.emit({ type: "error", where: "interrupt", text: String(e.message || e) }); }
		this.state = "idle";
		this.host?.register?.(this);
		this.settle();
		return this;
	}

	/* DORMANT (dormant-idle, 2026-09-30). An idle agent's claude process EXITS, and
	 * everything else stays: this same object in `live`, its id, session id, spec,
	 * sdk hooks and in-process MCP servers, and its registry row (state `dormant`).
	 * The next `send()` resumes the session in place (`awaken()`), so a dormant
	 * agent answers to its id exactly as an idle one did, a few seconds later. An
	 * idle process held 250-400 MB; a dormant one holds nothing. It is not a stop:
	 * no result event, no parent wake, and the heartbeat and lifecycle still count
	 * it alive. Refused while a background task runs (a Bash or Monitor it waits on
	 * would die with the process). Global.sweep() calls it after 3 idle minutes. */
	sleep(why = "idle"){
		if (this.state !== "idle" || this.one_shot || !this.session_id) return false;
		/* ⚠ PHANTOMS (2026-10-01): awaken() registers, the registration runs the idle sweep,
		   and the sweep saw an idle clock from BEFORE the sleep. So the agent went straight
		   back to sleep in the same millisecond, its new queue closed, and the waking message
		   was lost while send() marked it "working" with no process. An agent awoken in the
		   last minute is never put back to sleep. */
		if (this.awoken_at && Date.now() - this.awoken_at < 60_000) return false;
		if (this.bg_tasks > 0) return false;
		/* COMPACT BEFORE SLEEP (the owner, 2026-10-23, doc/dormant.md "Compaction"): a big context
		 * compacts first, then sleeps, so the next wake reloads a summary, not the whole history. */
		if (why === "idle" && this.sleep_compact() && this.compact("sleep")) return false;
		this.gen = (this.gen ?? 0) + 1;   // the old pump's end is not news
		/* NEVER-LOSE-A-WAKE, item 5 (fresh-eyes review finding 4): this only ever runs while
		 * `state === "idle"`, which means nothing is queued behind the last turn — `result()`
		 * sets `idle` only when `queued_turn_count` is 0 — so `this.queue.items` should always be
		 * empty here already. Captured anyway, belt and braces: a push that managed to land
		 * between that check above and this line (the same single-tick window item 1 closes) is
		 * carried to `held_messages` instead of silently discarded by `close()`, exactly like
		 * `mark_phantom()`'s own copy of this same guard. */
		const pending = this.queue.items.splice(0);
		if (pending.length) (this.held_messages ??= []).push(...pending);
		this.queue.close();
		try { this.query.close(); } catch {}
		try { this.aborter.abort(); } catch {}
		this.state = "dormant";
		this.dormant_at = stamp();
		this.emit({ type: "dormant", why, context: this.context ?? null, turns: this.turns, held: pending.length || undefined });
		this.host?.register?.(this);
		this.settle();
		return true;
	}

	/* A dormant agent's session, resumed in place: a new claude process on the
	 * same session id, cwd, model, tools and options. Nothing is sent here; the
	 * caller's `send()` pushes the turn that woke it.
	 *
	 * NEVER-LOSE-A-WAKE, item 1 (2026-10-01): the PHANTOM bug — `awaken()` registers, the
	 * registration runs the idle sweep, and the sweep saw an idle clock from BEFORE the sleep,
	 * so the agent went straight back to sleep in the same millisecond, before `send()` ever got
	 * to push the message that woke it. `Global.last_active()` reads `agent.last_at` first,
	 * ahead of the agent's own log file's mtime (which lags — the "awake" event below is written
	 * through an async queue and has not reached disk yet when `register()`, right after, asks)
	 * — but nothing had ever SET `last_at` on a live agent, so that read always fell through to
	 * the stale mtime. Setting it to now, right here, BEFORE `register()` runs, is the actual
	 * fix: the sweep then sees a correct "just woke up", not a stale one. The 60 s `awoken_at`
	 * guard in `sleep()` (the first patch, committed on michael/dev) stays as the belt — right
	 * for the exact incident it closes, but incomplete on its own: it is a wall-clock special
	 * case on `sleep()`, not a fix to the clock `last_active()` reads, so any OTHER caller that
	 * asks "how long has this agent been idle" during this same window still got a wrong answer. */
	awaken(by){
		if (this.state !== "dormant") return this;
		const slept = this.dormant_at;
		const renew = this.renew_due();
		if (renew) this.renew(renew);
		else this.assign({ resume: this.session_id, fork: false, minted: false, prompt: null, dormant_at: null, bg_tasks: 0, awoken_at: Date.now() });
		this.last_at = stamp();
		/* item 2's `mark_phantom` sets `marked_phantom` once, so it does not re-log the same
		 * episode on every `working()` call — but a genuinely NEW phantom episode later in this
		 * same agent's life must still be caught, so the flag clears here, the moment it is
		 * actually running again. */
		this.marked_phantom = false;
		this.start();
		/* NEVER-LOSE-A-WAKE, item 5: anything `send()` had to set aside while this agent was
		 * closed off (see `send()`'s own comment) is replayed now, as this agent's first turns —
		 * before the `register()` call below can do anything else with it. */
		const held = this.held_messages?.splice(0) ?? [];
		for (const item of held) this.queue.push(item);
		if (held.length) this.state = "working";
		this.emit({ type: "awake", by: by ?? null, slept_since: slept, replayed: held.length || undefined });
		this.host?.register?.(this);
		return this;
	}

	/* RENEWAL (the owner, 2026-10-23): a role with `renew: {hours, tokens}` (the AI system mastermind) wakes as a FRESH session
	 * under the same id once its session is that old or that big, instead of resuming. Nothing runs while it sleeps, so it is
	 * never kept alive when unused, and no handover file is needed: the fresh session's first turn reads the readmes.
	 * Returns why ("age" | "tokens") or null. */
	renew_due(now = Date.now()){
		const line = renew_of(this.role);
		if (!line || this.one_shot || this.system) return null;
		return renew_why(line, this.started_at, this.context, now);
	}

	renew(why){
		const replaces = this.session_id, session_id = randomUUID();
		const prompt = (this.host?.whoami?.(this.id, session_id) ?? "") + opening(this.role, renewal_text(this.id, replaces, why), { in_system: !!this.role_prompt() });
		this.assign({ resume: null, fork: false, session_id, minted: true, prompt, context: 0, last_usage: null, reminded_context: 0,
			remind_compacted: false, compacted_turn: null, dormant_at: null, bg_tasks: 0, awoken_at: Date.now(), started_at: new Date().toISOString() });
		this.emit({ type: "renew", why, replaces, session: session_id });
	}

	/* COMPACTION (dormant-idle, 2026-09-30). `/compact` as a turn of its own: the
	 * CLI summarises the conversation and continues from the summary, so the
	 * context, the process and the next resume all shrink. It is not a turn anyone
	 * asked for, so it wakes no parent and keeps the last turn's words. Run at the
	 * end of a turn when the context passes `compact_tokens` (200k) or the process
	 * passes `compact_mb` (500 MB, measured by Global.sweep). */
	compact(why = "context"){
		if (this.state !== "idle" || this.one_shot || this.compacting) return false;
		this.compacting = { why, before: this.context ?? null, rss_mb: this.rss_mb ?? null, at: Date.now() };
		this.emit({ type: "compacting", why, context: this.context ?? null, rss_mb: this.rss_mb ?? null });
		this.queue.push(this.turn("/compact"));
		this.state = "working";
		this.host?.register?.(this);
		return true;
	}

	/* Why this agent MUST compact now, or null: only the safety ceiling (the model window) and the
	 * process memory. Once per turn: a summary still over the line is not compacted again until it
	 * has done more work. Everything softer is `nudge()` (doc/owner-2026-10-16-compaction.md). */
	oversized(){
		const ceiling = this.host?.compact_tokens ?? (Number(process.env.SERVEX_COMPACT_TOKENS) || 400000);
		const mb = this.host?.compact_mb ?? (Number(process.env.SERVEX_COMPACT_MB) || 500);
		/* The front desk is never compacted: Layers.js restarts a page's assistant and manager
		 * FRESH from a checkpoint instead ("fresh, not compacted" — the owner). */
		if (this.one_shot || this.compacted_turn === this.turns || STANDING.test(this.id ?? "")) return null;
		/* roles.js `compact_after`: minions never. */
		if (role_compact_after(this.role) === null) return null;
		if ((this.context ?? 0) > ceiling) return "context";
		if ((this.rss_mb ?? 0) > mb) return "memory";
		return null;
	}

	/* THE COMPACT NUDGE (2026-10-16; step reminders, the owner 2026-10-22): past the role's threshold (roles.js
	 * `compact_after.tokens`, e.g. a mastermind's 150k, else SERVEX_NUDGE_TOKENS 200k) an idle agent is told its context
	 * size and asked to compact at its next natural break; it decides, node never cuts in mid-flight. Again each time the
	 * context grows another 5% of the window (on a 1M window: 150k, 200k, 250k… up to the 400k ceiling). The owner's
	 * "about 30%" for the first reminder was reconsidered: with a 400k ceiling it leaves two reminders, so the earlier lines stay.
	 * Returns the message text, or null. Pure decision: `nudge_send()` does the sending. */
	nudge(now = Date.now()){
		if (this.state !== "idle" || this.one_shot || this.compacting || STANDING.test(this.id ?? "")) return null;
		if (this.task?.dir && task_landed(this.task.dir)) return null;
		const after = role_compact_after(this.role);
		if (after === null || renew_of(this.role)) return null;   // a renewing role gets a fresh session instead (Agent.renew_due)
		const window = this.host?.window_tokens ?? (Number(process.env.SERVEX_WINDOW_TOKENS) || WINDOW_TOKENS);
		const limit = after?.tokens ?? this.host?.nudge_tokens ?? (Number(process.env.SERVEX_NUDGE_TOKENS) || 200000);
		const context = this.context ?? 0;
		if (context <= limit) return null;
		if (this.nudged_context != null && context < this.nudged_context + Math.max(NUDGE_GROWTH, Math.round(window * 0.05))) return null;
		const ended = this.turn_ended_at ?? (this.last_at ? Date.parse(this.last_at) : now);
		const minutes = Math.max(0, Math.round((now - ended) / 60000));
		const warm = minutes < 5;
		this.nudge_info = { context, cache: warm ? "warm" : "cold", minutes };
		return `Context: ${context.toLocaleString("en-US")} tokens (${Math.round(context / window * 100)}% of the window), cache ${warm ? "warm" : "cold"} (last turn ${minutes} minute${minutes === 1 ? "" : "s"} ago). You are idle. Compact at your next natural break (an investigation done, no tools in flight): now, unless something in flight needs this context.`;
	}

	/* COMPACT BEFORE SLEEP (the owner, 2026-10-23): true when this agent, about to go dormant, holds more than its
	 * sleep line: roles.js `compact_after.sleep`, else SERVEX_SLEEP_COMPACT_TOKENS (100k), never more than half the
	 * window. Not for minions (`compact_after: null`), the front desk (STANDING), a fork, or a context already
	 * compacted since its last turn. Runs at the sleep moment, not at turn end, so an agent that gets another message
	 * within its idle wait keeps its context; that wait is 3 minutes or less for most roles, under the 5-minute cache
	 * TTL, so the compaction reads a warm cache. */
	sleep_compact(){
		if (this.one_shot || this.compacting || this.compacted_turn === this.turns || STANDING.test(this.id ?? "")) return false;
		const after = role_compact_after(this.role);
		if (after === null || renew_of(this.role)) return false;   // a renewing role gets a fresh session instead (Agent.renew_due)
		const window = this.host?.window_tokens ?? (Number(process.env.SERVEX_WINDOW_TOKENS) || WINDOW_TOKENS);
		const line = Math.min(after?.sleep ?? this.host?.sleep_compact_tokens ?? (Number(process.env.SERVEX_SLEEP_COMPACT_TOKENS) || SLEEP_COMPACT_TOKENS), Math.round(window / 2));
		return (this.context ?? 0) > line;
	}

	/* The agent's answer to the nudge (the `compact_self` tool): compact when this turn ends. */
	request_compact(){
		this.compact_requested = true;
		return { ok: true, note: "Compaction runs when this turn ends; end your turn now." };
	}

	/* THE WATCHDOG GUARD (2026-10-17, Servex/doc/heartbeat.md): the heartbeat, the compact nudge and the landing check wake an
	 * agent on their own. They never wake one whose task has landed, and never one whose wake would take it past its budget
	 * (the brief's `Budget: $N`, else ceiling_usd()). Null = go ahead; else {why, text}. */
	watchdog_refusal(from){
		if (!this.constructor.WATCHDOGS.has(from)) return null;
		const dir = this.task?.dir;
		if (dir && task_landed(dir)) return { why: "landed", text: `its task ${path.basename(dir)} has landed` };
		const cap = this.estimate_usd() ?? this.ceiling_usd(), spent = this.spent_usd(), turn = Number(this.turn_cost) || 0;
		if (spent + turn > cap) return { why: "spend", text: `a wake costs about $${turn.toFixed(2)} and it has spent $${spent.toFixed(2)} of $${cap.toFixed(2)}` };
		return null;
	}

	/* One log line per agent and reason, not one per tick. */
	watchdog_skipped(from, skip){
		const key = skip.why;
		if (this.watchdog_told !== key){
			this.watchdog_told = key;
			this.host?.store?.().append("servex", { type: "heartbeat-skipped", agent: this.id, from, why: skip.why, text: skip.text }).catch(() => {});
			try { this.host?.servex?.say?.(`heartbeat: skipped, ${skip.why}: ${this.id} (${skip.text})`); } catch {}
		}
		return this;
	}

	nudge_send(){
		const text = this.nudge();
		if (!text) return false;
		this.nudged_context = this.context ?? 0;
		this.nudge_pending = true;
		this.emit({ type: "compact_nudge", context: this.nudge_info.context, cache: this.nudge_info.cache });
		this.send(text, { from: "servex-compact-nudge" });
		return true;
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
		/* A turn stopped before it ends never reaches result(), so its model calls were
		 * never billed to anyone: a GPT-6.1 Sol mastermind that did its whole job in one
		 * turn showed $0 while OpenRouter charged ~$3 (2026-10-01). Settle them now. */
		if (this.provider === "openrouter" && this.turn_message_ids?.size) this.refresh_or_cost();
		this.emit({ type: "result", stopped: true, mid_turn, turns: this.turns, cost: this.cost });
		this.unlanded_note();
		this.host?.register?.(this);
		this.settle();
		return this;
	}

	/* The agent is gone and its task never landed: say so in the task's log; the parent's harvest lands it. */
	unlanded_note(){
		const dir = this.task?.dir;
		if (!dir || this.landing_nagged || this.one_shot || !/^(task-mastermind|mastermind|sub-mastermind)/.test(this.role ?? "")) return;
		if (Landed.logged(dir) || !/\b(merged|merge commit|landed)\b/i.test(this.words ?? this.last_text ?? "")) return;
		this.landing_nagged = true;
		try { fs.appendFileSync((SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl")), JSON.stringify({ log: { at: stamp(), msg: "agent stopped with the work merged but no landing line; too late to nag, the parent's harvest lands it" } }) + "\n"); } catch {}
	}

	card(){
		const { id, role, model, state, visibility, started_at, stopped_at, turns, session_id, cost, parent,
			forked_from, resumed_from } = this;
		return { id, role, model, state, visibility, started_at, stopped_at: stopped_at ?? null, turns, session_id, cost, parent: parent ?? null,
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
		/* The turn that answers a compact nudge is housekeeping, not news: its "done" wakes nobody. */
		const nudge_turn = event.type === "result" && !event.stopped && this.nudge_pending;
		if (nudge_turn) this.nudge_pending = false;
		if (event.type === "result" && !nudge_turn && !(event.stopped && !event.mid_turn)) this.host?.wake_parent?.(this,
			event.stopped ? "stopped"
			: this.one_shot && event.ok === false ? "error"
			: this.last_text?.startsWith("BLOCKED") ? "blocked" : "done");
		if (event.type === "error") this.host?.wake_parent?.(this, "error");
		if (event.type === "result") try { this.host?.servex?.process_runner?.turn_ended(this); } catch {}   // a process step this agent holds is measured, or pulsed if left open
		return event;
	}

	/* `gen` is which process this pump reads: a dormant agent's old process ends
	 * AFTER the new one started (awaken), and its end must not touch the new one. */
	async pump(gen = this.gen){
		const mine = () => gen === this.gen;
		try {
			for await (const message of this.query){ if (!mine()) break; this.receive(message); }
		} catch (e){
			// the abort that `stop()` or `sleep()` itself fires is not news — and would wake a parent with a false "error"
			if (mine() && this.state !== "stopped" && this.state !== "dormant") this.emit({ type: "error", where: "session", text: String(e.message || e) });
		}
		if (!mine() || this.state === "stopped" || this.state === "dormant") return;
		this.state = "stopped";
		this.host?.register?.(this);
		this.settle();
	}

	/* Every SDK message becomes exactly one typed event — or none, for the kinds
	 * a dashboard has no use for. The SDK's message set grows over time, so an
	 * unrecognised type is dropped, never thrown on. */
	receive(message){
		if (message.type === "system" && message.subtype === "init") return this.began(message);
		if (message.type === "system" && message.subtype === "background_tasks_changed")
			return void (this.bg_tasks = (message.tasks ?? []).filter(t => !t.ambient).length);
		if (message.type === "system" && message.subtype === "compact_boundary") return this.boundary(message);
		if (message.type === "stream_event") return this.delta(message);
		if (message.type === "assistant") return this.assistant(message);
		if (message.type === "result") return this.result(message);
		if (message.type === "user") return this.tool_results(message);   // the spend gate: did a result-kind call succeed
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

	/* The CLI compacted (our `/compact`, or its own auto-compact mid-turn). */
	boundary(message){
		const m = message.compact_metadata ?? {};
		this.last_usage = null;
		this.context = m.post_tokens ?? null;
		/* The next hook (a prompt or a tool call) carries the role reminder; the token steps restart from here. */
		this.remind_compacted = true;
		this.reminded_context = m.post_tokens ?? 0;
		this.emit({ type: "compacted", trigger: m.trigger ?? null, pre_tokens: m.pre_tokens ?? null, post_tokens: m.post_tokens ?? null });
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
		// openrouter/provider.js real_turn_cost(): the main thread's own message id,
		// which OpenRouter's /generation endpoint can look up directly and exactly.
		if (!nested && message.message?.id){ this.last_assistant_message_id = message.message.id; (this.turn_message_ids ??= new Set()).add(message.message.id); }
		if (!nested && message.message?.id && this.provider === "openrouter") this.price(message.message.id, message.message.usage);
		for (const block of message.message?.content ?? []){
			if (block.type === "text" && block.text.trim())
				this.emit({ type: nested ? "subagent" : "transcript", text: block.text });
			if (block.type === "tool_use"){
				this.emit({ type: "tool", name: block.name, input: this.summary(block.input), nested });
				if (!nested) this.tool_started(block);
			}
		}
		if (message.error) this.emit({ type: "error", where: "assistant", text: String(message.error.message || message.error) });
	}

	/* SPEND FOLLOWS RESULTS (the owner, 2026-10-02: "Spending $10 or $20 to find out if
	 * something works is fine if it's promising; blowing $20 with no results is not
	 * acceptable"). It came after two Gemini masterminds spent about $17 in 20 minutes reading
	 * and never acting. Every agent starts with $2 (SERVEX_GATE_FIRST_USD) to produce its FIRST
	 * result. Each verified result unlocks $3 more (SERVEX_GATE_STEP_USD), up to the task
	 * brief's `Budget: $N` line, or $20 without one. A result is a commit, a step marked done,
	 * a page line or a spawned minion with a brief, and it counts only once its tool call
	 * comes back without an error. When spend reaches the allowance with no new result,
	 * Servex interrupts the agent (never mid-tool-call: it waits for the open call to return)
	 * and posts one Inbox card: the spend, what it read, what it produced, and Continue (+$5)
	 * or Stop. Every gate event is one `spend-gate` line in Servex's log.
	 * Spend: an OpenRouter agent's model calls, each priced by OpenRouter's /generation as it
	 * settles, so the gate works during the turn. A Claude agent's SDK total, which arrives
	 * only at the turn's end. Pricing each Claude call during the turn is token-reduction item 4. */
	static RESULT = [
		["commit", (n, i) => n === "Bash" && /\bgit\b[^|;&]*\bcommit\b/.test(i.command ?? "")],
		["step done", (n, i) => /close_task$/.test(n) || ((n === "Bash" || /append_log$/.test(n)) && /task\.jsonl/.test(JSON.stringify(i)) && /"?done"?\s*[:=]|"status"\s*:\s*"done"|landed_at/.test(JSON.stringify(i)))],
		["page line", n => /mcp__servex__page_(add|set|log)$/.test(n)],
		["spawned a minion", (n, i) => /spawn_agent$/.test(n) && Boolean(i.task?.brief || /requirements\.md/.test(i.prompt ?? ""))],
	];

	/* Who is gated: work agents. Anything with a task, or an OpenRouter mastermind or minion.
	 * The front desk (assistants, the echo, the voice pair) answers rather than produces, so it isn't. */
	gated_role(){
		return Boolean(this.task?.dir) || (this.provider === "openrouter" && /mastermind|minion/.test(String(this.role ?? this.id)));
	}

	gate(){
		return this.spend_gate ??= { results: [], granted: 0, spent_at_result: 0, open: new Map(), reads: 0, read_log: [], gated: false, due: false };
	}

	spent_usd(){
		return this.provider === "openrouter" ? (this.metered_usd ?? 0) : (Number(this.cost) || 0);
	}

	ceiling_usd(){
		return this.ceiling_cache ??= this.read_ceiling();   // read the brief once, not on every registry write
	}

	/* BUDGETS ARE ADVISORY (the owner, 2026-10-08: "I don't trust the AI to come up with a good budget ... we don't want
	 * arbitrary limits that stop an agent a couple dollars short of finishing"). A `budget_usd` or a brief's `Budget: $N` is the
	 * spawner's estimate, kept for the mastermind to watch; it does NOT cap the agent. What is enforced is only the runaway
	 * backstop: SERVEX_GATE_CEILING_USD (default $100), plus the results-gated allowance in allowance_usd() ($2 for the first
	 * result, +$3 per verified result), which stops spend that produces nothing. */
	read_ceiling(){
		return Number(process.env.SERVEX_GATE_CEILING_USD) || 100;
	}

	/* THE HARD STOP (the owner, 2026-10-22: "budgets are estimates, not caps; a hard stop only near 10x the estimate").
	 * SERVEX_GATE_HARD_X (default 10) times the spawner's estimate, else the runaway ceiling. Only this pauses an agent
	 * and asks Continue or Stop; the owner's Continue (+$5) raises it. Doc: Servex/doc/budget.md. */
	hard_usd(){
		const est = this.estimate_usd(), x = Number(process.env.SERVEX_GATE_HARD_X) || 10;
		return (est ? est * x : this.ceiling_usd()) + this.gate().granted;
	}

	/* The spawner's estimate, for display and for the mastermind's own watching (never enforced). */
	estimate_usd(){
		if (Number(this.budget_usd) > 0) return Number(this.budget_usd);
		try {
			const brief = this.task?.brief && fs.readFileSync(path.resolve(this.task.brief), "utf8");
			const m = brief && /Budget:\s*\$\s*(\d+(?:\.\d+)?)/.exec(brief);
			if (m) return Number(m[1]);
		} catch {}
		return null;
	}

	allowance_usd(){
		const g = this.gate(), first = Number(process.env.SERVEX_GATE_FIRST_USD) || 2, step = Number(process.env.SERVEX_GATE_STEP_USD) || 3;
		return Math.min(this.ceiling_usd(), first + step * g.results.length) + g.granted + (g.auto ?? 0);
	}

	/* For the registry row and the Sessions grid. `unpriced_calls` (openrouter-cost-blind,
	 * 2026-10-04): a nonzero count means some of `spent_usd` is already known to be an
	 * undercount, before the 3-call gate even fires. */
	gate_row(){
		const g = this.spend_gate;
		if (!g) return null;
		const spent = this.spent_usd();
		return { spent_usd: +spent.toFixed(4), since_result_usd: +(spent - g.spent_at_result).toFixed(4), allowance_usd: this.allowance_usd(),
			results: g.results.length, last_result: g.results.at(-1) ?? null, gated: g.gated, unpriced_calls: this.unpriced_calls ?? 0 };
	}

	gate_log(event, extra = {}){
		this.host?.store?.().append("servex", { type: "spend-gate", event, agent: this.id, model: this.model,
			spent_usd: +this.spent_usd().toFixed(4), allowance_usd: this.allowance_usd(), results: this.gate().results.length, ...extra }).catch(() => {});
	}

	tool_started(block){
		if (!this.gated_role()) return;   // the read-loop warning is for gated work agents only, never the front desk
		const g = this.gate(), input = block.input ?? {};
		g.open.set(block.id, null);
		const kind = this.constructor.RESULT.find(([, test]) => { try { return test(block.name, input); } catch { return false; } })?.[0];
		if (kind) g.open.set(block.id, { kind, what: this.summary(input, 120) });
		if (/^(Read|Grep|Glob)$|page_read|read_page|read_card/.test(block.name)){
			g.reads += 1;
			g.read_log.push(input.file_path ?? input.path ?? input.pattern ?? input.card ?? block.name);
			if (g.read_log.length > 30) g.read_log.shift();
			/* THE READ-LOOP GUARD, a warning only: 40 reads with no result since the last one. */
			const warn = Number(process.env.SERVEX_READ_WARN) || 40;
			if (g.reads === warn){
				this.gate_log("read-warn", { reads: g.reads });
				try { this.host?.send?.(this.id, `Servex: ${g.reads} reads since your last result. Produce one now (a commit, a step done, a page line, or a minion with a brief): your spend is gated on results.`, { from: "servex" }); } catch {}
			}
		}
	}

	/* Tool results come back in "user" messages; a result-kind call counts only if it succeeded. */
	tool_results(message){
		if (message.parent_tool_use_id) return;
		const content = message.message?.content;
		if (!Array.isArray(content)) return;
		const g = this.gate();
		for (const b of content){
			if (b?.type !== "tool_result" || !g.open.has(b.tool_use_id)) continue;
			const candidate = g.open.get(b.tool_use_id);
			g.open.delete(b.tool_use_id);
			if (candidate && !b.is_error){
				g.results.push({ ...candidate, at: stamp(), spent_usd: +this.spent_usd().toFixed(4) });
				g.spent_at_result = this.spent_usd();
				g.reads = 0;
				g.gated = false;
				this.gate_log("result", candidate);
			}
		}
		if (g.due && !g.open.size) this.gate_check();
	}

	/* THE REAL-TIME PRICE (openrouter-cost-blind, 2026-10-04): OpenRouter's
	 * Anthropic-compatible responses carry the real per-call dollar figure on
	 * their own `usage.cost` (provider.js's `message_cost()`, confirmed live
	 * 2026-10-04) — so the common case needs no network call at all, and prices
	 * the call the instant its message arrives. Only a response with no usable
	 * `usage.cost` falls back to `meter()`'s `/generation` poll below. */
	price(id, usage){
		this.metered ??= new Map();
		if (this.metered.has(id)) return;
		const cost = message_cost(usage);
		if (cost == null){ this.meter(id); return; }
		this.metered.set(id, cost);
		this.metered_usd = [...this.metered.values()].reduce((a, b) => a + b, 0);
		this.gate_check();
	}

	/* THE FALLBACK (rare: no `usage.cost` on the response at all). Was the ONLY
	 * path before this task, and its one real defect: `generation_cost()`
	 * failing every one of 6 tries (a bad id, a slow settle, a dead network)
	 * left the call priced at exactly $0 forever, with no trace anywhere — so
	 * `spent_usd()` looked perfectly fine while the real charge kept landing on
	 * OpenRouter's bill unseen. Now every exhausted call is logged and counted
	 * (`unpriced()`), never just silently zero. */
	async meter(id){
		this.metered ??= new Map();
		if (this.metered.has(id)) return;
		this.metered.set(id, 0);
		let key; try { key = read_key(); } catch { this.unpriced(id, "no OpenRouter key"); return; }
		for (let i = 0; i < 6; i++){
			const c = await generation_cost(key, id).catch(() => null);
			if (c != null){
				this.metered.set(id, c);
				this.metered_usd = [...this.metered.values()].reduce((a, b) => a + b, 0);
				this.gate_check();
				return;
			}
			await new Promise(r => setTimeout(r, 2500));
		}
		this.unpriced(id, "/generation never resolved after 6 tries");
	}

	/* NEVER SILENT (openrouter-cost-blind, 2026-10-04): one call Servex could not
	 * price, logged the moment it's known, plus a running count `gate_row()`
	 * shows on the dashboard. 3 or more and the agent's real spend is simply
	 * unknown, so `gate_check()` treats it exactly like an over-budget agent —
	 * interrupted, with the same card. */
	unpriced(id, reason){
		this.unpriced_calls = (this.unpriced_calls ?? 0) + 1;
		this.host?.store?.().append("servex", { type: "spend-gate", event: "unpriced", agent: this.id, model: this.model,
			id, reason, unpriced_calls: this.unpriced_calls }).catch(() => {});
		this.gate_check();
	}

	/* The gate itself: run when a call is priced, when a tool call returns, and at a turn's end.
	 * `unpriced_calls >= 3` (openrouter-cost-blind, 2026-10-04) gates exactly like an over-budget
	 * agent — this agent's real spend is simply unknown, which is worse than knowing it's high. */
	gate_check(){
		if (!this.gated_role()) return;
		const g = this.gate(), spent = this.spent_usd(), allowance = this.allowance_usd();
		const unpriced = (this.unpriced_calls ?? 0) >= 3;
		if (spent < allowance && !unpriced){ g.due = false; return; }
		/* Past the results allowance but under the hard stop: a soft gate. Work never stops here: Servex continues the agent
		 * itself (+$5 past what it spent, logged as auto-continue) and sends it one line asking for a result; no card, no interrupt. */
		if (!unpriced && spent < this.hard_usd()){
			g.due = false;
			const add = +(spent - allowance + (Number(process.env.SERVEX_GATE_AUTO_USD) || 5)).toFixed(4);
			g.auto = (g.auto ?? 0) + add;
			this.gate_log("auto-continue", { added_usd: add, hard_usd: +this.hard_usd().toFixed(2), since_result_usd: +(spent - g.spent_at_result).toFixed(4) });
			try { this.host?.send?.(this.id, `Servex: $${spent.toFixed(2)} spent, $${(spent - g.spent_at_result).toFixed(2)} since your last result (a commit, a step done, a page line, a minion with a brief). Budgets are estimates, so keep going if it is working, and produce a result soon. The hard stop is $${this.hard_usd().toFixed(2)}.`, { from: "servex" }); } catch {}
			this.host?.register?.(this);
			return;
		}
		if (g.open.size && this.state === "working"){ g.due = true; return; }   // never mid-tool-call
		g.due = false;
		if (this.state === "working") this.interrupt().catch?.(() => {});
		if (g.gated) return;   // one card per gate, however often the agent is woken past it
		g.gated = true;
		this.gate_log("gate", { since_result_usd: +(spent - g.spent_at_result).toFixed(4), unpriced_calls: this.unpriced_calls ?? 0 });
		const made = g.results.length ? g.results.map(r => `${r.kind}: ${r.what}`).slice(-5).join("; ") : "nothing yet";
		const read = g.read_log.slice(-10).join(", ") || "nothing";
		const text = unpriced
			? `${this.id} (${this.model}) has made ${this.unpriced_calls} model calls Servex could not price (its real spend is unknown, not necessarily high), so Servex paused it as a safety gate (openrouter-cost-blind, 2026-10-04). Produced: ${made}. Last read: ${read}. Continue gives it $5 more; Stop ends it.`
			: `${this.id} (${this.model}) has spent $${spent.toFixed(2)}, $${(spent - g.spent_at_result).toFixed(2)} of it since its last result, and reached its $${this.hard_usd().toFixed(2)} hard stop (${this.estimate_usd() ? `${Number(process.env.SERVEX_GATE_HARD_X) || 10}x its $${this.estimate_usd()} estimate` : "the runaway ceiling"}), so Servex paused it. Produced: ${made}. Last read: ${read}. Continue gives it $5 more; Stop ends it.`;
		const sx = this.host?.servex, h = sx?.mcp?.handlers, ask = h?.get?.("card_ask"), card = this.task?.card;
		/* `from: this.id` lets Cards.js's wake() find exactly this agent when the owner answers,
		 * instead of falling back to every attached non-minion agent. `kind: "spend-gate"` tells
		 * wake() to act on the answer directly (grant/stop) instead of just texting it over. */
		Promise.resolve(card && ask ? ask({ card, question: text, options: ["Continue (+$5)", "Stop"], from: this.id, kind: "spend-gate" }, { caller: "servex" }) : null)
			.catch(() => null)
			.then(out => { if (!out) sx?.inbox?.drop({ path: this.task?.dir ?? "public/framework/servex", text, from: "servex" }); })
			.catch(() => {});
		try { sx?.say?.(text, { event: "spend-gate" }); } catch {}
	}

	/* Continue (+$5): the Inbox answer, or anyone with the authority, raises the allowance. */
	grant(usd = 5){
		const g = this.gate();
		g.granted += Number(usd) || 0;
		g.gated = false;
		this.gate_log("grant", { granted_usd: Number(usd) || 0 });
		this.host?.register?.(this);
		return this;
	}

	/* A tool call's input can be a whole file; the log wants a glance at it. */
	summary(input, max = 200){
		const text = Object.entries(input ?? {})
			.map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
			.join(" ").replace(/\s+/g, " ");
		return text.length > max ? text.slice(0, max) + "…" : text;
	}

	/* THE REAL COST (openrouter/provider.js, openrouter/readme.md point 3): the
	 * SDK's own `total_cost_usd` prices a proxied turn off ANTHROPIC's table
	 * under the wrong model name, so it is simply wrong once a turn runs through
	 * OpenRouter. The honest number is OpenRouter's own running dollar total for
	 * the key, read before the turn (`start()`) and after it (here); the
	 * difference is what that turn cost. Never awaited by its caller — a slow
	 * or failed read just leaves `this.cost` at its last known value, never
	 * blocks the agent's own turn from finishing. */
	async refresh_or_cost(){
		if (this.provider !== "openrouter") return;
		try {
			const key = read_key();
			/* real_turn_cost() (openrouter/provider.js, review.md findings 2-4): tries
			 * the exact per-generation figure first, by this turn's own assistant
			 * message id; falls back to a before/after key-total diff. Either way it
			 * polls for ~10-20s for billing to settle — this call is never awaited by
			 * its caller (start()/result()/compact_done()), so that wait never
			 * delays the agent's own turn. */
			// every model call this turn made, then a fresh set for the next turn
			const message_ids = [...(this.turn_message_ids ?? [])];
			this.turn_message_ids = new Set();
			const r = await real_turn_cost({ key, message_ids, usage_before: this.or_usage_before });
			/* A key_diff delta is the WHOLE key's spend, so another OpenRouter agent that
			 * settled a turn since our last reading shares it (found 2026-10-12: 54 groups
			 * of identical lines, $18.54 booked twice; ai/sessions/doc/cost/openrouter-gap.md).
			 * Split it evenly across the agents that overlapped; never charge it whole. */
			const now_ms = Date.now();
			if (r && r.source === "key_diff" && typeof r.cost === "number"){
				const since = this.or_last_settle ?? 0;
				const others = [...OR_SETTLED].filter(([id, t]) => id !== this.id && t > since).length;
				if (others){ r.cost = r.cost / (others + 1); r.source = "key_diff_split"; }
			}
			OR_SETTLED.set(this.id, now_ms);
			this.or_last_settle = now_ms;
			if (!r || typeof r.cost !== "number")
				this.host?.store?.().append("servex", { type: "openrouter-cost-unknown", agent: this.id, calls: message_ids.length, source: r?.source ?? null }).catch(() => {});
			if (!r) return;
			/* CUMULATIVE, like the SDK's own `total_cost_usd` (cost-cumulative-fix,
			 * 2026-10-01): a turn's own cost is ADDED onto a running `or_cost`, never
			 * used to replace `this.cost` outright — replacing it would make the
			 * session total reset on every turn instead of growing. */
			if (typeof r.cost === "number"){
				this.or_cost = (this.or_cost ?? 0) + r.cost;
				this.cost = this.or_cost;
				/* THE LEDGER (requirements.md Phase 2 item 1b): one line per settled
				 * turn, through the host's own Log — the SAME single writer every other
				 * event in this file goes through (register(), above), so two agents
				 * settling a turn at once can never tear a line in the ledger file. */
				this.host?.store?.().append("openrouter", {
					agent: this.id, model: this.model, effort: this.effort,
					turn: this.turns, cost_usd: r.cost, source: r.source, calls: r.calls
				}).catch(() => {});
			}
			if (typeof r.usage_now === "number") this.or_usage_before = r.usage_now;
			this.host?.register?.(this);
		} catch {}   // billing not settled yet, or no key — this.cost keeps its last value
	}

	/* COST ACCUMULATES (agent-cost, 2026-10-13). `total_cost_usd` is cumulative only inside ONE claude
	 * process; sleep()/awaken() and a Servex restart (reopen) start a new process whose total begins at 0, so
	 * `this.cost = total` made a resumed agent's cost shrink or read 0. This adds each turn's DELTA onto the
	 * running `this.cost` (carried across processes) and keeps the delta as `turn_cost`, which result() logs. */
	add_cost(message){
		const total = Number(message.total_cost_usd);
		if (!Number.isFinite(total)) return this.turn_cost = 0;
		const prev = this.proc_cost ?? 0;
		this.turn_cost = total >= prev ? total - prev : total;
		this.proc_cost = total;
		this.cost = (Number(this.cost) || 0) + this.turn_cost;
		return this.turn_cost;
	}

	/* A turn ended — but the agent is only IDLE if nothing is queued behind it.
	 * `queued_turn_count` is how the CLI says "another turn follows without
	 * further input"; without that check a watcher reads the gap between two
	 * queued turns as "finished" and acts on a half-done agent. */
	result(message){
		if (this.compacting) return this.compact_done(message);
		this.turns += 1;
		/* Real token counts, cumulative across this agent's whole life (review finding,
		 * dictate-without-claude round 6, 2026-10-04): the streamed `assistant` message's own
		 * `usage` reads 0/0 for a proxied OpenRouter call (SDK `message_start` artifact, not a
		 * real count yet) — the RESULT event's `modelUsage[model]` is where the real
		 * `inputTokens`/`outputTokens` actually land. `costUSD` in there is still the SDK's
		 * wrong Anthropic-table guess (same reason `total_cost_usd` is, two lines down) — only
		 * the token counts are trustworthy, and only as a cumulative total a caller must diff
		 * against its own last reading to get one turn's share. */
		if (message.modelUsage) this.model_usage = message.modelUsage;
		/* total_cost_usd is the SDK's own guess, priced off Anthropic's table —
		 * wrong for an openrouter agent under the wrong model name entirely
		 * (openrouter/readme.md point 3), so it must never touch `this.cost`
		 * here; refresh_or_cost() below owns `this.cost` for that agent instead. */
		if (this.provider === "openrouter") this.refresh_or_cost();
		else this.add_cost(message);
		this.queued = message.queued_turn_count ?? 0;
		this.state = this.queued > 0 ? "working" : "idle";
		this.spend_gate?.open.clear();   // a turn's end closes every tool call it opened
		try { this.gate_check(); } catch {}   // a Claude agent's spend is known only now
		/* `words` = everything said this turn, which is what a fork's wake and
		 * `wait_for_agent` hand back; `last_text` is only its final block. */
		this.words = (this.said ?? []).join("\n\n") || null;
		this.said = [];
		/* `result` carries the error TEXT when `is_error` is set (sdk.d.ts on `SDKResultMessage`:
		 * "with is_error true, the error text when the turn ended on an API error") — checked
		 * first (review round 8, dictate-without-claude, 2026-10-04: `message.errors` is usually
		 * absent on a real refusal, so `last_error` fell through to the uninformative
		 * `message.subtype` or "turn failed", and USAGE_LIMIT_WORDS never matched a real cutoff). */
		if (message.is_error) this.last_error = message.result || (message.errors ?? []).join("; ") || message.subtype || "turn failed";
		else this.last_error = null;   // a turn that succeeds clears a stale error (review finding 2): a past 429 must not keep tripping every later "done"
		const u = message.usage ?? {};
		this.emit({
			type: "result",
			ok: !message.is_error,
			cost: this.cost,
			turn_cost: this.turn_cost ?? 0,   // THE RECORD: this turn's own dollars; reopen() re-sums these (agent-cost, 2026-10-13)
			sdk_total: this.provider === "openrouter" ? null : this.proc_cost ?? null,   // the SDK's session total after this turn: lets log_cost() diff across processes exactly
			duration_ms: message.duration_ms,
			turns: this.turns,
			api_turns: message.num_turns,
			queued: this.queued,
			text: message.result ?? null,
			usage: { input_tokens: u.input_tokens ?? 0, cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
				cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0, output_tokens: u.output_tokens ?? 0 }
		});
		this.usage = u;
		this.turn_ended_at = Date.now();
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
		/* ONE-PASS ROLES (node-reliability, 2026-09-29): a reviewer, clarity or checker
		 * does one job, then used to sit idle holding ~300 MB until someone noticed
		 * (4 times in 20 minutes on 09-29). Once its turn ends with nothing queued,
		 * Servex stops it; waiters already have its words (settle() above), and the
		 * session stays resumable — a message still wakes it (no `stopped_by`). */
		else if (ONE_PASS.includes(this.role) && this.state === "idle") setImmediate(() => { if (this.state === "idle") this.stop(); });
		/* Grown past a threshold: compact before anything else arrives. */
		else if (this.state === "idle" && this.task?.dir && !STANDING.test(this.id ?? "") && task_landed(this.task.dir)) setImmediate(() => { if (this.state === "idle") this.sleep("landed"); });
		else if (this.state === "idle"){
			const why = this.compact_requested ? "requested" : this.oversized();
			this.compact_requested = false;
			if (why) setImmediate(() => this.compact(why));
			else setImmediate(() => { if (this.state === "idle") this.nudge_send(); });
		}
		if (this.state === "idle") { this.landing_nag(); this.landing_check(); }
	}

	/* THE LANDING CHECK (2026-10-13, Servex/doc/landing.md): a task with a landing line whose branch work is
	 * NOT on michael/dev (by file content, Server/LandingCheck.mjs) gets a log line, a card reply and a
	 * wake of its parent. The landing line is never deleted. Once per distinct missing set. */
	landing_check(){
		const dir = this.task?.dir;
		if (!dir || this.one_shot || !Landed.logged(dir)) return false;
		const v = Landed.verdict(dir);   // the check Landed.of_dir counts a landing by (todo 207)
		if (v.landed) return false;
		const key = v.missing.join("|");
		if (this.landing_flagged === key) return false;
		this.landing_flagged = key;
		const msg = `landed but ${v.ahead} commits are not on ${LandingCheck.BASE}: ${LandingCheck.sentence(v).replace(/^.*?: /, "")}`;
		const file = SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl");
		let tail = ""; try { tail = fs.readFileSync(file, "utf8").slice(-20000); } catch {}
		if (tail.includes(JSON.stringify(msg).slice(1, -1))) return false;   // already said: a Servex restart forgets landing_flagged
		try { fs.appendFileSync(file, JSON.stringify({ log: { at: stamp(), msg } }) + "\n"); } catch {}
		this.host?.store().append("servex", { type: "landing-unmerged", agent: this.id, task: dir, branch: v.branch, missing: v.missing.length }).catch(() => {});
		const card = this.task?.card;
		if (card) try { this.host?.servex?.assistant?.card_reply({ card, from: "servex-landing-check", text: msg }); } catch {}
		if (this.parent && this.parent !== this.id) try { this.host?.send(this.parent, `landing-check: ${this.id}: ${msg}`, { from: "servex-landing-check" }); } catch {}
		return true;
	}

	/* THE LANDING NAG (2026-10-13, doc/lifecycle.md): a task agent whose turn ended with the
	 * work merged but no `landed_at` line gets ONE message asking for it, so no AI has to
	 * remember to land (7 of 14 task masterminds forgot on 10-13). `landing_nagged` is the
	 * once-flag, kept on the registry row. Done = not BLOCKED, no child still working, and
	 * the last words say merged/landed. */
	landing_nag(){
		const dir = this.task?.dir;
		if (!dir || this.landing_nagged || this.one_shot || STANDING.test(this.id ?? "")) return false;
		if (!/^(task-mastermind|mastermind|sub-mastermind)/.test(this.role ?? "")) return false;
		if (Landed.logged(dir) || /^BLOCKED/i.test(this.last_text ?? "")) return false;
		if (!/\b(merged|merge commit|landed)\b/i.test(this.words ?? this.last_text ?? "")) return false;
		const kids = [...(this.host?.live?.values() ?? [])].filter(a => a.parent === this.id && (a.state === "working" || a.state === "starting"));
		if (kids.length) return false;
		this.landing_nagged = true;
		const file = (SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl")).split(path.sep).join("/");
		this.host?.store().append("servex", { type: "landing-nag", agent: this.id, task: dir }).catch(() => {});
		this.send(`Your work is merged but your task has no landing line. Append it now: {"assign": {"landed_at": "NOW", "title": …, "outcome": …, "links": […]}} via \`node .claude/hooks/append.mjs ${file} <lines.json>\`, then \`card_reply\` one screen.`, { from: "servex-landing-nag" });
		this.host?.register?.(this);
		return true;
	}

	/* The end of a `/compact` turn: logged, no parent woken, the last turn's words kept. */
	compact_done(message){
		const c = this.compacting;
		this.compacting = null;
		this.compacted_turn = this.turns;
		this.compacted_at = stamp();
		this.nudged_context = null;   // a fresh idle period: the next growth past the line is nudged again
		if (this.provider === "openrouter") this.refresh_or_cost();
		else this.add_cost(message);
		this.queued = message.queued_turn_count ?? 0;
		this.state = this.queued > 0 ? "working" : "idle";
		this.said = [];
		this.log({ at: stamp(), agent: this.id, type: "compact", ok: !message.is_error, why: c.why, before: c.before, after: this.context ?? null,
			rss_mb_before: c.rss_mb, duration_ms: Date.now() - c.at, cost: this.cost, turn_cost: this.turn_cost ?? 0, sdk_total: this.provider === "openrouter" ? null : this.proc_cost ?? null });
		this.host?.register?.(this);
		this.settle();
		/* Compacted for MEMORY: a process keeps the heap it grew, so restart it
		 * from the compacted session (checkpoint-and-restart). */
		/* A new process starts small: forget the old heap's size, or the next check compacts again for nothing
		 * (task-mastermind-voice-opus, 2026-10-19: three memory compactions in four minutes on a stale 698 MB). */
		if (c.why === "memory" && this.state === "idle" && this.sleep("compacted")){ this.rss_mb = null; this.awaken("compaction"); }
		/* Compacted on the way to sleep: now sleep (`compacted_turn` stops a second compaction). A message that
		 * arrived meanwhile left it working, and then it stays awake for that turn. */
		if (c.why === "sleep" && this.state === "idle" && this.sleep("idle")) try { const g = this.host?.servex?.global; g?.mark_slept(this, g.wait_ms?.(this) ?? 0); } catch {}
	}
};

Agents.Agent.WATCHDOGS = new Set(["servex-heartbeat", "servex-compact-nudge"]);

/* A nudged agent that declined is nudged again only after its context grew this much. */
export const NUDGE_GROWTH = 20000;   // the least growth between two nudges; the step is 5% of the window when that is more
/* RENEWAL helpers (Agent.renew_due, Agents.wake): why a renewing role is due a fresh session, and that session's first words. */
export function renew_why(line, started_at, context, now = Date.now()){
	if (!line) return null;
	const born = Date.parse(started_at ?? "");
	if (line.hours && born && now - born >= line.hours * 3600e3) return "age";
	if (line.tokens && (context ?? 0) >= line.tokens) return "tokens";
	return null;
}
export function renewal_text(id, replaces, why){
	return `You are a fresh session of ${id}, replacing session ${replaces ?? "(unknown)"} (${why === "age" ? "it was a day old" : "its context passed the renewal line"}). ` +
		"Read public/framework/ai/readme.md and public/framework/ai/priority.md, then your feedback inbox (module_inbox, module \"ai\"), and continue. Any message that woke you comes next.";
}

export const REMIND_TOKENS = 100000;   // a role reminder each time the context grows this much (SERVEX_REMIND_TOKENS)
export const SLEEP_COMPACT_TOKENS = 100000;   // compact before going dormant past this (capped at half the window)
export const WINDOW_TOKENS = 1000000;   // the model window the step reminders are a share of (SERVEX_WINDOW_TOKENS overrides)

export const ONE_PASS = ["reviewer", "clarity", "checker"];

/* The open end of the session: an async iterable that waits instead of
 * finishing, so `query()` never sees the prompt stream end and never closes. */
Agents.Agent.Queue = class AgentQueue {

	constructor(...args){ this.assign({ items: [], waiting: [], done: false }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* NEVER-LOSE-A-WAKE, item 5: returns whether the item was actually taken — `false` once this
	 * queue is `close()`d, instead of a silent, always-truthy `this` a caller could not tell
	 * apart from a real success. `Agent.send()` is the one caller that acts on it. */
	push(item){
		if (this.done) return false;
		const wake = this.waiting.shift();
		if (wake) wake({ value: item, done: false });
		else this.items.push(item);
		return true;
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
