import { Page, demo, div } from "/app.js";
import { site } from "../web.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "Masonry",
	description: "A ragged wall with no gaps — CSS columns, and what the order-keeping version costs.",
	icon: "dashboard",
	group: "Apps",

	twin: true,
	parts: "header toolbar rail",

	// The order-keeping variant, one click down. Same wall, same content, one word
	// different — which is the comparison the pair exists to make.
	children: "packed",

	note: "`masonry` is `columns` — three words of CSS, no JavaScript, correct at every width on its own. ⚠ It flows **top-to-bottom within each column**, so the second note sits *below* the first rather than beside it, and the whole sequence reshuffles every time the column count changes. Right for a wall nobody reads in order; wrong for anything ranked, dated or alphabetical — that one is [Packed](/framework/styles/layouts/masonry/packed/).",

	layout(){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();
			if (this.shows("toolbar")) site.toolbar();

			div.c("flex gap wrap flex-1", () => {

				if (this.shows("rail"))
					div.c("basis pad", () => site.menu()).style("--basis", "13em");

				div.c("pad", () => div.c("masonry", () => site.notes(24)).style("--column", "15em"))
					.style({ flex: "1 1 22em", minWidth: "0" });

			// ⚠ `alignContent: start` — a wrapping row defaults to `stretch` and hands a
			// tall band's slack to the LINES, pushing the wall down its own line at 400.
			}).style({ minHeight: "0", overflowY: "auto", alignContent: "start" });
		});
	},
}));
