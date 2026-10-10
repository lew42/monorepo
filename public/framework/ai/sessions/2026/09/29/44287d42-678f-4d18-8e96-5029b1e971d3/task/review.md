verdict: fix

1. [fix] Stopped/errored minions still read as running: `tree.js:410-413` counts a leaf "landed" only when its last row is `done`, so `stopped`/`error` shows as running forever (`tree.test.mjs:564` asserts it). "In flight" is the core ask — give stopped its own state.
2. [fix] `after` is written two ways: `Agents.js` normalizes `parent_task` but writes `after` verbatim; the skill says "sibling slugs", `doc/nested.md` shows full dirs. `tree.js:431,452` tolerate both via suffix match, so a slug like `data` can match the wrong sibling. Pick one form (dirs) everywhere.
3. [note] "Every mastermind is a task" only holds when the caller passes `task:` to `spawn_agent` (`Agents.js:99`); a spawn without it gets no line 1, and its minions are placed by folder/inbox guesses.
4. [note] Demo and Lanes are the same page (`plan.js`, Winner = Lanes) but the switcher names them differently ("the winner" vs "Lanes"). Make demo an alias of Lanes; list only the three designs.
5. [note] `AITask.route()` (`AITask.js:119`) makes a sync XHR for the whole `directory.json` on every child route — cached 10s, but a big `ai/` tree still stalls the first click. Pre-dates this task.
6. [note] Real logs carry no `after` yet, so waiting/series only show on the demo today (`tree/sheet.png`: "3 running · 0 waiting · 13 landed"). Say so on the tree page.
7. [note] Running roots show their folder slug as title (`tree.js:376`) instead of the card/brief title; landed rows crowd the top of the screen at 1280.
8. [note] Demo page at 3440: the phase-1 lane over-stretches, and the "then" arrow — the only series cue — is small and grey. Bold it.
9. [note] Flow page: the graph stays ~900px wide at every size, and "waits for…" text is ellipsized; `nested.js:199` hardcodes `56` instead of `GX`.
10. [note] Tree pages show a stray "Folder" chip, and the intro text sits above the tree in small grey type — counts + tree should lead.
11. [note] Leaf % is `(step-1)/steps` (finished steps), not `step/steps` as the brief said — a deliberate change, named in the doc.

| # | outcome |
|---|---|
| 1, 2, 4, 6, 7, 8, 9, 10 | fixed |
| 3, 5 | noted, not fixed |
| 11 | declined |

Full replies: [review/reply.md](review/reply.md)
