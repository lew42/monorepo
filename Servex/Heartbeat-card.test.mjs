/* node Servex/Heartbeat-card.test.mjs — the heartbeat posts to a card by id/slug or exact title, never builds a log name from a title
 * (2026-10-18, todo 11:42). A scratch cards root; no real Servex. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const home = fs.mkdtempSync(path.join(os.tmpdir(), "heartbeat-card-test-"));
process.env.SERVEX_HOME = home;
process.env.SERVEX_NO_BUDGET = "1";
const { default: Cards } = await import("./cards/Cards.js");
const { default: Heartbeat } = await import("./Heartbeat.js");

const cards = new Cards({ root: path.join(home, "ai") });
const made = await cards.create({ title: "Compaction: nudge, not cut" });
assert.ok(made.ok !== false && made.id, JSON.stringify(made));
console.log("card id:", made.id);

const said = [], replies = [];
const servex = {
	cards, say: (m, o) => said.push(m),
	mcp: { handlers: new Map([["card_reply", async ({ card, text }) => { replies.push(card); return JSON.stringify({ ok: true }); }]]) },
	inbox: { drop: () => { throw new Error("inbox must not be touched"); } },
};
const hb = new Heartbeat({ servex });

// 1. a title resolves to the slug id
console.log("title  -> slug:", "Compaction: nudge, not cut", "->", await cards.by_name("Compaction: nudge, not cut"));
await hb.post("Compaction: nudge, not cut", "hello", false, path.join(home, "task"));
assert.deepEqual(replies, [made.id], "posted to the resolved id");
// 2. an id passes through untouched
await hb.post(made.id, "hello", false, path.join(home, "task"));
assert.deepEqual(replies, [made.id, made.id]);
// 3. a title with no match: one log line naming the task, nothing posted, no inbox
said.length = 0; replies.length = 0;
const out = await hb.post("No such card: at all", "hello", false, path.join(home, "my-task"));
assert.equal(out, null);
assert.deepEqual(replies, [], "nothing posted");
assert.equal(said.length, 1, "exactly one log line");
assert.match(said[0], /my-task/);
console.log("no match ->", said[0]);
console.log("ok  Heartbeat.post resolves a card by title");
process.exit(0);
