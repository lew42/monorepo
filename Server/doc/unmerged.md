# unmerged.mjs: which `worktree/*` branches were built and never merged

`node Server/unmerged.mjs [--json] [--hours N] [--base michael/dev] [--write]`, test `node Server/unmerged.test.mjs`. Read-only; it never deletes or merges.

One row per `worktree/*` branch with commits not on the base: `commits`, `newest`/`age_hours`, `files` touched, `on_base` (every patch is already on the base under other commits, by `git cherry`), `task` (the folder of the task log that names the branch; a `task.jsonl` wins over a `session.jsonl`, found with `git grep` in `public/framework/ai/sessions`) and `state` (`complete` if that log has a `finish`, `complete` or `landed_at` line, else `open`; `unowned` when no log names the branch). `--write` saves the rows to `public/framework/ai/unmerged.json` for the In-flight block ([in-flight.md](/framework/core/Session/doc/in-flight.md)). The first triage: [triage.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/unmerged-work/triage.md).

Limits: the owner match is by name in a log, so a log that merely mentions a branch counts; `git cherry` takes ~30 s over 136 old branches (run 8 at a time).
