import { div, a, span } from "/app.js";
import { section, cta } from "./parts.js";

export default tone => section(tone ?? "surface", () => {
	div.c("flex gap wrap v-center split", () => {
		span.c("h3", "LEW42");

		div.c("flex gap wrap v-center", () => {
			["Docs", "Layouts", "Components", "Source"].forEach(t =>
				a.c("page-link", t).href("#").style({ textDecoration: "none" }));
			cta("Get started", "prim");
		});
	});
}).style({ "--section": "72em", padding: "1em 2em" });
