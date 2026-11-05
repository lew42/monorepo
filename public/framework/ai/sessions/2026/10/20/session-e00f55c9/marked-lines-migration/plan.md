# Plan: marked lines migration

Status: plan only. Nothing is rewritten until the plan is approved. Read with [requirements.md](requirements.md) and [investigation.md](investigation.md).

## What the owner sees

Nothing on the site changes. No layout, page or Figma frame moves, so there is no look to approve. The only visible change is in the files on disk and in the docs. Approve-plan checks the test list and the step order, not a screen.

## Decisions (best call, with the alternative)

1. **Extension stays `.jsonl`.** The spelling lives in each key, not the extension. Alternative `.jsonlog` breaks every glob and watcher that looks for `.jsonl` (investigation, question 7).
2. **Fix the readers before any rewrite.** `Server/Steps.mjs` reads bare `assign` and `log`. It moves onto `LineKey` first. Alternative: keep `assign` and `log` bare on disk. Rejected: the owner wants one spelling.
3. **Batches of about 500 files, committed by path.** Each batch reverts cleanly. Alternative: one big commit. Rejected: too hard to review or undo.

## Class sketch

- `Item/LineKey.js` (exists): `LineKey.bare`, `LineKey.unmark`, `LineKey.deep`. No change to the API in step 1–3. Step 6 removes the bare branches.
- `Server/MarkLines.mjs` (new, home: `Server/` beside `ReplayCompare.mjs`). Node script, no model calls.
  - `--dry` (default): writes `manifest.json` with each file, old line count, new line count.
  - `--apply --batch <n>`: rewrites up to 500 files. Per file: skip if mtime is inside the quiet window (10 min); re-check mtime just before the write; write a temp file, then rename; run `ReplayCompare` before and after; stop the batch on any mismatch.
  - Marks only the top-level verb keys of each parsed line (`log`→`log()`, `assign`→`assign()`; bare hop lines number 0), then `JSON.stringify`. `LineKey.deep` only takes marks off, so marking is a new small `LineKey.mark(line, verbs)` in the same file, not a second helper elsewhere. It never retypes a line by hand.
  - Reuses `Server/ReplayCompare.mjs` as it is (it compares two checkouts); no new compare code. The script runs it once per batch, not once per file.
- `Server/Steps.mjs` (existing): reads through `LineKey` for `assign` and `log`.

## Files to change

| File | Change | Step |
|---|---|---|
| `Server/Steps.mjs` | read `assign`/`log` through `LineKey` | 1 |
| `Servex/agents/Agents.js` (`open_task`, nag text), `.claude/hooks/append.mjs`, `jsonl-schema.mjs`, skills quoting `{"assign":…}` | write the marked spelling; otherwise new bare lines keep arriving and the count never reaches 0 | 1 |
| `Server/MarkLines.mjs` | new migration script | 2 |
| `core/Item/doc/line-format.md` | status table: count 0 after step 5 | 6 |
| `core/Session/doc/classes.md` | "Line keys" table: one spelling | 6 |
| `Item/LineKey.js`, core readers | drop bare branches | 6 (only at count 0) |
| `ai/sessions/**/*.jsonl` | rewritten by `MarkLines --apply` | 5 |

## Small steps, each checkable

1. Fix `Steps.mjs` to read through `LineKey`, and switch the bare writers (`Agents.js`, `append.mjs`, schema) to the marked spelling. Commit by path.
2. Write `MarkLines.mjs` with `--dry` only. Run it; the manifest lists about 4,776 files and 54k lines.
3. Add `--apply` with the quiet-window check and temp-file rename. Run on one test file in a scratch copy.
4. Migrate batch 1 (about 500 files). Run `ReplayCompare` on each. Commit by path.
5. Repeat step 4 until the dry run reports 0 bare lines.
6. Write the bare-branch refusal (warn once, refuse) test-first. Remove the bare branches from the readers and `LineKey`. Update the two docs.

## Failing checks first (the tests the design should pass)

Written before any build step. Each is a node script that exits non-zero until the step is done.

| Check (file) | Asserts | Fails now because |
|---|---|---|
| `Server/tests/steps-line-key.mjs` | `Steps.mjs` reads an `assign()` line and a bare `assign` line to the same result | `Steps.mjs` reads only bare |
| `Server/tests/marklines-dry.mjs` | `MarkLines --dry` on a fixture folder lists every file with the right old and new line counts, and writes nothing | script does not exist |
| `Server/tests/marklines-quiet.mjs` | a file touched 1 minute ago is skipped; a file touched 20 minutes ago is rewritten | script does not exist |
| `Server/tests/marklines-replay.mjs` | a rewritten fixture replays identically (`ReplayCompare` reports identical) | script does not exist |
| `Server/tests/marklines-atomic.mjs` | a simulated append between read and write aborts the write and leaves the file as it was | script does not exist |
| `Server/tests/no-bare-left.mjs` | the dry run on `ai/sessions` reports 0 bare lines | migration not done |
| `Server/tests/bare-refused.mjs` | a bare line warns once and is refused; a marked line passes | branches still exist |

The first column below names cases, not files: they all live in one `Server/MarkLines.test.mjs` (the repo's `X.test.mjs` name, one lean test per class, [core/Test](/framework/core/Test/readme.md)); the `steps-line-key` case is added to the existing `Server/Steps.test.mjs`, and `bare-refused` to the Item test. No `Server/tests/` folder is made. `no-bare-left` is a command (`MarkLines --dry` prints 0).

## How we prove it works

- Every batch: `ReplayCompare` identical before and after, and the dry-run count drops by the batch size.
- Final: `no-bare-left.mjs` passes, `bare-refused.mjs` passes, and the Item tests pass.
- A live tab on a migrated file still loads (check with the site tool on one session page).

## Owner's words, checked against this plan

- "We don't really want our classes handling two different cases" — covered: step 6 removes the bare branches.
- "We want to be moving towards the new way whenever possible" — covered: the readers are fixed first (step 1).
- "think about what kind of scripts can reduce the agent's load" — covered: `MarkLines.mjs` does all the counting and rewriting; no model calls.
- "launch a migration task" — covered: this build process is the task.
- "convert everything over properly, hopefully without breaking anything" — covered: replay per batch, quiet window, atomic rename, batches committed by path.
- Brief fence "Nothing is rewritten until the plan is approved" — covered: step 4 is after approval.
- Brief fence "Never rewrite a file that is being appended to" — covered: quiet window and mtime re-check.
- Brief fence "Don't touch `.claude/` hooks' own logs" — covered: the scan excludes `.claude/`.
- Brief question "`.jsonlog`?" — covered: decision 1.
- Budget about $10 — covered: no model calls in the script; cost is review time.

## Not yet checked (carried from investigation)

- Snapshot internals in `Server/Snapshots.mjs` (does it store offsets?). Must be read before step 4.
- Text matching in `.claude/hooks` and `Servex/`. Must be checked before step 4.
- (Settled under Improved: tests sit beside the scripts as `X.test.mjs`.)

## Improved

- Added the missing step: Servex `Agents.open_task`, `append.mjs` and the schema still write bare `assign`/`log`, so the count would never reach 0 after the rewrite. They switch in step 1.
- Fixed a wrong reuse claim: `LineKey.deep` takes marks off, it cannot put them on. Marking is a small `LineKey.mark` added to the same file.
- Seven test files in a new `Server/tests/` folder became cases in one `Server/MarkLines.test.mjs` plus one case in the existing `Steps.test.mjs`, matching the repo's one-lean-test-per-class rule. This closes the open question.
- ReplayCompare runs per batch, not per file (it replays the whole tree against another checkout).
