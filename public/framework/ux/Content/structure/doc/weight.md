# Proposal: a page declares its weight

**Not built.** A page says how heavy it is, and every preview of it (an icon card, a tile) takes that size.

```js
new Page({ title: "Servex", icon: "dns", weight: 3, … })   // 1 light · 2 normal (default) · 3 heavy
```

- **One word, three values.** No weight means 2, so every existing page is unchanged.
- **Siblings sort by it.** A parent's previews sort heaviest first, then by the `children:` order, so the author's order still breaks ties.
- **Size, not position, is the signal.** Weight 3 → the large icon card; 1 → the small one.
- **Kept honest:** at most one weight-3 page per group, or nothing stands out.

Alternative considered: computing weight from the page (child count, visits). Rejected for now: it shifts when content grows, and the layout should never jump.
