318 lines — the longest file in the framework — carrying three jobs: the `Node`
drag class, the `editor()` widget (a closure over five region painters), and this
Doc page. Every load-bearing decision already has a `⚠` comment in the source;
this page is the map of where they are, not a restatement.

## The closure holds all editor state

`doc / sel / saved / $canvas / $layers / $props / $status / $undo / $redo` and
`nodes` (a `Map`, rebuilt by every `draw()`) all live in `editor()`'s scope.
Nothing about the document or the selection reaches outside it — the five
`REGIONS` painters are the only things that read or write it, and each is
guarded (`$layers?.empty(…)`) so a region the current panel arrangement is not
showing simply has no body.

## `swap()` is the one place undo, reload and hydrate meet

`Item.hydrate` returns a **new tree**, so `swap()` re-attaches the saver,
re-binds the `change`/`add`/`remove` listeners, redraws and re-resolves the
selection by id, all in one function, on purpose — see the readme's Traps.

## The `REGIONS` object is this workspace's `T` vocabulary

Handed to `ext/Panel`'s `workspace({ templates: REGIONS })` — see
[`doc/shell.md`](../shell.md) for why a workspace-local registry won over the two
alternatives considered (a global template, or a `draw` assigned onto each
hydrated `Panel`).

## The Overview *is* the running editor

`content()` mounts the real widget after `Item.open(saver)` resolves — the
factory call (`editor(doc)`) happens inside `$shell.empty(() => …)`, a callback,
because it runs after the function's first `await`-equivalent (`.then`) and a
call placed after that point would append to whatever the captor has since
become. This is the file's one demonstration of the synchronous-capture trap
working correctly, not a violation of it.

## Improvements

1. **This file carries three responsibilities and is 3× the house's 100-line
   guideline.** The natural split, already named in this module's own readme and
   in the 2026-08-14 cross-module review: `Editor.js` as the class the closure
   already resembles (eleven methods, seven fields, currently `let`), with a thin
   `page.js` left to document it. This is also the file that currently has no
   importable door — nothing outside the directory can construct an editor,
   embed one, or name one in an import — and the split is what creates one.
   *(large, important — see the audit's Recommendations and
   [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/))*
2. **Two redraws per drag.** `item.move()` emits `remove` then `add`, both bound
   to `draw()`. Correct, one frame wasteful. *(simple, useful)*
3. **One `keydown` listener added at module load, never removed** — guarded by
   `isConnected` so a routed-away editor does not eat the shortcut, but nothing
   ever calls `removeEventListener`. A real fix wants a `Page` teardown hook that
   does not exist yet. *(medium, useful)*

Fixed: **opening the page no longer writes the document.** `editor()` used to
end with a synthetic `changed()` call, kept only so the status badge had a
return value to read — that call is gone; `badge()` already ran (via the
status region's own draw) showing "…", and only a real edit calls `changed()`
now.
