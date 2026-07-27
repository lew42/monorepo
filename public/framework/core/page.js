import { Page, p } from "/app.js";
import view from "./View/page.js";
import app from "./App/page.js";
import page from "./Page/page.js";
import pager from "./Pager/page.js";
import router from "./Router/page.js";

export default new Page({
	meta: import.meta,
	title: "Core",
	description: "The core classes: View, App, Page, Pager, Router.",
	children: [view, app, page, pager, router],
	content(){
		p("The core classes, each documented next to its code. `View` and `App` are the substrate — the two ideas you can't remove. `Page`, `Pager`, and `Router` are optional and layer on top.");
		this.previews();
	}
});
