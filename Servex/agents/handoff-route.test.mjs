// A handoff names the spawner by SESSION ROUTE (/framework/ai/sessions/<uuid>/), and an agent's record sits inside its parent's folder.
// move_item must move the task out of the real record (no idle original left), and record_file must find a nested record by uuid.
// `node Servex/agents/handoff-route.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { run_item, move_item, record_file, task_origin } from "./page_tools.js";
import SessionFolders from "../../public/framework/core/Session/SessionFolders.mjs";
import Session from "../../public/framework/core/Session/Session.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SESSIONS = path.join(ROOT, "public/framework/ai/sessions"), tag = process.pid;
const PARENT = randomUUID(), KID = randomUUID();
const parent_dir = path.join(SESSIONS, "2026/11/03", `.handoff-route-${tag}`), kid_dir = path.join(parent_dir, "the-child"), moved_dir = path.join(parent_dir, "moved-here");
const url = d => "/" + path.relative(path.join(ROOT, "public"), d).split(path.sep).join("/") + "/";
const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };

fs.mkdirSync(kid_dir, { recursive: true });
try {
	fs.writeFileSync(path.join(parent_dir, "session.jsonl"), JSON.stringify({ session: { id: PARENT, kind: "vscode-tab", at: "2026-11-03T10:00:00-06:00" } }) + "\n");
	fs.writeFileSync(path.join(kid_dir, "session.jsonl"), JSON.stringify({ assign: { session_id: KID, agent: "mastermind-route-test" } }) + "\n");
	const folders = SessionFolders.at(SESSIONS);
	ok(folders.claim(KID, kid_dir), "the nested child folder is claimed");

	const route = `/framework/ai/sessions/${PARENT}/`;
	ok(record_file(route) === path.join(parent_dir, "session.jsonl"), "a session route by uuid finds the dated record");
	ok(record_file(`/framework/ai/sessions/${KID}/`) === path.join(kid_dir, "session.jsonl"), "the nested child is found by its session id, wherever its folder sits");

	const add = await run_item({ path: url(parent_dir), delta: { tasks: { add: { title: "Hand this off", from: { prompt: "p-1" }, text: "the words" } } } }, { caller: "t" });
	const id = add.ids[0];
	ok(task_origin(route, id)?.text === "the words", "task_origin reads the task through the session route");

	const r = await move_item({ from: route, id, to: url(moved_dir), by: "test", entry: { type: "Session", spawn: { placed: "handoff" } } });
	ok(!r.why, `move_item by session route is not refused (${r.why ?? "moved"})`);
	const lines = read(path.join(parent_dir, "session.jsonl"));
	const ref = lines.find(l => l.task === url(moved_dir) && l.as === id);
	ok(ref && ref.type === "Session", "the parent keeps one Session entry for it, with the id it had");
	const live = Session.replay(lines);
	ok(live._tasks.find(id)?.is_session !== false, "the moved task replays as one child, not an idle twin and an entry");
	ok(fs.existsSync(path.join(moved_dir, "task.jsonl")) || fs.existsSync(path.join(moved_dir, "session.jsonl")), "the history lives in the new folder");
	console.log(`handoff-route: ${n} checks pass`);
} finally { fs.rmSync(parent_dir, { recursive: true, force: true }); }
