import Item from "/framework/core/Item/Item.js";
import View, { div, button } from "/framework/core/View/View.js";
import PageUI from "../PageUI.js";

/* page.ui.tabs — a tab bar: `names` (the strip, in order) and `selected` (one of them). A tap, or voice
 * sending {"ui":{"tabs":{"selected":"Idea 2"}}}, sets `selected`; the page's log saves that one line, so a
 * reload shows the same tab. */
export default class Tabs extends Item {
	static example = { names: ["Today", "Idea 1", "Idea 2", "Both"], selected: "Both" };

	select(name){ this.set({ selected: name }); }
}

Tabs.View = class TabsView extends View {
	render(){
		const item = this.item;
		return div.c("page-ui-tabs", () => {
			(item.get("names") ?? []).forEach(name => {
				const $tab = button.c("page-ui-tab", name).on("click", () => item.select(name));
				$tab.bind(item, "selected", function(selected){ this.tc("is-selected", selected === name); });
			});
		});
	}
};
PageUI.add("tabs", Tabs);
