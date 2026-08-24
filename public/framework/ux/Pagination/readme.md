# Pagination — a page row you can extend: `ui/pagination`'s number, remembered

`ui/` owns the buttons and `.prim`; this owns the one fact the template's own page said a
caller already had — which page is current — plus the wire that drives real content off it.

## Use
```js
import Pagination from "/framework/ux/Pagination/Pagination.js";

const p = new Pagination({
	pages: ["1", "2", "3", "…", "12"], current: 2,
	onChange(current){ … },   // always a NUMBER — never "prev"/"next"
});
p.go(3);            // pick a page, fire onChange
p.draw(pages, cur);  // re-render from fresh data — the caller still owns it
```
`pages` is display labels; `"…"` renders as an ellipsis and is never clickable.

## Watch out
- **`current` is always a number.** The removed `ui.pagination()` compared it as a string
  and handed prev/next through as `"prev"`/`"next"` — this class fixes exactly that:
  `go()` is the one method every button, Prev and Next alike, calls.
- **`go()` clamps at 1, never at a maximum** — `pages` can elide the real total behind
  `"…"`, so there is nothing here to clamp against. The caller's `onChange` decides.
- **`ui/` must never import this.** Imports flow down — [`ux/doc/system.md`](/framework/ux/doc/system/)

## More
- [Overview](/framework/ux/Pagination/) — a pager driving a real list · [words](/framework/ux/Pagination/words/) — the same pager under `ui-contrast ui-compact`
- [`doc/decisions.md`](/framework/ux/Pagination/doc/decisions/) — the split argued, why there is no `Pagination.Button` part
- [`ui/pagination`](/framework/ui/pagination/) — the template half · [`ux/`](/framework/ux/) — the tier
- Files: `Pagination.js` (the class, no parts — buttons are a loop, not a part)
