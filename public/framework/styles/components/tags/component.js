import { div, span, input } from "/app.js";
import { surface, pill } from "../parts.js";

const tag = text => span.c("h4 flex v-center", () => {
	span(text);
	span("×").style({ cursor: "pointer", color: "var(--subtle)" });
}).style({ ...pill, gap: "0.4em" });

export default () => div.c("pad flex wrap v-center", () => {
	["core", "no-build", "esm"].forEach(tag);

	// The theme gives every text input a border and padding; a field INSIDE a
	// field has to hand both back. See readme.md §5 — this is the section's one
	// override of framework.css.
	input().ac("flex-1")
		.attr("placeholder", "add a tag…")
		.style({ border: "none", background: "none", padding: "0", minWidth: "7em" });
}).style({ ...surface, gap: "0.4em" });
