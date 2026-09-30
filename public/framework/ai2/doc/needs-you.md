# Needs you — a rail on the left, one item's own answer on the right

![The Needs you tab: a rail of ranked rows on the left, the selected item's full question and its answer control on the right](/framework/ai2/doc/img/needs-you-1920.png)

**It looks like the Inbox now** (the owner, 2026-09-30: "Needs you should look like the
Inbox"). The default view, at the bare `/framework/ai2/` url, is a RAIL of short rows on the
left — the Inbox's own row shape, width, padding and icon size (`faces.js`'s `row()`, reused,
not rebuilt) — and the selected item's full question and its answer control fill the right. The
OLD one-column list — every row its own big answer box — is still there, one click away, at
`?v=1`; the new view has a small "list view" link to it, and the old list has a "rail view" link
back, so neither is a dead end. Deliberate, not a Router navigation: `needs.js`'s `needs_shell()`
owns this one query-string toggle itself (the Router never redraws a page for a query-only url —
see its own comment on `go_query()`).

**What it lists.** Every card that is still waiting on you: an unanswered Decision or Question
placed on a card (`ux/Content`'s widgets), a card typed `"question"`, or a card whose own last
message ends in "?" — read straight off the same card logs every other AI 2 view already reads,
so nothing new has to be built to keep the list current. It never lists a `done` or `archived`
card. **Every STALLED line in the asks ledger** (`/framework/ai/asks.jsonl`, `Servex/asks/`) is
in the list too — an ask whose owner agent went quiet, silent more than 2 hours or stopped
outright — shown in the rail with who owns it and how long it has been silent, and in the detail
pane with why it stalled and three links: its card, its own words, and the whole
[ledger](/framework/ai/asks/).

**The selection is the url.** Clicking a row opens it on the right, and the url gets
`?need=<card>/<ask>` (`?need=ask:<id>` for a stalled ask, which often has no card at all) — so a
reload or the Back button lands on the same item, the same reason every other AI 2 address works
that way. Nothing selected yet: the top-ranked row opens on its own.

**The rest of the list fills the rest of the screen.** One short question, alone, left most of a
3440 screen empty — measured 85% empty, the exact "60% empty" complaint this whole rebuild exists
to fix, just moved from the rail into the pane. So under the open item's own answer, the detail
pane also shows "Also waiting" — the rest of the ranked list again, as a grid of the same compact
row, more columns of it at a wider screen and never a wider empty margin.

**Ranked by `importance()`** (`needs-rule.js`), highest first: a blocker (a key, money,
something destructive) scores 90+; an open question or decision blocking a running agent 70+, a
quiet one 40-59; a stalled ask 60-80, rising the longer it has sat; a decision the system already
made 20-40; a quiet FYI under 20. **The score is the small number on every row** — one function,
so the Needs you tab, the Inbox's own score badge and the asks ledger's own page can never rank
the same thing two different ways. "Blocking a running agent" is real now, not just written down:
`needs.js` asks Servex's own agent list (`GET /agents`) for who is `working`, `idle` or `dormant`
right now and sets `item.from_live` off it — Servex down, or nobody home: it just stays false.

**How to ask, from an agent:** the Servex MCP tool `card_ask({card, question, options?, title?,
from?})` places a Decision (with `options`) or a Question (without) on the card — the exact
widget the card already draws, so answering it is the same click or reply box either way.

**How answering wakes the asker.** Choosing an option or replying goes through the same
`/card/append` path every other write on this page uses (`chose`, `answer`, or a legacy
`{"answer": {"ask": id}}` line). Servex spots that line and messages whoever asked
(`agents.send`), so a stopped agent picks its work back up the moment you answer — you never have
to go find it.

**The filter — "Needs review" on the inbox rail** (`/framework/ai2/inbox/?review=1`) shows only
these same rows, so the tab and the filter can never disagree about what still needs you. Its
state lives in the url, so a reload keeps it on. A card whose own last message just asks something
informally (no formal Decision or Question) clears with the **"Reviewed ✓"** button on its own
page, which writes one `{"reviewed": {"at", "by": "owner"}}` line — a placed Decision or Question
only clears by being answered, never by "Reviewed ✓".

One rule decides all three (the tab, the filter, and Servex's own `list_waiting`/`GET /waiting`):
[`needs-rule.js`](../needs-rule.js), `card_needs()` (what is open) and `importance()` (how urgent
it is). [`needs.js`](../needs.js) is the browser half — the shared scan every reader here
subscribes to (`watch_needs()`), the mount (`needs_shell()`) that picks the rail or the old list,
and the rail + detail view itself (`needs_rail_view()`). The scan asks Servex's `GET /waiting`
first for card needs, and always reads `asks.jsonl` itself for the stalled ones (a plain static
file, no Servex route yet). Reading every card's `page.jsonl` itself (300 requests every 20 s,
measured 09-29) is only the fallback when Servex is down.

**The Inbox's score badge.** `page.js` sets `it.score = score_for(it.id)` (needs.js: the card's highest open need) just before `row()` in `faces.js` draws it; cards with nothing open show no badge. The Inbox is not re-ranked — it stays newest first. `score_for` lives in needs.js, not inbox.js, because needs.js already imports inbox.js and the reverse would be a cycle.
