import { Page, div, h1, h3, p, a } from "/app.js";
import { floating } from "./floating.js";
import { section } from "/framework/ui/section/section.js";

/**
 * The Floating page, live — core/Page's "Floating page" word. `floating.js`'s own header
 * comment has the full spec. This page IS one: no framework title or prose sits above the
 * well — the well fills the whole region beside the site's real left rail, and the page's
 * own title, lead sentence and tab content all live INSIDE the white page, the way any real
 * user of this layout would put them there. `render()` is overridden (skipping the base
 * class's automatic `<h1>`) — the same move `core/Sidebar/variants/a–d` make — but the
 * default `container()` is kept, so this page nests normally under the real site tree and
 * the real left rail stays exactly where it always is.
 */
const TABS = [
	{ id: "overview", label: "Overview" },
	{ id: "requests", label: "Requests" },
	{ id: "activity", label: "Activity" },
	{ id: "files", label: "Files" },
	{ id: "settings", label: "Settings" },
];

// One real sentence or two per tab — what filler text stood in for before. Every tab but
// Overview (which shows the system diagram instead) gets a different angle on the same
// question: when is this layout the right call.
const TAB_COPY = {
	requests: [
		"Reach for this layout when a region is much wider than one page should ever be — a card's own detail area on a 3440px screen, for instance, where a flush single column would read as a sentence lost in an empty hall.",
		"The nav and the page travel together as one unit, so switching pages never means hunting for navigation that scrolled out of view.",
	],
	activity: [
		"The nav is deliberately narrow and the page is deliberately capped — the point is not to fill the width with text, it's to keep the reading column honest while the gray well soaks up the leftover room.",
		"Below the container query's breakpoint (44em) the nav drops to a row of links above the page and the well's padding shrinks to match — the same component, a phone-sized version of itself.",
	],
	files: [
		"The page and the nav scroll independently: the nav stays pinned near the top so you always know which tab you're on, while the page itself can be as long as its content needs.",
		"Nothing about the gray well is decorative filler — it's the visual cue that this page has its own navigation, separate from the site's.",
	],
	settings: [
		"Two knobs size the whole thing from any ancestor: `--floating-nav` (the nav's width) and `--floating-measure` (the page's reading cap) — no new CSS class, just a custom property.",
		"Everything else — the well's gray, the padding that scales at 3440, the sticky nav — comes from the framework's own tokens, so a caller never invents a number.",
	],
};

function tab_body(id){
	if (id === "overview") return overview_body();
	h3(TABS.find(t => t.id === id)?.label ?? id);
	TAB_COPY[id]?.forEach(sentence => p(sentence));
}

/** Overview tab: the system, named in place — hover a box to see its real class name. */
function overview_body(){
	h3("Overview");
	p("The system, named in place — hover any of the three boxes below to see its real class name.");
	section("floating-well", () => {
		p("The well: a medium gray, a couple of shades darker than the site's own rails, with padding-top so the white page starts below the well's own top edge.");
		section("floating-nav", () => {
			p("The nav: sticky at the top, full height, its colours left alone.");
		});
		section("floating-page", () => {
			p("The page: white, its own padding, no border — the colour change alone is the seam.");
		});
	});
}

export default new Page({
	meta: import.meta,
	title: "Floating page",
	description: "A page that floats in a gray well, with its own tab nav on the left.",
	icon: "flip_to_front",

	// The default nesting — inside the real site tree, beside the real left rail. Only
	// render() is custom, to skip the base class's own `<h1>` above the well.
	render(){
		return this.view ??= div.c("page flow full page--floating", () => {
			div.c("bleed", () => { this.floating_page(); });
			a.c("page-link").href("/framework/core/Sidebar/variants/walkthrough/").text("See it in the walkthrough →");
		});
	},

	floating_page(){
		const page_body = (id) => {
			h1("Floating page");
			p("A page that floats in a gray well, with its own tab nav on the left — the nav stays put; the white page scrolls past it.");
			a("← Choosing a layout").href("/framework/core/Page/layout/");
			tab_body(id);
		};

		let active = TABS[0].id;
		const f = floating(null, {
			nav: TABS.map(t => ({ label: t.label, href: `#${t.id}`, active: t.id === active })),
			content(){ page_body(active); },
		});

		f.$nav.el.addEventListener("click", (e) => {
			const $a = e.target.closest("a.floating-link");
			if (!$a) return;
			e.preventDefault();
			active = $a.getAttribute("href").slice(1);
			f.nav(TABS.map(t => ({ label: t.label, href: `#${t.id}`, active: t.id === active })));
			f.$page.empty(() => { page_body(active); });
		});
	},
});
