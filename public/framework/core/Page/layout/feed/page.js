import { Page, div, span, p } from "/app.js";
import detail from "../detail.js";

export default new Page(detail({
	meta: import.meta,
	title: "Feed",
	description: "A centred column of posts with two rails that stick, and drop away when the room runs out.",
	icon: "dynamic_feed",
	group: "Streams",

	parts: "header rail aside",

	note: "**`h-center` plus a capped column is the whole trick.** The posts hold `1 1 30em` up to a `36em` ceiling, so the centre never sprawls; the rails are `sticky` with `align-self: flex-start`, because a stretched flex item has nothing left to stick to.",

	layout(site){

		const post = word => div.c("surface pad flex v gap", () => {
			div.c("flex gap v-center", () => {
				div.c("wash").style({ width: "1.8em", height: "1.8em", borderRadius: "50%" });
				span.c("h4", word);
			}).style("--gap", "0.5em");

			p(site.blurb);
			div.c("wash").style({ height: "5em", borderRadius: "var(--radius)" });
		}).style("--gap", "0.6em");

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex gap wrap h-center flex-1", () => {

				if (this.shows("rail"))
					div.c("basis pad", () => site.menu())
						.style({ "--basis": "14em", position: "sticky", top: "0", alignSelf: "flex-start" });

				div.c("flex v gap pad", () => site.topics.split(" ").slice(0, 3).forEach(post))
					.style({ flex: "1 1 30em", maxWidth: "36em", minWidth: "0", "--gap": "1em" });

				if (this.shows("aside"))
					div.c("basis pad", () => site.toc())
						.style({ "--basis": "16em", position: "sticky", top: "0", alignSelf: "flex-start" });

			}).style({ minHeight: "0", overflowY: "auto" });
		});
	},
}));
