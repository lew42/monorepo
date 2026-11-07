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
	// widget that is navigation, not card content. Other widgets (methods) draw inside their own card (Card, below).
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
	// no `tab`) always shows. Card and Block below stamp each card's `data-tab` from its own `tab` field.
	selected_tab(){ return this.ui.made().find(w => w instanceof Tabs)?.get("selected"); }

	filter_cards(){
		const selected = this.selected_tab();
		this.view?.el.querySelectorAll(".live-main > [data-tab]").forEach(el => {
			el.classList.toggle("is-tab-hidden", !!selected && el.dataset.tab !== selected);
		});
	}

	// Stamps a card's `tab` and hides it at once when another tab is selected (a card added later redraws alone,
	// so it can't wait for filter_cards). LivePage draws cards through its static Card and Block views (f56543fda).
	static tag(view){
		const tab = view.item.get?.("tab");
		if (!tab) return;
		const selected = view.page.selected_tab();
		view.attr("data-tab", tab).tc("is-tab-hidden", !!selected && tab !== selected);
	}

	// A card naming `ui` (idea 2: a widget reached through page.ui, by name) draws that widget below its own
	// title/subtitle instead of the card's `text`; everything else draws as LivePage always has.
	static Card = class DesignCardView extends LivePage.Card {
		render(){
			const { page, item } = this, P = page.constructor, name = item.get?.("ui");
			if (!name) super.render();
			else {
				const widget = page.ui.get(name);
				this.ac("live-block page-ui-card").attr("id", item.id).attr("data-kind", item.constructor.name);
				new P.Heading({ tag: "h4", item, classes: "live-card-title" });
				new P.Md({ item, key: "text", classes: "live-card-text" });
				if (widget) new widget.constructor.View({ item: widget });
			}
			P.tag(this);
		}
	};

	// A design card's text IS its content (a note, a code block), so with no preview and no description the
	// card shows its text, as before live-r11 (where a LivePage card shows only its preview). Alternative: a
	// preview line per card, which would copy each text.
	static Preview = class DesignPreviewView extends LivePage.Preview {
		render(){
			super.render();
			const { page, item } = this, P = page.constructor;
			if (!item?.preview?.items?.length && !item?.get?.("description")) new P.Md({ item, key: "text", classes: "live-card-text" });
		}
	};

	static Block = class DesignBlockView extends LivePage.Block {
		render(){ super.render(); this.page.constructor.tag(this); }
	};
}
