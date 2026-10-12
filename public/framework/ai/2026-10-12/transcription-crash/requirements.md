# Why the site crashes during transcription and reload

**The owner (2026-10-12, first message of the day):** transcription worked, but the Whisper error appeared, the page would not reload, and "the site crashes a lot". [servex-health](../servex-health/STATE.md) left "transcription crash cause" open. The 2026-10-09 perf note ([Server/doc/perf-2026-10-09.md](/Server/doc/perf-2026-10-09.md)) found 41 dev servers, directory rebuilds on 36% of requests, a 36 MB `monorepo.out`, and Whisper reloading.

## Done when
- [ ] Reproduce on current `michael/dev`: a script that dictates (recorded clip) and reloads the page in a loop for 10 minutes while watching the dev server and Whisper (CPU, RAM, open handles, restarts, response times); record when and how it fails.
- [ ] Name the cause with evidence (a profile, a log line, a count), fix it, and run the same loop to 0 failures. If the perf note's items are the cause, fix those.
- [ ] `Server/doc/` note with before/after numbers, linked from the Server readme; the asks entry updated.

Sonnet 5.5, high. Worktree for Server/ code; a server restart through Servex (`restart_server`), proven on a private port first. Never the owner's live tabs. Commit each step; merge. Land with `finish-task`.
