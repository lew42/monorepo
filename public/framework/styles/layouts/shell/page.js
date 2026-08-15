import { Page, demo, div, span } from "/app.js";
import { site } from "../web.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "App shell",
	description: "Header, toolbar, rail, work, inspector, status bar — every region an application has, all optional.",
	icon: "view_quilt",
	group: "Apps",

	card: "tall",

	twin: true,
	parts: "header toolbar rail aside footer",

	note: "**The payoff page: six regions, five checkboxes, one class string per band.** Turn everything off in the panel and what is left is the document layout — every other page in this rail is this one with regions removed.",

	layout(){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();
			if (this.shows("toolbar")) site.toolbar();

			/* The middle band takes the slack, which is what pins the status bar to the
			   bottom of the REGION rather than to the bottom of the content — and it is
			   the one part of this a screenshot cannot show you. */
			div.c("flex gap wrap flex-1", () => {

				if (this.shows("rail"))
					div.c("basis pad", () => site.menu()).style("--basis", "15em");

				div.c("flow pad", () => { site.cards(3, "11em"); site.sections(3); })
					.style({ flex: "1 1 24em", minWidth: "0" });

				if (this.shows("aside"))
					div.c("basis pad flex v gap surface", () => { span.c("h4", "Inspector"); site.toc(); })
						.style({ "--basis": "17em", "--gap": "0.8em" });

			}).style({ minHeight: "0", overflowY: "auto" });

			if (this.shows("footer"))
				div.c("flex gap v-center split pad wash", () => {
					span.c("h4 muted", "READY");
					span.c("h4 muted", "8 TOPICS");
				}).style("--pad", "0.4em 1em");
		});
	},
}));
