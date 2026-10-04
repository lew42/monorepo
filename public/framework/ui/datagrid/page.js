import { Page, md, demo, div } from "/app.js";
import { datagrid } from "./datagrid.js";

const columns = [
	{ key: "name", label: "Name" },
	{ key: "role", label: "Role" },
	{ key: "cost", label: "Cost", format: v => "$" + v.toFixed(2) },
];

const rows = [
	{ name: "Ada", role: "mastermind", cost: 1.4 },
	{ name: "Grace", role: "minion", cost: 0.6 },
	{ name: "Alan", role: "minion", cost: 0.9 },
];

const data = () => datagrid(columns, rows);

export default new Page({
	meta: import.meta,
	title: "Data grid (markup)",
	description: "The plain CSS-grid markup a data grid is built from — a column is data, a row is data, no behaviour yet.",
	icon: "table_rows",

	content(){
		md("**This is the UI half only — pure markup, no JavaScript runs after it draws.** Columns are declared as data (`{ key, label, width, format }`), and so are rows (a plain array of objects); `datagrid()` turns the two arrays into a CSS grid with one `--col-<key>` size token per column, the same mechanism the AI Sessions tab's own grid already uses by hand.");

		demo(() => data(), "`datagrid(columns, rows)` — two arrays in, a grid out. Nothing here resizes, sorts or filters: that needs JavaScript, so it lives one layer up.");

		md("Resize, sort, filter and \"only render the rows on screen\" (fast at thousands of rows) are all behaviour, which is why they live in a class, not here: [`ext/DataGrid`](/framework/ext/DataGrid/) builds exactly that on top of this same markup.");

		md("## Why a column is `{ key, label, width, format }`");

		md("`width` and `min` can be a plain number (read as pixels) or any CSS length (`\"10rem\"`) — whichever is easier to say for that column. `format(value, row)` is optional: skip it and the raw value prints as text; give it a function and that function decides what the cell shows, including a link or an icon, the same way a cell in `ui.table` can be a function instead of a string.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", data)); },
});
