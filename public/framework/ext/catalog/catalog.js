import { View, div, is } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";

/* css: .page-catalog, .page-catalog-pages — and .page-previews as the rail, .page-title
   as the heading the rail's first entry takes over; Page.class.js emits all four. */
View.stylesheet(import.meta, "catalog.css");

/**
 * catalog — previews() as a persistent rail, beside the region the children mount in.
 *
 *     initialize(){ this.catalog(); }
 *
 * Declared at construction, not drawn from content(), because the page's own
 * `content()` becomes a real child — `intro`, first in the rail, wearing my title,
 * label and icon — and a child that arrives at render time has no url to be linked at.
 * So any index becomes previews-as-nav in one line, with its prose intact.
 *
 * The rail is the same wall of cards previews() always draws — live thumbs and all —
 * turned into a column that stays put while the active child renders beside it. The
 * intro fills the region from the start, exactly as a tab set fills its panel.
 *
 * A catalog is a screen, never a block of reading: it takes `bleed` — the whole
 * region rather than the measure — and no call site gets to decide otherwise.
 *
 * Design record: readme.md.
 */
Page.prototype.catalog = function(){
	// Rebuilt rather than appended to: the intro leads the rail, and `add()` sets last.
	const rest = [...this.children];
	const content = this.content;
	this.children.clear();

	// ⚠ The content keeps MY `this`. It was written as a method of this page, so
	// `this.whole()` and `this.parent` must still mean what the author typed.
	this.add("intro", {
		title: this.title, label: this.label ?? this.title, icon: this.icon,
		content: is.fn(content) ? () => content.call(this) : content,
	});

	rest.forEach(([name, page]) => this.children.set(name, page));

	this.content = screen;
	return this;
};

// What the page renders once it is a catalog.
function screen(){
	let $pages;

	const $catalog = div.c("page-catalog bleed", () => {
		this.previews();
		this.$pages = $pages = div.c("page-catalog-pages");
	});

	// The region is never blank: the intro renders `.default`, shown only while
	// nothing of mine is routed — the .tab-panel contract (catalog.css).
	const filling = Promise.resolve(this.loading).then(() => {
		const first = this.children.values().next().value?.assign({ app: this.app });
		if (first) $pages.append(first.render().ac("default"));

		// ⚠ the cards were built after mark() ran, so they missed the pass
		this.app?.router?.mark_links();
	});

	// so a cold load waits for the region instead of painting an empty one
	this.app?.loaders?.push(filling);

	return $catalog;
}

export default Page.prototype.catalog;
