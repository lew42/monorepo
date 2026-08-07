import { Page, p, div, a } from "/app.js";
import { code, section } from "../../../../../ui.js";
import { recipe } from "../../../../recipe.js";

const nav = () => ({
	meta: import.meta,
	title: "Batches",
	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("Level four, and this is the column that proves the finding: count the tracks and measure one.");

		section("Measured, 1400px wide");

		code(`
url        /patterns/docs/guide/concepts/batches/
columns    docs · guide · concepts · batches
width      290 | 290 | 290 | 290
chain      / › /patterns/ › /patterns/docs/ › guide › concepts › batches
cost       4 page modules, not 18 — reference's 14 children are free`);

		p("`ColumnPager` showed the last two of the chain and put the rest in a sidebar and a breadcrumb. `.cols` shows every ancestor that claimed nothing, and nothing caps the count — so a guide gets less readable the further into it you go, which is the opposite of what a guide is for.").ac("note");

		section("What would fix it, in CSS only");

		code(`
/* keep the last two columns; the rest are reachable from the crumb trail */
.cols > .page.active-ancestor:not(:nth-last-of-type(-n+3)) { display: none; }`);

		p("It does not work, and the reason is worth writing down: hidden pages stay mounted, so `:nth-last-of-type` counts every page ever visited in this region, not the ones on screen. There is no CSS selector for “third from the end among the visible siblings”, so capping columns is the one arrangement that cannot be a class. It needs a number from the chain, which only `Router` has.").ac("note");

		section("Batches");

		code(`
const batch = await emails.batch([...jobs]);

await batch.settled;        // resolves when every job acks or dies
batch.progress              // { done: 812, failed: 3, pending: 185 }`);

		div.c("row", () => {
			a.c("page-link", "← Concepts").href("/patterns/docs/guide/concepts/");
			a.c("page-link", "Fan-out").href("/patterns/docs/guide/concepts/fan-out/");
		});
	},
});
