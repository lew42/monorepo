// measure.mjs: the load cost of a few pages, headless. Requests, bytes, the slowest data files, and ms until the network is quiet.
//   node public/framework/ai/sessions/2026/11/09/spawned/mastermind-page-index/measure.mjs [base] [url...]
// Kept beside the task so the before/after numbers can be re-run (recursive-pages.md §7 lost its probe).
import Browser from "../../../../../../../../../Server/Browser.mjs";

const args = process.argv.slice(2);
const base = args[0]?.startsWith("http") ? args.shift() : "http://monorepo.localhost";
const urls = args.length ? args : ["/framework/ai/sessions/", "/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/", "/framework/"];

const b = await Browser.browser();
const out = [];
for (const url of urls){
	const ctx = await b.newContext(), page = await ctx.newPage();
	const rows = [];
	page.on("requestfinished", async req => {
		const res = await req.response().catch(() => null);
		let bytes = 0; try { bytes = (await res?.body())?.length ?? 0; } catch {}
		rows.push({ url: req.url().replace(base, ""), type: req.resourceType(), status: res?.status(), bytes });
	});
	const t0 = Date.now();
	await page.goto(base + url, { waitUntil: "load", timeout: 120000 });
	const load_ms = Date.now() - t0;
	await page.waitForLoadState("networkidle", { timeout: 120000 }).catch(() => {});
	const idle_ms = Date.now() - t0;
	await page.waitForTimeout(500);
	const data = rows.filter(r => /\.(jsonl?|md)(\?|$)/.test(r.url));
	const sum = a => a.reduce((n, r) => n + r.bytes, 0);
	const top = [...data].sort((a, b) => b.bytes - a.bytes).slice(0, 8).map(r => `${(r.bytes / 1024).toFixed(0)} KB ${r.url}`);
	const row = { url, requests: rows.length, scripts: rows.filter(r => r.type === "script").length, page_js: rows.filter(r => /\/page\.js(\?|$)/.test(r.url)).length, kb: Math.round(sum(rows) / 1024), data_requests: data.length, data_kb: Math.round(sum(data) / 1024),
		jsonl_requests: data.filter(r => /\.jsonl/.test(r.url)).length, load_ms, idle_ms, top };
	out.push(row);
	console.log(JSON.stringify(row, null, 1));
	await ctx.close();
}
await Browser.close();
