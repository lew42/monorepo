// One-off proof script (one-input task): screenshots the composer surfaces at the four widths,
// headless, against the worktree's own private-port server. Run with:
//   node shots.mjs <label: before|after>
import { browser, close } from "file:///C:/Code/lew42/wt-refine-haiku-live/Server/browser.mjs";

const BASE = "http://127.0.0.1:58412";
const DIR = "C:/Code/lew42/wt-refine-haiku-live/public/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/one-input/proof";
const label = process.argv[2] || "after";
const WIDTHS = [400, 1200, 1920, 3440];

const PAGES = [
	{ name: "refine", url: "/framework/ext/Refine/", wait: ".refine-demo .chatbox-compose, .refine-demo textarea" },
	{ name: "dictate", url: "/framework/ux/Dictate/", wait: ".chatbox-compose" },
	{ name: "drawer-ai", url: "/framework/?drawer=ai", wait: ".chatbox-compose, .drawer" },
	{ name: "ai2-card", url: "/framework/ai2/", wait: "body" },
];

// A page crash anywhere in the loop keeps 404-noise (stray `.jsonl` lookups, this site's
// own by-design 404s — ext/Doc speculatively probes a child's page/settings/weight
// files) from losing every shot after it: each page+width gets its OWN context, closed
// right after, and a dead shared browser is relaunched rather than aborting the run.
const errors = [];
let b = await browser();
for (const pg of PAGES){
	for (const w of WIDTHS){
		let ctx, page;
		try {
			if (!b.isConnected()) b = await browser();
			ctx = await b.newContext({ viewport: { width: w, height: 1000 } });
			page = await ctx.newPage();
		} catch { b = await browser(); ctx = await b.newContext({ viewport: { width: w, height: 1000 } }); page = await ctx.newPage(); }
		// BY-DESIGN NOISE, not this task's business: the site's own nav/Doc layer speculatively
		// probes every sibling's `page.jsonl`/`weight.jsonl`/`settings.jsonl` and the frozen
		// `directory.json` (`DIRECTORY_JSON=off` on this private server) — confirmed with a
		// `page.on("response")` probe against `/framework/ext/Refine/` before vs after this task:
		// identical 404 set either way, nothing to do with the composer. Real console errors
		// (a thrown exception, a genuinely missing script) are never on this list.
		const BY_DESIGN_404 = /\/(page|weight|settings)\.jsonl$|\/directory\.json$|\/page-work\.json$/;
		const console_errors = [];
		page.on("response", r => { if (r.status() === 404 && !BY_DESIGN_404.test(r.url())) console_errors.push("404: " + r.url()); });
		page.on("console", msg => { if (msg.type() === "error" && !/Failed to load resource/.test(msg.text())) console_errors.push(msg.text()); });
		page.on("pageerror", e => console_errors.push(String(e)));
		try {
			await page.goto(BASE + pg.url, { waitUntil: "networkidle", timeout: 20000 });
			await page.waitForSelector(pg.wait, { timeout: 8000 }).catch(() => {});
			await page.waitForTimeout(500);
			const file = `${DIR}/${pg.name}-${w}-${label}.png`;
			await page.screenshot({ path: file, fullPage: w <= 1200 });
			console.log("shot:", file, console_errors.length ? `CONSOLE ERRORS: ${console_errors.join(" | ")}` : "console clean");
			if (console_errors.length) errors.push({ page: pg.name, w, console_errors });
		} catch (e){
			console.log("FAILED:", pg.name, w, String(e?.message ?? e));
			errors.push({ page: pg.name, w, error: String(e?.message ?? e) });
		} finally { await ctx?.close().catch(() => {}); }
	}
}
await close();
if (errors.length){ console.log("ERRORS SUMMARY:", JSON.stringify(errors, null, 2)); process.exitCode = 1; }
