import { Page, demo, md, div, a, span, h4 } from "/app.js";
import web from "/framework/ext/demo/web.js";

// A column of cards, beside the region whatever you pick mounts in.
const rail = (page, basis) => {
	div.c("basis", () => page.previews().style({ "--column": "100%", "--gap": "0.35em" })).style("--basis", basis);
	page.$pages = div.c("flex-1");
};

// A section page: what it is, then its children as cards — the shape being tested.
const cards = site => site.children.forEach(page => { if (page.children.size) page.content = function(){
	md(`**${this.title}** — and below it, its own three pages.`); this.previews(); }; });

/* (a) descend the rail — the rail stays at the top level forever. */
const depot = () => {
	const site = web({ title: "Depot", content(){ div.c("flex gap", () => rail(this, "8.5em")); } });
	cards(site);
	return site.children.get("html");
};

/* (b) re-root the rail — every node reports where it is, the rail follows, and the
   trail above is the only way back up. */
const vault = () => {
	const site = web({
		title: "Vault",

		content(){
			this.$trail = div.c("flex gap v-center").style("--gap", "0.4em");
			div.c("flex gap", () => {
				this.$rail = div.c("basis").style("--basis", "8.5em");
				this.$pages = div.c("flex-1");
			});
		},

		focus(page){
			const at = page.children.size ? page : page.parent;

			this.$rail.empty(() => at.previews().style({ "--column": "100%", "--gap": "0.35em" }));
			this.$trail.empty(() => page.chain().forEach((up, i) => {
				if (i) span.c("muted", "/");
				a.c("page-link", up.title).href(up.url);
			}));
		},
	});

	// Every node reports where it is; the shell re-roots there. The region says only
	// what the page is — the rail beside it has already become its children.
	const stamp = page => {
		if (page.children.size) page.content = function(){ md(`**${this.title}** — the rail beside this is *its* pages now.`); };
		page.activated = function(){ this.chain()[0].focus(this); };
		page.children.forEach(stamp);
	};

	site.children.forEach(stamp);
	return site.children.get("html");
};

/* (c) a rail per level — the parent's rail stays because the child mounts inside it. */
const rack = () => {
	const site = web({ title: "Rack", content(){ div.c("flex gap", () => rail(this, "7em")); } });

	site.children.forEach(page => { if (page.children.size)
		page.content = function(){ div.c("flex gap", () => rail(this, "7em")); }; });

	return site.children.get("css").children.get("layout");
};

const variant = (label, tree, verdict) => div.c("flex v gap", () => {
	h4(label);
	demo.app(tree()).style("height", "30em");
	md(verdict);
});

// `pad` because a bleed stage has no inset of its own, and these columns end in prose.
const screen = () => div.c("flex auto gap pad", () => {
	variant("(a) descend the rail", depot, "**Cheapest, and it stops at two.** The rail never re-roots, so level three has nothing pointing at it but the cards in the region — and once you are there, the rail is lit on an ancestor you did not choose.");
	variant("(b) re-root the rail", vault, "**Goes as deep as you like, and forgets its siblings.** The rail is always *here*, the trail is always *up*, and the price is that the level you came from vanishes the moment you arrive.");
	variant("(c) a rail per level", rack, "**Shows the whole path at once — and eats the page doing it.** Two rails and a region need real width; a third level would leave nothing to read.");
}).style("--column", "23em");

export default new Page({
	meta: import.meta,
	group: "Studies",

	// ⚠ 25, not the usual 50: at half size the card crops to the first box, and the
	// whole point of this one is the three side by side.
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25 pad", screen)); },

	content(){
		demo.stage(screen).ac("bleed");
		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**The open one.** Nav → content → deeper nav is a tree, and a tree wants two things on screen at once that fight for the same space: a *small preview* of each child, and the *full view* of the one you picked — which has children of its own, which want previews too.");

		md("**Recommendation: (b), with (a) as the default until you have a third level.** (a) is one call — `initialize(){ this.catalog(); }` — and it is genuinely enough for two levels, which is most sites. It fails silently at three: nothing in the rail moves, so the reader cannot tell that going deeper is even possible. (b) costs a `focus()` method and one line per node, and in exchange the depth is unbounded and the rail is always about where you are. (c) is the honest failure — it *works*, it reads well at 3440, and it is out of room the moment a fourth column is asked for.");

		md("What none of the three solve: **(b) drops the siblings you came from.** The trail says which section you are in but not what else was in it, so going sideways at depth means going up first. A rail that showed the current level *under* a collapsed parent would fix it, and would be the first thing here that is not built out of blocks this site already has — which is why it is not built.");
	},
});
