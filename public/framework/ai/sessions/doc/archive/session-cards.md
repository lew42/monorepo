# Cards the AI posts to a session page

A session page (`/framework/ai/sessions/<id>/`) shows the live conversation drawn by `ext/Chat`. A card the AI posts appears in that conversation, at its time, as it arrives.

**Design choice.** A session already has its own folder with a `page.jsonl`, written by the `page_add` tool. So a card is one `page_add` call on that page, not a new store (a separate `cards.jsonl` was rejected: a second card system, law 6):

```
page_add(path: "<session folder url>", item: { title: "Merge report", text: "Landed 3 commits", href: "/framework/ai/..." })
```

`AISessionDetail.Cards` (an `ext/JSONL` subclass) streams that file with `live()`; every `{"content":{"add":{title,...}}}` line becomes one bubble through `AISessionConversation.add_card`.

**Open items.** (1) The conversation itself is tailed by a 250 ms range request (`AISessionFollow`), not pushed: the transcript lives outside the repo, so the dev socket cannot watch it; a per-line server push is the real fix. (2) Cards are only found when the session has a folder with a `page.jsonl`. (3) Tool-call runs that straddle two batches show as two short "N tool calls" lines.

**The same file reshapes the page** (2026-10-09, page tool): a `tab` line adds a tab (the conversation becomes the first tab, "Conversation"), and the six layout words change the layout, live. Only those shape keys apply to the page (`Page.overlay()`); everything else in the file stays card data. Classes and decisions: `core/Page/doc/architecture.md`.
