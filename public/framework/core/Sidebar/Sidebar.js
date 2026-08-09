import { View, div, a, span, img, icon, button } from "../View/View.js";

/* css: .mode-btn — the footer restyles the button this module emits. */
import mode from "../App/mode.js";

View.stylesheet(import.meta, "Sidebar.css");

/**
 * Sidebar — [ 🖼 Brand ] over a list of links, over a footer that stays put.
 *
 *   new Sidebar({ brand: "Lew42", pages: [{ title: "Framework", url: "/framework/" }] });
 *
 *   brand / brand_url   text beside the logo, and where it points  (default "/")
 *   logo / logo_url     image url (default: the document's icon), and where it points
 *   pages               Pages, or {title|label, url, icon}; an entry with its own
 *                       `pages` is a titled GROUP
 *   app                 lets the footer render the colour-scheme toggle
 *   header / footer     passed as a function, REPLACES the method (`footer: null` for none)
 *
 * Design record: core/Sidebar/readme.md.
 */
export class Sidebar extends View {

	render(){
		this.bar();
		this.menu();

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

	// ⚠ Named header(), not brand(), so it cannot collide with the `brand` property.
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

	// Always in the DOM; the media query decides when it shows, so no resize listener.
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

	// Nav over footer, one box — so the narrow menu is a single thing to show and hide.
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

	// ⚠ `.h4` on an inner SPAN, never on the padded box: `em` padding resolves
	// against the element that uses it, so sizing and padding one element misaligns
	// the column. Size the text, pad the box.
	group(group){
		return div.c("sidebar-group", () => {
			if (group.title) div.c("sidebar-group-title", () => span.c("h4", group.title));
			group.pages.forEach(page => this.link(page));
		});
	}

	// ⚠ Built here, never borrowed from `page.link()` — that handed every row a
	// second component's class, and which won came down to stylesheet order.
	link(page){
		return a.c("sidebar-link").href(page.url).append(() => {
			if (page.icon) icon(page.icon);
			span.c("sidebar-label", page.label ?? page.title);
		});
	}

	// The pinned strip under the nav. `mode()` styles `app.$app`, so the toggle is
	// quietly absent when the sidebar wasn't given an app.
	footer(){
		return div.c("sidebar-footer", () => {
			if (this.app) this.$mode = mode(this.app);
			div.c("sidebar-avatar").attr("title", "Account");
		});
	}

	// The document already declares the site's icon; don't hardcode an asset path.
	static favicon(){
		return document.querySelector('link[rel~="icon"]')?.href;
	}
}

export default Sidebar;
