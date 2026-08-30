import { Page, View, div, p, a, icon } from "/app.js";

View.stylesheet(import.meta, "screens.css");

/* THE ONE MECHANISM THIS LAB IS BUILT FROM.

   `/imagine/` is a columns host, so every page under it is a column in ONE row and
   there is no second row to open from down here. A full-screen experience is therefore
   a WIDTH WORD, not a shell: `full` collapses every ancestor column — the rail, this
   index — into the crumb strip above the row, and what is left is the viewport with a
   trail on top (core/Page/doc/columns.md).

   Two words, and the whole permutation space is between them:

     width: "full"   REPLACES what came before — the screen you open hides the one you
                     were on. A deck, a band count, a slide.
     width: "fill"   JOINS what is already open — the screens left share the row evenly.
                     One is the whole screen, two are halves, four are quarters.

   Every experiment ROOT is `full` (it has to collapse the site's own columns); each
   hop then picks a word, and that word is the experiment. screens.css re-tunes `full`'s
   three tokens to `fill`'s arithmetic so a root can be both — see the sheet's first rule. */

export class Screen extends Page {

	/* One screen. Core's column head and its automatic nav rows are left out on purpose:
	   on a full screen the REGIONS are the navigation and the crumb strip is the way
	   back, so a second set of chrome would only say it again, smaller. */
	column(host){
		return div.c("page-column-body screens-screen", () => this.content())
			.ac("page-column-" + (this.width ?? "full"));
	}

	/* Navigate the way a click does — `Router.go()` is what the Router's own click handler
	   calls, so a keyboard step and a link can never take different paths.
	   ⚠ NOT `this.app.router`. A column marked `default` is BUILT by its host rather than
	     routed to, so nothing ever calls `child()` on it and the `app` it was adopted with
	     at module scope (undefined) is still undefined. Measured: clicking the deck's first
	     slide at /deck/ threw "Cannot read properties of undefined (reading 'router')".
	     The chain's root always has one. */
	go(url){ return this.chain().find(page => page.app).app.router.go(url); }

	/* The card is a PICTURE of the shape — Page.css makes a thumb inert, so nothing
	   here can be a live render anyway, and a diagram of the hops says more than a
	   quarter-scale screenshot of one of them would. Core's own card, with the
	   description put back: `preview_card()` drops it when a thumb is present. */
	preview(nav){
		return div.c("page-preview", () => {
			div.c("page-preview-thumb screens-thumb", () => frames(...this.shapes ?? []));
			this.preview_link(nav);
			if (nav.description) p.c("page-preview-desc", nav.description);
		});
	}
}

/* TWO BOXES, ALWAYS. The AREA is the paper: full bleed, the click target, the box that
   carries the tone. The BLOCK inside it is what the screen composes INTO — capped, and
   centred in whatever room is left over, so a wide screen gets a margin rather than a
   corner. It is also the query container, which is what keeps the type honest: a word
   is sized by the block it belongs to, so a slide on 3440 and a quarter-column at 1920
   are the same fraction of their own composition (screens.css).

   No `to` makes a dead area: the last hop has nowhere further down, and the crumb strip
   is how you come back up. */
export const sheet = (to, build) => (to ? a.c("screens-area").href(to) : div.c("screens-area"))
	.append(() => div.c("screens-block", () => build()));

/* The shorthand every experiment uses: a title, a note under it, and the whole sheet is
   the link. */
export const area = (label, note, to) => sheet(to, () => {
	div.c("screens-label", label);
	if (note) div.c("screens-note", note);
});

/* The diagram on a card: one frame per hop, left to right, chevrons between.
   A spec is its cells — a flex weight each, `w/n` splitting that cell into n bands.
   A leading `v` stacks the whole frame; `q` is the 2x2. */
export const frames = (...specs) => div.c("screens-frames", () => specs.forEach((spec, i) => {
	if (i) icon("chevron_right");

	const vertical = spec.startsWith("v"), quad = spec === "q";
	const cells = quad ? ["1", "1", "1", "1"] : spec.replace(/^v/, "").trim().split(/\s+/);

	div.c("screens-frame").ac(vertical && "screens-frame-v").ac(quad && "screens-frame-q").append(() => {
		cells.forEach(token => {
			const [weight, bands] = token.split("/");

			div.c("screens-cell").style("flex", weight).ac(bands && "screens-cell-split").append(() => {
				for (let n = 0; n < Number(bands ?? 0); n++) div.c("screens-cell");
			});
		});
	});
}));

export default Screen;
