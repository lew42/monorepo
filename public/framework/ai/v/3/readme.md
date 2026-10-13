# AI v3 — a wall of idea cards, ranked by importance; a third take on the AI dashboard

## Use
- Moved verbatim to [doc/views.md](./doc/views.md): the views.
**The chrome is ONE line, at every width** (`board-declutter`, 2026-09-22 — the owner counted
three rows above the first card and called all of it too much). On the line: the title, the five
view words, whichever agents are working, and `More ▾` at the right end. Behind `More`:
**ways out** (today's board, computed and never hardcoded; the full log; the process page; the
owner's start-here page), the version picker, the count of what is still unreviewed with its
approved toggle, **Live**, the author filter and the card-width slider. Nothing is deleted —
`more_panel()` builds all of it, and `set_more()` only toggles a `.v3-more-open` class on
`.v3-head`, which is what `.v3-more` reads. This used to be a `@media (width < 40em)` fold
(`head-mobile`, 2026-09-21); it is the fold at every width now.

- Moved verbatim to [doc/traps.md](./doc/traps.md): traps.

## More

- [The v3 dashboard](/framework/ai/v/3/) · [v2](/framework/ai/v/2/), the other live take ·
  [ext/JSONL](/framework/ext/JSONL/) the log format. Note: `/framework/ai/` itself now renders
  this same page by default (`ai-front`, 2026-09-21) — `?v1` there still opens the original board.
- [`ai/sessions/2026/09/22/53dfe850-82d6-4943-9866-6197b53b4049/board-declutter/`](/framework/ai/sessions/2026/09/22/53dfe850-82d6-4943-9866-6197b53b4049/board-declutter/) — three rows of
  chrome down to one, 202px of dead space down to 68, the five views turned into five urls, and
  the one card ground: before/after shots and every number
- [`ai/sessions/2026/09/22/session-14ca2320/days-view/`](/framework/ai/sessions/2026/09/22/session-14ca2320/days-view/) — the days view itself: why
  it reads `day.jsonl` instead of every task's own `task.jsonl`, and why it is the new default
- [`ai/sessions/2026/09/22/worktree-proof/worktree-proof/`](/framework/ai/sessions/2026/09/22/worktree-proof/worktree-proof/) — the mastermind's
  follow-up on days: each row's headline now leads with the bold task name, and a still-running
  row is no longer a link
- [`ai/sessions/2026/09/21/front-door-today/`](/framework/ai/sessions/2026/09/21/front-door-today/) — the stale-
  thread notice on Now, and the two counts that proved the bug
- [`ai/sessions/2026/09/21/live-select/`](/framework/ai/sessions/2026/09/21/live-select/) — the rail rebuild
  (one list, two card sizes, no sticky strip) and Live becoming selection/deselection
- [`ai/sessions/2026/09/21/v3-ways-out/`](/framework/ai/sessions/2026/09/21/v3-ways-out/) — the four head-row
  links out of V3 (today's board, log, process, start here) and why they're not in the toolbar
- [`ai/sessions/2026/09/21/head-mobile/`](/framework/ai/sessions/2026/09/21/head-mobile/) — the narrow-width head
  row: 255px at 400px wide down to a two-row layout, three groups behind one `More` button
- [`ai/sessions/2026/09/20/v3-axis-fix/`](/framework/ai/sessions/2026/09/20/v3-axis-fix/) — the earlier pinned-strip
  cap this superseded, kept for its own before/after measurements and reasoning
- [`ai/sessions/2026/09/22/49dfc8b4-d179-4c67-a735-3c9738452615/board-from-events/`](/framework/ai/sessions/2026/09/22/49dfc8b4-d179-4c67-a735-3c9738452615/board-from-events/) — the Agents
  strip and the landed-agent-becomes-a-card fold: proof screenshots, the paint() fix, the
  double-mount finding
- Files: `page.js` (the page, all five views and their routes), `v3.css`, `timeline.js` (the board's data model), `Composer.js`,
  `AskControls.js`, `Demos.js`, `AgentsStrip.js` (the Agents strip)
- [`doc/notes.md`](./doc/notes.md) — comments pruned from `page.js`: history, lessons and design reasons, verbatim.

- Notes: [doc/v3-page-notes.md](doc/v3-page-notes.md) — history and lessons moved out of the code comments.
