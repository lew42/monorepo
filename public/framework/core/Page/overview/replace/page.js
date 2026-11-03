import { Page, demo, md, code, div, span } from "/app.js";

// Same two-page tree, twice — only the parent's render() differs.
const child = () => new Page({ title: "Child", content(){ md("I'm the child."); } });

const sibling = () => new Page({
	title: "Parent", children: { Child: child },
	content(){ md("I'm in `app.$pages` — Child lands beside me, and I go dark."); },
});

const own = () => new Page({
	title: "Parent", children: { Child: child },
	render(){
		return this.view ??= div.c("page flow", () => {
			md("I set my own `$pages` — Child lands **inside** me. I never go dark.");
			this.$pages = div.c("pad surface");
		}).ac("standard");
	},
});

const column = (name, claim, tree) => div.c("flex v gap").append(() => {
	span.c("h4", name);
	demo.app(tree(), { nav: true }).style("height", "9em");
	md(claim);
});

const board = () => div.c("flex gap wrap", () => {
	column("Replace", "A sibling of the parent's view: click Child and Parent disappears.", sibling);
	column("Keep", "Inside the parent's own `$pages`: click Child and Parent stays put.", own);
});

export default new Page({
	meta: import.meta,
	title: "Replace",
	group: "Pages are navigation",
	description: "A sibling REPLACES its parent on screen; a page with its own $pages KEEPS it.",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", board)); },

	content(){
		md("Click **Child** on each side. The real Router marks the active leaf `.active-page` and every ancestor `.active-ancestor`; these boxes mark the same way with `.default`. One CSS line decides who shows:");

		code.css(`.page:not(.active-page, .active-ancestor:has(.page.active-page), .default) { display: none; }`);

		demo.stage(board).ac("bleed");
		demo.source(board, "Source");
	},
});
