# Test health — which tests exist, which run, which are red (2026-11-01)

## The command to run everything
`node public/framework/core/Test/run-all.mjs [--browser]` runs everything and appends one dated line to [run-all.jsonl](../run-all.jsonl); under it `node public/framework/core/Test/TestRunner.mjs` (about 10 minutes for 204 tests; each file in its own process, 60 s limit, 4 at once). It finds every `*.test.mjs` under the repo except `node_modules`, `.git`, `worktrees` and `ai/sessions`. One folder: `... TestRunner.mjs core/Task`. Results land in [results.jsonl](../results.jsonl) and on [/framework/core/Test/](/framework/core/Test/).

## What the gates run
- **`Server/merge.mjs`** (via `Server/MergeTests.mjs`): only the tests that *cover the diff* (the changed file's folder plus every test that imports it, transitively). A red test refuses the merge only if it **passes on the merge base** and fails on the branch; one that already fails on the base is a note. A timeout counts as no result. `--skip-tests` turns it off.
- **`Servex/WorktreeWatch.js`**: the near tests, 45 s after the last save in a taken worktree.
- Nothing runs the **whole** suite on a schedule. A test whose code nobody touches is never run, so it can rot unseen (the three below did).

## Result of the full run (204 tests, run on michael/dev)
| Area | Tests | State |
|---|---|---|
| `.claude/hooks` | 5 | 4 pass; `jsonl-schema.test.mjs` red (3 checks), filed in [.claude/hooks/improvements.jsonl](/.claude/hooks/improvements.jsonl) |
| `Server/` | 55 | all pass; `plugins/SocketServer/Files.move.test.mjs` needed 86 s then and a later run from a worktree failed with `EPERM` after 64 s (filed in [Server/improvements.jsonl](/Server/improvements.jsonl)) |
| `Servex/` | 82 | all pass after the fix below; `agents/page_tools.test.mjs` takes 16 s alone and times out when 4 tests run beside it (load-sensitive, as `Template`/`TasksPage`/`whisper-detach` already are) |
| `core/` | 42 | all pass |
| `ext/` | 13 | all pass |
| `audio/`, `ai/` | 7 | all pass |

## Fixed in this pass (stale expectations, no real bug)
- `Servex/agents/PromptLines.test.mjs` and `PromptLines.say.test.mjs` imported `ext/Chat/v2/ChatV2Model.js`, moved to `v2/old/` by v2-subclass; `merge.mjs` had caught the same stray import in two other files that night. Also `PromptLines.test.mjs` expected an answered Question to stay nested; the old model's `RESURFACE` rule moves it to the root, so the checks now use `own_and_from` and expect it second in `roots()`.
- `Files.move.test.mjs`: the per-call answer limit was 4 s, shorter than a `move_plan` now takes (the repo scan reads ~39,500 files). Now 30 s.

## Still red, filed rather than fixed
- Seen red in the 2026-11-02 `run-all.mjs` run from the test-browser worktree (201 of 205 passed; line in [run-all.jsonl](../run-all.jsonl)): `Files.move.test.mjs` failed with `EPERM` after 64 s (the earlier run only timed out), `ChatV2.test.mjs` and `ChatV3.test.mjs` hit a Playwright `TimeoutError` against the worktree's site. Sent to mastermind-chat-model (cause unknown: a Playwright timeout against the worktree site). Not yet re-run on the main checkout; a main-checkout `run-all` is the check.
- `jsonl-schema.test.mjs`: the schema lists verbs (`agent`, `chat`, `note`, …) that the task reader and `ai/cards/fold.js` do not list or mark `pending`. Needs a call on which reader owns them.

## The browser scripts: `--browser` (2026-11-02)
Playwright scripts that take a site URL (not named `*.test.mjs`) are listed in [browser-scripts.mjs](../browser-scripts.mjs) with a status, and run by one command:
- `node public/framework/core/Test/TestRunner.mjs --browser [name…]` runs the listed scripts one at a time, headless, with a fake mic (`jfk.wav`), against `SITE_URL` (this checkout's site by default). **pass** must pass; **red** is known failing and is reported but never fails the run (the run says when a red one now passes, so you can promote it); **skip** is never run.
- `node public/framework/core/Test/run-all.mjs [--browser]` runs every node test (and the browser list) and appends one dated line to [run-all.jsonl](../run-all.jsonl): `{at, trigger, site, node:{total,passed,red[]}, browser?:{…}, ms, ok}`. **Not scheduled**: run it by hand; a nightly job can call it and read the last line.
- A slow test gets its own limit in [timeouts.json](../timeouts.json) (file → ms) instead of one global number; a browser script sets `ms` in the list. `TESTRUNNER_TIMEOUT` still overrides everything.

Per-script runs against monorepo.localhost (2026-11-02, 32 scripts, each line in [results.jsonl](../results.jsonl) with trigger `browser` or in the run-all line): the first pass had 19 pass and 13 red; re-runs showed `dictation-bar` and `refresh` are flaky under load (they passed once, failed twice), so they are listed red. The list now holds **17 pass, 15 red**. The `run-all.mjs --browser` line in run-all.jsonl ran against the worktree site and shows 16 pass.
- **Pass (17):** Dictate `active-session`, `chat-gray`, `docs-tab`, `errors`, `flicker`, `freeze`, `load`, `marks`, `order`, `raw-stays`, `sheet-steps`, `v1-order`, `watch`; `repeat`; Refine `session-log`, `refine-style`; `tag-router`.
- **Red (15):** `chat-sent` (v2 chat at 400px: scroll-pinning checks fail (scroll max 0, newest not in view)); `debug-tab` (Debug view shows llm=wait, not all eight lights green); `deltas` (owner bubble should read One. Two. Three. once; the repeat is drawn or the late line is misplaced); `earlier` (after show-earlier, the reader moved (144 -> -1115)); `in-place` (4 checks fail (see its output)); `new-session` (A2: New session does not clear the demo chat); `reconnect` (5 s outage should stay hidden (8 s grace); log lines not written); `settings` (delay 0.5 s: 3 prompts sent, wanted 2); `stall` (1 check fails after the reload step); `swallow` (page.evaluate: querySelectorAll of undefined); `composer-flow` (screenshot step fails (unsupported mime type); needs Whisper :8178 and Servex); `dictate-flow` (times out waiting for .voice-conn); `nothing-to-refine` (loading Dictate.js request errors).
- **Skipped:** `handoff.mjs` (asks the live Servex and starts real agents) and `live-refine-measure.mjs` (spends model money).
- The reds are filed: the Dictate ones logged by dictation-v3 in commit b4dfb5639 ("log test-health browser failures"), the Refine ones in [ext/Refine/improvements.jsonl](/framework/ext/Refine/improvements.jsonl).
- `ux/Content/Object/DefaultView.test.js`: reserved `.test.js` (browser), no runner.
