# The Sessions views: page, cards, templates, grid widths

<!-- merged from session-page-2026-10-09.md (original kept in archive/) -->
## The session page as a live page (owner, 2026-10-09 ~18:35)

Dictated in VS Code tab 7efd07d5. Design input for the page mastermind; generalise every feature to all pages, not just sessions.

### Layers of a page
- A page = a **fixed header** + a **content area that is a live list of sections** (in `page.jsonl`; agents change it through the page tool). Sections may be views, cards or strings; the best data shape is open.
- The chat messages themselves render from `session.jsonl` (fine as is); the layout around them is the page's own list.
- A fill-height session page might be: top toolbar · scrollable chat · dictation footer.

### Dictation belongs in the session
- Today dictation opens from the hamburger as a far-right column (the same as the mobile sheet with Dictate + chat). Instead: a **footer toolbar in the session's chat** with the small AI button (the one that launches the mobile rail). Dictating there **talks to that session**, waking it if dormant.
- Possibly also a **global chat** that knows which session page the owner is looking at, and says whether a message goes to a fresh session or revives this one.

### More detail on the detail page
- **Cache timer**: the VS Code tab shows "57 min", the prompt cache's one-hour window, refreshed by each message. Show that countdown on the session page (not the grid).
- A real header, a **settings menu**.
- **Tabs**, including a **Now** tab: a live screen space where the AI puts whatever is being discussed (what live dictation is meant to become).


---

<!-- merged from session-cards.md (original kept in archive/) -->
## Cards the AI posts to a session page

A session page (`/framework/ai/sessions/<id>/`) shows the live conversation drawn by `ext/Chat`. A card the AI posts appears in that conversation, at its time, as it arrives.

**Design choice.** A session already has its own folder with a `page.jsonl`, written by the `page_add` tool. So a card is one `page_add` call on that page, not a new store (a separate `cards.jsonl` was rejected: a second card system, law 6):

```
page_add(path: "<session folder url>", item: { title: "Merge report", text: "Landed 3 commits", href: "/framework/ai/..." })
```

`AISessionDetail.Cards` (an `ext/JSONL` subclass) streams that file with `live()`; every `{"content":{"add":{title,...}}}` line becomes one bubble through `AISessionConversation.add_card`.

**Open items.** (1) The conversation itself is tailed by a 250 ms range request (`AISessionFollow`), not pushed: the transcript lives outside the repo, so the dev socket cannot watch it; a per-line server push is the real fix. (2) Cards are only found when the session has a folder with a `page.jsonl`. (3) Tool-call runs that straddle two batches show as two short "N tool calls" lines.


---

<!-- merged from templates.md (original kept in archive/) -->
## Which template draws which page

Every page under the Sessions tab is a class that extends `Page`. `page.js` only creates the first one. The detail page also prints its template's name under the session id. How the code is split: [classes](classes.md).

| URL | Template | What it shows |
|---|---|---|
| `/framework/ai/sessions/` | [`AISessionsPage`](../AISessionsPage.js) | The in-flight strip, the grid, the list of every session |
| `/framework/ai/sessions/<id>/` | [`AISessionDetail`](../AISessionDetail.js) | One session: cost, model, tokens, trace. Opens in the right-hand half. |
| `/framework/ai/sessions/doc/` | `AISessionsPage.docs_page()` | The priority list |
| `/framework/ai/sessions/readme/` | `AISessionsPage.docs_page()` | This module's readme |

Every session, whatever its data shape ([patterns](../data/patterns.md)), opens in `AISessionDetail`, never the Inbox.


---

<!-- merged from grid-widths.md (original kept in archive/) -->
## The grid at 1100, 1400, 1600, 1920

The Sessions grid has eight columns and, measured at 13.3px, needs about 1090px. It turns into compact cards when its panel is narrower than 88em (about 1170px). It used to switch at 56em, so at a 1100 or 1400 window it kept the table and scrolled sideways. Checked on 2026-10-09 with headless screenshots at 1100, 1400, 1600 and 1920: the page never scrolls sideways at any of them, and cards show at 1100 and 1400 and the table at 1600 and up. Opening a session halves the list, so it shows cards then too.
