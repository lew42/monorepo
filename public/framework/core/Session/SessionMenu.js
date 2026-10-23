// SessionMenu.js — the button at the right end of a session's name line, opening the session's own menu (Session.MENU).
// A page entry is a link (routed: <session url>/<name>/), an action entry calls that method on the page. Doc: doc/menu.md.
import View, { a, button, icon, span } from "../View/View.js";
import Popover from "../../ux/Popover/Popover.js";
View.stylesheet(import.meta, "SessionMenu.css");   // the button, the rows, and the settings form

export default class SessionMenu {

	constructor(...args){ Object.assign(this, ...args); }   // { session, url, page }

	entries(){ return this.session.menu(this.url); }

	draw(){
		const $btn = button.c("session-menu-button").attr("type", "button").attr("aria-haspopup", "menu").attr("title", "Session menu")
			.append(() => icon("more_vert"));
		const menu = this, pop = new Popover({
			anchor: $btn.el, trigger: "click", role: "menu", place: "bottom",
			content(){ for (const e of menu.entries()) menu.entry(e, pop); },
		});
		pop.draw();
		return $btn;
	}

	// One row: a link for a page (the router opens it, so back and reload work), a button for an action.
	entry(e, pop){
		const face = () => { if (e.icon) icon(e.icon); span(e.title); };
		if (e.page) return a.c("ux-popover-item session-menu-item").attr("role", "menuitem").href(e.url).append(face).click(() => pop.close());
		return button.c("ux-popover-item session-menu-item").attr("type", "button").attr("role", "menuitem").append(face)
			.click(() => { pop.close(); this.page?.[e.action]?.(e); });
	}
}
