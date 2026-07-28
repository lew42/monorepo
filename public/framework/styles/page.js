import { Page, md, demo, div, p, ul, li, input, button, code, span } from "/app.js";

/* This page ships no stylesheet of its own — every box, column and label below
 * is built from `framework.css` utilities. A page about writing less CSS that
 * needed its own CSS would be arguing against itself. */

// The same markup twice: on the left with one framework declaration reverted
// inline, on the right as the framework leaves it. One rule per pair.
const compare = (without, with_) =>
	div.c("flex gap all-1", () => {
		div(() => { div.c("h4", "without"); without(); });
		div(() => { div.c("h4", "with");    with_(); });
	});

const box = { background: "rgba(0,0,0,0.06)", width: "10em" };

export default new Page({
	meta: import.meta,
	title: "Styles",
	description: "The CSS strategy: a reset, six type levels, a bag of utilities — and as little else as possible.",
	content(){

		demo(() => {
			div.c("h1", "Page Title");
			div.c("h2", "Section Title");
			div.c("h3", "Sub-section Title");
			div.c("h4", "Annotation Heading");
			p("Body copy, with ", code("code"), " in it.");
		}, "The entire type vocabulary — six levels, and the only question is ever *which one*. Each is a class as well as a tag, so anything can borrow a level without lying about the outline: `p.c(\"h2\", …)` reads as a section title and is still a paragraph.");

		md("| level | is | size / weight |\n| --- | --- | --- |\n| `h1` `.h1` | page title | 1.9em / 800 |\n| `h2` `.h2` | section title | 1.15em / 700 |\n| `h3` `.h3` | sub-section title | 1em / 700 |\n| `h4` `.h4` | annotation | 0.8em / 700, uppercase |\n| — | body | inherited |\n| `code` `.code` | code, property names, values | `var(--mono)` |\n\nThe scale sets size, weight and tracking. **Margins are not in it** — spacing is rhythm, and rhythm belongs to whatever is arranging the content (`Page.css` spaces `.page > h2`, a demo box spaces nothing).");

		md("## Utilities first");

		demo(() => {
			div.c("flex gap v-center pad", () => {
				div.c("h4 flex-1", "row");
				button("One");
				button.c("prim", "Two");
			});
		}, "`flex gap v-center pad` — a row, spaced, centered, padded, with **no new CSS**. Reach for the utility vocabulary before writing a rule; most \"I need a stylesheet\" moments are four classes.");

		md("## What the reset buys");

		demo(() => {
			compare(
				() => div.c("pad").style({ ...box, boxSizing: "content-box" }).text("width: 10em"),
				() => div.c("pad").style(box).text("width: 10em")
			);
		}, "`*, *::before, *::after { box-sizing: border-box }` — padding stops making things wider than you asked for.");

		demo(() => {
			compare(
				() => div.c("flex gap", () => {
					input().attr("value", "text").style("font", "revert");
					button("button").style("font", "revert");
				}),
				() => div.c("flex gap", () => {
					input().attr("value", "text");
					button("button");
				})
			);
		}, "`input, button, textarea, select { font: inherit }` — form controls opt out of the document font by default. This opts them back in.");

		demo(() => {
			compare(
				() => ul(() => { li("first"); li("second"); }).style("padding-left", "40px"),
				() => ul(() => { li("first"); li("second"); })
			);
		}, "`ul, ol { padding-left: 1.2em }` — the browser's 40px indent is a fixed pixel value in an `em`-scaled document.");

		md("## You can't fight the framework");

		demo(() => {
			p.c("h2", "a themed h2").style("font-size", "2em");
		}, "Every selector in `framework.css`'s theme layer is wrapped in **`:where()`** — zero specificity. It loses to *any* rule you write, so overriding a default costs one plain selector. No `!important`, no extra classes, no layer.");

		md("```css\nh2 { font-size: 2em }           /* a plain selector already wins */\n.card :where(h2) { … }          /* scope it, still zero-specificity */\nh2 { font-size: revert-layer }  /* drop to whatever came before */\n```\n\nTokens are **not** wrapped — custom properties don't compete on specificity, they're inherited values you override by being closer in the tree. Neither is the `util` layer: a utility class is an explicit opt-in and should win.");

		md("## Three layers");

		md("```css\n@layer base, theme, util;\n```\n\nEvery stylesheet restates that line, because the **first** declaration wins and module import order decides who loads first.\n\n| layer | holds | who writes it |\n| --- | --- | --- |\n| `base` | the reset — things you'd never override | `framework.css`, only |\n| `theme` | the default look: tokens, type scale, controls | `framework.css`, then components, then the site |\n| `util` | opt-in classes; free if unused | `framework.css`, only |\n\n**An unlayered rule beats every layer, at any specificity.** A one-class `.page` in an unlayered `styles.css` once silently defeated a four-class `.column-pager .column.narrow .page`. Wrapping a file in `@layer` is not cosmetic.");

		md("## Tokens");

		demo(() => {
			div.c("flex gap wrap", () => {
				["--prim", "--bg", "--subtle"].forEach(name =>
					div.c("pad", span.c("code", name))
						.style({ background: `var(${name})`, color: "#fff" }));
			});
		}, "Declared on `:root`, so they cascade — a theme overrides them **on `.app`** (or `body.theme-x`), never back at `:root`. That is what lets two variants of the same page sit side by side.");

		md("| token | is |\n| --- | --- |\n| `--prim` | the one accent color |\n| `--bg` | dark surface (sidebar) |\n| `--subtle` | de-emphasized text |\n| `--column` | the flex/grid wrap width |\n| `--sidebar` | any sidebar's width |\n| `--mono` | the code face |");

		md("## Adding CSS");

		md("In order. Stop at the first one that works.\n\n1. **Nothing.** Default styles already handle it.\n2. **A utility class** — `flex gap pad h2`.\n3. **An existing component's class** — reuse `.page-preview`, `.sidebar-link`, `.page-crumb`.\n4. **A rule in the module's own `.css`** — *layout only*: where things sit and how they size. `ColumnPager.css` says the sidebar is `flex: 0 0 var(--sidebar)`; what a sidebar *looks* like is `Sidebar.css`.\n5. **A rule in `/styles.css`** — skin, this site's opinion, loaded last.\n\nAnd the rule that keeps the base honest: **if you ever override a `framework.css` rule, that's a bug report about `framework.css`.** Write it down; the fix is usually to delete the rule or move it behind a class.");

		md("## Naming, and the dependency nobody writes down");

		md("`view.ac(\"page-preview\")` is an import with no `import` statement — so a rename is silent and a grep for consumers finds nothing. Two rules fix most of it, and neither needs tooling.\n\n**A class is prefixed with its owning component**, unless the selector already starts with that component's own class. `.column-pager .crumb-sep` needs no prefix — it can't reach outside. `.page-preview` does, because it's styled unscoped on purpose, so the name is the only namespace it has. The class name *is* the registry.\n\n**If your CSS styles a class you don't emit, import the module that emits it.** `View.stylesheet()` runs at module scope, so the import is what actually loads the stylesheet — not a lint comment:");

		md("```js\n/* css: .page, .page-title, .page-previews, .page-preview */\nimport \"../Page/Page.class.js\";\n```\n\nIt won't detect a rename — nothing without a build step will. It makes the dependency **greppable**, which is the whole win.");

		md.details(import.meta, "readme.md", "Design record — the strategy, and what's still open");
	}
});
