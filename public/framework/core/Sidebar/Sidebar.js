import { View, div, a, img } from "../View/View.js";

View.stylesheet(import.meta, "Sidebar.css");

/**
 * Sidebar — [ 🖼 Brand ] over a list of links.
 *
 *   new Sidebar({
 *       brand: "Lew42",
 *       pages: [{ title: "Framework", url: "/framework/" }, …]
 *   });
 *
 * Extracted from ColumnPager so it isn't owned by one layout. ColumnPager
 * renders one; so can a plain page. The look lives in Sidebar.css; a layout only
 * says where it goes (see `.column-pager > .sidebar` in ColumnPager.css).
 *
 * `classify()` turns the class name into the CSS class, so this renders
 * `div.sidebar` with nothing to declare.
 *
 * ── Properties ───────────────────────────────────────────────────────────
 *   brand      text beside the logo
 *   brand_url  where that text points          (default "/")
 *   logo       image url                       (default: the document's icon)
 *   logo_url   where the logo points           (default "/")
 *   pages      links — Pages, or {title, url}
 *
 * Two link destinations on purpose: in a ColumnPager the logo goes to the site
 * root while the text goes to the section you're in. On a homepage both are "/".
 */
export class Sidebar extends View {

	render(){
		this.header();
		this.nav();
	}

	// [ logo ][ brand ] — named header() so it can't collide with the `brand` property
	header(){
		return div.c("brand", () => {
			const logo = this.logo ?? Sidebar.favicon();

			if (logo)
				a(() => img().attr("src", logo).attr("alt", ""))
					.href(this.logo_url ?? "/").ac("brand-logo");

			if (this.brand)
				a(this.brand).href(this.brand_url ?? "/").ac("brand-title");
		});
	}

	nav(){
		return div.c("sidebar-nav", () => {
			(this.pages || []).forEach(page => this.link(page));
		});
	}

	/* Duck-typed so one sidebar serves both cases: a loaded `Page` brings its own
	 * link() (and knows its url from import.meta), while a plain {title, url}
	 * needs no import at all — which is how a site lists sections it does not
	 * want to eager-load. `.active`/`.in-path` come from App.mark_links(). */
	link(page){
		return (page.link ? page.link() : a(page.title).href(page.url)).ac("sidebar-link");
	}

	/* The document already declares the site's icon — reuse it rather than
	 * hardcoding an asset path into a framework class. */
	static favicon(){
		return document.querySelector('link[rel~="icon"]')?.href;
	}
}

export default Sidebar;
