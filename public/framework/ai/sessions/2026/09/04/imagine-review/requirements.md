# imagine-review — manager brief (Opus, a sub-mastermind)

Read first, in this order: the repo's `CLAUDE.md` (law 2 was rewritten today — **clear beats brief, by far**), [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) (its two new laws at the top: clear beats brief; resolve, don't park), then this. Skills for you: `new-task` (this dir, group `review`), `code`, `layout`, `new-page`, `finish-task`.

## The owner's ask, verbatim (2026-09-04)

> as i'm reading through a lot of these pages, i'm sort of lost... it's not clear at all.
> have a minion review all these imagine pages for layout, clarity, etc. have a manager spawn several minions for each page, screen shot it, do a ui test, and see if it makes sense. is the ui test skill part of the system? do minions normally execute this? because i feel like a lot of the issues are going unresolved.
> also make a note in the mastermind skill, not the leave unresolved issues. resolve them the best way you can, keeping flexibility for change, and noting caveats.

## What you are

A manager: you do not review pages yourself. You spawn one **reviewer per realm** (Sonnet), harvest each, and write the one page that reports it all. There are eighteen realms under `public/imagine/`: `team design platform game gallery scenes vary screens shells feeds mag blogx decks youtube cms research stream generated` (skip `paging` and `review` — one is being rebuilt, the other is yours).

⚠ **Spawn your reviewers in the FOREGROUND** — `run_in_background: false`, three Agent calls per message so they run concurrently. A background minion's completion notifies the MAIN session, never you; a manager that ends its turn "awaiting harvest" is parked forever. Both sub-masterminds that tried background minions on 2026-08-21 stalled on cycle 1. Six rounds of three is the whole plan.

## The reviewer's brief — write it once as `reviewer-brief.md` in this dir, then point each spawn at it with its realm name

A reviewer, for its realm (its landing page and its two most important children — the ones the page links first):

1. **The ten-second test.** Open the page cold on a private server (`PORT=809x node server.js`; never port 80; the `ui-test` skill names the Playwright import and the `MSYS_NO_PATHCONV=1` trap) at 1280 and 3440. Screenshot. Then write two sentences in the task log: what a stranger would say this page is for after ten seconds, and what the page's own readme/code says it is for. When they differ, that is the finding, and it is the most important one.
2. **The primary interaction.** The first thing a reader would click. Prove it with a `ui-test` plan (screenshots per step, the rects that moved). If nothing visible happens, or what happens is not what the control's label promises, that is a finding.
3. **Layout at 3440.** The three invariants from the `layout` skill: nothing at x:0, nothing past the measure, no constant where a spacing clamp exists; and width used — the critique at `/imagine/paging/critique/` already has the number, read it, do not redo it.
4. **Resolve, don't park.** Fix what is local to the realm — its `page.js`, its `.css`, its `readme.md`, its children: a missing takeaway sentence at the top of the page (every page starts with one, in plain words); a control with no label or no visible effect; a button that navigates nowhere; a word only the author knows. Keep each fix easy to change and write its caveat in the task log. A fix that needs `core/` or `ext/` is a written proposal with the diff, in the log, not an edit. Then re-shoot.
5. **Land** with `finish-task`: the two sentences, the fixed list, the proposed list, screenshot paths. Fences: the realm's dir and the task dir only. Never `git stash`/commit; never `find /`; never spawn agents; kill your server.

## Your deliverable

`public/imagine/review/page.js` (replace the stub): first, in three plain sentences, what this review is and how to read it. Then one card per realm, least clear first: the 1280 shot (jpg, ≤ 150KB, saved in your dir), the sentence a stranger says, the sentence the page meant, a verdict (**clear** / **unclear**), how many things were fixed and how many proposed, a link to the realm and to the reviewer's task page. Then one screen, "What kept going wrong": the five most common clarity failures across the eighteen, each in a full sentence with the two realms that show it best. Verify your page at 1280 and 3440 on a private server, zero console errors.

## Budget and reporting

You: ~200k tokens. Each reviewer: ~130k, and its brief says so. Log every spawn and harvest in your `task.jsonl` as `agent` lines. When you land, reply in ≤ 15 lines: the review url, the three least clear realms with their two sentences, total fixed / proposed, the five patterns, tokens.
