import { Page, p, div, h1, h2, h3, button } from "/app.js";
import sub from "./sub.page.js";

export default new Page({
	meta: import.meta,
	title: "Sections",
	description: "Full-width compositions — hero, feature grid, CTA.",
	content(){
		p("Sections are elements + layout + components composed into page-scale blocks. Here they're proven together, using only framework classes.");

		sub.link();

		h3("Hero");
		div.c("card", () => {
			div.c("flex v gap", () => {
				h1("Build the web, minimally");
				p("One heading, one line of copy, one call to action. Nothing that isn't essential.");
				div.c("flex gap", () => {
					button.c("btn prim", "Get started");
					button.c("btn", "Learn more");
				});
			});
		});

		h3("Feature grid");
		div.c("grid auto gap", () => {
			["Fast", "Simple", "No build"].forEach(t => {
				div.c("card", () => {
					h2(t);
					p("A short description of the " + t.toLowerCase() + " feature.");
				});
			});
		});

		h3("Call to action");
		div.c("card flex split v-center gap", () => {
			div("Ready to try it?");
			button.c("btn prim", "Start now");
		});
	}
});
