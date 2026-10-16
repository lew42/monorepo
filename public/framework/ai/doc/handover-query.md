# Handover as a query — a plan, not yet built

**Status: plan only.** Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query](/framework/ai/sessions/2026/10/16/voice-20261016/handover-query/).

## What the owner sees

- **`handover.md` becomes a page that runs a question**, not a file anyone writes: open and in-flight work, high-priority items, the newest task per topic, with Day / Week / Month chips over the same data. Nothing new is stored.
- **Nobody has to remember to write it.** The task logs already say what happened and what is open; the page and every new session's start-up digest just read them.
- **Unresolved items get nagged automatically** by the task loop that already runs every 5 minutes, including old items whose agent is gone. An item leaves only when a tool-written line says it landed, was closed, killed or snoozed.
- **The index stops going stale**: it re-checks the logs when asked. The Dashboard shows the last month by default.
- **Decision for you:** keep the name `task.jsonl` (recommended, step 5); the old handover text is moved aside by script, not deleted.

Per-step detail below, one question each.

> handover must not be a hand-written file. One source of truth: session/task logs already hold what happened, landed, and is open.

The idea: `handover.md` stops being something an agent remembers to write. "Handover" becomes a **question asked at read time** of the `task.jsonl` logs that already exist. Five steps, one question each, all settled below.

---

## Step 1 — Why is the index stale, and what rebuilds it?

**Answer: there are three "indexes", and only one of them has any safety net.** Which one showed 6 days is not yet measured (see the check at the end of this step); the three causes below are all real in the code.

| # | What | Written by | What triggers a rebuild today | Gap |
|---|---|---|---|---|
| 1 | The live **tasks index** (in memory) — [`Server/SessionIndex.mjs`](/Server/SessionIndex.mjs), the `tasks` source of [ext/Query](/framework/ext/Query/) | the dev server | `fs.watch` on `ai/`, 50 ms debounce, appended bytes only | **No safety net.** One `fs.watch` with no `error` listener, no periodic re-check, no staleness test. A dropped or dead Windows watch (a renamed folder, a flood of events) leaves it silently stale until the dev server restarts. |
| 2 | **`past-work-index.md`** — [`Server/PastWork.mjs --index`](/Server/PastWork.mjs) | whoever runs it by hand | Nothing. No timer, no hook. Last commit that touched it (2026-10-14) was a rename script, not a rebuild. | **Never rebuilt on a schedule.** This is the likeliest "6 days". |
| 3 | **`doc/follow-up.md`** — [`Server/FollowUp.mjs --write`](/Server/FollowUp.mjs) | `TaskLoop.follow_up_daily()` | Once per local day, inside the 5-minute tick ([task-loop.md](/Servex/doc/task-loop.md)) | Fine for a daily list, but a *handover* needs minutes, not a day. |

The contrast is the finding: the live session index ([`AISessionIndex.mjs`](/framework/ai/AISession/AISessionIndex.mjs)) has `SWEEP_MS = 5000`, "a safety net for a missed watch event". The tasks index (#1) has no such sweep. That asymmetry is the bug.

### The smallest fail-proof fix

**Make the tasks index rebuild-on-read, so it cannot be stale when asked.** Two small changes, both in `class SessionIndex`:

```js
// 1. a cheap staleness check at the top of query(): one directory walk of stat() calls, no parsing
query(spec) { this.refresh(); /* ...as today... */ }

// 2. refresh(): re-read any task.jsonl whose size changed since we last saw it; add new files; drop gone ones
refresh() { if (Date.now() - this.checked < 30_000) return; this.checked = Date.now(); for (const f of this.walk(this.root)) this.read(f, true); }
```

- `read()` already ignores a file whose size has not changed, so the walk costs only `stat` calls (about 1,500 files).
- The watcher stays, so pages still stream in about 100 ms; `refresh()` is only the **backstop** for the case where the watcher missed something.
- Add `this.watcher.on("error", …)` that re-creates the watch, and set `unload` on the `tasks` source so the 24-hour idle unload actually reloads.
- **Alternative considered:** a `setInterval` rebuild. Rejected: CLAUDE.md says stream, don't poll, and a timer rebuilds even when nobody asks. Rebuild-on-read costs nothing when nobody reads.

For #2 and #3 the same rule applies: **a generated file is never trusted to be fresh; the query is.** Steps 2 and 4 replace both with live queries over index #1, so they stop being files that can go stale.

### Check before building (one command)

`node Server/SessionIndex.mjs --check` prints the newest `last` time in the index; compare with the newest `task.jsonl` mtime on disk. A gap means the watcher missed events (cause #1). No gap and an old `past-work-index.md` means cause #2. This session could not run it (no shell approval), so it goes to the owner's build step as the first line of its test.

---

## Step 2 — The handover query: exact calls, and which fields exist

**Answer: five small queries over the `tasks` source. Four need only fields the index already has; "open" and "high priority" need a few fields added to `SessionIndex.apply()`.**

### One definition of "open" first

Three readers disagree about when a task is done, which would make a handover lie:

| Reader | Done when |
|---|---|
| `SessionIndex.apply` (the index) | any `landed_at` line |
| `Servex/asks/tasks.js` (the Dashboard) | a `landed_at` line; also `kill`; `snooze` holds it off |
| `TaskLoop`, `Heartbeat`, `Budget` (the nagging code) | `landed_at` **and** a non-empty `outcome`, or `closed_by` |

**Decision: use the nagging code's rule**, because it is the one that re-prompts (step 3) and must agree with the handover. So the index gains `open = !(landed_at && outcome) && !closed_by && !kill`, and a `state` (`open`, `landed`, `closed`, `killed`, `snoozed`). The old `landed` field stays as it is, so nothing that reads it changes. Alternative: leave `landed` alone and let each caller work it out; rejected, that is how the three rules drifted apart.

### The five queries

Browser form (`new QueryClient("tasks").ask(spec)`); node form is `SessionIndex.query` with the same names. Day strings are computed by the caller (`today`, `week_ago`, `month_ago`), never typed.

```js
// 1. Open now: the nag list and the top of the handover
{ where: [{ field: "open", op: "eq", value: true }], sort: { by: "last", dir: "desc" }, limit: 50 }

// 2. In flight: open AND a log line in the last 2 hours (FollowUp's QUIET_H)
{ where: [{ field: "open", op: "eq", value: true }, { field: "last", op: "gte", value: Date.now() - 2 * 3600e3 }], sort: { by: "last", dir: "desc" } }

// 3. High priority: open AND (an owner priority score >= 80, or stalled)
{ where: [{ field: "open", op: "eq", value: true }, { field: "priority", op: "gte", value: 80 }] }
//   plus FollowUp's flagged rows (unmerged, merged-not-landed, quiet): step 3 says how they join

// 4. Latest per topic: the newest task of every topic, so the handover shows each topic once
{ where: [{ field: "day", op: "gte", value: today_minus_14 }], sort: { by: "last", dir: "desc" }, arrange: "latest_per_topic" }

// 5. Week and month summary: same data, wider `day` window, with sums (`matched` and `totals` count ALL matches)
{ where: [{ field: "landed_day", op: "gte", value: week_ago }], sum: ["usd", "files", "chats"], limit: 0 }
```

- **`arrange`** is a hook `QueryServer.source` already has ("groups or nests the matches"); `latest_per_topic` is a ten-line function registered on the `tasks` source that keeps the first row per `topic`. It is not new machinery.
- **Counts by state** for the summary (landed this week, still open, closed) come from the same call run with different `where`, or from one `arrange` that returns them as `meta`. Nothing is written to a file.
- **Dashboard default range: last month** = the `day` or `landed_day` clause above with `month_ago`; step 4 sets it.

### Fields: what exists, what is missing

| Need | Field | Status |
|---|---|---|
| what happened | `title`, `outcome`, `request`, `slug`, `url` | exists |
| when | `started`, `last`, `landed_at`, `landed_day`, `day` | exists |
| who | `agent`, `session`, `model`, `branch` | exists |
| landed (old rule) | `landed` | exists, kept |
| progress | `step`, `steps` | exists |
| module | `modules[]` (from action files and the brief's `Fence:` line) | exists |
| cost | `usd` | **thin**: read only from `assign.cost_usd`; real spend is in each task's `spend.json` ([task-cost](/Server/task-cost.mjs)). Add: read `spend.json` once per task at seal time. |
| `open`, `state` | derived from `landed_at`, `outcome`, `closed_by`, `kill`, `snooze` | **missing**: add to `apply()` and `seal()` |
| `priority` | from the `priority` verb | **missing in the index** (`tasks.js` reads it). Also **almost unused**: four task logs in October carry one, none since 10-06. So "high priority" is mostly derived (stalled, FollowUp flags), not owner-set. |
| `topic` | **missing, and `topics[]` is no use**: only one October task log fills it, and `group` was empty across 10-15. Define `topic` = the task's first module, else the name of its parent folder. It is computed, so no agent has to remember to set it. |
| `now` (what it is doing) | `assign.now` | **missing**: one line per task for the in-flight list |
| `parent`, `card` | `assign.parent`, `assign.card` | **missing**: lets the page nest a child under its parent task |

**Nothing is asked of agents.** Every field is read from lines the tools already write (`assign`, `log`, `action`, `landed_at`). That is the point of the plan: the handover is a reading of the logs, never a thing someone must remember to write.

---

## Step 3 — Re-prompting: what already nags, and what it must call

**Answer: the nagging machine exists and works; it has two blind spots, and it does not yet read the same list the handover does. Reuse `TaskLoop`; add one hook; build no new scheduler.**

### What fires automatically today

| Thing | Fires | Nags whom, about what | Blind spot |
|---|---|---|---|
| **Stop hook** — [`ledger.mjs`](/.claude/hooks/ledger.mjs) | when an agent tries to stop | the agent itself: refuses a `landed_at` with no `outcome`; reminds of unfinished `steps` (once per 30 min, never with a live child) | only tasks that ledger knows (a session with a task) |
| **`TaskLoop.tick()`** — [`TaskLoop.js`](/Servex/TaskLoop.js) | every 5 min | the task's agent: a neutral status check when quiet 10 min, again 15 min later, then `card_ask` to the owner ([task-loop.md](/Servex/doc/task-loop.md)) | **reads only today's and yesterday's folders** (`find_task_files`), and only tasks that opted in |
| **`Heartbeat`** | agent silent 5 min | the agent, then a revive (rationed) | watches agents, not "items the owner still needs" |
| **`landing_nag` / `landing_check`** — [`Agents.js`](/Servex/agents/Agents.js) | an agent goes idle | the agent or its parent: said "merged" but no landing line; landed but files not on `michael/dev` | one event per agent, no memory across days |
| **`follow_up_daily()`** | once a local day, inside the tick | the owner: **one count** ("N flagged") as an Inbox note | a count, not the items; once a day; keyed on a file's mtime, so a failed run is not retried until tomorrow |

### The two blind spots

1. **Orphans.** A task that is open, older than yesterday, and whose agent is gone is seen by nobody: `TaskLoop` has stopped looking, and `follow_up_daily` only counts it. This is exactly the kind of item a handover must keep alive.
2. **Two lists.** `TaskLoop` walks folders by hand, `FollowUp` uses `TaskDirs`, the Dashboard uses `tasks.js`, the handover would use `SessionIndex`. Four readers, four ideas of "open" (step 2). One list must feed all of them.

### The plan: one `Handover` class that all of them call

```js
// Server/Handover.mjs — class Handover (the only new file; plain node, no server needed)
class Handover {
  constructor({ index = new SessionIndex() })        // its own index is fine: refresh() (step 1) needs no watcher
  open()        // → rows, the step 2 queries 1+2+3
  orphans()     // → open, older than yesterday, no live agent, not snoozed, not nagged today
  digest()      // → the 40-line text: open + in flight + high priority + latest per topic
}
```

**Callers (each is an existing thing, plus one line):**

- **`TaskLoop.tick()`** → `handover.orphans()`. For each (at most 3 per tick): wake the task's `parent` agent with one neutral line naming it (same wording rule as today's chase: a status check, never "land it"); if there is no live parent, post an Inbox `risk` note. Record it as `{"log":{"chase":"orphan"}}` on that task, so it fires **once a day per task** and survives a restart (the file, not memory, is the record).
- **`follow_up_daily()`** → the note carries the **top 3 titles and links** from `handover.open()`, not just a count; and "done today" is judged by the note having been posted, so a failed run retries on the next tick.
- **A new `SessionStart` hook** → `handover.digest()`, printed into the new session's context. This is what replaces "read `handover.md` first": a fresh tab or mastermind starts informed with nothing for any agent to write. A hook must never block a session, so it is fail-open (a broken query prints nothing), like `ledger.mjs`'s own rule.
- **`Heartbeat` and the Stop hook** change nothing. They keep nagging the live agent about its own task.

### The rule that makes it fail-proof

An item leaves the list only by a line a tool already writes: `landed_at` with an `outcome`, `closed_by` (`close_task`), `kill`, or `snooze` (`snooze_task`). Nothing else removes it, and nothing needs an agent to remember. If an item is still there tomorrow, it is nagged again. Every nag is limited (3 per tick, once a day per task) so a large backlog spreads out instead of flooding.

**Not decided here (small, flagged for the build):** whether an orphan with no parent should wake a fresh agent to triage it. Recommendation: no; an Inbox note first, since waking costs tokens (CLAUDE.md: mind the token burn).

---

## Step 4 — What happens to `handover.md`, and the dashboard range

**Answer: `handover.md` shrinks to a fixed pointer that never changes; the real handover is a page and a printed digest, both running the step 2 queries. The old text moves aside by script. The dashboard default becomes the last 30 days.**

### Why the file cannot simply vanish

CLAUDE.md ("Where to look: first, every new session") names `public/framework/ai/handover.md`, and a search finds it linked from the `ai` readme, `ux/Dictate` docs, the `v/3` timeline code and dozens of past task briefs. CLAUDE.md may not be edited without asking, so the **path stays**; its *content* stops being hand-written.

### Three things replace the hand-written text

| Reader | Gets the handover from | Built in |
|---|---|---|
| **An agent starting a session** | the `SessionStart` hook printing `Handover.digest()` (step 3); `node Server/Handover.mjs` prints the same by hand | `Server/Handover.mjs`, `.claude/hooks/handover-start.mjs` |
| **The owner, in the browser** | a page at `/framework/ai/handover/`: the five queries as live sections (open, in flight, high priority, latest per topic, summary), with **Day / Week / Month** chips (`?range=week`), each row a mention-linked task. It uses `QueryClient("tasks")`, so it streams over the dev socket with no refresh timer. | `ai/handover/HandoverPage.js` (class, `extends Page`), `page.js` stays tiny; add `handover` to `ai/page.js` `children:` |
| **Anything that links the old path** | `handover.md` as a **fixed stub**, about ten lines, never edited again: what the handover is, the page link, the two commands above | `ai/handover.md` |

The stub is static text with no state in it, so it cannot go stale. It is deliberately **not** a generated file: a generated file can be stale (step 1), a query cannot.

### The old text is kept, by script

The 369 lines of past LATEST sections hold real history (decisions, session ids, "what the owner is waiting on"). Per CLAUDE.md ("moves are scripted, never retyped", "never destructive"): a node script `git mv`s the file to `ai/doc/handover-archive/handover-2026-10-15.md` with a manifest and a dry run, then the stub is written at the old path. Git history keeps every earlier version regardless. The archive is linked from the stub and from `ai/readme.md`, so it is still found by browsing.

Where the old file said something **only a human knew** (for example "the owner is on a break", "stash@{0} is the owner's"), that belongs on the page or module it concerns, not in a global file (CLAUDE.md: context must not die in sessions). The build step does a one-pass triage of the archive: each such line becomes a `Note:` card or a line in the module's `doc/`. Not part of this plan's steps; flagged so it is not lost.

### Dashboard default: last month

Today the Dashboard reads `public/framework/ai/tasks.json`, written by [`Servex/asks/tasks.js`](/Servex/asks/tasks.js) with `DAYS = 7`, and polls it every 20 s (`POLL_MS` in `dashboard/page.js`). Two changes:

1. **Now (one constant):** `DAYS = 7` becomes `30`, so the default view is the last month. This needs no other work.
2. **With the build:** the Dashboard tiles ask the `tasks` Query source (`day >= month_ago`) and stream, and `tasks.json` plus its poll retire. That also removes the fourth "open" definition (step 2) and the polling the CLAUDE.md "stream, don't poll" rule warns against.

The range chips on the handover page and the Dashboard share one helper, `range(name)` returning `{ since }`, so "last month" is defined once.

---

## Step 5 — Open question: rename `task.jsonl` to `session.jsonl`?

**Recommendation: no. Keep `task.jsonl`.** No rename was ever decided, so this is only a question, and the cost is large while the gain is a word.

### The cost, counted

A search of `*.js` and `*.mjs` finds **623 mentions of `task.jsonl` in 249 files** (a count on this branch; docs, skills, and the logs' own text come on top). They sit in:

- **Servex:** `TaskLoop`, `Heartbeat`, `Budget`, `Agents`, `Cards`, `asks/tasks.js`, `Worktrees`, `Lifecycle`, `tools.js`
- **Server:** `SessionIndex`, `FollowUp`, `PastWork`, `TaskDirs`, `TaskState`, `merge.mjs`, `review.mjs`, `task-cost.mjs`, `health.mjs`
- **Hooks:** `append.mjs`, `ledger.mjs`, `jsonl-schema.mjs` (which **keys its whole schema on the basename** `task.jsonl`), `jsonl-guard`, `naming-guard`, `prompt-relay`
- **Skills and the browser:** the `new-task`, `minion` and `finish-task` skills, the `ai/v/2` and `v/3` pages, `AISession/*`

Plus about 1,500 existing files in git to move (that part is easy: a `git mv` script with a manifest, as CLAUDE.md requires).

### Two reasons it is also the wrong word

1. **`session.jsonl` already means something else.** `AISession.js`, `session-summary.mjs`, `session-place.mjs` and `AILogs.js` already use a per-session `session.jsonl`: the tracked, append-only record of tags, notes and links that people and agents write about a session ([record-spec](/framework/ai/sessions/doc/data/record-spec.md)). Renaming would put two different files under one name.
2. **A session and a task are not the same thing.** One Claude session works on several tasks, and one task is picked up by several sessions (resumes, forks, a mastermind and its minions). The log records the **task** (`landed_at`, `outcome`, `steps`), which is why `ledger.mjs` has to *find* the task for a session id. `task.jsonl` is the accurate name.

### If the worry is the word, not the file

The owner's question was really "one source of truth", and that is solved by the query (steps 1 to 4), not by a filename. If a clearer name is still wanted, the cheap version is **a doc line, not a rename**: `ai/readme.md` says "a `task.jsonl` is the log of one unit of work; a *session* is one Claude chat; one session can write to many tasks". If the owner still wants the rename later, do it as one scripted move with `ledger.mjs` and `jsonl-schema.mjs` reading **both** names for a release (`old exports aliased until <date>`, as the 10-13 script renames did), and pick a name that is not already taken (`work.jsonl`, `log.jsonl`) instead of `session.jsonl`.

---

## The build order (when the owner approves)

1. `SessionIndex.refresh()` and the `error` handler (step 1) with a test.
2. `open` / `state` / `priority` / `topic` / `now` in `apply()`, then `Handover.mjs` (steps 2 and 3).
3. The `SessionStart` hook and the `TaskLoop` orphan call (step 3).
4. `HandoverPage` and the `handover.md` stub, with the archive move (step 4).
5. `DAYS = 30` now, the Dashboard on the Query source later (step 4).

Each item is small, lands on its own, and can be stopped after any of them with the handover still working.
