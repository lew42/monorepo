import { agents as singleton } from "./Agents.js";

/* The five verbs, as MCP tools. This is the whole point of the host: a normal
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

export function tools(agents = singleton){ return [

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
			parent: { type: "string", description: "Your own agent id, if you are the one spawning this. When this child ends its turn, is stopped, or errors, it wakes YOU with one message — omit for a top-level agent with nobody to wake." }
		},
		["prompt"],
		args => card(agents.spawn(args))),

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
		({ id, text, ...note }) => card(agents.send(id, text, note))),

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
		+ " does not.",
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

export default tools;
