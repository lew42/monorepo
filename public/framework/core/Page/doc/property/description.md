A one-sentence subtitle for the page, shown on a card with no thumb.

```js
export default new Page({
    meta: import.meta,
    title: "Dashboard",
    description: "Revenue, signups and churn, one screen.",
});
```

**Usage** — declared on ~30 pages. `nav()` carries it (`Page.class.js:194`), and
`preview_card()` renders it as `.page-preview-desc`, clamped to two lines, on any
card with no thumb (`Page.class.js:250`, styled in `Page.css`).

**Necessity** — yes, now. It was framework-shaped API with no framework behaviour
behind it for a long stretch — declared on ~30 pages and read nowhere — and was
wired up in Aug 2026 (`readme.md`, Decisions: *"description is a card's second
line"*) specifically because a widely-declared, never-read property is the kind
of thing that gets "fixed" three different ways by three different people.

**Simplicity** — one string, one reader, one renderer. **Clamped, not
truncated** — `-webkit-line-clamp: 2` — because a card sets its row's height, and
one long description would deal every card beside it the same dead space.

A thumbed card never shows it: `preview_card()` only renders the description
`if (!thumb && nav.description)`, since a card with a render is already the card
and the description would be a second, competing caption.

## Improvements

1. **This file previously said the opposite of the truth** — that `Page` never
   reads `description` and offered three unapplied options (render it, carry it,
   or delete it). The readme's own Decisions section already recorded that this
   was resolved in Aug 2026; this file was never updated to match. *(simple,
   important — fixed in this pass.)*
