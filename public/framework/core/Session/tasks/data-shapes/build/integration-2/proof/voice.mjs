// Check 6: the session page of a long voice session (v-sq8y7db, 8,360 lines) while lines stream in: how often does the task list redraw, and what does each cost?
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const WT = "C:/Code/lew42/worktrees/data-shapes-2", REL = "/framework/ai/sessions/2026/10/25/v-sq8y7db/", FILE = `${WT}/public${REL}session.jsonl`;
process.env.RECORD_ENTRY = "http://127.0.0.1:9/api/item";   // the worktree's own one writer, entry down: append_once (the dev server tails the file)
const { default: RecordWriter } = await import(`file:///${WT}/public/framework/core/Item/RecordWriter.js`);
const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 1920, height: 1080 } }), errs = [];
page.on("pageerror", e => errs.push(e.message));
await page.addInitScript(() => {
	window._long = []; new PerformanceObserver(l => l.getEntries().forEach(e => window._long.push(Math.round(e.duration)))).observe({ type: "longtask", buffered: true });
});
const t0 = Date.now();
await page.goto("http://localhost:53219" + REL, { waitUntil: "load" });
await page.waitForFunction(() => document.querySelector(".session-tasks")?.childElementCount > 0, null, { timeout: 60000 }).catch(() => {});
await page.waitForTimeout(4000);
const load_ms = Date.now() - t0;
await page.evaluate(async () => {
	const { default: ST } = await import("/framework/core/Session/SessionTasks.js");
	const draw = ST.prototype.draw; window._draws = [];
	ST.prototype.draw = function(...a){ const t = performance.now(); const r = draw.apply(this, a); window._draws.push(+(performance.now() - t).toFixed(1)); return r; };
	window._long.length = 0;
});
const N = 40;
for (let i = 0; i < N; i++){
	await RecordWriter.write(FILE, [{ chat: { at: new Date().toISOString(), session: "v-sq8y7db", from: { kind: "owner" }, via: "voice", text: `integration 2 probe sentence ${i}` } }], { by: "probe" });
	await new Promise(r => setTimeout(r, 250));
}
await page.waitForTimeout(3000);
const m = await page.evaluate(() => ({ draws: window._draws, long: window._long, rows: document.querySelectorAll(".session-task").length }));
const d = [...m.draws].sort((a, b) => a - b);
console.log(JSON.stringify({ load_ms, lines_streamed: N, over_ms: N * 250, redraws: d.length, median_ms: d[d.length >> 1] ?? null, max_ms: d.at(-1) ?? null, total_ms: +d.reduce((a, b) => a + b, 0).toFixed(1), longtasks_while_streaming: m.long, task_rows: m.rows, errors: errs }, null, 1));
await browser.close();
