#!/usr/bin/env node
// Move task folders out of <module>/tasks/ into the session that filed them (the owner, 2026-10-26). Dry run unless --go.
//   node Server/TaskToSession.mjs <session url> <task folder url>... [--go]
// e.g. node Server/TaskToSession.mjs /framework/ai/sessions/2026/10/25/v-9dvbbrn/ /framework/ext/drawer/tasks/mobile-sheet-page-cannot-scroll-to-the-b/ --go
// The mover is move_to_session (Servex/agents/page_tools.js): keeps id and history, git mv, one reference in the session, one in the old module list, one ledger line.
import path from "node:path";
import { move_to_session } from "../Servex/agents/page_tools.js";

const args = process.argv.slice(2), go = args.includes("--go"), [session, ...tasks] = args.filter(a => a !== "--go");
if (!session || !tasks.length){ console.error("usage: TaskToSession.mjs <session url> <task folder url>... [--go]"); process.exit(1); }
const pub = path.resolve(import.meta.dirname, "..", "public");
let bad = 0;
for (const t of tasks){
	const r = await move_to_session(path.join(pub, t.replace(/^\//, ""), "task.jsonl"), session, "TaskToSession", !go);
	if (r.why) bad++;
	console.log(r.why ? `SKIP ${t}: ${r.why}` : `${go ? "MOVED" : "would move"} ${r.from} -> ${r.to}`);
}
process.exit(bad ? 2 : 0);
