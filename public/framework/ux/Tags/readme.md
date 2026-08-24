# Tags — a chip row you can extend: `ui/tags`'s × and field, wired

`ui/` owns `.ui-pill` and `.ui-tags-input`; this owns the list, `add()`/`drop()`, and the
one wire — everything the template's own page said was inert on purpose.

## Use
```js
import Tags from "/framework/ux/Tags/Tags.js";

const t = new Tags({ tags: ["core", "no-build"], onChange(tags){ … } });
t.add("esm");    // type-to-add — Enter in the field calls this too
t.drop("esm");   // x-to-remove — the chip's × calls this too
```
`tags` is a plain array of strings; the caller still owns it. `draw(tags)` re-renders
from fresh data, the `Tree`/`Filter` precedent.

## Watch out
- **Not `remove()` — `drop()`.** `View.remove()` detaches an element from its own
  parent; a method named `remove(name)` here would silently shadow it, so removal by
  name is `drop()` instead — [`doc/decisions.md`](/framework/ux/Tags/doc/decisions/).
- **A chip's data property is `value`, never `name`.** `View.classify()` stamps
  `this.name` as an extra CSS class when it's set — a chip holding its text as `name`
  would silently wear the tag's own text as a class. Found and dodged here; the bar for
  every future part that carries a plain string.
- **`ui/` must never import this.** Imports flow down — [`ux/doc/system.md`](/framework/ux/doc/system/)

## More
- [Overview](/framework/ux/Tags/) — type-to-add, x-to-remove, live · [words](/framework/ux/Tags/words/) — the same editor under `ui-contrast ui-compact`
- [`doc/decisions.md`](/framework/ux/Tags/doc/decisions/) — the split argued, the `classify()` name trap in full
- [`ui/tags`](/framework/ui/tags/) — the template half · [`ux/`](/framework/ux/) — the tier
- Files: `Tags.js` (the class + `Tags.Chip`, the one real part)
