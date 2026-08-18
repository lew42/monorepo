import { Page, md, demo, div, a } from "/app.js";
import { table } from "./table.js";

const data = () => table(["module", "tier", "lines"],
	[["View", "core", "641"], ["Page", "core", "363"], ["Router", "core", "186"]]);

const numeric = () => table.c("num", ["module", "lines"],
	[["View", "641"], ["Page", "363"], ["Router", "186"]]);

const cells = () => table(["key", "does"], [
	[() => a.c("page-link", "Ctrl K").href("#"), "opens the palette"],
	[() => a.c("page-link", "readme").href("/framework/core/View/"), "the design record"],
]);

const wide = () => table(["module", "tier", "lines", "classes", "exports", "callers", "last touched"], [
	["View", "core", "641", "1", "38", "61", "2026-08-17"],
	["Page", "core", "363", "1", "9", "44", "2026-08-16"],
	["Router", "core", "186", "1", "4", "12", "2026-08-11"],
]);

export default new Page({
	meta: import.meta,
	title: "Data table",
	description: "A head row and a body — the base theme had already finished this one.",
	icon: "table_chart",

	children: [
		demo.page("num", numeric, {
			note: "`.c(\"num\")` aligns every column but the first to the end, which is the shape a numeric table almost always has. `text-align` has no utility class, so this is the one place one is missed — and if your table isn't that shape, the honest answer is still one inline declaration." }),

		demo.page("wide", wide, {
			note: "Seven columns, and **drag the stage narrow**: the table scrolls itself rather than squeezing or spilling. That is `framework.css`'s `display: block; width: max-content; overflow-x: auto` on every `table` on the site — the same declaration whose side effect the note below is about. Nothing was added here; a wide table is what the base rule exists for." }),

		demo.page("cells", cells, {
			note: "A cell may be a **function** instead of a string, which is how a link, a badge or a `<kbd>` gets into a column. The function runs with the `<td>` as captor, so it is written exactly like page code." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(data, steer).ac("bleed"),
			def: data,
			file: new URL("table.js", import.meta.url).pathname,
			note: "Two arrays. **Zero classes on the markup** — `framework.css` already gives `table` `border-collapse`, `th`/`td` a border and padding, and `th` a `--tint` fill with a left-aligned label.",
		});

		md("## The one declaration, and it is a bug report");

		md("`.ui-table { width: 100% }`. `framework.css` gives `table` `display: block; width: max-content; overflow-x: auto` so a wide table scrolls itself — and the side effect is that a small one shrink-wraps, 187px inside a 320px card.\n\nMoving the fix onto that base rule was **measured across all 49 tables on the site**: 24 were already full width, 25 stretched, and the worst were the narrow ones `max-content` exists to protect — a two-column `module | lines` table went 161px → 797px. A key/value table with 600px of white in the middle is worse than a shrink-wrapped preview, so the declaration stays here, where the box genuinely wants to fill its stage.");

		md("Next: [Form field](/framework/ui/field/) — the first one that is a template rather than a function.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", data)); },
});
