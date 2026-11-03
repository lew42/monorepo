import { Page, View, md, div, h3 } from "/app.js";
import Objects from "./Objects.js";
import Tree from "../Tree/Tree.js";

View.stylesheet(import.meta, "Objects.css");

/**
 * ux/Objects/page.js
 * Demonstrates the live object inspector on both a live Page and a live Tree.
 */
export default new Page({
	meta: import.meta,
	title: "Objects",
	description: "The live object inspector widget. Walks class instances, Maps, Arrays, and links classes.",
	icon: "category",

	content(){
		md("`class Objects extends Tree` inspects live objects: properties with class instances link to their module, Maps and arrays become expandable counts, and module `objects()` exports customize the view.");

		h3.c("muted").text("Inspecting a live Page instance");
		div.c("card", () => {
			Objects.of(this);
		});

		h3.c("muted").text("Inspecting a live Tree instance");
		div.c("card", () => {
			const sampleTree = new Tree({
				nodes: [
					{ text: "Item 1", children: [{ text: "Child 1" }] },
					{ text: "Item 2" }
				]
			});
			Objects.of(sampleTree);
		});
	}
});
