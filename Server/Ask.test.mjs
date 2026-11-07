// The one ask writer: each channel leaves exactly one ask line and one open task on the right session record. `node Server/Ask.test.mjs`.
// A scratch session folder is used and removed; nothing is posted to a real log.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ask from "./Ask.mjs";
import { page_tools } from "../Servex/agents/page_tools.js";
import Session from "../public/framework/core/Session/Session.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = ".ask-test-" + process.pid;
const DIR = path.join(ROOT, "public/framework/ai/sessions/2026/10/22", SLUG), REC = path.join(DIR, "session.jsonl"), URL = `/framework/ai/sessions/2026/10/22/${SLUG}/`;
const read = f => fs.existsSync(f) ? fs.readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };

ok(Ask.skip("") === "empty" && Ask.skip("/clear") === "slash command" && Ask.skip("<task-notification>x</task-notification>") === "harness turn" && Ask.skip("<agent-message>hi") === "harness turn" && Ask.skip("build it") === null, "skips empty, slash commands and harness turns; passes the owner's words");
ok(Ask.delta("my key sk-ant-abcdefghijklmnopqrstuv", "vscode").ask.text === Ask.WITHHELD && Ask.delta("token: abcdefghijklmnop1234", "voice").ask.redacted === true && Ask.delta("plain", "voice").ask.redacted === undefined, "a secret is withheld and flagged; plain words are stored as they are");

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(REC, JSON.stringify({ session: { id: "00000000-0000-4000-8000-0000000000aa", kind: "vscode-tab", at: "2026-10-22T20:00:00Z" } }) + "\n");
try {
	const page_set = page_tools().find(t => t.name === "page_set").handler;
	const send = (url, delta) => page_set({ path: url, delta }, { caller: "owner" });

	// one writer per channel: each leaves one ask line, tagged with its own via
	for (const via of ["vscode", "voice", "sdk", "phone"]){
		const before = read(REC).filter(l => l.ask).length;
		const out = await Ask.write(URL, `words from ${via}`, via, send);
		ok(out.ok && out.id && read(REC).filter(l => l.ask).length === before + 1, `${via}: one ask line written`);
	}
	const skipped = await Ask.write(URL, "/clear", "vscode", send);
	ok(skipped.skipped === "slash command" && read(REC).filter(l => l.ask).length === 4, "a slash command writes nothing");
	ok(!fs.existsSync(path.join(DIR, "page.jsonl")) || read(path.join(DIR, "page.jsonl")).every(l => !l.ask), "the ask lines are on the session record, not a page");

	// the readers: replaying the record gives one open Prompt task per ask, counted in the score and the tally
	const lines = read(REC), s = Session.replay(lines);
	const tasks = [...s.tasks];
	ok(tasks.length === 4 && tasks.every(t => t.wire() === "Prompt" && t.state !== "complete") && tasks.map(t => t.get_one("via")).join() === "vscode,voice,sdk,phone", "replay: four open Prompt tasks with their via");
	ok(lines.filter(l => l.ask).every(l => l.by === "owner" && l.ts) && s.tally().open === 4 && s.completion_score() === 0, "the score and tally count them open");
	s.replay_line({ [tasks[0].id]: { no_action: "a remark" } });
	ok(s.completion_score() === 0.25, "no_action settles one");
	console.log(`${n} passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
