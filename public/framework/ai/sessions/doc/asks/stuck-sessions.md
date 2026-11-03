# Why some sessions read as running (checked 2026-10-09, by script)

Script: `ai/sessions/2026/10/09/session-a27774cd/ai-mastermind/scripts/stuck.mjs` (reads Servex `/api/agents` and the real transcripts; run it again for fresh numbers).

**Result at 17:30:** no Servex-launched agent was stuck. Of 36 registered, 3 were `working` (two masterminds and a refine UI task, all with fresh transcripts), 4 `idle`, the rest dormant or stopped.

**Quiet VS Code tabs (10+ min since the last transcript line):** `e3ade6ce` 160 min, `fc97c255` 158, `3b2ce1d8` 57, `87bec773` 56. Four are tabs the owner types in; `3b2ce1d8` is different: its first prompt is `[You are Servex agent mastermind-servex-10.]`, so it is a mastermind started by pasting the Servex prompt into a VS Code tab, not through `spawn_agent`. The Servex SDK did not launch it, so Servex cannot stop, resume or track it.

**Why they still look alive:**
1. A VS Code tab has no end event: the transcript just stops, and nothing marks it done.
2. `sessions/sessions.json` (the VS Code/CLI snapshot) was last written 2026-10-08 20:10 and nobody rewrites it, so its `state: "active"` rows are a day old. The page re-derives state from `last_activity` with a 5-minute window (`AISessionRows.true_state`), so a stale row reads idle only if its recorded `last_activity` is old; a tab missing from the snapshot gets no row at all.
3. A Servex agent that is `idle` (alive, waiting) shows a quiet green dot, which reads as running if you do not know the dot's meaning.

**Fix to consider (not done, it changes the sessions page):** have `session-flags.mjs --watch`, which already runs every 30 s and holds each transcript's last line time, also feed the grid's state, then retire the `sessions.json` snapshot. Launch rule stays: agents go through `spawn_agent`.
