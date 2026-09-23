/* `node Server/padding-check.mjs <url>` — one page, the padding law, pass or fail.
 *
 * THE LAW (the owner, 2026-09-22, after clicking /framework/styles/ at a wide
 * window and finding the heading flush against the sidebar):
 *
 *     "You never have zero padding with text. It looks terrible."
 *
 * So: text never sits at 0 from an edge — the nav rail, the viewport, the ToC
 * column, or the border of any box that paints a ground of its own. This file
 * is the machine that can see that, and it is the ONLY definition of it: the
 * task probe (public/framework/ai/2026-09-22/padding-law/probe.mjs) and the
 * page-health watcher (Server/health.mjs) both import `MEASURE` from here, so
 * the law cannot drift into two versions.
 *
 * RUN IT before landing a page:
 *
 *     node Server/padding-check.mjs /framework/styles/
 *     node Server/padding-check.mjs /framework/styles/ --width 3440
 *     node Server/padding-check.mjs /some/page/ --base http://localhost:8123
 *
 * It exits 0 when the page is clean and 1 when it is not, printing the offending
 * text, the box it is sitting in, and the gap in pixels. Four widths by default
 * (400, 1280, 1920, 3440), because the bug that started this only appears above
 * 1312px and the watcher that should have caught it was looking at 1280 alone.
 *
 * ⚠ Playwright is a GLOBAL npm module on this machine, not a repo dependency, so
 *   it is imported by absolute file url. NODE_PATH does not help — ESM ignores it.
 * ⚠ This file opens no port and imports nothing from the dev server. Running it
 *   cannot slow or crash anyone's server; it only loads pages from one.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

/** Smaller than this is "text touching an edge". It is the smallest spacing rung
 *  the size standard has (`--gap-25` = a quarter of `--gap`, whose floor is 1em)
 *  at its floor — below it, nothing on this site is deliberate spacing. */
export const FLOOR = 4;

/* ══ THE MEASUREMENT ══════════════════════════════════════════════════════════
   Runs inside the page, so it must be self-contained — no closures, no imports.
   Serialized to the browser by page.evaluate(); takes one argument.

   WHAT COUNTS AS AN EDGE, and this is the whole subtlety:

   1. THE ROUTED PAGE'S OWN BOX is always an edge, painted or not. Its left side
      is where the nav rail stops and the page begins; that seam is structural,
      and text on it reads as text glued to the sidebar even when both sit on the
      same colour. This is the owner's original complaint.

   2. ANY OTHER BOX is an edge only when something DIFFERENT is on the other side
      of it. A box whose neighbour paints the identical ground has no visible
      edge to butt against — `ext/Doc`'s title well and the tab bar beside it are
      one band in two boxes, sharing one `--well` fill, so the title running to
      the well's right edge is not text touching anything. Checked by sampling
      the ground two pixels outside the box and comparing it with the box's own.

   3. THE VIEWPORT'S TWO SIDES are always edges — there is nothing beyond them.

   WHAT IS NOT MEASURED, and why:
     .stage / .page-preview-thumb — a scaled-down RENDER of another page. A
       picture of a page, and the picture's frame is not this page's padding.
     .dev-bar — sits past the viewport edge by design.
     anything inside a horizontal scroller — a wide table or a code block is
       meant to run past its box; that is what the scrollbar is for.
     controls (button, input, select) — a control's padding is its own `em`, not
       the page's spacing, which is the same line `Server/health.mjs` already
       draws. A `<summary>` is NOT excluded: it is a heading you can click, it
       holds prose, and it is the case that actually broke.                      */
export const MEASURE = function (opts) {
	const FLOOR = opts.floor;
	const round = n => Math.round(n * 10) / 10;

	// The routed leaf. A columns host is `display: contents` and has no box of
	// its own, so climb until something has real geometry.
	let root = document.querySelector(".page.active-page");
	while (root && root.getBoundingClientRect().width === 0 && root.parentElement) root = root.parentElement;
	if (!root) root = document.querySelector(".pages") || document.body;
	const rootRect = root.getBoundingClientRect();

	const vw = innerWidth;
	const toc = [...document.querySelectorAll(".toc")]
		.find(el => el.checkVisibility?.() && el.getBoundingClientRect().width > 0);
	const tocRect = toc && toc.getBoundingClientRect();

	// ⚠ `.material-icons` / `.icon` are ligature fonts: the text node says "add" or
	//   "bolt" and the browser paints a glyph that fills its box by design. Ink,
	//   but not prose — measuring an icon's own box as padding produced findings
	//   on three modules that a reader would not recognise as anything at all.
	// ⚠ `.demo-render` is excluded for the reason ext/demo/stage.css states itself:
	//   "The padding is HERE [on .demo-screen], not on .demo-render — that is what
	//   makes the readout honest: the render is the bare content box." A demo shows
	//   a component at its true size; the component is judged on its own page.
	const NOT_TEXT = ".dev-bar, .stage, .page-preview-thumb, .demo-render, .material-icons, .icon, script, style, svg";
	const CONTROL  = "button, .btn, select, textarea, input";

	// A box needs a box's `display` — an inline <code> chip's 2px is a control's
	// own em, not padding, and flagging every one would bury the real findings.
	const BLOCKY = /^(block|flex|grid|flow-root|list-item|table|table-cell|inline-block|inline-flex|inline-grid)$/;
	const opaque = c => !!c && c !== "transparent" && !/,\s*0\)\s*$/.test(c);

	/** The colour actually painted behind `el` — its own, or the first ancestor's. */
	const ground = el => {
		for (; el; el = el.parentElement) {
			const c = getComputedStyle(el).backgroundColor;
			if (opaque(c)) return c;
		}
		return "canvas";
	};

	/** Is `box`'s `side` a real edge — something different on the other side of it? */
	const is_edge = (box, br, side, y) => {
		if (box === root) return true;                       // rule 1: structural
		const x = side === "left" ? br.left - 2 : br.right + 2;
		if (x < 0 || x >= vw) return true;                   // rule 3: the viewport
		const outside = document.elementFromPoint(x, y);
		if (!outside || outside.closest(".dev-bar")) return true;
		return ground(outside) !== ground(box);              // rule 2
	};

	const findings = [];
	let scanned = 0;

	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let node;
	while ((node = walker.nextNode())) {
		const text = node.nodeValue.trim();
		if (!text) continue;
		const host = node.parentElement;
		if (!host || host.closest(NOT_TEXT) || host.closest(CONTROL)) continue;
		if (!host.checkVisibility?.()) continue;

		const range = document.createRange();
		range.selectNodeContents(node);
		let r = range.getBoundingClientRect();
		if (r.width < 1 || r.height < 1) continue;
		scanned++;

		// Climb to the nearest thing that is really a box: the routed page, or an
		// element that draws a side border, or one whose ground differs from the
		// ground behind it. A "box" painted the same colour as its parent is not a
		// box — it has no edge to show.
		//
		// ⚠ CLIP AS WE CLIMB, or the measurement is of ink nobody can see. A text
		//   node's range rect is its FULL layout width even when an ancestor is
		//   `overflow: hidden` and the reader only ever sees the first half of it —
		//   `ext/AITask`'s clipped link labels read as 103px of text hanging past
		//   the card that holds them, on 25 pages, and none of it was on screen.
		//   A `scroll`/`auto` ancestor is different: its content is MEANT to run
		//   past, and the scrollbar is the promise that you can reach it, so text
		//   under one is not measured at all.
		let box = null, scrolled = false, gone = false;
		const cut = { left: false, right: false };
		for (let el = host; el; el = el.parentElement) {
			const cs = getComputedStyle(el);
			if (/^(auto|scroll)$/.test(cs.overflowX)) scrolled = true;
			if (/^(hidden|clip)$/.test(cs.overflowX)) {
				const cr = el.getBoundingClientRect();
				const l = Math.max(r.left, cr.left), rt = Math.min(r.right, cr.right);
				if (rt - l < 1) { gone = true; break; }
				// ⚠ Remember WHICH side the cut happened on. A box that clips its own
				//   content puts the clipped ink exactly on its edge, every time — so
				//   without this, every clipping box reports "text at 0px" forever.
				//   That is content being cut off, a different bug with a different fix.
				if (l > r.left)  cut.left = true;
				if (rt < r.right) cut.right = true;
				r = { left: l, right: rt, top: r.top, bottom: r.bottom };
			}
			if (el === root) { box = root; break; }
			if (!BLOCKY.test(cs.display)) continue;
			const bordered = (parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.borderRightWidth) > 0)
				&& cs.borderLeftStyle !== "none";
			if (bordered || (opaque(cs.backgroundColor) && cs.backgroundColor !== ground(el.parentElement))) { box = el; break; }
		}
		if (!box || scrolled || gone) continue;

		const bcs = getComputedStyle(box);
		const br = box.getBoundingClientRect();
		const left  = br.left  + parseFloat(bcs.borderLeftWidth  || 0);
		const right = br.right - parseFloat(bcs.borderRightWidth || 0);
		const y = Math.min(Math.max((r.top + r.bottom) / 2, 1), innerHeight - 1);

		for (const [side, gap] of [["left", r.left - left], ["right", right - r.right]]) {
			if (gap >= FLOOR || cut[side]) continue;
			if (!is_edge(box, br, side, y)) continue;
			findings.push({
				gap: round(gap), side,
				text: text.slice(0, 44),
				box: (box.tagName.toLowerCase() + (box.className ? "." + String(box.className).trim().split(/\s+/).join(".") : "")).slice(0, 70),
				host: host.tagName.toLowerCase(),
			});
		}
	}

	// The named edges, reported whether or not they are violations — the rail is
	// the one the owner pointed at, and a number is easier to argue with.
	const edges = { rail: Infinity, viewport_left: Infinity, viewport_right: Infinity, toc: Infinity };
	const w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let n2;
	while ((n2 = w2.nextNode())) {
		if (!n2.nodeValue.trim()) continue;
		const host = n2.parentElement;
		if (!host || host.closest(NOT_TEXT) || !host.checkVisibility?.()) continue;
		const range = document.createRange(); range.selectNodeContents(n2);
		const r = range.getBoundingClientRect();
		if (r.width < 1 || r.height < 1) continue;
		if (r.left >= rootRect.left) edges.rail = Math.min(edges.rail, r.left - rootRect.left);
		edges.viewport_left  = Math.min(edges.viewport_left,  r.left);
		edges.viewport_right = Math.min(edges.viewport_right, vw - r.right);
		if (tocRect && !host.closest(".toc") && r.right <= tocRect.left + 1)
			edges.toc = Math.min(edges.toc, tocRect.left - r.right);
	}
	for (const k in edges) edges[k] = Number.isFinite(edges[k]) ? round(edges[k]) : null;

	findings.sort((a, b) => a.gap - b.gap);
	return {
		vw, scanned,
		has_toc: !!toc,
		root: (root.tagName.toLowerCase() + (root.className ? "." + String(root.className).trim().split(/\s+/).join(".") : "")).slice(0, 70),
		root_left: round(rootRect.left),
		grid: getComputedStyle(root).gridTemplateColumns.slice(0, 90),
		edges,
		min_gap: findings.length ? findings[0].gap : null,
		violations: findings.length,
		worst: findings.slice(0, 5),
	};
};

/* ══ ONE PAGE, MEASURED ═══════════════════════════════════════════════════════
   Takes a Playwright page that is ALREADY on the url, so health.mjs can reuse
   the page it has open instead of loading it a second time. */
export async function check_page(page, width, floor = FLOOR){
	await page.setViewportSize({ width, height: 1200 });
	// A width change re-lays the page out; give it a frame plus a beat to settle.
	await page.waitForTimeout(350);
	return await page.evaluate(MEASURE, { floor });
}

/* ══ THE COMMAND LINE ═════════════════════════════════════════════════════════ */
async function main(){
	const argv = process.argv.slice(2);
	const arg = (name, fallback) => {
		const i = argv.indexOf(`--${name}`);
		return i === -1 ? fallback : argv[i + 1];
	};
	// The url is the first argument that is neither a flag nor a flag's value.
	let url = null;
	for (let i = 0; i < argv.length; i++) {
		if (argv[i].startsWith("--")) { i++; continue; }
		url = argv[i]; break;
	}

	if (!url) {
		console.error("usage: node Server/padding-check.mjs <url> [--width 3440] [--base http://localhost:80] [--floor 4]");
		process.exit(2);
	}

	const base   = arg("base", process.env.PADDING_BASE || "http://localhost:80");
	const widths = String(arg("width", "400,1280,1920,3440")).split(",").map(Number);
	const floor  = Number(arg("floor", FLOOR));

	const { chromium } = await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs");
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: widths[0], height: 1200 } });

	let failed = 0;
	try {
		await page.goto(base + url, { waitUntil: "domcontentloaded", timeout: 30000 });
		await page.waitForSelector(".page.active-page, .pages > .default", { timeout: 10000 }).catch(() => {});
		await page.waitForTimeout(500);

		for (const width of widths) {
			const r = await check_page(page, width, floor);
			if (!r.violations) {
				console.log(`  ok   ${String(width).padStart(4)}  ${r.scanned} text nodes, closest ${r.edges.rail}px from the rail`);
				continue;
			}
			failed += r.violations;
			console.log(`  FAIL ${String(width).padStart(4)}  ${r.violations} piece(s) of text at an edge`);
			for (const f of r.worst)
				console.log(`         ${String(f.gap).padStart(7)}px from the ${f.side} of  ${f.box}\n              "${f.text}"`);
		}
	} finally {
		await browser.close();
	}

	if (failed) {
		console.log(`\n${url} — text never sits at 0 from an edge: rail, viewport, ToC, card border.`);
		console.log(`Give the box that holds it some padding, or give the page back its gutter.`);
		process.exit(1);
	}
	console.log(`\n${url} — clean at ${widths.join(", ")}.`);
}

// Only when run directly, never when imported by probe.mjs or health.mjs.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) await main();
