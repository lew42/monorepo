import { Page, p } from "/app.js";
import { code, section, watch } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "2 · Columns",
	children: "opt-in plain",

	// THE WHOLE LAYOUT. An inert class string — CSS does the rest.
	classes: "columns",

	content(){
		code(`
classes: "columns",`, "layouts/column/page.js — the whole opt-in");

		p("I split in two: my content on the left, my child on the right. Which of my two children you pick decides what happens **at the next level down** — and that is the point of this page.");

		this.previews();

		section("The two children do different things");

		code(`
opt-in    carries layout: "columns" too   →   it splits as well.  3 columns.
plain     an ordinary page.js             →   it REPLACES.        2 columns,
                                                                  the right one swaps.`);

		p("So **opt-in keeps drilling** — every level that opts in adds a column. **plain becomes a switcher** — the right-hand side is one pane whose contents get replaced by whatever you open inside it. Same framework, same Router, one property's difference.").ac("note");

		section("Why it works that way");

		p("`classes` puts that string on **my** `.page` and nowhere else. It styles my own split and nothing below it — my child is a different `.page`, with its own `classes` or without any. Nobody propagates downward and nobody searches upward.");

		code(`
url    /layouts/column/plain/deep/

  page                      classes     what it does to ITS child
  ────────────────────      ─────────   ─────────────────────────
  /layouts/column/          columns     puts plain beside me       ✓
  /layouts/column/plain/    (none)      puts deep OVER its content ← switcher

wanted   column | plain | deep
got      column | plain⇄deep`);

		section("And the width halves each time");

		code(`
main 1058px

column                529 | 529
column › opt-in       529 | 264 | 264
column › opt-in › …   529 | 264 | 132 | 132`, "measured");

		p("A `1fr` grid splits whatever its own track is, so each level halves the remainder. Real column UIs flatten the chain instead of nesting it — one grid with N tracks, not N nested grids. That needs the layout to see the whole chain, which is the open problem **Beyond the url** picks up.").ac("note");

		watch(
			"Open opt-in › Deep — three columns, all visible at once.",
			"Open plain › Deep — two columns; the right one swapped instead of splitting.",
			"Both log the identical router.activate diff. Only the CSS class differs."
		);
	}
});
