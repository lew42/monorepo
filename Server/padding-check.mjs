/* `node Server/padding-check.mjs <url>` — one page, the padding law, pass or fail.
 *
 * THE LAW (the owner, 2026-09-22, after clicking /framework/styles/ at a wide
 * window and finding the heading flush against the sidebar):
 *
 *     "You never have zero padding with text. It looks terrible."
 *
 * So: nothing a reader looks at — text, a button, a checkbox, a framed tile —
 * sits at 0 from an edge: the nav rail, the viewport, a neighbouring column,
 * or the border of any box that paints a ground of its own. This file is the
 * machine that can see that, and it is the ONLY definition of it: the task probe
 * (public/framework/ai/2026-09-22/padding-law/probe.mjs), the page-health
 * watcher (Server/health.mjs) and the landing / smoke checks (through `edges()`)
 * all import it, so the law cannot drift into two versions.
 *
 * RUN IT before landing a page:
 *
 *     node Server/padding-check.mjs /framework/styles/
 *     node Server/padding-check.mjs /framework/styles/ --width 3440
 *     node Server/padding-check.mjs /some/page/ --base http://monorepo.localhost
 *     node Server/padding-check.mjs /some/page/ --style ".pad { padding: 0 !important }"
 *
 * (Git Bash rewrites a leading `/` into a Windows path: prefix `MSYS_NO_PATHCONV=1`.)
 *
 * It exits 0 when the page is clean and 1 when it is not, printing the offending
 * ink, what it is touching, and the gap in pixels. Four widths by default
 * (400, 1280, 1920, 3440), because the bug that started this only appears above
 * 1312px and the watcher that should have caught it was looking at 1280 alone.
 *
 * NOT PADDING BY DEFAULT: `.pad` is opt-in (the owner, 2026-09-25: "Sometimes
 * we don't want padding and we don't want to have to fight it off"). A region
 * that is MEANT to run to its edge says so with `.bleed` or `[data-bleed]`, and
 * this check leaves everything inside it alone.
 *
 * ⚠ Playwright is a GLOBAL npm module on this machine, not a repo dependency, so
 *   it is imported by absolute file url. NODE_PATH does not help — ESM ignores it.
 * ⚠ This file opens no port and imports nothing from the dev server. Running it
 *   cannot slow or crash anyone's server; it only loads pages from one.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

/** Smaller than this is "ink touching an edge". It is the smallest spacing rung
 *  the size standard has (`--gap-25` = a quarter of `--gap`, whose floor is 1em)
 *  at its floor — below it, nothing on this site is deliberate spacing. */
export const FLOOR = 4;

const PLAYWRIGHT = "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";

/* ══ THE MEASUREMENT ══════════════════════════════════════════════════════════
   Runs inside the page, so it must be self-contained — no closures, no imports.
   Serialized to the browser by page.evaluate(); takes one argument.

   WHY IT LOOKS SIDEWAYS, NOT UP (padding-system, 2026-09-25). The first version
   climbed each text node's ANCESTORS looking for a painted or bordered box and
   measured the gap to that box. On the Now card with its padding stripped it
   reported 0 violations: the edge the text was glued to belonged to a NEIGHBOUR
   (the inbox column just to its left), which no ancestor climb can ever find,
   and a tab panel that merely scrolled vertically counted as a "scroller" and
   switched the whole panel off. So now the question is asked the way a reader
   sees it: what is ACTUALLY painted in the few pixels just outside this ink?

   INK, the three kinds of thing a reader looks at:
     text    every visible text node, one line box at a time.
     control button, .btn, input (checkbox too), select, textarea — its own
             padding is its own business, but the control's BOX still needs room.
     box     a framed tile: a block with a side border, or its own opaque ground
             different from its parent's, measured as one rect. A box that fills
             its parent's width is a BAND (a strip, a header bar) and one taller
             than 60% of the viewport is a COLUMN — both are regions, whose edges
             are the page's structure; their contents are measured instead.

   TOUCHING: for each side of each ink, sample the points 0.5, 1.5 … FLOOR-0.5 px
   outside it with elementFromPoint. The side touches when one of them is
     · past the viewport, or past the routed page's own box (the rail seam),
     · on a border (the side border of a block at that point), or
     · on a different painted ground than the one behind the ink.
   Inline elements are not edges (a <code> chip beside a word is prose), and
   neither is a control (a label's own checkbox, a button in a button group).

   WHAT IS NOT MEASURED, and why:
     .bleed / [data-bleed] — the deliberate opt-out: this region runs to its edge.
     .stage / .page-preview-thumb — a scaled-down RENDER of another page.
     .demo-render — ext/demo/stage.css: "the render is the bare content box".
     .dev-bar — sits past the viewport edge by design.
     .material-icons / .icon — ligature glyphs that fill their box by design.
     text inside a control — the control's own em, not the page's spacing.
     anything inside a real horizontal scroller (content wider than the box) —
       a wide table or code block is meant to run past; the scrollbar says so.
       A box that only scrolls VERTICALLY is not one: that was the hole.        */
export const MEASURE = function (opts) {
	const FLOOR = opts.floor;
	const round = n => Math.round(n * 10) / 10;

	// The routed leaf. A columns host is `display: contents` and has no box of
	// its own, so climb until something has real geometry.
	let root = document.querySelector(".page.active-page");
	while (root && root.getBoundingClientRect().width === 0 && root.parentElement) root = root.parentElement;
	if (!root) root = document.querySelector(".pages") || document.body;

	const vw = document.documentElement.clientWidth || innerWidth;
	const toc = [...document.querySelectorAll(".toc")]
		.find(el => el.checkVisibility?.() && el.getBoundingClientRect().width > 0);

	const SKIP    = ".bleed, [data-bleed], .dev-bar, .stage, .page-preview-thumb, .demo-render, .material-icons, .icon, script, style, svg, template";
	const CONTROL = "button, .btn, select, textarea, input";

	// A box needs a box's `display` — an inline <code> chip's 2px is its own em.
	const BLOCKY = /^(block|flex|grid|flow-root|list-item|table|table-cell|inline-block|inline-flex|inline-grid)$/;
	const opaque = c => !!c && c !== "transparent" && !/,\s*0\)\s*$/.test(c) && !/\/\s*0\)\s*$/.test(c);
	const blocky = el => { for (; el; el = el.parentElement) if (BLOCKY.test(getComputedStyle(el).display)) return el; return null; };

	/** The colour actually painted behind `el` — its own, or the first ancestor's. */
	const ground = el => {
		for (; el; el = el.parentElement) {
			const c = getComputedStyle(el).backgroundColor;
			if (opaque(c)) return c;
		}
		return "canvas";
	};
	// ⚠ Only a skip-region AT OR INSIDE the routed page counts. The ai2 app wraps
	//   every card in `.ai2.bleed` (the app's paint runs edge to edge), and the
	//   card's content inside it still needs its padding — "full bleed" on a
	//   container is never permission for the content inside to touch.
	const skipped = el => { const m = el.closest(SKIP); return !!m && root.contains(m); };
	/** The element that paints the ground at `el`: itself or its first opaque ancestor. */
	const painter = el => { for (; el; el = el.parentElement) if (opaque(getComputedStyle(el).backgroundColor)) return el; return null; };
	/** A positioned element that paints nothing of its own: no ground, no border,
	 *  no text — a grip, a hit-area, a drop zone. Invisible, so never an edge. */
	const overlay = el => {
		const cs = getComputedStyle(el);
		if (!/^(absolute|fixed)$/.test(cs.position) && !/resize$/.test(cs.cursor)) return false;
		if (opaque(cs.backgroundColor) || cs.backgroundImage !== "none") return false;
		const sides = ["Left", "Right", "Top", "Bottom"];
		if (sides.some(s => cs[`border${s}Style`] !== "none" && parseFloat(cs[`border${s}Width`]) > 0)) return false;
		return !el.textContent.trim();
	};
	const label = el => (el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "")).slice(0, 70);

	/** Does `el` actually scroll sideways? `overflow-x: auto` alone is not enough —
	 *  a panel set to scroll vertically computes `overflow-x: auto` too. */
	const h_scroller = el => {
		const cs = getComputedStyle(el);
		return /^(auto|scroll)$/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
	};

	// ── collect the ink ────────────────────────────────────────────────────────
	const ink = [];
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	for (let node; (node = walker.nextNode());) {
		const text = node.nodeValue.trim();
		const host = node.parentElement;
		if (!text || !host || skipped(host) || host.closest(CONTROL)) continue;
		ink.push({ kind: "text", node, el: host, text });
	}
	for (const el of root.querySelectorAll(CONTROL)) {
		if (skipped(el) || el.parentElement?.closest(CONTROL)) continue;
		if (el.type === "hidden") continue;
		const t = el.type === "checkbox" || el.type === "radio" ? `[${el.type}] ` + (el.closest("label")?.textContent.trim() || el.name || "") : (el.value && el.tagName === "INPUT" ? el.value : el.textContent.trim() || el.placeholder || el.getAttribute("aria-label") || el.tagName.toLowerCase());
		ink.push({ kind: "control", el, text: t });
	}
	const inner_width = el => {
		const parent = blocky(el.parentElement);
		if (!parent) return Infinity;
		const pcs = getComputedStyle(parent);
		return parent.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
	};
	const tall = innerHeight * 0.6;
	for (const el of root.querySelectorAll("*")) {
		if (skipped(el) || el.closest(CONTROL) || el.matches(".page")) continue;
		const cs = getComputedStyle(el);
		// A table cell is part of its table, not a tile: cells share borders by
		// design. A resize grip lives ON its border by design.
		if (!BLOCKY.test(cs.display) || cs.display === "table-cell" || /resize$/.test(cs.cursor)) continue;
		const bordered = (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== "none") || (parseFloat(cs.borderRightWidth) > 0 && cs.borderRightStyle !== "none");
		const painted = opaque(cs.backgroundColor) && cs.backgroundColor !== ground(el.parentElement);
		if (!bordered && !painted) continue;
		const r = el.getBoundingClientRect();
		if (r.width < 1 || r.height < 1 || r.height > tall) continue;
		if (r.width >= inner_width(el) - 1) continue;     // a band: fills its parent's row
		ink.push({ kind: "box", el, paint: painted ? cs.backgroundColor : null, text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 44) || label(el) });
	}

	// ── measure each piece ─────────────────────────────────────────────────────
	const scrolls = new Map();       // every scroller we moved, and where it was
	const remember = el => {
		for (let a = el.parentElement; a; a = a.parentElement)
			if (!scrolls.has(a) && (a.scrollTop || a.scrollLeft || a.scrollHeight > a.clientHeight)) scrolls.set(a, [a.scrollLeft, a.scrollTop]);
		if (!scrolls.has("window")) scrolls.set("window", [scrollX, scrollY]);
	};

	/** The ink's line boxes, clipped by any `overflow` ancestor, with the sides
	 *  a clip cut remembered. Null when hidden, clipped away, or scrolled. */
	const geometry = it => {
		let rects;
		if (it.kind === "text") {
			const range = document.createRange();
			range.selectNodeContents(it.node);
			rects = [...range.getClientRects()].filter(r => r.width >= 1 && r.height >= 1);
		} else {
			const r = it.el.getBoundingClientRect();
			rects = r.width >= 1 && r.height >= 1 ? [r] : [];
		}
		if (!rects.length) return null;
		rects = rects.map(r => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom }));
		const cut = { left: false, right: false };
		// ⚠ CLIP AS WE CLIMB, or the measurement is of ink nobody can see — a
		//   clipped link label's range rect is its full layout width. And a box
		//   that clips its own content puts the clipped ink exactly on its edge,
		//   every time: that is content being cut off, a different bug.
		for (let el = it.kind === "text" ? it.el : it.el.parentElement; el && el !== document.documentElement; el = el.parentElement) {
			if (h_scroller(el)) return null;
			const cs = getComputedStyle(el);
			if (!/^(hidden|clip|auto|scroll)$/.test(cs.overflowX)) continue;
			const cr = el.getBoundingClientRect();
			for (const r of rects) {
				if (r.left < cr.left)   { r.left = cr.left;   cut.left = true; }
				if (r.right > cr.right) { r.right = cr.right; cut.right = true; }
			}
			rects = rects.filter(r => r.right - r.left >= 1);
			if (!rects.length) return null;
		}
		return { rects, cut };
	};

	/** Where to stand for each side: a line box at that side's extreme whose
	 *  edge pixel is really this ink on screen (not clipped by a vertical
	 *  scroller, not under a menu). { left: {x, y} | null, right: … } */
	const stands = (it, g) => {
		const self = it.el;
		const onTop = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && self.contains(h); };
		const out = {};
		for (const side of ["left", "right"]) {
			const ext = side === "left" ? Math.min(...g.rects.map(r => r.left)) : Math.max(...g.rects.map(r => r.right));
			out[side] = null;
			let tries = 0;
			for (const r of g.rects) {
				if (Math.abs((side === "left" ? r.left : r.right) - ext) > 1) continue;
				const y = (r.top + r.bottom) / 2;
				if (y < 1 || y > innerHeight - 1) continue;
				const x = side === "left" ? r.left : r.right;
				if (onTop(side === "left" ? x + 1 : x - 1, y)) { out[side] = { x, y }; break; }
				if (++tries >= 6) break;
			}
		}
		return out;
	};

	/** Is the point at (x, y) an edge, as seen from ink whose backdrop is `back`? */
	const rootRect = () => root.getBoundingClientRect();
	const edge_at = (x, y, back, self, paint) => {
		if (x < 0 || x >= vw) return "the viewport edge";
		const rr = rootRect();
		if (x < rr.left || x >= rr.right) return "the page's own edge";
		// Look THROUGH transparent overlays — a resize grip laid over a column's
		// edge (/blog/'s 12px `.grip`) paints nothing, so it is not an edge; judge
		// by what is painted underneath it.
		const hit = document.elementsFromPoint(x, y).find(el => !overlay(el)) || null;
		if (!hit) return "the viewport edge";
		if (hit.closest(".dev-bar")) return "the dev bar";
		if (self.contains(hit)) return null;
		if (hit.closest(CONTROL)) return null;             // a control beside ink is its own chrome
		// Boxes side by side in one parent are a group — a row of tabs, a
		// segmented bar — and butt each other on purpose.
		if (paint !== undefined) for (let a = hit; a && a !== root; a = a.parentElement)
			if (a.parentElement === self.parentElement && a !== self) return null;
		// A border of any block at this point, the hit or one of its ancestors.
		for (let a = blocky(hit), n = 0; a && n < 6; a = blocky(a.parentElement), n++) {
			const cs = getComputedStyle(a), r = a.getBoundingClientRect();
			const bl = cs.borderLeftStyle  !== "none" ? parseFloat(cs.borderLeftWidth)  : 0;
			const br = cs.borderRightStyle !== "none" ? parseFloat(cs.borderRightWidth) : 0;
			if ((bl > 0 && x >= r.left && x < r.left + bl) || (br > 0 && x < r.right && x >= r.right - br))
				return "the border of " + label(a);
		}
		const g = ground(blocky(hit));
		if (paint && g === paint) return null;              // a box meeting its own colour: one band, no seam
		if (g !== back) return "the ground of " + label(blocky(hit) || hit);
		return null;
	};

	const findings = [];
	let scanned = 0;
	const counts = { text: 0, control: 0, box: 0 };

	for (const it of ink) {
		if (!it.el.checkVisibility?.()) continue;
		let g = geometry(it);
		if (!g) continue;
		let at = stands(it, g);
		// elementFromPoint only sees the viewport: bring off-screen ink into view
		// (nested scrollers included), then put every scroller back at the end.
		if (!at.left && !at.right) {
			remember(it.el);
			it.el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
			g = geometry(it);
			if (!g) continue;
			at = stands(it, g);
			if (!at.left && !at.right) continue;       // covered, or never on screen
		}
		// A painted box that runs on, seamlessly, into siblings of its own colour
		// is one PIECE of a band (ext/Doc's title well + the tab bar beside it):
		// measure the whole run, and skip it when the run fills its row.
		if (it.kind === "box" && it.paint) {
			const y = (at.left || at.right).y, r = it.el.getBoundingClientRect();
			let L = r.left, R = r.right;
			for (let hop = 0; hop < 6; hop++) {
				const b = painter(document.elementFromPoint(L - 1.5, y));
				if (!b || b.contains(it.el) || getComputedStyle(b).backgroundColor !== it.paint) break;
				L = b.getBoundingClientRect().left;
			}
			for (let hop = 0; hop < 6; hop++) {
				const b = painter(document.elementFromPoint(R + 1.5, y));
				if (!b || b.contains(it.el) || getComputedStyle(b).backgroundColor !== it.paint) break;
				R = b.getBoundingClientRect().right;
			}
			if (R - L >= inner_width(it.el) - 1) continue;
			// …or when the band WRAPS: the same colour carries on right above or
			// below it (at 400px the tab bar drops under the title well).
			const same = (x, yy) => { const b = painter(document.elementFromPoint(x, yy)); return !!b && !b.contains(it.el) && !it.el.contains(b) && getComputedStyle(b).backgroundColor === it.paint; };
			const cx = Math.min(Math.max(r.left + 2, 0), vw - 1);
			if (same(cx, r.bottom + 1.5) || same(cx, r.top - 1.5)) continue;
		}
		scanned++; counts[it.kind]++;

		const self = it.el;
		const back = ground(blocky(it.kind === "text" ? it.el : it.el.parentElement));
		for (const side of ["left", "right"]) {
			if (g.cut[side] || !at[side]) continue;
			const { x: x0, y } = at[side];
			for (let d = 0.5; d < FLOOR; d += 1) {
				const x = side === "left" ? x0 - d : x0 + d;
				const what = edge_at(x, y, back, self, it.kind === "box" ? it.paint : undefined);
				if (!what) continue;
				findings.push({
					gap: round(d - 0.5), side, kind: it.kind,
					text: it.text.slice(0, 44),
					box: what.replace(/^the (border|ground) of /, "").slice(0, 70),
					touches: what.slice(0, 90),
					host: it.el.tagName.toLowerCase(),
				});
				break;
			}
		}
	}

	// The named edges, reported whether or not they are violations — the rail is
	// the one the owner pointed at, and a number is easier to argue with.
	const rr = rootRect();
	const tocRect = toc && toc.getBoundingClientRect();
	const edges = { rail: Infinity, viewport_left: Infinity, viewport_right: Infinity, toc: Infinity };
	for (const it of ink) {
		if (it.kind !== "text" || !it.el.checkVisibility?.()) continue;
		const range = document.createRange(); range.selectNodeContents(it.node);
		const r = range.getBoundingClientRect();
		if (r.width < 1 || r.height < 1) continue;
		if (r.left >= rr.left) edges.rail = Math.min(edges.rail, r.left - rr.left);
		edges.viewport_left  = Math.min(edges.viewport_left,  r.left);
		edges.viewport_right = Math.min(edges.viewport_right, vw - r.right);
		if (tocRect && !it.el.closest(".toc") && r.right <= tocRect.left + 1)
			edges.toc = Math.min(edges.toc, tocRect.left - r.right);
	}
	for (const k in edges) edges[k] = Number.isFinite(edges[k]) ? round(edges[k]) : null;

	for (const [el, [l, t]] of scrolls) el === "window" ? scrollTo(l, t) : (el.scrollLeft = l, el.scrollTop = t);

	// `worst`: the five a reader should look at first — smallest gap, but one of
	// each kind before a second of any, so a wall of text cannot hide the button.
	findings.sort((a, b) => a.gap - b.gap);
	const worst = [], seen = new Set();
	for (const f of findings) if (!seen.has(f.kind)) { seen.add(f.kind); worst.push(f); }
	for (const f of findings) if (worst.length < 5 && !worst.includes(f)) worst.push(f);
	worst.sort((a, b) => a.gap - b.gap);

	return {
		vw, scanned, ink: counts,
		has_toc: !!toc,
		root: label(root),
		root_left: round(rr.left),
		grid: getComputedStyle(root).gridTemplateColumns.slice(0, 90),
		edges,
		min_gap: findings.length ? findings[0].gap : null,
		violations: findings.length,
		worst: worst.slice(0, 5),
		all: findings,
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

/* ══ MANY PAGES, ONE CALL ═════════════════════════════════════════════════════
   The one function the landing check (on-landing.mjs) and the pre-merge smoke
   test (smoke.mjs) import. Opens its own headless browser, loads each url once,
   measures it at every width, and closes the browser.

     const rows = await edges(["/framework/styles/"], { base: "http://monorepo.localhost" });
     // → [{ url, width, violations, worst, scanned, error? }, …]  one row per url × width

   A url that fails to load gives one row with `error` set and `violations: null`,
   so a caller can tell "clean" from "never measured". `style` is optional CSS
   injected after load (a way to reproduce a bug: strip a padding and look). */
export async function edges(urls, { base = process.env.PADDING_BASE || "http://monorepo.localhost", widths = [1280, 3440], floor = FLOOR, style = null } = {}){
	const { chromium } = await import(PLAYWRIGHT);
	const browser = await chromium.launch({ channel: "chromium" });
	const rows = [];
	try {
		for (const url of urls) {
			const page = await browser.newPage({ viewport: { width: widths[0], height: 1200 } });
			try {
				await load(page, /^https?:/.test(url) ? url : base + url, style);
				for (const width of widths) {
					const r = await check_page(page, width, floor);
					rows.push(r.scanned
						? { url, width, violations: r.violations, worst: r.worst, scanned: r.scanned }
						: { url, width, violations: null, worst: [], scanned: 0, error: "no ink on the page: it did not render" });
				}
			} catch (e) {
				rows.push({ url, width: null, violations: null, worst: [], error: e?.message || String(e) });
			} finally {
				await page.close().catch(() => {});
			}
		}
	} finally {
		await browser.close();
	}
	return rows;
}

async function load(page, href, style){
	const res = await page.goto(href, { waitUntil: "domcontentloaded", timeout: 30000 });
	// A 404 page is a page too, and a clean one: say so, or it reads as a pass.
	if (res && res.status() >= 400) throw new Error(`HTTP ${res.status()} for ${href}`);
	await page.waitForSelector(".page.active-page, .pages > .default", { timeout: 10000 }).catch(() => {});
	await page.waitForTimeout(800);
	if (style) { await page.addStyleTag({ content: style }); await page.waitForTimeout(200); }
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
		console.error("usage: node Server/padding-check.mjs <url> [--width 3440] [--base http://monorepo.localhost] [--floor 4] [--style \"<css>\"] [--all]");
		process.exit(2);
	}

	const base   = arg("base", process.env.PADDING_BASE || "http://monorepo.localhost");
	const widths = String(arg("width", "400,1280,1920,3440")).split(",").map(Number);
	const floor  = Number(arg("floor", FLOOR));
	const style  = arg("style", null);
	const all    = argv.includes("--all");

	const { chromium } = await import(PLAYWRIGHT);
	const browser = await chromium.launch({ channel: "chromium" });
	const page = await browser.newPage({ viewport: { width: widths[0], height: 1200 } });

	let failed = 0;
	try {
		await load(page, /^https?:/.test(url) ? url : base + url, style);
		for (const width of widths) {
			const r = await check_page(page, width, floor);
			const ink = `${r.scanned} pieces of ink (${r.ink.text} text, ${r.ink.control} controls, ${r.ink.box} boxes)`;
			if (!r.violations) {
				console.log(`  ok   ${String(width).padStart(4)}  ${ink}, closest text ${r.edges.rail}px from the page edge`);
				continue;
			}
			failed += r.violations;
			console.log(`  FAIL ${String(width).padStart(4)}  ${r.violations} of ${ink} touch an edge`);
			for (const f of all ? r.all : r.worst)
				console.log(`         ${String(f.gap).padStart(4)}px  ${f.kind.padEnd(7)} "${f.text}"\n                 ${f.side} side touches ${f.touches}`);
		}
	} finally {
		await browser.close();
	}

	if (failed) {
		console.log(`\n${url} — nothing a reader looks at sits at 0 from an edge: rail, viewport, neighbour, border.`);
		console.log(`Give the region that holds it .pad (or a framed box .card), or mark a deliberate edge-to-edge region .bleed.`);
		process.exit(1);
	}
	console.log(`\n${url} — clean at ${widths.join(", ")}.`);
}

// Only when run directly, never when imported by probe.mjs, health.mjs or smoke.mjs.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) await main();
