import { Page, md, demo, div, table, thead, tbody, tr, th, td } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Data table",
	description: "The component with no classes at all.",
	icon: "table_chart",

	content(){

		demo(component, "**Zero classes and zero styles.** `framework.css` already gives `table` `border-collapse`, `th`/`td` a border and padding, and `th` a `--wash` fill and a left-aligned label. A data table is the case where the base theme is simply finished.");

		md("The only thing it won't do is align a numeric column, and there is no utility for that either:");

		demo(() => {
			const right = { textAlign: "right" };

			table(() => {
				thead(() => tr(() => { th("module"); th("lines").style(right); }));
				tbody(() => [["View", "641"], ["Page", "363"]].forEach(([name, lines]) => tr(() => {
					td(name);
					td(lines).style(right);
				})));
			});
		}, "One declaration per cell, because `text-align` has no class. On the findings list.");

		md("A table wider than its column is the other thing to know about: `framework.css` puts `overflow-x: auto` on `pre` and **not** on `table`, so a wide table pushes the page sideways. Wrap it:");

		demo(() => {
			div(component).style("overflowX", "auto");
		}, "A `div` with `overflow-x: auto` around it. The wrapper is the fix everywhere — a table cannot scroll itself.");

		md("Next: [Form field](/framework/styles/components/field/) — a label, a control and an error, still with no stylesheet.");
	}
});
