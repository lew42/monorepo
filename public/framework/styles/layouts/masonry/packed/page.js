import { Page, demo, div } from "/app.js";
import { site } from "../../web.js";
import { pack } from "../masonry.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "Packed",
	label: "Packed — order kept",
	description: "The same ragged wall, still reading left to right — and the measuring pass that buys it.",
	icon: "view_compact",

	twin: true,
	parts: "header toolbar rail",

	note: "**The same wall, one word different — and the notes now read across.** `packed` is a real grid whose rows are 4px tall; `pack()` measures each note and gives it a span. That is the whole trade: [Masonry](/framework/styles/layouts/masonry/) is three declarations and no JavaScript but reads down each column, and this keeps DOM order for the price of one `ResizeObserver`. ⚠ `align-self: start` is load-bearing, not tidiness — it is what keeps a note's height independent of the span it was handed, so re-measuring cannot feed back on itself.",

	layout(){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();
			if (this.shows("toolbar")) site.toolbar();

			div.c("flex gap wrap flex-1", () => {

				if (this.shows("rail"))
					div.c("basis pad", () => site.menu()).style("--basis", "13em");

				// ⚠ pack() AFTER the wall is built and BEFORE any await — it reads
				// `el.children`, and a captor that has drifted would hand it an empty box.
				div.c("pad", () => pack(div.c("packed", () => site.notes(24)).style("--column", "15em")))
					.style({ flex: "1 1 22em", minWidth: "0" });

			/* ⚠ `alignContent: start`. A wrapping flex row defaults to `stretch`, which
			   hands a taller-than-content band's slack to the LINES — at 400 the rail
			   takes its own line and the wall is pushed ~390px down it. Only a band that
			   is genuinely taller than its content shows it, which is why the twin's
			   `level()` is where it surfaced. */
			}).style({ minHeight: "0", overflowY: "auto", alignContent: "start" });
		});
	},
}));
