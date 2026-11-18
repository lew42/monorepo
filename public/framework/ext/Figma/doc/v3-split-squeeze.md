# Lew42 v3: Split squeeze (exploration, 2026-11-18)

**The problem.** On the 1920 Desktop wrapper, a "2 columns" row holds two Default cards side by side, 50/50 with no gap. Default padding (64) is smaller than Desktop padding (80), so the text edges of the two halves don't line up with the full-width Desktop card above. The owner calls it an edge case but wants a solution. His words: [owner-words-2026-11-18.md](./owner-words-2026-11-18.md).

**Where it is:** the [Split squeeze page](https://www.figma.com/design/JYGQX0WaBO4HcGMZTkL2rx/Lew42-v3?node-id=21-3) (`21:2`, right after Proposal). It has three stages, each a full-width Desktop card above a split, with red guide lines where the text edges should land. Every card is an instance of the owner's Card (`2:110`); none of his masters were changed.

## The three setups

The text edges were measured by script. In every stage, the edges of the card above and of both halves land exactly on the guide lines.

| Stage | How it works | Text edges | New token? |
|---|---|---|---|
| **A · Squeeze split** (`21:8`) | Desktop card: left and right padding 160 = (1920 − 1600) / 2. Row: Scale mode Default. Left half: left padding 160. Right half: right padding 160. The centre sides keep Default `pad` (64). | 160 / 1760 | 160 is typed by hand. A Constants `squeeze-margin` = 160 would make it a token. Not created. |
| **B · Easiest fallback** (`21:62`) | No squeeze. Each half's outer padding is overridden to 80 (the Desktop pad value). | 80 / 1840 | 80 is typed by hand: inside a Default card `pad` is 64, and no token is 80 at Default. |
| **C · Tokens only** (`21:109`) | No Scale mode on the row, so the halves stay at Desktop and their padding is Desktop `pad` (80) on all sides. Default is set on each half's Content and Frame 1 instead. | 80 / 1840 | None. Text and buttons are Default size; the padding and the gap above the buttons (60) stay Desktop. |

**Recommendation:** use C today, because it is exact and uses only existing tokens. If you want the 1600 squeeze, use A, with 160 typed in or one new token.

## Why padding, not his Max width recipe

The owner's past solution set each half's content to Max width = squeeze/2 − pad (736), aligned toward the centre. Figma refuses that on instances: setting Max width on a layer inside an instance throws "This property cannot be overridden in an instance: max-size". So his recipe works only in two cases:
- on a detached card;
- if the Card master's Content and Frame 1 carry a Max width themselves. That would need a new Scale token, such as `split-max` = squeeze/2 − pad (Mobile 758, Default 736, Desktop 720).

Outer padding gives the same edges, and padding is something an instance can override.
