# One task system — the proposal

Reuse [`core/Task`](/framework/core/Task/) as the one class. A task points to its page and session; it never extends them. Its state is computed from an append-only `task.jsonl`, and agents drive it with in-process tools. Evidence: [inventory.md](inventory.md). Next steps: [plan.md](plan.md).

```
task (Item + List)          <- the one class
├── task.jsonl              state facts: assign, state, cost, parent, move
├── task.page  <-> page.task      page.jsonl: what the card shows
├── task.session <-> session.page
└── tasks[]                 subtasks: the same class, progress = done/total
```

## 1. A task has a page; it is not one

`Page` has dozens of methods, so extending it would cause name clashes. Same for sessions.
- **One place per fact.** `task.jsonl` holds state; `page.jsonl` holds presentation. The other file refers by id and never copies.
- **Load order.** Lists load a small derived `index.json` (rebuilt from `task.jsonl`, never hand-edited). Opening a card loads `task.jsonl`, then `page.jsonl`.
- **Alternative rejected:** one file with both kinds of line, because two writers would interleave.
- **Gap:** Page lacks easy create / read / update / delete / move ([composition.md](/framework/core/Page/doc/composition.md)).

## 2. Tasks live anywhere and can move

`task.jsonl` line 1 records `origin` (the creating session) and `home` (where it lives). Backlink options:
1. **Origin pointer (recommended).** The session finds its tasks by looking `origin` up in the index. One fact, and a move only changes `home`.
2. **Stub left behind.** A `moved_to` line in the old place. Two files to keep true.
3. **Session stores task ids.** Fast, but a second copy that rots.

A move appends `{"move":{"from","to","at"}}`. Nothing is deleted.

## 3. Recursion: yes, shallow

`Task.tasks` is already a `List`, and `finish()` refuses while a child is open. A planning agent can lay out the whole tree before starting. The UI shows two levels; the data may nest further.

## 4. Lifecycle

`idle → running ⇄ paused → finished`, plus `blocked` and `abandoned`. State is replayed from lines, never set as a field.
- **Owner agent:** any transition.
- **Parent's owner:** start, pause or abandon a child.
- **Servex:** only `blocked` or `abandoned` for a dead or stalled agent.
- **The owner (human):** anything, from the card.

## 5. UI and sessions

One card: title, state chip, progress bar, `@agent`, links to session and page, compact sub-task rows, rolled-up cost. Each Sessions row gets a `tasks: n` count. A task's cost is the sum of its sessions' costs, computed from the session ledger.

## 6. Tools

Each tool in `Servex/agents/tools.js` is one definition, used two ways: in-process for Servex agents (no network), and HTTP MCP only for outside sessions. The rule: never make an agent call its own host over HTTP. Needed tools, all in-process: `task_create`, `task_plan`, `task_set`, `task_move`, `task_link`, `task_read`, `task_list`. The old `snooze_task`, `kill_task`, `reprioritise_task` and `close_task` fold into `task_set`.

**Fits the owner's tooling direction** ([tooling-architecture](/framework/ai/doc/design/tooling-architecture.md)): minimal default tools, a skill that lists what is callable, and one generic object-path + method tool. So the task operations are methods on the `Task` class (`create`, `plan`, `set_state`, `move`, `link`, `read`, `list`), not seven hand-made tools. Each is callable as `{path:"tasks/<id>", method:"set_state", args:["paused"]}`; one node function resolves the path, calls the method, and stamps time, author (the calling agent) and cost into the `task.jsonl` line, so an agent never writes JSONL or its own timestamp. Until the generic tool exists, the same methods are wrapped as the thin named tools above. A "tasks" skill lists the methods (loaded on demand), and only a planning session template needs it.

`cards.jsonl`, `asks.jsonl` and `todo.md` stay, and become views of the index ([plan.md](plan.md)).
