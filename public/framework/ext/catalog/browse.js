import View, { div, span, h4, input, button } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";

/* css: .browse, .browse-rail, .browse-wall */
View.stylesheet(import.meta, "browse.css");

/**
 * browse(bands, tokens) — `previews()` as a WALL YOU BROWSE: a sticky filter rail
 * beside a wall of bands, one grid per band.
 *
 *     const BANDS = { Surfaces: "card toolbar panel", Data: "table timeline" };
 *     content(){ return this.browse(BANDS, { "--column": "18em" }); }
 *
 * The sibling of `catalog()`, and the distinction is whether the reader is CHOOSING
 * from the set or reading it in order: a catalog is a rail beside the one child you
 * picked, browse spends the whole width on the set. Both draw the same `preview()`
 * cards — there is no second card shape here (RULE#7).
 *
 * ⚠ `browse`, not `browser`: `Doc.browser()` is the Files tab's file browser, so a
 * method of that name on a Doc resolves to THAT and draws a file tree where the wall
 * should be, with nothing in the console. The class name is the registry.
 *
 * `bands` is an object of `label: "name name name"`, declared once and in reading
 * order; the caller derives its own `children:` from it so no name is written twice.
 * `tokens` lands on the wall — `--column` is the one that matters, and it is a
 * legibility argument: a thumb is the page at `zoom-25`/`zoom-50`, so the card's
 * width times four (or two) is the width the thing inside it lays out at. `--gap`
 * there is the space BETWEEN bands; the gap between cards is the wall's own 1em,
 * because `--gap` inherits and a band that set it would retune every grid inside it.
 *
 * ⚠ Bands are DECLARED, never derived from each child's `group:`. Two of the four
 * bands on `styles/layouts/` cannot be expressed that way — one is made of
 * grandchildren, and one member belongs to another effort — and a taxonomy that
 * cannot express half the wall is not the taxonomy.
 *
 * ⚠ ONE GRID PER BAND. `previews()` emits one flat run with a full-width heading per
 * group, so a band of one renders a row holding one card. Per band, only a band's
 * LAST row can be ragged.
 *
 * The heading is the caller's: this returns the row, and a page that wants a title
 * puts one above it. Design record: readme.md.
 */
Page.prototype.browse = function(bands, tokens){
	const state = { group: "", text: "" };
	let $wall;

	return div.c("browse flex gap wrap", () => {
		rail(this, bands, state, () => $wall.empty(() => wall(this, bands, state)));

		$wall = div.c("browse-wall flex v gap", () => wall(this, bands, state))
			.style(tokens ?? {});
	});
};

function wall(page, bands, state){
	let shown = 0;

	entries(page, bands).forEach((band, group) => {
		if (state.group && state.group !== group) return;

		const kept = band.filter(entry => hit(entry, state.text));
		if (!kept.length) return;

		shown += kept.length;

		/* ⚠ The heading sits OUTSIDE the grid, not in it as `previews()` puts it. A
		   `.page-previews-group` spans `1 / -1`, which means every track holds an item —
		   so `auto-fit` had nothing to collapse and a five-card band still drew eight
		   tracks, four of them empty. Measured at 3440: 2626px of grid for 1640px of
		   cards. Out of the grid, the tracks collapse and the band fills its row. */
		div.c("browse-band flex v gap", () => {
			h4.c("page-previews-group", group);
			div.c("page-previews", () => kept.forEach(({ page: child, nav }) => child.preview(nav)))
				.style("--gap", "1em");
		}).style("--gap", "0.5em");
	});

	// ⚠ A wall filtered to nothing is a dead end; the rail is sticky for this reason.
	if (!shown) span.c("muted", "Nothing matches. Clear the search, or pick Everything.");
}

const entries = (page, bands) => new Map(Object.entries(bands).map(([label, band]) =>
	[label, band.split(" ").map(path => entry(page, path)).filter(Boolean)]));

/* A page, and the nav that addresses it. ⚠ `owner/name` BORROWS a grandchild — shown
   here and never moved, so the OWNING page builds the nav: `nav_for()` addresses a
   child at its own url, and building these here would point every borrowed card at
   this page. The borrowed label is the grandchild's own title. */
function entry(page, path){
	const [owner, name] = path.includes("/") ? path.split("/") : [null, path];
	const parent = owner ? page.children.get(owner) : page;
	const child = parent?.children.get(name);

	if (!child) return null;

	const nav = parent.nav_for(name);
	return { page: child, nav: owner ? { ...nav, label: child.title } : nav };
}

/* The rail: a search, and one row per band with its count. The rows redraw themselves
   so the lit one is read off `state` rather than pushed onto the DOM; the ⚠ search box
   must NOT be inside that redraw, or it loses focus per keystroke. */
function rail(page, bands, state, redraw){
	const counts = entries(page, bands);
	const total = [...counts.values()].reduce((sum, band) => sum + band.length, 0);
	let $rows;

	const row = (label, group, count) => button.c("flex gap v-center split", () => {
		span(label);
		span.c("muted", String(count));
	})
		.ac(state.group === group && "prim")
		.click(() => { state.group = group; $rows.empty(rows); redraw(); });

	const rows = () => {
		row("Everything", "", total);
		counts.forEach((band, group) => row(group, group, band.length));
	};

	/* `rail` is the framework word now (core/Page/Page.css): the basis, the column,
	   the gap, the pin and the scrollport arrive together, and below 52em of the
	   PAGE — not the window — it becomes a sideways strip on its own line. The four
	   utilities it replaces (`basis flex v gap`) and browse.css's own sticky rule
	   said the same thing in two places. */
	return div.c("browse-rail rail", () => {
		input().attr("type", "search").attr("placeholder", `Search ${total}`)
			.on("input", event => { state.text = event.target.value; redraw(); });

		$rows = div.c("flex v gap", rows).style("--gap", "0.15em");
	});
}

/* ⚠ The needle is the card's OWN words — never its `textContent`. A card here holds a
   live render, so its text includes every word inside the thing: searching `mail`
   matched two layouts that merely contain the word. */
const hit = ({ page, nav }, text) => {
	const needle = text.trim().toLowerCase();

	return !needle || [nav.label, page.title, page.description, page.name]
		.filter(Boolean).join(" ").toLowerCase().includes(needle);
};

export default Page.prototype.browse;
