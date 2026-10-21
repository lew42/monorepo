import test from "node:test";
import assert from "node:assert/strict";
import Rows from "./WhisperLogRows.js";

const line = (seq, src, kind, msg, extra = {}) => ({ seq, t: seq * 10, run: "r1", src, kind, msg, ...extra });

test("diff marks added and removed words", () => {
	const d = Rows.diff("and so my fellow", "and so, my fellow Americans");
	assert.deepEqual(d.filter(x => x.op !== "same").map(x => x.w), ["Americans"]);
});

test("change: new, same, grow, amend", () => {
	assert.equal(Rows.change(null, "hello there"), "new");
	assert.equal(Rows.change("hello there", "Hello there."), "same");
	assert.equal(Rows.change("hello there", "hello there my friend"), "grow");
	assert.equal(Rows.change("what is the county doing", "what is the country doing today"), "amend");
	assert.equal(Rows.change("It has two sentences.", "And so, my fellow Americans"), "new");   // another sentence, not a rewrite
});

test("annotate: an interim amended inside one segment is flagged against the previous reply of that segment", () => {
	const rows = Rows.annotate([
		line(1, "server", "interim", "so there is interim", { segment: 0 }),
		line(2, "server", "interim", "so there's interim and final", { segment: 0 }),
		line(3, "server", "final", "So there's interim and final.", { segment: 0 }),
	]);
	assert.equal(rows[0].change, "new");
	assert.equal(rows[1].change, "amend");
	assert.equal(rows[2].change, "same");
	assert.equal(rows[2].prev_seq, 2);
});

test("annotate: the same words at the same downstream stage twice is a duplicate with its origin", () => {
	const rows = Rows.annotate([
		line(1, "composer", "deliver", "What is minion-kaq?", { req: 4 }),
		line(2, "composer", "deliver", "what is minion kaq", { req: 5 }),
		line(3, "composer", "enqueue", "What is minion-kaq?"),
	]);
	assert.equal(rows[0].dup_of, undefined);
	assert.equal(rows[1].dup_of, 1);
	assert.equal(rows[2].dup_of, undefined);   // a different stage is the normal path, not a duplicate
});

test("annotate: repeated interim guesses are never duplicates", () => {
	const rows = Rows.annotate([line(1, "server", "interim", "okay", { segment: 0 }), line(2, "server", "interim", "okay", { segment: 1 })]);
	assert.equal(rows.filter(r => r.dup_of != null).length, 0);
});

test("summary counts", () => {
	const rows = Rows.annotate([line(1, "server", "final", "yes sir"), line(2, "server", "final", "yes sir")]);
	assert.deepEqual(Rows.summary(rows).dups, 1);
});

test("supersede: a final replaces the interims of its own segment only", () => {
	const rows = Rows.supersede([
		{ seq: 1, run: "a", t: 1, src: "server", kind: "interim", segment: 0 },
		{ seq: 2, run: "a", t: 2, src: "server", kind: "interim", segment: 0 },
		{ seq: 3, run: "a", t: 3, src: "server", kind: "final", segment: 0 },
		{ seq: 4, run: "a", t: 4, src: "server", kind: "interim", segment: 1 },
	]);
	assert.equal(rows[0].replaced_by, 3);
	assert.equal(rows[1].replaced_by, 3);
	assert.deepEqual(rows[2].replaces, [1, 2]);
	assert.equal(rows[3].replaced_by, undefined);
});
