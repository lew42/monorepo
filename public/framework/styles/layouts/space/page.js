import { Doc, div, span, button, input, textarea, icon, md, h2 } from "/app.js";
import { rate } from "/framework/ext/LayoutTool/taste/taste.js";
import { ruler } from "./ruler.js";
import { render } from "./spec.js";
import { gen } from "./gen.js";
import { PRESETS } from "./presets.js";

const SEEDS = 12;
const MAX = 10;

export default new Doc({
	meta: import.meta,
	title: "Space",
	label: "Layout space",
	description: "A layout is a string. Type one and see it on five screens at once, or take an integer and get one.",
	icon: "travel_explore",
	group: "Instrument",

	children: "words compose hunt",
	notes: "syntax",
	files: "page.js spec.js gen.js model.js draw.js search.js presets.js ruler.js space.css readme.md",

	seed: 7,      // the lab's current point, and the card's
	depth: 3,     // the MAX nesting depth; each section draws its own below it (gen.js)
	chaos: 0.2,   // 0 is strictly the model, 1 is uniform noise (draw.js)
	from: 100,    // the wall's first tile

	// One object, so the two dials reach the generator through exactly one path.
	dialled(){ return { depth: this.depth, chaos: this.chaos }; },

	preview(nav){
		return this.preview_card(nav, () =>
			div.c("zoom-25", () => render(gen(this.seed, this.dialled())).style("height", "42em")));
	},

	content(){

		md("**Every layout in this rail is the same tree** — a nest of class strings whose leaves call parts of one `site` object. Nothing else differs between two of them. So a layout is not code, it is a *string*, and the sixteen directories beside this page are sixteen samples of a space that does not end.");

		md("Here it is as text. Indentation is nesting, a line is `<class tokens> > <part>`, and the whole of [Docs](/framework/styles/layouts/docs/) is six of them. Edit it — and underneath, the same string is live on **five screens at once**, in one row and at one scale: 390×844, 720×1024, 1280×800, 1920×1080 and 3440×1440. A drag shows one width at a time; the whole curve is the question a layout is actually asked.");

		this.lab();

		md("A screen is a width **and** a height, because a `fill` page with no height has nothing to divide and its `scroll` regions never engage. One scale for all five is what makes them comparable — a card 200px wide on the 1280 screen is 200px wide on the 3440 one.");

		h2("Two dials: how deep, and how far off the model");

		md("**`depth` is a ceiling, not a count.** Every top-level section draws *its own* depth from 0 to it, so one dial gives a page of flat bands, a page of deep nests, or the uneven mix most real pages actually are. Blocks are painted with `tone` — a **translucent** ground, so two boxes deep composites darker than one and the nesting can be read at a glance. A section declares one colour and its subtree inherits it, which makes a scheme rather than a rainbow — and the colours are the site's own tokens now, not invented hues.");

		md("**`chaos` is the distance from the model.** At 0 the generator draws strictly from [`model.js`](/framework/styles/layouts/space/): the nine shapes the rail is actually built from, a part only in a role it belongs to, and every size inside the band [the rulebook](/framework/ext/LayoutTool/taste/) asks for. At 1 it is uniform over everything the format can say — a `footer` in a rail, a fixed measure on a nav — which is where this generator was before it had a model at all. The interesting rolls are in between.");

		md("Under the five screens is what [`ext/LayoutTool`'s taste tier](/framework/ext/LayoutTool/taste/) makes of each one. It is not the `analyze()` score: that says whether a layout is *broken*, and two clean rolls both score 100, which cannot rank anything. This one rates eleven ideal ranges — measure, padding as a share of its box, gap, alignment, repetition, how much of the width got spent — so a roll can be better than another roll. Hover a grade for its three weakest bands. **[Hunt](hunt/) is that turned into a search**: a hundred rolls, ranked by their worst width, and a read-back of which draws the good ones had in common.");

		h2("Twelve at once");

		md("An integer is an **address**. `gen(n, depth)` is the same layout forever, in any browser, so a point in this space is a link rather than a directory — and the space can be sampled instead of authored. Click a tile to open it in the lab, or open [Compose](compose/) to get the same roll as **real panels**, where any one section rerolls on its own.");

		this.wall();

		h2("The format");

		md("Two tokens, and everything else is a word: **`flex gap wrap flex-1`** are class tokens — the [layout words](words/), verbatim — and **`> sections 5`** is a part of the shared `site` object with its count. A token holding a `:` is a declaration rather than a class (`--basis:15em`), which is how per-layout state stays inline exactly as the hand-written pages keep it.");

		md("**[Words](words/)** is the full list with a picture beside each one; **[Syntax](docs/syntax/)** is the format itself, in one page. The parts are `topbar toolbar brand hero menu toc sections cards rows tiles notes footer` — [`web.js`](/framework/styles/layouts/), unchanged, the same object every page in this rail draws.");

		md("**`scroll`, `stick` and `fluid` are this format's own three words**, expanded in `spec.js` rather than in `framework.css`. The first two are the layouts readme's own traps; the third has no utility at all, and `presets.js` uses it nine times. Promoting any of them is a proposal and it is Mike's call — the argument is in the readme.");

		md.details(import.meta, "readme.md", "Design record — why a layout became a string, and what it does not replace");

		md("How this page happened — the ask verbatim, the finding, the night's log: [layout-space](/framework/ai/2026-08-14/layout-space/), [improve-space-page](/framework/ai/2026-08-16/improve-space-page/).");
	},

	/* The instrument: the controls ABOVE, the ruler underneath at full bleed, and the
	   spec in the url hash — so any point in the space is a link, and a reload lands
	   on it. It was a text panel BESIDE a column of shots, and the five screens could
	   not be seen at once; that column is what this shape undoes. */
	lab(){
		const $lab = div.c("bleed flex v gap", () => {

			div.c("space-bar flex gap wrap", () => {
				this.$text = textarea.c("space-text").attr("spellcheck", "false").on("input", () => this.paint());
				this.dials();
			});

			this.shots = ruler();

			// The same five screens, rated. Under the row, so the curve and the
			// numbers for it are read in one glance.
			this.$grades = div.c("space-marks flex gap wrap v-center").style("--gap", "1.4em");
		});

		this.show(this.landed() ?? PRESETS.document);
		this.dial();

		return $lab;
	},

	// Three controls, one column: where in the space, how much of it, and nine places
	// worth starting from.
	dials(){
		return div.c("space-dials flex v gap", () => {

			div.c("flex gap wrap v-center", () => {
				button(() => icon("chevron_left")).click(() => this.open(this.seed - 1));
				this.$seed = span.c("space-tag muted", "seed " + this.seed);
				button(() => icon("chevron_right")).click(() => this.open(this.seed + 1));
				button(() => icon("casino")).click(() => this.open(Math.floor(Math.random() * 1e6)));
			}).style("--gap", "0.4em");

			div.c("flex gap v-center", () => {
				span.c("space-tag muted", "depth");
				// ⚠ `attr()` is (name, value) — it takes no object, and an object argument
				//   is a silent read rather than a write.
				this.$depth = input.c("space-depth")
					.attr("type", "range").attr("min", "0").attr("max", String(MAX))
					.attr("value", String(this.depth))
					.on("input", () => this.level({ depth: +this.$depth.el.value }))
					.on("change", () => this.tiles(this.from));
				this.$note = span.c("space-tag muted");
			}).style("--gap", "0.5em");

			/* The distance from the model. Left is `model.js` exactly — the shapes,
			   roles and size bands the rulebook asks for; right is uniform over
			   everything the format can say, which is where the generator was before
			   there was a model at all. */
			div.c("flex gap v-center", () => {
				span.c("space-tag muted", "chaos");
				this.$chaos = input.c("space-depth")
					.attr("type", "range").attr("min", "0").attr("max", "100")
					.attr("value", String(Math.round(this.chaos * 100)))
					.on("input", () => this.level({ chaos: +this.$chaos.el.value / 100 }))
					.on("change", () => this.tiles(this.from));
				this.$chaos_note = span.c("space-tag muted");
			}).style("--gap", "0.5em");

			div.c("grid gap auto", () => Object.keys(PRESETS).forEach(name =>
				button(name).attr("title", "the " + name + " layout, as a string").click(() => this.show(PRESETS[name]))))
				.style({ "--column": "8.5em", "--gap": "0.4em" });
		});
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

		const marks = [];

		this.$tiles.empty(() => {
			for (let i = 0; i < SEEDS; i++){
				const seed = from + i;

				div.c("space-seed surface", () => {
					div.c("zoom-25", $box => marks.push([seed, $box,
						render(gen(seed, this.dialled())).style("height", "44em")]));
					marks.at(-1).push(span.c("space-seed-grade"));
				})
					.attr("data-layout-ignore", "")
					.click(() => this.open(seed));
			}
		});

		this.mark(marks);
	},

	/* Every tile carries its own grade, so the wall is browsable BY QUALITY rather
	   than only by seed — twelve pictures and twelve numbers is the fastest way into
	   a space that does not end.
	   ⚠ On a timer, after the whole wall is placed. `rate()` reads geometry, so
	     measuring a tile inside the loop that builds it measures the tile before its
	     neighbours exist. `zoom-25` is a real layout at four times the tile's width,
	     which is why one number per tile is worth having at all. */
	mark(marks){
		clearTimeout(this.wall_clock);
		this.wall_clock = setTimeout(() => marks.forEach(([seed, , $page, $grade]) => {
			const r = rate($page.el, { ignore: null });

			$grade.text(r.grade + " " + r.score);
			$page.el.parentElement.parentElement.setAttribute("title",
				`seed ${seed} — ${r.grade} ${r.score}\n` + r.weakest.map(b => `${b.id} ${Math.round(b.credit * 100)}%`).join("\n"));
		}), 300);
	},

	/* ⚠ A range fires `input` once per pixel of travel, and one fire regenerates five
	     shots. Coalesced to one a frame — the wall is heavier still, so it rides
	     `change` (pointer release) instead. */
	level(moved){
		Object.assign(this, moved);
		this.dial();

		cancelAnimationFrame(this.raf);
		this.raf = requestAnimationFrame(() => this.show(gen(this.seed, this.dialled())));
	},

	// What the dials say about themselves. `max` because depth is a ceiling, not a
	// count: every section draws its own from 0 to it.
	dial(){
		this.$note.text(this.depth === 0 ? "flat — every section is one box" : "max " + this.depth);
		this.$depth.el.value = this.depth;

		this.$chaos_note.text(this.chaos === 0 ? "on the model"
			: this.chaos >= 0.99 ? "uniform — anything, anywhere" : Math.round(this.chaos * 100) + "% off-model");
		this.$chaos.el.value = Math.round(this.chaos * 100);
	},

	paint(){
		this.shots.draw(this.$text.el.value);
		this.address(this.$text.el.value);
		this.grade();
	},

	/* The five shots, rated. `taste.rate()` is what turns this page from a sampler
	   into a search: `analyze()` says whether a layout is broken and both of two
	   clean rolls score 100, which cannot rank anything.
	   ⚠ Debounced, and deferred a frame. A keystroke redraws five whole pages, and a
	     rate() run inside `draw()` measures a layout the browser has not laid out.
	   ⚠ `ignore: null` — every shot is inside the row's `data-layout-ignore`, which
	     `probe` honours on the ROOT as well, so the default would read zero nodes. */
	grade(){
		clearTimeout(this.clock);
		this.clock = setTimeout(() => this.$grades.empty(() => this.shots.shots.forEach(shot => {
			const page = shot.$view.el.firstElementChild;
			if (!page) return;

			const r = rate(page, { ignore: null });

			span.c("space-mark", () => {
				span.c("space-tag muted", shot.width);
				span.c("space-grade", r.grade + " " + r.score);
			}).attr("title", r.weakest.map(b => `${b.id} ${(+b.value).toFixed(2)} — ${Math.round(b.credit * 100)}%`).join("\n"));
		})), 220);
	},

	show(text){
		this.$text.el.value = text;
		this.paint();
	},

	// One door, for the stepper, the dice, the depth dial and every tile on the wall.
	open(seed){
		this.$seed.text("seed " + (this.seed = seed));
		this.dial();
		this.show(gen(seed, this.dialled()));
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
