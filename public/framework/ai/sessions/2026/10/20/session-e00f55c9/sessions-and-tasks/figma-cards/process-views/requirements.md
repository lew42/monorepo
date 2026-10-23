Budget: $6

# Figma: process views and the sessions list nested by parent

## What to design

Add two bands to the Figma page **Projects, sessions, tasks, processes** (node `324-54823`, file `QYN0G2URSBHYH5I06MOjxU`). Each band is a row of 400 px phone frames, drawn the same way as the bands already there (D day, E session B, F task A), using the same card, header, row, status and bar parts. The picks are in [mobile-cards.md](/framework/ai/sessions/doc/mobile-cards.md); follow them.

**Band G: a process** (the owner, 2026-10-22: "a process's phases, its steps, which are running, step-by-step progress"). A process is a task whose children are named phases, run in order by node. Read [core/Task/doc/process.md](/framework/core/Task/doc/process.md) first; its fields are the ones to draw. Draw three frames:

1. **The process page:**
   - The title, the process kind ("build" or "design") and its state.
   - A segmented bar with one segment per phase.
   - The phases as flat rows, in order. Each row shows:
     - the phase's status dot (green done, amber pulsing running, red waiting or stalled, grey not started);
     - who runs it (`session.run`: fresh, same, owner, or wait), with the model;
     - its measured cost (`measure` lines);
     - its outcome line when done.
   - The running phase is the one that stands out, with the run indicator and pause and stop beside it (Follow-up 3 in `../requirements.md`).
   - A phase waiting on the owner (merge) says so plainly, with the one button that completes it.
2. **A phase opened:** its `do` text, the session that ran it (tap through to the session page), its outcome, its cost, and its steps or subtasks if it has any.
3. **A process as a row:** how a process looks inside a session's Tasks tab and on the day list. One row: the title, "phase 4 of 7: execute", and the bar. Draw it as a component, so the coded row matches it.

**Real data:** the one process that has run: `process-system/run-1/readmes-page/task.jsonl` (41 lines: 7 phases, spawns, measures; $4.27 total). Read the file; don't invent fields.

**Band H: sessions nested by parent.** This view is already coded in the variant `/framework/ai/sessions/v/mobile/all/` (worktree `C:\Code\lew42\worktrees\mobile-picks`, its shot is `public/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/shots/nested-400.png` in the main tree). Draw what it should be, so the code can be checked against it:
- A parent session with its children folded under a count ("+7 minions"), and the same parent opened.
- Each row tagged with its kind: VS Code tab, voice, mastermind, minion, reviewer, clarity.
- A child that is itself a parent (a mastermind spawned by a tab) nests one level, then opens its own page (the "one indent" rule).
- Real data: today's sessions from `sessions/session-tree.json` (rebuilt 2026-10-22; `parent` is a session id, `role`, `agent`) and `sessions/2026/10/22/index.json`.
- A child with no recorded parent (clarity and reviewer agents today) appears at the top level with a small "no parent link" note. Draw that case too.

## How

- Load the `figma` skill, then the plugin's `figma-use` skill, before the first `use_figma` call. Reuse the components already on the page; edit masters, not instances. No Sections.
- You are the only Figma agent right now (the rate limit allows one).
- After each band: one `get_screenshot` of the band, saved as `shots/G.png` and `shots/H.png` in this folder. Log one line on this task naming it (`item` tool, this folder's url, delta `{"log":{"text":"…"}}`).
- Add the two bands to `mobile-cards.md` (bands table and node ids) in the main tree; that is a doc, not a page the site serves, so commit it by exact path.

## Done means

- [ ] Band G: the process page, a phase opened, and a process row component, from run 1's real lines.
- [ ] Band H: nested sessions folded and opened, with kind tags and the no-parent case, from today's real tree.
- [ ] Both shots in `shots/`, mobile-cards.md updated, committed.
