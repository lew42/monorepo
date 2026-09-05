import { Page, View, div, span, h3, button, md } from "/app.js";
import { MECHANISMS } from "/imagine/paging/paging.js";

/* Ported from Codrops' "Shapes Slideshow" (MIT), demo 1 — see shape-swap.css for the
   licence note; the table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "shape-swap.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep under
   codrops/large — `fill` claims the row's leftover; see grid-hover/page.js's comment for
   the measurement). Own layout: prose, then the stage — slides stacked absolutely inside
   one bounded box, prev/next controls and an index readout. Regions: one. Preview:
   default card. */

const SLIDES = [
	{ title: "Far from Venice", sub: "sunset in her gaze", hue: 210 },
	{ title: "Temptation", sub: "a desire to engage", hue: 340 },
	{ title: "Somebody's game", sub: "in ancient dreams", hue: 40 },
	{ title: "Heartful acts", sub: "when passion calls", hue: 130 },
];

export default new Page({
	meta: import.meta,
	title: "Shape swap",
	description: "Click the arrows: an iris wipe swaps the slide in place.",
	icon: MECHANISMS.swap.icon,
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md(`**Codrops' Shapes Slideshow, rebuilt as a card stack.** Click the arrows below: the next slide wipes in from a circular clip-path anchored at the edge you moved toward, covering the one before it. This is this realm's own [\`swap\`](/imagine/paging/mechanisms/swap/) mechanism: "${MECHANISMS.swap.does}" — the box never moves, the url never changes, and only one slide is ever interactive (\`aria-hidden\` on the rest) — a **sixth** swap visual alongside \`mechanisms/swap/\`'s tabs, card-in, cross-fade, flip and this realm's own circular click-wipe from [\`circle-reveal\`](/imagine/codrops/circle-reveal/).`);

		let stage_el;

		div.c("codrops-swap-stage", ($stage) => {
			stage_el = $stage.el;

			div.c("codrops-swap-slides", () => {
				SLIDES.forEach((slide, i) => {
					div.c(`codrops-swap-slide${i === 0 ? " is-current" : ""}`)
						.style("--codrops-swap-bg", `linear-gradient(155deg, hsl(${slide.hue} 65% 42%), hsl(${(slide.hue + 30) % 360} 65% 22%))`)
						.attr("aria-hidden", i === 0 ? "false" : "true")
						.append(() => {
							h3.c("codrops-swap-title", slide.title);
							span.c("codrops-swap-sub", slide.sub);
						});
				});
			});

			div.c("codrops-swap-nav", () => {
				button.c("codrops-swap-btn unbutton", "‹").attr("aria-label", "Previous slide").click(() => this.swap_slide(stage_el, "prev"));
				span.c("codrops-swap-index");
				button.c("codrops-swap-btn unbutton", "›").attr("aria-label", "Next slide").click(() => this.swap_slide(stage_el, "next"));
			});
		});

		this.update_index(stage_el, 0);

		md("**What carried over:** the iris wipe itself — a `clip-path: circle()` growing from 0 at the edge you're moving toward to fully cover the stage — and the prev/next/index navigation shape. **What didn't:** GSAP's twelve-step timeline (the original staggers the outgoing slide's clip-path, its image's counter-translate, its heading's per-row slide-out, and the link's fade — then repeats the choreography in reverse for the incoming slide, over roughly 2 seconds with `power3`/`expo` eases); this port is a single CSS `transition: clip-path` on the incoming slide only, so the text below appears rather than sliding row by row, and the imagery is placeholder gradients rather than photography. `prefers-reduced-motion` drops the transition — the new slide simply replaces the old one.");
	},

	swap_slide(stage_el, direction){
		if (stage_el.classList.contains("is-animating")) return;
		const slides = [...stage_el.querySelectorAll(".codrops-swap-slide")];
		const total = slides.length;
		const from = slides.findIndex(el => el.classList.contains("is-current"));
		const to = direction === "next" ? (from + 1) % total : (from - 1 + total) % total;
		const from_el = slides[from], to_el = slides[to];
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

		to_el.dataset.dir = direction;
		to_el.classList.add("is-current", "is-entering");
		from_el.setAttribute("aria-hidden", "true");
		to_el.setAttribute("aria-hidden", "false");

		// from_el is fully covered by to_el's grown circle the instant this fires — so
		// its own clip-path can snap back to hidden with NO transition. Skipping that
		// matters: both slides briefly share a z-index once `is-entering` clears, and DOM
		// order alone decides which paints on top — for a "prev" swap that is the OLDER
		// slide, so an animated reset would visibly flash it back over the new one.
		const finish = () => {
			from_el.style.transition = "none";
			from_el.classList.remove("is-current");
			from_el.getBoundingClientRect();   // flush the style change before re-enabling
			from_el.style.transition = "";
			to_el.classList.remove("is-entering");
			stage_el.classList.remove("is-animating");
			this.update_index(stage_el, to);
		};

		if (reduced){
			finish();
			return;
		}

		stage_el.classList.add("is-animating");
		requestAnimationFrame(() => requestAnimationFrame(() => to_el.classList.remove("is-entering")));
		to_el.addEventListener("transitionend", finish, { once: true });
	},

	update_index(stage_el, current){
		const readout = stage_el.querySelector(".codrops-swap-index");
		if (readout) readout.textContent = `${current + 1} / ${SLIDES.length}`;
	},
});
