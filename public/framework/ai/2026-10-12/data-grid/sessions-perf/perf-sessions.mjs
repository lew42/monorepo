// Sessions page perf: node perf-sessions.mjs <base-url> <label>
// Same measurement before and after the DataGrid move. Appends to results.jsonl beside this file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "../../../../../../Server/browser.mjs";

const ROW_SELECTORS = ["a.sessions-row", ".datagrid-card"];   // a drawn session row (table) or card (rail); the header row is not one
const WIDTHS = [400, 1200, 1920, 3440];
const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.argv[2] || "http://monorepo.localhost").replace(/\/$/, "");
const label = process.argv[3] || "run";
const query = process.argv[4] || "";   // e.g. "?view=rail"
const sel = ROW_SELECTORS.join(",");

const b = await browser();
for (const width of WIDTHS) {
	const ctx = await b.newContext({ viewport: { width, height: 900 } });
	const page = await ctx.newPage();
	await page.addInitScript(() => {
		window.__lt = [];
		new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({ type: "longtask", buffered: true });
	});
	const t0 = Date.now();
	await page.goto(`${base}/framework/ai/sessions/${query}`, { waitUntil: "commit" });
	await page.waitForSelector(sel, { timeout: 60000, state: "attached" });   // attached, not visible: a table row is display: contents
	const first_row_ms = Date.now() - t0;
	await page.waitForTimeout(1500);
	const m = await page.evaluate((sel) => ({
		long_tasks: window.__lt.length,
		long_ms: Math.round(window.__lt.reduce((a, b) => a + b, 0)),
		dom_nodes: document.getElementsByTagName("*").length,
		rows: document.querySelectorAll(sel).length,
		heap_mb: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
	}), sel);
	const before_scroll = m.long_ms;
	await page.evaluate(() => {   // the biggest scrollable element, else the window
		let best = null, size = 0;
		for (const el of document.querySelectorAll("*")) {
			const o = getComputedStyle(el).overflowY;
			if ((o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight + 20 && el.scrollHeight > size) { best = el; size = el.scrollHeight; }
		}
		window.__scroller = best;
	});
	for (let i = 1; i <= 10; i++) {
		await page.evaluate((f) => {
			const s = window.__scroller;
			if (s) s.scrollTop = (s.scrollHeight - s.clientHeight) * f;
			else window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f);
		}, i / 10);
		await page.waitForTimeout(150);
	}
	await page.waitForTimeout(500);
	const total_ms = await page.evaluate(() => Math.round(window.__lt.reduce((a, b) => a + b, 0)));
	const rec = { label, width, first_row_ms, ...m, scroll_long_ms: total_ms - before_scroll, at: new Date().toISOString() };
	await page.screenshot({ path: path.join(here, `${label}-${width}.png`) });
	fs.appendFileSync(path.join(here, "results.jsonl"), JSON.stringify(rec) + "\n");
	console.log(JSON.stringify(rec));
	await ctx.close();
}
await close();
