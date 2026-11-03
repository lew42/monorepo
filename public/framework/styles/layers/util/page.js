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
			div.c("flex gap", () => cells());
		}, "`flex` and `gap` — the two you'll type most. `gap` reads a token: `1em` by default, and `.style(\"--gap\", \".4em\")` is the whole adjustment. `gap-2em` is the one preset, because a scale nobody asked for is worse than a token.");

		demo(() => {
			div.c("flex gap v-center", () => {
				div.c("h3", "title");
				div.c("flex-1");
				span.c("h4", "right");
			});
		}, "`v-center` aligns the cross axis; `flex-1` on a spacer pushes what follows to the end. `split` does the same with `space-between`.");

		demo(() => {
			div.c("flex gap all-1", () => cells());
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

		md("## Measure");

		demo(() => {
			div.c("measure pad").style({ background: "var(--wash)" })
				.text("A centred reading column at 34em — the same token a page reads, on any box.");
		}, "`measure` is `max-width: var(--measure)` plus `margin-inline: auto`. It **declares** `--measure: 34em` rather than reading the region's, so a 34em block inside a 60em sheet is 34em — and an inline `.style(\"--measure\", \"78em\")` wins, because a value declared on the element beats one it inherited.");

		md("**It is declared after `.flex > * { margin: 0 }` on purpose.** Both are in `util`, both are `(0,1,0)`, so the later one wins — and if the order flipped, `margin-inline: auto` would be zeroed the moment this box sat in a `flex` row, which is exactly where a centred column is usually asked for. Order inside a layer is load-bearing here.");

		md("## Checkered");

		demo(() => {
			div.c("checkered pad flex gap", () => {
				div.c("pad").style({ background: "var(--surface)" }).text("painted — hides the board");
				div.c("pad").text("unpainted — the board shows through");
			}).style("border", "1px solid var(--line)");
		}, "The transparency board: a box with no background of its own shows the checkers through, so *did the thing I rendered paint itself* is visible at a glance. `--tint`-based, so it stays subtle in both modes, and `(0,1,0)` on purpose — a checker that lost to any background wasn't asked for. **Every `demo()` stage on this site wears it**, and so does every preview thumb.");

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
		}, "`zoom-25`, `-50`, `-75`, `-100`, `-150`, `-175`, `-200`, plus `zoom-responsive`. Scales a whole subtree **including its layout** — which is why a [preview card](/framework/core/Page/) uses it to render whole pages into thumbnails, and `transform: scale()` cannot: a scaled box still occupies its unscaled size, so nothing re-lays-out.\n\n**Eight rungs, frozen.** This is the one place the house pattern — a class plus a token, like `pad`/`--pad` — was deliberately *not* used, and an audit flagged it as a scale nobody asked for. A census found eight of the nine had real call sites, so it stays; the ninth (`zoom-125`) had none and is gone. A level that is not on the ladder is `.style(\"zoom\", …)` at the call site, not a tenth rule.");

		md("## Forms");

		demo(() => {
			textarea.c("auto", "this textarea sizes to its content — type into it");
		}, "`textarea.auto` uses `field-sizing: content`, so the box follows the text.");

		md("## Next");

		md("That's every layer. The [design record](/framework/styles/) has the reasoning — why the base stays minimal, how dependencies are declared, and what's still open.");

		md("Next: [Elements](/framework/styles/elements/) — every element the framework styles, rendered beside the rule that styles it.");
	}
});
