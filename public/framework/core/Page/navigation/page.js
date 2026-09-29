import { Page, md, h2, img, div, a, span, icon } from "/app.js";
import { section } from "../../../ux/Content/structure/Structure.js";

/* Navigation — the owner's own words, 2026-09-29: "having multiple levels of
   navigation gets tricky... it gets pretty ridiculous pretty quick," and "is there
   persistent navigation? that's really the biggest question." A later note, same
   day: "familiar structure — every concept gets an icon, a name and a one-line
   meaning, shown as a tile... pick the same icon for the same idea everywhere."

   Nothing here is a new mechanism. Every section links to a real page that already
   answers the question, most of it already measured with real pixels
   (`/imagine/paging/navigation/`). This page's only job is to say the rule in one
   sentence and point at the proof — the `core/Page/layout/page.js` model.

   1 CONTAINER  the standard column — this is a README, not a demo.
   2 SIZE       `width: "wide"` — the alternatives table and the levels screenshot
                are the two wide things on the page, so the page gets the room they
                need instead of a narrow reading column with 80% empty at 3440.
   3 OWN LAYOUT a tile wall (this page's own table of contents — each tile jumps to
                the matching heading below, it never leaves the page), then one
                heading + a few lines per concept, in the order they matter:
                persistent-vs-switching first (the owner named it "the biggest
                question"), then the levels, then the go-to pattern, then the
                alternatives.
   4 REGIONS    none — plain content flow.
   5 PREVIEW    core's default card off `description` below.

   ONE ICON PER IDEA, reused everywhere that idea shows up (not just the tile wall):
   PERSISTENT_ICON on every "this mechanism holds still" demo, SWITCHING_ICON on
   every "the whole screen replaces itself" demo — so a reader learns the icon once
   and recognizes the idea on sight from then on, on this page and its demo links. */

const PERSISTENT_ICON = "menu_open";   // a rail that stays — reused: the tile, all
                                        // four 0px-drift mechanisms, the persist deck.
const SWITCHING_ICON = "swap_horiz";   // the whole screen replaces — reused: the tile,
                                        // the swap deck, the screens-lab link.

const here = new URL(".", import.meta.url).pathname;

// A concept tile: icon, name, and the one-line meaning that makes the icon a label
// instead of a guess — the shared `iconCard` (ux/Content/structure) has no caption
// slot, so this small local builder adds one using only classes that already exist
// on the site: `.card` (background, border, its own padding — framework.css),
// `flex v gap-35` and `.muted` for the caption (same shape as `layouts/decide`'s
// own option cards) — no new CSS class.
function concept_tile(name, ic, meaning, href){
	return a.c("card flex v gap-35").href(href)
		.style({ textDecoration: "none", color: "var(--ink)" })   // a link that reads as a card, not underlined text — the same reset `.ux-content-icard` uses
		.append(() => {
			icon(ic).style({ fontSize: "2rem" });
			span(name).style({ fontWeight: "700" });
			span.c("muted", meaning);
		});
}

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "Persistent vs switching, the levels that stack, the go-to pattern, and the alternatives.",
	icon: "route",
	width: "wide",

	content(){
		md("**One question decides almost everything below: when you click, does the thing you were already looking at move?**");

		div.c("flex wrap gap-50", () => {
			concept_tile("Persistent vs switching", PERSISTENT_ICON, "A rail never moves; a switch replaces the whole screen — both are fine.", this.url + "#persistent");
			concept_tile("Levels that stack", "layers", "Header, sidebar, top tabs, inner sidebar — four deep, at most.", this.url + "#levels");
			concept_tile("The go-to: class-doc tabs", "tab", "ext/Doc: a page whose children are a left rail of top tabs.", this.url + "#goto");
			concept_tile("Alternatives", "alt_route", "Columns, a swapping workspace, a full-screen switch, a second rail.", this.url + "#alternatives");
		});

		h2("1. Persistent vs switching").attr("id", "persistent");
		md("**The rule the owner decided: persistent navigation stays exactly where it is.** A rail, a header, a crumb strip — pick one and it never moves, not by a pixel, no matter what gets clicked. *Switching* is the other option: the whole screen replaces itself. That's fine too — it's an accepted pattern, not a compromise — but a switch that visibly jumps, shifts, or makes something disappear when it shouldn't is a bug, not a lesser version of switching. Smooth animated transitions between switches are a future goal, not a requirement today.");

		md("This site already measured the same idea and gave it two names, in [`/imagine/paging/navigation/`](/imagine/paging/navigation/): **stable** (0px moved — a persistent element) and **dynamic** (something moved — usually a bug to fix, not a style choice). The map: the owner's *persistent* = *stable*; the owner's *switching*, done right, still reads as *stable* on the outside even though everything inside changed.");

		md("**Where the code lives** — each is its own page, and this page only links to them, it doesn't re-explain them: [`core/Sidebar`](/framework/core/Sidebar/) is the site's one persistent nav (a rail); [`ext/tabs`](/framework/ext/tabs/) is the switching half (swaps a panel in place); every click, either way, goes through [`core/Router`](/framework/core/Router/) (`page.open_link()` is the one hook a custom click handler must call to stay compatible).");

		md("**Proof, not a promise** — four real mechanisms, each driven headless at 1280 and 3440 and measured at 0px sideways and 0px vertical drift, all using the SAME icon because they're the same idea: nothing you're looking at moves:");

		section({
			bg: false, items: [
				{ name: "Fixed columns", icon: PERSISTENT_ICON, weight: 1, href: "/imagine/paging/navigation/columns/" },
				{ name: "Reserved height", icon: PERSISTENT_ICON, weight: 1, href: "/imagine/paging/navigation/reserved/" },
				{ name: "Reserved tabs", icon: PERSISTENT_ICON, weight: 1, href: "/imagine/paging/navigation/tabs/" },
				{ name: "Full-screen rail", icon: PERSISTENT_ICON, weight: 1, href: "/imagine/paging/navigation/screen/" },
			],
		});

		md("A second, independent study puts the two options **head to head with the same four slides**: [Persistent](/imagine/decks/persist/) (a rail that never moves) vs. [Swap](/imagine/decks/swap/) (the whole screen replaces, and a thin label strip is what reads as \"nothing jumped\"). Neither wins outright — [`doc/alternatives.md`](/framework/core/Page/navigation/md/doc/alternatives/) has the finding: *kinds that scale want swap, kinds that cap want the rail.*");

		h2("2. The levels that stack").attr("id", "levels");
		md("**Navigation can stack up to four levels: a header, a left sidebar, top tabs, and an inner left sidebar.** Each one alone is simple. Stacked, the owner's own words: *\"it gets pretty ridiculous pretty quick.\"*");

		img().style({ border: "1px solid var(--line)", borderRadius: "0.4em", maxWidth: "100%", width: "auto" })
			.attr("src", here + "shots/levels-1920.png")
			.attr("alt", "A real page with all four levels: site header, left Sidebar, top tabs, and an inner left sidebar of API members");
		md("*All four levels on one real, live page — [`/framework/core/Page/api/`](/framework/core/Page/api/): the site **header** (top), the left **Sidebar** (the whole site's tree), **top tabs** (Overview · Make a page · Layout · Generator · API · …, this module's own sections), and an **inner left sidebar** (the API tab's own rail of properties and methods, one member at a time).*");

		md("**The rule: four is the ceiling.** Each level exists to narrow scope by exactly one step — the whole site, then this module, then this module's own sections, then one section's own members. A fifth level would have to narrow something new, and nothing on this site has needed one yet. [`doc/levels.md`](/framework/core/Page/navigation/md/doc/levels/) has the reasoning and what to drop first when a page feels like too many.");

		h2("3. The go-to: class-doc top tabs (ext/Doc)").attr("id", "goto");
		md("**Until something better exists, this is the default for any module with more than a page or two of its own: [`ext/Doc`](/framework/ext/Doc/).** A `Doc` page is a page whose own children ARE a left rail of top tabs — Overview, API, Docs, Files, and anything else the module needs — two real levels deep, and every tab is its own url (never a button that flips a class). This module's own page, [`/framework/core/Page/`](/framework/core/Page/), is a live example: click through Make a page, Layout, Generator, API and Docs, and the address bar changes every time.");

		md("**How to use it**, in short — the full word list is [`ext/Doc`'s own readme](/framework/ext/Doc/readme.md):\n```js\nexport default new Doc({\n    meta: import.meta,\n    title: \"View\",\n    subject: View,                     // a class, a function, a namespace — or omit it\n    methods:    \"append ac on style\",  // API tab      + doc/method/<name>.md\n    properties: \"el capture\",          // API tab      + doc/property/<name>.md\n    notes:      \"capturing decisions\", // Docs tab     = doc/<name>.md\n    files:      \"View.js View.css\",    // Files tab    + doc/file/<path>.md\n    overview:   \"demos\",               // Overview's rail — overview/<name>/page.js\n    children:   \"guide\",               // a top tab of its own — guide/page.js\n    content(){ /* the overview */ },\n});\n```");

		h2("4. The alternatives").attr("id", "alternatives");
		md("Each one exists and runs today. Pick class-doc tabs first; reach for one of these only when its own shape fits better than a flat rail of tabs.");

		md(`| alternative | demo | pick it when |
|---|---|---|
| **Miller columns** | [core/Page/overview/columns/](/framework/core/Page/overview/columns/) | the reader is drilling into a tree (a file browser, a nested catalog) and wants every level's siblings to stay visible at once |
| **Workspace, contextual swapping sidebars** | [/layouts/explorer/](/layouts/explorer/) | the RIGHT content should decide what the LEFT rail shows next — the owner's own words: "the right sidebar becomes the left... the currently selected one becomes the main view" |
| **Full-screen switch (screens lab)** | [/layouts/labs/screens/](/layouts/labs/screens/) | the content wants the whole screen and switches are rare enough that a thin persistent strip is all the "nav" it needs; learn the two words first (\`full\` replaces, \`fill\` joins) |
| **Persistent rail vs. full swap, head to head** | [/imagine/decks/persist/](/imagine/decks/persist/) vs [/imagine/decks/swap/](/imagine/decks/swap/) | undecided between the two — this is the same four slides built both ways, with the finding written down |
| **Contextual right rail (a second surface)** | [ext/drawer](/framework/ext/drawer/) | the main content needs a persistent SECOND nav surface next to the main Sidebar (properties, AI, settings) that pushes the page rather than covering it |
| **The configurable prototype** | [/imagine/paging/](/imagine/paging/) | trying combinations before committing — a rail-or-tabs word plus five other words, all in the url |`);

		md("More prior work, all the rows the inventory found: [`doc/prior-work.md`](/framework/core/Page/navigation/md/doc/prior-work/). This page is about navigation as a UI *pattern* (rails, tabs, persistent vs switching) — for navigation as core's own routing *mechanism* (how `children:` becomes a menu), see [`core/Page/doc/navigation.md`](/framework/core/Page/doc/navigation/), a different topic with the same name.");
	},
});
