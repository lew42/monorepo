import { Page, md, pre, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Core",
	description: "The core classes: View, Page, Router, App — plus one component.",
	icon: "dashboard",

	children: "View Page Router App Sidebar",

	// Labels and icons come from the five class pages themselves.
	initialize(){ this.load_all_children(); },

	content(){

		// Sub-page nav first: what's under here, before what's on here.
		this.previews();

		code.js(`import { View, Page, Router, App } from "/app.js";`);

		md("**Four classes, in the order you meet them. Only the first is unavoidable.**\n\n`new View()` → `div`. `new Page()` → `div.page`. `new App()` → `div.app`. That is the whole mental model: each one is an element you can point at in the inspector, and everything else is a method on it.");

		md("`Sidebar` is the odd one out — a `View` subclass, not a tier. It's here because it's shipped and documented, not because you need it.");

		md("Start with [View](/framework/core/View/) — it is the one class you use on every line.");
	}
});
