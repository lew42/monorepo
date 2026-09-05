import { View, div, span, select, option, icon } from "/app.js";
import { BLOCKS, SURFACES, controls_of } from "./blocks.js";
import { PRESETS, preset_of, preset_url } from "./presets.js";
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

   ⚠ ONE DROPDOWN PER WORD, NOT A ROW OF CHIPS. Seven words means 40 values, and as
     chip groups that was a sprawling bar three and four rows deep (the owner,
     2026-09-05: *"if there are button groups, just make them a dropdown to save
     space"*). Seven labelled dropdowns fit one row at 3440 and two at 1280.

   ⚠ AND NOTHING CLIPS. The bar HAD native selects until this morning and they were
     80–111px wide, cutting their own values off ("Top tabs" read "Top tab") — because
     a `<select>` in a flex row shrinks below its content like any other flex item.
     `flex: none` on the control and `width: auto` on the select is the whole fix: the
     browser then sizes each one to its longest option. There is no width in this file.

   ⚠ THE LABEL SITS ABOVE THE SELECT, not beside it. Beside, seven labelled controls
     are ~1190px and wrap to three rows in a 1040px middle at 1280; above, they are
     ~770px and fit one row, and the bar is two lines tall instead of four.

   ⚠ A COLOUR YOU CAN SEE. `surface` and `background` are the two controls whose value
     is a thing rather than a word, so each keeps one dot beside its dropdown painted
     in the colour it is currently set to. A dropdown alone cannot show you `prim`.  */

// The two words whose current value is painted beside the dropdown.
const COLOURS = ["surface", "background"];

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
		this.picks = new Map();
		this.dots = new Map();

		div.c("paging-toolbar-row", () => {
			this.shape();

			/* ⚠ ONE GROUP PER BUILDING BLOCK, not one per word. The rail says six
			     blocks; the bar used to say seven labels, three of which were Skin —
			     so a newcomer counted three sets of names for one realm
			     (paging-audit-4). Now the bar's labels ARE the rail's, in the rail's
			     order, and SKIN holds its three controls under one heading. */
			BLOCKS.forEach(block => this.block_group(block));

			div.c("paging-group paging-toolbar-outs", () => {
				this.code();
				this.more();
			});
		});

		// The values are written by the same call an external change uses, so there is
		// one place that decides what the bar is showing.
		this.sync();
	}

	/* ── THE EIGHTH CONTROL: WHICH READY-MADE PAGE ────────────────────────────
	   On the twelve library pages, the one thing you change that is not a single word
	   is WHICH ready-made page you are looking at — so it belongs in the bar, in the
	   same shape as the other seven, showing the name of the page that is running.

	   It used to be a grey chip-button sitting ABOVE the bar reading "Pick one of
	   twelve" — an eighth control in a ninth style, and it read as UNSET while the
	   blog preset was already running underneath it (paging-audit-3, item 5).

	   ⚠ ONLY WHERE THERE IS ONE. A page says which ready-made page it is by carrying
	     a `shape` (`library/page.js`); every other page in the realm has none, and
	     gets the seven words alone — a control that navigates has no business in the
	     bar of a page it cannot name. */
	shape(){
		const here = this.page?.shape;
		if (!here) return null;

		return div.c("paging-group").append(() => {
			span.c("paging-pick-label", "page shape");

			div.c("paging-pick", () => {
				const $select = select(() => PRESETS.forEach(preset => option(preset.title).attr("value", preset.id)))
					.attr("title", "page shape")
					.attr("aria-label", "page shape")
					.on("change", event => this.go_to(event.target.value));

				$select.el.value = here.id;
			});
		});
	}

	// A real navigation, through core's own Router — so the address changes, the back
	// button works, and the page you land on is the preset's own url with its own words.
	go_to(id){
		this.page?.app?.router?.go(preset_url(preset_of(id)));
		return this;
	}

	/* ── ONE BUILDING BLOCK'S CONTROLS ────────────────────────────────────────
	   Five of the six blocks own exactly one word, so the block's name and the
	   control's label are the same thing and there is one dropdown under it. SKIN
	   owns three — the content's colour, the page's colour and the type size — so its
	   heading is SKIN and each dropdown keeps its own small caption underneath it.
	   STAGE owns none: it is the box the other five words act on, so it has nothing
	   in the bar and its own page says so. */
	block_group(block){
		const controls = controls_of(block.id);
		if (!controls.length) return null;

		if (controls.length === 1) return this.group(controls[0], controls[0].label);

		return div.c("paging-group paging-group-many").append(() => {
			span.c("paging-pick-label", block.title);
			div.c("paging-group-row", () => controls.forEach(control => this.group(control, control.label, true)));
		});
	}

	// ── one labelled dropdown ────────────────────────────────────────────────
	group({ axis, label, values }, heading, small){
		return div.c("paging-group").ac(small && "paging-group-small").append(() => {
			span.c("paging-pick-label", heading);

			div.c("paging-pick", () => {
				if (COLOURS.includes(axis)) this.dots.set(axis, span.c("paging-dot"));

				const $select = select(() => values.forEach(value =>
					option(value.title).attr("value", value.id).attr("title", value.means)))
					.attr("title", label)
					.attr("aria-label", label)
					.on("change", event => this.stage.set(axis, event.target.value));

				this.picks.set(axis, $select);
			});
		});
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
			() => fill_drawer(this.stage, this.page, "code"));
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

	/* ⚠ SYNC, NEVER REBUILD. A `<select>` fires `change` while it still has focus, and
	     emptying this view from inside that handler would delete the element the reader
	     is standing on. So the controls are built once and only their VALUES are
	     written back — which is also what keeps an external change (the drawer, the
	     library's own menu, a url) showing up here. */
	sync(){
		this.picks?.forEach(($select, axis) => { $select.el.value = this.stage.config[axis]; });

		this.dots?.forEach(($dot, axis) => {
			$dot.rc(...SURFACES.map(surface => "paging-surface-" + surface.id))
				.ac("paging-surface-" + this.stage.config[axis]);
		});

		return this;
	}
}

export const Toolbar = PagingToolbar;
export default PagingToolbar;
