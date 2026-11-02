// node public/framework/core/Session/Chat/Chat.test.mjs — one Session's chat: sentences and messages, added, grown, edited, replayed.
import assert from "node:assert/strict";
import Session from "../Session.js";
import Prompt from "./Prompt.js";
import Reply from "./Reply.js";
import Message from "./Message.js";
import TaskPrompt from "../../Task/Prompt.js";
import Ref from "../../Item/Ref.js";

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
assert.equal(chat[0].raw, "Fix the tab bar. On my phone.", "a Prompt holds its sentences by id and grows");
assert.equal(chat[0].state, "refined", "a title and text refine it in place");
assert.ok(s.tasks.find("p-1") instanceof TaskPrompt, "\"Prompt\" in tasks is still the Prompt task");
assert.equal(chat[1].re.to, "s-2", "a Reply anchors to a sentence");
const back = Session.hydrate(JSON.parse(JSON.stringify(s.toJSON()))).messages.messages;
assert.deepEqual(back.map(m => m.constructor), [Prompt, Reply, Message], "a snapshot builds the same classes");
let heard = null;
s.on("delta", (line, from) => { if (from instanceof Message) heard = from; });
s.replay_line({ sentences: { add: { id: "s-3", text: "Today.", via: "text" } }, messages: { "m-1": { sentences: { push: "s-3" } } } });
assert.equal(heard, chat[0], "a view hears which message changed");

// A Ref in session.messages (step 2): a Servex-written line (by, at as data) hydrates as the real core Ref, not a plain Item.
s.replay_line({ messages: { add: { type: "Ref", id: "m-4", path: "tasks.p-1", by: "servex", at: "a5" } } });
const ref_member = s.messages.find("m-4");
assert.ok(ref_member instanceof Ref, "a {type:\"Ref\"} message hydrates as the core Ref");
assert.equal(ref_member.path, "tasks.p-1", "its path is kept");
assert.equal(ref_member.get_one("by"), "servex", "by rides along as data");
assert.equal(ref_member.get_one("at"), "a5", "at rides along as data");

// Resurface (the owner, 2026-11-01): a Ref to the message lands at the bottom; the original stays put, marked.
const before_length = s.messages.length;
const resurfaced_ref = s.messages.resurface(chat[0]);
assert.ok(resurfaced_ref instanceof Ref, "resurface() answers the new Ref");
assert.equal(s.messages.length, before_length + 1, "resurface() adds exactly one member, at the bottom");
assert.equal(s.messages.last, resurfaced_ref, "the Ref lands last");
assert.equal(resurfaced_ref.path, "messages.m-1", "the Ref names the original's own path");
assert.equal(chat[0].get_one("resurfaced"), resurfaced_ref.id, "the original is marked with the new Ref's id");
assert.equal(s.messages.find("m-1"), chat[0], "and the original never moved — it is still m-1, in its own place");

// Prompt as a card (chat-model step 6, plan.md decision 4): kind, items, and the sent/working marks on the message itself.
assert.equal(chat[0].kind, null, "a plain dictation has no kind");
chat[0].set({ kind: "task", title: "Fix the mobile tab bar" });
assert.equal(chat[0].kind, "task", "kind is set like any other data field");
chat[0].set({ items: { add: { title: "Call the owner", sentences: ["s-1"] } } });
assert.equal(chat[0].items.length, 1, "items is a List, made on first use");
const item = chat[0].items.items[0];
assert.equal(item.constructor.name, "PromptItem", "an untyped item hydrates as PromptItem");
assert.deepEqual(item.sentences, ["s-1"]);
item.set({ sentences: { push: "s-2" } });
assert.deepEqual(item.sentences, ["s-1", "s-2"], "an item's own sentences grow the same way a Prompt's do");
chat[0].set({ items: { add: { type: "Ref", path: "tasks.p-1" } } });
assert.ok(chat[0].items.items[1] instanceof Ref, "an item can be a Ref instead, to something filed elsewhere");
assert.equal(chat[0].sent.fast, undefined, "sent starts empty");
chat[0].set({ sent: { fast: { at: "a1" } } });
chat[0].set({ sent: { smart: { at: "a2" } } });
assert.deepEqual(chat[0].sent, { fast: { at: "a1" }, smart: { at: "a2" } }, "fast and smart merge; neither mark overwrites the other");
assert.equal(chat[0].working, null, "no one is writing yet");
chat[0].set({ working: { by: "smart", at: "a3" } });
assert.deepEqual(chat[0].working, { by: "smart", at: "a3" });
chat[0].set({ working: null });
assert.equal(chat[0].working, null, "{working: null} clears it, same as the Prompt TASK's own field");

console.log("PASS Chat: sentences and messages added, grown, refined, replayed, snapshotted, heard, Ref member, resurfaced, Prompt-as-a-card (24 checks)");
