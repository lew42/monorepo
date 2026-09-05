# Right nav — a persistent tree on the right; click a row and the centre swaps to it

## Use

Live: [/imagine/paging/rightnav/](/imagine/paging/rightnav/). Five real leaves — three
content sizes (`s` `m` `xl`) plus two nested under a `Guides` branch that expands in
place — and a mode toolbar (tree width, side, placement) remembered by `store()`.

## Watch out

- `/imagine/` is a columns HOST and `column_host()` finds it from ANY depth, so this
  page's own `render_column()` clobbers a hand-set `this.$pages` the instant `content()`
  returns — a leaf mounted in core's `page-column-pages` box instead of this one's.
  Fixed by re-asserting `this.$pages` after calling through to the prototype's
  `render()`: [`doc/decisions.md`](./doc/decisions.md).
- A leaf under a columns host renders as a further column unless it draws its own
  view — the leaves here are a small `SwapPage` class overriding only `render()`;
  `container()`'s own walk-up-the-chain still finds the root's `$pages` for free, at
  any depth, with no override of its own.
- The site theme styles every bare `<button>` uppercase+bold at `(0,2,0)`, one rung
  above `.paging-item`'s own `(0,1,0)` in the SAME `@layer theme` — a branch row (a
  real button, since it only expands) needs one extra type selector to win it back.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the `$pages` clobbering bug, in full,
  with the measurement
- Files: `page.js` (the system), `rightnav.css` (the split, the three variants, the
  400 collapse)
- Vocabulary reused as-is from the program: [`../paging.css`](../paging.css) /
  [`../paging.js`](../paging.js) — `.paging-item` `.paging-panel` `.paging-toolbar`
  `.paging-card` / `.paging-box` `.paging-wall` `.paging-line`
