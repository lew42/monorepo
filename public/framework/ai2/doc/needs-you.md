# Needs you — one ranked list of everything waiting on the owner

![The Needs you tab: a blocker first, then decisions and questions, each with its answer control right there](/framework/ai2/doc/img/needs-you-1920.png)

**What it lists.** Every card that is still waiting on you: an unanswered Decision or Question
placed on a card (`ux/Content`'s widgets), a card typed `"question"`, or a card whose own last
message ends in "?" — read straight off the same card logs every other AI 2 view already reads,
so nothing new has to be built to keep the list current. It never lists a `done` or `archived`
card. Ranked a blocker first (its ask or the card's title says "block"), then a plain decision or
question, an FYI last; newest first inside each group.

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
[`needs-rule.js`](../needs-rule.js), `card_needs()`. [`needs.js`](../needs.js) is the browser half
— the shared scan every reader here subscribes to (`watch_needs()`), and the tab's own drawing.
The scan asks Servex's `GET /waiting` first: one request. Reading every card's `page.jsonl`
itself (300 requests every 20 s, measured 09-29) is only the fallback when Servex is down.
