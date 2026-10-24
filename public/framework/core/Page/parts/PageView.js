import Item from "../../Item/Item.js";
import View from "../../View/View.js";

/* {"type":"part-view","class":"./MyChart.js","data":{"value":92}} — a module in the page's folder, drawn here.
   One implementation with the page-level `place` line: Jsonl.draw_module (Jsonl.js). */
export default class PageView extends Item {}
PageView.View = class PageViewView extends View {
	render(){
		const page = this.item.root();
		const url = new URL(this.item.get("class"), location.origin + page.log_folder()).href;
		return page.draw_module(url, { item: this.item, ...this.item.get("data") });
	}
};
Item.register(PageView, "part-view");
