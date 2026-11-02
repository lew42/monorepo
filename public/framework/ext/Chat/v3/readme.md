# Chat v3: a session's chat as a card per Prompt, with every reply inside it

Chat v3 draws `session.messages` (`core/Session/Chat/readme.md`): one card per Prompt, in the chat list's own order, with the Replies that answer it (found by `re.to`, a sentence id of that Prompt) drawn inside. It never writes and never reshapes a message. It is the one chat view ([views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md) step 1 of 6; step 2 makes Chat v2 its subclass). Pick it as **V3** in the chat version dropdown; V1 stays the default.

Try it: [/framework/ext/Chat/v3/](/framework/ext/Chat/v3/) draws [fixture/messages-session.jsonl](fixture/messages-session.jsonl) (a copy of a real voice session, `session.messages`-shaped); `?src=<url of any session.jsonl>` draws that session, live.

## How it works

- `ChatV3.js`: `class ChatV3 extends JSONL`. Every line is replayed into a real `Session` (`core/Session`) with `replay_line`, the same replay the item tool uses, except V1's own `{chat}`/`{place}` lines (skipped: the real update is the separate `messages`/`sentences` mirror line `ChatWriter` already writes beside them).
- **A card per Prompt**, in the chat list's own order: its title (or, until the AI writes one, its first words, muted), then the body described below. Its Replies (🧠, markdown, found by `re.to`) and the Tasks/Questions that name its Prompt TASK (through the message Prompt's `prompt` link) sit inside the card. A plain `Message` (a note with no more structure) is its own small card. "show raw" opens the sentences' own raw words, when a `clean` override exists.
- **The card body:** the AI's cleaned `text` when it exists; until then the dictation itself, in paragraphs (see below), clamped to a few lines with "show all (N words)", under a muted title of its first words. A 6,760-character Prompt had come up as one wall of text.
- **Paragraphs** ([placement.js](placement.js), `ChatV3.paragraphs`/`PARAGRAPH_GAP_MS`): a new paragraph starts where the gap between two sentences' `at` is a long pause (4000ms default) — not the old "one paragraph per sent chunk, cut every 3 sentences". Pure logic, no DOM, node-testable ([placement.test.mjs](placement.test.mjs)).
- **Every reply** ([placement.js](placement.js), `owning_prompt`): a Reply's Prompt is the one whose `sentences` holds its `re.to`; a reply with no match joins the newest Prompt before it in the list.
- **The reply being written:** V3 follows the session's live wire (`stream()` in `ext/Session/Session.js`, the one V1 reads) and draws the partial reply at the end of the newest card until its settled Reply message arrives.
- **Gray only for unsent words** (the owner, 2026-10-26): a sentence in the file is final, so it is solid at once; the words still being spoken show as a faint draft at the end (`chat-live` window event).
- **Windowed:** the newest 40 cards, with "show earlier (N)".
- **Live, in place:** a list `add` bubbles with `from` = the list itself (`List extends Item` now, so `get_one` can't tell them apart — `ChatV3.added_member()` resolves the actual member from the line's own `add` payload); a changed Prompt/Reply/Task redraws only the card it touched (`card_for()`).
- **Per-card link:** each card carries its id, so `#<id>` on the chat's url scrolls to it.
- **Small, overridable methods** (step 2 will subclass this): `prompt()`, `reply()`, `marks()` (a no-op hook for V2's ✓/🧠 marks, which live on the Prompt TASK until [views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md) step 3).

## Where it shows

**V3** in the chat version dropdown of the ✦ sheet and the drawer's AI tab (`ext/drawer/ChatView.js`, one `lew42.sheet.chat_view` choice), and the session page's Chat tab (**Chat v3** chip, `?tab=chat&chat_view=v3`, `ai/AISession/AISessionDetail.js`).

## Open decisions

- **Marks (✓/🧠):** not drawn yet (`marks()` is a no-op); they live on the Prompt TASK until step 3 moves them onto the message.
- **Grouping/summary cards** as an overlay that references Prompts by id: not built.
- **Per-task route:** the `#id` permalink stands in for one.
- **Id scheme** for Prompts is whatever `m-<ms>` already is.

## Test

- `placement.test.mjs` (plain node, 18 checks, no browser: `owning_prompt`/`paragraphs` against a copy of a real voice session — every Reply lands under the Prompt holding its `re.to`, in list order; a pause starts a paragraph; the fixture file is only ever read): `node placement.test.mjs`.
- `ChatV3.test.mjs` (headless Playwright, 16 checks: card order, nesting, raw toggle, paragraph breaks, live append of a Prompt and a Reply found by `re.to`, no page errors): `node ChatV3.test.mjs [base-url] [shots-dir]`. It copies `fixture/messages-session.jsonl` to `fixture/live-v3-*.jsonl` (gitignored) and deletes the copy when done.

`failures.jsonl` here is the page-error log the test run wrote while the draft was built (a since-fixed `scrollIntoView` error); it is a record, kept.
