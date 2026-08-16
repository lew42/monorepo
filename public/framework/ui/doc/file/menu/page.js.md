The menu exhibit plus one variant (`two` — two independent menus, showing
what the component deliberately doesn't do).

## What it doesn't do, on purpose

**No light dismiss.** A `<details>` stays open until something closes it —
open both menus in the `two` variant and both stay open. The page names the
Popover API as the recorded upgrade path (light-dismiss and top-layer
stacking for free) but keeps `<details>` as the template because it needs
zero JS to *be* a disclosure at all.

## Why there was no `ui.menu()`

Its one line of real logic — close the panel after a pick — is exactly the
line a caller wants *per item*, since real menu items run handlers and the
function's items could only be strings and urls; its own demo page rendered
five dead links. It also collided by name with `ext/layout`'s `menu()`,
live, in a codebase where the class/function name is meant to be the
registry.

## Improvements

Nothing ranked: both real defects (the dead-link demo, the name collision)
are stated plainly in the exhibit note rather than smoothed over.
