# The ask (verbatim, from the owner via vscode-mastermind, page-item mastermind queue item 1 of 2)

> A reference content item: a content row can BE a page reference, drawn as that page's dark
> class card (its icon + title, the #Mention class-card look) with the row's own text/sub-items
> under it, the card itself linking to the page. Wire:
> `{"content":{"add":{"id":"page","ref":"/framework/core/Page/","text":"..."}}}`. Then the Now
> card's AI / Page / Servex sections become ref rows (I'll convert them, or you do).

## Scope fence

- `core/Page/Page.class.js` — the `ref` row-rendering branch in `render_content_list`/`draw_row`.
- `ext/Mention/Mention.js` — export the existing class-card build so Page.class.js reuses it
  (no new card component). Do NOT touch `ext/Mention/sync.mjs` or `maps/refs.js` generation —
  a sibling task owns the indexer.
- `/framework/ai/2026/10/03/now/page.jsonl` — convert the AI / Page / Servex content rows to
  `ref` rows once the feature renders.

## Decisions made without asking (Law 5)

- Reused `ext/Mention`'s `item(...).ac("page-surface-dark")` dark card look exactly — exported
  `ref_entry(url)` and a generalised `build_row(name, entry, extraClass)` from Mention.js instead
  of writing a second card component (Law 6: one of everything).
- Dropped the `inline mention` sizing modifier for the content-row case (kept just `mention`) —
  the inline tightening in Mention.css is for a card sitting mid-sentence; a standalone content
  row card uses the ordinary `.item` row height, same dark paint.
- "sub-items under it" is the row's own `text` (markdown, which may itself contain a bullet
  list) — the content List here is flat, there is no second nesting concept to build.
