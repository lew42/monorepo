import { Page, md, demo, div, p, a, h2, ul, li, blockquote, pre, strong, em, table, thead, tbody, tr, th, td } from "/app.js";

/* No stylesheet, here or in any child — see base/page.js. An element reference
 * that shipped CSS would be documenting itself instead of the framework. */

export default new Page({
	meta: import.meta,
	title: "Elements",
	description: "Every element the framework styles, rendered beside the rule that styles it.",
	icon: "text_fields",
	children: "text lists code table forms media misc",

	nav: {
		text:  { label: "Text",   icon: "text_fields" },
		lists: { label: "Lists",  icon: "format_list_bulleted" },
		code:  { label: "Code",   icon: "code" },
		table: { label: "Table",  icon: "grid_on" },
		forms: { label: "Forms",  icon: "check_box" },
		media: { label: "Media",  icon: "image" },
		misc:  { label: "Misc",   icon: "more_horiz" },
	},

	content(){

		// Sub-page nav first: what's under here, before what's on here.
		this.previews();

		demo(() => {
			h2("A section");
			p("Plain HTML with ", strong("no classes"), ", ", em("no wrappers"), ", and ", a("a link").href("/framework/"), ".");
			ul(() => { li("one"); li("two"); });
			table(() => {
				thead(() => tr(() => { th("element"); th("styled by"); }));
				tbody(() => tr(() => { td("th"); td("framework.css"); }));
			});
			blockquote("A quote.");
			pre("a_code_block()");
		}, "**Zero classes, and it already looks finished.** That's the claim `@layer theme` makes — it *is* the base theme, not a set of styles you have to fight — and these seven pages are it, element by element.");

		md("## What's actually styled");

		md("Open [`framework.css`](/framework/styles/) and the whole element vocabulary is about **thirty declarations**. There is no reset library and no normalize; `@layer base` fixes ten browser defaults and `@layer theme` gives generic HTML a look. Everything else you see on this site is a class a component emits.\n\nSo each page below answers two questions per element, and the second one matters as much as the first:\n\n1. **What rule styles it** — quoted from `framework.css`, with the real values.\n2. **Whether there is one at all.** Most elements have no rule, and a reference that only lists the styled ones tells you nothing about `mark`, `kbd` or `figure`. \"Nothing to override\" is a finding.");

		md("| page | covers |\n| --- | --- |\n| [Text](/framework/styles/elements/text/) | `h1`–`h6`, `.h1`–`.h4`, `p`, and every inline element |\n| [Lists](/framework/styles/elements/lists/) | `ul`, `ol`, nesting, `dl` |\n| [Code](/framework/styles/elements/code/) | `pre`, `code`, `kbd`, `samp`, `--code-bg` / `--code-ink` |\n| [Table](/framework/styles/elements/table/) | `table`, `thead`, `tbody`, `tr`, `th`, `td` |\n| [Forms](/framework/styles/elements/forms/) | every `input` type the reset touches, plus `select`, `textarea`, `button` |\n| [Media](/framework/styles/elements/media/) | `img`, `video`, `audio`, `iframe`, `figure`, `svg`, `.icon` |\n| [Misc](/framework/styles/elements/misc/) | `details`, focus rings, and the elements with no rule at all |");

		md("## Read the third pane");

		md("Every example here is a `demo()`, which shows three things in one box: **the source**, **the result**, and — behind the `html` toggle — **the DOM it actually built**. That third pane is what makes this a reference rather than a gallery. When a page claims `pre > code` resets to zero padding, open the pane and the nesting is right there; when it claims a `figure` keeps a 40px inline margin, the pane tells you which element carries it.");

		md("The source is `fn.toString()` and the html is read off the live DOM, so neither can drift from what rendered. Details: [demo](/framework/ext/demo/), [markup](/framework/util/).");

		md("Next: [Text](/framework/styles/elements/text/) — the type scale, and the twenty inline elements the framework leaves alone.");

		md.details(import.meta, "readme.md", "Design record");
	}
});
