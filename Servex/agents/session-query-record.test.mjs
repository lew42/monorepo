// A session query on an older folder (no session.jsonl) is answered from a one-line record, never written to page.jsonl. `node Servex/agents/session-query-record.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ID = "00000000-0000-4000-8000-" + String(process.pid).padStart(12, "0");
const NAME = ".sqr-test-" + process.pid, REL = "public/framework/ai/sessions/2026/10/16/" + NAME, DIR = path.join(ROOT, REL);
const URL_ = "/framework/ai/sessions/2026/10/16/" + NAME + "/";
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "index.json"), JSON.stringify({ id: ID, usd: 3.5, first_at: "2026-10-16T01:00:00.000Z" }));
fs.writeFileSync(path.join(DIR, "page.jsonl"), "");
try {
	const r = await run_item({ path: URL_, delta: { summary: {} } }, { caller: "owner" });
	ok(r.ok && r.answer?.summary?.class === "Session", "summary answers as a Session: " + JSON.stringify(r).slice(0, 200));
	ok(r.answer.summary.id === ID, "the record carries the folder's session id");
	ok(r.answer.summary.first_at === "2026-10-16T01:00:00.000Z", "the record starts when the session did");
	ok(fs.readFileSync(path.join(DIR, "page.jsonl"), "utf8") === "", "nothing was written to page.jsonl");
	ok(fs.readFileSync(path.join(DIR, "session.jsonl"), "utf8").split("\n").filter(Boolean).length === 1, "one record line, once");
	await run_item({ path: URL_, delta: { cost: {} } }, { caller: "owner" });
	ok(fs.readFileSync(path.join(DIR, "session.jsonl"), "utf8").split("\n").filter(Boolean).length === 1, "a second query adds no line");
	console.log(`session-query-record: ${n} checks passed`);
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
process.exit(0);
