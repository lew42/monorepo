# table-equal — build brief

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; everything there is mandatory. Skills, in order: `new-task` (this dir, group `platform`), `code`, `css` (it has you read framework.css itself and decide where the declaration belongs), `new-css-class` (the name), `documentation`, `finish-task`.

**The owner's ask, verbatim:** "make a class to equalize column widths for tables, and add it to the platform mvp page."

## What lands

1. **One class in the framework's utility vocabulary** that makes a table's columns equal width: `table-layout: fixed; width: 100%` on the table (and nothing a cell needs to know). It must work on the tables `md()` renders, which sit inside an `.md` wrapper — so the word goes on the wrapper the page already holds (`md(...).ac("<word>")`) and the rule reaches the `table` inside it, the same way `.ac("wide")` already opts an `.md` out of the measure. Decide the name with the `new-css-class` skill's census (something like `equal`, `cols-equal`, `table-equal` — the skill says which prefix it must carry, and whether a bare word is allowed in framework.css). One rule, in the right layer, beside its neighbours; a two-line comment saying what it is for.
2. **The MVP page uses it.** `public/imagine/platform/mvp/page.js`, the "Where the verdicts disagree" table: today the first column takes most of the width and "ruled" wraps to ten lines. Add the word to that one `md()` call. If the equalized table then clips a long unbroken token, say so; do not add `word-break` rules to the framework for it.
3. **Docs:** the word in `public/framework/framework.css`'s own comment inventory where the utilities are listed (if such a list exists — the `css` skill shows you), and one line in `public/framework/styles/readme.md` or wherever `wide`/`bleed` on `.md` is documented. Nothing longer.

## Verify

Private server (rules file), headless, 1280 and 3440: on `/imagine/platform/mvp/` every column of that table measures within 2% of the others (`getBoundingClientRect().width` per `th`), nothing overflows the column, zero console errors. Then the same table at 400: say whether fixed equal columns are still readable there or whether the word should stand down below some width (report, don't build). A screenshot of the table at 3440 in your task links.

## Fences

Write only: the one rule in the framework stylesheet the `css` skill points you to, `public/framework/styles/css-scopes.txt` if the `new-css-class` skill requires it, the doc line, the one `.ac(...)` in `mvp/page.js`, this task dir. No new files under `public/imagine/`. Budget ~80k tokens.
