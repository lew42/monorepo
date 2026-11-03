// node probe-scroll.mjs <base url> <out dir> [label] — Sessions at 3440×1440 (and 1920, 1200, 400): which boxes scroll,
// how much of the screen the grid rows get, and whether anything shows through the sticky header once scrolled.
import { browser as launch, close } from "../../../../../../../../../../Server/browser.mjs";
const [base = "http://monorepo.localhost/", out = ".", label = "x"] = process.argv.slice(2);
const browser = await launch();
const results = [];
for (const [w, h] of [[3440, 1440], [1920, 1080], [1200, 800], [400, 800]]){
	const page = await browser.newPage({ viewport: { width: w, height: h } });
	const errors = [];
	page.on("pageerror", e => errors.push(e.message));
	await page.goto(new URL("/framework/ai/sessions/", base).href, { waitUntil: "networkidle" });
	await page.waitForSelector(".datagrid-row, .sessions-bucket", { timeout: 20000 }).catch(() => {});
	await page.waitForTimeout(800);
	const measure = () => page.evaluate(() => {
		const scrollers = [...document.querySelectorAll("*")].filter(el => {
			const s = getComputedStyle(el);
			return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 100;
		}).map(el => ({ cls: el.className.toString().slice(0, 60), h: el.clientHeight, content: el.scrollHeight }));
		const grid = document.querySelector(".sessions-page .datagrid:not(.datagrid-rail)");
		const head = grid?.querySelector(".datagrid-head");
		const hb = head?.getBoundingClientRect();
		// What is painted just under the header's bottom edge, in a column gap? It must be the header itself.
		let through = null;
		if (hb && hb.height){
			const cells = [...head.querySelectorAll(".datagrid-head-cell")].map(c => c.getBoundingClientRect());
			const gaps = cells.slice(1).map((c, i) => (cells[i].right + c.left) / 2);
			through = gaps.map(x => document.elementFromPoint(x, hb.bottom - 3)).filter(el => el && !head.contains(el)).map(el => el.className.toString().slice(0, 40));
		}
		const rows = [...document.querySelectorAll(".sessions-page .datagrid-cell, .sessions-bucket")].filter(el => {
			const r = el.getBoundingClientRect(); return r.bottom > (hb?.bottom ?? 0) && r.top < innerHeight && r.height;
		});
		const top = Math.min(...rows.map(el => el.getBoundingClientRect().top));
		const bottom = Math.max(...rows.map(el => el.getBoundingClientRect().bottom));
		return { scrollers, head_top: hb && Math.round(hb.top), visible_rows_px: Math.round(Math.min(bottom, innerHeight) - Math.max(top, 0)), through };
	});
	const rest = await measure();
	await page.screenshot({ path: `${out}/scroll-${label}-${w}-0.png` });
	// Scroll the one scroller (the column) down 900 px, the way a wheel would.
	await page.mouse.move(w * 0.5, h * 0.7);
	await page.mouse.wheel(0, 900);
	await page.waitForTimeout(600);
	const scrolled = await measure();
	await page.screenshot({ path: `${out}/scroll-${label}-${w}-900.png` });
	await page.mouse.wheel(0, 20000);
	await page.waitForTimeout(1500);
	const rowsDrawn = await page.evaluate(() => document.querySelectorAll(".sessions-page .datagrid-body > *").length);
	results.push({ label, w, rest, scrolled, rows_after_deep_scroll: rowsDrawn, errors });
	await page.close();
}
await close();
console.log(JSON.stringify(results, null, 1));
