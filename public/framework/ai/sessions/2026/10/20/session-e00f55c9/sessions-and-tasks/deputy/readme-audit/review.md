verdict: pass
1. [note] Only 164 of the 403 readmes have Haiku's `shape` and `note`; the other 239 are blank in the Shape column (audit.jsonl latest lines: 157 mixed, 5 index, 2 essay, 239 none, $5.99). This is the $6 cap working as briefed and it is stated in readme-system.md:46, but the full Haiku run (about $14 more) is still open and should be filed as a task, not left in the log line.
2. [note] `ReadmeAudit.readmes()` (Server/ReadmeAudit.mjs:37-48) copies the walk in `ReadmeChains.rows()` (Server/ReadmeChains.mjs:16-33) line for line and shares only `SKIP`. Exporting one `ReadmeChains.dirs()` walk for both would stop the two lists from drifting apart (law 6). Today both find 403.
3. [note] The `unnamed` check is a case-insensitive substring match (Server/ReadmeAudit.mjs:55), so a short name hides inside a longer word: a file `page` or `Task.js` counts as named whenever the readme says "pages" or "SubTask.js". This gives false negatives only, which is fine for pass 1; pass 2 should match whole names before it trusts the field.
4. [note] The committed shot is `readmes-1920.png`, taken before commit d0eaa1494 fixed the clipped Shape column. The corrected `readmes-1920-after.png` sits untracked in the task folder, so the record in git shows the bug. Commit the after shot.
5. [note] In readmes-1920-after.png the Folder column, the one column that names a row, is cut off at about 25 characters ("framework/core/Page/ext/I", "framework/ai/sessions/v/m"), and the row's tooltip is the audit note, not the full path. Folders deep in the tree can't be told apart without clicking them.
6. [note] Dead links still include some false positives from virtual routes (the session log says so). `site_route` (Server/ReadmeAudit.mjs:60-65) covers `/Servex`, `/framework/servex` and `/md/`, so read the 118 readmes with dead links as an upper bound.

## Requirements
- 1 "Server/ReadmeAudit.mjs, class ReadmeAudit" with --computed / --haiku --limit N / --path — yes. It writes audit.jsonl append-only, the latest line per path wins, and an unchanged sha is skipped (run_computed). Every computed field is present. doc-check's `dead_links` is now exported (doc-check.mjs:55) and ReadmeOrphans is reused. The Haiku call is RefineCall, as in PromptAudit.
- 2 "The Readmes page shows the audit" — yes. readmes-1920-after.png shows the Words, Unnamed, Dead and Shape columns. The note is the row's tooltip and appears in the detail panel. The grid sorts by any column.
- 3 "Docs" — yes. ai/readmes/readme.md names audit.jsonl and ReadmeAudit.mjs as writer and reader. readme-system.md:46 says pass 1 is built, how to run it and what it costs, and keeps pass 2 as the next step.
- 4 "A test" — yes. The fixture is in os.tmpdir() and has an unnamed file, a dead link, a dated line and a docs/ folder. `node Server/ReadmeAudit.test.mjs` printed "ok" in the qf-4 worktree.
- Check: two numbers agree — yes: 403 found = 403 paths in audit.jsonl = 403 in chains.json (regenerated from 398).
- Check: calibration 5 of 5, cost logged, stop at $6 — yes. session.jsonl logs $6.04 spent, about $0.05 a readme.
- Check: shot at 1920, findings as log lines, the 10 worst with a stated score — yes, though the committed shot is the pre-fix one (finding 4).
- Can you open a page that shows the class's live instances? — n/a. ReadmeAudit is a CLI script, and its output is shown on the Readmes page.

## Words
- The docs and the page text are plain and full sentences. The detail panel's "Audit: 1002 words, shape mixed, 0 unnamed, 0 dead links, 1 dated lines." should say "1 dated line" (ReadmesView.js:79), a small plural slip.
