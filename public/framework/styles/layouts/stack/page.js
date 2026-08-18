import { Page, demo, div, span, h2, input, textarea, button } from "/app.js";
import { site } from "../web.js";

const field = (label, control) => div.c("flex v gap").style("--gap", "0.3em").append(() => {
	span.c("h4", label);
	control();
});

export default new Page(demo.layout({
	meta: import.meta,
	title: "Stack",
	description: "Vertical rhythm, and a form that needed none of its own CSS.",
	icon: "view_agenda",
	group: "Pages",

	twin: true,
	parts: "header footer",

	note: "**`flow` is the class every page already carries** (`Page.render()`), so `--flow` spaces the column below on its own — nothing here sets a margin. A laid-out container owns its spacing with `gap` instead, which is what the form uses: `.flex > * { margin: 0 }` beats the flow owl, so the two never fight. The controls are `framework.css` defaults — no stylesheet in this folder.",

	layout(){

		// the page is the region; the narrowness belongs to the `.measure` column inside
		// it, not to the page — the region's DEFAULT measure, no override.
		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex-1", () => {
				div.c("measure flow", () => {

					h2("Tell us what you're building");

					div.c("pad flex v gap surface", () => {
						field("Email", () => input().attr("type", "email").attr("placeholder", "you@example.com"));
						field("Message", () => textarea.c("auto").attr("rows", "3"));

						div.c("flex gap wrap", () => {
							button.c("prim", "Send");
							button("Cancel");
						});
					}).style("--gap", "0.9em");

				}).style({ padding: "2em" });
			}).style({ minHeight: "0", overflowY: "auto" });

			if (this.shows("footer")) site.footer();
		});
	},
}));
