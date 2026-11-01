/* PYTHON GUARD HOOK (2026-11-01): a PreToolUse hook on Bash and PowerShell.
 *
 * WHY. On this machine a `python -` reading its script from stdin (a heredoc, `python - <<EOF … EOF`, or a pipe
 * into `python -`) can hang and spin one full core instead of exiting, and it outlives the shell and the agent that
 * started it. The fan check of 2026-11-01 (ai/sessions/2026/11/01/spawned/minion-fan-check/) found two: one had run
 * for about 108 hours (started 10-28 from a data-shapes seat), one from the ai2 audit. This is a JavaScript repo: an
 * edit goes through the Edit tool, a script through node.
 *
 * BLOCKS (exit 2, the reason on stderr): `python -`, `python3 -` or `py -` in any command segment, with or without
 * a `timeout N` in front, and `python <<` / `python3 <<` heredocs.
 * ALLOWS everything else, including `python <file>.py` (Servex's usage script) and `python -c "…"`.
 * FAILS OPEN: any error inside this hook lets the command through. */

let raw = "";
process.stdin.on("data", d => (raw += d)).on("end", () => {
	try {
		// Quoted strings (a commit message, a grep pattern) are blanked first: only a command that RUNS python counts.
		const cmd = String(JSON.parse(raw).tool_input?.command ?? "").replace(/"[^"]*"|'[^']*'/g, '""');
		const stdin_python = /(^|[\s;&|(])(python3?|py)(\.exe)?\s+(-\s|-$|<<)/m;
		if (stdin_python.test(cmd)) {
			process.stderr.write("PYTHON GUARD: `python -` and python heredocs are blocked: on this machine they can hang at 100% of a core and outlive the agent (the 2026-11-01 fan check found one running for 108 hours). Edit files with the Edit tool; for a script, write a .mjs in the scratchpad and run it with node.\n");
			return process.exit(2);
		}
		process.exit(0);
	} catch {
		process.exit(0);
	}
});
