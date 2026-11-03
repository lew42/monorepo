verdict: fix
1. [fix] The Overview's "Total" double-counts: `counts()` is given every record task, including ones whose `path` is a folder already listed, and then adds every folder node (`SessionTree.Node.all()` includes the node itself). The draw drops those duplicates but the count keeps them — public/framework/ai/AISession/SessionFeed.js:363 (pass the filtered `own` for the deep count and count unfiltered only for "Own"). The "Total: 471" in live-1920.png is inflated by this.
2. [fix] Older child rows are matched to a session by the parent's name with only a lower time bound, so every `vscode-mastermind` child spawned after 10/20 by ANY later tab counts as e00f55c9's child and adds to its cost — Servex/agents/Agents.js:52-53 (`started_at >= since`, no end). The brief (item 3) asked to map the existing `vscode-mastermind` rows to `e00f55c9`; either bound the match by the next session that used the name, or run the one-off mapping script (dry run + manifest) that the doc defers (core/Session/doc/session-is-a-task.md, last bullet).
3. [fix] Item 4 / Done-when: the session page should show cost and duration computed from the children, but the cost tile still reads "…" in live-1920.png and live-1920-board.png (top band), and the page shows two disagreeing counts ("49 of 83" in the stats bar against "Own tasks: 227" in the feed). Make one count the page's count, or label each one so it says what it counts.
4. [fix] Done-when says the page is "reached from the AI page". review-notes.md (gap 1) says e00f55c9 is in no day's `index.json`, so it opens only by url. That is a miss of the owner's stated check, not just a worktree limit. It can be queued, but the review can't call it met.
5. [note] Part 3, 12c parts 2–3 (the session names its children in its own record; per-scope `index.jsonl`) are planned in slow-write.md but not built. The write target is met (5–7 ms, slow-write.md table) and the plan is reasonable, but `agents_under` now scans the registry more widely than before (3.3 s cold, slow-write.md), which goes against the owner's "no scan of a global registry".
6. [note] Part 5 items 21/21b (`Prompt extends Task`, the plainer list name) are not in this diff, and review-notes.md doesn't list them among the deputy's items (it says 1–7, 10–13, 20). Say where they went.
7. [note] Servex/agents/session_tasks.test.mjs:222 writes a scratch session folder into the live `public/framework/ai/sessions/2026/10/16/` tree. That fires the dev server's watchers, and a crash mid-run leaves a dotted folder behind. It also uses `node:assert`, not `core/Test` as item 11 asks. An OS temp dir (or `Registry`'s `dir`-style override) would be safer.
8. [note] `Task.List.make` (public/framework/core/Task/Task.js:787) slugs a string to an id but does not check for an existing child with that id. Adding the same title twice in the browser gives two tasks with one id (the item tool checks; the class doesn't).
9. [note] Simpler: `Task.slug` (Task.js:790) and `slug_of` (Servex/agents/page_tools.js:125) are the same function written twice. page_tools could import `Task.slug` (one of everything, law 6).
10. [note] In the feed rows the right-hand ▶/■/✓ controls jump between two columns from row to row (live-1920.png, lower band, rows 1–5 against rows 6–8). That is ragged at 1920.

Widths given: 1920 only (live-1920.png, live-1920-board.png, reach-1920.png). No layout.json, so not measured.

## Requirements
- 1 "Session extends Task" — yes — core/Session/Session.js:504; tests session-task.test.mjs and session_tasks.test.mjs
- 2 "tasks.add takes anything" — yes — Task.List (Task.js:786), page_tools.js:182 string → object, task_type for Project/Process/Session
- 3 "child linked to parent session id; map vscode-mastermind rows" — partly — `parent_session` recorded at spawn (Agents.js:32, Registry.js:95); old rows not mapped, matched by name with no upper bound (finding 2)
- 4 "numbers computed live" — partly — counts are computed, but Total double-counts (finding 1) and cost shows "…" (finding 3)
- 5 "tokens attributed to tasks, untracked shown" — yes in code (Task.attribute, tested) — no for a VS Code tab, which has no turns (`by_task` null), so this session shows none
- 6 "indexing instant, proved by a test" — yes — session_tasks.test.mjs adds, reads back, replays
- 7 "one readme flow" — yes — core/Session/readme.md "How work gets into a session"; core/Task/readme.md has the add forms
- 10 "planned migration, old records read the same" — yes — doc/session-is-a-task.md caller table; migrate-check.out.txt 97 of 97 same
- 11 "tests in core/Test" — partly — session-task.test.mjs uses core/Test; session_tasks.test.mjs uses node:assert (finding 7)
- 12/12b/12d "fast write, measured" — yes — slow-write.md: 20 s → 5–7 ms, read 21 s → 56 ms warm
- 12c "built from its own session.jsonl; per-scope indexes" — no — planned only (finding 5)
- 13 "one source of truth in the readme" — yes — core/Session/readme.md "One source of truth: the file"; one parent reference chosen (session id for sessions, path for tasks), with the reason given
- 20 "long session reads fast" — yes — slow-write.md item 20: replay 4–11 ms, no checkpoints needed
- 21/21b — n/a in this diff (finding 6)
- Done-when "page lists every child and task newest first, own and total counts, cost and duration, reached from AI page" — partly — findings 1, 3, 4
- class page for live instances — note — Session/Task already have core pages; nothing new needed

## Page structure
- page 1 — yes — live-1920.png: the title and the stats bar say what it is
- one takeaway — partly — two counts compete (finding 3)
## Navigation
- techniques — tabs (chips), a sidebar
- the new Overview/Board split keeps tab order stable, with `?tab=` for reload — yes — AISessionDetail.js:275
## Layout
- yes — live-1920.png: the feed is capped at 70rem in the centre column; the board at 1920 shows four columns
## Sizing
- yes — rows read at full width with no squeeze at 1920
## Wrapping
- yes — long titles wrap to two lines cleanly (live-1920.png, last rows)
## Spacing and padding
- note — the right-hand controls in feed rows are misaligned (finding 10)
## Colour and contrast
- yes — the dropped rows are dimmed (opacity .5) but still readable; links are underlined in accent
## Flow
- yes — stats, then tabs, then the list; newest first
## Words
- partly — "Own tasks: 227 · Total: 471 · newest first" has no word for what Total counts (tasks plus child-session folders); "queued or waiting" reads well
