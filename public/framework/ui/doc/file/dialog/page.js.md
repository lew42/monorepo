The dialog exhibit (a real modal you can open and Esc out of) plus one
variant (`open` — what `showModal()` shows, rendered inline since a closed
dialog renders nothing).

## The trap this page exists to warn about

**Never put a `display` class on the `<dialog>` element itself.** The UA
hides a closed one with `dialog:not([open]) { display: none }`, and an
author rule beats a UA rule at any layer — so a layout class keeps a "closed"
dialog on screen, invisibly eating clicks. Found by a click that timed out,
not by an error, which is exactly why `flex v gap` goes on an inner `div`
instead. The old `ui.dialog()` function's own `.c()` form re-armed this trap
by putting the caller's classes on the `<dialog>` directly — one of the four
real bugs the review found across the whole set.

## Improvements

Nothing ranked: the trap is stated three times at increasing specificity
(the table, the bold warning, the "why it looks unusual" note on `el`), which
is the right amount of redundancy for something that fails with no error.
