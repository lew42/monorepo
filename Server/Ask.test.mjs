// The one ask writer: each channel leaves the owner's turn as {refined:{re,sentences}} on the right session record. `node Server/Ask.test.mjs`.
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
const secret = Ask.refined("my key sk-ant-abcdefghijklmnopqrstuv", "vscode", "2026-11-06T10:00:00Z");
ok(secret.refined.redacted === true && !JSON.stringify(secret).includes("sk-ant-") && Ask.refined("plain words here", "voice", "x").refined.redacted === undefined, "a secret is withheld and flagged; plain words are not");
const r = Ask.refined("Make it blue. Then add a border.", "vscode", "2026-11-06T10:00:00Z").refined;
ok(r.by === "code" && r.re === "2026-11-06T10:00:00Z" && r.sections.length === 0 && r.sentences.length === 2 && r.sentences[0].n === 1 && r.sentences[1].n === 2, "the refined line: sentences numbered from 1 by code, no sections yet");
ok(Ask.turn_id("a") === Ask.turn_id("a") && Ask.turn_id("a") !== Ask.turn_id("b"), "turn ids are stable");

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(REC, JSON.stringify({ session: { id: "00000000-0000-4000-8000-0000000000aa", kind: "vscode-tab", at: "2026-10-22T20:00:00Z" } }) + "\n");
try {
	const page_set = page_tools().find(t => t.name === "page_set").handler;
	const send = (url, delta) => page_set({ path: url, delta }, { caller: "owner" });

	// hook-style (VS Code has no chat line): the counted Prompt plus the refined line
	const hook = await Ask.write(URL, "Make it blue. Then add a border.", "vscode", send, { turn: true, re: "2026-10-22T20:01:00Z" });
	ok(hook.ok && hook.id === Ask.turn_id("2026-10-22T20:01:00Z"), "vscode: written, the turn id comes from `re`");
	// voice-style: a refined line only (the chat/owner_words line is the turn elsewhere)
	const voice = await Ask.write(URL, "Please rename the page.", "voice", send, { re: "2026-10-22T20:02:00Z" });
	ok(voice.ok, "voice: written");
	const skipped = await Ask.write(URL, "/clear", "vscode", send, { turn: true });
	ok(skipped.skipped === "slash command", "a slash command writes nothing");

	const lines = read(REC);
	ok(lines.filter(l => l.refined?.sentences).length === 2 && lines.filter(l => l.refined).every(l => l.by === "owner" && l.ts), "the refined lines are on the session record, stamped by the item tool");
	ok(!fs.existsSync(path.join(DIR, "page.jsonl")) || read(path.join(DIR, "page.jsonl")).every(l => !l.refined), "nothing on a page.jsonl");

	// the reader: one open Prompt per turn, the hook's content Prompt IS its turn (no second task)
	const s = Session.replay(lines);
	ok(s.tally().open === 1 && [...s.tasks][0].id === voice.id && s.tally().prompts.unresolved === 1 && s.completion_score() < 1, "replay: the voice turn is one open Prompt task; the hook's content Prompt is its own counted turn (no second task)");
	s.replay_line({ [hook.id]: { no_action: "a remark" } });
	s.replay_line({ [voice.id]: { no_action: "a remark" } });
	ok(s.tally().prompts.unresolved === 0 && s.completion_score() === 1, "no_action settles a turn");
	console.log(`${n} passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
