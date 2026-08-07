import { Page, md, demo, div, p, button } from "/app.js";
import { surface } from "../parts.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Panel",
	description: "Header, body, footer — and `reverse`, the right-aligned action row nobody expects.",
	icon: "crop_square",

	content(){

		demo(component, "Three `pad` rows on one `surface`, held apart by two hairlines. The elevation is `color-mix(in srgb, var(--ink) 14%, transparent)` — **derived from a token rather than a literal**, which is how `Sidebar.css` builds all of its fills, so the shadow stays right in dark mode.");

		md("## `reverse` is the missing `flex-end`");

		md("The utilities name two justifications — `h-center` (`center`) and `split` (`space-between`) — and a dialog's action row wants neither. `flex.reverse` is `flex-direction: row-reverse`, which puts the row against the far end for free:\n\n```js\ndiv.c(\"pad flex gap reverse\", () => {\n\tbutton.c(\"prim\", \"Delete\");\n\tbutton(\"Cancel\");\n});\n```\n\nThe trade is real and worth stating: the **DOM order reverses too**, so the primary action comes first in the source and first in the tab order. For a confirm dialog that is arguably correct. When it isn't, `justify-content: flex-end` is one inline declaration — and a `.flex.end` utility is on the [findings list](/framework/styles/components/), because a right-aligned action row is the most common row on any form.");

		md("## Not a modal");

		md("There is no backdrop, no focus trap and no `<dialog>` here on purpose. `showModal()` already gives you the top layer, `::backdrop`, Escape-to-close and the focus trap, and none of that is CSS a component library should be reinventing. What a panel is *made of* is this: a surface, three rows and two rules.");

		demo(() => {
			div.c("pad flex v", () => {
				p("A panel with nothing but a body is a `card` — the header and the footer are what make it a panel.");
				div.c("flex gap reverse", () => {
					button.c("prim", "Got it");
				});
			}).style({ ...surface, gap: "1em", maxWidth: "26em" });
		}, "And the smallest version: one row, one action. `reverse` still right-aligns a single button.");

		md("Next: [Tooltip](/framework/styles/components/tooltip/) — the one component that needs a stylesheet.");
	}
});
