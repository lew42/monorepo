import { Page, md, demo, code, h2, div, a } from "/app.js";
import card, { wall } from "../gallery/gallery.js";
import catalogue from "./catalogue.js";
import toned from "./tone.js";
import full from "../layouts/full.js";

const page = tone => Object.values(catalogue).forEach(s => s.render(tone));

export default new Page({
	meta: import.meta,
	title: "Sections",
	description: "The layouts, filled with real elements and components — a whole page, composed.",
	icon: "view_day",

	/* Fifteen urls, no directories: every entry in `catalogue.js` is a name, a
	   label, an icon and a render function, which is everything the gallery needs
	   and everything a page needs. See readme.md for why this one keeps a registry
	   where layouts/ moved to `children`. */
	route(name){
		if (name === "full") return full(this, page);

		const entry = catalogue[name];

		if (!entry) return;

		return {
			title: entry.title,
			icon: entry.icon,

			// `grid`, so the prose and the source keep the reading measure while the
			// band alone leaves it — `bleed`, because touching the window is the one
			// thing a section is for.
			classes: "grid",

			content(){
				md(`\`${name}.js\`, complete — imports and all. The band below it is this file **running**, not a picture of it.`);

				// ⚠ code.file() returns a PROMISE — the placed div is what fills.
				div(code.file(import.meta, name + ".js"));

				toned(entry.render, entry.tone).ac("bleed");

				md("The buttons re-run the function above with a different `tone` — there is no state to keep and no stylesheet to toggle, which is why the switcher is nine lines.");

				a.c("page-link", "← All sections").href("/framework/styles/sections/");
			},
		};
	},

	// No toc(): the gallery renders REAL bands, so the rail read a hero's h1 and six
	// logo wordmarks as sections of this page. A wrong rail is worse than none.
	content(){

		md("A layout says where things go. A **section** is a layout with real content in it — and it is the unit a page is actually built from.");

		md("Every band below is one of the eight [layouts](/framework/styles/layouts/), filled with [elements](/framework/styles/elements/) and [components](/framework/ui/). **There is no stylesheet in this folder.**");

		this.gallery();

		md("Click one for its source and its four tones.");

		h2("The whole page");

		demo(page, { full: this }, "All fifteen, in order. Drag the handle: every band re-lays-out on its own, because none of them contains a media query.");

		h2("The one idea");

		code.js(`export const section = (tone, ...args) =>
    div.c("section-band", () =>
        div.c("flex v gap", ...args).style({ maxWidth: "var(--section, 34em)", marginInline: "auto" })
    ).style(band(tone));`);

		md("**A band bleeds; the words don't.** The outer div takes the full width and the fill; the inner one holds a max-width, so the reading stays a column no matter how wide the window gets.\n\n`flex v gap`, not `flow` — flow is *page* rhythm, sized for a column of prose, and a band's rhythm is its own. (`--flow` resolves against each child's own font-size: 2em of a 48px hero `h1` is 96px, which no band wants.)");

		h2("Four tones, and no fifth");

		code.js(`section("dark", () => { … })     // --ink,     text --surface
section("prim", () => { … })     // --prim,    text --surface
section("wash", () => { … })     // --wash
section("surface", () => { … })  // --surface`);

		md("They are the surfaces the theme already defines, so alternating them keeps a page in palette **by construction** — and a theme swap retints every band with nothing edited here. A section module is `tone => view`, so **switching a tone is re-running the function.**");

		md("**Nothing in this folder names a colour.** That is the test rung 4 of the ladder asks — would this rule still be right in a different site — and a hex value fails it every time.");

		h2("Which layout each band is");

		md(`| band | layout | what it needed |
|---|---|---|
| Nav bar | [Masthead](/framework/styles/layouts/masthead/) | \`flex gap wrap v-center split\` |
| Hero | [Masthead](/framework/styles/layouts/masthead/) | \`section()\`'s gap + \`flex gap wrap\` for the buttons |
| Logo wall | [Centered](/framework/styles/layouts/centered/) | \`flex gap wrap v-center h-center\` |
| Features | [Cards](/framework/styles/layouts/cards/) | \`grid gap auto\` — the wall re-counts itself |
| Split | [Split](/framework/styles/layouts/split/) | \`flex gap auto v-center\` |
| Numbers | [Dashboard](/framework/styles/layouts/dashboard/) | the same grid, \`--column: 9em\` |
| Testimonials | [Cards](/framework/styles/layouts/cards/) | \`grid gap auto\` + the Avatar component |
| Pricing | [Split](/framework/styles/layouts/split/) | \`flex gap auto\` — two equal panes that stack |
| FAQ | [Stack](/framework/styles/layouts/stack/) | \`flex v\` + \`details\` |
| Team | [Cards](/framework/styles/layouts/cards/) | \`grid gap auto\` + the Avatar component |
| Changelog | [Stack](/framework/styles/layouts/stack/) | the Timeline component, whole |
| Contact | [Split](/framework/styles/layouts/split/) | \`flex gap auto\` — channels beside a form |
| Sign up | [Stack](/framework/styles/layouts/stack/) | \`flex gap wrap\` — a field that wraps under its button |
| Call out | [Masthead](/framework/styles/layouts/masthead/) | \`flex gap wrap v-center split\` |
| Footer | [Holy grail](/framework/styles/layouts/holy-grail/)'s bottom band | \`flex wrap split v-center\` |

Fifteen sections, seven layouts, **zero new CSS rules.** The surfaces are \`.surface\` / \`.wash\` / \`.muted\` in \`framework.css\`; the arrangement is entirely utilities.`);

		md("Next: [Page shapes](/framework/styles/layouts/fit/) — how the page *around* these sections is shaped.");

		md.details(import.meta, "readme.md", "Design record — what a section is, the catalogue, and why there is no stylesheet");
	},

	// One card() per catalogue entry — styles/gallery/ owns the markup for every
	// index on the site: an inert thumbnail, and a label that is the only link.
	gallery(){
		wall(() => Object.entries(catalogue).forEach(([name, s]) =>
			card({ url: this.url + name + "/", label: s.title, icon: s.icon, card: s.card },
				() => s.render(s.tone))))
			.style({ "--column": "15em", "--thumb-min": "5em", "--thumb-max": "10em" });
	},
});
