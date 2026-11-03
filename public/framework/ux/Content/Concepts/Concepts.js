import { div, a, span, h4, icon } from "../../../core/View/View.js";
import ContentModule from "../ContentModule.js";

/**
 * class Concepts extends ContentModule — what a page is made of, as linked icon tiles.
 * Each concept is a child page: a name, a slug, an icon. Flat tiles, or sections drawn as
 * columns (a header over its tiles).
 *
 *   new Concepts({ items: [{ name, slug, icon, href? }] })
 *   new Concepts({ sections: [{ title, items: [...] }] })
 *
 * A tile links to `href`, else to `<the page's folder>/<slug>/`.
 */
export default class Concepts extends ContentModule {

	render(){
		if (this.sections?.length){
			this.ac("ux-content-wall");
			for (const s of this.sections) div.c("flex v gap-50", () => { h4(s.title); this.tiles(s.items); });
		} else this.tiles(this.items);
	}

	tiles(items = []){
		return div.c("flex wrap gap-50", () => items.forEach(it => this.tile(it)));
	}

	// A tile's link is the page's ADDRESS (`this.page.url`), never where its files
	// live (`folder_url()`) — a card can be shown at a different address than its
	// files' folder (AI 2), and the tile must go where the reader already is.
	href(it){ return it.href ?? `${this.page?.url ?? ""}${it.slug}/`; }

	tile(it){
		return a.c("btn ux-content-tile", () => { if (it.icon) icon(it.icon); span(it.name); }).attr("href", this.href(it));
	}
}

Concepts.prototype.classes = "ux-content-concepts";

export { Concepts };
