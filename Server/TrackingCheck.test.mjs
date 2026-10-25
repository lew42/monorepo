// node Server/TrackingCheck.test.mjs — the pure parts of TrackingCheck: task events, open spans, the tracked/untracked split. No files read.
import assert from "node:assert/strict";
import { task_events, open_spans, inside, split } from "./TrackingCheck.mjs";

const T = s => Date.parse(s);
const H = 36e5;

// A task added running, then completed: one span between the two lines.
{
	const ev = task_events([
		{ tasks: { add: { id: "a", title: "x", state: "running" } }, ts: "2026-10-24T10:00:00Z" },
		{ tasks: { a: { complete: { outcome: "done" } } }, ts: "2026-10-24T11:00:00Z" },
	]);
	const spans = open_spans(ev, T("2026-10-24T20:00:00Z"));
	assert.deepEqual(spans, [[T("2026-10-24T10:00:00Z"), T("2026-10-24T11:00:00Z")]]);
	assert.ok(inside(spans, T("2026-10-24T10:30:00Z")));
	assert.ok(!inside(spans, T("2026-10-24T12:00:00Z")));
}

// A task added with no state is not a bucket yet; a task never closed counts open for at most 2 hours after its last event.
{
	assert.equal(task_events([{ tasks: { add: { id: "b", title: "idle" } }, ts: "2026-10-24T10:00:00Z" }]).length, 0);
	const ev = task_events([{ tasks: { add: { id: "c", title: "x", state: "running" } }, ts: "2026-10-24T10:00:00Z" }]);
	const [[from, to]] = open_spans(ev, T("2026-10-24T20:00:00Z"));
	assert.equal(to - from, 2 * H);
}

// A task folder's file (line 1 is an assign) is one bucket as a whole; a session file's own start is not a task.
{
	const folder = task_events([{ assign: { slug: "s", requested_at: "2026-10-24T10:00:00Z" } }, { complete: { outcome: "ok" }, ts: "2026-10-24T10:30:00Z" }]);
	assert.deepEqual(open_spans(folder, T("2026-10-24T20:00:00Z")), [[T("2026-10-24T10:00:00Z"), T("2026-10-24T10:30:00Z")]]);
	assert.equal(task_events([{ session: "x", ts: "2026-10-24T10:00:00Z" }, { start: {}, ts: "2026-10-24T10:00:01Z" }]).length, 0);
}

// Overlapping buckets merge into one span.
{
	const spans = open_spans([
		{ bucket: "a", t: 0, open: true }, { bucket: "b", t: 5, open: true },
		{ bucket: "a", t: 10, open: false }, { bucket: "b", t: 20, open: false },
	], 100);
	assert.deepEqual(spans, [[0, 20]]);
}

// The split: a message inside a span is tracked, outside is untracked, and the first untracked time is kept.
{
	const s = split([{ t: 5, usd: 1, tokens: 10 }, { t: 50, usd: 3, tokens: 30 }, { t: 60, usd: 1, tokens: 10 }], [[0, 10]]);
	assert.equal(s.usd, 5);
	assert.equal(s.tracked_usd, 1);
	assert.equal(s.untracked_usd, 4);
	assert.equal(s.untracked_tokens, 40);
	assert.equal(s.untracked_messages, 2);
	assert.equal(s.first_untracked_at, 50);
}

console.log("TrackingCheck.test.mjs: all pass");
