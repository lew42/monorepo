verdict: fix
1. [fix] Four role readmes are far over the owner's readme budget ("about 100 lines / 800–1,500 words at most", read whole): `Servex/agents/roles/mastermind.md` is 187 lines / 5,271 words, `minion.md` 3,068, `task-mastermind.md` 2,452, `servex-mastermind.md` 2,134. The move was word-for-word as asked and `roles/readme.md` "Open" names the trim as the next pass, but the result breaks the size rule the owner set for this task (requirement intro, ask 3).
2. [note] `Servex/agents/roles/readme.md` "Open" quotes word counts (mastermind 5,251 …) that differ from `moves.md`'s computed ones (5,271 …), probably because one counts with the move comment and one without. Two hand-copied counts will drift (law 7, compute don't recall): link `moves.md` instead.
3. [note] The role index lists `mastermind` as "architect (Sonnet, high)". The tier is resolved in `tiers.js`, so this is today's value and the readme says so. It will go stale when the tier changes.
4. [note] One old pointer to the CLAUDE.md wording is left in a dated record (`ai/sessions/2026/09/19/system-eval/skills.md`). It is history, so leaving it is fine.
5. [note] The only page this diff touches is `/framework/ai/local/`, and only through a code comment in `page.js`. The shots look the same as before; the layout findings below come from that page as it already was, not from this change.

Widths given: 400, 1200, 1920, 3440 (`shots/monorepo-localhost-framework-ai-local/`). Checked in the worktree `monorepo-wt-readme-roles` (branch `task/readme-roles`, 3 commits on `86901d69d`): `node Servex/agents/roles.test.mjs` → 32 checks passed; `moves-check.mjs` → 213 CLAUDE.md sentences, lost 0.

## Requirements
- 1 "CLAUDE.md slims down … Target under 1,500 words" — yes — 3,763 → 1,319 words. It keeps the laws, safety, cost and "Read first: `public/framework/readme.md`, then your role's readme". The framework rules moved to `public/framework/doc/rules.md`, with a long form in `ai/doc/agent-rules.md`.
- 1 "Nothing is lost: map every sentence old → new in `moves.md`" — yes — `moves.md` is computed by `moves-check.mjs` from the base commit; 213 sentences, 0 lost.
- 2 "The framework readme becomes mandatory reading, stays an index … under its own budget" — yes — CLAUDE.md step 1 says it is "mandatory for every agent". The readme is 83 lines / 1,188 words: the index first, then a Rules section of one line each linking `doc/rules.md`.
- 3 "One readme per role (`Servex/agents/roles/<role>.md` … decide and say why)" — yes — six readmes, and `roles/readme.md` "Why here, beside roles.js" gives the reason.
- 3 "The role is one switch in roles.js; the agent reads its role readme" — yes — a `readme:` field on the row; `opening()` inlines it whole; tested.
- 3 "Move each skill's text there and leave the skill as a one-line pointer" — yes — the six skills went from 756–5,314 words to 85–106 words each; `skill_text()` follows the pointer (tested).
- 3 "Start with mastermind, servex-mastermind, sub-mastermind/task-mastermind, minion, reviewer, clarity; list the rest as ⬜" — yes — `roles/readme.md` "Still skills" lists the rest as ⬜.
- 3 "A short index of roles: what each does, its model, when to use it" — yes — the table in `roles/readme.md`.
- intro "Readmes … must stay short: about 100 lines / 800–1,500 words at most" — no — the role readmes reach 5,271 words (finding 1).
- 4 "The ai readme: index first, records table moved to a doc/ file, priority.md linked at the top" — yes — 1,510 → 660 words; `priority.md` is on line 3; the records are in `ai/doc/records.md`, linked from the index.
- Rule "Moves by script" — yes — `split-claude-md.mjs`, `role-readmes.mjs`, `split-ai-readme.mjs` and `role-readmes.json` are in the task folder.
- Rule "Search for old references and fix them" — yes — `AIOverview.js`, `ai/local/page.js`, `core/Page/doc/architecture.md`, Refine doc, `Server/review.mjs` and `directory.js` were repointed; one dated record is left (finding 4).
- Rule "Every new file linked from its parent readme" — yes — `doc/rules.md` from the framework readme; `records.md` and `agent-rules.md` from the ai readme; the roles folder from the ai readme and `Servex/agents/readme.md`.
- Rule "Don't break roles.js loading: boot-test" — yes — `roles.test.mjs` passes 32 checks and covers `directory.js` SKILLS; no live restart.
- Done "word counts before → after" — yes — the table in `moves.md`.
- Done "Not merged" — yes — `task/readme-roles` is a worktree branch, not merged.

## Page structure
- page 1 (title says what it is) — yes — shots/…/1920.png: "Local Models"
- other page-structure questions — n/a — this change only edits a comment; the page itself is unchanged

## Navigation
- navigation 1 (techniques) — tabs (AI tabs), a sidebar, a right-hand chat rail; a bottom rail at 400
- tabs on one row — yes — layout.json tab_rows 1 at 400 and at 1200
- rest — n/a — unchanged by this diff

## Layout
- layout — yes — sheet.png: the doc column, the left nav and the right chat column at 1920/3440; one column at 400
- empty space at 3440 — note — layout.json empty 0.77 at 3440 (63% at 1920), but this was already so before; not caused by this diff

## Sizing
- measure — yes — widest text 588–709 px from 1200 to 3440 (layout.json widest_text)

## Wrapping
- wraps — yes, minor — at 400, two chips and an h3 wrap to about 2 lines (layout.json wraps). These were already there; not caused by this diff.
- overflow — no overflow — layout.json overflow_x false at every width

## Spacing and padding
- left stack — yes — h1 14px at 400 and 19px at 1200 (doc-well); p 28 / 38 px (layout.json left_stack)

## Colour and contrast
- contrast — yes — sheet.png: dark text on white, an orange Send button; unchanged

## Flow
- flow — yes — the intro paragraph, then "What's installed", then the model card, in reading order (layout.json bands at 400)

## Words
- content (plain sentences, the gist first) — yes — `roles/readme.md` opens with what a role is and how an agent gets its readme; CLAUDE.md opens with what it holds and where the rest went.
- content (one name each time) — yes — the role name, the readme name and the alias all appear in one table row.
- content (no hand-copied numbers) — no — the word counts in `roles/readme.md` duplicate `moves.md` (finding 2).
