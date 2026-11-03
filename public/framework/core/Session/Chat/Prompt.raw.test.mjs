// node public/framework/core/Session/Chat/Prompt.raw.test.mjs — Prompt.raw against a real voice session (builder.md step 5). The
// fixture is a READ-ONLY excerpt of public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl (the session's header line,
// plus every `sentences`/`messages` line and every owner `{chat}` line whose `at` a mirrored sentence carries — 131 of the real
// file's 1,737 lines; most of it was written before chat-model step 1 landed and was never mirrored, so it carries nothing this
// test reads). Every Sentence it replays must carry `at`, matching exactly one owner `{chat}` line; every Prompt's `raw` must
// equal the V1 owner `{chat}` texts its own sentences were made from, joined the same way (one space, untrimmed).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Session from "../Session.js";
import Prompt from "./Prompt.js";

const fixture = fileURLToPath(new URL("./fixture/v-u48msei-session.jsonl", import.meta.url));
const lines = readFileSync(fixture, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));

// What V1 wrote: the owner's own {chat} lines, by `at` -> text (what ChatWriter.owner() reads as `chat.text` to make a Sentence).
const owner_chat_by_at = new Map(lines.filter(l => l?.chat?.from?.kind === "owner").map(l => [l.chat.at, l.chat.text]));

const session = Session.replay(lines);
const prompts = session.messages.messages.filter(m => m instanceof Prompt);

let checked_sentences = 0;
for (const p of prompts){
	for (const s of p.sentence_items){
		assert.ok(s.at, `Prompt ${p.id}: sentence ${s.id} must carry at (builder.md step 5)`);
		assert.ok(owner_chat_by_at.has(s.at), `Prompt ${p.id}: sentence ${s.id}'s at (${s.at}) must match exactly one owner {chat} line`);
	}
	const expected = p.sentence_items.map(s => owner_chat_by_at.get(s.at)).join(" ");
	assert.equal(p.raw, expected, `Prompt ${p.id}: raw must equal its sentences' owner {chat} texts, joined by one space`);
	checked_sentences += p.sentence_items.length;
}
console.log(`PASS — every sentence carries at and matches exactly one owner {chat} line; every Prompt's raw equals those texts joined the same way (${prompts.length} prompts, ${checked_sentences} sentences)`);

// Two numbers that must agree (builder.md step 5): the owner's {chat} lines dual-written as Sentences = the sentences held in Prompts.
const sentence_count = [...session.sentences].length;
assert.equal(checked_sentences, sentence_count, "every mirrored sentence is held by exactly one Prompt");
console.log(`PASS — two numbers agree: ${sentence_count} mirrored sentences, ${checked_sentences} sentences held across ${prompts.length} Prompts`);

console.log(`Prompt.raw.test.mjs: 2 checks passed (${sentence_count} sentences, ${prompts.length} prompts, ${owner_chat_by_at.size} owner {chat} lines in the fixture)`);
