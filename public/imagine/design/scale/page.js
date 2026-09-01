import { Page, div, h2, h3, p, span, a, img, figure, figcaption, md } from "/app.js";

const here = new URL(".", import.meta.url).pathname;

// 1x/1.25x/1.6x/2.5x/4x of the page's own `1em` — so the ladder rides the site's
// real fluid root (14px@390 → 15.04px@1280 → 16px@1920 → 18px@3440) instead of a
// fixed px scale that would lie about what "bigger at 3440" actually means here.
const STEPS = [1, 1.25, 1.6, 2.5, 4];
const ROOTS = { 390: 14, 1280: 15.04, 1920: 16, 3440: 18 };

const rung = n => div.c("flex v gap").style("gap", "0.3em").style("border-block-end", "1px solid var(--line)").style("padding-block-end", "1em").append(() => {
	span.c("muted").text(`${n}× — ` + Object.entries(ROOTS).map(([w, px]) => `${Math.round(px * n)}px@${w}`).join("  ·  "));
	div.style("font-size", `${n}em`).style("font-weight", "900").style("line-height", "1.1").text("Read this at every step.");
	if (n >= 1.6) div.style("font-size", `${n * 0.42}em`).style("color", "var(--subtle)").text("Five sizes of the same two lines — this is what growing with the screen feels like.");
});

const SPECTRUM = {
	390:  { distinct: 18, mode: [11, 35.8], rows: [[11, 35.8], [13, 24.5], [12, 18.0], [14, 15.8], [10, 3.6]] },
	1280: { distinct: 19, mode: [12, 36.3], rows: [[12, 36.3], [14, 25.2], [15, 18.3], [13, 14.2], [11, 2.3]] },
	3440: { distinct: 22, mode: [15, 32.4], rows: [[15, 32.4], [16, 21.1], [18, 18.3], [14, 11.8], [17, 10.7]] },
};

const bar = ([px, pct]) => div.c("flex v-center gap").style("gap", "0.6em").append(() => {
	span.style("width", "3.5em").style("flex", "0 0 auto").text(px + "px");
	div.style("flex", "1 1 auto").style("background", "var(--line)").style("border-radius", "0.2em").append(() =>
		div.style("width", pct + "%").style("height", "0.85em").style("border-radius", "0.2em").style("background", "var(--prim)"));
	span.c("muted").style("width", "3.5em").style("flex", "0 0 auto").text(pct + "%");
});

const spectrum_col = w => div.c("flex v gap").style("gap", "0.5em").append(() => {
	h3(w + "px");
	span.c("muted").text(`${SPECTRUM[w].distinct} distinct sizes — top 5 by character count`);
	SPECTRUM[w].rows.forEach(row => bar(row));
});

const SHOTS = [
	{ file: "gallery.jpg", url: "/imagine/gallery/", used: "13%", verdict: "MISS", note: "a catalog list + an empty detail pane — 108 nodes, all of them in a 290px column" },
	{ file: "notes.jpg", url: "/notes/", used: "23%", verdict: "MISS", note: "a title, one line, three cards — everything below the fold and right of 520px is void" },
	{ file: "notes-git-branch-names.jpg", url: "/notes/git-branch-names/", used: "21%", verdict: "MISS", note: "the page's only content, pinned top-left at body size, on the only reader this screen has" },
	{ file: "michael.jpg", url: "/michael/", used: "19%", verdict: "MISS", note: "a sandbox home — two columns of cards stop at ~700px on a 3440px row" },
	{ file: "observatory.jpg", url: "/imagine/scenes/observatory/", used: "100%", verdict: "GOOD", note: "a full-bleed scene — nothing left over to have scaled" },
	{ file: "mag.jpg", url: "/imagine/mag/", used: "47%*", verdict: "GOOD", note: "*the page is still sparse, but its headline is `clamp(2.2rem, 17cqw, 12rem)` — 60px → 118px → 192px as the screen grows. The one place the site already does this." },
];

const shot = s => figure.c("flex v gap").style("gap", "0.4em").style("margin", "0").append(() => {
	a.href(s.url).append(() => img.attr("src", here + "shots/" + s.file).attr("alt", s.url).style("width", "100%").style("border", "1px solid var(--line)").style("border-radius", "0.3em"));
	figcaption.append(() => {
		span.style("font-weight", "700").style("color", s.verdict === "GOOD" ? "var(--prim)" : "inherit").text(s.verdict + " — ");
		a.href(s.url).text(s.url);
		span.c("muted").text(` — ${s.used} of a 3440 screen used. ${s.note}`);
	});
});

/**
 * The scale study (2026-09-01) — the owner's hypothesis was "if it's 3440 and we
 * have only a few things, they don't need to be small." `scale-raw.json` in the
 * task dir is the measurement this page reads: 25 pages × 390/1280/3440, via
 * `ext/DesignTool`'s own `probe()`+`metrics()`.
 */
export default new Page({
	meta: import.meta,
	title: "Scale",
	description: "When the site goes small and when it goes big — a live ladder, the site's real font-size spectrum, and the pages a 3440 screen is wasted on.",
	icon: "format_size",
	width: "full",

	content(){
		md("**\"If it's 3440, and we have only a few things, they don't need to be small. Layout is scale, visual hierarchy.\"** Measured across 25 pages at 390/1280/3440 (`ext/DesignTool`'s own `probe()`+`metrics()`, raw data in this task's dir). Three findings: the site's type spectrum is almost entirely body-and-smaller; a handful of pages sit under 25% of a 3440 screen used while their type stays exactly the size it is at 1280; and one page already does the opposite, on purpose.");

		h2("The ladder");
		p.c("muted").text("The same two lines, five steps of the page's own em. Resize the window — every number below moves with the site's real root, 14px at 390 up to 18px at 3440.");
		div.c("flow", () => STEPS.forEach(n => rung(n)));

		h2("The spectrum");
		p.c("muted").text("What the site actually draws, weighted by how much text is at each size — not what the stylesheet declares. Six declared heading levels compress into four visible sizes (h1 3em · h2 2.25em · h3/h4/body 0.875–1em); by volume, small UI chrome (nav labels, badges) outweighs prose, so the commonest size is smaller than body itself at every width.");
		div.c("grid auto gap", () => Object.keys(SPECTRUM).forEach(w => spectrum_col(w))).style("--column", "16em");
		p.c("muted").text("The largest text on the sample: a magazine cover headline, 59.5px → 117.6px → 192px — the one element on the site sized off the viewport instead of the type scale.");

		h2("The missed opportunities");
		p.c("muted").text("\"% used\" is DesignTool's width_used — the union of what a page actually draws, over the frame. A doc page with a sidebar can read 90%+ without a single wide element (chrome unions with a narrow column); the numbers below are pages where NOTHING does that — the screenshot is the real evidence, the percentage just confirms it.");
		div.c("grid auto gap", () => SHOTS.forEach(s => shot(s))).style("--column", "20em");

		h2("When to scale up");
		md("**A page whose content already needs the row — a tile wall, a table, a multi-column read — should add tracks or regions at 3440 ([widescreen.md](/framework/ext/DesignTool/knowledge/widescreen/)'s job).** A page whose content does NOT need the row — one article, a short list, a handful of cards, an empty state — is the other case, and today it just sits small in a sea of background: that page should scale its TYPE and its GAPS with the viewport instead (a `clamp()` or `cqw` root, the way the magazine cover already does), because there is no second column coming to fill the rest. Few elements + spare width is a scale-up signal, not a layout-is-fine signal.");
	},
});
