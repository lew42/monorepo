import { Page, View, div, h3, p, md } from "/app.js";

/* Ported from Codrops' "Animations for Sticky Sections" (MIT) — demo1 (dim + bow) and
   demo3 (scale to nothing) combined — see sticky-stack.css for the licence note; the
   table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "sticky-stack.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep — see
   grid-hover/page.js's comment for the measurement). Own layout: prose, then the stage —
   its OWN scroll container (`overflow-y: auto`, a fixed height), so the sticky panels
   inside it pin against a scrollbar this page owns, never the site's column-row host.
   Regions: one. Preview: default card (the effect needs scrolling; a still cannot show
   it, so the parent's table describes it instead).

   ⚠ WHY A BOUNDED SCROLLER, NOT THE PAGE ITSELF. The original pins sections against the
     whole viewport. This site's own pages sit inside a columns host with no fixed scroll
     container of its own (readme.md's watch-out) — the fix used by `scroll-bend` was to
     read `getBoundingClientRect()` every animation frame instead of listening for scroll.
     Sticky needs an actual scrolling ANCESTOR to pin against, so here the simplest correct
     answer is to give the stage its own: `overflow-y: auto` makes it that ancestor, and a
     plain `scroll` listener on the stage — not the page, not the window — is entirely
     legitimate because this page owns that element outright. */

const PANELS = [
	{ title: "The Algorithm", text: "Its workings are shrouded in complexity, its decisions inscrutable to the general populace.", bg: "linear-gradient(155deg, hsl(205 60% 35%), hsl(230 60% 20%))" },
	{ title: "The Dogma", text: "The digital gospel etched into the code of the algorithmic society, the bedrock of its regime.", bg: "linear-gradient(155deg, hsl(15 65% 40%), hsl(350 65% 25%))" },
	{ title: "The Architects", text: "Elusive entities, lacking human form, shaping norms through the interplay of algorithm and dogma.", bg: "linear-gradient(155deg, hsl(270 55% 40%), hsl(300 55% 22%))" },
	{ title: "The Wasteland", text: "An overlooked realm, a consequence of algorithmic judgment, its stories uncharted.", bg: "linear-gradient(155deg, hsl(140 50% 32%), hsl(170 50% 18%))" },
	{ title: "The Narrative", text: "The omnipresent thread woven through the fabric of the algorithmic society.", bg: "linear-gradient(155deg, hsl(45 70% 38%), hsl(25 70% 24%))" },
];

export default new Page({
	meta: import.meta,
	title: "Sticky stack",
	description: "Scroll a bounded stage: each panel pins, then dims and shrinks as the next one covers it.",
	icon: "layers",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' sticky-section animations, rebuilt.** Scroll inside the box below (not the page — this box has its own scrollbar): each panel pins in place, then the NEXT panel slides up over it while the pinned one dims, loses contrast and shrinks slightly — so leaving a section reads as being covered, not just scrolled past.");

		div.c("codrops-stack-stage", () => {
			PANELS.forEach(panel => {
				div.c("codrops-stack-panel", () => {
					h3.c("codrops-stack-panel-title", panel.title);
					p.c("codrops-stack-panel-text", panel.text);
				}).style("--codrops-stack-bg", panel.bg);
			});
		});

		md("**What carried over:** the two-property recipe itself — `filter` (brightness + contrast) and a `transform` (scale + a small upward drift) driven by how much the NEXT panel has covered the current one, unchanged from the original's demo1/demo3. **What didn't:** GSAP's `ScrollTrigger` (`scrub: true` reading a named trigger element) and Lenis (a smooth-scroll wrapper around the whole page) — both dropped. This page listens for `scroll` on its OWN bounded stage instead of the page or the window, throttled to one `requestAnimationFrame` per burst, and reads each panel's plain `getBoundingClientRect()` to compute the covering progress — no library, and it does not care whether an ancestor column is also scrolling. `prefers-reduced-motion` skips starting the listener entirely: the panels still stack and pin (that part is CSS `position: sticky`, not motion), but never dim or shrink.");
	},

	activate(){
		Page.prototype.activate.call(this);
		if (!matchMedia("(prefers-reduced-motion: reduce)").matches) this.start_stack();
		return this;
	},

	deactivate(){
		this.stop_stack();
		return Page.prototype.deactivate.call(this);
	},

	// Owns its stage's scroll outright (see the ⚠ above), so a plain listener on that one
	// element — never the page, never the window — is the correct, simplest fix here.
	start_stack(){
		const stage = this.view.el.querySelector(".codrops-stack-stage");
		if (!stage) return;
		const panels = [...stage.querySelectorAll(".codrops-stack-panel")];

		const update = () => {
			this.stack_frame = null;
			const stage_top = stage.getBoundingClientRect().top;
			const h = stage.clientHeight || 1;

			panels.forEach((panel, i) => {
				const next = panels[i + 1];
				if (!next){ panel.style.setProperty("--progress", 0); return; }
				const next_top = next.getBoundingClientRect().top - stage_top;
				const progress = 1 - Math.min(Math.max(next_top / h, 0), 1);
				panel.style.setProperty("--progress", progress.toFixed(3));
			});
		};

		this.stack_stage_el = stage;
		this.stack_handler = () => {
			if (this.stack_frame) return;
			this.stack_frame = requestAnimationFrame(update);
		};

		stage.addEventListener("scroll", this.stack_handler, { passive: true });

		// ⚠ `View.stylesheet()` loads the css file ASYNCHRONOUSLY (a `<link>`, not a
		// blocking import) — on a fresh navigation `activate()` can run and call `update()`
		// before the stage's own `height: clamp(...)` has applied, so the very first read
		// sees an unstyled, auto-height stage and bakes a wrong progress into every panel's
		// inline style (measured: every panel but the last froze at 1.000 instead of 0,
		// `ai/2026-09-05/codrops-2/`). A `ResizeObserver` re-runs the same `update` the
		// moment the real layout lands, so the bogus first value never survives a frame.
		this.stack_observer = new ResizeObserver(this.stack_handler);
		this.stack_observer.observe(stage);

		update();
	},

	stop_stack(){
		if (this.stack_stage_el && this.stack_handler) this.stack_stage_el.removeEventListener("scroll", this.stack_handler);
		if (this.stack_observer) this.stack_observer.disconnect();
		this.stack_observer = null;
		if (this.stack_frame) cancelAnimationFrame(this.stack_frame);
		this.stack_frame = null;
		this.stack_stage_el = null;
	},
});
