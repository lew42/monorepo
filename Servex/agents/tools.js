import { createSdkMcpServer, tool as sdk_tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { agents as singleton } from "./Agents.js";
import { Policy } from "./policy.js";
import { ops_tools } from "./ops.js";
import { job_tools } from "./jobs.js";
import { expert_tools } from "./experts.js";

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
	return [...own(agents), ...ops_tools(agents), ...job_tools(agents).map(caller_is_from), ...expert_tools(agents)];
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
			model: { type: "string", description: "Model id. Default `claude-sonnet-5`. Cheap scans: `claude-haiku-4-5-20251001`." },
			effort: { type: "string", description: "`low` `medium` `high` `xhigh` `max`. Default `high`." },
			cwd: { type: "string", description: "Directory it works in. Default the Servex process's own." },
			visibility: { type: "string", description: "Who the dashboard shows it to — `team` (default), `owner`, `private`. A label; nothing enforces it yet." },
			permission_mode: { type: "string", description: "`acceptEdits` (default) lets it edit files; `bypassPermissions` lets it do anything, including run commands; `plan` lets it do nothing." },
			allowed_tools: { type: "array", items: { type: "string" }, description: "Whitelist, e.g. [\"Bash\",\"Read\",\"Write\",\"Edit\"]. Omit for the CLI's own default set." },
			parent: { type: "string", description: "Your own agent id, if you are the one spawning this. When this child ends its turn, is stopped, or errors, it wakes YOU with one message — omit for a top-level agent with nobody to wake." },
			resume: { type: "string", description: "A session uuid to CONTINUE instead of starting blank — the agent opens with that whole conversation. No skill-load preamble is added, and with no `prompt` it just waits, idle, for a message. ⚠ Give the `cwd` the session originally ran in: sessions are stored per project directory, and a resume from anywhere else cannot find it." },
			fork: { type: "boolean", description: "With `resume`: continue as a NEW session (a copy), leaving the original untouched and still usable. It reuses the original's prompt cache when model, tools and settings match." },
			task: { type: "object", description: "Open this agent's task.jsonl for it, before its first turn: `{dir, card, brief}`. `dir` is the task's directory (repo-relative or absolute; created if new) — line 1 (or the next line, if the dir already has a log) is written there with the session id, agent id, card, brief and model, so the agent never has to run new-task itself; its first turn is told where its log already is." }
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
		async ({ id, timeout_s }) => JSON.stringify(await agents.wait(id, timeout_s ?? 600), null, 2)),

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
			priority: { type: "string", description: "`now` to cut in mid-answer. Omit to queue behind the current turn." }
		},
		["id", "text"],
		({ id, text, ...note }, ctx = {}) => {
			id = agents.holder?.(id) ?? id;
			const ruling = policy.message(ctx.caller ?? null, id);
			if(!ruling.ok) return JSON.stringify({ ok: false, why: ruling.why });
			const from = ctx.caller ?? note.from;
			policy.heard(from ?? "owner", id);
			return card(agents.send(id, text, { ...note, from }));
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
		+ " there to resume from a terminal.",
		{ id: ID },
		["id"],
		({ id }) => card(agents.stop(id)))
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
