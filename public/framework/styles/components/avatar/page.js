import { Page, md, demo, div } from "/app.js";
import component, { avatar } from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Avatar",
	description: "Initials in a circle — one function, sized by a token.",
	icon: "account_circle",

	content(){

		demo(component, "`flex v-center h-center` centres two letters in a box; `border-radius: 999px` makes the box a circle; `--avatar` is the size. **No stylesheet** — every declaration is inline and every value is a token.");

		md("## The stack is two declarations");

		md("Overlap is `margin-left: -0.6em` on every avatar after the first, and the ring is `border: 2px solid var(--surface)` — the surface colour, so the ring is a hole onto whatever the stack sits on and retints with the theme.");

		demo(() => {
			div.c("flex v-center", () => ["A", "B", "C"].forEach((t, i) =>
				avatar(t, { marginLeft: i ? "-0.6em" : "0", border: "2px solid var(--surface)" })));
		}, "`avatar()` is a named export, so a testimonial card or a comment row imports the function instead of copying the circle — [Testimonials](/framework/styles/sections/testimonials/) does exactly that.");

		md("An image avatar is the same box with an `img` in it — `borderRadius` clips it, and the initials become the alt-path rather than a second component.");

		md("Next: [Dialog](/framework/styles/components/dialog/) — the browser is the component.");
	}
});
