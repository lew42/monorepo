// node Server/Unclose.test.mjs — worked-but-never-completed tasks read `unclosed`, never `abandoned`: StaleClose.worked / closing_line, the Task replay of the line, the AIIndex bucket, and Unclose's dry run and --apply on a temp tree.
import assert from "node:assert"; import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import StaleClose from "./StaleClose.mjs"; import AIIndex from "./AIIndex.mjs"; import Unclose from "./Unclose.mjs";
import Task from "../public/framework/core/Task/Task.js";
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const T = "2026-10-20T10:00:00-05:00", later = "2026-10-21T10:00:00-05:00";
const head = [{ assign: { title: "t", requested_at: T, agent: "minion-x" } }, { start: { at: T } }];
const log = i => ({ log: { at: T, msg: `line ${i}` } });
const stop = { stop: { at: later, why: "abandoned: no agent since 2026-10-20; closed by StaleClose 2026-10-22", by: "StaleClose" } };

// 1. worked: a commit, or three own lines, besides stop/unclosed lines
ok(StaleClose.worked([...head, { commit: "abc" }]), "a commit line is work");
ok(!StaleClose.worked([...head, log(1), log(2)]), "the opening and start lines are not work: two log lines are not enough");
ok(StaleClose.worked([...head, log(1), log(2), log(3)]), "three log lines are work");
ok(!StaleClose.worked([head[0], stop]), "one line and a stop is not work");
ok(!StaleClose.worked([...head, stop]) , "two lines and a stop is not work");

// 2. the closing line: unclosed for worked rows, stop (abandoned) for the rest
const w = StaleClose.closing_line({ worked: true, lines: 5, last: later }, "NOW", "2026-11-02"), e = StaleClose.closing_line({ worked: false, lines: 1, last: later }, "NOW", "2026-11-02");
ok(w.unclosed && !w.stop && /^unclosed: 5 log lines/.test(w.unclosed.why), "worked rows get an unclosed line");
ok(e.stop && /^abandoned/.test(e.stop.why), "empty rows still get the abandoned stop");

// 3. Task replay: an open task + unclosed = stopped with the flag; the flag counts only while stopped; a later complete or start supersedes it
let t = Task.replay([...head, log(1), { unclosed: { at: later, why: "unclosed: 3 lines", by: "StaleClose" } }]);
ok(t.state === "stopped" && t.get("unclosed")?.by === "StaleClose", "replay: open + unclosed -> stopped, flagged");
t = Task.replay([...head, stop, { unclosed: { at: later, why: "re-closed", by: "Unclose" } }]);
ok(t.state === "stopped" && t.get("unclosed")?.why === "re-closed", "replay: an abandoned task + unclosed stays stopped, now flagged");
t = Task.replay([...head, { unclosed: { at: later, why: "x", by: "u" } }, { complete: { at: later, outcome: "done", evidence: ["a"] } }]);
ok(t.state === "complete", "replay: a later complete wins");

// 4. AIIndex buckets: a flagged stopped task is `unclosed`, a plain stop stays `stopped`
const f1 = AIIndex.fold([...head, log(1), { unclosed: { at: later, why: "x", by: "u" } }], "/tmp");
const f2 = AIIndex.fold([...head, log(1), stop], "/tmp");
ok(f1.state === "stopped" && f1.unclosed && !f2.unclosed, "fold: only the flagged stop carries unclosed");
ok(AIIndex.BUCKETS.includes("unclosed"), "unclosed is a bucket");

// 5. Unclose on a temp tree: the dry run finds abandoned+worked, skips empty, completed and already-unclosed; --apply appends one line each and a manifest row, rewrites nothing
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "unclose-")), S = path.join(TMP, "public/framework/ai/sessions/2026/10/20/s");
const mk = (name, lines) => { const d = path.join(S, name); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "task.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n"); return path.join(d, "task.jsonl"); };
try {
	const a = mk("worked", [...head, log(1), log(2), log(3), stop]);
	mk("empty", [head[0], stop]);
	mk("done", [...head, log(1), log(2), stop, { complete: { at: later, outcome: "ok", evidence: ["x"] } }]);
	mk("again", [...head, log(1), log(2), stop, { unclosed: { at: later, why: "x", by: "u" } }]);
	mk("plain-stop", [...head, log(1), log(2), log(3), { stop: { at: later, why: "owner dropped it" } }]);
	const before = fs.readFileSync(a, "utf8"), written = [];
	const u = new Unclose({ root: TMP, manifest: path.join(TMP, "manifest.jsonl"), append: (target, obj) => { written.push([target, obj]); fs.appendFileSync(target, JSON.stringify(obj) + "\n"); } });
	const plan = u.scan();
	ok(plan.length === 1 && plan[0].dir.endsWith("/worked") && plan[0].by === "minion" && written.length === 0, "dry run: one task, by minion, nothing written");
	ok(u.apply().length === 1 && written.length === 2, "apply: one unclosed line and one manifest row");
	const after = fs.readFileSync(a, "utf8");
	ok(after.startsWith(before) && after.slice(before.length).split("\n").filter(Boolean).length === 1, "the log only grew by one line; no line rewritten");
	ok(Task.replay(AIIndex.parse(after)).get("unclosed")?.by === "Unclose", "it replays as unclosed");
	ok(new Unclose({ root: TMP, manifest: path.join(TMP, "manifest.jsonl"), append: () => assert.fail("second run must write nothing") }).scan().length === 0, "idempotent: a second run finds nothing");
} finally { fs.rmSync(TMP, { recursive: true, force: true }); }
console.log(`${n} passing`);
