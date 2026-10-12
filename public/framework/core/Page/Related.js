import { div, span, a, icon } from "../View/View.js";

// A page's pinned "Related" aside: links to other pages. `page.related_aside()` builds one of these. (doc/property/related.md)
export default class PageRelated {

	page = null;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// `related: "/a/ /b/"` — a string of urls, one row each.
	list(){ return (this.page.related ?? "").trim().split(/\s+/).filter(Boolean); }

	// Is there already a heading with this word on the page's view? Checked synchronously: the aside is appended last. (doc/property/related.md)
	has_heading(word){
		return [...this.page.view?.el.querySelectorAll("h1,h2,h3,h4,h5,h6") ?? []]
			.some(node => node.textContent.trim().toLowerCase() === word);
	}

	// The aside: a Related heading, then one row per url, icon and title read live.
	// ⚠ `Page.load(url, 0)`, not `Page.from`; a url that 404s drops its row silently (doc/property/related.md).
	aside(){
		this.page.related_drawn = true;
		const urls = this.list();
		if (!urls.length) return null;

		return div.c("page-related", () => {
			if (!this.has_heading("related")) span.c("page-related-title h4", "Related");

			div.c("page-related-links", () => urls.forEach(url => {
				const $row = div.c("page-related-row");

				this.page.constructor.load(url, 0).catch(() => null).then(page => {
					if (!page?.title) return void $row.remove();

					$row.empty(() => a.c("page-related-link", () => {
						if (page.icon) icon(page.icon);
						span(page.title);
					}).href(page.url ?? url));
				});
			}));
		});
	}
}
