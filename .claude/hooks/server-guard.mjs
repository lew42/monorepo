/* SERVER GUARD HOOK (2026-10-03): a PreToolUse hook on Bash and PowerShell.
 *
 * WHY. node-reap.mjs (2026-10-02) found 26 `node server.js` processes started by hand from
 * agents' own shells, never stopped — about 1.2 GB of RAM. Servex's reverse proxy already
 * auto-starts any registered project (main or a worktree) on its first HTTP request, so an
 * agent never needs to run a dev server by hand to see a page: hitting the worktree's URL, or
 * calling the `start_server` MCP tool, is enough. This is prevention piece 3 of 3 for that leak
 * (public/framework/ai/sessions/2026/10/02/node-reap/).
 *
 * BLOCKS (exit 2, the reason on stderr), regardless of cwd (main or a worktree — Servex owns
 * the server everywhere, not just in main):
 *   `node server.js` / `node Server/run.js`, any path form (relative, absolute, forward or back
 *   slashes, case-insensitive — Windows paths aren't case sensitive) — including backgrounded
 *   with `&`, a `PORT=... node server.js &` prefix, or chained with `&&`/`;`;
 *   `npm start` / `npm run dev` — both just wrap the same server;
 *   the PowerShell form `Start-Process node ... server.js` (bare or via `-ArgumentList`).
 *
 * ALSO BLOCKS (added 2026-11-09, `runaway-search`): an UNSCOPED recursive search — one of its
 * own orphans burned a core for hours after the shell that started it was gone
 * (`Servex/doc/processes.md`, "Reaping a burning orphan"; `Servex/agents/roles/minion.md`'s
 * "Never `find /`"). `grep -r/-R/--recursive`, `find`, or `rg`, whose search root is `/`, a
 * drive root (`C:\`, `/c`, `C:/`), `~` / `$HOME`, `..`, or the repo root — `.` or no path at all
 * while `cwd` IS that root, or an absolute path naming it outright (`C:\Code\lew42\monorepo`,
 * `C:\Code\lew42\worktrees\<any>`). A named subfolder or a single file is always fine, as is
 * `git grep` / plain `grep` with no `-r`. A heredoc's body and anything inside quotes are data,
 * never a command (`shell_segments`), so a regex like `grep|rg|find` in a script passes.
 *
 * ALLOWS everything else: `node Server/worktree-up.mjs`, `worktree-down.mjs`, `merge.mjs`,
 * `smoke.mjs`, `node --test`, `node --check`, any other `node <script>.js` that isn't
 * `server.js` or `Server/run.js` itself, and "server.js" showing up only as an argument/flag
 * value to something else (a log filename, a grep pattern, a commit message) rather than as the
 * script node actually runs.
 *
 * FAILS OPEN: any error inside this hook lets the command through. */

const SEGMENTS = /\|\||&&|[;|]/;

/* The shell commands in `raw`, for the search check: a heredoc's body is data, not commands,
 * and a `|`, `;` or `&&` inside quotes is text (a regex like `grep|rg|find` in a script body
 * was refused as a bare `rg`, 2026-11-09), so neither splits a command. A newline does. */
function shell_segments(raw) {
	const body = raw.replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g, m => m.slice(0, m.indexOf("\n")));
	const out = [];
	let cur = "", quote = null;
	for (let i = 0; i < body.length; i++) {
		const c = body[i];
		if (quote) { if (c === quote) quote = null; cur += c; continue; }
		if (c === '"' || c === "'") { quote = c; cur += c; continue; }
		const two = body.slice(i, i + 2);
		if (two === "&&" || two === "||") { out.push(cur); cur = ""; i++; continue; }
		if (c === "|" || c === ";" || c === "\n") { out.push(cur); cur = ""; continue; }
		cur += c;
	}
	out.push(cur);
	return out;
}

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

/* UNSCOPED RECURSIVE SEARCH (deliverable 2, `runaway-search`). Only `grep`/`egrep`/`fgrep`
 * (and only once a recursive flag is present), `find` and `rg` (always recursive) are checked —
 * never `git grep` (a different executable, "git", with "grep" as an argument) and never a
 * plain non-recursive `grep`. */
const SEARCH_EXE = /^(grep|egrep|fgrep|find|rg)(\.exe)?$/i;
// A root the owner never wants walked whole, written any way a shell accepts it.
const ROOT_LIKE = /^([A-Za-z]:[\\/]?|\/[A-Za-z]?\/?|~|\$HOME|\.\.)$/;
// This repo's own root, main checkout or any worktree — an absolute path naming it outright.
const REPO_ROOT = /^[A-Za-z]:\/code\/lew42\/(monorepo|worktrees\/[^/]+)\/?$/i;

/* Tokenize one shell segment, keeping a quoted "pattern with spaces" as one token.
 * Each token remembers whether it was quoted: a quoted "-r" is a pattern, never a flag. */
function tokens_of(segment) {
	const out = [];
	const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
	let m;
	while ((m = re.exec(segment))) out.push({ text: m[1] ?? m[2] ?? m[3], quoted: m[3] === undefined });
	return out;
}

function is_flag(t) { return !t.quoted && t.text.startsWith("-"); }

function norm_path(p) { return p.replace(/\\/g, "/").replace(/\/+$/, "") + "/"; }

/* true when `root` (an operand as typed — undefined means "no path given, so the
 * cwd itself"), with the command's own `cwd`, names something wider than the owner
 * ever wants one search to walk. */
function unscoped_root(root, cwd) {
	if (root === undefined || root === ".") return REPO_ROOT.test(norm_path(cwd ?? ""));
	if (root === ".." || ROOT_LIKE.test(root)) return true;
	return REPO_ROOT.test(norm_path(root));
}

/* `grep`/`egrep`/`fgrep` need an explicit recursive flag; `find` and `rg` always walk. */
function is_recursive(exe, rest) {
	if (/^(find|rg)(\.exe)?$/i.test(exe)) return true;
	return rest.some(t => is_flag(t) && (t.text === "--recursive" || (/^-[A-Za-z]+$/.test(t.text) && t.text.includes("r"))));
}

/* `find <path> ...`: the path is the first non-flag operand (or none: "."). `grep`/`rg`:
 * PATTERN first, so any path operand comes after it. */
function search_root(exe, rest) {
	const positional = rest.filter(t => !is_flag(t)).map(t => t.text);
	if (/^find(\.exe)?$/i.test(exe)) return positional[0];
	return positional[1]; // pattern is positional[0]
}

/* One shell segment: the search-scope violation it names, or null. */
function scope_violation(segment, cwd) {
	const tokens = tokens_of(segment);
	const exe = (tokens[0]?.text ?? "").replace(/^.*[\\/]/, "");
	if (!SEARCH_EXE.test(exe)) return null;
	const rest = tokens.slice(1);
	if (!is_recursive(exe, rest)) return null;
	const root = search_root(exe, rest);
	if (!unscoped_root(root, cwd)) return null;
	return { exe: exe.replace(/\.exe$/i, ""), root: root ?? "." };
}

let raw = "";
process.stdin.on("data", d => (raw += d)).on("end", () => {
	try {
		const input = JSON.parse(raw);
		const raw_cmd = String(input.tool_input?.command ?? "");
		if (!raw_cmd.trim()) return process.exit(0);
		const cwd = String(input.cwd ?? "");
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

		// Unscoped recursive search: checked on the RAW command, so a quoted pattern stays intact.
		for (const segment of shell_segments(raw_cmd)) {
			const hit = scope_violation(segment, cwd);
			if (hit) {
				process.stderr.write(scope_reason(hit));
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

function scope_reason({ exe, root }) {
	return `SERVER GUARD: \`${exe}\` over \`${root}\` is unscoped — it can walk the whole repo and burn a core after you've moved on. Name the folder (\`grep -rn X Servex/\`) or use \`git grep -n <pattern> -- <folder>\` instead.\n`;
}
