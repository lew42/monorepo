# Checkup: the /live page (cards as pointers, the feed, the Today and Now cards)

Budget: $12. Sonnet. Read `../checkup-common.md` first: it is the job description for every checkup; this file holds only what is specific. `V` is the path named there.

## The tasks

Module: `public/live/` (`readme.md`, `doc/notes.md`, `requirements.md` to `requirements-13.md`, `Live.js`, `LiveTasks.js`, `LiveToday.js`, `TaskState.js`). The law (CLAUDE.md, 2026-10-16): code streams the UI, never an agent; a card an agent has to rewrite is not live. Today only the Tasks card is data-driven.

1. **`V/live-cards/`**: its agent was stopped on purpose (2026-10-15 22:36). The handover says the card UI landed (a card opens at `/live/<id>/`, full-bleed code, the `wrap` fence word, add327dae…f76c0f54e). Verify the three asks in its requirements against the page; close the log with the truth.
2. **`V/live-pointers/`**: stopped 2026-10-16 14:40, not landed: /live cards become pointers (title, one sentence, links); their data moves to the log that produced it. Decide: build the smallest version now (a card is a pointer; the archive move below is the moment to do it) or defer with a reason; do what you decide.
3. **`V/live-feed/`, `live-today/`, `task-closeout/`**: landed; verify each is on dev and the page shows it; close.
4. **The /live root** (handover item 4): the owner wants a blank slate with the old cards moved to `/live/archive/` and the Now card (id `now`) kept current. Do it: a node script moves the old cards' lines into `public/live/archive/page.jsonl` (dry run, a manifest, reversible; the archive page is reachable from /live), and the Now card becomes a view of data (what is in flight from `list_agents`/TaskState, the last landings from the task logs) or, at the least, current today with a line saying what would make it live.
5. **Every other card on /live**: name which are agent-written text and which are views; write the one-line plan per card in `doc/notes.md` (keep, make a view of X, archive).

Fence: `public/live/**`, the three task dirs' records (closing lines only), this task dir. Not `core/Task` (the task-system checkup owns it; the Tasks card's data comes from `TasksPage.counts`).
