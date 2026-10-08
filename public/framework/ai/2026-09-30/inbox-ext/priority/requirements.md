# Minion brief: the Inbox shows only what matters (priority 50 and up)

Load the `minion` skill first, then `code`. Parent: task-mastermind-inbox-ext. Task dir: `public/framework/ai/2026-09-30/inbox-ext/`. Read its `owner-words.md`, last section ("Inbox = priority 50+, Log = everything"), before anything.

## The owner's words (verbatim, the part that is yours)

> What goes into the inbox needs to be top priority. And maybe it's even like, um, I don't know, maybe we need a priority filter on top of the inbox. And really, the, maybe the difference between the inbox and the log is just based on that priority. Like log is everything. And inbox is only like priority of 50 and above or, or whatever. And then we have a, a way to score the priority so that only top priority things get to the inbox. Because I'm seeing these cards appear that don't make much sense. This one says six, has a 60. It leads, well, first it leads with like a time, an hourglass with a cross through it. I don't know which icon that is. I don't know what that means, but... Um, the uh, dictation, it says 60, dictation, one configurable widget everywhere, widget first on the page. Uh, that doesn't make much sense to me. I don't remember this.

## What is wrong today

- Only a card with an open need (`needs-rule.js` `importance()`, via `needs.js` `score_for`) and a stalled ask get a real score. Every other row has none, so a "50 and up" filter would be guesswork.
- A **stalled ask** (an ask whose owner agent went quiet, from `ai/asks.jsonl`) scores 60 to 80 (`IMPORTANCE.STALLED_*`) and shows as an unreadable icon (`hourglass_disabled`) plus ledger shorthand the owner doesn't recognise. But the owner has nothing to do about it: CLAUDE.md law 5 says the system revives the quiet agent itself.

## Deliverables, in order (commit each)

1. **One written scoring rule, 0 to 100, for every Inbox row.** In `needs-rule.js` (it is the one rule three callers share), next to `IMPORTANCE`, write down in a short comment table what scores 50 or more: only things the owner must act on (a blocker, an open decision or question an agent is waiting on, a finished task waiting for the owner's look). Everything else, including a card that just updated, a landed task nobody asked the owner about, and a note, scores below 50. Give every row kind a score (`importance()` gets the kinds it doesn't know today), so each row in `items()` (`inbox.js`) has a number.
2. **A stalled ask drops below 50** (the owner has nothing to do; Servex revives the owner agent — queued by mastermind-servex-9, see deliverable 3). It stays in the Log (everything) and in the asks ledger. The one exception: a stalled ask whose text says it needs the owner (a blocker word, as `blocker_signal` already reads) keeps 50+.
3. **A stalled-ask row reads as a plain sentence.** No `hourglass_disabled` icon. Title: what was asked, in words the owner would recognise (use the ask's own words or card title, not the ledger id shorthand). Under it: who owns it and how long it has been quiet, e.g. "Asked of mastermind-servex-9 · quiet 3 h · flagged by Servex". End it "Servex is reviving it" only when the ask's latest line in `asks.jsonl` carries `revived_at` (mastermind-servex-9 is adding that revive; today Servex only marks the stall, so today every stalled row ends "flagged by Servex"). Files: `inbox.js` (the stalled `add({...})`, ~line 780) and `faces.js` if the row face needs it.
4. **Proof.** A table in `priority/scores.md`: every row on today's AI 2 Inbox with its kind, its score before and after, and whether it is in (≥50) or out. Read the "in" list as the owner would: would they want every one of those in front of them? A shot of a stalled row before and after at 1920 in `priority/shots/`. Zero new console errors on `/framework/ai2/`. The existing tests of `needs-rule.js` (grep for its importers under `Servex/` and `ai2/`) still pass.

The **filter itself** (a threshold at the top of the rail, default 50, that the owner can move; Inbox = 50 and up, Log = everything) is built by the rail minion into `InboxRail`. It reads each row's `score`, so your only contract with it is: every row has a numeric `score`.

## Where you work

Worktree `C:\Code\lew42\worktrees\inbox-ext` (branch `worktree/inbox-ext`, server http://localhost:51490/). The rail minion works in the same worktree on `ai2/page.js`, `ai2/rail.js`, `ai2.css` and `ux/Inbox/`; stay out of those. Commit after each finished piece. Don't merge; I merge.

## Fence

`ai2/needs-rule.js`, `ai2/inbox.js` (the scoring and the stalled row only), `ai2/faces.js` (the stalled row face only), `ai2/needs.js` if `score_for` must change, and this folder. Servex reads `needs-rule.js` too (`Servex/cards/Cards.js`): don't change any exported function's shape.

## Rules

`windowsHide: true` on every process. Stop any browser or server you start. Log each step and decision in your task.jsonl. When done, message task-mastermind-inbox-ext: the commits, the "in" list, what's left.


## Added 2026-09-30 16:30: the owner's Inbox noise pass (relayed by servex-mastermind-opus). This comes FIRST.

The owner went through the Inbox; most of it is noise. These go out in the small merge with the freeze fix, so do them before deliverables 1 to 4 above, and commit each one.

A. **Heartbeat notices are not activity.** Lines like "servex-heartbeat: minion-… its agent is not running: it was stopped on purpose" bump old cards to the top (about 8 of the top 25 rows today). They must not count as a card's activity (its `at`/last-activity used for ordering), must not re-sort it, and a row that is only such notices scores below 50. Find where a card's activity time is taken from its lines (`inbox.js`, `groups.js`, `log.js`) and skip lines whose author is `servex-heartbeat` (or whose text starts with it).
B. **Stalled asks:** the three `ask:` rows (score 60/61) were stale; their status lines are now in `ai/asks.jsonl`, so check they resolve and disappear. Then deliverable 2 above is the rule: a stalled ask reaches 50+ only if the owner has something to do.
C. **Old "You said…" voice rows** (from 12:48 and 1:05 PM, plain uuid ids): score them below 50.
D. **The `/framework/ai2/ask:…` page** (a dynamic route, `resolve_card` in `inbox.js` ~line 534): it must say plainly what it is, in one line at the top: "An ask from the ledger. Owner: X. Quiet since Y." (with a link to `ai/asks.jsonl`).

Proof for A–D: the top 25 rows of `/framework/ai2/` before and after (id, title, score) in `priority/noise.md`, and a 1920 shot of the rail after. Zero new console errors.

**Your fence now includes** `ai2/groups.js` and `ai2/log.js` (the activity-time lines only). **Not yours:** the × button and archiving (`ai2/page.js`, `ai2/rules.js`, `ai2.css`): minion-ai2-hang has those, in the same worktree. After A–D, message me, then go on with 1 to 4.

## INBOX ZERO (added 16:35, the owner). This replaces the ≥50 threshold everywhere above.

- The Inbox shows only what is truly pressing: **score ≥ 90.** Make the rule so.
- **The score decays with age.** A somewhat important thing that just happened may show briefly (≥90 while fresh). After about a day it drops below 90, unless it is super-important and still pressing (a blocker, or an open question an agent is blocked on). Write the rule and its decay in `needs-rule.js` as a comment table, and compute it at read time (`items()` in `inbox.js`). No writes.
- Every row has a numeric `score`. minion-ai2-hang builds the filter (`score >= ?min=`, default 90) and "clear all" in `ai2/page.js`; don't touch that file.
- The order is now: A (heartbeats) and the decay rule first, then C and D, then the rest. Message me the moment A plus decay work.
