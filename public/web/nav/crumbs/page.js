import { Page, demo, md, div, a, span } from "/app.js";

// `chain()` is [root … me], so a trail is a map over it. The last crumb is the
// page you are on — kept as a link, because a gap in the row reads as a bug.
const trail = page => div.c("flex gap v-center", () => page.chain().forEach((up, i) => {
	if (i) span.c("muted", "/");
	a.c("page-link", up.title).href(up.url);
})).style("--gap", "0.4em");

const leaf = (name, title, text) => ({ name, title, content(){ trail(this); md(text); } });

const index = (name, title, text, children) => ({
	name, title, children,
	content(){ trail(this); md(text); this.previews(); },
});

// ⚠ Opened four levels down, where the pattern is actually worth something.
const archive = () => new Page({
	title: "Archive",
	icon: "inventory_2",

	children: [
		index("papers", "Papers", "Cards go down; the trail above goes back up. Nothing else on this page is navigation.", [
			index("1959", "1959", "Three levels in. The trail is the only thing telling you so.", [
				leaf("letters", "Letters", "**Four levels deep, and the way out is one row.** A trail costs one line and scales with depth — which is exactly where a [bar](/web/nav/bar/) or a [rail](/web/nav/sidebar/) stops helping, because neither of them can say *where in the tree you are*."),
				leaf("drafts", "Drafts", "Every crumb is a real page with a real url, so the trail is the tree and not a history stack. Back is not the same thing."),
			]),
			index("1960", "1960", "The trail is built from `chain()`, so it cannot disagree with the tree.", [
				leaf("notes", "Notes", "One `page.chain().forEach()` — the whole pattern."),
			]),
		]),

		leaf("photos", "Photos", "A shallow page gets a short trail. Nothing to configure."),
	],

	content(){ trail(this); md("A deep site with no persistent nav at all. Descend by card, climb by crumb."); this.previews(); },
}).children.get("papers").children.get("1959").children.get("letters");

export default new Page(demo.tree({
	meta: import.meta,
	group: "Patterns",
	tree: archive,
	height: "26em",

	note: "**Crumbs are for depth, and they are the only pattern that gets *better* the deeper you go.** They answer \"where am I\" and \"what contains this\" in one row, which no bar or rail can do — but they answer nothing about what else is *beside* you, so a trail on a shallow site is decoration. Note the url strip on this box: `demo.app` builds the same thing from `chain()`, one segment per link.",
}));
