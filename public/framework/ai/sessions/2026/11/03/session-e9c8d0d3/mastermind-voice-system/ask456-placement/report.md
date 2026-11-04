# Report: asks 4, 5, 6 (placement)

Detail by file:line: `ux/Dictate/doc/placement-defaults.md` (branch worktree/voice-place).

**Changed**
- Ask 5.1: `Servex/agents/ChatWriter.js:62` (+ `last_message_id`, `Sessions.js` `last_message_id`): the owner's next sentence starts a NEW Prompt when a card/Ref/note from the item tool sits below the open one (it used to grow the Prompt above it). Held replies mid-dictation were already true (`ChatWriter.js` `mirror`/`flush`). Test `ChatWriter.order.test.mjs`.
- Ask 5.2, cause: `ext/Chat/v3/placement.js:13` `owning_prompt` drew a Reply under the Prompt of its `re.to` even with a newer Prompt between, i.e. above words already seen (v-z0jonhy: 14 of 117 replies). Fixed; test `placement.test.mjs` 3b (40 pass).
- Ask 6: seat brief reworded (891 words, under 900): stay at end of last paragraph, rough title after 2-3 sentences, `kind: "task"`; `ChatV3.js` `you()` draws `☐ ` before a task's title.

**Audit (ask 4):** V2/V3 read only messages (+ `session._tasks`, sentences); `chat-live` and `Wire.stream` are legitimate transient drafts. V1 draws from `{chat}` lines by design: listed in `ai/todo.md`.

**Declined:** stored paragraphs referring to sentence ids (changes every stored Prompt; over 150 lines): proposal in the doc + todo line. No browser test for the checkbox.

**Tests:** placement.test.mjs and ChatWriter.order/move tests pass. Tests importing Sessions.js (incl. the 900-word test) cannot run in this worktree (no node_modules, `@anthropic-ai/claude-agent-sdk`); word count checked with `wc -w`.
