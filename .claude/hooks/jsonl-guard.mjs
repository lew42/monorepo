/* JSONL GUARD HOOK (2026-09-30): a PreToolUse hook on Bash and PowerShell.
 *
 * WHY. The owner treats the main branch as production: a malformed line in a live
 * `.jsonl` (a board, a card, a task log) throws in the owner's open tab. The owner,
 * 2026-09-30: "instead of using like bash to do file appends manually… tool calls… that
 * then take the same data and validate it first before writing it to file."
 *
 * BLOCKS (exit 2, the reason on stderr): a shell write into a `.jsonl` file:
 * `>>` / `>` redirection, `tee`, `Add-Content`, `Out-File`, `Set-Content`.
 * The validated routes stay open: `node .claude/hooks/append.mjs <file> <lines.json>` (re-parses
 * the whole file, names any bad line) and Servex's `append_log` tool.
 *
 * FAILS OPEN: any error inside this hook lets the command through. */

const WRITE = [
	/(?<![=\-])>>?\s*["']?[^\s"'|;&]*\.jsonl\b/i,                         // > x.jsonl, >> "x.jsonl" (never => or ->)
	/\btee\b[^|;&]*\.jsonl\b/i,                                  // tee -a x.jsonl
	/\b(Add-Content|Out-File|Set-Content)\b[^|;&]*\.jsonl\b/i,   // PowerShell writers
];

let raw = "";
process.stdin.on("data", d => raw += d).on("end", () => {
	try {
		const cmd = String(JSON.parse(raw).tool_input?.command ?? "");
		if (!WRITE.some(re => re.test(cmd))) process.exit(0);
		process.stderr.write("JSONL GUARD: a shell write into a .jsonl file is blocked. One malformed line breaks the live page that reads it. Write the lines as a JSON array in a scratch .json file and run `node .claude/hooks/append.mjs <target.jsonl> <lines.json>`, which validates the whole file, or use Servex's append_log tool.\n");
		process.exit(2);
	} catch { process.exit(0); }
});
