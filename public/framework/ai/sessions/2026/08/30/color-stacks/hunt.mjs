/* THE INVISIBLE-PAIRS HUNT
 *
 * Loads every page in PAGES, reads every button / pill / tag / badge / chip / inline code,
 * composites its fill against the floor actually beneath it, and flags the pairs whose
 * ΔL* is under the bar.
 *
 *   node hunt.mjs [origin]          → writes ../../../styles/stacks/hunt.json
 *   node hunt.mjs [origin] --cal    → calibration only: the worst 20, unfiltered
 *
 * ⚠ The maths is IMPORTED FROM THE PAGE (`/framework/styles/stacks/stacks.js`), not
 *   reimplemented here. The scan's number and the matrix's number are produced by the same
 *   function, so the two cannot drift — which is the only reason the counts are comparable.
 *
 * Needs a dev server. Start a private one rather than touching the owner's:
 *   $env:PORT='8097'; node server.js
 */
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ORIGIN = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://127.0.0.1:8097";
const CAL = process.argv.includes("--cal");
const BAR = 3;

const PAGES = `/
/framework/ /framework/start/ /framework/core/ /framework/ext/ /framework/ui/ /framework/util/
/framework/ux/ /framework/dev/ /framework/styles/ /framework/styles/elements/
/framework/styles/layers/ /framework/styles/layouts/ /framework/styles/rules/
/framework/styles/sections/ /framework/styles/stacks/ /framework/faq/ /framework/versus/
/framework/research/ /framework/audit/ /framework/audit/browsable/ /framework/start/example/
/framework/core/App/ /framework/core/Item/ /framework/core/List/ /framework/core/Page/
/framework/core/Router/ /framework/core/Sidebar/ /framework/core/View/
/framework/dev/Claim/ /framework/dev/DevBar/ /framework/dev/Socket/
/framework/ext/AITask/ /framework/ext/Ask/ /framework/ext/DesignTool/ /framework/ext/Doc/
/framework/ext/Draggable/ /framework/ext/Dropdown/ /framework/ext/JSONL/ /framework/ext/Panel/
/framework/ext/Playground/ /framework/ext/Research/ /framework/ext/Saver/ /framework/ext/Timeline/
/framework/ext/catalog/ /framework/ext/demo/ /framework/ext/depth/ /framework/ext/drawer/
/framework/ext/editor/ /framework/ext/files/ /framework/ext/grip/ /framework/ext/highlight/
/framework/ext/layout/ /framework/ext/markdown/ /framework/ext/tabs/ /framework/ext/toc/
/web/ /web/layout/ /web/nav/
/blog/ /blog/doc/ /blog/framework/ /blog/systems/ /blog/framework/hello-lew42/
/blog/systems/layout-generators/
/imagine/ /imagine/blogx/ /imagine/decks/ /imagine/feeds/ /imagine/gallery/ /imagine/mag/
/imagine/scenes/ /imagine/screens/ /imagine/shells/ /imagine/vary/ /imagine/youtube/`
	.split(/\s+/).filter(Boolean);

/* The fill vocabulary — what the owner's complaint is ABOUT. Floors (`.surface`, `.wash`,
 * a panel) are deliberately not in here: a floor is allowed to match its neighbour.
 *
 * ⚠ The badge half is a class-TOKEN test, not `[class*=tag]`. The attribute form matched
 *   `.demo-stage`, `.home-stage` and `.panel-workspace-stage` — s-TAG-e — and three of the
 *   first calibration's worst twenty were region floors wearing no chip at all. */
const SELECTOR = "button, .btn, code";
const BADGE = /(^|-)(chip|pill|tag|tags|badge)s?(-|$)/;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });

const rows = [];
let visited = 0, read = 0;

for (const url of PAGES){
	const page = await ctx.newPage();
	try {
		await page.goto(ORIGIN + url, { waitUntil: "networkidle", timeout: 20000 });
		await page.waitForTimeout(500);
		const found = await page.evaluate(async ([sel, badge, origin]) => {
			const M = await import(origin + "/framework/styles/stacks/stacks.js");
			const re = new RegExp(badge);
			const set = new Set(document.querySelectorAll(sel));
			for (const el of document.querySelectorAll("[class]"))
				if ([...el.classList].some(c => re.test(c))) set.add(el);
			const out = [];
			for (const el of set){
				const r = el.getBoundingClientRect();
				if (r.width < 4 || r.height < 4) continue;              // not rendered
				const c = getComputedStyle(el);
				if (c.visibility === "hidden" || +c.opacity < 0.5) continue;
				if (el.closest("pre")) continue;                        // `code` inside a block has no chip
				const floor = M.floorOf(el);
				const v = M.visibility(el, floor);
				out.push({
					sel: (el.tagName.toLowerCase() + (el.className && typeof el.className === "string"
						? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "")).slice(0, 44),
					fill: M.hex(v.fill), floor: M.hex(v.floor),
					edge: +v.edge.toFixed(2), via: v.via, text: +v.text.toFixed(2),
				});
			}
			return out;
		}, [SELECTOR, BADGE.source, ORIGIN]);
		visited++; read += found.length;
		found.forEach(f => rows.push({ page: url, ...f }));
		process.stdout.write(".");
	} catch (e) {
		process.stdout.write("x");
	}
	await page.close();
}
await browser.close();
console.log("\n" + visited + " pages, " + read + " fills read");

/* One component repeated forty times on a page is ONE defect, not forty — group by the
 * thing that would be fixed (page + class + the two colours) and carry the count. */
const key = r => [r.page, r.sel, r.fill, r.floor].join("|");
const groups = new Map();
for (const r of rows){
	const g = groups.get(key(r));
	if (g) g.n++; else groups.set(key(r), { ...r, n: 1 });
}
/* Ties broken by INSTANCE COUNT, descending. A hundred pairs sitting at exactly 0.00 is
 * what the data looks like, so "worst first" is meaningless on its own — the useful order
 * is biggest-win-first, which is what a fix list is. */
const all = [...groups.values()].sort((a, b) => a.edge - b.edge || b.n - a.n);

if (CAL){
	console.log("--- distribution of dL* (distinct pairs) ---");
	[0, 0.5, 1, 2, 3, 4, 5, 8, 15, 1e9].forEach((hi, i, a) => {
		if (!i) return;
		const n = all.filter(r => r.edge >= a[i - 1] && r.edge < hi).length;
		console.log(("[" + a[i - 1] + ", " + (hi > 1e8 ? "inf" : hi) + ")").padStart(12), String(n).padStart(5));
	});
	console.log("\n--- worst 24, UNFILTERED ---");
	all.slice(0, 24).forEach(r => console.log(String(r.edge).padStart(6), r.via.padEnd(7), ("x" + r.n).padStart(4), r.fill, "on", r.floor, " ", r.sel.padEnd(30), r.page));
	console.log("\n--- the band just above the bar (3 to 5), the calibration's other side ---");
	all.filter(r => r.edge >= 3 && r.edge < 5).slice(0, 8).forEach(r => console.log(String(r.edge).padStart(6), r.via.padEnd(7), r.fill, "on", r.floor, " ", r.sel.padEnd(30), r.page));
	process.exit(0);
}

const flagged = all.filter(r => r.edge < BAR);
const out = {
	at: new Date().toISOString(),
	bar: BAR, metric: "dL* of max(fill, border, inset ring) against the composited floor",
	mode: "light", width: 1440,
	pages: visited, elements: read,
	distinct: all.length,
	flagged: flagged.length,
	instances: flagged.reduce((s, r) => s + r.n, 0),
	worst: flagged,
};
const dest = join(dirname(fileURLToPath(import.meta.url)), "../../../styles/stacks/hunt.json");
writeFileSync(dest, JSON.stringify(out, null, 1));
console.log(out.flagged + " distinct invisible pairs (" + out.instances + " instances) of " + all.length + " distinct → " + dest);
all.slice(0, 12).forEach(r => console.log(String(r.edge).padStart(6), r.via.padEnd(7), ("x" + r.n).padStart(4), r.fill, "on", r.floor, " ", r.sel, " ", r.page));
