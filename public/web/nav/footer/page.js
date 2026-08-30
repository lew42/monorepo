import { Page, demo, md, div, a, span, hr } from "/app.js";

/* Prev/next from the parent's own child order — `children:` is the reading order,
   so nothing here declares a sequence twice. An empty `span` holds the left slot
   when there is no previous, so `split` still parks "next" on the right. */
const ends = page => {
	const names = [...page.parent.children.keys()];
	const at = names.indexOf(page.name);

	const end = (name, text) => name
		? a.c("page-link", text(page.parent.nav_for(name).label)).href(page.parent.nav_for(name).url)
		: span();

	return div.c("flex split gap v-center", () => {
		end(names[at - 1], label => "← " + label);
		end(names[at + 1], label => label + " →");
	});
};

const chapter = (name, title, text) => ({
	name, title,
	content(){ md(text); hr(); ends(this); },
});

const primer = () => new Page({
	title: "Primer",
	icon: "auto_stories",

	children: [
		chapter("setup", "Setup", "**Read to the end and the way on is right there.** No scrolling back up, no hunting a rail for the next name — the footer is the one nav that arrives exactly when the reader needs it."),
		chapter("markup", "Markup", "A footer says *what comes next*, which a [sidebar](/web/nav/sidebar/) cannot: a rail shows a set, a footer shows a sequence."),
		chapter("styling", "Styling", "The order is `children:` — the same list the menu reads, so the two can never disagree."),
		chapter("shipping", "Shipping", "Last chapter, so there is no next. The slot is left empty rather than faked."),
	],

	content(){ md("Four chapters, in order. Open the first and walk it with the links at the bottom."); this.previews(); },
}).children.get("setup");

export default new Page(demo.tree({
	meta: import.meta,
	group: "Patterns",
	tree: primer,
	min: "24em",

	note: "**Footer nav is for content with an order** — a tutorial, a handbook, a spec. It is the cheapest pattern here (two links, no shell, no state) and the only one placed where reading actually ends. It does not replace a rail: prev/next says where to go *next*, never where you are. Pair them.",
}));
