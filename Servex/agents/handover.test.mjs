// Handover by task, end to end on a temp store: `spawn_agent {task: {from, id}}` (open_task) moves a subtask from the parent's record into the child's
// folder with its id and history, leaves ONE reference on the parent, and the child's completion rolls up. `node Servex/agents/handover.test.mjs`
// Proves: ai/sessions/doc/session-record.md, "Session → task → child session".
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item, ledgers } from "./page_tools.js";
import { open_task } from "./Agents.js";
import TaskHomes from "../../Server/TaskHomes.mjs";
import SessionRecord from "../../Server/SessionRecord.mjs";
import Session from "../../public/framework/core/Session/Session.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
process.chdir(ROOT);   // open_task resolves task.dir against cwd
const REL = "public/framework/ai/sessions/2026/10/22/.handover-test-" + process.pid;   // a throwaway session folder; never the real records
const DIR = path.join(ROOT, REL), URL = "/" + REL.slice("public/".length) + "/";
const PFILE = path.join(DIR, "session.jsonl"), CDIR = path.join(DIR, "agent-a"), CURL = URL + "agent-a/";
ledgers.task_moves = path.join(DIR + "-ledger", "task-moves.jsonl"); TaskHomes.INDEX = DIR + "-homes/task.jsonl";
const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
const refs = () => read(PFILE).filter(l => l.task === CURL);
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const until = async f => { for (let i = 0; i < 100 && !f(); i++) await new Promise(r => setTimeout(r, 20)); };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(PFILE, JSON.stringify({ assign: { session_id: "parent-sess", agent: "parent", title: "Parent" } }) + "\n");
try {
	await run_item({ path: URL, delta: { tasks: { add: { id: "x", title: "X task" } } } }, { caller: "parent" });
	await run_item({ path: URL, delta: { x: { start: {} } } }, { caller: "parent" });
	await run_item({ path: URL, delta: { x: { expected: "a field" } } }, { caller: "parent" });
	const before = read(PFILE).filter(l => l.x || l.tasks?.add).map(l => l.ts);

	// the spawn: open_task writes the child's assign line, links it, and hands the subtask over
	open_task({ dir: path.relative(ROOT, CDIR), from: URL, id: "x" }, { session_id: "child-sess", agent: "agent-a", by: "parent" });
	await until(() => refs().some(l => l.as === "x"));
	const cf = SessionRecord.file(CDIR), cl = read(cf);
	ok(cl[0].assign?.session_id === "child-sess" && cl[1].id === "x" && cl[1].set.title === "X task" && cl.some(l => l.start) && cl.some(l => l.expected === "a field"), "the subtask lands in the child folder: same id, its history (start, expected) after the assign line");
	ok(JSON.stringify(cl.filter(l => l.id === "x" || l.start || l.expected).map(l => l.ts)) === JSON.stringify(before), "each history line keeps its original timestamp");
	const P = Session.replay(read(PFILE));
	ok([...P.tasks].filter(t => t.id === "x").length === 1 && [...P.tasks].length === 1, "the parent replays ONE child x, not x plus a path-named twin");

	// exactly one reference line, however many times the linkers run again
	ok(refs().length === 1 && refs()[0].as === "x", "the parent's log has exactly ONE line referencing the child, and it is the `as: x` one");
	SessionRecord.link_parent(CDIR, "Servex", { session_id: "child-sess" });
	SessionRecord.link_parent(CDIR, "SessionRecord --links");
	ok(refs().length === 1, "link_parent again adds nothing");
	const sr = new SessionRecord({ root: ROOT });
	const miss = sr.links().missing.filter(m => m.dir === CDIR);
	ok(miss.length === 0, "the --links census does not list the child as unreferenced");
	sr.apply_links(sr.links());   // always run the backfill itself, then count
	ok(refs().length === 1, "the daily --links backfill adds nothing");

	// roll-up: the child completes its own task; the parent's record shows it complete
	const r2 = await run_item({ path: CURL, delta: { complete: { outcome: "done", evidence: ["test"] } } }, { caller: "agent-a" });   // the child folder IS the task: a plain complete on its page ("x" is not a child there)
	ok(r2.ok, "the child completes the handed-over task: " + (r2.why ?? ""));
	const P2 = Session.replay(read(PFILE));
	ok(P2.tasks.find("x")?.state === "complete" && P2.completion === 1, "the parent's record shows x complete (rolled up from the child's folder)");

	// a refused handoff (no such subtask) still leaves the child referenced, once
	const BURL = URL + "agent-b/";
	open_task({ dir: path.relative(ROOT, path.join(DIR, "agent-b")), from: URL, id: "nobody" }, { session_id: "child-b", agent: "agent-b", by: "parent" });
	await until(() => fs.readFileSync(SessionRecord.file(path.join(DIR, "agent-b")), "utf8").includes("refused"));
	ok(read(PFILE).filter(l => l.task === BURL).length === 1, "a refused handoff: the child is still referenced on the parent, exactly once");
	console.log(`${n} passing`);
} finally {
	for (const d of [DIR, DIR + "-ledger", DIR + "-homes"]) fs.rmSync(d, { recursive: true, force: true });
}
process.exit(0);
