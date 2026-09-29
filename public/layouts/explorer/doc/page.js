import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Docs",
	icon: "menu_book",
	description: "How the explorer is built, and how to add a layout to it.",

	children: [
		["Adding a layout", {
			description: "The one object explorer.json needs to add a layout, in full.",
			icon: "article",
			content(){ return md.file(import.meta, "adding.md", { h1: false }); },
		}],
	],

	content(){
		md("How [`/layouts/explorer/`](/layouts/explorer/) is built, in one note: what goes in `explorer.json` to add a layout.");
		md("**Why the selected item's properties sit in a strip under the centre, not the ☰ drawer:** `ext/drawer`'s tabs (AI, Sessions, Dictation, Settings, Admin) are a fixed, registered list outside this module's fence.");
		this.previews();
	},
});
