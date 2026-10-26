verdict: fix
1. [fix] The shots in the task folder are of a 404: review.mjs shot monorepo.localhost, where the branch isn't merged (layout.json errors: `404 — nothing matches "/framework/core/Task/process/"` at all four widths). I judged the page from my own headless shots of the worktree server, `qf-6.localhost`, at 1200 and 400. Re-run review.mjs against the worktree before merging.
2. [fix] The step list wraps badly and its columns don't line up (layout 2, wrapping 1). Each row is its own flex line, so the state, session and cost columns start at a different x on every row. At 1200, step 3 wraps to three lines ("✓ / complete", "improve-plan"). At 400, every row wraps the step name, the tick and the agent name onto 2–3 lines. It needs one grid, with columns sized to their content, and at 400 the session on its own line under the name.
3. [note] The h2 headings are bigger than the content they head (sizing 3). "A real run: the readmes page, through build" takes 2 lines at 1200 and 3 at 400, which is more space than the step rows below it. A shorter heading or a smaller size would fix it.
4. [note] The run reads "state **stopped**" while step 7 shows "waiting", and the page doesn't say why. The data is real, so explain it in one line, e.g. "stopped by the owner before merge".

## Requirements
Widths given: 400, 1200, 1920, 3440 for /framework/core/Task/ and /framework/core/Task/process/, but every shot of the new page is a 404. My evidence is my own headless shots of qf-6.localhost (worktree) at 1200 and 400.
- 1 "A page for it… a child page of core/Task/, declared in its parent's children:, linked from core/Task/readme.md" — yes — diff: `this.declare("process")` in core/Task/page.js, and a link in readme.md; qf-6 1200 shows it as the PROCESS tab and in the sidebar
- 1a "the class… how the templates extend it, properties and API, each in plain words" — yes — the Doc has `subject: Process` and properties/methods (API sub-tab); Process.js comments every getter and method; the "The templates" section lists build/design/investigate and says each is a subclass with `static steps`
- 1b "a live demo with real data… steps, their states and the session each step ran in. No invented data" — yes — qf-6 1200: 7 steps of the readmes-page run fetched from its task.jsonl, each with state, `fresh: helper-…` session and measured cost
- 1c "one screen at level 1: shown not told; detail nested" — yes — 1200: an intro of three lines, then the run, all above the fold; the design doc sits in `md.details`
- 2 "does finishing step N inject step N+1's instructions… write the answer (file:function) on the page and in process.md" — yes — the answer is Yes, with ProcessRunner `step/run/launch` and Process `next/prompt`. That matches Process.js `next()` and `prompt()` (prompt carries `do`, the brief and earlier outcomes). The existing test "plan runs in the same session, told what investigate found" is at Servex/ProcessRunner.test.mjs:64, so no new code was needed
- 3 "index the new page in its parent readme and files.jsonl; update process.md" — yes — readme.md link, files.jsonl `process/`, and a new process.md section
- 4 "check_page, a headless look at 1280 and 3440, the Task tests" — not verifiable from the diff — session.jsonl says the minion took its shots on qf-6; there is no test or check_page output in the folder
- class page with live instances — n/a — no class added or changed (Process.js untouched)
## Page structure
- page 1 (the title says what it is) — yes — qf-6 1200: the Task title plus the PROCESS tab, and the description line "A Task whose children are named steps…"
- page 2 (one takeaway at level 1) — yes — the intro sentence, then a real run
- page 3 (detail nested) — yes — the design doc is behind details; API and Files are sub-tabs
## Navigation
- navigation 1 — tabs (Task's top tabs), second-level tabs (Overview · API · Files · Tasks · Inbox), a sidebar, and a bottom rail at 400
- tabs: one row, stable — yes — qf-6 1200: the top tabs fit on one row; at 400 they scroll sideways (LIVE is clipped at the left edge, which is expected for a scrolling row)
- the active tab is marked — yes — PROCESS is underlined in orange; the "Overview" sub-tab is marked too
- sidebar shows where you are — yes — Core › Task › Process is highlighted
## Layout
- one constrained column — yes — the box is capped at 60em; at 1200 the text column is about 600px
- columns align across rows — no — the step rows are separate flex lines, so the state column wanders (finding 2)
## Sizing
- text measure readable — yes — about 70 characters at 1200
- headings in proportion — no — the h2s are 2–3 lines and outweigh the content (finding 3)
- widest element fits — yes — no overflow_x on the worktree shots by eye
## Wrapping
- nothing wraps that shouldn't — no — at 1200 step 3's state and session wrap; at 400 every step row wraps to 2–3 lines (finding 2)
- the code block wraps or scrolls cleanly — not seen — it is below the fold in my shots
## Spacing and padding
- the gap between steps is even — no — rows that wrap are taller, so the row rhythm breaks at 400 and at step 3 at 1200
- the page padding scales with width — not measured (the layout.json is of the 404); by eye it looks right at 1200 and 400
## Colour and contrast
- state colours readable — yes — "complete" is green and "waiting" is amber, each with a mark (✓, ⏳), so the state does not depend on colour alone
- muted text contrast — yes — the session and cost text is grey on light grey and readable at 1200
## Flow
- the reading order is right — yes — what it is → a real run → the N+1 answer → the templates → the design doc
- a link back to the source — yes — "its log" links the real task.jsonl
## Words
- plain sentences — yes — the intro is clear: "No agent has to remember the order."
- jargon explained — partly — the N+1 paragraph strings together `step()`, `run()`, `{start: N+1}`, `{launch: N+1}` and `launch()` in one long paragraph. That is fine for the detail level, but a one-line plain answer before it would help: "Yes: node sends the next step its instructions."
- no history in the docs — yes — the process.md section describes the code as it is now
