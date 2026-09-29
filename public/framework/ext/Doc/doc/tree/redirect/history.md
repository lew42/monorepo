# Why `replaceState`, not `pushState`

Clicking a link on this site loads the new page first and only pushes the new url to
history second — so a `pushState` made while the page was still loading would just be
overwritten a moment later by that second step. `replaceState` rewrites the CURRENT
history entry instead, so it sticks regardless of when it runs.

It has a second effect worth knowing: because nothing new was pushed, pressing Back
from the corrected `/doc/` url goes straight to whatever page you were on before you
typed the address — one entry to undo, not two.
