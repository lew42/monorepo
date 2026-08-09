import { table as table_el, thead, tbody, tr, th, td } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* `framework.css` gives `table` `width: max-content` so a wide one can scroll
 * itself, and the side effect is that a small one shrink-wraps. A data table
 * wants the column it was given.
 *
 * `.c("num")` aligns every column but the first to the end — there is no
 * text-align utility, and a numeric column is the only place one is missed. */
css(`@layer theme {
	.ui-table { width: 100%; }
	.ui-table.num th + th, .ui-table.num td + td { text-align: end; }
}`);

/**
 * table(["head", …], [[cell, …], …]) — a head row and a body. A cell may be a
 * string or a function, so a link or a badge goes in a column.
 */
export const table = component((head, rows) => table_el.c("ui-table", () => {
	thead(() => tr(() => head.forEach(cell => th(cell))));
	tbody(() => rows.forEach(row => tr(() => row.forEach(cell => td(cell)))));
}));

export default table;
