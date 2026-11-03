verdict: pass
1. [note] There is no `requirements.md` in `prompt-human-only/`, so I reviewed against the ask written in the diff's own comment (`Servex/agents/PromptTasks.js:22`): 13 tasks were filed from a tab's CronCreate check-ins, and only turns a person typed should become tasks. The change does that. Write the brief next time so a reviewer can tick the owner's own sentence.
2. [note] The field is real and the values fit: across this project's transcripts, user turns carry `turnOrigin` "human" (1752), "scheduled" (260), "task_notification" (1234), "sdk", "peer" and "system". Only "human" passes `human()` (`PromptTasks.js:68`), so check-ins, task notifications and messages from other sessions are all dropped. That is right.
3. [note] There is no deadlock risk: `page_tools.js:934` calls `hooks.prompted` without waiting for it, so the hook never waits on `human()`'s retry while Claude Code still has to write the transcript line.
4. [note] If no transcript line is found, the prompt is still filed (`PromptTasks.js:46`, `null` is not `false`). So a turn whose text doesn't match exactly is filed as before. That happens when a typed prompt carries an `<ide_selection>` text block, which is true of 33 of the "human" lines in VS Code tabs. The failure is in the safe direction, but those turns are never checked. Matching on the last text block, or on `promptId`, would cover them.
5. [note] The comment at `PromptTasks.js:55` says the retry "looks again for up to ~3 s", but 4 tries × 750 ms waits only 3 × 750 = 2.25 s. Fix the comment, or set `tries = 5`.
6. [note] The test (`prompt-tasks.test.mjs:77-86`) covers "scheduled" and "human" but not the fail-open path (no transcript file, or no matching line). One more `ok()` with `pt.transcript = () => null` would pin it.
7. [note] Simpler option: `human()` searches every folder under `~/.claude/projects` for `<uuid>.jsonl` (`PromptTasks.js:57`). The tab's folder is known (the monorepo's slug), so it could be tried first. This is cheap either way, so it is only a note.

## Requirements
- 1 "only turns a person typed become tasks, not CronCreate check-ins" (inferred from `PromptTasks.js:22`; there is no requirements.md) — yes — `human()` returns false for `turnOrigin` "scheduled", and test 3c asserts that it is not refined.
- 2 the doc matches the code — yes — `core/Session/doc/prompt-tasks.md` step 2 names `turnOrigin`, "human" only, and the no-line fallback.

## Words
- content 1 (plain sentences, says what it does) — yes — doc step 2 and the header comment explain the rule and why in one sentence each.
- content (accuracy) — no, small — "~3 s" in the comment at `PromptTasks.js:55` is really 2.25 s (finding 5).
