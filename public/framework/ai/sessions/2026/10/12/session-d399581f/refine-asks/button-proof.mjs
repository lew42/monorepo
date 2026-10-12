/* node button-proof.mjs [origin] [session] — headless: open a session page, select an owner bubble, press Refine, wait for the stages. */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../..");
const ORIGIN = process.argv[2] || "http://monorepo.localhost", SESSION = process.argv[3] || "d399581f-3749-4794-915f-2c42fbc4e03e";
const { browser } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const b = await browser({}), ctx = await b.newContext({ viewport: { width: 1200, height: 900 } }), page = await ctx.newPage(), errs = [];
page.on("pageerror", e => errs.push(e.message));
// OVERRIDE=1: serve this checkout's three edited files to the live site (a worktree has no session data to test against).
if (process.env.OVERRIDE) for (const f of ["ext/Chat/Chat.js", "ai/AISession/AISessionConversation.js", "ai/AISession/AISessionDetail.js"])
	await page.route("**/framework/" + f, route => route.fulfill({ path: path.join(REPO, "public/framework", f), contentType: "text/javascript" }));
await page.goto(`${ORIGIN}/framework/ai/sessions/${SESSION}/`, { waitUntil: "load" });
await page.waitForSelector(".chatbox-you", { timeout: 30000 });
await page.locator(".chatbox-you").last().click();
const btn = await page.waitForSelector(".chatbox-refine-btn", { timeout: 5000 });
console.log("button text:", await btn.textContent());
// TRUNC=1: this session's only prompt is over the 20k-character limit, so send its first 300 characters (the proof is the button, not the limit).
if (process.env.TRUNC) await page.route("**/api/refine", route => { const b = JSON.parse(route.request().postData()); b.text = b.text.slice(0, 300); route.continue({ postData: JSON.stringify(b) }); });
page.on("request", r => /refine|voice/.test(r.url()) && console.log("request", r.method(), r.url())); page.on("response", r => /refine|voice/.test(r.url()) && console.log("response", r.status(), r.url()));
const t0 = Date.now(); await btn.click(); console.log("clicked; button:", await btn.textContent());
await page.waitForSelector('.voice-stage[data-stage="cards"]:not([hidden])', { timeout: 90000 }).catch(() => console.log("cards never showed"));
console.log("stages:", await page.$$eval(".voice-stage:not([hidden])", els => els.map(e => e.getAttribute("data-stage"))), "after", Date.now() - t0, "ms");
console.log("button now:", await page.$eval(".chatbox-refine-btn", e => e.textContent).catch(() => "(gone)"));
await page.screenshot({ path: path.join(HERE, "button-proof.png") });
console.log("errors:", errs);
await b.close();
