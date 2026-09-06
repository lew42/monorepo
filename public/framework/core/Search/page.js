import { Doc, md, h2, div, span, button } from "/app.js";

/* Container: the framework docs shell — rail + one prose column, `--measure`.
   Size: prose width at every screen; the control band rides the same measure.
   Own layout: `.flow` prose, one surface band, one table. Regions: Doc's tabs.
   Preview: the default card, icon `search`. */

export default new Doc({
	meta: import.meta,
	title: "Search",
	description: "The site's corpus and the one search box over it — press / anywhere.",
	icon: "search",

	files: "Search.js Omnibox.js Search.css tags.js page.js readme.md",
	notes: "decisions corpus filters",

	content(){
		// `this.app` while the page is rendering — the band's callbacks run later,
		// so they close over it rather than looking it up when they fire.
		const app = this.app;

		// The thing itself is already on this page — it is the box at the bottom of
		// the window. So the page opens with the two controls that drive it, not with
		// a paragraph about them. Not a `demo()`: there is no code worth reading, and
		// the code pane would push both buttons below the fold.
		div.c("surface pad flex v gap", () => {
			let $stats;

			div.c("flex gap wrap v-center", () => {
				button.c("btn prim", "Open the search box").click(() => app.omnibox.open());
				button.c("btn", "Read the site now").click(function(){ read(this, app.omnibox.search, $stats); });
			});

			$stats = span.c("muted", "The corpus is read the first time anybody searches — never on a page load.");
		});

		md("**That box is the site's search** — one of it, on every page, put there by a single line in `app.js`. **Press `/`** when you are not already typing, or `Ctrl`/`Cmd` `K`. Type three letters and it fills with cards; the arrow keys walk them and Enter opens one. `Esc` closes it, and the small **⇧** button moves the whole box to the top of the window and remembers that you did.");

		md("**The corpus is the Router's own walk.** Every row was produced by `Page.load()` — the exact call that runs when you navigate — so a result can never promise a url the Router then fails to open. Reading all of them is about a second, once per tab. [How it is counted](/framework/core/Search/doc/corpus/).");

		h2("How a result gets to the top");

		md(`Six tiers, best first. The whole rule is: **the title answers if it can, and only a title
that says nothing lets the description answer.**

| | a row wins this tier when… | typing \`page\` finds |
|---|---|---|
| 1 | the title **is** what you typed | **Page** |
| 2 | the title **starts with** it | **Pager**, **Page columns** |
| 3 | a **word in** the title starts with it | **One page per url** |
| 4 | the title **contains** it | **Repaged** |
| 5 | the **description** contains it | *Router* — "url → which **page**s are showing" |
| 6 | (multi-word queries) **every word** is somewhere | \`page url\` finds both |

Ties inside a tier break on the shortest title, then the shallowest url, then a–z — so a
section beats a page buried three levels inside it. An **empty** query is not "no results": it
is the whole site, nearest the front door first, which makes the box a way to browse as well
as a way to search.`);

		h2("The chips narrow it");

		md("Under the field is a row of chips per **facet**, and none of them is on: no chip lit means *everything*, which is what \"filters default to all\" is, with no special case to write. Inside a group the chips are **or** — Framework *or* Imagine; between groups they are **and**. **Where** is the section a page lives in, and every page has one. The four groups after it are the [tag vocabulary](/imagine/design/vocabulary/)'s axes, read off a page's own `tags:` prop — no page declares one yet, so those four groups are not drawn. They appear on their own the day pages start carrying tags. [More](/framework/core/Search/doc/filters/).");

		md.details(import.meta, "readme.md", "Readme");
	},
});

// The live readout: build the corpus, report progress while it arrives, then the
// numbers. Nothing here builds anything until somebody presses the button.
function read($btn, search, $stats){
	const t0 = performance.now();

	$btn.text("reading…");

	search.build(() => $stats.text(`reading — ${search.read} / ${search.candidates}`))
		.then(s => {
			$btn.text("Read the site now");
			$stats.empty(() => {
				span(`${s.rows.length} pages`);
				span.c("muted", ` · from ${s.candidates} urls tried · ${Math.round(performance.now() - t0)} ms`);
			});
		});
}
