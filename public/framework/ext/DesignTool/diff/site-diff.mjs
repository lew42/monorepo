#!/usr/bin/env node
/* site-diff — one command that shows what changed on the site since the last
 * landing. Node only, run from anywhere:
 *
 *   node site-diff.mjs baseline --out <dir> [--pages <n>] [--widths 1280,3440] [--all]
 *   node site-diff.mjs compare  --baseline <dir> --out <dir>
 *
 * `baseline` shoots a representative set of pages (default 40 — see PAGES below)
 * at each width and writes `<dir>/<slug>@<width>.png` plus `manifest.json`.
 * `compare` shoots the SAME set again (read out of the baseline's own manifest,
 * so a re-run always compares like for like) and writes `report.json` — pixels
 * changed, new console errors, new sideways scroll, new x:0 framed boxes — plus
 * a one-line summary to stdout. Exits non-zero when anything got WORSE (new
 * errors or new sideways scroll appeared) — a changed pixel alone is not a
 * failure, a human still looks at the picture.
 *
 * ⚠ Playwright resolves from the GLOBAL npm install, never a project dependency
 * — this repo has none, on purpose (CLAUDE.md: no new npm dependency). Never
 * search the disk for it; the url below is the one place it is allowed to live.
 *
 * doc: readme.md beside this file — the baseline-dir convention (never the repo).
 */
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";

// ════ THE DEFAULT 40 ══════════════════════════════════════════════════════
// Not a random sample — one of each KIND of page the site has, so a shared-CSS
// change that breaks one kind shows up even in the default run. Picked by hand
// 2026-09-06 against the live tree (see readme.md for how each slot was chosen):
// home; the four realms besides blog/notes (Framework, Web, Imagine, Résumé);
// paging's front + library + one mechanism; the layout tree + one layout; one
// Doc page; one Research page; blog front + one post; the notes wall + two
// notes; the platform hub + mvp; the size/spacing/controls pages; a spread of
// styles/layouts/*.
export const PAGES = [
	"/",
	"/framework/", "/web/", "/imagine/", "/resume/",
	"/imagine/paging/", "/imagine/paging/library/", "/imagine/paging/mechanisms/expand/",
	"/framework/styles/layouts/", "/framework/styles/layouts/grid/",
	"/framework/ext/DesignTool/", "/framework/ext/Research/",
	"/blog/", "/blog/framework/hello-lew42/",
	"/notes/", "/notes/just-a-note/", "/notes/scale-1920-to-3413/",
	"/imagine/platform/", "/imagine/platform/mvp/",
	"/imagine/design/size/", "/imagine/design/spacing/", "/imagine/design/controls/",
	"/framework/styles/layouts/400/", "/framework/styles/layouts/anatomy/",
	"/framework/styles/layouts/bold-editorial/", "/framework/styles/layouts/carousel/",
	"/framework/styles/layouts/cols/", "/framework/styles/layouts/dashboard/",
	"/framework/styles/layouts/docs/", "/framework/styles/layouts/feed/",
	"/framework/styles/layouts/flex/", "/framework/styles/layouts/gallery/",
	"/framework/styles/layouts/hero/", "/framework/styles/layouts/landing/",
	"/framework/styles/layouts/masonry/", "/framework/styles/layouts/overlay/",
	"/framework/styles/layouts/pricing/", "/framework/styles/layouts/sidebar/",
	"/framework/styles/layouts/split/", "/framework/styles/layouts/wire/",
];

// ════ MASKS ═══════════════════════════════════════════════════════════════
// Known-dynamic regions — painted flat before every screenshot so a live clock
// never counts as a "change". Add a line here, never a special case in the diff.
export const MASKS = [
	{ name: "framework live clock", selector: ".panel-t-clock" },
];

// ════ ARGS ════════════════════════════════════════════════════════════════
const argv = process.argv.slice(2);
const cmd = argv[0];
const has = n => argv.includes("--" + n);
const flag = (n, d) => { const i = argv.indexOf("--" + n); return i < 0 || i === argv.length - 1 ? d : argv[i + 1]; };
const list = (n, d) => String(flag(n, d)).split(",").map(s => s.trim()).filter(Boolean);

const HEIGHT = { 390: 844, 1280: 800, 3440: 1440 };
const vh = w => HEIGHT[w] ?? Math.round(w * 0.5);

main().catch(e => { console.error(e); process.exit(1); });

async function main(){
	if (cmd === "baseline") return runBaseline();
	if (cmd === "compare") return runCompare();
	console.log("usage:\n  node site-diff.mjs baseline --out <dir> [--pages <n>] [--widths 1280,3440] [--all] [--server url] [--inject \"css\"]\n"
		+ "  node site-diff.mjs compare  --baseline <dir> --out <dir> [--server url] [--inject \"css\"]");
	process.exitCode = 1;
}

// ════ BASELINE ════════════════════════════════════════════════════════════
async function runBaseline(){
	const out = must(flag("out", null), "--out <dir> is required");
	fs.mkdirSync(out, { recursive: true });

	const server = flag("server", "http://localhost:8123").replace(/\/+$/, "");
	const widths = list("widths", "1280,3440").map(Number);
	const inject = flag("inject", null);
	const nRaw = flag("pages", null);

	let pages = PAGES;
	if (has("all")) pages = await corpus(server);
	else if (nRaw) pages = await pagesForN(Number(nRaw), server);

	const jobs = [];
	for (const width of widths) for (const url of pages) jobs.push({ url, width });

	console.log(`baseline: ${pages.length} pages × ${widths.length} widths = ${jobs.length} shots → ${out}`);
	const t0 = Date.now();

	const browser = await chromium.launch();
	let results;
	try { results = await shoot(browser, jobs, { server, inject, outDir: out }); }
	finally { await browser.close(); }

	fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify({
		at: new Date().toISOString(), server, widths, masks: MASKS.map(m => m.name),
		inject: inject || null, pages: results,
	}, null, 2));

	const secs = ((Date.now() - t0) / 1000).toFixed(1);
	const errPages = results.filter(r => r.console_errors).length;
	console.log(`done in ${secs}s · ${results.length} shots · ${errPages} pages with console errors → ${path.join(out, "manifest.json")}`);
}

// ════ COMPARE ═════════════════════════════════════════════════════════════
async function runCompare(){
	const baselineDir = path.resolve(must(flag("baseline", null), "--baseline <dir> is required"));
	const out = path.resolve(must(flag("out", null), "--out <dir> is required"));
	const manifestFile = path.join(baselineDir, "manifest.json");
	if (!fs.existsSync(manifestFile)) throw new Error(`no manifest.json in ${baselineDir} — run baseline first`);
	const base = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
	fs.mkdirSync(out, { recursive: true });

	const server = flag("server", base.server || "http://localhost:8123").replace(/\/+$/, "");
	const inject = flag("inject", null);
	// The SAME set the baseline shot, read out of its own manifest — never a
	// freshly-picked list, or "compare" and "baseline" could silently drift apart.
	const jobs = base.pages.map(p => ({ url: p.url, width: p.width }));

	console.log(`compare: ${jobs.length} shots against ${path.basename(baselineDir)} → ${out}`);
	const t0 = Date.now();

	const browser = await chromium.launch();
	let rows;
	try {
		const results = await shoot(browser, jobs, { server, inject, outDir: out });
		rows = await diffAll(browser, base, results, baselineDir, out);
	} finally { await browser.close(); }

	rows.sort((a, b) => (b.pixels_changed ?? -1) - (a.pixels_changed ?? -1));

	const changedUrls = new Set(rows.filter(r => r.changed).map(r => r.url));
	const newErrors = rows.reduce((n, r) => n + (r.new_console_errors || 0), 0);
	const newSideways = rows.filter(r => r.new_sideways_scroll).length;
	const summary = {
		total_pages: new Set(rows.map(r => r.url)).size,
		changed_pages: changedUrls.size,
		new_console_errors: newErrors,
		new_sideways_scroll: newSideways,
		text: `${changedUrls.size} of ${new Set(rows.map(r => r.url)).size} pages changed; ${newErrors} new errors`,
	};

	fs.writeFileSync(path.join(out, "report.json"), JSON.stringify({
		at: new Date().toISOString(), baseline: baselineDir, server, inject: inject || null, summary, rows,
	}, null, 2));

	printTable(rows);
	const secs = ((Date.now() - t0) / 1000).toFixed(1);
	console.log(`\n${summary.text} · ${secs}s → ${path.join(out, "report.json")}`);

	if (newErrors > 0 || newSideways > 0) process.exitCode = 1;
}

function printTable(rows){
	const cell = (s, n) => String(s ?? "").padEnd(n).slice(0, n);
	console.log(cell("url", 46) + cell("w", 6) + cell("px changed", 12) + cell("%", 8) + cell("new err", 9) + cell("new scroll", 11) + "framed Δ");
	for (const r of rows){
		if (r.error){ console.log(cell(r.url, 46) + cell(r.width, 6) + "ERROR: " + r.error); continue; }
		console.log(cell(r.url, 46) + cell(r.width, 6) + cell(r.pixels_changed, 12) + cell(r.pct_changed + "%", 8)
			+ cell(r.new_console_errors || "", 9) + cell(r.new_sideways_scroll ? "YES" : "", 11) + (r.framed_x0_delta || 0));
	}
}

function must(v, msg){ if (!v) throw new Error(msg); return v; }

// ════ THE SHOOT ═══════════════════════════════════════════════════════════
// One browser, ≤4 pages at a time. Each worker owns one page and recycles it
// every 30 navigations (headless Chrome wedges after ~85–110 — DesignTool/readme.md).
async function shoot(browser, jobs, { server, inject, outDir }){
	const queue = jobs.slice();
	const results = [];
	const workers = Math.max(1, Math.min(4, queue.length));

	await Promise.all(Array.from({ length: workers }, () => worker()));
	return results;

	async function worker(){
		let page = await browser.newPage();
		let navs = 0;
		while (queue.length){
			const job = queue.shift();
			if (!job) break;
			if (++navs > 30){ await page.close(); page = await browser.newPage(); navs = 1; }
			results.push(await shootOne(page, job, { server, inject, outDir }));
		}
		await page.close();
	}
}

async function shootOne(page, { url, width }, { server, inject, outDir }){
	const errors = [];
	const onConsole = msg => { if (msg.type() === "error") errors.push(msg.text().slice(0, 200)); };
	const onPageError = e => errors.push(String(e).slice(0, 200));
	page.on("console", onConsole);
	page.on("pageerror", onPageError);

	const slug = slugify(url);
	const file = `${slug}@${width}.png`;

	try {
		await page.setViewportSize({ width, height: vh(width) });
		const res = await page.goto(server + url, { waitUntil: "load", timeout: 20000 });   // ⚠ never networkidle — a live-reload socket never idles
		const status = res?.status() ?? null;

		// ⚠ A missing page is HTTP 200 — the SPA fallback serves index.html and
		// core/App renders "Page Load Error" inside it (vision/run.mjs, same trap).
		const dead = await page.evaluate(() => document.querySelector(".active-page pre.error")?.textContent || null);

		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(400);
		if (inject) await page.addStyleTag({ content: inject });

		// Blank every masked region — painted over on the LIVE page, so it bakes
		// into the screenshot pixels for both baseline and compare alike.
		await page.evaluate(sels => {
			for (const sel of sels) document.querySelectorAll(sel).forEach(el => {
				const r = el.getBoundingClientRect();
				if (!r.width || !r.height) return;
				const box = document.createElement("div");
				Object.assign(box.style, { position: "fixed", left: r.left + "px", top: r.top + "px",
					width: r.width + "px", height: r.height + "px", background: "#8a8a8a",
					zIndex: 2147483647, pointerEvents: "none" });
				document.documentElement.appendChild(box);
			});
		}, MASKS.map(m => m.selector));

		const metrics = await page.evaluate(measureInPage);
		const buf = await page.screenshot();
		fs.writeFileSync(path.join(outDir, file), buf);

		return { url, width, file, status, dead: dead ? dead.trim().slice(0, 120) : null,
			console_errors: errors.length, errors: errors.slice(0, 5),
			scroll_width: metrics.scroll_width, client_width: metrics.client_width,
			sideways: metrics.scroll_width > metrics.client_width + 1, framed_x0: metrics.framed_x0 };
	} catch (e){
		return { url, width, file: null, error: String(e.message || e).slice(0, 200), console_errors: errors.length };
	} finally {
		page.off("console", onConsole);
		page.off("pageerror", onPageError);
	}
}

// Runs INSIDE the page. Does a box draw an edge the text could butt against, at
// the very left of the viewport? — a compact copy of DesignTool/probe.js's
// `framed()`, not an import: this runs in plain Node-launched Playwright, not
// through the app, and the only thing needed here is the one count.
function measureInPage(){
	const d = document.documentElement;
	const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
	let framed_x0 = 0, seen = 0;
	for (const el of document.querySelectorAll("body *")){
		if (SKIP.has(el.tagName)) continue;
		if (++seen > 6000) break;   // a cap, not a sample — DesignTool/doc/cost.md's quadratic trap
		const r = el.getBoundingClientRect();
		if (Math.round(r.left) !== 0 || r.width === 0 || r.height === 0) continue;
		const cs = getComputedStyle(el);
		const bg = cs.backgroundColor;
		const painted = bg && bg !== "transparent" && !/rgba\(0, 0, 0, 0\)/.test(bg);
		const bordered = ["Top", "Right", "Bottom", "Left"]
			.some(s => parseFloat(cs["border" + s + "Width"]) > 0 && cs["border" + s + "Style"] !== "none");
		if (painted || bordered) framed_x0++;
	}
	return { scroll_width: d.scrollWidth, client_width: d.clientWidth, framed_x0 };
}

function slugify(url){
	const s = url.replace(/^\/+|\/+$/g, "");
	return s ? s.replace(/\//g, "-") : "home";
}

// ════ THE DIFF ════════════════════════════════════════════════════════════
// One extra page, used only after every content page has closed (never adds to
// the ≤4 concurrent budget above) — its canvas does the pixel compare, so this
// script never needs a PNG-decoding dependency of its own.
async function diffAll(browser, base, curResults, baselineDir, outDir){
	const lab = await browser.newPage();
	const byKey = new Map(curResults.map(r => [r.url + "|" + r.width, r]));
	const rows = [];

	for (const b of base.pages){
		const cur = byKey.get(b.url + "|" + b.width);
		const row = { url: b.url, width: b.width };

		if (!cur){ row.error = "not re-shot this run"; rows.push(row); continue; }
		if (cur.error){ row.error = cur.error; rows.push(row); continue; }

		if (b.file && cur.file && fs.existsSync(path.join(baselineDir, b.file))){
			const before = fs.readFileSync(path.join(baselineDir, b.file));
			const after = fs.readFileSync(path.join(outDir, cur.file));
			const { diff, total } = await pixelDiff(lab, before, after, b.width, vh(b.width));
			row.pixels_changed = diff;
			row.pct_changed = total ? +(diff / total * 100).toFixed(3) : 0;
		} else {
			row.baseline_missing = true;
		}

		row.console_errors_before = b.console_errors ?? 0;
		row.console_errors_after = cur.console_errors ?? 0;
		row.new_console_errors = Math.max(0, row.console_errors_after - row.console_errors_before);

		row.sideways_before = !!b.sideways;
		row.sideways_after = !!cur.sideways;
		row.new_sideways_scroll = !row.sideways_before && row.sideways_after;

		row.framed_x0_before = b.framed_x0 ?? 0;
		row.framed_x0_after = cur.framed_x0 ?? 0;
		row.framed_x0_delta = row.framed_x0_after - row.framed_x0_before;

		// "Changed" is the headline count in the summary line — a few stray
		// anti-aliased pixels from font hinting jitter is not a change; a real
		// paint difference is thousands of pixels, threshold catches the gap.
		row.changed = (row.pixels_changed || 0) > 40 || row.new_console_errors > 0 || row.new_sideways_scroll;

		rows.push(row);
	}

	await lab.close();
	return rows;
}

// Runs in a blank Playwright page: decode both PNGs onto canvases the same
// size as the shot and count pixels that differ by more than a small per-
// channel threshold (font anti-aliasing moves a pixel by a few levels even
// when nothing actually changed).
async function pixelDiff(lab, beforeBuf, afterBuf, w, h){
	return lab.evaluate(async ({ a, b, w, h }) => {
		async function decode(b64){
			const img = new Image();
			img.src = "data:image/png;base64," + b64;
			await img.decode();
			const c = document.createElement("canvas");
			c.width = w; c.height = h;
			const ctx = c.getContext("2d");
			ctx.drawImage(img, 0, 0);
			return ctx.getImageData(0, 0, w, h).data;
		}
		const [da, db] = await Promise.all([decode(a), decode(b)]);
		const THRESH = 24;
		let diff = 0;
		for (let i = 0; i < da.length; i += 4){
			if (Math.abs(da[i] - db[i]) > THRESH || Math.abs(da[i + 1] - db[i + 1]) > THRESH || Math.abs(da[i + 2] - db[i + 2]) > THRESH) diff++;
		}
		return { diff, total: w * h };
	}, { a: beforeBuf.toString("base64"), b: afterBuf.toString("base64"), w, h });
}

// ════ THE FULL CORPUS (--all, or --pages beyond the default 40) ═══════════
// The exact same walk as core/Search/Search.js `candidates_from`/`reachable` —
// every directory `/directory.json` lists that holds a page.js AND whose whole
// ancestor chain does too (the Router resolves one url segment at a time), minus
// the same skip list Search.js carries (a prior-art sandbox and three personal
// trees with known module-scope side effects). Reimplemented rather than
// imported: Search.js pulls in Page.class.js, which wants a DOM.
async function corpus(server){
	const data = await fetch(server + "/directory.json").then(r => r.json());
	const dirs = new Set();
	(function walk(nodes){
		for (const node of nodes ?? []){
			if (node.type !== "dir") continue;
			const kids = node.children ?? [];
			if (kids.some(k => k.type === "file" && k.name === "page.js")) dirs.add(`/${node.full}/`);
			walk(kids);
		}
	})(data.files);

	const skip = ["/framework/core/new/", "/alex/", "/castin/", "/edric/"];
	const reachable = url => {
		if (skip.some(p => url.startsWith(p))) return false;
		const segs = url.split("/").filter(Boolean);
		for (let i = 1; i < segs.length; i++) if (!dirs.has("/" + segs.slice(0, i).join("/") + "/")) return false;
		return true;
	};
	return [...dirs].filter(reachable).sort();
}

// --pages <n>: the default 40, extended with more of the full corpus (in its
// own sorted order, so a re-run picks the same extra pages) when n is bigger.
async function pagesForN(n, server){
	if (n <= PAGES.length) return PAGES.slice(0, n);
	const all = await corpus(server);
	const extra = all.filter(u => !PAGES.includes(u));
	return [...PAGES, ...extra].slice(0, n);
}
