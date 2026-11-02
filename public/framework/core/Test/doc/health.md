# Test health — which tests exist, which run, which are red (2026-11-01)

## The command to run everything
`node public/framework/core/Test/TestRunner.mjs` (about 10 minutes for 204 tests; each file in its own process, 60 s limit, 4 at once). It finds every `*.test.mjs` under the repo except `node_modules`, `.git`, `worktrees` and `ai/sessions`. One folder: `... TestRunner.mjs core/Task`. Results land in [results.jsonl](../results.jsonl) and on [/framework/core/Test/](/framework/core/Test/).

## What the gates run
- **`Server/merge.mjs`** (via `Server/MergeTests.mjs`): only the tests that *cover the diff* (the changed file's folder plus every test that imports it, transitively). A red test refuses the merge only if it **passes on the merge base** and fails on the branch; one that already fails on the base is a note. A timeout counts as no result. `--skip-tests` turns it off.
- **`Servex/WorktreeWatch.js`**: the near tests, 45 s after the last save in a taken worktree.
- Nothing runs the **whole** suite on a schedule. A test whose code nobody touches is never run, so it can rot unseen (the three below did).

## Result of the full run (204 tests, run on michael/dev)
| Area | Tests | State |
|---|---|---|
| `.claude/hooks` | 5 | 4 pass; `jsonl-schema.test.mjs` red (3 checks), filed in [.claude/hooks/improvements.jsonl](/.claude/hooks/improvements.jsonl) |
| `Server/` | 55 | all pass; `plugins/SocketServer/Files.move.test.mjs` passes but needs 86 s, so the runner reports a timeout (filed in [Server/improvements.jsonl](/Server/improvements.jsonl)) |
| `Servex/` | 82 | all pass after the fix below; `agents/page_tools.test.mjs` takes 16 s alone and times out when 4 tests run beside it (load-sensitive, as `Template`/`TasksPage`/`whisper-detach` already are) |
| `core/` | 42 | all pass |
| `ext/` | 13 | all pass |
| `audio/`, `ai/` | 7 | all pass |

## Fixed in this pass (stale expectations, no real bug)
- `Servex/agents/PromptLines.test.mjs` and `PromptLines.say.test.mjs` imported `ext/Chat/v2/ChatV2Model.js`, moved to `v2/old/` by v2-subclass; `merge.mjs` had caught the same stray import in two other files that night. Also `PromptLines.test.mjs` expected an answered Question to stay nested; the old model's `RESURFACE` rule moves it to the root, so the checks now use `own_and_from` and expect it second in `roots()`.
- `Files.move.test.mjs`: the per-call answer limit was 4 s, shorter than a `move_plan` now takes (the repo scan reads ~39,500 files). Now 30 s.

## Still red, filed rather than fixed
- `jsonl-schema.test.mjs`: the schema lists verbs (`agent`, `chat`, `note`, …) that the task reader and `ai/cards/fold.js` do not list or mark `pending`. Needs a call on which reader owns them.

## Never run by any gate: the browser scripts
These are Playwright scripts taken by hand (`node <script> <base-url> [shots dir]`), not named `*.test.mjs`, so neither the runner nor `merge.mjs` ever runs them:
- `ux/Dictate/test/*.mjs` (27 scripts, plus fixtures). Two, `chat-sent.mjs` and `earlier.mjs`, were already failing before 3b1fae8d3 ([ux/Dictate/improvements.jsonl](/framework/ux/Dictate/improvements.jsonl)).
- `ext/Refine/test/` (`composer-flow`, `dictate-flow`, `nothing-to-refine`, `refine-style`, `session-log`), `Servex/ext/refine/test/` (`live-refine-measure`, `tag-router`).
- `ux/Content/Object/DefaultView.test.js`: reserved `.test.js` (browser), no runner.

I did not run these: they need a live site, Servex stubs and a fake mic, and the Dictate ones sit in dictation-v3's fence. **Proposal (not wired):** give them one entry, `TestRunner.mjs --browser`, that runs each with `SITE_URL`, headless, with an allow-list of the ones known to pass, so a red one is a real change. That is a larger job than a list in `merge.mjs` because the scripts take different arguments; it is queued for the Dictate owner.
