import { Page, md, pre } from "/app.js";
import view from "./View/page.js";
import page from "./Page/page.js";
import pager from "./Pager/page.js";
import router from "./Router/page.js";
import app from "./App/page.js";

export default new Page({
	meta: import.meta,
	title: "Core",
	description: "The core classes: View, Page, Pager, Router, App.",
	col: "narrow",
	children: [view, page, pager, router, app],
	content(){

		pre(`import { View, Page, Pager, Router } from "/app.js";`);

		md("Five classes, in the order you meet them. Only the first is unavoidable.");

		this.previews();
	}
});
