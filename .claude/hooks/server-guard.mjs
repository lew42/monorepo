/* SERVER GUARD HOOK (2026-10-03): a PreToolUse hook on Bash and PowerShell.
 *
 * WHY. node-reap.mjs (2026-10-02) found 26 `node server.js` processes started by hand from
 * agents' own shells, never stopped — about 1.2 GB of RAM. Servex's reverse proxy already
 * auto-starts any registered project (main or a worktree) on its first HTTP request, so an
 * agent never needs to run a dev server by hand to see a page: hitting the worktree's URL, or
 * calling the `start_server` MCP tool, is enough. This is prevention piece 3 of 3 for that leak
 * (public/framework/ai/2026-10-02/node-reap/).
 *
 * BLOCKS (exit 2, the reason on stderr), regardless of cwd (main or a worktree — Servex owns
 * the server everywhere, not just in main):
 *   `node server.js` / `node Server/run.js`, any path form (relative, absolute, forward or back
 *   slashes, case-insensitive — Windows paths aren't case sensitive) — including backgrounded
 *   with `&`, a `PORT=... node server.js &` prefix, or chained with `&&`/`;`;
 *   `npm start` / `npm run dev` — both just wrap the same server;
 *   the PowerShell form `Start-Process node ... server.js` (bare or via `-ArgumentList`).
 *
 * ALLOWS everything else: `node Server/worktree-up.mjs`, `worktree-down.mjs`, `merge.mjs`,
 * `smoke.mjs`, `node --test`, `node --check`, any other `node <script>.js` that isn't
 * `server.js` or `Server/run.js` itself, and "server.js" showing up only as an argument/flag
 * value to something else (a log filename, a grep pattern, a commit message) rather than as the
 * script node actually runs.
 *
 * FAILS OPEN: any error inside this hook lets the command through. */

const SEGMENTS = /\|\||&&|[;|]/;

/* Everything after `node` in its own command segment, minus node's own flags (`-x`, `--y`) and
 * any `VAR=val` env assignment that comes after it: the first token left is the script node is
 * actually about to run. Quotes around it are stripped so `'server.js'` still resolves. */
function node_target(tokens, node_idx) {
	for (let i = node_idx + 1; i < tokens.length; i++) {
		const raw = tokens[i];
		if (!raw) continue;
		if (/^-/.test(raw)) continue; // a node flag, e.g. --inspect
		if (/^[A-Za-z_]\w*=/.test(raw)) continue; // an env assignment before the real command
		return raw.replace(/^["']|["']$/g, "").replace(/[;&|]+$/, "");
	}
	return null;
}

/* Scans one shell segment for a `node ... <script>` invocation and says which guarded script,
 * if any, it runs. */
function node_script(segment) {
	const tokens = segment.trim().split(/\s+/).filter(Boolean);
	const idx = tokens.findIndex(t => /^["']?node(\.exe)?["']?$/i.test(t));
	if (idx === -1) return null;
	const target = node_target(tokens, idx);
	if (!target) return null;
	const norm = target.replace(/\\/g, "/").toLowerCase();
	if (norm === "server.js" || norm.endsWith("/server.js")) return "node server.js";
	if (norm.endsWith("server/run.js")) return "node Server/run.js";
	return null;
}

let raw = "";
process.stdin.on("data", d => (raw += d)).on("end", () => {
	try {
		const input = JSON.parse(raw);
		const raw_cmd = String(input.tool_input?.command ?? "");
		if (!raw_cmd.trim()) return process.exit(0);
		// Quoted text is a message, not a command: `git commit -m "fixed server.js"` must pass.
		const cmd = raw_cmd.replace(/"[^"]*"|'[^']*'/g, '""');

		for (const segment of cmd.split(SEGMENTS)) {
			const hit = node_script(segment);
			if (hit) {
				process.stderr.write(reason(hit));
				return process.exit(2);
			}
		}
		if (/\bnpm\s+start\b/i.test(cmd)) { process.stderr.write(reason("npm start")); return process.exit(2); }
		if (/\bnpm\s+run\s+dev\b/i.test(cmd)) { process.stderr.write(reason("npm run dev")); return process.exit(2); }

		// Start-Process form: checked on the RAW command, because the script path usually sits
		// inside the quoted -ArgumentList string that the stripping above would blank out.
		for (const segment of raw_cmd.split(SEGMENTS)) {
			if (/\bstart-process\b/i.test(segment) && /\bnode\b/i.test(segment) &&
				(/server\.js/i.test(segment) || /server[\\/]run\.js/i.test(segment))) {
				process.stderr.write(reason("Start-Process ... server.js"));
				return process.exit(2);
			}
		}
		process.exit(0);
	} catch {
		process.exit(0);
	}
});

function reason(label) {
	return `SERVER GUARD: \`${label}\` is blocked. Servex starts dev servers — agents don't. Hit the worktree's URL (the proxy auto-starts it on first request), or call the \`start_server\` MCP tool. Never \`node server.js\` / \`node Server/run.js\` / \`npm start\` / \`npm run dev\` by hand.\n`;
}
