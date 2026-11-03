/* node Servex/agents/ChatWriter.move.test.mjs — a re-placed sentence reaches the chat list as ONE List.move line (never a delete+add),
 * and an improve still patches in place. Replays lines of a real voice session (ext/Chat/v3/fixture/move-session.jsonl, a copy of
 * the first 60 lines of ai/sessions/2026/11/03/v-z0jonhy/session.jsonl: lines 14/15, 35/36, 56/57 are its Reply pairs). */
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import ChatWriter from "./ChatWriter.js";
import Session from "../../public/framework/core/Session/Session.js";
import { moved_id } from "../../public/framework/ext/Chat/v3/placement.js";

let n = 0;
const check = (name, fn) => { fn(); n++; console.log("PASS —", name); };
const lines = fs.readFileSync(fileURLToPath(new URL("../../public/framework/ext/Chat/v3/fixture/move-session.jsonl", import.meta.url)), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const replay = extra => Session.replay([...lines, ...extra]);

const base = replay([]), list = base.messages.messages, ids = list.map(m => m.id);
const first = list[0], last = list.at(-1);
const first_at = [...base._sentences].find(s => first.sentences.includes(s.id)).at;

const up = { re: first_at, to: "card", where: "up", edit: "nothing" };
const mv = ChatWriter.move_line(base, up);
check("a new-topic placement writes ONE move line on messages, for the Prompt holding the sentence", () => {
	assert.deepEqual(Object.keys(mv), ["messages", ...Object.keys(mv).filter(k => k !== "messages")]);
	assert.deepEqual(mv.messages, { move: { id: first.id, after: last.id } });
	assert.equal(JSON.stringify(mv).includes("remove"), false, "no delete");
});
check("a placement that moves nothing writes nothing (same, beside, no match, already last)", () => {
	assert.equal(ChatWriter.move_line(base, { re: first_at, to: "same", edit: "nothing" }), null);
	assert.equal(ChatWriter.move_line(base, { re: first_at, to: "card", where: "beside" }), null);
	assert.equal(ChatWriter.move_line(base, { re: "2026-01-01T00:00:00.000-06:00", to: "card", where: "up" }), null);
	const again = replay([mv]), a2 = [...again._sentences].find(s => again.messages.messages.at(-1).sentences?.includes?.(s.id));
	assert.equal(ChatWriter.move_line(again, { re: a2.at, to: "card", where: "up" }), null);
});
check("replayed, the move reorders the SAME message: one copy, new last place, text untouched", () => {
	const after = replay([mv]).messages.messages;
	assert.equal(after.length, list.length);
	assert.equal(after.filter(m => m.id === first.id).length, 1);
	assert.equal(after.at(-1).id, first.id);
	assert.equal(after.at(-1).raw, first.raw);
});
check("the view reads a move delta's id (placement.moved_id); an add or a clean is not a move", () => {
	assert.equal(moved_id({ move: { id: "m-1", after: "m-2" } }), "m-1");
	assert.equal(moved_id({ add: { id: "m-1" } }), null);
	assert.equal(moved_id(null), null);
});
check("an improve still patches the Prompt in place (no move line, same position)", () => {
	const clean = ChatWriter.place(base, { re: first_at, to: "same", edit: "improve", text: "Can you hear me, please?" });
	assert.equal(ChatWriter.move_line(base, { re: first_at, to: "same", edit: "improve", text: "x" }), null);
	const after = replay([clean]).messages.messages;
	assert.deepEqual(after.map(m => m.id), ids);
});
console.log(`${n} checks passed`);
