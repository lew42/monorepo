import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import full from "../full.js";
import fit from "../fit.js";

export default new Page({
	meta: import.meta,
	title: "Stack",
	description: "Vertical rhythm, and a form that needed none of its own CSS.",
	icon: "view_agenda",

	route(name){ return name === "full" && full(this, layout); },

	content(){
		demo(layout, { full: this }, "`flow` is the rhythm class Page.css already applies to page copy: `> * + * { margin-block-start: var(--flow) }`. A form stack is that, plus full-width inputs, which framework.css gives every control out of the box.");


		md("`textarea.auto` is `field-sizing: content`, so the box follows the text — type into it. The button row is `flex gap`; `prim` is the one accent.");

		fit("A form · A checkout flow · An onboarding step · A settings panel",
			"measured",
			"A form is prose with inputs in it. Fields inherit the column, and the rhythm between them is the page's own flow — see [Page flow](/framework/core/Page/flow/).");

		md("Next: [Masthead](/framework/styles/layouts/masthead/) — where it all comes together.");
	}
});
