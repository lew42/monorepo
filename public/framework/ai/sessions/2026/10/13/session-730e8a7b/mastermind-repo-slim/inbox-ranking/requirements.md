# AI Inbox: new things show up at once, important things stay up

Budget: $10. Load the `sub-mastermind` skill and the `page` skill first. The owner's raw words are in `../requirements.md` (ask 6, dictation 1: "that should be always like a prioritized view… semi-chronological and prioritized… if it just came in, I want to see it, whether it's important or not… a dual ranking based on recency but also importance"). Your log is this dir's `task.jsonl`. CLAUDE.md laws apply: one of everything (extend the existing Inbox, never a second one), show don't tell, work in a worktree, check the four widths.

## What exists

- The AI Inbox is `public/framework/core/Page/ext/Inbox/Inbox.js` (`class Inbox`, two views of one thing). `Servex/cards/Cards.js` line ~165: `owner_note` writes a line the Inbox "scores 100 and sorts first until the owner opens or archives it", so a score already exists; find where it is computed and what else feeds it. `Servex/agents/inbox.js` is the agent-side inbox (a different thing; leave it). Run the `past-work` skill on "inbox" first and record what it says.

## Deliverable

1. **One ranking function**, a static on the Inbox class (`Inbox.rank(item, now)` or the name the code already uses), that combines importance (owner_note kinds: needs-you > risk > decision; then request, question, task, note; a landed task lower than an open one) with recency (anything from the last ~30 minutes floats to the top regardless of importance, then decays), and keeps the owner's opened/archived state below everything. Document the formula in one short `doc/ranking.md` beside Inbox.js, in plain words with one example per rule. Keep the owner_note = 100 pin behaviour.
2. **A visible cue**: a new item (under 30 min) shows a small "new" mark and its age ("4 min"); an important one shows its kind. Reuse the existing card/row component; no new component.
3. **The demo on the Inbox page** (`page.js`): the live inbox beside a debug list of the same items with their computed score, so the owner can see why each row sits where it does (CLAUDE.md "Show the class").
4. `check_page` at 400, 1200, 1920, 3440; smoke clean; `merge.mjs`. A screenshot of the result on your card.
5. Report on your card: the formula in three lines, the link, the screenshot.

Fence: `public/framework/core/Page/ext/Inbox/**`, the Inbox's readme and doc. Do not touch `Servex/cards/Cards.js` except to read it; if the server-side score needs a change, write it as a `decision` line with the exact edit and leave it for the mastermind. Sonnet, one page, one minion at a time.
