import { div, p, button } from "/app.js";
import { band } from "./tone.js";

export default (tone = "wash") =>
	div.c("section-band", () =>
		div.c("measure flex gap auto v-center", () => {

			div.c("flex v gap", () => {
				p.c("h4", "READ THE SOURCE").style("color", "var(--eyebrow, var(--prim))");
				p.c("h2", "The code you ship is the code you wrote");
				p("No transpile step means the stack trace points at your file, at the line you typed, in the browser you are debugging.");
				button.c("prim", "See an example").style("align-self", "flex-start");
			});

			div.c("pad flex v surface", () => {
				p.c("h4", "page.js");
				p("export default new Page({").style({ fontFamily: "var(--mono)", fontSize: "0.85em" });
				p("  title: \"Intro\",").style({ fontFamily: "var(--mono)", fontSize: "0.85em" });
				p("});").style({ fontFamily: "var(--mono)", fontSize: "0.85em" });
			}).style("gap", "0.2em");

		}).style("--measure", "62em")
	).style(band(tone));
