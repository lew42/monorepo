import { Page, md, demo, div, span, button, p } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
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

const wired = () => div.c("flex v gap", () => {
	const $picked = span.c("muted", "nothing picked yet");

	div.c("flex wrap v-center gap", () => ["1", "2", "3"].forEach(label =>
		button.c(label === "1" && "prim", label).click(() => $picked.text("picked: " + label))))
		.style("--gap", "0.3em");
});

/* The card's own context — the row under the short list it pages through, since
   the row alone floated with nothing above it at zoom-50 (wall-polish, 2026-08-17). */
const context = () => div.c("pad flex v gap", () => {
	div.c("flex v gap", () => ["Alpha release", "Beta release", "Release candidate"].forEach(label => p(label)))
		.style("--gap", "0.3em");
	pager();
}).style("--gap", "0.6em");

export default new Page({
	meta: import.meta,
	title: "Pagination",
	description: "A template, not a function — real buttons, and the caller holds the page number.",
	icon: "last_page",

	children: [
		demo.page("wired", wired, {
			note: "The same row with a handler on each button, and a readout under it. A component holding the current page on your behalf is the thing this template exists to avoid — the caller already has that number, and `.c(cond && \"prim\", …)` is the whole of *which one is current*, because a falsy class is dropped." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(pager, steer).ac("bleed"),
			def: pager,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.pagination()`.** The body *was* the markup — a row, some buttons, one of them `prim` — and the wrapper made it worse: `current` was compared by string, and the callback received `\"prev\"` and `\"next\"` alongside real labels, so every caller had to decode a string union the component invented. Written out, prev and next call the same function as a number, which is what the caller wanted all along.",
		});

		md("## The behavior graduated");

		md("This is the **template**: real buttons, one conditional `.prim` class, no wrapper. `current` compared by string was the reason there was no `ui.pagination()` at all — the caller already held the number, and a component holding it too would only get in the way. On 2026-08-21 that bookkeeping became [`class Pagination`](/framework/ux/Pagination/), which remembers `current` as a NUMBER and fires one wire, `go(n)`. **New code takes the class.**");

		md("There was no CSS to keep — `.ui-pagination` was dropped in the 2026-08-09 review as styled nowhere ([`doc/record.md`](/framework/ui/doc/record/), §11), so the class reads nothing but `framework.css`'s own `button`/`.prim`, same as this page. [`ux/Pagination/doc/decisions.md`](/framework/ux/Pagination/doc/decisions/) has the rest.");

		md("## Buttons, not links");

		md("`framework.css` gives `button` and `.btn` the same fill, hairline, radius and `text-decoration: none`, and `.prim` promotes one — so a real `<button>` needs nothing but a click handler. An `<a class=\"btn\">` is for the case where the page genuinely has a url, and a pager usually doesn't.");

		md("This was not always free. `.btn` used to be `padding` and `cursor` alone, so every link-as-button in the old component set wrote `{ textDecoration: \"none\", color: \"inherit\" }` — four copies of one declaration, filed as a bug report about `framework.css`. **It was fixed there**, which is why this page has no CSS at all.");

		md("Next: [Card](/framework/ui/card/) — the shape every other component is made of.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", context)); },
});
