import { div, h4 } from "../../View/View.js";
import PagePart from "./PagePart.js";

/* {"type":"part-card","title":"A card","text":"What it says."} — a boxed title with a line under it. */
export default class PageCard extends PagePart {
	draw(){
		return div.c("part-card card flow", () => {
			h4(this.get("title") ?? "");
			if (this.get("text")) div.c("part-card-text", this.get("text"));
		});
	}
}
PagePart.define(PageCard, "card");
