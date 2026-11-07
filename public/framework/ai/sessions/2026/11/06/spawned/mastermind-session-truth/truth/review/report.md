verdict: fix
1. [fix] The Baseline column draws the first truth.jsonl line, which the readme itself calls wrong ("the first baseline line wrongly counted only records with a log"), so today is compared against bad numbers (Requirements 4). Cause: `page.js` `first = runs[0]`. Pick the newest line labelled baseline (or a `baseline: true` flag), or move the bad line aside.
2. [fix] Three Baseline cells print `undefined` ("with a task log", "tag-only record", "transcript only"): the first line used `with_record`, not these fields — shots/…/1200.png middle band, 400.png bottom band.
3. [fix] The table is clipped at its right edge at every width, silently (layout.json `overflow_x false`): at 1200 "Counted by" is cut mid-word ("SessionFolders.homes", "log_file"); at 400 "Baseline, all" shows "undefine…" and "Counted by" is off screen (sizing, wrapping). Move the "Counted by" notes out of the table (a footnote or a title) so four number columns fit at 400.
4. [fix] The daily line is never committed: `TaskLoop.truth_daily()` appends to `public/live/truth/truth.jsonl` in the main tree, but `Servex/LogSweeper.js` `ALLOW` has no pattern for it (handover.md, written the same way, has one). The trend lives only on this disk; the repo is the source of truth (Law 5).
5. [fix] Deliverable 5 is undocumented: the page and readme say "the 1,410 twins were folded before the first run", but no fold commit or manifest is in git (`git log --all --since=2026-11-01` shows none), and `one-folder.md` still says "Today (2026-11-01): 1,408 sessions are held twice … can be folded". Link the run and its manifest, or correct the claim, and update that stale line. `--check` on the main tree does say "ok: every session has one folder" today.
6. [fix] `Server/Truth.mjs` and `Server/Truth.test.mjs` are not in `Server/readme.md`, which lists every Server script (it has `SessionConsolidate.mjs`). Unindexed (Law 10).
7. [fix] The truth page is linked from no AI doc: not `public/framework/ai/readme.md`, `sessions/readme.md` or `handover.md` — only `/live/`'s auto-built list and two doc lines (one-folder.md, task-loop.md). It is the page about the session record; the AI readme should name it.
8. [fix] `measure()` calls `store.adopt_nested()`, which `claim()`s and saves the SessionFolders map, so a "read-only" `--root <other tree>` run and the daily job write state. Make it read-only, or say so in the header.
9. [fix] A fresh agent cannot continue from this task folder: it holds the brief, past-work and the review, but no task log or note of what landed (baseline commit, the corrected line, the twin status) or what is left; the work sits on branch `worktree/truth-truth-page`, named nowhere in the folder.
10. [note] The page throws on every width: layout.json `errors` lists a 404 and "TypeError: Cannot read properties of undefined (reading 'title')" at 400, 1200, 1920 and 3440.
11. [note] The intro repeats itself ("Baseline (baseline, before the truth-job fixes merge…) was measured before the fixes of the truth job merged") and numbers have no thousands separators (11862, 12991, beside the brief's 1,410) — content.
12. [note] The headline "0" sits on its own baseline and its sentence wraps so "must be 0" / "0" lands alone on a line — 1200.png and 400.png, band 2.
13. [note] Only one sum is checked by the script (with_tasks + no_tasks = sessions); the readme claims with_log + tag_only + transcript_only = sessions too, but nothing refuses a line where it fails. `needs_review` always equals `no_tasks`.
14. [note] Colours are hard-coded (`#4a8`, `#8884` in truth.css), not tokens; the trend bar height (`share × 100 × 8` px) overflows its 9em box above about 18%.
15. [note] `TruthLog` is a new class with no page showing its live instance; it only holds the file's lines, which the page already draws.

Widths given: 400, 1200, 1920, 3440.

## Requirements
- 1 "A node script (no AI)… appends one line per run to public/live/truth/truth.jsonl" — yes — Server/Truth.mjs `--write`
- 2 "/live/truth/ draws the trend from that file (a page.js that streams the jsonl)" — yes — `TruthLog.live(draw)`; trend bars below the table
- 3 "sessions; % with any task; % complete (score 1); % needs review" — yes, flawed — table rows; Baseline cells `undefined` (finding 2)
- 4 "done tasks with no outcome or evidence (Task.proof_problem)" — yes — "371 of 857" from `tally.unproven`
- 5 "twin folders (SessionConsolidate --check)" — yes — the big "0", from `SessionConsolidate.check`
- 6 "sessions with no commit line" — yes — "11711 of 11862"
- 7 "owner asks not filed as a task" — yes — "200 prompts in 200 sessions with no task"
- 8 "Tonight's run is the baseline… and the page says so" — no — the page says so but draws the wrong line (finding 1)
- 9 "Use the real classes… never a parallel count" — yes — SessionFolders.homes, Task.replay/tally/completion_score; commit and prompt counts are its own scans (no class owns them)
- 10 "give every number a second number that must agree" — partly — only with+no=sessions is enforced (finding 13)
- 11 "It runs daily… register it there" — yes, but uncommitted — `TaskLoop.truth_daily()`; LogSweeper never commits it (finding 4)
- 12 "link it from /live/ only if that page already lists subpages" — yes — no edit to /live/; it lists pages itself
- 13 "Shots at 400 and 1200 against your worktree URL" — yes — shots/ from 127.0.0.1:64858
- 14 "Your full-population numbers will differ; say how" — yes — readme: every session id, most transcript-only
- 15 "Commit the baseline line… report it" — yes — commit b1f5ad85f/df7051b80; the report to the parent is not in the folder
- 16 "Fold the twins: dry run, commit the manifest, then apply" — no evidence — no manifest committed (finding 5)
- 17 "--check must exit non-zero while ANY twin exists" — yes — SessionConsolidate.test.mjs twin case
- 18 "Find why twins are made… fix the cause" — yes — one-folder.md "The flat-folder writer (found 2026-11-06)", landed earlier (b583dd076)
- Class page for TruthLog — no — note 15

## Page structure
- page 1 (title says what it is) — yes — 1200.png top band: "Truth" with description
- page 2 (one takeaway obvious) — no — the twins "0" is big, but the main point (0.77% of sessions have tasks) is a cell in row 5
- page 3 (most important first) — no — the folder census paragraph sits above the table
- page 4 (detail nested) — no — the per-row "Counted by" notes sit inline and break the table (finding 3)

## Navigation
- navigation 1 — none (a single page under /live/, reached from /live/'s list)
- rest — n/a

## Layout
- layout 1 (layout suits the content) — no — a 5-column table squeezed into a ~570px text measure at 1200+, 72–81% empty (layout.json `empty`)
- layout 2 (nothing overflows or clips) — no — table clipped at right at 400 and 1200 (finding 3)
- layout 3 (wide screens use the width) — no — 1920/3440: the column stays narrow, `empty` 0.733 / 0.811

## Sizing
- sizing 1 (text measure) — yes — widest_text 559–675 px at 1200–3440
- sizing 2 (tables size to their data) — no — the table is capped by the text measure, notes column clipped
- sizing 3 (no silent clip) — no — `overflow_x false` while cells are cut

## Wrapping
- wrapping 1 (no unwanted wraps) — no — layout.json wraps: h2 "Trend: sessions with any task" 2 lines at 400; the twins sentence leaves "0" alone (note 12); table headers wrap to 2 lines at every width
- wrapping 2 (chrome buttons) — n/a (drawer buttons are site chrome, not this diff)

## Spacing and padding
- spacing 1 (consistent left edge) — no — layout.json left_stack: h1 at 16px, text at 30px (400); 48 vs 63 (1200): `.truth` adds its own 1em padding inside the page's
- spacing 2 (rhythm) — yes — 1em grid gap between blocks
- spacing 3 (cell padding) — no — rows are 90–170px tall at 1200 because the notes column wraps to 5 lines

## Colour and contrast
- colour 1 (tokens, not hex) — no — `#4a8`, `#8884` in truth.css (note 14)
- colour 2 (text contrast) — yes — dark text on light grey, 1200.png
- colour 3 (dark scheme) — not measured

## Flow
- flow 1 (reads top to bottom in order of importance) — no — intro, twins, census, then the table that answers the brief
- flow 2 (page height) — no — truth band share 1.97–2.38 screens, mostly from the wrapped notes column

## Words
- words 1 (plain, no repetition) — no — "Baseline (baseline, … ) was measured before the fixes of the truth job merged" (note 11)
- words 2 (numbers readable) — no — 11862, 12991 without separators
- words 3 (no undefined words) — no — "tag-only record", "transcript only", "flat folders" are not explained on the page
- words 4 (no broken output) — no — `undefined` in cells (finding 2)
