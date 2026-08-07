import { Page, p, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Inner",

	content(){
		p("Reached the normal way, I am inside my parent's `$pages`. Reached by a bare `activate()` before my parent rendered, I am a sibling of it in `app.$pages` — same object, same method, different parent element.");
		a.c("page-link", "← back to Orphan").href("/deep/orphan/");
	}
});
