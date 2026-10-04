# Fix: dragged moves wrote a flat `{"move":{...}}` line, not nested under the list's name

Relayed by vscode-mastermind (2026-10-03), quoting the owner:

> drags write top-level `{"move":{...}}` lines onto the page (see now/page.jsonl lines
> 8-33), not `{"content":{"move":...}}`; with the no-at design the line should be nested
> under the list's name. Fix the writer (ext/Draggable Sortable release / Page) so the
> path is the nesting.

## Root cause

`core/Item/Store.js`'s `hops(node, host)` builds the nesting path for a "delta" event.
When the event's `origin` IS a List itself (every `List.announce()` call — `add`/
`remove`/`move`/`order` — emits with `this`, the list, as the origin), the old code did:

```js
if (is_list(node)) return hops(node.owner, host);
```

— it recursed straight to the list's OWNER with no segment for the list's own name,
so a direct move on `page.content` (or any named list owned right on the host) produced
a FLAT line with no nesting at all. `address()`, just above in the same file, already
handled this correctly for its own job (`base ? base/node.name : node.name`) — `hops()`
just never matched it. Not a Sortable/Draggable bug at all — the drag code calls
`list.move()` correctly; the bug was one level down, in how `Item.Store` turns that
List's own change into a wire line.

**Consequence beyond cosmetics**: `Page.class.js`'s `set()` only routes a line into
`page.content` when it finds `"content" in obj`. A flat `{"move": {...}}` line has no
such key, so a RELOADED page never replayed those drags at all — they were silent no-ops
on refresh, not just an ugly log.

## Fix

`core/Item/Store.js` — `hops()`'s list branch now appends `node.name`:

```js
if (is_list(node)) return [...hops(node.owner, host), node.name];
```

Matches `address()`'s existing pattern one branch up. Updated the method's own header
comment to describe the new (correct) nesting instead of the old flat behavior.

## Verified

Node smoke tests (scratchpad, not committed):
- A direct `content.move(...)` now announces `{"content":{"move":{...}}}`, not flat.
- A plain field `set()` directly on the host (no list involved) stays flat —
  unaffected.
- A nested child list (`k2.answers.add(...)`) still produces BOTH hops
  (`{"k2":{"answers":{"add":{...}}}}`), unaffected.
- Replaying the new nested content-move line onto a fresh copy rebuilds the same order.

Historic broken lines already in `ai/2026/10/03/now/page.jsonl` (lines 8-33, flat
`{"move":{...}}`) are left as-is — they were silent no-ops (no `page.move` method, no
content item named "move"), so they never corrupted anything; the card's current order
comes from its one correctly-nested `move` line plus the original `add` order. Not
repairing someone else's live task page's history as a side effect of this fix.

## Scope fence

`core/Item/Store.js` only.
