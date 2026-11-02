# Dictate: make the 12 red browser scripts pass

Budget: $12. Load the `minion` skill first, then `code` and `ui-test`. You own this one task end to end.

## Why this task exists

The Dictate browser scripts now run headless with a fake mic (test-health, 248be2c2d). Twelve are marked `red` in `core/Test/browser-scripts.mjs`, and each has a `why`. Logging them was not enough: someone has to fix them, and that is you.

## What to do

For each red `ux/Dictate/test/*.mjs` script, choose one of two outcomes:
- **Fix the code** so the script passes.
- **Prove the script is stale, then rewrite it.** Stale means it tests behaviour the owner later changed on purpose. Quote the readme, doc or commit that changed that behaviour, then rewrite the script to test what is true now.

When a script passes, flip its `status` to `"pass"` in `browser-scripts.mjs` and delete its `why`.

**The red scripts:**

| Script | What fails |
|---|---|
| chat-sent | V2 at 400px: the chat doesn't stay pinned to the bottom (scroll max 0) |
| debug-tab | the Debug view shows llm=wait, not all eight lights green |
| deltas | the owner's bubble should read "One. Two. Three." once |
| earlier | after "show earlier", the reader jumps from 144 to -1115 |
| in-place | 4 checks fail |
| new-session | New session doesn't clear the demo chat |
| reconnect | a 5 s outage should stay hidden (8 s grace), and no log lines are written |
| settings | with a 0.5 s delay, 3 prompts are sent instead of 2 |
| stall | 1 check fails after the reload step |
| swallow | `page.evaluate`: `querySelectorAll` of undefined |
| dictation-bar | flaky |
| refresh | flaky |

**dictation-bar and refresh are flaky. Find the race; never add a retry or a longer timeout.** Log the race you found as a `log` line before you fix it.

**Run one script:** `node public/framework/core/Test/TestRunner.mjs --browser <name>`. Each run's full output is in `core/Test/results.jsonl` (trigger `"browser"`, field `tail`). Run the whole set again before each merge, so you know nothing that was green went red.

## Order and merges

- Worktree: `node Server/worktree-up.mjs dictate-red-tests`. Commit by exact path.
- **Merge in small batches**, about 2–4 scripts each:
  `MSYS_NO_PATHCONV=1 node Server/merge.mjs <full worktree path> --review-dir <this dir>`.
- After each merge, check two things: `node Server/smoke.mjs` shows no FAIL, and `git log michael/dev..worktree/dictate-red-tests` is empty.
- **Do the easy ones first:** swallow (a script error), then new-session, settings and debug-tab. Then do the rest.
- **chat-sent goes in its own early batch.** It is the one script whose fix may land in `ext/Chat/v2/`. Message `mastermind-dictation-v3` once it has merged, because the next V2 change waits on it.
- Run `node Server/review.mjs <this dir> <worktree>` once, before the final batch. Answer every finding as `{"review":{"answer":{"n","reply"}}}` in this dir's `task.jsonl` (`node .claude/hooks/append.mjs`).
- Docs: if a fix changes how Dictate behaves, update `ux/Dictate/readme.md` or its `doc/` in the same commit.

## Fence

**Yours:**
- `ux/Dictate/`, its code and its tests;
- `core/Test/browser-scripts.mjs`, but only the status lines;
- `ext/Chat/v2/`, for chat-sent only.

**Not yours.** If the cause is in one of these, message its owner with the evidence (`send_to_agent`) and keep going on the next script:
- `audio/Recite/` belongs to `mastermind-read-aloud-next`;
- `core/Session/` belongs to `mastermind-chat-model`;
- `ext/Chat/v3/` belongs to `mastermind-dictation-v3`.

## Report

After each merge, send `mastermind-dictation-v3` one line: which scripts are now green, and the commit. At the end, send 3 lines: green against red, the races you found, and anything left with its reason. Log findings as `log` lines in this dir's `task.jsonl`, never in a findings.md.

## Never

- restart or kill any server or Servex;
- run `python`;
- drive the owner's tabs;
- `git stash` (diff instead);
- `git add` the generated `files.jsonl`;
- retry a flaky test until it passes.

Resolve, don't park: decide, and write the alternative beside it.
