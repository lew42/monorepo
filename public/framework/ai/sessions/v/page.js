import { Page } from "/app.js";
import { div, a, p, small } from "/framework/core/View/View.js";

/* The variants of the real sessions pages, one folder each. A variant is a page class that extends the class rendering the real page. */
export default new Page({
	meta: import.meta, title: "Session variants", icon: "science", width: "fill",
	description: "Variant takes on the sessions pages. Each is a folder here.",
	content(){
		p("Each variant extends the class that draws the real page, and reads the same files.");
		div.c("flow", () => { a("mobile — the sessions pages for a 400 px phone: day list, nested sessions, a session, a task").href("/framework/ai/sessions/v/mobile/"); });
		div.c("flow", () => { a("classic — the list with every control in rows above it, as it was before the slim header").href("/framework/ai/sessions/v/classic/"); });
	},
});
