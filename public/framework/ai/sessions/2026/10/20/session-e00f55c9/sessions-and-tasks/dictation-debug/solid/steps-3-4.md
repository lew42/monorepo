# Dictation steps 3 and 4: every error caught, and a compact Debug tab

Budget: $10. Load the `minion` skill first. The task is `requirements.md` in this folder, steps 3 and 4. Steps 1 and 2 are on michael/dev (step 2: e5c20130c). Read `review.md` here (finding 4 is this work) and the latest `log` lines in `session.jsonl`.

## Where the half-built work is
The previous minion (minion-dictation-solid, Opus) prepared steps 3–4, but during a Servex crash loop its worktree qf-8 was salvaged into commit `29210b547` on branch `salvage/qf-8-2026-10-25-2`. Recover ONLY these files from it; the rest of that commit is other agents' records:

```
git checkout 29210b547 -- public/framework/ux/Dictate/Connection.css public/framework/ux/Dictate/Connection.js public/framework/ux/Dictate/DictateDebug.css public/framework/ux/Dictate/DictateDebug.js public/framework/ux/Dictate/test/debug-tab.mjs public/framework/ux/Dictate/test/errors.mjs
```

Merge `public/framework/ux/Dictate/doc/debug-tab.md` BY HAND: the salvage copy (`git show 29210b547:public/framework/ux/Dictate/doc/debug-tab.md`) lacks the `## Refresh then dictate` section now on michael/dev; keep both.

## Do
1. Work in `C:\Code\lew42\worktrees\dictation-solid` (branch worktree/dictation-solid, already registered). First `git merge michael/dev`.
2. Recover the files above, then read them against requirements.md steps 3 and 4 and finish what is missing. Don't rewrite what works.
3. Step 3 also wires the browser error sender, `public/framework/ext/Chat/v2/report.js` (built by mastermind-chat-v2; read its header). Call `init(session)` from ux/Dictate once the voice session id is known. It posts `kind=error|click|context` to Servex `/api/session/say`: an error is filed as a log line, and click and context are queued for the smart seat; none wakes a seat.
4. Prove: `node public/framework/ux/Dictate/test/errors.mjs`, `test/debug-tab.mjs`, and `test/refresh.mjs` still passing. Debug tab shots at 390 and 1920 into this folder's `shots/`, which you look at yourself.
5. Land step 3, then step 4, as two merges:
   - `node Server/review.mjs public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/solid C:/Code/lew42/worktrees/dictation-solid`
   - Answer every finding in this folder's `session.jsonl` with `{"review":{"answer":{"n":N,"reply":"fixed: …"}}}`. The reply must start with `fixed:`, `declined:` or `noted:` (for a [note]).
   - `node Server/hold.mjs on`, then `MSYS_NO_PATHCONV=1 node Server/merge.mjs C:/Code/lew42/worktrees/dictation-solid /framework/ux/Dictate/ --review-dir public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/solid`, then `node Server/hold.mjs off`. The `--review-dir` is needed: this session folder is older than merge.mjs's 3-day scan.
   - If merge.mjs says "left staged, uncommitted in main tree", commit exactly those files by path in the main tree. Check by content that the code is on michael/dev.
6. Update `ux/Dictate/readme.md` and `doc/debug-tab.md` so they are true. Log each landing as a `log` line in `session.jsonl` (`node .claude/hooks/append.mjs <file> <json file>`).

Known: `ext/Chat/v2/ChatV2.test.mjs` fails on michael/dev itself (its owner is fixing it); merge.mjs does not block on it.

Never: kill or restart the dev server, stash, push, drive the owner's tabs, or `git add -A` (the worktree's auto-written files.jsonl rows are noise: add by path).
