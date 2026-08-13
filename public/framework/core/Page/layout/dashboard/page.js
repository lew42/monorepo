import { Page, div, span } from "/app.js";
import detail from "../detail.js";

export default new Page(detail({
	meta: import.meta,
	title: "Dashboard",
	description: "A strip of numbers over a wall of panels, with a rail that only appears when there is room.",
	icon: "insights",
	group: "Apps",

	parts: "header toolbar aside",

	note: "Two walls, one knob each. The numbers hold `--column: 9em` and the panels `20em`, so the board counts its own columns — four numbers across a phone, ten across a 3440 monitor, and not a breakpoint between them.",

	layout(site){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();
			if (this.shows("toolbar")) site.toolbar();

			div.c("flex gap wrap flex-1", () => {

				div.c("flex v gap pad", () => {
					site.cards(6, "9em");
					site.tiles(4, "20em");
				}).style({ flex: "1 1 24em", minWidth: "0", "--gap": "1.2em" });

				if (this.shows("aside"))
					div.c("basis pad flex v gap", () => {
						span.c("h4", "Activity");
						site.rows(4);
					}).style({ "--basis": "17em", "--gap": "0.8em" });

			}).style({ minHeight: "0", overflowY: "auto" });
		});
	},
}));
