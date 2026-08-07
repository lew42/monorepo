import { Page, md, demo, div, p, span, textarea, toc } from "/app.js";

/* No stylesheet of its own — see base/page.js. */

// four labelled cells, so a layout class has something to arrange
const cells = (n = 4) => {
	for (let i = 1; i <= n; i++)
		div.c("pad").style({ background: "var(--wash)", border: "1px solid var(--line)" }).text(i);
};

export default new Page({
	meta: import.meta,
	title: "util",
	description: "Opt-in classes — flex, grid, spacing, zoom. Free if you don't use them.",
	icon: "build",
	content(){

		toc();

		md("```css\n@layer util { … }\n```\n\nThe last layer, so a utility beats component CSS — which is right, because you typed it on purpose. Nothing here costs anything unless you use it.\n\n**This is rung 2 of the ladder, and most \"I need a stylesheet\" moments end here.** Before writing a rule, check whether four classes already say it.");

		md("## Flex");

		demo(() => {
			div.c("flex gap", cells);
		}, "`flex` and `gap` — the two you'll type most. `gap` is 1em; `gap-2em` is the only other size, because a third would start a scale nobody asked for.");

		demo(() => {
			div.c("flex gap v-center", () => {
				div.c("h3", "title");
				div.c("flex-1");
				span.c("h4", "right");
			});
		}, "`v-center` aligns the cross axis; `flex-1` on a spacer pushes what follows to the end. `split` does the same with `space-between`.");

		demo(() => {
			div.c("flex gap all-1", cells);
		}, "`all-1` makes every child `flex: 1` — equal columns, no per-child classes.");

		demo(() => {
			div.c("flex gap v", () => cells(3));
		}, "`v` stacks. `reverse` flips the row.");

		demo(() => {
			div.c("flex gap auto", () => cells(6));
		}, "`auto` wraps, each child sized `1 1 var(--column)` (14em). Resize the column — this is a responsive grid with no media query.");

		md("| class | does |\n| --- | --- |\n| `flex` | `display: flex` |\n| `flex.v` | column |\n| `flex.reverse` | `row-reverse` |\n| `flex.wrap` | wrap |\n| `flex.auto` | wrap, children `1 1 var(--column)` |\n| `flex.three` | wrap to 3-up, then 1-up (no media query) |\n| `flex.all-1` | every child `flex: 1` |\n| `flex-1` | this child `flex: 1` — the **fluid** track |\n| `basis` | this child `flex: 0 0 var(--basis, var(--column))` — the **fixed** track |\n| `flex.h-center` | `justify-content: center` |\n| `flex.v-center` | `align-items: center` |\n| `flex.split` | `space-between` |\n\n`flex > * { margin: 0 }` and `grid > * { margin: 0 }` come along for free — a laid-out container spaces itself with `gap`, and an inherited block margin only fights it.");

		demo(() => {
			div.c("flex gap", () => {
				div.c("basis pad").style({ "--basis": "8em", background: "var(--wash)" }).text("basis 8em");
				div.c("flex-1 pad").style({ background: "var(--wash)" }).text("flex-1 — takes the rest");
			});
		}, "**`basis` is the other half of `flex-1`.** A fixed track beside a fluid one is the commonest two-column row there is, and for a long time only the fluid half had a name — five components wrote `flex: 0 0 …` by hand, which is what earned this one. `--basis` defaults to `--column`; set it inline for anything else.");

		md("## Grid");

		demo(() => {
			div.c("grid gap auto", () => cells(6));
		}, "`grid auto` — `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))`. The `min()` is what stops it overflowing on a narrow screen.");

		demo(() => {
			div.c("grid gap three", () => cells(6));
		}, "`three` holds three columns, then drops straight to one — the [Heydon Pickering](https://every-layout.dev/) flip, done with `clamp()` instead of a breakpoint. `flex.three` is the same idea in flexbox.");

		md("## Spacing");

		demo(() => {
			div.c("pad").style({ background: "var(--wash)" }).text("pad");
			div.c("all-pad flex gap", () => cells(2)).style({ background: "var(--wash)" });
		}, "`pad` pads the element; `all-pad` pads every child. `mb` is a 1em bottom margin.");

		demo(() => {
			div(() => {
				p("first — no top margin");
				p("last — no bottom margin");
			}).style({ background: "var(--wash)" });
		}, "`:first-child { margin-top: 0 }` and `:last-child { margin-bottom: 0 }` collapse a container's outer gap into its own padding. Global, and in `util` so they win — which already made three components' private copies dead code.");

		md("## Text");

		demo(() => {
			div.c("uppercase", "uppercase");
			div.c("capitalize", "capitalize each word");
		}, "`uppercase` and `capitalize`. Note `h4` already uppercases — reach for the level before the utility.");

		md("## Zoom");

		demo(() => {
			div.c("flex gap v-center", () => {
				div.c("zoom-50 pad").style({ background: "var(--wash)" }).text("50%");
				div.c("zoom-100 pad").style({ background: "var(--wash)" }).text("100%");
				div.c("zoom-150 pad").style({ background: "var(--wash)" }).text("150%");
			});
		}, "`zoom-25` through `zoom-200` in 25% steps, plus `zoom-responsive`. Scales a whole subtree including its layout — handy for previews and for checking a design at size without touching it.");

		md("## Forms");

		demo(() => {
			textarea.c("auto", "this textarea sizes to its content — type into it");
		}, "`textarea.auto` uses `field-sizing: content`, so the box follows the text.");

		md("## Next");

		md("That's all three layers. The [design record](/framework/styles/) has the reasoning — why the base stays minimal, how dependencies are declared, and what's still open.");

		md("Next: [Utilities](/framework/util/) — the JS helpers, which are far fewer.");
	}
});
