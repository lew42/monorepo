import { Page, h2, p, pre, div, img, input, button } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "All Together",
	description: "One card, using a bit of every style category.",

	content(){
		p("A small card, using a bit of every category above: `Colors`, `Typography`, `Layout`, `Spacing`, `Forms`, `Buttons`, `Media`, and `Utilities`.").ac("mb");

		div.c("flex gap pad mb", () => {
			img().attr("src", "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%25' height='100%25' fill='%235a57ff'/></svg>").style({ width: "4em", height: "4em", "border-radius": "50%" });

			div.c("flex-1 flex v gap", () => {
				h2("Jane Doe").style("color", "var(--prim)");
				p("web developer").ac("capitalize");
				input().attr("placeholder", "Say hello...");
				button("Follow").ac("btn prim");
			}).style("min-width", "0");
		}).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

		p("That card, in code:").ac("mb");

		pre(`div.c("flex gap pad", () => {
    img().attr("src", avatarUrl).style({ width: "4em", height: "4em", "border-radius": "50%" });

    div.c("flex-1 flex v gap", () => {
        h2("Jane Doe").style("color", "var(--prim)");
        p("web developer").ac("capitalize");
        input().attr("placeholder", "Say hello...");
        button("Follow").ac("btn prim");
    });
}).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });`).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
	}
});