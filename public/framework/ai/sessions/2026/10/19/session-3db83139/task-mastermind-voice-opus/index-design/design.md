# Sessions: indexing, tags, nesting today, and a daily + monthly "landed" index (design only, nothing built)

**Short answer:** yes, some of it is automated, but only cost and counts. Nothing records what LANDED per day or per month, and tags and parents are thin. The fix is small: one JSONL line per landed task, appended by code.

---

## 1. Indexes that exist today

| Path | What it holds | Writer | Automated? |
|---|---|---|---|
| `ai/sessions/YYYY/MM/DD/index.json` | every session snapshot of that day (state, cost, tags, parent, title) | `AISessionIndex.write_day` / `freeze()` in [AISessionIndex.mjs](/framework/ai/AISession/AISessionIndex.mjs) | **Yes**: Servex, live while the day runs (5 s debounce); `freeze()` (checked every 60 s) rewrites it `closed:true` once the day is past and nothing in it is active |
| `<session folder>/index.json` | one session's snapshot | same class, the one writer | Yes, same debounce |
| `ai/sessions/YYYY/MM/index.json`, `YYYY/index.json` | per-day / per-month **count, usd, flagged** only (no landed) | `AISessionIndex.roll()`, called after `freeze()` | Yes, but only when a day closes |
| `ai/sessions/2026/10/17/day.jsonl` | log lines (`landed — ...`) for one day | `Servex/Log.js` appends (task log lines) | Yes, but only some days have one; I found no month file |
| `ai/log.jsonl`, `ai/sessions/ai/log.jsonl` | **old voice-session** `started` events (Sept 29 to Oct 17), not session indexes | the old voice host | Dead since 2026-10-17 |
| `ai/day.jsonl` | old task-opened / landed lines (from 2026-08) | old `append.mjs` | Legacy; superseded by per-day files |
| `ai/sessions/sessions.json`, `session-tree.json`, `session-index.json` | whole-repo dumps | one-off migration scripts | **Manual**, stale since 2026-10-08 |
| `ai/sessions/session-buckets.json` | routine-session chip counts | `Server/session-buckets.mjs` | Manual (last 2026-10-12) |
| `ai/sessions/session-flags.json` | flagged sessions | `Server/session-flags.mjs` | Manual (last 2026-10-13) |
| `<session>/digest.json` + tag lines | per-session tags and a digest | Round 4 script (`past-work/round4-result.md`) | Manual, last 3 days only |
| `ai/past-work-index.md` | module/topic index for "look before you build" | `node Server/PastWork.mjs --index` | Manual |
| In memory: `SessionIndex` ([session-index.md](/Server/doc/session-index.md)) | 1,491+ task rows, queryable | `Server/SessionIndex.mjs` | On server start; not persisted |
| `ai/landed/files.jsonl`, `Servex/Landed.js` | the landing record for merges | `Landed.js` | Yes, at merge |

Midnight handling today: **none for moving.** A session stays in the folder of its start day (the owner's local day, `Day.js`; `Server/SessionDayMove.mjs` fixed the UTC-vs-local bug on 2026-10-18). `freeze()` is the only midnight-ish step, and it touches only the day's own index.

---

## 2. Tags and nesting: how filled (script: [count.mjs](count.mjs), output [counts.txt](counts.txt); window 2026-09-19 to 2026-10-19, 30 day folders)

| Field | Source | Filled |
|---|---|---|
| `kind` | task line 1 | 0 of 1,077 (0%); it lives in a `kind/…` **tag** instead |
| `module` | task line 1 | 0 of 1,077 (0%); lives as a `mod/…` tag |
| `tags` | task line 1 | 0 of 1,077 (0%) |
| `parent_task` | task line 1 | 401 of 1,077 (37%) |
| `after` | task line 1 | 14 of 1,077 (1%) |
| `home` | task line 1 | 3 of 1,077 (0%) |
| `card` | task line 1 | 450 of 1,077 (42%) |
| landed (`landed_at` anywhere) | task log | 605 of 1,077 (56%) |
| `tags` | session `index.json` | 586 of 3,093 (19%) |
| `parent` (any) / not `"sessions"` | session `index.json` | 510 (16%) / 426 (14%) |
| `title` / `agent` | session `index.json` | 2,110 (68%) / 1,836 (59%) |
| `category` / `core` | session `index.json` | 124 (4%) / 657 (21%) |

Tag prefixes in use: `task` 402, `kind` 586, `model` 583, `work` 314, `mod` 306, `framework` 177, `dictation` 90, `page` 64, `docs` 124, `servex` 22. Findings: nesting is **mostly by folder** (tasks live inside their parent's dir), which is why the `parent_task` field is only 37% and stale in places (an earlier audit found 103 of 255 stale). Tags exist only where the Round 4 script ran (last 3 days). Nothing is tagged at write time.

---

## 3. Design

### The landed index (daily and monthly)
- **File:** `ai/sessions/YYYY/MM/DD/landed.jsonl` (the day) and `ai/sessions/YYYY/MM/YYYY-MM.jsonl` (the month, e.g. `2026/10/2026-10.jsonl`).
- **One line per landed task:** `{day, at, task (path), title, module, parent_task, card, commit, usd}`. Every field is read by code from `task.jsonl` (the `landed_at` line, plus the commit from `Servex/Landed.js`); no agent writes it (CLAUDE.md law 7).
- **Writer:** `Servex/Landed.js` appends the day line at merge time (it already knows the task and commit; append-only is safe, see the append rule). At close of a day, `AISessionIndex.freeze()` appends that day's lines to the month file (idempotent: skip lines whose `task` is already there). A node backfill script reads existing `task.jsonl` files (605 landed in 30 days) so history is not empty.
- **Reading:** a page reads the month file as a stream; "what was done in October?" costs one file, no sessions loaded. The month `index.json` gains a `landed` count beside `usd`.

### Midnight: move or stay?
- **Move in-progress sessions to the next day's folder.** For: found and continued. Against: breaks the "when did it start" record, breaks links and `parent/child` nesting, and is destructive-adjacent (a session's folder path is its identity; it already needed `TaskDirs.follow()` after one re-filing).
- **Stay, plus a pointer line in the next day's folder.** For: nothing moves, links hold, start date stays true. Against: needs one small writer.
- **Recommendation: stay + pointer.** At `freeze()` time, for every session still `active` or with an open task, append `{"carried":{"task":"<path>","from":"<day>"}}` to the new day's `carry.jsonl` (and surface it as a "Carried over" section on that day's page). Reason to do otherwise: none found; the owner's goal ("found, not forgotten") is met by the pointer.

### Tags and nesting
Write `kind`, `module` and `tags` into task line 1 at open (`new-task` already knows them), and stop computing them later by script. Fill `parent_task` by the folder path (computed, not typed), so projects are `parent/child` units whose summary is the sum of their landed lines.

---

## Order to build
1. Backfill script and the month file (cheapest, answers "what was done?" at once).
2. `Landed.js` day-line append.
3. `carry.jsonl` pointer in `freeze()`.
4. Tags and `parent_task` stamped at open.
