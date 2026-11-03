# end(it, start)

Where one item stops: an instant ends where it starts, a closed span ends at
`to`, an open span (`{ from }`, no `to`) ends "now". `item()` calls this to
size the bar it draws; `lay()` calls it to know when the item's lane frees.

Both had this logic written out separately until they drifted — a running
item's lane was freeing at its own `start`, so a later item could pack into
a lane whose bar was still visually open. One method, called from both
places, is the fix; see the readme's Traps for the shape of the bug.
