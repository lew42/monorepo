import View, { div, span, h4, input, button } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";

/* css: .browse, .browse-rail, .browse-wall, .browse-facet-head, .browse-more */
View.stylesheet(import.meta, "browse.css");

// browse(bands, tokens, options) — wall of previews with sticky filter rail
// ⚠ `browse` not `browser`: Doc.browser() is the file tab; the name matters
// ⚠ Bands are DECLARED, never derived from each child's group:
// ⚠ ONE GRID PER BAND. History, options, traps: doc/browse-notes.md
Page.prototype.browse = function(bands, tokens, options){
	const opts = { facets: [], search: "", rail: true, ...options };
	const state = { group: "", text: "", shown: opts.cap ?? Infinity, facet: {} };
	let $wall;

	const redraw = () => $wall.empty(() => wall(this, bands, state, opts, redraw));

	return div.c("browse flex gap wrap", () => {
		if (opts.rail) rail(this, bands, state, opts, () => { state.shown = opts.cap ?? Infinity; redraw(); });

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

		// ⚠ Cap is over the WHOLE wall, not per band
		const shown = kept.slice(0, Math.max(0, state.shown - drawn));
		drawn += shown.length;
		held += kept.length - shown.length;

		if (!shown.length) return;

		// ⚠ Heading sits OUTSIDE grid so auto-fit can collapse empty tracks
		div.c("browse-band flex v gap", () => {
			h4.c("page-previews-group", group).attr("data-band", group);
			div.c("page-previews", () => shown.forEach(({ page: child, nav }) => child.preview(nav)))
				.style("--gap", "1em");
		}).style("--gap", "0.5em");
	});

	// ⚠ A wall filtered to nothing is a dead end; the rail is sticky for this reason.
	if (!drawn) return void span.c("muted", "Nothing matches. Clear the search, or pick Everything.");

	// ⚠ Only when a cap was asked for; existing callers draw exactly the same markup
	if (held) button.c("browse-more", `Show ${Math.min(held, opts.cap)} more — ${held} of ${drawn + held} not drawn yet`)
		.click(() => { state.shown += opts.cap; redraw(); });
}

const entries = (page, bands) => new Map(Object.entries(bands).map(([label, band]) =>
	[label, band.split(" ").map(path => entry(page, path)).filter(Boolean)]));

// ⚠ owner/name BORROWS a grandchild; owning page builds nav so card points there
function entry(page, path){
	const [owner, name] = path.includes("/") ? path.split("/") : [null, path];
	const parent = owner ? page.children.get(owner) : page;
	const child = parent?.children.get(name);

	if (!child) return null;

	const nav = parent.nav_for(name);
	return { page: child, nav: owner ? { ...nav, label: child.title } : nav };
}

// ⚠ Search box must NOT be in the row redraw or it loses focus per keystroke
function rail(page, bands, state, opts, redraw){
	const counts = entries(page, bands);
	const all = [...counts.values()].flat();
	const total = all.length;
	let $rows;

	// ⚠ Same button class as band rows; no facets = render byte for byte
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

		// Bands are the last facet, the one every wall has
		if (opts.facets.length) h4.c("browse-facet-head", "Band");
		row(opts.facets.length ? "Every band" : "Everything", () => state.group = "", !state.group, total);
		counts.forEach((band, group) => row(group, () => state.group = group, state.group === group, band.length));
	};

	// `rail` is the framework word (core/Page/Page.css): basis+column+gap+pin+scrollport
	return div.c("browse-rail rail", () => {
		input().attr("type", "search").attr("placeholder", `Search ${total}`)
			.on("input", event => { state.text = event.target.value; redraw(); });

		$rows = div.c("flex v gap", rows).style("--gap", "0.15em");
	});
}

// Empty means everything; match() is the escape hatch for non-equality props
const matches = (page, facet, value) => {
	if (!value) return true;
	if (facet.match) return facet.match(page, value);

	const held = facet.of ? facet.of(page) : page[facet.key];
	return Array.isArray(held) ? held.includes(value) : held === value;
};

// ⚠ Needle is card's OWN words, not textContent; live render includes all inner words
const hit = ({ page, nav }, state, opts) => {
	if (opts.facets.some(facet => !matches(page, facet, state.facet[facet.key]))) return false;

	const needle = state.text.trim().toLowerCase();
	const extra = opts.search ? opts.search.trim().split(/\s+/).map(key => page[key]) : [];

	return !needle || [nav.label, page.title, page.description, page.name, ...extra]
		.flat().filter(Boolean).join(" ").toLowerCase().includes(needle);
};

export default Page.prototype.browse;
