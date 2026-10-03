import { createSdkMcpServer, tool as sdk_tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { agents as singleton } from "./Agents.js";
import { Policy } from "./policy.js";
import { ops_tools } from "./ops.js";
import { job_tools } from "./jobs.js";
import { expert_tools } from "./experts.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");

/* The seven verbs, as MCP tools. This is the whole point of the host: a normal
 * Claude session — sidebar, terminal, or another agent — cannot hold a child
 * process's stdin, so it cannot steer a running agent. It can call a tool.
 * The handlers run inside Servex, where the sessions actually live.
 *
 * Shape is `Server/plugins/MCP.js`'s: `{name, description, inputSchema}` plus a
 * handler that returns a string, which MCP.js wraps as MCP content. `schema` is
 * the same object under the name the Servex seam asks for.
 *
 * `tools(host)` is a FUNCTION, not a constant array, because the handlers have to
 * close over the host that is actually running — Servex builds its own
 * (`new Servex.Agents({ log: servex.log })`, wired to the single writer and the
 * dashboard's live stream), and a tool bound to the module-level singleton would
 * spawn agents into a second, invisible registry. Call it with no argument and
 * you get the singleton, which is what a standalone script wants:
 *
 *   for (const tool of tools(servex.agents)) servex.mcp.tool(tool); */

const ID = { type: "string", description: "The agent's human-readable id, as `list_agents` gives it — e.g. `minion-servex-port`. Never a uuid." };

/* ASK 2b (process-monitor, "dormancy is per agent AND per request", revised 2026-10-01 16:20):
 * how long an agent waits, idle, before its claude process exits to free RAM (it resumes in
 * place on the next message — a cold resume measured 3+ seconds to first token, so this is
 * never a hard "instant kill", see Servex/agents/Global.js). A number of SECONDS, or the one
 * word "session" to never auto-sleep for as long as this is a live, ongoing session (the voice
 * pair's own default). Left out, the agent's ROLE picks a sensible default
 * (`Global.default_after`): the voice pair's "session", 0 for one-off workers (minion, reviewer,
 * task-mastermind), the plain few-minutes timer for everyone else. */
const DORMANT_AFTER = { description: "Seconds to stay idle before sleeping to free RAM (resumes in place on the next message), or the word \"session\" to never auto-sleep while this is a live session. Omit it to use the role's own default — see Servex/agents/Global.js's `default_after`.",
	anyOf: [{ type: "number" }, { type: "string", enum: ["session"] }] };

const tool = (name, description, properties, required, handler) => {
	const inputSchema = { type: "object", required, properties };
	return { name, description, inputSchema, schema: inputSchema, handler };
};

/* Every answer is the registry card, so the caller always learns the id it got
 * — spawn names the agent, the caller does not. */
const card = agent => JSON.stringify(agent.card(), null, 2);

/* Everything an agent can call: the seven agent verbs below, the three
 * operator tools (ops.js), the two job tools (jobs.js) and the four module-expert
 * tools (experts.js: ask_expert, list_experts, load_module, readme_modules) — so one line in
 * Servex.js, `for (const tool of tools(servex.agents)) servex.mcp.tool(tool)`,
 * wires them all, and `server(host)` hands all of them to an in-process agent. */
export function tools(agents = singleton){
	return [...own(agents), ...ops_tools(agents), ...job_tools(agents).map(caller_is_from), ...expert_tools(agents), ...session_tools(agents), ...task_tools(agents)];
}

/* ---------- the Dashboard's three task buttons (stalled-and-budgets, 2026-10-02) ---------- */

/* Appends ONE verb line to a task's own task.jsonl through append.mjs — the one writer every
 * task log goes through, so a bad shape is refused (exit 3, nothing written) rather than ever
 * hand-rolled here. `dir` is the task's directory, repo-relative (as `tasks.json` gives it) or
 * absolute; "NOW" fields are stamped by append.mjs itself, never read from this process's clock
 * twice. Throws with append.mjs's own stderr on a refusal, so the tool's handler can report it. */
function append_task_line(dir, obj){
	const abs = path.isAbsolute(dir) ? dir : path.join(ROOT, dir);
	const target = path.join(abs, "task.jsonl");
	if (!fs.existsSync(target)) throw new Error(`no task.jsonl at ${target}`);
	const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "task-verb-")), "line.json");
	fs.writeFileSync(tmp, JSON.stringify([obj]));
	execFileSync(process.execPath, [path.join(ROOT, ".claude", "hooks", "append.mjs"), target, tmp], { stdio: "pipe", windowsHide: true });
	return target;
}

/* The agent id on a task's own task.jsonl line 1 (same field tasks.js and Asks.js both read as
 * the task's "owner") — `null` for a dir with no task.jsonl yet or an old one with no agent field. */
function task_owner(dir){
	const abs = path.isAbsolute(dir) ? dir : path.join(ROOT, dir);
	let text;
	try { text = fs.readFileSync(path.join(abs, "task.jsonl"), "utf8"); } catch { return null; }
	for (const raw of text.replace(/^﻿/, "").split(/\r?\n/)){
		if (!raw.trim()) continue;
		let obj; try { obj = JSON.parse(raw); } catch { continue; }
		if (obj.assign?.agent) return obj.assign.agent;
	}
	return null;
}

const TASK_DIR = { type: "string", description: "The task's directory, as tasks.json's own `dir` field gives it (e.g. `public/framework/ai/2026-10-02/stalled-and-budgets`)." };

function task_tools(agents){
	return [
		tool("snooze_task",
			"Hide a task from the Dashboard's stalled list until a given time, without touching its files. Appends a"
			+ " `{\"snooze\":{at,until,by}}` line to the task's own task.jsonl (public/framework/ai/tasks.json is"
			+ " regenerated on the next tick and honours it) — never an edit to an existing line.",
			{ dir: TASK_DIR,
				until: { type: "string", description: "ISO timestamp — the task is not shown as stalled again before this time." },
				by: { type: "string", description: "Who asked for the snooze — your agent id, or \"owner\" when relaying the owner's own click." } },
			["dir", "until"],
			({ dir, until, by }, ctx = {}) => {
				append_task_line(dir, { snooze: { at: "NOW", until, by: by ?? ctx.caller ?? "owner" } });
				return JSON.stringify({ ok: true, dir, until });
			}),

		tool("kill_task",
			"Close a task for good — folded on the Dashboard like a landed one, never shown as stalled again. Appends"
			+ " a `{\"kill\":{at,why,by}}` line (never deletes anything) and, if the task's owner agent is still"
			+ " live, stops it the same way `stop_agent` does, so nothing keeps working on a killed task.",
			{ dir: TASK_DIR,
				why: { type: "string", description: "One line: why this task is being killed (shown on the Dashboard)." },
				by: { type: "string", description: "Who killed it — your agent id, or \"owner\" when relaying the owner's own click." } },
			["dir", "why"],
			({ dir, why, by }, ctx = {}) => {
				const who = by ?? ctx.caller ?? "owner";
				append_task_line(dir, { kill: { at: "NOW", why, by: who } });
				const owner = task_owner(dir);
				let stopped = null;
				if (owner && agents.registry_list?.().some(r => r.id === owner && !["stopped", "gone"].includes(r.state)))
					try { stopped = agents.stop(owner, { by: who }).card?.() ?? null; } catch (e){ stopped = { error: String(e.message || e) }; }
				return JSON.stringify({ ok: true, dir, why, owner, stopped });
			}),

		tool("reprioritise_task",
			"Move a task up or down the Dashboard's order by hand. Appends a `{\"priority\":{at,score,why,by}}` line;"
			+ " that `score` then OVERRIDES the computed band (stalled=100, over-budget=90, building=50, snoozed=10,"
			+ " closed=0 — Servex/asks/readme.md) for this task, until a later priority line changes it again.",
			{ dir: TASK_DIR,
				score: { type: "number", description: "Higher sorts closer to the top of the Dashboard." },
				why: { type: "string", description: "One line: why this task should move." },
				by: { type: "string", description: "Who asked — your agent id, or \"owner\" when relaying the owner's own click." } },
			["dir", "score", "why"],
			({ dir, score, why, by }, ctx = {}) => {
				append_task_line(dir, { priority: { at: "NOW", score, why, by: by ?? ctx.caller ?? "owner" } });
				return JSON.stringify({ ok: true, dir, score });
			}),
	];
}

/* A voice session's smart assistant writes through these (Sessions.js, ext/Session/doc/sessions.md). */
function session_tools(agents){
	const sessions = () => {
		const s = agents.servex?.sessions;
		if (!s) throw new Error("Voice sessions are not running in this Servex (SERVEX_NO_LAYERS?).");
		return s;
	};
	const SESSION = { type: "string", description: "The session id, `v-…`, as your brief names it." };
	return [
		tool("session_summary",
			"Give a voice session its title and one-line summary: the index a new session reads to know what this one was about."
			+ " Call it BEFORE your first reply, and again whenever the topic shifts. Writes `<home>ai/<session>.summary.json` and a fresh"
			+ " `started` line, with the title, in the home folder's `ai/log.jsonl`.",
			{ session: SESSION,
				title: { type: "string", description: "At most 6 words, e.g. `Voice session plumbing`." },
				summary: { type: "string", description: "One plain line: what was asked, and what is in flight." } },
			["session", "title", "summary"],
			args => JSON.stringify(sessions().summarize(args))),
		tool("session_line",
			"Post a line to the owner in a voice session. With `re` alone it is a reply to that owner line. With `re` AND `level` it is"
			+ " a REFINED version of the owner's words, drawn under the raw line: `clean` (fillers gone), `edit` (rewritten clearly),"
			+ " `summary` (the gist). `level` is required on every refinement, or it is drawn as a reply; a refinement without `re` is refused.",
			{ session: SESSION,
				text: { type: "string", description: "The line." },
				re: { type: "string", description: "The `at` of the owner line this answers or refines." },
				level: { type: "string", enum: ["clean", "edit", "summary"], description: "Only on a refinement: `clean`, `edit` or `summary`." } },
			["session", "text"],
			args => JSON.stringify(sessions().line(args))),
		tool("quick_fix",
			"The fast path: a small, concrete change to the page the owner is looking at (\"make this bold\", \"this gap is too"
			+ " big\", a word, a colour, a size) goes straight to the standing fixer, fixer-1 — no spawn, nothing new made,"
			+ " landing in roughly 10-30 seconds. Writes the request to public/framework/ai/quick-fix/page.jsonl and hands it"
			+ " to the fixer at once. If the fixer is mid-fix, this one queues behind it and the answer says how many are ahead."
			+ " The fixer itself decides if the change turns out to be bigger than a quick fix and hands it to a task-mastermind"
			+ " instead — you do not have to guess right before calling this.",
			{ page: { type: "string", description: "The site path being looked at, e.g. `/framework/ext/Chat/`." },
				selection: { type: "object", description: "The one element picked out, if any: `{kind, label, text, selector}` — the same shape `ext/drawer/select.js` reports." },
				text: { type: "string", description: "What to change, in the owner's own words." },
				session: SESSION },
			["page", "text"],
			args => JSON.stringify(sessions().quick_fix(args))),
		tool("quick_fix_landed",
			"The fixer calls this once its OWN `merge.mjs` run has actually landed a quick fix — never before, and never with a"
			+ " guessed or stated elapsed time: this computes the real seconds from the `asked_at` quick_fix gave you (CLAUDE.md"
			+ " law 7, \"compute, don't recall\"). Pass through exactly what merge.mjs told you.",
			{ asked_at: { type: "string", description: "The `asked_at` quick_fix's answer gave you — copied exactly, not retyped from memory." },
				sha: { type: "string", description: "The commit merge.mjs landed (its `merged` or `applied` field)." },
				files: { type: "number", description: "How many files the fix touched." },
				lines: { type: "number", description: "The diff's total added + deleted lines." },
				width: { type: "number", description: "The one screenshot width used, if you took one (fixer.md step 7)." },
				shot: { type: "string", description: "The screenshot's path under public/framework/ai/quick-fix/shots/, if you took one." } },
			["asked_at", "sha"],
			args => JSON.stringify(sessions().quick_fix_landed(args))),
		tool("dir_log",
			"Append ONE line to a folder's `ai/log.jsonl`: the minimal index of AI work in that folder, presence only, each line"
			+ " pointing at its detail file. Write it as you go, not at the end. Exactly one of these three shapes, nothing else:"
			+ " {\"session\":{\"id\",\"event\":\"started\"|\"ended\",\"title\",\"file\"}}, {\"task\":{\"dir\",\"event\":\"opened\"|\"landed\",\"title\"}},"
			+ " {\"decision\":{\"text\",\"file\"}}. `at` is stamped for you. Never step-by-step progress: that stays in the session's or task's own log.",
			{ dir: { type: "string", description: "The folder the work is ABOUT: a site path like `/framework/ext/Chat/`, or any repo folder like `public/framework/ext/Chat` or `Servex/agents` (written to `<repo>/Servex/agents/ai/log.jsonl`)." },
				line: { type: "object", description: "One line, e.g. {\"decision\":{\"text\":\"Chat keeps one file per session\",\"file\":\"/framework/ext/Chat/ai/v-1abc.jsonl\"}}." } },
			["dir", "line"],
			args => JSON.stringify(sessions().dir_log(args)))
	];
}

/* start_job's answer comes to `from` — which defaults to whoever is calling
 * (`?as=` on the door), the same as fork_self, so an agent need not know its id. */
const caller_is_from = t => t.name !== "start_job" ? t
	: { ...t, handler: (args = {}, ctx = {}) => t.handler({ ...args, from: args.from ?? ctx.caller ?? undefined }, ctx) };

function own(agents){
const policy = agents.policy ??= new Policy({ agents });
return [

	tool("spawn_agent",
		"Start a new Claude session inside Servex and give it a job. It stays alive and steerable"
		+ " after it answers — talk to it again with `send_to_agent`. Returns the agent's card,"
		+ " including the id you address it by and the session uuid a terminal can `claude --resume`.",
		{
			role: { type: "string", description: "What it is: `minion`, `mastermind`, `assistant`. Half of its id." },
			name: { type: "string", description: "What it is working on, in a word or two. The other half of its id." },
			prompt: { type: "string", description: "The job, as you would type it to a person. This is its first turn." },
			model: { type: "string", description: "Model id. Default `claude-sonnet-5`. Cheap scans: `claude-haiku-4-5-20251001`. An OpenRouter slug (anything with a `/`, e.g. `deepseek/deepseek-v4.1-flash`) runs through OpenRouter automatically — see `provider`." },
			provider: { type: "string", description: "`anthropic` (default) or `openrouter`. Usually leave it out: a `model` with a `/` in it already implies `openrouter`. Needs an OpenRouter key at %LOCALAPPDATA%\\lew42\\servex\\openrouter.key (Servex/ext/openrouter/readme.md) — missing key fails the spawn with one clear line." },
			effort: { type: "string", description: "`low` `medium` `high` `xhigh` `max`. Default `high`." },
			cwd: { type: "string", description: "Directory it works in. Default the Servex process's own." },
			visibility: { type: "string", description: "Who the dashboard shows it to — `team` (default), `owner`, `private`. A label; nothing enforces it yet." },
			permission_mode: { type: "string", description: "`acceptEdits` (default) lets it edit files; `bypassPermissions` lets it do anything, including run commands; `plan` lets it do nothing." },
			allowed_tools: { type: "array", items: { type: "string" }, description: "Whitelist, e.g. [\"Bash\",\"Read\",\"Write\",\"Edit\"]. Omit for the CLI's own default set." },
			parent: { type: "string", description: "Your own agent id, if you are the one spawning this. When this child ends its turn, is stopped, or errors, it wakes YOU with one message — omit for a top-level agent with nobody to wake." },
			resume: { type: "string", description: "A session uuid to CONTINUE instead of starting blank — the agent opens with that whole conversation. No skill-load preamble is added, and with no `prompt` it just waits, idle, for a message. ⚠ Give the `cwd` the session originally ran in: sessions are stored per project directory, and a resume from anywhere else cannot find it." },
			fork: { type: "boolean", description: "With `resume`: continue as a NEW session (a copy), leaving the original untouched and still usable. It reuses the original's prompt cache when model, tools and settings match." },
			task: { type: "object", description: "Open this agent's task.jsonl for it, before its first turn: `{dir, card, brief}`. `dir` is the task's directory (repo-relative or absolute; created if new) — line 1 (or the next line, if the dir already has a log) is written there with the session id, agent id, card, brief and model, so the agent never has to run new-task itself; its first turn is told where its log already is. Nested tasks: `parent_task` (the parent's task dir; defaults to the calling agent's own task dir) and `after` (an array of the sibling task DIRS this one waits for, the series edges — full dirs like `dir`, never bare slugs; stored repo-relative like `parent_task` and matched exactly) are written into that line too." },
			dormant_after: DORMANT_AFTER
		},
		[],
		(args, ctx = {}) => {
			if (!args.prompt && !args.resume) throw new Error("spawn_agent needs a `prompt` (or a `resume` to reopen).");
			const ruling = policy.spawn(ctx.caller ?? null, args.role);
			if (!ruling.ok) return JSON.stringify({ ok: false, why: ruling.why });
			return card(agents.spawn(args));
		}),

	tool("fork_self",
		"Ask a COPY of yourself one question, in the background, and keep working. The fork has your"
		+ " whole conversation up to now (it reuses your prompt cache, so it is cheap) and runs in"
		+ " its own session, so you stay free to answer messages while it thinks. This call returns"
		+ " at once with the fork's id. The answer arrives later as a message to you, starting"
		+ " `fork answer:`. Outside Servex (e.g. a VS Code tab), nothing can message you, so call"
		+ " `wait_for_agent` with the fork's id to collect it. By default the fork has NO tools: it"
		+ " decides from what it already knows. Give it `allowed_tools` like [\"Read\",\"Grep\",\"Glob\"]"
		+ " for \"look at these three files, then decide\". It answers once and stops itself.",
		{
			question: { type: "string", description: "The one question or decision, in full. The fork sees your whole context, so you can refer to it." },
			from: { type: "string", description: "Your own Servex agent id. Usually leave it out: Servex already knows which of its agents is calling. The answer wakes you." },
			session_id: { type: "string", description: "Instead of `from`, for a session Servex does not hold: your Claude session uuid (in a shell, `$CLAUDE_CODE_SESSION_ID`). Its cwd and model are read from the session file." },
			model: { type: "string", description: "Override the model. Leave it out: a different model cannot reuse your cache and pays for your whole context again." },
			cwd: { type: "string", description: "Override the working directory. Leave it out: a fork must run where the session ran." },
			allowed_tools: { type: "array", items: { type: "string" }, description: "Tools the fork may use, e.g. [\"Read\",\"Grep\",\"Glob\"]. Default none. (They stay listed either way — removing them would break the cache — every call outside this list is refused.)" }
		},
		["question"],
		async ({ allowed_tools, ...args }, ctx = {}) => {
			const from = args.from ?? ctx.caller ?? undefined;
			const fork = await agents.fork({ ...args, from, tools: allowed_tools ?? [] });
			return JSON.stringify({
				id: fork.id, parent: fork.parent ?? null, forked_from: fork.forked_from,
				note: fork.parent
					? `Keep working. The answer arrives as a message from ${fork.id}, starting "fork answer:".`
					: `Collect the answer with wait_for_agent({id: "${fork.id}"}).`
			}, null, 2);
		}),

	tool("wait_for_agent",
		"Wait until an agent finishes its current turn (nothing left queued) or stops, then return its"
		+ " state and everything it said that turn. Returns at once if it is already idle. Blocks your"
		+ " own turn while it waits — from a terminal or VS Code tab, run it in the BACKGROUND instead:"
		+ " POST {\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"wait_for_agent\","
		+ "\"arguments\":{\"id\":\"<id>\"}}} to Servex's /mcp url with curl in a background shell, and you"
		+ " are told when it answers. A Servex agent with a `parent` wakes that parent anyway; this is for"
		+ " everyone else.",
		{
			id: ID,
			timeout_s: { type: "number", description: "Give up after this many seconds and say `timed_out: true`. Default 600." }
		},
		["id"],
		/* A caller blocked here is not WORKING for the cap (Agents.working): it only waits,
		 * and counting it could hold the very child it waits for at the gate. */
		async ({ id, timeout_s }, ctx = {}) => {
			const me = ctx.caller && agents.live.get(ctx.caller);
			if (me) me.waiting_on = id;
			try { return JSON.stringify(await agents.wait(id, timeout_s ?? 600), null, 2); }
			finally { if (me && me.waiting_on === id) me.waiting_on = null; }
		}),

	tool("send_to_agent",
		"Say something to a running agent. It arrives wrapped so the agent can see who asked and"
		+ " where the answer goes. By default it waits its turn — the agent finishes what it is"
		+ " doing first. Use priority `now` for a stop or a correction: that cancels what the agent"
		+ " is saying and delivers your message immediately.",
		{
			id: ID,
			text: { type: "string", description: "What to say." },
			from: { type: "string", description: "Who is asking — your own agent id or name. The agent sees this." },
			reply_to: { type: "string", description: "Where the answer should go, in plain words: `log agent-host`, `message mastermind-servex`." },
			priority: { type: "string", description: "`now` to cut in mid-answer. Omit to queue behind the current turn." },
			revive: { type: "boolean", description: "Wake it even though it was stopped on purpose or its task has landed (refused otherwise, with the reason). Never wakes one whose directory is gone." },
			dormant_after: DORMANT_AFTER
		},
		["id", "text"],
		({ id, text, dormant_after, ...note }, ctx = {}) => {
			// a call with `message` instead of `text` delivered the word "undefined" to six masterminds (09-29)
			if (typeof text !== "string" || !text.trim()) return JSON.stringify({ ok: false, why: "send_to_agent needs `text` (what to say); it was missing or empty." });
			id = agents.holder?.(id) ?? id;
			const ruling = policy.message(ctx.caller ?? null, id);
			if(!ruling.ok) return JSON.stringify({ ok: false, why: ruling.why });
			const from = ctx.caller ?? note.from;
			policy.heard(from ?? "owner", id);
			const agent = agents.send(id, text, { ...note, from });
			// Agent.send() only reads {from, reply_to, priority} off its note and drops everything
			// else (ask 2b, process-monitor) — set it on the returned agent object directly, so a
			// caller can change how long THIS agent waits before it sleeps, per request, without
			// needing a change to Agents.js itself. `agents.send()` always returns the live agent
			// (or a held/external stand-in) it just delivered to.
			if (dormant_after !== undefined && agent && typeof agent === "object") agent.dormant_after = dormant_after;
			const sent = card(agent);
			/* a peer message between task masterminds: the sender's parent gets a copy, so no interface between tasks is invisible */
			const up = ruling.rule === "peer" && policy.parent(from);
			if (up && up !== id) try { agents.send(up, `copy: ${from} -> ${id}: ${text}`, { from: "servex-peer-copy" }); } catch {}
			return sent;
		}),

	tool("interrupt_agent",
		"Stop an agent mid-sentence, keeping the session alive. It goes idle with everything it has"
		+ " done so far intact, and you can talk to it again. Use this when it is heading the wrong"
		+ " way; use `send_to_agent` with priority `now` when you want to redirect it in one step.",
		{ id: ID },
		["id"],
		async ({ id }) => card(await agents.interrupt(id))),

	tool("list_agents",
		"Every agent Servex has ever registered: its id, role, name, topics, page, state, who can"
		+ " see it, its session uuid for `claude --resume`, when it started and its parent — the"
		+ " same rows `GET /agents` returns, so this survives a Servex restart the in-memory list"
		+ " does not. A row whose host process died (a Servex restart it did not survive) reads"
		+ " `gone`, never idle or working.",
		{},
		[],
		() => JSON.stringify(agents.registry_list(), null, 2)),

	tool("stop_agent",
		"End a session for good. The agent stops, its `claude` process exits, and its log stays on"
		+ " disk. It keeps its place in the list, marked `stopped`, so its session uuid is still"
		+ " there to resume from a terminal. Nothing revives it by itself after this (no heartbeat,"
		+ " no restart, no child's report); a message wakes it only with `revive: true`.",
		{ id: ID },
		["id"],
		({ id, from }, ctx = {}) => card(agents.stop(id, { by: ctx.caller ?? from ?? "owner" })))
]; }

/* The same tools IN-PROCESS, for a host with no HTTP `/mcp` (fork-proof.mjs,
 * a test): an SDK MCP server whose handlers are the functions above. Hand it
 * to a spawn as `mcp_servers: { servex: server(host) }` and the agent calls
 * `mcp__servex__fork_self` straight into this process. `ctx.caller` is who the
 * handlers are told is calling — what `?as=` is on the HTTP door. JSON Schema → zod for
 * the property kinds the tools use. `list` narrows it: `server(host, ctx, loader_tools())`
 * gives a session only `load_module` and `readme_modules` (experts-proof.mjs, way b). `alwaysLoad`: otherwise the CLI defers them
 * behind ToolSearch and a small model reports the tool "not available". */
export function server(agents = singleton, ctx = { caller: null }, list = tools(agents)){
	const zod = ({ type, items, enum: one_of }) => one_of ? z.enum(one_of)
		: type === "number" ? z.number() : type === "boolean" ? z.boolean()
		: type === "object" ? z.looseObject({})   // NOT z.record(): one record breaks the SDK server's whole tools/list
		: type === "array" ? z.array(items?.type === "string" ? z.string() : z.any()) : z.string();
	return createSdkMcpServer({ name: "servex", alwaysLoad: true, tools: list.map(t => sdk_tool(t.name, t.description,
		Object.fromEntries(Object.entries(t.inputSchema.properties).map(([k, p]) =>
			[k, (t.inputSchema.required.includes(k) ? zod(p) : zod(p).optional()).describe(p.description ?? k)])),
		async args => {
			try { return { content: [{ type: "text", text: String(await t.handler(args, ctx)) }] }; }
			catch (e){ return { content: [{ type: "text", text: String(e.message || e) }], isError: true }; }
		})) });
}

export default tools;
