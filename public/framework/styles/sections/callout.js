import { div, p } from "/app.js";
import { section, cta , muted } from "./parts.js";

export default tone => section(tone ?? "prim", () => {
	div.c("flex gap wrap v-center split", () => {
		div.c("flex v", () => {
			p.c("h2", "Three dependencies. None of them ship.");
			p("Clone it, open it, read it.").style(muted);
		}).style("gap", "0.35em");

		div.c("flex gap wrap", () => { cta("Read the docs"); cta("Source", "bg"); });
	});
}).style("--section", "62em");
