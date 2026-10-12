// probe-views.mjs — after shots of the Sessions page in both views, plus two checks:
// scrolling the table loads the next page by itself, and a rail card opens its detail beside the rail.
// usage: node probe-views.mjs <base-url>
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "../../../../../../Server/browser.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.argv[2] || "http://data-grid-3.localhost").replace(/\/$/, "");
const b = await browser();
const out = [];

for (const width of [400, 1200, 1920, 3440]) for (const view of ["table", "rail"]) {
	const ctx = await b.newContext({ viewport: { width, height: 900 } });
	const page = await ctx.newPage();
	const errors = [];
	page.on("pageerror", e => errors.push(e.message));
	await page.goto(`${base}/framework/ai/sessions/?view=${view}`);
	await page.waitForSelector("a.sessions-row, .datagrid-card", { state: "attached", timeout: 60000 });
	await page.waitForTimeout(1500);
	const rec = { width, view, errors };
	if (view === "table" && width === 1200){
		rec.rows_before = await page.locator("a.sessions-row").count();
		await page.evaluate(() => { const g = document.querySelector(".sessions-page .datagrid"); g.scrollTop = g.scrollHeight; });
		await page.waitForTimeout(800);
		rec.rows_after_scroll = await page.locator("a.sessions-row").count();
	}
	await page.screenshot({ path: path.join(here, `after-${view}-${width}.png`) });
	if (view === "rail" && width === 1920){
		await page.locator(".datagrid-card").nth(1).click();
		await page.waitForTimeout(2500);
		rec.detail_url = page.url();
		rec.rail_still_there = await page.locator(".datagrid-card").count() > 0;
		await page.screenshot({ path: path.join(here, `after-rail-detail-1920.png`) });
	}
	out.push(rec);
	console.log(JSON.stringify(rec));
	await ctx.close();
}
await close();
