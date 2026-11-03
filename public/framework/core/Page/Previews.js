import PageWeight from "./PageWeight.js";
import { View, div, p, h2, h4, a, span, icon } from "../View/View.js";

// The cards a page draws for its children: a card list, a wall of rungs, one card. `page.previews()` etc. build one of these. (doc/previews.md)
// Every call back into the page goes through `this.page.preview*()`, so a page that overrides `preview(nav)` still wins.
export default class PagePreviews {

	page = null;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// A card per child, drawn by the child; a declared-but-unresolved one gets the default card.
	// `{ weight: true, min }` ranks the cards heaviest first, sizes them w1..w3 and hides any lighter than `min`. (weight/readme.md)
	list(pages = this.page.children, opts = {}){
		let group;

		const $list = div.c("page-previews bleed", () => pages.forEach((child, name) => {
			if (child?.group && child.group !== group)
				h4.c("page-previews-group", group = child.group);

			const nav = this.page.nav_for(name);
			child ? child.preview(nav) : this.page.preview_card(nav);
		}));

		if (opts.weight) PageWeight.apply($list, opts);
		return $list;
	}

	// One rung per child: its name, then ITS children as cards. ⚠ `leaf` opts a child out whole.
	// rungs() is the array (built detached); walls() is the one flex column. (doc/watch-out.md)
	walls(){
		return div.c("page-walls bleed flex v gap", $box => this.rungs().forEach(rung => $box.append(rung)))
			.style("--gap", "3em");
	}

	rungs(){
		const saved = View.captor;
		View.captor = null;
		try {
			const rungs = [];
			this.page.children.forEach((child, name) => {
				if (!child?.children.size || child.leaf) return;

				const nav = this.page.nav_for(name);

				rungs.push(div.c("page-wall flex v gap", () => {
					h2.c("page-wall-title", () => a.c("page-link", nav.label).href(nav.url));
					child.previews();
				}).style("--gap", "1em"));
			});
			return rungs;
		} finally {
			View.captor = saved;
		}
	}

	// ⚠ The thumb is INERT (Page.css): a live render here would nest an <a> in an <a>. `class_card` wears the dark surface. (doc/watch-out.md)
	card(nav, thumb){
		return div.c("page-preview", () => {
			if (thumb) this.page.preview_thumb(thumb);
			this.page.preview_link(nav);
			if (!thumb && nav.description) p.c("page-preview-desc", nav.description);
		}).ac(nav.card).ac(nav.class_card && "page-surface-dark");
	}

	// The thumb, plus the one measurement CSS can't make: `.capped` when a live render is taller than --stage-max. (doc/previews.md)
	thumb(thumb){
		const $thumb = div.c("page-preview-thumb", thumb);

		requestAnimationFrame(() => {
			if ($thumb.el.scrollHeight > $thumb.el.clientHeight + 1) $thumb.ac("capped");
		});

		return $thumb;
	}

	// The card's only real link — Page.css spreads its ::after over the whole card.
	link(nav){
		return a.c("page-preview-link", () => {
			if (nav.icon) icon(nav.icon);
			span.c("page-preview-title", nav.label);
		}).href(nav.url);
	}
}
