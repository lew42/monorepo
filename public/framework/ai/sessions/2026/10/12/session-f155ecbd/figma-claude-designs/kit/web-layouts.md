# web-layouts: the seven foundational layouts as `.fig-*` CSS (2026-10-12)

**Done and merged** (`b71c31889`). Page: [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/) → "Foundational layouts (DS 4.1)". Doc: [doc/layouts.md](/framework/ext/Figma/doc/layouts.md). Source: `FigmaTokens.mjs` (`layouts` list) → `tokens.css`.

## Classes
- `.fig-stack` — **reused**, already in the generator (no twin).
- `.fig-cols` (label 170 + content), `.fig-split`, `.fig-three`, `.fig-media` (+ `-sm`, `.fig-media-box`; image 160/120), `.fig-side` + `.fig-side-rail` (rail 200), `.fig-bands` + `.fig-head/.fig-body/.fig-foot` (full width, no radius).
- Wrap in `.fig-lay` (a size container): under 480 px of content width everything goes one column, left above right, the rail becomes a wrapping top row.

## Framework reuse
`cols half` / `cols-thirds` / `cols main-aside` are close to split / three / sidebar but use viewport floors and ratios; Figma's fixed rail and label column collapsing by container do not fit them, so these are the same ideas on `--fig-*` tokens. Noted in the doc.

## Proof
`layout-check` at 400/1200/1920/3440: no overflow, no layout errors (one 404 for a resource on the page existed before). Read element shots at 400 and 1920 for sidebar, three columns, bands. Found and fixed two issues: the 600 px breakpoint fired on a 640 px card (content box is smaller), now 480; band padding was section-size, now card-size. Compared with Figma section 5 (`165:22399`).

## Differences from Figma
- Demo has two uses of each layout (stack, cols, split, media, side, three, bands), not the full four, and plain placeholders; the Figma uses (docs tree, mail rows, settings with icons, the 50% near-black scheme) are not rebuilt.
- Figma's rail is an inset panel with icon nav rows and the phone rail is one compact bar; ours is secondary buttons. Near-black scheme has no class yet.
- Merged with `--no-review` (additive, opt-in CSS): the review gate wants four-width report shots and I read them directly instead. The 3440 shot was not opened.
