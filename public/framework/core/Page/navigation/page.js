import { Page, md, h2, img } from "/app.js";
import { section } from "../../../ux/Content/structure/Structure.js";

/* Navigation — the owner's own words, 2026-09-29: "having multiple levels of
   navigation gets tricky... it gets pretty ridiculous pretty quick," and "is there
   persistent navigation? that's really the biggest question."

   Nothing here is a new mechanism. Every section links to a real page that already
   answers the question, most of it already measured with real pixels
   (`/imagine/paging/navigation/`). This page's only job is to say the rule in one
   sentence and point at the proof — the `core/Page/layout/page.js` model.

   1 CONTAINER  the standard column — this is a README, not a demo.
   2 SIZE       standard width; the screenshot below is the one wide thing.
   3 OWN LAYOUT a tile wall, then one heading + a few lines per concept, in the
                order they matter: persistent-vs-switching first (the owner named
                it "the biggest question"), then the levels, then the go-to
                pattern, then the alternatives.
   4 REGIONS    none — plain content flow.
   5 PREVIEW    core's default card off `description` below. */

const here = new URL(".", import.meta.url).pathname;

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "Persistent vs switching, the levels that stack, the go-to pattern, and the alternatives.",
	icon: "route",

	content(){
		md("**One question decides almost everything below: when you click, does the thing you were already looking at move?**");

		section({
			title: "Core concepts", bg: true, items: [
				{ name: "Persistent vs switching", icon: "menu_open", weight: 3, href: "/imagine/paging/navigation/" },
				{ name: "Levels that stack", icon: "layers", weight: 2, href: "/framework/core/Page/api/" },
				{ name: "The go-to: class-doc tabs", icon: "tab", weight: 2, href: "/framework/ext/Doc/" },
				{ name: "Alternatives", icon: "alt_route", weight: 2, href: "/layouts/explorer/" },
			],
		});

		h2("1. Persistent vs switching");
		md("**The rule the owner decided: persistent navigation stays exactly where it is.** A rail, a header, a crumb strip — pick one and it never moves, not by a pixel, no matter what gets clicked. *Switching* is the other option: the whole screen replaces itself. That's fine too — it's an accepted pattern, not a compromise — but a switch that visibly jumps, shifts, or makes something disappear when it shouldn't is a bug, not a lesser version of switching. Smooth animated transitions between switches are a future goal, not a requirement today.");

		md("This site already measured the same idea and gave it two names, in [`/imagine/paging/navigation/`](/imagine/paging/navigation/): **stable** (0px moved — a persistent element) and **dynamic** (something moved — usually a bug to fix, not a style choice). The map: the owner's *persistent* = *stable*; the owner's *switching*, done right, still reads as *stable* on the outside even though everything inside changed.");

		md("**Proof, not a promise** — four real mechanisms, each driven headless at 1280 and 3440 and measured at 0px sideways and 0px vertical drift:");

		section({
			bg: false, items: [
				{ name: "Fixed columns", icon: "view_column", weight: 1, href: "/imagine/paging/navigation/columns/" },
				{ name: "Reserved height", icon: "height", weight: 1, href: "/imagine/paging/navigation/reserved/" },
				{ name: "Reserved tabs", icon: "tab", weight: 1, href: "/imagine/paging/navigation/tabs/" },
				{ name: "Full-screen rail", icon: "vertical_split", weight: 1, href: "/imagine/paging/navigation/screen/" },
			],
		});

		md("A second, independent study puts the two options **head to head with the same four slides**: [Persistent](/imagine/decks/persist/) (a rail that never moves) vs. [Swap](/imagine/decks/swap/) (the whole screen replaces, and a thin label strip is what reads as \"nothing jumped\"). Neither wins outright — [`doc/prior-work.md`](/framework/core/Page/navigation/doc/prior-work.md) has the finding: *kinds that scale want swap, kinds that cap want the rail.*");

		h2("2. The levels that stack");
		md("**Navigation can stack up to four levels: a header, a left sidebar, top tabs, and an inner left sidebar.** Each one alone is simple. Stacked, the owner's own words: *\"it gets pretty ridiculous pretty quick.\"*");

		img().style({ border: "1px solid var(--line)", borderRadius: "0.4em", maxWidth: "100%", width: "auto" })
			.attr("src", here + "shots/levels-1920.png")
			.attr("alt", "A real page with all four levels: site header, left Sidebar, top tabs, and an inner left sidebar of API members");
		md("*All four levels on one real, live page — [`/framework/core/Page/api/`](/framework/core/Page/api/): the site **header** (top), the left **Sidebar** (the whole site's tree), **top tabs** (Overview · Make a page · Layout · Generator · API · …, this module's own sections), and an **inner left sidebar** (the API tab's own rail of properties and methods, one member at a time).*");

		md("**The rule: four is the ceiling.** Each level exists to narrow scope by exactly one step — the whole site, then this module, then this module's own sections, then one section's own members. A fifth level would have to narrow something new, and nothing on this site has needed one yet. [`doc/levels.md`](/framework/core/Page/navigation/doc/levels.md) has the reasoning and what to drop first when a page feels like too many.");

		h2("3. The go-to: class-doc top tabs (ext/Doc)");
		md("**Until something better exists, this is the default for any module with more than a page or two of its own: [`ext/Doc`](/framework/ext/Doc/).** A `Doc` page is a page whose own children ARE a left rail of top tabs — Overview, API, Docs, Files, and anything else the module needs — two real levels deep, and every tab is its own url (never a button that flips a class). This module's own page, [`/framework/core/Page/`](/framework/core/Page/), is a live example: click through Make a page, Layout, Generator, API and Docs, and the address bar changes every time.");

		md("**How to use it** — a handful of named lists, most of it optional:\n```js\nexport default new Doc({\n    meta: import.meta,\n    title: \"View\",\n    subject: View,                     // a class, a function, a namespace — or omit it\n    methods:    \"append ac on style\",  // API tab      + doc/method/<name>.md\n    properties: \"el capture\",          // API tab      + doc/property/<name>.md\n    notes:      \"capturing decisions\", // Docs tab     = doc/<name>.md\n    files:      \"View.js View.css\",    // Files tab    + doc/file/<path>.md\n    overview:   \"demos\",               // Overview's rail — overview/<name>/page.js\n    children:   \"guide\",               // a top tab of its own — guide/page.js\n    content(){ /* the overview */ },\n});\n```\nFull word list: [`ext/Doc`'s own readme](/framework/ext/Doc/readme.md).");

		h2("4. The alternatives");
		md("Each one exists and runs today. Pick class-doc tabs first; reach for one of these only when its own shape fits better than a flat rail of tabs.");

		md(`| alternative | demo | pick it when |
|---|---|---|
| **Miller columns** | [core/Page/overview/columns/](/framework/core/Page/overview/columns/) | the reader is drilling into a tree (a file browser, a nested catalog) and wants every level's siblings to stay visible at once |
| **Workspace, contextual swapping sidebars** | [/layouts/explorer/](/layouts/explorer/) | the RIGHT content should decide what the LEFT rail shows next — the owner's own words: "the right sidebar becomes the left... the currently selected one becomes the main view" |
| **Full-screen switch (screens lab)** | [/layouts/labs/screens/](/layouts/labs/screens/) | the content wants the whole screen and switches are rare enough that a thin persistent strip is all the "nav" it needs; learn the two words first (\`full\` replaces, \`fill\` joins) |
| **Persistent rail vs. full swap, head to head** | [/imagine/decks/persist/](/imagine/decks/persist/) vs [/imagine/decks/swap/](/imagine/decks/swap/) | undecided between the two — this is the same four slides built both ways, with the finding written down |
| **Contextual right rail (a second surface)** | [ext/drawer](/framework/ext/drawer/) | the main content needs a persistent SECOND nav surface next to the main Sidebar (properties, AI, settings) that pushes the page rather than covering it |
| **The configurable prototype** | [/imagine/paging/](/imagine/paging/) | trying combinations before committing — a rail-or-tabs word plus five other words, all in the url |`);

		md("More prior work, all the rows the inventory found: [`doc/prior-work.md`](/framework/core/Page/navigation/doc/prior-work.md).");
	},
});
