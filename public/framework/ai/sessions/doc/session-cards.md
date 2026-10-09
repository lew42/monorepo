# Cards the AI posts to a session page

A session page (`/framework/ai/sessions/<id>/`) shows the live conversation, and beside it a "Cards the AI posted here" box.

**Design choice.** A session already has its own folder with a `page.jsonl` (the same card stream the AI board reads, written through `page_add` / `page_note`). So a card for a session is one line in that file, not a new store:

```json
{"card":{"title":"Merge report","text":"Landed 3 commits","href":"/framework/ai/2026-10-09/session-detail-live/"}}
```

`AISessionDetail.load_cards` reads those lines; `render_cards` draws them. Alternative rejected: a new `cards.jsonl` per session (a second card system, law 6).

**Not yet:** cards are read once at load, not tailed live, and they sit in the side column, not inline at their time in the conversation. Next step: tail `page.jsonl` like `AISessionFollow` tails the transcript, and merge cards into the conversation by timestamp.
