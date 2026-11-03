/* node Servex/agents/card-messages.test.mjs — ask3-cards-by-id (public/framework/ai/sessions/2026/11/03/session-e9c8d0d3/
 * mastermind-voice-system/ask3-cards-by-id/requirements.md): "item adds a card with an icon and a title, or a ref to an
 * existing item, plus any content. It returns the new card's id... It can upgrade one of the owner's messages into a card."
 *
 * Step 1: the owner asked a voice agent for a card and got it back titled "undefined". Reproduces the cause through the
 * REAL item path (run_item -> page_tools.js's session_state(), the same read an agent gets from `item({path})`) and proves
 * the fix: `messages.add` with `{icon, title}` (type omitted, or typed "Card" — the natural guess, now aliased to Message
 * in Message.TYPES, core/Session/Chat/Message.js) never answers the stringified word "undefined".
 *
 * Step 2: the add/append/rewrite/read-by-id cycle, through the one path the chat system already has (no second path
 * invented — a card IS a Message with icon/title/content set, Law 6).
 *
 * Step 3: upgrading an EXISTING message (one with neither icon nor title) into a card, by setting them in place — on a
 * scratch copy of a real recorded session, v-z0jonhy (the pattern single-brief.test.mjs uses for a real session replay). */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Session from "../../public/framework/core/Session/Session.js";
import { run_item } from "./page_tools.js";

let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log("PASS —", name); };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const replay_messages = file => Session.replay(fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l))).messages.messages;

// ── a scratch session, under the real sessions store (what `item`'s read path, page_tools.js's session_state(), expects) ──
const REL = "public/framework/ai/sessions/2026/10/16/.card-messages-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "session.jsonl"), URL_ = "/" + REL.slice("public/".length) + "/";
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ session: { id: "test", kind: "cloud-voice-agent", at: new Date().toISOString() } }) + "\n");

try {
	// ── Step 1: reproduce the owner's "undefined" card, through the real item path, then prove it is fixed ──────────────
	let add = await run_item({ path: URL_, delta: { messages: { add: { type: "Card", icon: "task", title: "Call the vet" } } } }, { caller: "t" });
	check("the item tool adds a card (type \"Card\", the natural guess) and hands back its id", () => assert.ok(add.ok && add.ids?.length === 1, add.why));
	const card_id = add.ids[0];
	let read = await run_item({ path: URL_ }, { caller: "t" });
	let last = read.state.messages.last.find(m => m.id === card_id);
	check("reading it back never answers the stringified word \"undefined\" — the owner's exact bug — for text, title or icon", () => {
		assert.ok(last, "the card is in messages.last");
		assert.notEqual(last.text, "undefined");
		assert.equal(last.title, "Call the vet");
		assert.equal(last.icon, "task");
	});
	check("on disk, it hydrates as a real Message (icon/title getters), not a generic Item with none", () => {
		const m = replay_messages(FILE).find(x => x.id === card_id);
		assert.equal(m.constructor.name, "Message");
		assert.equal(m.title, "Call the vet");
		assert.equal(m.icon, "task");
		assert.equal(m.text, "", "no text was given: empty, never the string \"undefined\"");
	});

	// ── Step 2: append to its content, rewrite its title, read it by id ─────────────────────────────────────────────────
	let r = await run_item({ path: URL_, delta: { messages: { [card_id]: { content: { add: { title: "Ask about the limp" } } } } } }, { caller: "t" });
	check("appending to the card's content", () => assert.ok(r.ok, r.why));
	check("…lands on the card, in order, read by its id", () => {
		const m = replay_messages(FILE).find(x => x.id === card_id);
		assert.equal(m.content.length, 1);
		assert.equal([...m.content][0].get_one("title"), "Ask about the limp");
	});
	r = await run_item({ path: URL_, delta: { messages: { [card_id]: { title: "Call the vet about the limp" } } } }, { caller: "t" });
	check("rewriting the card's title in place", () => assert.ok(r.ok, r.why));
	read = await run_item({ path: URL_ }, { caller: "t" });
	last = read.state.messages.last.find(m => m.id === card_id);
	check("…the rewrite is what a read-by-id answers", () => assert.equal(last.title, "Call the vet about the limp"));

	// ── Step 3: upgrade an ORDINARY message (no icon, no title) into a card, on a real recorded session ──────────────────
	const SRC = path.join(ROOT, "public/framework/ai/sessions/2026/11/03/v-z0jonhy/session.jsonl");
	const REL2 = "public/framework/ai/sessions/2026/10/16/.card-messages-test-upgrade-" + process.pid;
	const DIR2 = path.join(ROOT, REL2), FILE2 = path.join(DIR2, "session.jsonl"), URL2 = "/" + REL2.slice("public/".length) + "/";
	fs.mkdirSync(DIR2, { recursive: true });
	fs.copyFileSync(SRC, FILE2);
	try {
		const before = replay_messages(FILE2);
		const idx = before.findIndex(m => m.id && !m.title && !m.icon && m.constructor.name !== "Prompt");
		const plain = before[idx];
		check("the fixture has at least one ordinary message with neither title nor icon, to upgrade", () => assert.ok(plain, "no plain message found"));
		r = await run_item({ path: URL2, delta: { messages: { [plain.id]: { title: "Phone the owner back", icon: "call" } } } }, { caller: "t" });
		check("upgrading an existing message into a card: one title+icon set, the same item tool call as a fresh one", () => assert.ok(r.ok, r.why));
		const after = replay_messages(FILE2);
		check("…its class and position are unchanged; only title/icon are new, and the list's length is unchanged (nothing added or removed)", () => {
			assert.equal(after.length, before.length, "no message added or removed");
			const up = after[idx];
			assert.equal(up.id, plain.id, "same message, same slot");
			assert.equal(up.constructor.name, plain.constructor.name);
			assert.equal(up.title, "Phone the owner back");
			assert.equal(up.icon, "call");
		});
	} finally { fs.rmSync(DIR2, { recursive: true, force: true }); }
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

console.log(`card-messages.test.mjs: ${checks} checks passed`);
process.exit(0);
