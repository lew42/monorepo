verdict: fix
1. [fix] Requirement 1 is not answered for most of the 295 lines. `lines-check.mjs` reads git at `fa90c3a41^`, which holds 72 lines in 19 files. The audit's 295 come mostly from gitignored card logs: 240 from `ai/2026/10/13/session-730e8a7b/page.jsonl` and 33 from `session-f155ecbd` (audit.md:78, move-plan.md table). Git never held these files, and the worktree has none of them. In the main tree, `sessions/2026/10/13/cards/session-730e8a7b/page.jsonl` has 284 lines (44 + 240), so the lines are probably there. But nothing proves it. result.md says "Missing: 0" for "295 audit lines". Rerun `ai2-retire/audit-ai2.mjs` in the main tree, as the brief asked, and record its output.
2. [fix] The archive readme contradicts itself and the code. `ai/archive/ai2/readme.md`, bullet 3, says `/framework/ai2/YYYY/MM/DD/…` goes to `/framework/ai/sessions/YYYY/MM/DD/…`. The paragraph under it, and `public/index.html`, send a dated card to `/framework/ai/YYYY/MM/DD/<card>/`. Delete the bullet; the paragraph is correct.
3. [fix] "Done means" asks for each check with its output. result.md gives conclusions but no output for `ls public/framework/ai2` failing, for the import search, or for the headless `/framework/ai2/` check. It is also not merged: "the folder is gone on compliance/dev" is still false, and the brief says not to report done before the merge. It also doesn't list what was closed (the brief asks for zero footprint).
4. [fix] The brief says "Commit the script beside `public/framework/ai/readme.md`" for the folder map, but no map script sits there. Only `skills.mjs` is in `public/framework/ai/`. The readme links the sibling task's `findings.md` instead. Either move or copy the script next to the readme, or say in result.md why the findings link is enough.
5. [note] `ai/local/page.js:13` `REPORT_URL` changed from one dead address to another. `/framework/ai/2026-10-01/local-ai/` has a hyphenated date, so no route matches it. The report is at `ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/`.
6. [note] Stale comments still name `ai2/` files as if they exist: `Servex/agents/Assistant.js:54,343`; `ai/dashboard/page.js:22,24,124`; `core/Page/ext/Inbox/servex.js:3`; `ext/Refine/prompt-card.js:28,32`; `ext/drawer/tabs.js:29`. `Server/Ai2Overview.mjs` still names the concept "AI 2". The history page `sessions/2026/09/24/1c09793f…/servex-mastermind/page.js:14` still lists `../../../ai2/doc/card-standard.md`, so its file list shows a missing file.
7. [note] The shots come from before the second review's text fixes. `ux/Card` at 400 still shows "opened at /framework/ai/ or /framework/ai/", and the current diff replaces that line. So the shots prove the layout didn't change, but they don't show the final text.

Widths given: 400, 1200, 1920, 3440 for all ten pages. The page edits are only link targets and wording, so layout, sizing, wrapping, spacing and colour don't change. The answers below check the shots for anything this diff broke.

## Requirements
- 1 "are the 295 log lines the audit named now in the sessions store? Rerun audit-ai2.mjs" — no. lines-check.mjs checks 72 committed lines, not the 295. The 240- and 33-line card logs are gitignored, so it never saw them (finding 1).
- 2 "Stop new links to ai2" — yes. `Layers.js:523`, `smoke.mjs:117`, `review.mjs:134`, `merge.mjs` and every listed caller now build `/framework/ai/…`. `smoke.mjs` uncommitted_in_main still maps a dated card through `CardDir.rel`.
- 3 "Fix the live import" — yes. `dev/DevBar/chat.js:4` imports from `../../ai/rail/live.js`. A grep for `ai2/` in import lines returns only comments.
- 4 "Keep old links working… on the static production site… state what you chose" — yes. An inline `history.replaceState` script in `public/index.html` runs before app.js, so it also works on a static host. `core/Page/Jsonl.js` maps the 531 card class paths. The choice is written in the archive readme, which contradicts itself (finding 2).
- 5 "Move the folder: a node script with a dry run and a manifest" — yes. `move-ai2.mjs` (dry run, `--apply`) and `manifest.json` are in the task folder. `page.js` became `page.js.archived` and is in `ai/archive/ai2/` with `ai2.css`. `ls public/framework/ai2` fails in worktree qf-6.
- Done means — no. There is no literal output, it is not merged yet, and nothing closed is listed (finding 3).
- Also: folder map script beside ai/readme.md — no (finding 4). Is the list of dead folders linked? yes, via findings.md §4.
- Also: neither readme mentions ai2 as existing — yes. `framework/readme.md` and `ai/readme.md` have been updated, and the `ai/rail` and `ai/cards` readmes say the folder was removed.
- Stale or unindexed — `ai/archive/ai2/` is indexed from `ai/readme.md`. `ai/archive/` has no readme of its own, which predates this diff. Stale comments are in finding 6.
- Could a fresh agent continue from the task folder alone? Partly. result.md and the scripts are there, but the 295-line question would mislead them (finding 1).
- Does the diff add a class whose live instances can be opened? n/a

## Page structure
- page 1 (title says what it is) — yes — shots/*/1920.png, top band: "Local Models", "Card", "Dashboard" titles unchanged
- the rest — yes. Only `href`s and wording changed. The shots show the same structure as before.

## Navigation
- navigation 1 — the techniques used: tabs (the AI page), a left sidebar, the right chat rail
- tabs fit one row — yes on the ai pages, measured as tab_rows 1 at every width. `ux/Dictate/v1` has tab_rows 5 at 1200 and above. That predates this diff, which only changed a tile href.
- links land somewhere — no for one, see finding 5. The card links now go to `/framework/ai/<card>/`.

## Layout
- unchanged by this diff — yes — layout.json overflow_x false on all 40 shots

## Sizing
- n/a: no size changed. Empty share is high at 3440 (0.735 on ai/dashboard), but that predates this diff.

## Wrapping
- no new wraps — yes. The `wraps` entries match those pages' text, and `ux/Card` at 400 wraps the same paragraph as before.

## Spacing and padding
- n/a: this diff changes no spacing

## Colour and contrast
- n/a: this diff changes no colour

## Flow
- n/a: this diff changes no flow. The old links still flow through to a page through the redirect.

## Words
- content (says exactly what happened) — no — the archive readme contradicts itself (finding 2), and result.md's "295 audit lines… Missing: 0" claims more than lines-check.mjs checked (finding 1)
- plain, no run labels — yes. result.md has five short bullets, and each one links its script.
