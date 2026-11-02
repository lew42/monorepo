// node public/framework/core/Session/Chat/Chat.test.mjs — one Session's chat: sentences and messages, added, grown, edited, replayed.
import assert from "node:assert/strict";
import Session from "../Session.js";
import Prompt from "./Prompt.js";
import Reply from "./Reply.js";
import Message from "./Message.js";
import TaskPrompt from "../../Task/Prompt.js";

const lines = [
	{ session: { id: "v-t", kind: "voice", at: "2026-11-01T18:00:00.000-06:00" } },
	{ chat: { at: "a1", from: { kind: "owner" }, text: "Fix the tab bar." } },   // V1's line: never part of the list
	{ sentences: { add: { id: "s-1", at: "a1", text: "Fix the tab bar.", via: "voice" } }, messages: { add: { type: "Prompt", id: "m-1", by: "owner", at: "a1", sentences: ["s-1"], prompt: "p-1" } } },
	{ tasks: { add: { type: "Prompt", id: "p-1", raw: ["Fix the tab bar."] } } },
	{ sentences: { add: { id: "s-2", at: "a2", text: "On my phone.", via: "voice" } }, messages: { "m-1": { sentences: { push: "s-2" } } } },
	{ messages: { add: { type: "Reply", id: "m-2", by: "smart", at: "a3", text: "On it.", re: { to: "s-2" } } } },
	{ messages: { add: { id: "m-3", by: "system", at: "a4", text: "Servex restarted." } } },
	{ messages: { "m-1": { title: "Fix the mobile tab bar", text: "The tab bar is broken on the phone." } } },
];
const s = Session.replay(lines), chat = s.messages.messages;
assert.deepEqual(chat.map(m => m.constructor), [Prompt, Reply, Message], "one class per type, in the list's order");
assert.equal(chat[0].said, "Fix the tab bar. On my phone.", "a Prompt holds its sentences by id and grows");
assert.equal(chat[0].state, "refined", "a title and text refine it in place");
assert.ok(s.tasks.find("p-1") instanceof TaskPrompt, "\"Prompt\" in tasks is still the Prompt task");
assert.equal(chat[1].re.to, "s-2", "a Reply anchors to a sentence");
const back = Session.hydrate(JSON.parse(JSON.stringify(s.toJSON()))).messages.messages;
assert.deepEqual(back.map(m => m.constructor), [Prompt, Reply, Message], "a snapshot builds the same classes");
let heard = null;
s.on("delta", (line, from) => { if (from instanceof Message) heard = from; });
s.replay_line({ sentences: { add: { id: "s-3", text: "Today.", via: "text" } }, messages: { "m-1": { sentences: { push: "s-3" } } } });
assert.equal(heard, chat[0], "a view hears which message changed");
console.log("PASS Chat: sentences and messages added, grown, refined, replayed, snapshotted, heard (7 checks)");
