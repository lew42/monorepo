import { Page, View, div, figure, figcaption, img, h2, p, md } from "/app.js";
import { doodles, names, notes, texture } from "./doodles.js";

View.stylesheet(import.meta, "doodles.css");

// ref/ sits beside this file, and the page can be mounted at any url, so the
// crops are addressed against this module rather than against the document.
const ref = name => new URL("ref/" + name + ".png", import.meta.url).href;

/* Layout (the `layout` skill's five):
   1. Container — a plain page in the app's main region. /notes/doodles/ is a
      child of the /notes/ realm, not a columns host.
   2. Size — everything fills. The wall is framework.css's `grid auto gap` with
      `--column: 6.4em` and `bleed`, so it is 3 tiles wide at 400 and the whole
      library in one row at 3440; the four use-cards are a `cols` row that
      stacks under 34rem.
   3. Own layout — one word, `.doodle-wall`, and all it does is set `--column`.
   4. Regions — none nested.
   5. Preview — the parent's card, which /notes/page.js already names. */
export default new Page({
	meta: import.meta,
	title: "Doodles",
	description: "Twenty-three marks from the notebook, redrawn by hand as SVG — icons, decoration, a texture, one that draws itself.",
	children: "catalogue",

	content(){
		md("The owner's notebook is full of marks that are not words: stars in the "
			+ "margin, boxes with an X where a picture goes, squiggles standing in for a "
			+ "line of writing. **Every one below was photographed, then drawn again by "
			+ "hand as an SVG** — a stroke, not a traced picture. The photograph is on "
			+ "the left of each pair and the redrawing on the right.");

		this.wall();
		this.uses();

		md("The whole catalogue — which mark came from which spread, how often it "
			+ "turned up, and the two that could not be used — is one click down.");
		this.previews();
	},

	/* The wall. Photograph beside redrawing, twenty-three times, and nothing else:
	   the comparison IS the page.
	   `bleed` spends the page's own inset back, so the wall spans the whole region
	   while the prose above it keeps the measure — three tiles across at 400, eleven
	   at 1280 and the whole set in one row at 3440 — one `--column`, no media query. */
	wall(){
		div.c("doodle-wall bleed grid auto gap", () => {
			names.forEach(name => {
				figure.c("doodle-tile", () => {
					div.c("doodle-tile-pair", () => {
						img().attr("src", ref(name)).attr("alt", "the " + name + " doodle, photographed");
						doodles[name]();
					});
					figcaption.c("muted", name);
				});
			});
		});
	},

	// The four uses, shown rather than described. One card each.
	uses(){
		h2("Four ways to use one");

		div.c("cols gap", () => {
			this.use_icon();
			this.use_decoration();
		});

		div.c("cols gap", () => {
			this.use_texture();
			this.use_animated();
		});
	},

	// 1. As an icon: 1em, on the text baseline, in the text's own colour.
	use_icon(){
		div.c("surface pad flex v gap", () => {
			h2("As an icon");
			p(() => { doodles.check(); }, " Shipped, and the tick runs out of the box.");
			p(() => { doodles.arrow(); }, " Then this happens next.");
			p(() => { doodles.spike(); }, " Up and to the right.");
			p.c("muted", () => { doodles.star(); }, " Muted text, muted doodle — the drawing "
				+ "has no colour of its own, so it takes the colour of the words beside it.");
		});
	},

	// 2. As a decoration: big, faint, in a corner, out of the way.
	use_decoration(){
		// `doodle-band` for its `position: relative` — the corner doodle is
		// absolutely placed, so it needs a box to be absolute inside.
		div.c("surface pad doodle-band flex v gap", () => {
			div.c("doodle-corner muted", () => { doodles.compass("6em"); });
			h2("As a decoration");
			p("The compass sits in the corner at 6em and 22% opacity. It is not content: "
				+ "it takes no space in the flow and never catches a click.");
		});
	},

	// 3. As a texture: the same drawing tiled behind a band, faint enough to read as paper.
	use_texture(){
		div.c("surface pad doodle-band flex v gap", () => {
			texture("star", { tile: 46, size: 18, opacity: 0.1 });
			h2("As a texture");
			p("The star, tiled behind this band at 10% and turned six degrees. "
				+ "It is one SVG `<pattern>`, so the page holds a single copy of the "
				+ "drawing however many times it appears.");
		});
	},

	// 4. Animated: undrawn until the pointer enters the card, then drawn on in 1.2s.
	use_animated(){
		div.c("surface pad doodle-draw flex v gap", () => {
			h2("Drawn on");
			p("These three drew themselves when the page loaded. Point at the card and "
				+ "they draw again, stroke by stroke, in about a second — the way they "
				+ "were drawn on paper.");
			div.c("flex gap v-center h-center", () => {
				doodles.compass("5em");
				doodles.pentagram("3em");
				doodles.note("3em");
			});
			p.c("muted", "If your system asks for reduced motion, the drawings are simply "
				+ "there, complete — no animation at all.");
		});
	},
});
