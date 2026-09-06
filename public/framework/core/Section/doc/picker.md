# The picker

One control, in the corner, when editing is on. It lists the approved layouts from
[core/Layout](/framework/core/Layout/) and picking one applies it. That is the entire
editing surface of this module.

## It is `ext/Dropdown`, imported

Not copied, and not re-invented. `ext/Dropdown` puts its open list in the browser's
**top layer**, which is the whole reason it was chosen: a section lives inside a demo
stage, a card, a panel or a column, and every one of those is an `overflow: hidden` box
that would otherwise clip the list. Outside-click, Escape and the arrow keys come with
it too.

`Section.Picker` is a subclass — `PageSectionPicker` — and overrides four things:

- **`chosen()`** reads the *section*, so the trigger and the section can never disagree:
  the current layout's title, or the word "layout" when there is none.
- **`open()`** rebuilds the options every time. The list is a function of the box's live
  width, and the box can be resized between two opens — drag a demo's handle and open it
  again to see the list change.
- **`option()`** adds the range to a row, and draws a layout that does not fit as a
  different thing entirely (below).
- **`list()`** adds one class, which caps the list's width — the rows carry a sentence,
  and a top-layer box has nothing to be bounded by.

## The rule it asks: width

`LayoutRule #1` is size, and it is the reason the rules exist at all (the owner,
addendum: *"if a 3440 section is placed within a column, it probably doesn't fit
properly"*). Every layout declares the range it is **proven** at; the picker reads the
section's width live and compares it with the floor.

A layout below its floor is **not offered**. It is drawn as a plain row — not a button —
that says what it needs and what the box actually is:

> Shell · needs 1400px — this box is 899px

It cannot be clicked, cannot be focused, and the arrow keys walk past it, because it is
not an option in the first place. That is deliberate: a disabled button still reads as
something you failed to reach, and a row that only greys itself teaches nothing. The
sentence is the point.

**The ceiling is never asked**, and that is not an omission. Every entry in the catalogue
is proven to 3440, and above its ceiling a layout holds and centres rather than stretching
(the owner, addendum 4) — so a ceiling can never make a layout unfit.

## When nothing fits

At a genuinely narrow width the honest answer is that nothing in the catalogue is proven
there — the narrowest floor on the site is 400px, and a section in a page's own track at
a 400px viewport is nearer 340. The list says so, and says the one useful thing:

> Nothing is proven this narrow — the narrowest needs 400px. Below its floor a layout
> stacks, so this box is already the stack.

Which is true: *below its floor a layout stacks to a named fallback*, and a section with
no layout **is** the stack — its children follow each other down the box. So the empty
list is not a dead end, it is the correct arrangement already being used.

## `fits()` belongs to core/Layout

The one-line check lives in `Section.js` as an exported function:

```js
export const fits = (layout, room) => !room || room >= (layout.widths?.[0] ?? 0) - 1;
```

It is `core/Layout/rules.js`'s first rule with the reporting taken off, and **a second
copy of a rule is one edit away from disagreeing with the first**. It should be
`Layout.fits(width)`, called from both. `core/Layout/` was outside the write fence of the
task that built this module, so it is here instead, said out loud, waiting to be moved.

The `!room ||` guard is load-bearing: a box that has not been laid out yet measures zero,
and a picker that greys the whole catalogue because it was asked too early is a lie.
