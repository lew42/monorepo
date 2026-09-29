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

- `{"type": "refined", "text", …}` is **not** a retype: `Card.set()` keeps it whole as the
  card's summary (latest wins). Through core's `set()` it would have made the card a
  "refined" and overwritten the card's own `text` and `by`.

## The tabs (2026-09-25)

A top-level card draws its tabs with `ext/tabs`' own classes (not `Page.tabs()`, which routes
each tab to a child url — a card's children are its requests). A request has no tabs.

- **Overview** — the head, the bar and cost, what the card is, its summary (the latest
  refined reading; else, if the card has no words of its own, the first thing you said into
  it), and one line: "13 requests, 0 done — see Tasks".
- **Tasks** — the requests, and below them the task pages of the agents working on them.
  Shown only when it has something in it.
- **Activity** (always there) — every line in the card and its requests, newest first; the
  lines you have not seen are marked "new".

**Each tab is a url.** Overview is the card's own address; Tasks and Activity are child pages,
`…/<card id>/tasks/` and `…/<card id>/activity/` (`card.js` `tab_route()`), the same shape as a
tiny-tab card's `…/now/usage/`. So a reload and Back land on the tab, and nothing is kept in
localStorage. A request with the same name as a tab keeps the name.

**What happened, in the rail** (`activity.js`). A row whose newest line is newer than
`ai2-seen:<card id>` shows one line under its preview: who, then what. Clicking it opens
Activity; opening Activity stores the card's newest time there, and the line goes. A card
never opened counts as seen up to a day ago.

**Grouping.** Append `{"group": "Dictation box"}` to a request's own `page.jsonl` and the
Tasks tab puts it under that heading; the latest line wins. Groups show in the order they
first appear; requests with no group go last, under "Other"; a card with no groups shows
one flat list. The line is read from each request's own file, so it shows the next time
you open the card. ⚠ It is the same key `groups.js` uses to file a card into a
`groups.json` group; a heading word that is not a group id there files nothing.

**Delivered.** A request counts as delivered when its latest `status` is done, or a
`manager-…` message in its log begins "Landed" or "Done", or one of its `item` lines is done.
A row's title is the sub-card's own `title` line, never its slug. A sub-card nothing was
asked in (no prompt, message, item or ask type — System design's topic stubs) is a
**topic**: listed, never counted as to do. A group card's own task pages count beside its requests. The
same read that finds its group decides it. A card with requests and no `item` lines of its
own is summed up by them on Overview: Delivered · To do · All, then each group with its
requests ticked (overview-fix, 2026-09-25: a day of landed work had read "0 Delivered").

## What the page writes, and where

All writes go through Servex, never to a file directly:

- **+ New card** → `POST /card/create {title, by: "owner"}`, then opens it listening.
- **+ request** → `POST /card/create {parent: <card id>, title}`.
- **The type picker** → `POST /card/append?id=` with `{"type": "question"}`.
- **clear** → `{"status": "archived"}`. Nothing is deleted.
- **A sentence typed or spoken into a card** → one prompt record,
  `{"prompt": {"raw", "text", "via", "on", "url"}}`, on the card. The same sentence still goes
  to `/log/prompts` too, because that is what the fast assistant reads.

## A card's own content.js

A card can draw anything. Put a `content.js` in the card's folder, import any modules from the
site in it, and render them. One line in the card's `page.jsonl` places it:

```js
{"place": {"module": "content.js"}}
```

`core/Page/Log.js` `draw_module()` imports the file when the card draws. If its default export
has a `render` method (a View), it is constructed as `new Default({ page, ...data })`. Anything
else is called as `content(page, box, data)`. `data` is every other key on the `place` line. The
box is already captured, so factory calls inside the function land in the card:

```js
import files from "/framework/ext/files/files.js";
import Quotation from "/framework/ux/Content/Quotation/Quotation.js";

export default function content(page, box, data){
	new Quotation({ text: "Each card could have a content.js…" });
	files(import.meta, "content.js page.jsonl", { route: false });
}
```

Import by root-absolute path (`/framework/…`), and resolve the card's own files against
`import.meta`, never the document. The example card is
[`2026/09/28/example-a-card-s-content-js`](/framework/ai2/2026/09/28/example-a-card-s-content-js/): its
[`content.js`](/framework/ai/2026/09/28/example-a-card-s-content-js/content.js) shows the owner's words as a
Quotation and the card's own folder as a file browser. A card with `{"layout": "tabs"}` gets each
placed module as its own tab, named after the file.

## The workspace view (an experiment, off by default)

Add `?view=workspace` to any AI 2 url, or press **workspace** at the top of the rail. An opened
card's detail area then becomes a Floating page (`floating.js`): the card's tabs and its
sub-cards are a left nav, and the page sits centred beside it, capped at 64em. The chat column
stays where it is. A request (a sub-card) keeps its usual look. Press **workspace** again to
turn it off. With it off, nothing on the page changes. Why it works this way:
[`decisions.md`](./decisions.md#the-workspace-view-an-experiment-behind-a-url-switch-2026-09-28).

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
