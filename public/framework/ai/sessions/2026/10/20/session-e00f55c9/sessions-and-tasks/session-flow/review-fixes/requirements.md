Budget: $6

# session-flow: answer the review (fixes 1, 2, 3; notes 5, 6, 8, 10)

Work in the existing worktree `C:/Code/lew42/worktrees/session-flow` (branch `task/session-flow`). Do not touch the main tree. First `git merge michael/dev` into it (item-move landed as f3b273394); resolve any conflict, run the tests below.

The review: `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-flow/review.md` (11 findings). Do these:

1. **Backfill with no hand step.** Find where StaleClose runs on the daily tick (grep `StaleClose` in `Servex/` and `Server/`). Next to it, run the same thing `node Server/SessionRecord.mjs --links --apply` does (call the function, don't shell out), so references are added every day. Update the "Backfill and census" bullet in `public/framework/ai/sessions/doc/session-record.md` to say it runs on the tick, and drop its unrelated trailing sentences (review "Words" note).
2. **One written flow.** In `sessions/doc/session-record.md`, add one short section "Session → task → child session": who makes each, where its folder goes, what reference line lands on the parent's log, how completion rolls up, how a task moves to a child session (`spawn_agent task {from, id}`). Plain sentences, under 20 lines. Replace the overlapping text in `ai/doc/records.md`, `Server/doc/stale-close.md`, `core/Task/doc/process-names.md` with a link to it.
3. **`Process.from_steps` (core/Task/Process.js)** refuses step ids that collide with reserved line keys (`file`, `id`, `log`, `title`, `by`, `ts`, `type`, `task`, and every verb); slug them with a suffix instead of failing (`file` → `file-step`). Add a check to the Process test.
5. One shared `parent_log(dir, opts)` in `Server/SessionRecord.mjs`, used by both `link_parent` and `links()`.
6. Replace `catch {}` at `Server/TaskDirs.mjs` (~58) and `Servex/agents/Agents.js` (~944) with a logged warning (console.warn with the dir and the error).
8. `{process: "<unknown>", steps:[...]}` → force `process = "steps"` when no template matched (page_tools.js ~294 / Process.js ~424).
10. `Server/stale-close.test.mjs` writes into the real store; point it at a temp-dir root whose path contains `/public/framework/ai/sessions/`.

Skip 4, 7 (done by 1), 9, 11.

## Done means
- Tests pass: `node Server/stale-close.test.mjs`, the Process and Task tests (find them beside `core/Task/`), `Servex` prompt-tasks / awaken-race tests if present. Paste pass counts in your log.
- Commit on `task/session-flow` (one commit per fix is fine). Do not merge into michael/dev.
- Append one `{"answer":{"n":<finding>,"text":"<what was done, file:line>"}}` line per finding (1–11; for skipped ones say why) to `review.jsonl` in the folder above, via `node .claude/hooks/append.mjs` if it accepts the verb, else a plain append.
- Final reply: the commit hash and one line per finding.
