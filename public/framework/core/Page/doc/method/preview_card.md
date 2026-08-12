The card shell: an optional thumb, then the label link.

**Usage** — `preview()` (`Page.class.js:173`) and `previews()`'s unresolved-child
fallback (`Page.class.js:167`). It exists to be called from an **override**, which is
why it is public.

```js
preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.layout())); }
```

**Necessity** — yes: it is what keeps a live-thumb card at one line. Without it every
overriding page would retype the `div.page-preview`, the thumb wrapper, the link and the
`card:` class — four chances to drift from the shape `Page.css` styles.

**Simplicity** — two arguments and no options.

- `nav` — `{ url, label, icon, card }`, exactly what `nav_for()` returns. Defaults to
  `this.nav()`, so a bare `page.preview()` works.
- `thumb` — a render function, run while the thumb is capturing. Omitted, there is no
  thumb and the card is the flat icon-and-label row.

**No third `stage` argument**, and this is a deliberate reversal of the deleted
gallery module's `card(nav, thumb, classes)`. The zoom and any padding are
classes on a div the override writes — `() => div.c("zoom-75 pad", render)` — which is
one word longer at the call site and one indirection shorter everywhere else.

⚠ **The thumb is inert** (`pointer-events: none`, `Page.css`). The label is the card's
link, so a live render inside the card would be an `<a>` inside an `<a>` — invalid, and
the browser un-nests it with nothing in the console. `checkered` sits under it, so a
render that paints no background reads as unpainted rather than borrowing the card's.
