/* node first-reply.mjs [base] — headless: open the ☰ drawer, send one typed sentence, time each hop to the first reply. */
import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../../../../../../..");
const base = process.argv[2] || "http://monorepo.localhost";
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const b = await browser(); const ctx = await b.newContext({ viewport: { width: 1920, height: 1000 } });
const p = await ctx.newPage(); const t0 = Date.now(); const T = (n) => console.log(String(Date.now() - t0).padStart(6) + " ms  " + n);
p.on("request", r => /\/api\/session|\/say|\/start/.test(r.url()) && T("→ " + r.method() + " " + r.url().replace(/^https?:\/\/[^/]+/, "")));
p.on("response", r => /\/api\/session/.test(r.url()) && T("← " + r.status() + " " + r.url().replace(/^https?:\/\/[^/]+/, "")));
await p.goto(base + "/framework/", { waitUntil: "load" }); T("page loaded");
await p.click(".drawer-menu"); await p.waitForSelector(".chatbox-compose-input", { timeout: 15000 }); T("drawer open, composer ready");
await p.screenshot({ path: path.join(HERE, "drawer-before.png") });
const count = () => p.evaluate(() => document.querySelectorAll("[class*=chatbox-reply]").length);
const before = await count();
await p.fill(".chatbox-compose-input", "Timing test: please reply with one short line."); T("typed");
await p.click(".chatbox-compose-send"); T("Send pressed"); const sent = Date.now();
let first = null, second = null;
while (Date.now() - sent < 120000){
	const n = await count();
	if (!first && n > before){ first = Date.now() - sent; T("FIRST REPLY bubble (" + first + " ms after Send)"); }
	if (first && !second && n > before + 1){ second = Date.now() - sent; T("SECOND REPLY bubble (" + second + " ms after Send)"); break; }
	await p.waitForTimeout(100);
}
console.log("session:", await p.evaluate(() => sessionStorage.getItem("lew42-voice-session")));
await p.screenshot({ path: path.join(HERE, "drawer-after.png") }); await close();
console.log(JSON.stringify({ first, second }));
