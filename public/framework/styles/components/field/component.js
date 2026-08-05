import { div, label, input, span } from "/app.js";

export default () => label.c("flex v", () => {
	div.c("h4", "Email");
	input()
		.attr("type", "email").attr("value", "mike@lew42")
		.attr("aria-invalid", "true")
		.style("borderColor", "var(--prim)");
	span.c("h4", "That address is missing a domain.").style("color", "var(--prim)");
}).style("gap", "0.4em");
