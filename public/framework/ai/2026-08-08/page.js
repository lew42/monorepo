import { Page, md, h2, div, demo } from "/app.js";
import preview from "../../styles/layouts/preview.js";
import layout from "../../ext/layout/layout.js";
import tour from "./tour.js";

const n = count => Array(count).fill("");

export default new Page({
	meta: import.meta,
	title: "2026-08-08",
	description: "A page names itself, a class page is three tabs, and every core member has a url.",
	icon: "summarize",

	content(){

		md("**2026-08-08.** Nothing below is a screenshot — the report is built out of the machinery it is reporting on.");

		demo.app(tour(), { nav: true }).ac("wide").style("height", "20em");

		md("A real `Page` tree in a box: rail, cards, crumbs and region, every one of them derived from `nav_for()` and `chain()`. `mini_app()` plays App and Router for that one tree, so the url in your address bar never moves. **`nav:` maps are gone** — a label, an icon and a card size are declared on the page they name, and the last `nav:` on the site was in the page you are reading. [More](/framework/core/Page/) — the demos are the Overview's rail now.");

		h2("Six shapes, one handle");

		demo.stage(() => div.c("grid gap auto").style({ "--column": "18em", "--gap": "1.8em" }).append(() => {
			preview("A row with air in it", "flex gap", n(3));
			preview("A fixed rail, a fluid rest", "flex gap", ["basis", "flex-1"]);
			preview("Equal peers, that wrap", "flex gap auto", n(3), "3em");
			preview("A wall that counts itself", "grid gap auto", n(6), "3.5em");
			preview("Three, then straight to one", "grid gap three", n(3), "3em");
			preview("A strip of tiles", "grid gap auto", n(8), "2.5em");
		})).ac("wide");

		md("**Drag the right edge** and all six re-flow at once. Not one is a media query — each answers to the width of its own box, which is why the same class string is right in a sidebar, in a card, and across a 3440px monitor. `preview()` draws the arrangement and nothing else; hover a name for its classes. [Thirteen of them](/framework/styles/layouts/), simplest first.");

		h2("…and a toolbar to push them around");

		layout(() => "ABCDE".split("").forEach(letter => div.c("pad surface h3", letter))).ac("wide");

		md("**Point at the box.** `ext/layout` lost its wall of orange buttons for a mono strip that hides until you hover — and stays put on touch, which has no hover to reveal it with. Two knobs cover gap, wrap, columns, basis and minmax across both modes. `layout.bar($box)` now takes a container the *call site* built, which closes the handoff [the previews](/framework/styles/layouts/flex/) were blocked on.");

		h2("A class page is Overview | API | Docs");

		md("Two levels of real `tabs()` pages: a quiet strip across the top, a vertical rail inside each. Both levels are urls, so Back works and a member is a link you can send — [`View.append()`](/framework/core/View/api/append/), [`Router`'s marking note](/framework/core/Router/docs/marking/). A rail of one hides itself; a rail of fifty scrolls.");

		h2("The nitty gritty");

		md("Every member of every core class was read this session and given a page: the real source, its callers by grep, and Usage / Necessity / Simplicity — *is this used, must it exist, could it be smaller.*");

		md(`| class | methods | properties | notes |
|---|---:|---:|---:|
| [View](/framework/core/View/api/) | 49 | 10 | 2 |
| [Page](/framework/core/Page/api/) | 20 | 17 | 3 |
| [Router](/framework/core/Router/api/) | 13 | 2 | 10 |
| [App](/framework/core/App/api/) | 14 | 6 | 8 |
| [Sidebar](/framework/core/Sidebar/api/) | 11 | 6 | 6 |
| [Socket](/framework/dev/Socket/api/) | 10 | 3 | 3 |
| | **117** | **44** | **32** |`);

		md("The tier-1 overviews were rewritten to match: [View](/framework/core/View/) is six demos and no headings at all, [Page](/framework/core/Page/) is three complete `new Page({…})` calls, [Router](/framework/core/Router/) renders four real anchors that light their own `.active` and `.in-path`, [Sidebar](/framework/core/Sidebar/) draws three.");

		md("**Root causes, not symptoms.** Holy grail alone was three separate bugs wearing one look:");

		md(`| symptom | cause |
|---|---|
| the nav rail out-grew the article | it was \`flex-1\`, the *fluid* half of a row. A rail is the fixed half — \`basis\` |
| its heading sat flush to the edge | \`Sidebar\`'s \`header:\` **replaces** the method emitting \`div.c("brand")\` — the padding left with it |
| the recipe rail clipped its own class string | 14em, for a string that needs 17 |
| \`fill\` collapsed a live 2200px page, toolbar and all, with no scrollbar | \`.page.fill\` carries \`overflow: hidden\`. The bar now pairs \`fill\` with an inline \`overflow: auto\` |
| a bar overwrote the \`--column\` it was handed | the knob seeded from its own default instead of from the box |
| a bar over a grid opened as a flex | \`pick()\` lit the first word rather than the one the box wears |
| **open** — a real \`Page\` outside the router's chain blanks on the next click | \`Router.mark()\` wipes \`.active-page\` / \`.active-ancestor\` app-wide, marks it never wrote included. An unmarked \`.page\` is \`display: none\`, and nothing throws. Scope the wipe to \`from\` |`).ac("wide");

		h2("The shelf");

		md("Found by the audit, **deliberately not applied** — each is a change to a core class, so it wants a critique first. Every one is written up under **§Proposed** in the owning module's design record, one click down from these pages.");

		md(`| module | proposed |
|---|---|
| [View](/framework/core/View/) | delete the zero-caller set — \`prepend\`, \`replace\`, \`compute\`, \`repeat\`, \`clone\` — and \`off()\`, which **cannot** remove a listener, because \`on()\` registers a wrapper. \`hide\`/\`show\`/\`toggle\` write inline \`display\`, the top rung of the ratchet; a \`.hidden\` class does the same job and can be overridden |
| [Page](/framework/core/Page/) | \`preview()\` and \`previews()\` emit two different cards under one class. \`go()\` has no callers anywhere. \`description:\` is declared **123 times** and read **zero** — pick a meaning for it or delete it, before three people fix it three ways |
| [Router](/framework/core/Router/) | \`root()\` → \`scope()\`: \`app.root\` is a **Page**, \`router.root()\` is an **element**, and they are read eleven lines apart. Two fast clicks start two walks and the slower one can win |
| [App](/framework/core/App/) | \`initialize()\` is an empty hook overridden by nobody in a year — the standing test said it should go. \`log_label()\` has zero callers while \`container()\` logs the literal it was written for |
| [Sidebar](/framework/core/Sidebar/) | \`$bar\`, \`$menu\` and \`$mode\` are assigned and never read by anything. A group nested inside a group renders \`href="undefined"\`, silently |
| [Socket](/framework/dev/Socket/) | the whole browser→server half has no caller, and the server half is commented out — \`server.js:6\`. **Off at both ends**, which is the one arrangement that teaches a reader something false |
| [markdown](/framework/ext/markdown/) · [is](/framework/util/is/) | \`md.c()\` has no caller. Seven of fifteen \`is\` checks have none, and \`is.proto(Array.prototype)\` answers \`false\` |`).ac("wide");

		md("**Verified in a real browser, not asserted.** Every page under `ext/`, `styles/`, `util/` and `dev/` plus the routed ones, and all twelve layout pages, at 1600, 900 and 400: no console errors, no failed requests, no horizontal overflow. Classdoc was loaded cold and deep, then walked back with the Back button; the miniature above was checked for leaving the real url alone.");
	},
});
