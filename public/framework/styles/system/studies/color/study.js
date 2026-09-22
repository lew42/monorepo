/* The lighten/darken study — every number on this page is READ BACK off the rendered
 * pixels, never typed. A cell is painted with the real token; `getComputedStyle` says what
 * the browser resolved; `stacks.js` composites the translucent step over the opaque ground
 * beneath it; WCAG 2's ratio says whether the text on it reads.
 *
 * ⚠ A page is built DETACHED on this site, so `getComputedStyle` has nothing to answer with
 *   until the box is in the document. The trigger that works is a `ResizeObserver`
 *   (core/Page/doc/columns.md says so) — it fires on first layout and again on every resize.
 *   Every fill below is idempotent, so firing twice costs nothing.
 */

import { div, span, label, input, figure, figcaption } from "/app.js";
import { parse, over, ratio, hex } from "/framework/styles/stacks/stacks.js";

const live = (el, fn) => new ResizeObserver(fn).observe(el);

/** Five grounds, light to dark. Literal colours on purpose: the question is what a step does
 *  to ANY ground you might paint, not to one the theme happens to own. */
export const GROUNDS = [
	["White",      "#ffffff"],
	["Light gray", "#e2e2e2"],
	["Mid gray",   "#9a9a9a"],
	["Dark gray",  "#3f3f3f"],
	["Black",      "#000000"],
];

/** The six steps, lightest first, with the ground itself in the middle so you can watch each
 *  direction leave from it. An empty paint means "nothing — this IS the ground". */
export const STEPS = [
	["lighten 3", "var(--lighten-3)"],
	["lighten 2", "var(--lighten-2)"],
	["lighten 1", "var(--lighten-1)"],
	["the ground", ""],
	["darken 1",  "var(--darken-1)"],
	["darken 2",  "var(--darken-2)"],
	["darken 3",  "var(--darken-3)"],
];

/** The accent ladder: the slider's saturation, then three quarters of it, and so on down to
 *  plain grey. One hue, one lightness, five saturations — the only thing that changes from
 *  one rung to the next is how vivid the colour is. */
export const RUNGS = [1, 0.75, 0.5, 0.25, 0];

/** The site's own accent, #FF8F60, said in HSL — the sliders start where the site already is. */
export const ACCENT = { h: 18, s: 100, l: 69 };

/** 4.5 is the bar for body text, 3 for large text and UI shapes, below that nothing reads. */
const verdict = r => r >= 4.5 ? "text ok" : r >= 3 ? "UI only" : "no";

/** hsl → [r, g, b], 0–255. The lab PAINTS in hsl and reads the pixels back, which is
 *  right for what is on screen — but a claim about a saturation the slider is not at
 *  ("drained to 0% it would carry text on …") has nothing on screen to read, so it is
 *  computed here instead. Used only for the hypothetical halves of the sentence; the
 *  half about what you are looking at still comes off the rendered pixels. */
const rgb = (h, s, l) => {
	s /= 100; l /= 100;
	const a = s * Math.min(l, 1 - l);
	const f = n => { const k = (n + h / 30) % 12;
		return (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255; };
	return [f(0), f(8), f(4)];
};

const WHITE = [255, 255, 255, 1], BLACK = [0, 0, 0, 1];

/** Everything under (and including) an element, composited down to one opaque colour — a
 *  translucent step's real colour is the ground plus itself, and the ground may be two boxes
 *  away. */
const floor_under = el => {
	const stack = [];
	while (el){
		const bg = parse(getComputedStyle(el).backgroundColor);
		if (bg[3] > 0){ stack.push(bg); if (bg[3] === 1) break; }
		el = el.parentElement;
	}
	let out = stack.pop() || WHITE;
	while (stack.length) out = over(stack.pop(), out);
	return out;
};

export class ColorStudy {
	constructor(...args){ this.assign(...args); }
	assign(...args){
		Object.assign(this, ...args);
		this.accent ??= { ...ACCENT };
		this.cells ??= [];
		this.rungs ??= [];
		return this;
	}

	/* ---- building -------------------------------------------------------- */

	/** One text-on-a-fill reading. The label is painted in the ink under test, so you SEE it
	 *  pass or fail; the number beside it is forced legible so you can always read it. */
	row(text, paint, ink){
		const cell = { ratio: 0 };
		div.c("color-bar").style(paint ? { background: paint } : {}).append($bar => {
			cell.$bar = $bar;
			cell.$name = span.c("color-bar-name", text);
			if (ink) cell.$name.style({ color: ink });
			cell.$num = span.c("color-bar-num", "");
		});
		this.cells.push(cell);
		return cell;
	}

	/** One ground with the six steps painted on it — the wall's tile. */
	ground([name, paint]){
		figure.c("color-ground").append(() => {
			div.c("color-ramp").style({ background: paint }).append(() => {
				STEPS.forEach(step => { this.row(step[0], step[1]); });
			});
			figcaption(name + " — " + paint);
		});
	}

	/** The wall of grounds. `.grid.auto` is the site's word for a wall: one tile at 400, as
	 *  many as fit at 3440. */
	wall(){
		return div.c("grid auto gap color-wall", () => { GROUNDS.forEach(g => this.ground(g)); });
	}

	/** One saturation of the accent: the colour as a GROUND (white text on it, ink text on
	 *  it), then the same colour as TEXT on each of the five grounds. */
	rung(i){
		const accent = "var(--color-accent-" + i + ")";
		const r = { grounds: [] };
		this.rungs[i] = r;
		figure.c("color-accent").append(() => {
			div.c("color-accent-swatch").style({ background: accent }).append(() => {
				r.white = this.row("White text on it", "", "#ffffff");
				r.ink = this.row("Ink text on it", "", "var(--ink)");
			});
			div.c("color-accent-rows").append(() => {
				GROUNDS.forEach(([name, paint]) => {
					const cell = this.row(name, paint, accent);
					cell.ground = name;
					r.grounds.push(cell);
				});
			});
			r.$cap = figcaption.c("color-accent-cap", "");
		});
	}

	/** The accent lab: two sliders, the sentence they write, and the five rungs they
	 *  drive. ⚠ The sentence sits DIRECTLY under the sliders and nowhere else. It used
	 *  to open the page, 923px above them at 1280 and 2,073px at 400 — so dragging a
	 *  slider rewrote a sentence the reader could not see, and at 400 the rewrap shifted
	 *  every box below it by 42px (measured 2026-09-17). A control's consequence belongs
	 *  next to the control. */
	lab(){
		return div.c("color-lab", $lab => {
			this.$lab = $lab;
			div.c("color-sliders").append(() => {
				this.slider("Hue", "h", 0, 360, "°");
				this.slider("Saturation", "s", 0, 100, "%");
			});
			this.$takeaway = div.c("color-takeaway", "Reading the colours…");
			div.c("grid auto gap color-accent-wall").append(() => {
				RUNGS.forEach((_, i) => this.rung(i));
			});
		});
	}

	slider(text, key, min, max, unit){
		label.c("color-slider").append(() => {
			span.c("color-slider-name", text);
			const $in = input().attr("type", "range").attr("min", min).attr("max", max)
				.attr("step", 1).attr("value", this.accent[key])
				.on("input", () => { this.accent[key] = +$in.el.value; this.paint(); });
			this["$" + key] = span.c("color-slider-value", this.accent[key] + unit);
		});
	}

	/* ---- painting and reading -------------------------------------------- */

	hsl(k){ return `hsl(${this.accent.h} ${Math.round(this.accent.s * k)}% ${ACCENT.l}%)`; }

	/** Write the five accent colours onto the lab as custom properties, so every cell that
	 *  says `var(--color-accent-2)` repaints at once — CSS distributes them, not JS. */
	paint(){
		if (!this.$lab) return;
		RUNGS.forEach((k, i) => this.$lab.el.style.setProperty("--color-accent-" + i, this.hsl(k)));
		// The accent everywhere else in the lab too: `--prim` is the one word this site's
		// marks, fills, outlines and links already say.
		this.$lab.el.style.setProperty("--prim", this.hsl(1));
		this.$lab.el.style.setProperty("--prim-ink", this.hsl(1));
		this.$h?.text(this.accent.h + "°");
		this.$s?.text(this.accent.s + "%");
		this.measure();
	}

	/** Read every cell back off the rendered pixels. */
	measure(){
		this.cells.forEach(cell => {
			const fg = parse(getComputedStyle(cell.$name.el).color);
			if (!fg[3]) return;                            // not laid out yet
			const ground = floor_under(cell.$bar.el);
			cell.ground_rgb = ground;
			cell.ratio = ratio(fg, ground);
			cell.$num.text(hex(ground) + "  " + cell.ratio.toFixed(1) + ":1  " + verdict(cell.ratio));
			cell.$num.style({ color: ratio(WHITE, ground) >= ratio(BLACK, ground) ? "#fff" : "#000" });
		});
		this.rungs.forEach((r, i) => {
			if (!r.$cap) return;
			r.$cap.text(Math.round(this.accent.s * RUNGS[i]) + "% saturation"
				+ (r.white.ground_rgb ? " — " + hex(r.white.ground_rgb) : ""));
		});
		this.$takeaway?.text(this.takeaway());
	}

	/* ---- the sentence ------------------------------------------------------
	   ⚠ The claim "saturation decides nothing at this hue" is about the HUE, so it is
	     computed at 100% and at 0% whatever the slider says. Reading it off the rendered
	     rungs instead made it a tautology: the rungs are the slider's saturation × 1,
	     0.75 … 0, so with the slider at 0 every rung is 0% and they always agreed. The
	     page then told a reader sitting at hue 240 — a blue — to "drag the hue slider
	     round to a blue or a violet" (measured 2026-09-17). */

	/** Which of the five grounds this hue carries BODY TEXT on at a saturation you name.
	 *  Computed, so it can answer for a saturation nobody is looking at. */
	carries(s, h = this.accent.h){
		const fg = rgb(h, s, ACCENT.l);
		return (this.rungs[0]?.grounds ?? [])
			.filter(c => c.ground_rgb && ratio(fg, c.ground_rgb) >= 4.5)
			.map(c => c.ground.toLowerCase());
	}

	/** Does saturation change the answer at this hue? Full against drained. */
	decides(h){ return this.carries(100, h).join() !== this.carries(0, h).join(); }

	/** The nearest hue where it DOES decide, so the page can point somewhere the reader
	 *  is not already standing. Null when no hue on the wheel behaves differently. */
	nearest_deciding(){
		for (let d = 30; d <= 180; d += 30)
			for (const h of [this.accent.h + d, this.accent.h - d])
				if (this.decides(((h % 360) + 360) % 360)) return ((h % 360) + 360) % 360;
		return null;
	}

	/** The lab's one conclusion, in a sentence, rewritten every time a slider moves. */
	takeaway(){
		const say = names => names.length ? names.join(", ") : "no ground at all";
		const top = this.rungs[0];
		if (!top?.white?.ground_rgb) return "Reading the colours…";

		// The half about what is ON SCREEN comes off the rendered pixels, so the
		// sentence can never disagree with the tiles under it.
		const now = top.grounds.filter(c => c.ratio >= 4.5).map(c => c.ground.toLowerCase());
		const on_it = [["white", top.white], ["ink", top.ink]].filter(p => p[1].ratio >= 4.5).map(p => p[0]);
		const here = `At hue ${this.accent.h}°, your accent at ${this.accent.s}% saturation carries body text on `
			+ `${say(now)} — and used as a ground it takes `
			+ `${on_it.length ? on_it.join(" and ") + " text" : "neither white nor ink text"}.`;

		if (this.decides(this.accent.h))
			return `${here} At this hue saturation is what decides: the same colour at full saturation carries text on `
				+ `${say(this.carries(100))}, and drained to grey it carries text on ${say(this.carries(0))} instead.`;

		const other = this.nearest_deciding();
		return `${here} At this hue saturation decides nothing — full or drained, it lands on exactly the same grounds.`
			+ (other == null ? "" : ` Drag the hue round to ${other}° and watch that stop being true.`);
	}

	/** Mount: nothing can be read until the browser has laid the wall out. */
	watch($root){
		live($root.el, () => this.paint());
		requestAnimationFrame(() => this.paint());
	}
}
