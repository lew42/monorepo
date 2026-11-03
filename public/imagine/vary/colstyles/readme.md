# Colstyles — the column render CONTROL answer

Answers one question: *do we have control over how a columns tree renders?* [`hooks/`](./hooks/)
shows every control point live; [`finder/`](./finder/), [`cards/`](./cards/),
[`ink/`](./ink/) and [`glass/`](./glass/) wear one shared content tree ([`tree.js`](./tree.js))
in four complete looks. The index page also crosses all four against two real column widths —
color and layout, permutated for real, not just named side by side.

## Use

Open [/imagine/vary/colstyles/](/imagine/vary/colstyles/) and click through — every hook and
every look is a real page, not a screenshot.

## Watch out

- A look that touches `flex`, `min/max-width` or `border-inline-end` on `.page-column-body`
  has to match core's own three-class specificity or the override silently loses:
  [`doc/decisions.md`](./doc/decisions.md).
- `width: "large"` split evenly with two plain ancestor columns instead of taking the
  leftover — `fill` is the word for a page whose content wants the room, at any nesting
  depth: [`doc/decisions.md`](./doc/decisions.md).
- Cards' gutter is `margin` on `.page-column-body`, never `gap` on the row — `gap` would land
  on the drag seam's own zero-outer-size math too: [`doc/decisions.md`](./doc/decisions.md).
- Ink's item rules read `:is(.page-column-item, .page-gen-item)` — a generated column
  (`core/Page/generator/`) draws the second class, not the first: [`doc/decisions.md`](./doc/decisions.md).
- Glass has only two depth rungs, not N — and they come from `:has()`, not
  `.active-page`/`.active-ancestor`: those never reach inside `demo.app()`, which has no
  Router: [`doc/decisions.md`](./doc/decisions.md).

## More

- The mechanism this lab controls: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md)
- Full record, including the gaps the token system doesn't reach: [`doc/decisions.md`](./doc/decisions.md)
- Files: `hooks/` (`page.js` + `trees.js`, seven small demos), `tree.js` (the one shared
  content tree), `finder/` `cards/` `ink/` `glass/` (one `page.js` each), `colstyles.css`
  (every rule, `vary-colstyles-` prefixed)
