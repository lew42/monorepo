# Reuse — could an existing row just wear `.item`?

The brief's rule: "reuse, don't add a fourth tree" — study what already draws an icon-plus-name
row, and say where `.item` could replace one CHEAPLY, without restyling anything this pass. Four
modules looked at; one is a good, cheap fit; one is a fit with a real behavior cost; two are not
a fit at all. Nothing below was changed — `ux/Tree`, `ext/files` and `ux/Content/Disclosure` are
all still exactly what they were before this task.

## Good, cheap fit: `ux/Content/Disclosure`'s own row

[`Disclosure.js`](/framework/ux/Content/Disclosure/Disclosure.js) already builds almost exactly
what `ui/item`'s branch case builds — a `<summary>` holding an icon and a title, native
expand/collapse, no script:

```js
summary(() => {
	if (it.icon) icon(it.icon);
	span.c("ux-content-title", it.title);
});
```

That is `.item`'s row, hand-written a second time with different class names. Swapping
`summary.c("ux-content-disclosure", ...)`'s inner two lines for `summary.c("item", () => { icon;
name; })` would cost one small edit and gain the caret and the icon/name alignment work already
done here — Disclosure's own `stack`/`gap`/`box`/`scheme`/`marker` words all live on the
CONTAINER, not the row, so they would still work unchanged. **Left undone this pass** because the
brief says keep v1 of anything reachable reachable, and Disclosure's five new words are still
being built (its own `variants/` page, landed the same week) — a good next task, not a same-task
edit to a module in flight.

## A fit with a real cost, not a free one: `ext/files`' tree

[`files.js`](/framework/ext/files/files.js)'s rows (`.file-name`, `.file-dir-name`) are visually
the same idea — an icon, a label, a folder that opens — but the OPEN/SHUT state is not native:
`rows()` toggles a `.file-dir`'s own `open` CSS class by hand, in a click listener that ALSO has
to know not to fire when the click was really a row selection (`show()`, which reads
`e.target.closest(".file-name")` on the whole tree). Swapping the folder row for `.item`'s
`<details>`/`<summary>` branch would mean the BROWSER now owns open/shut, which is a real rewrite
of that click-routing, not a class swap — `.item`'s classes could still be worn on the leaf
`.file-name` rows for the icon/name look with no behavior change at all, cheaply, but the folder
rows are where the real saving would be and also where the real work is. **Left as a finding**,
not a fix: worth a task of its own, not a drive-by inside this one.

## Not a fit: `ux/Tree`

[`Tree.js`](/framework/ux/Tree/Tree.js)'s row carries drag (a grip), a star "default" mark, `+`/
`×` act buttons, a roving tabindex and a live selection class — five things `.item` does not have
and was never asked to. The two ALREADY share the one idea that transfers for free — a caret and
an icon share one square frame, centred with `line-height: 1` — because this module copied that
exact reasoning from `ui/tree/tree.js`'s own comment rather than reinventing it. Actually wearing
`.item` on a `Tree` row would mean either giving `.item` all five of those extra slots (turning a
one-line component into a tree-editor component) or stripping them from `Tree` (a real feature
loss, not a refactor). Neither is "cheap," so this stays untouched.

## Not a fit: `ux/Content/Concepts`

[`Concepts.js`](/framework/ux/Content/Concepts/Concepts.js)'s tiles (`a.c("btn ux-content-tile")`)
are icon-over-or-beside-name cards in a WRAPPING GRID — "what a page is made of," meant to be
scanned as a wall, not read down as a list. `.item` fills its row and reads top to bottom by
design; forcing it into a tile grid would fight that default on every tile. Different shape for a
different job — left alone.

## The one-line summary

Only `ux/Content/Disclosure` is a same-pass-cheap swap, and it wasn't touched because the module
is mid-build elsewhere this week. `ext/files` is worth doing, at the cost of a real behavior
rewire. `ux/Tree` and `ux/Content/Concepts` are not `.item` candidates at all — they solve
different problems that happen to also involve an icon and a name.
