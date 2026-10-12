/* probe.mjs — the padding law, measured.
 *
 * WHAT IT ANSWERS: on every page, at every width, how close does any piece of
 * text come to an edge it should never touch? The edges are the nav rail's right
 * side, the viewport's two sides, the ToC column, and the inner edge of whatever
 * box the text is sitting in (a card, a panel, a region — anything that paints a
 * ground of its own or draws a border).
 *
 * THE LAW (the owner, 2026-09-22): "You never have zero padding with text."
 * So a gap of 0 is a violation. The threshold below is 4px, not 0, because a
 * sub-pixel grid rounding of 0.5px is not padding either.
 *
 * RUN IT:
 *   node probe.mjs --base http://localhost:59198 --out report.json
 *   node probe.mjs --base http://localhost:8123 --urls one.json --widths 3440
 *
 * Playwright is a GLOBAL npm module on this machine, not a repo dependency, so
 * it is imported by absolute file url — NODE_PATH does not help, ESM ignores it.
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import { MEASURE, FLOOR } from "../../../../../Server/padding-check.mjs";

// ── arguments ──────────────────────────────────────────────────────────────
const arg = (name, fallback) => {
	const i = process.argv.indexOf(`--${name}`);
	return i === -1 ? fallback : process.argv[i + 1];
};

const BASE    = arg("base", "http://localhost:59198");
const WIDTHS  = arg("widths", "400,1280,1920,3440").split(",").map(Number);
const OUT     = arg("out", path.join(process.cwd(), "padding-report.json"));
const URLFILE = arg("urls", null);
const LIMIT   = Number(arg("limit", 0));

// ── the page list ──────────────────────────────────────────────────────────
// Every child named in public/framework/page.js's `children:`, one level below
// each of those, and the three extras the brief names. Two numbers that must
// agree: pages listed here, pages the run actually probed.
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(1)), "../../../../..");
const PUBLIC = path.join(REPO, "public");

function declared_children(dir){
	const file = path.join(PUBLIC, dir, "page.js");
	if (!fs.existsSync(file)) return [];
	// The real declaration is a whole line of its own: `children: "a b c",`.
	// Anything quoted inside a code() demo sits mid-line and is skipped.
	for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
		const m = line.match(/^\s*children:\s*"([^"]+)"\s*,?\s*$/);
		if (m) return m[1].split(/\s+/).filter(Boolean);
	}
	return [];
}

function page_list(){
	const urls = ["/framework/"];
	const seen = new Set(urls);
	const add = u => { if (!seen.has(u)) { seen.add(u); urls.push(u); } };
	for (const child of declared_children("framework")) {
		const dir = `framework/${child}`;
		if (!fs.existsSync(path.join(PUBLIC, dir, "page.js"))) continue;
		add(`/${dir}/`);
		for (const grand of declared_children(dir))
			if (fs.existsSync(path.join(PUBLIC, dir, grand, "page.js"))) add(`/${dir}/${grand}/`);
	}
	for (const extra of ["/framework/ai/days/", "/framework/ai2/", "/framework/styles/system/"]) add(extra);
	return urls;
}

const URLS = URLFILE ? JSON.parse(fs.readFileSync(URLFILE, "utf8")) : page_list();
const LISTED = URLS.length;
const TODO = LIMIT ? URLS.slice(0, LIMIT) : URLS;

// ── the measurement ────────────────────────────────────────────────────────
// NOT defined here. The law has ONE definition, in Server/padding-check.mjs, so
// this probe and the page-health watcher and any minion's pre-landing check all
// measure the same thing. Read that file's header for what counts as an edge.

// ── the run ────────────────────────────────────────────────────────────────
/** One width's whole sweep, in its own tab. The four widths run side by side —
 *  sequentially the 107 pages took 11s each and the run was an hour. */
async function sweep(browser, width, rows){
	const page = await browser.newPage({ viewport: { width, height: 1200 } });
	for (const url of TODO) {
		let row;
		try {
			// `domcontentloaded`, not `load`: the AI dashboards keep fetching jsonl
			// long after the layout has settled, and the layout is all we measure.
			await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 30000 });
			await page.waitForSelector(".page.active-page, .pages > .default", { timeout: 10000 }).catch(() => {});
			await page.waitForTimeout(400);
			row = await page.evaluate(MEASURE, { floor: FLOOR });
		} catch (e) {
			row = { error: String(e).split("\n")[0].slice(0, 120) };
		}
		row.url = url; row.width = width;
		rows.push(row);
		console.log(JSON.stringify(row));
	}
	await page.close();
}

async function main(){
	const browser = await chromium.launch();
	const rows = [];

	await Promise.all(WIDTHS.map(w => sweep(browser, w, rows)));
	const probed = new Set(rows.map(r => r.url)).size;

	await browser.close();

	const bad = rows.filter(r => r.violations > 0);
	const report = {
		base: BASE, at: new Date().toISOString(), widths: WIDTHS,
		pages_listed: LISTED, pages_probed: probed,
		measurements: rows.length,
		pages_with_violations: new Set(bad.map(r => r.url)).size,
		violations_by_width: Object.fromEntries(WIDTHS.map(w => [w, rows.filter(r => r.width === w && r.violations > 0).length])),
		rows,
	};
	fs.writeFileSync(OUT, JSON.stringify(report, null, 1));

	// The table: smallest gap first.
	const table = rows.filter(r => r.min_gap !== null && r.min_gap !== undefined)
		.sort((a, b) => a.min_gap - b.min_gap).slice(0, 40);
	console.log("\n  gap   width  page                                        worst text");
	for (const r of table)
		console.log(`${String(r.min_gap).padStart(6)}  ${String(r.width).padStart(5)}  ${r.url.padEnd(42).slice(0, 42)}  ${(r.worst[0]?.text || "").slice(0, 34)}`);
	console.log(`\npages listed ${LISTED} / pages probed ${probed} — ${rows.length} measurements, ${report.pages_with_violations} pages with text under ${FLOOR}px from an edge`);
	console.log(`violations per width: ${JSON.stringify(report.violations_by_width)}`);
	console.log(`report: ${OUT}`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) await main();
