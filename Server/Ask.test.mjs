// The one ask writer: each channel leaves the owner's turn as a v:2 {refined:{re,sentences}} line on its session record. `node Server/Ask.test.mjs`.
// The records live in a scratch public/ tree under os.tmpdir() (SERVEX_PUBLIC); nothing is posted to a real log.
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PUB = fs.mkdtempSync(path.join(os.tmpdir(), "ask-test-"));
process.env.SERVEX_PUBLIC = PUB;
const { default: Ask } = await import("./Ask.mjs");
const { page_tools } = await import("../Servex/agents/page_tools.js");
const { default: Session } = await import("../public/framework/core/Session/Session.js");

const DAY = "framework/ai/sessions/2026/10/22/", DIR = path.join(PUB, DAY, "ask-1"), REC = path.join(DIR, "session.jsonl"), URL = `/${DAY}ask-1/`;
const read = f => fs.existsSync(f) ? fs.readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };

ok(Ask.skip("") === "empty" && Ask.skip("/clear") === "slash command" && Ask.skip("<task-notification>x</task-notification>") === "harness turn" && Ask.skip("<agent-message>hi") === "harness turn" && Ask.skip("build it") === null, "skips empty, slash commands and harness turns; passes the owner's words");
const secret = Ask.lines("my key sk-ant-abcdefghijklmnopqrstuv", "vscode", "2026-11-06T10:00:00Z").at(-1).refined;
ok(secret.redacted === true && !JSON.stringify(secret).includes("sk-ant-"), "a secret is withheld and flagged");
const r = Ask.lines("Make it blue. Then add a border.", "vscode", "2026-11-06T10:00:00Z").at(-1).refined;
ok(r.by === "code" && r.v === 2 && r.re === "2026-11-06T10:00:00Z" && r.sections.length === 0 && r.sentences.length === 2 && r.sentences[0].n === 1 && r.redacted === undefined, "the refined line: v:2, sentences numbered from 1 by code, no sections yet");
ok(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}[-+]\d\d:\d\d$/.test(Ask.now()) && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}[-+]\d\d:\d\d$/.test(r.at), "`at` is local time with ms and offset, on every channel");
ok(Ask.lines("/clear", "vscode", "x") === null && Ask.write("/clear", "vscode", "x", () => { throw new Error("must not write"); }).skipped === "slash command", "a skipped text never reaches the channel's door");

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(REC, JSON.stringify({ session: { id: "00000000-0000-4000-8000-0000000000aa", kind: "vscode-tab", at: "2026-10-22T20:00:00Z" } }) + "\n");
try {
	const page_set = page_tools().find(t => t.name === "page_set").handler;
	const door = delta => page_set({ path: URL, delta }, { caller: "owner" });

	// VS Code (the hook's call): the counted Prompt plus the refined line, through the real item tool
	const T_HOOK = "2026-10-22T20:01:00.000-05:00", T_VOICE = "2026-10-22T20:02:00.000-05:00";
	const hook = await Ask.write("Make it blue. Then add a border.", "vscode", T_HOOK, door, { turn: true });
	ok(hook.ok && hook.id === Session.turn_id(T_HOOK), "vscode: written; the turn id is Session.turn_id(re)");
	// Claude-app voice and SDK/phone sheet: a refined line only (the owner_words / chat line is the turn elsewhere); a SYNC door, as RemoteMCP and Sessions use
	const voice = Ask.write("Please rename the page.", "voice", T_VOICE, line => { fs.appendFileSync(REC, JSON.stringify({ ...line, by: "owner" }) + "\n"); });
	ok(voice.ok && voice.id === Session.turn_id(T_VOICE), "voice: a sync door works, and answers synchronously");
	// Echo: the AI refine's second line for the hook's turn, with its own sentences and sections
	const echo = await Ask.write("Make it blue. Then add a border.", "vscode", T_HOOK, door, { sentences: [{ n: 1, text: "Make it blue." }, { n: 2, text: "Add a border." }], sections: [{ id: "sec1", heading: "Look", items: [{ id: "sec1-i1", text: "Make it blue", cites: [1] }] }], by: "echo" });
	ok(echo.ok, "echo: the sections line is accepted");
	const refused = await Ask.write("x", "vscode", T_HOOK, async () => ({ ok: false, why: "no" }));
	ok(refused.ok === false && refused.why === "no", "a refusal from the door comes back as {ok:false, why}");

	const lines = read(REC);
	ok(lines.filter(l => l.refined?.sentences).length === 3 && lines.filter(l => l.refined).every(l => l.refined.v === 2) && lines.filter(l => l.refined).every(l => l.by === "owner"), "the refined lines are on the session record");
	ok(!fs.existsSync(path.join(DIR, "page.jsonl")), "nothing on a page.jsonl");

	// the reader: the hook's content Prompt IS its turn (the echo line files an item under it); the voice turn is one open Prompt task
	const s = Session.replay(lines);
	ok(s.tasks.length === 1 && s.tasks.find(hook.id) === undefined && s.tasks.find(voice.id) && s.content.find(hook.id).tasks.length === 1, "replay: one task for the voice turn; the hook turn is its content Prompt with the echo item under it (no second task)");
	ok(s.tally().open >= 1 && s.tally().prompts.unresolved === 1 && s.completion_score() < 1, "replay: both turns count until closed");
	s.replay_line({ [voice.id]: { no_action: "a remark" } });
	ok(s.tasks.find(voice.id).completion_score() === 1, "no_action with a why settles a turn");
	console.log(`${n} passed`);
} finally {
	fs.rmSync(PUB, { recursive: true, force: true });
}
