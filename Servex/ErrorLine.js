import path from "node:path";
import { fileURLToPath } from "node:url";
import SpawnLog from "./SpawnLog.js";

/* A CAUGHT ERROR GETS A LINE: `{"error":"<message>","where":"Servex/x.js:12", ...}` in the session log of the agent it happened for,
 * so `git grep '"error":'` finds it beside the work (contract: public/framework/ai/indexing-past-work.md, sections 5 and 6).
 * Written where a tool call is caught (agents/tools.js server(), MCP.js call()); with no agent it goes to the Servex `errors` log.
 * Writing never throws: a broken log line must not turn one error into two. */
export default class ErrorLine {
	static ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
	static CUT = 500;

	/* The first stack frame inside the repo (not node_modules, not node:internal), as "repo/relative/file.js:line"; null when there is none. */
	static where(e, root = this.ROOT){
		for (const raw of String(e?.stack ?? "").split("\n").slice(1)){
			const m = raw.match(/\(?((?:file:\/\/\/)?[A-Za-z]:[\\/][^():]*|\/[^():]*):(\d+):\d+\)?\s*$/);
			if (!m) continue;
			const file = m[1].startsWith("file:") ? fileURLToPath(m[1]) : m[1];
			const rel = path.relative(root, file);
			if (!rel || rel.startsWith("..") || path.isAbsolute(rel) || /node_modules/.test(rel)) continue;
			return `${rel.split(path.sep).join("/")}:${m[2]}`;
		}
		return null;
	}

	/* The line itself: error first (the contract's fixed first key), then where, then whatever the caller adds (tool, agent). */
	static of(e, extra = {}){
		return { error: String(e?.message ?? e).slice(0, this.CUT), where: this.where(e), ...extra };
	}

	/* Write it: into the agent's session log when `who` has a task dir, else the `errors` log. */
	static note(agents, who, e, extra = {}){
		try {
			const line = this.of(e, { ...extra, ...(who ? { agent: who } : {}) });
			const dir = who ? SpawnLog.dir_for(agents, who) : null;
			if (dir) return SpawnLog.note(dir, line);
			if (SpawnLog.sink) return void SpawnLog.sink.append("errors", line).catch(() => {});
		} catch { /* never throws */ }
	}
}
