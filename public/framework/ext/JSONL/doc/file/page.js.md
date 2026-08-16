# `page.js`

The module's own `Doc` page. `subject: JSONL` — the base class — because
`Doc.member()` only reads a subject's *own* prototype properties, and
`TaskJSONL.prototype` only owns `agent` and `chat`; everything it inherits
(`read`, `apply`, `log`, …) would come up "no member" if `TaskJSONL` were the
subject instead. `TaskJSONL` gets the **TaskJSONL** overview card and the
[task-jsonl](../task-jsonl.md) note instead of API entries — see that note's
own doc for why.

## Three demos, now two rail cards plus one inline

The Overview's `content()` keeps the original base-`JSONL` replay demo
inline — it is the first thing a reader needs, not a variant of anything.
The two demos that used to stack under it (the `TaskJSONL` merge-by-task
replay, and the live `task.jsonl` fetch) are now the **TaskJSONL** and
**Live** cards in the rail, so a reader compares them side by side instead of
scrolling past three demos in a column.

## The `Live` card reads a real file outside this module

`/framework/ai/2026-08-14/jsonl/task.jsonl` — the task that built `JSONL`
itself. It is the one place in this module where the fences matter: this
`page.js` reads that file at runtime (a `fetch`, not an edit), and nothing
under `framework/ai/` was written or touched to produce this page.

## Improvements

1. **The `Live` card's url is a hardcoded date.** `/framework/ai/2026-08-14/jsonl/task.jsonl`
   will eventually be an old task, no less true for being static, but a
   reader skimming the Overview months from now has no way to tell "this is
   an example on purpose" from "this rotted." A one-line caption saying so
   would cost nothing. *(simple, useful.)*
2. **An unknown verb still has no demo.** The torn-line half is now shown — the
   base demo's third line is cut mid-key and the caption reads the `unparsed`
   count back — but `skipped`, the other half of "loses that line, never the
   log", is still only claimed. One more line in that same input text closes it.
   *(simple, useful.)*
