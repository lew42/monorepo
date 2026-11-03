import { Page } from "/app.js";
import "/framework/ext/tabs/tabs.js";

// The same set as a side rail — ext/tabs turned on its side.

export default new Page({
	meta: import.meta,
	title: "Journal",
	width: "small",
	index: true,

	children: "wall prose",

	content(){ return this.tabs().ac("vertical"); },
});
