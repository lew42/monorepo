import { div, h3, p, a } from "/app.js";
import { surface } from "../parts.js";

export default () => div.c("pad flex v", () => {
	div.c("h4", "Core").style("color", "var(--subtle)");
	h3("View");
	p("A DOM element with a chainable API, and one idea: capturing.");

	// `framework.css` has NO rule for `a`, so a link's colour is always somebody's
	// call. Here it is the component's, and it is a token.
	a.c("page-link", "Read →").href("/framework/core/View/")
		.style({ textDecoration: "none", color: "var(--prim)" });
}).style({ ...surface, gap: "0.5em" });
