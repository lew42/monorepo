**Usage** — one live caller: `toggle()` (`View.js:348`). Nothing else in `public/`.

**Necessity** — only as `hide()`'s inverse.

**Simplicity** — right-sized, and note what it does *not* do: it clears the inline
`display` rather than setting `block`, so the element falls back to whatever CSS
says. That is the correct choice and the reason a hidden `.flex` comes back as a
flex container rather than a block.

