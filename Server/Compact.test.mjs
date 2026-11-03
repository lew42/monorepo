// node Server/Compact.test.mjs : fixture logs in a temp dir; nothing in the repo is touched.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Compact from "./Compact.mjs";

const NOW = Date.parse("2026-10-13T00:00:00Z");
const J = o => JSON.stringify(o);
const log = (t, msg) => J({ log: { at: `2026-09-01T00:0${t}:00Z`, msg } });
const act = (t, files) => J({ action: { at: `2026-09-01T00:0${t}:00Z`, did: "edit", files } });

function fixture(name, lines) {
	const d = fs.mkdtempSync(path.join(os.tmpdir(), "compact-" + name));
	fs.writeFileSync(path.join(d, "task.jsonl"), lines.join("\n") + "\n");
	return d;
}

const landed = J({ landed_at: "2026-09-01T00:09:00Z", outcome: "done" });
const lines = [
	J({ assign: { session_id: "s", at: "2026-09-01T00:00:00Z" } }),     // 0 keep (launch)
	log(1, "a"), act(2, ["x.js"]), log(3, "b"),                          // 1-3 fold (3 lines)
	log(4, "before decision"),                                           // 4 keep (line before a decision)
	J({ decision: { id: "d", at: "2026-09-01T00:05:00Z", chose: "x" } }),// 5 keep
	act(6, ["y.js", "x.js"]), log(7, "c"),                               // 6-7 fold (2 lines)
	J({ review: { at: "2026-09-01T00:08:00Z", verdict: "ok" } }),        // 8 keep
	landed,                                                              // 9 keep (landing)
];

// 1. A landed, quiet log compacts to the expected keep set.
const d1 = fixture("ok", lines);
const p = Compact.plan(d1, { now: NOW });
assert.equal(p.eligible, true, p.blockers.join());
assert.deepEqual(p.keptLines, [lines[0], lines[4], lines[5], lines[8], lines[9]]);
assert.equal(p.foldedRuns, 2);
assert.equal(p.foldedLines, 5);
assert.equal(p.linesAfter, 5 + 2 + 1); // kept + fold summaries + the one "compacted" line
assert.equal(p.output[0], lines[0]);   // line 1 is still the launch line
assert.equal(JSON.parse(p.output[1]).compacted.lines, 10);
assert.ok(p.tailKept && p.output.at(-1) === landed);

// 2. The folded line counts match: counts add up to what was replaced, files are the ones touched.
const f = p.foldedSummaries.map(s => JSON.parse(s).folded);
assert.deepEqual(f.map(x => x.lines), [3, 2]);
assert.equal(f.reduce((n, x) => n + x.lines, 0), p.foldedLines);
assert.deepEqual(f[0].files, ["x.js"]);
assert.deepEqual(f[1].files, ["y.js", "x.js"]);
assert.equal(f[0].from, "2026-09-01T00:01:00Z");
assert.equal(f[0].to, "2026-09-01T00:03:00Z");
const big = [lines[0], ...Array.from({ length: 50 }, (_, i) => log(i % 10, "step " + i + " ".repeat(80))), landed];
const bp = Compact.plan(fixture("big", big), { now: NOW });
assert.ok(bp.bytesAfter < bp.bytesBefore / 5, "50 deltas shrink a lot");

// 3. Not eligible: an open ask, a reversed decision, not landed, too recent.
const ask = J({ ask: { id: "a1", status: "open" } });
const open = Compact.plan(fixture("ask", [lines[0], ask, ...lines.slice(1)]), { now: NOW });
assert.equal(open.eligible, false);
assert.match(open.blockers.join(), /1 ask open/);
const closed = Compact.plan(fixture("ask2", [lines[0], ask, J({ ask: { id: "a1", status: "landed" } }), ...lines.slice(1)]), { now: NOW });
assert.equal(closed.eligible, true); // the latest status of an ask wins

const rev = Compact.plan(fixture("rev", [lines[0], J({ decision: { id: "d", status: "reversed" } }), ...lines.slice(1)]), { now: NOW });
assert.match(rev.blockers.join(), /decision reversed/);
assert.match(Compact.plan(fixture("nl", lines.slice(0, 8)), { now: NOW }).blockers.join(), /not landed/);
assert.match(Compact.plan(d1, { now: Date.parse("2026-09-05T00:00:00Z") }).blockers.join(), /quiet only/);

// 4. Lines after the landing line stay verbatim, so the tail is always an original line.
const late = [...lines, log(9, "after landing")];
const lp = Compact.plan(fixture("late", late), { now: NOW });
assert.equal(lp.output.at(-1), late.at(-1));

console.log("Compact.test.mjs: all passed");
