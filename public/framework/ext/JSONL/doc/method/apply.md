One entry in, one line replayed: for every key on the entry, dispatch to the same-named method if it's in `this.constructor.verbs`, else `skip()`. `this.constructor.verbs` — not `JSONL.verbs` — is what makes a `TaskJSONL` line resolve `agent`/`chat` against its own, longer list rather than the base class's.

**Multiple verbs in one line both run** — `Object.keys(entry)` doesn't assume exactly one — though every writer on this site sticks to one verb per line by convention (see [readme.md](../readme.md)).

This is the one method a new verb actually has to touch: adding a handler with no matching name in `verbs` means every line for it is silently routed to `skip()` instead — see [the `verbs` property](../property/verbs.md).
