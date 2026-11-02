/* node Servex/agents/chat-messages.test.mjs — the one real chat list (public/framework/core/Session/Chat/readme.md), written by the
 * real Sessions.js beside V1's {chat} lines, against a scratch repo and a fake agent host (no Claude session is started).
 * A mixed session: spoken sentences with the floor, a smart reply that lands mid-thought, a refined line, a typed line, a Servex
 * note. Then the file is replayed (twice, and through a snapshot) and checked: the same list, in the same order, with no twins. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Sessions from "./Sessions.js";
import Session from "../../public/framework/core/Session/Session.js";
import Prompt from "../../public/framework/core/Session/Chat/Prompt.js";
import Reply from "../../public/framework/core/Session/Chat/Reply.js";
import TaskPrompt from "../../public/framework/core/Task/Prompt.js";
import { run_item } from "./page_tools.js";

let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log("PASS —", name); };
const tick = () => new Promise(r => setImmediate(r));

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "chat-messages-test-"));
fs.mkdirSync(path.join(repo, "public/a"), { recursive: true });
const agents = {
	live: new Map(),
	spawn(spec){ const id = spec.id ?? `${spec.role}-${spec.name}`, a = { id, state: "working", session_id: null }; this.live.set(id, a); return a; },
	send(){}, stop(id){ this.live.get(id).state = "stopped"; },
};
const S = new Sessions({ repo, file: path.join(repo, "sessions.json"), assistant: "off", answer_quiet_ms: 2500 });
S.load();
S.servex = { agents };
const made = S.create({ path: "/a/" }), id = made.session, s = S.map[id];
const file = path.join(repo, "public", made.file.replace(/^\//, ""));
const read = () => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));

// ── the session, as it happens ───────────────────────────────────────────────────────────
S.say({ session: id, path: "/a/", text: "The tab bar is broken.", via: "voice", floor: "speaking" });   // mid-thought
await tick();                                                                                           // the smart seat spawns
const smart = s.smart;
const a1 = read().filter(l => l.chat?.from?.kind === "owner").at(-1).chat.at;
s.smart_re = a1;
S.heard({ type: "result", text: "Which phone?" }, { id: smart });                                         // lands mid-thought: held
const held_while_talking = read().filter(l => l.messages?.add?.type === "Reply").length;
S.say({ session: id, path: "/a/", text: "On my phone.", via: "voice", floor: "speaking" });             // grows the same Prompt
S.quiet({ session: id, ms: 3000 });                                                                    // the thought ends: the reply goes below it
S.floor({ session: id, floor: "done" });
S.say({ session: id, path: "/a/", text: "An iPhone.", via: "voice", floor: "done", quiet_ms: 3000 });    // after a reply: a new Prompt below it
const a3 = read().filter(l => l.chat?.from?.kind === "owner").at(-1).chat.at;
S.line({ session: id, text: "You said: an iPhone.", re: a3, level: "clean" });                         // a refined line
S.say({ session: id, path: "/a/", text: "Fix it today, please.", via: "text" });                        // typed
S.write(s, { chat: { at: "2026-11-01T19:00:00.000-06:00", session: id, path: "/a/", from: { kind: "system", id: "servex" }, via: "text", text: "The smart assistant could not be reached." } });

const lines = read();
const v1 = lines.filter(l => l.chat);
const owner_v1 = v1.filter(l => l.chat.from?.kind === "owner"), other_v1 = v1.filter(l => l.chat.from?.kind !== "owner");
const session = Session.replay(lines), chat = session.messages.messages;

check("V1's {chat} lines are all still written, unchanged in shape (4 owner, 3 others)", () => {
	assert.equal(owner_v1.length, 4);
	assert.equal(other_v1.length, 3);
	for (const l of v1) assert.ok(l.chat.at && l.chat.from && l.chat.text, "a V1 line keeps at, from, text");
});
check("no new line has a `chat` key, so no V1 reader sees it", () => {
	for (const l of lines.filter(l => l.messages || l.sentences)) assert.equal("chat" in l, false);
});
check("two counts that must agree: owner {chat} lines = sentences; other {chat} lines = replies + notes", () => {
	assert.equal([...session.sentences].length, owner_v1.length);
	assert.equal(chat.filter(m => !(m instanceof Prompt)).length, other_v1.length);
});
check("a reply that lands mid-thought waits, then goes below the thought", () => {
	assert.equal(held_while_talking, 0);
	assert.deepEqual(chat.map(m => m.constructor.name), ["Prompt", "Reply", "Prompt", "Reply", "Prompt", "Message"]);
});
check("the owner's words: one Prompt grown while talking; after a reply, the next words start a new Prompt below it", () => {
	assert.equal(chat[0].said, "The tab bar is broken. On my phone.");
	assert.equal(chat[2].said, "An iPhone.");
	assert.equal(chat[4].said, "Fix it today, please.");
	assert.equal(chat[0].by, "owner");
	assert.ok(chat[0].prompt && session.tasks.find(chat[0].prompt) instanceof TaskPrompt, "the chat Prompt links today's Prompt task");
});
check("each reply anchors to the sentence it answers", () => {
	const [first, , , refined] = chat;
	assert.ok(chat[1] instanceof Reply && chat[1].by === "smart" && chat[1].text === "Which phone?");
	assert.equal(chat[1].re.to, first.sentences[0]);
	assert.equal(refined.level, "clean");
	assert.equal(refined.re.to, chat[2].sentences[0]);
	assert.equal(chat[5].by, "system");
});
check("a replay is the same list, in the same order, with no twins", () => {
	const again = Session.replay(read()).messages.messages;
	assert.deepEqual(again.map(m => JSON.stringify(m)), chat.map(m => JSON.stringify(m)));
	assert.equal(new Set(chat.map(m => m.id)).size, chat.length);
	const sids = [...session.sentences].map(x => x.id);
	assert.equal(new Set(sids).size, sids.length);
	assert.deepEqual(chat.flatMap(m => m.sentences ?? []), sids, "every sentence is in exactly one Prompt, in order");
});
check("a snapshot round trip builds the same classes (the chat's own Prompt, not the Prompt task)", () => {
	const back = Session.hydrate(JSON.parse(JSON.stringify(session.toJSON())));
	assert.deepEqual(back.messages.messages.map(m => m.constructor), chat.map(m => m.constructor));
	assert.equal(back.messages.messages[0].said, chat[0].said);
});
check("after a restart (empty writer memory) a reply still finds its sentence in the file", () => {
	S._chat_writer = null;
	S.line({ session: id, text: "Fixed.", re: a3 });
	const last = Session.replay(read()).messages.last;
	assert.equal(last.re.to, chat[2].sentences[0]);
});

// The demo page's file (public/framework/ext/Chat/list/fixture/): `CHAT_FIXTURE=<path> node chat-messages.test.mjs` copies this session there.
if (process.env.CHAT_FIXTURE) fs.copyFileSync(file, process.env.CHAT_FIXTURE);

// ── the item tool: an agent adds to the list and edits a message in place ────────────────
const REL = "public/framework/ai/sessions/2026/10/16/.chat-messages-test-" + process.pid;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "session.jsonl"), URL_ = "/" + REL.slice("public/".length) + "/";
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, fs.readFileSync(file, "utf8"));
try {
	let r = await run_item({ path: URL_, delta: { messages: { add: { type: "Reply", by: "smart", text: "Added by an agent.", re: { to: chat[0].sentences[0] } } } } }, { caller: "t" });
	check("the item tool adds a Reply to the list", () => assert.ok(r.ok && r.ids?.length === 1, r.why));
	r = await run_item({ path: URL_, delta: { messages: { [chat[2].id]: { title: "Which phone", text: "An iPhone." } } } }, { caller: "t" });
	const back = Session.replay(fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l))).messages;
	check("…and edits a message in place: its text changes, its position does not", () => {
		assert.ok(r.ok, r.why);
		assert.equal(back.messages[2].title, "Which phone");
		assert.equal(back.messages[2].state, "refined");
		assert.equal(back.messages.at(-1).text, "Added by an agent.");
	});
	r = await run_item({ path: URL_ }, { caller: "t" });
	check("a read of the session answers the chat: its count and the last messages", () => assert.equal(r.state.messages.count, back.length));

	// The fast seat's {place} lines (ux/Dictate/doc/voice-assistant.md): an improve updates the sentence's text in place.
	const owner_ats = owner_v1.map(l => l.chat.at), replay = () => Session.replay(fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l))).messages.messages;
	const before = replay();
	await run_item({ path: URL_, delta: { place: { re: owner_ats[1], to: "same", edit: "improve", text: "On my phone (an iPhone)." } } }, { caller: "voice-assistant-t" });
	await run_item({ path: URL_, delta: { place: { re: owner_ats[0], to: "same", edit: "both", text: "The tab bar is broken!" } } }, { caller: "voice-assistant-t" });
	await run_item({ path: URL_, delta: { place: { re: owner_ats[2], to: "card", where: "beside", edit: "nothing" } } }, { caller: "voice-assistant-t" });
	const after = replay(), raw = fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
	check("a {place} improve updates the sentence's text in its Prompt, in place: same position, raw words kept, V1's {place} line still written", () => {
		assert.deepEqual(after.map(m => m.id), before.map(m => m.id), "no message moved, none added");
		assert.equal(after[0].cleaned, "The tab bar is broken! On my phone (an iPhone).", "two improves on two sentences merge");
		assert.equal(after[0].said, "The tab bar is broken. On my phone.", "the raw words stay");
		assert.equal(raw.filter(l => l.place).length, 3, "every {place} line is written as before");
		assert.equal(raw.filter(l => l.messages && Object.values(l.messages).some(v => v?.clean)).length, 2, "an edit with no text (\"nothing\") adds no chat line");
	});
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

console.log(`chat-messages.test.mjs: ${checks} checks passed`);
fs.rmSync(repo, { recursive: true, force: true });
process.exit(0);
