import { browser, close } from "../../../../../../../../../../../Server/browser.mjs";
const b = await browser(), page = await (await b.newContext({ viewport: { width: 1920, height: 900 } })).newPage();
await page.goto(process.argv[2] + "/framework/ai/sessions/", { waitUntil: "commit" });
await page.waitForSelector("a.sessions-row", { state: "attached", timeout: 60000 }); await page.waitForTimeout(1500);
const n = () => page.evaluate(() => document.querySelectorAll("a.sessions-row").length);
const a = await n(); console.log(await page.evaluate(() => { const m = document.querySelector(".datagrid-more, [class*=more]"); return m ? m.outerHTML.slice(0,200) + getComputedStyle(m).display : "no more el"; }));
for (let i = 0; i < 6; i++) { await page.evaluate(() => { for (const el of document.querySelectorAll("*")) { const o = getComputedStyle(el).overflowY; if ((o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight + 20) el.scrollTop = el.scrollHeight; } window.scrollTo(0, 1e9); }); await page.waitForTimeout(600); }
console.log("rows", a, "->", await n());
const sb = "input[placeholder^=\"search title\"]"; await page.fill(sb, "reviewer"); await page.waitForTimeout(1200);
console.log("search rows", await n(), await page.textContent(".sessions-counts"));
await close();
