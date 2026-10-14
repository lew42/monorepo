# Rules architecture — argue with a rule on a page that shows it

The rules page is a set of plain pages, one per layout rule, each with live demos that measure themselves. The page is declared in [`page.js`](../page.js) with a `doc()` helper per rule; the prose lives beside it as `.md` files; the demos are in [`demos.js`](../demos.js) and their frames are styled by [`rules.css`](../rules.css). Nothing is crawled: a rule exists once `page.js` names it.

## A rule states its weight, not an order

**Decided:** every rule explains its reasoning and how firmly it holds. The words `never` and `always` appear only where something visibly breaks (a zero-width flex item, a clipped rail with no scrollbar).
**Why:** over-firm documentation teaches a reader to obey rules that never needed to exist, and this is the page a reviewer with less context reads.
**Instead:** a list of hard rules. Shorter, but a later reader cannot tell a load-bearing rule from one afternoon's preference.
**Detail:** [`doc/decisions.md`](./decisions.md) (the section "Decisions")

## The demo is measured, not asserted

**Decided:** a rule's example is a rendered card that prints its own measured ratio, not a code block in prose.
**Why:** a code block is a claim; a measured card is evidence, and the page cannot drift from the thing it measures.
**Instead:** static examples in markdown. Cheaper to write, but nothing stops them going stale.
**Detail:** [`doc/decisions.md`](./decisions.md) (section "Live demos over asserted examples")

## One page per rule, each a URL

**Decided:** each rule (Cascade, Proportion, Nesting, Robust, Reuse) is its own child page at `/framework/styles/rules/<name>/`, declared through `doc(title, file, description, after)` in `page.js`.
**Why:** a review comment can cite `/framework/styles/rules/nesting/` instead of quoting a paragraph.
**Instead:** one long rules page. Easier to write, but every review would quote it at length.
**Detail:** [`doc/decisions.md`](./decisions.md) (section "One page per question")

## Each measurable rule has a same-named DesignTool rule

**Decided:** every rule here that can be measured has an analyzer rule with the same name in `ext/DesignTool`: `pad-scale`, `double-pad` and `cramped` (proportion), `escape`, `clipped`, `measure` and `zero-size` (nesting), `gutter` (cascade). `pad-scale` and `double-pad` live in [`polish.js`](/framework/ext/DesignTool/polish.js); the rest in [`rules.js`](/framework/ext/DesignTool/rules.js).
**Why:** a mismatch between a page and an analyzer rule is then visible by name instead of silent.
**Instead:** an independent analyzer with its own vocabulary. Cheaper to change alone, but the two would drift without anyone noticing.
**Detail:** [`doc/decisions.md`](./decisions.md) (section "The enforcement seam")

⚠ No test asserts that the two agree. Nothing renders each demo and checks that its named rule fires, so when they disagree, one is out of date and nothing says which. The open item is in [`doc/decisions.md`](./decisions.md) (section "Open").

## `.measure` centres, and the rule for one left edge is open

**Decided (as the code is now):** `.measure` in [`framework.css`](/framework/framework.css) sets `max-width: min(var(--measure), 100%)` and `margin-inline: auto`, so it centres. `.measure.start` sets `margin-inline: 0` and keeps the left edge.
**Why:** three Figma layouts needed a capped block centred above left-aligned content and worked around `.measure` with a hardcoded width. The analyzer did not flag centring, because it is not a geometry failure.
**Instead:** make `.measure` flush-left and `.measure.center` the exception, which matches the house rule. That would change the eight call sites that want centring.

⚠ The house rule in [`Page.css`](/framework/core/Page/Page.css) says "No auto margins: every shape shares ONE left edge". `.measure` breaks that rule on purpose. Which way the default falls is the owner's call, not decided here.
**Detail:** [`doc/decisions.md`](./decisions.md) (section "For the owner — one decision waiting")

## Robust is a shortlist, not a survey

**Decided:** [`robust.md`](./robust.md) lists the arrangements proven to hold at 400, 1200, 1920 and 3440 with no media query.
**Why:** each one was measured, so a claim there is a claim that was checked.
**Instead:** a full catalogue. Not yet written, and it would need the same measuring.
**Detail:** [`doc/decisions.md`](./decisions.md) (section "Open")
