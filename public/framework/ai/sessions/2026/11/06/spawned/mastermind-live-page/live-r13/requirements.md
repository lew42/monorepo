# /live/: the page's tasks show as a checklist that ticks off live

@voice-app relayed the owner's eight tasks on /live/ (2026-11-06) and asked for `qsglj96w` first: "render page.tasks as a checklist so he can watch them tick off". Branch: `worktree/live-r13`.

## Asks

- [x] **A page's tasks draw as one checklist card above its cards**, titled "Tasks · 2 of 8 done", each task one row (the core/Task row, lighter here: no buttons, a done one ticked and dimmed).
  - **Cause found first:** `{"tasks":{"add":…}}` on a LivePage was stored as plain data, so each add replaced the last; of the eight, only the last survived. LivePage now owns a real task list (`Task.List`, in [LivePage.js](/live/LivePage.js)).
  - **Proof:** headless on a scratch copy of the eight lines: "1 of 8 done", 8 rows. Completing one while the page was open turned it into "2 of 8" with no reload; a ninth task appeared live. LivePage.test checks 36–38. Saved: [shots/live-tick.txt](shots/live-tick.txt) (from [shots/tick.mjs](shots/tick.mjs)), [400 px](shots/tasks-400.png), [1200 px](shots/tasks-1200.png).
  - **Caveat:** Servex's item tool caches the old class until its next restart. The lines it writes are the same, and the browser draws them with the new code.

## Decisions

- **The one task row (TaskView), styled lighter inside this card** rather than a second checklist view (`LiveChecklist` holds plain `{text, done}` entries, not Tasks). Alternative: draw tasks through LiveChecklist; it would lose the Task states.
- **Placed above the cards** so the owner sees progress first. Alternative: below the cards, beside the Pages footer.
