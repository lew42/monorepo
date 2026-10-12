// node watch-proof.mjs <base> <seconds> <text1> <text2>… — a headless browser watches the page-tools demo page; for each text it prints how long after the page.jsonl grew the text showed (core/Page/doc/ai-api.md, "The live proof").
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "../../../../../Server/browser.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, "../../../core/Page/jsonl/live/page.jsonl");
const [base, seconds, ...texts] = process.argv.slice(2);
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1200, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e.message)));
await page.goto(`${base}/framework/core/Page/jsonl/live/`, { waitUntil: "load" });
await page.waitForTimeout(2500);
console.log("watching; page loaded");

let size = fs.statSync(file).size, grew = null;
const seen = {};
const end = Date.now() + seconds * 1000;
while (Date.now() < end && Object.keys(seen).length < texts.length){
	const now = fs.statSync(file).size;
	if (now > size){ size = now; grew = Date.now(); }
	for (const t of texts){
		if (seen[t] === undefined && await page.evaluate(x => document.body.innerText.includes(x), t)){
			seen[t] = grew ? Date.now() - grew : null;
			console.log(JSON.stringify(t), seen[t], "ms after the file grew");
		}
	}
	await page.waitForTimeout(15);
}
console.log(JSON.stringify({ seen, errors, missing: texts.filter(t => seen[t] === undefined) }));
await page.screenshot({ path: path.join(here, "watch-proof.png") });
await close();
