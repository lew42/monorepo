import { Page, div, span, button, textarea, icon, md, h2 } from "/app.js";
import { ruler } from "./ruler.js";
import { render } from "./spec.js";
import { gen } from "./gen.js";

/* Four starting points, as text — four of the shapes the rail spends a directory
   each on. A preset is a string here, because that is the whole claim. */
const PRESETS = {
	docs: `full fill flex v
  > topbar
  flex gap wrap flex-1 scroll
    basis pad --basis:15em > menu
    pad flow fluid > sections 5
    basis pad --basis:13em stick > toc
  > footer`,

	mail: `full fill flex v
  > toolbar
  flex gap flex-1 scroll
    basis pad scroll --basis:14em > menu
    basis pad scroll --basis:22em > rows 10
    pad flow fluid scroll > sections 4`,

	landing: `full fill flex v
  > topbar
  flex v flex-1 scroll
    > hero
    pad > cards 6
    pad > tiles 12
  > footer`,

	wall: `full fill flex v
  > toolbar
  flex gap wrap flex-1 scroll
    basis pad --basis:13em > menu
    pad fluid > cards 12`,
};

const SEEDS = 12;

export default new Page({
	meta: import.meta,
	title: "Space",
	label: "Layout space",
	description: "A layout is a string. Type one and see it at five widths, or take an integer and get one.",
	icon: "travel_explore",
	group: "Instrument",

	seed: 7,     // the lab's current point, and the card's
	from: 100,   // the wall's first tile

	preview(nav){
		return this.preview_card(nav, () =>
			div.c("zoom-25", () => render(gen(this.seed)).style("height", "42em")));
	},

	content(){

		md("**Every layout in this rail is the same tree** — a nest of class strings whose leaves call parts of one `site` object. Nothing else differs between two of them. So a layout is not code, it is a *string*, and the sixteen directories beside this page are sixteen samples of a space that does not end.");

		md("Here it is as text. Indentation is nesting, a line is `<class tokens> > <part>`, and the whole of [Docs](/framework/styles/layouts/docs/) is six of them. Edit it:");

		this.lab();

		md("Beside it is the **ruler** — the same string live on five screens **at once**: 390×844, 720×1024, 1280×800, 1920×1080 and 3440×1440, each fitted to the room it has and never magnified past 1:1. A drag shows one width at a time; the whole curve is the question a layout is actually asked. A screen is a width *and* a height, because a `fill` page with no height has nothing to divide and its `scroll` regions never engage.");

		h2("Twelve at once");

		md("An integer is an **address**. `gen(n)` is the same layout forever, in any browser, so a point in this space is a link rather than a directory — and the space can be sampled instead of authored. Click a tile to open it in the lab.");

		this.wall();

		h2("The format");

		md("| | |\n|---|---|\n"
			+ "| `flex gap wrap flex-1` | class tokens — the [layout words](/framework/styles/layouts/flex/), verbatim |\n"
			+ "| `--basis:15em` | a token holding a `:` is a declaration, not a class. `_` reads as a space |\n"
			+ "| `> sections 5` | a part of the shared `site` object, and its count |\n"
			+ "| `scroll` `stick` `fluid` | three declaration sets that fail silently, one word each |");

		md("The parts are `topbar toolbar brand hero menu toc sections cards rows tiles footer` — [`web.js`](/framework/styles/layouts/), unchanged, the same object every page in this rail draws.");

		md("`scroll` is `min-height: 0; overflow-y: auto` and belongs to the **row**, not to a panel inside it. `stick` is `position: sticky; top: 0; align-self: flex-start` — a stretched rail has nothing to stick to. Both are the layouts readme's own traps.");

		md("**`fluid` is the third, and it has no utility at all.** `.flex-1` is `flex: 1 1 0%`, so a fluid track in a *wrapping* row shrinks to nothing rather than pushing its neighbours onto the next line — swap `fluid` for `flex-1` above and watch the article go one letter wide at 390. Every hand-written layout in this rail writes `flex: 1 1 24em` inline for exactly this reason, which is the argument for promoting it. All three expand in `spec.js` rather than in `framework.css`: they are this format's vocabulary until that call is made.");

		md.details(import.meta, "readme.md", "Design record — why a layout became a string, and what it does not replace");
	},

	/* The instrument: the text on the left, the ruler on the right, and the spec in the
	   url hash — so any point in the space is a link, and a reload lands on it. */
	lab(){
		const $lab = div.c("space bleed flex gap wrap", () => {

			div.c("space-panel flex v gap", () => {

				div.c("flex gap wrap v-center", () => {
					button(() => icon("chevron_left")).click(() => this.open(this.seed - 1));
					this.$seed = span.c("space-tag muted", "seed " + this.seed);
					button(() => icon("chevron_right")).click(() => this.open(this.seed + 1));
					button(() => icon("casino")).click(() => this.open(Math.floor(Math.random() * 1e6)));
				}).style("--gap", "0.4em");

				this.$text = textarea.c("space-text").attr("spellcheck", "false").on("input", () => this.paint());

				div.c("flex gap wrap", () => Object.keys(PRESETS).forEach(name =>
					button(name).click(() => this.show(PRESETS[name])))).style("--gap", "0.4em");

			});

			div.c("space-out", () => { this.shots = ruler(); });
		});

		this.show(this.landed() ?? PRESETS.docs);

		return $lab;
	},

	// Twelve seeds as a wall — the scan a stepper cannot be. `zoom-25`, so a tile is a
	// whole 68em layout and nothing has to be measured to draw one.
	wall(){
		const $wall = div.c("space-wall bleed flex v gap", () => {

			// ⚠ The marker goes on the WALL, not only on each tile: ext/LayoutTool reads a
			//   container's text from its descendants, so the grid itself reported 110
			//   characters a line — of `site` prose, at quarter size, inside the tiles.
			this.$tiles = div.c("grid gap auto")
				.style("--column", "17em")
				.attr("data-layout-ignore", "");

			div.c("flex gap wrap v-center", () => {
				button("next twelve").click(() => this.tiles(this.from + SEEDS));
				button("back").click(() => this.tiles(Math.max(0, this.from - SEEDS)));
				this.$range = span.c("space-tag muted");
			}).style("--gap", "0.4em");
		});

		this.tiles(this.from);

		return $wall;
	},

	tiles(from){
		this.from = from;
		this.$range.text("seeds " + from + "–" + (from + SEEDS - 1));

		this.$tiles.empty(() => {
			for (let i = 0; i < SEEDS; i++){
				const seed = from + i;

				div.c("space-seed surface", () => div.c("zoom-25", () =>
					render(gen(seed)).style("height", "44em")))
					.attr("title", "seed " + seed)
					.attr("data-layout-ignore", "")
					.click(() => this.open(seed));
			}
		});
	},

	paint(){
		this.shots.draw(this.$text.el.value);
		this.address(this.$text.el.value);
	},

	show(text){
		this.$text.el.value = text;
		this.paint();
	},

	// One door, for the stepper, the dice and every tile on the wall.
	open(seed){
		this.$seed.text("seed " + (this.seed = seed));
		this.show(gen(seed));
		this.$text.el.scrollIntoView({ block: "nearest" });
	},

	/* ⚠ replaceState, debounced: this is written on every keystroke and Safari rate-limits
	     the history api. It never fires popstate, so the Router is untouched. */
	address(text){
		clearTimeout(this.timer);
		this.timer = setTimeout(() =>
			history.replaceState({}, "", location.pathname + "#" + encodeURIComponent(text)), 400);
	},

	landed(){
		try { return location.hash.length > 1 ? decodeURIComponent(location.hash.slice(1)) : null; }
		catch { return null; }
	},
});
