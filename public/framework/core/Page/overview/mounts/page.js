import { Page, demo, md, div, span } from "/app.js";

// Same tree, three parents — only render() differs, and that IS the demo.
const child = () => new Page({ title: "Child", content(){ md("I mounted **here**."); } });

const sibling = () => new Page({ title: "Parent", children: { Child: child } });

const owner = () => new Page({
	title: "Parent", children: { Child: child },
	render(){
		return this.view ??= div.c("page flow", () => {
			md("My own `$pages` — set right here in `render()`.");
			this.$pages = div.c("pad surface");
		}).ac("standard");
	},
});

const regioned = () => new Page({
	title: "Parent", children: { Child: child },
	render(){ return this.view ??= div.c("page flow", () => this.tabs()).ac("standard"); },
});

const column = (name, claim, tree) => div.c("flex v gap").append(() => {
	span.c("h4", name);
	demo.app(tree(), { nav: true }).style("height", "10em");
	md("_" + claim + "_");
});

const board = () => div.c("flex gap wrap", () => {
	column("app.$pages", "Default render() — the child lands beside me.", sibling);
	column("parent's $pages", "I set this.$pages — the child lands inside me.", owner);
	column("tabs() region", "this.tabs() names a region — the child lands there.", regioned);
});

export default new Page({
	meta: import.meta,
	title: "Mounts",
	group: "Pages are navigation",
	description: "Where a child mounts — Page.container() asks a region, then the nearest $pages, then app.$pages.",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", board)); },

	content(){
		md("Same tree, three parents. `Page.container()` asks three questions, in order: a named **region**, the nearest ancestor's own `$pages`, then `app.$pages` (`Page.class.js:160-168`). Click **Child** in each box and watch where it lands.");

		demo.stage(board).ac("bleed");
		demo.source(board, "Source");
	},
});
