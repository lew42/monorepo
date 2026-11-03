import { Page, demo, div } from "/app.js";
import { site } from "../web.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "Gallery",
	description: "A filter rail beside a wall of tiles that re-counts itself at every width.",
	icon: "photo_library",
	group: "Apps",

	twin: true,
	parts: "header toolbar rail",

	note: "`grid gap auto` and a `9em` floor: three tiles across a phone, thirty across a 3440 monitor, from one class string. The rail is `basis` — the fixed half of the row — so it never eats into the wall.",

	layout(){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();
			if (this.shows("toolbar")) site.toolbar();

			div.c("flex gap wrap flex-1", () => {

				if (this.shows("rail"))
					div.c("basis pad", () => site.menu()).style("--basis", "13em");

				div.c("pad", () => site.tiles(14, "9em"))
					.style({ flex: "1 1 22em", minWidth: "0" });

			}).style({ minHeight: "0", overflowY: "auto" });
		});
	},
}));
