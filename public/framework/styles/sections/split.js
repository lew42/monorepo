import { div, p } from "/app.js";
import { section, eyebrow, cta, surface } from "./parts.js";

export default tone => section(tone ?? "wash", () => {
	div.c("flex gap auto v-center", () => {
		div.c("flex v gap", () => {
			eyebrow("READ THE SOURCE");
			p.c("h2", "The code you ship is the code you wrote");
			p("No transpile step means the stack trace points at your file, at the line you typed, in the browser you are debugging.");
			cta("See an example", "prim").style("align-self", "flex-start");
		});

		div.c("pad flex v", () => {
			p.c("h4", "page.js");
			p("export default new Page({").style({ fontFamily: "var(--mono)", fontSize: "0.85em" });
			p("  title: \"Intro\",").style({ fontFamily: "var(--mono)", fontSize: "0.85em" });
			p("});").style({ fontFamily: "var(--mono)", fontSize: "0.85em" });
		}).style({ ...surface, gap: "0.2em" });
	});
}).style("--section", "62em");
