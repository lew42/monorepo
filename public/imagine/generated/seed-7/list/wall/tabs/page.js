import { Page } from "/app.js";
import "/framework/ext/tabs/tabs.js";

// A strip of tabs over a panel: a child swaps IN PLACE and the row never grows.

export default new Page({
	meta: import.meta,
	title: "Backlog",
	index: true,

	children: "prose prose-2",

	content(){ return this.tabs(); },
});
