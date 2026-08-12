import { Page, div, md } from "/app.js";
import detail from "../detail.js";
import { next } from "../../parts.js";

const pane = (title, body) => div.c("pad flex v gap surface").style("--gap", "0.5em").append(() => {
	div.c("h3", title);
	md(body);
});

export default new Page(detail({
	meta: import.meta,
	title: "Split",
	description: "Two equal panes that stack themselves — no CSS, no breakpoint.",
	icon: "vertical_split",

	note: "The page is the region; the split is one utility class and a `--column` override. Drag the stage past 36em and the panes stack themselves.",

	layout(){

		// `full`, because a split shown at the reading measure is not a split — it was
		// 900px of a 3166px region. No `fill` — nothing here must reach the bottom.
		return div.c("page full flex v gap", () => {

			/* `flex gap auto` gives every child `flex: 1 1 var(--column)`. Equal basis,
			   equal grow, so the panes are equal — and when two `18em` panes no longer
			   fit, they wrap. `--column` is the only number, and it is a token. */
			div.c("flex gap auto").style("--column", "18em").append(() => {

				pane("Intrinsic", `This pair responds to the width of **this box**, not of the
window. Drag the stage narrower and the panes stack — but they also stack inside a
sidebar-narrowed region, and inside the \`zoom-25\` thumbnail on the
[Layouts](/framework/styles/layouts/) index, at the same two-panes-no-longer-fit
moment.

One rule, and it is correct in every container it is ever dropped into.`);

				pane("A media query", `A breakpoint reads the **viewport**. It cannot see the
box, so a component that stacks at \`max-width: 40em\` stays side by side in a 300px
column on a 1440px screen, and stacks in a 900px column on a phone-sized window.

Every place the component is reused is a new number somebody has to maintain.`);
			});

			// the panes are the band that reaches the edge; everything explaining them
			// carries its own inset, the way a masthead's bands do
			div.c("pad flex v gap", () => {

				md(`**Equal basis, equal grow.** \`.flex.auto > * { flex: 1 1 var(--column); min-width: 0 }\`
is the whole of it: both panes ask for the same width and both take the same share of
what is left over, so they are the same size without either one being measured.
Nothing in this layout knows there are two of them — add a third pane and you get
thirds. Where the same markup can be made to break differently:
[Flex](/framework/styles/layouts/flex/).`);

				next("[Centered](/framework/styles/layouts/centered/) — the one thing flexbox can't hand you.",
					"styles/layouts/split/");
			});
		});
	},
}));
