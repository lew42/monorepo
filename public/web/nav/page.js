import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "Nine navigation patterns, live — and two studies in what moves when you click.",
	icon: "explore",

	// Rail order: simplest first, then the two studies. Each declares its own `group`.
	children: "links bar tabs sidebar drawer crumbs footer wall rail jumps drill",

	// The rail IS the pattern — previews-as-nav, demonstrating itself.
	// ⚠ From initialize(), never content(): a child added at render time has no url.
	initialize(){ this.catalog(); },

	content(){
		md("**Every card on the left is a real site.** Click into one and the tree inside it navigates — its own links, its own url strip, its own pages. Nothing is a screenshot.");

		md("The nine patterns are ordered by how much they promise. An anchor in a sentence promises nothing and always works; a persistent rail promises that it will still be there after the click, and that promise is the whole reason to build one.");

		md("Then two studies. **jumps** is what it costs when each page brings its own layout. **drill** is the one that is still open: nav → content → deeper nav, on one screen.");

		md("The rail beside this text is `initialize(){ this.catalog(); }` — the [rail](/web/nav/rail/) pattern, which is also the last card in it.");
	},
});
