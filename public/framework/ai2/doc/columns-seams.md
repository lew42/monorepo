# Columns and seams — one layout for every card

**The chat is the right-hand column.** Every card, top-level or a sub-card at any depth, is drawn by the same `Card.content()`: the card's body, then its chat. The layout rules are the last block of `ai2.css`.

| Window | What you see |
| --- | --- |
| under 40em (a phone) | one screen at a time; the chat is the card's footer |
| 40em and wider, no sub-card open | card \| chat — the chat is a third of the room right of the rail |
| 40em and wider, a sub-card open | card \| sub-card \| chat — thirds; the chat is the deepest open card's, the parent card's chat steps aside |

- **The window decides, never the column.** The chat used to switch on the column's own width (a container query at 60em). Opening a sub-card halves that column, so the chat jumped to the bottom exactly when you opened something. The window's width does not change when a sub-card opens.
- **One scroll area for the chat.** Its log scrolls (ext/Chat's smart scroll, [`ext/Chat/doc/scroll.md`](/framework/ext/Chat/doc/scroll.md)); the box you type into grows under it and the log gives up the room.
- **Default widths.** The chat is `33.333%` of a top card's page, or `50%` of a sub-card's page, because the sub-card column is `2fr` of the room. Both are the same third, so opening a sub-card moves only the card. Floor: `18rem`. Measured: 437px of 1313px at 1920, 919px of 2757px at 3440.
- **Seams.** Each seam is the site's own `ext/grip`, made by `Card.seam()` in `card.js`, and each moves only the two columns beside it. The card | chat seam writes `--ai2-chat` (one token: only one chat is ever on screen). The card | sub-card seam writes `--ai2-subw`; while you drag it, the chat is held at its current width, so only the card and the sub-card change (measured: 437 → 562 and 437 → 312, chat 437 → 437). Double-click puts a seam back; the width you drag to is remembered in localStorage.
- **The Live card has its own grid** and none of this applies to it.

Why each choice, with the alternatives: [`ai/2026-09-24/layout-unify/`](/framework/ai/2026-09-24/layout-unify/).
