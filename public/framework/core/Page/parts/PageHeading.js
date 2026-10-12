import Item from "../../Item/Item.js";
import View, { h2 } from "../../View/View.js";

/* {"type":"part-heading","text":"Title"} — one large line. An ordinary Item with a View. */
export default class PageHeading extends Item {}
PageHeading.View = class PageHeadingView extends View {
	render(){ return h2(this.item.get("text") ?? ""); }
};
Item.register(PageHeading, "part-heading");
