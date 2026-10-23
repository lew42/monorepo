import View, { div, button } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "mobile.css");

/* A tab row over a horizontal strip of panes: swipe the strip (CSS scroll-snap) or tap a tab; the row follows the scroll.
   `tabs` = [[key, label], ...]; the pane for a key is `this.panes[key]`, an empty View the caller fills. No gesture library. */
export default class SwipeTabs extends View {

	initialize(){
		this.ac("mob-tabs");
		this.panes = {}; this.buttons = {};
		div.c("mob-tabs-row", () => this.tabs.forEach(([key, label]) => this.buttons[key] = button.c("mob-tab", label).click(() => this.go(key))));
		this.$strip = div.c("mob-tabs-strip", () => this.tabs.forEach(([key]) => this.panes[key] = div.c("mob-pane")));
		this.$strip.on("scroll", () => this.sync());
		this.sync();
	}

	index(){ const el = this.$strip.el; return el.clientWidth ? Math.round(el.scrollLeft / el.clientWidth) : 0; }

	go(key){ const el = this.$strip.el; el.scrollTo({ left: this.tabs.findIndex(([k]) => k === key) * el.clientWidth, behavior: "smooth" }); }

	/** Light the tab whose pane is showing. */
	sync(){
		const on = this.tabs[this.index()]?.[0];
		for (const [key] of this.tabs) this.buttons[key].el.classList.toggle("is-on", key === on);
	}
}
