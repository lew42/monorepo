**Ranking** — the grip that drags a card or a row into the owner's order, and the
one line that records it.

The list keeps the shape it already had. A card stays a card and a row stays a row;
all that is added is a grip on each one and the order they are drawn in:

```js
const rank = new Ranking({ m, list: "asks" });     // m is the TaskJSONL
items = rank.sort(items);                          // the file's order
div.c("ai-asks", $wall => {
    const band = rank.band($wall);
    items.forEach(item => div.c("ai-ask", $card => band.grip($card, item.id)));
});
```

A list may be drawn in several **bands** (the Asks wall is one grid per topic).
Each band is its own drop zone — you reorder inside a topic, not across topics —
and a drop writes the whole list's order, band after band, so one line always says
everything.

`Ranking.Drag` stands on [`ext/Draggable`](/framework/ext/Draggable/)'s `Sortable`:
pointer capture, the ghost, the placeholder, Escape and the `.drag-source` display
fix are the already-debugged half, kept whole. Only **where a drop lands** is
replaced — `Sortable` commits through `item.move()` against a `core/Item` tree, and
a ranked list has ids and a file instead. `ux/Tree.Drag` overrides the same method
for the same reason.

⚠ **The writer does not apply its own line.** The append goes up the dev socket and
comes back off the wire; `expect()` applies locally after two seconds and says so in
the console, because a drop that visibly did nothing is the worst failure here.

⚠ **A grip, never the whole row.** `Draggable.grab()` starts on the first
`pointerdown` with no movement threshold, and both an ask card and a decision row
open on a click.

⚠ `Band.place()` lands a row after the last ROW, not at the end of the box: the Asks
wall keeps its detail sheet as that box's own last child.

`stamp()` lives here — the local-offset ISO timestamp every line this browser
appends carries — so `decisions.js` and this share one copy.

Design record: [ranking](/framework/ext/AITask/doc/ranking/) · the verb:
[`ext/JSONL`](/framework/ext/JSONL/doc/task-jsonl/).
