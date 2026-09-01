import { Page, div, h4, p, button, md } from "/app.js";

// Container: vary/place/'s own $pages region, `main` prose width. Size: one
// bordered box, ~40em, fixed height per slide. Own layout: its own bespoke
// track + nav (no Page/columns/tabs machinery — a plain animated swap).
// Regions: one (the current slide). Preview: default card.
//
// KEYBOARD + WHEEL TRAVEL: add and swap get keyboard for free (real <a>/tab
// links); this is a bespoke widget, so it gets nothing for free. `activated()`
// / `deactivated()` add and remove ONE keydown listener — same lifecycle shape
// as imagine/decks/deck.js's `arrows` mixin — so the keys are live only while
// this page is the one on screen. Wheel travel reads `deltaX` only, never
// `deltaY`: a carousel that swallows a plain vertical scroll because the mouse
// happened to be over it is worse than a carousel with no wheel at all.

const ITEMS = [
	["Alpha", "Alpha — first of four, nothing else to say."],
	["Beta",  "Beta — second of four."],
	["Gamma", "Gamma — third of four."],
	["Delta", "Delta — fourth of four."],
];

export default new Page({
	meta: import.meta,
	title: "Carousel",
	description: "Animated cycling — the same four items, one slide showing at a time.",
	icon: "view_carousel",

	slide: 0,   // NOT `index` — core reads `page.index` to mean "my content already lists my children" (Page.class.js)

	activated(){
		this.keys ??= e => {
			if (e.target.closest("input, textarea, select, [contenteditable]")) return;
			if (e.key === "ArrowRight") this.go(this.slide + 1);
			else if (e.key === "ArrowLeft") this.go(this.slide - 1);
		};
		addEventListener("keydown", this.keys);
	},

	deactivated(){ removeEventListener("keydown", this.keys); },

	content(){
		md("Click a dot or an arrow, press ← / →, or scroll sideways — the panel CYCLES to it, animated. Auto-advance is off; `prefers-reduced-motion` drops the animation, never the result.");

		let $track, $wheel_lock = 0;
		const $dots = [];

		this.go = i => {
			this.slide = (i + ITEMS.length) % ITEMS.length;
			$track.style("transform", `translateX(-${this.slide * 100}%)`);
			$dots.forEach(($d, n) => $d.tc("active", n === this.slide));
		};

		div.c("vary-carousel").attr("tabindex", "0").append($el => {
			$track = div.c("vary-carousel-track", () => {
				ITEMS.forEach(([name, text]) => div.c("vary-carousel-slide", () => { h4(name); p(text); }));
			});

			div.c("vary-carousel-nav", () => {
				button.c("vary-carousel-arrow", "‹").attr("aria-label", "Previous").click(() => this.go(this.slide - 1));
				div.c("vary-carousel-dots", () => {
					ITEMS.forEach((_, i) => $dots.push(
						button.c("vary-carousel-dot").attr("aria-label", "Slide " + (i + 1)).click(() => this.go(i))
					));
				});
				button.c("vary-carousel-arrow", "›").attr("aria-label", "Next").click(() => this.go(this.slide + 1));
			});
		}).on("wheel", e => {
			if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   // vertical scroll passes through untouched
			e.preventDefault();
			if (Date.now() - $wheel_lock < 400) return;             // one slide per gesture, not one per pixel
			$wheel_lock = Date.now();
			this.go(this.slide + (e.deltaX > 0 ? 1 : -1));
		});

		this.go(0);

		md("**Verdict:** one item at a time, fully animated, no accumulating trail — good for a small fixed set browsed in sequence, wrong the moment someone needs to compare two side by side.");
	},
});
