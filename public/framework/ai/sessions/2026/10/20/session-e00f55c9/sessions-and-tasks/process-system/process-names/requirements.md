# Process names: adopt the three proposals (step, template subclasses, handoff)

Brief from mastermind-system-architect-3 for a Sonnet minion. Budget about $9. The ask came from mastermind-deputy (`../../deputy/requirements.md`, item 3). The owner said not to wait on the names: session-e00f55c9 `prompts.jsonl`, prompt at 2026-10-23T23:51:53Z ("I just want you to go ahead and build stuff").

## What to build, in this order (commit after each)

1. **Mark the proposals decided.** In `public/framework/core/Task/doc/process-names.md`, mark each **proposed** row as **decided 2026-10-23**, citing that prompt. Change the title and intro so the page reads as the record of a decision, not a request for approval. Mark the "role / kind / process template" table decided too.
2. **Write the rename script `Server/rename-phase-to-step.mjs`.** It takes `--dry-run` (print and change nothing) and writes a manifest of every old→new change, one line per file and identifier, to the task folder's `rename-manifest.md`.
   - Scope it to the process system only. "phase" is a common English word, so never rename it blindly. The files are `public/framework/core/Task/Process.js`, `Servex/ProcessRunner.js`, `Servex/ProcessRunner.test.mjs`, `public/framework/core/Task/doc/process.md`, `process-names.md` and the Task `readme.md`, plus any process-specific `phase` in `Servex/agents/*.js` and `Servex/Servex.js`. Read each hit first; leave the unrelated ones (review "phase", SDK code, node_modules).
   - Renames: `phases`→`steps` (getter), `phase` getter→`step`, the `phases:` override option in `Process.lines` → `steps_over` or similar, without colliding with the existing `steps` argument. Pick a clear name and say which. Also the prompt text ("phase"→"step") and the line field `{"spawn":{"phase":…}}` / `queue` → `{"step":…}`.
   - **Never rewrite old logs.** Readers accept the old `phase` field as an alias: in `Process` line parsing, `body.step ?? body.phase`. New writes use `step`. Add a test that an old-shape `{"spawn":{"phase":"plan"}}` line still lands on the step.
3. **Template subclasses.** Replace `Process.DEFINITIONS` with one subclass per template: `class BuildProcess extends Process { static steps = [...] }`, one file each in `public/framework/core/Task/processes/` (`BuildProcess.js`, `DesignProcess.js`, `InvestigateProcess.js`, or whatever templates exist today). Lookup by name, for example `Process.template("build")`, comes from a small registry so the item tool's refusal still lists every template name. Keep each caller working; grep for `DEFINITIONS`.
4. **Handoff by moving the task:** mark the row decided only. Do not build it; the item move is its own task.
5. **Docs, kept short.** `doc/process.md` and the Task `readme.md` say "step" and list the templates with one line each. No dated log in the readme. Add one line to `Servex/agents/roles/mastermind.md`: "To start work, name a process template, or give your own steps."

## Done means

- `node Servex/ProcessRunner.test.mjs` and every `public/framework/core/Task/*.test.mjs` pass.
- `node Server/review.mjs <this task dir> <your worktree>` is run **from your worktree**, every finding is answered (`{"review":{"answer":{"n":N,"reply":"fixed|declined|noted: …"}}}` appended to this folder's `session.jsonl`, then `node Server/review.mjs --turns <dir>`), and `--status` is clean.
- The last line you append to this folder's `session.jsonl` is `{"log":{"at":"NOW","msg":"ready: <branch> <sha> — <one line>"}}`.
- Append JSONL only through `node .claude/hooks/append.mjs <file> <lines.json>`.
- Never merge, never restart Servex, never touch the main checkout. Message mastermind-system-architect-3 when you are done.
