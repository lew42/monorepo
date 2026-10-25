# Chat: one short doc of how a chat is made, end to end

Budget $4, Sonnet. Load the `minion` skill first, then the `documentation` skill. Card: [chat-show-when-your-words-reach-the-assi](/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/). Source: voice session v-sq8y7db (2026-10-25), relayed by session-smart-v-sq8y7db.

## Why

The owner's top need is knowing exactly how a chat is **created, saved, sent, streamed and rendered**. The owner does not want paragraphs, but structure: as code blocks and diagrams, with the file that does each stage.

## The deliverables

1. **`ux/Dictate/doc/pipeline.md`: ONE short doc.**
   - A code block or diagram of the pipeline: mic → whisper → live bubble → send → Servex / session file → fast assistant → smart assistant → the views. Each stage names the file:line that does it.
   - Side by side: what the first view (`ux/Dictate/chat.js`, `ext/Chat/Chat.js`) and Chat v2 (`ext/Chat/v2/ChatV2Model.js`, `ChatV2.js`) each read and draw. Say where they differ.
   - The class sketch: start from the "The shape" code block in [../proposal.md](../proposal.md), correct it against the code, and mark ✅ built / ⬜ not built.
   - The colour states, from the code: gray trailing words = whisper's guess, still changing (`.chatbox-guess`, `ext/Chat/Chat.js:810`); a whole bubble faded = sent, waiting for its cleaned line (`.chatbox-live-sent`, `Chat.js:801`); black again = the cleaned line from the session file replaced it.
   - How the item tool changes a chat: add a Prompt, set a title, add a task under a Prompt, complete it (the nested line `{"<prompt>":{"<task>":{"complete":{…}}}}`).
   - **How each item is logged** (the owner asked to confirm): the session log holds only tasks; a Prompt is a Task (`core/Task/Prompt.js`, confirm the path); a reply is a message added to its Prompt (`replies`); a Question is a Task (`core/Task/Question.js`). One example line for each, and where V1 and V2 read them differently.
   - No walls of text: at most a sentence or two between blocks.
2. **The drawer's Docs tab shows the real docs, in that order.** Its list is `DictateDocs.DOCS` in `ux/Dictate/DictateDocs.js`. Put `pipeline.md` first. Check that each listed doc is current. Drop or demote ones that are stale (detail on message transport, the API, the event source) so the list reads as structure first. Say what you dropped and why.
3. **Readme.** `ux/Dictate/readme.md` links `pipeline.md` near the top. Add one `⬜` line there with the goal (the owner calls the whole experience "chat"; no renames), linking `ext/Chat/v2/readme.md`, and the matching line in that readme. The UX dictate page links the doc.

**Fence:** `ux/Dictate/doc/`, `ux/Dictate/DictateDocs.js`, `ux/Dictate/readme.md`, `ux/Dictate/page.js`, `ext/Chat/v2/readme.md`. Read anything; edit only these.

## Check and land

Work in your own worktree (`take_worktree`, or `node Server/worktree-up.mjs pipeline-doc`). Load the Docs tab headless and take one screenshot at 1200 into this folder; read it yourself. Commit by exact path. Log findings as `log` lines in this folder's `session.jsonl`. Report one screen to mastermind-dictation-2, which reviews and merges. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.
