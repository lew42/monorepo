import View, { summary, div, a, span, icon } from "../../core/View/View.js";

/* The `.ui-menu-*` stylesheet is the TEMPLATE's and stays in `ui/` — splitting is the
 * usual answer, not moving (ux/doc/system.md). This import is for that stylesheet: the
 * class wears ui/menu's classes, so the two tiers cannot drift apart. A ux imports a ui
 * template; ui NEVER imports a ux. */
import "../../ui/menu/menu.js";

/**
 * class Menu extends View — the `<details class="ui-menu">` template, with the one line
 * ui/menu deliberately left at the call site (close-on-pick) plus the two ui/menu never
 * had at all: click-outside, and a real seam.
 *
 *   const m = new Menu({ items: [{ text, href? }], onPick(item){ … } });
 *   m.open() / m.close()
 *
 * An item with `href` navigates like any link; every item closes the panel first,
 * navigating or not — ui/menu/page.js, "There is no ui.menu()".
 */
export default class Menu extends View {

	render(){
		this.trigger();
		this.panel();

		// `<details>` fires `toggle` for EITHER direction — a summary click or a
		// script writing `.open` — so one listener drives both halves of the state.
		this.outside = e => { if (!this.el.contains(e.target)) this.close(); };
		this.on("toggle", () => this.el.open ? this.opened() : this.closed());
	}

	trigger(){
		return summary.c("ui-menu-trigger btn flex v-center", () => {
			span(this.label);
			icon("arrow_drop_down");
		});
	}

	panel(){
		return div.c("ui-menu-list flex v", () => this.items.forEach(item => this.item(item)));
	}

	item(item){
		return a.c("ui-menu-item", item.text).href(item.href ?? "#")
			.click(e => {
				// ⚠ A placeholder ("#" or no href) must not jump the page; a REAL href
				// still navigates — closing first is harmless, the page is leaving anyway.
				if (!item.href || item.href === "#") e.preventDefault();
				this.pick(item);
			});
	}

	open(){ this.el.open = true; return this; }
	close(){ this.el.open = false; return this; }

	/* ⚠ Added on open, removed on close — a listener left on `document` after the
	 * panel is gone would fire on every future click in the page for nothing. */
	opened(){ document.addEventListener("click", this.outside); }
	closed(){ document.removeEventListener("click", this.outside); }

	/* close-on-pick — the one line ui/menu deliberately left at the call site,
	 * now a method: a subclass overrides `pick()` instead of rebuilding the panel. */
	pick(item){
		this.close();
		this.onPick?.(item);
		return item;
	}
}

/* ⚠ Prototype, not class fields — View renders inside its constructor, and a class
 * field on a subclass initializes AFTER that, so `render()` would never see it. */
Menu.prototype.tag = "details";
Menu.prototype.classes = "ui-menu";
Menu.prototype.label = "Actions";
Menu.prototype.items = [];

export { Menu };
