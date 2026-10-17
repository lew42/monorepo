# Item tool: step 5 of the task system plan

Budget: $5

This task builds step 5 of the [task system plan](../plan.md): **section 4, "The item tool"** (corrected 2026-10-16). **Build only step 5.**

Read first: that section, then the owner's note in `Servex/doc/owner-2026-10-16-tools.md`, under "The item tool is set()".

Not this task: the in-process path for local SDK agents is step 12.

## The one idea

`item({path, delta})`: `delta` is **one JSONL line**, the exact object `Item.set(delta)` takes and `page.jsonl` holds. A delta from a file and a delta from a tool go through the same code ("one system, not two").
- A key that names a method calls that method, with the value as its arguments.
- A key that names a child Item walks into it.
- Any other key assigns.

`set_one` in `core/Item/Item.js` (around line 121) already does all three. **Do not write a second apply.**

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/item-tool`, on branch `worktree/item-tool`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges it.
- **Your files:**
  - `Servex/agents/page_tools.js` and `Servex/agents/page_tools.test.mjs` (or a new `item_tool.test.mjs` beside it)
  - `public/framework/core/Item/Item.js`, only to add `static describe()`
  - `public/framework/core/Task/readme.md` and `Servex/doc/` (a few lines)

## What to build

1. **Generalise `page_set`'s resolve step** (`resolve()` and `resolve_file()` in `page_tools.js`) to find an item's log file:
   - `task.jsonl` means `Task` (`core/Task/Task.js`).
   - `page.jsonl` means `Page`.
   - `session.jsonl` means `Session`. That class doesn't exist yet, because it comes in step 7, so map the file name and let the class check be skipped.
   - Line 1 may also carry a `class` key, which wins over the file name.
   - Which file to use when a folder holds more than one: `task.jsonl` beside a `page.jsonl` means a task folder. Decide the rule, and write it in a one-line comment.
   - The session-route handling (`SESSION_ROUTE`) must keep working for pages.
2. **The `item` tool**, `tool("item", …)`, with `{path, delta}`:
   - With no `delta`, return the current state. For a Task: `Task.replay(lines)` → `{class, state, completion, data}`. For a Page: what `page_read` returns.
   - With a `delta`: validate it (step 3 below), stamp `by` and `ts` exactly as `page_set` does (`stamp_ids`, `nest`), append it with `write_line`, then return the new state.
   - For a Task, the returned state comes from replaying the file after the append, so the answer comes from the same `Task.replay` / `set` path as a file read. That is the "same code" test.
   - **Dot paths:** `{"now.preview": x}` expands to `{"now": {"preview": x}}` before anything else, in one small function. There is no second path.
   - **`page_set` becomes an alias of `item`:** its handler calls the same function (keep its `target` and `pages` handling, and its description). Every existing `page_tools.test.mjs` test must still pass.
3. **Refusals.** These apply only when the class can be imported in node: Task can; Page probably can't (it touches the DOM), so for Page keep `page_set`'s behaviour.
   - Refuse a top-level key that names a method starting with `_`.
   - Refuse a top-level key that names neither a method on the class nor a known field.
   - Each refusal is `{ok:false, why, exists:[…]}`, listing the public methods and the fields.
   - For Task, the known fields come from `Item.describe()` (step 4) plus the fields the plan's section 2 names.
4. **`static describe()` on `Item`:** it returns `{class, fields, methods:[{name, doc}]}`, computed from the class.
   - The methods are the prototype chain's own public methods, with no `_` and no getters, up to and excluding `Object`.
   - `doc` is the first `//` comment line above the method, read from the class's source file. If reading source is awkward, do it in the tool: the tool knows the file. Keep it simple and stop when it works.
5. **Instructions on the first call:** the first `item` call per class per caller (`ctx.caller`) returns `instructions: describe()` beside the result. Later calls return only the result, and a delta of `{"help": {}}` returns the instructions again. A module-level `Map` keyed by caller and class is enough.

## Check before the commit

Tests run in node, on fixture folders in a temp dir. They don't touch real task folders and don't start Servex.
- `item` on a fixture `task.jsonl` with `{"start": {}}` returns `state: "running"`, and the file gains exactly one stamped line.
- `{"tasks": {"add": {"title": "x"}}}` returns `completion: 0` and one child.
- `{"_secret": 1}` and `{"nonsense_method_or_field": 1}` are refused, with `exists`.
- `{"now.preview": "x"}` appends `{"now": {"preview": "x"}}`.
- The first call returns `instructions`, the second doesn't, and `{"help": {}}` returns them again.
- `page_set` still writes the same line it wrote before, and the old `page_tools.test.mjs` passes.
- `node public/framework/core/Task/Task.test.mjs` still passes 42/42.
- **Servex isn't restarted.** The running Servex keeps the old tools until the owner restarts it. Never call `restart_servex`, and don't try to test through the live MCP.

## Landing

- **Log as you go:** append `log` lines to your own `task.jsonl` with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`, where the lines file is a JSON array.
- **When the commit passes, send one message to `mastermind-task-system`:** the hash, what you checked, and what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl` and stop.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
