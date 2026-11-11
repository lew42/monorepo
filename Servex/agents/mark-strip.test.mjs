// node Servex/agents/mark-strip.test.mjs — strip_marks is a pure function, no SDK/Agents import needed
import assert from "node:assert/strict";
import { strip_marks } from "./mark-strip.js";

let checks = 0;
const check = (name, fn) => { fn(); checks++; };

check("two reports that differ only by their timestamp strip to the same text", () => {
	const a = strip_marks("done: Idle and blocked, no change since 2026-11-09T09:14:00-06:00");
	const b = strip_marks("done: Idle and blocked, no change since 2026-11-09T09:19:00-06:00");
	assert.equal(a, b);
});

check("a uuid and a long hex id both blank out", () => {
	assert.equal(strip_marks("child a1b2c3d4-e5f6-7890-abcd-ef1234567890 finished"), strip_marks("child 99999999-aaaa-bbbb-cccc-dddddddddddd finished"));
	assert.equal(strip_marks("commit abc123def456 landed"), strip_marks("commit 0000111122223333 landed"));
});

check("a real difference in wording still differs after stripping", () => {
	assert.notEqual(strip_marks("done: built the thing"), strip_marks("done: built a different thing"));
});

check("no marks: unchanged but trimmed", () => {
	assert.equal(strip_marks("  plain text  "), "plain text");
});

console.log(`mark-strip: ${checks} checks passed`);
