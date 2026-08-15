import { Page, demo, div, span, p, input, button } from "/app.js";
import { site } from "../web.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "Chat",
	description: "A conversation list, a transcript that scrolls, and a composer that never leaves the bottom.",
	icon: "forum",
	group: "Streams",

	card: "tall",

	twin: true,
	parts: "header rail aside",

	note: "**The composer is pinned by the transcript, not by itself.** The middle column is `flex v`, the transcript is `flex-1` with `min-height: 0`, and everything after it lands on the region's bottom edge — no `position: fixed`, so it still works inside a 390px pane.",

	layout(){

		const bubble = (word, i) => div.c("pad surface", () => p(site.blurb.slice(0, 40 + i * 12) + "…"))
			.style({ maxWidth: "26em", alignSelf: i % 2 ? "flex-end" : "flex-start" });

		return div.c("page full fill flex v", () => {

			div.c("flex gap wrap flex-1", () => {

				if (this.shows("rail"))
					div.c("basis", () => site.rows(6)).style({ "--basis": "18em", overflowY: "auto" });

				div.c("flex v", () => {

					if (this.shows("header"))
						div.c("flex gap v-center split pad wash", () => {
							span.c("h4", site.title.toUpperCase());
							span.c("muted", "8 people");
						}).style("--pad", "0.6em 1em");

					div.c("flex v gap pad", () => site.topics.split(" ").slice(0, 6).forEach(bubble))
						.style({ flex: "1 1 auto", minHeight: "0", overflowY: "auto", "--gap": "0.6em" });

					div.c("flex gap pad wash", () => {
						input.c("flex-1").attr("placeholder", "Message " + site.title);
						button.c("prim", "Send");
					}).style({ "--gap": "0.5em", "--pad": "0.7em" });

				}).style({ flex: "1 1 22em", minWidth: "0" });

				if (this.shows("aside"))
					div.c("basis pad", () => site.toc()).style("--basis", "15em");

			}).style({ minHeight: "0", overflowY: "auto" });
		});
	},
}));
