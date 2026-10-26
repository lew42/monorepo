# Chat v3 (rough draft): a session's chat as a plain view over its `tasks` list

Chat v3 draws a session's `tasks` list and nothing else. It never writes, never reshapes a Prompt, and never reads the `{chat}`, `{place}`, `{summary}` or `{refined}` lines Chat v1 uses. It is additive: v1 and the v2 chip are untouched, and v3 sits behind its own **v3** chip, never the default.

Try it: [/framework/ext/Chat/v3/](/framework/ext/Chat/v3/) draws Chat v2's [fixture](../v2/fixture/session.jsonl); `?src=<url of any session.jsonl>` draws that session, live.

## How it works

- `ChatV3.js`: `class ChatV3 extends JSONL`. Every line of the session file that is a task delta (`tasks`, `session`, `start`, `stop`, `decide`, `task`, or a line keyed by an id already in the list) is replayed into a real `Session` (`core/Session`) with `replay_line`, the same replay the item tool uses. Everything else is skipped. The Prompts are drawn as they are: the `raw` chunks, the `paragraphs`, the `replies`.
- **A card per Prompt**, in time order, newest last. Settled: title, then the cleaned text (the smart seat's `text`, else the fast seat's paragraphs, else the raw words), solid. Its replies (🧠) and the Questions and Tasks that name it (`from`, or nested under it) sit inside the card. "show raw" opens the raw chunks, which are append-only and never edited.
- **Moving vs finished:** a Prompt touched by a live line in the last 8 s (`MOVING_MS`, mirrors Servex's `prompt_close_ms`) shows its raw words in light gray and no title; after the quiet moment it re-draws solid. The words still being spoken, before they are sent, show as a faint dashed draft at the end (the composer's mic fires a `chat-live` window event, one line in `ux/Dictate/Widget.js`).
- **Windowed:** the newest 40 cards, with "show earlier (N)" (a 392-card real log stays quick).
- **In place:** a live line redraws only the card it touched. The scroll lock is the drawer's own (`ext/drawer/ChatView.js`).
- **Per-task link:** there is no route per task yet, so each card has a `#<id>` permalink to itself in the chat.

## Where it shows

The **v3** chip beside the **v2** chip in the ✦ sheet and the drawer's AI tab (`ext/drawer/ChatView.js`, one `lew42.sheet.chat_view` choice, "v2" or "v3"), and the session page's Chat tab (**Chat v3** chip, `?tab=chat&chat_view=v3`, `ai/AISession/AISessionDetail.js`).

## Open decisions

- **Per-sentence Prompts vs append:** v3 renders today's shape (new words are appended to the newest Prompt). A Prompt per sentence is not built.
- **Completion rule:** "finished" is a client guess (8 s of quiet). A real rule would be a line written by Servex.
- **Grouping/summary cards** as an overlay that references Prompts by id: not built.
- **Per-task route:** the `#id` permalink stands in for one.
- **Id scheme** for Prompts is whatever `p-<ms>` already is.

## Test

`ChatV3.test.mjs` (headless Playwright, 19 checks: fixture order, titles, solid vs gray, nesting, show raw, live append, raw append-only, windowing on a copy of a real log, the log only appended to): `node ChatV3.test.mjs [base-url] [shots-dir]`. It writes `live-v3-*.jsonl` copies beside the v2 fixture (gitignored) and deletes them.
