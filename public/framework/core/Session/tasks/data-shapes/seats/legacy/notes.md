# Seat (h) legacy: what is superseded but still lingering

Asks 29 and 30 ([requirements.md](../../requirements.md)). Brief: [analysis-brief.md](../analysis-brief.md), section (h). The full `page.children` guide is [migration-children-to-pages.md](migration-children-to-pages.md); the one-page shape is [shape.md](shape.md). All counts come from node scripts that walk the repo (inputs saved in [census/](census/)); nothing is estimated. No code was changed and no deprecation comment was added: this is the census.

Two scopes were used. **Live** means the files agents run and read today: everything under `public/`, `Servex/`, `Server/`, `.claude/` except dated session folders (`sessions/YYYY/…`, `ai/YYYY-MM-DD/…`), `legacy/`, `old/`, `archive/`, `core/new/` (a separate sketch with its own `Page`), `node_modules` and worktrees. **History** means the logs inside those dated folders, which the rules say we never rewrite, so an old-line reader has to keep working for them.

## The strongest findings

1. **`page.children` is not retired; it is the most-used API on the list.** 233 live call sites in 105 files, 10 new lines in 8 commits in the last two weeks, 38 doc lines in 28 files that teach it, and no deprecation mark anywhere. The requirements page says it is "since retired" (ask 12); that is wrong today.
2. **The `at` key looks dead but is not removable.** Live there are 5 old routing lines in 2 files and zero code callers of `Item.locate`. But the dated history holds about 1,810 `{"at":"content","add":…}` lines in about 1,700 files (old session `page.jsonl` logs, mostly 2026-09). Deleting the reader would silently empty those pages. It is already marked "compat only" in code and docs; the right move is to keep it as one named replay shim, not delete it.
3. **Two persistence stacks are both live.** The older whole-JSON `Saver` (`Item.open(saver)`, `item.saver`, `item.save()`) is used by Panel/Workspace, the editor, Hotkeys, push-to-talk and the DevBar settings; the JSONL `Store` (`item.store`) is used by Page, Task and Session. `Item.save()` on a Store-backed item resolves `false` (it has no saver). Neither is marked; nothing says which one new code should use.
4. **The pseudo-property lines are the biggest data-loss trap, but they live in history and in voice sessions, not in the folders this census walked.** Unknown keys fall to `put(key, value)` in `Session.apply_line`; the table in [ai/system-map.md](/framework/ai/system-map.md) §3e counts them (one 8,359-line session holds 2,217 `chat`, 1,654 `place`, 684 `sent`, 417 `quiet`, 268 `react` lines). In the non-dated active logs the same keys are rare (24 `chat` lines in old layout task logs, 20 `place` lines in `audio/Whisper/log`).
5. **Task's old line shapes are all still needed by history.** 81 `finish` verb lines in 74 task/session logs, so `Task.finish()` and `"finish"` in `VERBS` must stay until those are migrated; but no live code calls `Task#finish`.

## The census, item by item

"Callers" are live (see the scope above) unless it says history. "Marked?" is whether the definition carries a deprecation or compat comment today. "Docs?" is whether non-archived markdown still teaches the old way.

| # | API | Defined | Callers | Marked? | Docs teach it? | Replaced by |
|---|---|---|---|---|---|---|
| 1 | `page.children` (`PageChildren extends Map`) and `set children` | `core/Page/Children.js` (59 lines); `Page.class.js:130-141` | 233 sites / 105 files (get 73, forEach 42, size 27, values 27, keys 21, iterate 12, has 12, set 6, assign 4, read 4, delete 3, put 1, clear 1) | **No** | **Yes**: `core/Page/readme.md:33`, `doc/property/children.md`, `doc/method/declare.md:21` ("the idiom everywhere"), 38 lines in 28 files | `page.pages` (a List) |
| 2 | config `children:` key (string / array / object / function) | read by `Page#declare`, `Page.class.js:271-308` | 471 keys in live `framework/` + sites (string 147, array 157, object 80, function 41, method 9, other 37) | No | **Yes** (`core/Page/readme.md:17`) | a separate decision: see the guide, section 6 |
| 3 | `Item#locate(path)` and the `at` key in `Item#apply` | `core/Item/Item.js:128-137` and `190-206` | 0 code callers except `apply` itself; 5 old lines in 2 live files; ~1,810 lines in ~1,700 history files | **Yes** ("Compat only (2026-10-03)", `⚠`) | Marked: `core/Item/doc/item-notes.md:35`, `core/Page/doc/decisions.md:760`, `doc/server-instance.md:26,39` all say compat-only | nested delta (`get()` per level); keep the reader as a shim for history |
| 4 | `Store.address()` slash path | `core/Item/Store.js:236` | live (spells a `move` verb's `from`) | **Yes** ("Compat only") | no | a structured `from`; not removable yet |
| 5 | `item.saver` / `Item.open(saver)` / `item.save()` / `.delete()` and `ext/Saver` (Saver, FileSaver, LocalStorageSaver, MemorySaver) | `core/Item/Item.js:260-261, 359-363`; `ext/Saver/*.js` | 24 non-archive files import a Saver (Panel, Workspace, editor, DevBar settings, Hotkeys, push-to-talk, EditSwitch, 5 `notes/` demos, 4 `imagine/` pages); 15 `.save()/.delete()` calls in framework | No | `ext/Saver/readme.md` and 136 md files mention "saver", mostly dated session docs | `item.store` (`Item.Store.for(url)`) for anything that is a delta log; whole-JSON documents (a Panel layout) are a different shape and need a decision |
| 6 | `item.store` (the replacement) | `core/Item/Store.js:124-126` (`host.store = this`) | `Item.open(url)`, Task, Session, Dated, FsFile (9 `Store.for(` sites) | n/a | n/a | n/a |
| 7 | pseudo-property lines `chat`, `place`, `sent`, `quiet`, `react`, `refined`, `nav`, `pause`, `backing`, `log` on a session | no definition: `Session#apply_line` falls through to `put(k, v)` (`core/Session/Session.js:125`) | counts per system-map §3e (voice sessions); readers re-filter the raw file | **No** (the plan is `core/Session/doc/one-replay-plan.md`, not built) | `ext/Session/doc/sessions.md` lists 11 of these shapes as the format; 39 md lines in 31 files use a `"chat"`/`"place"`/`"quiet"` line | list deltas (`chat.add`, …) per the data-shapes plan |
| 8 | `Task#replay_line` legacy mapping (`assign` carrying fields, `finished_at`→`completed_at`, numeric `complete`→`completion`, `session_id`→`session`) and `replay_legacy` | `core/Task/Task.js:536-545, 601-606` | live code path for every old folder; **0** lines in any log use `assign.finished_at` or numeric `assign.complete` | comment only: "old folders", "legacy lines keep them under `assign`" | `core/Task/readme.md:87` states the three replay rules | per-field list deltas; keep the state-inference (`replay_legacy`) since 46+ non-dated and many dated logs have no explicit verb |
| 9 | `Task#finish()`; `"finish"` in `VERBS` / `LINE_KEYS` | `core/Task/Task.js:442-443`, `32-33` | 0 live callers; 81 lines in 74 history logs | **Yes** ("Old name, kept for old callers and old logs") | no | `complete` |
| 10 | `{"file":"x"}` lines | `Page#file` / `Jsonl.file` (`core/Page/Jsonl.js:61`), `PageListing.from` (`Listing.js:20-30`); and `Task#replay_line` for `{"file":"<child>/task.jsonl"}` (`Task.js:563-569`) | 177 lines in 30 live `page.jsonl`/`task.jsonl` files (110 under `core/Page`, 37 under `ai/tests`); the task-file form: 1 line in all of history | No | **Yes**, as the current way: `core/Page/jsonl/full/content.js:14`, `doc/jsonl.md` | list deltas (`pages.add` / a files list) per the folder rule; this is the *current* format, so it is "to be superseded", not yet legacy |
| 11 | `Session extends Task` | `core/Session/Session.js:18`; tests assert it | 6 subclasses of Task live (Session, Process, Project, Prompt, Question) | n/a | n/a | not legacy; the legacy part is **inside** Session: the two record shapes ("task" vs "record", `Session.js:65-68`), and the record shape's `apply_line` |
| 12 | `List#each`, `List#children` (alias for `items`) | `core/List/List.js:67-70` | not countable by name: `.each(` and `.children` collide with DOM / jQuery-like uses | comment "Back-compat aliases ... several callers outside this task's fence" | no | `forEach`, `items` |
| 13 | JSONL legacy string-format decision | `ext/JSONL/JSONL.js:174-176` | history (decision lines) | comment only | `ext/JSONL/doc/JSONL-notes.md` | n/a |

Note for item 3: the `at` that is a **timestamp** (`{"chat":{"at":"2026-…"}}`) is current and everywhere; only the top-level, routing `at` with a non-timestamp value is the old key. The script keeps those apart.

## What works and what does not

- **Works:** the wrapper behaves exactly like a Map for every live call (the `Page.test.mjs` suite covers it), so there is no bug today; the cost is misleading structure, not breakage. The compat branches for `at`, `finish`, `replay_legacy` are small and correctly commented.
- **Does not work:** nothing marks `page.children` or the Saver stack as the old way, so agents reading `Page.class.js`, the readmes or 105 caller files copy it. In two weeks 8 commits added 10 new `.children.<method>` lines, including in the newest feature code (sidebar pinning, the session menu, the drawer sheet).
- **A trap in the replacement:** `pages.find()` returns a stub object where `children.get()` returned `null` (guide, section 4). A blind search-and-replace would turn "not loaded yet" into "loaded". The migration needs the stub rule or a separate stub store.

## Ranked: which legacy pieces mislead agents most

Scored by (live callers or docs that teach it) × (recent copying) × (not marked). Fix top-down.

1. **`page.children`** — 233 sites, taught in the Page readme, 10 recent copies, unmarked. First action: the deprecation comment and the one readme line (a three-line change), then the scripted rewrite.
2. **The config key `children:`** (471 uses, taught as the way to declare). Not wrong, but the name now collides with a deprecated property; decide the word before the property is removed.
3. **The two persistence stacks** (`Saver` vs `Store`) — nothing says which one is new; 24 live files use the old one; Item docs call the Saver path "the existing whole-JSON path". Mark `Saver` as "whole-document storage, not for logs" and `Item#save` as the Saver-only door.
4. **Session pseudo-property lines** — the largest data-loss risk (replay silently drops them) and the docs list them as the format; already decided by the owner (2026-10-26) and planned (`one-replay-plan.md`), so the ask is to mark `apply_line`'s fall-through to `put` and to flag the format list in `ext/Session/doc/sessions.md`.
5. **`{"file":…}` lines** — the current page format that the data-shapes work is likely to replace; mark it only once the replacement is decided, so no churn.
6. **Task legacy mapping, `finish`, `at`/`locate`** — all correctly commented, all needed by history, rarely copied (0 live callers). Lowest priority. Keep, but gather them into one named replay shim per class so the legacy reader is one place that can be deleted when the history is migrated.

## Check of the owner's design directions

- **"`pages` over `children`; deprecate it with a migration guide" (ask 29).** Sound and cheap. The List is already the real storage; the wrapper is only a view. The risk is the stub semantics, not the call volume (214 of 233 sites are mechanical).
- **"Mark lingering legacy deprecated; write guides; then remove" (ask 30).** Right for APIs. It does not fit the `at` key or `Task#finish`: removing the reader breaks ~1,800 history lines the rules say we do not rewrite. For those, the rule needs a clause: *a reader of an old log shape is marked, collected into one replay shim, and kept until a scripted migration has moved the logs.* Suggest adding that sentence to `doc/rules.md`.
- **"Move away from the pseudo-property lines" (2026-10-26).** Consistent with this census: unknown keys fall to `put` and lose history. The marks come first; replay changes follow the plan.
- **The `requirements.md` ask 12 premise ("children, which was a pseudo-map, since retired")** does not match the code and should be corrected so the next reader is not told it is gone.

## Recommendation

1. Today, no code risk: add the deprecation comment to `Children.js` and the `children` getter, change `core/Page/readme.md` and `doc/property/children.md`, and add the history clause to `doc/rules.md`. (Needs only comment and doc edits; this seat was told to make none yet.)
2. Decide the stub question (separate "declared" list vs stub objects in `pages`) and the config-key word, then run the codemod in the guide, section 5.
3. Mark `Saver`/`Item#save` and `Session#apply_line`'s fall-through with the same one-line comment style.
4. Do not delete `Item.locate` / the `at` branch / `Task#finish`; collect them into replay shims.

## Not measured, and why

- `List#each` and `List#children` callers: the names collide with DOM and other APIs; a reliable count needs type information, not text search.
- Docs under dated session folders were not counted as "teaching" (they are records), so the doc numbers understate how often the old way appears in text an agent might read.
- The voice-session pseudo-property counts are quoted from `ai/system-map.md` §3e (counted by its author from one session); this seat's own walk of the non-dated active logs found the small numbers shown.
