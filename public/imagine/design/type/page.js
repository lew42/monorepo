import { Page, div, span, h2, h3, h5, p, code, a, img, figure, figcaption, md } from "/app.js";

const here = new URL(".", import.meta.url).pathname;

/* The type scale as it actually ships — theme lew42.css overriding framework.css's
   base defaults. Each row renders the REAL style — `.h1`..`.h4` on a `<p>` (the
   framework's own "borrow a level, keep the tag" idiom, framework.css §type-scale)
   for the four the theme reaches, a real `<h5>` for the one it doesn't — so the
   look updates itself if the theme ever changes; only the caption numbers are
   hand-read off the two stylesheets. */
const LEVELS = [
	{ cls: "h1", label: "h1 — Page Title", meta: "900 · 3em · 1.1 lh", sample: "Every HTML tag is a function." },
	{ cls: "h2", label: "h2 — Section", meta: "700 · 2.25em · 1.25 lh", sample: "Every HTML tag is a function." },
	{ cls: "h3", label: "h3 — Sub-section", meta: "600 · 1.5em · 1.4 lh", sample: "Every HTML tag is a function." },
	{ cls: "h4", label: "h4 — Annotation", meta: "700 · 0.875em · uppercase", sample: "every html tag is a function" },
	{ cls: "", label: "body", meta: "500 · 1em · 1.8 lh", sample: "Call it, and the element appears — that box is this code, running here." },
	{ cls: "", tag: "code", label: "code — mono", meta: "700 · 0.875em · Consolas stack", sample: "el.append(child)" },
	{ cls: "", tag: "h5", label: "h5 (or h6) — unstyled by the theme", meta: "700 · 1em — identical to a bold sentence", sample: "Every HTML tag is a function." },
];

const row = lv => div.c("flex v gap", () => {
	span.c("muted", `${lv.label} — ${lv.meta}`);
	div(() => {
		if (lv.tag === "code") code(lv.sample);
		else if (lv.tag === "h5") h5(lv.sample);
		else if (lv.cls) p.c(lv.cls, lv.sample);
		else p(lv.sample);
	});
}).style({ gap: "0.3em", borderBlockEnd: "1px solid var(--line)", paddingBlock: "0.8em" });

const CH_DEMO_TEXT = "Every HTML tag is a function. Call it, and the element appears — that box is this code, running here, with no build step between the file and the browser that reads it.";

const ch_col = n => div.c("flex v gap", () => {
	span.c("muted", `${n}ch`);
	p(CH_DEMO_TEXT).style({ width: `${n}ch`, maxWidth: "100%", margin: "0" });
}).style({ gap: "0.3em", paddingBlockEnd: "1em" });

const RATIOS = [
	["h1 / h2", "3 / 2.25", "1.33×"],
	["h2 / h3", "2.25 / 1.5", "1.5×"],
	["h3 / body", "1.5 / 1", "1.5×"],
	["h5, h6 / body", "1 / 1", "1× — collapses"],
];

const ratio_row = ([pair, ems, mult]) => div.c("flex gap", () => {
	span(pair).style({ flex: "0 0 10em", fontWeight: "700" });
	span.c("muted", ems).style({ flex: "0 0 8em" });
	span(mult);
}).style({ gap: "1em", padding: "0.4em 0", borderBlockEnd: "1px solid var(--line)" });

const CRIT = [
	{ file: "h5h6-fail.jpg", verdict: "FAILURE", title: "h5/h6 = bold body, exactly", note: "the theme overrides h1–h4 upward but never touches h5/h6 — they ship at framework.css's base 1em/700, pixel-identical to a bold sentence. Used 3× site-wide; a trap waiting for the 4th." },
	{ file: "scale-good.jpg", verdict: "GOOD", title: "h1 → h4 — four unmistakable steps", note: "the framework's own scale demo (styles/elements/text/) — every level a different size AND weight, no two adjacent levels closer than 1.33×." },
	{ file: "caption-vs-body.jpg", verdict: "GOOD", title: "byline → standfirst → h2 → body, one page", note: "a blog post builds its OWN micro-scale on top of the site's: 0.85em byline, 1.1em standfirst, then the real h2/body ladder — four distinct sizes in six lines, nothing muddy."},
];

const crit_card = c => figure.c("flex v gap", () => {
	img().attr("src", here + "shots/" + c.file).attr("alt", c.title)
		.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" });
	figcaption(() => {
		span(c.verdict + " — ").style({ fontWeight: "700", color: c.verdict === "GOOD" ? "var(--prim)" : "inherit" });
		span(c.title);
		p.c("muted", c.note).style({ margin: "0.3em 0 0" });
	});
}).style({ gap: "0.4em", margin: "0" });

/**
 * The type study (2026-09-01) — faces, weights, line-height, measure, hierarchy.
 * Measured across 12 prose-heavy pages × 1280/3440 (816 text blocks, 0 errors;
 * raw data + probe script referenced in the task dir) via a `getComputedStyle` +
 * canvas-advance probe, not `ext/DesignTool`'s own (that's the sibling scale-study's
 * tool, reused here only for the fluid-root numbers it already published).
 */
export default new Page({
	meta: import.meta,
	title: "Type",
	description: "The site's typography as it actually ships — one live specimen sheet, the measure question settled with real numbers, and the one hierarchy step that silently collapses.",
	icon: "text_fields",
	width: "full",

	// A real screenshot instead of the default icon+description card, on the design/
	// index only (2026-09-05 ux-rethink).
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/scale-good.jpg").attr("alt", nav.label));
	},

	content(){
		md("**One face for reading (Montserrat, loaded as a single variable file, weights 100–900), one system-monospace stack for code (`Consolas, 'Courier New', Monaco, monospace` — declared, not loaded, so what a reader actually sees depends on what's installed on their machine).** Six declared heading levels, and the theme (`lew42.css`) overrides four of them upward from the framework's base defaults — h1 through h4. It never reaches h5/h6, which is where the one real failure below lives. Measured across 12 prose pages × 1280/3440 (816 text blocks, 0 errors — `type-raw.json` in this task's dir).");

		h2("The specimen sheet");
		p.c("muted", "Every row below is the real element, rendered live — if the theme changes, this changes with it. The caption is what's declared; the size is what you're looking at.");
		div.c("flow", () => LEVELS.forEach(lv => row(lv)));

		h2("The measure question");
		md("`characters-per-line.md` (`ext/DesignTool/knowledge/`) measured the site's `--measure` token at **52em** and found 83–108 characters a line — over the classic 45–90 comfortable band on the dense end. **That token has since moved.** `Page.css` ships `--measure: 40em` today (twice, lines 52 and 124 — the 2026-08-17 change note says the old wide-track cap was replaced after measuring 53% of a 3440 screen sitting dead). Direct measurement of real running prose — paragraphs, list items, blockquotes, across all 12 pages, both widths, filtering out single-line captions and demo/code boxes that don't represent a wrapped line — found **zero blocks over 95 characters**. The p-tag median is **~80–81 characters**, identical at 1280 and 3440 (the fluid root makes the column viewport-invariant, exactly as the doc's own methodology predicted). ");
		p.c("muted", () => { span("Verdict: "); span("the doc is stale on the token's live value, not wrong about the method — 40em already sits inside the comfortable band, nearer its top edge (Bringhurst's 66 is the tighter classic target) than its ceiling. If a tighter column is wanted, the next notch down is ~33–34em, not a structural rewrite.").style({fontWeight:"700"}); });

		h3("What 45 / 66 / 95 characters actually look like");
		div.c("flow", () => [45, 66, 95].forEach(n => ch_col(n)));

		h2("Hierarchy — the scale as built");
		p.c("muted", "The classic ladder uses ratios around 1.2–1.333 between adjacent levels. This site's live ratios, read off the two stylesheets:");
		div.c("flow", () => RATIOS.forEach(r => ratio_row(r)));
		p.c("muted", "1.33–1.5× between every level that the theme actually reaches is generous — nothing in the sanctioned h1–h4–body ladder is hard to tell apart at a glance. The one place the ladder breaks is the one row the theme forgot.");
		div.c("grid auto gap", () => CRIT.forEach(c => crit_card(c))).style("--column", "20em");

		h2("Three moves");
		md("**One** — give h5/h6 a real rule in the theme (even just `1.1em/600`, one size a hair above body) or delete them from the vocabulary; a level that silently equals bold body is worse than no level. **Two** — line-height on running prose is uniformly 1.8 (90% of every prose block measured), which is generous rather than cramped — the opposite of the failure this study went looking for; nobody needs to touch it, but a future component reaching for a tighter block quote or caption shouldn't inherit 1.8 by accident. **Three** — `.muted` only fades color, never shrinks size; the blog module already built its own byline/standfirst sizes to compensate (0.85em / 1.1em) — a shared `.caption` step (~0.85em) in the framework's own type scale would save every future module from re-deriving the same fix.");
	},
});
