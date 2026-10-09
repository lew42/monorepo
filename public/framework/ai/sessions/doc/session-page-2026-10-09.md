# The session page as a live page (owner, 2026-10-09 ~18:35)

Dictated in VS Code tab 7efd07d5. Design input for the page mastermind; generalise every feature to all pages, not just sessions.

## Layers of a page
- A page = a **fixed header** + a **content area that is a live list of sections** (in `page.jsonl`; agents change it through the page tool). Sections may be views, cards or strings; the best data shape is open.
- The chat messages themselves render from `session.jsonl` (fine as is); the layout around them is the page's own list.
- A fill-height session page might be: top toolbar · scrollable chat · dictation footer.

## Dictation belongs in the session
- Today dictation opens from the hamburger as a far-right column (the same as the mobile sheet with Dictate + chat). Instead: a **footer toolbar in the session's chat** with the small AI button (the one that launches the mobile rail). Dictating there **talks to that session**, waking it if dormant.
- Possibly also a **global chat** that knows which session page the owner is looking at, and says whether a message goes to a fresh session or revives this one.

## More detail on the detail page
- **Cache timer**: the VS Code tab shows "57 min", the prompt cache's one-hour window, refreshed by each message. Show that countdown on the session page (not the grid).
- A real header, a **settings menu**.
- **Tabs**, including a **Now** tab: a live screen space where the AI puts whatever is being discussed (what live dictation is meant to become).
