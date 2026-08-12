import { Page, demo, md } from "/app.js";

const leaf = (name, title, icon, text) => ({ name, title, icon, content(){ md(text); } });

const section = (name, title, icon, text, children) => ({
	name, title, icon, children,
	content(){ md(text); this.previews(); },
});

const gallery = () => new Page({
	title: "Gallery",
	icon: "grid_view",

	children: [
		section("prints", "Prints", "photo", "One `previews()` again, one level down. Same call, same cards — a wall does not care how deep it is.", [
			leaf("etching", "Etching", "image", "A card is drawn by the page it points at: `preview(nav)`. Override it and the card becomes a live render of the page."),
			leaf("litho", "Litho", "layers", "The default card is an icon and a label, so a page that says nothing still gets one."),
			leaf("screen", "Screen", "filter_frames", "`card: \"wide\"` or `\"tall\"` is a claim the child makes on whatever wall it turns up in."),
		]),

		section("paint", "Paint", "palette", "The wall is a grid of `auto-fill` tracks, so the column count is the window's decision, not the page's.", [
			leaf("oil", "Oil", "opacity", "Cards are `<div>`s with one link inside — the label. The thumb above it is inert."),
			leaf("water", "Water", "water_drop", "An `<a>` inside an `<a>` is invalid, and the browser silently un-nests it. That is the whole reason for the split."),
			leaf("ink", "Ink", "draw", "The link's `::after` spreads over the card, so the whole tile is clickable anyway."),
		]),

		section("glass", "Glass", "diamond", "Three sections, three pages each — and the index above is the one that shows them all.", [
			leaf("blown", "Blown", "science", "`walls()` is depth 1 on purpose. Two levels of headings over cards is a sitemap, not a page."),
			leaf("cast", "Cast", "foundation", "A childless child gets no rung — a heading over nothing is `walls()` quietly turning back into `previews()`."),
			leaf("fused", "Fused", "join_full", "Everything comes from `children:`, so the wall and the menu are the same list."),
		]),
	],

	content(){
		md("**`walls()`** — one rung per section, each rung its own wall of cards. An index of indexes, which is what a landing page usually wants to be.");
		this.walls();
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Patterns",
	tree: gallery,
	height: "34em",

	note: "**Cards are navigation that shows you what is behind the door.** This is the pattern this site runs on: [`previews()`](/framework/core/Page/) draws a card per child, `walls()` draws a rung per section, and a page that overrides `preview()` puts a live render in its own card. The cost is space — a wall is a whole screen, so it works as a landing and never as a header.",
}));
