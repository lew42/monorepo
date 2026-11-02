# Chat V2 becomes a subclass of Chat V3 (step 2 of the views plan)

Budget: $10. Load the `minion` skill first, then `code` and `ui`. You own this one step end to end, one merge. The owner's words: [../owner-notes-2026-11-01-2040.md](../owner-notes-2026-11-01-2040.md), item 28 ("the biggest item: unify V2 and V3"). The plan: [core/Session/Chat/doc/views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md), step 2, and "Open questions, answered", (2). Step 1 has landed (b53677924): [ext/Chat/v3/readme.md](/framework/ext/Chat/v3/readme.md).

**What to build.**
- `ext/Chat/v2/ChatV2.js` becomes `class ChatV2 extends ChatV3` (`ext/Chat/v3/ChatV3.js`). It adds only what V2 has that V3 lacks:
  - the ✓/🧠 marks;
  - the raw toggle;
  - replies drawn beside their sentence;
  - its own CSS.
- Everything else comes from ChatV3, which already does `session.messages`, Replies by `re.to`, pause paragraphs, the live draft and the reply being written.
- Delete `ext/Chat/v2/ChatV2Model.js` (move it aside with `git mv` into `ext/Chat/v2/old/` if a test still needs it). V2 loses its `{chat}` lookup.
- **Marks stay where they are this step.** ✓/🧠 are still read from the Prompt TASK, through the Prompt message's `prompt` link. Step 3 moves them onto the message.
- If ChatV2 needs a hook ChatV3 lacks, add a small overridable method to ChatV3 (draw a Prompt, draw a Reply, the marks slot). Keep V3's output identical: `ext/Chat/v3/ChatV3.test.mjs` and `placement.test.mjs` must still pass unchanged.
- **The alternative,** written in the plan: one class with a `skin` option. Switch to it, and say why in `task.jsonl`, if ChatV2 ends up overriding most of ChatV3's methods.
- **Owner item 6 ("V2 shows no live Whisper text").** It should come free from ChatV3's live draft; confirm it in a shot.

**Before you build, read `mastermind-chat-model`'s note on upcoming fields.** It owns `core/Session/` and `session.messages`. All of these changes are additive, so read defensively:
- `Ref` members become Items and need a `RefView`;
- `Prompt.kind` and `Prompt.items` are added;
- `Prompt.raw` becomes computed;
- `Sentence.at` is always present.

Look in `public/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-model/inbox.jsonl` and its `session.jsonl`. Don't change those shapes.

**Fence.** Yours: `ext/Chat/v2/` and the small hooks in `ext/Chat/v3/ChatV3.js`. Not yours:
- `ux/Dictate/`;
- `audio/Recite/`, which `mastermind-read-aloud-next` is building;
- `core/Session/`.

**Prove it.**
- `ext/Chat/v2/ChatV2.test.mjs`, `live-guess.test.mjs` and `resurface.test.mjs` pass, updated only where they read `ChatV2Model`.
- One new check: on the v3-messages fixture, every Reply in V2 is drawn beside the sentence holding its `re.to`.
- Headless shots of `/framework/ext/Chat/v2/` at 400x860 and 1200, plus V3 at 400x860 for comparison, in `shots/` here. Read them yourself.

**Land**, in this order:
- [ ] Worktree: `node Server/worktree-up.mjs v2-subclass`. Commit by exact path after each working piece.
- [ ] Docs, same branch:
  - `ext/Chat/v2/readme.md`, which now says what V2 adds on top of V3;
  - the V2 line in `ext/Chat/readme.md`;
  - `views-on-messages.md`, marking step 2 done (and step 4 folded in).
- [ ] Review: `node Server/review.mjs <this dir> <worktree>`. Answer every finding as `{"review":{"answer":{"n","reply"}}}` in this dir's `task.jsonl` (`node .claude/hooks/append.mjs`). Then fix what the verdict asks for, without stopping to wait.
- [ ] Merge: `MSYS_NO_PATHCONV=1 node Server/merge.mjs <full worktree path> --review-dir <this dir>`.
- [ ] Check: `node Server/smoke.mjs <worktree> framework/ext/Chat/v2/ framework/ext/Chat/v3/` shows no FAIL, and `git log michael/dev..worktree/v2-subclass` is empty.

**Report** once, after the merge, to `mastermind-dictation-v3`, in 3 lines: what changed, the proof, what step 3 needs.

**Never:**
- restart or kill any server or Servex;
- run `python`;
- drive the owner's tabs;
- set work aside with git (diff instead);
- `git add` the generated `files.jsonl`.

Resolve, don't park: decide, and write the alternative beside it.
