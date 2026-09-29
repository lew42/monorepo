import { Doc, md, h2 } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Servex",
	description: "The always-on process that runs the agents and the dev servers.",
	icon: "hub",

	notes: "roles",

	children: "lifecycle",

	content(){
		md("**Servex is the one process on this machine that stays up** (port 80). It runs the Claude agents, starts and watches the dev servers, and owns every log file. It is not the [dev server](/framework/dev/) — that only reloads this site's pages.");

		h2("Its parts");

		md(`- **Agents & roles** — who does what, and on which model: [Agents & roles](/framework/servex/doc/roles/)
- **Cards** — each card gets an assistant that answers you and a manager that does the work.
- **Dev servers & proxy** — every project gets a fixed port, reachable at \`<name>.localhost\`.
- **Restart** — \`node Servex/sustain.mjs\` starts it and starts it again whenever it dies.
- **MCP tools** — the door every Claude session uses, at \`http://127.0.0.1:8090/mcp\`.
- **Lifecycle** — what's left running (servers, agents, worktrees) and the reaper that closes it: [Lifecycle](/framework/servex/lifecycle/)`);

		md("Detail for every part: `Servex/readme.md` and `Servex/agents/readme.md`.");
	},
});
