import { Page, md, h2, div, demo } from "/app.js";
import { editor } from "./editor/page.js";
import { panes } from "./panes/page.js";

export default new Page({
	meta: import.meta,
	title: "App patterns",
	description: "Four application shapes — an editor, a pane system, columns, and the navigation question — built out of the same five blocks.",
	icon: "apps",

	children: "editor panes columns navigation",

	content(){

		md("**Four application shapes, no new machinery.** Every page below is a `Page` on a `demo.stage()` with a layout bar over it and its own source open underneath — the same [exhibit](/framework/ext/demo/) every detail page on this site is. What is new is only what the examples *do*: they push the framework at real app chrome instead of at a band of prose.");

		this.previews();

		h2("The four");

		md(`| | the shape | the claim it tests |
|---|---|---|
| [Editor](/framework/ai/2026-08-12/apps/editor/) | layers · canvas · properties | a properties panel can be **\`ext/Layout\`'s own controls in a box** — one vocabulary, not a second one |
| [Panes](/framework/ai/2026-08-12/apps/panes/) | recursive splits, drag to resize | a Blender pane system is four lines, because \`flex\` already nests |
| [Columns](/framework/ai/2026-08-12/apps/columns/) | Miller columns | \`children\` **is** the data, \`$pages\` is the next column, and \`container()\` walks to it |
| [Navigation](/framework/ai/2026-08-12/apps/navigation/) | rail vs wall vs columns | one tree, three arrangements, switchable — so the trade is felt rather than argued |`).ac("wide");

		h2("A properties panel, in a box");

		demo.stage(editor).ac("bleed");

		md("Click a box on the canvas, or a row in the layers list. The chips, the knobs and the flex/grid pick are **`layout.words` and `controls.js`** — ext/Layout's own registry, drawn into a region of the demo instead of into the app's right drawer. The line at the top of the panel is the call that would build the selection. The two panels are titlebar toggles, because *a panel on or off is not a second example page*.");

		h2("Recursion is the whole pane system");

		demo.stage(panes).ac("bleed");

		md("`[\"row\", \"Outline\", [\"col\", \"Canvas\", \"Timeline\"], \"Properties\"]` — a spec, and a four-line builder that reads it. A split is a `flex` row (or a `flex v` column) whose children each take `1 1 0`; a divider is a child that takes none, and drags pixels between its two neighbours. [Split](/framework/ai/2026-08-12/apps/panes/split/) is the same builder over a tree the reader edits: → cuts a pane beside itself, ↓ below it, ✕ closes it.");

		h2("What the framework was missing");

		md(`| | found by | verdict |
|---|---|---|
| **an interactive demo fights its own stage.** \`demo.stage(fn, steer)\` makes the render an \`ext/Layout\` region, so every control click inside opens the right drawer on that control | the editor, which opened **two** properties panels on one chip click | \`widget($el)\` in \`apps/parts.js\` — the box stops its own click and hover, the bar still steers the render whole. Two lines, four callers. Whether it belongs to \`ext/demo\` or \`ext/Layout\` is the open question |
| \`ext/Layout\`'s four control primitives are **module-internal** — \`pick\`, \`chips\`, \`knob\`, \`menu\`, \`btn\` live in \`controls.js\` and only \`layout.words\` is public | the editor's properties panel, which needs chips ext/Layout has no word for | these pages import \`controls.js\` directly. **Propose \`layout.controls\`** — one re-export from \`layout.js\`, so the next in-box panel is not a copy |
| **no \`hidden\` utility.** \`View.hide()\` writes inline \`display\`, the top rung of the ratchet | every panel toggle here | each family shipped its own one-line \`.apps-off\`. The View record already proposes \`.hidden\`; this is a third caller for it |
| \`flex-1\` carries \`min-width: 0\` and **not** \`min-height: 0\` | every scrolling pane, at every nesting level | four of the ~15 CSS lines in this exploration exist only to restate it. Either \`flex-1\` should carry both, or the pair wants its own word |
| a card's live thumb has **no way to be told a size** — \`demo.tree()\` calls \`this.box()\` with no height | the columns card, which is 21em of trail inside a 12em ceiling | worked around with \`card: "tall"\`. The unify session's size vocabulary is the real fix |
| \`demo.tree()\` hard-codes its **tree** as the printed lesson, and its card carries **no label** | columns, where the tree is filler and the arrangement is the point — and where a bare card sat in a wall of labelled ones | both are four-line overrides, because \`...config\` spreads last. No API change wanted; the bare card is right in a rail of nothing but trees |
| a hidden \`.page-title\` is **still a sibling** — \`.page-title + *\` pays 1.5 × \`--flow\` to whatever follows it | the columns trail, where every level started 45px lower than the one before | one rule, copied from \`catalog.css\`, which pays the same bill and says so. Third victim of the same line |`).ac("wide");

		h2("Where these should live");

		md(`| example | promote to | why |
|---|---|---|
| **Columns** | \`core/Page/overview/columns/\`, in the **Arrangements** run beside \`catalog\` and \`deep\` | it is a page-tree arrangement, it is 40 lines, and it is the missing third answer next to wall and rail. The strongest of the four |
| **Navigation** | \`ext/catalog/\` — as the record's *"which arrangement"* page, or a \`core/Page/doc/\` note | it argues a design question rather than teaching an API, and it is the page to send someone who asks "rail or wall?" |
| **Editor** | \`ext/Layout/\`, once \`layout.controls\` is public | it is the best argument for the drawer's vocabulary that exists: the same controls, in someone else's box |
| **Panes** · **Split** | stay here for now | nothing on the site is a pane system yet, and a demo with no consumer is a component waiting to be invented. Promote when a real page wants one |`).ac("wide");

		h2("Open");

		md("**Nothing was added to `ext/Layout`.** Every control on these pages is one it already had — which was the test, and it passed. The one thing it cannot do is put its panel *inside* something: the drawer is one per document and pushes the whole app, so the editor draws its own region and reuses only the controls. That is the right split, but it means the panel's **layout** is copied and its **vocabulary** is not.");

		md("**The columns trail scrolls itself on click** (`requestAnimationFrame`, then `scrollTo` on the nearest `.demo-app-pages`). That is the one place these pages reach for an element by class outside their own render, and it does nothing outside a demo box — but it is a real coupling and it should die when a scroll-into-view helper exists.");

		md("**Untested: touch.** The pane dividers use pointer capture, which works, but a 0.4em grip is under the 44px target every touch guideline asks for. The stage's own handle has the same problem, so this is the framework's question rather than these pages'.");

		md("**Nothing here declares a new block, and one landed anyway:** [Panes](/framework/ai/2026-08-12/apps/panes/) got its **Variants** wall for free the moment the sibling session taught `demo.exhibit()` to read `page.children` — `children: \"split\"` was already declared. Four families, one card system, and the simple-to-complex tree the brief asked for is the tree.");

		md.details(import.meta, "readme.md", "Design record — the calls behind these four");
	},
});
