import { Page, demo, div, span } from "/app.js";
import { site } from "../web.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "List · detail",
	description: "A list beside what it selects — two scrollers side by side, one above the other when they stop fitting.",
	icon: "vertical_split",
	group: "Apps",

	twin: true,
	parts: "header toolbar",

	note: "**Two independent scrollers, and the wrap is the hard part.** Side by side each pane is stretched to the row and scrolls itself; wrapped, the panes go content-tall and the ROW scrolls them — which is why `overflow-y: auto` is on all three boxes and not on one.",

	layout(){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex gap wrap flex-1", () => {

				div.c("basis", () => site.rows(10))
					.style({ "--basis": "22em", overflowY: "auto" });

				div.c("flow pad", () => {
					if (this.shows("toolbar")) site.toolbar();
					span.c("h4 muted", "SELECTED");
					site.sections(2);
				}).style({ flex: "1 1 26em", minWidth: "0", overflowY: "auto" });

			}).style({ minHeight: "0", overflowY: "auto" });
		});
	},
}));
