import { Page, md, demo, div, span, button } from "/app.js";
import { palette, copy } from "../parts.js";

// The template, verbatim — rendered in the palette AND handed to copy(), so the
// code on the page is the code that ran.
const pager = () => {
	const pages = ["1", "2", "3", "…", "12"];
	const current = 2;
	const go = page => console.log("page", page);

	return div.c("flex wrap v-center gap", () => {
		button("‹ Prev").click(() => go(current - 1));

		pages.forEach(label => label === "…"
			? span.c("muted", label)
			: button.c(+label === current && "prim", label).click(() => go(+label)));

		button("Next ›").click(() => go(current + 1));
	}).style("--gap", "0.3em");
};

export default new Page({
	meta: import.meta,
	title: "Pagination",
	description: "A template, not a function — real buttons, and the caller holds the page number.",
	icon: "last_page",

	content(){

		palette(
			["page 2 of 12", pager],
			["wired up", () => div.c("flex v gap", () => {
				const $picked = span.c("muted", "nothing picked yet");
				div.c("flex wrap v-center gap", () => ["1", "2", "3"].forEach(label =>
					button.c(label === "1" && "prim", label).click(() => $picked.text("picked: " + label))))
					.style("--gap", "0.3em");
			})],
		);

		md("## Copy it");

		copy(pager);

		md("**There is no `ui.pagination()`.** The body *was* the markup — a row, some buttons, one of them `prim` — and the wrapper made it worse: `current` was compared by string, and the callback received `\"prev\"` and `\"next\"` alongside real labels, so every caller had to decode a string union the component invented. Written out, prev and next call the same function as a number, which is what the caller wanted all along.");

		md("## Buttons, not links");

		md("`framework.css` gives `button` and `.btn` the same fill, hairline, radius and `text-decoration: none`, and `.prim` promotes one — so a real `<button>` needs nothing but a click handler. An `<a class=\"btn\">` is for the case where the page genuinely has a url, and a pager usually doesn't.");

		md("This was not always free. `.btn` used to be `padding` and `cursor` alone, so every link-as-button in the old component set wrote `{ textDecoration: \"none\", color: \"inherit\" }` — four copies of one declaration, filed as a bug report about `framework.css`. **It was fixed there**, which is why this page has no CSS at all.");

		md("## The current page is the caller's");

		demo(() => {
			div.c("flex v gap", () => ["1", "6", "12"].forEach(current =>
				div.c("flex wrap v-center gap", () => ["1", "6", "12"].forEach(label =>
					button.c(label === current && "prim", label))).style("--gap", "0.3em")));
		}, "`.c(cond && \"prim\", …)` is the whole of *which one is current* — a falsy class is dropped. Three rows, three current pages, and no component holding state on anyone's behalf.");

		md("Next: [Card](/framework/ui/card/) — the shape every other component is made of.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", pager)); },
});
