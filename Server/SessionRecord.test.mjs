// node Server/SessionRecord.test.mjs — plan, apply and undo on a throwaway git repo (never the real store).
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import SessionRecord from "./SessionRecord.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "session-record-test-"));
const git = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", windowsHide: true });
git("init", "-q"); git("config", "user.email", "t@t"); git("config", "user.name", "t");

const day = path.join(root, SessionRecord.STORE, "2026/10/05");
const j = (...ls) => ls.map(l => JSON.stringify(l)).join("\n") + "\n";
const put = (rel, text, old = true) => {
	const f = path.join(day, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text);
	if (old){ const t = new Date(Date.now() - 5 * 3600e3); fs.utimesSync(f, t, t); }
	return f;
};
const own = id => ({ assign: { session_id: id, title: "s" } });
put("s-rename/task.jsonl", j(own("a1"), { log: { text: "one" } }));
put("s-rename/child/task.jsonl", j({ assign: { title: "a child task" } }));
put("s-merge/task.jsonl", j(own("b2"), { log: { text: "two" } }));
put("s-merge/session.jsonl", j({ tag: "kind/agent" }, { summary: "digest" }));
put("s-fold/session.jsonl", j(own("c3"), { log: { text: "moved earlier" } }));
put("s-fold/task.jsonl", j({ log: { text: "a writer recreated this" } }));
put("t-task/task.jsonl", j({ assign: { title: "a task, not a session" } }));
put("s-active/task.jsonl", j(own("d4")), false);
put("s-tags/session.jsonl", j({ tag: "kind/voice" }));
put("s-nonl/task.jsonl", JSON.stringify(own("e5")) + "\n" + JSON.stringify({ log: { text: "no final newline" } }));
git("add", "-A"); git("commit", "-qm", "fixture");

// readers: names
const D = n => path.join(day, n);
assert.equal(SessionRecord.log_file(D("s-tags")), null);                       // digest tags only: not a log
assert.equal(SessionRecord.log_file(D("s-rename")), D("s-rename/task.jsonl"));  // not moved yet
assert.ok(SessionRecord.is_log_entry(D("s-rename"), "task.jsonl"));
assert.ok(!SessionRecord.is_log_entry(D("s-tags"), "session.jsonl"));
assert.equal(SessionRecord.file(D("s-tags")), D("s-tags/session.jsonl"));
assert.ok(SessionRecord.is_tag_line({ tag: "x" }) && !SessionRecord.is_tag_line({ assign: {}, tag: "x" }));

// plan: counts, reasons, nothing written
const sr = new SessionRecord({ root });
const plan = sr.plan();
assert.deepEqual(plan.counts, { rename: 2, merge: 1, fold: 1, skip: 2, already: 1 });
assert.equal(plan.children_skipped, 1);
assert.match(plan.folders.find(f => f.dir.endsWith("t-task")).why, /task folder/);
assert.match(plan.folders.find(f => f.dir.endsWith("s-active")).why, /active/);
assert.ok(!fs.existsSync(sr.manifest));

// apply
const before = Object.fromEntries(["s-rename", "s-merge", "s-fold", "s-nonl"].map(n => [n, fs.readdirSync(D(n)).sort()]));
const bytes = n => fs.readFileSync(D(n));
const was = { rename: bytes("s-rename/task.jsonl"), mergeT: bytes("s-merge/task.jsonl"), mergeS: bytes("s-merge/session.jsonl"), foldS: bytes("s-fold/session.jsonl"), foldT: bytes("s-fold/task.jsonl"), nonl: bytes("s-nonl/task.jsonl") };
const res = sr.apply({ plan });
assert.equal(res.moved, 4); assert.deepEqual(res.errors, []);

assert.ok(!fs.existsSync(D("s-rename/task.jsonl")) && bytes("s-rename/session.jsonl").equals(was.rename));
assert.ok(bytes("s-rename/child/task.jsonl").length > 0);                               // a task folder is never touched
assert.ok(bytes("s-merge/session.jsonl").equals(Buffer.concat([was.mergeT, was.mergeS])) && !fs.existsSync(D("s-merge/task.jsonl")));
assert.ok(bytes("s-fold/session.jsonl").equals(Buffer.concat([was.foldS, was.foldT])) && !fs.existsSync(D("s-fold/task.jsonl")));
assert.ok(bytes("t-task/task.jsonl").length > 0 && bytes("s-active/task.jsonl").length > 0);   // skipped folders stay
const glued = bytes("s-nonl/session.jsonl").toString("utf8");
assert.equal(glued, was.nonl.toString("utf8"));                                          // a plain rename keeps even a missing final newline

// manifest: header + one line per move, with counts and shas
const man = fs.readFileSync(sr.manifest, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
assert.equal(man.filter(l => l.header).length, 1);
const mv = man.filter(l => !l.header);
assert.equal(mv.length, 4);
for (const l of mv) assert.ok(l.sha_before && l.sha_after && l.lines_before > 0 && l.lines_after >= l.lines_before, l.old);
assert.equal(mv.find(l => l.op === "merge").lines_after, 4);

// a second apply has nothing left to move except what the first skipped
const again = sr.plan();
assert.deepEqual(again.counts, { rename: 0, merge: 0, fold: 0, skip: 2, already: 5 });

// the new name is staged as a rename
assert.match(git("status", "--short"), /R|A|D/);
git("add", "-A"); git("commit", "-qm", "apply");

// undo restores every original byte, file by file
const out = sr.undo(sr.manifest);
assert.equal(out.restored, 4);
assert.ok(bytes("s-rename/task.jsonl").equals(was.rename));
assert.ok(bytes("s-merge/task.jsonl").equals(was.mergeT) && bytes("s-merge/session.jsonl").equals(was.mergeS));
assert.ok(bytes("s-fold/task.jsonl").equals(was.foldT) && bytes("s-fold/session.jsonl").equals(was.foldS));
assert.ok(bytes("s-nonl/task.jsonl").equals(was.nonl));
for (const n of Object.keys(before)) assert.deepEqual(fs.readdirSync(D(n)).sort(), before[n], n);

// undo will not overwrite a task.jsonl that is back
sr.apply({ plan: sr.plan() });
fs.writeFileSync(D("s-rename/task.jsonl"), "{}\n");
assert.throws(() => sr.undo(sr.manifest), /will not overwrite/);

// append.mjs follows a moved record: a line meant for the old task.jsonl lands in session.jsonl, and the old name is not recreated
const lines = path.join(root, "lines.json"); fs.writeFileSync(lines, JSON.stringify([{ log: { at: "NOW", msg: "after the move" } }]));
const hook = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".claude", "hooks", "append.mjs");
execFileSync(process.execPath, [hook, D("s-nonl/task.jsonl"), lines], { windowsHide: true, stdio: "pipe" });
assert.ok(!fs.existsSync(D("s-nonl/task.jsonl")));
assert.match(bytes("s-nonl/session.jsonl").toString("utf8"), /after the move/);

// writers: a NEW session folder (directly under a day, own session_id on line 1) starts as session.jsonl; a task folder keeps task.jsonl
const launch = { assign: { session_id: "f6", title: "new session" } }, taskline = { assign: { title: "a task" } };
assert.ok(SessionRecord.is_session_dir(D("fresh")) && !SessionRecord.is_session_dir(D("fresh/child")));
assert.equal(SessionRecord.start_file(D("fresh"), launch), D("fresh/session.jsonl"));
assert.equal(SessionRecord.start_file(D("fresh"), taskline), D("fresh/task.jsonl"));              // a day-level task with no own session_id
assert.equal(SessionRecord.start_file(D("fresh/child"), launch), D("fresh/child/task.jsonl"));     // a tab's task: session_id but no agent, nested
const spawn = { assign: { session_id: "f7", agent: "minion-x" } };
assert.equal(SessionRecord.start_file(D("fresh/child"), spawn), D("fresh/child/session.jsonl"));   // a spawn line, nested: a sub-session
assert.equal(SessionRecord.start_file(D("fresh/child"), { session: { id: "v1", kind: "cloud-voice-agent" } }), D("fresh/child/session.jsonl"));
assert.equal(SessionRecord.start_file(D("fresh/child"), taskline), D("fresh/child/task.jsonl"));
assert.equal(SessionRecord.start_file(D("s-tags"), taskline), D("s-tags/session.jsonl"));          // digest tags only: that file is the record
assert.equal(SessionRecord.start_file(D("t-task"), launch), D("t-task/task.jsonl"));               // an existing task log is never renamed under a writer
const put_line = (dir, line) => { fs.writeFileSync(lines, JSON.stringify([line])); execFileSync(process.execPath, [hook, path.join(dir, "task.jsonl"), lines], { windowsHide: true, stdio: "pipe" }); };
fs.mkdirSync(D("fresh"), { recursive: true }); fs.mkdirSync(D("fresh/child"), { recursive: true });
put_line(D("fresh"), launch); put_line(D("fresh"), { log: { at: "NOW", msg: "second line" } });
assert.ok(!fs.existsSync(D("fresh/task.jsonl")));
assert.equal(fs.readFileSync(D("fresh/session.jsonl"), "utf8").trim().split("\n").length, 2);
put_line(D("fresh/child"), launch);
assert.ok(fs.existsSync(D("fresh/child/task.jsonl")) && !fs.existsSync(D("fresh/child/session.jsonl")));
assert.equal(sr.plan().counts.rename, 0, "a folder started as session.jsonl needs no move");

fs.rmSync(root, { recursive: true, force: true });
console.log("SessionRecord: ok");
