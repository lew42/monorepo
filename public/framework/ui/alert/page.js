import { Page, md, demo, div, p, button } from "/app.js";
import { palette } from "../parts.js";
import { alert } from "./alert.js";

const note = (heading, body) => () => {
	div.c("h4", heading);
	p(body);
};

export default new Page({
	meta: import.meta,
	title: "Alerts",
	description: "A callout: an icon, a body, and a coloured edge that is one token.",
	icon: "info",

	content(){

		palette(
			["default", () => alert("lightbulb_outline", note("Worth knowing", "A stylesheet that 404s resolves and warns."))],
			["accent", () => alert.c("accent", "info", note("Heads up", "Capturing is synchronous."))],
			["error", () => alert.c("error", "error_outline", note("Broken", "That import path has no `.js`."))],
			["no icon", () => alert(null, note("Plain", "Pass null and the row is text only."))],
		);

		md("## Calling it");

		demo(() => {
			alert.c("accent", "info", () => {
				div.c("h4", "Heads up");
				p("Never build DOM after an `await` — capturing is synchronous.");
			});
		}, "The first argument is a material icon name; everything after it is the body. `pad flex gap` puts the icon beside the text and `flex-1` lets the text take the rest.");

		md("## The tone is a class, and the class names a token");

		md("```css\n.ui-alert { border-left: 3px solid var(--line); }\n.ui-alert.accent { border-left-color: var(--prim); }\n.ui-alert.accent > .icon { color: var(--prim); }\n```");

		md("Two declarations per tone, both reading a token, so **the component contains no colour** — it retunes with the theme and works in a theme it has never met. Adding a tone is two lines in `alert.js`; there is no tone *option*, because a variant class is already the mechanism.");

		md("The `> .icon` selector is styling a class this component emits — `icon()` from `View.js`, which `alert.js` imports. That is the rule: **if your CSS names a class you don't emit, import the module that emits it.**");

		md("## With an action");

		demo(() => {
			alert.c("accent v-center", "cloud_off", () => {
				p("The dev socket is off — this is not localhost.");
			}).append(() => button.c("prim", "Retry"));
		}, "`.c()` takes utility classes too, so `v-center` lines the three up, and `.append()` puts the button *outside* the `flex-1` body — at the far end of the row. One call, four classes.");

		md("Note what is **not** here: no `alert-info`, no dismiss state, no `title` option. A callout is a padded surface with a coloured edge, and every part of that is a utility or a token.");

		md("Next: [Toolbar](/framework/ui/toolbar/) — the second template.");
	},
});
