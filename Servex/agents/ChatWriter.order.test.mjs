/* node Servex/agents/ChatWriter.order.test.mjs — ask 5 (never split the owner's bubble): a message another writer put in the chat list
 * (the item tool adds a card, a Ref, a note) is below the open Prompt, so the owner's next sentence starts a NEW Prompt under it
 * instead of growing the one above it. Before: ChatWriter only knew the messages IT wrote (`st.last`), so the words landed above the card. */
import assert from "node:assert/strict";
import ChatWriter from "./ChatWriter.js";
import Session from "../../public/framework/core/Session/Session.js";

let n = 0;
const check = (name, fn) => { fn(); n++; console.log("PASS —", name); };
const file = [];                                   // the session file, as the item tool and ChatWriter both append to it
const w = new ChatWriter({ last_id: () => ChatWriter.last_message_id(file.map(l => JSON.stringify(l)).join("\n")) });
const owner = (at, text) => { const l = w.mirror("k", { at, from: { kind: "owner" }, text, via: "voice" })[0]; file.push(l); return l; };

const a = owner("2026-11-03T10:00:00.000-06:00", "The tab bar is broken.");
const id = a.messages.add.id;
const b = owner("2026-11-03T10:00:01.000-06:00", "On my phone.");
check("with nothing in between, the next sentence grows the open Prompt", () => assert.deepEqual(b.messages[id].sentences, { push: b.sentences.add.id }));

file.push({ messages: { add: { id: "m-card", icon: "task", title: "Call the vet", by: "smart" } } });   // the item tool, not ChatWriter
const c = owner("2026-11-03T10:00:02.000-06:00", "And it flickers.");
check("a card the item tool added below it closes the open Prompt: new Prompt", () => assert.equal(c.messages.add?.type, "Prompt"));
check("...and the replay reads: Prompt, card, Prompt", () => {
	const list = Session.replay(file).messages.messages;
	assert.deepEqual(list.map(m => m.id), [id, "m-card", c.messages.add.id]);
	assert.equal(list[0].sentences.length, 2);
});
const d = owner("2026-11-03T10:00:03.000-06:00", "Still on the phone.");
check("the new Prompt is now the last message: it grows again", () => assert.deepEqual(d.messages[c.messages.add.id].sentences, { push: d.sentences.add.id }));

check("last_message_id reads the newest add, and answers null for a file with none", () => {
	assert.equal(ChatWriter.last_message_id('{"messages":{"add":{"id":"m-1"}}}\n{"messages":{"m-1":{"title":"x"}}}\n{"chat":{}}'), "m-1");
	assert.equal(ChatWriter.last_message_id('{"chat":{}}'), null);
});
console.log(`${n} passed`);
