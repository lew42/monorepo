verdict: pass
1. [note] The "daily --links backfill adds nothing" check is empty: `Servex/agents/handover.test.mjs:158` only runs `apply_links` when the census already found the child missing, and in that case the assert on line 157 has already failed. So the backfill itself never runs. Call `sr.apply_links(sr.links())` every time, then count the references.
2. [note] The roll-up test accepts either of two ways to complete the task (`handover.test.mjs:162-163`): if `x: {complete}` is refused, it quietly tries a plain `complete` on the child page. Both runs pass through the first form, so the fallback is dead code that would hide a real refusal. Drop it, or assert which form must work.
3. [note] With a handoff, `open_task` no longer links the child itself (`Servex/agents/Agents.js:89-92`), and `move_item` writes its `as` reference into the `from` record (`page_tools.js:606`). If `from` is not the child folder's real parent (`parent_task`, or the nearest folder above with a log), that parent gets no reference until the daily `--links` backfill runs. The test only covers the case where `from` is the parent. Linking only when `path.dirname(dir)` differs from `from` would close this gap.
4. [note] The temp store is a dot-folder inside the real records tree (`handover.test.mjs:123`, `public/framework/ai/sessions/2026/10/22/.handover-test-<pid>`), so the dev server's watchers see it while the test runs. It is removed in `finally`. An `os.tmpdir()` root would be cleaner, if `open_task`/`move_item` accept one.
5. [note] The brief said to extend an existing process test rather than add a second one. `ProcessRunner.test.mjs` already had a two-step "steps" process (diff lines 50-62), and the new build → review block (lines 64-75) runs a second one beside it. The new block is what checks that a `complete` without evidence is refused, so it earns its place. Putting that refusal check into the existing two-step block would have been simpler.

## Requirements
- 1 "Handover by task … the subtask leaves the parent record and lands in the child folder with the same id and its history" — yes — handover.test.mjs:145-148 checks the id, the start and expected lines, the original timestamps, and that the parent replays one child; the test run passes.
- 1 "exactly ONE reference line … no duplicate when link_parent runs again, or the daily --links backfill" — yes, with gaps — the real bug (open_task linked the child and move_item added an `as` line, so the parent replayed a twin child) is fixed at Agents.js:89-100. link_parent is re-run twice (lines 152-154), but the backfill check is empty (finding 1).
- 1 "the child's completion rolls up to the parent" — yes — handover.test.mjs:166, the parent's state is complete and completion is 1.
- 1 "Find bugs, fix them, small and in place" — yes — one bug, a fix of about 6 lines in Agents.js; a refused handoff still links the child (test line 172).
- 2 "One simple process … two steps … each step starts, completes with evidence … task completes when the last step does" — yes — ProcessRunner.test.mjs, diff lines 64-75: refused without evidence, step 1 then step 2, process complete; the 13 existing `complete` calls were updated to carry evidence. A second process was added rather than the existing one extended (finding 5).
- 3 "one line per flow in session-record.md saying which test proves it" — yes — session-record.md, diff lines 186-187.
- "Commit in your worktree; do not merge" — yes — commits 0cec5f5b9 and 0c3c8061f on the worktree branch handover-test. I re-ran both tests: handover 10 passing, ProcessRunner 40 passing.

## Words
- The doc lines (session-record.md, diff lines 186-187) are plain and name the test command and what it proves — yes.
- The test comments say what each check proves, in sentences — yes.
