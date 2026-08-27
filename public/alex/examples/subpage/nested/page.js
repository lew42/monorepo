import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Nested",
	description: "Three levels down, and nothing about it is different.",

	content(){
		md("Nesting composes at any depth. This page declares no children and overrides nothing — `meta` gives it its url, and the Router does the rest.");

		md("Back up to [Subpage](/alex/examples/subpage/), or [Examples](/alex/examples/).");
	},
});
