import LivePage from "/live/LivePage.js";
import View, { div, span } from "/framework/core/View/View.js";
import PageUI from "./PageUI.js";
import Tabs from "./ui/Tabs.js";   // importing it is what registers PageUI.add("tabs", Tabs) — idea 1
import "./ui/MethodMap.js";   // registers PageUI.add("methods", MethodMap) — idea 1

View.stylesheet(import.meta, "DesignPage.css");

/* /live/design/ — a working prototype of `page.ui` (core/Page/doc/namespaces.md): idea 1 (UI lives in
 * modules, imported on need) plus idea 2 (`page.ui` is the one door that reaches them and saves their
 * state through the page's log). Only `./ui/Tabs.js` is imported here, so `PageUI.types` holds only
 * "tabs" — exactly what idea 1 promises: nothing loads that no page asked for. */
export default class DesignPage extends LivePage {
	constructor(...args){
		super(...args);
		this.ui = new PageUI({ page: this });   // own property: Item.get walks it (PageUI.js)
		this.ui.parent = this;   // bubbles a widget's deltas up to this page's own log
	}

	render(){
		const view = super.render();
		if (!this.$ui){
			this.$ui = div.c("page-ui-strip");
			view.el.querySelector(".live-head")?.insertAdjacentElement("afterend", this.$ui.el);
			this.ui.on("made", () => this.draw_ui());
			this.draw_ui();
		}
		return view;
	}

	// The strip under the head: which widgets THIS page imported (idea 1), then the tab bar itself — the one made
	// widget that is navigation, not card content. Other widgets (methods) draw inside their own card (draw_card).
	draw_ui(){
		this.$ui.empty(() => {
			span.c("page-ui-types", `ui: ${[...PageUI.types.keys()].join(", ")}`);
			const tabs = this.ui.made().find(w => w instanceof Tabs);
			if (tabs){
				new tabs.constructor.View({ item: tabs });
				if (!tabs._filter_wired){
					tabs._filter_wired = true;
					tabs.on("change", key => { if (key === "selected") this.filter_cards(); });
				}
			}
		});
		this.filter_cards();
	}

	// Only the cards whose `tab` equals the tabs widget's `selected` show; no tabs widget yet (or a card with
	// no `tab`) always shows. `draw_card` below stamps each card's `data-tab` from its own `tab` field.
	filter_cards(){
		const selected = this.ui.made().find(w => w instanceof Tabs)?.get("selected");
		this.view?.el.querySelectorAll(".live-main > [data-tab]").forEach(el => {
			el.classList.toggle("is-tab-hidden", !!selected && el.dataset.tab !== selected);
		});
	}

	// A card naming `ui` (idea 2: a widget reached through page.ui, by name) draws that widget below its own
	// title/subtitle instead of the card's `text`; everything else draws as LivePage always has.
	draw_card(item){
		const widget_name = item.get?.("ui");
		const view = widget_name ? this.draw_ui_card(item, widget_name) : super.draw_card(item);
		const tab = item.get?.("tab");
		if (tab) view.attr("data-tab", tab);
		return view;
	}

	draw_ui_card(item, widget_name){
		const widget = this.ui.get(widget_name);
		return div.c("live-block page-ui-card", () => {
			this.draw_words(item);
			if (widget) new widget.constructor.View({ item: widget });
		}).attr("id", item.id).attr("data-kind", item.constructor.name);
	}
}
