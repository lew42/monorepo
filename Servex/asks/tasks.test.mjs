// Servex/asks/tasks.test.mjs — run with `node Servex/asks/tasks.test.mjs`.
// A fixture tree under a temp dir, never the real public/framework/ai/ — same style as
// asks.test.mjs: plain checks, no framework, exits non-zero on a failure.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build_tasks, write_tasks_json } from "./tasks.js";

let pass = 0, fail = 0;
function check(name, cond){
	if (cond){ pass++; console.log(`ok - ${name}`); }
	else { fail++; console.error(`FAIL - ${name}`); }
}

const NOW = Date.parse("2026-10-02T12:00:00-05:00");
const TWO_H_AGO = new Date(NOW - 3 * 60 * 60 * 1000).toISOString();   // 3h: past the 2h silence window
const RECENT = new Date(NOW - 5 * 60 * 1000).toISOString();           // 5 min ago: well inside it

function tmproot(){
	return fs.mkdtempSync(path.join(os.tmpdir(), "tasks-test-"));
}

/* One fake task dir: task.jsonl line 1 (+ extra lines), and optionally requirements.md /
 * spend.json so budget and spent can be tested too. */
function make_task(ai_dir, date, slug, { agent, extra_lines = [], budget, spent } = {}){
	const dir = path.join(ai_dir, date, slug);
	fs.mkdirSync(dir, { recursive: true });
	const lines = [{ assign: { session_id: "s-" + slug, agent: agent ?? null, card: `2026/10/02/${slug}`, brief: `…/${slug}/requirements.md`, requested_at: RECENT } }, ...extra_lines];
	fs.writeFileSync(path.join(dir, "task.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n");
	if (budget != null) fs.writeFileSync(path.join(dir, "requirements.md"), `Budget: $${budget}\n\n# ${slug}\n`);
	if (spent != null) fs.writeFileSync(path.join(dir, "spend.json"), JSON.stringify({ total: spent, points: [] }));
	return dir;
}

function test_states(){
	const root = tmproot();
	const ai = path.join(root, "ai");

	// landed: a landed_at line exists, regardless of whether an agent is even still around.
	make_task(ai, "2026-10-01", "t-landed", { agent: "agent-gone", extra_lines: [{ assign: { landed_at: RECENT, at: RECENT } }] });

	// building: a live agent whose own registry row says it turned recently.
	make_task(ai, "2026-10-01", "t-building", { agent: "agent-live", extra_lines: [{ log: { at: RECENT, msg: "still going" } }] });

	// stalled: its last log line is 3h old, and its agent is nowhere in the registry (gone).
	make_task(ai, "2026-10-01", "t-stalled", { agent: "agent-vanished", extra_lines: [{ log: { at: TWO_H_AGO, msg: "last seen a while ago" } }] });

	// snoozed: a snooze line whose `until` is still in the future — not stalled even though its
	// own last line is old and its agent is gone, same as t-stalled would otherwise be.
	make_task(ai, "2026-10-01", "t-snoozed", {
		agent: "agent-vanished",
		extra_lines: [{ log: { at: TWO_H_AGO, msg: "old" } }, { snooze: { at: RECENT, until: "2026-10-05T00:00:00-05:00", by: "owner" } }],
	});

	// killed: closed, like landed — folded, score 0, never shown as stalled.
	make_task(ai, "2026-10-01", "t-killed", {
		agent: "agent-vanished",
		extra_lines: [{ log: { at: TWO_H_AGO, msg: "old" } }, { kill: { at: RECENT, why: "duplicate of another task", by: "owner" } }],
	});

	const registry = [
		{ id: "agent-live", state: "working", last_at: RECENT },
		{ id: "agent-gone", state: "gone" },
	];

	const tasks = build_tasks({ now: NOW, registry, ai_dir: ai, root });
	const by = slug => tasks.find(t => t.dir.endsWith(slug));

	check("every fixture task is read", tasks.length === 5);
	check("landed: landed_at wins even over a gone agent", by("t-landed")?.state === "landed");
	check("building: a recently-active agent is not stalled", by("t-building")?.state === "building");
	check("stalled: no registry row + a 3h-old line", by("t-stalled")?.state === "stalled");
	check("stalled: reason names the missing owner", /no registry row/.test(by("t-stalled")?.why ?? ""));
	check("snoozed: held off even though its own facts look stalled", by("t-snoozed")?.state === "snoozed");
	check("killed: folded like landed", by("t-killed")?.state === "killed");

	check("score: stalled (100) ranks above building (50)", by("t-stalled").score > by("t-building").score);
	check("score: building (50) ranks above snoozed (10)", by("t-building").score > by("t-snoozed").score);
	check("score: snoozed (10) ranks above landed/killed (0)", by("t-snoozed").score > by("t-landed").score && by("t-snoozed").score > by("t-killed").score);
	check("tasks sort highest score first", tasks[0].score >= tasks[tasks.length - 1].score);

	return { root, ai, registry };
}

function test_budget(){
	const root = tmproot();
	const ai = path.join(root, "ai");
	make_task(ai, "2026-10-01", "t-under", { agent: "agent-live", budget: 10, spent: 4 });
	make_task(ai, "2026-10-01", "t-over", { agent: "agent-live", budget: 10, spent: 24 });
	make_task(ai, "2026-10-01", "t-no-budget", { agent: "agent-live" });

	const registry = [{ id: "agent-live", state: "working", last_at: RECENT }];
	const tasks = build_tasks({ now: NOW, registry, ai_dir: ai, root });
	const by = slug => tasks.find(t => t.dir.endsWith(slug));

	check("budget + spent read from requirements.md and spend.json", by("t-under").budget === 10 && by("t-under").spent === 4);
	check("over = spent / budget", by("t-over").over === 2.4);
	check("a task under budget computes over < 1", by("t-under").over === 0.4);
	check("no Budget: line -> budget is null, not guessed", by("t-no-budget").budget === null && by("t-no-budget").over === null);
	check("over budget (score 90) outranks a plain building task (50)", by("t-over").score === 90 && by("t-over").score > by("t-under").score);
}

function test_priority_override(){
	const root = tmproot();
	const ai = path.join(root, "ai");
	make_task(ai, "2026-10-01", "t-reprioritised", {
		agent: "agent-live",
		extra_lines: [{ priority: { at: RECENT, score: 5, why: "owner says this can wait", by: "owner" } }],
	});
	const registry = [{ id: "agent-live", state: "working", last_at: RECENT }];
	const tasks = build_tasks({ now: NOW, registry, ai_dir: ai, root });
	check("priority.score overrides the computed band", tasks[0].score === 5);
}

function test_write_atomic(){
	const root = tmproot();
	const out = path.join(root, "tasks.json");
	write_tasks_json([{ dir: "x", state: "building", score: 50 }], out);
	const first = JSON.parse(fs.readFileSync(out, "utf8"));
	check("write_tasks_json writes valid JSON with the tasks array", Array.isArray(first.tasks) && first.tasks[0].dir === "x");
	check("the file says it is derived, never hand-edited", /never hand-edit/i.test(first.note));
	// no leftover temp file after the rename
	const leftovers = fs.readdirSync(root).filter(f => f.endsWith(".tmp"));
	check("the temp file is gone after the atomic rename", leftovers.length === 0);
}

test_states();
test_budget();
test_priority_override();
test_write_atomic();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
