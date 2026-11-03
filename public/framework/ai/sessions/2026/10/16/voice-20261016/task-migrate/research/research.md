# Old tasks → the new Task system: research

Read-only survey, 2026-10-16, worktree `task-migrate` (matches michael/dev). Every number below is from a node script, not by hand. Scripts (scratchpad, outside the repo): `C:/Users/mike/AppData/Local/Temp/census.mjs` (counts, kinds), `c2.mjs` (titles, samples), `c3.mjs` (module signals), `c4.mjs` (state.jsonl, slug clashes, nesting). Raw output: `census.json`, `tasks.json`, `rows.json` beside them. Rerun them before migrating; the tree moves.

---

## 1. Counts

| What | Count |
|---|---|
| Task dirs (a dir holding `task.jsonl`) under `ai/sessions/**` | **1,658** |
| Task dirs in older dated dirs (`ai/2026/**`, `ai/2026-10-13/`) | **0** (those dirs hold only `files.jsonl`; the old flat days were already moved by `Server/TaskMove.mjs`, ledger `ai/sessions/task-moves.jsonl`) |
| Total `task.jsonl` lines | **42,574** (0 unparseable) |
| Session folders (uuid, `session-…`, `voice-…`) | 812 dirs; 597 hold a `session.json(l)`. 514 tasks sit under one of them; the other 1,144 sit directly under a day folder |
| `requirements.md` files | 1,430 |
| …with no `task.jsonl` beside | 113 |
| `task.jsonl` with no `requirements.md` | 341 |
| Tasks with a landing line (`assign.landed_at`) | 1,255 (1,229 via `assign.landed_at`, others via a top-level `landed_at`) |
| Tasks with `closed_by` (closed, not landed) | 14 |
| Open (neither) | **397** (Aug 4, Sep 82, Oct 311): many are abandoned, not live |
| Nested (an ancestor dir is also a task dir) | **532**; only 159 also name `assign.parent_task` that exists |
| Tasks by month | Aug 374, Sep 648, Oct 636 (day dirs 2026/08/14 on) |
| Tasks with a title in `assign.title` | 399 (the rest are title-less, see 5) |
| Tasks with `cost`/`cost_usd` | 247 |
| Tasks with `assign.card` | 398 |
| Tasks whose line 1 is already new format (`{id,path,parent,…}`) | 0 in `ai/sessions` (the 47 new-format tasks live in module homes, see 3) |
| Slugs shared by more than one task (flat-slug clash) | 40 slugs, 104 tasks (`build` ×11, `feedback-council` ×6, `layout-system` ×4, `servex-mastermind` ×4) |
| Slugs longer than 40 chars (new `slug_of` truncates at 40) | 97 (max 79) |
| `ai/tasks/state.jsonl` (TaskState output) | **331 lines** in the main tree, 18 distinct task ids (see 2). Gitignored, so absent from the worktree |
| `ai/tasks/` index entries | the folder is a page + the 2-line `task.jsonl` for its own home; there is no per-task index file other than `state.jsonl` |
| `/tasks/` index (`public/tasks/task.jsonl`) | 6 lines: line 1 + 5 home references |

### Line kinds in old `task.jsonl` (top-level key → lines)

`log` 21,689 · `assign` 8,308 · `action` 5,687 · `review` 2,180 · `agent` 1,833 · `decision` 1,309 · `chat` 386 · `ask` 334 · `shots` 159 · `experiment` 154 · `shot` 147 · `card` 93 · `at` 88 · `commit` 50 · `step` 49 · `task` 48 · `by`/`ts` 47 · `group` 33 · `now` 40 · `note` 25 · `type` 24 · `outcome` 25 · `landed_at` 32 · `verdict` 16 · `steps` 13 · `session_id` 12 · plus about 35 kinds under 10 lines each (`snooze` 5, `rank` 5, `review_reply` 7, `spend` 5, `launch` 5, `answer`, `reply`, `vote`, `worktree`, `branch`, `finish`, `wait`, `approve`, `start`, …).

`assign` is where the task's facts live. Keys inside `assign` (lines): `step` 4,726 · `now` 4,139 · `cost_usd` 2,442 · `cost` 2,439 · `steps` 1,789 · `window` 1,749 · `model` 1,629 · `session_id` 1,615 · `requested_at` 1,589 · `links` 1,525 · `outcome` 1,503 · `landed_at` 1,430 · `tokens` 1,143 · `request` 945 · `group` 943 · `tab` 927 · `agent` 688 · `brief` 585 · `title` 497 · `card` 417 · `usage` 353 · `parent_task` 288 · `worktree` 249 · `highlight` 133 · `worker` 34 · `effort` 31 · `budget_usd` 25 · `closed_by` 14 · `parent` 6.

Line 1 shapes (1,658 tasks): `assign` 1,625 · `review` 11 · `landed_at,outcome` 4 · `log` 3 · `shots` 2 · `rule_test_append` 2 · a dozen one-offs (`slug,step,steps,title`, `at,launch`, `at,session_id,type`). So 33 tasks do not start with an `assign`.

---

## 2. Old schemas

**Append-only, one JSON object per line, the first key names the kind.** No schema file; `Task.replay` (`core/Task/Task.js`) is the only reader that treats it as one object.

```jsonc
// assign — a snapshot of fields; later lines overwrite earlier ones (latest wins)
{"assign":{"session_id":"44287d42-…","agent":"task-mastermind-nested-tasks","card":"2026/09/29/lifecycle-nothing-left-…","brief":"public/framework/ai/2026-09-29/nested-tasks/requirements.md","model":"claude-opus-5-5","requested_at":"2026-09-29T17:42:35-05:00","now":"review found 11 …","steps":["data rule + tree.js (minion A)","…"],"step":5,"worktree":"C:/Code/lew42/worktrees/qf-5","parent_task":"public/framework/ai/2026-09-29/servex-mastermind","cost_usd":9.11,"cost":{"root":"…","agents":[{"id":"…","model":"…","usd":1.98}]}}}
// landing: assign again, with landed_at + outcome (prose, often markdown)
{"assign":{"landed_at":"2026-10-03T…","outcome":"Landed — every <a> now gets …"}}
{"log":{"at":"2026-08-14T16:35:30-05:00","msg":"two bugs found by the browser pass, both silent: …"}}
{"action":{"at":"2026-08-30T12:02:08-05:00","did":"edit","files":["public/framework/ai/2026-08-12/apps/columns/page.js"]}}
{"decision":{"id":"nav-tuning","at":"…","about":"Which nav tuning …","options":[{"id":"ceiling","say":"…","why":"…"}]}}
{"review":{"at":"…","size":"full","verdict":"fix","findings":[{"n":1,"kind":"fix","text":"…"}]}}
{"commit":{"hash":"10de086b","what":"Server/review.mjs --questions: …"}}      // 50 lines; the new form is {"commit":"<hash>"}
{"agent":{"kind":"agent","task":"figma-layouts — …","model":"claude-opus-5"}}
{"ask":{"id":"ai-log-asks","at":"…","summary":"…","quote":"…"}}
{"card":{"id":"dashboard","icon":"dashboard","title":"…","text":"…"}}
{"snooze":{"at":"…","until":"…","by":"task-mastermind-day-cards"}}
{"wait":{"at":"…","on":"owner","what":"approval of task system plan steps 3-11"}}   // the new verbs already appear (task-system's own log): wait, approve, start, finish
{"task":"/framework/core/Task/tasks/task-system-build/","by":"voice-app","ts":"…"}  // 48 lines in 2 tasks: references written by the item tool
```

Also seen: `chat`, `shot(s)`, `experiment`, `verdict`, `rank`, `note`, `group` (`{"group":"ai-dashboard"}`), `vote`, `spend`, `bands`. All of them are evidence or UI, none is a state change.

**Where each fact lives today**

- *Title*: `assign.title` (399 tasks), else nothing. The dashboard falls back to the slug (`TaskState.facts`: `title ??= basename.replaceAll("-"," ")`). `requirements.md` H1 is a third source (963 more tasks have one).
- *Open or landed*: `assign.landed_at` + `assign.outcome` = landed; `assign.closed_by`/`closed_at`/`closed_why` = closed. Anything else counts as open, running, even when abandoned months ago.
- *Progress*: `assign.steps[]` + `assign.step` (1-based index).
- *Cost*: `assign.cost_usd` (a number) and `assign.cost` (an object with per-agent `usd`), `tokens`, `usage`.
- *Session*: `assign.session_id`; the folder the task lives in (when under a session) is the other pointer.
- *Parent*: `assign.parent_task` (a repo path, 288 tasks) or `assign.parent` (6), and folder nesting (532).

**`Server/TaskState.mjs`** is not an index of old tasks. It reads Servex's agent registry (`GET /agents`, `SERVEX_URL`, default `http://localhost:8090`) and the task folders **of today and yesterday only** (`landed_today`, `waiting` walk two day dirs), then appends a snapshot line to `ai/tasks/state.jsonl` only when the picture changes (heartbeat one line a minute, trimmed to 200 lines when it passes 400). Line shape:

```jsonc
{"at":"2026-10-17T04:01:06Z","in_flight":[{"id":"2026~10~16~voice-20261016~task-migrate~research","agent":"minion-…","title":"research","model":"…","cost":0,"quiet_min":0,"url":"/framework/ai/sessions/…/","quiet":false}],"queued":[],"waiting":[],"landed":[{"id":"2026~10~15~voice-opus~cost-fix-review","title":"…","line":"<first sentence of outcome>","landed_at":"…","url":"…"}],"counts":{"in_flight":1,"queued":0,"waiting":0,"landed":8}}
```

A task id there is the dir below `sessions/` with `/` as `~` (`TaskState.id`). The live file has 331 lines, 18 distinct ids, 70 rows without a `url` (agents with no `task_dir`), 3 ids with no task folder (`clarity-item-live`, `helper-cost-fix`, `mastermind-task-migrate`). It carries no history to migrate: it is a derived view and is gitignored. `Task.replay` already decides open/closed state there.

**`Server/TaskDirs.mjs`** decides where a *new* old-style task folder goes (`ai/sessions/YYYY/MM/DD/<session folder>/<slug>/`, UTC day, child = `<parent>/<slug>/`), keeps the redirect map for moved dirs (`task-moves.jsonl`, `task-manifest.json`; `follow()`, `alias()`), and has `--census`/`--list`. It is the writer the new item tool bypasses for module homes. **`Server/PastWork.mjs`** is a reader: it searches `task.jsonl` (title, request, outcome, group, landed_at), `asks.jsonl`, docs and git log, and `--index` writes `ai/past-work-index.md` (277 topics, 1,090 landed tasks, grouped by keyword, not by module). Both read the old shape, so they keep working while old folders stay in place; a move needs the redirect ledger updated.

---

## 3. New schema

**Class** `core/Task/Task.js`: `class Task extends Item`. Fields (getters over `data`): `state` (`idle running paused waiting stopped complete`; a stored `finished` reads as `complete`), `expected` (`string | string[]`), `tags` (hierarchical, `module` first), `module`, `session` (reads `session ?? session_id`), `priority` (`{score, why, by}` or null), `commits` (short hashes, no duplicates), `mode` (`parallel` default or `series`), `completion` (0 to 1, computed), `title`, `now`, `description`, `waiting_on`, `checked_by`, `source`, `path`, `parent`. `tasks: List` of subtasks and `content: List`, both made on first use. `duration()` and `progress()` are computed. `Task.FIELDS` lists the plain field keys a top-level line may set.

**New `task.jsonl` line kinds** (replay is `Task.replay_line`; real examples from `<module>/tasks/*/task.jsonl`):

```jsonc
{"id":"step-5-the-item-tool-item-path-delta","path":"/framework/core/Task/tasks/task-system-build/step-5-…/","parent":"/framework/core/Task/tasks/task-system-build/","title":"Step 5: The item tool: item({path, delta})","source":"/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md","by":"voice-app","ts":"2026-10-17T01:30:49.180Z"}   // line 1
{"module":"core/Task"}                                                       // a field line (a key in FIELDS)
{"task":"/framework/core/Task/tasks/task-system-build/step-1-…/","by":"voice-app","ts":"…"}   // reference to a child: no copied data
{"complete":{},"by":"voice-app","ts":"…"}                                    // verbs: start pause resume stop complete wait approve improve reject (finish is an old alias)
{"verdict":{"is":"approve","note":"…","by":"…"}}
{"commit":"9deda921e"}
{"priority":{"score":2,"why":"…","by":"…"}}
{"content":{"add":{…}}}   {"tasks":{"add":{…}}}                                // same grammar as page.jsonl
```

Existing homes today: **47** new-format `task.jsonl` files outside `ai/sessions`, in 5 module lists: `core/Task/tasks` (22 under `task-system-build`), `servex/tasks` (6), `ext/Refine/tasks` (6), `ai/tasks` (5), `audio/Voice/tasks` (3). Each home has a list task line 1 `{"id":"tasks","path":…,"title":"<module> tasks","mode":"parallel"}` plus one `{"task":…}` reference per child, and each task folder gets a tiny `page.js` (`new TaskPage({meta:import.meta})`).

**Session reference.** The design (`core/Task/doc/owner-2026-10-16-node-side.md`, "Tasks and sessions, both ways, no copies") is: a task carries `sessions` (every session that created or worked on it), a session carries `{"task": "<app path>"}` lines. **Today `Task.js` has only the singular `session` getter, there is no `sessions` field yet.** `make_child` writes no session at all (the item tool "files the session reference" per its own instructions, via the caller's log, step 16). A migration needs to decide whether it writes `session: <uuid>` (works today) or waits for `sessions`. Source refs: `source` is an app path string, e.g. `/framework/core/Task/doc/owner-2026-10-16-task-system.md` or a plan, and for refined asks it will be a link to the prompt line plus sentence ids, a link, never a copy. App paths always start with `/` and end with `/` for folders.

**Slug rules and clash refusal** (`Servex/agents/page_tools.js`, `slug_of`, `task_home`, `make_child`): `slug = text.toLowerCase().replace(/[^a-z0-9]+/g,"-")`, trimmed, **cut to 40 chars**, trailing `-` removed, `"task"` if empty. Slug is `add.id ?? add.title`. Home is `public/framework/<module>/tasks/<slug>/`; the module must already exist (`public/framework/<module>/` is a dir; `module_of` also demands a `readme.md` when it infers the module from the call path) and is **never created**. Slugs are **flat per module**: if the folder exists the whole add is refused with `{ok:false, why:"a task \"<slug>\" already exists under <module>/tasks/ …", suggest:"<slug>-2"}` and nothing is written (`make_child` also throws `refused: … already holds a task`, never overwrite). A task with no module nests in its parent's folder (`<parent folder>/<slug>/`), or, inside `tasks/`, as a subtask. A subtask with its own sub-subtasks cannot be filed as a folder yet (refused).

**Discovery.** There is no scan of `tasks/` by name. Every new folder is one more `{"file":"<slug>/"}` line in its parent's `files.jsonl` (`record_new_folder`, via `ModuleLog`). `Server/TaskHomes.mjs` walks `files.jsonl` listings from `public/` down; a `tasks/` folder that holds a `task.jsonl` is a home; `--write` appends one `{"task":"<home>"}` reference per missing home to `public/tasks/task.jsonl` (what `/tasks/` and `/live/` count). `TasksPage` mounts on any `tasks/` dir and lists tasks through the home's `{"task":…}` lines. So a migration that writes folders by hand must also (a) add the child's reference line to the list task, (b) add the files.jsonl line to `<module>/tasks/`, and (c) for a brand-new home, line 1 of the list task plus a `TaskHomes.add`. **A folder with no `files.jsonl` entry is invisible to the home scan** (the list task is what lists the children, files.jsonl is what the site route and the home walk need).

---

## 4. Field-by-field mapping (old → new)

| Old | New | Note |
|---|---|---|
| folder `…/<slug>/` | new folder `<module>/tasks/<slug>/` (module known), else leave in place | slug clashes (5) and 40-char cut (97 slugs) need a rule |
| none | line 1 `{id, path, parent, title, module, source, by:"migrate", ts}` | `id` = slug, `path` = new app path, `parent` = parent's app path or the old session folder's |
| `assign.title` / `requirements.md` H1 / `assign.request` / slug | `title` | first one that exists, in that order (399 / 963 / 73 / the rest) |
| `assign.landed_at` + non-empty `assign.outcome` | `{"complete":{"at":landed_at}}` + keep `outcome` | `Task.replay` already infers this, so no verb line is strictly needed; add it for explicit history |
| `assign.closed_by`, `closed_at`, `closed_why` | `{"stop":{"why":closed_why,"at":closed_at}}` | 14 tasks |
| open (no landing, no closing) | no verb line, or `idle` | **decision**: replay calls it `running` today, which makes `TaskLoop` chase 397 stale tasks. Safer: migrate those as `stop` with a `why:"migrated, never landed"`, or `idle` |
| `assign.outcome` | `outcome` (put as a field) | the landing prose; keep verbatim |
| `assign.requested_at` | `ts`/`at` on line 1 | time source for replay |
| `assign.session_id` | `session` | plus the session's own `task` reference line (see 3: `sessions` not built) |
| `assign.card` | `source` or `card` (keep as data) | an AI-board card id `2026/09/28/…`; no new field exists |
| `assign.brief` / `requirements.md` | `source` (app path of the brief) | and move/copy `requirements.md` into the new folder (see 7) |
| `assign.parent_task` / folder nesting | `parent` on line 1 + `{"task":…}` on the parent | 532 nested vs 159 with a valid `parent_task` |
| `assign.steps[]` + `assign.step` | keep as data, replay reads it (`completion` fallback) | new tasks no longer write `steps` |
| `assign.cost_usd`, `cost`, `tokens`, `usage` | keep as `assign` data | cost is meant to become the sum of session spend; do not re-derive |
| `assign.now` | `now` | a field |
| `assign.model`, `agent`, `worker`, `effort`, `worktree`, `branch`, `window`, `tab`, `links`, `group`, `highlight`, `budget_usd` | keep inside `assign` | no field; dashboard and `AITask` read them |
| `{"commit":{hash,what}}` | `{"commit":"<hash>"}` | only 50 lines; Task.commit takes a string; the old object form needs conversion |
| `{"snooze"}`, `{"wait"}`, `{"approve"}`, `{"start"}`, `{"finish"}` | the same verbs, already native | finish = complete alias |
| `log`, `action`, `decision`, `review`, `ask`, `chat`, `agent`, `shot(s)`, `experiment`, `card`, `verdict`, `rank`, `note`, `group` | **append unchanged** | evidence, not state; `Task.replay_line` ignores unknown kinds |
| `priority` | `priority` | already in the new grammar |
| none | `module` (derived, see 6) / `tags` | the one thing the migration must compute |
| none | `expected` | does not exist on old tasks; leave empty (do not invent) |

The easiest correct migration appends: take the **old file whole** as the body of the new folder's `task.jsonl` (old lines remain and replay), put the new line 1 **in front** only if the folder is new. Because `Task.replay` already maps old `assign` data, the "migration" is mostly a *move + line 1 + reference + files.jsonl entry*, not a rewrite of 42k lines.

---

## 5. Cases that do not map cleanly (counts)

| Case | Count | Handling idea |
|---|---|---|
| Task with no title anywhere (no `assign.title`, no `requirements.md`, no `request`, no `brief`) | 124 slug-only (+3 card-only) | title from slug (`TaskState.facts` already does this) |
| Task with no `assign.title` at all | 1,259 | 963 recover a title from `requirements.md` H1, 73 from `request`, 96 from `brief` |
| First line is not `assign` | 33 | replay does not care; line 1 of the new format is prepended, not merged |
| Malformed JSON lines | **0** | none, parse is safe |
| Nested child tasks (a task dir below a task dir) | 532 | migrate as children: `{"task":…}` on the parent. `assign.parent_task` agrees for only 159; it can point at a dated path that no longer exists (`public/framework/ai/2026-09-29/...`, an old flat day) |
| Dated flat dirs `ai/YYYY-MM-DD/` still holding tasks | **0** (moved already; the redirect ledger maps old URLs) | old links resolve through `TaskDirs.follow()`; a second move must append to `task-moves.jsonl` or those links die |
| Same slug on different days | 40 slugs / 104 tasks; **after** module assignment 2 clashes (7 tasks): `research-system` (08/18, 08/30) and `feedback-council` (10/06, 07, 08, 09, 12) | those are one *continuing* task; merge as a single task with several `sessions`, or suffix `-2`. Never overwrite (law: never destructive) |
| Tasks that cross modules (actions touch more than one module) | 196 | pick one primary module, put the rest in `tags` |
| `requirements.md` with no `task.jsonl` | 113 | keep in place; a brief is not a task. Count them as unmigrated briefs, optionally link them as `source` from the task they belong to when a parent task exists |
| `task.jsonl` with no `requirements.md` | 341 | normal (small and quick-fix tasks); `source` stays empty |
| TaskState ids whose folder is gone or never existed | 3 of 18 | state is derived; ignore |
| TaskState rows without a task dir/url | 70 of ~2,700 rows | derived, ignore |
| Landed tasks with no `outcome` text | `landed_at` set 1,430 lines but `outcome` 1,503: a few have `landed_at` without `outcome` (replay then keeps them `running`) | decide: treat `landed_at` alone as complete during migration, and say so in the log line |
| Open and stale | 397 open (Oct 311, Sep 82, Aug 4) | see 7: do not turn 397 stale tasks into live `running` ones |
| Names that are not a good slug (`proof`, `build`, `research`) | `build` ×11 | slug must stay unique per module; give the parent or date |
| New-format tasks inside `ai/sessions` | 2 tasks carry `task` lines | the migration must skip anything whose line 1 already has `id`+`path` (idempotence) |

---

## 6. Which old tasks belong to a module

**The module** is "the nearest folder under `public/framework/` (at most 3 deep) that has a `readme.md`", exactly the rule the item tool uses (`module_of`). Four signals, each computed from the task's own files:

| Signal | Source | Tasks it fires on | Confidence |
|---|---|---|---|
| `prefix` | title is `<Name>: …` and `<Name>` (or `core/`, `ext/`, `ui/`, `ux/` + Name) is a real module | 91 | high (the owner's naming rule, "tasks titled `<module>: <outcome>`"), but only ~10% of tasks have a title at all |
| `files` | the most-edited module in `{"action":{"files":[…]}}` lines | 407 | medium-high for what the agent actually touched; weak when `files_n>1` (196 tasks touched several), and it counts doc and test edits |
| `reqpath` | the most-mentioned `public/framework/<path>` in `requirements.md` | 614 | medium: a brief names its subject first and its neighbours after, so the first and the most frequent are usually the module; contaminated by "read these readmes" lists |
| `brief` | `assign.brief` path points under a module (not under `ai/`) | 13 | high but rare (briefs live in `ai/sessions` themselves) |

**Result: 872 of 1,658 tasks (52.6%) get a module from at least one signal; 786 (47.4%) stay unassigned.** Where several signals fire, they agree for 755 and disagree for 117 (13%). Signals alone: `reqpath` 384, `files` 194, `prefix` 46, `brief` 7. Unassigned: Aug 121, Sep 313, Oct 352, of which 523 landed and 148 have a title. These unassigned tasks are mostly session-level or chat work ("answer a question", audits, fan-outs) with no files, and should stay in their session folder, not be forced into a module. Most-assigned modules: `ai` 83, `core/Page` 74, `servex` 60, `ai2` 44, `styles` 35, `ext/AITask` 30, `ext` 26, `ux/Dictate` 26, `ext/Panel` 23, `ext/drawer` 21, `ai/v/3` 19, `core/Task` 18, `ext/Research` 15, `dev/DevBar` 14, `ext/JSONL` 14. Caveats: `ext` alone and `ai` are catch-alls (a root readme exists), `ai2` and `ext/AITask` are old modules that still exist; the check is against the **current** tree, a module renamed or removed since gives no match (and Windows' case-insensitive filesystem matched `Servex` to `servex`).

Ten real examples (dir below `ai/sessions/`, signals):

1. `2026/10/03/push-to-talk/push-to-talk/hotkeys-module`: "Hotkeys: a flat, filterable, rebindable hotkey manager": prefix, files and reqpath all say `ux/Hotkeys`. **Certain.**
2. `2026/10/09/session-060cdfff/page-mastermind`: "core/Page: agents add tabs to any page live …": all three say `core/Page`. **Certain.**
3. `2026/10/15/voice-20261015/page-instance`: "Page: server-side instance and app() tool design": all three say `core/Page`.
4. `2026/09/28/ccdca679-…/dictation-playground`: "Dictate: a playground with raw, corrections …": prefix only: `ux/Dictate` (prefix `Dictate` found `ux/Dictate`). High.
5. `2026/09/29/audio/audio/next-drill-in`: "Chat: open a card full screen, routed": prefix only: `ext/Chat`. High.
6. `2026/08/14/dev-toolbar` (no title): files only: `dev/DevBar` (3 files). Medium-high.
7. `2026/08/14/board-start` (no title): files only: `ext/AITask`. Medium (an old module name).
8. `2026/08/15/devbar-ai` (no title): files say `dev/DevBar`, requirements say `ai`. **Conflict**, the rule must prefer the specific module over the catch-all.
9. `2026/08/14/browser-cli-bridge` (no title): files say `ext/Ask`, requirements say `dev/Socket`. **Conflict**, `files` should win (what changed).
10. `2026/08/15/ledger-hooks`: files say `ext/AITask`, requirements say `ai`. **Conflict**, prefer the deeper module.

**Proposed rule:** (1) `prefix` if it names a real module; else (2) the module with the most `action.files` hits; else (3) `assign.brief` module; else (4) the first-mentioned `reqpath` module; **demote** a catch-all (`ai`, `ext`, `core`, `ui`, `ux`) to a tag whenever a deeper module fires in another signal; **leave unassigned** (stays in its session folder) when no signal fires or only a catch-all fires. Put every signal that fired into `tags` so nothing is lost, and add the rule's name as `by`/source on line 1 for auditing. Confidence tier per task: high (prefix, or two signals agree), medium (one signal), low (catch-all only); migrate high first, report medium, skip low.

---

## 7. Open questions / risks for a migration script

1. **Idempotency.** Skip any folder whose `task.jsonl` already has a line 1 with `id`+`path`, or already has a `{"migrated":…}` marker. Write a manifest (`old path → new path`, tasks, line counts) beside the script (like `Server/TaskMove.mjs`: dry run first, `--apply`, `--undo`, append-only ledger). A rerun must produce the same files.
2. **Copy or move?** The new item tool never overwrites and refuses on a clash, so the script writes new homes. The old folder holds assets (screenshots `shots/`, `report.md`, `requirements.md`, scratch files) that links and `/framework/ai/sessions/…` URLs point at. **Recommendation:** do not move the folder; create `<module>/tasks/<slug>/task.jsonl` as a *reference* task (line 1 + `{"source":"<old app path>"}` + verbs), and leave the old dir intact. This keeps every old URL working, is not destructive, and avoids rewriting 42k lines. Moving, if wanted, goes through `TaskMove`'s ledger so `TaskDirs.follow()` still resolves old URLs.
3. **The two routes disagree.** If the old folder stays and the new home references it, the same task appears twice (the old dir is still found by `TaskState`'s walk and by the AI board). One of them must stop being the task. Decide before writing.
4. **Open tasks.** 397 are "open" only because nothing closed them. Migrating them as `running` makes `TaskLoop` chase them; as `idle` they pollute `/tasks/` (the count on `/live/` jumps). Recommend: `stop` with a why for anything with no log line in 14 days, and `idle` only for recent ones with a `now` that sounds unfinished.
5. **Concurrent writers and live files.** Servex agents are appending to today's `task.jsonl` files (the 2026-10-16 session's tasks, this very task, `state.jsonl`). Skip tasks modified in the last N minutes; append only (no rewrite), through `.claude/hooks/append.mjs` or `write_line`, and never write `ai/tasks/state.jsonl`. Hold live reload (`node Server/hold.mjs`) for the batch, in a worktree, merge once (`Server/merge.mjs`).
6. **files.jsonl and the home index.** Each new folder needs a `files.jsonl` line (through `ModuleLog`, not hand-appended) and each list task needs the `{"task":…}` reference, or the page does not list it. A list home that does not exist yet needs `TaskHomes.add`. 872 tasks into ~100+ modules means creating many new `tasks/` lists, and the `/tasks/` page and `/live/` count change at once.
7. **Slug rules.** 40-char cut and flat uniqueness per module: 2 real clashes (7 tasks) and 97 truncated slugs; clashing slugs are one continuing task (`feedback-council` ×5): merge them with several sessions (needs the `sessions` field, which `Task.js` does not have yet) or suffix. Do not use the item tool's `taken` refusal as the dedupe: call it first, because it suggests `-2`.
8. **Module quality.** Signals are heuristics: `ai`/`ext` catch-alls, renamed modules, multi-module tasks (196). Dry run must list every assignment with its signals for owner review; confidence tiers above. `expected` and `sessions` do not exist for old tasks: do not invent them.
9. **Timestamps.** `Task.replay` uses each line's own `at`/`ts`, so appended verb lines must carry the original `landed_at`/`closed_at`, never `Date.now()`, or every old task's `duration()` and `completed_at` becomes "today".
10. **`TaskState` and `PastWork` read `ai/sessions/**` only** (`TaskState` only today and yesterday; `PastWork --index` walks the lot). New module homes are invisible to `PastWork`, so past-work search would lose them unless it learns the home index (`public/tasks/task.jsonl`).
11. **Readmes this makes stale:** `ai/tasks/readme.md` ("every `task.jsonl`", today's folders), `core/Task/readme.md` (the `sessions` field and the migration section), the plan's section 7 (it says 1,636 folders and 1,220 landed; now 1,658 and 1,255).
