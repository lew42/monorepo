# Follow-up: a daily computed list

Budget: $6. Load the `sub-mastermind` skill first. The owner's words: `../requirements.md` dictation 2 ("we don't have a very reliable system to make sure that past work is being followed up on") and `../requirements-5.md` ask 5 (loops are node's job, not the AI's memory). What exists: `Server/FollowUp.mjs --write` produces `ai/doc/follow-up.md` (+ `follow-up-full.md`) from every task of the last 10 days through `SessionIndex`; the follow-up-act task left a `decision` line in `Servex/doc/task-loop.md` proposing a daily run; `Servex/TaskLoop.js` ticks on a schedule; the landing nag + next-step wake landed today (`Servex/agents`, live since the 19:55 restart). Your log is this dir's `task.jsonl`.

## Deliverable

1. **Wire it**: `TaskLoop` (or the existing daily/hourly tick in Servex: find it, never a second scheduler) runs `FollowUp --write` once a day (and on demand through an MCP tool if one is cheap: `follow_up` returning the flagged counts) and commits the two files by the LogSweeper's path (add them to its ALLOW with a one-line reason). Tested on a private Servex port: the tick fires, the file updates, the commit appears.
2. **Surface it**: `ai/handover.md` gets one line under its header pointing at `doc/follow-up.md` ("what fell through, computed daily"); the AI page's System card lists FollowUp as a component if it does not already; the flagged count goes on the Inbox as one row per day (through the existing owner_note or a `log` line the Inbox timeline already shows: no new kind).
3. **Prove the loop closes**: after your change, a task that lands with no landing line is nagged by node (today's landing-nag) and shows in the next follow-up as healthy once landed; one real example from today's tasks in your log.
4. Doc: `Servex/doc/task-loop.md`'s decision line becomes a done line with the tick's name and time.
5. Card report; landing line checked with `tail -1`.

Fence: `Servex/TaskLoop.js` (one tick), `Servex/LogSweeper.js` (ALLOW two paths), `Servex/MCP.js` (one tool, optional), `Servex/doc/task-loop.md`, `ai/handover.md` (one line), this task dir. Tested on a private Servex; the live one is restarted by the mastermind. Sonnet, low effort.
