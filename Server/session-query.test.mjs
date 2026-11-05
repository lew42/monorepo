// `node Server/session-query.mjs --report` against a scratch repo tree: a parent session, a NESTED child session with nested tasks, a counted owner prompt,
// a stopped task and an unproven finish. The score is recomputed here from the raw JSONL with a separate little recursion (no Task code), and must equal the report.
// `node Server/session-query.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { report, format_report, locate } from "./session-query.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "session-query-"));
const day = path.join(root, "public/framework/ai/sessions/2026/11/04");
const P = "aaaaaaaa" + randomUUID().slice(8), K = randomUUID();
const pdir = path.join(day, "session-aaaaaaaa"), kdir = path.join(pdir, "kid");
const url = d => "/" + path.relative(path.join(root, "public"), d).split(path.sep).join("/") + "/";
const write = (d, lines) => { fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "session.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n"); };
const ok = (c, m) => { assert.ok(c, m); console.log("ok", m); };
const eq = (a, b, m) => { assert.strictEqual(a, b, `${m}: ${a} !== ${b}`); console.log("ok", m); };
const finish = (id, ts) => ({ tasks: { [id]: { complete: { outcome: "done", evidence: ["a test"] } } }, ts });

try {
	// Parent: a counted prompt it answered with a filed task, one own task (done), one stopped task, the child session by reference.
	write(pdir, [
		{ session: { id: P, kind: "vscode-tab", at: "2026-11-04T10:00:00.000Z" } },
		{ content: { add: { id: "pr1", type: "Prompt", text: "do the thing", counted: true } }, by: "owner", ts: "2026-11-04T10:01:00.000Z" },
		{ content: { add: { id: "pr2", type: "Prompt", text: "a remark", counted: true } }, by: "owner", ts: "2026-11-04T10:01:30.000Z" },
		{ tasks: { add: { type: "Task", id: "mine", title: "Mine" } }, ts: "2026-11-04T10:02:00.000Z" },
		{ tasks: { add: { type: "Task", id: "dropped", title: "Dropped" } }, ts: "2026-11-04T10:02:30.000Z" },
		{ task: url(kdir), type: "Session", spawn: { agent: "mastermind-kid", session_id: K }, ts: "2026-11-04T10:03:00.000Z" },
		finish("mine", "2026-11-04T10:04:00.000Z"),
		{ tasks: { dropped: { stop: { why: "not needed" } } }, ts: "2026-11-04T10:04:30.000Z" }
	]);
	// Child: task a with a nested task `deep`, and task b; only `deep` is finished.
	write(kdir, [
		{ session: { id: K, kind: "agent", at: "2026-11-04T10:03:00.000Z" } },
		{ tasks: { add: { type: "Task", id: "a", title: "A" } }, ts: "2026-11-04T10:03:10.000Z" },
		{ tasks: { a: { tasks: { add: { type: "Task", id: "deep", title: "Deep" } } } }, ts: "2026-11-04T10:03:20.000Z" },
		{ tasks: { add: { type: "Task", id: "b", title: "B" } }, ts: "2026-11-04T10:03:30.000Z" },
		{ tasks: { a: { tasks: { deep: { complete: { outcome: "done", evidence: ["a test"] } } } } }, ts: "2026-11-04T10:05:00.000Z" }
	]);
	const rows = { "mastermind-kid": { session_id: K, parent_session: P, role: "mastermind", task_dir: path.relative(root, kdir) } };

	// THE SECOND WAY: parse the two files as plain data and average (no Task / Session code).
	const lines = d => fs.readFileSync(path.join(d, "session.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
	const second = () => {
		// child: a = (deep=1)/1 = 1 (a has one part, done); b = 0  =>  mean 0.5
		const k = lines(kdir); const a_parts = {}; let kids = ["a", "b"], deep = k.some(l => l.tasks?.a?.tasks?.deep?.complete);
		const a = deep ? 1 : 0, b = k.some(l => l.tasks?.b?.complete) ? 1 : 0, child = (a + b) / kids.length;
		// parent: parts = counted prompts (pr1 unresolved 0, pr2 unresolved 0) + mine (1) + child session (0.5); `dropped` is stopped: left out
		const p = lines(pdir), mine = p.some(l => l.tasks?.mine?.complete) ? 1 : 0;
		return (0 + 0 + mine + child) / 4;
	};

	const r = await report(P, { root, rows, cost: false });
	ok(!r.error, "the parent session is found by its session id");
	eq(Math.round(r.score * 1e9), Math.round(second() * 1e9), "the report's score equals the independent recomputation (3 + 0.5) / 4 = " + second());
	eq(r.prompts.counted, 2, "two counted owner prompts");
	eq(r.prompts.unresolved, 2, "both are unresolved: they count against the score with nobody acting");
	eq(r.tasks.stopped, 1, "one stopped task, left out of the score");
	eq(r.tasks.child_sessions, 1, "one child session");
	eq(r.children.registered, 1, "the registry lists one child");
	eq(r.children.linked, 1, "it is linked (the parent's record references the nested folder)");
	eq(r.children.unlinked, 0, "no unlinked children");
	eq(r.unproven, 0, "every finish carries evidence");
	ok(/SCORE\s+\d/.test(format_report(r)) && /formula/.test(format_report(r)), "the printed report shows the score and its formula");

	// Same session by agent id and by 8-hex folder name; the nested child by its session id (the folder sits inside the parent's).
	eq((await report("session-aaaaaaaa", { root, rows, cost: false })).id, P, "found by its folder name");
	const kid = await report(K, { root, rows, cost: false });
	ok(!kid.error && kid.dir.endsWith("session-aaaaaaaa/kid"), "the nested child is found by its session id wherever its folder sits");
	eq(kid.score, 0.5, "the child alone scores 0.5 (a done, b open)");
	eq((await locate("mastermind-kid", { root, rows }))?.id, K, "and by its agent id");

	// Resolve a prompt: filing a task under it settles the part by that task's own completion; then the score is the plain mean again.
	const more = [
		{ content: { pr1: { tasks: { add: { type: "Task", id: "filed", title: "Filed ask" } } } }, ts: "2026-11-04T11:00:00.000Z" },
		{ content: { pr1: { tasks: { filed: { complete: { outcome: "done", evidence: ["x"] } } } } }, ts: "2026-11-04T11:01:00.000Z" },
		{ content: { pr2: { no_action: "a remark, nothing to do" } }, ts: "2026-11-04T11:02:00.000Z" }
	];
	fs.appendFileSync(path.join(pdir, "session.jsonl"), more.map(l => JSON.stringify(l)).join("\n") + "\n");
	const r2 = await report(P, { root, rows, cost: false });
	eq(r2.prompts.unresolved, 0, "both prompts resolved (one by a finished filed task, one marked no-action)");
	eq(Math.round(r2.score * 1e9), Math.round(0.875 * 1e9), "resolving both prompts lifts the score to (1 + 1 + 1 + 0.5) / 4 = 0.875 and nothing else changed");
	console.log("all ok");
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
