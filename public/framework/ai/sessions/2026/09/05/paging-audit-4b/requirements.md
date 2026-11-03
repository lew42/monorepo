# paging-audit-4b — Critic B, the systems designer, fourth visit

The ask, verbatim from `../paging-audit-4/requirements.md`:

> **Critic B — the systems designer, fourth visit** (`../paging-audit-4b/`, create with `new-task`): re-check your third list item by item with file:line; count the stage renderers and the vocabularies now; check the url seam end to end (every control writes the query; every page reads it; `?nest=` round-trips); then rule on the last big item — `BuildStage` → `PagingStage` (the four steps are in `doc/builder.md`) — is it worth an afternoon now, and what does the realm gain that a newcomer would notice. The ranked FIX LIST or an empty one with the reason.

This round is the exit test: if the list is empty or only cosmetic, say so plainly.

## Rules

Fix nothing; change nothing under `public/` outside this task dir. Private server (kill by the pid started; never port 80); never `find /`; never spawn agents; never `git stash`/commit. Budget ~200k. Report in <= 10 plain lines plus the list.
