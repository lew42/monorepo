import { Page, md, p, h3, div } from "/app.js";
import { floating } from "./floating.js";
import { section } from "/framework/ui/section/section.js";

/**
 * The Floating page, live — core/Page's "Floating page" word. `floating.js`'s own header
 * comment has the full spec; this page shows it working, then names its three parts with
 * `ui/section` so hovering each one prints its real class name.
 */
const TABS = [
	{ id: "overview", label: "Overview", text: "This is the page's own content. It sits on a white background, capped at a reading width, and scrolls normally with the rest of this page — the nav beside it does not move." },
	{ id: "requests", label: "Requests", text: "A second tab, so there is something to switch to. Clicking a link on the left redraws only this white area; the nav itself is untouched, which is why an open nav item never closes when you flip pages." },
	{ id: "activity", label: "Activity", text: "A third tab, with enough of its own paragraphs to make the white page taller than the window, so you can see it scroll independently of the nav beside it." },
	{ id: "files", label: "Files", text: "A fourth tab. Nothing about the layout changes tab to tab — only the content this page draws." },
	{ id: "settings", label: "Settings", text: "The fifth and last tab." },
];

function tab_body(id){
	const tab = TABS.find(t => t.id === id) ?? TABS[0];
	h3(tab.label);
	p(tab.text);
	// Padding so the page is clearly taller than one screen — proves the "scrolls on its own".
	for (let i = 0; i < 6; i++) p(`Paragraph ${i + 1} of filler, so this tab is tall enough to scroll on its own while the nav beside it stays put.`);
}

export default new Page({
	meta: import.meta,
	title: "Floating page",
	description: "A page that floats in a gray well, with its own tab nav on the left.",
	icon: "flip_to_front",

	content(){
		md("**A page that floats in a gray well, with its own tab nav on the left.** The nav stays put; the white page scrolls past it.");

		md("**The system, named in place** — hover any of the three boxes below to see its real class name.");
		section("floating-well", () => {
			p("The well: a medium gray, a couple of shades darker than the site's own rails, with padding-top so the white page starts below the well's own top edge.");
			section("floating-nav", () => {
				p("The nav: sticky at the top, full height, its colours left alone.");
			});
			section("floating-page", () => {
				p("The page: white, its own padding, no border — the colour change alone is the seam.");
			});
		});

		md("**Live** — the nav's tabs switch the page below; scroll to see the gray well's top clip away and the white page keep going. It needs real width to show the nav as a left column (not the site's own narrow reading measure), so it draws in the page's `wide` track.");

		let active = TABS[0].id;
		let f;
		div.c("wide", () => {
			f = floating(null, {
				nav: TABS.map(t => ({ label: t.label, href: `#${t.id}`, active: t.id === active })),
				content(){ tab_body(active); },
			});
		});

		f.$nav.el.addEventListener("click", (e) => {
			const $a = e.target.closest("a.floating-link");
			if (!$a) return;
			e.preventDefault();
			active = $a.getAttribute("href").slice(1);
			f.nav(TABS.map(t => ({ label: t.label, href: `#${t.id}`, active: t.id === active })));
			f.$page.empty(() => { tab_body(active); });
		});

		md("Back to [Choosing a layout](/framework/core/Page/layout/).");
	},
});
