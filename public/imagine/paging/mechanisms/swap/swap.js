import { View, div, p, h3, span, icon, md } from "/app.js";
import { press } from "../../paging.js";

/* ── SWAP, FOUR WAYS, ON ONE STAGE ─────────────────────────────────────────────
   The owner's question: *"the paging swap method — it's basically just tabs, but
   we should then just call it tabs? can you make other non-tab-like visual
   swapping?"*

   The answer this file is: TABS ARE ONE SWAP VISUAL. The mechanism underneath is
   "the stage stays, the content changes", and a tab strip is only the most familiar
   way to draw the picker. Here are three more on the very same rectangle:

     tabs        a strip of labels, the selected one joined to the panel
     card-in     the old card slides out to the left, a new card slides in
     cross-fade  the old text fades, the new one appears in place
     flip        the stage turns over, and the new panel is on its back

   THE ONE RULE THEY ALL KEEP (doc/decisions.md, "the stage is always visible"): a click changes what is inside
   a rectangle you could already see, and the rectangle stays. The stage below has a
   fixed height for exactly that reason — the caption reads its real rectangle back
   before and after every click and says whether it moved.                        */

/* The three panels. Deliberately the same three a tab strip on a marketing site
   would carry, because the point is that you already know this gesture. */
export const PANELS = [
	["Overview", "What the product is, in one paragraph, on the panel a tab strip opens onto."],
	["Pricing", "Three plans, and the one in the middle is the one most teams pick. The line under the stage has the measurements."],
	["Contact", "One address, one form, one map. Press the chips above to watch this same panel arrive three other ways."],
];

/* The four visuals, and the one sentence each earns. `says` is printed under the
   stage the moment you choose it, so nobody has to guess what they are watching. */
export const VISUALS = {
	tabs: {
		icon: "tab",
		says: "A strip of labels sits on top of the stage, and the selected one is joined to it — same surface, no line between them. Nothing moves at all.",
	},
	"card-in": {
		icon: "layers",
		says: "The old card slides out to the left and a new card slides in from the right, inside the stage. 220ms.",
	},
	"cross-fade": {
		icon: "opacity",
		says: "The old panel fades out and the new one fades in, in the same place. Nothing translates, so there is nothing for the eye to track. 180ms.",
	},
	flip: {
		icon: "flip",
		says: "The stage turns over and the new panel is on its back. 240ms, and the box occupies the same rectangle throughout.",
	},
};

export const VISUAL_WORDS = Object.keys(VISUALS);

/* ── THE SWAPPER ───────────────────────────────────────────────────────────────
   One stage, four ways to change what is in it, and a caption that measures.     */
export class PagingSwapper extends View {

	initialize(){
		this.visual ??= "tabs";
		this.n ??= 0;
		super.initialize();
	}

	render(){
		this.visuals();
		this.$set = div.c("paging-swapper-set", () => { this.set(); });
		this.$cap = div.c("paging-swapper-cap", () => { this.caption(); });
	}

	// ── WHICH VISUAL ──────────────────────────────────────────────────────────
	visuals(){
		return div.c("paging-swapper-visuals", () => {
			span.c("paging-axis", "swap visual");
			VISUAL_WORDS.forEach(word => this.visual_chip(word));
		});
	}

	visual_chip(word){
		const on = this.visual === word;

		return press(span.c("paging-chip").ac(on && "on").attr("aria-pressed", String(on))
			.append(() => { icon(VISUALS[word].icon); span(word); }), () => this.use(word));
	}

	// A new visual is a new stage, so the change note from the old one is dropped
	// rather than carried over and read as a report on a click you did not make.
	use(word){
		if (this.visual === word) return this;

		this.visual = word;
		this.change = null;

		this.$set.empty(() => { this.set(); });
		this.$cap.empty(() => { this.caption(); });
		return this;
	}

	// ── THE PICKER AND THE STAGE, AS ONE UNIT ─────────────────────────────────
	// In `tabs` the picker is the top edge of the stage. In the other three it is a
	// row of chips above a free-standing box. Either way the box below is the same
	// rectangle, in the same place.
	set(){
		this.visual === "tabs" ? this.tab_set() : this.chip_set();
	}

	tab_set(){
		return div.c("paging-tabs", () => {
			this.$bar = div.c("paging-tab-bar", () => PANELS.forEach(([label], i) =>
				press(span.c("paging-tab", label).ac(i === this.n && "on").attr("aria-selected", String(i === this.n)),
					() => this.show(i))));

			this.$stage = div.c("paging-swapper-stage paging-tab-panel", () => { this.face(this.n); });
		});
	}

	chip_set(){
		div.c("paging-swapper-pick", () => PANELS.forEach(([label], i) => {
			const on = i === this.n;
			press(span.c("paging-chip", label).ac(on && "on").attr("aria-pressed", String(on)), () => this.show(i));
		}));

		this.$stage = div.c("paging-swapper-stage").ac("paging-stage-" + this.visual)
			.append(() => { this.visual === "flip" ? this.flipper() : this.face(this.n); });
	}

	// ONE PANEL. `extra` is the animation class the arriving panel wears.
	face(i, extra){
		const [title, says] = PANELS[i];

		return div.c("paging-face").ac(extra).append(() => {
			span.c("paging-face-eyebrow", "panel");
			h3(title);
			p(says);
		});
	}

	// The flip visual holds BOTH faces at once, back to back, and turns the pair.
	flipper(){
		return this.$flipper = div.c("paging-swapper-flipper", () => {
			this.$front = div.c("paging-flip-face paging-flip-front", () => { this.face(this.n); });
			this.$back = div.c("paging-flip-face paging-flip-back");
		});
	}

	// ── THE SWAP ──────────────────────────────────────────────────────────────
	// ⚠ The rectangle is read off the real element before AND after, and
	//   `getBoundingClientRect()` flushes layout synchronously — so the caption's
	//   claim that the stage did not move is a measurement, not a promise.
	show(i){
		if (i === this.n) return this;

		const from = this.n;
		const before = this.rect();

		this.n = i;

		if (this.visual === "tabs") this.show_tab(i);
		else if (this.visual === "flip") this.show_flip(i);
		else this.show_face(i);

		this.change = { from, to: i, before, after: this.rect() };
		this.$cap.empty(() => { this.caption(); });
		return this;
	}

	rect(){
		const box = this.$stage?.el?.getBoundingClientRect();
		return box && { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) };
	}

	show_tab(i){
		this.$bar.el.querySelectorAll(".paging-tab").forEach((el, n) => {
			el.classList.toggle("on", n === i);
			el.setAttribute("aria-selected", String(n === i));
		});

		this.$stage.empty(() => { this.face(i); });
	}

	/* CARD-IN and CROSS-FADE. Both panels share the stage for the length of the
	   animation, which is why `.paging-face` is absolute — a second panel in normal
	   flow would double the box's height, and the box not changing size is the
	   whole point of the page.

	   ⚠ The old panel is removed on a TIMER, never on `animationend`: with
	     `prefers-reduced-motion` the animation is 1ms and the event may not be
	     observed at all, and a panel that never left would sit on top of the new
	     one forever. */
	show_face(i){
		const $old = this.$stage.el.querySelector(".paging-face");
		const card = this.visual === "card-in";

		if ($old) $old.classList.add(card ? "paging-face-out-left" : "paging-face-fade-out");

		this.$stage.append(() => { this.face(i, card ? "paging-face-in-right" : "paging-face-fade-in"); });

		setTimeout(() => $old?.remove(), 300);
	}

	// The face you cannot see is the one that gets the new panel; then the pair turns.
	show_flip(i){
		const turned = this.$flipper.el.classList.contains("paging-flipped");
		const $hidden = turned ? this.$front : this.$back;

		$hidden.empty(() => { this.face(i); });
		this.$flipper.el.classList.toggle("paging-flipped");
	}

	// ── THE CAPTION ───────────────────────────────────────────────────────────
	caption(){
		p.c("paging-swapper-what", () => {
			icon(VISUALS[this.visual].icon);
			span(VISUALS[this.visual].says);
		});

		const change = this.change;

		if (!change) return p("Press one of the three panel names and this line will say which panel arrived — and what the stage measured before and after.");

		const same = change.before && change.after &&
			["x", "y", "w", "h"].every(k => change.before[k] === change.after[k]);

		return md("**panel: " + PANELS[change.from][0] + " → " + PANELS[change.to][0] + ".** " + (same
			? "The stage did not move and did not change size — still " + change.after.w + " × " + change.after.h + "px, at the same point on screen."
			: "The stage went from " + change.before.w + " × " + change.before.h + "px to " + change.after.w + " × " + change.after.h + "px."));
	}
}

export default PagingSwapper;
