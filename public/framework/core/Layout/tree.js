import { div, span, h4, input, button } from "../View/View.js";

/* ── THE TREE — a wall of layouts you browse ──────────────────────────────────

   `ext/catalog/browse.js`'s wall, plus the three facets a layout page's own props
   make possible and the page cap the owner asked for ("some paging to avoid
   rendering 10000 at once").

   ⚠ THIS IS A NEAR-COPY OF `browse()`, ON PURPOSE AND NOT FOR LONG. The three
     facet rows and the cap are about twenty-five lines that belong IN `browse()`,
     on the same `state` object it already keeps — `ext/` was outside this task's
     write fence, so they live here instead. When the fence lifts they move, this
     file goes, and `page.js` calls `this.browse(BANDS)` like every other wall on
     the site. Nothing else here is new: the bands, the cards and the empty-wall
     sentence are browse's, unchanged.

   FILTERS DEFAULT TO ALL. Every facet starts empty, and empty means "everything" —
   so the first thing a reader sees is the whole catalogue, and a filter can only
   ever take things away.                                                        */

// The wall draws this many cards, then offers the next lot. Sixty is two full rows
// at 3440 with a 20em column, and a card is a PICTURE, not a live instance — so
// sixty of them cost about one live render. A probe lowers it to see the control.
export const CAP = { size: 60 };

export function tree(page, bands, tokens){
	const state = { group: "", text: "", columns: "", tag: "", status: "", shown: CAP.size };
	let $wall;

	const redraw = () => $wall.empty(() => wall(page, bands, state, redraw));

	return div.c("page-layout-tree wide flex gap wrap", () => {
		rail(page, bands, state, () => { state.shown = CAP.size; redraw(); });

		$wall = div.c("page-layout-wall flex v gap", () => wall(page, bands, state, redraw))
			.style(tokens ?? {});
	});
}

/* ── THE WALL ─────────────────────────────────────────────────────────────────
   One grid per band, in the order the bands were declared — One column first,
   because that is the order the owner asked to browse them in.
   ⚠ The heading sits OUTSIDE the grid. A full-width heading inside means every
     track holds an item, so `auto-fill` has nothing to collapse and a five-card
     band still draws eight tracks (measured at 3440: 2626px of grid for 1640px of
     cards). Out of the grid, the tracks collapse and the band fills its row. */
function wall(page, bands, state, redraw){
	let drawn = 0, held = 0;

	entries(page, bands).forEach((band, group) => {
		if (state.group && state.group !== group) return;

		const kept = band.filter(one => hit(one, state));
		if (!kept.length) return;

		const room = Math.max(0, state.shown - drawn);
		const shown = kept.slice(0, room);

		drawn += shown.length;
		held += kept.length - shown.length;

		if (!shown.length) return;

		div.c("page-layout-band flex v gap", () => {
			h4.c("page-previews-group", group);
			div.c("page-previews", () => shown.forEach(({ page: child, nav }) => child.preview(nav)))
				.style("--gap", "1em");
		}).style("--gap", "0.5em");
	});

	// ⚠ A wall filtered to nothing is a dead end; the rail is sticky for this reason.
	if (!drawn) return void span.c("muted", "Nothing matches. Clear the search, or pick Everything.");

	if (held) button.c("page-layout-more", `Show ${Math.min(held, CAP.size)} more — ${held} of ${drawn + held} not drawn yet`)
		.click(() => { state.shown += CAP.size; redraw(); });
}

const entries = (page, bands) => new Map(Object.entries(bands).map(([label, band]) =>
	[label, band.split(" ").map(name => entry(page, name)).filter(Boolean)]));

function entry(page, name){
	const child = page.children.get(name);
	return child ? { page: child, nav: page.nav_for(name) } : null;
}

/* ── THE RAIL — a search, the bands, and three facets read off the layouts ─────
   Every row is a plain prop read: `layout.columns`, `layout.tags`,
   `layout.approved`. There is no schema and nothing registers — which is the whole
   of "each layout can prescribe properties, and the filters can filter them". */
function rail(page, bands, state, redraw){
	const counts = entries(page, bands);
	const all = [...counts.values()].flat();
	const total = all.length;
	let $rows;

	const row = (label, key, value, count) => button.c("page-layout-facet flex gap v-center split", () => {
		span(label);
		span.c("muted", String(count));
	})
		.ac(state[key] === value && "prim")
		.click(() => { state[key] = value; $rows.empty(rows); redraw(); });

	const count = (key, value) => all.filter(one => matches(one.page, key, value)).length;

	const rows = () => {
		h4.c("page-layout-facet-head", "Columns");
		row("Everything", "columns", "", total);
		[1, 2, 3, 4].forEach(n => row(n === 4 ? "Four or more" : n + (n === 1 ? " column" : " columns"), "columns", n, count("columns", n)));

		h4.c("page-layout-facet-head", "Tags");
		row("Every tag", "tag", "", total);
		[...new Set(all.flatMap(one => one.page.tags ?? []))].sort()
			.forEach(tag => row(tag, "tag", tag, count("tag", tag)));

		h4.c("page-layout-facet-head", "Proof");
		row("Approved and draft", "status", "", total);
		row("Approved", "status", "approved", count("status", "approved"));
		row("Draft", "status", "draft", count("status", "draft"));

		h4.c("page-layout-facet-head", "Band");
		row("Every band", "group", "", total);
		counts.forEach((band, group) => row(group, "group", group, band.length));
	};

	/* `rail` is the framework word (core/Page/Page.css): the basis, the column, the
	   gap, the pin and the scrollport arrive together, and below 52em of the PAGE —
	   not the window — it becomes a sideways strip on its own line. */
	return div.c("page-layout-rail rail", () => {
		// ⚠ The search box must NOT be inside the redraw, or it loses focus per keystroke.
		input().attr("type", "search").attr("placeholder", `Search ${total} layouts`)
			.on("input", event => { state.text = event.target.value; redraw(); });

		$rows = div.c("flex v gap", rows).style("--gap", "0.15em");
	});
}

const matches = (layout, key, value) => !value
	|| (key === "columns" ? layout.columns === value
		: key === "tag" ? (layout.tags ?? []).includes(value)
		: key === "status" ? (value === "approved") === Boolean(layout.approved)
		: true);

/* ⚠ The needle is the card's OWN words — never its `textContent`. A card here holds
   a picture, but the layouts describe themselves in `intro` and `when`, which is
   where a reader's word actually is. */
function hit({ page, nav }, state){
	const needle = state.text.trim().toLowerCase();

	if (!matches(page, "columns", state.columns)) return false;
	if (!matches(page, "tag", state.tag)) return false;
	if (!matches(page, "status", state.status)) return false;

	return !needle || [nav.label, page.title, page.name, page.intro, page.when, (page.tags ?? []).join(" ")]
		.filter(Boolean).join(" ").toLowerCase().includes(needle);
}

export default tree;
