import { Page, md, input, img } from "/app.js";
import { wall } from "../foreign.js";

// A picture of the Column-shapes wall — one of the six lists, and the most visual —
// standing in for all six on the Gallery index. A card thumb is never a live
// instance. Regenerate with `make-thumbs.mjs` (session scratchpad) if the six change.
const THUMB = new URL("./thumb.jpg", import.meta.url);

/**
 * The lists. Every one is a **data array of paths** — curated, never crawled — handed
 * to `wall()`, which imports each `page.js` and draws that page's own `preview()`.
 *
 * They are separate pages on purpose: a list only imports when you open its column, so
 * the gallery costs one page.js until you ask it for more.
 */

const BLOCKS = pages("core/Page/overview", "columns tabs vtabs list wall prose");
const NAV    = pages("core/Page/overview", "page children mounts replace route labels");
const BOX    = pages("core/Page/overview", "shell measure inset region full width render");
const RECIPE = pages("core/Page/overview", "rail grid flush crumbs catalog dashboard strip landing docs site");

const SHAPES = [
	"core/Page/overview/columns/finder",
	"core/Page/overview/columns/uses/docs",
	"core/Page/overview/columns/uses/inbox",
	"core/Page/overview/columns/uses/split",
	"core/Page/overview/columns/uses/workbench",
	"core/Page/overview/columns/examples/grids",
	"core/Page/overview/columns/examples/looks",
	"core/Page/overview/columns/refs",
	"core/Page/overview/columns/panels",
].map(url);

const LAYOUTS = "mail dashboard chat feed docs landing pricing split gallery wire hero masonry anatomy"
	.split(" ").map(name => url("styles/layouts/" + name));

// "a b c" under one dir -> ["/framework/<dir>/a/", …]. The lists stay readable as words.
function pages(dir, names){ return names.split(" ").map(name => url(dir + "/" + name)); }
function url(path){ return "/framework/" + path + "/"; }

// A title filter over the wall below — client-side, over the titles wall() already
// draws (no data of its own to keep in step). Cards arrive async, so this reads the
// DOM at each keystroke rather than a copy of the titles; `getWall` is a closure, not
// the wall itself, so the box can be built (and drawn first, above the cards) before
// the wall it reads exists yet. Worth the row only past ~8 cards — the three small
// lists (six paths each) never need it.
const filter = getWall => input().ac("gal-filter").attr("type", "search").attr("placeholder", "Filter by title…")
	.on("input", e => {
		const needle = e.target.value.trim().toLowerCase();

		getWall().el.querySelectorAll(".page-preview").forEach($card => {
			const title = ($card.querySelector(".page-preview-title")?.textContent ?? "").toLowerCase();
			$card.style.display = !needle || title.includes(needle) ? "" : "none";
		});
	});

// One list page: a sentence, then the wall. `width: "large"` — up to 64em, which is four
// tracks of cards at 1920 AND leaves the rails to its left on screen. `full` gave the
// wall the whole row and collapsed the trail you were browsing with.
// `icon`/`description` are for the CARD this list gets one level up, on Lists' own
// index — plain text stripped of the markdown `blurb` already carries, so there is
// only one sentence per list to write, not two.
const list = (blurb, paths, column, icon) => ({
	width: "large",
	icon,
	description: blurb.replace(/[*`]/g, ""),
	content(){
		md(blurb);

		let $wall;
		if (paths.length > 8) filter(() => $wall);
		$wall = wall(paths).style("--column", column ?? "15em");
	},
});

export default new Page({
	meta: import.meta,
	title: "Lists",
	description: "Curated lists of every building block, shape and layout the site has.",
	icon: "list",

	/* ⚠ NOT `classes: "default"`. It is tempting — the gallery opens on its own rail
	   otherwise — but a default column that is also NAVIGATED TO hides itself: Page.css's
	   `.page-column-pages:has(> .page:is(.active-page, .active-ancestor)) > .page.default`
	   matches the default page against ITSELF the moment the Router marks it, and the
	   whole branch went blank (measured 2026-08-29). `default` is only safe on a column
	   nothing routes to. */

	// `index: true` + `previews()`: this was a bare list of six names with no card at
	// all — the one spot in the whole realm with less visual weight than the plain-card
	// wall one level up. Six cards, same shape as the parent, so a reader sees one wall
	// pattern in Gallery, not two.
	index: true,
	preview(nav){
		return this.preview_card(nav, () => img().attr("src", THUMB).attr("alt", "One of the six lists, as a card wall")
			.style({ width: "100%", height: "100%", objectFit: "cover" }));
	},

	content(){
		md("Six lists. Each one is an array of paths in `lists/page.js` — nothing crawls.");
		this.previews().style("--column", "16em");
	},

	children: {
		"Building blocks": list("The six words a page's **body** is made of.", BLOCKS, undefined, "widgets"),
		"Navigation":      list("The six that decide **where a child goes** when you pick it.", NAV, undefined, "route"),
		"The box":         list("How a page **sizes itself** — the shell, the measure, the width words.", BOX, undefined, "crop_free"),
		"Recipes":         list("Ten shapes **composed** from the words above.", RECIPE, undefined, "receipt_long"),
		"Column shapes":   list("Every arrangement built on `columns()` — the finder, four uses, the labs.", SHAPES, undefined, "view_column"),
		"Layouts":         list("Thirteen whole-screen layouts from `styles/layouts/`.", LAYOUTS, "17em", "dashboard"),
	},
});
