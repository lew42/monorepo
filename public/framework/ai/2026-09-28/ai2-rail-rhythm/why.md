# Why the rail's cards ran together

**The cause, in one sentence:** the default padding system works — `--pad-card` gives a card 16px in this rail — but AI 2's rows never used it; they padded themselves by hand at `0.55em 0.7em` (8.8 × 11.2px), because an old comment called a row "a control", and each part of a row used its own made-up margin.

![before](shots/before-ai2-1920.png) ![after](shots/after-ai2-1920.png)

## What each row got, measured at 1920 (rail 351px wide)

| Row | Padding before | Padding after | Space between its parts, before | After |
|---|---|---|---|---|
| Card (`faces.js` `row`) | 8.8 × 11.2px | 16px | 4.8px to the meter, 4.76px to the bar | 5.6px, 5.6px |
| Live (`live.js` `live_row`) | 8.8 × 11.2px | 16px | 2.4px | 5.6px |
| Group (`page.js` `group_face`) | 8.8 × 11.2px | 16px | 4.8px | 5.6px |
| Real page (`real.js` `page_face`) | 8.8 × 11.2px | 16px | 0px to the path | 5.6px, 5.6px |
| Note | 8.8 × 11.2px | 16px | 4.76px | 5.6px |

**Which rule set it:** `.ai2-row { padding: 0.55em 0.7em }` in `ai2/ai2.css`, `@layer theme`. Nothing overrode it; no util-layer rule was involved in the padding.

**Three more things made it read as a mess:**

1. **Titles used prose leading.** The theme sets `line-height: 1.8` for body text, so a seven-line title stood 201px tall and looked like a paragraph. Titles now use 1.35 (155px for the same title).
2. **The dot, icon and time were centred on the whole title,** so on a long title the time floated in the middle. They now sit on the first line.
3. **The gaps followed the window, not the rail.** `--gap` is measured in `cqi`, and with no container it reads the window: the same 351px rail got a 24px gap at 1920 and 43px at 3440. `.ai2-rows` is now a container, so the gaps follow the rail.

## Two traps met on the way

- `framework.css`'s `.flex > * { margin: 0 }` is in `@layer util`, so it silently zeroed a margin on the dot. The dot moves with `top` instead.
- `--gap-35` is re-computed in every element's own font size, so a smaller-type part got a smaller step (4.76px against 5.6px). The step is now computed once on the row, as a registered length (`--ai2-step`).

## Also fixed

The Live card's "Assistant" fold touched the pane's edge at 400 and 1280 (`Server/padding-check.mjs`). It is now inset by the same `--pad` as the sections above it; clean at all four widths.

## No shared CSS changed

`framework.css` and `styles/` are untouched, so the three shared pages were not re-shot.
