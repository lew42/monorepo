import { Page, md, demo, div, a } from "/app.js";
import { palette } from "../parts.js";
import { table } from "./table.js";

const head = ["module", "tier", "lines"];
const rows = [["View", "core", "641"], ["Page", "core", "363"], ["Router", "core", "186"]];

export default new Page({
	meta: import.meta,
	title: "Data table",
	description: "A head row and a body — the base theme had already finished this one.",
	icon: "table_chart",

	content(){

		palette(
			["ui.table(head, rows)", () => table(head, rows)],
			["…c(\"num\", …)", () => table.c("num", head, rows)],
			["a cell can be a function", () => table(["module", "docs"],
				[["View", () => a.c("page-link", "readme").href("/framework/core/View/")]])],
		);

		md("## Calling it");

		demo(() => {
			table(["module", "tier", "lines"], [["View", "core", "641"], ["Page", "core", "363"]]);
		}, "Two arrays. **Zero classes on the markup** — `framework.css` already gives `table` `border-collapse`, `th`/`td` a border and padding, and `th` a `--tint` fill with a left-aligned label.");

		md("A cell may be a **function** instead of a string, which is how a link, a badge or a `<kbd>` gets into a column:");

		demo(() => {
			table(["key", "does"], [
				[() => a.c("page-link", "Ctrl K").href("#"), "opens the palette"],
			]);
		}, "The function runs with the `<td>` as captor, so it is written exactly like page code.");

		md("## The one declaration, and it is a bug report");

		md("`.ui-table { width: 100% }`. `framework.css` gives `table` `display: block; width: max-content; overflow-x: auto` so a wide table scrolls itself — and the side effect is that a small one shrink-wraps, 187px inside a 320px card.\n\nMoving the fix onto that base rule was **measured across all 49 tables on the site**: 24 were already full width, 25 stretched, and the worst were the narrow ones `max-content` exists to protect — a two-column `module | lines` table went 161px → 797px. A key/value table with 600px of white in the middle is worse than a shrink-wrapped preview, so the declaration stays here, where the box genuinely wants to fill its stage.");

		md("## `.c(\"num\")` — the alignment utility that doesn't exist");

		md("`text-align` has no utility class, so a numeric column used to be one inline declaration per cell. `.ui-table.num` aligns every column but the first to the end, which is the shape a numeric table almost always has. If yours isn't that shape, the honest answer is still one inline declaration.");

		md("Next: [Form field](/framework/ui/field/) — the first one that is a template rather than a function.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", () => table(head, rows))); },
});
