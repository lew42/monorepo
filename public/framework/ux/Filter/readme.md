# Filter — a segment + search class that drives several regions at once

State = an active segment plus a query, remembered between renders — the same graduation
rule as `Tree`, applied to a toolbar's `filter()` row instead of a tree.

## Use

```js
import Filter from "/framework/ux/Filter/Filter.js";

const f = new Filter({
	segments: ["All", "core", "ux"], segment_field: "tier",
	search_field: "name", placeholder: "Filter modules…",
	changed(predicate){ … },   // or onChange — both spellings work
});

f.predicate();      // row => boolean, built fresh from the current state
f.set("ux");        // pick a segment, fires changed()
f.query("tr");       // type into the field, fires changed()
```

`changed(predicate)` is the one wire — `Tree.selected_change(node)` copied one rung up.
Filter never reads a caller's DOM: it hands out a plain function, and the caller runs
`data.filter(predicate)` against whatever regions it owns.

`class FilterChips extends Filter` shows the active segment and query as dismissable
`ui-pill` chips — one new piece (`chip_list()`), everything else inherited.

`segments: []` is search-only — the segment row draws nothing, and `predicate()`
narrows by the query alone. This is how [`core/Sidebar`](/framework/core/Sidebar/) uses
it, its first real caller, above a `ux/Tree`: `search_field: "text"` reads a tree node
directly, no reshaping.

## Watch out

- **Not `this.text`.** `View` already has a `text()` getter/setter every instance inherits,
  so a state property of that name silently never writes (`this.text ??= ""` skips — a
  function is never nullish) — [`doc/decisions.md`](/framework/ux/Filter/doc/decisions/) has the trap and the
  fix (`this.needle`).
- **Nested inside something that already has a ground? `chrome: false`.** It drops the
  `.surface.pad` box this draws itself in and changes nothing else — a card inside a rail
  reads as a broken box. `core/Sidebar`'s filter bar is the worked example: `chrome: false`
  plus `.darken-2`, and the field on it comes out white with no colour declared anywhere.
  [`doc/decisions.md`](./doc/decisions.md)
- **No segments, no segment row.** With `segments: []` nothing is drawn where the buttons
  would go — it used to draw an empty box that the parent's own `gap` still pushed the
  field a full gap to the right of (2026-09-19).
- **`.rail` is for a side nav beside one main region** (`Tree`'s explorer). Two peer views of
  the same filtered result — the wall and the table here — want `flex auto` + `--column`
  instead, which splits evenly and wraps on its own.
- **A ux never ships a compact mode** — the `words` child page is the config-word contract,
  not a Filter option.
- **Escape clears the query** — `field()`'s own `keydown` listener, calling the same
  `clear_query()` a chip's × does. Added 2026-09-18 for `core/Sidebar`; every existing
  caller gets it too, with no opt-in.

## More

- [Overview](/framework/ux/Filter/) — the coordinated-regions dashboard · [chips](/framework/ux/Filter/chips/) —
  the named extension · [words](/framework/ux/Filter/words/) — `ui-contrast ui-compact`
- [`doc/decisions.md`](/framework/ux/Filter/doc/decisions/) — the five layout questions, what 3440 needed that
  1280 didn't, the CSS (none minted), the `this.text` trap
- Files: `Filter.js` (the class), `FilterChips.js` (the named extension), `page.js` (the demo)
