import { View, div, span, icon } from "/app.js";
import { CONTROLS, SURFACES } from "./blocks.js";
import { fill_drawer } from "./config.js";

/* ── THE TOOLBAR ───────────────────────────────────────────────────────────────

   The control surface of the realm: every word this page is made of, as a labelled
   group of chips, sitting ABOVE the stage. Click a chip and the page under it
   changes; the caption under the stage says what that did, in pixels.

   ⚠ IT SITS ABOVE THE STAGE, IN THE FLOW — it does not float over it. It used to:
     the bar was `position: absolute` at the stage's top edge, and it appeared on
     hover, which meant that on the realm's own front page it covered the demo's tab
     strip. Moving the mouse toward a tab made the bar appear ON the tab, so the tab
     could not be clicked with a mouse at all, at any width — the headline gesture of
     the realm, unreachable (paging-audit-2, break #1; measured again here: a
     Playwright click on "Pricing" timed out at 1280 and at 3440). A control that
     covers the thing it controls is not a control. It now reserves its own height.

   ⚠ CHIPS, NOT `<select>`s. Five native dropdowns, 80–111px wide, clipped their own
     values ("Top tabs" read "Top tab") and the two colour rows were unlabelled dots.
     The drawer had the good version all along — a label, the values as chips, and a
     sentence saying what the current one means. This is that, minus the sentences,
     which stay in the drawer where there is room for them.

   ⚠ A CHIP IS A SPAN, NOT A `<button>`. The site theme styles every `button` as a
     small uppercase CTA — `.theme-lew42 :is(button, .btn)` at (0,2,0), in the same
     layer — so a chip cannot win that at its own specificity. The keyboard half is
     what a `<button>` gave for free, so it is restated in `press()` below.        */

// The two colour words draw swatches instead of chips: a swatch IS its value, and
// no word in a list can show you what `prim` looks like.
const SWATCHES = ["surface", "background"];

const press = ($el, act) => $el
	.attr("role", "button").attr("tabindex", "0")
	.click(act)
	.on("keydown", event => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		act();
	});

export class PagingToolbar extends View {

	// ⚠ Before `super.initialize()`, which IS the render (View.initialize calls
	//   `append(this.render)`) — a hook registered after it would miss nothing today,
	//   but the field order is the one this class must not get wrong twice.
	initialize(){
		// The stage tells me when anything changed it — a chip here, a control in the
		// drawer, or the library's own dropdown. One hook, one direction.
		this.stage.changed = () => this.sync();
		super.initialize();
	}

	// ⚠ The class NAME is the css class: `View.classify()` lowercases every
	//   constructor in the chain, so `PagingToolbar` is `.paging-toolbar` and a class
	//   called `Toolbar` would have worn the framework's own `.toolbar`.
	render(){
		this.marks = [];

		div.c("paging-toolbar-row", () => {
			CONTROLS.forEach(control => this.group(control));

			div.c("paging-group paging-toolbar-outs", () => {
				this.code();
				this.more();
			});
		});

		// The marks are written by the same call an external change uses, so there is
		// one place that decides what "selected" looks like.
		this.sync();
	}

	// ── one labelled group ───────────────────────────────────────────────────
	group(control){
		return div.c("paging-group").append(() => {
			span.c("paging-pick-label", control.label);

			div.c("paging-group-values", () => control.values.forEach(value =>
				SWATCHES.includes(control.axis)
					? this.swatch(control.axis, value)
					: this.chip(control.axis, value)));
		});
	}

	chip(axis, value){
		const $chip = press(span.c("paging-chip")
			.attr("title", value.title + " — " + value.means)
			.append(() => { if (value.icon) icon(value.icon); span(value.title); }),
			() => this.stage.set(axis, value.id));

		this.marks.push({ $mark: $chip, axis, id: value.id });
		return $chip;
	}

	swatch(axis, surface){
		const $swatch = press(span.c("paging-swatch paging-surface-" + surface.id)
			.attr("title", surface.title + " — " + surface.means),
			() => this.stage.set(axis, surface.id));

		this.marks.push({ $mark: $swatch, axis, id: surface.id });
		return $swatch;
	}

	/* ── THE WAY OUT ──────────────────────────────────────────────────────────
	   Seven words are a page, and a page has to be able to stop being seven words.
	   This opens the same drawer `More` does, and it is labelled for the one thing a
	   reader goes looking for: the `page.js` this configuration would be, ready to
	   copy into a directory of your own. (Build has printed its nodes since it
	   shipped; the stage had no way out at all until now.) */
	code(){
		return press(span.c("paging-more paging-more-quiet")
			.attr("title", "the page.js this page would be, ready to copy")
			.append(() => { icon("code"); span("Code"); }),
			() => fill_drawer(this.stage, this.page));
	}

	// ── everything else lives in the drawer ──────────────────────────────────
	// The whole form with its sentences, the JSON, the page.js, the link to this
	// exact configuration, `nest`, and "make this a page".
	more(){
		return press(span.c("paging-more")
			.attr("title", "the whole configuration, the code, and the link to this page")
			.append(() => { icon("tune"); span("More"); }),
			() => fill_drawer(this.stage, this.page));
	}

	/* ⚠ SYNC, NEVER REBUILD. A click on a chip runs while that chip has focus, and
	     emptying this view from inside its own handler would delete the element the
	     reader is standing on. So the controls are built once and only their MARKS
	     are written back — which is also what keeps an external change (the drawer,
	     the library dropdown, a url) showing up here. */
	sync(){
		this.marks?.forEach(({ $mark, axis, id }) => {
			const on = this.stage.config[axis] === id;
			$mark.tc("on", on).attr("aria-pressed", String(on));
		});
		return this;
	}
}

export const Toolbar = PagingToolbar;
export default PagingToolbar;
