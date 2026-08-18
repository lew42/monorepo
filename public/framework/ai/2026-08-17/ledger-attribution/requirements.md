# Attribute ledger edits to the right task, without guessing

`.claude/hooks/ledger.mjs` writes RULE#15's `action` lines. Its `find_task()`
resolves which `task.jsonl` an edit belongs to by matching `session_id` against
each task's first `assign` line.

**Subagents inherit the parent's `session_id`**, so one long session owns many
tasks — 43 of them today. The resolver therefore cannot tell whose edit it is
looking at, and the consequences have both been observed today:

- **Before:** it returned the *first* match in walk order and cached that path for
  the session's lifetime, so **105 action lines spanning six different tasks were
  filed into one unrelated task from the previous day**, while that day's own task
  logs carried none.
- **After a partial fix** (newest-created + a 60s cache): edits file to a current
  task, but the **Stop gate broke** — the newest task is always whichever worker is
  still running, so the hook asked the main loop to write `landed_at` on a live
  agent's unfinished ledger. Of 43 matching tasks, exactly two would gate a stop,
  and both were the in-flight agents.
- **Current state, a compromise:** newest-created for `posttooluse`, oldest-created
  for `stop`/session events. Stops are safe again, but **subagents lost the
  unfinished-ledger gate**, and concurrent agents still share one attribution.

## Do it properly

**An edit knows its own file path. Use it.**

`posttooluse` already reads `input.tool_input.file_path` (see the `posttooluse`
branch). If that file sits inside a directory that has a `task.jsonl`, **that is
the task**, with no guessing at all — a brief, a requirements file, a report or a
log written inside `ai/<date>/<slug>/` belongs to `<slug>` and nothing else.

Walk up from the edited file's directory to the repo root; the first directory
containing a `task.jsonl` wins. Fall back to the current session-based resolution
only when the path is outside every task dir — which is the common case for site
edits under `public/framework/`, and where the existing heuristic stays.

⚠ **Keep the session_id check on the fallback.** Don't let an edit be attributed to
another session's task.

## Then try to restore the Stop gate

The gate exists so an agent doesn't stop mid-ledger, and losing it was a real cost
of the compromise. **Investigate whether the hook input carries anything that
distinguishes a subagent from the main loop** — `transcript_path` is the obvious
candidate, and it may differ per agent even when `session_id` doesn't. Dump the
full hook input for one real invocation and look, rather than reasoning about it.

If a discriminator exists, key the resolution on it and the gate can come back
correctly for every agent. **If none exists, say so plainly and leave the current
compromise in place** — do not invent a heuristic that guesses which agent is
stopping. A gate that demands a false landing is worse than no gate, and that is
exactly what today's version did.

## Do not rewrite the misfiled lines

⚠ The 105 already-misfiled `action` lines stay where they are. Rewriting them
would falsify the record — the same principle that protected the historical task
logs during today's module rename. Fix the mechanism, leave the history.

## Verify

This hook runs on **every** `Edit`/`Write` in every session, so a bug here is
expensive and silent.

- `node --check` the file.
- **Exercise `find_task` standalone** against the real repo before trusting it:
  feed it a path inside a task dir, a path under `public/framework/`, and a path
  that matches nothing, and print what each resolves to. A scratchpad harness that
  imports or copies the function is the right shape — do not test by editing files
  and hoping.
- Confirm `stop` still resolves to a **landed** task for this session (it must not
  gate on a live worker), and that the four existing call sites all still behave.
- ⚠ Clear the tmpdir caches (`claude-ledger-*`) after changing resolution logic, or
  you will be testing a stale answer.

## Files you own

- `.claude/hooks/ledger.mjs` — the only code file.
- `public/framework/ai/2026-08-17/ledger-attribution/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Everything else is read-only**, and this matters right now: another agent is
measuring band value-distributions across the whole site, so **do not edit a single
page under `public/framework/`** — a changed page corrupts its numbers.
`.claude/settings.json` is Mike's config: read it to understand the wiring,
don't change it.

## Deliverables, in this order

1. **Path-based attribution** for edits inside a task dir, with the standalone
   verification output in your log.
2. **The discriminator investigation** — the actual dumped hook input, and either a
   restored Stop gate or a plain statement that no discriminator exists.
3. A short note in `ext/JSONL/readme.md`'s ledger section, if it documents the
   hook's behaviour, describing how attribution now works.

Running short? Cut 3, then 2. **Never cut 1.**

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** These are millisecond operations; don't background
  anything.
- LAW#4: no npm dependencies. The hook is plain Node with no imports beyond `fs`,
  `path` and `os` — keep it that way.
- RULE#11: the file is ~120 lines and should stay near that. RULE#9: comments near
  zero, except a trap the code cannot show — the reason mtime cannot be used for
  ordering (this hook's own appends bump it) is exactly such a trap and is already
  written down. Keep it.
