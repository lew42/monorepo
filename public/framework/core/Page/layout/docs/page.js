import { Page, div } from "/app.js";
import detail from "../detail.js";

export default new Page(detail({
	meta: import.meta,
	title: "Docs",
	description: "A menu rail, an article, a table of contents — the three-column reading page.",
	icon: "menu_book",
	group: "Pages",

	parts: "header rail toc sticky footer",

	note: "Two rails at `basis` and an article at `flex 1 1 24em`, so the row re-flows on its **own** width: three across at 1440, the ToC dropping first, one column at 390. Turn the rails off in the panel and the same article becomes the document layout.",

	layout(site){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			/* ⚠ `overflow-y` lives on the ROW, not on a column inside it. A wrapping
			   flex line sizes to its content, so a scroller one level deeper never
			   engages and everything below the fold is unreachable. */
			div.c("flex gap wrap flex-1", () => {

				if (this.shows("rail"))
					div.c("basis pad", () => site.menu()).style("--basis", "15em");

				div.c("flow pad", () => site.sections(5, this.shows("sticky")))
					.style({ flex: "1 1 24em", minWidth: "0" });

				if (this.shows("toc"))
					div.c("basis pad", () => site.toc())
						.style({ "--basis": "13em", position: "sticky", top: "0", alignSelf: "flex-start" });

			}).style({ minHeight: "0", overflowY: "auto" });

			if (this.shows("footer")) site.footer();
		});
	},
}));
