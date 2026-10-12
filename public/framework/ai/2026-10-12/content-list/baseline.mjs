// node baseline.mjs <label> [port]   → saves state + screenshots under $OUT/<label>/ ; node baseline.mjs diff <a> <b>
// Replay state = every Page in Page.log_pages (the jsonl pages) plus the routed chain, serialised; DOM = a normalised outline.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { browser, close } from "../../../../../Server/browser.mjs";

const OUT = process.env.OUT ?? path.join(process.env.TEMP, "content-list");
// New ability by design: these differ between old and new code; diff skips them.
const NEW = new Set(["/framework/core/Page/content/both/"]);
const WIDTHS = [400, 1200, 1920, 3440];
const FULL = new Set(["/framework/core/Page/content/", "/framework/core/Page/content/string-1/", "/framework/core/Page/content/address-1/", "/framework/core/Page/content/class-body/", "/framework/core/Page/content/code/", "/framework/core/Page/", "/framework/ai/", "/imagine/paging/", "/framework/core/Page/overview/columns/", "/framework/ext/markdown/open/", "/framework/core/Page/parts/example/", "/framework/ai/2026-10-12/page-ai-api/build/", "/framework/ai/sessions/"]);

const URLS = [
	"/framework/", "/framework/core/", "/framework/core/Page/", "/framework/core/View/", "/framework/core/Router/", "/framework/core/App/",
	"/framework/core/Page/overview/columns/", "/framework/core/Page/overview/tabs/", "/framework/core/Page/overview/rail/", "/framework/core/Page/overview/wall/",
	"/framework/core/Page/overview/grid/", "/framework/core/Page/overview/prose/", "/framework/core/Page/overview/width/", "/framework/core/Page/overview/site/",
	"/framework/core/Page/parts/", "/framework/core/Page/parts/example/", "/framework/core/Page/jsonl/", "/framework/core/Page/jsonl/live/",
	"/framework/ai/", "/framework/ai/sessions/", "/framework/ai/sessions/2026/10/", "/framework/ai/cards/", "/framework/ai/rail/", "/framework/ai/classes/",
	"/framework/ai/2026-10-12/page-ai-api/build/", "/framework/ai/2026-10-12/page-split-2/", "/framework/ai/2026-10-12/page-split-3/", "/framework/ai/2026-10-12/",
	"/framework/ext/markdown/open/", "/framework/ext/markdown/open/columns/", "/framework/ext/JSONL/", "/framework/ext/Refine/",
	"/framework/core/Page/content/", "/framework/core/Page/content/code/", "/framework/core/Page/content/class-body/",
	"/framework/core/Page/content/string-1/", "/framework/core/Page/content/string-2/", "/framework/core/Page/content/string-3/", "/framework/core/Page/content/string-4/", "/framework/core/Page/content/string-5/",
	"/framework/core/Page/content/address-1/", "/framework/core/Page/content/address-2/", "/framework/core/Page/content/address-3/", "/framework/core/Page/content/address-4/", "/framework/core/Page/content/address-5/",
	"/framework/core/Page/tool/", "/framework/ai/sessions/2026/10/03/71eead80-a869-421f-83bb-eba7ff83510e/task/", "/framework/ai/sessions/2026/10/12/session-3c35b6e2/seeds/",
	"/framework/core/Page/content/both/",
	"/imagine/paging/", "/imagine/paging/arrangement/", "/imagine/", "/framework/ux/Dictate/", "/framework/ux/Inbox/", "/framework/ui/", "/framework/styles/", "/web/",
];

const outline = `(() => {
	const walk = (el, depth) => depth > 12 ? "" : "<" + el.tagName.toLowerCase() + "." + [...el.classList].filter(c => !/^(active|hover|focus)/.test(c)).sort().join(".") + ">" + [...el.children].map(c => walk(c, depth + 1)).join("");
	return walk(document.body, 0);
})()`;

const state = async () => {
	const { default: Page } = await import("/framework/core/Page/Page.class.js").then(m => ({ default: m.Page ?? m.default }));
	const ser = page => ({
		url: page.url, name: page.name, title: page.title, nav: page.navigation, width: page.width, arr: page.arrangement, surface: page.surface, bg: page.background, ts: page.type_size,
		lines: page.jsonl_lines, listed: [...page.listed ?? []], placed: page.placed, kinds: [...page.child_kinds ?? []], tabs: [...page.tabs_state ?? []],
		children: [...page.children.keys()], data: page.data, unknown: page.unknown, contents: (page.content?.items ?? []).filter(i => !i.transient).length,
		jsonl_url: page.jsonl_url, has_view: !!page.view,
	});
	const logs = [...Page.log_pages ?? []].map(([k, p]) => [k, ser(p)]).sort((a, b) => a[0].localeCompare(b[0]));
	const chain = (window.app?.router?.chain?.() ?? []).map(p => p.url);
	return { logs, chain, path: location.pathname };
};

async function run(label, base){
	const dir = path.join(OUT, label);
	fs.mkdirSync(dir, { recursive: true });
	const b = await browser();
	const summary = {};
	for (const url of URLS){
		const key = url.replace(/\W+/g, "_");
		const rec = { errors: [], shots: {} };
		for (const w of WIDTHS){
			if (w !== 1200 && !FULL.has(url)) continue;
			const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
			await ctx.clock.setFixedTime(new Date("2026-10-12T12:00:00-05:00"));   // page clocks stop being diff noise
			const page = await ctx.newPage();
			const errors = [];
			page.on("pageerror", e => errors.push("pageerror: " + String(e.message).slice(0, 200)));
			page.on("console", m => { if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
			try {
				await page.goto(base + url, { waitUntil: "load", timeout: 30000 });
				await page.waitForTimeout(1800);
				if (w === 1200){
					rec.state = await page.evaluate(state).catch(e => ({ error: String(e) }));
					rec.outline = crypto.createHash("md5").update(await page.evaluate(outline)).digest("hex");
					rec.lines = (await page.evaluate(() => document.body.innerText)).split("\n");
					rec.text = crypto.createHash("md5").update(rec.lines.join("\n")).digest("hex");
				}
				const png = await page.screenshot({ path: path.join(dir, `${key}-${w}.png`) });
				rec.shots[w] = crypto.createHash("md5").update(png).digest("hex");
			} catch (e){ errors.push("load: " + e.message.slice(0, 200)); }
			rec.errors.push(...errors.map(e => `${w}: ${e}`));
			await ctx.close();
		}
		summary[url] = rec;
		console.log(url, rec.errors.length ? "ERR " + rec.errors.length : "ok", Object.keys(rec.shots).length + " shots", rec.state?.logs?.length ?? "-" + " logs");
	}
	fs.writeFileSync(path.join(dir, "summary.json"), JSON.stringify(summary, null, 1));
	await close();
}

function diff(a, c){
	const A = JSON.parse(fs.readFileSync(path.join(OUT, a, "summary.json"))), C = JSON.parse(fs.readFileSync(path.join(OUT, c, "summary.json")));
	let state = 0, outline = 0, text = 0, shots = 0, errs = 0, total = 0;
	for (const url of URLS){
		if (NEW.has(url)) continue;
		const x = A[url], y = C[url];
		if (!x || !y) { console.log("MISSING", url); continue; }
		total++;
		const sd = JSON.stringify(x.state) !== JSON.stringify(y.state), od = x.outline !== y.outline, td = x.text !== y.text;
		const shd = Object.keys(x.shots).filter(w => x.shots[w] !== y.shots[w]);
		const ed = JSON.stringify(x.errors) !== JSON.stringify(y.errors);
		if (sd) state++; if (od) outline++; if (td) text++; if (shd.length) shots += shd.length; if (ed) errs++;
		if (sd || od || td || shd.length || ed) console.log(url, { state: sd, outline: od, text: td, shots: shd, errors: ed ? [x.errors, y.errors] : false });
		if (td && x.lines && y.lines){
			const gone = x.lines.filter(l => !y.lines.includes(l)).slice(0, 4), came = y.lines.filter(l => !x.lines.includes(l)).slice(0, 4);
			console.log("   lines -", JSON.stringify(gone), "+", JSON.stringify(came));
		}
	}
	console.log(`\n${total} pages: ${state} state diffs, ${outline} outline diffs, ${text} text diffs, ${shots} screenshot diffs, ${errs} error diffs`);
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === "diff") diff(a, b);
else await run(cmd, `http://localhost:${a ?? 51858}`);
