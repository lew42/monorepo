import { div, p, icon } from "/app.js";
import { surface } from "../parts.js";

// The tone arrives as a token NAME, so the component contains no colour and works
// in a theme it has never met.
const note = (tone, glyph, heading, body) => div.c("pad flex gap", () => {
	icon(glyph).style("color", `var(${tone})`);
	div.c("flex v", () => {
		div.c("h4", heading);
		p(body);
	}).style("gap", "0.2em");
}).style({ ...surface, borderLeft: `3px solid var(${tone})` });

export default () => div.c("flex v gap", () => {
	note("--prim", "info", "Heads up",
		"Never build DOM after an `await` — capturing is synchronous.");

	note("--subtle", "lightbulb_outline", "Worth knowing",
		"A stylesheet that 404s resolves and warns, and the page renders unstyled.");
});
