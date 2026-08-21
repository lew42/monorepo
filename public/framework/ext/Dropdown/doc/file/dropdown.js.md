## dropdown.js

`Dropdown`, and the `dropdown()` door that builds one under whatever is
capturing. A trigger showing the current option's picture and name, and a list
that opens in the browser's **top layer**.

```js
dropdown({ options, value, title, pick });   // → the View, already appended
new Dropdown({ options, value, pick }).draw();
```

## `popover` is the module

```js dropdown.js
div.c("dropdown-list").attr("popover", "auto")
```

That one attribute is why this file exists. An open popover is promoted to the
top layer — painted above the whole document, outside every `overflow: hidden`
ancestor, with no z-index war — and `auto` brings **light dismiss** and
**Escape** with it, so neither is code here.

⚠ The list stays a **child** of `.dropdown`, never `document.body`. The DOM that
built it takes it away; `ext/Panel`'s rail rebuilds on every change, and a
body-appended list would leak one detached element per rebuild. Top layer is a
painting concern, not a DOM one.

## `place()` is the price

A promoted box has no containing block, so `left`/`top` are measured off the
trigger and written as `position: fixed`. Below it, or above when there is no
room below, clamped to the viewport either way — a dropdown in the last row of a
rail opens upward and is whole. Zeroed first, so the rect it is placed from is
the list's own size and not wherever it last sat.

⚠ It runs **once per open**. Scroll the page with a list open and it stays put.
A `scroll`/`resize` re-place is four lines and has not been needed. CSS anchor
positioning would replace the whole method once it is everywhere.

## Escape is not left to the browser

```js dropdown.js
if (e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); this.close(); return this.$trigger.el.focus(); }
```

`ext/Panel`'s `focus.js` drops the panel selection on Escape. A list dismissed by
the popover's own close watcher took the selection — and the rail the list was
drawn in — with it.

⚠ And the lit option is focused with `preventScroll`, then
`scrollIntoView({ block: "nearest" })`. A bare `focus()` on an option low in a
29-entry list scrolled the first rows above the box, so `cells` was out of sight
the moment you opened the template picker on `toc`.

## A picture is a name OR a function

`face()` takes `icon: "view_column"` (a Material ligature) or `icon: fn` (a
drawing — a swatch, a diagram). Those are the two forms `ext/Panel`'s `glyph()`
already hands out, so a tone's colour chip works here unchanged. A `T` entry — an
*object* carrying an icon — is not one of them: the caller unwraps it.
