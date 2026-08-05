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
 * Extracted from the old ColumnPager so it isn't owned by one layout (that tier
 * is now in core/legacy/). Any page can render one. The look lives in
 * Sidebar.css; whatever places it only says where it goes — `flex: 0 0 var(--sidebar)`
 * and nothing else.
 *
 * `classify()` turns the class name into the CSS class, so this renders
 * `div.sidebar` with nothing to declare.
 *
 * ── Properties ───────────────────────────────────────────────────────────
 *   brand      text beside the logo
 *   brand_url  where that text points          (default "/")
 *   logo       image url                       (default: the document's icon)
 *   logo_url   where the logo points           (default "/")
 *   pages      links — Pages, or {title, url}; an entry with its own `pages`
 *              is a titled GROUP of them
 *
 * An entry may say `label` instead of `title`, and it wins. That is not a second
 * way to spell one thing: a **label** belongs to the list it appears in, a
 * **title** to the page, and `Page.nav_for(name)` already returns the former —
 * so a parent hands its nav entries straight to `pages` and the panel, the tab
 * bar and the preview cards cannot end up naming a child three ways.
 *
 * Two link destinations on purpose: inside a section the logo goes to the site
 * root while the text goes to the section you're in. On a homepage both are "/".
 *
 * A site with its own mark replaces the whole header rather than configuring it
 * — the constructor is assign-based, so passing `header` shadows the method:
 *
 *     new Sidebar({ header: () => this.app.brand("Framework", this.url), pages })
 *
 * An arrow, so `this` stays the page that knows the brand. It runs while the
 * Sidebar is capturing, so whatever it builds lands in the panel.
 *
 * Any entry may carry `icon: "dashboard"` — a Material Icons ligature name. A
 * Page takes it straight in its constructor, since extra properties pass
 * through as inert data. The app has to have loaded the font: `app.font("Material Icons")`.
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

	/* A titled run of links — "CORE", then five items. Duck-typed off `.pages`
	 * rather than a second `groups` property, so `pages` stays the one thing to
	 * remember and a group is just an entry that has some of its own. A flat
	 * sidebar, a grouped one, and a mix of both are the same call.
	 *
	 * `.h4` on an inner SPAN, not on the padded box — the same split as
	 * `.sidebar-label`, for the same reason and it was a real bug without it.
	 * `.h4` is `font-size: 0.875em`, and the box's `padding: 0.4em var(--gutter)`
	 * resolves `em` against the element that USES it: a custom property carries
	 * the token `2.6em`, not a resolved length. So the title indented 36.5px
	 * while every link indented 41.8px, and the one thing `--gutter` exists to
	 * guarantee was the one thing it did not. Size the text, pad the box, never
	 * the same element.
	 */
	group(group){
		return div.c("sidebar-group", () => {
			if (group.title) div.c("sidebar-group-title", () => span.c("h4", group.title));
			group.pages.forEach(page => this.link(page));
		});
	}

	/* One shape serves both cases: a loaded `Page` and a plain `{title, url}`
	 * both answer `.title` and `.url`, which is all a link needs — so a site can
	 * list sections it does not want to eager-load. `.active`/`.in-path` come
	 * from Router.mark_links().
	 *
	 * Built here rather than borrowed from `page.link()`, which used to supply
	 * the anchor when there was a Page. That handed every sidebar row a second
	 * component's class — `.page-link` brings its own weight and its own active
	 * colour, at the same specificity as this one's, so which won came down to
	 * stylesheet order. A row in a sidebar is a sidebar's row.
	 *
	 * The label is a span and not a text node because it carries the type size
	 * (the comp's 18px) while the row's box stays measured against the base —
	 * see `.sidebar-label`. Written in order, so nothing has to be prepended
	 * into place afterwards.
	 */
	link(page){
		return a.c("sidebar-link").href(page.url).append(() => {
			if (page.icon) icon(page.icon);
			span.c("sidebar-label", page.label ?? page.title);
		});
	}

	/* The document already declares the site's icon — reuse it rather than
	 * hardcoding an asset path into a framework class. */
	static favicon(){
		return document.querySelector('link[rel~="icon"]')?.href;
	}
}

export default Sidebar;
