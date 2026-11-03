/**
 * scan.mjs — measure one site's layout at four widths and merge the numbers into its record.
 *
 *     node public/websites/tools/scan.mjs <url> <name>
 *
 * Writes `scan` (machine-owned, never hand-edited) and `responsive.queries`. What it
 * measures, at 400 / 1280 / 1920 / 3440:
 *
 *   every landmark  — header nav main aside footer section article [role]
 *   the five biggest boxes by area that are not already a landmark
 *
 * and for each: tag, id, first two classes, the computed `display`,
 * `grid-template-columns` / `-rows`, `flex-direction`, `flex-wrap`, `position`,
 * `columns`, `float`, its rect — and `side_by_side`, the number of direct children
 * whose tops line up within 8px. **That last number is the column count a human sees**,
 * whatever CSS produced it: a flex row, a grid, floats and inline-blocks all report it
 * the same way, which is exactly the point.
 *
 * ⚠ The CSS comes off the WIRE, not the CSSOM. On any real site `styleSheet.cssRules`
 *   throws for every cross-origin sheet (5 of 5 on stripe.com), so the media queries
 *   would come back empty and look like a site with no breakpoints. Responses with
 *   `content-type: text/css` plus the inline `<style>` text are the whole picture.
 *   `getComputedStyle`, by contrast, works everywhere and IS the result of the cascade.
 */
import { launch, read_record, usage, visit, widths, write_record } from "./lib.mjs";

const [url, name] = process.argv.slice(2);
if (!url || !name) usage("usage: node public/websites/tools/scan.mjs <url> <name>");

/* Runs INSIDE the page. Everything it needs is in this one function — a page.evaluate
 * callback is serialised, so it can close over nothing from this file. */
function measure(){
	const round = n => Math.round(n);
	const seen = new Set();

	const shot = (el, why) => {
		const cs = getComputedStyle(el);
		const r = el.getBoundingClientRect();

		/* The column count a human would count: group the element's own children by the
		 * top of their box (8px of slack absorbs baseline and border wobble) and take the
		 * biggest group. One row of three cards -> 3, a stack of rows -> 1. */
		const tops = [];
		for (const kid of el.children){
			const k = kid.getBoundingClientRect();
			if (k.width < 1 || k.height < 1) continue;
			const row = tops.find(t => Math.abs(t.top - k.top) < 8);
			if (row) row.n++; else tops.push({ top: k.top, n: 1 });
		}

		return {
			why,
			tag: el.tagName.toLowerCase(),
			id: el.id || undefined,
			class: [...el.classList].slice(0, 2).join(" ") || undefined,
			role: el.getAttribute("role") || undefined,
			display: cs.display,
			cols: cs.gridTemplateColumns === "none" ? undefined : cs.gridTemplateColumns.slice(0, 60),
			rows: cs.gridTemplateRows === "none" ? undefined : cs.gridTemplateRows.slice(0, 60),
			dir: cs.display.includes("flex") ? cs.flexDirection : undefined,
			wrap: cs.display.includes("flex") ? cs.flexWrap : undefined,
			position: cs.position === "static" ? undefined : cs.position,
			columns: cs.columnCount === "auto" ? undefined : cs.columnCount,
			float: cs.float === "none" ? undefined : cs.float,
			rect: [round(r.x), round(r.y), round(r.width), round(r.height)],
			side_by_side: tops.length ? Math.max(...tops.map(t => t.n)) : 0,
		};
	};

	const out = [];
	const take = (el, why) => {
		if (seen.has(el)) return false;
		const r = el.getBoundingClientRect();
		if (r.width < 1 || r.height < 1) return false;   // a hidden drawer or menu is not layout
		seen.add(el);
		out.push(shot(el, why));
		return true;
	};

	// The real landmarks first, and they get the budget.
	for (const el of document.querySelectorAll("header, nav, main, aside, footer, section, article")){
		if (out.length >= 20) break;
		take(el, "landmark");
	}

	/* Then `role=` boxes — a div-soup site labels its regions this way and has no
	 * <header> at all. ⚠ Filtered hard, because the first version was not: a bare
	 * `[role]` sweep spent stripe.com's whole budget on ten identical 142x34 `<svg
	 * role="img">` logos and wikipedia's on absolutely-positioned menu checkboxes,
	 * and the actual page columns fell off the end of the list. A layout box is not a
	 * graphic or a control, and it is bigger than a thumbnail. */
	for (const el of document.querySelectorAll("[role]")){
		if (out.length >= 26) break;
		if (/^(svg|img|input|button|a|li|span|path)$/.test(el.tagName.toLowerCase())) continue;
		const r = el.getBoundingClientRect();
		if (r.width * r.height < 20000) continue;
		take(el, "role");
	}

	// The five biggest remaining boxes: on a div-soup site with no landmarks at all,
	// these ARE the layout. html and body are excluded — they are always the page.
	const rest = [...document.querySelectorAll("body *")]
		.filter(el => !seen.has(el))
		.map(el => ({ el, r: el.getBoundingClientRect() }))
		.filter(x => x.r.width > 1 && x.r.height > 1)
		.sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height)
		.slice(0, 5);
	for (const { el } of rest) out.push(shot(el, "largest"));

	return {
		title: document.title,
		doc: [round(document.documentElement.scrollWidth), round(document.documentElement.scrollHeight)],
		/* THE INLINE STYLE TEXT ITSELF, not just how much of it there is. A `<style>`
		 * block is never a network response, so `page.on("response")` cannot see it —
		 * and any site that ships its CSS inline (every Framer build; privy.io ships
		 * 286 KB that way) read as a site with no stylesheets AND no breakpoints at
		 * all until this crossed the page boundary. */
		inline_css: [...document.querySelectorAll("style")].map(s => s.textContent),
		elements: out,
	};
}

const browser = await launch();

const sheets = new Map();            // url -> text, deduplicated across the four loads
const inline = new Set();            // <style> text, deduplicated the same way
const at = { media: new Set(), container: new Set() };
const by_width = {};
let title = null, failed = 0;

for (const { key, width, height } of widths){
	const page = await browser.newPage({ viewport: { width, height } });
	page.on("response", async r => {
		if (!(r.headers()["content-type"] ?? "").includes("text/css")) return;
		if (sheets.has(r.url())) return;
		try { sheets.set(r.url(), await r.text()); } catch {}
	});

	console.log(`  ${key} …`);
	const res = await visit(page, url);
	if (!res){ failed++; await page.close(); continue; }

	const m = await page.evaluate(measure);
	title ??= m.title;
	m.inline_css.forEach(text => inline.add(text));
	by_width[key] = { doc: m.doc, elements: m.elements };
	await page.close();
}

await browser.close();
if (failed === widths.length) usage(`scan ${name}: every load failed — nothing written`);

/* THE HAYSTACK the regexes read: every stylesheet that came off the wire, PLUS the
 * inline `<style>` text. Both halves are load-bearing. Measured against privy.io: 0
 * sheets on the wire and 286 KB of inline CSS, which reported `0 media queries` and
 * made a fully responsive site look like one with no breakpoints at all — the old
 * code counted the inline BYTES and left the TEXT behind in the page. */
const inline_css = [...inline];
const css = [...sheets.values(), ...inline_css].join("\n");
const inline_bytes = inline_css.reduce((n, text) => n + text.length, 0);
const bytes = css.length;
for (const [m] of css.matchAll(/@media\s*([^{]+)\{/g)) at.media.add(m.replace(/@media\s*/, "").trim().slice(0, 80));
for (const [m] of css.matchAll(/@container\s*([^{]+)\{/g)) at.container.add(m.replace(/@container\s*/, "").trim().slice(0, 80));

// Every px value any query mentions, most-used first — the shortlist a human picks
// `responsive.breakpoints` from. A number, not a verdict: a site's real breakpoints
// are the two or three of these that actually move something.
const px = {};
for (const q of at.media) for (const [, n] of q.matchAll(/(\d+)px/g)) px[n] = (px[n] ?? 0) + 1;
const breakpoints_seen = Object.entries(px).sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 12)
	.map(([n, count]) => ({ px: +n, count }));

const media = [...at.media].sort();
const prev = await read_record(name);

await write_record(name, {
	title: prev?.title ?? title ?? name,
	responsive: { ...(prev?.responsive ?? {}), queries: media },
	scan: {
		scanned_at: new Date().toISOString(),
		css: { sheets: sheets.size, bytes, inline_blocks: inline_css.length, inline_bytes },
		media, container: [...at.container].sort(), breakpoints_seen,
		widths: by_width,
	},
});

console.log(`scanned ${name}: ${sheets.size} sheets + ${inline_css.length} inline blocks / ${bytes} bytes, ${media.length} media queries, `
	+ widths.map(w => `${w.key}:${by_width[w.key]?.elements.length ?? 0}el`).join(" "));
