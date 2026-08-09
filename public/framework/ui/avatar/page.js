import { Page, md, demo, div, img } from "/app.js";
import { palette } from "../parts.js";
import { avatar, avatars } from "./avatar.js";

export default new Page({
	meta: import.meta,
	title: "Avatar",
	description: "Initials in a circle — one class, sized by a token.",
	icon: "account_circle",

	content(){

		palette(
			["ui.avatar(…)", () => avatar("ML")],
			["accent", () => avatar.c("accent", "AK")],
			["three sizes, one token", () => div.c("flex gap v-center", () => {
				avatar("ml").style("--avatar", "1.75em");
				avatar("ML");
				avatar.c("accent", "ML").style("--avatar", "3.5em");
			})],
			["ui.avatars(…) — the stack", () => avatars(() => {
				["ML", "AK", "RB"].forEach(t => avatar(t));
				avatar.c("wash", "+4");
			})],
		);

		md("## Calling it");

		demo(() => {
			avatars(() => {
				avatar("ML");
				avatar.c("accent", "AK");
				avatar.c("wash", "+4");
			});
		}, "`avatar()` is one circle; `avatars()` is the overlapped stack. `flex` centres the letters, `border-radius: 999px` makes the box a circle, and every value is a token.");

		md("## `--avatar` is the size");

		md("One declaration serves a 1.75em chip and a 3.5em profile header — the same knob move `--column` makes on a grid. There is no `size` option and no `small`/`large` variant, because a token is strictly more capable than three names:");

		demo(() => {
			div.c("flex gap v-center", () => [1.5, 2.5, 4].forEach(size =>
				avatar("ML").style("--avatar", size + "em")));
		}, "`.style(\"--avatar\", \"4em\")`. A variant class would have to pick the sizes for you; a token lets the caller.");

		md("## The stack is two rules, and they moved");

		md("```css\n.ui-avatars > .ui-avatar { border: 2px solid var(--surface); }\n.ui-avatars > .ui-avatar + .ui-avatar { margin-inline-start: -0.6em; }\n```");

		md("The ring is the **surface** colour, so an overlap reads as a hole onto whatever the stack sits on and retints with the theme. Before the move to `ui/` both declarations were inline, applied per circle by the caller with an `i ? … : 0` on the margin — the `+` selector says the same thing once and cannot get the first one wrong.");

		md("## An image avatar is the same circle");

		const face = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Crect width='8' height='8' fill='%23FF6157'/%3E%3Ccircle cx='4' cy='3' r='1.6' fill='%23fff'/%3E%3C/svg%3E";

		demo(() => {
			div.c("flex gap v-center", () => {
				avatar(() => img().attr("src", face).attr("alt", ""));
				avatar(() => img().attr("src", face).attr("alt", "")).style("--avatar", "3.5em");
			});
		}, "`overflow: hidden` and `object-fit: cover` on the child are already in the class, so an `img` needs nothing — and the initials stay the alt path rather than becoming a second component.");

		md("Next: [Dialog](/framework/ui/dialog/) — where the browser is the component.");
	},
});
