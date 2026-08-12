import { Page, div, md } from "/app.js";
import detail from "../detail.js";
import { next } from "../../parts.js";

const card = (title, body) => div.c("pad flex v gap surface").style("--gap", "0.4em").append(() => {
	div.c("h3", title);
	md(body);
});

export default new Page(detail({
	meta: import.meta,
	title: "Cards",
	description: "An auto-fill card wall — one class, no stylesheet, no media query.",
	icon: "grid_view",

	note: "`pad` keeps the inset and drops the measure. The wall itself is one utility class — drag the stage and the browser re-counts the columns.",

	layout(){

		// `pad` drops the measure and keeps the inset: a wall has no line length to
		// protect. No `fill` — the wall sizes to its content and would only be clipped.
		return div.c("page pad flex v gap", () => {

			div.c("measure flex v gap").style("--measure", "78em").append(() => {

				div.c("grid gap auto").style({ "--column": "15em", "--gap": "1.2em" }).append(() => {

					card("One class", `\`grid gap auto\` is the entire layout. It expands to
\`repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))\` — a responsive wall with
**no stylesheet and no media query.**`);

					card("The browser counts", `\`auto-fit\` decides how many columns fit and
then divides the space evenly. Drag the stage: the count changes and nothing was
written to make it change.`);

					card("`--column` is the knob", `The wrap point is a token, not a number in
a rule. This wall sets \`15em\`;
[Dashboard](/framework/styles/layouts/dashboard/) sets \`8em\` on the same class and
gets stat tiles out of it. More variations: [Grid](/framework/styles/layouts/grid/).`);

					card("`min()` stops the overflow", `\`minmax(min(var(--column), 100%), 1fr)\`.
Without the \`min()\`, a 15em track in a narrower box overflows sideways. With it,
the track gives up before the page does.`);

					card("Already everywhere", `The components gallery, the
[Sections](/framework/styles/sections/) index and the wall you clicked to get here
are all this layout. **Half the layouts on this site turn out to be it in
disguise.**`);

					card("When not to", `A wall has no line length to protect, which is why
this page throws the measure away — up to 78em, past which a row of thirteen cards
is not a wall, it is a spreadsheet. Prose is the opposite case: give reading a
column, not a share of a grid.`);

					card("The page is `pad`", `\`classes: "pad flex v gap"\` — no measure, an
even inset, and the wall inside it. That class string is the first line of the
source below, which is the only place this layout is written down.`);
				});

				next("[Dashboard](/framework/styles/layouts/dashboard/) — the same grid, retuned with one token.",
					"styles/layouts/cards/");
			});
		});
	},
}));
