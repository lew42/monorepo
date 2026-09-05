import { View, div, span, a, p, h2, md, icon } from "/app.js";
import LayoutsCard, { press } from "./LayoutsCard.js";
import { NUMBERS, ORDER, of_number, name_of, url_of, step } from "./system.js";

View.stylesheet(import.meta, "layouts.css");

/* ── A NUMBER PAGE, AND THE FULL-SCREEN PAGE UNDER IT ──────────────────────────
   `1/page.js` … `4/page.js` are three lines each; everything they share is here, so
   adding `5.*` one day is a directory and one call.

   A NUMBER PAGE is the related scroll: every distribution with that column count,
   one under the other, each drawn with the same three-column card. That is the
   owner's "when you have multiples of these on one page, they should be related and
   so as you scroll from one to the next, you could see the relation" — same card,
   same chips, same sample boxes, one line of CSS different each time.

   ITS CHILDREN ARE THE FULL-SCREEN PAGES. Declared here rather than as directories:
   there is nothing on disk for them to hold, so eighteen full-screen routes cost four
   modules and no server probes, and each one is `width: "full"` — core's own word for
   "the whole row; the ancestors collapse into the crumb strip".

   Container: a column in `/imagine/`'s columns host. Size: `fill`, the word that
   claims the whole leftover at any depth — a card at 3440 is the point of the card.
   That is normally the wrong word for a page whose children open beside it, because
   `fill` would squeeze them; here it is safe BY CONSTRUCTION, because every child is
   `full` and a `full` child hides its ancestors rather than sitting next to them.   */

/* ── THE CRUMB STRIP, AND THE OWNER'S QUESTION ─────────────────────────────────
   "Will the breadcrumbs always be there? What if you didn't want that?"

   No — a chip on any full-screen page hides them. The strip belongs to the columns
   HOST four levels up (`/imagine/`), so the switch is one class on <body> and a rule
   in `@layer util`, which out-ranks core's own `@layer theme` at any specificity.

   ⚠ It is cleared on the way OUT (`deactivated`) and re-applied on the way IN
     (`activated`), so a reader cannot carry a hidden crumb strip into another realm —
     and the choice still survives clicking next / previous through the catalogue,
     because every one of those pages re-applies it. Nothing is written to storage:
     this is a per-visit control, like every other chip in this realm. */
export const crumbs = {
	hidden: false,
	apply(){ document.body.classList.toggle("layouts-crumbs-off", this.hidden); return this; },
	clear(){ document.body.classList.remove("layouts-crumbs-off"); return this; },
	toggle(){ this.hidden = !this.hidden; return this.apply().hidden; },
};

/* ── THE PERSISTENT NAVIGATION ─────────────────────────────────────────────────
   A `full` column loses the row it came from, and at 3440 the crumb strip is a thin
   line a very long way from the reader's eye. So a full page carries its own way on:
   previous, next, where you are in the catalogue, the way back to the number, and the
   crumb-strip switch. It is sticky to the top of the column body — part of the
   layout, not part of the chrome — so it survives a page as tall as you like. */
class LayoutsFullbar extends View {

	render(){
		const entry = this.entry;
		const at = ORDER.indexOf(entry);

		this.link(step(entry, -1), "chevron_left", "previous");

		span.c("layouts-fullbar-title", name_of(entry) + " · " + entry.title);
		span.c("layouts-fullbar-count", (at + 1) + " of " + ORDER.length);

		this.link(step(entry, 1), "chevron_right", "next", true);

		a.c("layouts-chip").href("/imagine/layouts/" + entry.n + "/").append(() => {
			icon("close_fullscreen");
			span("back to " + entry.n + ".*");
		});

		// ⚠ Built and ASSIGNED before it is filled: a capture callback runs while the
		//   factory call is still evaluating, so `this.$crumbchip` inside one would
		//   still be undefined. The handler is bound once, here; `crumbchip()` only
		//   ever paints, so flipping cannot stack a second listener.
		this.$crumbchip = span.c("layouts-chip");
		press(this.$crumbchip, () => this.flip());
		this.crumbchip();
	}

	link(to, glyph, words, after){
		return a.c("layouts-chip").href(url_of(to)).append(() => {
			if (!after) icon(glyph);
			span(words + " · " + name_of(to));
			if (after) icon(glyph);
		});
	}

	crumbchip(){
		this.$crumbchip
			.rc("on").ac(crumbs.hidden && "on")
			.attr("aria-pressed", String(crumbs.hidden))
			.attr("data-axis", "crumbs")
			.empty(() => {
				icon(crumbs.hidden ? "visibility_off" : "visibility");
				span(crumbs.hidden ? "crumb strip hidden" : "hide the crumb strip");
			});
	}

	flip(){
		crumbs.toggle();
		this.crumbchip();
		this.page?.$crumbnote?.empty(() => { this.page.crumbnote(); });
	}
}

/* ── ONE FULL-SCREEN PAGE ──────────────────────────────────────────────────────
   The same card as the scroll above it, given the whole row. */
const full_page = entry => ({
	name: entry.id,
	title: name_of(entry) + " — " + entry.title,

	// ≤ 45 characters: a column child is previewed at two widths at once and the
	// narrow one clips past that (measured 2026-09-04).
	description: entry.title + ", full screen",
	icon: "open_in_full",
	width: "full",

	activated(){ crumbs.apply(); },
	deactivated(){ crumbs.clear(); },

	crumbnote(){
		return p.c("layouts-navnote", crumbs.hidden
			? "The crumb strip is hidden. This bar is the way back — `back to " + entry.n + ".*` returns to the scroll, and previous / next walk all " + ORDER.length + " layouts without leaving full screen. Showing the strip again is the same chip."
			: "The crumb strip above the row is still there, and it is the site's own way back. On a 3440 screen it is a thin line a long way from here, which is why this bar exists at all — press `hide the crumb strip` to see the page without it.");
	},

	content(){
		div.c("layouts-full", () => {
			new LayoutsFullbar({ entry, page: this });
			new LayoutsCard({ entry, full: true });
			this.$crumbnote = div(() => { this.crumbnote(); });
		});
	},
});

/* ── THE NUMBER PAGE ───────────────────────────────────────────────────────────
   `1/page.js` is `export default new Page(numbered({ meta: import.meta, n: 1 }))`. */
export const numbered = ({ meta, n }) => {
	const number = NUMBERS.find(one => one.n === n);
	const entries = of_number(n);

	return {
		meta,
		title: n + ".* " + number.title,
		description: number.blurb,
		icon: "view_column",
		width: "fill",

		// Every entry below carries its own `open full screen` link, so core's row
		// list would say all of it a second time (core/Page/doc/columns.md, `index`).
		index: true,

		children: entries.map(full_page),

		content(){
			md(number.lead);

			md("Each card is the same three columns: the name, a two-sentence intro and the chips on the **left**; the layout itself, live, in the **middle**; and on the **right** the CSS it is, the widths its tracks just measured, and the one line of config that makes a page from it. The chips change padding, surface, navigation and the viewport width — nothing is saved, and a card you have changed says so.");

			div.c("layouts-cards", () => entries.forEach(entry => new LayoutsCard({ entry })));

			h2("Where to go next");

			div.c("layouts-numbers", () => NUMBERS.filter(one => one.n !== n).forEach(one => {
				a.c("layouts-number").href("/imagine/layouts/" + one.n + "/").append(() => {
					span.c("layouts-number-n", one.n + ".*");
					span.c("layouts-number-name", one.title);
					span.c("layouts-number-list", one.blurb);
				});
			}));
		},
	};
};
