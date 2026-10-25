// A prompt's asks group under one outcome task. `node Server/PromptGroup.test.mjs`. Doc: core/Session/doc/prompt-breakdown.md.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PromptRecords from "./PromptRecords.mjs";
import TaskHomes from "./TaskHomes.mjs";
import { ledgers } from "../Servex/agents/page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = ".prompt-group-test-" + process.pid, DIR = path.join(ROOT, "public/framework/ai/sessions/2026/10/25", SLUG), REC = path.join(DIR, "session.jsonl");
ledgers.task_moves = path.join(DIR, "task-moves.jsonl"); TaskHomes.INDEX = path.join(DIR, "homes.jsonl");
const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(REC, JSON.stringify({ session: { id: "00000000-0000-4000-8000-0000000000aa", kind: "vscode-tab", at: "2026-10-25T01:00:00Z" } }) + "\n");
try {
	const pr = new PromptRecords("00000000-0000-4000-8000-0000000000aa", { process: "review", folder: DIR });
	const parts = (...t) => t.map((x, i) => ({ id: `a${i + 1}`, cites: [i], kind: "ask", text: x, outcome: { is: "open" } }));
	const put = async (id, subject, ps) => { await pr.add({ prompt: id, stage: "raw", text: id }); await pr.add({ prompt: id, stage: "parts", subject, parts: ps }); return { id, uuid: id, line: 1, at: "2026-10-25T01:00:00Z", text: id }; };
	pr.attach_to = async () => null;
	const roots = () => read(REC).filter(l => l.tasks?.add);
	const refs = id => Object.values(pr.rows()).find(r => r.id === id).parts.map(x => x.outcome.ref);

	const three = await put("p3", "Fix the menu.", parts("add a menu", "fix the footer", "rename the tab"));
	await pr.file([three]);
	ok(roots().length === 1 && roots()[0].tasks.add.title === "Fix the menu" && !roots()[0].tasks.add.source.part, "a 3-ask prompt gives ONE root task, titled from its subject");
	const nested = read(REC).filter(l => Object.values(l).some(v => v?.tasks?.add?.source?.part));
	ok(nested.length === 3, "its three asks are subtasks of that root");
	const state = pr.task_state();
	ok(refs("p3").every(r => state(r) === "idle"), "task_state resolves a subtask by its ref");
	const sub = refs("p3")[0];
	fs.appendFileSync(REC, JSON.stringify({ [sub]: { complete: { outcome: "done" } } }) + "\n");
	ok(pr.task_state()(sub) === "complete" && pr.task_state()(refs("p3")[1]) === "idle", "a completed subtask reads complete, its siblings stay open");

	const one = await put("p1", "One thing.", parts("do the one thing"));
	await pr.file([one]);
	ok(roots().length === 2 && roots()[1].tasks.add.source.part === "a1", "a 1-ask prompt files as a plain root, no wrapper");

	const root0 = roots()[0].tasks.add.id;
	pr.attach_to = async () => root0;
	const more = await put("p2", "More menu.", parts("menu icons", "menu colors"));
	await pr.file([more]);
	ok(roots().length === 2 && read(REC).filter(l => l[root0]?.tasks?.add).length === 5, "attach_to files the asks under the existing open task, no new parent");
	console.log(`${n} passed`);
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
