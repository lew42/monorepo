# Refine: a placement step per sentence, after cleaning

Budget: $5. Sonnet. Work in a worktree (`take_worktree`); the parent reviews the diff and runs `merge.mjs`. Read `CLAUDE.md`, `public/framework/ext/Refine/readme.md`, `doc/card-types.md` (section "Owner, 2026-10-16 night: one assistant, one pass, by sentence") and `doc/refine-engine.md`.

## The ask (the owner, 2026-10-16, `core/Task/doc/owner-2026-10-16-top-down.md`)

A placement step per sentence after cleaning: append to the previous paragraph or start a new one; when unsure, the previous paragraph. The night rule: each Whisper sentence goes to the assistant once: clean, then structure, then place.

## Do (smallest slice)

1. Find where a cleaned sentence enters the structure today (`RefineSystem.js`, `Prompt.js`, `Outline.js`, `structure.js`, `Cleaner.js`). Say in two lines what "paragraph" means there (the prompt card shows one paragraph; `prompt-card.js:173`).
2. Add the step as a small class `Placement` (own file in `ext/Refine/`, named for the class) with `place(sentence, state)` returning `{ action: "append" | "new", paragraph, confidence }`. Cheap rule first (a pause gap, a topic cue words list kept in the class, no model call) and the "unsure means append" default; a model call only if a rule cannot decide and it costs one Haiku call per sentence at most, behind a switch (`Placement.use_model = false` by default). Record the choice on the sentence (`placed`), so the view and the log can show it.
3. Wire it after the cleaner in the per-sentence path, tolerant of the existing flow (`ext/Refine/test/composer-flow.mjs`, `nothing-to-refine.mjs` still pass).
4. A unit test (`Placement.test.mjs`) with five sentences: continues, new topic, unsure, empty, a question. Headless proof of the Refine page at 400 and 1200 wide (no console errors).
5. A short doc `doc/placement.md` (what it decides, the rules, the open model option), linked from `ext/Refine/readme.md`.

## Fence

`ext/Refine/**` (new `Placement.js`, small edits to the wiring), this task dir. Not `Servex/`, not `core/Task`. Commit by path in the worktree; do not merge. Log in the task's `task.jsonl`; landing line last.
