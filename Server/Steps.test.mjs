// node Server/Steps.test.mjs — parse, overdue at 2x, nudged once, report counts (plain asserts, temp fixtures).
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "steps-test-"));
process.env.LEDGER_ROOT = dir;   // TaskDirs reads it at import: the fixture is the repo
const day = new Date().toISOString().slice(0, 10), [y, m, d] = day.split("-");
const { default: Steps } = await import("./Steps.mjs");

const task = (slug, lines) => {
	const t = path.join(dir, "public", "framework", "ai", "sessions", y, m, d, slug);
	fs.mkdirSync(t, { recursive: true });
	fs.writeFileSync(path.join(t, "task.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n");
	return path.join(t, "task.jsonl");
};
const ago = min => new Date(Date.now() - min * 60000).toISOString();

// parse
assert.deepEqual(Steps.parse(["A (20 min)", "B (5 m)", "C ~10m", "D", { do: "E", min: 3 }, { title: "F (7 min)" }]),
	[{ n: 1, do: "A", min: 20 }, { n: 2, do: "B", min: 5 }, { n: 3, do: "C", min: 10 }, { n: 4, do: "D", min: null }, { n: 5, do: "E", min: 3 }, { n: 6, do: "F", min: 7 }]);

// template
assert.equal(Steps.template().length, 3);
assert.equal(Steps.template("ui").length, 7);
assert.equal(Steps.template("ui")[0], "Shoot the page at its widths (5 min)");

// overdue at 2x, once
const f1 = task("a", [{ assign: { steps: ["Do it (10 min)", "Then (5 min)"], step: 1, requested_at: ago(25) } }]);
let info = Steps.read(f1);
assert.equal(info.step, 1);
assert.equal(Steps.overdue(info, Date.now() - 10 * 60000), null, "5 min in: not due");
const due = Steps.overdue(info);
assert.equal(due.n, 1); assert.equal(due.min, 10); assert.ok(due.since_ms >= 20 * 60000);
fs.appendFileSync(f1, JSON.stringify({ log: { at: ago(0), msg: "nudge", nudge: 1 } }) + "\n");
assert.equal(Steps.overdue(Steps.read(f1)), null, "nudged once: silent");

// a step with no estimate is never due; a landed task is never due
const f2 = task("b", [{ assign: { steps: ["No estimate"], step: 1, requested_at: ago(500) } }]);
assert.equal(Steps.overdue(Steps.read(f2)), null);
const f3 = task("c", [{ assign: { steps: ["X (1 min)"], step: 1, requested_at: ago(500) } }, { assign: { landed_at: ago(1), outcome: "ok" } }]);
assert.equal(Steps.overdue(Steps.read(f3)), null);

// a later step restarts the clock from its own at
const f4 = task("d", [{ assign: { steps: ["A (10 min)", "B (10 min)"], step: 1, requested_at: ago(60) } }, { assign: { step: 2, at: ago(3) } }]);
assert.equal(Steps.overdue(Steps.read(f4)), null);

// prompt
const p = Steps.prompt(Steps.read(f1), 1);
assert.match(p, /^Step 1 of 2: Do it \(~10 min\)\./); assert.match(p, /"step":2/);

// report: f1 (estimates, not landed), f2 (no estimate), f3 landed (1 step, estimate, reached), f4 (open)
const r = Steps.report(7);
assert.equal(r.tasks, 4); assert.equal(r.with_steps, 4); assert.equal(r.with_estimates, 3);
assert.equal(r.landed, 1); assert.equal(r.followed_fully, 1); assert.equal(r.rate, 1 / 3);

fs.rmSync(dir, { recursive: true, force: true });
console.log("Steps.test.mjs: all checks passed");
