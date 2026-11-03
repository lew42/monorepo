verdict: fix
1. [fix] `public/framework/core/Session/readme.md:120` ("What item() answers for a session") has no row for `messages`. It should say what `item()` returns: `count`, and the last 20 from `message_view`, each `{id, type, by, at, text, title?, icon?, content?}`. It also never mentions the new by-id read, `{messages:{"<id>":{}}}`, which `walk_queries` answers (`Servex/agents/page_tools.js:1037`). `page_tools.js` points readers at this section, so a fresh agent can't learn from it how to read a card back (CLAUDE.md law 9).
2. [fix] The header of `Servex/agents/card-messages.test.mjs:41-43` says `run_item` "cannot address a folder outside the repo at all — there is no 'accept a temp dir' form". That is false: `page_tools.js:17` reads `SERVEX_PUBLIC` for exactly this, and `ref-cache.test.mjs` uses it. Because of that belief, the test writes its scratch sessions into the real store (`ai/sessions/2026/10/16/.card-messages-test-*`), so a killed run leaves junk there and the file watchers see it. Point `SERVEX_PUBLIC` at an OS temp tree, and fix the comment.
3. [note] The round-3 log says the review-history comments were stripped, but some are still there: `ChatV3.test.mjs:83` ("review finding 1/4"), `placement.test.mjs:50,59,62,66` ("review finding 1/2", "2/3", "finding 2", "finding 4"), `ChatList.test.mjs:25,34` ("finding 1") and `card-messages.test.mjs:42` ("review note 7"). A later reader can't see those reviews.
4. [note] `ChatList.test.mjs` copies its fixture to `fixture/live-list-<pid>.jsonl` before the `try` (line 14), so if `get_browser()` fails, the copy is left behind. The path is also not gitignored: `.gitignore:237` covers only `ext/Chat/v3/fixture/live-*.jsonl`.
5. [note] `ChatList.test.mjs:29` waits for `.chatlist-title`, a class that doesn't exist, and swallows the timeout with `.catch(()=>{})`. That adds up to 8 s of dead wait per run. The next line's `waitForFunction` already does the real check.
6. [note] `Servex/agents/page_tools.js:13` now imports a view-side module, `public/framework/ext/Chat/v3/placement.js`, for `note_view`. That is fine while `placement.js` stays DOM-free, but the only place this is recorded is a code comment. One line in `placement.js`'s header or the v3 readme ("Servex's item tool imports note_view; keep it node-safe") would protect it.
7. [note] Every earlier [fix] is in, at `80fb10838` on `worktree/qf-5`:
   - ChatList redraws live through `owning_message()`.
   - Both readmes are current.
   - `Known ?? this` keeps the subclass.
   - Content reads back as lines.
   - `risk.md` and `requirements.md` are now tracked.

   I re-ran `card-messages.test.mjs` (16/16) and `placement.test.mjs` (24/24) in qf-5. I did not re-run the headless ChatV3 and ChatList tests (no dev server for the worktree).

## Requirements
- 1 "item adds a card with an icon and a title" — yes — `card-messages.test.mjs` step 1: `messages.add {icon,title}` returns `ids[0]`, and the card hydrates as a Message.
- 2 "or a ref to an existing item, plus any content" — yes — step 4: `content.add {type:"Ref"}` resolves to the task.
- 3 "It returns the new card's id" — yes — `add.ids.length === 1`.
- 4 "append to the card, rewrite it, or read it by that id" — yes — step 2 covers append and title rewrite, and also reads by id past the last-20 window (`walk_queries`'s messages branch). The read is not documented in the session readme (finding 1).
- 5 "upgrade one of the owner's messages into a card" — yes — step 3 on a copy of `v-z0jonhy`: same class, same slot. The views draw it: `ChatV3.reply()` and `ChatList.fill()`.
- 6 "the card came out titled 'undefined': that request must work" — yes — cause found (an unregistered `type:"Card"` hydrated as a generic Item, read back through `String(m.said||m.text)`). Fixed in `Message.hydrate` and `message_view` (`?? ""`).
- Brief: at most 3 lines in `single-voice-assistant.md` — yes — lines 25–27.
- Brief: `risk.md` first — yes — tracked in `session-e9c8d0d3/mastermind-voice-system/ask3-cards-by-id/`.
- Brief: commit, no merge — yes — 4 commits on `worktree/qf-5`, none merged.
- Live instances of a changed class (Message) — yes — `/framework/ext/Chat/v3/` and `/framework/ext/Chat/list/` draw a session's Messages live.

## Words
- Readme and doc text plain and complete — no — the session readme's item() table is missing `messages` (finding 1). The card-messages test header states something false (finding 2).
- Comments describe the code, not its history — no — "review finding N" labels are still in four test files (finding 3).
