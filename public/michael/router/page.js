import { Page, p } from "/app.js";
import mvp from "./mvp/page.js";
import interception from "./interception/page.js";

export default new Page({
	meta: import.meta,
	title: "Router",
	description: "Opt-in no-reload navigation.",
	children: [mvp, interception],
	content(){
		p("The `Router` turns in-page links into no-reload (pushState) navigation and handles back/forward. It's opt-in and a singleton (`app.router`). Every link you've clicked inside this site went through it.");
		p("It owns *when & what* — a URL changed, here's the page. The App's Pager owns *where & how*. The Page owns the content. Three small things instead of one big one.");
		this.previews();
	}
});
