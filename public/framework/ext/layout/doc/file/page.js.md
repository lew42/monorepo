## What this file is

The module's own doc page, and its most important demo: a page about arranging
things is the one page on the site that has to work as the thing it describes,
which is why `layout(boxes)` opens the page rather than a paragraph of prose.
Rewritten in this pass from a plain `Page` to a `Doc` (`subject: layout`) so the
API surface (`bar`, `context`, `words`) and every file get real, browsable urls
alongside the walkthrough.

## Four demos, one continuous story

Rather than a rail of interchangeable variants, the Overview is a sequence where
each demo adds one new fact: `layout(boxes)` (the box owns its own bar) →
a wall wired with `layout.bar()` + `layout.context()` (select-and-edit, plus a
custom panel chip) → `layout.bar(this)` on the page itself (a third target type,
and the page rearranges live) → a custom `radius` word (the extension point).
This reads as a tutorial rather than a gallery because each step depends on
understanding the last one — a `overview:` rail would let a reader land on step 3
with no step 1, which is the wrong entry point for this particular module.

## `layout.bar(this)` inside `content()`

The page bar is a live demonstration of the microtask trap this module's own
readme calls out: called from inside the running `content()`, before `page.view`
exists, and it still works, because `layout.bar()` defers to a `queueMicrotask`
rather than reading `page.view` synchronously. The page is proof, not just a
claim.

## Improvements

1. **The `boxes()`/`box()` helpers at the top are shared across all four demos,
   including the "select and edit" and "custom controls" ones that reuse the
   exact same six named boxes (Alpha…Zeta) for unrelated points.** Reusing the
   same content keeps the reader oriented, but it also means the per-demo prose
   ("Delta: one class flips the whole row...") is describing the *first* demo's
   framing even where a later demo's point has nothing to do with it. Worth a
   second, shorter box set for the later demos if this page is revisited — not
   urgent, since the reuse currently reads as intentional rather than accidental.
   *(medium, speculative)*
2. **No demo shows `layout.context()` registering more than a single toggle.**
   The one real caller with a *group* of context chips (`styles/sections/tone.js`,
   four tone options) is a stronger illustration of "extra panel content" than
   this page's single checkbox — linking to it (already done, via `Next:`) covers
   this, but an inline second example would remove a click. *(simple, useful)*
3. **The page never shows what an unregistered word looks like** (a bar
   silently rendering one control short of what its list asked for) — the
   single highest-value trap in `words.js`'s own docs. A one-line aside
   ("misspell a word in the list and the bar just draws fewer controls, with no
   error") would put that trap where a first-time reader of this API is actually
   looking, rather than only in `doc/property/words.md`. *(simple, important)*
