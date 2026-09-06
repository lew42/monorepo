import { div, h2, p, span, a, icon, md } from "/app.js";
import { Paging, Stage } from "./paging.js";
import { BLOCKS, CONTROLS, DEFAULT, values_for, layout_url } from "./blocks.js";

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
     (core's own `preview_card()` carries the same note about its thumb). A value's
     sentence is plain English now (`core/Page/words.js`), and the one link a value
     has — the layout it compiles to — is drawn as a SIBLING of the card by
     `value_card()` below. This stays as the guard for any sentence that ever carries
     markdown again; the drawer, which is not a link, renders those properly. */
const plain = text => String(text).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

class Block extends Paging {

	/* ⚠ `lede()`, NOT `p.c("paging-lede", …)`. Only `md()` reads markdown, and four of
	     these six pages open with a bolded word — so a plain `p()` printed the
	     asterisks on screen, above the fold, on the pages that name the vocabulary
	     (paging-audit-2, break #3). `Paging.lede()` is the one call that gets it
	     right, and now every page in the realm uses it. */
	content(){
		this.stage({ ...DEFAULT, ...this.config });

		this.lede(this.lede_line);

		if (this.axes) this.groups();
		else if (this.axis){
			h2("The " + values_for(this.axis).length + " values, each at its own url");
			this.values(this.axis);

			// One block has something to say beyond its list of values — `content/`
			// also takes a url, and that is the only place worth saying it.
			this.extra?.();
		} else {
			/* ⚠ THE ONE BLOCK WITH NOTHING IN THE BAR, said out loud — and only on the
			     BLOCK's own page, never on a value's (`/room/wide/` reaches this branch
			     too, and its `name` is not one of the six). Five of the six name a
			     dropdown over every page in the realm and this one names none, which
			     reads as an omission until somebody says it is the point
			     (paging-audit-4: "one line on Stage saying it has no control"). */
			if (BLOCKS.some(block => block.id === this.name)){
				h2("Why this block has no control");
				md("**The bar over the page above has no `stage` dropdown, and it never will.** The stage IS that box — the thing the other five words act on. Change any of them and you have changed the stage; that is the whole idea the word names, and the line under the box measures it in pixels after every click.");
			}

			h2("Where it shows up");
			this.elsewhere();
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

	/* A GRID OF A WORD'S VALUES. Clicking one opens that value's page — same page,
	   same stage, that one word already set.

	   ⚠ `live: true` MAKES EVERY CARD A RUNNING PAGE. `/imagine/paging/toolbars/` used
	     to be a second page for four of arrangement's seven values, and its cards were
	     an icon and a sentence — so you clicked one to find out what it meant (the
	     owner, 2026-09-06: *"these paging toolbars links don't really show anything
	     meaningful"*). That page is deleted and this is where its job went: a card holds
	     the stage RUNNING with that one word set, so the wall is seven pictures of seven
	     page shapes and the click is confirmation rather than discovery.
	     Arrangement is the one block that says it today. Any of the other four can, with
	     the same word and no other change — it is the front page's `preset_card()`
	     machinery (`.paging-shot`), which has been on screen since the wall shipped. */
	values(axis, base = this.url){
		if (this.live) return div.c("paging-wall-live wide", () => values_for(axis).forEach(value => this.value_shot(value, base, axis)));

		return div.c("paging-cards", () => values_for(axis).forEach(value => this.value_card(value, base)));
	}

	/* ONE VALUE. An arrangement value gets a SECOND link under its card — the proven
	   layout it compiles to, in `core/Layout`'s catalogue of thirty — so "Panel left"
	   is one click from the shape it makes, at seven widths, with its rules.
	   ⚠ THE PAIR ARE SIBLINGS, never a link inside the card: a card IS one `<a>`, and
	     an `<a>` inside an `<a>` is invalid and silently un-nested by the browser (the
	     same note `preview_card()` carries about its thumb). Only a value that names a
	     layout gets the wrapper, so every other word's grid is the markup it was. */
	value_card(value, base){
		const card = () => a.c("paging-card").href(base + value.id + "/").append(() => {
			span.c("paging-card-head", () => { if (value.icon) icon(value.icon); span(value.title); });
			span.c("paging-card-say", plain(value.means));
		});

		return this.with_layout(value, card);
	}

	/* THE SAME VALUE, DRAWN AS THE PAGE IT MAKES. The card is the front page's
	   `.paging-shot`: a clipped frame with a real `Stage` in it at 0.6em, this block's
	   own configuration with one word replaced.
	   ⚠ `inner: true` — a nested stage draws no path bar and no caption, cannot take
	     the screen, and never touches the address bar. Seven of them writing one url
	     would fight, exactly as twelve would on the hub.
	   ⚠ AND THE MINIATURE IS NOT CLICKABLE — `.paging-shot-frame > .paging-stage` is
	     `pointer-events: none` in the stylesheet, because the CARD is the link and a
	     live page inside it would swallow the click. */
	value_shot(value, base, axis){
		const shot = () => a.c("paging-shot").href(base + value.id + "/").append(() => {
			div.c("paging-shot-frame", () => {
				new Stage({ config: { ...DEFAULT, ...this.config, [axis]: value.id }, inner: true });
			});

			span.c("paging-shot-head", () => { if (value.icon) icon(value.icon); span(value.title); });
			span.c("paging-shot-say", plain(value.means));
		});

		return this.with_layout(value, shot);
	}

	// The card, and — only where the value names one — the layout it compiles to,
	// beside it rather than inside it.
	with_layout(value, card){
		if (!value.layout) return card();

		return div.c("paging-card-cell", () => {
			card();
			a.c("paging-card-link").href(layout_url(value.layout))
				.append(() => { icon("view_quilt"); span("the " + value.layout + " layout, proven at seven widths"); });
		});
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
			lede_line: "**" + value.title + "** — " + value.means + " The page above is set to it.",
			config: { ...DEFAULT, ...this.config, [this.axis]: value.id },
			places: [[this.title, this.url, "back to all " + values_for(this.axis).length + " values"]],
		});
	}
}

export const block = options => new Block(options);

export { Block };
export default block;
