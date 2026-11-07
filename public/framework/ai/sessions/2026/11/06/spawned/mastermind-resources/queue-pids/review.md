verdict: pass
1. [note] The exit line differs from what the brief asked for: the brief wanted `{"pid":N,"exit":{code,signal}}` and the code writes `{"pid_exit":N,"code","signal"}` (Servex/SpawnLog.js:217). The change is better, because a search for `"pid":N` now finds only the start line, and Servex/doc/processes.md:382 explains it. But the completion line in session.jsonl never says it differs from the brief, so the parent should be told.
2. [note] `SpawnLog.load()` (Servex/SpawnLog.js:200) copies the commit-charge math from `Global.commit_pct()` (Servex/agents/Global.js:411) instead of calling `servex.global?.commit_pct()`. Two copies of one rule can drift apart (law 6). It also adds a `page_file_mb` field the brief never asked for, and that field is always null.
3. [note] finding.md was changed in a commit made straight on main (ea15a1fd9), outside the brief's file fence, before this branch is merged. Until the merge, its two new rows describe `pid`/`queued` lines that main never writes.
4. [note] If an agent's task dir resolves but holds no session.jsonl or task.jsonl, the line is dropped without a trace (Servex/SpawnLog.js:231). It goes neither to that dir nor to the `spawns` log. Only a dir that fails to resolve falls back to `spawns`, which is what test 5 covers.
5. [note] The sessions readme's search is `git grep` (public/framework/ai/sessions/readme.md:409). That only reads tracked files, so it misses pid lines in a session folder that isn't committed yet. The brief asked for `grep -r`, which has no such gap.
6. [note] In Servex/readme.md:80, the link to doc/processes.md is still labelled "(closing a task leaves nothing running)". A reader scanning that index won't learn the doc now also answers "who started this pid".

## Requirements
- 1 "A queued spawn is loud" (queued line in the parent's session log, with reason and commit_pct) — yes — Servex/Servex.js:1315 `SpawnLog.note(...{queued})`; Gate-loud.test.mjs checks exactly one line, by servex, with ts.
- 1 "started line with waited_s, in drain()" — yes — Servex/Servex.js:1403; the test checks waited_s ≥ 42 after backdating `at`.
- 1 "parent dir resolution (live, registry, task_dir_of), session.jsonl else task.jsonl" — yes — SpawnLog.dir_for uses `live.get(id).task.dir`, which matches Agents.js:1081 (the brief's `.task_dir` was wrong); SpawnLog.file_of uses `SessionRecord.log_file`.
- 1 "spawn result's queued card unchanged; a restored entry writes no second queued line" — yes — restore passes `{restored:true}` (Servex.js:1370); the test asserts this.
- 1 "test with a fake Servex, both lines once each" — yes — `node Servex/Gate-loud.test.mjs` prints "Gate-loud: ok" (run in the worktree).
- 2 "every async spawn gets a pid line, pid as the first key" — yes — Crumbs.js wraps spawn, exec, execFile and fork, plain and promisified; SpawnLog.test.mjs checks the `"pid":N,` text.
- 2 "attribution where tools are dispatched, and around spawn_claude" — yes — tools.js `server()` handler wrapper; Agents.js spawn_claude sends claude.exe lines to the agent's own log and its parent's (test 2).
- 2 "no-agent lines go to the spawns log through the single writer; measure the rate; skip floods by name" — yes — `SpawnLog.sink = this.log`; processes.md:385 gives 12 spawns a minute, about 3 after skipping four named pollers.
- 2 "sync spawns: skip or null, say which" — yes — skipped, and processes.md:386 says so.
- 2 "never throws, never slows the caller" — yes — every path is wrapped in try/catch and writes are chained and deferred.
- 2 "Bash-tool limit and a ⬜ hook line in processes.md" — yes — processes.md:391-393.
- 2 "sessions readme paragraph and a processes.md section" — yes — but see note 5 (git grep, not grep -r).
- Done "both tests pass, Crumbs.test passes, commits on the branch" — yes — all three pass, re-run here; branch worktree/resources-queue-pids, commits 026c992c1 and 08ce24ed7.
- New class: does a page show its live instances? — n/a — SpawnLog is a static logger with no instances; its output is the log lines.
- Can a fresh agent continue from this folder alone? — yes — requirements.md, past-work.md and session.jsonl (decision, log, completion, commits) are all here.

## Words
- content: plain sentences, each one says what it means — yes — processes.md "Who started this pid" opens with what the feature does, then gives the line shape and the limits.
- content: no jargon standing in for an explanation — yes — the sessions readme paragraph gives the exact search and the file path.
