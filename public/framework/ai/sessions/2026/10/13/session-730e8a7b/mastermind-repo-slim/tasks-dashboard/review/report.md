verdict: fix
1. [fix] Nothing starts `TaskState --watch`: no file under Server/ or Servex/ imports or spawns it (grep), yet `tasks/readme.md` says "the dev server's side keeps it fresh". With no watcher, the page shows the last line of state.jsonl, so "22 min ago" and the ⚠ marks freeze (requirement 1, "the page tails it live"). Either wire `TaskState.watch()` into the dev server or Servex (as the doc's own Servex-hook decision says), or correct the readme.
2. [fix] The readme's "with no dev server running the page says so instead of showing stale counts" is false. The empty note shows only when state.jsonl has no line at all, and an old file still renders as if it were current (content: words must be true). Fix: show the snapshot's `at` age, and mark the view stale when it is over about 30 s old.
3. [note] Each in-flight row's second line repeats its title as the agent id (`task-mastermind-dictate-next-4 · claude-sonnet-5-5`, shots/…-tasks/1920.png, band 2). The model alone, or the cost, would say more.
4. [note] doc/architecture.md says "landed today = under today's session folders", but `landed_today()` also walks yesterday's folder. Make the doc say both.
5. [note] The Lanes and Architecture tabs were not shot. Requirement 2 is judged from the code only.
6. [note] At 3440 the List pane leaves 77% of the screen empty (layout.json empty 0.772): the detail pane stays blank until a row is picked. That is normal for Browse, but at this width Lanes would use the space. The readme already says so.

Widths given: 400, 1200, 1920, 3440 for /framework/ai/tasks/ and /framework/ai/.

## Requirements
- 1 "one list with three groups in this order: In flight, Queued, Landed today" — yes — shots/…-tasks/1920.png: In flight 5, Queued, Landed today 8, in that order
- 1 "minutes since its last log line; a quiet one marked ⚠ after 5 min" — yes — 400.png: "22 min ago" with ⚠; the 3-min row has no ⚠
- 1 "Landed today (most recent first, title and the landing line's first sentence)" — yes — 1920.png: 7:15 PM above 7:04 PM, each with a title and a sentence
- 1 "Clicking a row opens the task's card in the detail pane (the list stays)" — yes (from code) — route() returns an `AITask` for a `YYYY~` id inside Browse; a click was not shot
- 1 "one node endpoint or stream (Server/TaskState.mjs, class TaskState …) tails it live, never a timed refresh" — partly — the browser tails JSONL, but nothing keeps the writer running (finding 1)
- 2 "One alternate UI, as a second tab of the same page" — yes — the Lanes tab (`TaskLanes`, same TaskStateLog); not shot
- 2 "say in the readme which you recommend and why in two lines" — yes — readme: "I recommend the List…"
- 3 "Linked from the AI page's rail and the ai/readme.md index" — yes — `tasks` was added to the ai/page.js children, and readme.md has a Tasks line
- 3 "docs inside the module (readme.md, doc/architecture.md with the class list)" — yes — both are in the diff
- 3 "check_page at 400/1200/1920/3440, shots in this task dir" — yes — shots/ holds all four
- 3 card, landing line, merge.mjs — n/a

## Page structure
- page 1 (title says what it is) — yes — 1920.png: "Tasks", under the AI tab
- page 2 (one takeaway) — yes — what is working, waiting and done today
- page 3 (most important first) — yes — In flight is first
- page 4 (routed views) — yes — /tasks/, /tasks/lanes/, /tasks/architecture/ and /tasks/<id>/ each have a URL

## Navigation
- navigation 1 — tabs (List · Lanes · Architecture) and a list → detail (Browse) pattern
- tabs fit on one row — yes — layout.json: tab_rows 1 at 1200, 1920 and 3440; the 2 rows at 400 are the AI chrome above, not this diff
- current tab marked — yes — LIST is underlined in all shots
- list stays when the detail opens — yes (from code) — Browse

## Layout
- the layout suits the content — yes — a list and a detail pane, like every other Inbox page
- the main content is above the fold — yes — 400.png: all of In flight and the start of Landed fit in the first screen

## Sizing
- the list pane is a sensible width — yes — 1920.png: about 640 px, rows easy to read
- wide screens use the space — partly — layout.json empty 0.772 at 3440, because the detail pane is empty (finding 6)

## Wrapping
- no unwanted wraps — yes — the only wraps in layout.json are shared chrome (drawer-rail, mode-btn); overflow_x false at every width
- long titles wrap cleanly — yes — 1920.png: the two-line landed title keeps its time on the right

## Spacing and padding
- consistent padding — yes — the rows and group heads use `--pad-card`
- rhythm between groups — yes — 1920.png: Queued and Landed today are set apart on a grey band
- rows not oversized — note — 1920.png: in-flight rows are about 97 px for two short lines, a little airy

## Colour and contrast
- readable contrast — yes — dark text on white rows, muted foot lines still legible
- status colour has meaning — yes — the orange ⚠ and the badge use `--prime`

## Flow
- reads top to bottom in the order of importance — yes — working, then waiting, then done
- empty states say something — yes — "Nothing is waiting." (1920.png)

## Words
- plain and true — no — the readme's two claims about freshness are wrong (findings 1 and 2)
- the readme is short and an index — yes — 17 lines, linking doc/architecture.md
- jargon explained — yes — "quiet", "landed" and "registry" are each explained in a line
