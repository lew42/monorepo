verdict: fix
1. [fix] `Servex/doc/processes.md` (new "Coverage" section, gap 2) says "`pid-coverage.mjs`'s companion check of every live `claude.exe` against every logged pid found none unlogged", but `Servex/pid-coverage.mjs` has no such check: it only reads log lines. Either add the check or reword it as a one-off manual check made on 2026-11-08.
2. [fix] The same section says claude.exe lines "end and attribute near 100%", but the measured end rate is 81.8% (report.md table; a rerun now gives 82.4%, 28/34). Its snapshot count (1,460 starts) also differs from report.md's 1,478. Quote the real numbers, and say whether the 6 open claude.exe starts are live agents or missed ends.
3. [fix] `pid-coverage.mjs` is not indexed: `Servex/readme.md:51` lists `Lineage.js` and `leaks.mjs` but not the new `pid-coverage.mjs` or its test.
4. [fix] report.md is stale against the branch. It says "commit `08d1c600f`" and "`Servex/pid-coverage-report.md` is the committed output", but the branch head `beec66a38` deletes that file ("drop the snapshot file"). The brief asked for the output file to be committed. Either restore it or correct report.md to name `beec66a38` and say the table lives only in report.md.
5. [note] `Servex/doc/processes.md` still quotes the old heading, "Fallback when Servex is down", which the same diff renames to "Fallback ONLY when Servex itself cannot be reached" (`Servex/agents/roles/mastermind.md:60`).
6. [note] The header comment in `Servex/pid-coverage.mjs:2` says rows are sorted "by its `cmd`/`why` text", but `kind_of()` deliberately ignores `why`, as the comment at its line 25 explains. The header should say `cmd` only.
7. [note] `kind_of()` files any `chrome.exe` under "chrome (playwright)". That is safe here, since only lines we logged are counted, but the label claims more than the code checks. Given the owner's rule about killing Chrome, nobody should reuse this classifier to pick kill targets.
8. [note] The fix rewords the fallback rather than removing it or logging the launch. That is a reasonable small choice, and the alternative is recorded. Other docs still present `claude -p` as a way to start minions, though (`public/framework/ai/handoff2.md:47`, `public/framework/ai/doc/agent-context.md:23`). A mastermind reading those could take the same bypass.
9. [note] The task log (`session.jsonl` here) has a summary log line and commits but no landing or outcome line. A fresh agent can continue from report.md, but the task does not read as closed.

## Requirements
- 1 "Coverage, last 24 h, by process kind … row totals equal the start-line count" — yes. `pid-coverage.mjs` reuses `pair()`/`read_lines()` from leaks.mjs (exported, not copied). A rerun prints 1502 = 1502 "agree", and `pid-coverage.test.mjs` passes.
- 2 "Short-lived misses … say the ratio and how you got it" — yes. report.md §2 gives ~150 sampled shell starts against ~3,280 tool calls (about 1 in 22), counted with grep over the transcripts.
- 3 "CLI-minion bypass … start/end lines, still running, WHERE the launch happens" — yes. report.md §3: no pid lines for 73e88e75, d2507b09 or 00c47a44, and none still running. 1acd3902 is tracked normally. The launch traces to `Servex/agents/roles/mastermind.md:60`.
- 4 "Smallest fix … with a test beside it … update processes.md in the same commit … do NOT merge" — partly. The rewording and the doc update share commit 08d1c600f, unmerged, and the alternative is stated. But the doc text is inaccurate (findings 1 and 2), and the "test beside it" covers the measuring script, not the fix itself (a wording change cannot be tested).
- 5 "Still running with no owner: list them … never kill" — yes. report.md §5 found none (leaks.mjs done 0; the 11 live claude.exe are all accounted for) and nothing was killed.
- Class page — n/a (no class added; plain functions in a script).

## Words
- content: plain sentences — yes. report.md reads as one screen, with a headline per section.
- content: numbers agree across documents — no. processes.md and report.md disagree on the start count and the claude.exe end rate (finding 2).
- content: claims match the code — no. The "companion check" does not exist (finding 1).
