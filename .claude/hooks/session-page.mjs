import fs from "node:fs";
import path from "node:path";
import DatedFiles from "../../Server/DatedFiles.mjs";
import SessionRecord from "../../Server/SessionRecord.mjs";

/* session-page.mjs — the SessionStart hook: tells a VS Code / CLI tab its own page, and gives
 * the tab's store folder its session.jsonl (line 1 only, once).
 *
 * Claude Code hands this hook { session_id, cwd } on stdin; what it prints to stdout is added to the
 * session's context. A Servex-spawned agent gets the same line from Agents.whoami() and its folder from
 * open_task(), so it is skipped here. Decisions: Servex/agents/doc/own-page.md, ai/sessions/doc/session-record.md. */
let raw = "";
process.stdin.on("data", d => raw += d).on("end", () => {
	try {
		const { session_id: id, cwd } = JSON.parse(raw);
		if (!id) return;
		console.log(`[Your own page is /framework/ai/sessions/${id}/ — pass it as \`path\` to page_set, page_add, page_call and page_read to change what the owner sees there.]`);
		if (!process.env.SERVEX_MCP) record(id, cwd);
	} catch {}
});

function record(id, cwd){
	try {
		const dir = DatedFiles.sessions.session_dir(id);
		if (SessionRecord.file(dir)) return;   // a resume, or a folder that already has its record
		const first = { session: { id, kind: "vscode-tab", role: "vscode mastermind", cwd, at: new Date().toISOString() } };
		fs.mkdirSync(dir, { recursive: true });
		fs.appendFileSync(SessionRecord.start_file(dir, first), JSON.stringify(first) + "\n");
	} catch {}
}
