import { Page, md, demo, div, span, img } from "/app.js";
import { palette, copy } from "../parts.js";

// The template, verbatim — rendered in the palette AND handed to copy(), so the
// code on the page is the code that ran.
const stack = () => div.c("ui-avatars", () => {
	span.c("ui-avatar", "ML");
	span.c("ui-avatar accent", "AK");
	span.c("ui-avatar wash", "+4");
});

const sizes = () => div.c("flex gap v-center", () => {
	span.c("ui-avatar", "ml").style("--avatar", "1.75em");
	span.c("ui-avatar", "ML");
	span.c("ui-avatar accent", "ML").style("--avatar", "3.5em");
});

export default new Page({
	meta: import.meta,
	title: "Avatar",
	description: "One class, sized by a token — and the circle, the ring and the overlap are all CSS.",
	icon: "account_circle",

	content(){

		palette(
			["the stack", stack],
			["three sizes, one token", sizes],
		);

		md("## Copy it");

		copy(stack);

		md("**There is no `ui.avatar()` and no `ui.avatars()`.** Both were one-call passthroughs to `span.c()` and `div.c()`, and the two places on this site that actually draw an avatar — [team](/framework/styles/sections/team/) and [testimonials](/framework/styles/sections/testimonials/) — now write the span. The component is `.ui-avatar`, and it always was.");

		md("## `--avatar` is the size");

		md("One declaration serves a 1.75em chip and a 3.5em profile header — the same knob move `--column` makes on a grid. There is no `size` option and no `small`/`large` variant, because a token is strictly more capable than three names:");

		demo(() => {
			div.c("flex gap v-center", () => [1.5, 2.5, 4].forEach(size =>
				span.c("ui-avatar", "ML").style("--avatar", size + "em")));
		}, "`.style(\"--avatar\", \"4em\")`. A variant class would have to pick the sizes for you; a token lets the caller.");

		md("## The ring, and the overlap");

		md("```css\n.ui-avatars > .ui-avatar { border: 2px solid var(--surface); }\n.ui-avatars > .ui-avatar + .ui-avatar { margin-inline-start: -0.6em; }\n```");

		md("The ring is the **surface** colour, so an overlap reads as a hole onto whatever the stack sits on and retints with the theme. Both declarations were inline once, applied per circle by the caller with an `i ? … : 0` on the margin — the `+` selector says the same thing once and cannot get the first one wrong. That is the half of this component a template could not carry, which is exactly why `avatar.js` still exists.");

		md("The fill is `var(--ink)` and the letters `var(--surface)`. It was `var(--bg)` and a literal `white` until the review — **naming a colour is the thing a component may not do**, and `--ink`/`--surface` is the pair the theme already guarantees contrast between, in both modes. `accent` and `wash` override the fill and inherit the rest.");

		md("## An image avatar is the same circle");

		const face = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Crect width='8' height='8' fill='%23FF6157'/%3E%3Ccircle cx='4' cy='3' r='1.6' fill='%23fff'/%3E%3C/svg%3E";

		demo(() => {
			div.c("flex gap v-center", () => {
				span.c("ui-avatar", () => img().attr("src", face).attr("alt", ""));
				span.c("ui-avatar", () => img().attr("src", face).attr("alt", "")).style("--avatar", "3.5em");
			});
		}, "`overflow: hidden` and `object-fit: cover` on the child are already in the class, so an `img` needs nothing — and the initials stay the alt path rather than becoming a second component.");

		md("Next: [Dialog](/framework/ui/dialog/) — where the browser is the component.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", stack)); },
});
