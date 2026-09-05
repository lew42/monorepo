import { Page, View, div, h2, img, icon, a, p, md } from "/app.js";

/* css: .design-card */
View.stylesheet(import.meta, "design.css");

/* Container: a plain column of /imagine/'s row — the hub calls columns(), so a second
   call here would be inert (doc/columns.md, "shallowest ancestor" rule); removed rather
   than left in as a call that does nothing (2026-09-04). Size: `full`, same word every
   child already wears — an index this size in the ~40em default was the finding
   (paging/critique's "design" row: 31% of 3440 used, a bare word list). Own layout: a
   `.design-card` per child (2026-09-05, replacing `previews()`'s tile wall) — see
   doc/layout-alternative.md for why. Regions: none. Preview: the default card. */

const here = new URL(".", import.meta.url).pathname;

// One real screenshot per study, already sitting in that study's own `shots/` — nothing
// new was photographed except `themes` (no shots dir of its own; its subject IS a live
// page, so one was taken). `vocabulary` and `system` are prose/data, not a picture of a
// page, so they keep the icon they already wear rather than a fabricated photo.
// `find` is that study's own headline number, copied from its own `description:` or
// its own table — never invented here.
const CARD = {
	journey:    { img: "shots/alex-framework.jpg",
		find: "Hundreds of pages, one viewport jpeg each — the raw material every card below studies." },
	padding:    { img: "shots/good-page-preview.png",
		find: "0 of 2178 real boxes exceeded 20% of their own width — the over-padded end is theatre." },
	scale:      { img: "shots/gallery.jpg",
		find: "The commonest font size on the site is smaller than body — at 390, 1280 and 3440 alike." },
	layout:     { img: "shots/tax-rail-content.jpg",
		find: "Only three shapes are real page shells; 3440 is wasted on most of the rest." },
	navigation: { img: "shots/columns-1280.png",
		find: "Three real click-trails traced four-plus levels deep, mechanism by mechanism." },
	color:      { img: "shots/ok-dark-mode.jpg",
		find: "Every token measured against real usage — and where contrast actually fails." },
	type:       { img: "shots/scale-good.jpg",
		find: "One hierarchy step silently collapses on the site's own pages." },
	controls:   { img: "shots/drawer-open.png",
		find: "One button pattern, or five accidental ones? The shots answer it." },
	vocabulary: { icon: "sell",
		find: "29 tags across 4 axes, tried first on our own nine realms." },
	system:     { icon: "architecture",
		find: "One declared word, one spend rule, four floors — a system, not a critic." },
	themes:     { img: "shots/mock-wall.jpg",
		find: "Six hand-built themes, six more from a generator — same UI, only the tokens change." },
	spacing:    { img: "shots/blogx.jpg",
		find: "One proposal fixes every cramped neighbour-ratio the crawl found." },
};

/**
 * The Design crawl — one overnight program (2026-09-01): a program visited every page on
 * the site and saved a screenshot of each. That whole picture library is **Journey**, the
 * first card below. Every other card studies those same screenshots to answer one design
 * question — padding, scale, layout, navigation, color, type, controls, themes — with real
 * examples pulled from the site, not opinions.
 */
export default new Page({
	meta: import.meta,
	title: "Design",
	description: "The design crawl — screenshots of the whole site, and one study per question: padding, scale, layout, navigation, color, type, controls, themes.",
	icon: "palette",
	width: "full",
	index: true,

	children: "journey padding scale layout navigation color type controls vocabulary system themes spacing",

	content(){
		md("A program visited every page on the site overnight and saved a picture of each — that whole collection is **Journey**, the first card below. Every other card studies those same screenshots to answer one design question, with real examples from the site. **Open any card** to see it.");

		div.c("design-cards", () => this.children.forEach((page, name) => {
			const nav = this.nav_for(name);
			const extra = CARD[name] ?? {};

			// The whole card is clickable via `.page-preview-link`'s own `::after`
			// (Page.css: "the only real link in the card; its ::after covers the
			// rest of it") — reused rather than reinvented, same as the shape itself.
			div.c("design-card", () => {
				div.c("design-intro", () => {
					h2.c("design-name", () => a.c("page-preview-link", nav.label).href(nav.url));
					p.c("design-blurb", nav.description);
				});
				div.c("design-stage", () => {
					extra.img
						? img.c("design-thumb").attr("src", here + name + "/" + extra.img).attr("alt", nav.label)
						: div.c("design-thumb-icon", () => icon(extra.icon ?? nav.icon));
				});
				div.c("design-reads", () => p.c("design-find", extra.find ?? ""));
			});
		}));
	},
});
