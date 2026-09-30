# Minion: finish slice 2 of the chat widget (inline ✓/?, answer turns ? into ✓), prove it with posting stubbed, commit

Load the `minion` skill first, then `code` and `ui-test`. Your parent is task-mastermind-chat-hitl. Budget: **$2.50, hard**. No sub-agents, no review.mjs, no merge.mjs.

## The owner's words

The quote below is from the full day's transcript, [owner-words.md](../../owner-words.md), section "Continued (about 8:40 PM)". Earlier context for this task is in this task's own [owner-words.md](../owner-words.md).

> "put like a green check mark after it just so that we see that visual feedback ... maybe it's like a yellow question mark that goes after it ... the smart assistant could add clarification UI into the chat where it's like, needs clarity. Do you mean this or that? ... So let's see if we can get a demo of that working."

## Where it stands

Worktree `C:/Code/lew42/worktrees/chat-hitl` (branch `worktree/chat-hitl`). Commit ec5c770f added select, rename and ✓/? marks to `ext/Chat` (read [../chat-wire/task.jsonl](../chat-wire/task.jsonl) for what it did). The previous minion was stopped mid-fix, with UNCOMMITTED changes in `public/framework/ext/Chat/Chat.js` and `ChatPanel.js`: the mark is glued after the last word (`append_mark`), and answering a clarification card flips its ? to ✓ (`on_chosen` → `resolve_mark`). Review that diff (`git diff`), finish it if anything is missing, and commit those two files by exact path.

## Deliverables

1. The uncommitted fix, checked and committed.
2. Proof, on the worktree's own server. It is down: start it from the worktree root with `PORT=51851 node server.js`, in the background with `windowsHide: true`, and **kill it when you finish**. Three screenshots, each one looked at:
   - `/framework/ext/Chat/panel/` at 400: ✓/? inline after the last word of each sentence.
   - The same page after answering a clarification card: its ? is now a ✓. The real model may call nothing unclear, so stub `/api/hitl` with `page.route()` to return one `unclear` mark with a question.
   - The ✦ sheet at 400 (the `ext/drawer/rail` demo page) and the drawer's AI tab at 1920, with marks visible.
3. **NEVER post to a live log.** A worktree server still posts through Servex into the MAIN tree's logs: the last minion put a demo sentence three times, as the owner, into the live `ext/Chat/ai/chat.jsonl`, and it woke real assistants. In every Playwright run, before loading any page, add `page.route("**/*", r => r.request().method() === "POST" && !r.request().url().includes("/api/hitl") ? r.fulfill({ status: 200, body: "{}" }) : r.continue())` and stub `/api/hitl` too. Never edit `ext/Chat/ai/chat.jsonl`.
4. Zero console errors on those pages. Save the shots in `chat-finish/shots/` in this task dir (main tree).

## Fence

Only `public/framework/ext/Chat/**` in the worktree. Commit by exact path, never `git add .`. Land with one landing line in your task.jsonl listing the commit and the shot paths.
