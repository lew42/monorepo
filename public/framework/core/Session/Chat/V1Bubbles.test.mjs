// node public/framework/core/Session/Chat/V1Bubbles.test.mjs — the adapter that turns session.messages into V1's bubble list
// (builder.md step 8). Three checks: a simple merge, then a harder one exercising place()'s time-reordering and a fix's
// in-place text correction together (review finding 1/7, 2026-11-02 — a merge or ordering bug here would make v1 and adapter
// disagree, which the earlier version of this test could not catch), then a smoke check on the real fixture.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Session from "../Session.js";
import V1Bubbles from "./V1Bubbles.js";

// Two owner lines 1s apart merge into one bubble; a smart reply 2s later is its own (different sender); a last owner line
// 24s later starts a new bubble (past MERGE_GAP_MS=8000). Each {chat} line is mirrored, as the real writer does.
const simple_lines = [
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

const simple_session = Session.replay(simple_lines);
const simple_v1 = V1Bubbles.from_chat_lines(simple_lines);
const simple_adapter = V1Bubbles.from_session(simple_session);

assert.equal(simple_v1.length, 3, "V1 merges the two close owner lines, keeps the reply apart, and starts a new bubble past the gap");
assert.deepEqual(simple_v1.map(b => b.sender), ["owner", "smart", "owner"]);
assert.equal(simple_v1[0].pieces.map(p => p.text).join(" "), "Fix the tab bar. On my phone.", "the merged bubble's pieces join in order");
assert.deepEqual(simple_adapter.map(b => b.sender), simple_v1.map(b => b.sender), "the adapter reads the same three bubbles, same senders, from session.messages");
assert.deepEqual(simple_adapter.map(b => b.pieces.map(p => p.text).join(" ")), simple_v1.map(b => b.pieces.map(p => p.text).join(" ")), "same bubble text, V1 and the adapter agree");
console.log("PASS V1Bubbles: a controlled conversation gives the same 3 bubbles, same senders, same text, V1 and the adapter (3 checks)");

// A harder case: a reply arrives first in FILE order; a second owner sentence arrives LATER in the file but with an EARLIER
// `at` (Servex's said_at/at can disagree with write order) — place() must slot it between the first owner bubble and the
// reply, not append it after. A fix line then corrects the first owner sentence's text in place, no new bubble. Expected
// order after all four events: [owner "Fixed text.", owner "A late-arriving sentence.", smart "On it."].
const hard_lines = [
	{ session: { id: "v-h", kind: "voice", at: "2026-11-02T00:00:00.000Z" } },
	{ chat: { at: "2026-11-02T00:00:00.000Z", from: { kind: "owner" }, text: "Original text." } },
	{ sentences: { add: { id: "s-1", at: "2026-11-02T00:00:00.000Z", text: "Original text.", via: "voice" } }, messages: { add: { type: "Prompt", id: "m-1", by: "owner", at: "2026-11-02T00:00:00.000Z", sentences: ["s-1"] } } },
	{ chat: { at: "2026-11-02T00:00:20.000Z", from: { kind: "smart" }, text: "On it." } },
	{ messages: { add: { type: "Reply", id: "m-2", by: "smart", at: "2026-11-02T00:00:20.000Z", text: "On it.", re: { to: "s-1" } } } },
	{ chat: { at: "2026-11-02T00:00:05.000Z", from: { kind: "owner" }, text: "A late-arriving sentence." } },
	{ sentences: { add: { id: "s-3", at: "2026-11-02T00:00:05.000Z", text: "A late-arriving sentence.", via: "voice" } }, messages: { add: { type: "Prompt", id: "m-3", by: "owner", at: "2026-11-02T00:00:05.000Z", sentences: ["s-3"] } } },
	{ chat: { at: "2026-11-02T00:00:00.000Z", from: { kind: "owner" }, text: "Fixed text.", fix: true } },
	{ messages: { "m-1": { clean: { "s-1": "Fixed text." } } } },
];

const hard_session = Session.replay(hard_lines);
const hard_v1 = V1Bubbles.from_chat_lines(hard_lines);
const hard_adapter = V1Bubbles.from_session(hard_session);

const expected = [["owner", "Fixed text."], ["owner", "A late-arriving sentence."], ["smart", "On it."]];
assert.deepEqual(hard_v1.map(b => [b.sender, b.pieces.map(p => p.text).join(" ")]), expected, "place() slots the late-arriving, earlier-timed sentence between the two existing bubbles; the fix rewrites the first piece's text in place");
assert.deepEqual(hard_adapter.map(b => [b.sender, b.pieces.map(p => p.text).join(" ")]), expected, "the adapter, reading session.messages' Prompt.clean instead of a fix line, lands on the exact same three bubbles");
console.log("PASS V1Bubbles: a late-arriving, earlier-timed sentence and an in-place fix give V1 and the adapter the same ordered bubbles (2 checks)");

// The real fixture (read-only; builder.md step 8): the adapter must not throw on a real session, and every owner sentence it
// holds must land in exactly one bubble — true regardless of the fixture being a trimmed excerpt (core/Session/Chat/readme.md:
// only the tail written after chat-model step 1 landed was ever mirrored, so its {chat} lines and session.messages don't line
// up one-to-one — ChatV1Compare.mjs's job on a full real session, not this fixture).
const fixture = fileURLToPath(new URL("./fixture/v-u48msei-session.jsonl", import.meta.url));
const real_lines = readFileSync(fixture, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const real_session = Session.replay(real_lines);
const real_adapter = V1Bubbles.from_session(real_session);
const owner_bubbles = real_adapter.filter(b => b.sender === "owner");
const owner_pieces = owner_bubbles.reduce((n, b) => n + b.pieces.length, 0);
assert.equal(owner_pieces, real_session.sentences.length, "every mirrored sentence lands in exactly one owner bubble, merged or not");
console.log(`PASS V1Bubbles: the real fixture's ${real_session.sentences.length} sentences are all held across ${owner_bubbles.length} owner bubbles, no loss or duplication (1 check)`);

console.log("V1Bubbles.test.mjs: 6 checks passed");
