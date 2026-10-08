// Computed-style fingerprint for the ai2.css → ux/Card split (merge 7).
// Loads each url, finds the first element matching each selector, and records a handful of
// computed properties that would catch a changed @layer order or a dropped rule (the trap
// this task's own plan.md names: "a changed @layer order can be invisible in one state and
// wrong in another... only the screenshot showed it"). Run once before the move, once after,
// and diff the two JSON files — anything other than a timestamp/number should read identical.
import { browser as launch } from "../../../../../../Server/browser.mjs";
import fs from "node:fs";

const BASE = "http://127.0.0.1:51490";
const OUT = process.argv[2] || "fingerprint-before.json";

// One selector per class range this task moves, picked from a page that actually draws it.
const TARGETS = [
	{ url: "/framework/ai2/", sel: ".ai2-word" },
	{ url: "/framework/ai2/", sel: ".ai2-clear" },
	{ url: "/framework/ai/2026/09/19/a-153628/", sel: ".page.ai2-card-page" },
	{ url: "/framework/ai/2026/09/19/a-153628/", sel: ".ai2-full" },
	{ url: "/framework/ai/2026/09/19/a-153628/", sel: ".ai2-full-title" },
	{ url: "/framework/ai/2026/09/19/a-153628/", sel: ".ai2-toc" },
	{ url: "/framework/ai/2026/09/19/a-153628/", sel: ".ai2-chip, .ai2-link" },
	{ url: "/framework/ai/2026/09/19/a-153628/", sel: ".ai2-reviewed" },
	{ url: "/framework/ai2/live/", sel: ".ai2-live-bars" },
	{ url: "/framework/ai2/live/", sel: ".ai2-live-item" },
	{ url: "/framework/ai2/live/", sel: ".ai2-proc-ram-svg" },
	{ url: "/framework/ai2/live/", sel: ".ai2-state" },
	{ url: "/framework/ai2/needs/", sel: ".ai2-need" },
	{ url: "/framework/ai2/needs/", sel: ".ai2-need-score" },
	{ url: "/framework/ai2/log/", sel: ".ai2-row" },
	{ url: "/framework/ai2/log/", sel: ".ai2-status-dot" },
	{ url: "/framework/ai2/", sel: ".ai2-overview, .ai2-ov-card" },
];

const PROPS = ["display", "position", "gridTemplateColumns", "flexDirection", "padding", "margin",
	"maxWidth", "borderInlineEnd", "color", "backgroundColor", "fontSize", "fontWeight", "opacity", "zIndex"];

const browser = await launch();
const results = [];
for (const t of TARGETS){
	const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
	try {
		await page.goto(BASE + t.url, { waitUntil: "networkidle", timeout: 20000 });
		await page.waitForTimeout(400);
		const found = await page.evaluate(({ sel, props }) => {
			const el = document.querySelector(sel);
			if (!el) return null;
			const cs = getComputedStyle(el);
			const out = {};
			for (const p of props) out[p] = cs[p];
			out.boundingWidth = Math.round(el.getBoundingClientRect().width);
			out.boundingHeight = Math.round(el.getBoundingClientRect().height);
			return out;
		}, { sel: t.sel, props: PROPS });
		results.push({ url: t.url, sel: t.sel, found: !!found, style: found });
	} catch (e){
		results.push({ url: t.url, sel: t.sel, found: false, error: String(e) });
	} finally {
		await page.close();
	}
}
await browser.close();

fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log("wrote", OUT, "-", results.filter(r => r.found).length, "/", results.length, "selectors matched");
