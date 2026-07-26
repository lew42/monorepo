import { Page2, p, div } from "/app.js";

function boxes(n = 6){
	for (let i = 1; i <= n; i++)
		div(String(i));
}

export default new Page2({
	meta: import.meta,
	title: "Grid",
	description: "grid.auto and grid.three — responsive columns with no media queries.",
	content(){
		p("`.grid.auto` fills as many `--column`-wide tracks as fit, then wraps — responsive with zero media queries. `.grid.three` targets three columns, collapsing to one when too narrow.");

		div.c("demo-label", ".grid .auto .gap");
		div.c("demo grid auto gap", () => boxes(6));

		div.c("demo-label", ".grid .three .gap");
		div.c("demo grid three gap", () => boxes(3));

		p("The tracks are driven by the `--column` custom property (default `14em`). Override it locally to retune the breakpoint — here `--column: 8em`:");

		div.c("demo-label", ".grid .auto .gap  { --column: 8em }");
		div.c("demo grid auto gap", () => boxes(8)).style("--column", "8em");
	}
});
