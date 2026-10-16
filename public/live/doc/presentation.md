# /live is a one-screen presentation (2026-10-16)

**The rule.** `/live/` shows only what you and the voice agent are discussing right now: your current ask, refined into structure as you talk. No feed, no scrolling log. The voice agent (caller `voice-app`) is its only author, and the page is cleared whenever the topic changes. Agents never post findings, "Heard" cards or summary cards there; their output stays in `task.jsonl`, session logs and module docs.

**The calls the voice agent uses** (through the tunnel, all with `path: "/live/"`):

- Clear the screen (topic change): `page_set` with delta `{"content":{"clear":true}}`
- Show something: `page_add` with item `{"type":"part-card","title":"…","text":"markdown"}` (or `part-heading`, `part-text`)
- Edit a card in place: `page_set` with delta `{"<card id>":{"text":"…"}}`

**How it works.** `clear` is a shared verb of the page delta model, not a /live special: `List.clear()` ([core/List](/framework/core/List/)) removes every member and announces `{"clear":true}`; `PageContent` keeps the page's own code item. The line is appended like any other, so the jsonl history is never deleted. `Live.js` folds the log: the screen is the cards added since the last `clear`, in the order added. The tab keeps the catch-up, reconnect and self-reload behaviour described in [notes.md](notes.md).

**Tradeoff.** A cleared topic is gone from the screen but stays in `page.jsonl`; reading `page_read` replays the log and ignores everything before the last clear (after a Servex restart, which loads the new replay in `Servex/agents/page_tools.js`).
