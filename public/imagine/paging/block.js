import { div, h2, p, span, a, icon, md } from "/app.js";
import { Paging } from "./paging.js";
import { BLOCKS, CONTROLS, DEFAULT, values_for } from "./blocks.js";

/* ── ONE BUILDING BLOCK, AS A PAGE ────────────────────────────────────────────

   Five of the six blocks are a WORD with a short list of values, and their pages
   are the same page five times: a sentence saying what to do, one live page whose
   word you are changing, and a nav grid of that word's values — each of which is a
   real url you can send.

       export default block({ meta: import.meta, id: "room" });

   ⚠ THE VALUES HAVE URLS AND NO DIRECTORIES. `route()` is core's own seam for a
     child that is not a directory, so `/imagine/paging/room/wide/` is a real page
     with a real back button and there is no `room/wide/page.js` anywhere. The realm
     used to carry thirteen one-value directories doing this by hand — five under
     `styles/`, four under `sizes/`, four under `toolbars/` — and one `route()`
     replaced all thirteen (the 2026-09-05 audit; doc/decisions.md).              */

/* ⚠ A CARD IS ONE `<a>`, so nothing inside it may be a link — `md()` in here would
     nest an anchor in an anchor, which is invalid and which the browser un-nests
     (core's own `preview_card()` carries the same note about its thumb). The values'
     sentences carry markdown links to `/imagine/layouts/`; this flattens them to
     their text, and the drawer — which is not a link — renders them properly. */
const plain = text => String(text).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

class Block extends Paging {

	/* ⚠ `lede()`, NOT `p.c("paging-lede", …)`. Only `md()` reads markdown, and four of
	     these six pages open with a bolded word — so a plain `p()` printed the
	     asterisks on screen, above the fold, on the pages that name the vocabulary
	     (paging-audit-2, break #3). `Paging.lede()` is the one call that gets it
	     right, and now every page in the realm uses it. */
	content(){
		this.lede(this.lede_line);

		this.stage({ ...DEFAULT, ...this.config });

		if (this.axes) this.groups();
		else {
			h2(this.axis ? "The " + values_for(this.axis).length + " values, each at its own url" : "Where it shows up");
			if (this.axis) this.values(this.axis);
			else this.elsewhere();
		}

		md("The other blocks: " + BLOCKS.filter(block => block.id !== this.name)
			.map(block => "[" + block.title + "](" + block.url + ")").join(" · ") + ".");
	}

	/* A BLOCK THAT IS MORE THAN ONE WORD. Skin is three controls — the content's
	   colour, the page's colour and the type size — and until now only the first had
	   a page, so `background` and `type` were words the toolbar could set and no url
	   could name (paging-audit-2b, fix 3). Each axis gets a heading, a nav grid, and
	   a page of its own at `/skin/<axis>/`, whose values are at `/skin/<axis>/<id>/`. */
	groups(){
		return this.axes.forEach(axis => {
			const control = CONTROLS.find(entry => entry.axis === axis);

			h2(() => {
				a.c("page-link").href(this.url + axis + "/").append(() => span(control.label));
			});

			this.values(axis, this.url + axis + "/");
		});
	}

	// A nav grid of a word's values. Clicking one opens that value's page —
	// same page, same stage, that one word already set.
	values(axis, base = this.url){
		return div.c("paging-cards", () => values_for(axis).forEach(value =>
			a.c("paging-card").href(base + value.id + "/").append(() => {
				span.c("paging-card-head", () => { if (value.icon) icon(value.icon); span(value.title); });
				span.c("paging-card-say", plain(value.means));
			})));
	}

	// The stage has no word of its own — it is the box every other word acts on —
	// so its page points at the places you can watch it hold still instead.
	elsewhere(){
		return div.c("paging-cards", () => (this.places ?? []).forEach(([title, url, says]) =>
			a.c("paging-card").href(url).append(() => {
				span.c("paging-card-head", () => { icon("crop_square"); span(title); });
				span.c("paging-card-say", says);
			})));
	}

	/* ⚠ `route()` SEES UNDECLARED NAMES ONLY, so it can never shadow a real child —
	     core checks `children.get(name)` first. A value that is not in the list
	     returns nothing and core falls through to a filesystem probe, which 404s,
	     which is the right answer for `/room/banana/`. */
	route(name){
		// A block with several words routes to ONE of them first: `/skin/background/`
		// is a whole Block whose own values then route under it.
		if (this.axes?.includes(name)){
			const control = CONTROLS.find(entry => entry.axis === name);

			return new Block({
				title: this.title + ": " + control.label,
				label: control.label,
				icon: this.icon,
				description: "The " + control.values.length + " values of " + control.label + ".",
				axis: name,
				lede_line: "Pick a value below, or change **" + control.label + "** in the bar — this page is that one word on its own.",
				config: { ...DEFAULT, ...this.config },
			});
		}

		if (!this.axis) return;

		const value = values_for(this.axis).find(entry => entry.id === name);
		if (!value) return;

		return new Block({
			title: this.title + ": " + value.title,
			label: value.title,
			icon: value.icon ?? this.icon,
			description: value.means,
			axis: null,
			lede_line: "**" + value.title + "** — " + value.means + " The page below is set to it.",
			config: { ...DEFAULT, ...this.config, [this.axis]: value.id },
			places: [[this.title, this.url, "back to all " + values_for(this.axis).length + " values"]],
		});
	}
}

export const block = options => new Block(options);

export { Block };
export default block;
