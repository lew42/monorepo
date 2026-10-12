import { h2 } from "../../View/View.js";
import PagePart from "./PagePart.js";

/* {"type":"part-heading","text":"Title"} — one large line. */
export default class PageHeading extends PagePart {
	draw(){ return h2(this.get("text") ?? ""); }
}
PagePart.define(PageHeading, "heading");
