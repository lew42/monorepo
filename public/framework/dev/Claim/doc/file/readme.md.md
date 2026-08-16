## What this file is

The design record for a module that is two functions and one stylesheet: why
it's a module and not a paste-in (four sessions share one browser, so the
ring needs a name and a page), why a claim has to survive a reload it never
asked for, and the two silent findings that made the first version unusable.

## The reload requirement is the load-bearing decision

Stated plainly, not hedged: the first version didn't survive a reload, and
"unusable for the case it was built for" is the actual verdict — an agent
editing files under `public/` reloads its own claimed tab every few seconds,
so anything short of `sessionStorage` plus a boot-time `reclaim()`
disappears before anyone benefits from it.

## Two findings are recorded, not just fixed

Both the `.app`-not-`body` placement and the `MutationObserver` on
`<title>` are written as measured bugs with their symptom stated (a 6px
`currentColor` line; the mark wiped a second after landing) — what a reader
needs to avoid reintroducing either one, not only what the fix was.

## The Open list names a real gap plainly

Two items, both honest about scope: nothing releases a claim on its own if a
session dies mid-task, and the label can't be clicked through to its task
page because the whole ring is `pointer-events: none` by necessity. Neither
is dismissed as out of scope; both are named as costing more machinery than
the problem has earned "so far."

## Improvements

1. **Nothing ranked.** The two Open items are already the file's own ranked
   next moves — restating them here would just be a second copy.
