# Chat v3: a session's chat as a card per Prompt, with every reply inside it

Chat v3 draws a session's `tasks` list, plus the replies written as old-style `{chat}` lines. It never writes and never reshapes a Prompt. It ignores the `{place}`, `{summary}` and `{refined}` lines Chat v1 uses. Pick it as **V3** in the chat version dropdown; V1 stays the default.

Try it: [/framework/ext/Chat/v3/](/framework/ext/Chat/v3/) draws Chat v2's [fixture](../v2/fixture/session.jsonl); `?src=<url of any session.jsonl>` draws that session, live.

## How it works

- `ChatV3.js`: `class ChatV3 extends JSONL`. Every line of the session file that is a task delta (`tasks`, `session`, `start`, `stop`, `decide`, `task`, or a line keyed by an id already in the list) is replayed into a real `Session` (`core/Session`) with `replay_line`, the same replay the item tool uses. Everything else is skipped. The Prompts are drawn as they are: the `raw` chunks, the `paragraphs`, the `replies`.
- **A card per Prompt**, in time order, newest last: its title, then the cleaned text (the smart seat's `text`, else the paragraphs code writes as the owner speaks, else the raw words). Its replies (🧠, markdown) and the Questions and Tasks that name it (`from`, or nested under it) sit inside the card. "show raw" opens the raw chunks, which are append-only and never edited.
- **The card body** (2026-11-01): the AI's cleaned `text` when it exists; until then the dictation itself (the owner still needs the raw words), one paragraph per sent chunk, a long chunk cut every three sentences, clamped to a few lines with "show all (N words)", under a muted title of its first words. A 6,760-character Prompt had come up as one wall of text.
- **Every reply** (`chat_line()`, 2026-11-01): most smart-seat replies are `{chat}` lines, not Prompt replies. An owner `{chat}` line carries `prompt`; a reply carries `re` = that owner line's `at`, so the reply joins that Prompt's card (a reply with no known `re` joins the newest Prompt). A `{chat}` reply with the same text as one of the Prompt's own replies is drawn once.
- **The reply being written:** V3 follows the session's live wire (`stream()` in `ext/Session/Session.js`, the one V1 reads) and draws the partial reply at the end of the newest card until its settled line arrives.
- **Gray only for unsent words** (the owner, 2026-10-26: "light gray to black reserved only for the whisper finalization"): a sentence in the file is final, so it is solid at once. The words still being spoken show as a faint dashed draft at the end (the composer's mic fires a `chat-live` window event, one line in `ux/Dictate/Widget.js`).
- **Windowed:** the newest 40 cards, with "show earlier (N)" (a 392-card real log stays quick).
- **In place:** a live line redraws only the card it touched. The scroll lock is the drawer's own (`ext/drawer/ChatView.js`).
- **Per-task link:** there is no route per task yet; each card carries its id, so `#<id>` on the chat's url scrolls to it. The link icon is gone (the owner, 2026-11-01: it was not clear where it went).

## Where it shows

**V3** in the chat version dropdown of the ✦ sheet and the drawer's AI tab (`ext/drawer/ChatView.js`, one `lew42.sheet.chat_view` choice), and the session page's Chat tab (**Chat v3** chip, `?tab=chat&chat_view=v3`, `ai/AISession/AISessionDetail.js`).

## Open decisions

- **Per-sentence Prompts vs append:** v3 renders today's shape (new words are appended to the newest Prompt). A Prompt per sentence is not built.
- **Grouping/summary cards** as an overlay that references Prompts by id: not built.
- **Per-task route:** the `#id` permalink stands in for one.
- **Id scheme** for Prompts is whatever `p-<ms>` already is.

## Test

`ChatV3.test.mjs` (headless Playwright, 23 checks: fixture order, titles, written words solid, nesting, show raw, live append, old-style `{chat}` replies placed and deduped, replies on a copy of a real log, windowing, the log only appended to): `node ChatV3.test.mjs [base-url] [shots-dir]`. It writes `live-v3-*.jsonl` copies beside the v2 fixture (gitignored) and deletes them.

`failures.jsonl` here is the page-error log the test run wrote while the draft was built (a since-fixed `scrollIntoView` error); it is a record, kept.
