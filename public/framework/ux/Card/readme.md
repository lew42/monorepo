# Card — the look of an AI card's own page: a head, an outline, a properties sidebar

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
- **The right column is properties, not a second chat** (one-card-props, 2026-10-03): type,
  status, tags, who worked on it, its files, then Actions — `card.js` `properties_sidebar()`.
  Nothing here is talked into; talking happens in the ONE global drawer (`ext/drawer/`), the
  same on every page (CLAUDE.md law 6). `--ai2-chat` is still the one token both the old chat
  column and this one size by, so the drag-to-resize seam still works unchanged.
- **A sub-card opening a real second column needs a working `content()`.** The two detail
  columns (`ux/Inbox/Inbox.css`'s `.inbox-detail` + `.inbox-sub`, made equal width here,
  2026-10-03) only fill in when a card's own `Card.content()` actually runs and sets
  `this.$pages = shell.$sub` — and that method is SKIPPED WHOLE, not partway, the moment a
  card's `page.jsonl` carries a top-level `{"content": …}` line (core's own generic
  content-List feature, `page_add()`/`render_content_list()`): `content` ends up a plain data
  List on the instance, shadowing the `content()` method outright, the same trap class
  CLAUDE.md's `render` example warns about. The Now card (`ai/now/`) hits this today — its
  sub-card still opens as a full-width takeover, not a second column — because its own
  dashboard is built entirely from `content.add` lines. Fixing it means teaching `Card.assign()`
  to protect `content` the way `VERBS` already protects `type`/`tags`/`status`, without
  breaking Now's own list; not done here (out of fence, a core/Card.js change wider than this
  task's $10 budget) — verified instead on an ordinary task card, where both columns show
  correctly at equal width.

## More

- [`Card.css`](./Card.css) — the whole file, moved verbatim from `ai2.css`
  ([`ai/2026-09-30/inbox-ext/`](/framework/ai/2026-09-30/inbox-ext/), merge 7)
- [`ai2/readme.md`](/framework/ai2/) — the module that still draws a card, and what is left
  in `ai2.css` now that this file carries everything reusable
- [`ai2/doc/cards.md`](/framework/ai2/doc/cards.md) — a card folder's full vocabulary
- [`ai2/doc/columns.md`](/framework/ai2/doc/columns.md) — how the Live card splits into
  columns on a wide screen
