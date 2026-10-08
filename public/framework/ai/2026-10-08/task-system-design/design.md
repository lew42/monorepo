# One task system — the proposal

Short version: **reuse [`core/Task`](/framework/core/Task/) as the one class**; give it a page and a session by *reference*; compute its state from an append-only `task.jsonl`; let agents drive it with in-process tools. Evidence: [inventory.md](inventory.md). Next steps: [plan.md](plan.md).

## 1. A task has a page; it is not one

`task.page` and `page.task` point at each other. `Task` stays an `Item` + `List` (no `Page` base, which has dozens of methods and would collide). Same for sessions: `session.page` / `page.session`.
- **One place per fact.** `task.jsonl` holds *state facts* (assign, state change, cost, parent, links). `page.jsonl` holds *presentation facts* (what the card shows: notes, report, shots). A fact is written once; the other file refers by id (`{"task":"2026/10/08/slug"}`), never copies.
- **Load order.** Lists load only a small derived `index.json` (title, state, progress, owner, cost; rebuilt from `task.jsonl`, never hand-edited). Opening the card loads `task.jsonl` (always) then `page.jsonl` (when the card's page renders). The log is never loaded for a list row.
- Alternative kept: a single file with both kinds of line. Rejected: two writers (Servex and the page tools) would interleave and a list would load page content.
- Gap, filed in [core/Page/doc/composition.md](/framework/core/Page/doc/composition.md): Page lacks easy create / read / update / delete / **move**.

## 2. Tasks live anywhere, and can move

A task is created in a session, page or module folder. Its `task.jsonl` line 1 records `origin` (the creating session id) and `home` (where it lives). Three backlink designs:
1. **Origin pointer, session lists by query** — the task keeps `origin`; the session page finds tasks by looking `origin` up in the derived index. *Recommended:* one fact, always correct, a move only changes `home`.
2. **Stub left behind** — a `moved_to` line in the old place. Simple, but two files to keep true.
3. **Session stores a list of task ids** — fastest to read, but a second copy that rots when a task moves or the session dies.

A move = append `{"move":{"from","to","at"}}` to the task and rewrite nothing else (never destructive; git is the undo).

## 3. Recursion: yes, shallow

`Task.tasks` is already a `List`; a parent's progress is `{done,total}` computed from children (already implemented, `finish()` refuses while a child is open). Worth it because a planning agent can lay out a tree before starting anything. Cap the *UI* at two levels (rows inside a card); the data may nest further. A subtask is a task with `parent`; it can live in a different folder (see 2).

## 4. Lifecycle

States: `idle (planned) → running ⇄ paused → finished`, plus `blocked` (waiting on something named) and `abandoned` (dropped, kept for the record), alongside the existing `stopped`. Who may change it:
- **Owner agent** (the mastermind or session on `assign.agent`): any transition.
- **Parent task's owner**: may start, pause, abandon a child.
- **Servex / TaskLoop**: only `blocked`/`abandoned` when an agent is dead or stalled, marked `by:"servex"`.
- **The owner (human)**: anything, from the card.

State is computed by replaying lines; there is no "status" field to set. `landed_at` becomes just the `finished` line. A planning agent calls `task_plan(tree)` once to create the whole `idle` hierarchy.

## 5. UI

One card, existing components: a card (`ux/Inbox` rows / `AIRail`) with title, state chip, progress bar (aggregate), owner `@agent`, links to session and page, and sub-task rows (the same card, compact). Cost shows rolled up. In the Sessions dashboard each session row gets a "tasks" count that expands to those rows; the Inbox rail keeps showing only what needs the owner (`blocked`, failed, asked).

## 6. With the new Session system

Sessions create and manage tasks (`task_create` writes `origin`). A task's cost = sum of the cost of every session whose id appears in its `assign`/`agent` lines, read from the session ledger (`session.jsonl`), computed, not stored. Session index shows `tasks: n`. Follows the owner's rule: index derived, ledger source of truth.

## 7. Tools

Every tool in `Servex/agents/tools.js` is one definition (`name, description, inputSchema, handler`) used two ways: **in-process** for Servex-spawned agents (`server()` wraps each in the SDK's `tool()` + `createSdkMcpServer`, no network), and **HTTP MCP** (`Servex/MCP.js`) only for outside sessions such as VS Code tabs. So the recommendation is already the rule: *write handlers as plain functions; never make an agent call its own host over HTTP.* Only the `site` MCP (browser tabs: `eval`, `shot`, `claim`) genuinely needs the network. Needed task tools (all in-process): `task_create`, `task_plan` (tree), `task_set` (state), `task_move`, `task_link` (session/page), `task_read` (computed state + children), `task_list` (query the index). Existing `snooze_task`, `kill_task`, `reprioritise_task`, `close_task` fold into `task_set`.

Reuse-first note (law 6): this extends `core/Task` and the existing `append.mjs` single writer; it builds no second system and does not touch `cards.jsonl` / `asks.jsonl` / `todo.md` — those become *views* of the index (see plan).
