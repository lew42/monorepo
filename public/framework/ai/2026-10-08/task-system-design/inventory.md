# Task systems we have — inventory (2026-10-08)

Counts were computed by script from the repo, not recalled. There are about ten places tasks live; none is the master, and only the first is complete.

| System | Where | Created / updated / closed by | Read by | Trust |
|---|---|---|---|---|
| **Task log** | 1,312 `task.jsonl` under `public/framework/ai/<date>/<slug>/` (one line kind per verb: `log` 15k, `assign` 7k, `action` 5k, `agent` 1.7k, `review`, `decision`, `ask`, `card`) | `new-task` skill opens it, `append.mjs` is the one writer, `finish-task` lands it | AI board, Inbox, Servex `tasks.json`, Dashboard | Best record, but "landed" is a convention: 1,049 of 1,312 (80%) have a `landed_at`; the rest are open, abandoned or forgotten, and nothing tells which |
| **Task page** | `page.jsonl` beside each `task.jsonl` (the card's content) | task mastermind via page tools | the card view | Good for reading, not for state |
| **To-do list** | [`ai/todo.md`](/framework/ai/todo.md) (177 lines, hand-written; done items struck through by hand) | agents append, owner prioritises | owner, masterminds | Drifts: items stay open after landing until an audit strikes them |
| **Asks ledger** | [`ai/asks.jsonl`](/framework/ai/asks.jsonl) (258 lines) | Servex routes each owner ask, writes a line with owner agent + card + status | Asks page, TaskLoop | Fair; status goes stale when the owner agent dies |
| **Cards** | [`ai/cards.jsonl`](/framework/ai/cards.jsonl) (521 lines: id, title, type, status, preview) | `create_card` / `card_set` tools | AI board, Inbox rail | Index of task folders; `status` is set by hand and often stale |
| **Servex queue** | [`ai/servex-queue.json`](/framework/ai/servex-queue.json) (a JSON array: dir, title, budget, model, next) | mastermind-servex writes it by hand | the Dispatcher, a human | Stale by nature: a hand-edited array nobody appends to safely |
| **Dispatcher / TaskLoop / prompts log** | `Servex/agents/Dispatcher.js`, `TaskLoop.js`, `.claude/prompts/<date>.jsonl` | Servex itself, on every owner prompt and every heartbeat | Servex, Asks | Reliable (code writes it) but about *agents and prompts*, not tasks |
| **Budget / spend** | `Servex/Budget.js`, `spend.json` per task | code | gate, board | Reliable (computed) |
| **Readme To-do sections** | 2 readmes (grep `^#.*to-?do`) | whoever edited the readme | nobody systematically | Orphaned |
| **core/Task** | [`core/Task`](/framework/core/Task/): `Task` = `Item` + 5 states + `tasks: List` + computed `progress()`/`duration()` | nothing in the AI system uses it yet | its own live demo | Good class, **unwired** |
| **Sessions** | [`ai/sessions`](/framework/ai/sessions/) + `session.jsonl` (new `session-class` task) | Servex / VS Code ledger | Sessions page | New; tasks are not a field of it yet |
| **Tasks in `page.jsonl`** | 1 file with a `"tasks"` key | — | — | Negligible |

## What this tells us

- **State is the weak point.** Open/closed lives in four places (`landed_at`, card `status`, ask `status`, todo strikethrough) and they disagree. Per CLAUDE.md law 7 the state must be *computed* from the record, never a flag someone remembers to flip.
- **There is no hierarchy.** A task is a flat folder; "subtask" exists only as a nested folder by naming habit.
- **A real class already exists** (`core/Task`) and nothing uses it.
- Minions could not be spawned for this scan (no pool worktree free), so scripts did it; that cost almost nothing.
