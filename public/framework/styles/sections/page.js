import { Page, md, demo, code, h2, div, a, span, icon, toc } from "/app.js";
import catalogue from "./catalogue.js";
import toned from "./tone.js";
import full from "../layouts/full.js";

const page = tone => Object.values(catalogue).forEach(s => s.render(tone));

export default new Page({
	meta: import.meta,
	title: "Sections",
	description: "The layouts, filled with real elements and components — a whole page, composed.",
	icon: "view_day",

	/* Nine urls, no directories. Every entry in `catalogue.js` is a name, a label,
	 * an icon and a render function — which is everything the gallery needs and
	 * everything a page needs, so both come off one list and cannot disagree.
	 *
	 * This is the pattern to steal for anything catalogue-shaped: a menu, a token
	 * set, a chart type. Nine folders holding four lines each would have said the
	 * same thing nine times. */
	route(name){
		if (name === "full") return full(this, page);

		const entry = catalogue[name];

		if (!entry) return;

		return {
			title: entry.title,
			icon: entry.icon,
			classes: "paper",
			content(){
				md(`One section, in the four tones. Each is the same function — \`${name}.js\` — run again with a different argument.`);

				toned(entry.render, entry.tone);

				code.file(import.meta, name + ".js");

				a.c("page-link", "← All sections").href("/framework/styles/sections/");
			},
		};
	},

	content(){

		toc();

		md("A layout says where things go. A **section** is a layout with real content in it — and it is the unit a page is actually built from.");

		md("Every band below is one of the eight [layouts](/framework/styles/layouts/), filled with [elements](/framework/styles/elements/) and [components](/framework/styles/components/). **There is no stylesheet in this folder.**");

		this.gallery();

		md("Click one for its source and its four tones.");

		h2("The whole page");

		demo(page, { full: this }, "All nine, in order. Drag the handle: every band re-lays-out on its own, because none of them contains a media query.");

		h2("The one idea");

		code.js(`export const section = (tone, ...args) =>
    div.c("section-band", () =>
        div.c("flow", ...args).style({ maxWidth: "var(--section, 34em)", marginInline: "auto" })
    ).style(band(tone));`);

		md("**A band bleeds; the words don't.** The outer div takes the full width and the fill; the inner one holds a max-width, so the reading stays a column no matter how wide the window gets. That is the composition, and everything else here is content poured into it.");

		md("**This page is an ordinary measured page**, and that is worth saying because the first version was not. Bleeding is what a *section* does, not what a page about sections does — and a `page-full` doc page has nowhere to put its own `h1`, which duly ended up flush against the sidebar.");

		h2("Four tones, and no fifth");

		md("`band(tone)` takes one of `surface`, `wash`, `prim`, `dark`. They are the surfaces the theme already defines, so alternating them keeps a page in palette **by construction** — and a theme swap retints every band with nothing edited here.");

		code.js(`section("dark", () => { … })     // --ink,     text --surface
section("prim", () => { … })     // --prim,    text --surface
section("wash", () => { … })     // --wash
section("surface", () => { … })  // --surface`);

		md("A section module is `tone => view`, so **switching a tone is re-running the function.** There is no state to keep and no stylesheet to toggle, which is why the switcher on each section page is nine lines.");

		md("**Nothing in this folder names a colour.** That is the test rung 4 of the ladder asks — would this rule still be right in a different site — and a hex value fails it every time.");

		h2("Which layout each band is");

		md(`| band | layout | what it needed |
|---|---|---|
| Nav bar | [Masthead](/framework/styles/layouts/masthead/) | \`flex gap wrap v-center split\` |
| Hero | [Masthead](/framework/styles/layouts/masthead/) | \`flow\` + \`flex gap wrap\` for the buttons |
| Features | [Cards](/framework/styles/layouts/cards/) | \`grid gap auto\` — the wall re-counts itself |
| Split | [Split](/framework/styles/layouts/split/) | \`flex gap auto v-center\` |
| Numbers | [Dashboard](/framework/styles/layouts/dashboard/) | the same grid, \`--column: 9em\` |
| Pricing | [Split](/framework/styles/layouts/split/) | \`flex gap auto\` — two equal panes that stack |
| FAQ | [Stack](/framework/styles/layouts/stack/) | \`flow\` + \`details\` |
| Call out | [Masthead](/framework/styles/layouts/masthead/) | \`flex gap wrap v-center split\` |
| Footer | [Holy grail](/framework/styles/layouts/holy-grail/)'s bottom band | \`flex wrap split v-center\` |

Nine sections, six layouts, **zero new CSS rules.** The tints are token-valued style objects in \`parts.js\`; the arrangement is entirely utilities.`);

		md("Next: [Page layouts](/framework/core/Page/layouts/) — how the page *around* these sections is shaped.");

		md.details(import.meta, "readme.md", "Design record — what a section is, the catalogue, and why there is no stylesheet");
	},

	// One card per catalogue entry. Same `gallery-card` the layouts and components
	// indexes use (Page.css): an inert thumbnail, and a label that is the only link.
	gallery(){
		div.c("grid gap auto", () => {
			Object.entries(catalogue).forEach(([name, s]) => {
				div.c("page-preview gallery-card", () => {
					div.c("gallery-thumb zoom-25 flex v h-center", () => s.render(s.tone));

					a.c("gallery-link").href(this.url + name + "/").append(() => {
						icon(s.icon);
						span.c("page-preview-title", s.title);
					});
				});
			});
		}).style({ "--column": "15em", "--gap": "1.25em" });
	},
});
