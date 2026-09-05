import { Page, View, div, h3, h4, p, a, span, strong, icon, md } from "/app.js";

View.stylesheet(import.meta, "generated.css");

/* Page trees the generator wrote out — real modules, one directory per page.
 *
 * ⚠ The `children:` line below is REWRITTEN by the Export control on
 *   /framework/core/Page/generator/ (export.js). Add a tree by exporting it;
 *   remove one by deleting its directory and its name from that line.
 *
 * UX rethink, 2026-09-05 — the realm has exactly one export, and yesterday's
 * verdict was that the plain card wall (`this.previews()`, a `.grid.auto` of
 * `--column: 14em` tracks) made it WORSE: one 200px card sitting in a grid still
 * sized for many. Replaced with the owner's 3-column card (brief, 2026-09-05):
 * left = what it is, centre = its shape (the seed's own branches — Journal,
 * Backlog — read straight off `page.children`, so a second export draws its
 * OWN shape with no new code), right = its numbers. A dashed "nothing else
 * yet" slot sits under it so the emptiness reads as a place, not a bug.
 * Measured (task ai/2026-09-05/ux-generated): width used at 3440 went from the
 * card's own ~230px (7%) to the row's full ~1152px column width (33.5% of
 * 3440 — the column's OWN ceiling, `page-column-large`'s 64em max; see below).
 *
 * Size: still `large`, not touched again tonight. `fill` was tried and reverted
 * 2026-08-31/09-04 (documented in that day's log): `fill`'s `flex: 1 1 100%`
 * claims the row even against a column OPENED UNDER `seed-7`, squeezing
 * `seed-7/vtabs/prose` to its 288px floor and overflowing it 11-16%. That is a
 * real, measured fence, not a shortcut — the ~1856px of column-row space past
 * this page's own 64em ceiling is the site's Finder-style columns shell
 * waiting for a sibling column to open, and belongs to that shell, not to one
 * realm's width word.
 */

// A seed's own branches, generically — however many a tree has, drawn straight
// off the resolved child pages the router already fetched for the wall
// (`depth: 2` is this page's own default, and reaches exactly this far: the
// export itself, and ITS children). No guess at a deeper shape than the
// framework actually loaded. ⚠ Built INSIDE the caller's own capture callback
// (View.js: "capturing is synchronous") — computed ahead of time, its elements
// land in whichever box happened to be capturing at that moment, silently.
function seed_card(root, name, page){
	const nav = { url: root.url + name + "/", label: page?.title ?? name, description: page?.description };

	return div.c("generated-seed page-preview", () => {
		div.c("flex v gap", () => {
			h3.c("flex gap", () => { icon(page?.icon ?? "account_tree"); span(nav.label); });
			if (nav.description) p.c("muted", nav.description);
			a.c("btn").href(nav.url).append("Open " + nav.label);
		});

		if (page?.children?.size) div.c("generated-seed-shape flex v gap", () => {
			h4("Its shape");
			div.c("generated-branches", () => page.children.forEach((child, cname) => {
				span.c("generated-branch", child?.title ?? cname);
			}));
		});
	});
}

// The next slot — always present, so the page never looks finished with only
// one card in it. Points straight at the control that fills it.
function next_slot(){
	return div.c("generated-slot", () => {
		icon("add_circle_outline");
		p(() => {
			strong("Nothing else exported yet. ");
			span("Roll or type a tree in the ");
			a("generator").href("/framework/core/Page/generator/");
			span(", name it, and press Export — it lands here as a second card.");
		});
	});
}

export default new Page({
	meta: import.meta,
	title: "Generated",
	description: "Page trees exported from the generator — the same tree, as files you can edit.",
	icon: "output",
	index: true,
	width: "large",

	children: "seed-7",

	content(){
		md("Each card below is one **tree**: a set of pages someone rolled or typed in the [generator](/framework/core/Page/generator/), named, and exported. Exporting writes real files here — a directory, an ordinary `page.js` in it, nothing left generated. Open a card and it is a columns tree like any other; open its files and edit them like any other page. ([how this works](/imagine/generated/readme/))");

		div.c("flex v gap", () => {
			this.children.forEach((page, name) => seed_card(this, name, page));
			next_slot();
		}).style("--gap", "1em");
	},
});
