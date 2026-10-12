// Watch a page headless and log, with a timestamp, every new line of text it shows.
// node watch.mjs <url> <seconds> <out.json>   — the proof that a tool call appears live (ai-api.md, "The live proof").
import fs from "node:fs";
import { browser, close } from "../../../../../../Server/browser.mjs";

const [url, seconds = "180", out = "seen.json"] = process.argv.slice(2);
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1200, height: 900 } })).newPage();
const seen = [], known = new Set(), errors = [];
page.on("pageerror", e => errors.push(String(e.message)));
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(3000);
const lines = () => page.evaluate(() => document.body.innerText.split("\n").map(s => s.trim()).filter(Boolean));
for (const l of await lines()) known.add(l);
console.log(`watching ${url}: ${known.size} lines at start`);
const end = Date.now() + Number(seconds) * 1000;
while (Date.now() < end){
	const at = new Date().toISOString();
	for (const l of await lines().catch(() => [])) if (!known.has(l)){ known.add(l); seen.push({ at, text: l.slice(0, 120) }); console.log(at, l.slice(0, 80)); }
	fs.writeFileSync(out, JSON.stringify({ url, seen, errors }, null, 1));
	await page.waitForTimeout(100);
}
await page.screenshot({ path: out.replace(/\.json$/, ".png"), fullPage: true });
await close();
