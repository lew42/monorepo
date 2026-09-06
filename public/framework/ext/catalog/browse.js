import View, { div, span, h4, input, button } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";

/* css: .browse, .browse-rail, .browse-wall, .browse-facet-head, .browse-more */
View.stylesheet(import.meta, "browse.css");

/**
 * browse(bands, tokens, options) — `previews()` as a WALL YOU BROWSE: a sticky filter
 * rail beside a wall of bands, one grid per band.
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
 * ── `options` — the three things a big catalogue needs, all optional ─────────────
 *
 *     cap      how many cards to draw before a "show more" control. Default: all of
 *              them. `core/Layout` passes 60 — two full rows at 3440 on a 20em
 *              column — because a card is a PICTURE, not a live instance.
 *     facets   extra rail rows, each read STRAIGHT OFF a child page's own props.
 *              There is no schema and nothing registers: a layout page declares
 *              `columns: 2` and a facet named `columns` can filter on it.
 *
 *                  facets: [
 *                    { head: "Columns", key: "columns", values: [1, 2, 3, 4],
 *                      label: n => n + " columns" },
 *                    { head: "Tags", key: "tags", all: "Every tag" },
 *                  ]
 *
 *              `values` may be left out for a prop whose values are worth collecting
 *              from the wall itself (`tags`, an array). `label` names a value in the
 *              reader's words; `match(page, value)` is the escape hatch for a prop
 *              that is not a plain equality (a boolean read as two named states).
 *     search   extra prop names the search box reads, space separated — the default
 *              needle is the card's label, title, description and name.
 *
 * FILTERS DEFAULT TO ALL. Every facet starts empty, and empty means "everything", so
 * the first thing a reader sees is the whole set and a filter can only take away.
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
Page.prototype.browse = function(bands, tokens, options){
	const opts = { facets: [], search: "", ...options };
	const state = { group: "", text: "", shown: opts.cap ?? Infinity, facet: {} };
	let $wall;

	const redraw = () => $wall.empty(() => wall(this, bands, state, opts, redraw));

	return div.c("browse flex gap wrap", () => {
		rail(this, bands, state, opts, () => { state.shown = opts.cap ?? Infinity; redraw(); });

		$wall = div.c("browse-wall flex v gap", () => wall(this, bands, state, opts, redraw))
			.style(tokens ?? {});
	});
};

function wall(page, bands, state, opts, redraw){
	let drawn = 0, held = 0;

	entries(page, bands).forEach((band, group) => {
		if (state.group && state.group !== group) return;

		const kept = band.filter(entry => hit(entry, state, opts));
		if (!kept.length) return;

		// ⚠ The cap is over the WHOLE wall, not per band: a reader asked for sixty
		//   cards, not sixty in each of four bands.
		const shown = kept.slice(0, Math.max(0, state.shown - drawn));
		drawn += shown.length;
		held += kept.length - shown.length;

		if (!shown.length) return;

		/* ⚠ The heading sits OUTSIDE the grid, not in it as `previews()` puts it. A
		   `.page-previews-group` spans `1 / -1`, which means every track holds an item —
		   so `auto-fit` had nothing to collapse and a five-card band still drew eight
		   tracks, four of them empty. Measured at 3440: 2626px of grid for 1640px of
		   cards. Out of the grid, the tracks collapse and the band fills its row. */
		div.c("browse-band flex v gap", () => {
			h4.c("page-previews-group", group);
			div.c("page-previews", () => shown.forEach(({ page: child, nav }) => child.preview(nav)))
				.style("--gap", "1em");
		}).style("--gap", "0.5em");
	});

	// ⚠ A wall filtered to nothing is a dead end; the rail is sticky for this reason.
	if (!drawn) return void span.c("muted", "Nothing matches. Clear the search, or pick Everything.");

	// ⚠ Only when a cap was asked for. Without one `shown` is Infinity, `held` is 0,
	//   and every existing caller draws exactly the markup it drew before.
	if (held) button.c("browse-more", `Show ${Math.min(held, opts.cap)} more — ${held} of ${drawn + held} not drawn yet`)
		.click(() => { state.shown += opts.cap; redraw(); });
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

/* The rail: a search, one row per band with its count, and a row per value of every
   facet the caller declared. The rows redraw themselves so the lit one is read off
   `state` rather than pushed onto the DOM; the ⚠ search box must NOT be inside that
   redraw, or it loses focus per keystroke. */
function rail(page, bands, state, opts, redraw){
	const counts = entries(page, bands);
	const all = [...counts.values()].flat();
	const total = all.length;
	let $rows;

	// ⚠ THE SAME BUTTON THE BAND ROWS ALWAYS WERE, class for class — a facet row is
	//   not a new control, and a wall with no facets must render byte for byte.
	const row = (label, pick, lit, count) => button.c("flex gap v-center split", () => {
		span(label);
		span.c("muted", String(count));
	})
		.ac(lit && "prim")
		.click(() => { pick(); $rows.empty(rows); redraw(); });

	const count = (facet, value) => all.filter(one => matches(one.page, facet, value)).length;

	const facet_rows = facet => {
		const key = facet.key;
		const values = facet.values ?? [...new Set(all.flatMap(one => [facet.of ? facet.of(one.page) : one.page[key]].flat()).filter(v => v != null))].sort();

		h4.c("browse-facet-head", facet.head ?? key);
		row(facet.all ?? "Everything", () => state.facet[key] = "", !state.facet[key], total);
		values.forEach(value => row((facet.label ?? String)(value), () => state.facet[key] = value,
			state.facet[key] === value, count(facet, value)));
	};

	const rows = () => {
		opts.facets.forEach(facet_rows);

		// The bands themselves are the last facet, and the only one every wall has.
		if (opts.facets.length) h4.c("browse-facet-head", "Band");
		row(opts.facets.length ? "Every band" : "Everything", () => state.group = "", !state.group, total);
		counts.forEach((band, group) => row(group, () => state.group = group, state.group === group, band.length));
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

/* Does a page match one facet's value? Empty means everything. The default reads the
   prop straight off the page — `includes` for an array, `===` for anything else — and
   `match` is the escape hatch for a prop that is not a plain equality. */
const matches = (page, facet, value) => {
	if (!value) return true;
	if (facet.match) return facet.match(page, value);

	const held = facet.of ? facet.of(page) : page[facet.key];
	return Array.isArray(held) ? held.includes(value) : held === value;
};

/* ⚠ The needle is the card's OWN words — never its `textContent`. A card here holds a
   live render, so its text includes every word inside the thing: searching `mail`
   matched two layouts that merely contain the word. */
const hit = ({ page, nav }, state, opts) => {
	if (opts.facets.some(facet => !matches(page, facet, state.facet[facet.key]))) return false;

	const needle = state.text.trim().toLowerCase();
	const extra = opts.search ? opts.search.trim().split(/\s+/).map(key => page[key]) : [];

	return !needle || [nav.label, page.title, page.description, page.name, ...extra]
		.flat().filter(Boolean).join(" ").toLowerCase().includes(needle);
};

export default Page.prototype.browse;
