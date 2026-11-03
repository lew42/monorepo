import { div } from "/app.js";

/* The framework's own numbers, in ONE place — the landing and Versus both render
   this row. Recount with the pipeline printed on /framework/versus/, and recount
   that page's prose with it. */
const figures = [
	["executable lines", "714"],
	["gzipped, with CSS", "21 KB"],
	["build steps", "0"],
	["runtime deps", "0"],
	["config files", "0"],
];

/* The stat tile, verbatim from framework/ui/stats/ — utilities, no CSS.
   ⚠ `toc-skip`, or a page's rail reads "714 · 21 KB · 0 · 0 · 0" — these `.h2`
   values are numbers, not sections.
   ⚠ `h2`, not `h1`: at weight 900 a two-word value ("21 KB") breaks across two
   lines inside a 9em track. */
export const stats = () => div.c("grid gap auto toc-skip", () =>
	figures.forEach(([label, value]) => div.c("surface pad flex v gap", () => {
		div.c("h4 muted", label);
		div.c("h2", value);
	}).style("--gap", "0.1em"))).style("--column", "9em");
