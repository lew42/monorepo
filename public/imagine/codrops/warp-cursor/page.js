import { Page, View, div, span, p, md } from "/app.js";

/* Ported from Codrops' "Animated Custom Cursor Effect" (MIT), demo 1 — see
   warp-cursor.css for the licence note; the table on /imagine/codrops/ has the summary
   row. */
View.stylesheet(import.meta, "warp-cursor.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep under
   codrops/large — `fill` claims the row's leftover; see grid-hover/page.js's comment for
   the measurement). Own layout: prose, then a bounded stage holding text and an inline
   SVG cursor that replaces the pointer WITHIN the stage only (never the whole page — see
   "what changed" below). Regions: one. Preview: default card. Mouse-only, like
   grid-hover's own hover effect — the stage says so. */

export default new Page({
	meta: import.meta,
	title: "Warp cursor",
	description: "Move the mouse inside the box: a trailing ring follows it and warps on the highlighted words.",
	icon: "blur_circular",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' Animated Custom Cursor Effect, rebuilt.** Move the mouse inside the box below: a ring replaces the pointer and trails a little behind it. Hold it over any **highlighted word** and the ring grows and briefly warps, like a lens of rippling water — an SVG filter distorting the ring, not the word. Mouse only (a `fine` pointer), like [`grid-hover`](/imagine/codrops/grid-hover/)'s own note.");

		div.c("codrops-warp-stage", () => {
			p.c("codrops-warp-text", () => {
				span("Some ");
				span.c("codrops-warp-hot", "pragmatic");
				span(" work, built for ");
				span.c("codrops-warp-hot", "real teams");
				span(" who need every page to ");
				span.c("codrops-warp-hot", "just work");
				span(".");
			});

			// The SVG cursor itself — a plain ring, an SMIL `<animate>` on the turbulence
			// filter's `baseFrequency` (begin="indefinite", fired by `beginElement()` on
			// hover), never a GSAP timeline. `r` on the circle is an animatable CSS
			// property in every current engine, so the grow/shrink on hover is one CSS
			// transition — no JS lerp needed for that part. `html_unsafe()` is core's own
			// way to build an inline `<svg>` — no factory can (its doc: no HTML factory
			// can create the SVG namespace; `document.createElement("svg")` builds an
			// HTML element that happens to be named svg and renders nothing).
			div.c("codrops-warp-cursor").html_unsafe(`
				<svg width="220" height="220" viewBox="0 0 220 220">
					<defs>
						<filter id="codrops-warp-filter" x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
							<feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="1" result="warp">
								<animate id="codrops-warp-anim" attributeName="baseFrequency" begin="indefinite" dur="0.4s" values="0.09;0" fill="freeze" />
							</feTurbulence>
							<feOffset dx="-30" result="warpOffset" />
							<feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="30" in="SourceGraphic" in2="warpOffset" />
						</filter>
					</defs>
					<circle class="codrops-warp-circle" cx="110" cy="110" r="60" />
				</svg>`);
		});

		md("**What carried over:** the ring following the pointer with a small lag (linear interpolation, not an instant jump) and the SVG `feTurbulence`/`feDisplacementMap` distortion on hover, both the original's own recipe. **What didn't:** the ring is confined to THIS stage, not `position: fixed` over the whole page — a page on this site keeps its own nav and breadcrumbs under a real pointer, so the custom cursor only takes over the box it demonstrates. GSAP's tween on `baseFrequency` is one SMIL `<animate begin=\"indefinite\">`, fired by `beginElement()` instead of a JS timeline. `prefers-reduced-motion` skips starting the custom cursor entirely — the box keeps the system pointer, since the whole effect here IS motion (grid-hover's readme rule).");
	},

	activate(){
		Page.prototype.activate.call(this);
		this.start_cursor();
		return this;
	},

	deactivate(){
		this.stop_cursor();
		return Page.prototype.deactivate.call(this);
	},

	start_cursor(){
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const fine = matchMedia("(any-pointer: fine)").matches;
		const stage = this.view.el.querySelector(".codrops-warp-stage");
		if (!stage || reduced || !fine) return;

		const cursor = stage.querySelector(".codrops-warp-cursor");
		const circle = stage.querySelector(".codrops-warp-circle");
		const anim = stage.querySelector("#codrops-warp-anim");
		const hots = [...stage.querySelectorAll(".codrops-warp-hot")];

		const pos = { x: { cur: 0, tgt: 0 }, y: { cur: 0, tgt: 0 } };
		const lerp = (a, b, n) => (1 - n) * a + n * b;

		const render = () => {
			pos.x.cur = lerp(pos.x.cur, pos.x.tgt, 0.2);
			pos.y.cur = lerp(pos.y.cur, pos.y.tgt, 0.2);
			cursor.style.transform = `translate(${pos.x.cur}px, ${pos.y.cur}px)`;
			this.cursor_frame = requestAnimationFrame(render);
		};

		this.cursor_move = (event) => {
			const rect = stage.getBoundingClientRect();
			pos.x.tgt = event.clientX - rect.left - 110;
			pos.y.tgt = event.clientY - rect.top - 110;
			if (!cursor.classList.contains("is-visible")){
				pos.x.cur = pos.x.tgt;
				pos.y.cur = pos.y.tgt;
				cursor.classList.add("is-visible");
			}
		};
		this.cursor_leave = () => cursor.classList.remove("is-visible");

		stage.addEventListener("mousemove", this.cursor_move);
		stage.addEventListener("mouseleave", this.cursor_leave);
		this.cursor_frame = requestAnimationFrame(render);

		this.hot_enter = () => {
			circle.style.filter = "url(#codrops-warp-filter)";
			cursor.classList.add("is-hot");
			anim.beginElement();
		};
		this.hot_leave = () => cursor.classList.remove("is-hot");
		this.hot_anim_end = () => { circle.style.filter = "none"; };

		hots.forEach(el => {
			el.addEventListener("mouseenter", this.hot_enter);
			el.addEventListener("mouseleave", this.hot_leave);
		});
		anim.addEventListener("endEvent", this.hot_anim_end);

		this.cursor_stage_el = stage;
		this.cursor_hots = hots;
		this.cursor_anim_el = anim;
	},

	stop_cursor(){
		if (this.cursor_frame) cancelAnimationFrame(this.cursor_frame);
		this.cursor_frame = null;
		if (this.cursor_stage_el){
			this.cursor_stage_el.removeEventListener("mousemove", this.cursor_move);
			this.cursor_stage_el.removeEventListener("mouseleave", this.cursor_leave);
		}
		if (this.cursor_hots) this.cursor_hots.forEach(el => {
			el.removeEventListener("mouseenter", this.hot_enter);
			el.removeEventListener("mouseleave", this.hot_leave);
		});
		if (this.cursor_anim_el) this.cursor_anim_el.removeEventListener("endEvent", this.hot_anim_end);
		this.cursor_stage_el = null;
		this.cursor_hots = null;
		this.cursor_anim_el = null;
	},
});
