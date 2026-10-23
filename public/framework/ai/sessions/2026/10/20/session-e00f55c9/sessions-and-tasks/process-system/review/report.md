verdict: fix
1. [fix] Every shot is a 404: the only page in the diff (`run-1/readmes-page/`, a one-line `TaskPage`) is not on the main site yet. The branch `task/process-system` is not merged and the site serves the main tree. So "visible on the session page" (requirement 3) has no proof, and none of the page systems can be judged. shots/…/sheet.png, all four widths: "Page Load Error", "404 — nothing matches". Re-shoot after the merge, or shoot it from a served worktree.
2. [note] Nothing in the diff changes `TaskView` or `TaskPage`. A process shows on the session page only as a plain Task with subtasks. The phase's session, its pulses and its cost (`measure` lines) are written to the file but not drawn anywhere. requirements.md §3 asks only for "whatever shows today", so this is a note, not a fix.
3. [note] process.md's own "Still open" line: the answer to the creating `item` call carries the instructions for the parent's class, not for the new process. That is a small trap for the next agent that creates a process.
4. [note] "Investigate" exists as its own definition. It does not run as build's first phase yet: phases cannot nest, and parallel scouts are not built. process.md lists both under ⬜ Next, so this is an honest gap, not a hidden one.

Widths given: 400, 1200, 1920, 3440, for one page (run-1/readmes-page). All four are a 404.

## Requirements
- 1 "Study first … note anything broken, stale or self-contradicting and fix the readme in place" — yes — the diff fixes `Servex/readme.md`, `ai/readme.md`, `ai/doc/readme.md`, `ai/doc/readme-system.md` and `ai/doc/code-shape.md`, alongside the code
- 2 "Process extends Task, beside Project … nestable" — partly — `core/Task/Process.js` has `class Process extends Task`, with `DEFINITIONS` and a pure `next()`, and process.md has the class sketch. Phases run in series only; nesting and parallel phases are listed under ⬜ Next
- 2 "start with build (investigate → plan → improve → approve → execute → review → merge) and investigate" — yes — both are in `Process.DEFINITIONS`. Build's `improve` is renamed `improve-plan`, because a phase id must never be a Task method name, and the test checks every definition for that clash. process.md says why
- 2 "Node runs it … pulses agents … never lets a step be forgotten" — yes — `Servex/ProcessRunner.js` writes each `start` line, launches the phase's session (fresh, same, owner or wait), and pulses a turn that ends without the phase complete. A second silent turn puts the phase `waiting`
- 2 "Completion is automatic … the merge is one of its tasks" — yes — the merge is a `wait` phase, and the process completes only when every phase has; the session gets a `{"task": …}` reference line
- 2 "A session is queryable … where the item tool writes raw deltas … where the server instantiates" — yes — process.md, section "Raw deltas in, an instance out" (`live_root` in page_tools.js), plus `Servex/doc/item-tool.md`
- 2 "Robust data from tools … each phase's token share is measured" — yes — `spawn`, `pulse` and `measure` lines are written by node; run 1's table gives the measured cost of each phase
- 2 "Async without dropped balls … write the places messages get lost" — yes — process.md, section "Never dropped": a table of four places a ball drops, each with what closes it
- 2 "Process quality from data" — yes, in short — one paragraph in "Measured, not reported"; the data exists, but nothing judges it yet
- 3 "First slice … visible on the session page" — not shown — the slice is built and tested (`ProcessRunner.test.mjs`, 27 tests), but the page is a 404 in every shot (finding 1)
- 3 "Run one real task through build … record what went wrong; fix the process, not the agents" — yes — process.md, section "Run 1": the readmes page, 7.5 minutes, $4.27. Three breaks are listed, each fixed in ProcessRunner, not by asking the agents to try harder
- Also "Documentation per prompt … put this rule in the mastermind role readme" — yes — the `Servex/agents/roles/mastermind.md` bullet "Document per prompt, as curated knowledge"
- Also "Prompt audit asks: plan that, do not do it yet" — yes — process.md, section "Plan, not built", five steps
- Done when: "first slice at ready-to-merge" — yes for the code; the page proof is missing (finding 1)

## Page structure
- page 1 (the title says what it is) — no — shots/…/1920.png, top band: "Page Load Error" (a 404)
- the rest of page structure — n/a (no page rendered)

## Navigation
- page 13 (identify) — none rendered; the drawer rail and the dictation panel are site chrome
- rest — n/a

## Layout
- n/a — 404 (layout.json: layout "custom", 2 bands, h1 and error)

## Sizing
- n/a — 404; empty 0.85 to 0.92 at every width is the error page, not the work

## Wrapping
- n/a — layout.json wraps: only the error h1 at 400 (2 lines) and the site's own drawer buttons

## Spacing and padding
- n/a — 404 (left_stack h1 28 at 400, 48 at 1200 are the error page's)

## Colour and contrast
- n/a — 404

## Flow
- n/a — 404

## Words
- content (plain, full sentences) — yes — process.md opens with what a process is in two sentences, then a class sketch, then an on-disk example
- content (one takeaway per section) — yes — each section heading says its point ("Draft in the session, then move home", "Never dropped")
- content (no jargon standing in for an explanation) — yes, mostly — the scope note at the top separates this Process from `Servex/Process.js`, `Processes.js` and the old ai/process page
- content (length) — note — process.md is 143 lines. That is acceptable for a deep doc, and the readme links it with one line
