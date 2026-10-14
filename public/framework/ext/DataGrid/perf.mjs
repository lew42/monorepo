// ext/DataGrid/perf.mjs — the brief's own proof: drag a column's resize
// handle 300px across the demo page's 2,000-row grid and report the average
// frame time and CPU, the same shape the owner's own bug report measured
// ("108% CPU" on the old, hand-built grid). Headless Chromium only, via
// Server/Browser.mjs (CLAUDE.md: never a window-opening process) — never the
// owner's own tabs, never mcp__playwright (this task's own fence).
//
// Run from the repo root: `node public/framework/ext/DataGrid/perf.mjs`
// Numbers go in two places: this task's task.jsonl log, and doc/perf.md.
import { browser, close } from "../../../../Server/Browser.mjs";

const URL = process.env.DATAGRID_PERF_URL || "http://data-grid.localhost/framework/ext/DataGrid/";
const DRAG_PX = 300;
const STEPS = 30;

async function main(){
	const b = await browser();
	const page = await (await b.newContext()).newPage();
	await page.goto(URL, { waitUntil: "networkidle" });
	await page.waitForSelector(".datagrid-ext .datagrid-grip");
	await page.evaluate(() => document.fonts.ready);
	// Let the 2,000-row mount settle (the first windowed paint) before measuring.
	await page.waitForTimeout(300);

	const client = await page.context().newCDPSession(page);
	await client.send("Performance.enable");

	const grip = await page.$(".datagrid-ext .datagrid-grip");
	const box = await grip.boundingBox();
	const start_x = box.x + box.width / 2, y = box.y + box.height / 2;

	// A plain rAF counter inside the page — simpler and more honest than
	// parsing a CDP trace file for "DrawFrame" events, and the brief only
	// asks for one printed line of numbers, not a saved trace.
	// ⚠ Schedule the FIRST tick through requestAnimationFrame too, not an
	// immediate call — an immediate call hands `tick` no timestamp (`t` is
	// undefined on that one call), and `undefined` in `__frames` turned every
	// later `number - undefined` into NaN, which poisoned the whole average
	// (caught by actually running this against a live page, not just reading
	// the code: the first real run printed "NaNms/frame").
	await page.evaluate(() => {
		window.__frames = [];
		window.__collecting = true;
		function tick(t){
			window.__frames.push(t);
			if (window.__collecting) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	});

	const before = (await client.send("Performance.getMetrics")).metrics;
	const t0 = Date.now();

	await page.mouse.move(start_x, y);
	await page.mouse.down();
	for (let i = 1; i <= STEPS; i++){
		await page.mouse.move(start_x + (DRAG_PX * i) / STEPS, y);
		await page.waitForTimeout(8);   // ~1 frame at 120Hz — a human-speed drag, not a teleport
	}
	await page.mouse.up();

	const elapsed_ms = Date.now() - t0;
	const after = (await client.send("Performance.getMetrics")).metrics;

	await page.evaluate(() => { window.__collecting = false; });
	const frames = await page.evaluate(() => window.__frames);

	const metric = (list, name) => list.find(m => m.name === name)?.value ?? 0;
	// TaskDuration is CDP's own cumulative "time the main thread spent working," in
	// seconds — the delta over the drag's wall-clock time is the CPU% figure the
	// owner's own bug report used ("108% CPU" from Chrome's own task manager).
	const cpu_pct = ((metric(after, "TaskDuration") - metric(before, "TaskDuration")) / (elapsed_ms / 1000)) * 100;

	let avg_frame_ms = null;
	if (frames.length > 1){
		const deltas = frames.slice(1).map((t, i) => t - frames[i]);
		avg_frame_ms = deltas.reduce((a, b) => a + b, 0) / deltas.length;
	}

	const line = `DataGrid perf: drag ${DRAG_PX}px across a 2,000-row grid — `
		+ `${avg_frame_ms != null ? avg_frame_ms.toFixed(2) + "ms/frame avg" : "no frames captured"} `
		+ `(${frames.length} frames over ${elapsed_ms}ms), CPU ${cpu_pct.toFixed(1)}% `
		+ `(target: 60fps / 16.6ms/frame)`;
	console.log(line);

	await close();
}

main().catch(e => { console.error("perf.mjs failed:", e); process.exitCode = 1; });
