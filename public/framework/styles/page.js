import { Page, md, demo, div, p, code, button } from "/app.js";
import base from "./base/page.js";
import theme from "./theme/page.js";
import util from "./util/page.js";

/* This page ships no stylesheet, and neither does any page under it — every
 * box, column and label is built from framework.css utilities. A section
 * arguing for less CSS that needed its own would be arguing against itself. */

export default new Page({
	meta: import.meta,
	title: "Styles",
	description: "Three layers, six type levels, twelve tokens — and as little else as possible.",
	// col: "narrow",
	children: [base, theme, util],
	content(){

		demo(() => {
			div.c("flex gap v-center pad", () => {
				div.c("h4 flex-1", "row");
				button.c("prim", "One");
				button("Two");
			});
		}, "A row — spaced, centered, padded — with **no new CSS**. Most \"I need a stylesheet\" moments are four classes.");

		md("## Write as little as possible");

		md("`framework.css` should contain nothing you'd ever want to override, and a new module should add nothing you have to fight later. **Stop at the first rung that works:**\n\n1. **Nothing.** The default already handles it.\n2. **A utility class** — `flex gap v-center pad h2`.\n3. **An existing component's class** — `.page-preview`, `.sidebar-link`.\n4. **The module's own `.css` — layout only.** Where things sit, how they size. Not color, not borders, not type.\n5. **`/styles.css` — skin.** This site's opinion, loaded last.\n\nRung 4 is the one that needs policing, so it gets a test: *would this rule still be right if the component were dropped into a completely different site?* Flex sizing, yes. `background: #eef0f4`, no.\n\nAnd the rule that keeps the base honest: **if you ever override a `framework.css` rule, that's a bug report about `framework.css`.** The fix is to delete the rule or move it behind a class — never to out-specify it downstream.");

		md("## Three layers");

		md("```css\n@layer base, theme, util;\n```\n\nEvery stylesheet restates that line, because the **first** declaration wins and module import order decides who loads first.\n\n| layer | holds | |\n| --- | --- | --- |\n| [`base`](/framework/styles/base/) | the reset — ten rules fixing browser defaults | never a look |\n| [`theme`](/framework/styles/theme/) | tokens + the default look | **this is a theme**, the one you get free |\n| [`util`](/framework/styles/util/) | opt-in classes | free if unused |\n\n**An unlayered rule beats every layer, at any specificity.** A one-class `.page` in an unlayered `styles.css` once silently defeated a four-class `.column-pager .column.narrow .page`. Wrapping a file in `@layer` is not cosmetic.");

		md("## The type scale");

		demo(() => {
			div.c("h1", "Page Title");
			div.c("h2", "Section Title");
			div.c("h3", "Sub-section Title");
			div.c("h4", "Annotation Heading");
			p("Body copy, with ", code("code"), " in it.");
		}, "Six levels, and the only question is ever *which one*. Each is a class as well as a tag: `p.c(\"h2\", …)` reads as a section title and is still a paragraph. Never invent a font-size in a component — pick a level.");

		md("## Naming, and the dependency nobody writes down");

		md("`view.ac(\"page-preview\")` is an import with no `import` statement — a rename is silent and a grep for consumers finds nothing. Two rules, neither needing tooling:\n\n**A class is prefixed with its owning component**, unless the selector already starts with that component's own class. `.column-pager .crumb-sep` needs no prefix; `.page-preview` does, because it's styled unscoped on purpose. CSS has one global namespace and no build step to hash it, so **the class name is the registry**.\n\n**A module styles the classes it emits; generic elements belong to `framework.css`.** `md.css` went from 47 lines to two classes by handing `pre`/`blockquote`/`table` back. A theme is the exact inverse — generic elements are *all* it touches.\n\n**If your CSS styles a class you don't emit, import the module that emits it.** `View.stylesheet()` runs at module scope, so the import is what actually loads the stylesheet:");

		md("```js\n/* css: .page, .page-title, .page-previews, .page-preview */\nimport \"../Page/Page.class.js\";\n```\n\nIt won't detect a rename — nothing without a build step will. It makes the dependency **greppable**, which is the win.");

		md("## The three layers, line by line");

		this.previews();

		md.details(import.meta, "readme.md", "Design record — strategy, dependencies & open questions");
	}
});
