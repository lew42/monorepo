# Card folders — how AI 2 reads and writes them

A card is a folder under `public/framework/ai/`, holding one append-only `page.jsonl`. Its id
is its path there: `2026/09/24/fix-the-sidebar`. A sub-card is a folder inside it, to any
depth. Servex's `Cards` (`Servex/cards/`) is the only thing that writes these folders; its
readme defines every line.

## The address is the folder

| On AI 2 | The folder it reads |
|---|---|
| `/framework/ai2/2026/` | a year — lists its months |
| `/framework/ai2/2026/09/24/` | a day — lists its cards |
| `/framework/ai2/2026/09/24/fix-the-sidebar/` | a card |
| `/framework/ai2/2026/09/24/fix-the-sidebar/wider/` | a sub-card, in the third column |
| `/framework/ai2/view/open/` | a view: `today`, `open`, `all`, or any tag |
| `/framework/ai2/topic-mufuomsy/` | an old id — Servex resolves it and the url becomes the folder's |

## card.js is the card's page

Line 1 of every card's `page.jsonl` says `"class": "/framework/ai2/card.js"`, so core's
`Page.jsonl()` builds a `Card`, and every later line is `card.set(line)`. A key that names a
method calls it; anything else is kept as data. The methods are the vocabulary:

- `message(m)` — anything said or that happened; it lands in the chat at the bottom.
- `prompt(p)` — the owner's own words. A later line with the same `id` is merged in.
- `type(t)`, `tags(t)`, `status(s)` — the latest line wins.
- `attach(a)`, `detach(a)`, `legacy(id)`, `cites(refs)`.
- `file` is core's own: `{"file": "wider/page.jsonl"}` lists a sub-card.

A new kind of line is a new method on `Card`. Nothing else has to change.

## What the page writes, and where

All writes go through Servex, never to a file directly:

- **+ New card** → `POST /card/create {title, by: "owner"}`, then opens it listening.
- **+ sub-card** → `POST /card/create {parent: <card id>, title}`.
- **The type picker** → `POST /card/append?id=` with `{"type": "question"}`.
- **clear** → `{"status": "archived"}`. Nothing is deleted.
- **A sentence typed or spoken into a card** → one prompt record,
  `{"prompt": {"raw", "text", "via", "on", "url"}}`, on the card. The same sentence still goes
  to `/log/prompts` too, because that is what the fast assistant reads.

## When Servex is down

The list falls back to `board.jsonl`, `+ New card` falls back to a board card, and an old id
opens the old way. A folder card's own page still loads, because it reads its `page.jsonl`
from the dev server, not from Servex; only its writes wait for Servex.

## Past problems

- **Keep the file name lowercase: `card.js`.** Windows and git (`core.ignorecase`) treat
  `card.js` and `Card.js` as one file, but the browser does not: `./Card.js` and `./card.js`
  are two urls, so the same file loads as two modules with two `Card` classes, and a
  case-sensitive host 404s the one git does not have. The class file was written as `Card.js`
  once and overwrote the old `card.js`; the old faces are `faces.js` now.
- **`?servex=` used to vanish on the first click**, and a test page then posted into the
  real Servex. `inbox.js` now reads it once when the page loads and keeps it.
- **A sub-card list drawn while you type a title is held**, so a live line cannot tear the
  input down under you. It redraws as soon as the sub-card is made.
