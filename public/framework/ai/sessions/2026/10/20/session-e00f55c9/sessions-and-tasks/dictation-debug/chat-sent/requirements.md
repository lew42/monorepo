# Chat: show when your words reach the assistant

Budget: $6. Load the `minion` skill first. Model: Sonnet. Card: `public/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/` (it holds the owner's ask). Source: voice session v-sq8y7db, 2026-10-25, relayed by session-smart-v-sq8y7db.

Worktree: `C:/Code/lew42/worktrees/dictation-chat-sent` (branch `worktree/dictation-chat-sent`). Work and commit only there, by exact path.

## The owner's asks (numbered deliverables)

1. **A "sent" mark on each line.** The dictate UI shows when a line has actually reached the smart assistant, as opposed to only the fast assistant's first pass. Measure and log the delay from the end of speech to the moment the line is marked sent. **Check whether lines dictated before a page refresh are lost:** reproduce it headless (dictate or inject lines, reload before they send, then see whether they arrive). If they are lost, fix it, or log the cause in `session.jsonl` with file:line.
2. **A smaller jump-to-newest button.** The button that appears when you scroll away from the newest line becomes a small button near the bottom. Then **verify that scroll lock works**: scroll up, add lines, and confirm the view stays put; press the button and confirm it follows again. Take screenshots of each step.
3. **A light mic background.** In the "listening, sends when you pause" bar (`ux/Dictate/DictationBar.js` and `.css`), change the mic button's dark gray background to light gray or white, so the level rings that pulse with your voice show clearly. Keep the contrast readable (the `color` skill).
4. **"Chat", not "dictation".** The owner prefers calling the whole experience "chat", and wants it to work the same everywhere. **Do not rename files or classes.** Add one `⬜` line about the goal to `public/framework/ux/Dictate/readme.md`, and one to `public/framework/ext/Chat/v2/readme.md`, each linking the other. Use "chat" in any new text the reader sees.

5. **Open Questions show under their Prompt** (the owner hit this: "I don't see the question you asked me"). The smart assistant added a Question with `item({path: "/framework/ai/sessions/2026/10/25/v-sq8y7db/", delta: {"p-1792961349385": {tasks: {add: {type: "Question", id: "q-1792961349", text: "...", from: "p-1792961349385"}}}}})`, and the chat UI does not draw it. Make an open Question render in the chat directly under the Prompt it belongs to, and give it a way to be answered if the Question class already has one. Use that real session as the test case, and keep its records intact.

## Where to start

- Read `ux/Dictate/readme.md` and `ext/Chat/v2/readme.md` first. Earlier work in this folder is relevant: `../bucket/`, `../chat-v2/`, `../drawer-v2/`, `../solid/`. The order and send pipeline is described there.
- The jump-to-newest code is probably in `ext/Chat/Chat.js` or `ext/drawer/AIFeed.js` (both contain "newest"). One fix should cover every surface that shows a chat (CLAUDE.md law 6).

## How to check and land

- Test headless with Playwright at 400, 1200 and 1920. Save the screenshots in this folder and read them yourself.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.
- Log progress as `log` lines in this folder's `session.jsonl`. Put every finding there, never in a findings.md.
- When the work is done: update the two readmes so they are true, then commit, then report one screen to mastermind-dictation-2. That mastermind reviews and merges; you do not merge.
