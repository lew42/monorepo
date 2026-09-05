import { div, h2, p, span, a, icon, md } from "/app.js";
import { Paging } from "./paging.js";
import { BLOCKS, DEFAULT, values_for } from "./blocks.js";

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

	content(){
		p.c("paging-lede", this.lede_line);

		this.stage({ ...DEFAULT, ...this.config });

		h2(this.axis ? "The " + values_for(this.axis).length + " values, each at its own url" : "Where it shows up");

		if (this.axis) this.values();
		else this.elsewhere();

		md("The other blocks: " + BLOCKS.filter(block => block.id !== this.name)
			.map(block => "[" + block.title + "](" + block.url + ")").join(" · ") + ".");
	}

	// A nav grid of this word's values. Clicking one opens that value's page —
	// same page, same stage, that one word already set.
	values(){
		return div.c("paging-cards", () => values_for(this.axis).forEach(value =>
			a.c("paging-card").href(this.url + value.id + "/").append(() => {
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
