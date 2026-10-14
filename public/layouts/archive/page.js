import { Page, md } from "/app.js";

// Retired layout pages, moved here by retire.mjs (git mv, manifest.json). Why: /framework/core/Page/navigation/model/
export default new Page({
	meta: import.meta,
	title: "Archive",
	description: "Layout pages retired by the navigation model: kept, reachable, no longer part of the set.",
	icon: "inventory_2",
	children: "labs-trees",

	content(){
		md("These layouts are variations of the four kinds the [navigation model](/framework/core/Page/navigation/model/) keeps. They were moved here, not deleted; `retire.mjs --undo` puts them back.");
		this.previews();
	},
});
