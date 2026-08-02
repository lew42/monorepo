import { Page, p } from "/app.js";
import { code, section, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Load order",
	children: "resolve",

	content(){
		code(`
router.activate(page{/layouts/column/opt-in/deep/})
  from    (none)                    ← this.active is null, so chain() is []
  shared  0                         ← nothing in common, so nothing is kept

  page{/}.activate()                            → app.show(this)
  page{/layouts/}.activate()                    → page{/}.show(this)
  page{/layouts/column/}.activate()             → page{/layouts/}.show(this)
  page{/layouts/column/opt-in/}.activate()      → page{/layouts/column/}.show(this)
  page{/layouts/column/opt-in/deep/}.activate() → page{/layouts/column/opt-in/}.show(this)`,
			"a cold load, five levels deep — the real console");

		p("Five pages, five activations, shallowest first. The **leaf is the last segment**, not an extra step after them.");

		section("Two activates, one per tier");

		code(`
router.activate(page)   called ONCE.  decides WHAT changes — diffs the chain
page.activate()         called PER PAGE. does the mounting — container().show(this)`);

		p("Same word, different jobs, and they never collide because they're on different objects. The router names its own field: `router.activate(page)` sets `router.active`.");

		section("The chain is complete before anything renders");

		code(`
1. load_segments   import each segment, wire .parent    →  a chain, nothing on screen
2. activate        walk that chain and mount it         →  DOM`);

		p("By the end of phase 1 the leaf already knows its whole ancestry, so phase 2 never has to look anything up. How the url becomes that chain is the previous half:");

		this.previews();

		section("Why a cold load and a click are the same code");

		code(`
COLD LOAD                          CLICK  /nesting/ → /nesting/deep/
from    []                         from    [/, /nesting/]
shared  0                          shared  2
activate  every page               activate  just the leaf
deactivate  nothing                deactivate  nothing`);

		p("A cold load isn't a special case — it's the ordinary diff with an empty `from`. That's the whole reason there's no separate bootstrap path to keep in sync.").ac("note");

		section("Only the tail moves");

		code(`
/a/b/c/d/  →  /a/b/x/y/

from    [root, a, b, c, d]
to      [root, a, b, x, y]
shared   ─────────┘  3

deactivate   d, c        deepest first
activate     x, y        shallowest first
untouched    root, a, b  ← never touched, so nothing to restore`);

		section("What it costs");

		p("Every ancestor renders in full and is then hidden by its child. On the five-deep load above, four pages built their entire content — titles, code blocks, preview cards — to be covered a moment later.");

		code(`
page{/layouts/}.render() — first build
  page{/layouts/}.child("replace")    ↳ import("/layouts/replace/page.js")
  page{/layouts/}.child("tabs")       ↳ import("/layouts/tabs/page.js")
  page{/layouts/}.child("takeover")   ↳ import("/layouts/takeover/page.js")`,
			"and its previews() pulled in three modules that aren't in the chain");

		p("Whether that's worth avoiding depends entirely on the layout — a column layout genuinely needs its ancestors drawn, a replace layout does not. **Keeping state** and **Beyond the url** pick that up.").ac("note");

		watch(
			"Reload this page — one app.start group, and every page in the chain activates inside it.",
			"Now click Nesting, then Deep. Same router.activate, but shared is 1 then 2.",
			"Open the router.activate group each time and read from / to / shared."
		);
	}
});
