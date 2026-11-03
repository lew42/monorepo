# Inbox architecture — a rail that never jumps, built from one class

The Inbox is a rail of row previews beside the page you picked. Its main class is `Rail` ([`Rail.js`](/framework/core/Page/ext/Inbox/Rail.js)), and subclasses override one method at a time (`class AIRail extends Inbox.Rail`). The page that holds it is [`Inbox.js`](/framework/core/Page/ext/Inbox/Inbox.js) (`class Inbox`, which owns the rail and the small note box). The styles are in [`Inbox.css`](../Inbox.css). Demo: [/framework/ux/Inbox/](/framework/ux/Inbox/).

## One class, two views, no cycle

**Decided:** `Rail.js` imports nothing from `Inbox.js`. `Inbox.js` imports `Rail.js` and attaches it as `Inbox.Rail`.
**Why:** if the rail imported the inbox back, the two files would form an import cycle, and a cycle breaks on a deep reload.
**Instead:** moving the whole rail body into `Inbox.js` (one file, but the rail could no longer be imported alone).
**Detail:** [InboxRail-notes.md](/framework/core/Page/ext/Inbox/doc/InboxRail-notes.md#architecture-moved-from-readmemd-2026-10-13-verbatim-before-and-after-restructured-2026-10-02)

## Every part is a method a subclass can override

**Decided:** each piece of the rail (`face()`, `row_head()`, `head_extra()`, `archive()`, `is_read()`, `visible()`) is its own method. A subclass overrides the one it needs and inherits the rest.
**Why:** the AI rail, the sample page and the Log tab differ in one or two places, and copying the whole rail would fork the fixes.
**Detail:** [Rail.js](/framework/core/Page/ext/Inbox/Rail.js) (the method list is at the top of the class)

## The score floor hides low rows, but never new ones

**Decided:** rows scoring under `min` (default `Rail.FLOOR = 90`) are hidden. A row under 30 minutes old (`Inbox.FRESH_MIN`) is always shown, and the `fyi` chip turns the floor off. `?min=` in the URL changes the floor, and `?min=0` shows everything.
**Why:** the inbox is meant that stays near zero ("inbox zero"). A fresh low-score row would otherwise vanish the moment it arrives.
**Detail:** [Rail.js `visible()`](/framework/core/Page/ext/Inbox/Rail.js) · [Inbox.js `fresh()`](/framework/core/Page/ext/Inbox/Inbox.js)

## The order never moves while you look

**Decided:** a row that changes is only counted on the "N updated" pill. The list re-sorts when you press the pill (`flush(true)`), not on a timer.
**Why:** a list that re-sorts under the cursor makes the reader lose their place.**Detail:** [Rail.js `pending_ids`](/framework/core/Page/ext/Inbox/Rail.js)

## A row is a real link

**Decided:** each row is an `<a>` pointing at `<page url>/<id>/`. The Router navigates it and marks it `.active`.
**Why:** Back and reload then land in the same place, with no hand-drawn selection to keep in sync.
**Detail:** [Rail.js `a.c("inbox-row")`](/framework/core/Page/ext/Inbox/Rail.js)

## Opened rows go to the detail column, and sub-pages to the third

**Decided:** a row's page opens in `page.$pages` (the detail column). A sub-page opens in `page.$sub`.
**Why:** these are core's own names for child-page columns, so the rail uses the same slots as the rest of the page system.
**Detail:** [Rail.js `$pages` and `$sub`](/framework/core/Page/ext/Inbox/Rail.js)

## Archive sets a status, it never deletes

**Decided:** archiving sets `status: "archived"` on the row. Archived rows stay in the data and reappear under the archived chip or a search.
**Why:** the data-integrity rule: nothing is removed, so the log stays whole.
**Detail:** [Rail.js `archive()`](/framework/core/Page/ext/Inbox/Rail.js)

## Flush-stack: one box, outer corners only

**Decided:** `.flush-stack` makes its children touch, with no gap and no padding. Only the outer corners are rounded, by `--flush-radius` (square by default).
**Why:** a list of rows should read as one box, not as separate cards.
**Detail:** [Inbox.css](../Inbox.css)
