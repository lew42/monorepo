# Proposal: page weight, and a page with no wrapper

**Not built.** A page says how heavy it is, and every preview of it (an icon card, a tile) takes that size.

```js
new Page({ title: "Servex", icon: "dns", weight: 3, … })   // 1 light · 2 normal (default) · 3 heavy
```

- **One word, three values.** No weight means 2, so every existing page is unchanged.
- **Siblings sort by it.** A parent's previews sort heaviest first, then by the `children:` order, so the author's order still breaks ties.
- **Size, not position, is the signal.** Weight 3 → the large icon card; 1 → the small one.
- **Kept honest:** at most one weight-3 page per section, or nothing stands out.

Alternative considered: computing weight from the page (child count, visits). Rejected for now: it shifts when content grows, and the layout should never jump.

## Can a page wrap a small unit with no wrapper of its own?

**Yes, and Page already does it once.** In the columns shape, every nested page is `display: contents` ([core/Page](/framework/core/Page/), the COLUMNS block of Page.css): its box is removed from layout, so only its content is laid out. The same idea as a word would be `new Page({ bare: true })` → `.page.bare { display: contents }`. A list would then be a real page (its own URL, title, weight, comments) while its `ul` is the only box on screen, so the default page padding and grid never fight it.

The price, measured by the columns work: a `display: contents` element has no box, so it cannot carry a background, padding, a border, or a pointer event (Page.class.js puts the column seam beside it for exactly this reason). A bare page therefore always has **no background**, which is the right answer for a small unit anyway. Not built: it is a core Page change, so it waits for the owner's yes.
