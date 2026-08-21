import View, { div, span, button, icon } from "/framework/core/View/View.js";

/* One choice out of a list, as a trigger that SHOWS the choice — its picture and its name —
   and a list that opens in the TOP LAYER, so nothing it is drawn inside can clip it.
   Imports View and nothing else; every picture arrives from the caller.
   css: .dropdown, .dropdown-trigger, .dropdown-name, .dropdown-list, .dropdown-option.
   Record: readme.md. */
View.stylesheet(import.meta, "dropdown.css");

export class Dropdown {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// What the trigger wears: the current value's entry, or the first as a fallback.
	chosen(){ return this.options.find(o => o.value === this.value) ?? this.options[0]; }

	/* A picture and a name. `icon` is a Material name OR a function that draws one — the
	   two forms ext/Panel's `glyph()` already hands out, so a swatch works as well as a
	   ligature. An option with neither is its name alone. */
	face(o){
		if (typeof o?.icon === "function") o.icon();
		else if (o?.icon) icon(o.icon);
		span.c("dropdown-name", o?.label ?? o?.value ?? "");
	}

	draw(){ return this.$drop = div.c("dropdown", () => { this.trigger(); this.list(); }); }

	trigger(){
		return this.$trigger = button.c("dropdown-trigger")
			.attr("type", "button").attr("aria-haspopup", "listbox").attr("title", this.title ?? "")
			.append(() => { this.face(this.chosen()); icon("expand_more"); })
			.click(() => this.toggle())
			.on("keydown", e => ["ArrowDown", "ArrowUp"].includes(e.key) && (e.preventDefault(), this.open()));
	}

	/* ⚠ `popover`, and that is the whole clipping fix: an open popover is promoted to the
	   TOP LAYER, outside every `overflow: hidden` ancestor — which a panel, its workspace
	   and the rail all are. `auto` brings outside-click and Escape with it, so neither is
	   code here. It stays a CHILD of the dropdown, so the DOM that built it takes it away. */
	list(){
		return this.$list = div.c("dropdown-list")
			.attr("popover", "auto").attr("role", "listbox")
			.append(() => this.options.forEach(o => this.option(o)))
			.on("keydown", e => this.keys(e))
			.on("toggle", e => this.$drop[e.newState === "open" ? "ac" : "rc"]("on"));
	}

	option(o){
		return button.c("dropdown-option")
			.attr("type", "button").attr("role", "option").attr("title", o.label ?? o.value)
			.ac(o.value === this.value && "on")
			.append(() => this.face(o))
			.click(() => { this.close(); this.pick?.(o.value); });
	}

	/* ⚠ `preventScroll`, then `nearest`. A bare `focus()` on the lit option scrolls it to
	   where the browser likes, which for an option low in a long list pushes the first rows
	   above the box's top — open the template list on `toc` and `cells` was out of sight.
	   The keyboard still lands where the value is; the eye still starts at the top. */
	open(){
		this.$list.el.showPopover();
		this.place();

		const start = this.$list.el.querySelector(".dropdown-option.on") ?? this.$list.el.firstElementChild;
		start?.focus({ preventScroll: true });
		start?.scrollIntoView({ block: "nearest" });
	}

	close(){ this.$list.el.hidePopover(); }
	showing(){ return this.$list.el.matches(":popover-open"); }
	toggle(){ this.showing() ? this.close() : this.open(); }

	/* Measured off the trigger in VIEWPORT coordinates: a top-layer box has no containing
	   block to inherit and CSS anchor positioning is not everywhere yet. Below the trigger
	   unless the list would not fit, then above — and clamped either way, so the last row
	   of a rail opens upward and is whole. Zeroed first, because the rect it is placed
	   from has to be the list's own size, not wherever it last sat. */
	place(){
		const s = this.$list.el.style;
		s.left = s.top = "0px";
		s.minInlineSize = this.$trigger.el.getBoundingClientRect().width + "px";

		const t = this.$trigger.el.getBoundingClientRect();
		const r = this.$list.el.getBoundingClientRect();
		const fits = t.bottom + r.height + PAD <= innerHeight;

		s.left = Math.max(PAD, Math.min(t.left, innerWidth - r.width - PAD)) + "px";
		s.top = Math.max(PAD, Math.min(fits ? t.bottom : t.top - r.height, innerHeight - r.height - PAD)) + "px";
	}

	/* Up and down walk the options; Enter takes the focused one, which a `button` does
	   itself. An outside click is the popover's own.
	   ⚠ Escape is NOT left to the popover: it is a shared key. `ext/Panel`'s focus.js drops
	   the panel selection on Escape, so a list dismissed by the browser's own close watcher
	   took the selection — and the rail the list was drawn in — with it. Closed here, and
	   stopped here, with the trigger given the focus back. */
	keys(e){
		if (e.key === "Escape"){
			e.preventDefault();
			e.stopPropagation();
			this.close();
			return this.$trigger.el.focus();
		}

		if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
		e.preventDefault();

		const all = [...this.$list.el.querySelectorAll(".dropdown-option")];
		const next = all.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1);
		all[(next + all.length) % all.length]?.focus();
	}
}

// Clear of every viewport edge, and of the trigger it hangs off.
const PAD = 4;

Dropdown.prototype.options = [];

// The door: built under whatever is capturing, exactly like a `div()`.
export const dropdown = (...args) => new Dropdown(...args).draw();

export default dropdown;
