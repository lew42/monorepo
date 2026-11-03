# Session is a Task: the migration (2026-10-24)

**What changed:** `Session extends Task` (it was `extends Item`). The owner asked for it on 2026-10-24 ("make session extend task… properly transition from whatever it is now to the new state"). The brief is [session-is-a-task/requirements.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-is-a-task/requirements.md), items 1–13.

## What a Session now gets from Task, and what it keeps

| | From Task | Kept in Session |
|---|---|---|
| `tasks` | Task's list: a string, an object, or a typed object (Project, Process, Session); children watched | — |
| state | `state` getter, `can()`, the verbs | its record's own `{"start"}` / `{"stop"}` lines (`apply_line`), and `replay_end` (Task's would read a record with no verb lines as running) |
| numbers | `completion`, `cost`, `summary()`, `queries` | `progress()` (no tasks reads 0 of 0, not Task's 0 of 1) |
| times | `created_at` of each child (the time of the line that added it, in memory, never data) | `first_at`, `last_at`, `span_ms` from its lines |
| folder | — | `days`, `slugs`, `scan()`, `locate()`, `dir_url()`, `MENU`, `SETTINGS` |

A record referenced with `{"task": "<folder>"}` whose line 1 is `{"session":{…}}` replays as a `Session` (`Task.from_ref`), named by its session id. A Servex agent's own folder opens with `{"assign":{session_id,…}}`, so it replays as the Task it carries, with its `session` field. That is how a child session shows as its task.

## Every caller, and what it reads (computed 2026-10-24 with a grep for imports of `core/Session/Session.js`)

| Caller | Uses |
|---|---|
| `ai/AISession/AISession.js` | `extends Session`: adds cost, cache, transcript, `root_url()`. Its members only overlap Task's in `render` (its own view, meant to override) |
| `core/Session/SessionTasks.js`, `SessionSettings.js`, `page.js` | `Session.replay(lines)`, `tasks`, `progress()`, `settings`, `menu()` |
| `Servex/agents/page_tools.js` | `LOADERS.Session`: a record whose line 1 is `{"session"}` is replayed as a Session; `session_state` |
| `Servex/agents/Agents.js` | `Session.agents_resolver` (now `(dir, {session_id, since})`) |
| `Servex/agents/PromptTasks.js` | replays a session record to file an owner prompt's asks |
| `Server/AskIndex.mjs`, `Server/TaskMove.mjs`, `Server/Day.test.mjs` | `scan()`, `locate()`, `Day` |
| tests | `Session.test.mjs`, `session-task.test.mjs`, `Servex/agents/{session-state, session_tasks, handover, prompt-tasks, item_tool}.test.mjs` |

The record shapes it reads are listed in the [readme](../readme.md) ("Lines it replays"); none changed.

## The proof that old records still read the same

- Every session record under `ai/sessions/` (97 files whose line 1 is `{"session"}`) was replayed by the old class (michael/dev) and the new one (worktree qf-4).
- The comparison covered: tasks and their ids, every task's state, `progress()`, `completion`, `first_at`, `last_at`, the session's own state and `settings`.
- Result: **97 of 97 the same, 0 errors.** The script and its output are in the session-is-a-task task folder ([migrate-check.mjs](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-is-a-task/migrate-check.mjs)).

## Item writes, before and after

On a copy of session-e00f55c9's record (138 KB, 182 tasks, 153 child agents):

| | Before | After |
|---|---|---|
| a write | 20 s, answering about 45 KB (the whole session picture) | 5–7 ms, answering under 400 bytes (`{ok, ids, line, size, now}`) |
| a full read | 21 s | 1.8 s the first time, 36 ms after (each agent log's cost is kept until the file changes) |

The 20 s writes were also past the browser Store's 5 s timeout, after which the browser appended the line itself (a possible twin line).

## Decisions and their alternatives

- **A session is named by its id, a task by its path.** Alternative: name parents by path everywhere. That wins if sessions stop having ids of their own; today the page route, the transcript and the registry all key on the id.
- **`parent_session` sits beside `parent` in the registry** rather than replacing it. `parent` is the agent id the child wakes when it ends, so it must stay an agent id.
- **Old registry rows are not rewritten.** The registry is live Servex state, so instead they are matched by the parent's name within the session's span. Rewriting them is a one-off script, worth running only if the match ever proves wrong.
