The rail's own module — one `View` mounted once, filled by whoever calls
`drawer(fn)`. Imports `View` and nothing else, which is the whole reason it
left `ext/layout`: anything can open it and it knows none of its callers.

## `--drawer` is written on the same element the rail measures against

`drawer()` sets `$shell.style("--drawer", WIDE)` on `.app` — the same element
`drawer.css`'s `.drawer { inline-size: var(--drawer, …) }` reads its own width
from — so the reserved strip `.app` yields and the rail's own width are one
number and can never disagree. `close()` clears it back to `""`, releasing the
strip.

## `close()` is the only thing that shuts it

Until 2026-08-16 the rail closed whenever a selection cleared, so a click
anywhere on the page threw away scroll position and whatever was being read.
Now a caller redraws saying nothing is selected, and only the ✕ — wired to
`drawer.close` inside `build()` — calls `close()`.

## `build()` mounts on `.app`, guarded to run once

`if ($rail) return` — a second `drawer()` call reuses the existing rail and
refills it through `refresh()` rather than mounting a second one. Mounting on
`.app` rather than `<body>` matters because `color-scheme` is forced there
(`App/mode.js`); a rail on the body would render light against a dark page.

## Improvements

1. **`refresh()` silently no-ops if `fill` is unset or the rail is not
   showing** — a caller that calls `drawer.refresh()` before ever calling
   `drawer()` gets no signal that nothing happened. *(simple, speculative.)*
2. **`$shell` is resolved once, in `build()`**, from
   `document.querySelector(".app") || document.body` — correct while the app
   root is a singleton for the page's lifetime, but nothing re-resolves it if
   that root were ever replaced. *(simple, speculative.)*
