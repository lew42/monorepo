import { Page, View, md, p, h2, h4, div, span, button } from "/app.js";
import { background, KIND_NAMES } from "./background.js";

View.stylesheet(import.meta, "page.css");

/* One config per kind: the call this page actually makes (shown as its code
   line), and the "busiest pixel" to measure contrast against — see doc/decisions.md
   #5. Kept here, not in background.js, because it's this PAGE's judgement about
   what's worth showing and measuring, not part of the primitive's own contract. */
const KIND_DEMOS = {
	ground:    { options: { tone: "darken-1" }, code: 'background("ground", { tone: "darken-1" })', fg: "var(--darken-1)" },
	gradient:  { options: {}, code: 'background("gradient")', fg: "var(--darken-2)" },
	dots:      { options: {}, code: 'background("dots")', fg: "var(--darken-3)" },
	grid:      { options: {}, code: 'background("grid")', fg: "var(--darken-2)" },
	stripes:   { options: {}, code: 'background("stripes")', fg: "var(--darken-1)" },
	texture:   { options: { icon: "star", rotate: -15 }, code: 'background("texture", { icon: "star", rotate: -15 })', fg: "var(--ink)", alpha: 0.09 },
	scatter:   { options: { icons: ["star", "bolt", "favorite"], count: 20, seed: 7 }, code: 'background("scatter", { icons: [...], count: 20, seed: 7 })', fg: "var(--ink)", alpha: 0.16 },
	blobs:     { options: {}, code: 'background("blobs")', fg: "var(--surface)" },
	wave:      { options: {}, code: 'background("wave")', fg: "var(--darken-2)" },
	spotlight: { options: { follow: true }, code: 'background("spotlight", { follow: true })', fg: "var(--lighten-3)" },
};

const cap = s => s[0].toUpperCase() + s.slice(1);

/* ---- contrast, measured live -------------------------------------------------
   Real computed colours, not guessed hexes — so the number is correct in BOTH
   themes with no second set of constants to keep in sync. doc/decisions.md #5. */

let probe;
function resolve_color(css_expr){
	probe ??= document.body.appendChild(Object.assign(document.createElement("span"), {
		style: "position:absolute;opacity:0;pointer-events:none;left:-9999px;top:-9999px;",
	}));
	probe.style.color = css_expr;
	return getComputedStyle(probe).color;
}

function composite(bg_expr, fg_expr, alpha = 1){
	const c = document.createElement("canvas");
	c.width = c.height = 1;
	const ctx = c.getContext("2d");
	ctx.fillStyle = resolve_color(bg_expr);
	ctx.fillRect(0, 0, 1, 1);
	ctx.globalAlpha = alpha;
	ctx.fillStyle = resolve_color(fg_expr);
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return `rgb(${r}, ${g}, ${b})`;
}

function luminance(rgb_str){
	const [r, g, b] = rgb_str.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast_ratio(a, b){
	const la = luminance(a), lb = luminance(b);
	const [hi, lo] = la > lb ? [la, lb] : [lb, la];
	return (hi + 0.05) / (lo + 0.05);
}

// Ink over the busiest pixel this kind paints, composited over --surface (the
// card's own base — every card sits on it, kinds included).
function measure(kind){
	const { fg, alpha = 1 } = KIND_DEMOS[kind];
	const swatch = composite("var(--surface)", fg, alpha);
	return contrast_ratio(resolve_color("var(--ink)"), swatch);
}

/* ---- the live section: a hero + a three-card row, swapped by the switcher AND
   by clicking any wall card — one mechanism for both, per the brief's "click a
   card to see it large" and "a switcher swaps the WHOLE wall's header live". */

let current = "spotlight";
let $top;

function three_card_row(){
	div.c("grid gap auto", () => {
		["First", "Second", "Third"].forEach(label =>
			div.c("surface pad flex v gap", () => {
				h4(label);
				p("A realistic card, unrelated to the background behind it — the point is that IT still reads fine too.");
			}));
	}).style("--column", "12em").ac("background-wall-three");
}

function paint_top(){
	$top.empty(() => {
		div.c("flex wrap gap background-wall-switcher", () =>
			KIND_NAMES.forEach(name =>
				button.c(name === current ? "prim" : "", cap(name)).click(function(){
					current = name;
					paint_top();
				})));

		div.c("background-wall-hero", () => {
			background(current, KIND_DEMOS[current].options);
			div.c("background-content flex v gap", () => {
				h2(`Currently showing: ${cap(current)}`);
				p("This heading, this sentence and the row below are real content, sitting on top of a live background layer. Pick a kind above, or click any card in the wall below — same section, same mechanism.");
				three_card_row();
			});
		});
	});
}

/* ---- the wall — one card per kind, real content on top, its own code line and
   its own measured contrast number underneath. */

function wall_card(name){
	const { code } = KIND_DEMOS[name];

	return div.c("flex v gap", () => {
		div.c("background-wall-card", $card => {
			background(name, KIND_DEMOS[name].options);

			div.c("background-content flex v gap", () => {
				h4(cap(name));
				p(`Body text, over ${name} — read it, not just see it.`);

				button.c("prim", "Use it").click(function(e){
					e.stopPropagation();
					this.text(this.text() === "Use it" ? "Used!" : "Use it");
				});
			});

			$card.click(() => { current = name; paint_top(); $top.el.scrollIntoView({ behavior: "smooth", block: "start" }); });
		});

		span.c("muted h4", `background("${name}", …)`);
		span.c("muted h4", `${measure(name).toFixed(1)}:1 against body text`);
	});
}

export default new Page({
	meta: import.meta,
	title: "Background",
	description: "A swappable layer behind your content — one div, ten kinds, no images.",
	icon: "wallpaper",

	content(){

		p("A page often wants something happening behind its content — a colour, a pattern, a glow — without it ever pushing the content around or catching a click meant for a button. `background(kind)` is that one div: absolutely positioned, always behind, never in the way.");

		md("```js\ndiv.c(\"hero\", () => {\n    background(\"dots\");\n    h1(\"Real content, on top\");\n});\n```");

		$top = div.c("background-wall-top wide");
		paint_top();

		md("## Ten kinds, no images — click any card");

		p("Every card below is a real box with real content on top: a heading, a sentence, a button you can click. That's the test — if body text doesn't read over the busiest part of a kind, its number below says so.");

		div.c("grid gap auto wide", () => KIND_NAMES.forEach(name => wall_card(name)))
			.style("--column", "15em");

		md("## Wrap your content, or it can hide UNDER the layer");

		p("`.background` is `position: absolute; z-index: 0` — and CSS paints anything positioned like that AFTER a plain, unstyled sibling, even one written later in the HTML. Same gradient, same markup order, both cards below — the only difference is one class.");

		// NOT wide: two short comparison boxes stretched to fill an ultra-wide row
		// is dead space wearing a wide column, not a fix for it (layout skill's own
		// rule) — the normal prose measure already gives two 16em boxes room.
		div.c("grid gap auto", () => {
			div.c("flex v gap", () => {
				h4("No wrapper");
				div.c("background-wall-card", () => {
					background("gradient");
					p("This sentence is really in the DOM. Can you read it?");
				});
				span.c("muted h4", "Plain content, no position of its own — it's behind the layer, not on top of it.");
			});

			div.c("flex v gap", () => {
				h4(".background-content wrapper");
				div.c("background-wall-card", () => {
					background("gradient");
					div.c("background-content", () => {
						p("This sentence is really in the DOM — and you can read it.");
					});
				});
				span.c("muted h4", "One class, position: relative; z-index: 1 — same stack level as the layer, DOM order breaks the tie.");
			});
		}).style("--column", "16em");

		md("A click still lands correctly in BOTH cards above, wrapper or not — `.background` carries `pointer-events: none`, so the browser looks straight through it to whatever's underneath regardless of what's painted on top. Only what a reader can SEE needs the wrapper. The measurement behind both of these: [doc/decisions.md](./doc/decisions.md).");

		md("## The host needs nothing");

		p("Every card above just works — no class added to its box. `:has(> .background)` gives any host that holds a `.background` div `position: relative; isolation: isolate` automatically. `.has-background` is the same rule, spelled as an explicit class, for the one case `:has()` can't see: the layer isn't a literal direct child.");

		md.details(import.meta, "readme.md", "Readme, and doc/decisions.md for the full record");
	},

	preview(nav){
		return this.preview_card(nav, () => div.c("zoom-50 pad", $host => {
			background("scatter", { seed: 3, count: 10 });
			div.c("background-content flex v gap", () => { h4("Background"); });
		}));
	},
});
