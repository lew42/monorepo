# The item tool

`item({path, delta})` in `Servex/agents/page_tools.js`: `page_set` generalised to any Item class. `delta` is one log line, the object `Item.set()` takes. A key naming a method calls it, a key naming a child walks into it, anything else assigns (`set_one` in `core/Item/Item.js`; there is no second apply).

- **Which log:** a url's folder holds `task.jsonl` (Task), else `session.jsonl` (Session, class not built yet), else `page.jsonl` (Page). `task.jsonl` beside a `page.jsonl` means a task folder. A `class` key on line 1 wins.
- **No delta** returns the state; Task: `{class, state, completion, data, tasks}` from `Task.replay`.
- **Dot paths:** `"now.preview": x` becomes `{now: {preview: x}}`.
- **Refusals (Task):** `_` keys and keys that are no method, field or child return `{ok:false, why, exists}`.
- **Instructions:** first call per caller and class returns `Item.describe()` (plus first comment lines); `{"help":{}}` repeats them.
- **Decision:** the `jsonl-schema.mjs` check is skipped for Task lines (the tool validates them; the schema forbids `by`/`ts`).
- Test: `node Servex/agents/item_tool.test.mjs`. Servex must restart to load the tool.
- **In-process (step 12):** Servex-spawned agents also get this tool as `mcp__local__item` (same function, no HTTP; the `mcp__servex__` twin is disallowed). Off with `SERVEX_LOCAL_TOOLS=0`; test `Servex/agents/item-local.test.mjs`.
- **Task homes (step 14a):** on a Task or Session, `{"tasks":{"add":{title, module?, …}}}` makes a child folder (`<module>/tasks/<slug>/` if the module folder exists, else `<parent>/<slug>/`, `-2`, `-3` on a repeat) with its app path on line 1, and writes only `{"task": path}` on the parent. The answer lists `homes`. Replay resolves references (`Task.from_ref`, `link_refs`). Tests: `item_tool.test.mjs`.
