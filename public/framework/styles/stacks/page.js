import { Page, View, div, span, b, p, table, thead, tbody, tr, th, td, code, button, figure, figcaption, md } from "/app.js";
import { parse, over, lightness, hex, floorOf, visibility, BAR } from "./stacks.js";

View.stylesheet(import.meta, "stacks.css");

/* THE STACK MATRIX — every fill on every floor, both modes, annotated with the
 * contrast the browser actually produced.
 *
 * Why this page exists: `framework.css` paints `.btn, button { background: var(--surface) }`
 * and `.surface { background: var(--surface) }`. Same token. So every default button on a
 * card is a ZERO-delta fill and only the hairline says a button is there. `code` on `.wash`
 * and a `--tint` badge in a `.tint` panel are the same sentence with different nouns.
 *
 * Three modules found this alone and each patched it locally — blog.css gave up on filled
 * chips entirely, imagine.css hovers with `color-mix(… var(--ink) 6%, transparent)`,
 * framework.css bolted an inset ring onto inline `code`. The ladder here is the general
 * form of the fix all three wrote by hand.
 */

/* The six floors anything ever sits on. `dark` marks the two that are dark in BOTH
 * modes plus the accent — the case the col-styles lab logged as having no primitive. */
const FLOORS = [
	{ key: "wash",    cls: "stacks-f-wash",    label: "--wash" },
	{ key: "tint",    cls: "stacks-f-tint",    label: "--tint" },
	{ key: "surface", cls: "stacks-f-surface", label: "--surface" },
	{ key: "bg",      cls: "stacks-f-bg",      label: "--bg" },
	{ key: "code",    cls: "stacks-f-code",    label: "--code-bg" },
	{ key: "prim",    cls: "stacks-f-prim",    label: "--prim" },
];

/* The six things that get stacked ON a floor. `now` renders the REAL element wearing the
 * REAL site class, so the left half of every cell is what the site ships. `alpha` is the
 * same element with `.stacks-a` — which changes background, border and colour and nothing
 * else, so the halves differ by exactly the thing under test. */
const FILLS = [
	{ label: "code",         now: () => code("x = 1"),                 alpha: () => code("x = 1").ac("stacks-a") },
	{ label: "badge",        now: () => span.c("stacks-pill", "new"),  alpha: () => span.c("stacks-pill stacks-a", "new") },
	{ label: "button",       now: () => button("Open"),                alpha: () => button("Open").ac("stacks-a") },
	{ label: "button .bg",   now: () => button.c("bg", "Save"),        alpha: () => button("Save").ac("stacks-a stacks-solid") },
	{ label: "button .prim", now: () => button.c("prim", "Go"),        alpha: () => button.c("prim", "Go") },
	{ label: "card",         now: () => div.c("stacks-card", "Card"),  alpha: () => div.c("stacks-card stacks-a", "Card") },
];

/* The three pairs the matrix scores under the bar today AND over it under alpha, repeated
 * at real size — a 0.7em chip in a 7em cell is evidence, not an experience. Read off the
 * matrix rather than asserted: 0.0 → 14.3, 0.0 → 23.7, 2.4 → 14.0. */
const HERO = [
	["stacks-f-surface", FILLS[2], "**`button` on a `.surface` card.** One token, painted twice — and lew42 sets `border: none` on every button, so no hairline is left to rescue it."],
	["stacks-f-bg",      FILLS[3], "**`button.bg` on a `--bg` band.** A dark CTA on the dark thing it matches. Zero in both modes."],
	["stacks-f-tint",    FILLS[2], "**`button` on a `.tint` panel.** `--surface` on `--tint` is one step of the ladder, and one step is 2.4."],
];

/* Every chip built anywhere on the page registers here, and one pass fills every
 * annotation from the live DOM. Nothing on this page states a colour it did not measure. */
const measured = [];

/* ⚠ Every builder below ends in a statement, never an expression. `append_fn` appends a
 * callback's RETURN VALUE, so `() => chip(…)` would append the chip a second time and MOVE
 * it past the annotation that describes it — silently, and only for the chips built that way. */

/** Build one chip and register the annotation that will describe it. */
function chip(build){
	const $chip = build();
	const $edge = span.c("stacks-edge");
	measured.push({ $chip, $edge });
}

/** One cell: the shipping chip over its alpha twin, each with its measured edge. */
function cell(fill){
	div.c("stacks-cell", () => {
		div.c("stacks-pair", () => { chip(fill.now); });
		div.c("stacks-pair", () => { chip(fill.alpha); });
	});
}

function matrix(dark){
	div.c("stacks-mode" + (dark ? " stacks-dark" : ""), () => {
		div.c("h4", dark ? "dark" : "light");
		table.c("stacks-matrix", () => {
			thead(() => { tr(() => {
				th("");
				FLOORS.forEach(f => { th(f.label); });
			}); });
			tbody(() => { FILLS.forEach(fill => { tr(() => {
				th(fill.label);
				FLOORS.forEach(f => { td.c(f.cls, () => { cell(fill); }); });
			}); }); });
		});
	});
}

/** The ladder, rendered as itself: the swatch IS the token, and the hex beside it is
 *  what that token composited to on this floor — read back, never typed. */
function ladder(names){
	div.c("stacks-ladder", () => { names.forEach(n => {
		div.c("stacks-rung", () => {
			const $sw = b().style("--rung", "var(" + n + ")");
			span(n.replace("--", ""));
			measured.push({ $chip: $sw, $edge: span.c("stacks-edge"), swatch: true });
		});
	}); });
}

/** Fill every annotation from what the browser composited. Idempotent; runs twice
 *  because rAF does not fire in a hidden tab and this page is screenshotted. */
function paint(){
	measured.forEach(m => {
		const floor = floorOf(m.$chip.el);
		const v = visibility(m.$chip.el, floor);
		if (m.swatch){
			m.$edge.text(hex(over(parse(getComputedStyle(m.$chip.el).backgroundColor), floor)));
			return;
		}
		m.$edge.text("dL " + v.edge.toFixed(1) + " / " + v.text.toFixed(1) + ":1");
		m.$edge.el.classList.toggle("stacks-bad", v.edge < BAR);
	});
	window.STACKS = measured.map(m => {
		const floor = floorOf(m.$chip.el);
		return { what: m.$chip.el.className || m.$chip.el.tagName, ...visibility(m.$chip.el, floor) };
	});
}

export default new Page({
	meta: import.meta,
	title: "Stacking",
	description: "Every fill on every floor, measured — and the alpha ladder that makes one word work on all of them.",
	icon: "layers",

	content(){

		md("**Shipped.** The ladder below lives in `framework.css` `:root` and the site is on it — [the flip](/framework/ai/2026-08-30/alpha-flip/), 2026-08-30. This page is now the regression test: the left chip in every cell is still whatever the site actually renders, so if a fill goes back to guessing, a number here turns red.");

		md("What it was. Two rules in `framework.css` named the same token:\n\n```css\n.btn, button { background: var(--surface); }\n.surface     { background: var(--surface); }\n```\n\nSo **a default button on a card was a zero-delta fill** — and lew42's `border: none` had already taken away the hairline that was the only other thing saying a button was there. `code` on a `.wash` block and a `--tint` badge in a `.tint` panel were the same sentence with different nouns, and three modules had patched it one at a time: [`blog.css`](/blog/) gave up on filled chips and went outlined, [`imagine.css`](/imagine/) hovers with `color-mix(in srgb, var(--ink) 6%, transparent)`, and `framework.css` bolted an inset ring onto inline `code`.");

		md("## The rule");

		md("> **Floors are opaque. Fills are alpha.**\n\nA *floor* is painted on the canvas and has nothing under it to compose with — `--wash`, `--tint`, `--surface`. Make one translucent and dark mode goes pale over the browser's white, which is why [`lew42.css`](/framework/styles/layers/theme/) marks all three `⚠ OPAQUE`.\n\nA *fill* is always painted **on** a floor — a button, a badge, a hover, a code chip, a card lift. An opaque fill has to guess which floor it will land on, and it guesses wrong somewhere. A **transparent** fill does not guess: it is *n* steps away from whatever is underneath, on every floor, in both modes.");

		md("## The ladder");

		md("Two primitives — transparent black, transparent white — and one word built from them. Rungs **double**: `04 · 08 · 16 · 32`. A ratio ladder, so adjacent rungs are the same relative step wherever they sit, and a call site asks *how many steps up*, never *which grey*.");

		div.c("wide flex gap wrap", () => {
			div.c("stacks-mode flex-1", () => { div.c("h4", "light"); ladder(["--shade-a04", "--shade-a08", "--shade-a16", "--shade-a32", "--fill-a04", "--fill-a08", "--fill-a16", "--fill-a32"]); });
			div.c("stacks-mode stacks-dark flex-1", () => { div.c("h4", "dark"); ladder(["--paper-a04", "--paper-a08", "--paper-a16", "--paper-a32", "--fill-a04", "--fill-a08", "--fill-a16", "--fill-a32"]); });
		}).ac("stacks-lab");

		md("```css\n--shade-a08: rgba(0, 0, 0, 0.08);\n--paper-a08: rgba(255, 255, 255, 0.08);\n--fill-a08:  light-dark(var(--shade-a08), var(--paper-a08));\n```\n\n`--fill-aNN` is **the one word a call site types**, and the reason it works everywhere is that `light-dark()` reads `color-scheme` at the element it is *used* on, not where it was declared. So an island that is dark in both modes — a code block, a dark CTA, the sidebar — declares `color-scheme: dark` and every rung inside it flips, along with `--ink` and `--line`. That one line is the always-dark primitive the [col-styles lab](/framework/ai/2026-08-30/col-styles/) recorded as missing.");

		md("Literal `rgba()`, so **no interpolation space is involved at all** — source-over compositing in sRGB is arithmetic, not a mix. Where a rung must be derived *from* a theme colour, use `in srgb`: mixing toward `transparent` in `oklab` travels through premultiplied oklab and the hue drifts on the way.");

		md("## The matrix");

		md("Six fills on six floors, both modes. The left chip in each cell is **what the site ships today** — a real `button`, a real `code`, wearing their real classes. The right chip is the same element with `.stacks-a`, which changes background, border and colour and *nothing else*.\n\nUnder each chip, two numbers read off the live DOM after compositing: **ΔL\\*** against the floor beneath it (the bar is **3** — below that you do not notice the edge) and the **WCAG ratio** of its own label (the bar is 4.5). Red is a fail. Nothing here is typed; every number is what the browser produced.");

		div.c("wide stacks-lab flex gap wrap", () => { matrix(false); matrix(true); });

		md("**Nine cells are under the bar, in both modes, and none of them is a shipping component.** Before the flip it was 14 in light and 13 in dark. What is left is the two placement demos below and the one compression case, which is the page arguing its own last section.\n\nThe last three columns are *identical* between the two halves, and that is the mechanism working: `--bg`, `--code-bg` and `--prim` declare `color-scheme: dark`, so they render the same whichever mode the reader is in.");

		md("Cells the ladder does **not** fix, and all three are findings rather than bugs:\n\n- `button.prim` on a `--prim` band, and `button.bg` on a `--bg` one, stay 0.0. **An accent is a hue, not a rung** — each can only be invisible on one floor, its own, so this is a *placement* error and the fix is to move the button, not to retune the token. Both kept their opaque fills in the flip on exactly that reasoning.\n- A card at `--fill-a04` on `--prim` measures 2.1. **Alpha compresses on a saturated floor**: the red channel of `#FF8F60` is already at 255, so a white rung can only move green and blue. On an accent, start one rung higher.");

		md("The matrix is a `<table>`, so `framework.css` already gives it `overflow-x: auto` — a full grid at 1920 and a deliberate side-scroll at 400. A 36-cell matrix is wide; that is the one scrollbar on this page and it was asked for.");

		md("## The three worst, at size");

		div.c("wide stacks-lab stacks-hero", () => { HERO.forEach(([floor, fill, why]) => {
			figure(() => {
				div.c("stacks-shot " + floor, () => {
					div(() => { chip(fill.now); });
					div(() => { chip(fill.alpha); });
				});
				figcaption(() => { md(why + " Left: today. Right: the same element on `--fill-a08`."); });
			});
		}); });

		md("## The hunt");

		md("A headless pass over the site reads every button, chip and badge, composites its fill against the floor actually beneath it, and flags the pairs under ΔL\\* 3. The scan and its threshold calibration are in [the task dir](/framework/ai/2026-08-30/color-stacks/); the raw output is [`hunt.json`](hunt.json).\n\n**76 pages, 3,623 fills: 101 pairs / 504 elements before the flip, 19 / 50 after.** The table below is what is left, and every row is one of four things — a text label the scan's class-name test caught (`.layout-tag` has no fill and never wanted one), an icon button that is transparent on purpose and carries its glyph as the affordance, one of the two placement demos above, or a mocked control on the [UI gallery](/framework/ui/). None of them is a control you cannot see.");

		/* ⚠ The box is claimed synchronously and the promise handed to `append()`, which
		   awaits it and appends what it resolves to — a FUNCTION, so the captor is set and
		   the table builds inside this box. Rendering from a `.then()` instead would try to
		   name a DOM position the page has already moved past. */
		div.c("wide stacks-lab",
			fetch(new URL("hunt.json", import.meta.url))
				.then(r => r.json())
				.then(d => () => { hunt(d); })
				.catch(() => "hunt.json not built yet — run hunt.mjs from the task dir."));

		md("## Adopting it");

		md("The rules, the migration cost and the fix list: **[stacking.md](/framework/styles/doc/stacking.md)**. No token was flipped in this task — this page is the evidence, and the flip is its own wave.");

		md.details(import.meta, "readme.md", "Readme");

		requestAnimationFrame(paint);
		setTimeout(paint, 200);
	}
});

function swatch(colour){
	span.c("stacks-swatch").style("background", colour);
	span(" " + colour);
}

function hunt(d){
	p(d.flagged + " distinct invisible pairs — " + d.instances + " elements — from " + d.elements + " fills read across " + d.pages + " pages. Ordered by how many elements one fix reaches:");
	table.c("stacks-hunt", () => {
		thead(() => { tr(() => { th("n"); th("element"); th("page"); th("fill"); th("floor"); th("dL*"); }); });
		tbody(() => { d.worst.slice(0, 10).forEach(r => { tr(() => {
			td(String(r.n));
			td(() => { code(r.sel); });
			td(r.page);
			td(() => { swatch(r.fill); });
			td(() => { swatch(r.floor); });
			td(r.edge.toFixed(2));
		}); }); });
	});
}
