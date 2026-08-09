import { Page, md, demo, div, p, button, icon } from "/app.js";
import { palette } from "../parts.js";
import { panel } from "./panel.js";

const head = () => {
	div.c("h3", "Delete branch?");
	button(() => icon("close")).style({ background: "none", border: "none", padding: "0" });
};

const body = () => p("`michael/dev` and its preview deployment go away. This cannot be undone.");
const foot = () => { button.c("prim", "Delete"); button("Cancel"); };

export default new Page({
	meta: import.meta,
	title: "Panel",
	description: "Header, body, footer — and `reverse`, the right-aligned action row nobody expects.",
	icon: "crop_square",
	classes: "grid",

	content(){

		palette(
			["all three rows", () => panel(head, body, foot)],
			["no header", () => panel(null, body, foot)],
			["raised", () => panel.c("raised", head, body, foot)],
			["body only — that's a card", () => panel(null, body)],
		);

		md("## Calling it");

		demo(() => {
			panel(
				() => div.c("h3", "Delete branch?"),
				() => p("This cannot be undone."),
				() => { button.c("prim", "Delete"); button("Cancel"); });
		}, "Three arguments, three padded rows on one surface. Omit head or foot and both the row **and its hairline** go away — the rules are `+`-free, so nothing is left drawing a line to nowhere.");

		md("## `reverse` is the missing `flex-end`");

		md("The utility set names two justifications — `h-center` (`center`) and `split` (`space-between`) — and an action row wants neither. The footer is `flex gap reverse`, which is `flex-direction: row-reverse`, and that puts the row against the far end for free with the gap intact.");

		md("The trade is real and worth stating: **the DOM order reverses too**, so the primary action comes first in the source and first in the tab order. For a confirm dialog that is arguably correct; for a wizard's *Back / Next* it is not, and then `justify-content: flex-end` is one inline declaration. A `.flex.end` utility is on the [record](/framework/ui/) — a right-aligned action row is the most common row on any form.");

		md("## The elevation is derived, not literal");

		md("```css\n.ui-panel.raised { box-shadow: 0 8px 30px color-mix(in srgb, var(--ink) 14%, transparent); }\n```");

		md("A literal `rgba(0,0,0,0.14)` is invisible on a dark surface and too heavy on a light one. Mixing the **ink token** means the shadow is always a percentage of whatever the theme decided contrast is — the same move `Sidebar.css` makes for all of its fills. It is a variant rather than the default because most panels sit on a page, not above one.");

		md("## Not a modal");

		md("There is no backdrop, no focus trap and no `<dialog>` here on purpose — that is [Dialog](/framework/ui/dialog/), and it is the browser's. What a panel is *made of* is this: a surface, three rows and two hairlines.");

		md("Next: [Tooltip](/framework/ui/tooltip/) — the first component that genuinely needs a selector.");
	},
});
