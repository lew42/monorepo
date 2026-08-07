import { View, div, a, span, img, icon, button } from "../View/View.js";

/* css: .mode-btn — footer restyles the button this module emits.
 * core → core now: mode moved beside App (like Font.js) after the old
 * styles/layers/theme/ import took the site down mid-move. readme.md §9. */
import mode from "../App/mode.js";

View.stylesheet(import.meta, "Sidebar.css");

/**
 * Sidebar — [ 🖼 Brand ] over a list of links, over a footer that stays put.
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
 *   app        the App — lets the footer render the colour-scheme toggle
 *
 * An entry may say `label` instead of `title`, and it wins — `Page.nav_for(name)`
 * returns exactly that shape, so a parent hands its nav entries straight in and the
 * sidebar, the tab bar and the preview cards cannot name a child three ways.
 *
 * The constructor is assign-based, so passing a method shadows it — which is how a
 * site with its own mark replaces the header instead of configuring it, and the
 * same is true of `footer` (pass `footer: null` for none):
 *
 *     new Sidebar({ header: () => this.app.brand("Framework", this.url), pages })
 *
 * An arrow, so `this` stays the page that knows the brand. It runs while the Sidebar
 * is capturing, so whatever it builds lands in the panel.
 *
 * Below 52em (Sidebar.css) the panel is a top bar — the header plus a hamburger —
 * and `open()` drops the menu below it. On a wide screen the same button is
 * `display: none` and the rail is exactly what it always was.
 *
 * Design record: core/Sidebar/readme.md.
 */
export class Sidebar extends View {

	render(){
		this.bar();
		this.menu();

		// keyboard escape hatch for the narrow menu — bubbles up from any focused link
		this.on("keydown", e => {
			if (e.key === "Escape" && this.hc("open")){
				this.open(false);
				this.$toggle.el.focus();
			}
		});
	}

	// [ header | ☰ ] — the whole sidebar on a narrow screen, the top strip of it wide
	bar(){
		return this.$bar = div.c("sidebar-bar", () => {
			this.header();
			this.toggle();
		});
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

	/* The hamburger. Always in the DOM, shown only by the narrow media query — CSS
	 * decides when a screen is narrow, so no resize listener. A real <button>: focus,
	 * Enter/Space and the a11y tree come free, and `aria-expanded` is the state. */
	toggle(){
		return this.$toggle = button.c("sidebar-toggle", () => {
			span.c("sidebar-toggle-bar");
			span.c("sidebar-toggle-bar");
			span.c("sidebar-toggle-bar");
		})
			.attr("aria-label", "Menu")
			.attr("aria-expanded", "false")
			.click(() => this.open(!this.hc("open")));
	}

	open(on){
		this[on ? "ac" : "rc"]("open");
		this.$toggle.attr("aria-expanded", String(on));
		return this;
	}

	/* Nav over footer, one box — so the narrow menu is a single thing to show and
	 * hide, and the footer rides along. A click on any link closes it: navigation
	 * happened, the menu's job is done. Harmless on a wide screen, where `.open`
	 * does nothing. */
	menu(){
		return this.$menu = div.c("sidebar-menu", () => {
			this.nav();
			this.footer?.();
		}).on("click", e => e.target.closest("a") && this.open(false));
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

	/* The pinned strip under the nav — the nav scrolls, this doesn't. Zero-config
	 * default: the colour-scheme toggle and a placeholder avatar. The toggle is
	 * mode(app) and mode needs the app (it styles app.$app), so it appears when the
	 * sidebar was given one — `new Sidebar({ app: this.app, … })` — and is quietly
	 * absent when it wasn't. Replace like header, or `footer: null` for none. */
	footer(){
		return div.c("sidebar-footer", () => {
			if (this.app) this.$mode = mode(this.app);
			div.c("sidebar-avatar").attr("title", "Account");
		});
	}

	// The document already declares the site's icon — reuse it rather than hardcoding
	// an asset path into a framework class.
	static favicon(){
		return document.querySelector('link[rel~="icon"]')?.href;
	}
}

export default Sidebar;
