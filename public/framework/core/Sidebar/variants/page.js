import { Page, h1, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Sidebar variants",
	description: "Four takes on the rail's brand row — the logo and word at the top — to look at, not a decision.",
	icon: "view_sidebar",

	children: "a b c d",

	content(){

		h1("Sidebar variants");

		p("The owner, thinking out loud about the left rail: “help me understand this by creating multiple variants that exemplify what I'm saying…” These four are exactly that — things to look at, not a decision yet. Every one is the real Sidebar component, at real size, beside a real nav tree. Click a card to open it full-screen.");

		this.previews();

		p("Each page quotes, in a blockquote, the owner sentence it shows, and names its own trade-off. Long titles: see C.");
	},
});
