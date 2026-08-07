import { Page, p } from "/app.js";
import { code, section, buttons } from "../ui.js";
import intro from "./intro/page.js";
import guide from "./guide/page.js";

export default new Page({
	meta: import.meta,
	title: "Docs — columns",

	// the whole opt-in, and the ONLY file in this subtree that says anything
	mode: "columns",

	children: [intro, guide],

	content(){
		code(`
mode: "columns",`, "docs/page.js — and nothing in intro/ or guide/");

		p("**Mode 2 · columns.** Column 1. Open a child and it appears beside me at **equal** width — not half of what's left, because we are siblings in one container, not boxes inside boxes.");

		this.previews();

		section("Four rules");

		code(`
[data-mode="columns"] .pages {
    display: grid; grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
}
[data-mode="columns"] .page.active-ancestor { display: block; }`);

		p("`grid-auto-flow: column` grows one track per visible page, so the column count follows the url with no `grid-template-columns` anywhere.").ac("note");

		section("Order without moving anything");

		code(`
chain.forEach((p, i) => p.view.ac(…).style("order", i));`, "App.mark()");

		p("DOM order is mount order — first visit wins. Visual order is the chain, set with CSS `order`. Re-appending would fix the order too, and reset every column's scroll position on the way, because appending an attached node is a detach and an attach.").ac("note");

		section("Activate a child directly");

		buttons(["Intro", intro], ["Guide", guide]);
	}
});
