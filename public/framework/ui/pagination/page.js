import { Page, md, demo, div, span } from "/app.js";
import { palette } from "../parts.js";
import { pagination } from "./pagination.js";

const pages = ["1", "2", "3", "…", "12"];

export default new Page({
	meta: import.meta,
	title: "Pagination",
	description: "Real buttons, a current page, and an ellipsis that isn't one.",
	icon: "last_page",
	classes: "grid",

	content(){

		palette(
			["page 2 of 12", () => pagination(pages, "2")],
			["no gap", () => pagination(["1", "2", "3"], "1")],
			["wired up", () => div.c("flex v gap", () => {
				const $picked = span.c("ui-muted", "nothing picked yet");
				pagination(pages, "2", label => $picked.text("picked: " + label));
			})],
		);

		md("## Calling it");

		demo(() => {
			pagination(["1", "2", "3", "…", "12"], "2", label => console.log(label));
		}, "The labels, which one is current, and what to do about a click. `\"…\"` renders as a gap rather than a button, and the callback also receives `\"prev\"` and `\"next\"`.");

		md("## Buttons, not links");

		md("`framework.css` gives `button` and `.btn` the same fill, hairline, radius and `text-decoration: none`, and `.prim` promotes one — so a real `<button>` needs nothing from this component but a click handler. An `<a class=\"btn\">` is for the case where the page genuinely has a url, and a pager usually doesn't.");

		md("This was not always free. `.btn` used to be `padding` and `cursor` alone, so every link-as-button in the old component set wrote `{ textDecoration: \"none\", color: \"inherit\" }` — four copies of one declaration, filed as a bug report about `framework.css`. **It was fixed there**, which is why this component has no `parts.js` object and no CSS at all.");

		md("## Keeping the current page honest");

		demo(() => {
			div.c("flex v gap", () => {
				["1", "6", "12"].forEach(current => pagination(pages, current));
			});
		}, "`current` is compared against the label, so the caller holds the state and the component holds none. Three renders, three current pages, one function.");

		md("Next: [Card](/framework/ui/card/) — the shape every other component is made of.");
	},
});
