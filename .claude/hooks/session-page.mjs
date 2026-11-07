import fs from "node:fs";
import path from "node:path";
import DatedFiles from "../../Server/DatedFiles.mjs";
import SessionFolders from "../../public/framework/core/Session/SessionFolders.mjs";
import { fileURLToPath } from "node:url";

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
		if (!process.env.SERVEX_MCP) record(id, cwd);
		// The dated folder, never /framework/ai/sessions/<uuid>/ (that url only redirects): one folder per session, ai/sessions/doc/one-folder.md.
		const store = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../public/framework/ai/sessions");
		let dir = null; try { dir = SessionFolders.at(store).record_of(id) ?? DatedFiles.sessions.session_dir(id); } catch {}
		const url = dir ? "/framework/ai/sessions/" + path.relative(store, dir).split(path.sep).join("/") + "/" : null;
		console.log(url ? `[Your session is ${id}; its one folder is ${url} (pass it as \`path\` to page_set, page_add, page_call and page_read; /framework/ai/sessions/<uuid>/ is only a redirect, never a folder).]`
			: `[Your session is ${id}.]`);
	} catch {}
});

function record(id, cwd){
	try {
		// The one creator (SessionFolders#create): the session's home, made, line 1 only when it has no record yet (a resume keeps its own).
		DatedFiles.sessions.session_folders().create(id, { first: { session: { id, kind: "vscode-tab", role: "mastermind", cwd, at: new Date().toISOString() } } });
	} catch {}
}
