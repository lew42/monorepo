import { Page, div, span } from "/app.js";
import detail from "../detail.js";

export default new Page(detail({
	meta: import.meta,
	title: "Mail",
	description: "Folders, a list, a message — three panes that become three stacked bands on a phone.",
	icon: "mail",
	group: "Streams",

	card: "tall",

	parts: "header rail toolbar",

	note: "Three panes, three widths, one row. `12em` and `24em` are `basis` — the fixed halves — and only the message is fluid, so the row sheds the folders first and the list second. Nothing about that order is written down; it falls out of the numbers.",

	layout(site){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex gap wrap flex-1", () => {

				if (this.shows("rail"))
					div.c("basis pad", () => site.menu())
						.style({ "--basis": "12em", overflowY: "auto" });

				div.c("basis", () => site.rows(10))
					.style({ "--basis": "24em", overflowY: "auto" });

				div.c("flow pad", () => {
					if (this.shows("toolbar")) site.toolbar();
					span.c("h4 muted", "RE: " + site.tagline);
					site.sections(2);
				}).style({ flex: "1 1 24em", minWidth: "0", overflowY: "auto" });

			}).style({ minHeight: "0", overflowY: "auto" });
		});
	},
}));
