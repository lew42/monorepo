# Chat v2, step 2: a Chat v2 chip in the session page's Chat tab

Built by `mastermind-chat-v2` itself (worktree `chat-v2-tab`, commit 4c1eeb6cb). The owner's raw words: `public/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/`.

**Ask:** in the session page (`ai/AISession/AISessionDetail.js`), the Chat tab gets a way to show Chat v2 (`ext/Chat/v2`, `new ChatV2({url, $box}).live()` on the session's `session.jsonl`) beside the old chat. Chat v1 stays the default until the owner has tried v2. Edit only inside the Chat panel (another agent edits the stats bar and the tab row next). The rule that hides the Chat tab for sessions without prompts (`chat_ok`) stays.

**Done:** two chips at the top of the Chat panel, Chat and Chat v2. v2 mounts lazily on first pick, `?chat_view=v2` keeps the pick on reload (`?chat=` is taken by the DevBar assistant), and it unsubscribes in `deactivated()`. A session with no `session.jsonl` says so. Documented in `ai/AISession/readme.md`.

**Check:** `/framework/ai/sessions/2026/10/20/session-e00f55c9/?tab=chat&chat_view=v2` at 400 and 1200 (557 items drawn; switching back hides v2 and drops the param; the 404s are the same 40 with v2 on or off).
