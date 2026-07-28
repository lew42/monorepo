import { Page, p, div, button, a } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Button",
	description: "The .btn component and its variants.",
	content(){
		p("`framework.css` ships three button looks. `.btn` also works on an `<a>`, so links can look like buttons without being buttons.");

		div.c("flex gap wrap mb", () => {
			button.c("btn", "Default");
			button.c("btn bg", "bg");
			button.c("btn prim", "prim");
		});

		p("The same classes on an anchor (`a.c(\"btn prim\")`):");

		div.c("flex gap wrap", () => {
			a.c("btn", "Link").href("#");
			a.c("btn prim", "Link prim").href("#");
		});
	}
});
