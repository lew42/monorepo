import { div, h4 } from "../../View/View.js";
import Part from "./Part.js";

/* {"type":"part-card","title":"A card","text":"What it says."} — a boxed title with a line under it. */
export default class CardPart extends Part {
	draw(){
		return div.c("part-card card flow", () => {
			h4(this.get("title") ?? "");
			if (this.get("text")) div.c("part-card-text", this.get("text"));
		});
	}
}
Part.define(CardPart, "card");
