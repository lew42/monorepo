import { Page, md, demo, code, h2, div, p, icon } from "/app.js";
import card from "./gallery.js";

export default new Page({
	meta: import.meta,
	title: "Gallery",
	description: "A preview card with a live render in it — one module, three indexes.",
	icon: "photo_library",

	content(){

		demo(() => {
			card({ url: "#", label: "A live render", icon: "widgets" }, () => {
				div.c("pad flex v gap", () => {
					icon("dashboard");
					p("Whatever renders here — a layout, a component, a section.");
				});
			}, "zoom-50");
		}, "`card(nav, thumb, classes?)` — `nav` is exactly what `Page.nav_for(name)` returns, `thumb` is a render function run while the thumbnail captures. Layouts, components and sections each pass their own.");

		md("Three indexes hand-rolled this markup before this module existed — same classes, three copies, and the `.gallery-*` rules sitting in `Page.css`, which never emitted them. One emitting module is what makes the class names ownable.");

		h2("`wall()` — and never `bleed`");

		code.js(`wall(() => this.children.forEach((page, name) =>
    page?.layout && card(this.nav_for(name), () => page.layout())))
    .style({ "--column": "18em", "--thumb-min": "3.5em", "--thumb-max": "15em" });`);

		md("The three indexes each wrote their own class string for the grid, and one of them reached for **`bleed`** to get more room — which takes the page's own inset too, so the left-hand cards ended up flush against the sidebar. `wall()` picks **`wide`** once, here, and no index can spend the gutter by choosing a different word.");

		md("The cells come off **`children`**, which auto-imports, so a thumbnail is the child page's own render — [Layouts](/framework/styles/layouts/) calls `page.layout()`. There is no second list of what to draw: a child that can draw itself gets a card.");

		h2("A cell is as tall as what it shows");

		md("The thumb takes its render's natural height, between **`--thumb-min`** and **`--thumb-max`**. That is the whole sizing system, and it is why no page declares a height.");

		md("It replaced `aspect-ratio: 16 / 10` — one number for nineteen unrelated shapes, so a two-line badge row and a five-row timeline got the same box: most of the wall was blank, and the one genuinely tall render was cropped. Four pages had already declared `card: \"tall\"` to buy a second row of the same wrong box. The range is what the ratio was approximating: the floor keeps a one-liner from rendering as a sliver, the ceiling evens the rows and does the cropping.");

		md("Two exceptions survive, and both are declared on the page they belong to — `card: \"tall\"` doubles the ceiling for a render that only reads whole, `card: \"wide\"` takes a second column. `nav_for()` carries the word here exactly like `icon`, and it arrives as `.gallery-tall` / `.gallery-wide` — this module's classes, so the words mean what this module says.");

		h2("Why the thumbnail is inert");

		md("A live render inside a card that is itself a link would be an `<a>` in an `<a>` — invalid HTML, and the browser un-nests it silently. `pointer-events: none` on the thumb is what keeps the card a plain `div`; the label below is the only real link, and its `::after` covers the whole card so the hit area is the card, not just the text.");

		h2("`checkered` — the floor");

		md("Every thumb sits on the checkered board (`framework.css`, `@layer util`) before anything renders on top of it — so a component that paints no background of its own reads as unpainted rather than borrowing the card's white. It started as a one-off in `ext/demo/`; this is its second consumer, which is what promoted it into the substrate.");

		md("Next: [Layouts](/framework/styles/layouts/) — the first of the three indexes that draws this card.");
	}
});
