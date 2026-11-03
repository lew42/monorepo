// SessionIdentity on temp dirs: a clean session passes; a foreign id, a shared message and a second folder each give exactly one problem.
// `node Server/SessionIdentity.test.mjs`. Doc: public/framework/core/Session/doc/identity.md.
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import SessionIdentity from "./SessionIdentity.mjs";
import { cost_of_transcript } from "../public/framework/ai/AISession/AISessionAudit.mjs";

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const ID = "aaaaaaaa-1111-4222-8333-444444444444", OTHER = "bbbbbbbb-1111-4222-8333-444444444444";
const assistant = (sid, mid, t) => JSON.stringify({ type: "assistant", sessionId: sid, uuid: "u-" + mid, timestamp: t, message: { id: mid, model: "claude-sonnet-5", usage: { input_tokens: 1000, output_tokens: 500 } } });
const user = (sid, t) => JSON.stringify({ type: "user", sessionId: sid, uuid: "uu-" + t, timestamp: t, message: { role: "user", content: "hi" } });

function world(lines, { other_file = null, folders = ["2026/10/20"] } = {}){
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "sessid-")), projects = path.join(root, "projects", "proj"), sessions = path.join(root, "sessions");
	fs.mkdirSync(projects, { recursive: true });
	const main = path.join(projects, ID + ".jsonl");
	fs.writeFileSync(main, lines.join("\n") + "\n");
	if (other_file) fs.writeFileSync(path.join(projects, "cccccccc-1111-4222-8333-444444444444.jsonl"), other_file.join("\n") + "\n");
	const usd = cost_of_transcript(main).total_usd;
	for (const day of folders){
		const dir = path.join(sessions, day, "session-" + ID.slice(0, 8));
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "cache.jsonl"), JSON.stringify({ summary: { v: 2, id: ID, usd, last_at: "2026-10-20T10:00:00Z" } }) + "\n");
	}
	return new SessionIdentity({ projects: path.join(root, "projects"), sessions, registry: path.join(root, "registry.json"), logs: path.join(root, "logs") });
}
const clean = [user(ID, "2026-10-20T10:00:00Z"), assistant(ID, "msg_one", "2026-10-20T10:00:01Z"), assistant(ID, "msg_two", "2026-10-20T10:00:02Z")];

let r = await world(clean).check(ID);
ok(r.ok && r.problems.length === 0, "a clean session has no problems");
ok(r.cost.agree && r.cost.cache_usd > 0 && r.cost.cache_usd === r.cost.recount_usd, "the stored cost and the recount agree");
ok(r.transcripts.length === 1 && r.transcripts[0].own_lines === 3 && !Object.keys(r.transcripts[0].foreign_ids).length, "all three lines are the session's own");
ok(r.folders.list.length === 1 && !r.folders.split && r.chain === null && r.children.unlinked === 0, "one folder, no registry row, no children");

r = await world([...clean, assistant(OTHER, "msg_three", "2026-10-20T10:00:03Z")]).check(ID);
ok(r.problems.length === 1 && /other session id/.test(r.problems[0]), "a line with a foreign session id gives exactly one problem");
ok(r.transcripts[0].foreign_ids[OTHER] === 1, "the foreign id is counted");

r = await world(clean, { other_file: [assistant("cccccccc-1111-4222-8333-444444444444", "msg_two", "2026-10-20T10:00:09Z")] }).check(ID);
ok(r.problems.length === 1 && /also appear in 1 other transcript/.test(r.problems[0]) && r.cost.shared_messages.count === 1, "a message id shared with another transcript gives exactly one problem");

r = await world(clean, { folders: ["2026/10/20", "2026/10/24"] }).check(ID);
ok(r.problems.length === 1 && r.folders.split && /2 dated folders/.test(r.problems[0]), "a second dated folder gives exactly one problem");

r = await world([...clean, JSON.stringify({ type: "system", subtype: "compact_boundary", sessionId: ID, uuid: "cb", timestamp: "2026-10-20T10:00:04Z" }), user(ID, "2026-10-20T10:00:05Z")]).check(ID);
ok(r.ok && r.transcripts[0].compactions === 1 && r.transcripts[0].ids_after_compaction.length === 1, "a compaction that keeps the id is fine");

console.log(`${n} passing`);
