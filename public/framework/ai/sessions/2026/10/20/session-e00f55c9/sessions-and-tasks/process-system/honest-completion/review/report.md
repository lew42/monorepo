verdict: fix
1. [fix] The Task readme's example still calls `step1.complete();` with no evidence (requirement 4). Under the new rule that call is refused, so `step1` stays open and the next line, `build.complete({...evidence})`, is refused too. The example no longer runs as written. diff.patch, `core/Task/readme.md` line 655.
2. [note] A tab's spawn gets a parent only if the tab passes its own `session_id` to `spawn_agent` (requirement 3). Only the tool's parameter description says to; no tab-side skill or doc does. So a tab that leaves it out still records `parent=null`. The brief asked for the id to come from the MCP request itself, and the diff does not say whether that is possible. diff.patch, `Servex/agents/tools.js` `tab_parent`.
3. [note] `Task.complete({auto: true})` skips the evidence check for any direct JS caller. The item tool still checks every call (`completion_problem` runs before `auto` is read), so agents can't use it to slip past. Only node code can. diff.patch, `Task.js` complete().
4. [note] When a subtask nested inside a log completes with caveats, no note is added to the parent log (`!at.target.length`). Its caveats are recorded only on its own line in that same file. That matches the code comment, but it is not what requirement 1 literally asks for. diff.patch, `page_tools.js` line 232.
5. [note] At 400 the task rows wrap their four buttons onto a second line, and the tab bar is cut off at "FIL". Both were there before this change, since the page diff touches only one call. shots/monorepo-localhost-framework-core-Task-live/400.png, middle band.

Widths given: 400 and 1920 (one page, /framework/core/Task/live/). Tests were not run by the reviewer (no worktree in the prompt); pass counts are the builder's to report.

## Requirements
- 1 "`complete` needs evidence… refuse with a clear message saying what to pass" — yes — `Task.completion_problem` refuses empty, missing and plain-string evidence and spells out the full argument shape. The item tool refuses before it writes a line (honest-completion.test.mjs checks that the file is unchanged).
- 1 "confidence high | medium | low (default medium); caveats a list (default empty)" — yes — Task.js `claim`, plus tests "confidence defaults to medium" and "refuses a confidence that is not…".
- 1 "plain-string `complete("text")` kept only if refusing breaks Servex; callers grepped" — yes — strings are refused. Callers' prompts are updated (ProcessRunner, Servex.js requested hook, messaging.md). `close_task` writes `closed_by` (TaskLoop.js:405), not `complete`, so it is unaffected.
- 1 "node-written close exempt, say how" — yes — the readme and resolution.md name the exemptions: replay, `auto`, a Project reaching landed, and StaleClose's `stop`.
- 1 "caveats → one line on the parent's log via `parent_log`" — yes for top-level tasks — `tell_parent_caveats` uses `SessionRecord.parent_log`. Nested subtasks: see note 4.
- 2 "`approve` → accepted (`idle`); start is the agent's call; fix callers/tests" — yes — `Task.approve` now sets idle. Task.test.mjs and verb-note.test.mjs are updated, and a new test runs approve then start, ending in running.
- 3 "tab spawns record a parent" — partly — only when the tab passes `session_id` (note 2).
- 3 "clarity and reviewer spawns: parent is the agent whose task triggered them" — yes — `SessionRecord.task_agent` is passed as `parent` in clarity.mjs, review.mjs (both spawns) and owner-check.mjs.
- 4 "update readme / Task docs showing `complete`; tick resolution.md" — no — both build-list items are ticked and the readme rule is added, but the readme's code example still shows a bare `step1.complete()` (finding 1).
- Done "new test: refused without evidence, lands with it, caveat reaches parent log" — yes — `Servex/agents/honest-completion.test.mjs` covers all three.
## Page structure
- page 1 (says what it is) — yes — shots/.../1920.png, top band: the title "Task", the Live tab, and a heading "Live".
- remaining page-structure questions — yes — unchanged layout; the diff's only page edit is the arguments the Complete button passes.
## Navigation
- techniques — tabs, a sidebar, a bottom rail (400), a side drawer (AI panel at 1920)
- tabs on one row — yes — layout.json tab_rows 1 at both widths. At 400 the bar scrolls and is cut at "FIL" (note 5).
- current tab marked — yes — LIVE is underlined in both shots.
- sidebar shows the current page — yes — 1920.png, "Live" is highlighted under Task.
## Layout
- content in a readable column — yes — 1920.png: the intro and task rows sit in the main column, widest text 1240px.
- overflow — no overflow — layout.json overflow_x false at both widths.
## Sizing
- bands sized to their content — yes — the flex band (the task rows) has share 0.54 at 400 and 0.438 at 1920; the title band is 0.04 and 0.053.
- empty space — acceptable — empty 0.47 at 400 and 0.70 at 1920. At 1920 most of the empty space is below a short demo, which is expected for this page.
## Wrapping
- unwanted wraps — note — at 400 the task-row buttons wrap to a second line (shot, middle band). layout.json wraps lists only the rail and drawer icon buttons. This predates the change.
## Spacing and padding
- left edges align — yes — layout.json left_stack has h1 at 28 and p at 28 at 400.
- even rhythm between rows — yes — 1920.png: the three task rows are evenly spaced and the subtasks are indented.
## Colour and contrast
- text legible on its ground — yes — dark text on light grey, and the orange link underline on the cost chip.
## Flow
- reading order matches the steps — yes — the intro tells you to start the parent, then Reset, progress, and the task rows, in that order.
## Words
- the demo copy still true — yes — "press its Complete before both subtasks are complete — it refuses and says why" still holds, since the parent's Complete passes evidence and is refused only for the open subtasks.
- new doc text plain and complete — yes — the readme bullet and resolution.md ticks say what changed, where, and what is exempt.
- the refusal message says what to pass — yes — `complete() needs evidence: pass {outcome…, evidence: […], confidence…, caveats…}`.
