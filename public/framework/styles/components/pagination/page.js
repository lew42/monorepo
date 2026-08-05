import { Page, md, demo, div, button, icon } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Pagination",
	description: "Links that look like buttons, and the two declarations `.btn` forgets.",
	icon: "last_page",

	content(){

		demo(component, "`.btn` gives an `<a>` a button's padding and cursor — *\"a link can look like a button without being one\"* — and `.prim` marks the current page. The chip fill is `surface` from `parts.js`.");

		md("## The two declarations `.btn` forgets");

		md("`.btn, button { padding: 0.25em 1em; cursor: pointer }` is the whole rule, so a link keeps its underline and its UA colour. Every link-as-button in this section therefore writes:\n\n```js\n{ textDecoration: \"none\", color: \"inherit\" }\n```\n\nThat pair is `btn` in `parts.js`, and it is a **bug report about `framework.css`** rather than a component's business — a class whose entire purpose is \"make this look like a button\" should finish the job. On the findings list.");

		md("## Or don't use links");

		demo(() => {
			div.c("flex wrap v-center", () => {
				button(() => { icon("chevron_left"); });
				["1", "2", "3"].forEach(n => button.c(n === "2" && "prim", n));
				button(() => { icon("chevron_right"); });
			}).style("gap", "0.3em");
		}, "Real `button`s need none of it — no underline, no link colour, and the theme already sizes them. Reach for `.btn` only when the thing genuinely has a url.");

		md("Next: [Card](/framework/styles/components/card/) — the first component that needs a surface.");
	}
});
