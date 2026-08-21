import { Page, demo, md } from "/app.js";

const hello = () => new Page({
	title: "Hello",

	content(){
		md("A page is a `title` and some `content()`. The url **derives** — `Hello` → `/hello/`, the strip above. Nothing is on disk; `/hello/` exists because this object does.");
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Basics",
	tree: hello,
}));
