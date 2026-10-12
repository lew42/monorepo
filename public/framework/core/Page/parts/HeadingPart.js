import { h2 } from "../../View/View.js";
import Part from "./Part.js";

/* {"type":"part-heading","text":"Title"} — one large line. */
export default class HeadingPart extends Part {
	draw(){ return h2(this.get("text") ?? ""); }
}
Part.define(HeadingPart, "heading");
