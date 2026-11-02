// A session route (/framework/ai/sessions/<uuid>/) takes task verbs on session.jsonl, not on the page; and a write answers small. `node Servex/agents/session-route-tasks.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ID = "00000000-0000-4000-8000-" + String(process.pid).padStart(12, "0");
const NAME = "srt-test-" + process.pid, DIR = path.join(ROOT, "public/framework/ai/sessions/2026/10/16", NAME);
const BY_ID = `/framework/ai/sessions/${ID}/`, BY_DATE = `/framework/ai/sessions/2026/10/16/${NAME}/`;
const lines = f => fs.readFileSync(path.join(DIR, f), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "index.json"), JSON.stringify({ id: ID, first_at: "2026-10-16T01:00:00.000Z" }));
fs.writeFileSync(path.join(DIR, "page.jsonl"), JSON.stringify({ session: ID, ts: "2026-10-16T01:00:00.000Z" }) + "\n");
fs.writeFileSync(path.join(DIR, "session.jsonl"), JSON.stringify({ session: { id: ID, kind: "vscode-tab", at: "2026-10-16T01:00:00.000Z" }, by: "test" }) + "\n");
try {
	const page_before = lines("page.jsonl").length;
	for (const [label, url] of [["uuid route", BY_ID], ["dated route", BY_DATE]]) {
		const r = await run_item({ path: url, delta: { tasks: { add: { title: "A task from the " + label } } } }, { caller: "owner" });
		ok(r.ok && r.ids?.length === 1, label + ": the task was added: " + JSON.stringify(r).slice(0, 200));
		const { instructions: _i, ...bare } = r;
		ok(JSON.stringify(bare).length < 3000, `${label}: the answer is small (${JSON.stringify(bare).length} characters, instructions aside)`);
		ok(r.state === undefined, label + ": no whole state in a write's answer");
	}
	ok(!lines("page.jsonl").some(l => l.tasks || l.task), "nothing task-like was written to page.jsonl: " + JSON.stringify(lines("page.jsonl").slice(page_before)).slice(0, 300));
	ok(lines("session.jsonl").filter(l => l.tasks?.add).length === 2, "both tasks are on session.jsonl");

	// a page write on a session route still goes to the page, and answers small too
	const card = await run_item({ path: BY_ID, delta: { content: { add: { type: "part-text", text: "hello" } } } }, { caller: "owner" });
	ok(card.ok && card.ids?.length === 1, "a card still lands on the page: " + JSON.stringify(card).slice(0, 200));
	ok(lines("page.jsonl").some(l => l.content?.add), "the card is on page.jsonl");
	ok(card.state === undefined, "a page write does not answer with the whole page");
	const { instructions: _j, ...cbare } = card;
	ok(JSON.stringify(cbare).length < 3000, `a page write's answer is small (${JSON.stringify(cbare).length} characters)`);

	// a read still answers the picture
	const read = await run_item({ path: BY_ID }, { caller: "owner" });
	ok(read.ok && read.state, "a read with no delta still returns the state");
	console.log(`session-route-tasks: ${n} checks passed`);
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
process.exit(0);
