import { p, form, input } from "/app.js";
import { section, eyebrow, cta } from "./parts.js";

/* One input and one button. framework.css already gives the input its border and
 * padding; `flex: 1 1 12em` beside a fixed button is the row wrapping itself on
 * a phone — no media query, like every other band here. */
export default tone => section(tone ?? "dark", () => {
	eyebrow("STAY IN THE LOOP");

	p.c("h2", "One email when it ships");

	form.c("flex gap wrap", () => {
		input().attr("type", "email").attr("placeholder", "you@example.com")
			.attr("aria-label", "Email address")
			.style({ flex: "1 1 12em", width: "auto", minWidth: "0" });
		cta("Subscribe", "prim");
	}).on("submit", e => e.preventDefault());

	p.c("muted", "No build step in the newsletter either.").style({ fontSize: "0.85em" });
}).style("--section", "40em");
