// Apply the skill-text fix task-mastermind-node-reap asked for (node-reap/server-guard, note "skill-conflict"):
// the new server-guard.mjs PreToolUse hook refuses `node server.js`, so skills that tell agents to start one by hand are stale.
// Edits under .claude/ are refused to Write/Edit, so this script makes them: each old text must match exactly once, or it aborts.
// Run: node public/framework/ai/sessions/2026/10/02/servex-mastermind/apply-server-guard-skills.mjs [--dry]
import fs from "node:fs";

const DRY = process.argv.includes("--dry");
const NO_HAND = "**Never start a server by hand.** Servex starts and reaps every server: call `start_server` / `stop_server`, or open the worktree's URL (the proxy starts it). The `server-guard.mjs` hook refuses `node server.js` ([`node-reap`](/framework/ai/sessions/2026/10/02/node-reap/), 2026-10-03; on 09-29 five hand-started servers held about 1 GB while spawns waited for memory).";
const STOP = "**Stop every server you start.** A `PORT=… node server.js &` you ran to test something keeps running after you land (09-29: five of them, about 1 GB, held while spawns were queued for memory). Kill it before your turn ends.";

const edits = [
	[".claude/skills/minion/SKILL.md", STOP, NO_HAND],
	[".claude/skills/sub-mastermind/SKILL.md", STOP, NO_HAND],
	[".claude/skills/minion/SKILL.md",
		"After any `Server/`-tree edit, boot it yourself first: `PORT=<your port> node server.js` from the REPO ROOT (never a path under `Server/`, which only exports the class and exits silently), then curl it for a real 200 ([`reload-hold`](/framework/ai/sessions/2026/09/19/reload-hold/)).",
		"After any `Server/`-tree edit, call `start_server` (or open the worktree's URL; the proxy starts it) to confirm the change boots, then curl it for a real 200 ([`reload-hold`](/framework/ai/sessions/2026/09/19/reload-hold/)). Never `node server.js` by hand: the `server-guard.mjs` hook refuses it."],
	[".claude/skills/minion/SKILL.md",
		"- **Never start the owner's server on port 80** — that one is theirs, run in their own terminal. Your private server is the port your brief names: `PORT=<port> node server.js` from the repo root, killed by its own PID at landing — never by name or port pattern (⚠ in this Windows git-bash, `$!` after `cmd &` is NOT the real Windows PID — a kill by it silently misses; read the real PID from `netstat -ano` on your port, or PowerShell `Get-Process`, and kill that; 2026-09-17, sqlite-scout) (2026-09-05: a minion killed the mastermind's own :8091 server by matching `node server.js`).",
		"- **Never touch the owner's server on port 80**, and never kill a server by name or port pattern (2026-09-05: a minion killed the mastermind's own :8091 server by matching `node server.js`). Servex owns every server: `start_server`, `stop_server`, `server_logs`."],
	[".claude/skills/mastermind/SKILL.md",
		"- A worker that needs a server starts a PRIVATE one (`PORT=809x node server.js` from the repo root) and kills it at landing; `netstat -ano | grep LISTENING | grep -E \":80(8|9)[0-9]\\s\"` lists the ports already claimed (a sibling held 8097 on the first try, 2026-08-31). The mastermind's own private server runs on **port 8123**, outside this 809x minion range; a brief that starts a server names the port it may use.",
		"- A worker that needs a server calls `start_server` (or opens the worktree's URL); Servex leases it and reaps it. `node server.js` by hand is refused by the `server-guard.mjs` hook ([`node-reap`](/framework/ai/sessions/2026/10/02/node-reap/), 2026-10-03)."],
	// task-mastermind-inbox-cards-work, bug 7 (ai/sessions/2026/10/03/71eead80-a869-421f-83bb-eba7ff83510e/inbox-cards-work): card titles in plain words.
	// create_card's own `title` description already carries it (Cards.js, 3ec9a5a7); these are the skills that write cards.
	[".claude/skills/content/SKILL.md",
		"a title is 5–8 words starting with the familiar concept;",
		"a title is 5–8 words starting with the familiar concept, and says what happened and why it matters in words a non-programmer reads, never a system's internal noun (\"worktree pool\", \"the inbox rail\", a tool name);"],
	[".claude/skills/mastermind/SKILL.md",
		"a title of about five words (\"Site crash\"), the time.",
		"a title of about five words (\"Site crash\"), the time. The title says what happened and why it matters in words a non-programmer reads, never a system's internal noun (\"worktree pool\", a tool name)."],
];

// Check every edit before writing any, so a mismatch leaves all files untouched.
const files = new Map();
for (const [file, from] of edits) {
	const text = files.get(file) ?? fs.readFileSync(file, "utf8");
	files.set(file, text);
	const n = text.split(from).length - 1;
	if (n !== 1) { console.error(`ABORT: ${file}: old text found ${n} times: ${from.slice(0, 70)}…`); process.exit(1); }
}
for (const [file, from, to] of edits) files.set(file, files.get(file).replace(from, () => to));
for (const [file, text] of files) {
	if (DRY) console.log(`would write ${file}`);
	else { fs.writeFileSync(file, text); console.log(`wrote ${file}`); }
}
