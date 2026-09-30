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
| `status`, `decided_by` | `"decided"` / `"system"` by default — the recommended option starts already chosen, marked "chosen by the system" — unless the decision was created `--owner-only "<reason>"`, which stays `"open"` / `null` until a real tap. Either way the latest `chose` line, if any, wins: tapping a different option writes `decided_by: "owner"` ("your choice"); tapping the chosen option again clears it, writing `option: null`, which falls back to the system's default rather than to nothing |
| `owner_only` | present (a short reason, e.g. `"key"`) only on a decision that must wait for the owner; otherwise `null` |

A record without these draws exactly as before.

The classes are [`Decision.js`](/framework/ux/Content/Decision/) and `Decisions.js` (the ranked, nested list); every method is a seam, so a variant is a subclass.
