// node public/framework/core/Session/Chat/V1Bubbles.test.mjs — the adapter that turns session.messages into V1's bubble list
// (builder.md step 8). A controlled conversation proves the merge rule (same sender, under MERGE_GAP_MS, nothing else drawn
// between); the real fixture proves the adapter does not throw and never drops or duplicates a sentence.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Session from "../Session.js";
import V1Bubbles from "./V1Bubbles.js";

// Two owner lines 1s apart merge into one bubble; a smart reply 2s later is its own (different sender); a last owner line
// 24s later starts a new bubble (past MERGE_GAP_MS=8000). Each {chat} line is mirrored, as the real writer does.
const lines = [
	{ session: { id: "v-t", kind: "voice", at: "2026-11-02T00:00:00.000Z" } },
	{ chat: { at: "2026-11-02T00:00:00.000Z", from: { kind: "owner" }, text: "Fix the tab bar." } },
	{ sentences: { add: { id: "s-1", at: "2026-11-02T00:00:00.000Z", text: "Fix the tab bar.", via: "voice" } }, messages: { add: { type: "Prompt", id: "m-1", by: "owner", at: "2026-11-02T00:00:00.000Z", sentences: ["s-1"] } } },
	{ chat: { at: "2026-11-02T00:00:01.000Z", from: { kind: "owner" }, text: "On my phone." } },
	{ sentences: { add: { id: "s-2", at: "2026-11-02T00:00:01.000Z", text: "On my phone.", via: "voice" } }, messages: { "m-1": { sentences: { push: "s-2" } } } },
	{ chat: { at: "2026-11-02T00:00:03.000Z", from: { kind: "smart" }, text: "On it." } },
	{ messages: { add: { type: "Reply", id: "m-2", by: "smart", at: "2026-11-02T00:00:03.000Z", text: "On it.", re: { to: "s-2" } } } },
	{ chat: { at: "2026-11-02T00:00:25.000Z", from: { kind: "owner" }, text: "Thanks." } },
	{ sentences: { add: { id: "s-3", at: "2026-11-02T00:00:25.000Z", text: "Thanks.", via: "voice" } }, messages: { add: { type: "Prompt", id: "m-3", by: "owner", at: "2026-11-02T00:00:25.000Z", sentences: ["s-3"] } } },
];

const session = Session.replay(lines);
const v1 = V1Bubbles.from_chat_lines(lines);
const adapter = V1Bubbles.from_session(session);

assert.equal(v1.length, 3, "V1 merges the two close owner lines, keeps the reply apart, and starts a new bubble past the gap");
assert.deepEqual(v1.map(b => b.sender), ["owner", "smart", "owner"]);
assert.equal(v1[0].pieces.map(p => p.text).join(" "), "Fix the tab bar. On my phone.", "the merged bubble's pieces join in order");

assert.equal(adapter.length, 3, "the adapter reads the same three bubbles from session.messages");
assert.deepEqual(adapter.map(b => b.sender), v1.map(b => b.sender), "same senders, same order");
assert.deepEqual(adapter.map(b => b.pieces.map(p => p.text).join(" ")), v1.map(b => b.pieces.map(p => p.text).join(" ")), "same bubble text, V1 and the adapter agree (the two numbers builder.md step 8 asks for)");

console.log("PASS V1Bubbles: a controlled conversation gives the same 3 bubbles, same senders, same text, V1 and the adapter (3 checks)");

// The real fixture (read-only; builder.md step 8): the adapter must not throw on a real session, and every owner sentence it
// holds must land in exactly one bubble — true regardless of the fixture being a trimmed excerpt (core/Session/Chat/readme.md:
// only the tail written after chat-model step 1 landed was ever mirrored, so its {chat} lines and session.messages don't
// line up one-to-one — ChatV1Compare.mjs's job on a full real session, not this fixture).
const fixture = fileURLToPath(new URL("./fixture/v-u48msei-session.jsonl", import.meta.url));
const real_lines = readFileSync(fixture, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const real_session = Session.replay(real_lines);
const real_adapter = V1Bubbles.from_session(real_session);
const owner_bubbles = real_adapter.filter(b => b.sender === "owner");
const owner_pieces = owner_bubbles.reduce((n, b) => n + b.pieces.length, 0);
assert.equal(owner_pieces, real_session.sentences.length, "every mirrored sentence lands in exactly one owner bubble, merged or not");
console.log(`PASS V1Bubbles: the real fixture's ${real_session.sentences.length} sentences are all held across ${owner_bubbles.length} owner bubbles, no loss or duplication (1 check)`);

console.log("V1Bubbles.test.mjs: 4 checks passed");
