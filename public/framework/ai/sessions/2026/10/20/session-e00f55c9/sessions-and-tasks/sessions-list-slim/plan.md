# Plan: the sessions pages, in the owner's order

Brief: [requirements.md](requirements.md) (five passes). Order from pass 4: **1** the list's slim sticky header, **2** the session detail page (the main job), **3** the list's cards. Each lands before the next starts. One Sonnet minion per sub-step, briefed by the mastermind, in sequence (one page, one minion).

## 1. The list's sticky header (landed, dc05cd9ac)

Brief: [header/requirements.md](header/requirements.md). One sticky row: "Today ▾", search, "Filters ▾" holding every other control; `v/classic/` keeps the old controls as the backup.

## 2. The session detail page

`/framework/ai/sessions/<id>/` is `AISessionDetail` (`ai/AISession/AISessionDetail.js`) with eight tabs today; the Overview is `SessionFeed`, a flat newest-first list of every task (446 task lines on this tab's session `e00f55c9`; the owner: no confidence in what it shows).

### The views (tab row)

**Overview** (default) · **Timeline** · **Chat** · **Tasks** · **More ▾** (Board, Transcript, Cost, Models and tokens, Related, Coverage's old name maps to Chat). `?tab=` keeps working for every old key.

### The data the views share: `SessionOutline` (new, DOM-free)

`ai/AISession/SessionOutline.js`: built from what the page already loads, no new fetch beyond `prompts.jsonl`.
- **Groups = prompts.** A record task with `source.prompt` joins the prompt of that id in the session's `prompts.jsonl` (its `subject` is the group's heading; measured: 294 of 446 tasks on `e00f55c9` carry it). Tasks without one go in one group "Other work".
- **Under a task:** its subtasks (`t._tasks`), and the task folder it points at (`path`), which is a `SessionWork` tree node; a node with `session` is a **child session** (state, model, cost, link) and is drawn on its task's row, not in a separate list. Folder nodes no record task points at are tasks of "Other work".
- **Weight = cost; money printed = `AICost`.** Rows are weighted by `SessionWork`'s rolled cost, but every printed dollar comes from `AICost.summary` / `cost_line` (the deputy, 2026-10-24: the rolled sum adds older, inflated day snapshots).
- **Structure from the record when it has it** (the deputy): Prompt entries in `session.tasks` with asks nested, spawns as Session entries under their task (`../deputy/session-entries/plan.md`). Until then the `source.prompt` join lives in ONE method, `SessionOutline.source()`.
- **Rank:** score = rolled cost × 0.5^(age in days ÷ 2) + a small recency term, so a $40 task from yesterday outranks a $0 ask from an hour ago, and among free asks the newest is first. A toggle "newest first" sorts by time only. Caveat written beside the code: prompt-filed asks have no cost until an agent runs them, so most groups rank by recency; that is intended.

Alternative considered: rank by the prompt order only (simplest, but the owner asked for cost as the main weight). Another: an importance score from the model (costs tokens per view; not now).

### 2a. Overview (landed, e2fc11061: grouped by child session, see the eighth pass)

- One **full-width row per task** (no narrow column; the title wraps over at most two lines on a phone, then ellipsis; full title on open).
- **State icon, ours:** empty circle while open, amber dot running, **green check (`check_circle`, `var(--ok)`) when done**, struck grey when dropped. Never a form checkbox. **No play, pause or stop buttons**: `TaskView.row(t, { verbs: false })` (an additive option in `core/Task/TaskView.js`; the verbs stay on the task's own page).
- **Grouped, never flat:** prompt heading (subject, time, "4 of 9 done", cost) → its tasks → their subtasks folded.
- **Click a done task → its proof** in place: outcome, links (`evidence`, `links`), commit, and the child session link.
- **Live:** redraw on each record replay (the hook `SessionFeed.record` already gets; reuse it).
- Before/after shots of `/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/` at 390 and 1920.

### 2b. Timeline (in flight: [timeline/requirements.md](timeline/requirements.md))

Every line of the session's `session.jsonl` and its prompts (`page.jsonl` Prompt items), in time order, one compact row each: prompt (its subject, cites one click down), task added, task done (green check), child session started/landed (state, cost), note, decision. A **Filters ▾** menu (the same dropdown as the list's header, one component) picks the kinds; default hides `log` and tag lines. Live through the same tail.

### 2c. Chat (dropped for now, ninth pass 2026-10-25: the chat tab IS the shared chat component that mastermind-dictation-2 owns; it stays a slot until that interface is agreed)

The Coverage tab (`AISessionCoverage.records_view`) already is the chat view: a bubble per prompt, a card per part with cites (`S4, S7–18`), raw words one click down. Add, inside each ask card, the flow: its task's state icon (same icon as 2a) → "agent launched" (the child session: state, model, cost, link) → green check when done. Live from the same tail; a new prompt's breakdown appears as `prompts.jsonl` grows. The tab is named Chat; today's Chat (the transcript) moves to More ▾ as "Transcript". **Agree with ai-system-mastermind first** (the chat view is its plan; the deputy said so, 2026-10-24): one message before 2c starts.

### 2d. Tasks

The task list on `ext/DataGrid` (the sessions list's grid, one component for both): one full-width row, filters state · day · kind, so a four-day session is browsed by day.

## The eighth pass (2026-10-25): drill down

The Overview groups by **child session** (past ones included), each holding its tasks, and ends with one group for this session's own unassigned work, sub-grouped by prompt. Every child's heading opens its own `AISessionDetail`, the same component, recursively. A child has no Chat/Coverage tab, because only a VS Code tab processes prompts. This is folded into 2a: [overview/requirements.md](overview/requirements.md). The test path is AI → Sessions → e00f55c9 → deputy → a deputy child.

## Later (the sixth pass, not now)

When a task moves into a session made for it, its old spot stays, dimmed, with a small "moved" arrow that scrolls to the new home; the item there carries a "moved in" arrow top-left. Built once moves exist (item 32 of session-is-a-task).

## Every landing tests the owner's path (seventh pass)

AI → Sessions → find the session → click → the Overview opens by default → the chat tab. A headless shot at each step, at 390.

## 3. The list's cards (landed, 8c19962ad and 817712fc4)

After 2. One white card per root session, children nested inside, the session's own cost labeled as own and the total one click down (one cost function), default range read from the per-level `index.jsonl` files. Briefed when 2 lands.
