verdict: fix
1. [fix] The priority column doesn't rank anything you can see: the top 10 rows (at least) all score 0.74, all cost $6.05, are all "Big thing #1" and all re-asked 0×. That fails the owner's "prioritizes things based on cost … priority … if I keep asking" (Requirements 3). Evidence: shots/…-queue/3440.png, rows 1–10. plan.md names this weakness, but the look is the thing being approved. Before the shot is shown, the estimate needs to vary per task (by template or by title), or the tie-break needs to show (oldest first).
2. [note] On a phone the summary column ("143 tasks queued", the three big things, the formula) is moved below all 20 cards (`.tq-side { order: 2 }`). The reader sees 20 identical 0.74 cards before learning what the page is (page structure). Evidence: shots/…-queue/400.png, where nothing above the list says what is ranked or how.
3. [note] At 3440 the table columns spread out: each title ends near x≈830 and its Why starts at x≈1090. Cost, Big, Re-asks and State float far to the right of the Why. The row is hard to read across (layout/sizing). Evidence: shots/…-queue/3440.png, list band; layout.json widest_text 705.
4. [note] "Big thing #1" repeats the "serves priority 1: See and approve the work" text in the same row, so each card says it twice (words). Evidence: shots/…-queue/1200.png, every row.
5. [note] `ai/queue/files.jsonl` records two sed temp files (`sedWxAbd7`, `sedNaddHh`) and then marks them gone. These are junk lines in the folder's file index (diff, files.jsonl lines 6–9).
6. [note] Every width logs a 404 (layout.json errors, both pages). The missing resource isn't named; check whether it is the queue page's.
7. [note] Law 6: `TaskQueue` is a second ranking beside `Task.rank`. what-exists.md gives the reason (neither ranks by cost or re-asks), and the reason is sound. TaskLoop doesn't read it yet, so for now there are two orders.

Widths given: 400, 1200, 1920, 3440 for /framework/ai/queue/ and /framework/ai/ (the diff adds a child tab to the AI page).

## Requirements
- 1 "find what exists (one queue, not a second one)" — yes — what-exists.md covers TaskLoop, Dispatcher, Task.rank, priority.md, triage, asks, Refine and the tasks source, and names what each becomes
- 2 "the class sketch … name and home first … properties from records … formula … numbers that tune it" — yes — plan.md: `TaskQueue` in core/Task, a property table, the formula, and the `IMPORTANCE`, `REASK_WEIGHT`, `COST_K`, `FALLBACK_USD` and `MIN_SAME_MODULE` statics
- 3 "a task queue that prioritizes things based on cost, estimated cost, … priority or importance … if I keep asking" — no — the formula is there, but the shown top 10 tie at 0.74 / $6.05 / #1 / 0× (3440.png)
- 4 "one page listing the top 20 of the real queue … what, why, cost, priority, state" — yes — "Top 20 of 143" with title, breadcrumb, why + (source), cost, big, re-asks, state and score (1200.png, 3440.png)
- 5 "you should be able to link me to it" — yes — /framework/ai/queue/ is a QUEUE tab on the AI page (all widths)
- 6 "I can see how it works in real time … how the agents are spawned" — partly — QueryClient push with no polling; running rows show the agent id, but the shots have 0 running ("0 running, 46 waiting"), so it's unshown
- 7 "Read only. Don't change TaskLoop or the Dispatcher" — yes — the diff doesn't touch either
- 8 "shoot it headless at 400 and 1200 … link the shots from plan.md … stop" — yes — plan.md links queue-400/1200/1920 png (it also commits 3440)
- Class page: "can you open a page that shows its live instances and their properties?" — yes — /framework/ai/queue/ lists TaskQueue's live rows with every property

## Page structure
- title says what it is — yes — "Task queue", top band, all widths
- one takeaway visible first — no at 400 (finding 2), yes at 1200+ (summary column on the left)
- page sits in its parent — yes — the AI page's children, a QUEUE tab

## Navigation
- techniques — tabs (the AI page tabs), a sidebar (site menu), a right AI drawer at 1920+, a bottom rail at 400
- tabs fit one row — yes — layout.json tab_rows 1 at every width; at 400 the strip scrolls ("S…" cut off at the right)
- current tab marked — yes — QUEUE is underlined, 400.png and 1200.png
- stable navigation — yes — the same chrome as its sibling AI tabs

## Layout
- layout fits the content — yes — a summary column beside the list from 1000 px, cards below that, a table at 60em+
- columns earn their width — no at 3440 (finding 3); yes at 1200/1920
- no horizontal overflow — yes — layout.json overflow_x false at all widths

## Sizing
- text measure readable — yes — widest_text 282/426/627/705
- band shares sensible — yes — the page-title band is 0.04–0.059; tq-view fills the rest
- empty share — yes — 0.28/0.38/0.41/0.47, which is the scroll list plus the drawer at wide widths

## Wrapping
- unwanted wraps — no unwanted wraps in the new UI — layout.json wraps lists only shared chrome (drawer-rail buttons, mode-btn, dictate widget); titles wrap to 2 lines on cards at 400/1200, which is fine

## Spacing and padding
- padding consistent — yes — left_stack p 31/56/60/68 px grows with width; cards have even 0.6/0.8em padding
- space between title and content — yes, slightly generous — about 45 px between the page-title band and tq-view at 1200 (bands y 70+49 → 164)
- gaps between rows — yes — 0.5em card gap, 400.png

## Colour and contrast
- text contrast — yes — dark on light; the muted crumbs are still legible (1200.png)
- links distinguishable — yes — "(source)" has an orange underline
- state colour — n/a

## Flow
- reading order — no at 400 (finding 2); yes at 1200+: summary → list
- live updates without reload — yes — QueryClient `row` pushes into `change()`

## Words
- plain sentences — yes — "Every number is computed from the task records, never written by an agent. It updates live."
- no repetition — no — "Big thing #1" repeats "serves priority 1: …" (finding 4)
- owner's vocabulary — yes — "big thing", "re-asks" and "queue" come from priority.md and the owner's words
