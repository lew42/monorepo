import { Doc, md, file_link } from "/app.js";

// Servex's own source lives OUTSIDE `public/`, so it needs its own small route to be
// readable at all — `Server/plugins/DevSource.js` (dev server only) and the page
// below, `fs/page.js`, which browses it. `file_link()` (`ext/filesystem`) now knows
// these paths (2026-09-29): a `Servex/` or `Server/` path routes here automatically.
const FS = "/framework/servex/fs/";

export default new Doc({
	meta: import.meta,
	title: "Servex",
	description: "The always-on process that runs the agents and the dev servers.",
	icon: "hub",

	notes: "roles",
	// One key: two `children:` keys merged in side by side (fs, then lifecycle), and
	// the second silently replaced the first, so fs/ fell back to the plain folder view.
	children: "fs lifecycle",

	content(){
		md("**Servex is the one process on this machine that stays up** (port 80). It runs the [AI system](/framework/ai/) (its agents, cards and heartbeat), starts and watches the dev servers, and owns every log file. It is not the [dev server](/framework/dev/) — that only reloads this site's pages.");

		md(`Files: [Servex.js](${file_link("Servex/Servex.js")}) · [sustain.mjs](${file_link("Servex/sustain.mjs")}) · [readme.md](${file_link("Servex/readme.md")}) · [the whole tree](${FS})`);

		md(`- **Agents & roles** — who does what, and on which model: [Agents & roles](/framework/servex/doc/roles/)
- **Dev servers & proxy** — every project gets a fixed port, reachable at \`<name>.localhost\`.
- **Restart** — \`node Servex/sustain.mjs\` starts it and starts it again whenever it dies.
- **MCP tools** — the door every Claude session uses, at \`http://127.0.0.1:8090/mcp\`.
- **Lifecycle** — what's left running (servers, agents, worktrees) and the reaper that closes it: [Lifecycle](/framework/servex/lifecycle/)`);

		md(`Detail for every part: [Servex/readme.md](${file_link("Servex/readme.md")}) and [Servex/agents/readme.md](${file_link("Servex/agents/readme.md")}).`);
	},
});
