import { Doc, md, demo, div, span, ui } from "/app.js";
import Filter from "./Filter.js";
import FilterChips from "./FilterChips.js";

/* Honest data: real files in THIS repo, `wc -l` the day this page was written
 * (2026-08-21) — not invented rows. `kind` is mechanical (`grep -c "^export
 * default class\|^class "`), not a guess. */
const MODULES = [
	{ name: "View.js", tier: "core", kind: "class", lines: 472 },
	{ name: "Page.class.js", tier: "core", kind: "class", lines: 306 },
	{ name: "Router.js", tier: "core", kind: "class", lines: 146 },
	{ name: "App.js", tier: "core", kind: "class", lines: 115 },
	{ name: "Sidebar.js", tier: "core", kind: "class", lines: 124 },
	{ name: "Tree.js", tier: "ux", kind: "class", lines: 147 },
	{ name: "TreeKeys.js", tier: "ux", kind: "class", lines: 126 },
	{ name: "Wizard.js", tier: "ux", kind: "class", lines: 227 },
	{ name: "Auth.js", tier: "ux", kind: "class", lines: 175 },
	{ name: "MagicAuth.js", tier: "ux", kind: "class", lines: 21 },
	{ name: "Filter.js", tier: "ux", kind: "class", lines: 92 },
	{ name: "tree.js", tier: "ui", kind: "template", lines: 106 },
	{ name: "table.js", tier: "ui", kind: "template", lines: 24 },
	{ name: "browse.js", tier: "ext", kind: "function", lines: 143 },
	{ name: "tabs.js", tier: "ext", kind: "function", lines: 84 },
	{ name: "exhibit.js", tier: "ext", kind: "function", lines: 177 },
	{ name: "Doc.js", tier: "ext", kind: "class", lines: 283 },
	{ name: "Panel.js", tier: "ext", kind: "class", lines: 201 },
	{ name: "md.js", tier: "ext", kind: "function", lines: 185 },
	{ name: "framework.css", tier: "styles", kind: "util", lines: 611 },
];

const TIERS = ["All", "core", "ux", "ui", "ext", "styles"];

const empty_msg = () => span.c("muted", "No modules match. Clear the search, or pick All.");

// ---- the three regions — each a function of ROWS, nothing else ------------

const stat_tiles = rows => {
	const total = rows.reduce((sum, r) => sum + r.lines, 0);
	const avg = rows.length ? Math.round(total / rows.length) : 0;
	const items = [["shown", String(rows.length)], ["total lines", String(total)], ["avg lines", String(avg)]];

	return div.c("grid gap auto", () => items.forEach(([label, value]) =>
		div.c("surface pad flex v gap", () => {
			div.c("h4 muted", label);
			div.c("h2", value);
		}).style("--gap", "0.1em"))).style("--column", "9em");
};

const card = row => div.c("surface pad flex v gap", () => {
	div.c("h4 muted", row.tier);
	div.c("h3", row.name);
	div.c("flex gap v-center split", () => {
		span.c("muted", row.kind);
		span.c("muted", row.lines + " lines");
	});
}).style("--gap", "0.2em");

const wall = rows => rows.length
	? div.c("grid gap auto", () => rows.forEach(card)).style("--column", "14em")
	: empty_msg();

const data_table = rows => rows.length
	? div(() => ui.table(["Name", "Tier", "Kind", "Lines"],
		rows.map(r => [r.name, r.tier, r.kind, String(r.lines)]))).style("overflowX", "auto")
	: empty_msg();

// The dashboard: one Filter, three empty boxes it never touches directly —
// `refresh()` is the page's own wire from `changed(predicate)` to the DOM.
const dashboard = () => {
	let filter, $stats, $wall, $table;

	const refresh = predicate => {
		const rows = MODULES.filter(predicate);
		$stats.empty(() => stat_tiles(rows));
		$wall.empty(() => wall(rows));
		$table.empty(() => data_table(rows));
	};

	const $box = div.c("flex v gap", () => {
		filter = new Filter({
			segments: TIERS, segment_field: "tier", search_field: "name",
			placeholder: "Filter modules…", onChange: refresh,
		});

		$stats = div();

		div.c("flex auto wrap gap", () => { $wall = div(); $table = div(); }).style("--column", "22em");
	});

	refresh(filter.predicate());
	return $box;
};

// The words proof: a lighter pair (bar + tiles, not the whole dashboard) —
// `ux/Tree/page.js`'s "words" child is the precedent for keeping it small.
const words_demo = () => {
	const mini = () => {
		let filter, $stats;

		const $box = div.c("flex v gap", () => {
			filter = new Filter({
				segments: TIERS, segment_field: "tier", search_field: "name",
				placeholder: "Filter modules…", onChange: p => $stats.empty(() => stat_tiles(MODULES.filter(p))),
			});
			$stats = div();
		});

		$stats.empty(() => stat_tiles(MODULES.filter(filter.predicate())));
		return $box;
	};

	return div.c("flex v gap-2em", () => {
		div.c("flex v gap", () => { div.c("h4 muted", "default"); mini(); }).style("--gap", "0.5em");
		div.c("flex v gap", () => { div.c("h4 muted", "ui-contrast ui-compact"); mini().ac("ui-contrast ui-compact"); }).style("--gap", "0.5em");
	});
};

const chips_demo = () => new FilterChips({
	segments: TIERS, segment_field: "tier", search_field: "name", placeholder: "Filter modules…",
});

export default new Doc({
	meta: import.meta,
	title: "Filter",
	description: "A segment + search class that drives several regions at once — the coordinated-regions dashboard.",
	icon: "filter_alt",

	files: "Filter.js FilterChips.js page.js readme.md",
	notes: "decisions",

	children: [
		demo.page("chips", chips_demo, {
			note: "`class FilterChips extends Filter` — one new piece, `chip_list()`. `set()`, `query()`, `predicate()` travel down untouched. Pick a tier, type a letter, then dismiss either chip with its ×." }),

		demo.page("words", words_demo, {
			note: "The bar and the stat strip, twice — the lower pair wearing `ui-contrast ui-compact`. A **ux never ships a compact mode**: both tiers read the same tokens, so the config word re-skins the class and the template it composed in one pass." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(dashboard, steer).ac("bleed"),
			def: dashboard,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**One wire.** `changed(predicate)` fires from `set()` and `query()` — never a DOM read, never a region name. The page owns `MODULES` and three empty boxes; every keystroke and every segment click runs the same `refresh(predicate)` against all three. Drag the stage: at 3440 the bar spans, a stat strip sits under it, and the wall and table share the row below on `flex auto` (`--column: 22em`, so they stack once the container can't hold two); the table gets its own `overflow-x: auto` box.",
		});

		md('## Type "tr"');

		md('`Tree.js`, `TreeKeys.js` and `tree.js` are the only three names that contain it — the stat count, the card wall and the table all narrow to the same three rows on the same keystroke, because every region reads `filter.predicate()` and nothing else. Click a tier segment instead and the same wire fires from `set()`.');

		md("## What Filter does not do");

		md("It never touches the wall or the table. `MODULES.filter(predicate)` and three `.empty()` calls are the page's — the same split `Tree`'s `selected_change(node)` draws (`/framework/ux/Tree/`): the class remembers its own two facts (`active`, `needle`) and hands out a function; the caller decides what *changed* means for its own DOM. **Zero new CSS** — the bar is `ui/toolbar`'s `filter()` template verbatim, selection is the existing `.prim`, the wall is `grid auto`, the split is `flex auto`. [`doc/decisions.md`](/framework/ux/Filter/doc/decisions/) has the layout questions and what 3440 needed that 1280 didn't.");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Filter({ segments: TIERS }))); },
});
