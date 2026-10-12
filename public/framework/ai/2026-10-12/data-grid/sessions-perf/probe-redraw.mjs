// Sessions redraw cost: node probe-redraw.mjs <base-url> <label>. Times DataGrid.apply (filter, sort, nest, roll-up, draw)
// over 6 header-click sorts at 1920, after every feed has loaded. Appends to redraw.jsonl beside this file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "../../../../../../Server/browser.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = (process.argv[2] || "http://monorepo.localhost").replace(/\/$/, "");
const label = process.argv[3] || "run";
const b = await browser();
const ctx = await b.newContext({ viewport: { width: 1920, height: 900 } });
const page = await ctx.newPage();
const errors = []; page.on("pageerror", e => errors.push(e.message));
await page.goto(`${base}/framework/ai/sessions/?view=table`, { waitUntil: "commit" });
await page.waitForSelector("a.sessions-row", { timeout: 60000, state: "attached" });
await page.waitForTimeout(5000);   // every feed (flags, index, tree, day files) in
const m = await page.evaluate(async () => {
	const { default: DataGrid } = await import("/framework/ext/DataGrid/DataGrid.js");
	const times = []; let grid;
	const orig = DataGrid.prototype.apply;
	DataGrid.prototype.apply = function(...a){ grid = this; const t = performance.now(); const r = orig.apply(this, a); times.push(performance.now() - t); return r; };
	const cell = document.querySelector('.datagrid-head-cell[data-key="updated"]') ?? document.querySelector(".datagrid-head-cell");
	for (let i = 0; i < 6; i++){ cell.click(); await new Promise(r => setTimeout(r, 300)); }
	DataGrid.prototype.apply = orig;
	times.sort((x, y) => x - y);
	return { apply_ms: +times[times.length >> 1].toFixed(1), all_rows: grid?.all_rows.length, grid_rows: grid?.view_rows.length,
		bucket_rows: document.querySelectorAll(".sessions-bucket").length, dom_nodes: document.querySelectorAll("*").length };
});
const line = { label, ...m, errors: errors.length, at: new Date().toISOString() };
console.log(JSON.stringify(line));
fs.appendFileSync(path.join(here, "redraw.jsonl"), JSON.stringify(line) + "\n");
await close();
