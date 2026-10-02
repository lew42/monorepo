# Card — the look of an AI card's own page: a head, an outline, a chat column

See it: **[the demo](/framework/ux/Card/)** — a card's head (icon, title, the "Reviewed ✓"
control), its outline (a checklist of what was asked and delivered), and one "Live"-style
row, the same look whether the card opens at
[`/framework/ai/<card>/`](/framework/ai/) or [`/framework/ai2/<card>/`](/framework/ai2/).

## Use

This module is `Card.css` alone — every rule a card's own page needs that has nothing to
do with being "AI 2" specifically: the card grid, its measure, the cost table, the outline
rows, card folders, the Live card and talking to a running agent, the tiny-tabs layout. The
**class** that actually draws a card — reads its `page.jsonl`, decides what tab is open,
appends a chat line — is still [`ai2/card.js`](/framework/ai2/card.js); this module exists
so the CSS a card wears is not locked inside the AI 2 module, the way `ux/Inbox/Inbox.css`
freed the rail's look from `ai2/rail.css`. A future module that draws its own card-shaped
page (the owner's "any page could have an inbox" plan) loads this file and gets the same
look for free.

```js
import { View } from "/app.js";
View.stylesheet("/framework/ux/Card/Card.css");
```

Every class starts `ai2-` for now — renaming them is a separate, larger task (every one is
also a live selector in `ai2/card.js`, `tasks.js`, `outline.js`, `faces.js`, `live.js`,
`agents.js`, `activity.js` and `real.js`); this move only changes which FILE the rules live
in, not their names. `ai2.css` keeps the few classes that are genuinely AI-2-only (the old
Log tab's rows) and this file's own `@keyframes ai2-pulse`, which two of its rules still use
— see that file's own header comment for why the keyframe stays there.

## Watch out

- **This is a CSS move, not a new class.** Nothing here is a `class … extends View` yet —
  the behaviour (reading a card's log, drawing its tabs) stays in `ai2/card.js` until that
  logic itself is pulled out of the AI 2 module, a separate task.
- **`Card.css` stands alone.** Load it by itself and a card looks right, its live pulse included.
- **A card is a grid of exactly three named rows** (`.ai2-back`, `.ai2-full`, `.ai2-foot`) —
  a region hidden at some width must still name its row, or the others shift up and the
  footer inherits the wrong track (`ai2/doc/decisions.md` has the measured regression).

## More

- [`Card.css`](./Card.css) — the whole file, moved verbatim from `ai2.css`
  ([`ai/2026-09-30/inbox-ext/`](/framework/ai/2026-09-30/inbox-ext/), merge 7)
- [`ai2/readme.md`](/framework/ai2/) — the module that still draws a card, and what is left
  in `ai2.css` now that this file carries everything reusable
- [`ai2/doc/cards.md`](/framework/ai2/doc/cards.md) — a card folder's full vocabulary
- [`ai2/doc/columns.md`](/framework/ai2/doc/columns.md) — how the Live card splits into
  columns on a wide screen
