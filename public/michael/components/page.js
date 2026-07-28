import { Page, p, div, h3, button, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Components",
	description: "Small assembled pieces — buttons, cards, nav items.",
	content(){
		p("Components are elements + a little layout, named. This bucket is deliberately thin — the framework ships only what earns its place. Everything here is built from classes already in `framework.css`.");

		h3("Buttons");
		div.c("flex gap wrap", () => {
			button.c("btn", "Default");
			button.c("btn bg", "Secondary");
			button.c("btn prim", "Primary");
		});

		h3("Card");
		div.c("card", () => {
			div("A card is just `.card` (border, radius, padding) wrapping whatever you like.");
			div.c("flex gap", () => {
				button.c("btn prim", "Action");
				button.c("btn", "Cancel");
			});
		});

		h3("Nav item");
		p("The site nav is a `.flex.gap` of `.nav-item` anchors:");
		div.c("flex gap", () => {
			div.c("nav-item", a("Home").href("#"));
			div.c("nav-item", a("Docs").href("#"));
			div.c("nav-item", a("About").href("#"));
		});
	}
});
