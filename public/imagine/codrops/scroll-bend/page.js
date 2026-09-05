import { Page, View, div, span, h2, md } from "/app.js";

/* Ported from Codrops' "On-Scroll Letter Animations" (MIT) — see scroll-bend.css for the
   licence note; the table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "scroll-bend.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, claims the row's leftover
   past its `large` parent). Own layout: three headings, each
   preceded by a tall spacer so scrolling between them is real scrolling, not a one-line
   nudge — this is the whole trigger, so it needs room to happen in. Regions: one.
   Preview: default card (the effect needs motion; a still cannot show it, so the parent's
   table is where this page is described instead). */

const WORDS = ["Hover", "Scroll", "Rebuild"];

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const map = (v, a, b, c, d) => clamp(c + ((v - a) * (d - c)) / (b - a), Math.min(c, d), Math.max(c, d));

function heading(word){
	return h2.c("codrops-bend-heading", () => [...word].forEach(ch => span.c("codrops-bend-char", ch)));
}

function spacer(hint){
	return div.c("codrops-bend-spacer", () => span.c("muted", hint));
}

export default new Page({
	meta: import.meta,
	title: "Scroll-based letter bend",
	description: "Each heading reads its own scroll speed every frame and bows its middle letters away from it.",
	icon: "swipe_vertical",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' on-scroll letter animation, rebuilt.** Scroll this column: each heading below reads how fast it just moved and bends its middle letters away from that motion — the faster you scroll, the more it bows. Stop scrolling and it settles flat. (No mouse or click needed — this one is triggered by scrolling past it.)");

		spacer("scroll ↓");
		WORDS.forEach((word, i) => {
			heading(word);
			if (i < WORDS.length - 1) spacer("keep going ↓");
		});

		md("**What carried over:** the bend formula itself, unchanged — `map()`'s linear interpolation, and the same \"middle characters move more than the edges\" factor that makes a word bow instead of sliding as one flat block. **What didn't:** Locomotive Scroll (a smooth-scroll library the original wraps the whole page in) and Splitting.js (the library that cuts each word into characters) — both dropped. This page reads each heading's OWN `getBoundingClientRect().top` every animation frame instead, which needs no scroll listener and works under this site's own scrolling column, not just a page-level one; the character split is one `[...word].forEach()` here rather than a library. `prefers-reduced-motion` skips the whole loop — the words never move.");
	},

	activate(){
		Page.prototype.activate.call(this);
		if (!matchMedia("(prefers-reduced-motion: reduce)").matches) this.start_bend();
		return this;
	},

	deactivate(){
		this.stop_bend();
		return Page.prototype.deactivate.call(this);
	},

	// Read-only every frame: no scroll listener, no smooth-scroll wrapper — a heading's
	// own rect moves whenever ANY ancestor scrolls, columns host included.
	start_bend(){
		const headings = [...this.view.el.querySelectorAll(".codrops-bend-heading")].map(el => ({
			el,
			chars: [...el.querySelectorAll(".codrops-bend-char")],
			prev: el.getBoundingClientRect().top,
		}));

		const loop = () => {
			headings.forEach(h => {
				const top = h.el.getBoundingClientRect().top;
				const dy = top - h.prev;
				h.prev = top;

				const translateY = map(dy, 150, -150, -50, 50);
				const total = h.chars.length;

				h.chars.forEach((char, j) => {
					const factor = j < Math.ceil(total / 2) ? j : Math.ceil(total / 2) - Math.abs(Math.floor(total / 2) - j) - 1;
					char.style.transform = `translate3d(0, ${(factor * translateY).toFixed(2)}px, 0)`;
				});
			});

			this.bend_frame = requestAnimationFrame(loop);
		};

		this.bend_frame = requestAnimationFrame(loop);
	},

	stop_bend(){
		if (this.bend_frame) cancelAnimationFrame(this.bend_frame);
		this.bend_frame = null;
	},
});
