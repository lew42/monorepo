import { Page, h2, demo, div, p } from "/app.js";
import avatar, { avatar as avatarFn } from "/framework/styles/components/avatar/component.js";

const profile_demo = () => div.c("flex gap v-center pad", () => {
	avatarFn("JD", { "--avatar": "3em", background: "var(--prim)" });
	div.c("flex v", () => {
		p.c("h4", "Jamie Doe");
		p("jamie@lew42.dev").style({ color: "var(--subtle)", fontSize: "0.85em" });
	}).style("gap", "0.1em");
}).style({ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)" });

export default new Page({
	meta: import.meta,
	title: "Avatar",
	description: "Initials in a circle, one function, sized by a token.",

	content(){
		demo(avatar, "Three sizes off one `--avatar` token, a stack with a `--surface` ring, and an attribution row: one function serves all three.").ac("mb");

		h2("Profile card").ac("mb");
		demo(profile_demo, "The same builder, larger, paired with a name and email. Nothing here is a new component, just `avatar()` called with a bigger token.");
	}
});