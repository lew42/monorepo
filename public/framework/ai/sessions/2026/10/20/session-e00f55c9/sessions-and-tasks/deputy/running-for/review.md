verdict: fix
1. [fix] The proof for the Sessions list row is missing. `list-shot.png` (worktree qf-4) shows the list filtered to `mastermind-servex-10` with no e00f55c9 row, so ask 4 (the VS Code tab's name) and the list half of ask 1 are not shown working. Clear the search box, or filter to `e00f55c9` in `shoot.mjs`, and take the shot again.
2. [note] The stats bar first draws the old `root.ms()` value ("2 days") and swaps it once the whole session index loads (`SessionStats.js:53`). If the index has no row for the session, the wrong number stays. It is also simpler to draw the "Running for" stat once, outside the loop, than to catch it with `label === "Running for"`.
3. [note] The span is the index's `wall_ms` (first line to last line, as of the last index build), so a running session's span only grows when `Server/session-summary.mjs` rebuilds `session-index.json`. Ask 2 says "to now while it runs". The main tree's index is from 2026-10-23 and has no `active_ms` column, so until it is rebuilt the list and page still read "2 days" (`wall_ms` 194563540 ≈ 54h).
4. [note] Ask 3 says to use one source. The page and the list both read the session index (good), but `AISessionIndex.mjs:280` also adds `active_ms` to the snapshot, and nothing reads it. That is a second copy to keep in sync. Drop it, or say why it is there.
5. [note] The VS Code fallback (`AISessionRows.js:186`) only changes the last branch. A tab with no title still shows its last prompt before "VS Code tab e00f55c9", and it used to read "VS Code e00f55c9", not a bare id. `r.kind === "vscode-tab"` is not a field these rows carry (the kind comes from `r.source === "vscode"`, line 129), so that half of the test never matches.
6. [note] `shoot.mjs` is committed into the task folder with a hard-coded `qf-4.localhost` host and an absolute Playwright path. It is scratch, so it belongs in the scratchpad, or should take the host as an argument.

## Requirements
- 1 "show the span from its first line plus its active time … on both surfaces" — partly — `page-shot.png` reads "Running for: 4 days · 11h active". The list cell changed (`AISessionView.js:89`), but `list-shot.png` does not show this session's row.
- 2 "span from the record's first line … a stop and restart does not reset it" — yes, until the last index build — `wall_ms` = last_at − first_at (`AISession.js:304`). The qf-4 index has 378453468 ms ≈ 105h, so "4 days". It does not run "to now" between rebuilds.
- 3 "active time from one source, say which" — yes — the session index's new `active_ms` column (`session-summary.mjs:81`, from `AISession` summing gaps up to ACTIVE_GAP_MS). The unused snapshot copy is note 4.
- 4 "VS Code tab row shows its title, else 'VS Code tab' + short id" — not proven — the code path exists (`AISessionRows.js:186`), but no shot shows the row.
- Proof "headless shots at 1920, both read about '4 days · 9h active'" — half — the page shot reads "4 days · 11h active" (more active time has passed, which is fine). The list shot is of the wrong row.
- Class page — n/a, no class added.

## Words
- content 1 — yes — "4 days · 11h active" is plain. The tooltip explains where both numbers come from in one sentence.
- The label "Running for" now sits above a span plus an active time — a small mismatch; "Span" or "Running for · active" would read straighter (note only).
