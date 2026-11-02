# V2: read the ✓/🧠 marks from the Prompt message (views step 3)

Budget: $5. Load the `minion` skill first, then `code`. You own this one small task end to end.

## Why

V2 (`ext/Chat/v2/ChatV2.js`) draws ✓ (the fast seat got the words) and 🧠 (the smart seat answered) beside the newest Prompt. Today it finds them the long way. It keeps two Maps, `prompt_of` and `sent_by_task`, filled from the old V1 `{chat}` and `{sent}` broadcast lines. It then matches a Prompt TASK id to a mark.

chat-model step 6 (commit `5ede801de`, merged to michael/dev before this brief is sent) now writes the mark onto the Prompt MESSAGE itself: `Sessions.mark_sent` calls `ChatWriter.sent_line(mid, to, at)`, which writes `{messages:{<mid>:{sent:{<to>:{at}}}}}`. `core/Session/Chat/Prompt.js` reads it as `p.sent` → `{fast?: {at}, smart?: {at}}`. The long way is no longer needed. Plan: `core/Session/Chat/doc/views-on-messages.md`, step 3.

## What to do

1. **In `ext/Chat/v2/ChatV2.js`:**
   - Delete `prompt_of`, `sent_by_task`, the tracking loop in `read()` and the two `.clear()` calls in `reset()`. Keep `read()`'s one line that adds the `chat-v3` class to `$box`. If `reset()` is left doing nothing extra, delete it too.
   - In `marks(p)`, read `const sent = p.sent;`. Return `null` when it has neither `fast` nor `smart`. Leave the rest unchanged.
   - Update the header comment: the marks now come from the message.
2. **In `ext/Chat/v3/ChatV3.js:163`:** read `p.raw` instead of `p.said`. `said` is now only an alias for `raw`, kept until this change (see the comment in Prompt.js). Do not delete the alias in Prompt.js; that file belongs to `core/Session/`.
3. **Old sessions** recorded before step 6 have no `sent` on their messages, so they show no marks. This is accepted: only the newest Prompt ever shows marks. Write it as one line in the V2 readme. The alternative (keeping the old Maps as a fallback) was rejected because it keeps two systems alive (law 6).
4. **Docs:** in `ext/Chat/v2/readme.md`, drop the `prompt_of`/`sent_by_task` lines and say where the marks come from now. In `core/Session/Chat/doc/views-on-messages.md`, do not edit; tell me if step 3's text there is wrong.

## Proof

- `node public/framework/core/Test/TestRunner.mjs` runs `ext/Chat/v3/ChatV3.test.mjs`, `placement.test.mjs` and any `ext/Chat/v2/` test, and all are green.
- Add one check to an existing V2 test, or a new `ext/Chat/v2/marks.test.mjs`. Replay entries in which a Prompt message gets `{sent:{fast:{at}}}` and then `{sent:{smart:{at}}}` followed by a Reply. Check that ✓ shows on the newest Prompt only and that 🧠 turns `done` after the Reply.
- `grep -n "prompt_of\|sent_by_task" public/framework/ext/Chat/v2/*.js` returns nothing; `old/ChatV2Model.js` may keep its own copy.
- One headless shot of the V2 demo page at 400 and 1200 px with marks showing, saved in this dir's `shots/`. Browser runs go through the fence: `FENCE_SERVEX=1`, see `Servex/doc/restart.md`, "Tests must not hit the live Servex". Never hit the live Servex.

## Worktree and merge

`node Server/worktree-up.mjs v2-marks`. Commit by exact path. When you are green, run `MSYS_NO_PATHCONV=1 node Server/merge.mjs <full worktree path> --review-dir <this dir>`. Then check that `node Server/smoke.mjs` on `/framework/ext/Chat/` shows no FAIL, and that `git log michael/dev..worktree/v2-marks` is empty.

## Fence

**Yours:** `ext/Chat/v2/`, and that one line in `ext/Chat/v3/ChatV3.js`.

**Not yours:**
- `core/Session/` and `Servex/` belong to `mastermind-chat-model`;
- `ux/Dictate/` belongs to `mastermind-dictate-red-tests`, which is fixing `chat-sent` (V2 at 400 px, pinned to the bottom). Do not touch V2's scroll code; that fix is theirs.

## Report

Send one message to `mastermind-dictation-v3`, 3 lines: what changed, the proof, and anything left with its reason. Log as you go in this dir's `task.jsonl`.

## Never

- restart or kill any server or Servex;
- run `python`;
- drive the owner's tabs;
- `git stash` (diff instead);
- `git add` the generated `files.jsonl`.
