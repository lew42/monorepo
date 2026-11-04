# Chat v3: a session's chat as a card per Prompt, with every reply inside it

Chat v3 draws `session.messages` (`core/Session/Chat/readme.md`): one card per Prompt, in the chat list's own order, with the Replies that answer it (found by `re.to`, a sentence id of that Prompt) drawn inside. It never writes and never reshapes a message. It is the one chat view ([views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md) step 1 of 6; **step 2 landed, 2026-11-01:** [`../v2/`](../v2/readme.md) is now `class ChatV2 extends ChatV3`). Pick it as **V3** in the chat version dropdown; V1 stays the default.

Try it: [/framework/ext/Chat/v3/](/framework/ext/Chat/v3/) draws [fixture/messages-session.jsonl](fixture/messages-session.jsonl) (a copy of a real voice session, `session.messages`-shaped); `?src=<url of any session.jsonl>` draws that session, live.

## How it works

- `ChatV3.js`: `class ChatV3 extends JSONL`. Every line is replayed into a real `Session` (`core/Session`) with `replay_line`, the same replay the item tool uses, except V1's own `{chat}`/`{place}` lines (skipped: the real update is the separate `messages`/`sentences` mirror line `ChatWriter` already writes beside them).
- **A card per Prompt**, in the chat list's own order: its title (or, until the AI writes one, its first words, muted — dropped for a short chit-chat Prompt, below), then the body described below. Its Replies (plain markdown text on the left, no avatar, found by `re.to`) and the Tasks/Questions that name its Prompt TASK (through the message Prompt's `prompt` link) sit inside the card. A plain `Message` (a note with no more structure) is its own small card. "show raw" opens the sentences' own raw words, when a `clean` override exists.
- **A card with an icon, a title and content** (`icon`/`title`/`content` on `Message` itself, `core/Session/Chat/readme.md`): `note()` draws them, guarded by [`note_view`](placement.js) so a field-less member never shows the stringified word "undefined". An upgraded message — any Reply or note with `title`/`icon` set on it — draws that same head (`reply()`); content appended to a card (or a `{type:"Ref"}` to another item) redraws it live, found through `card_for()`'s own `.parent` check (a content member's parent is the Message that owns it).
- **The card body:** the AI's cleaned `text` when it exists; until then the dictation itself, in paragraphs (see below), clamped to a few lines with "show all (N words)", under a muted title of its first words. A 6,760-character Prompt had come up as one wall of text.
- **No title when it would just repeat the body** (`ChatV3.redundant_title`, the owner, 2026-11-02): a Prompt with no AI title and no refined text showed the same words twice — the muted first-words title, then the identical one-line body under it ("Hello" over "Hello"). That muted title is now skipped when it is the whole body verbatim, or the Prompt is at most two sentences with no refined version yet. An AI title or refined text always keeps the title; a longer untitled dictation (more than two sentences) still gets the muted first-words title, since there the title is a genuinely useful preview of a body the reader has to open.
- **Paragraphs** ([placement.js](placement.js), `ChatV3.paragraphs`/`PARAGRAPH_GAP_MS`): a new paragraph starts where the gap between two sentences' `at` is a long pause (4000ms default) — not the old "one paragraph per sent chunk, cut every 3 sentences". Pure logic, no DOM, node-testable ([placement.test.mjs](placement.test.mjs)).
- **Every reply** ([placement.js](placement.js), `owning_prompt`): a Reply's Prompt is the one whose `sentences` holds its `re.to`; a reply with no match joins the newest Prompt before it in the list.
- **The reply being written:** V3 follows the session's live wire (`stream()` in `ext/Session/Session.js`, the one V1 reads) and draws the partial reply at the end of the newest card until its settled Reply message arrives.
- **Gray only for unsent words** (the owner, 2026-10-26): a sentence in the file is final, so it is solid at once; the words still being spoken show as a faint draft at the end (`chat-live` window event).
- **Layout** (2026-11-02): a Prompt's `.chat-v3-you` (title, words, "show raw") is the owner's one hugging pill on the right ([`../bubbles.css`](../bubbles.css), shared with V1 and V2); its replies, the reply being written and the task/question nest sit under it, plain on the left. `ChatV3.you()` draws the pill's insides, `you_class()` picks its class (V2 overrides it). A reply carries `data-id` = its message id, so the read-aloud highlight finds its own bubble ([audio/Recite](/framework/audio/Recite/readme.md)).
- **Windowed:** the newest 40 cards, with "show earlier (N)".
- **Live, in place:** a list `add` bubbles with `from` = the list itself (`List extends Item` now, so `get_one` can't tell them apart — `ChatV3.added_member()` resolves the actual member from the line's own `add` payload); a changed Prompt/Reply/Task redraws only the card it touched (`card_for()`).
- **A move keeps its node:** a list `move` delta (`{move:{id, after}}`) is not a redraw: `relocate()` moves the card's existing DOM node to its new place (same node, same text node, so a selection or scroll position inside it survives). An improve (`clean`) refills the card in place. Tests: `ChatV3.test.mjs` (section 9), `Servex/agents/ChatWriter.move.test.mjs`.
- **Per-card link:** each card carries its id, so `#<id>` on the chat's url scrolls to it.
- **Small, overridable methods**, the seam `ChatV2` (its subclass, step 2) builds on: `prompt()`, `reply()`, `marks()` (a no-op hook here — ChatV2 fills it with the ✓/🧠 marks, which live on the Prompt TASK until [views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md) step 3), `paragraph(group, p)` (one paragraph's sentences, joined — ChatV2 draws sentence rows instead, with a Reply beside the one it answers), `trailing_replies(p)` (the Replies drawn after the body, default `replies_of(p)` — ChatV2 drops any it already drew beside a sentence), `clamped_text(p, words, fill)` (the "show all (N words)" clamp wrapper, shared by `dictation()` and ChatV2's sentence rows).

## Where it shows

**V3** in the chat version dropdown of the ✦ sheet and the drawer's AI tab (`ext/drawer/ChatView.js`, one `lew42.sheet.chat_view` choice), and the session page's Chat tab (**Chat v3** chip, `?tab=chat&chat_view=v3`, `ai/AISession/AISessionDetail.js`).

## Open decisions

- **Marks (✓/🧠):** not drawn yet (`marks()` is a no-op); they live on the Prompt TASK until step 3 moves them onto the message.
- **Grouping/summary cards** as an overlay that references Prompts by id: not built.
- **Per-task route:** the `#id` permalink stands in for one.
- **Id scheme** for Prompts is whatever `m-<ms>` already is.
- **A far-off answered Question resurfaces** (ux/Dictate/doc/principles.md, "Questions"): the real card never moves, a small
  reference near the end links back to it (`#id`), `placement.js`'s `far_off_questions` + `ChatV3.refresh_refs()`.
- **KNOWN GAP, found building the line above (ask7, 2026-11-03): a plain field write deep in the task tree (e.g. a
  Question's `answer`, written as `{"<id>":{answer:{…}}}` and routed by `Session.apply_line` to `Task.replay_line`) never
  fires a live "delta" event.** `Task.replay_line`'s per-field loop calls `this.take(key, value)`, which for an un-hooked
  key falls to `Item.put()` — the bare `this.data[key] = value`, not `set_one()` (the one that calls `this.emit("delta",
  …)`). So the Question's own nested row is not refilled by a live write; only a full reload shows the answer on it.
  `ChatV3.refresh_refs()` still resurfaces it correctly, because it re-reads the live tree on every draw/update rather
  than waiting for a dirty event — but the real card looks stale until reload. Fixing `take()`/`replay_line` to emit is a
  core `Item`/`Task` change (affects every Task field, not just Question), out of this ask's fence; left for whoever next
  touches live task-field redraws. `ChatV3.test.mjs` proves the data is right after a reload and documents the gap inline.

## Test

- `placement.test.mjs` (plain node, 24 checks, no browser: `owning_prompt`/`paragraphs` — which now delegates to `paragraph_groups`, exercised through it — against a copy of a real voice session — every Reply lands under the Prompt holding its `re.to`, in list order; a pause starts a paragraph; the fixture file is only ever read; plus `note_view` (ask3-cards-by-id): a plain note's text with no title/icon/content, a card's real title/icon, any unknown `type` guess hydrating as a Message rather than showing "undefined", a Reply upgraded with title/icon): `node placement.test.mjs`.
- `ChatV3.test.mjs` (headless Playwright, 26 checks (section 9: a move keeps its node, an improve patches in place; fixture/move-session.jsonl is its replay copy, used by Servex/agents/ChatWriter.move.test.mjs): card order, nesting, raw toggle, paragraph breaks, live append of a Prompt and a Reply found by `re.to`, no page errors; plus a fresh card's title/icon drawn with no "undefined" anywhere in it, content appended to a card redrawing it live, an upgraded Reply drawing its title): `node ChatV3.test.mjs [base-url] [shots-dir]`. It copies `fixture/messages-session.jsonl` to `fixture/live-v3-*.jsonl` (gitignored) and deletes the copy when done.

`failures.jsonl` here is the page-error log the test run wrote while the draft was built (a since-fixed `scrollIntoView` error); it is a record, kept.
