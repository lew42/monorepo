/* JSONL GUARD HOOK (2026-09-30, extended 2026-10-02): a PreToolUse hook on Bash, PowerShell,
 * and now Write/Edit/MultiEdit/NotebookEdit.
 *
 * WHY. The owner treats the main branch as production: a malformed line in a live
 * `.jsonl` (a board, a card, a task log) throws in the owner's open tab. The owner,
 * 2026-09-30: "instead of using like bash to do file appends manually… tool calls… that
 * then take the same data and validate it first before writing it to file."
 *
 * BLOCKS (exit 2, the reason on stderr):
 *   - a shell write into a `.jsonl` file: `>>` / `>` redirection, `tee`, `Add-Content`,
 *     `Out-File`, `Set-Content` (the Bash/PowerShell matcher).
 *   - a Write/Edit/MultiEdit/NotebookEdit onto a `.jsonl` file that ALREADY EXISTS — the
 *     Write and Edit tools overwrite or splice the whole file by hand, which is exactly the
 *     unvalidated path this hook exists to close. A brand-new `.jsonl` (the file does not
 *     exist yet) is allowed, so a task can still open its own log for the first time.
 *
 * The validated routes stay open: `node .claude/hooks/append.mjs <file> <lines.json>` (re-parses
 * the whole file, names any bad line) and Servex's `append_log` tool.
 *
 * FAILS OPEN: any error inside this hook lets the call through. */
import { existsSync } from "node:fs";

const WRITE = [
	/(?<![=\-])>>?\s*["']?[^\s"'|;&]*\.jsonl\b/i,                         // > x.jsonl, >> "x.jsonl" (never => or ->)
	/\btee\b[^|;&]*\.jsonl\b/i,                                  // tee -a x.jsonl
	/\b(Add-Content|Out-File|Set-Content)\b[^|;&]*\.jsonl\b/i,   // PowerShell writers
];

const MESSAGE = "JSONL GUARD: a hand write into a .jsonl file is blocked. One malformed line breaks the live page that reads it. Write the lines as a JSON array in a scratch .json file and run `node .claude/hooks/append.mjs <target.jsonl> <lines.json>`, which validates the whole file, or use Servex's append_log tool.\n";

let raw = "";
process.stdin.on("data", d => raw += d).on("end", () => {
	try {
		const input = JSON.parse(raw);
		const tool = input.tool_name;
		if (tool === "Write" || tool === "Edit" || tool === "MultiEdit" || tool === "NotebookEdit") {
			// NotebookEdit's tool_input carries `notebook_path`, not `file_path` — a review
			// (2026-10-02) caught that reading only `file_path` left NotebookEdit's half of the
			// matcher doing nothing. Harmless in practice (nobody edits a .jsonl as a notebook),
			// but the fallback costs nothing and makes the matcher mean what it claims.
			const file = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
			if (file && /\.jsonl$/i.test(String(file)) && existsSync(String(file))) {
				process.stderr.write(MESSAGE);
				process.exit(2);
			}
			process.exit(0); // a brand-new .jsonl, a non-.jsonl file, or no file_path at all: let it through
		}
		const cmd = String(input.tool_input?.command ?? "");
		if (!WRITE.some(re => re.test(cmd))) process.exit(0);
		process.stderr.write(MESSAGE);
		process.exit(2);
	} catch { process.exit(0); }
});
