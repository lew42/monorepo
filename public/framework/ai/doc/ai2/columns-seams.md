# Columns and seams — one layout for every card

**The chat is the right-hand column.** Every card, top-level or a sub-card at any depth, is drawn by the same `Card.content()`: the card's body, then its chat. The layout rules are the last block of `ai2.css`.

| Window | What you see |
| --- | --- |
| under 40em (a phone) | one screen at a time; the chat is the card's footer; a sub-card's own breadcrumb (every ancestor above it) is the way back |
| 40em and wider, no sub-card open | card \| chat — the chat is a third of the room right of the rail |
| 40em and wider, one sub-card open | card \| sub-card — now EQUAL columns (not thirds); each still shows its own chat beside it |
| 40em and wider, two or more sub-cards open | the top-level card steps aside; the sub row itself splits into its own last-two, equal columns — a breadcrumb on the earlier one names every level hidden above it |

- **The window decides, never the column.** The chat used to switch on the column's own width (a container query at 60em). Opening a sub-card halves that column, so the chat jumped to the bottom exactly when you opened something. The window's width does not change when a sub-card opens.
- **One scroll area for the chat.** Its log scrolls (ext/Chat's smart scroll, [`ext/Chat/doc/scroll.md`](/framework/ext/Chat/doc/scroll.md)); the box you type into grows under it and the log gives up the room.
- **Only the last two open levels are ever on screen, any depth** (subcard-columns, 2026-10-03 — [`ai/sessions/2026/10/03/27c6d3f8-966a-4f02-af7e-adca62396810/subcard-columns/`](/framework/ai/sessions/2026/10/03/27c6d3f8-966a-4f02-af7e-adca62396810/subcard-columns/)). Every open card, top-level or a sub-card at any depth, mounts in the SAME shared row (`shell.$sub`); a util-layer CSS rule in `Card.css` shows exactly the last two of that row (`:nth-last-child(… of …)`, the same selector proven at [`/versus/css/`](/framework/core/new/1/site/versus/css/)), equal width. A sub-card's own `breadcrumb()` (`card.js`) lists everything opened before those two, oldest first; CSS shows it only on the earlier of the two visible columns, or on the one card a phone shows at all.
- **Default widths.** The CARD | CHAT split is `33.333%` of a top card's page, or `50%` of a sub-card's page (its own column is narrower, same fraction of the room). The SUB-CARD | SUB-CARD split (the two visible levels, above) defaults to equal, `1fr` each. Floor on the chat: `18rem`. Measured (card|chat): 437px of 1313px at 1920, 919px of 2757px at 3440.
- **Seams.** Each seam is the site's own `ext/grip`, made by `Card.seam()` in `card.js`, and each moves only the two columns beside it. The card | chat seam writes `--ai2-chat` (one token: only one chat is ever on screen). The SAME `--ai2-subw` token drives BOTH the one-sub-open shell grid and the two-or-more-deep sub row's own inner grid (they are never both on screen at once, so one token is enough); while you drag it, the chat is held at its current width, so only the two card columns change. Only the deepest card's own grip is ever live — an earlier, still-visible one would sit at the row's outer edge, where dragging would mean nothing. Double-click puts a seam back; the width you drag to is remembered in localStorage.
- **The Live card has its own grid** and none of this applies to it.

Why each choice, with the alternatives: [`ai/sessions/2026/09/25/layout-unify/layout-unify/`](/framework/ai/sessions/2026/09/25/layout-unify/layout-unify/) (the chat split) and [`ai/sessions/2026/10/03/27c6d3f8-966a-4f02-af7e-adca62396810/subcard-columns/`](/framework/ai/sessions/2026/10/03/27c6d3f8-966a-4f02-af7e-adca62396810/subcard-columns/) (the sub-card column window).
