import { Page } from "/app.js";
import ReadmesView from "./ReadmesView.js";

export default new Page({
	meta: import.meta,
	title: "Readmes",
	description: "What an agent working in each folder is given to read: the readme chain, in tokens.",
	icon: "menu_book",
	classes: "full",
	content(){ new ReadmesView(); },
});
