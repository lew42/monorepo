# catalog wall-demo zero-size at 390

Dispatched by `mastermind-layout`. Verbatim ask:

> Four tasks today repaired `ext/catalog`. The last of them found one more and
> left it, correctly, as out of scope: on `/framework/ext/catalog/`, the
> sibling "wall" demo box in the `flex gap wide` row collapses to a
> near-zero-width column at 390 — `zero-size` and `measure`, high severity.
> Pre-existing, unrelated to that task's fix. The page it is on is the
> catalog module's own documentation — a reader arriving on a phone sees a
> broken picture of the pattern the page is teaching.

## Scope (fence)

May write only: `public/framework/ext/catalog/**` and this task dir.
Do NOT touch: `public/framework/ext/demo/**`, `framework.css`, `/styles.css`,
`Page.css`, `public/framework/ext/LayoutTool/**`, `public/framework/ext/Panel/**`.
If the row belongs to `ext/demo` rather than catalog, stop and report the
exact declaration instead of editing out-of-fence.

## Proposed steps

1. Reproduce: `analyze()` on `/framework/ext/catalog/` at 390 and 720, find
   the `zero-size`/`measure` finding, screenshot at 390.
2. Understand the row — two `demo.app()` boxes (wall vs rail) in
   `div.c("flex gap wide")` in `page.js`'s "one line that decides wall or
   rail" section — decide what it should do on a phone per the three sizing
   questions.
3. Fix at the right CSS rung, reusing catalog.css's existing decisions
   (`--gutter-x`, etc.) rather than inventing new patterns.
4. Verify at 390, 720, 1280, 3440 — findings gone, nothing lost wide, still
   reads as a comparison. Before/after screenshots at 390 and 1280.
5. Record a fifth bullet in `ext/catalog/readme.md` Decisions/Traps.
