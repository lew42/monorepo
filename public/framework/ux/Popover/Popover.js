import View, { div, span, button } from "/framework/core/View/View.js";

/* One popup, positioned off an ANCHOR element, that never fights a z-index. The
   `popover` attribute promotes it to the browser's TOP LAYER — painted above every
   `overflow: hidden` ancestor and every stacking context on the page, with no
   z-index at all — and brings outside-click and Escape for free (the browser's,
   not code here). Placed with CSS ANCHOR POSITIONING where the browser has it;
   measured off `getBoundingClientRect()`, once per open, where it does not. Why
   this beat `position: absolute`: doc/decisions.md.

       new Popover({
           anchor: el,          // a DOM element (a View's own `.el`) — kept IN THE DOM
           content(){ … },       // draws whatever goes inside; runs with `this` = the Popover
           place: "bottom",      // "bottom" | "top" | "left" | "right" — flips at the edge
           trigger: "click",     // "click" | "hover" | "manual" (you call open()/close())
       }).draw();

   Any UI can go inside — a filter box, buttons, a Tree. `tooltip()` and `menu()`
   below are the whole of what a caller builds on top: draw(), open(), close(), and
   that is it. css: .ux-popover, .ux-popover-item. Record: readme.md. */
View.stylesheet(import.meta, "Popover.css");

const ANCHOR_CSS = typeof CSS !== "undefined" && CSS.supports("anchor-name", "--ux-popover-test");
const GAP = 6;   // clear of the anchor, and of the viewport edge, in the fallback

// One offset per side, and the side it flips to when the first choice runs off-screen.
const SIDE = {
	bottom: (t, r) => ({ left: t.left + t.width / 2 - r.width / 2, top: t.bottom + GAP, flip: "top" }),
	top:    (t, r) => ({ left: t.left + t.width / 2 - r.width / 2, top: t.top - r.height - GAP, flip: "bottom" }),
	right:  (t, r) => ({ left: t.right + GAP, top: t.top + t.height / 2 - r.height / 2, flip: "left" }),
	left:   (t, r) => ({ left: t.left - r.width - GAP, top: t.top + t.height / 2 - r.height / 2, flip: "right" }),
};

let uid = 0;

export class Popover {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* Built once — opened twice reuses the same box. Stays a SIBLING of the anchor,
	   right after it in the DOM, so it is authored "nearby" (the owner's own word)
	   even though it paints in the top layer — the same "list stays a child" call
	   ext/Dropdown made, one level up (a sibling, not a child, because a menu or a
	   tree inside it may want to be its own full element, not nested in a trigger
	   `<button>`). */
	draw(){
		if (this.$box) return this.$box;

		this.name = "--ux-popover-" + ++uid;
		if (ANCHOR_CSS) this.anchor.style.setProperty("anchor-name", this.name);

		this.$box = div.c("ux-popover")
			.attr("popover", "auto")
			.attr("role", this.role ?? "dialog")
			.attr("data-place", this.place)
			.append(() => { this.content(); })
			.on("toggle", e => this.toggled(e));

		if (ANCHOR_CSS) this.$box.style("position-anchor", this.name);

		this.anchor.after(this.$box.el);
		this.wire();

		return this.$box;
	}

	wire(){
		if (this.trigger === "manual") return;

		if (this.trigger === "hover"){
			let timer;
			const enter = () => { clearTimeout(timer); timer = setTimeout(() => this.open(), this.delay ?? 0); };
			const leave = () => { clearTimeout(timer); this.close(); };
			this.anchor.addEventListener("pointerenter", enter);
			this.anchor.addEventListener("pointerleave", leave);
			this.anchor.addEventListener("focus", enter);
			this.anchor.addEventListener("blur", leave);
			return;
		}

		// A real `<button>` fires "click" for a mouse click AND for Enter/Space on
		// the keyboard — nothing extra to wire for that half of the proof.
		this.anchor.addEventListener("click", () => this.toggle());
	}

	open(){
		this.draw();
		if (!this.showing()) this.$box.el.showPopover();
	}

	close(){ this.showing() && this.$box.el.hidePopover(); }
	toggle(){ this.showing() ? this.close() : this.open(); }
	showing(){ return this.$box?.el.matches(":popover-open") ?? false; }

	/* The browser's OWN toggle event, which fires for every close path alike — a
	   light-dismiss click, Escape, or a script calling close() — so one listener
	   places the box and moves focus for all of them; ext/Dropdown's list wears
	   the same shape for the same reason. */
	toggled(e){
		this.$box[e.newState === "open" ? "ac" : "rc"]("on");

		if (e.newState === "open"){
			if (!ANCHOR_CSS) this.place();
			this.$box.el.querySelector("[tabindex], button, a, input")?.focus({ preventScroll: true });
			return;
		}

		// Return focus only if the keyboard had actually moved INTO the box — a
		// hover-only tooltip never took focus to begin with, so there is nothing
		// to hand back, and doing it anyway would steal focus from wherever the
		// mouse actually is.
		if (this.$box.el.contains(document.activeElement)) this.anchor.focus({ preventScroll: true });
	}

	/* The fallback for a browser with no CSS anchor positioning: measured off
	   `getBoundingClientRect()`, once per open, flipped once if the first choice
	   would run off the viewport — ext/Dropdown's `place()`, generalised from two
	   sides to four. */
	place(){
		const s = this.$box.el.style;
		s.left = s.top = "0px";

		const t = this.anchor.getBoundingClientRect();
		const r = this.$box.el.getBoundingClientRect();
		let at = SIDE[this.place](t, r);

		const off = at.left < 0 || at.top < 0 || at.left + r.width > innerWidth || at.top + r.height > innerHeight;
		if (off) at = SIDE[at.flip](t, r);

		s.left = Math.max(GAP, Math.min(at.left, innerWidth - r.width - GAP)) + "px";
		s.top = Math.max(GAP, Math.min(at.top, innerHeight - r.height - GAP)) + "px";
	}
}

Popover.prototype.place = "bottom";
Popover.prototype.trigger = "click";

/* ════ THREE THINGS ON TOP OF IT — a few lines each ════════════════════════ */

/* Hover AND focus, a short delay, `role="tooltip"` — text only, never itself
   focusable content. */
export function tooltip(el, text, opts = {}){
	return new Popover({
		anchor: el, trigger: "hover", role: "tooltip",
		place: opts.place ?? "top", delay: opts.delay ?? 400,
		content(){ span(text); },
	}).draw();
}

/* A list of actions. Arrow keys walk it; `place: "right"` opens it to the side —
   the owner's own second placement, not a special case bolted on after. */
export function menu(anchor, items, opts = {}){
	const pop = new Popover({
		anchor, trigger: "click", role: "menu",
		place: opts.place ?? "bottom",
		content(){
			items.forEach(item => button.c("ux-popover-item").attr("type", "button").attr("role", "menuitem")
				.text(item.text)
				.click(() => { pop.close(); item.pick?.(); }));
		},
	});

	const $box = pop.draw();
	$box.on("keydown", e => {
		if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
		e.preventDefault();
		const all = [...$box.el.querySelectorAll(".ux-popover-item")];
		const next = all.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1);
		all[(next + all.length) % all.length]?.focus();
	});

	return pop;
}

export default Popover;
