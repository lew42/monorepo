The static allow-list `apply()` checks before dispatching a key: `["assign", "log", "action"]` on the base class. A key not in this list never reaches a same-named handler — it goes to `skip()` instead, so adding a handler method alone does nothing.

**A subclass that adds a verb restates the whole list**, never appends to the inherited one: `static verbs = [...JSONL.verbs, "agent", "chat"]` on `TaskJSONL`. Forgetting the override is the trap — see [task-jsonl](../task-jsonl.md).

Read via `this.constructor.verbs` inside `apply()`, so a subclass's list is the one that's checked, not the base class's.
