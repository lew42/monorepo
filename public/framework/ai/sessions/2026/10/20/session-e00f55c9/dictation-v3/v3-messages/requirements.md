# Chat V3 draws `session.messages` (step 1 of the views plan)

Budget: $10. Load the `minion` skill first, then `code` and `ui`. You own this one step end to end, one merge. The owner's words: [../owner-notes-2026-11-01-2040.md](../owner-notes-2026-11-01-2040.md), items 28–30 ("the biggest item: unify V2 and V3"). The plan you build: [core/Session/Chat/doc/views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md), step 1, and its "Open questions, answered" section (the decisions are made there).

**What to build.** `ext/Chat/v3/ChatV3.js` draws the chat from `session.messages` (a `Prompt` with its sentences, the `Reply`s that answer it below), in list order, live from the Session's `"delta"` event. Tasks and Questions stay drawn beside, as now. Template: `ext/Chat/list/ChatList.js` (already reads `messages` and `sentences` only). Read `core/Session/Chat/readme.md` first.
- Drop the `{chat}` reply lookup (`chat_line`, `ChatV3.js:48`): a Reply finds its Prompt by `re.to` (a sentence id in the Prompt's `sentences`).
- Keep: the live draft (`chat-live` event), the reply being written (`partial`, the live wire), the AI title or first words, cleaned text (`Prompt.cleaned`).
- **Paragraphs:** a new paragraph where the gap between two sentences' `at` is long (a pause; name the threshold as a static, e.g. `PARAGRAPH_GAP_MS`). This replaces "one paragraph per sent chunk".
- **This class becomes the one chat view:** step 2 will make `ChatV2` a subclass of it. Keep its methods small and overridable (draw a Prompt, draw a Reply, draw the marks slot).

**Fence.** `mastermind-ink-check` is building paragraph breaks in `ux/Dictate/` and may touch `ext/Chat/v3/ChatV3.js` in `worktree/views-fix`. Message it FIRST (`send_to_agent`, id `mastermind-ink-check`): ask whether it edits `ChatV3.js`, and agree who does V3's paragraphs (you, on messages, is the default). Branch from current `michael/dev` after any of its merges that touch `ChatV3.js`. Do not edit `ux/Dictate/`, `audio/Recite/` or `ext/Chat/v2/`.

**Prove it.**
- A node test (`ext/Chat/v3/ChatV3.test.mjs` or beside `core/Session/Chat/Chat.test.mjs`) over a fixture copied from a real voice session (`public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl`, a range with replies; do not edit the session file): every Reply lands under the Prompt holding its `re.to`; order is list order; a pause makes a paragraph.
- Headless shots of `/framework/ext/Chat/v3/` at 400x860 and 1200 on that session, in `shots/` here; read them yourself. The existing suite still passes.

**Land.** Worktree via `node Server/worktree-up.mjs v3-messages`; commit by exact path after each working piece; update `ext/Chat/readme.md` (the V3 line) and `views-on-messages.md` (step 1 done) in the same branch; `node Server/review.mjs <this dir> <worktree>`; answer every finding as `{"review":{"answer":{"n","reply"}}}` in this dir's `task.jsonl` (`node .claude/hooks/append.mjs`); `MSYS_NO_PATHCONV=1 node Server/merge.mjs <full worktree path> --review-dir <this dir>`; `node Server/smoke.mjs` shows no FAIL; `git log michael/dev..worktree/v3-messages` is empty.

**Report** once, after the merge, to `mastermind-dictation-v3`, in 3 lines: what changed, the proof, what step 2 needs.

**Never:** restart or kill any server or Servex, run `python`, drive the owner's tabs, set work aside in a stash (diff instead), or `git add` the generated `files.jsonl`. Resolve, don't park: decide, and write the alternative beside it.
