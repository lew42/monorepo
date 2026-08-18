import { Page, md, demo, code, h2, div } from "/app.js";
import full from "../layouts/full.js";
import tones from "./tone.js";

import navbar from "./navbar.js";
import hero from "./hero.js";
import logos from "./logos.js";
import features from "./features.js";
import split from "./split.js";
import stats from "./stats.js";
import testimonials from "./testimonials.js";
import pricing from "./pricing.js";
import faq from "./faq.js";
import team from "./team.js";
import changelog from "./changelog.js";
import contact from "./contact.js";
import signup from "./signup.js";
import callout from "./callout.js";
import footer from "./footer.js";

/* What every band page is, spread into each child below: `demo.exhibit()` — the
 * band on a stage you can drag, the layout bar wired to it, and the band's own
 * function as the source. The four tones ride the same bar's panel (`tone.js`),
 * registered on the render, so there is exactly one control surface. */
const band = {
	classes: "standard",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.section(this.tone))); },

	content(){
		demo.exhibit({
			page: this,
			stage: steer => demo.stage(() => this.section(this.tone), $render => {
				steer($render);
				tones(this, $render);
			}).ac("bleed"),

			def: this.section,
			file: new URL(this.name + ".js", import.meta.url).pathname,
			note: `\`${this.name}.js\` **running**, not a picture of it — drag the stage, click into the band, and the panel offers its four tones.`,
		});
	},
};

export default new Page({
	meta: import.meta,
	title: "Sections",
	description: "The layouts, filled with real elements and components — a whole page, composed.",
	icon: "view_day",

	/* Fifteen urls, no directories: an inline child is a `page.js` that didn't earn a
	   folder, and it buys routing, nav and a preview card that a registry could not.
	   The order is the whole page's order, and no two neighbours share a tone —
	   alternation is what makes the seams read. */
	children: [
		{ ...band, name: "navbar",       title: "Nav bar",      icon: "menu",           tone: "surface", section: navbar },
		{ ...band, name: "hero",         title: "Hero",         icon: "campaign",       tone: "dark",    section: hero, card: "two" },
		{ ...band, name: "logos",        title: "Logo wall",    icon: "domain",         tone: "wash",    section: logos },
		{ ...band, name: "features",     title: "Features",     icon: "grid_view",      tone: "surface", section: features },
		{ ...band, name: "split",        title: "Split",        icon: "vertical_split", tone: "wash",    section: split },
		{ ...band, name: "stats",        title: "Numbers",      icon: "insights",       tone: "prim",    section: stats },
		{ ...band, name: "testimonials", title: "Testimonials", icon: "format_quote",   tone: "surface", section: testimonials },
		{ ...band, name: "pricing",      title: "Pricing",      icon: "sell",           tone: "wash",    section: pricing },
		{ ...band, name: "faq",          title: "FAQ",          icon: "help",           tone: "surface", section: faq },
		{ ...band, name: "team",         title: "Team",         icon: "groups",         tone: "wash",    section: team, card: "tall" },
		{ ...band, name: "changelog",    title: "Changelog",    icon: "history",        tone: "surface", section: changelog, card: "tall" },
		{ ...band, name: "contact",      title: "Contact",      icon: "forum",          tone: "wash",    section: contact },
		{ ...band, name: "signup",       title: "Sign up",      icon: "mail",           tone: "dark",    section: signup },
		{ ...band, name: "callout",      title: "Call out",     icon: "bolt",           tone: "prim",    section: callout },
		{ ...band, name: "footer",       title: "Footer",       icon: "call_to_action", tone: "dark",    section: footer },
	],

	/* `full` is the one url with no band behind it — route() sees undeclared names
	   only. The page it makes is still a child, so it draws no card, and `whole()`
	   asks every child for a band it may not have. */
	route(name){ if (name === "full") return { ...full(this, () => this.whole()), preview(){} }; },

	whole(){ this.children.forEach(page => page.section?.(page.tone)); },

	// Fifteen live bands as the rail, this page as its first card.
	initialize(){ this.catalog(); },

	// No toc(): the bands are REAL, so the rail read a hero's h1 and six logo
	// wordmarks as sections of this page. A wrong rail is worse than none.
	content(){

		md("A layout says where things go. A **section** is a layout with real content in it — and it is the unit a page is actually built from.");

		md("Every card in the rail is one of the eight [layouts](/framework/styles/layouts/), filled with [elements](/framework/styles/elements/) and [components](/framework/ui/), live at a quarter size. Click one for the band on a stage, the panel one click away, and the function that built it open underneath. **There is no stylesheet in this folder.**");

		h2("The whole page");

		demo(() => this.whole(), { full: this }, "All fifteen, in order. Drag the handle: every band re-lays-out on its own, because none of them contains a media query.");

		h2("The one idea");

		code.js(`export default (tone = "dark") =>
    div.c("section-band", () =>
        div.c("measure flex v gap", () => { … }).style("--measure", "62em")
    ).style(band(tone));`);

		md("**A band bleeds; the words don't.** The outer div takes the full width and the fill; `.measure` inside it holds the max-width, so the reading stays a column no matter how wide the window gets. `--measure` is declared by the class, so a band that wants a card wall rather than a column sets it inline and the inline value wins.\n\n`flex v gap`, not `flow` — flow is *page* rhythm, sized for a column of prose, and a band's rhythm is its own. (`--flow` resolves against each child's own font-size: 2em of a 48px hero `h1` is 96px, which no band wants.)");

		md("**Every band writes that sandwich out.** There is no `section()` helper and no `eyebrow()` or `cta()` — a band's source is the lesson now, so nothing it builds may live in a file the reader has to go and open. The only import is `band(tone)`, a style object, because a four-way token map cannot be written fifteen times.");

		h2("Four tones, and no fifth");

		code.js(`band("dark")      // --ink,     text --surface
band("prim")      // --prim,    text --surface
band("wash")      // --wash
band("surface")   // --surface`);

		md("They are the surfaces the theme already defines, so alternating them keeps a page in palette **by construction** — and a theme swap retints every band with nothing edited here. A section module is `tone => view`, so **switching a tone is re-running the function**, which is all the panel's tone chips do.");

		md("**Nothing in this folder names a colour.** That is the test rung 4 of the ladder asks — would this rule still be right in a different site — and a hex value fails it every time.");

		h2("Which layout each band is");

		md(`| band | layout | what it needed |
|---|---|---|
| Nav bar | [Landing](/framework/styles/layouts/landing/)'s top band | \`flex gap wrap v-center split\` |
| Hero | [Landing](/framework/styles/layouts/landing/) | the measure column's own gap + \`flex gap wrap\` for the buttons |
| Logo wall | [Flex](/framework/styles/layouts/flex/) | \`flex gap wrap v-center h-center\` |
| Features | [grid gap auto](/framework/styles/layouts/grid/auto/) | \`grid gap auto\` — the wall re-counts itself |
| Split | [flex gap auto](/framework/styles/layouts/flex/auto/) | \`flex gap auto v-center\` |
| Numbers | [Dashboard](/framework/styles/layouts/dashboard/) | the same grid, \`--column: 9em\` |
| Testimonials | [grid gap auto](/framework/styles/layouts/grid/auto/) | \`grid gap auto\` + the Avatar component |
| Pricing | [flex gap auto](/framework/styles/layouts/flex/auto/) | \`flex gap auto\` — two equal panes that stack |
| FAQ | [Stack](/framework/styles/layouts/stack/) | \`flex v\` + \`details\` |
| Team | [grid gap auto](/framework/styles/layouts/grid/auto/) | \`grid gap auto\` + the Avatar component |
| Changelog | [Stack](/framework/styles/layouts/stack/) | the Timeline component, whole |
| Contact | [flex gap auto](/framework/styles/layouts/flex/auto/) | \`flex gap auto\` — channels beside a form |
| Sign up | [Stack](/framework/styles/layouts/stack/) | \`flex gap wrap\` — a field that wraps under its button |
| Call out | [Landing](/framework/styles/layouts/landing/)'s CTA band | \`flex gap wrap v-center split\` |
| Footer | [App shell](/framework/styles/layouts/shell/)'s status bar | \`flex wrap split v-center\` |

Fifteen sections, seven layouts, **zero new CSS rules.** The surfaces are \`.surface\` / \`.wash\` / \`.muted\` in \`framework.css\`; the arrangement is entirely utilities.`);

		md("Next: [Page shapes](/framework/styles/layouts/fit/) — how the page *around* these sections is shaped.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
