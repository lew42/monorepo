# InboxRail — history and reasons

## System overview (lines 7-42)

THE BIG RAIL — `Inbox.Rail` (restructured 2026-10-02; this file still defines the class, now named plain `Rail`, and `Inbox.js` imports it to assign `Inbox.Rail = Rail` — chosen over moving this whole body into `Inbox.js` so this file never has to import that one back (an import cycle). The old name, `InboxRail`, is a one-release re-export from `Inbox.js`; see this folder's readme.md, "Architecture", for the full before/after).

A list of previews on the left, the one you picked open on the right, and nothing in the list ever jumps (the owner, 2026-09-22, 2026-09-30: "it is a persistent navigation… it shouldn't jump when you click on an item").

This is the base class. The AI page and AI 2 both draw `AIRail` (ai2/rail.js), which extends this (`class AIRail extends Inbox.Rail`) with the usage meters, "+ New card" and the AI data. Any other page can extend it the same way: override `source()` to say what the rows are, and the rest comes with it.

```javascript
const rail = new Rail({ page: this, items: [...] }).mount();   // inside content()
```

WHAT YOU GET
- three columns: the rail, the detail (`page.$pages`, where a row's page opens) and a sub column (`page.$sub`, where a sub-page opens beside it);
- the rail is a FLUSH STACK of row previews (rows touching, no gaps), resizable by its grip, and it scrolls by itself;
- filters: Needs you (a chip), search, notes, archived, and a SCORE FLOOR (`?min=`, default 90 — the Inbox shows only rows that score at least that; 0 is the Log);
- read/unread (the row's dot), archive (the row's ×) and "clear all";
- THE ORDER NEVER MOVES ON ITS OWN while you look: an existing row that changed is counted on an "N updated ↑" pill, and only a press (or a reload) re-sorts.

THE SELECTION IS THE URL. A row is a plain `<a>` to its page; the Router navigates it, marks it `.active`, and Back, a reload and a pasted link all work. A click swaps only the detail column: no row here is rebuilt, re-sorted or scrolled by a click.

Every part is a method, so a subclass changes one part and keeps the rest. Docs: ux/Inbox/readme.md · see one running at /framework/ux/Inbox/.

## Stylesheet location (line 106)

`bleed`: the whole region, never the prose track.

## Rail naming (line 137)

The rail names itself (the owner, 2026-09-25: it "identifies this as the navigation rail").

## AIRail subclass customization points (lines 139-141)

`head_extra()` — AIRail: the usage meters
`actions()` — AIRail: "+ New card"
`toggles()` — AIRail: auto-transcribe

## Needs You filter design (lines 143-144)

NEEDS YOU IS A FILTER, not a tab (the owner, 2026-09-30). Its state is the url (`?review=1`), so a reload keeps it on; its badge counts what is waiting.

## Category chips design (lines 159-160)

BLOCKING / REVIEW / FYI — three chips; click one to show only that kind, click again for all. State is the url (`?cat=`). FYI shows rows under the floor, since that is where they live.

## Search behavior (line 187)

SEARCH — title and text, archived rows included ("find this, wherever it is").

## Score floor design (lines 194-196)

THE SCORE FLOOR (the owner, 2026-09-30: "inbox is only… priority… and above"; then inbox zero: 90 and up). A number you can move; the url keeps it (`?min=30`). The Inbox is this rail at 90, the Log the same rail at 0.

## Pill positioning (line 208)

The box the "N new" pill floats over — in the flow, its own arrival pushed every row down.

## Row layout design (lines 213-218)

STICKY, INSIDE the scrolling box, so it pushes the row below it down rather than covering it (review finding 3, 2026-09-30).

ONE BOX, ROWS TOUCHING: the flush stack (design/layout/doc/rules.md). The pinned row sits on top of it, flush too, so the two read as one list.

## Clear all button (line 234)

INBOX ZERO: archive every row shown right now, in one press.

## Subclass customization: footer (line 240)

`foot_words()` — AIRail: "views"

## The third column (lines 262-264)

THE THIRD COLUMN: a sub-page opens here, beside the page that owns it. A page sets its own `$pages = shell.$sub` for that, and Inbox.css grows the shell to three columns while one is open (`:has()`), with no state of ours to get stale.

## Size method (line 267)

Returns the width it applied, which `grip` remembers — clamped, so no column hides.

## Data sources (line 279)

The base just paints `items`; a subclass subscribes to its streams.

## Source method (lines 287-288)

The rows, newest data first or not — `paint()` sorts. Override this. `.archived` on the returned array is the archived pile (searched, and shown greyed on "archived").

## Decorate method (line 295)

Before sorting: mark each row read or unread (the dot). AIRail adds the scores.

## Prepare method (line 297)

After sorting, on every row (archived too): anything the face draws.

## Order method (line 299)

Newest first.

## Filter seams (lines 303-307)

`pool(list)` — the rows that can be listed at all
`pool_archived(list)` — the archived rows that can
`resolved(it)` — left by itself (AIRail: rules.js)
`needs(it)` — waiting on you
`exempt(it)` — never under the floor (AIRail: the Live row)
`haystack(it)` — title and text for search

## Visible rows (line 310)

The rows on screen right now, in data order.

## Floored state (line 327)

Is the floor on right now? Off while searching, showing archived, or at 0.

## Subclass customization: archives (line 339)

`archived_soon()` — after an archive: AIRail asks its folders to refresh

## Quiet list state (lines 343-344)

THE LIST IS QUIET when you are at its top and not pointing at it — the one test a new row has to pass to enter on its own.

## Paint timing note (line 364)

Everything already on screen redraws in place, wherever it sits.

## Paint optimization (lines 370-371)

Many answers arriving at once ask for one paint, not one each (a card's cost answering for each of 300 rows once meant 300 full paints, 2.6s at load).

## Flush method (lines 385-386)

Let the waiting rows in. A row APPEARING or LEAVING forces a reorder (it has no old place to keep); an existing row merely moving waits behind the "updated" pill.

## Subclass: extra entries (line 408)

Rows a subclass draws itself (AIRail: groups, real pages), then the one order.

## Extra entries API (line 410)

`[id, at, el]` for each of those extra rows, so `order_rows()` sorts them in.

## Order reordering design (lines 413-416)

ONE TIMELINE, NEWEST FIRST — BUT THE ORDER NEVER MOVES WHILE YOU ARE LOOKING (the owner, 2026-09-30: "the rail reorders live and jumps"). A reorder is applied only on the first paint (and a short settle after mount), when `force`d (a row appeared or left, or the pill was pressed). Anything else is counted on the "N updated ↑" pill.

## Count note (line 465)

`count_note()` — AIRail: "· the assistant is off"

## Row href (line 469)

A row's address: its page under mine, carrying a floor that is not the Inbox's own.

## Row anchor (line 473)

A ROW IS AN ANCHOR — no click handler: the Router navigates it and marks it.

## Row refill optimization (lines 480-481 signature note already kept)

The signature is the row's WHOLE record, never a hand-picked list of fields: the first build listed them, forgot one, and its feature silently never rendered.

## Row face (line 496)

THE FACE — what one row shows: its head, one quiet line, then anything a subclass adds.

## Subclass customization: face (line 502)

`face_extra(it)` — AIRail: the progress meter and "what happened"

## Row head (lines 504-505)

The head: the unread dot (a button: press it to toggle), the icon, the score, the title, when, and the archive ×. `it.dot === false` draws no dot at all.

## Toggle read button (line 508)

No toggle (the AI's Live row): a plain dot, so a click on it still opens the row.

## Subclass: title text (line 521)

`title_text()` — AIRail: turn #Page and /path into links (ext/Mention)

## Time formatting (lines 523-525)

SHORT, so the title keeps the row's width: "10:04 PM" today, "Sep 28" this year, "Sep 28, 2025" before. "Sep 28, 2:20 PM" squeezed long titles to one word a line at 1920 (review, 2026-09-30). The whole date and time is the hover (`when_full()`).

## Row buttons closure pattern (lines 538-539)

The row's two buttons — built once per record, so a click during a redraw never reaches a stale closure. Both act at once and redraw just this row.

## Archive closure pattern (lines 548-549)

The row LEAVES — `archived_pending` keeps it out however often the data rebuilds before the write lands.

## Clear all batch (lines 574-575)

"CLEAR ALL" — every row shown right now, through the same write the × makes, a batch at a time so neither the page nor the server freezes on hundreds.

## Needs changed (line 591)

What waits on you changed: the chip's badge, and the filter if it is on.

## Open detail page (line 605)

A detail page on screen asks to be redrawn from the list: `{ id, draw(it) }`.

## Set minimum floor (line 611)

Change the floor: the input, the url (`?min=`, dropped at the default) and the rows.

## Tab floor setup (lines 621-623)

A tab says which floor it means — the Inbox 90, the Log 0 — and what the rail is called there. A `?min=` in the url wins. Read on the next tick: the Router pushes the new url only after the page activates.
