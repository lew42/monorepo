import { Page, demo, div, h2, p, button } from "/app.js";
import { site } from "../web.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "Landing",
	description: "Full-bleed bands, stacked — no rails, and every band holding its own reading column.",
	icon: "campaign",
	group: "Pages",

	twin: true,
	parts: "header cta footer",

	note: "**A band bleeds; the words don't.** Each band takes the whole width and paints it; a `measure` inside holds the reading. That one sandwich is why a landing page reads at 390 and at 3440 with nothing declared per width.",

	layout(){

		const band = (tone, fn) => div.c("pad", () =>
			div.c("measure flex v gap", fn).style({ "--measure": "62em", "--gap": "1.2em" }))
			.ac(tone).style("--pad", "3.5em 2em");

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex-1", () => {
				site.hero().ac("wash");

				band("", () => { h2("What you get"); site.cards(4, "15em"); });
				band("wash", () => site.sections(2));

				if (this.shows("cta")) band("", () => {
					div.c("flex gap wrap v-center split", () => {
						div.c("flex v gap", () => { h2("Start today"); p(site.blurb); }).style("--gap", "0.4em");
						button.c("prim", "Get " + site.title);
					});
				});
			}).style({ minHeight: "0", overflowY: "auto" });

			if (this.shows("footer")) site.footer();
		});
	},
}));
