import { div } from "/app.js";
import { Deck, region, quiet, col, statement, wall, list, stage, notes, stack, arrows } from "../deck.js";

const here = new URL(".", import.meta.url).pathname;

/* A REAL DECK — six slides about the framework, built from the cuts that earned keeping.

   Every slide is `full`, so the grain is SWAP; the strip under each one is redrawn
   identically and reads as persistent (doc/decisions.md). Arrows, a click anywhere and
   Back all move it, and every slide is a url you can open cold and land on.

   Container: /imagine/'s column row, one `full` screen per slide. Size: the whole row —
   3440 at 3440, 1920 at 1920, bands at 400. Own layout: one cut per slide, named in the
   comment above it. Regions: 1 to 4. Preview: the six cuts, in order. */

const SLIDES = [
	{
		name: "one", title: "Cover",
		// One region. A cover has nothing to be beside.
		build(){
			region(100, () => statement("lew42", "No build.",
				"A web framework whose source is what ships. Native ES modules, real .js urls, a static site — open the file you are looking at and it is the file that ran."));
		},
	},
	{
		name: "two", title: "Pages",
		// 61.8 / 38.2 — a claim and the thing it is a claim about.
		build(){
			region(61.8, () => statement("One", "Pages are navigation",
				"The page tree is the url tree. There is no route table and nothing crawls the filesystem: a page exists the moment its parent names it."));

			quiet(38.2, () => stack(() => {
				list([
					{ name: "/framework/", note: "children: core ext styles ui web" },
					{ name: "/framework/core/", note: "children: App Page Router View" },
					{ name: "/framework/core/Page/", note: "children: overview doc" },
					{ name: "/framework/core/Page/doc/", note: "the detail, one topic each" },
				]);

				notes(null, ["Four directories, four urls, and the nav rail wrote itself."]);
			}));
		},
	},
	{
		name: "three", title: "The row",
		// 20 / 60 / 20 — the cut this lab found is the best use of a 3440.
		build(){
			quiet(20, () => stack(() => {
				div.c("decks-eyebrow", "Six words");
				list([
					{ name: "small" }, { name: "hug" }, { name: "large" },
					{ name: "fill" }, { name: "full" },
				]);
			}));

			region(60, () => statement("Two", "One row of columns",
				"Call columns() on a page and every page beneath it becomes a full-height column that opens to the right of its parent. One word per page decides how much room it takes."));

			quiet(20, () => notes(null, [
				"`full` **replaces** — its ancestors fold into the crumb strip.",
				"`fill` **joins** — the columns left divide the row.",
				"Those two words are the whole of a full-screen experience.",
			]));
		},
	},
	{
		name: "four", title: "Generated",
		// 50 / 50 — a claim and its evidence, which is a real pair.
		build(){
			region(100, () => statement("Three", "Layouts, generated",
				"The arrangements are drawn from rules rather than written one at a time. Change a rule and every seed redraws against it, so a layout finding lands everywhere at once."));

			quiet(100, () => wall([
				{ k: "seed", name: "Golden", note: "61.8 / 38.2 — a lead and its support." },
				{ k: "seed", name: "Poster", note: "20 / 60 / 20 — rails and a middle." },
				{ k: "seed", name: "Aside", note: "70 / 30 — a stage and its notes." },
				{ k: "seed", name: "Quad", note: "2 × 2 — four peers, one accent." },
			]));
		},
	},
	{
		name: "five", title: "Urls",
		// 70 / 30 — a figure, and the aside that earns its width with prose.
		build(){
			region(70, () => stage("Every slide in this deck is an address. This one is /imagine/decks/pitch/five/.",
				() => div.c("decks-bars", () => [30, 45, 60, 75, 90, 75, 60, 45, 30].forEach(h =>
					div.c("decks-bar").style("height", h + "%")))));

			quiet(30, () => notes("Nothing was written to make this true", [
				"Reload on slide five and you are still on slide five. A carousel holding its index in memory cannot say that.",
				"Back walks the deck backwards, because every advance was a navigation.",
				"The crumb strip above says where you are, and it is the way out.",
			]));
		},
	},
	{
		name: "six", title: "Cost",
		// 2 × 2 — four claims with no order, one of them carrying the accent.
		build(){
			col(50, () => {
				region(100, () => statement("Four", "What it costs",
					"Nothing to install, nothing to compile, nothing to run in production."));
				quiet(100, () => notes("No build step", [
					"`public/` is served as it is written. An import is a real url, and the browser resolves it.",
				]));
			});

			col(50, () => {
				quiet(100, () => notes("No server", [
					"Production is static files. `Server/` exists so a dev machine can watch and reload.",
				]));
				quiet(100, () => notes("No dependencies", [
					"`npx` and global tools only. Nothing is installed into the site, so nothing can rot in it.",
				]));
			});
		},
	},
];

const ring = SLIDES.map((s, i) => ({ name: s.name, label: (i + 1) + " · " + s.title, to: here + s.name + "/" }));

export default new Deck({
	meta: import.meta,
	title: "The pitch",
	description: "Six slides about the framework — the deck the lab was for.",
	icon: "campaign",
	group: "The deck",
	// Three of the six, not all six: at a card's width a sixth frame is 40px and says
	// nothing. The cover, the widest cut, and the close.

	width: "full",
	index: true,

	...arrows,
	next: ring[1].to,

	// Never seen — the `default` slide covers it. The fallback if that stops being true.
	content(){ SLIDES[0].build(); },

	children: SLIDES.map((slide, i) => new Deck({
		name: slide.name,
		title: slide.title,
		width: "full",
		classes: i ? null : "default",
		ring,
		advance: true,
		...arrows,
		prev: i ? ring[i - 1].to : null,
		next: ring[i + 1]?.to ?? null,
		content: slide.build,
	})),
});
