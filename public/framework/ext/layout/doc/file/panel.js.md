## What this file is

The right-hand drawer: one per document, module-level singleton state
(`$panel`, `$shell`, `$sel`, `host`), opened by `select()` and closed by
`deselect()`. It owns the push mechanism (`--drawer` on `.app`) and the three
global listeners that keep the drawer honest — `Escape`, `popstate`, and an
outside click. Full design record: [The drawer](/framework/ext/layout/doc/drawer/).

## Why module-level state, not a class

There is exactly one drawer per document by design — `layout.bar()` can be
called any number of times on a page, but every one of them opens the *same*
panel. Module-scoped `let` bindings say that directly; a class would imply
instances that are never meant to exist side by side.

## `host_of()` and the empty-state recovery

`host_of()` walks a selected element up to the nearest element that
`layout.context()` registered on. `refresh()` — run on every panel click — uses
that same host to recover from a re-render: read the live selection if it is
still connected, fall back to its host if not, and only show the empty state if
even the host is gone. This is the piece that stops a tone-chip re-render from
silently editing a detached node.

## The three document-level listeners, and why each is shaped the way it is

`keydown` (Escape) and `popstate` are ordinary bubble-phase listeners.
The outside-click listener is not: it runs in the **capture phase**, because a
click inside the panel that causes the panel to redraw *detaches its own
target*, and `closest()` called on an already-detached node reads as "outside."
Capture runs before that detach happens.

## Improvements

1. **Module-level singleton state (`$panel`, `$shell`, `$sel`, `host`) means two
   documents cannot each have their own drawer.** Fine today — there is one
   document per page load — but worth a one-line comment at the top naming the
   assumption explicitly, since it is exactly the kind of thing that bites a
   future multi-frame or multi-root use. *(simple, speculative)*
2. **`build()` queries `.app` with `document.querySelector` on first open,
   every session.** Cheap, but it means a page with no `.app` ever built silently
   falls back to `document.body` with no signal that the "why `.app`, not `<body>`"
   reasoning (colour-scheme, `--drawer`) no longer holds. A dev-mode check would
   catch a future shell restructuring immediately instead of as a light-mode
   panel on a dark page. *(simple, useful)*
3. **`refresh()` re-queries `.layout-code` by class every panel click.**
   Correct, and cheap, but `body.js` already knows exactly where it put that
   element the moment it built the panel; caching the reference alongside `$sel`
   would trade one `querySelector` for one more piece of shared state — probably
   not worth it unless this path is ever measured hot. *(simple, speculative)*
