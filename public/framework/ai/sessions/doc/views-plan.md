# Sessions views: the plan (day view, URLs, columns, the session detail)

**Planning only, 2026-10-20.** Nothing on the real sessions pages changed. Three things to look at, in order:

1. **[The prototype: the session view three ways](/framework/ai/sessions/doc/variants/)**: real sessions from 2026-10-20, side by side, one shared progress bar. Pick one.
2. **The recommendation:** places are paths, filters are a query; no Miller columns on the sessions pages; the session page is variant A (inline). Each is a decision with its alternatives in [the task log](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/session.jsonl) (`d-sv-*`). The URL shape and the layout wait on your pick; nothing is built until then.
3. **What is wrong today** (§1): every dated sessions URL renders as three narrow columns of raw folder names, and the session column shows "Cost: not tracked" for a $139 session.

Brief: [requirements.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/requirements.md).

---

## 1. What exists

### The index files: one per level, already written

| File | Size (10/20) | Written by | One row |
|---|---|---|---|
| `sessions/2026/index.json` | 182 B | `AISessionIndex.roll()` (`ai/AISession/AISessionIndex.mjs:445-467`) | `months.{MM}: {days, count, usd, usd_openrouter, flagged}` |
| `sessions/2026/10/index.json` | 1.3 KB | same `roll()` | `days.{DD}: {count, usd, usd_openrouter, flagged}` |
| `sessions/2026/10/20/index.json` | 90 KB, 145 rows | `AISessionIndex.write_day()` (`:320-338`) | a snapshot: `id, folder, title, state, model, usd, tree_usd, children, wall_ms, first_at, last_activity, agent, parent, links{…}, tags, flags` |
| `sessions/2026/10/20/index.jsonl` | 512 KB, 1706 lines | `AIIndexStream.append()` (`Server/AIIndexStream.mjs:17-23`) | one change: `{session:{id, path, url, title, state, at}}` |
| `<session>/index.json` | ~0.6 KB | `AISessionIndex.write(id)` (`:338`) | that one snapshot |
| `ai/index.json` | 2.4 MB | `Server/AIIndex.mjs` | every task: `dir, url, title, state, started, landed_at, agent, session, line` (the outcome) |

So a year page, a month page and a day page can each render from one small file, as you asked. **Gap found:** the month file has no row for the 20th yet (it lists the 1st to the 19th), so the roll-up lags a day. **What is missing:** a session's own task tree. Today it is only in the 2.4 MB `ai/index.json`; the prototype reads that. Proposed: `AIIndex` also writes the rows for one session into `<session>/index.json` (a `tasks` array), so the session page loads one small file.

**Gap found:** `voice-20261020` (the voice mastermind) has no row in the day index, so it shows no cost. `AISessionIndex.record_snap()` exists for record-only sessions but waits for a dev-server restart (readme, "How data gets in").

### The sub-navigation (Sessions, Docs, Readme, Dashboard v2, All versions)

Not pages: one hard-coded array in `AISessionsPage.nav_view()` (`ai/AISession/AISessionsPage.js:155-161`). "Docs" and "Readme" are routes made by `AISessionsPage.docs_page()` (`:636-647`, each a `new Page` showing one markdown file). "Dashboard v2" and "All versions" leave the tab entirely (`/framework/ai/v/2/`, `/framework/ai/v/`). No `page.js`, no `page.jsonl`, no `children:`.

### The grid

`AISessionsPage` (`ai/AISession/AISessionsPage.js`) draws one `ext/DataGrid` (`make_grid()`, `:168-181`). The date is a query, `?scope=2026-10-20` (`set_scope()`, `:143-153`); the header's range menu (`pick_range`; v/classic keeps the old **today** button) changes the scope, it does not link to today's folder; **show 30 more days** (`:243`) loads older day files. A row links to `/framework/ai/sessions/<id>/` (`:173`).

### Routing of a dated URL, and the columns

`AISessionsPage.route()` (`:628-633`): a 4-digit segment becomes `StoreFolder` (`ai/AISession/StoreFolder.js:95-121`), which walks year, month, day, folder and lists the child folders as plain links. Because `AISessionsPage` calls `this.columns()`, each level opens as a Miller column (`core/Page/Columns.js`). Shots (1920): `/sessions/2026/10/20/` is three ~450 px columns of raw paths ("01/card-threaded-replies/card-threaded-replies"); `/sessions/2026/10/20/session-e00f55c9/` adds a fourth column whose Report tab reads "Cost: not tracked … running". At 3440 the columns do not grow, and the rest of the row is empty.

### The session detail (flat URL)

`/framework/ai/sessions/<id>/` is `AISessionDetail` (`ai/AISession/AISessionDetail.js`), opened as a column beside the grid: tabs Conversation, Coverage, Cost, Models and tokens, Related (`:134-141`). The Conversation tab opens on a Raw box with two links (`task.jsonl`, `transcript`) and an empty area whose height is `max(22em, 100dvh - 20em)` (`sessions.css:200`): the stray file box you saw. It shows no tasks.

### The classes

`Session extends Item` (`core/Session/Session.js:12`) already has a `tasks` list and `progress()` (`:20-26`, via `Task.progress_of`, `core/Task/Task.js:141`). `Task extends Item` (`Task.js:33`), `Project extends Task` (`Project.js:7`, `completed` = mean of the children, recursive). `TaskView.row` (`core/Task/TaskView.js:46-74`) already draws one bar segment per child.

### The day page under ai/<date>/

Commit `4792d3494` made `/framework/ai/2026-10-20/` an `AIDay` page (`ai/AIDay/`, route in `ai/page.js`). Before it, the same route drew the old `dashboard(this)` day page. Proposed (`d-sv-aiday`): redirect `/framework/ai/<date>/` to `/framework/ai/sessions/YYYY/MM/DD/` once the day view exists, and move `ai/AIDay/` to an archive path.

**Screenshots** (pictures and the Shots log are git-ignored by rule, so they live on this machine only): [Shots](/framework/ext/Shots/), rounds `2026-10-20-2223*` for `/sessions/`, `/sessions/2026/10/20/`, two session folders and `voice-20261020`, at 400, 1920 and 3440; `2026-10-20-222936` for the flat detail; `2026-10-20-222724` for the prototype.

---

## 2. URL options

| | Option A: places are paths, filters are a query (**recommended**) | Option B: everything in the query (today's grid) | Option C: flat ids |
|---|---|---|---|
| Year | `/framework/ai/sessions/2026/` | `/framework/ai/sessions/?scope=2026` | `/framework/ai/sessions/?year=2026` |
| Month | `/framework/ai/sessions/2026/10/` | `?scope=2026-10` | `?month=2026-10` |
| Day | `/framework/ai/sessions/2026/10/20/` | `?scope=2026-10-20` | `?day=2026-10-20` |
| Session | `/framework/ai/sessions/2026/10/20/session-e00f55c9/` | `?scope=2026-10-20&session=e00f55c9` | `/framework/ai/sessions/e00f55c9/` |
| Task | `…/session-e00f55c9/sessions-and-tasks/dictation-map/` | `…&task=…` | none |
| Filter | any of the above + `?kind=mastermind&q=dictate` | the same query | the same query |
| Cost | three small views (year, month, day) replace the column listing; the flat id redirects | nothing new | two addresses per session forever |

Option A matches the store on disk, makes **today** a plain link to today's folder, and each page reads the one index file at its own level. The query only narrows. Decision: `d-sv-urls` (yours to approve).

---

## 3. The day view and the detail view

**Day** (`/sessions/2026/10/20/`, reads only `2026/10/20/index.json`; live from `index.jsonl`):

```
 ‹ 19   Tuesday 20 October 2026   21 ›            145 sessions · $894 · [today]
 [search…]  [kind ▾]  [show closed]
 ───────────────────────────────────────────────────────────────────────────
 ▣ Session and task systems documentation   ▰▰▰▰▱ 80%   7 h 26 m   $216   Opus
     session-e00f55c9 · 30 tasks
 ▣ Voice mastermind                          ▰▰▰ 100%    4 h 28 m   —      voice
 □ Worktree qf-7                             ▰▰ 100%     2 h 44 m   $1.17  Sonnet
```

One row per snapshot: title (the nickname), the bar, `wall_ms`, `tree_usd`, `model`. A click opens the session page. Agent sessions that did a task for another session fold under it (`parent`).

**Session** (`/sessions/2026/10/20/session-e00f55c9/`): variant A of [the prototype](/framework/ai/sessions/doc/variants/):

```
 Session and task systems documentation          ← nickname (written by a tool)
 session-e00f55c9                                ← the path, never changes
 ▰▰▰▰▰▰▰▰▱▱ 80%
 duration 7 h 26 min · cost $216.88 (29 agent sessions included) · model Opus 5.5
 • day page  • AI index day stream  • Projects: Project class …   ← summary bullets
 ▣ Sessions and tasks: the shape decided …     ▰▰▰▰▱ 80%
    ☑ day page
    ▣ Phone sheet: reconnects …                ▱ 0%     ← its one child is still "running"
       □ Find the owner's dictated chat-well …
 Conversation · Cost · Related                   ← one row of links, not a tab bar
```

**The bar** (`SegBar`, shared by all three variants): N children = N equal segments; a finished child is lit, a half-done child fills its segment halfway at half strength; past 12 it becomes one meter. A leaf row has no bar (its checkbox says it). Short titles keep the bar beside them; long ones wrap it below. Proposed home: `TaskView.bar` (`core/Task/TaskView.js:65`), so one fix updates every task row on the site.

**The real data shows a trap:** a project that landed reads 0% when a forgotten child is still "running" (`mobile-sheet/well-asks`, `session-record/probe`). The bar is honest; the fix is that `finish-task` closes or lists open children.

**Nickname and bullets** (`d-sv-nickname`): a node tool at finish-task writes one `{nickname:{text, bullets}}` line to `session.jsonl`; the index copies it. Until then the prototype computes the bullets from the landed task titles.

**Chat**: one link on the session page (Conversation), not a tab: it is another view of the same session. Dictation stays the chat box's job (plain voice-to-text) or the voice assistant's (live): see [ux/Dictate](/framework/ux/Dictate/).

---

## 4. Columns

| Rank | Option | Evidence |
|---|---|---|
| 1 | **Not on the sessions pages.** Each place is a full page; tasks open inline. | Shots: every dated URL is cramped columns of raw folder names, empty at 3440. `core/Page/doc/columns.md` ("The empty room", `:610-643`): 80% dead at 1280, 93% at 3840, and the fix that filled the room was rejected. You asked for fewer layers. |
| 2 | Simplify to at most two columns (list + one reader) | Keeps the empty-room problem. |
| 3 | Keep as is | Today's shots. |

Only `AISessionsPage` would stop calling `this.columns()`; the column demos and labs stay. Decision: `d-sv-columns`.

---

## 5. Session extends Task

Recommended (`d-sv-session-task`, confidence 0.6): `class Session extends Task`, so a session has the same state, `progress()`, `completion` and `duration()`, and is one segment of its parent's bar. The alternative is to keep `Session extends Item` and share only the counting, as today. The move touches `core/Session/Session.js` (its statics `days`, `slugs`, `scan`, `locate` come along) and needs `Task`'s legacy replay not to misread a `session.jsonl` line 1.

---

## 6. The prototype

[`doc/variants/`](/framework/ai/sessions/doc/variants/): `VariantsPage extends Page` ([VariantsPage.js](variants/VariantsPage.js)), `SessionTree` (reads `ai/index.json` and the day index, builds the tree; [SessionTree.js](variants/SessionTree.js)), `SegBar extends View` ([SegBar.js](variants/SegBar.js)). Every choice is in the URL (`?s=` session, `?a=`/`?b=`/`?c=` the task open in each variant). It opens as a `full` column because it lives under the sessions page.
