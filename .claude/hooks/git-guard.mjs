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
 * DELETES (2026-10-02). On 2026-10-01 at 22:36 an agent ran `rm -rf` over every path `git status`
 * listed as untracked in the main checkout: 601 paths, 595 gone — other agents' cards, task logs,
 * skills and module files (ai/2026-10-01/recover-main-untracked/). Untracked files in main belong
 * to other agents, so this hook now also refuses:
 *   a RECURSIVE delete (rm -r/-rf/-fr/-R/--recursive, Remove-Item/ri/rm/del/erase/rmdir/rd with
 *   -Recurse or /s or /q) whose target resolves INSIDE the main checkout — from any cwd. A target
 *   in a worktree, the scratchpad (%LOCALAPPDATA%/Temp/claude/…), %TEMP%, %TMP% or /tmp is allowed;
 *   so is deleting one file by its exact path (no recursive flag), anywhere.
 *   any delete FED BY GIT'S FILE LISTING (git status / ls-files / clean -n piped or looped into a
 *   delete verb: xargs, ForEach-Object, for/while) when the cwd is the main checkout.
 * A target the hook cannot resolve ($var, a loop variable) counts as "somewhere under the cwd".
 *
 * FAILS OPEN: any error inside this hook lets the command through. */

import path from "node:path";

const MAIN = norm(process.env.CLAUDE_PROJECT_DIR || "C:/Code/lew42/monorepo");

const RISKY = [
	[/\bgit\b[^|;&]*\bstash\b(?!\s+(list|show)\b)/, "git stash"],
	[/\bgit\b[^|;&]*\breset\b[^|;&]*--hard\b/, "git reset --hard"],
	[/\bgit\b[^|;&]*\bcheckout\b[^|;&]*(\s--\s|\s\.(\s|$))/, "git checkout -- <path>"],
	[/\bgit\b[^|;&]*\brestore\b(?![^|;&]*--staged)/, "git restore"],
	[/\bgit\b[^|;&]*\bclean\b[^|;&]*-\w*f/, "git clean -f"],
];

const WORKTREE = /worktrees[\\/]/i;

/* A delete verb at the start of a shell segment. `rm` with any flag group holding r/R, or
 * --recursive; the PowerShell/cmd family with -Recurse, /s or /q. */
const RECURSIVE = [
	/(?:^|[\s;&|(`])rm(?:\s+-{1,2}[\w-]+)*\s+-(?:\w*[rR]\w*|-recursive)\b/,
	/(?:^|[\s;&|(`])(?:Remove-Item|ri|rm|del|erase|rmdir|rd)\b[^|;&]*?(?:\s-Recurse\b|\s\/[sq]\b)/i,
];
const DELETE_VERB = /(?:^|[\s;&|({`])(?:rm|Remove-Item|ri|del|erase|rmdir|rd)\b/i;
const GIT_LISTING = /\bgit\b[^|;&]*\b(?:status|ls-files|clean\s+-n|clean\s+--dry-run)\b/;
const FED = /\bxargs\b|ForEach-Object|%\s*\{|\bfor\s+\w+\s+in\b|\bwhile\s+read\b|\bforeach\s*\(/i;

function norm(p){ return path.resolve(p).replace(/\\/g, "/").toLowerCase(); }
function in_main(p){ return (p === MAIN || p.startsWith(MAIN + "/")) && !WORKTREE.test(p.slice(MAIN.length)); }

/* The cwd the delete runs in: the hook's cwd, moved by an earlier `cd X &&`, `Set-Location X;`,
 * `pushd X` or `git -C X` in the same command. */
function effective_cwd(cmd, cwd){
	const m = cmd.match(/(?:^|[;&|]\s*)(?:cd|Set-Location|sl|pushd)\s+(?:-Path\s+)?([^\s;&|]+)/i) || cmd.match(/\bgit\s+-C\s+([^\s;&|]+)/);
	return m ? resolve(m[1], cwd) : cwd;
}

/* One path token → absolute, lowercased, forward slashes; null when it holds something we cannot
 * know ($dir, a loop variable, a glob of the whole tree). */
function resolve(tok, cwd){
	let t = tok.replace(/^["']|["']$/g, "");
	const env = (n) => process.env[n] || process.env[n.toUpperCase()] || "";
	t = t.replace(/^\$env:(\w+)/i, (_, n) => env(n)).replace(/^%(\w+)%/, (_, n) => env(n)).replace(/^\$\{?(TEMP|TMP|HOME|USERPROFILE|LOCALAPPDATA)\}?/i, (_, n) => env(n)).replace(/^~(?=[\\/]|$)/, env("HOME") || env("USERPROFILE"));
	if (/[$%]/.test(t)) return null;
	return norm(path.isAbsolute(t) || /^[a-z]:[\\/]/i.test(t) ? t : path.join(cwd, t));
}

/* The path arguments of the delete segment: every token after the verb that is not a switch. */
function targets(segment){
	const toks = segment.trim().split(/\s+/);
	const i = toks.findIndex(t => /^(rm|Remove-Item|ri|del|erase|rmdir|rd)$/i.test(t));
	return toks.slice(i + 1).filter(t => t && !/^-/.test(t) && !/^\/[sqfa]$/i.test(t) && t !== "--");
}

function deletion(raw_cmd, stripped_cmd, cwd){
	const cwd_eff = effective_cwd(raw_cmd, cwd);
	// 1. A recursive delete aimed inside main — the TARGET decides, not the cwd.
	for (const seg of stripped_cmd.split(/\|\||&&|[;|]/)){
		if (!RECURSIVE.some(re => re.test(seg))) continue;
		// the same segment with its quotes kept, so a quoted path still resolves
		const raw_seg = raw_cmd.split(/\|\||&&|[;|]/).find(s => s.replace(/"[^"]*"|'[^']*'/g, '""').trim() === seg.trim()) ?? seg;
		const paths = targets(raw_seg).map(t => resolve(t, cwd_eff));
		if (!paths.length) paths.push(cwd_eff);                        // `rm -rf .`-style with no argument: the cwd
		if (paths.some(p => p === null ? in_main(cwd_eff) : in_main(p))) return "a recursive delete aimed inside the main checkout";
	}
	// 2. A delete fed by git's own listing of files, run in main.
	if (GIT_LISTING.test(stripped_cmd) && DELETE_VERB.test(stripped_cmd) && (FED.test(stripped_cmd) || /\$\(\s*git|`git/.test(raw_cmd)) && in_main(cwd_eff))
		return "a delete fed by git's file listing";
	return null;
}

let raw = "";
process.stdin.on("data", d => raw += d).on("end", () => {
	try {
		const input = JSON.parse(raw);
		const raw_cmd = String(input.tool_input?.command ?? "");
		// Quoted text is a message, not a command: `git commit -m "no git stash"` must pass.
		const cmd = raw_cmd.replace(/"[^"]*"|'[^']*'/g, '""');
		const cwd = norm(input.cwd || process.cwd());
		const hit = RISKY.find(([re]) => re.test(cmd));
		if (hit) {
			// In a worktree, or the command itself targets one (cd / -C into it): allowed.
			if (WORKTREE.test(cwd) || WORKTREE.test(cmd)) process.exit(0);
			if (!(cwd === MAIN || cwd.startsWith(MAIN + "/"))) process.exit(0);
			process.stderr.write(`GIT GUARD: \`${hit[1]}\` is blocked in the main checkout. Every agent shares this tree, so it would throw away other agents' uncommitted work. Do it in your own worktree (take_worktree), or commit your files by path instead. The owner can run it in their own terminal.\n`);
			process.exit(2);
		}
		const why = deletion(raw_cmd, cmd, cwd);
		if (!why) process.exit(0);
		process.stderr.write(`GIT GUARD: ${why} is blocked. Untracked files in C:/Code/lew42/monorepo are other agents' work (601 of them were lost this way on 2026-10-01). Do it in your own worktree (take_worktree), delete one file by its exact path without -r, or ask the pool owner. The owner can run it in their own terminal.\n`);
		process.exit(2);
	} catch { process.exit(0); }
});
