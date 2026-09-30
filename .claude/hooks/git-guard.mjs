/* GIT GUARD HOOK (2026-09-30): a PreToolUse hook on Bash and PowerShell.
 *
 * WHY. The owner's rule "never stash or reset in the main tree" was written in three skills and
 * still broken on 2026-09-28: a stash or a hard reset in the main checkout throws away other
 * agents' uncommitted work, because every agent shares that one tree. The owner said yes to
 * this hook on 2026-09-30 (card 2026/09/28/add-a-git-safety-hook).
 *
 * BLOCKS (exit 2, the reason on stderr), in the MAIN checkout only:
 *   git stash (push/pop/drop/clear; `stash list` and `stash show` are fine),
 *   git reset --hard, git checkout -- <path> / git checkout ., git restore <path> (not --staged),
 *   git clean -f.
 * A worktree (C:/Code/lew42/worktrees/…, .claude/worktrees/…) is untouched: there it's your own tree.
 * The owner can always run these in their own terminal; the hook only stops agents.
 *
 * FAILS OPEN: any error inside this hook lets the command through. */

import path from "node:path";

const MAIN = path.resolve(process.env.CLAUDE_PROJECT_DIR || "C:/Code/lew42/monorepo").replace(/\\/g, "/").toLowerCase();

const RISKY = [
	[/\bgit\b[^|;&]*\bstash\b(?!\s+(list|show)\b)/, "git stash"],
	[/\bgit\b[^|;&]*\breset\b[^|;&]*--hard\b/, "git reset --hard"],
	[/\bgit\b[^|;&]*\bcheckout\b[^|;&]*(\s--\s|\s\.(\s|$))/, "git checkout -- <path>"],
	[/\bgit\b[^|;&]*\brestore\b(?![^|;&]*--staged)/, "git restore"],
	[/\bgit\b[^|;&]*\bclean\b[^|;&]*-\w*f/, "git clean -f"],
];

const WORKTREE = /worktrees[\\/]/i;

let raw = "";
process.stdin.on("data", d => raw += d).on("end", () => {
	try {
		const input = JSON.parse(raw);
		// Quoted text is a message, not a command: `git commit -m "no git stash"` must pass.
		const cmd = String(input.tool_input?.command ?? "").replace(/"[^"]*"|'[^']*'/g, '""');
		const cwd = path.resolve(input.cwd || process.cwd()).replace(/\\/g, "/").toLowerCase();
		const hit = RISKY.find(([re]) => re.test(cmd));
		if (!hit) process.exit(0);
		// In a worktree, or the command itself targets one (cd / -C into it): allowed.
		if (WORKTREE.test(cwd) || WORKTREE.test(cmd)) process.exit(0);
		if (!(cwd === MAIN || cwd.startsWith(MAIN + "/"))) process.exit(0);
		process.stderr.write(`GIT GUARD: \`${hit[1]}\` is blocked in the main checkout. Every agent shares this tree, so it would throw away other agents' uncommitted work. Do it in your own worktree (take_worktree), or commit your files by path instead. The owner can run it in their own terminal.\n`);
		process.exit(2);
	} catch { process.exit(0); }
});
