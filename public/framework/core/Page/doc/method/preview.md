**THE card** — one shape, and the only override point.

**Usage** — `previews()` calls it once per resolved child (`Page.class.js:194`), passing
that child's entry from `nav_for()`. Five sandbox pages call it bare and three of those
override it: `alex/examples/subpage/page.js:14`, `path-2/page.js:18,20,24`,
`path-2/a/page.js:22`, `path-2/b/page.js:22`.

```js
// the default — icon, label, the whole card clickable
preview(nav){ return this.preview_card(nav); }

// a page that wants a live render of itself in the card
preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.layout())); }
```

**Necessity** — yes, and it is the piece that was missing. *Each child renders its own
`preview()`; each parent renders its own `previews()`* — so a page decides how it looks
in someone else's list, and the list decides only where the cards sit.

**Simplicity** — one line, because the shell is `preview_card()` and the label is
`preview_link()`. That split is the whole point: an override is a line, and it cannot
drift from the default card's markup because it *is* the default card's markup.

**Passing a thumb changes the card's look, not just its contents.** A thumbed card
renders bare — no surface, no border, no inset, and no checkered board under the
render — because the render is already the card. The plain no-thumb card keeps its
chrome. Nothing to opt into: `Page.css` asks `:not(:has(> .page-preview-thumb))`.
The small label stays below the thumb in both, because it is the anchor.

**`nav` is optional.** Without one it falls through `preview_card()` to `this.nav()`, so
`page.preview()` on its own still works — that is what the sandbox call sites do.

⚠ **A thumb must render synchronously.** `preview_card()` runs the callback while the
thumb is capturing; a factory call after an `await` lands somewhere else entirely.
Return a promise, or fill a container inside `append(fn)`. `core/View/doc/capturing.md`.
