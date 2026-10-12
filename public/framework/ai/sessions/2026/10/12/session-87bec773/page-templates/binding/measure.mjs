// Run: node public/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/binding/measure.mjs
// Prints the binding benchmark (bench.mjs) twice: node with fake cells, then headless Chromium
// with real spans. Each strategy runs in a fresh process / page so memory is not shared.
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, dirname, extname } from "node:path";
import { Bench } from "./bench.mjs";

const here = fileURLToPath(import.meta.url);
const NAMES = ["plain", "every", "lazy", "item"];

// Child mode: one strategy, fake cells, exact GC.
if (process.argv[2] === "--one"){
	const bench = new Bench({ make: () => ({ text: "" }), text: (c, v) => { c.text = v; } });
	const mem = async () => { gc(); gc(); return process.memoryUsage().heapUsed; };
	console.log(JSON.stringify(await bench.run(process.argv[3], mem)));
	process.exit(0);
}

const table = (title, rows) => { console.log(`\n${title}`); console.table(rows); };

// 1. Node: fake cells, so this is the cost of the binding alone.
const RUNS = 3;
// The median of RUNS runs, metric by metric.
const median = runs => Object.fromEntries(Object.keys(runs[0]).map(k => [k, typeof runs[0][k] === "number" ? runs.map(r => r[k]).sort((a, b) => a - b)[runs.length >> 1] : runs[0][k]]));
const node_rows = NAMES.map(name => median(Array.from({ length: RUNS }, () => {
	const r = spawnSync(process.execPath, ["--expose-gc", here, "--one", name], { encoding: "utf8", windowsHide: true });
	if (r.status) throw new Error(r.stderr);
	return JSON.parse(r.stdout.trim().split("\n").at(-1));
})));
table(`node ${process.version}, ${Bench.ROWS} rows x ${Bench.FIELDS.length} cells, ${Bench.BOUND.length} bound (fake cells), median of ${RUNS}`, node_rows);

// 2. Chromium: real spans in a real grid, layout forced after each step.
const pub = join(dirname(here), "../../../../../../../../..");   // public/
const { browser, close } = await import(pathToFileURL(join(pub, "../Server/browser.mjs")).href);
const types = { ".js": "text/javascript", ".mjs": "text/javascript" };
const b = await browser({ args: ["--js-flags=--expose-gc", "--enable-precise-memory-info"] });
const rel = here.slice(pub.length).replace(/\\/g, "/").replace(/measure\.mjs$/, "bench.mjs");
const browser_rows = [];
for (const name of NAMES){ const runs = []; for (let run = 0; run < RUNS; run++){
	const page = await b.newPage();
	await page.route("http://localhost:59999/**", route => {
		const path = join(pub, decodeURIComponent(new URL(route.request().url()).pathname));
		if (!existsSync(path)) return route.fulfill({ status: 404, body: "" });
		route.fulfill({ status: 200, contentType: types[extname(path)] ?? "text/plain", body: readFileSync(path) });
	});
	// An empty same-origin page, so import() resolves; localhost is a secure context (Item needs crypto.randomUUID).
	await page.route("http://localhost:59999/blank", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><body></body>" }));
	await page.goto("http://localhost:59999/blank");
	runs.push(await page.evaluate(async ({ src, name }) => {
		const { Bench } = await import(src);
		const grid = document.body.appendChild(document.createElement("div"));
		grid.style.cssText = `display:grid;grid-template-columns:repeat(${Bench.FIELDS.length},auto)`;
		const bench = new Bench({
			make: () => grid.appendChild(document.createElement("span")),
			text: (c, v) => { c.textContent = v; },
			clear: () => grid.replaceChildren(),
			flush: () => grid.offsetHeight,
		});
		const mem = async () => { gc(); gc(); return performance.memory.usedJSHeapSize; };
		return bench.run(name, mem);
	}, { src: `http://localhost:59999${rel}`, name }));
	await page.close();
} browser_rows.push(median(runs)); }
const version = b.version();
await close();
table(`chromium ${version}, same grid, real spans, layout forced (JS heap only), median of ${RUNS}`, browser_rows);
