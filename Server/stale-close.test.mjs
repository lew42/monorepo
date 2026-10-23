// StaleClose never closes a live VS Code tab's session or a folder whose work sits in its children; a new task folder counts as its parent's task.
// `node Server/stale-close.test.mjs`. Doc: Server/doc/stale-close.md.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import StaleClose from "./StaleClose.mjs";
import SessionRecord from "./SessionRecord.mjs";
import TaskDirs from "./TaskDirs.mjs";

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const NOW = Date.parse("2026-10-22T20:00:00Z"), ago = h => new Date(NOW - h * 36e5).toISOString();
const S = "public/framework/ai/sessions/2026/10/20/session-x";
const row = (dir, bucket, h, agent = null) => ({ dir, bucket, last: ago(h), state: bucket === "stale" ? "running" : bucket, agent });
const plan = async (tasks, { transcripts = {}, sessions = {} } = {}) => {
	const sc = new StaleClose({ now: NOW, state: { agents: [{ id: "someone", state: "idle" }], tasks } });
	sc.session_of = dir => sessions[dir] ?? null;
	sc.transcript_at = id => transcripts[id] ?? 0;
	return { rows: await sc.plan_rows(), skipped: sc.skipped };
};

// 1. The bug: a VS Code tab's session whose own log is one line from two days ago, its work in a child folder.
let r = await plan([row(S, "stale", 48), row(S + "/sessions-and-tasks", "stale", 2)]);
ok(r.rows.length === 0 && r.skipped.child_alive === 1 && r.skipped.fresh === 1, "a session whose child folder wrote 2 h ago is not abandoned");
r = await plan([row(S, "stale", 48), row(S + "/work", "in_flight", 48)]);
ok(r.rows.length === 0 && r.skipped.child_alive === 1, "a child an agent is working on keeps its session open");
r = await plan([row(S, "stale", 48), row(S + "/work", "waiting", 48)]);
ok(r.rows.length === 0, "a child waiting on the owner keeps its session open");
r = await plan([row(S, "stale", 48)], { sessions: { [S]: "tab-1" }, transcripts: { "tab-1": NOW - 36e5 } });
ok(r.rows.length === 0 && r.skipped.transcript_alive === 1, "a VS Code tab whose transcript was written an hour ago is live");
r = await plan([row(S, "stale", 48), row(S + "/old", "stale", 40)], { sessions: { [S]: "tab-1" }, transcripts: { "tab-1": NOW - 30 * 36e5 } });
ok(r.rows.length === 2 && r.rows[0].last === ago(40) && /child folder/.test(r.rows[0].reason), "truly quiet: closed, its last line is the newest in its children");
r = await plan([row(S + "-other", "stale", 48), row(S, "stale", 1)]);
ok(r.rows.length === 1 && r.rows[0].dir === S + "-other", "a sibling with a shared name prefix is not a child");

// 2. link_parent: a new task folder under a session gets one {"task":"<url>"} reference on the session's log.
const DAY = path.join(TaskDirs.REPO, "public/framework/ai/sessions/2026/10/22"), SESS = path.join(DAY, ".stale-close-test-" + process.pid);
fs.mkdirSync(path.join(SESS, "child", "grandchild"), { recursive: true });
fs.writeFileSync(path.join(SESS, "session.jsonl"), JSON.stringify({ session: { id: "tab-2", kind: "vscode-tab" } }) + "\n");
try {
	const url = d => "/" + path.relative(path.join(TaskDirs.REPO, "public"), d).split(path.sep).join("/") + "/";
	const lines = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
	ok(SessionRecord.link_parent(SESS) === null, "a session folder itself has no parent to link");
	const log = SessionRecord.link_parent(path.join(SESS, "child"));
	ok(log === path.join(SESS, "session.jsonl") && lines(log).at(-1).task === url(path.join(SESS, "child")), "a child folder is referenced on the session's log");
	SessionRecord.link_parent(path.join(SESS, "child"));
	ok(lines(log).filter(l => l.task).length === 1, "never twice");
	fs.writeFileSync(path.join(SESS, "child", "task.jsonl"), JSON.stringify({ assign: { title: "child" } }) + "\n");
	const log2 = SessionRecord.link_parent(path.join(SESS, "child", "grandchild"));
	ok(log2 === path.join(SESS, "child", "task.jsonl") && lines(log).filter(l => l.task).length === 1, "a grandchild goes to its nearest parent with a log, not the session");
	ok(SessionRecord.link_parent(path.join(TaskDirs.REPO, "public/framework/core/Task/tasks/x")) === null, "outside the sessions store: nothing");
} finally { fs.rmSync(SESS, { recursive: true, force: true }); }
console.log(`${n} passing`);
