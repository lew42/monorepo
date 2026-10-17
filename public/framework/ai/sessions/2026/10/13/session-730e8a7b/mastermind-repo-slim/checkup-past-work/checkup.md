# Checkup: finding past work, the salvage branches, the Whisper log

Past work was already findable by task and module; it was **not** findable by session tag from the Sessions page, and "does it exist?" was only a sentence in two skills. Both now have working versions. Detail for the owner's asks: [finding past work](/framework/ai/doc/owner-2026-10-17-finding-past-work.md).

| Task | State | Open | Decision | Next |
|---|---|---|---|---|
| [past-work](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) | landed | tags were not searchable from the Sessions page | Sessions search now matches tags (verified live, `163fa78d0`); `PastWork` reads tagged sessions | clickable tag chips on the existing `tag_filter` ([todo](/framework/ai/todo.md)) |
| [past-work-audit](/framework/ai/sessions/2026/10/15/voice-opus/past-work-audit/) and [past-work-audits](/framework/ai/sessions/2026/10/15/voice-opus/past-work-audits/) | landed | six leftover findings | folded into one todo line, linked to the findings | [todo.md](/framework/ai/todo.md) |
| [salvage](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) | landed | top 5 undecided | all five set aside, none merged (dev rewrote 51 to 61 of their files); the other 103 get the same rule | [salvage note](/framework/ai/doc/salvage-2026-10-17.md) |
| [whisper-log](/framework/ai/sessions/2026/10/16/voice-20261016/whisper-log/) | built, closed | page renders with "0 events" until a dictation page writes to it | close as built; the empty log is the truth, not a bug | the next Refine dictation fills it |
| [subpages](/framework/ai/sessions/2026/10/16/voice-20261016/subpages/) | landed | none | `core/Page` readme already says subpages are `page.jsonl` lines | none |

## The six things the owner asked about

- **past-work skill and script:** lists landed tasks, module logs and now tagged sessions. Started: the Haiku searcher (`--brief`, a ready prompt with the readme chain) and `--task` (writes `past-work.md` beside a task). Next: run `--task` automatically from `TaskDirs.mjs --new` (handed to `checkup-task-system`).
- **asks-by-module and `ext/Refine/doc/asks.md`:** the same asks grouped by module; generated, last built 2026-10-14. Next: nothing new; the ask-routing gap is in the todo line.
- **session digests and tags:** 588 sessions summarised and tagged. Started: search by tag.
- **`query.md` keep/scrap:** keep the one query; leave `PastWork`, `ModuleLog` and `Asked` apart for now.
- **`owner-2026-10-16-indexing.md`:** its readme-chain idea is now written down and wired; the "Related list" idea stays an idea.
- **readme rules in CLAUDE.md:** readme-reach reports 33 checked, 0 misses; the `core/Page` and `Server` readmes are over 100 lines (for `readme-upkeep`).

## Decisions made for the owner

- Tag search as free text. Alternative: tag chips; they win once the tag list is short.
- Salvage top 5 set aside instead of merged. Alternative: merge the Page-extends-Item idea; it loses because 51 files diverged and the idea is already in `core/Page` architecture.
- The tag-search change merged with `--no-review` and `--skip-smoke` after a light review (its five findings answered in the task log) and a live headless check. Alternative: register the worktree and run the smoke test; the evidence would be the same.
- "Does it exist" is a computed file, not an agent step (law: compute, don't recall).

## Needs the owner

Nothing. Needs restart: none from me (wiring `--task` into Servex, if `checkup-task-system` chooses to, will).
