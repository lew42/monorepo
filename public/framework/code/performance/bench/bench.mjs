// Headless runner: serves public/ itself, runs every strategy, counts Layout/Style/Paint events from a Chrome trace.
// Usage: node bench.mjs [rounds]   Results -> results.jsonl beside this file. Doc: ../doc/batching.md
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "../../../../../Server/Browser.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const MIME = { ".js": "text/javascript", ".html": "text/html", ".css": "text/css" };
const server = http.createServer((req, res) => {
	const f = path.join(root, decodeURIComponent(req.url.split("?")[0]));
	if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404).end(); return; }
	res.writeHead(200, { "content-type": MIME[path.extname(f)] || "text/plain" }).end(fs.readFileSync(f));
}).listen(0);
const base = `http://localhost:${server.address().port}`;
const rounds = Number(process.argv[2]) || 5;

const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1200, height: 800 } })).newPage();
await page.goto(`${base}/framework/code/performance/bench/blank.html`);
await page.evaluate(async () => {
	window.Bench = (await import("/framework/code/performance/bench/Bench.js")).default;
});
const names = await page.evaluate(() => Object.keys(Bench.strategies));
const out = [];
for (const name of names){
	const runs = [];
	for (let i = 0; i < rounds; i++){
		await page.evaluate(() => { window.T = Bench.build(document.getElementById("host")); });
		await b.startTracing(page, { categories: ["devtools.timeline", "blink"] });
		const t = await page.evaluate(([n, i]) => Bench.time(n, T, i + 1), [name, i]);
		const buf = JSON.parse((await b.stopTracing()).toString());
		const ev = buf.traceEvents || buf;
		const count = (nm) => ev.filter(e => e.name === nm && e.ph === "X").length;
		const dur = (nm) => ev.filter(e => e.name === nm && e.ph === "X").reduce((a, e) => a + e.dur, 0) / 1000;
		runs.push({ ...t, layouts: count("Layout"), style_recalcs: count("UpdateLayoutTree"), paints: count("Paint"), layout_ms: dur("Layout") + dur("UpdateLayoutTree") });
	}
	const med = (k) => runs.map(r => r[k]).sort((a, b) => a - b)[Math.floor(runs.length / 2)];
	const row = { strategy: name, rounds, sync_ms: +med("sync_ms").toFixed(1), painted_ms: +med("painted_ms").toFixed(1), layouts: med("layouts"), style_recalcs: med("style_recalcs"), paints: med("paints"), layout_ms: +med("layout_ms").toFixed(1), at: new Date().toISOString() };
	out.push(row);
	console.log(JSON.stringify(row));
}
fs.appendFileSync(path.join(here, "results.jsonl"), out.map(r => JSON.stringify(r)).join("\n") + "\n");
await close(); server.close();
