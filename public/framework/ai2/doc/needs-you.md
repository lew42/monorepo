# Needs you — one ranked list of everything waiting on the owner

![The Needs you tab: a blocker first, then decisions and questions, each with its answer control right there](/framework/ai2/doc/img/needs-you-1920.png)

**What it lists.** Every card that is still waiting on you: an unanswered Decision or Question
placed on a card (`ux/Content`'s widgets), a card typed `"question"`, or a card whose own last
message ends in "?" — read straight off the same card logs every other AI 2 view already reads,
so nothing new has to be built to keep the list current. It never lists a `done` or `archived`
card. **Every STALLED line in the asks ledger** (`/framework/ai/asks.jsonl`, `Servex/asks/`) is
in the list too — an ask whose owner agent went quiet, silent more than 2 hours or stopped
outright — shown with how long it has been silent and a link to its card, or to its own words
when it has no card yet.

**Ranked by `importance()`** (`needs-rule.js`), highest first: a blocker (a key, money,
something destructive) scores 90+; an open question or decision blocking a running agent 70+, a
quiet one 40-59; a stalled ask 60-80, rising the longer it has sat; a decision the system already
made 20-40; a quiet FYI under 20. **The score is the small number on every row** — one function,
so the Needs you tab, the Inbox's own score badge and the asks ledger's page can never rank the
same thing two different ways.

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
subscribes to (`watch_needs()`), and the tab's own drawing. The scan asks Servex's `GET /waiting`
first for card needs, and always reads `asks.jsonl` itself for the stalled ones (a plain static
file, no Servex route yet). Reading every card's `page.jsonl` itself (300 requests every 20 s,
measured 09-29) is only the fallback when Servex is down.

**The Inbox's score badge.** `page.js` sets `it.score = score_for(it.id)` (needs.js: the card's highest open need) just before `row()` in `faces.js` draws it; cards with nothing open show no badge. The Inbox is not re-ranked — it stays newest first. `score_for` lives in needs.js, not inbox.js, because needs.js already imports inbox.js and the reverse would be a cycle.
