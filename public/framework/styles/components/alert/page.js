import { Page, md, demo, div, p, button, icon } from "/app.js";
import { surface } from "../parts.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Alerts",
	description: "A callout: an icon, a heading, a sentence, and one token in two places.",
	icon: "info",

	content(){

		demo(component, "`pad flex gap` puts the icon beside the text; the tone is one token used twice — the icon's colour and a `3px` left border. The whole builder takes the token **name** as an argument, so a new tone is a call, not a variant class.");

		md("The interesting line is the signature: `note(\"--prim\", \"info\", heading, body)`. Passing `\"--prim\"` and interpolating it into `` `var(${tone})` `` means the component never contains a colour, only the *name* of one — so it retunes with the theme and works in a theme it has never met.");

		md("## With an action");

		demo(() => {
			div.c("pad flex gap v-center", () => {
				icon("cloud_off").style("color", "var(--prim)");
				div.c("flex-1", () => p("The dev socket is off — this is not localhost."));
				button.c("prim", "Retry");
			}).style({ ...surface, borderLeft: "3px solid var(--prim)" });
		}, "`flex-1` on the text is what pushes the button to the far end, and `v-center` lines all three up. One row, four classes.");

		md("Note what is **not** here: no `.alert`, no `.alert-info`, no dismiss state. A callout is a padded surface with a coloured edge, and every part of that is already a utility or a token.");

		md("Next: [Toolbar](/framework/styles/components/toolbar/) — the same row, doing more work.");
	}
});
