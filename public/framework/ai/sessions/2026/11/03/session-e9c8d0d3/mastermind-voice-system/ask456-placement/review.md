verdict: fix
1. [fix] Ask 5.1 breaks ask 6.1. `ChatWriter.last_message_id` (`Servex/agents/ChatWriter.js:91`) only reads `messages.add` lines. It ignores the `messages.move` line that `ChatWriter.move_line` (`:147`) writes for a new topic. Example: Prompt m-B is open, the seat adds task card m-T, then moves m-B below it. The list ends in m-B, but the file's newest add is m-T. So `owner()` (`:62`) starts a new Prompt instead of growing the moved one; before this diff `st.last` grew m-B correctly. A `remove` has the same problem. A simpler fix: read the last id from the replayed list (`session._messages.messages.at(-1)?.id`), which `move_line` already uses, instead of scanning the raw text. Add the move case to `ChatWriter.order.test.mjs`.
2. [fix] `Sessions.js` changed, but no test that loads it was run. The worktree has no node_modules, so `chat-messages.test.mjs`, `Sessions.single.test.mjs` (which holds the 900-word brief check) and `Sessions.test.mjs` could not start (`ERR_MODULE_NOT_FOUND @anthropic-ai/claude-agent-sdk`, which I reproduced). Run them against the branch before merging; the brief is 891 words, only 9 under the limit.
3. [fix] Stale doc (law 9): `ext/Chat/v3/readme.md:15` still says a Reply's Prompt is "the one whose `sentences` holds its `re.to`". After `placement.js:13`, arrival order wins when a newer Prompt sits in between. `ext/Chat/v2/readme.md:6` (the reply drawn beside its sentence) also needs the trade-off that `placement-defaults.md` names.
4. [fix] Unindexed test: `Servex/readme.md:45` lists ChatWriter's tests as `chat-messages.test.mjs` and `ChatWriter.move.test.mjs`, but not the new `ChatWriter.order.test.mjs`. It also does not say that the next owner sentence now checks the session file for messages from other writers.
5. [note] Ask 4 ("if something does, fix it") is only half done. V1 (`ux/Dictate/Widget.js`, `chat.js`) still draws from `{chat}` lines, not `session.messages`, and V1 is still the default view (`ext/Chat/v3/readme.md:3`). The brief allowed listing it in `ai/todo.md`, which was done, but the view the owner sees by default is still not the one-truth list.
6. [note] The task checkbox is a `☐ ` character inside the title text (`ext/Chat/v3/ChatV3.js:242`), not a checkbox you can tick. It has no browser test (filed in todo.md). Fine as a first version, but say so if the owner expects to tick it.
7. [note] Ask 6.1 "a new topic moves it to a new paragraph in one step" becomes a new card, not a paragraph. Stored paragraphs were declined with a proposal (`ux/Dictate/doc/placement-defaults.md`, ask 6 item 4) and a todo line. The decline is reasonable and recorded.
8. [note] The brief asked for each part as its own commit. A (the audit) and C (the defaults) share commit `fcc27e457`; B1 and B2 have their own. The branch `worktree/voice-place` is not merged yet.

## Requirements
- A "nothing reaches the chat view outside session.messages" — partly. V2/V3 are clean. `chat-live` and `Wire.stream` are rightly called transient drafts. V1 is not clean and is filed in todo (item 5).
- B1 "agent message mid-dictation lands below, queues while the owner talks" — partly. The hold/flush was already true (`Sessions.js:319`, `:323`), and the cards-written-by-other-writers gap is fixed, but the fix breaks the moved-Prompt case (item 1).
- B2 "messages out of order: find out why" — yes. The cause is given by file:line (`placement.js:13`, 14 of 117 replies in v-z0jonhy), it is fixed, and test 3b passes (40 pass, run by me).
- C1 "new sentence at the end of the last paragraph; a new topic in one step" — partly. It was already true, but item 1 regresses it after a move; there are no stored paragraphs.
- C2 "a rough title after a couple of sentences" — yes. The seat brief now says it (`single-voice-assistant.md:34`).
- C3 "a task-like prompt gets an empty checkbox" — yes, as a text glyph (item 6).
- C4 "sentences {raw, clean}, paragraphs refer to them" — yes. It says what exists and declines the rest with a proposal.
- Brief under 900 words — 891 by the test's own split, but the test itself was not run (item 2).
- Docs and the pointer from `ux/Dictate/readme.md` — the pointer was added; v3/v2 readmes and `Servex/readme.md` are stale (items 3, 4).
- No `files.jsonl` in `git diff --name-only 7b2d2b7cc worktree/voice-place` — yes.
- Live instances of a changed class — n/a. No class holds new state; ChatWriter gained a hook.

## Words
- The doc and report are plain and give file:line throughout — yes.
- `placement-defaults.md` is one screen per ask — yes.
