verdict: fix
1. [fix] `Server/doc/scripts.md` contradicts itself (req 3, content 1). The summary line changed "**misnamed 26**" to "**live 26** (a function bag or lowercase class…)", so the file now has two "live" counts. The heading says "**0 live remain**" where it means 0 misnamed. The table still marks `Collab.mjs` and `Decide.mjs` as `misnamed`, and all four rows keep the note "Function bag … that should be a class". The fix: misnamed 0, the four rows `live` with a "class since batch 5" note, and the heading "0 misnamed remain, 2 planned".
2. [fix] Requirement 2 asks for "a `decision` line [that] says it waits on the owner", and there isn't one. `grep -c decision task.jsonl` gives 0, and no `.jsonl` under the run directory mentions class-plan. Write the line with `node Server/Decide.mjs` (`--owner-only`).
3. [note] The fence said "Servex files untouched beyond the doc", but the diff edits path lines in `Servex/Servex.js` (an import), `Lifecycle.js`, `agents/Echo.js` (a dynamic import), `Sessions.js`, `tidy.js` and `ext/`. Windows makes this unavoidable: `browser.mjs` and `Browser.mjs` are the same file there, so no lowercase shim can exist, and `scripts.md` says so. The changes are only path text, and the new `Servex.js` import needs the Servex restart from req 3.
4. [note] Only `ask-each.mjs` became a one-line shim. `browser.mjs`, `collab.mjs` and `decide.mjs` were deleted, with the reason given in `scripts.md` (the Windows note). On Linux and on GitHub, any import of the lowercase names outside the repo now breaks.
5. [note] The diff can't prove the requirement-1 checks: `node --check`, tests green, hooks dry-run, undo on a worktree copy. `task.jsonl` should hold a line for each before merge.

Widths given: 400, 1200, 1920 and 3440 for all three pages. The three pages changed only path text inside prose and comments (`Server/Collab.mjs`, `Server/Decide.mjs`), so their layout is untouched by this diff. The layout answers below describe the pages as they already were.

## Requirements
- 1 "The four Server ones become classes … old lowercase file kept as a one-line shim … callers updated" — partly. `Server/AskEach.mjs`, `Browser.mjs`, `Collab.mjs` and `Decide.mjs` are added as classes with named aliases kept. Only the `ask-each.mjs` shim exists (Windows case clash, notes 3 and 4). About 90 caller files were rewritten. The check results are not in the diff (note 5).
- 2 "`Servex/agents/doc/class-plan.md`, one screen: class, API, callers by count, shim strategy, private-port test, size; linked from the Servex readme" — yes. All six parts are present, there are 49 lines, and `Servex/readme.md` gains one line linking it. The `decision` line is missing (fix 2).
- 3 "`Server/doc/scripts.md` marks the four and links the plan; 0 misnamed remain, 2 planned" — no. The four are checked [x] and the plan is linked, but the summary, heading and table contradict each other (fix 1). The card, the landing line and the Servex restart belong to the mastermind and are not in this diff.

## Page structure
- page 1 — yes — all three sheet.png: the titles (Patterns, Decision, Worked example: Servex) say what each page is; unchanged.
- remaining page questions — n/a — the diff changes no structure.

## Navigation
- navigation 1 — a sidebar and tabs (Decision: Overview/Docs/Files/Inbox)
- tabs — yes — layout.json tab_rows 1 at every width (Decision)
- sidebar — yes — sheet.png: a collapsed rail at 400, a full tree from 1200 up

## Layout
- layout — yes — unchanged by this diff; overflow_x false at all widths on all three pages.

## Sizing
- sizing — note — empty is 0.82 at 3440 (patterns) and 0.83 (decide-servex). This was true before the diff; out of scope.

## Wrapping
- wrapping — yes — wraps are headings at 2 lines and the theme mode-btn at 1.7 lines, both pre-existing; no new text wraps.

## Spacing and padding
- spacing — yes — left_stack 28px page padding at 400 (patterns); unchanged.

## Colour and contrast
- colour — n/a

## Flow
- flow — yes — unchanged; the read order on the sheets is title, intro, sections.

## Words
- content 1 (one clear takeaway) — no — `scripts.md` summary and table (fix 1).
- content (names used consistently) — yes — the new paths `Server/Browser.mjs`, `Collab.mjs` and `Decide.mjs` are used the same way in the skills, hooks and pages.
- content (plain sentences) — yes — `class-plan.md` reads as one screen of plain sentences with a table.
