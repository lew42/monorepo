// A child session is a task in its parent session's record, wherever its folder is (item 24). `node Servex/agents/child-links.test.mjs`
// Throwaway dot-folders in the real store (the handover test's way: the resolvers are bound to it), removed at the end.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Test from "../../public/framework/core/Test/Test.js";
import Session from "../../public/framework/core/Session/Session.js";
import { run_item } from "./page_tools.js";
import { open_task } from "./Agents.js";
import ChildLinks from "../../Server/ChildLinks.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
process.chdir(ROOT);   // open_task resolves task.dir against cwd
const SESS = "public/framework/ai/sessions", PID = `0c0c0c0c-aaaa-4bbb-8ccc-${String(process.pid).padStart(12, "0")}`, CID = "0d0d0d0d-aaaa-4bbb-8ccc-000000000001";
const PARENT = path.join(ROOT, SESS, "2026/10/22", `.childlinks-parent-${process.pid}`), PFILE = path.join(PARENT, "session.jsonl");
const OUT = `${SESS}/tasks/.childlinks-child-${process.pid}`, IN = path.join(PARENT, "inside-kid");
const CURL = "/" + OUT.slice("public/".length) + "/", PURL = "/" + path.relative(path.join(ROOT, "public"), PARENT).replaceAll("\\", "/") + "/";
const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
const refs = url => read(PFILE).filter(l => l.task === url);

const t = new Test("child-links");
fs.mkdirSync(PARENT, { recursive: true });
fs.writeFileSync(PFILE, JSON.stringify({ session: { id: PID, kind: "vscode-tab", at: "2026-10-22T10:00:00.000Z" } }) + "\n");
try {
	// spawn: a child whose folder is OUTSIDE the parent session's folder
	open_task({ dir: OUT }, { session_id: CID, agent: "kid-x", parent_session: PID });
	t.eq(refs(CURL).length, 1, "the spawn put one reference to the outside folder on the parent's record");
	t.eq(refs(CURL)[0]?.as, "kid-x", "the line says which agent it is (as)");
	open_task({ dir: OUT }, { session_id: CID, agent: "kid-x", parent_session: PID });
	t.eq(refs(CURL).length, 1, "spawning again adds nothing (never twice)");
	const P = () => Session.replay(read(PFILE));
	t.ok(P().tasks.find("kid-x"), "the parent's replay has the child as a task");
	t.eq(P().progress().total, 1, "the parent's tasks count includes the child");
	t.eq(P().completion, 0, "an unfinished child: completion 0");

	// a child folder INSIDE the parent's folder keeps link_parent's plain line, and ChildLinks adds no second one
	open_task({ dir: path.relative(ROOT, IN) }, { session_id: "0e0e0e0e-aaaa-4bbb-8ccc-000000000002", agent: "kid-in", parent_session: PID });
	const inside = refs(PURL + "inside-kid/");
	t.ok(inside.length === 1 && inside[0].as === undefined, "a folder inside the parent's: one plain line from link_parent, none from ChildLinks");
	t.eq(P().progress().total, 2, "two children now");

	// complete the outside child; the parent's completion moves
	const r = await run_item({ path: CURL, delta: { complete: { outcome: "done", evidence: ["test"] } } }, { caller: "kid-x" });
	t.ok(r.ok, "the child completes its own task: " + (r.why ?? ""));
	t.ok(P().tasks.find("kid-x")?.state === "complete" && P().progress().done === 1, "the parent sees the child complete");
	t.eq(P().completion, 0.5, "completion moved 0 -> 0.5 (one of two children done)");

	// the backfill: a registry row for a third child, dry run writes nothing, apply writes once
	const third = path.join(ROOT, SESS, "tasks", `.childlinks-third-${process.pid}`); fs.mkdirSync(third, { recursive: true });
	fs.writeFileSync(path.join(third, "task.jsonl"), JSON.stringify({ assign: { session_id: "0f0f0f0f-aaaa-4bbb-8ccc-000000000003", agent: "kid-3" } }) + "\n");
	const rows = { "kid-3": { session_id: "0f0f0f0f-aaaa-4bbb-8ccc-000000000003", parent_session: PID, task_dir: third } };
	const size = fs.statSync(PFILE).size, plan = ChildLinks.plan(rows, ROOT);
	t.ok(plan.length === 1 && plan[0].why === "append" && plan[0].agent === "kid-3" && plan[0].session === PID.slice(0, 8), "the dry run's manifest names the child, its session and the action");
	t.eq(fs.statSync(PFILE).size, size, "the dry run wrote nothing");
	t.eq(ChildLinks.apply(plan, ROOT, rows), 1, "--apply appends one line");
	t.eq(ChildLinks.apply(ChildLinks.plan(rows, ROOT), ROOT, rows), 0, "--apply again appends none");
	t.eq(ChildLinks.plan(rows, ROOT)[0].why, "referenced", "and the manifest now says referenced");
	fs.rmSync(third, { recursive: true, force: true });
} finally {
	fs.rmSync(PARENT, { recursive: true, force: true });
	fs.rmSync(path.join(ROOT, OUT), { recursive: true, force: true });
}
t.done();
