import { div, label, input, span } from "/app.js";

export default () => label.c("flex v", () => {
	div.c("h4", "Email");
	input()
		.attr("type", "email").attr("value", "mike@lew42")
		.attr("aria-invalid", "true")
		.style("borderColor", "var(--prim)");

	// Body size, NOT `h4`: the scale's small level is an uppercase annotation, and
	// an error message that shouts is worse than one that is a touch large.
	span("That address is missing a domain.").style("color", "var(--prim)");
}).style("gap", "0.4em");
