import { Page, md, demo, el, div, p, code, table, thead, tbody, tr, th, td } from "/app.js";

/* No stylesheet — see base/page.js. */

export default new Page({
	meta: import.meta,
	title: "Table",
	description: "Four declarations make a table readable. A fifth one — a scroller — is missing on purpose.",
	content(){

		demo(() => {
			table(() => {
				thead(() => tr(() => { th("element"); th("rule"); }));
				tbody(() => {
					tr(() => { td("table"); td("border-collapse: collapse"); });
					tr(() => { td("th, td"); td("padding: 0.25em 0.75em; border: 1px solid var(--line)"); });
					tr(() => { td("th"); td("background: var(--wash); text-align: left"); });
				});
			});
		}, "The table styles itself. `border-collapse: collapse` so adjacent cells share one border instead of doubling it, a token border on every cell, and a washed left-aligned `th` — **four declarations**, all reading tokens, and a theme retunes the lot by changing `--line` and `--wash`.");

		md("`thead`, `tbody`, `tr` and `tfoot` have **no rules of their own**. There is no zebra striping, no row hover and no `width`, so a table sizes to its content like any other block. `caption`, `colgroup` and `col` render fine and have no factory — build them with `el(\"caption\", …)`.");

		md("## A realistic one");

		demo(() => {
			table(() => {
				el("caption", "Routes under /framework/styles/").style({ textAlign: "left", paddingBottom: "0.5em" });
				thead(() => tr(() => { th("route"); th("page"); th("ships CSS"); }));
				tbody(() => {
					[["base/", "the reset", "no"], ["theme/", "tokens + the look", "no"], ["util/", "opt-in classes", "no"], ["elements/", "this reference", "no"]]
						.forEach(([route, page, css]) => tr(() => {
							td(code(route));
							td(page);
							td(css);
						}));
				});
			});
		}, "A `forEach` inside the capture callback, which is all a \"data table\" ever needs — the rows are built by the same factories as everything else, so there's no template language and nothing to learn. `caption` takes an inline `.style()` here because the framework has no opinion about it.");

		demo(() => {
			table(() => tbody(() => {
				tr(() => { th("route").attr("scope", "row"); td("/framework/styles/elements/"); });
				tr(() => { th("children").attr("scope", "row"); td("seven"); });
			}));
		}, "`th` doesn't have to be in a `thead` — a row header takes the same washed background, so a two-column key/value table reads correctly with no extra class. `scope=\"row\"` is for screen readers; the look comes free.");

		md("## Cells hold blocks");

		demo(() => {
			table(() => tbody(() => tr(() => {
				td(() => { p("A cell with a paragraph."); p("And a second one."); });
				td("A cell with a string.");
			})));
		}, "`:where(.flow, .page, .md) :is(li, td, th) > p { margin-block: 0.35rem }` in `Page.css` — the same rule that fixes loose list items. Without it the UA's `1em` paragraph margin inside a cell fights the cell's own `0.25em` padding.");

		md("## The missing rule");

		demo(() => {
			div().style({ maxWidth: "20em", overflowX: "auto" }).append(() => {
				table(() => {
					thead(() => tr(() => { th("one"); th("two"); th("three"); th("four"); th("five"); th("six"); }));
					tbody(() => tr(() => { td("1"); td("2"); td("3"); td("4"); td("5"); td("6"); }));
				});
			});
		}, "**Nothing gives a table a scroller.** `pre` got `overflow-x: auto` in the reset and `table` did not, so a table wider than its column overflows the page instead of scrolling inside itself. One `div` with `overflow-x: auto` is the fix, at the call site — and it can only be at the call site, because a rule in the base cannot wrap an element in a box that doesn't exist. On the design record.");

		md("The site adds exactly one table opinion, in `/styles.css`: `.md td:first-child { white-space: nowrap }`. Docs tables here lead with a keyword, and keeping it on one line is a fact about **this site's writing**, not about markdown — which is why it isn't in `md.css`.");

		md("Next: [Forms](/framework/styles/elements/forms/) — every `input` type the reset touches, and the two `:not()` lists that deliberately disagree.");
	}
});
