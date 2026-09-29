# Decision — record shape

See [the shared record shapes](/framework/ux/Content/doc/shapes.md). This module reads and writes: decision / chose (and old task.jsonl decisions).

## The fields decide.mjs adds

A record written by `Server/decide.mjs` (its detail: `Server/doc/decide.md`) keeps the old fields (`ask`, each option's `say` and `caveat`) and adds:

| Field | Shown as |
|---|---|
| `rank` | a "Rank 1" chip above the question; `Decisions.js` orders by it, 1 first |
| `confidence` (0–1) | a "75% confident" chip |
| `recommended` (an option id) | a "★ recommended" mark on that option, until one is chosen |
| `sources` | a "Sources: …" line under the reason |
| `depends_on: {decision, option}` | the record is drawn full width below its parent's options, in the block labelled "If <option> → then decide:" |
| options' `id`, `text`, `caveats`, `then` | `id` matches `recommended` and `depends_on.option`; `then` lists the children |
| `status`, `decided_by` | always `open` / `null` from decide.mjs: the card decides. The latest `chose` line is the decision, shown as "Decided by <by>" |

A record without these draws exactly as before.

The classes are [`Decision.js`](/framework/ux/Content/Decision/) and `Decisions.js` (the ranked, nested list); every method is a seam, so a variant is a subclass.
