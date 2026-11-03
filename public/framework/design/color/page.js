import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Color",
	description: "Colour and contrast: tokens, ratios, light and dark.",
	icon: "palette",

	content(){
		md("**Colour is never a literal value here — it is a small set of tokens**, read through `light-dark()` so one rule serves both themes.");
		md("- `--surface` `--wash` `--ink` and the lighten/darken steps are the tokens; never a hex value in a component.\n- **Ratios:** body text 4.5:1, large text and UI shapes 3:1. Measure — you cannot see 4.2 from 4.6.\n- **`--wash` is the page's own ground** — a card painted with it disappears into the page behind it.\n- **Muted text is the `.muted` class**, never `var(--muted)` (a percentage, not a colour).\n- Dark mode is a mode of one theme (`light-dark()`), never a second stylesheet.");
		md("The token definitions themselves live in [/framework/styles/](/framework/styles/); this page is the rules for using them. Icon and button states are [ui](/framework/design/ui/)'s.");
		md.details(import.meta, "readme.md", "Readme");
	},
});
