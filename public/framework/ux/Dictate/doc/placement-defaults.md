# Placement defaults, the one-truth audit, and the out-of-order cause (2026-11-03, asks 4, 5, 6)

## Ask 4 — does anything reach the chat except through `session.messages`?

- **V3 and V2** (`ext/Chat/v3/ChatV3.js`, `ext/Chat/v2/ChatV2.js`) draw one card per root message of `session.messages`. Two other readers sit beside it, both data from the same session: `session._tasks` (Tasks and Questions nested under a Prompt, `ChatV3.js:76`, `:109`) and `session.sentences`.
- **`chat-live`** (fired `ux/Dictate/Widget.js:843`, heard `ChatV3.js:348-351`) is legitimate: it carries the words being spoken right now, not yet sent, so they are not messages yet. It draws faint at the end and is dropped when the real sentence arrives. Same for the `Wire.stream` partial reply (`ChatV3.js:122`): transient, never stored.
- **V1** (`Widget.js` Thread, `chat.js`) draws from V1 `{chat}` lines with its own piece tracking, not from `session.messages`. This is a real departure from "one truth", kept on purpose: V1 is the raw log and the side-by-side compare (`core/Session/Chat/V1Bubbles.js`). Moving it is large; listed in `ai/todo.md`.
- No local message arrays or direct DOM writes of message text were found in V2/V3.

## Ask 5 — nothing splits the owner's bubble; why "out of order"

- **Mid-dictation reply:** `Servex/agents/ChatWriter.js` holds an assistant line while the owner is mid-thought (`mirror(..., {hold})`) and `flush()` places it below, after the owner's last sentence; the owner's next sentence then opens a new Prompt. V1 does the same (`ext/Chat/doc/notes.md#bubble-order`, `ux/Dictate/test/v1-order.mjs`).
- **Gap fixed:** cards, Refs and notes written by the item tool bypass `ChatWriter`, so it still thought the open Prompt was last and grew the Prompt ABOVE the card. It now asks the session file for the newest message id (`ChatWriter.last_message_id`, `owner()`); test `Servex/agents/ChatWriter.order.test.mjs`.
- **The out-of-order cause (view):** `owning_prompt` (`ext/Chat/v3/placement.js:13`) drew a Reply inside the Prompt holding its `re.to` even when a NEWER Prompt already sat between them. The answer then showed above words the owner had already seen. Replaying `sessions/2026/11/03/v-z0jonhy` drew 14 of 117 replies away from their list position (v-qfzrnhh 2 of 40). Fixed: arrival order wins; the reply is drawn under the newest Prompt before it. `re.to` stays as data. Test `ext/Chat/v3/placement.test.mjs` (3b). Trade-off: ChatV2's beside-the-sentence drawing now applies only while no newer Prompt intervenes.
- The stored data was never out of order: a scan of every `v-*` session of 2026-11-01..03 found no sentence pushed into a Prompt above a later message.

## Ask 6 — placement defaults

1. **A new sentence goes at the end of the last paragraph.** Already true: a sentence grows the open Prompt (`ChatWriter.owner`), and paragraphs are derived from pauses (`placement.js` `paragraphs`, 4 s gap). A new topic is one `place` line (`to: "card"`) which is one `List.move` (`ChatWriter.move_line`). A stored "paragraph" does not exist: `to: "paragraph"` splits only V1's bubble (`Widget.js:600`).
2. **A rough title after a couple of sentences.** The view already shows the first words muted until a title exists (`ChatV3.js` `you()`); the seat brief now tells the seat to set `title` after two or three sentences.
3. **A task-like prompt gets an empty checkbox.** The seat sets `kind: "task"` on the message (`Prompt.kind`, existing); `ChatV3.you()` draws `☐ ` before the title. Browser proof is not written here (the worktree has no node_modules for the playwright test).
4. **Sentences `{raw, clean}`, paragraphs refer to them.** Mostly exists: a Sentence holds `text` (the raw words) and `raw` (the unprocessed tap); the cleaned text is `Prompt.clean[sentence id]`; a Prompt refers to sentences by id. Not built: stored paragraphs that refer to sentence ids. **Proposal:** a Prompt gets `paragraphs: [[sid,...],...]`; `to: "paragraph"` becomes one line that splits that list; views stop deriving paragraphs from pauses. It changes the shape of every stored Prompt (a migration of all sessions) and both views, well over 150 lines, so it is declined here and filed in `ai/todo.md`.
