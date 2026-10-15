# Step 2 (proposal, not built): a landing log line per folder

## The problem
`ModuleLog` has to guess which task a commit belongs to (action files plus a time window). On `core/Page`, 199 of 275 items are commits that no task claims. The guess exists because nothing is written at the moment of landing.

## Proposal
When `merge.mjs` lands a branch, it appends one line to the `ai/log.jsonl` of each module folder the diff touched (for example `core/Page/ai/log.jsonl`), through the existing `.claude/hooks/append.mjs` validator:

```json
{"landed":{"at":"2026-10-15T17:20:00-05:00","task":"ai/sessions/2026/10/15/<session>/<slug>","branch":"worktree/x","commit":"abc1234","files":["core/Page/Page.js"],"why":"<outcome sentence>"}}
```

- Written by code (law 7): `merge.mjs` already knows the branch, the task dir (from `assign.branch` in the task log) and the diff, and `LandingCheck` already verifies it.
- One line per module per landing, with the real merge commit sha. `ModuleLog` then ties commits by that line first and falls back to today's guess for older history.
- The folder is the `SessionIndex.module_of()` module, so the names match everywhere.

## Why not more
Per-folder `ai/log.jsonl` files exist today in 21 places with 204 lines, too sparse to grade on. This makes them dense going forward, with no back-fill (never destructive).

## Open choices (my default first)
- Location: beside the module, or one central file. Default: beside the module.
- Back-fill old landings: no; `ModuleLog`'s join covers them.
- A commit-subject convention (`task-slug: ...`) would also help, but a written line is sturdier.
