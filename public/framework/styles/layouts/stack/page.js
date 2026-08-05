import { Page, md, demo, a } from "/app.js";
import layout from "./layout.js";

export default new Page({
	meta: import.meta,
	title: "Stack",
	description: "Vertical rhythm, and a form that needed none of its own CSS.",
	children: "full",

	content(){
		demo(layout, "`flow` is the rhythm class Page.css already applies to page copy: `> * + * { margin-block-start: var(--flow) }`. A form stack is that, plus full-width inputs, which framework.css gives every control out of the box.");

		a.c("page-link", "Full size ↗").href(this.url + "full/");

		md("`textarea.auto` is `field-sizing: content`, so the box follows the text — type into it. The button row is `flex gap`; `prim` is the one accent.");

		md("Next: [Masthead](/framework/styles/layouts/masthead/) — where it all comes together.");
	}
});
