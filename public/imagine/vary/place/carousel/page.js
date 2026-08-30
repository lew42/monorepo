import { Page, div, h4, p, button, md } from "/app.js";

// Container: vary/place/'s own $pages region, `main` prose width. Size: one
// bordered box, ~40em, fixed height per slide. Own layout: its own bespoke
// track + nav (no Page/columns/tabs machinery — a plain animated swap).
// Regions: one (the current slide). Preview: default card.

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

	content(){
		md("Click a dot or an arrow — the panel CYCLES to it, animated. Auto-advance is off; `prefers-reduced-motion` drops the animation, never the result.");

		let index = 0;
		let $track;
		const $dots = [];

		const go = i => {
			index = (i + ITEMS.length) % ITEMS.length;
			$track.style("transform", `translateX(-${index * 100}%)`);
			$dots.forEach(($d, n) => $d.tc("active", n === index));
		};

		div.c("vary-carousel", () => {
			$track = div.c("vary-carousel-track", () => {
				ITEMS.forEach(([name, text]) => div.c("vary-carousel-slide", () => { h4(name); p(text); }));
			});

			div.c("vary-carousel-nav", () => {
				button.c("vary-carousel-arrow", "‹").attr("aria-label", "Previous").click(() => go(index - 1));
				div.c("vary-carousel-dots", () => {
					ITEMS.forEach((_, i) => $dots.push(
						button.c("vary-carousel-dot").attr("aria-label", "Slide " + (i + 1)).click(() => go(i))
					));
				});
				button.c("vary-carousel-arrow", "›").attr("aria-label", "Next").click(() => go(index + 1));
			});
		});

		go(0);

		md("**Verdict:** one item at a time, fully animated, no accumulating trail — good for a small fixed set browsed in sequence, wrong the moment someone needs to compare two side by side.");
	},
});
