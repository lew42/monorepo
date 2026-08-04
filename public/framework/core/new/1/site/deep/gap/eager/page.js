import { Page, p, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "The eager child",

	content(){
		p("I was imported at the top of my parent's module, so I existed — with a `url`, a `title`, a `parent`, and a working `link()` — from the moment my parent did. What I did not have until you walked here is `.app`.");
		a.c("page-link", "← back").href("/deep/gap/");
	}
});
