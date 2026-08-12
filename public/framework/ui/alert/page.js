import { Page, md, demo, div, p, button, icon } from "/app.js";
import { palette, copy } from "../parts.js";

// The template, verbatim — rendered in the palette AND handed to copy(), so the
// code on the page is the code that ran.
const alert = () => div.c("ui-alert surface pad flex gap accent", () => {
	icon("info");

	div.c("flex-1 flex v gap", () => {
		div.c("h4", "Heads up");
		p("Never build DOM after an `await` — capturing is synchronous.");
	}).style("--gap", "0.2em");
});

const tones = () => div.c("flex v gap", () => {
	[["lightbulb_outline", "", "A stylesheet that 404s resolves and warns."],
	 ["error_outline", "error", "That import path has no `.js`."]].forEach(([glyph, tone, words]) =>
		div.c("ui-alert surface pad flex gap", () => {
			icon(glyph);
			p(words).ac("flex-1");
		}).ac(tone));
});

export default new Page({
	meta: import.meta,
	title: "Alerts",
	description: "A template plus six lines of CSS — a coloured edge that is one token.",
	icon: "info",

	content(){

		palette(
			["accent", alert],
			["default and error", tones],
		);

		md("## Copy it");

		copy(alert);

		md("**There is no `ui.alert()`.** Its entire logic was `if (glyph)`, and the export had two real problems: a bare `alert` shadows `window.alert`, and `alert(\"msg\")` failed *silently* — the first argument was an icon name, so a one-string call rendered the message as a material ligature. A row with an icon in it is a row with an icon in it.");

		md("## The tone is a class, and the class names a token");

		md("```css\n.ui-alert { border-left: 3px solid var(--line); }\n.ui-alert > .icon { color: var(--subtle); }\n\n.ui-alert.accent { border-left-color: var(--prim); }\n.ui-alert.accent > .icon { color: var(--prim); }\n```");

		md("Two declarations per tone, both reading a token, so **the markup contains no colour** — it retunes with the theme and works in a theme it has never met. Adding a tone is two lines in `alert.js`; there is no tone *option*, because a variant class is already the mechanism.");

		md("The `> .icon` selector names a class this file does not emit — `icon()` from `View.js` does — so `alert.js` imports `View.js`. That is the rule: **if your CSS names a class you don't emit, import the module that emits it.**");

		md("## With an action");

		demo(() => {
			div.c("ui-alert surface pad flex gap v-center accent", () => {
				icon("cloud_off");
				p("The dev socket is off — this is not localhost.").ac("flex-1");
				button.c("prim", "Retry");
			});
		}, "`v-center` lines the three up and `flex-1` on the text is what pushes the button to the far end. Four utility classes and one component class — and because it is markup, the button goes exactly where you put it rather than where an `.append()` lands it.");

		md("Note what is **not** here: no `alert-info`, no dismiss state, no `title` option. A callout is a padded surface with a coloured edge, and every part of that is a utility or a token.");

		md("Next: [Toolbar](/framework/ui/toolbar/) — the second template.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", alert)); },
});
