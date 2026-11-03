/* node Servex/agents/ChatWriter.move.test.mjs — a re-placed sentence reaches the chat list as ONE List.move line (never a delete+add),
 * and an improve still patches in place. Replays lines of a real voice session (ext/Chat/v3/fixture/move-session.jsonl, a copy of
 * the first 60 lines of ai/sessions/2026/11/03/v-z0jonhy/session.jsonl: lines 14/15, 35/36, 56/57 are its Reply pairs). */
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import ChatWriter from "./ChatWriter.js";
import Session from "../../public/framework/core/Session/Session.js";

let n = 0;
const check = (name, fn) => { fn(); n++; console.log("PASS —", name); };
const lines = fs.readFileSync(fileURLToPath(new URL("../../public/framework/ext/Chat/v3/fixture/move-session.jsonl", import.meta.url)), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const replay = extra => Session.replay([...lines, ...extra]);

const base = replay([]), list = base.messages.messages, ids = list.map(m => m.id);
const first = list[0];
const first_at = [...base._sentences].find(s => first.sentences.includes(s.id)).at;
const add = (n, at) => ({ sentences: { add: { id: "s-t" + n, at, text: "Topic " + n, via: "voice" } }, messages: { add: { type: "Prompt", id: "m-t" + n, by: "owner", at, sentences: ["s-t" + n] } } });
const P2 = add(2, "2026-11-03T13:00:02.000-06:00"), P3 = add(3, "2026-11-03T13:00:03.000-06:00");
const grown = replay([P2, P3]), up = { re: "2026-11-03T13:00:02.000-06:00", to: "card", where: "up", edit: "nothing" };
const mv = ChatWriter.move_line(grown, up);
check("a new-topic placement writes ONE move line on messages, for the Prompt holding the sentence", () => {
	assert.deepEqual(Object.keys(mv), ["messages"]);
	assert.deepEqual(mv.messages, { move: { id: "m-t2", after: "m-t3" } });
});
check("a placement that moves nothing writes nothing (same, beside, no match, already last)", () => {
	assert.equal(ChatWriter.move_line(grown, { ...up, to: "same" }), null);
	assert.equal(ChatWriter.move_line(grown, { ...up, where: "beside" }), null);
	assert.equal(ChatWriter.move_line(grown, { ...up, re: "2026-01-01T00:00:00.000-06:00" }), null);
	assert.equal(ChatWriter.move_line(grown, { ...up, re: "2026-11-03T13:00:03.000-06:00" }), null);
});
check("a Prompt that holds other sentences is never moved", () => {
	const two = replay([P2, P3, { messages: { "m-t2": { sentences: { push: "s-extra" } } } }, { sentences: { add: { id: "s-extra", at: "2026-11-03T13:00:02.500-06:00", text: "More", via: "voice" } } }]);
	assert.equal(ChatWriter.move_line(two, up), null);
});
check("a Prompt with a Reply already after it is never moved (the list would go [P,R] to [R,P])", () => {
	const answered = replay([P2, { messages: { add: { id: "m-r2", type: "Reply", by: "smart", at: "2026-11-03T13:00:02.900-06:00", text: "Answer", re: { to: "s-t2" } } } }, P3]);
	assert.equal(ChatWriter.move_line(answered, up), null);
	assert.equal(ChatWriter.move_line(base, { re: first_at, to: "card", where: "up" }), null, "the fixture's first prompt has replies after it");
});
check("replayed, the move reorders the SAME message: one copy, new last place, text untouched", () => {
	const after = replay([P2, P3, mv]).messages.messages, was = grown.messages.messages.find(m => m.id === "m-t2");
	assert.equal(after.length, grown.messages.messages.length);
	assert.equal(after.filter(m => m.id === "m-t2").length, 1);
	assert.equal(after.at(-1).id, "m-t2");
	assert.equal(after.at(-1).raw, was.raw);
});
check("an improve still patches the Prompt in place (no move line, same position)", () => {
	const clean = ChatWriter.place(base, { re: first_at, to: "same", edit: "improve", text: "Can you hear me, please?" });
	assert.equal(ChatWriter.move_line(base, { re: first_at, to: "same", edit: "improve", text: "x" }), null);
	const after = replay([clean]).messages.messages;
	assert.deepEqual(after.map(m => m.id), ids);
});
console.log(`${n} checks passed`);
