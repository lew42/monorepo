// crawl.mjs — crawls the running site (http://monorepo.localhost/), one page at a time,
// and records its layout signature to pages.jsonl. Read-only on the site; only writes
// inside this task folder and the scratchpad shots/ dir named in requirements.md.
//
// Run: node crawl.mjs
//
// What it records is plain facts (positions, classes, links). It does NOT decide what
// any of that means — that's the mastermind's job once this file exists.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser, close } from "../../../../../../Server/browser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = "http://monorepo.localhost";
const OUT_JSONL = path.join(__dirname, "pages.jsonl");
const OUT_SUMMARY = path.join(__dirname, "summary.json");
const RUN_LOG = path.join(__dirname, "run.log");
const SHOTS_DIR = "C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo-public-framework-core-Page/50d33995-1653-44ed-b51e-fc7c4e478eb5/scratchpad/shots";

const SEEDS = ["/", "/framework/", "/layouts/", "/imagine/", "/web/", "/notes/", "/framework/ai/", "/framework/ai2/"];
const HARD_STOP = 1500;
const CONCURRENCY = 2;          // lowered 2026-09-30: the first run exhausted RAM at concurrency 3
const CONTEXT_RECYCLE_EVERY = 40;
const PROGRESS_EVERY = 25;
const TASK_CAP_PER_DAY = 15;
const VIEWPORT = { width: 1440, height: 900 };

fs.mkdirSync(SHOTS_DIR, { recursive: true });

function logLine(msg){
	try { fs.appendFileSync(RUN_LOG, `[${new Date().toISOString()}] ${msg}\n`); } catch {}
}

// Crash instead of silently dying: log it, then let node exit (so a supervisor could
// restart it) rather than leaving run.log looking like nothing ever happened.
process.on("uncaughtException", e => logLine(`uncaughtException: ${e && e.stack || e}`));
process.on("unhandledRejection", e => logLine(`unhandledRejection: ${e && e.stack || e}`));

logLine(`start pid=${process.pid}`);

// --- helpers ------------------------------------------------------------

function normalize(href, baseUrl){
	let u;
	try { u = new URL(href, baseUrl); } catch { return null; }
	if (u.origin !== new URL(SITE).origin) return null;
	u.hash = ""; u.search = "";
	let p = u.pathname;
	const last = p.split("/").pop();
	const hasExt = last.includes(".");
	if (!(p.endsWith("/") || !hasExt)) return null; // skip .md/.js/.png/etc
	return p;
}

const AI_TASK_RE = /^\/framework\/ai2?\/(\d{4}[-/]\d{2}[-/]\d{2})\/[^/]+\//;  // task dirs AND ai2 card pages (mastermind, 2026-09-30)

function slugify(p){
	return p === "/" ? "_root" : p.replace(/\/$/, "").replace(/^\//, "").replace(/\//g, "_") || "_root";
}

// --- crawl state ----------------------------------------------------------

const visited = new Set();       // paths already crawled or queued
const queue = [...SEEDS];
for (const s of SEEDS) visited.add(s);
const linksIn = new Map();       // path -> Set(source path)
const dayCount = new Map();      // date -> count of task pages crawled
const skippedSimilar = new Map();// date -> count
const records = [];              // in-memory copy of every pages.jsonl line
const crawledUrls = new Set();   // urls already written to pages.jsonl (this run or a resumed one)
let crawledCount = 0;
let errorCount = 0;
let notFoundCount = 0;

function addLinkIn(target, source){
	if (!linksIn.has(target)) linksIn.set(target, new Set());
	linksIn.get(target).add(source);
}

function allowTaskPage(p){
	const m = p.match(AI_TASK_RE);
	if (!m) return true;
	const date = m[1];
	const n = dayCount.get(date) || 0;
	if (n >= TASK_CAP_PER_DAY){
		skippedSimilar.set(date, (skippedSimilar.get(date) || 0) + 1);
		return false;
	}
	dayCount.set(date, n + 1);
	return true;
}

function appendLine(obj){
	fs.appendFileSync(OUT_JSONL, JSON.stringify(obj) + "\n");
	records.push(obj);
	if (obj.url) crawledUrls.add(obj.url);
}

// --- resume: pick up from a previous run's pages.jsonl instead of starting over ------
//
// The first run (2026-09-30, RAM low on a shared machine) died at 365 pages with no
// process left and nothing written after it. Rather than lose that work, a rerun loads
// every already-crawled url, treats it as done, and seeds the queue from its links_out
// (exactly the urls a fresh crawl would have discovered from there) so it keeps going
// instead of starting over.
let resumedCount = 0;
if (fs.existsSync(OUT_JSONL)){
	const lines = fs.readFileSync(OUT_JSONL, "utf8").split("\n").filter(Boolean);
	for (const line of lines){
		let r;
		try { r = JSON.parse(line); } catch { continue; }
		if (!r || !r.url) continue;
		records.push(r);
		visited.add(r.url);
		crawledUrls.add(r.url);
		crawledCount++;
		resumedCount++;
		if (r.status === "error") errorCount++;
		if (r.status === "404") notFoundCount++;
		const m = r.url.match(AI_TASK_RE);
		if (m) dayCount.set(m[1], (dayCount.get(m[1]) || 0) + 1);
		for (const target of (r.links_out || [])){
			addLinkIn(target, r.url);
			if (!visited.has(target)){ visited.add(target); queue.push(target); }
		}
	}
}
logLine(`resumed ${resumedCount} already-crawled pages; queue has ${queue.length - resumedCount} more to try`);

// --- per-page extraction (runs inside the browser) -------------------------

/* eslint-disable no-undef */
function extractInPage(){
	const vw = window.innerWidth, vh = window.innerHeight;
	const minArea = vw * vh * 0.04;

	function truncCls(el){
		const c = (el.getAttribute && el.getAttribute("class")) || "";
		return c.length > 120 ? c.slice(0, 120) : c;
	}

	const all = Array.from(document.body.querySelectorAll("*"));

	// structure: depth <= 8 from body, area >= 4% viewport OR fixed/sticky, cap 60
	function depthFromBody(el){
		let d = 0, n = el;
		while (n && n !== document.body){ d++; n = n.parentElement; }
		return d;
	}
	const structure = [];
	for (const el of all){
		if (structure.length >= 60) break;
		const depth = depthFromBody(el);
		if (depth > 8) continue;
		const r = el.getBoundingClientRect();
		if (r.width <= 0 || r.height <= 0) continue;
		const cs = getComputedStyle(el);
		const isFixed = cs.position === "fixed" || cs.position === "sticky";
		const area = r.width * r.height;
		if (!(area >= minArea || isFixed)) continue;
		structure.push({
			tag: el.tagName.toLowerCase(),
			cls: truncCls(el),
			id: el.id || "",
			x: Math.round(r.left), y: Math.round(r.top),
			w: Math.round(r.width), h: Math.round(r.height),
			pos: cs.position,
		});
	}

	// tabs: [role=tablist], or a nav/row-ish container whose 2+ direct children
	// are links/buttons with a class containing "tab"
	const firstH1 = document.querySelector("h1");
	const h1Rect = firstH1 ? firstH1.getBoundingClientRect() : null;
	const tabContainers = new Set(document.querySelectorAll('[role="tablist"]'));
	for (const el of document.querySelectorAll('nav, [class*="row"]')){
		const kids = Array.from(el.children).filter(c =>
			(c.tagName === "A" || c.tagName === "BUTTON") && /tab/i.test(c.className || ""));
		if (kids.length >= 2) tabContainers.add(el);
	}
	const tabs = [];
	for (const el of tabContainers){
		const r = el.getBoundingClientRect();
		if (r.width <= 0 && r.height <= 0) continue;
		tabs.push({
			cls: truncCls(el),
			x: Math.round(r.left), right: Math.round(r.right),
			justify_content: getComputedStyle(el).justifyContent,
			h1_x: h1Rect ? Math.round(h1Rect.left) : null,
			h1_right: h1Rect ? Math.round(h1Rect.right) : null,
		});
	}

	// nav: left-edge elements (x <= 10), taller than 50% viewport, narrower than 35% width
	const nav = [];
	for (const el of all){
		const r = el.getBoundingClientRect();
		if (r.left > 10) continue;
		if (r.height <= vh * 0.5) continue;
		if (r.width >= vw * 0.35) continue;
		if (r.width <= 0) continue;
		nav.push({ cls: truncCls(el), x: Math.round(r.left), w: Math.round(r.width) });
	}

	// page container: the leaf .page.active-page, else fall back to body's first child
	const container = document.querySelector(".page.active-page") || document.body.firstElementChild;
	const containerCls = container ? truncCls(container) : "";

	// columns: children of the container whose class contains "column" or "col-"
	let columns = 0;
	if (container){
		for (const c of container.children){
			const cls = c.className || "";
			if (typeof cls === "string" && (cls.includes("column") || cls.includes("col-"))) columns++;
		}
	}

	// links_out: same-origin <a href> anywhere in the rendered DOM
	const linksOut = Array.from(document.querySelectorAll("a[href]")).map(a => a.getAttribute("href"));

	// not-found / error page marker (App.error(): h1 "Page Load Error" + pre.error)
	let notFoundMessage = null;
	const pre = document.querySelector("pre.error");
	if (pre && firstH1 && firstH1.textContent.trim() === "Page Load Error"){
		notFoundMessage = pre.textContent || "";
	}

	return {
		title: document.title || "",
		h1: firstH1 ? firstH1.textContent.trim().slice(0, 200) : "",
		html_class: document.documentElement.className || "",
		body_class: document.body.className || "",
		container_class: containerCls,
		structure, tabs, nav, columns,
		links_out_raw: linksOut,
		not_found_message: notFoundMessage,
	};
}
/* eslint-enable no-undef */

// --- crawl one page ---------------------------------------------------------

async function crawlOne(ctx, p){
	const url = SITE + p;
	const page = await ctx.newPage();
	const consoleErrors = [];
	page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
	page.on("pageerror", err => consoleErrors.push(String(err && err.message || err)));

	const t0 = Date.now();
	let status = "ok", extracted = null;
	try {
		await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
		await page.waitForTimeout(600);
		extracted = await page.evaluate(extractInPage);
	} catch (e) {
		status = "error";
		consoleErrors.unshift(String(e && e.message || e));
	}
	const ms = Date.now() - t0;

	let shot = null;
	if (status === "ok" && extracted){
		if (extracted.not_found_message){
			status = "404";
		} else if (consoleErrors.length){
			status = "error";
		}
	}

	if (status === "ok"){
		const slug = slugify(p);
		shot = path.join(SHOTS_DIR, `${slug}.jpg`).replace(/\\/g, "/");
		try { await page.screenshot({ path: shot, type: "jpeg", quality: 55 }); }
		catch { shot = null; }
	}

	await page.close();

	const linksOutPaths = [];
	if (extracted && extracted.links_out_raw){
		for (const href of extracted.links_out_raw){
			const np = normalize(href, url);
			if (np && np !== p) linksOutPaths.push(np);
		}
	}

	const record = {
		url: p,
		status,
		title: extracted ? (extracted.title || extracted.h1 || "") : "",
		ms,
		links_out: [...new Set(linksOutPaths)],
		html_class: extracted ? extracted.html_class : "",
		body_class: extracted ? extracted.body_class : "",
		container_class: extracted ? extracted.container_class : "",
		structure: extracted ? extracted.structure : [],
		tabs: extracted ? extracted.tabs : [],
		nav: extracted ? extracted.nav : [],
		columns: extracted ? extracted.columns : 0,
		shot,
	};
	if (status === "error" || status === "404"){
		record.error = extracted && extracted.not_found_message
			? extracted.not_found_message.slice(0, 300)
			: (consoleErrors[0] || "").slice(0, 300);
	}
	return record;
}

// --- main worker pool -------------------------------------------------------

function writeSummary(t0){
	const linksInCount = {};
	for (const [target, sources] of linksIn) linksInCount[target] = sources.size;
	const top60 = Object.entries(linksInCount)
		.sort((a, b2) => b2[1] - a[1])
		.slice(0, 60)
		.map(([url, links_in]) => ({ url, links_in }));

	const summary = {
		page_count: records.length,
		ok_count: records.filter(r => r.status === "ok").length,
		error_count: errorCount,
		not_found_count: notFoundCount,
		ms_total: Date.now() - t0,
		links_in: linksInCount,
		top_60_by_links_in: top60,
		skipped_similar: Object.fromEntries(skippedSimilar),
	};
	fs.writeFileSync(OUT_SUMMARY, JSON.stringify(summary, null, 2));
	return { summary, top60 };
}

// Batches of CONCURRENCY, run sequentially (not a free-running pool): that gives a safe
// point between batches — no crawl is ever in flight — to recycle the browser context
// and to log progress, and it caps memory growth on a shared, low-RAM machine.
async function main(){
	const t0 = Date.now();
	const b = await browser();
	let ctx = await b.newContext({ viewport: VIEWPORT });
	let pagesSinceRecycle = 0;
	let idx = 0;
	let loggedAt = crawledCount - (crawledCount % PROGRESS_EVERY); // don't re-log the resumed count

	while (idx < queue.length && crawledCount < HARD_STOP){
		const batch = [];
		while (batch.length < CONCURRENCY && idx < queue.length && crawledCount < HARD_STOP){
			const p = queue[idx++];
			if (crawledUrls.has(p)) continue; // already crawled (this run or a resumed one)
			if (!allowTaskPage(p)) continue;
			batch.push(p);
			crawledCount++;
		}
		if (!batch.length) continue;

		const results = await Promise.all(batch.map(p =>
			crawlOne(ctx, p).catch(e => ({
				url: p, status: "error",
				error: String(e && e.message || e).slice(0, 300),
				links_out: [],
			}))
		));

		for (const record of results){
			if (record.status === "error") errorCount++;
			if (record.status === "404") notFoundCount++;
			appendLine(record);
			for (const target of (record.links_out || [])){
				addLinkIn(target, record.url);
				if (!visited.has(target) && crawledCount + (queue.length - idx) < HARD_STOP){
					visited.add(target);
					queue.push(target);
				}
			}
		}

		pagesSinceRecycle += batch.length;
		if (crawledCount - loggedAt >= PROGRESS_EVERY){
			loggedAt = crawledCount;
			logLine(`progress: ${crawledCount} crawled (${errorCount} errors, ${notFoundCount} 404), ${queue.length - idx} queued`);
			writeSummary(t0); // keep summary.json live so a poller can watch it, not just wait for the end
		}

		if (pagesSinceRecycle >= CONTEXT_RECYCLE_EVERY){
			try { await ctx.close(); } catch (e) { logLine(`context close failed: ${e && e.message || e}`); }
			ctx = await b.newContext({ viewport: VIEWPORT });
			pagesSinceRecycle = 0;
			logLine(`recycled browser context at ${crawledCount} pages`);
		}
	}

	try { await ctx.close(); } catch {}
	await close();

	const { top60 } = writeSummary(t0);
	logLine(`done: ${records.length} pages, ${errorCount} errors, ${notFoundCount} 404 in ${Math.round((Date.now() - t0) / 1000)}s`);
	console.log(JSON.stringify({
		pages: records.length, errors: errorCount, not_found: notFoundCount,
		seconds: Math.round((Date.now() - t0) / 1000),
		top10: top60.slice(0, 10),
	}, null, 2));
}

main().catch(e => {
	logLine(`FATAL: ${e && e.stack || e}`);
	console.error(e);
	process.exitCode = 1;
});
