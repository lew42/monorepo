import { Page, md, demo, div, p, button, icon } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran.
const panel = () => div.c("ui-panel surface", () => {
	div.c("ui-panel-head pad flex v-center split gap", () => {
		div.c("h3", "Delete branch?");
		button(() => icon("close")).style({ background: "none", border: "none", padding: "0" });
	});

	div.c("pad", () => p("`michael/dev` and its preview deployment go away. This cannot be undone."));

	div.c("ui-panel-foot pad flex gap reverse", () => {
		button.c("prim", "Delete");
		button("Cancel");
	});
});

const headless = () => div.c("ui-panel surface raised", () => {
	div.c("pad", () => p("No header — so no hairline above, and nothing to delete."));
	div.c("ui-panel-foot pad flex gap reverse", () => button.c("prim", "Got it"));
});

export default new Page({
	meta: import.meta,
	title: "Panel",
	description: "A template plus three rules — and `reverse`, the right-aligned action row nobody expects.",
	icon: "crop_square",

	children: [
		demo.page("raised", headless, {
			note: "A literal `rgba(0,0,0,0.14)` is invisible on a dark surface and too heavy on a light one. Mixing the **ink token** means the shadow is always a percentage of whatever the theme decided contrast is — the same move `Sidebar.css` makes for all of its fills. It is a variant rather than the default because most panels sit on a page, not above one. Omitting the header takes its hairline with it." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(panel, steer).ac("bleed"),
			def: panel,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.panel()`.** It took three slots by position — `panel(null, body, foot)` was a real call — and the one page on this site that actually wanted a panel wrote its own rather than import it. Omitting a row is now deleting three lines, which is both shorter and impossible to get backwards.",
		});

		md("## Three rules, and they are all relationships");

		md("```css\n.ui-panel-head { border-bottom: 1px solid var(--line); }\n.ui-panel-foot { border-top: 1px solid var(--line); }\n.ui-panel.raised { box-shadow: 0 8px 30px color-mix(in srgb, var(--ink) 14%, transparent); }\n```");

		md("The hairlines are on the *rows*, not between them, so a panel with no header has nothing drawing a line to nowhere — the omission takes its rule with it.");

		md("## `reverse` is the missing `flex-end`");

		md("The utility set names two justifications — `h-center` (`center`) and `split` (`space-between`) — and an action row wants neither. The footer is `flex gap reverse`, which is `flex-direction: row-reverse`, and that puts the row against the far end for free with the gap intact.");

		md("The trade is real and worth stating: **the DOM order reverses too**, so the primary action comes first in the source and first in the tab order. For a confirm dialog that is arguably correct; for a wizard's *Back / Next* it is not, and then `justify-content: flex-end` is one inline declaration. A `.flex.end` utility is on the [record](/framework/ui/).");

		md("## Not a modal");

		md("There is no backdrop, no focus trap and no `<dialog>` here on purpose — that is [Dialog](/framework/ui/dialog/), and it is the browser's. What a panel is *made of* is this: a surface, three rows and two hairlines.");

		md("Next: [Tooltip](/framework/ui/tooltip/) — the component whose CSS is the whole component.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", panel)); },
});
