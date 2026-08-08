import { Page, p, pre, a, button, hr } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Buttons",
	description: ".btn, .btn.bg, and .btn.prim.",

	content(){
		p("These are the button features built into this framework:");
		p("`button`: use it for a clickable action, it already inherits the page's font.");
		p("`.btn`: use it if you want anything else (like an `a`) to look like a button.");
		p("`.btn.bg` / `.btn.prim`: use them if you want a filled, colored button.").ac("mb");

		hr();

		p("`button`: inherits the page's font instead of the browser default.").ac("mb");

		p("`.btn`, `button`: padding and a pointer cursor, otherwise unstyled. Add `.c(\"cls\")` (or `.ac(\"cls\")`) to any element to apply it, `<button>` already looks like this without any class.").ac("mb");

		button("Click me").ac("btn mb");
		pre(`button("Click me").ac("btn");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

		hr();

		p("`.btn.bg` / `button.bg`: solid `--bg` background, white text.").ac("mb");

		button("Click me").ac("btn bg mb");
		pre(`button("Click me").ac("btn bg");
// or on a link:
a("Click me").ac("btn bg").href("/");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

		hr();

		p("`.btn.prim` / `button.prim`: solid `--prim` background, white text.").ac("mb");

		button("Click me").ac("btn prim mb");
		pre(`button("Click me").ac("btn prim");`).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
	}
});