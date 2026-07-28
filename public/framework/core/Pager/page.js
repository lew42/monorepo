import { Page, Pager, TabPager, md, demo, h2, p, pre, button, div } from "/app.js";

// three dormant pages, used by the demos below
const one = new Page({ title: "One", content(){ p("The first panel."); } });
const two = new Page({ title: "Two", content(){ p("The second panel."); } });
const three = new Page({ title: "Three", content(){ p("The third panel."); } });

export default new Page({
	meta: import.meta,
	title: "Pager",
	description: "A container that shows one page at a time.",
	content(){

		demo(() => {
			const pager = new Pager();
			pager.show(one);

			div.c("flex gap", () => {
				button("One").click(() => pager.show(one));
				button("Two").click(() => pager.show(two));
			});
		}, "`show(page)` empties the container and renders a page into it. That's the entire base class — no history, no urls, no lifecycle.");

		h2("TabPager");

		demo(() => {
			new TabPager({ pages: [one, two, three] });
		}, "A tab bar over a `Pager`. Twenty lines, and the whole implementation is `panel.show(page)`.");

		h2("ColumnPager");

		pre(`import { Page, ColumnPager } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Docs",
    children: [intro, api],
    pager: ColumnPager,   // this subtree renders as columns
});`);

		md("The drill-down you're reading this in — sidebar, breadcrumbs, and the last two levels side by side. One property opts an entire subtree in; the descendants stay plain pages that know nothing about the layout.");

		md("Clicking a link and hard-reloading a url run the same code, so `/docs/api/` looks identical either way.");

		h2("Column width");

		pre(`new Page({ meta: import.meta, title: "Docs", col: "narrow", … })`);

		md("A page that's mostly nav — a line and a list of links — shouldn't get half the screen, so it says so itself. `col` is just classes on the column: `narrow`, `wide`, `half`, or your own. The left column of this page is `narrow`.");

		h2("Build your own");

		pre(`export class Split extends Pager {
    render(){
        const [left, right] = this.leaf().chain.slice(-2);
        div.c("left", () => left.body());
        div.c("right", () => right.body());
    }
}`);

		md("`root` is the page that declared the layout, `leaf()` is the page being viewed. Arrange them however you like — links stay links, the Router still intercepts, the App still activates the leaf. Only the arrangement differs.");

		md("Next: [Router](/framework/core/Router/).");

		md.details(import.meta, "readme.md");
	}
});
