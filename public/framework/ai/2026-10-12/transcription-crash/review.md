verdict: fix
1. [fix] The note the whole change points to, `Server/doc/transcription-crash-2026-10-12.md`, does not exist in the diff or on the `worktree/transcription-crash` branch, yet `Server/TranscribeLoop.mjs:4`, `Servex/Process.js:351` and `Servex/whisper-detach.test.mjs:4` all link it; ask 3 (the before/after numbers, a link from `Server/readme.md`, the `asks.jsonl` entry updated) is not met.
2. [fix] Ask 2 is not shown: there is no recorded 10-minute run, before or after, so nothing proves that a Servex restart killing whisper is what the owner hit ("the page would not reload", "the site crashes a lot"), or that the same loop now ends with 0 failures. Commit the two `Server/logs/transcribe-loop-*.json` summaries (or their numbers) into the note.
3. [fix] The perf note's items (41 dev servers, directory rebuilds on 36% of requests, a 36 MB `monorepo.out`) are neither ruled out nor fixed. The brief says to fix them if they are the cause, so the note must say, with a number, whether they are.
4. [note] The `Server/plugins/HttpsLan.js:16` guard is a real fix, but only for worktree ports above 55535. The owner's server runs on port 80 (https on 10080), so this is not the owner's crash; the note should say so, so nobody reads it as the cause.
5. [note] Whisper now runs detached, so its output goes to `logs/whisper.out`/`.err` and not to `whisper.jsonl`. The comment at `Servex/Process.js:340` ("Its stdout and stderr become log entries in whisper.jsonl … which is the point") is now stale, and the startup banner is no longer in the log that pages show.
6. [note] There is a simpler path: `Process.Whisper.start()` (`Servex/Process.js:351`) copies the adopt step that the base `Process.start()` already does (line 149). Calling `super.start()` after the not-installed check would reuse it, though the base class settles a held port as "port-taken" where whisper says "already-running", so keep whisper's wording.
7. [note] Stale comments in `Server/TranscribeLoop.mjs`. The comment in `up()` about WHISPER_TEST ("so run whisper on 8179 unless free") contradicts the code, which passes WHISPER_PORT. `reload_set()` says the list "is read off the page once", but it is a hard-coded list (and `async` for no reason).
8. [note] The worktree has about ten uncommitted `files.jsonl`/`page.jsonl` changes outside this task's scope (`git status` in `C:/Code/lew42/worktrees/transcription-crash`). Before the merge, decide what happens to them: commit them on their own or set them aside. Don't let them ride along.

## Requirements
- 1 "a script that dictates … and reloads the page in a loop for 10 minutes while watching the dev server and Whisper" — yes — `Server/TranscribeLoop.mjs` (dictate, reload, churn, and a PowerShell CPU/RAM/handles watch, against private ports or `--against`)
- 1b "record when and how it fails" — no — the run results are not committed anywhere
- 2 "Name the cause with evidence" — no — a cause is implied (a Servex restart kills whisper; the model takes about 14 s to reload), but no profile, log line or count is committed
- 2b "fix it" — yes, partly — whisper is detached and adopted (`Servex/Servex.js:448`, `Servex/Process.js:351`), and `Servex/whisper-detach.test.mjs` proves the adopt step
- 2c "run the same loop to 0 failures" — no — there is no after-run
- 2d "If the perf note's items are the cause, fix those" — no — they are not addressed
- 3 "Server/doc/ note with before/after numbers, linked from the Server readme; the asks entry updated" — no — the note is missing, the readme has no link, and asks.jsonl is untouched
- Process: "Worktree … commit each step" — yes — 3 commits on `worktree/transcription-crash`; it is not merged yet, so the task has not landed

## Words
- content 1 (says what it is first) — yes — the TranscribeLoop header says what the script does in its first line
- content 2 (comments stay short and point to a doc) — no — several multi-clause comments (`Process.js:351`, `Servex.js:448`, `HttpsLan.js:15`) point to a doc that does not exist
