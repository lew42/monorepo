/* LiveCode: a live-code line replays with its fields intact. `node public/live/LiveCode.test.mjs` */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "../../Servex/agents/page_tools.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const NAME = ".test-" + process.pid, DIR = path.join(HERE, NAME), URL = `/live/${NAME}/`;
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const go = async delta => { const r = await run_item({ path: URL, delta }, { caller: "LiveCode.test" }); assert.ok(r.ok, JSON.stringify(delta) + " refused: " + r.why); return r; };
const read = async p => (await run_item({ path: URL, read: p }, { caller: "LiveCode.test" })).value;

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "page.jsonl"), JSON.stringify({ class: "/live/LivePage.js", title: "Test" }) + "\n");
try {
	await go({ content: { add: { type: "live-code", id: "s1", lang: "js", code: "const x = 1;", title: "X", caption: "a snippet" } } });
	const s1 = await read("content.s1");
	ok(s1.type === "live-code", "a live-code line replays as live-code");
	ok(s1.data.lang === "js" && s1.data.code === "const x = 1;", "lang and code survive replay");
	ok(s1.data.title === "X" && s1.data.caption === "a snippet", "title and caption survive replay");

	await go({ content: { add: { type: "live-code", id: "s2", code: "{}" } } });
	const s2 = await read("content.s2");
	ok(s2.data.lang === undefined, "lang defaults to js only in the View, not forced onto the stored data");
	console.log(`LiveCode.test: ${n} passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
