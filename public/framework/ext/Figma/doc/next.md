# Token sync: what a sync would do, and its first slice

`sync.js` today is only the cold-deep-link reader; it syncs nothing. A real sync would read [tokens/map.json](/framework/ext/Figma/tokens/) (made by `node Server/figma-roundtrip.mjs`) and, for each row marked "same name, same value" or "same role", emit `--fig-x: var(--site-prop)` aliases so the Figma names resolve to the site's tokens instead of their own numbers.

**First slice (do this):** alias only the colours that already agree by name (`prime ok error warn surface`) inside `FigmaTokens.mjs`, so `tokens.css` stops duplicating them. Spacing stays fixed `--fig-*` until the owner picks fluid or fixed for the Figma Resolution modes; `dark` (`#675F56` in Figma, `#42404B` on the site) needs the same one-line decision. Check with `measure.mjs` that nothing moves at 390, 1920 and 3440.

What the code side needs from Figma next: a decision on dark, on fluid vs fixed, and where the inset, scrim and hairline tokens live (asked by the lists-cards agent).
