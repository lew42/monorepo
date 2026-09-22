import { Page } from "/app.js";
import { design } from "../Design.js";

/* ── /layouts/shell/home/ — the root of the design tree ──────────────────────
   Every other design in this lab is this object with ONE thing changed. Nothing
   imports a design's PAGE; the children import `home`, the plain object below, and
   that is the whole of the inheritance — see `../doc/pages.md`.

   LAYOUT, the five questions.
   1. CONTAINER. The shell's viewport, which is a page region: this is an ordinary
      `.page`, so `bleed` reaches the viewport's edges and `main` is the measure.
   2. SIZE. Whatever the sidebar leaves — about 950px at 1280 with the rail at 18rem,
      and about 3000px at 3440 with it at 14rem. The bands hold from 380px up.
   3. OWN LAYOUT. Four bands stacked: bar, hero, wall, footer. The layout id is
      `1-bands`, which is the one arrangement a narrow box leaves alone.
   4. REGIONS. Four, plus the fold at the bottom that says what changed.
   5. PREVIEW. A row in the shell's sidebar — the title, and its children under it.  */

const CARDS = [
	{ title: "Framework", href: "/framework/", say: "Views, routing, pages and persistence, in native ES modules with no build step." },
	{ title: "Layouts", href: "/layouts/", say: "Every way a page can divide its room, named, defined and drawn." },
	{ title: "Websites", href: "/websites/", say: "Forty-seven real sites, wired, tagged and counted against those same names." },
	{ title: "Web", href: "/web/", say: "The seven principles a page is judged by here, one page each." },
	{ title: "Imagine", href: "/imagine/", say: "The labs — where a shape is tried out long before it becomes a standard." },
	{ title: "Notes", href: "/notes/", say: "Working notes, dated and kept, including the ones that turned out wrong." },
];

const GROUPS = [
	["Sections", [["Home", "/"], ["Framework", "/framework/"], ["Layouts", "/layouts/"], ["Websites", "/websites/"], ["Web", "/web/"]]],
	["This lab", [["The shell", "/layouts/shell/"], ["How pages derive", "/layouts/shell/doc/pages/"], ["Practice layouts", "/layouts/practice/"]]],
	["Working", [["The AI board", "/framework/ai/"], ["Research", "/framework/research/"], ["Resume", "/resume/"]]],
];

/* ⚠ EXPORTED, and a plain object. A child design imports THIS, never the page
   below it: a spec is data with no url, no parent and no children, so importing it
   cannot make a cycle and cannot drag a subtree into memory. */
export const home = {
	nav: {
		brand: "lew42",
		links: [["Framework", "/framework/"], ["Layouts", "/layouts/"], ["Websites", "/websites/"], ["Web", "/web/"], ["Blog", "/blog/"]],
	},

	/* ⚠ `fold` is the whole clamp, written out, because a hero's height is a FOLD
	   budget and the floor and the cap are part of the decision — a child that
	   makes the hero taller has to move all three numbers or it has not really
	   changed anything (the layout skill, and `/layouts/practice/catalog/`). */
	hero: {
		fold: "clamp(13rem, 34vh, 26rem)",
		split: false,
		eyebrow: "A no-build web framework",
		title: "Every page on this site is the framework documenting itself.",
		say: "Native ES modules, no bundler, no transpile. Open any page and read the file that drew it.",
		acts: [["Start here", "/framework/start/", true], ["Read the core", "/framework/core/"]],
	},

	/* ⚠ SIX CARDS AND A COUNT OF SIX, and the two numbers are related on purpose:
	   the wall steps 1 · 2 · 3 · 6 and every one of those divides six, so no row is
	   ever short at any width. `shell.css` has the ladder and what it cost to learn. */
	wall: {
		title: "Where to go",
		say: "Six sections, each one a book of its own.",
		count: 6,
		cards: CARDS,
	},

	band: null,
	aside: null,
	footer: { groups: GROUPS },
};

export default new Page(design(home, {
	meta: import.meta,
	title: "Home",
	description: "The base design: a bar, a hero on a fold budget, a wall of six, a footer.",
	classes: "default",
	changed: "Nothing — this is the root. Everything under it is this design with one thing added, changed or taken away.",
	children: "taller-hero wall-of-three no-hero",
}));
