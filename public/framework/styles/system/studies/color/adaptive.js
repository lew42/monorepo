/* The adaptive backgrounds lab — bg-lighten / bg-darken, one class each, the amount
 * picked by the ground, not the caller (owner, 2026-10-03: "a lighten class whose
 * amount varies with the container it's on"). Same measuring method as study.js:
 * paint the real classes, read the real pixels back, never type a number.
 *
 * Five grounds. White, light gray and dark gray already have a framework ground
 * class (`.surface`'s `--surface`, `.wash`'s `--wash`, `.bg`'s `--bg`). Primary and
 * black don't — `.prim` paints a BUTTON, not a panel — so this lab declares the two
 * `--bg-*-amt` variables itself on those two, exactly the way framework.css's own
 * `.darken-1/2/3` and `.bg` do. That is the extension point the mechanism is built
 * for: a module that introduces its own ground sets the two variables once, in one
 * place, and `.bg-lighten`/`.bg-darken` everywhere inside it just work.
 */
import { div, span, figure, figcaption } from "/app.js";
import { parse, over, ratio, hex } from "/framework/styles/stacks/stacks.js";

const live = (el, fn) => new ResizeObserver(fn).observe(el);
const verdict = r => r >= 4.5 ? "text ok" : r >= 3 ? "UI only" : "no";

export const GROUNDS = [
	["White",      { background: "var(--surface)" }],
	["Light gray", { background: "var(--wash)" }],
	["Primary",    { background: "var(--prim)", "--bg-lighten-amt": "var(--lighten-2)", "--bg-darken-amt": "var(--darken-1)" }],
	["Dark gray",  { background: "var(--bg)" }],
	["Black",      { background: "#000000", "--bg-lighten-amt": "var(--lighten-2)", "--bg-darken-amt": "var(--darken-1)" }],
];

/** One child cell: a class name to paint ("bg-lighten", "bg-darken", or nested
 *  markup for the two stacking tests), a short label, and the ink to measure. */
export class AdaptiveStudy {
	constructor(){ this.cells = []; }

	cell(label, build){
		const c = { label };
		figure.c("color-ground adaptive-cell").append(() => {
			c.$box = div.c("adaptive-box").append(build);
			c.$ink = c.$box; // the label itself, painted in --ink, is the text under test
			c.$num = figcaption.c("color-adaptive-num", "");
		});
		this.cells.push(c);
		return c;
	}

	/** One ground tile: the ground itself as a `.bg-lighten`, a `.bg-darken`, and the
	 *  two nesting orders, each showing a line of real `--ink` text and a small
	 *  `--prim` accent chip so both the text token and the accent get measured. */
	ground([name, style]){
		figure.c("adaptive-ground").style(style).append(() => {
			figcaption(name);
			div.c("adaptive-ground-cells").append(() => {
				this.cell("bg-lighten", () => this.sample("bg-lighten"));
				this.cell("bg-darken", () => this.sample("bg-darken"));
				this.cell("darken → lighten", () =>
					div.c("bg-darken adaptive-nest").append(() => div.c("bg-lighten").append(() => this.sample(null, true))));
				this.cell("lighten → darken", () =>
					div.c("bg-lighten adaptive-nest").append(() => div.c("bg-darken").append(() => this.sample(null, true))));
			});
		});
	}

	/** The thing every cell actually measures: a line of body text, plus a small
	 *  accent swatch so `--prim` on the same fill gets a number too. */
	sample(cls, nested){
		div.c([cls, "adaptive-sample"].filter(Boolean).join(" ")).append(() => {
			span.c("adaptive-text", nested ? "Ink text, nested" : "Ink text");
			span.c("adaptive-accent", "Accent");
		});
	}

	wall(){ return div.c("grid auto gap adaptive-wall", () => GROUNDS.forEach(g => this.ground(g))); }

	/** Read every cell's INNERMOST painted box back off the rendered pixels — the
	 *  box the class actually sits on, composited over whatever is really under it
	 *  (the ground, or for a nested cell, the ground UNDER the outer step too). */
	measure(){
		this.cells.forEach(c => {
			const paint = c.$box.el.querySelector(".adaptive-sample, .adaptive-nest .adaptive-sample") || c.$box.el;
			const text = paint.querySelector(".adaptive-text");
			const accent = paint.querySelector(".adaptive-accent");
			if (!text) return;
			const under = this.floor(paint);
			const fg = parse(getComputedStyle(text).color);
			const ar = parse(getComputedStyle(accent).backgroundColor) || [0, 0, 0, 0];
			const r_text = fg[3] ? ratio(fg, under) : 0;
			const r_accent = ar[3] ? ratio(over(ar, under), under) : 0;
			c.ratio = r_text;
			c.$num.text(hex(under) + "  text " + r_text.toFixed(1) + ":1 (" + verdict(r_text) + ")"
				+ "  ·  accent fill Δ " + r_accent.toFixed(1) + ":1");
			c.$num.el.classList.toggle("color-fail", r_text < 4.5);
		});
	}

	/** Composite every painted ancestor from the document root down to (and
	 *  including) `el` itself — the lab nests real classes inside real classes, so
	 *  the ground an inner box sits on is whatever its own ancestors actually
	 *  painted, not a single parent lookup. */
	floor(el){
		const chain = [];
		for (let n = el; n; n = n.parentElement) chain.unshift(n);
		let out = [255, 255, 255, 1];
		chain.forEach(n => {
			const bg = parse(getComputedStyle(n).backgroundColor);
			if (bg[3] > 0) out = bg[3] === 1 ? bg : over(bg, out);
		});
		return out;
	}

	watch($root){
		live($root.el, () => this.measure());
		requestAnimationFrame(() => this.measure());
	}
}
