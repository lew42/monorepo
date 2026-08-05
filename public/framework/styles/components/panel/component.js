import { div, p, button, icon } from "/app.js";
import { surface } from "../parts.js";

const line = "1px solid var(--line)";

export default () => div(() => {

	div.c("pad flex v-center split", () => {
		div.c("h3", "Delete branch?");
		button(() => { icon("close"); }).style({ background: "none", padding: "0" });
	}).style("borderBottom", line);

	div.c("pad", () => p("`michael/dev` and its preview deployment go away. This cannot be undone."));

	// `reverse` is the utility for a right-aligned action row — there is no
	// `justify-content: flex-end` class, and row-reverse gets there for free.
	div.c("pad flex gap reverse", () => {
		button.c("prim", "Delete");
		button("Cancel");
	}).style("borderTop", line);

}).style({ ...surface, maxWidth: "26em", boxShadow: "0 8px 30px color-mix(in srgb, var(--ink) 14%, transparent)" });
