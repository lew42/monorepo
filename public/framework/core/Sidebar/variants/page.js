import { Page, p, h2, a } from "/app.js";

// Splits `this.children` (a Map, name → page-or-null) into just the names
// asked for, in that order — so the index can group its cards into rows
// instead of showing every child in one long wall.
function pick(children, names){
	return new Map(names.split(" ").map(name => [name, children.get(name)]));
}

export default new Page({
	meta: import.meta,
	title: "Sidebar variants",
	description: "Five pages about the left rail, to look at, not a decision — four on what the top says, one on who owns it.",
	icon: "view_sidebar",

	children: "a b c d rail walkthrough",

	content(){

		a.c("page-link").href("walkthrough/").text("Walk through all of this, step by step →");
		p("The owner, thinking out loud about the left rail: “help me understand this by creating multiple variants that exemplify what I'm saying…” These are exactly that — things to look at, not a decision yet. Every one is the real Sidebar component, at real size, beside a real nav tree. Click a card to open it full-screen.");

		h2("What the top of the rail says");
		p("Four takes on the brand row — the logo and word at the very top. Each page quotes, in a blockquote, the owner sentence it shows, and names its own trade-off. Long titles: see C.");
		this.previews(pick(this.children, "a b c d"));

		h2("Who owns the rail");
		p("One page, two stages: the app hands one rail around to whichever page is active, or every page keeps its own rail and hides the rest.");
		this.previews(pick(this.children, "rail"));
	},
});
