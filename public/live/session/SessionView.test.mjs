import { test } from "../../framework/core/Test/Test.js";
import SessionView from "./SessionView.js";

test("SessionView", t => {
	const text = [
		'{"session":{"id":"s1","at":1000}}',
		'{"tasks":{"add":{"id":"a","title":"A task"}},"ts":"2026-01-01T00:00:00.000Z"}',
		'{"tasks":{"add":{"id":"b","title":"B task"}},"ts":"2026-01-01T00:00:01.000Z"}',
		'{"tasks":{"a":{"start":{}}},"ts":"2026-01-01T00:00:02.000Z"}',
		'{"tasks":{"b":{"wait":{"on":"owner","what":"a yes"}}},"ts":"2026-01-01T00:00:03.000Z"}',
		'{"tasks":{"a":{"complete":{"outcome":"done","evidence":["x1"]}}},"ts":"2026-01-01T00:00:04.000Z"}',
		'{"tasks":{"add":{"id":"c","title":"C task"}},"ts":"2026-01-01T00:00:05.000Z"}',
		'{"tasks":{"c":{"stop":{"why":"dup"}}},"ts":"2026-01-01T00:00:06.000Z"}',
		'{"spawned":{"agent":"minion-x","task_dir":"/framework/ai/sessions/2026/01/01/s1/x/"},"ts":"2026-01-01T00:00:07.000Z"}',
		'not json, skipped',
	].join("\n");

	const r = SessionView.fold(text);
	t.eq(r.id, "s1", "reads the session id");
	t.eq(r.startAt, 1000, "reads the start time");
	t.eq(r.lastAt, "2026-01-01T00:00:07.000Z", "reads the last line's ts");
	t.eq(r.tasks.length, 3, "three top-level tasks, a torn line skipped");
	t.eq(r.done, 1, "one complete");
	t.eq(r.total, 2, "stopped task leaves the total (2 of 3, c dropped)");
	t.eq(r.children.length, 1, "one spawned child");
	t.eq(r.children[0].agent, "minion-x", "child names its agent");

	const g = SessionView.grouped(r.tasks);
	t.eq(g.find(x => x.key === "working").tasks.length, 0, "a is complete, not running, by the end");
	t.eq(g.find(x => x.key === "waiting").tasks.length, 1, "b is waiting");
	t.eq(g.find(x => x.key === "done").tasks.length, 2, "a (complete) and c (stopped) both show as done");

	const b = r.tasks.find(x => x.id === "b");
	t.eq(b.waiting.on, "owner", "waiting reason is kept");
});
