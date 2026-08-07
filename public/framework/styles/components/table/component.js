import { table, thead, tbody, tr, th, td } from "/app.js";

const rows = [
	["View", "core", "641"],
	["Page", "core", "363"],
	["Router", "core", "186"],
	["markdown", "ext", "132"],
];

export default () => table(() => {
	thead(() => tr(() => { th("module"); th("tier"); th("lines"); }));
	tbody(() => rows.forEach(row => tr(() => row.forEach(cell => td(cell)))));
});
