# live: /live/ becomes a feed of preview cards

The owner asked for this by voice on 2026-10-16. It is top priority. Their words are below, condensed.

## The look
- White cards on a light gray page background.
- Minimal page padding left and right, just enough for the gray to show the card edges.
- Small border radius.
- More vertical gap between cards (on mobile there is vertical room).
- Card padding: modest left and right, a bit more top and bottom.

## Order and navigation
- Order: reverse chronological, newest card on top, so pull-to-refresh lands on the newest card.
- Each card on the feed is a PREVIEW: just the essence, usually only the title (for example "Templating", "Page tools").
- Tapping a card switches the view to that card's FULL content. This is navigational: it gets its own URL, so back and reload work.

## Data
- Items in the content list can be subpages themselves, each with its own preview and full render.
- Use the existing page.preview pattern (look at public/framework/core/Page/Previews.js, Page.class.js and PageWeight.js). Do NOT invent a parallel one.
- Keep the data as the content list in public/live/page.jsonl. This is a render change, not a data change, except for whatever field marks preview versus full.
- Respect "after" ordering if that is cheap; otherwise ignore it.
- Retitle the previews of the 2 current cards to "Templating" and "Page tools". Write those lines through the page tools (page_set / page_add), never by hand-editing the JSON.
- Leave the lost backticks in the Fresh slate / past-work card text alone.

## Fence
- Edit public/live/ only (Live.js, Live.css, page.js, page.jsonl through the page tools, readme.md, doc/).
- Never restart Servex or the dev server.
- Never drive the owner's browser tabs. Check the page headless (check_page or a Playwright shot) at 400 and 1200 widths.
- Hold live reloads around batches of writes: node Server/hold.mjs on/off.
- Commit each working step with clear messages, ending each message with the line `Co-Authored-By: Claude Sonnet <noreply@anthropic.com>`.
- Never write the owner's name anywhere.

## Report back (in your final message and as a log line)
1. Which render method you used for preview and full (class and method names, and file).
2. One exact page_add example line for a new card that has a preview and full content.
