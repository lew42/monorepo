import Item from "../../Item/Item.js";
import View, { div } from "../../View/View.js";

/* {"type":"part-text","text":"Some **markdown**."} — a paragraph of markdown. */
export default class PageText extends Item {}
PageText.View = class PageTextView extends View {
	render(){
		// Capture the box now, fill it when the markdown module arrives (no DOM after an await).
		const $box = div.c("part-text");
		import("../../../ext/markdown/md.js").then(({ default: md }) => $box.append(md(this.item.get("text") ?? "")));
		return $box;
	}
};
Item.register(PageText, "part-text");
