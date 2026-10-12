import { div } from "../../View/View.js";
import PagePart from "./PagePart.js";

/* {"type":"part-text","text":"Some **markdown**."} — a paragraph of markdown. */
export default class PageText extends PagePart {
	draw(){
		// Capture the box now, fill it when the markdown module arrives (no DOM after an await).
		const $box = div.c("part-text");
		import("../../../ext/markdown/md.js").then(({ default: md }) => $box.append(md(this.get("text") ?? "")));
		return $box;
	}
}
PagePart.define(PageText, "text");
