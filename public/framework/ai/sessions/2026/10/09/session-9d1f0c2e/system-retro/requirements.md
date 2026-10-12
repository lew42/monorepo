# system-retro — where the whole AI system stands after today, the laws the owner keeps saying, the day's report with its costs, and what goes where

Minion: Sonnet, effort high (budget mode). Session id `9d1f0c2e-6b3a-4f7e-8c21-5a0e7d4b1c90`. You
are IN A WORKTREE. Read [`../mastermind-servex/common.md`](../mastermind-servex/common.md)
first. This is a PAPER task: read, think, write pages. No code under `public/` beyond your task
dir; no `Servex/`.

## The owner's words (2026-09-22 20:00, verbatim excerpts — they are leaving for an hour)

> Seriously think through the whole AI system — mastermind, master assistant, fast assistant,
> transcribing — think about what we've made so far and the best workflow: what's going to
> help me the most understand what I'm trying to work on. Make sure we're documenting the
> important things I said multiple times: not having the layout jump around; once I click on
> something we stay focused on that thing; live reload — I'm not sure where that's all at.
> Reporting: at the end of the day I want an overview of everything we've done today,
> summarized, that makes sense. Token usage: what were the main spenders, in terms of
> timeline, what took the longest. We're still working a lot on the basics. Figure out where
> we're at on all these things, make suggestions to make it better, and rules for improving the
> system of what goes where.

## What to read (in this order; the run ledger is the spine)

1. `ai/2026-09-22/mastermind-servex/task.jsonl` — every `agent` line has `task`, `model`,
   `tokens` (a $ string), `duration_ms`, `at`, `landed_at`, `outcome`; every `chat` line is the
   owner verbatim; every `decision` names options. `requirements.md` beside it is the owner's
   architecture brief. `ai/handover.md` is the state page.
2. `ai/2026-09-22/tiers-design/` (the six roles, five docs), `log-model/`, `worktree-design/`,
   `review-3-days/` (the shape of a day report the owner liked), `card-to-task/`,
   `ai2-master-detail/`, `talk/`, `open-mic/requirements.md` (in flight), `ai2-nested/requirements.md`
   (tomorrow).
3. The skills that carry rules: `.claude/skills/{mastermind,minion,layout,css,every-prompt}/SKILL.md`,
   and `.claude/skills/every-prompt/tiers.md`.

## Deliverables — one page, `ai/2026-09-22/system-retro/page.js`, iceberg: four headlines, each one click down

1. **The day, as the owner wants to read it.** A `doc/day.md` rendered on the page: what
   landed today (every task with one plain sentence and its link — from the `agent` lines'
   outcomes, trimmed to the headline), grouped: Servex core · the agent system · the boards
   (AI, AI 2, talk, record, bench) · site fixes (grip, padding, ux, nav, reload) · paper
   (designs). Then **the cost table**: every task with its $ and minutes (sum the `tokens`
   strings; where a task has two runs, both), sorted by $; the total; the five biggest
   spenders and what they bought; the timeline — a horizontal bar per task from `at` to
   `landed_at`, so "what took the longest" is visible; the three windows' usage samples from
   `ai/usage.jsonl` for today as a line. Two numbers that must agree: tasks in the table and
   `agent` lines with an `outcome`.
2. **The laws the owner said more than once — `doc/laws.md`.** From the `chat` lines: every
   rule said twice or more today, in the owner's words (quote the shortest form), with the
   date-times it was said and WHERE it is now written (skill/file/line) or NOT WRITTEN (say
   so): the layout never jumps; once I click, stay focused; iceberg content, primary things
   first; reports as pages, not readmes; notes on the board, not the chat; no approve on
   everything — a flag; minions in worktrees; hold for seconds around a write; proofs never on
   the live board; text never at zero from an edge; the mic must look on; one card one
   conversation; nothing on the board that does not help me; be careful with tokens. Add the
   ones you find that I missed. Where a law is written in more than one place, say which copy
   should be the one and which should become a link.
3. **Where the system stands — `doc/state.md`.** For each tier — fast assistant (Servex
   `assistant-fast`), master assistant (role exists, nothing feeds it until open-mic), the
   mastermind (this sidebar session — still not Servex-hosted), task masterminds (Dispatcher,
   proven), minions (CLI in worktrees), the log (Servex single writer + board.jsonl + prompts
   log + task.jsonl — four stores; the card-storage decision), the boards (AI/V3, AI 2, talk,
   record, bench — five surfaces), live reload (what reloads now, what streams, the scoped
   hold), worktrees (the launcher, teardown, the two orphan burners) — three lines each: what
   exists and is proven · what is half-built or unwired · the one thing that would help most.
4. **What goes where — `doc/where.md`, the rules as a table.** Rows: the owner's words · a
   note/explanation from the mastermind · a task's landing · a proof/test · a design doc · a
   decision · a session's transcript · a flag/verdict · a recording · a card that grew into a
   page. Columns: where it lives (file/store) · who writes it · where the owner sees it · what
   never goes there. Then five suggestions, ranked by how much they would help the owner
   understand what they are working on, each one paragraph with the alternative — e.g. one
   surface instead of five; the mastermind hosted in Servex so its notes are events; the
   end-of-day report generated from the ledger every evening; a token meter on the board;
   fewer, larger tasks. Say which one you would do first and why.

## Proof

The page loads on your worktree server at 1280 and 400 with zero console errors; the four docs
render; the cost table's total equals the sum you print in the log; screenshot at 1280 into
your task dir. Link the page from `ai/2026-09-22/page.js` `children:`. Land by the launcher's
patch (your task dir + that one line).

## Length

Page: one screen — four headlines with one sentence each and the total spend. Each doc: one to
two screens. Landing report: six sentences — the total, the biggest spender, the first
suggestion.
