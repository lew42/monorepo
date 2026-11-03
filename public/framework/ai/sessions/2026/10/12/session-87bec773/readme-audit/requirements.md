# Readme audit after 2026-10-12 (Haiku pass, brief)

CLAUDE.md: "Readmes are the cheap index… keep them fresh and short; audit them in a cheap Haiku pass when pace allows." Pace is 52% with about two days left in the week. On 2026-10-12 a lot moved:
- tasks went into `ai/sessions/YYYY/MM/DD/`;
- three grids became `ext/DataGrid`;
- new modules: `core/Property`, `Page/Template`, `ext/Shots`, `ext/Query`, `code/performance`, PageInbox, the UI library, the layout catalog, the `past-work` skill and the step runner;
- comments moved to `doc/notes.md`.

## Done when
- [ ] **A node script** lists every `readme.md` under `public/framework/`, `Server/` and `Servex/` with its line count, links that don't resolve, and modules that exist but are missing from the parent readme's index. The model reads only this summary (law 7).
- [ ] **Haiku minions**, in batches under 60k tokens, check each flagged readme against its directory:
  - stale lines;
  - over about 100 lines;
  - missing a new module;
  - explaining instead of pointing.
- [ ] **Fix the obvious ones** (one line per module, a link, and trims). The root and `framework/ai` readmes must index every major system, including today's new ones. Don't edit CLAUDE.md: list what it needs in `STATE.md`.
- [ ] Update `public/framework/ai/handover.md` with today's state (what landed, what is open; the open items are the `Property.of` merge, `page.children` → `page.pages`, duplicate-bubble details and the Figma `dark` token).
- [ ] Record before and after counts in `STATE.md`. Commit in small steps, merge (and confirm the merge is on `michael/dev`), then land.

Sonnet 5.5 orchestrating, Haiku doing the reading. Worktree; one-sentence replies; land with `finish-task` only after the merge is on `michael/dev`.
