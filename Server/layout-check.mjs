/* `node Server/layout-check.mjs <url...> [--widths 1280,1920,2560,3440] [--out dir] [--height 1000] [--bands]`
 * Is the screen space used properly? One headless browser, one context per width. Per width it
 * writes a screenshot; per url one contact sheet (all widths side by side) and one small JSON:
 *   empty        fraction of the viewport with no text, image or control under it (40x25 samples)
 *   widest_text  widest single line of text, px (compare with --measure)
 *   overflow_x   true if anything pokes past the viewport's right edge (scrollers excluded)
 *   narrow_share share of repeated items (4+ look-alike siblings) narrower than 15% of the width
 *   errors       console + page errors
 * Read the contact sheet first; the numbers say where to look. Exit code 1 if any url has errors
 * or overflow (the extra --bands numbers below only ever inform, never fail the exit code).
 * Output: <out>/<slug>/<width>.png, sheet.png, layout.json (default: ./layout-check-out).
 *
 * --bands reads the page the way a person scrolling down it does: a stack of horizontal bands,
 * top to bottom. It changes the default widths to 400,1200,1920,3440 (a mobile size and a
 * just-past-mobile size, since "is everything one row again yet" flips somewhere in between),
 * saves a full-page screenshot capped at 3 viewport heights (band reading needs what's below the
 * fold), and adds to each width's entry in layout.json:
 *   layout       which page layout it renders as, by DOM marker: ai2 floating switcher columns
 *                catalog browse doc wall blog sources standard, else "custom" — the list and
 *                the counts are /framework/core/Page/audit/; "custom" on a new page is a deviation
 *   tabs_gap     px from the h1's right edge to the first tab when they share a row (null
 *                otherwise); Doc puts tabs beside the title, so over 64px is flagged as pushed away
 *   tab_rows    how many distinct rows a tab bar's (`.tab-bar`, `[role=tablist]`) own tabs sit
 *                on — 1 is right; more means a bar has wrapped into a stack of rows
 *   left_stack   the padding/border/margin stacked at the LEFT edge of the first visible `h1`
 *                and first visible `p` in the main content (never the site sidebar): each as
 *                {total, layers: [{cls, px}]} — one layer per ancestor that adds space, so
 *                "a card inside a card inside a tab strip" shows up as three small numbers
 *                instead of one mystery gap
 *   bands        the page's own top-level vertical stack (descend through single-child
 *                wrappers from the active page's box down to where it actually branches),
 *                each as {cls, y, h, share, ink, big_empty} — share is the band's height as a
 *                fraction of one screen, ink is the fraction of the band actually covered by
 *                text/image/control (same 40x25 sampler as `empty` above, restricted to the
 *                band); big_empty is share > 0.25 and ink < 0.15, "big and empty"
 *   wraps        up to 10 elements meant to sit on one line (`.tab`, `button`, nav/rail links,
 *                `h1`–`h3`, chips, labels) whose height is more than 1.6× their own computed
 *                line-height, i.e. wrapping when they should not: {tag, cls, text, lines} */
import { browser as launch } from "./browser.mjs";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf("--" + name); if (i < 0) return def; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const flag = name => { const i = argv.indexOf("--" + name); if (i < 0) return false; argv.splice(i, 1); return true; };
const bandsMode = flag("bands");
const widths = opt("widths", bandsMode ? "400,1200,1920,3440" : "1280,1920,2560,3440").split(",").map(Number);
const out = path.resolve(opt("out", "layout-check-out"));
const height = Number(opt("height", 1000));
const urls = argv.filter(a => !a.startsWith("--"));
if (!urls.length){ console.error("usage: node Server/layout-check.mjs <url...> [--widths 1280,1920,2560,3440] [--bands]"); process.exit(2); }

const measure = () => {
	const W = innerWidth, H = innerHeight, vis = el => el.checkVisibility?.() ?? true;
	const cols = 40, rows = 25, grid = new Uint8Array(cols * rows);
	const mark = r => {
		const x0 = Math.max(0, Math.floor(r.left / W * cols)), x1 = Math.min(cols - 1, Math.floor((r.right - 0.01) / W * cols));
		const y0 = Math.max(0, Math.floor(r.top / H * rows)), y1 = Math.min(rows - 1, Math.floor((r.bottom - 0.01) / H * rows));
		for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y * cols + x] = 1;
	};
	let widest = 0, widest_text = "";
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n; (n = walker.nextNode());){
		if (!n.textContent.trim() || !vis(n.parentElement)) continue;
		if (n.parentElement.closest("script,style,.dev-bar")) continue;
		const rg = document.createRange(); rg.selectNodeContents(n);
		for (const r of rg.getClientRects()){
			if (r.width < 1 || r.right < 0 || r.left > W) continue;
			mark(r);
			const pe = n.parentElement, cs = getComputedStyle(pe);
			const shown = cs.textOverflow === "ellipsis" && pe.scrollWidth > pe.clientWidth ? pe.clientWidth : r.width;   // a clipped line is only as wide as its box
			if (shown > widest && r.top < H * 3){ widest = shown; widest_text = n.textContent.trim().slice(0, 40); }
		}
	}
	document.querySelectorAll("img,canvas,svg,video,input,textarea,button,select").forEach(el => { if (vis(el)) mark(el.getBoundingClientRect()); });
	const empty = 1 - grid.reduce((a, b) => a + b, 0) / grid.length;
	// overflow: an element past the right edge whose scrolling ancestor does not scroll x
	let overflow = document.documentElement.scrollWidth > W + 1;
	const scrolls = el => { for (let p = el.parentElement; p; p = p.parentElement){ const o = getComputedStyle(p).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") return true; } return false; };
	if (!overflow) for (const el of document.body.querySelectorAll("*")){
		if (el.closest(".dev-bar") || !vis(el)) continue;
		const r = el.getBoundingClientRect();
		if (r.width && r.right > W + 2 && !scrolls(el)){ overflow = true; break; }
	}
	// items: 4+ look-alike siblings; how many are narrower than 15% of the width
	let items = 0, narrow = 0;
	document.body.querySelectorAll("*").forEach(par => {
		const by = {};
		[...par.children].forEach(c => { if (vis(c) && c.getBoundingClientRect().width) (by[c.tagName + "." + c.className] ??= []).push(c); });
		Object.values(by).forEach(g => { if (g.length >= 4){ items += g.length; narrow += g.filter(c => c.getBoundingClientRect().width < W * 0.15).length; } });
	});
	return { empty: +empty.toFixed(3), widest_text: Math.round(widest), widest_text_sample: widest_text, overflow_x: overflow, items, narrow_share: items ? +(narrow / items).toFixed(3) : 0 };
};

// The --bands reading: tab rows, left-edge padding stack, the top-level band stack down to
// ~3 screen heights, and one-line elements that wrapped. Read the header comment above for
// what each field means; this is only the how.
const measureBands = () => {
	const W = innerWidth, H = innerHeight, vis = el => el.checkVisibility?.() ?? true;
	const cls1 = el => (typeof el.className === "string" && el.className.trim().split(/\s+/)[0]) || el.tagName.toLowerCase();

	// 1. tab_rows — the worst (highest) row count across every tab bar on the page.
	let tab_rows = 0;
	document.querySelectorAll(".tab-bar, [role=tablist]").forEach(bar => {
		if (!vis(bar)) return;
		const tabs = [...bar.querySelectorAll(".tab, [role=tab]")].filter(vis);
		if (!tabs.length) return;
		tab_rows = Math.max(tab_rows, new Set(tabs.map(t => Math.round(t.getBoundingClientRect().top))).size);
	});

	// 1b. layout — which audited page layout this renders as (core/Page/audit/, most specific
	// first; a marker counts only on a visible box of 4%+ of the screen). "custom" = none of them.
	// tabs_gap — px from the h1's right edge to the first tab when they share a row: Doc puts
	// its tabs beside the title, so a big gap is tabs pushed away (AI 2's were, 2026-09-30).
	const big = sel => [...document.querySelectorAll(sel)].some(el => { const r = el.getBoundingClientRect(); return vis(el) && r.width * r.height >= 0.04 * W * H; });
	// the page's own shell wins over a part drawn inside it (a Doc page that demos a catalog is doc)
	const LAYOUTS = [["ai2", ".ai2-head, .ai2"], ["blog", ".blog-shell"], ["sources", ".sources-files"], ["doc", ".doc-page"],
		["floating", ".floating"], ["columns", ".page.columns, .page-column"], ["catalog", ".page-catalog"], ["browse", ".browse"],
		["switcher", ".switcher"], ["wall", ".page-previews, .std-tree"], ["standard", ".page.standard"]];
	const layout = (LAYOUTS.find(([, sel]) => big(sel)) || ["custom"])[0];
	let tabs_gap = null;
	const h1 = [...document.querySelectorAll(".active-page h1, h1")].find(vis);
	// the leftmost PAINTED tab, not the first in the DOM: a host may reorder its tabs with `order`
	const tab1 = [...document.querySelectorAll(".tab-bar .tab, [role=tab]")].filter(vis)
		.sort((x, y) => x.getBoundingClientRect().left - y.getBoundingClientRect().left)[0];
	if (h1 && tab1){
		const a = h1.getBoundingClientRect(), t = tab1.getBoundingClientRect();
		if (t.top < a.bottom && t.bottom > a.top) tabs_gap = Math.round(t.left - a.right);
	}

	// 2. left_stack — walk from the first visible h1/p up to <body>, listing every ancestor
	// that adds left-hand space. `.sidebar-rail` is the site's own nav column (core/Sidebar) —
	// never "the content", so it is excluded even when it is the leaf page's own sidebar.
	const inSidebar = el => !!el.closest(".sidebar-rail");
	const stackFor = start => {
		if (!start) return { total: 0, layers: [] };
		const layers = [];
		let total = 0;
		for (let n = start; n && n !== document.body; n = n.parentElement){
			const cs = getComputedStyle(n);
			const px = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.marginLeft);
			if (px > 0.5){ layers.push({ cls: cls1(n), px: Math.round(px) }); total += px; }
		}
		return { total: Math.round(total), layers };
	};
	const firstH1 = [...document.querySelectorAll("h1")].find(el => vis(el) && !inSidebar(el));
	const firstP = [...document.querySelectorAll("p")].find(el => vis(el) && !inSidebar(el));
	const left_stack = { h1: stackFor(firstH1), p: stackFor(firstP) };

	// 3. bands — the active page's own top-level vertical stack. `.page.active-page` is the
	// Router's own mark for "the leaf page you are actually on" (core/Router/Router.js); descend
	// through single-child wrappers until the real stack branches, same idea as `left_stack`
	// skipping past padding-only boxes.
	// ⚠ Two traps a naive `[...el.children]` walk hits on this framework's own DOM:
	// (1) `display: contents` (core/Page's own nested-page wrapper — see readme,
	// "nested pages ARE peers via display: contents") makes an element generate NO box of
	// its own, so `checkVisibility()` is correctly false for it even though its children
	// really are on screen — expand it into those children instead of dropping it.
	// (2) branch on the RAW child count, not the visible one: a lazily-filled tab panel can
	// still be `display:none` at scan time (checkVisibility() false, a real sibling all the
	// same) — filtering first would misread "one wrapper, one real child, one not-yet-shown
	// child" as a single-child wrapper and descend straight past the actual stack.
	const expandContents = el => getComputedStyle(el).display === "contents" ? [...el.children].flatMap(expandContents) : [el];
	const realChildren = el => [...el.children].flatMap(expandContents);
	let root = document.querySelector(".page.active-page") || document.body;
	while (root){
		const kids = realChildren(root);
		if (kids.length !== 1) break;
		root = kids[0];
	}
	const stackKids = root ? realChildren(root).filter(vis) : [];

	// One ink grid covering 3 screen heights (same sampling idea as `empty` above, just taller),
	// so each band's own `ink` is a slice of ONE pass over the DOM rather than one pass per band.
	const maxH = H * 3, cols = 40, gridRows = Math.max(1, Math.round(maxH / H * 25));
	const grid = new Uint8Array(cols * gridRows);
	const mark = r => {
		const x0 = Math.max(0, Math.floor(r.left / W * cols)), x1 = Math.min(cols - 1, Math.floor((r.right - 0.01) / W * cols));
		const y0 = Math.max(0, Math.floor(r.top / maxH * gridRows)), y1 = Math.min(gridRows - 1, Math.floor((r.bottom - 0.01) / maxH * gridRows));
		for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y * cols + x] = 1;
	};
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n; (n = walker.nextNode());){
		if (!n.textContent.trim() || !vis(n.parentElement)) continue;
		if (n.parentElement.closest("script,style,.dev-bar")) continue;
		const rg = document.createRange(); rg.selectNodeContents(n);
		for (const r of rg.getClientRects()){
			if (r.width < 1 || r.right < 0 || r.left > W || r.top > maxH || r.bottom < 0) continue;
			mark(r);
		}
	}
	document.querySelectorAll("img,canvas,svg,video,input,textarea,button,select").forEach(el => {
		if (!vis(el)) return;
		const r = el.getBoundingClientRect();
		if (r.top < maxH && r.bottom > 0) mark(r);
	});
	const inkOf = (y, h) => {
		const y0 = Math.max(0, Math.floor(y / maxH * gridRows)), y1 = Math.min(gridRows - 1, Math.floor((y + h - 0.01) / maxH * gridRows));
		if (y1 < y0) return 0;
		let filled = 0, total = 0;
		for (let yy = y0; yy <= y1; yy++) for (let x = 0; x < cols; x++){ total++; if (grid[yy * cols + x]) filled++; }
		return total ? +(filled / total).toFixed(3) : 0;
	};
	const bands = stackKids
		.map(el => {
			const r = el.getBoundingClientRect();
			const y = Math.round(r.top), h = Math.round(r.height), share = +(h / H).toFixed(3), ink = inkOf(y, h);
			return { cls: cls1(el), y, h, share, ink, big_empty: share > 0.25 && ink < 0.15 };
		})
		.filter(b => b.y < maxH);

	// 4. wraps — a one-line element (a tab, a button, a nav/rail link, a heading, a chip or a
	// label) whose own TEXT is taking up more than 1.6x its line-height worth of height means
	// it wrapped. ⚠ Padding, not wrapping: a nav row (`.ui-tree-row`) is deliberately taller
	// than its text for a comfortable click target, so the RAW border-box height read as
	// "1.8 lines" for every row on the page, wrapped or not (a false positive caught by
	// screenshot-checking this exact page — 09-30 proof). Subtracting padding and border first
	// leaves only the space the text itself is using.
	const wraps = [];
	document.querySelectorAll(".tab, button, nav a, .ui-tree-row, [role=tab], h1, h2, h3, .chip, .label").forEach(el => {
		if (wraps.length >= 10 || !vis(el)) return;
		const r = el.getBoundingClientRect();
		if (!r.height || r.top > maxH) return;
		const cs = getComputedStyle(el);
		const lh = parseFloat(cs.lineHeight);
		if (!lh || !Number.isFinite(lh)) return;
		const vert = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
		const lines = Math.max(0, r.height - vert) / lh;
		if (lines > 1.6) wraps.push({ tag: el.tagName.toLowerCase(), cls: cls1(el), text: (el.textContent || "").trim().slice(0, 30), lines: +lines.toFixed(1) });
	});

	return { layout, tabs_gap, tab_rows, left_stack, bands, wraps };
};

const slug = u => u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "page";
const b = await launch();
const t0 = Date.now();
const contexts = await Promise.all(widths.map(w => b.newContext({ viewport: { width: w, height } })));
let bad = 0;
for (const url of urls){
	const dir = path.join(out, slug(url)); fs.mkdirSync(dir, { recursive: true });
	const res = { url, widths: {}, errors: [] };
	await Promise.all(widths.map(async (w, i) => {
		const page = await contexts[i].newPage();
		const errs = [];
		page.on("console", m => { if (m.type() === "error") errs.push(w + ": " + m.text().slice(0, 200)); });
		page.on("pageerror", e => errs.push(w + ": " + String(e).slice(0, 200)));
		await page.addInitScript(() => { window.$BLOCKRELOAD = true; });
		await page.goto(url, { waitUntil: "load", timeout: 15000 }).catch(e => errs.push(w + ": goto " + e.message.slice(0, 100)));
		await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {});
		await page.waitForTimeout(1200);
		res.widths[w] = await page.evaluate(measure);
		if (bandsMode) Object.assign(res.widths[w], await page.evaluate(measureBands));
		if (bandsMode){
			// Full page, capped at 3 screen heights — band reading needs what's below the
			// fold, but an infinite-scroll or a very tall doc page would otherwise make one
			// screenshot huge. Growing the viewport itself (rather than fullPage: true)
			// keeps this a plain, uncropped screenshot at exactly that height.
			const docH = await page.evaluate(() => document.documentElement.scrollHeight);
			await page.setViewportSize({ width: w, height: Math.min(docH, height * 3) });
		}
		await page.screenshot({ path: path.join(dir, w + ".png") });
		res.errors.push(...errs);
		await page.close();
	}));
	// contact sheet: every width scaled to the same height, side by side
	const sheet = await b.newPage({ viewport: { width: 2400, height: 700 } });
	const total = widths.reduce((a, w) => a + w, 0), scale = (2400 - 20 * widths.length) / total;
	const html = `<body style="margin:0;background:#222;font:14px sans-serif;color:#fff"><div style="display:flex;gap:20px;padding:10px;align-items:flex-start">` +
		widths.map(w => `<figure style="margin:0"><img style="display:block;width:${Math.round(w * scale)}px;border:1px solid #666" src="data:image/png;base64,${fs.readFileSync(path.join(dir, w + ".png")).toString("base64")}"><figcaption>${w}px · empty ${Math.round(res.widths[w].empty * 100)}% · widest ${res.widths[w].widest_text}px</figcaption></figure>`).join("") + `</div></body>`;
	await sheet.setContent(html); await sheet.screenshot({ path: path.join(dir, "sheet.png"), fullPage: true }); await sheet.close();
	res.errors = [...new Set(res.errors)];
	fs.writeFileSync(path.join(dir, "layout.json"), JSON.stringify(res, null, 1));
	const flags = (res.errors.length || Object.values(res.widths).some(m => m.overflow_x)) ? 1 : 0; bad += flags;
	console.log(url, flags ? "PROBLEMS" : "ok", "→", path.join(dir, "sheet.png"));
	widths.forEach(w => {
		const m = res.widths[w];
		if (bandsMode){
			const bigEmpty = m.bands.filter(band => band.big_empty).length;
			const leftPick = m.left_stack.h1.total >= m.left_stack.p.total ? m.left_stack.h1 : m.left_stack.p;
			const gap = m.tabs_gap == null ? "" : `  tabs-gap:${m.tabs_gap}px${m.tabs_gap > 64 ? " (pushed away from the title)" : ""}`;
			console.log(`  ${w}  layout:${m.layout}${gap}  tabs:${m.tab_rows} row${m.tab_rows === 1 ? "" : "s"}  left:${leftPick.total}px (${leftPick.layers.length} layers)  bands:${m.bands.length} (${bigEmpty} big-empty)  wraps:${m.wraps.length}`);
		} else {
			console.log(`  ${w}: empty ${m.empty} · widest ${m.widest_text}px · overflow ${m.overflow_x} · narrow ${m.narrow_share} of ${m.items}`);
		}
	});
	if (res.errors.length) console.log("  errors:", res.errors.slice(0, 3));
}
await b.close();
console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(bad ? 1 : 0);
