# Minion brief: the assistant-layers design page

Load the `minion` skill first, then the `new-page` and `layout` skills.

## The owner's words

"I'd like each card to have its own fast assistant instance. [...] We don't want one fast assistant managing all the cards, because it gets context bloat and does way too much. [...] each should be able to talk to a persistent mastermind, like the Servex mastermind: a higher-level systems architect auditing all the processes. And maybe a master assistant, less of a mastermind and more of a cross-card orchestrator [...] they need to use their own identifier when talking, so it's clear whether it's me or one of them, and who."

The whole prompt is in [requirements.md](requirements.md). The design you are presenting is [doc/design.md](doc/design.md). Read it start to finish: it is the content, and you invent nothing beyond it.

## Deliverables

1. `public/framework/ai/2026-09-24/assistant-layers/page.js`: a one-screen page. Copy the shape of `public/framework/ai/2026-09-24/concurrency/page.js` exactly: its imports, its layout comment block, its `route()` helper for .md links, and how it builds the picture from boxes with `div`/`.style()`. Title "Assistant layers", icon `groups`.
   - One bold lead sentence: you talk on any card, and that card's own assistant answers; one master assistant watches all cards; only the Servex mastermind starts work.
   - **The picture** (the main thing): boxes and arrows. Top row: "You" speaking onto three cards (Card A, Card B, Card C). Under each card, its own box `assistant-<card>`. A wide box beside or below them, "master assistant (hears every card, launches nothing)", with arrows from all three card assistants. One box "mastermind-servex (the only launcher)" with arrows in from the card assistants and the master assistant. Under it a "claims list" box (a lock), then two task-mastermind boxes, each with two small minion boxes. Label each arrow with a word or two ("asks", "hears", "launches once"). Use only existing utilities plus `.style()`; no new CSS class names; no template literals in the file.
   - Under the picture, a small wall of four short topic previews, one sentence each, each linking to `doc/design.md` via `route("doc/design.md")`: "One assistant per card", "Starting work, exactly once", "Who may message whom", "Keeping every turn short".
   - A `md.details` fold holding the who-may-message-whom table from design.md, as a simple table.
2. `doc/` already exists. Do not edit `doc/design.md`.
3. Add `"assistant-layers"` to the `children:` array in `public/framework/ai/2026-09-24/page.js` (one edit, keep every other entry).

## Fence

You may write only: `public/framework/ai/2026-09-24/assistant-layers/page.js` and the one `children:` edit in `public/framework/ai/2026-09-24/page.js`. Nothing else. Other agents are editing that day page.js: re-read it right before your edit.

The site is live: wrap your writes in `node Server/hold.mjs on "minion-al-page — design page"` and `node Server/hold.mjs off "minion-al-page"`.

## Done means

- `http://monorepo.localhost/framework/ai/2026-09-24/assistant-layers/` loads with zero console errors and zero failed requests. Check it with the `site` MCP `shot` tool at 1920 wide and look at the screenshot: the picture must be readable and fit mostly above the fold.
- The day page `http://monorepo.localhost/framework/ai/2026-09-24/` still loads and links to it.
- End your turn with one or two sentences: the url, and anything you could not do. Length budget: page.js under about 180 lines.
- Never write the owner's name.
