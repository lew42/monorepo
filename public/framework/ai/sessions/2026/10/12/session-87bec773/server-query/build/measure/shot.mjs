// node shot.mjs <base> - screenshots /framework/ai/sessions/ at 400 and 1920, prints console errors and the first rows
import { browser, close } from "../../../../../../../../../../../Server/browser.mjs";
import path from "node:path"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), base = process.argv[2];
const b = await browser();
for (const width of [400, 1920]) {
	const ctx = await b.newContext({ viewport: { width, height: 900 } }), page = await ctx.newPage(), errs = [];
	page.on("console", m => { if (m.type() === "error" && !/404/.test(m.text())) errs.push(m.text()); }); page.on("pageerror", e => errs.push("pageerror " + e.message));
	await page.goto(base + "/framework/ai/sessions/", { waitUntil: "commit" });
	await page.waitForSelector("a.sessions-row, .datagrid-card", { timeout: 60000, state: "attached" });
	await page.waitForTimeout(2500);
	const info = await page.evaluate(() => ({ rows: document.querySelectorAll("a.sessions-row, .datagrid-card").length, counts: document.querySelector(".sessions-counts")?.textContent, asof: document.querySelector(".muted")?.textContent }));
	await page.screenshot({ path: path.join(here, `proof-${width}.png`) });
	console.log(width, JSON.stringify(info), "errors:", JSON.stringify(errs));
	await ctx.close();
}
await close();
