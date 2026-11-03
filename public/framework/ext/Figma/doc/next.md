# Token sync: what a sync would do, and its first slice

`sync.js` today is only the cold-deep-link reader; it syncs nothing. A real sync would read [tokens/map.json](/framework/ext/Figma/tokens/) (made by `node Server/figma-roundtrip.mjs`) and, for each row marked "same name, same value" or "same role", emit `--fig-x: var(--site-prop)` aliases so the Figma names resolve to the site's tokens instead of their own numbers.

**First slice: DONE 2026-10-13 (60f2eb838)** (`prime ok error warn` now alias `var(--prime)` etc. in `tokens.css`; `node Server/figma-roundtrip.mjs --check` proves it; `surface` stays per-ground because it agrees in Light BG only). Original plan: alias only the colours that already agree by name (`prime ok error warn surface`) inside `FigmaTokens.mjs`, so `tokens.css` stops duplicating them. Spacing stays fixed `--fig-*` until the owner picks fluid or fixed for the Figma Resolution modes; `dark` (`#675F56` in Figma, `#42404B` on the site) needs the same one-line decision. Check with `measure.mjs` that nothing moves at 390, 1920 and 3440.

What the code side needs from Figma next: a decision on dark, on fluid vs fixed, and where the inset, scrim and hairline tokens live (asked by the lists-cards agent).

**Slice 2:** resolve the two same-name colours that differ (`dark`, `light`), then the `text`/`muted`/`accent` role pairs, by changing the Figma variables to the site values through the Figma MCP (direction: [figma-to-framework.md](./figma-to-framework.md#direction-of-the-token-sync-decided-2026-10-13)). Spacing stays fixed until fluid vs fixed is picked.
