verdict: fix
1. [fix] The page that changed was never shot. All 16 page folders under shots/ are old task pages (e.g. shots/…2026-10-02-panel2-sessions/sheet.png). The diff only added a hidden `{"file":"shots/","gone":true}` line to those pages. `/framework/ai/sessions/` has no shot at any width, so none of the red tags, the mastermind tag, the chip headings or the fixed-height in-flight strip has visual proof (requirements: "smoke-test the page at 1400 wide").
2. [fix] Duplicate chips come back under new keys (req 3). The new role `vscode tab` and the old fallback `vscode mastermind` both label as "VS Code tabs". The new `terminal` and the old `cli` both label as "Terminal sessions". Any row with no session-flags.json entry (a missing or stale file, or a transcript outside ~/.claude/projects) falls back to the old key, so two chips with the same label appear (AISessionRows.js ROLE_LABELS + role_of).
3. [fix] `session-flags.json` is committed: a 7,897-row generated file, one huge line in the diff. The readme line says it is "gitignored", but `git check-ignore` finds no rule. It will churn on every watcher run. Add the ignore rule and drop the file from the commit (move it aside, not destroy it).
4. [fix] The diff carries about 190 unrelated data files: ~389 `{"file":"shots/","gone":true}` lines across old `files.jsonl`/`page.jsonl` files, plus two health-watch 404 cards in board.jsonl. This churn is what made review.mjs shoot 16 wrong pages. Leave it out of this task's merge.
5. [note] Red flags depend on a hand-started `node Server/session-flags.mjs --watch` ("keep the watcher running"). If it is not running, the file goes stale: stalled stops flagging (the `fresh_ms` gate) and roles freeze. Nothing in Servex starts or supervises it. The page also re-fetches the file every 30 s (setInterval + fetch), which goes against "stream, don't poll".
6. [note] Expensive uses lifetime cost over $10 across ~7.9k sessions. "needs attention · N" will likely count many long-finished sessions, which hides the live ones. That is the owner's literal threshold, but consider counting only open or recent sessions.
7. [note] Mis-indented lines and a whitespace-only line in AISessionsPage.js (render_flight sort, the check() block around `needs attention`).
8. [note] Widths given: 400, 1200, 1920, 3440, but only for the unrelated pages. The sessions page was not shot, so every layout answer below is `not measured` for the changed page.

## Requirements
- 1 "Negative durations… find why, fix it" — yes — the cause is named (a resumed agent keeps the old stopped_at). `after()` drops an end time that comes before the start, and `span_ms` never returns a negative number. Fixed in code; no shot.
- 2 "(unknown) role holds $12,726… classify by what is computable" — yes, in code — `classify()` sorts by Servex agent, entrypoint (vscode/cli/sdk) and first-prompt patterns. The new unknown share is not reported anywhere (no count in task.jsonl or the readme).
- 3 "Duplicate chips… one chip per role" — partly — the trigger chips now have a "started by" heading and `(n/a)` reads `(none)`. The new role keys can still produce two chips with one label (finding 2).
- 4 "Expensive: over $10, or over $5 in its last hour" — yes — LIMITS usd 10 / hour_usd 5; hour_usd is priced by the script.
- 5 "Stalled: working, no new transcript line for 5+ minutes" — yes — quiet_ms 5 min against the transcript's last line, only while the file is fresh.
- 6 "Context bloat: last turn over 300k" — yes — ctx = input + cache read + cache write of the last turn.
- 7 "Opus minion: a spawned non-mastermind on Opus" — yes — servex source or sdk-ts, not a mastermind, model matches /opus/.
- 8 "Small red tag on the row and in the In-flight strip, with a count in the filter label" — yes in code (flag_tags inside the title line, `needs attention · N` plus per-flag counts) — not shown in any shot.
- 9 "A mastermind tag… registered as one in Servex, or first prompt loads the skill" — yes in code — `is_mastermind` = registry role or the script's `mm`. Not verified that tab 7efd07d5 gets it.
- 10 "Do not read the index or transcripts with the model; write node" — yes — Server/session-flags.mjs.
- 11 "Update the sessions readme in a line or two" — yes — two lines, one of them wrong about gitignore (finding 3).
## Page structure
- page 1–n — not measured — no shot of /framework/ai/sessions/ (finding 1)
## Navigation
- page 13 — tabs, a filter row (unchanged by this diff)
- remaining — n/a
## Layout
- all — not measured — no shot of the changed page
## Sizing
- in-flight cells `block-size: 3em; overflow: hidden` — not measured — this could clip a two-line cell; it needs a shot to confirm
## Wrapping
- red tags `white-space: nowrap`, title ellipsis — not measured
## Spacing and padding
- all — not measured
## Colour and contrast
- red tag — yes — white on #b3261e is about 6.5:1. The hard-coded hex values (#b3261e, #7b3fa0) skip the colour tokens (note).
## Flow
- all — not measured
## Words
- content 1 — yes — tag labels are short (`$$$`, stalled, context, Opus minion), and each has a full-sentence title
- content 2 — no — the readme says "gitignored", which is false (finding 3)
- content 3 — yes — redesign-asks doc records the owner's words and is linked from the readme
