# Session extends Item: step 7 of the task system plan

Budget: $3

Today `Session` (`public/framework/core/Session/Session.js`, 59 lines) is a plain class, and `AISession` extends it. The plan makes it an Item that **has** tasks, with its progress computed from them: "A session has `tasks`, and its progress is computed from them" ([plan](../plan.md), section 1 and step 7; the plan is at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`). The accounting task proposed the same thing ([requirements R13](../../accounting/requirements.md), [shape.md](../../accounting/shape.md)); it was closed in favour of this plan, so there is nobody to coordinate with. **Build only step 7.**

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/session-item`, branch `worktree/session-item`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge; `mastermind-task-system` reviews and merges. A post-commit hook records your commit on your task by itself.
- **Your files:** `public/framework/core/Session/` (`Session.js`, `readme.md`, a new `Session.test.mjs`), `Servex/agents/page_tools.js` (only the `session.jsonl` → Session mapping), and `public/framework/ai/AISession/AISession.js` only if a name collision forces it.

## What to build

1. **`class Session extends Item`** (`core/Item/Item.js`; Item extends `Events(Object)`). `constructor(id)` calls `super()` and keeps `this.id = id`. All the existing statics (`days`, `slugs`, `scanned`, `root_url`, `day`, `dir_url`, `scan`, `locate`) stay as they are.
2. **`tasks`:** a `List` of `Task` (`core/Task/Task.js`), made on first use, exactly the way `Task` makes its own `tasks`. Read `Task.js` (`get tasks`, `progress()`, `get completion`) and **reuse it**: if the counting code can't be shared as is, move it to one static on `Task` (for example `Task.progress_of(list)`) that both classes call. Don't write a second copy (rule 6).
3. **Progress:** `progress()` returns `{done, total}`, and the `completion` getter (0..1) is the share of its tasks that are complete, computed on read.
4. **Replay:** `Session.replay(lines)` builds a Session from its log lines through `set()`, the same way `Task.replay` does, so a `{"tasks":{"add":{…}}}` line adds a task.
5. **The item tool:** in `page_tools.js`, `session.jsonl` already maps to the name `Session` with the class check skipped (step 5). Now point it at the real class, so `item({path, delta})` on a session folder with a `session.jsonl` returns `{class:"Session", completion, data}` and refuses unknown keys like it does for Task.
6. **No collisions:** `AISession` (613 lines) extends `Session`. Before you change the base class, list AISession's own methods and fields and check none clash with Item's (`set`, `get`, `on`, `emit`, `render`, `View`, `id`, `wire` and the rest). If one clashes, rename the AISession side and say so in your report.

## Check before the commit

- `node public/framework/core/Session/Session.test.mjs`: a Session with three tasks, one complete, gives `completion` 1/3; replay of a `tasks.add` line works; `Session.describe()` lists `tasks` and `progress`.
- `node Servex/agents/item_tool.test.mjs` (13/13), `node Servex/agents/item-local.test.mjs` and `node public/framework/core/Task/Task.test.mjs` (42/42) still pass. Add one item-tool check for a fixture `session.jsonl`.
- **Headless only:** AISession pages must still render. Serve the worktree's `public/` on a private static port (or intercept requests in Playwright) and load `/framework/ai/sessions/` and one session page, for example `/framework/ai/sessions/2026/10/16/voice-20261016/`, with no console errors. Stop the server when you are done. Never drive the owner's tabs. If the worktree has no `node_modules`, borrow the main tree's (`C:/Code/lew42/monorepo/Servex/node_modules`) rather than installing.
- Never call `restart_servex`.

## Landing

- Log as you go: `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>`, where the lines file is a JSON array.
- When the commit passes, send one message to `mastermind-task-system` with the hash, what you checked and how, and what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl`.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
