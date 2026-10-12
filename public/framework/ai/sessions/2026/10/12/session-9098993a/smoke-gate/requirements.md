# Smoke gate fails on every page: fix the cause

**Found by** [asks-by-module](../asks-by-module/STATE.md), page ask 5 ("never ship an untested page", asked 5x): `Server/smoke.mjs` fails on every page because `Server/console-allow.jsonl` entries for the weight/settings 404s expired, so the merge gate means nothing.

## Done when
- [ ] Reproduce on current `michael/dev`; list each failing pattern with the page that triggers it.
- [ ] Fix each cause (the missing file, the wrong URL), not the allow-list. Extend an entry only with a named fixer and a date, per the mastermind skill.
- [ ] `node Server/smoke.mjs` passes on the core pages; record before/after counts in `STATE.md`.

Sonnet 5.5, medium. Worktree; commit each fix; merge. One-sentence chat replies; land with `finish-task`.
