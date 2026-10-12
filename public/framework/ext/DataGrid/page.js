import { Doc, md, code } from "/app.js";
import DataGrid from "./DataGrid.js";

const STATUSES = ["queued", "working", "done", "failed"];
const NOTES = ["fixed the grip", "resized a column", "filtered by status", "nothing to report"];

// A small, seeded PRNG — not `Math.random()` — so the demo's 2,000 rows (and
// the perf.mjs drag against them) are the same shape on every reload instead
// of a fresh shuffle each time.
function seeded(n){
	let s = n >>> 0;
	return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

function make_rows(count){
	const rand = seeded(42);
	const start = Date.parse("2026-01-01");
	const rows = [];
	for (let i = 0; i < count; i++){
		rows.push({
			id: i,
			created: new Date(start + Math.floor(rand() * 240) * 864e5).toISOString().slice(0, 10),
			status: STATUSES[Math.floor(rand() * STATUSES.length)],
			amount: Math.round(rand() * 500 * 100) / 100,
			note: `Row ${i} — ${NOTES[Math.floor(rand() * NOTES.length)]}`,
		});
	}
	return rows;
}

const ROWS = make_rows(2000);

const COLUMNS = [
	{ key: "created", label: "Created", type: "date", min: 100 },
	// A small, fixed set of values (four statuses) — the auto filter notices
	// this on its own and builds checkbox chips, no config needed.
	{ key: "status", label: "Status", min: 90 },
	{ key: "amount", label: "Amount", type: "number", min: 90, format: v => "$" + v.toFixed(2) },
	// Free text — thousands of distinct values, so a checkbox filter would be
	// useless; `filter: false` says so plainly instead of building one anyway.
	// `width: 320` (not just `min: 220`) so a full sentence fits without
	// wrapping — a column's grid track is `minmax(min, width)`, so leaving
	// `width` at its 140px default here (narrower than `min`) was quietly
	// forcing a fixed 220px column no matter how much room the page actually
	// had, which is why the Note column wrapped even on a wide screen.
	{ key: "note", label: "Note", min: 220, width: 320, filter: false },
];

export default new Doc({
	meta: import.meta,
	title: "DataGrid",
	description: "A table that resizes, sorts and filters itself, and stays fast even with thousands of rows.",
	icon: "grid_on",

	files: "DataGrid.js DataGrid.css page.js readme.md perf.mjs doc/perf.md doc/architecture.md",
	notes: "architecture perf",

	content(){
		md("**A table that resizes, sorts and filters itself, and stays fast even with thousands of rows.** Drag a column's right edge to resize it, click a header to sort by it, and use the controls above the grid to filter — all live, right now, on the 2,000 rows below. Scroll inside the grid: only the rows actually on screen are ever in the page's DOM.");

		// Show, don't tell (Law 1): the live grid comes first, right under the
		// one-line description — a reader sees the thing itself before any code
		// or explanation. The usage snippet and the "why" prose follow it.
		//
		// `.ac("wide")` escapes the page's default ~40em prose measure
		// (`core/Page/Page.css`'s `.page > * { grid-column: main }` track) — a
		// data grid is wide content, not a paragraph, and without this it sat
		// capped to the reading column with 77% of a 3440px screen empty next
		// to it (review.mjs caught it; `.wide` is the framework's own existing
		// escape hatch, see `core/Page/doc/css.md`, not a new class).
		new DataGrid({ columns: COLUMNS, rows: ROWS }).ac("wide");

		code.js(`import DataGrid from "/framework/ext/DataGrid/DataGrid.js";

new DataGrid({
	columns: [
		{ key: "created", label: "Created", type: "date" },
		{ key: "status", label: "Status" },        // a small set of values -> checkbox filter, automatic
		{ key: "amount", label: "Amount", type: "number", format: v => "$" + v.toFixed(2) },
		{ key: "note", label: "Note", filter: false },  // free text -- no useful filter, so none is built
	],
	rows,   // a plain array, or an async function that returns one (a jsonl source)
});`);

		md("**The class architecture** — one grid, two views (table or rail) as a setting, and why the click from a row to its detail belongs to the page: [`doc/architecture.md`](./doc/architecture.md).");

		md("## Why it stays fast");

		md("Three things the AI Sessions tab's own hand-built grid did not do — [`doc/perf.md`](./doc/perf.md) has the measured numbers (6.9ms/frame, 10% CPU, dragging a column across these same 2,000 rows) and the exact listener count behind them:");

		md("- **One resize listener, not nine.** A drag reads which column from the element the pointer is actually on (`e.target.closest()`), instead of mounting a separate always-watching widget per column — the owner's own measured bug (108% CPU, 9 `document`-wide listeners) is structurally impossible here.\n"
			+ "- **One CSS variable per frame.** Dragging writes `--col-<key>` and nothing else — no re-render, no layout pass over every row.\n"
			+ "- **Windowing past 300 rows.** Only the rows actually on screen (plus a small buffer) exist in the page's DOM — open your browser's dev tools, scroll the grid, and watch the element count stay flat however far down you go.");

		md("## Columns are data, not code");

		md("Each column is one plain object: `key` (which property of a row it reads), `label` (the header text), and optionally `type` — `\"text\"` (the default), `\"number\"` or `\"date\"` — which decides both how that column **sorts** and what **filter** it gets, automatically: a date gets a from/to range, a small set of repeating values (status, role, category — ≤ 12 distinct values in the first 300 rows) gets checkbox chips, a number gets a min/max pair, and free text (a name, a note) gets none, because a checkbox list of 2,000 different sentences would help nobody. `format(value, row)` turns the raw value into what the cell shows. `filter: false` or `sort: false` opts a column out of either.");

		md("## Adopting it on real pages");

		md("The AI Sessions tab (`ai/sessions/SessionsPage.js`) is the next one to move to this — not done here, since a sibling task (@task-mastermind-sessions-tab-polish) is working in that same file this week. Its grid already has the right shape to swap in (`{key, label, min}` columns, one `--col-<key>` token each), so that move should be small once it's clear. Other tables on the site worth moving next, from a quick look at what exists: the Day log tables (`ai/`), the Readme-weight report (`ai/2026-10-03/readme-weight/`), and the cost-by-role list on a session's own detail page — none moved yet, this is just the list for whoever picks one up.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
