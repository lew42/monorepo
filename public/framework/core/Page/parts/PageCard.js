import Item from "../../Item/Item.js";
import View, { div, h4 } from "../../View/View.js";

/* {"type":"part-card","title":"A card","text":"What it says."} — a boxed title with a line under it. */
export default class PageCard extends Item {
	static example = { title: "A boxed title", text: "A line under it" };   // what the item tool's help shows for this type
}
PageCard.View = class PageCardView extends View {
	render(){
		return div.c("part-card card flow", () => {
			h4(this.item.get("title") ?? "");
			if (this.item.get("text")) div.c("part-card-text", this.item.get("text"));
		});
	}
};
Item.register(PageCard, "part-card");
