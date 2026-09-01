import { Page, View, div, h2, h3, h4, p, a, img, span, figure, figcaption, md } from "/app.js";

View.stylesheet(import.meta, "color-study.css");
const here = new URL(".", import.meta.url).pathname;

/**
 * The color study (2026-09-01) — every color-bearing token in the lew42 theme, what
 * each one paints, and where measured usage strays from the palette. Source:
 * `framework.css` `:root` + `styles/layers/theme/lew42/lew42.css`. Measured: 15
 * representative pages × light/dark (color-probe.cjs, this task's raw JSON is in
 * the task dir). Built for the theme-browser study that reads this page next.
 */

// name, paints, light hex (as authored), dark hex — "=prim" etc where a token is an
// alias rather than its own color. Grouped the way lew42.css itself groups them.
const GROUPS = [
	{ title: "Accent", tokens: [
		["--prim", "The mark's orange. FILLS, outlines, active bars, accent-color — never text.", "#FF8F60", "#FF8F60"],
		["--prim-ink", "--prim taken to text contrast. Links, active nav ink.", "#B84A24 (5.19:1)", "#FF8F60 (7.98:1)"],
	]},
	{ title: "Elevation ladder", tokens: [
		["--wash", "Page floor.", "#f2f2f2", "#171717"],
		["--tint", "A panel inside a card — one step up from wash.", "#f8f8f8", "#1f1f1f"],
		["--surface", "Card / content background — two steps up.", "#ffffff", "#262626"],
	]},
	{ title: "Text & lines", tokens: [
		["--ink", "Body text.", "#3f3f3f", "#e6e6e6"],
		["--subtle", "Captions, counts, secondary copy.", "#6a6a6a (5.41:1)", "#a8a8a8"],
		["--line", "Borders, rules; doubles as code-ink.", "#e6e6e6", "#333333"],
	]},
	{ title: "Chrome", tokens: [
		["--bg", "button.bg fill — dark in both modes on purpose.", "#3f3f3f", "#4a4a4a"],
		["--sidebar-bg", "Sidebar's own floor.", "#ffffff", "#141414"],
		["--sidebar-ink", "Sidebar text (= --ink).", "#3f3f3f", "#e6e6e6"],
		["--code-bg", "Code box floor — dark in both modes.", "#3f3f3f", "#191919"],
		["--code-ink", "Code box text — flat, not light-dark().", "#e6e6e6", "#e6e6e6"],
		["--card-shadow", "Card lift in light mode.", "rgba(0,0,0,.13)", "rgba(0,0,0,.5)"],
		["--card-ring", "Card lift in dark mode — a ring, not a shadow.", "transparent", "= --line"],
	]},
	{ title: "Status", tokens: [
		["--error", "Error state.", "#cc0000", "#ff7b72"],
		["--ok", "Success state.", "#15803d", "#4ade80"],
		["--warn", "Warn — one rung of the ok→warn→hot→error ramp.", "#a16207", "#fbbf24"],
		["--hot", "Hot — the ramp's third rung.", "#c2410c", "#fb923c"],
	]},
	{ title: "Syntax (code blocks — flat, not mode-aware)", tokens: [
		["--syn-comment", "Comments.", "#b5b5b5", "#b5b5b5"],
		["--syn-keyword", "Keywords (= --prim).", "#FF8F60", "#FF8F60"],
		["--syn-string", "Strings.", "#9ecbff", "#9ecbff"],
		["--syn-number", "Numbers.", "#79c0ff", "#79c0ff"],
		["--syn-fn", "Function names.", "#d2a8ff", "#d2a8ff"],
		["--syn-builtin", "Builtins (= --prim).", "#FF8F60", "#FF8F60"],
		["--syn-tag", "Tags.", "#7ee787", "#7ee787"],
		["--syn-attr", "Attributes.", "#fffbca", "#fffbca"],
		["--syn-meta", "Meta.", "#9d9d9d", "#9d9d9d"],
		["--syn-error", "Errors (= --prim).", "#FF8F60", "#FF8F60"],
	]},
];

const swatch = ([name, paints, lhex, dhex]) => figure.c("flex v gap").style({ margin: 0, gap: "0.35em" }).append(() => {
	span(name).style({ fontWeight: "700", fontFamily: "var(--mono)", fontSize: "0.85em" });
	div.c("color-swatch", () => {
		div.c("color-island", () => div.c("color-chip").style({ background: `var(${name})` }));
		div.c("color-island dark", () => div.c("color-chip").style({ background: `var(${name})` }));
	});
	div.c("flex gap").style({ fontSize: "0.78em" }).append(() => {
		span.c("muted", lhex);
		span.c("muted", "·");
		span.c("muted", dhex);
	});
	p.c("muted", paints).style({ fontSize: "0.85em", margin: 0 });
});

const shot = (file, alt) => img().attr("src", here + "shots/" + file).attr("alt", alt || "")
	.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" });

const FAILS = [
	{ file: "fail-ai-card-title.jpg", ratio: "2.25:1", where: "/framework/ai/2026-09-01/ — .ai-card-title",
		what: "`ext/AITask/ai.css:187` paints the card title `color: var(--prim)` — TEXT on the orange fill token, not `--prim-ink`. lew42.css names this exact mistake in its own comment: prim-ink is text, prim is fill-only." },
	{ file: "fail-toc-current.jpg", ratio: "2.01:1", where: "/blog/framework/hello-lew42/ — .toc-link.current",
		what: "`ext/toc/toc.css:67` — same shape, `color: var(--prim)` on the active TOC row against --wash. Worst measured pair in the crawl." },
	{ file: "fail-stray-blue-link.jpg", ratio: "8.4:1 (not a contrast defect — a palette defect)", where: "/imagine/design/layout/ — bare <a> in body content",
		what: "framework.css only colors an anchor inside `:where(p, li, td, th, dd, blockquote, .md)`. A plain <a> in a card or list that isn't wrapped and has no component class gets ZERO color rule and falls to the browser's UA default — classic blue, x85 instances across the 15-page sample (x85 again in dark, as the UA's dark-mode link blue). It reads fine; it just isn't lew42 orange, and it's the single largest non-token color found." },
	{ file: "fail-accent-overload.jpg", ratio: "n/a — consistency, not contrast", where: "/framework/styles/layouts/ — layout-gallery mockup specimens",
		what: "Dozens of `button.prim` CTAs stacked in one view (fake client sites used as layout specimens). Individually each is the documented 2.25:1 tradeoff (bold caps + shadow); en masse nothing is a highlight because everything is." },
];

const OKS = [
	{ file: "ok-dark-mode.jpg", where: "/blog/framework/hello-lew42/, dark", what: "--ink on --wash reads clean (12.6:1-class grey-on-near-black); --prim stays the only warm note — headings, active TOC line, breadcrumb." },
	{ file: "ok-padding-clean.jpg", where: "/imagine/design/padding/, light", what: "One page, one job: cards on --wash, ink text, a single underlined link. Nothing competes with the accent because nothing else is trying to be one." },
	{ file: "ok-theme-source-dark.jpg", where: "/framework/styles/layers/theme/lew42/", what: "The theme's own doc page, dark island nested in a dark shell — the one place the palette documents itself, live." },
];

export default new Page({
	meta: import.meta,
	title: "Color",
	description: "Every color token lew42 defines, what each paints, measured usage against it, and where contrast fails.",
	icon: "palette",
	width: "full",

	content(){
		md("**29 color-bearing custom properties**, all declared in `styles/layers/theme/lew42/lew42.css` (a handful default from `framework.css`'s `:root`, every one of those overridden by `.theme-lew42`). Every swatch below is a real `background: var(--x)`, rendered twice — a light-forced island and a dark-forced island — so the pair on the card is what the token actually resolves to in each mode, not a screenshot of it.");

		h2("The palette");
		GROUPS.forEach(g => {
			h4(g.title);
			div.c("color-pairbox").append(() => g.tokens.forEach(t => swatch(t)));
		});

		h2("Measured reality");
		md("Walked computed `color` / `background-color` / `border-color` on every visible element across 15 representative pages, light and dark: **42 unique CSS color values in light mode, 36 in dark.** Against 29 tokens (many aliasing the same hex — the three `--syn-*` tokens that equal `--prim`, `--sidebar-ink` = `--ink`), that's roughly 34/42 (light) and 31/36 (dark) traceable straight to a token or to `.muted`'s `color-mix()` (which shows up as ten distinct `color(srgb …)` opacity steps — expected, not stray).");
		md("**8 light-mode / 5 dark-mode values are hardcoded strays** — but only one is a real, repeated defect: a bare `<a>` that isn't wrapped in `:where(p, li, td, th, dd, blockquote, .md)` and carries no component class gets **no color rule at all** and falls through to the browser's default link blue — `rgb(0, 0, 238)` in light, `rgb(158, 158, 255)` in dark's UA stylesheet — **85 instances each**, the single largest non-token color in the crawl (`/imagine/design/layout/`, `/imagine/design/padding/`, `/framework/styles/layouts/`). The rest of the strays (greys like `rgb(51,51,51)`, `rgb(74,74,74)`) are confined to two known non-representative pages — the theme's own doc page rendering a dark swatch inline, and the layout gallery's fake \"client\" mockups, which use arbitrary brand colors on purpose as layout specimens.");

		h2("Contrast findings");
		md("210 raw element/mode pairs read below the WCAG small-text floor (4.5:1) or the large-text floor (3:1); deduplicated by (foreground, background, ratio) and excluding icon glyphs (a ligature font's \"text\" isn't prose), **7 unique real failures** remain.");
		div.c("color-pairbox").style({ gridTemplateColumns: "repeat(auto-fill, minmax(min(22em, 100%), 1fr))" }).append(() => FAILS.map(f => figure.c("flex v gap color-fail").style({ margin: 0, gap: "0.4em" }).append(() => {
			shot(f.file, f.where);
			figcaption(() => {
				span(f.ratio).style({ fontWeight: "700" });
				span.c("muted", " — " + f.where);
			});
			p.c("muted", f.what).style({ fontSize: "0.88em" });
		})));
		md("Two near-misses just under AA, from `--subtle` on a slightly-lighter-than-`--wash` fill: `a.tab` at 4.23:1, `button.demo-btn` at 4.26:1 — both a rounding error, not `--subtle` itself (5.41:1 on white, 4.83:1 on `--wash`, both over AA). `button.prim` (white on `--prim`, 2.25:1) is excluded from the \"real failure\" count above — framework.css already documents the tradeoff and mitigates with bold caps + a text shadow; it repeats through `FAILS` above only as the *accent-overload* example, not a fresh contrast finding.");

		h3("Where color works");
		div.c("color-pairbox").style({ gridTemplateColumns: "repeat(auto-fill, minmax(min(22em, 100%), 1fr))" }).append(() => OKS.map(o => figure.c("flex v gap color-ok").style({ margin: 0, gap: "0.4em" }).append(() => {
			shot(o.file, o.where);
			figcaption(() => span.c("muted", o.where));
			p.c("muted", o.what).style({ fontSize: "0.88em" });
		})));

		h2("Themable as-is?");
		md("**Yes, with one seam** — `.theme-lew42` on the app root is the whole contract; a second theme is a second class with the same ~29 properties (the guide/paper+terminal pair proves the seam already works). What the theme browser needs to know going in: three tokens are **aliases, not decisions** (`--syn-keyword`/`--syn-builtin`/`--syn-error` all just read `--prim`, `--sidebar-ink` reads `--ink`) — a new theme can skip them; two tokens are **shape, not color** (`--card-shadow`/`--card-ring` swap MECHANISM by mode, shadow in light vs. ring in dark, so a theme author has to pick both, not one); and `--code-bg`/`--code-ink`/`--syn-*` are **deliberately flat** — a theme that makes them `light-dark()` will get a dark code box on a light one and vice-versa, which is the one trap this study found other themes are likely to walk into.");
	},
});
