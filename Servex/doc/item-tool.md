# The item tool

`item({path, delta})` in `Servex/agents/page_tools.js`: `page_set` generalised to any Item class. `delta` is one log line, the object `Item.set()` takes. A key naming a method calls it, a key naming a child walks into it, anything else assigns (`set_one` in `core/Item/Item.js`; there is no second apply).

- **Which log:** a url's folder holds `task.jsonl` (Task), else `session.jsonl` (Session, class not built yet), else `page.jsonl` (Page). `task.jsonl` beside a `page.jsonl` means a task folder. A `class` key on line 1 wins.
- **No delta** returns the state; Task: `{class, state, completion, data, tasks}` from `Task.replay`.
- **Dot paths:** `"now.preview": x` becomes `{now: {preview: x}}`.
- **Refusals (Task):** `_` keys and keys that are no method, field or child return `{ok:false, why, exists}`.
- **Instructions:** first call per caller and class returns `Item.describe()` (plus first comment lines); `{"help":{}}` repeats them.
- **Decision:** the `jsonl-schema.mjs` check is skipped for Task lines (the tool validates them; the schema forbids `by`/`ts`).
- Test: `node Servex/agents/item_tool.test.mjs`. Servex must restart to load the tool.
