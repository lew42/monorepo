// node stream-proof.mjs <port> <out.json> — appends page_set-shaped lines to a scratch page and times when a watching headless browser shows each (core/Page/doc/ai-api.md, "The live proof").
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "../../../../../../../../../Server/browser.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, "../../../core/Page/jsonl/live/page.jsonl");   // the page-tools demo page: a routed page.jsonl
const [port = "51858", out = "stream-proof.json"] = process.argv.slice(2);
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1200, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e.message)));
page.on("console", m => { if (m.type() === "error" && !/404|Failed to load/.test(m.text())) errors.push(m.text()); });
await page.goto(`http://localhost:${port}/framework/core/Page/jsonl/live/`, { waitUntil: "load" });
await page.waitForTimeout(2500);

const steps = [
	["heading", { content: { add: { type: "part-heading", text: "Proof heading", id: "h1" } } }, "Proof heading"],
	["card", { content: { add: { type: "part-card", title: "Cache", text: "Hit rate 92%.", id: "c1" } } }, "Hit rate 92%."],
	["update", { c1: { text: "Hit rate 95%." } }, "Hit rate 95%."],
	["text", { content: { add: { type: "part-text", text: "A **markdown** line.", id: "t1" } } }, "A markdown line."],
	["title", { title: "Stream proof renamed" }, "Stream proof renamed"],
];
const result = [];
for (const [name, delta, expect] of steps){
	const line = { ...delta, by: "mastermind-page-split-3", ts: new Date().toISOString() };
	const wrote = Date.now();
	fs.appendFileSync(file, JSON.stringify(line) + "\n");
	let seen = null;
	while (Date.now() - wrote < 5000){
		if (await page.evaluate(t => document.body.innerText.includes(t), expect)){ seen = Date.now() - wrote; break; }
		await page.waitForTimeout(20);
	}
	result.push({ name, ms: seen });
	console.log(name, seen === null ? "NOT SEEN in 5 s" : seen + " ms");
}
fs.writeFileSync(path.join(here, out), JSON.stringify({ result, errors }, null, 1));
await page.screenshot({ path: path.join(here, out.replace(/\.json$/, ".png")) });
await close();
