# The Now card's own sections stopped showing ("nothing written")

## The ask (owner, 2026-10-03, ~4:55 pm)
> We had a whole bunch of stuff on this Now card before I went to the soccer game; now the Now card says "nothing written". Did something happen?

## What's known (vscode-mastermind, verified)
- **The data is intact:** `public/framework/ai/sessions/2026/10/03/cards/now/page.jsonl` has 79 lines, nothing removed.
- **Commit 46883a90** (subcard-columns, "fix the content()/content-List name collision") redirects every `{"content": …}` line in a Card into `this.dashboard` (a separate List) so it doesn't clobber `Card.content()`. Since then the Overview shows only the summary, the Delivered/To do counts and the Topics list; the dashboard rows (`ai`, `page`, `servex`, `how`, `widths-colors-lab`, the `20b7afb1…` Topics note) don't appear, and the rail preview reads "nothing written".
- **Nested edit lines no longer reach their items:** lines like `{"ai": {"text": …}}`, `{"talking": {…}}` resolve through `get(name)`, which searches the `content` list, not `dashboard`, so they now land as plain page data (and could collide with real fields: `page`, `how`).

## Do
1. Draw the dashboard rows on the Overview again, above Topics, with the reference rows as dark context cards (commit afd8ff57's look).
2. Make nested id edits find items in `dashboard` too (or name the list consistently so `get()` finds it). Replay the Now card and confirm every id's latest text shows.
3. The rail preview shows the card's newest meaningful sentence, never "nothing written" when sections exist.
4. Screenshot before/after at 1920; test one `page_add` and one nested `{"<id>": {"text": …}}` edit appearing live.

## Fence
ai2/card.js, ux/Card/, ai2/rail.js (the preview line only), this task dir. Model: Sonnet. Budget $5.
