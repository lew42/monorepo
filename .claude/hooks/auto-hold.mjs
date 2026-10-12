/* AUTO HOLD (2026-10-12, live-page-error): a PreToolUse hook on Write/Edit/MultiEdit. Taking the
 * reload hold was opt-in, so an agent editing live site code in the main tree without one reloaded
 * the owner's open tab after EVERY file, and a tab reloaded between two files of one batch
 * (AISession.js written, AISessionsPage.js not yet) hit a half-written import graph = a load error.
 * Now the first write to a site .js/.mjs/.css/.html takes a short hold, fenced to that area
 * (public/<a>/<b>/**), and each further write renews it. When the writes stop it lapses and the
 * server sends ONE reload for the finished state. Worktree writes never match (not under public/).
 * Fails open. Story + alternative: Server/doc/watch.md ("A tab reloaded mid-batch"). */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { add } from "../../Server/hold.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");
const TTL_MS = 30_000;

let raw = "";
process.stdin.on("data", d => raw += d).on("end", () => {
	try {
		const input = JSON.parse(raw);
		const file = input.tool_input?.file_path;
		if (!file || !/\.(m?js|css|html)$/i.test(file)) process.exit(0);
		const rel = path.relative(root, path.resolve(file)).split(path.sep).join("/");
		if (!rel.startsWith("public/")) process.exit(0);
		const area = rel.split("/").slice(0, 3).join("/");   // public/framework/ai
		const id = String(input.agent_id || input.session_id || "agent").slice(0, 8);
		add(`auto-${id}`, `writing ${area}`, TTL_MS, [`${area}/**`]);
	} catch {}
	process.exit(0);
});
