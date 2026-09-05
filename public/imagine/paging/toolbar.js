import { View, div, span, select, option, icon } from "/app.js";
import { CONTROLS, SURFACES } from "./blocks.js";
import { fill_drawer } from "./config.js";

/* ── THE HOVER TOOLBAR ─────────────────────────────────────────────────────────

   The one control surface in the realm. It is INVISIBLE until you point at the
   stage (or tab into it), and then it is five dropdowns, two rows of colour, and
   the way into the drawer.

   It replaced the floating chip rows the realm used to carry on every page. The
   owner's report on those: *"it just sort of floats there, not visually clear what
   its for until you give the page a bg with card"* — so this one sits ON the stage,
   at its top edge, and shows up only when you are looking at the stage.

   ⚠ TWO COLOUR CONTROLS, SIDE BY SIDE, INDEPENDENT — the owner's exact ask: "card
     gives the content a bg, whereas the other colors change the whole column. i
     think we want the ability to switch either one to any color." The first row
     paints the CONTENT box, the second paints the PAGE behind it, and both read the
     same five words.

   ⚠ `:focus-within` as well as `:hover` (paging.css) — a toolbar you can only reach
     with a mouse is a toolbar half the readers do not have.                      */

const PICKERS = CONTROLS.filter(control => control.axis !== "surface" && control.axis !== "background");

export class PagingToolbar extends View {

	// ⚠ Before `super.initialize()`, which IS the render (View.initialize calls
	//   `append(this.render)`) — a hook registered after it would miss nothing today,
	//   but the field order is the one this class must not get wrong twice.
	initialize(){
		// The stage tells me when anything changed it — a swatch here, a control in
		// the drawer, or the library's own dropdown. One hook, one direction.
		this.stage.changed = () => this.sync();
		super.initialize();
	}

	// ⚠ The class NAME is the css class: `View.classify()` lowercases every
	//   constructor in the chain, so `PagingToolbar` is `.paging-toolbar` and a class
	//   called `Toolbar` would have worn the framework's own `.toolbar`.
	render(){
		this.selects = new Map();
		this.marks = [];

		div.c("paging-toolbar-row", () => {
			PICKERS.forEach(control => this.picker(control));
			this.more();
		});

		div.c("paging-toolbar-row paging-toolbar-colours", () => {
			this.swatches("surface", "content colour");
			this.swatches("background", "page colour");
		});

		// The marks are written by the same call an external change uses, so there is
		// one place that decides what "selected" looks like.
		this.sync();
	}

	// ── one dropdown ─────────────────────────────────────────────────────────
	// A real `<select>`: the base theme already fills, pads and borders it, it is
	// keyboard- and screen-reader-complete for free, and it is the smallest control
	// that can offer six values without becoming a wall of chips.
	picker({ axis, label, values }){
		return div.c("paging-pick", () => {
			span.c("paging-pick-label", label);

			const $select = select(() => values.forEach(value => option(value.title).attr("value", value.id)))
				.attr("title", label)
				.attr("aria-label", label)
				.on("change", event => this.stage.set(axis, event.target.value));

			$select.el.value = this.stage.config[axis];
			this.selects.set(axis, $select);
		});
	}

	/* ── the two colour rows ──────────────────────────────────────────────────
	   Five swatches each, and the swatch IS the colour — a word in a dropdown cannot
	   show you what `prim` looks like, and this is the one control whose value is a
	   thing you can see. */
	swatches(axis, label){
		return div.c("paging-swatches", () => {
			span.c("paging-pick-label", label);
			SURFACES.forEach(surface => this.swatch(axis, surface));
		});
	}

	swatch(axis, surface){
		const act = () => this.stage.set(axis, surface.id);

		const $swatch = span.c("paging-swatch paging-surface-" + surface.id)
			.attr("role", "button").attr("tabindex", "0")
			.attr("title", surface.title + " — " + surface.means)
			.click(act)
			.on("keydown", event => {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				act();
			});

		this.marks.push({ $swatch, axis, id: surface.id });
		return $swatch;
	}

	// ── everything else lives in the drawer ──────────────────────────────────
	more(){
		const act = () => fill_drawer(this.stage, this.page);

		return span.c("paging-more")
			.attr("role", "button").attr("tabindex", "0")
			.append(() => { icon("tune"); span("More"); })
			.click(act)
			.on("keydown", event => {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				act();
			});
	}

	/* ⚠ SYNC, NEVER REBUILD. A `<select>` fires `change` while it still has focus, and
	     emptying this view from inside that handler would delete the element the
	     reader is standing on. So the controls are built once and only their VALUES
	     are written back — which is also what keeps an external change (the drawer,
	     the library dropdown) showing up here. */
	sync(){
		this.selects?.forEach(($select, axis) => { $select.el.value = this.stage.config[axis]; });
		this.marks?.forEach(({ $swatch, axis, id }) => {
			const on = this.stage.config[axis] === id;
			$swatch.tc("on", on).attr("aria-pressed", String(on));
		});
		return this;
	}
}

export const Toolbar = PagingToolbar;
export default PagingToolbar;
