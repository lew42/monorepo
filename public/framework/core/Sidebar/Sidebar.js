import { View, div, a, span, img, icon } from "../View/View.js";

View.stylesheet(import.meta, "Sidebar.css");

/**
 * Sidebar — [ 🖼 Brand ] over a list of links.
 *
 *   new Sidebar({
 *       brand: "Lew42",
 *       pages: [{ title: "Framework", url: "/framework/" }, …]
 *   });
 *
 * `classify()` turns the class name into the CSS class, so this renders
 * `div.sidebar` with nothing to declare. Any page can render one — it is a View
 * subclass, not a layout tier.
 *
 *   brand      text beside the logo
 *   brand_url  where that text points          (default "/")
 *   logo       image url                       (default: the document's icon)
 *   logo_url   where the logo points           (default "/")
 *   pages      links — Pages, or {title, url}; an entry with its own `pages`
 *              is a titled GROUP of them
 *
 * An entry may say `label` instead of `title`, and it wins — `Page.nav_for(name)`
 * returns exactly that shape, so a parent hands its nav entries straight in and the
 * sidebar, the tab bar and the preview cards cannot name a child three ways.
 *
 * The constructor is assign-based, so passing a method shadows it — which is how a
 * site with its own mark replaces the header instead of configuring it:
 *
 *     new Sidebar({ header: () => this.app.brand("Framework", this.url), pages })
 *
 * An arrow, so `this` stays the page that knows the brand. It runs while the Sidebar
 * is capturing, so whatever it builds lands in the panel.
 *
 * Design record: core/Sidebar/readme.md.
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
			(this.pages || []).forEach(page => page.pages ? this.group(page) : this.link(page));
		});
	}

	/* A titled run of links — "CORE", then five items. Duck-typed off `.pages` rather
	 * than a second `groups` property, so a flat sidebar, a grouped one, and a mix of
	 * both are the same call.
	 *
	 * `.h4` on an inner SPAN, not on the padded box: `em` padding resolves against the
	 * element that USES it, so sizing and padding the same element made group titles
	 * indent 36.5px while every link indented 41.8px. **Size the text, pad the box,
	 * never the same element.**
	 */
	group(group){
		return div.c("sidebar-group", () => {
			if (group.title) div.c("sidebar-group-title", () => span.c("h4", group.title));
			group.pages.forEach(page => this.link(page));
		});
	}

	/* One shape serves both cases: a loaded `Page` and a plain `{title, url}` both
	 * answer `.title` and `.url`, which is all a link needs — so a site can list
	 * sections it does not want to eager-load. `.active`/`.in-path` come from
	 * Router.mark_links().
	 *
	 * Built here rather than borrowed from `page.link()`: that handed every row a
	 * second component's class, and which of the two won came down to stylesheet
	 * order. A row in a sidebar is a sidebar's row.
	 *
	 * The label is a span because it carries the type size while the row's box stays
	 * measured against the base — see `.sidebar-label`.
	 */
	link(page){
		return a.c("sidebar-link").href(page.url).append(() => {
			if (page.icon) icon(page.icon);
			span.c("sidebar-label", page.label ?? page.title);
		});
	}

	// The document already declares the site's icon — reuse it rather than hardcoding
	// an asset path into a framework class.
	static favicon(){
		return document.querySelector('link[rel~="icon"]')?.href;
	}
}

export default Sidebar;
