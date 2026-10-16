# Task closeout: done vs waiting, and the Today card shows it

Voice ask fc0fe0d7 (the owner, 2026-10-16 ~02:10Z). Parent: mastermind-voice-20261016.

## The owner's words
> Nearly every session listed as idle today: are they done or stuck waiting? Give me a count: done (landed, nothing open) vs waiting (blocked on review/owner/another agent). When a task is done, close it and have its parent summarize purpose and cost, so it stops being listed; when it is waiting, we need a re-prompt loop or an explicit "waiting on X" shown on the Today card. Add done/waiting-on-X to the Today card, and close out every task that is actually finished.

## Deliverables
1. **A node script that computes it** (Law 7: compute, don't recall). It reads today's sessions/tasks (the same sources `public/live/LiveToday.js` uses: `sessions/2026/10/16/index.json`, and `tree_for_day` / the task index), and classifies each task:
   - **done:** has a landing line and nothing open (no open ask, no pending review);
   - **waiting on X:** not landed, and the log names what it waits on (review, the owner, another agent by id). If nothing is named, it says "waiting on ? (no line says)".
   It prints the counts plus one line per task. Put it where the Today card can reuse its logic (prefer a static method on an existing class, e.g. `LiveToday`, or a small class beside it, over a loose script).
2. **Close out every task that is really finished.** If it's done but has no landing line (work committed, agent stopped), append a landing line with `node .claude/hooks/append.mjs` (never hand-edit, never delete). Its `outcome` is a one-line purpose plus its cost, computed from the session data. A task with any doubt stays open and gets listed as waiting. Use the existing landing/close mechanism (the `finish-task` skill's landing-line shape; `close_task` if it fits). Do not invent a second one.
3. **The Today card** shows each task's state as done or "waiting on X". Done tasks are folded or dimmed so they stop crowding the list. The header counts: N done, M waiting.
4. The re-prompt loop for waiting tasks is NOT built. Add one line to `public/live/doc/notes.md` saying it's the owner's direction (Servex's TaskLoop is the likely home).

## Rules
- Never restart Servex. Never drive the owner's tabs. Never write the owner's name.
- Hold live reload around your writes to `public/live/` (`node Server/hold.mjs on/off`). Commit each working step.
- Report back in one screen: the counts (done / waiting, with the X for each waiting one), which tasks you closed, and the commit.
