# Plan of action — AI system, 2026-10-08

Ordered by value over cost, quick first. Source: [findings.md](findings.md), [systems-map.md](../../systems-map.md). Nothing here is built yet unless marked done.

## 1. Quick (a few lines each, no spawn needed)
- **Done:** System tab as class cards, SDK page, systems map, iceberg readmes, task-queue section.
- Write `ai/doc/history.md` (evolution log, links only). One edit, one commit.
- Make the System tab's Servex card AI-focused: `class_cards(["Servex","Agents","Dispatcher","Sessions","Pool","Usage","Budget"])` first, the rest folded.
- Name the three "inboxes" (page inbox, agent inbox file, owner's inbox cards) in `ai/readme.md`, each linking its doc.

## 2. Tune the whole Servex docs set (most loose ends cluster here)
Servex readme is 388 lines, `Servex/agents` 289, with a name clash on "heartbeat" still open. Plan: a Haiku pass cuts each readme to an index under 100 lines, moving detail into `doc/` (additive, nothing deleted). Then `check-classes.mjs` re-verifies the class cards.

## 3. Cost of every agent turn
The `mastermind` skill is 47 KB (~12k tokens) on top of CLAUDE.md. Split it into a short core plus on-demand sections. Needs the skill owner's approval; propose, do not apply.

## 4. Tasks: one queue
Today five stores hold tasks. Recommendation and the alternative are in [systems-map.md](../../systems-map.md). First step is a node script that lists open tasks from the task folders; the board and queue are then views of it.

## 5. Sessions and inbox cards
Wrap inbox cards in session context cards once `minion-session-class` lands its class. Not before: it owns those files.

## 6. Streaming and polling
The dashboard Now card has no message timestamps and the Log page is not yet a real-time stream. Start only with pace comfortable (currently 5 points under): Log stream first, then Now timestamps, then Inbox.

## Blockers
- The pool cannot make a worktree for minions, so no Sonnet coder can be spawned yet; items 1 to 3 wait for it or I do them by hand with `worktree-up.mjs`.
- No spawns made, so `spawns.jsonl` is empty by design.
