# Ranking System

## Overview

RANKING lets the owner drag a list into the order they want, and that order is written as one line in the task's `task.jsonl`. The list keeps its existing shape — a card stays a card, a row stays a row — with only a grip added to each item and the order they are drawn in.

Usage:
```
const rank = new Ranking({ m, list: "asks" });     // m is the TaskJSONL
items = rank.sort(items);                          // the file's order
div.c("ai-asks", $wall => {
    const band = rank.band($wall);
    items.forEach(item => div.c("ai-ask", $card => band.grip($card, item.id)));
});
```

A list may be drawn in several **bands** (e.g., the Asks tab draws one grid per topic). Each band is its own drop zone — reorder inside a topic, not across. A drop writes the whole list's order, band after band, so one line always says everything.

## Wire and Safety

The writer does NOT apply its own line. The append goes up the dev socket and comes back off the wire like anybody else's, so there is one code path and the server is the only orderer (see `/layouts/browse/verdicts.js`). `expect()` is the safety net.

The WIRE timeout is 2000ms (measured at 9ms real round trip via `/imagine/stream/`).

Off the dev server there is no socket, so no grip is drawn at all. The order still renders because it lives in the file. See `doc/ranking.md` for details.

## Timestamp

The `stamp()` function returns an ISO timestamp carrying the reader's own offset, so a line says when and where it was written. `toISOString()` would silently move it to UTC.

## Bands and Drops

A Band is a box of rows you can drag within, implemented as a `Draggable` with `handle: false` — meaning a drop target, never a grip. It registers the box so a dragged row can find it.

The `before()` method determines where a drop lands: in a column, it is the first row whose vertical midpoint the cursor has not reached. In a wrapping grid it is reading order — a card is "after" the cursor if it starts on a lower line, or shares the cursor's line and its own midpoint is to the right.

## Drag and Grip Details

A dedicated grip is used (never the whole row) because `Draggable.grab()` calls `start()` on every pointerdown with no movement threshold — a whole-row handle hides and ghosts the row on a plain click, and both an ask card and a decision row open on click. `ux/Tree` and `ext/Panel` landed on the grip for the same reason.

The click that follows a drag still bubbles, so a drop on a card whose body opens a sheet would open the sheet too. This is handled via `e.stopPropagation()` on the grip.

Appending to the box is not the same as putting it last — the Asks wall keeps its detail sheet as the box's own last child, so a card appended after it would sit below an invisible panel. Land after the last row instead.

The drag ghost hugs its own ink. `Sortable` clones the row at its real width — for a full-width decision row that is a bar the width of the page sliding around under the cursor (556px measured in `ux/Tree`). Limited to 24em here for readability.

## Ranking.Drag

You can only reorder inside a band, not across them. A drop is only valid over the band the row already belongs to. Dragging an ask into another topic would be a re-topic (an edit of the ask), not an order change.
