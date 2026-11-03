# live(base)

The "now" line. Placed once at render, then nudged — not re-rendered — by a
60-second `setInterval` that only writes `--t` when
`document.visibilityState === "visible"`, so a backgrounded tab doesn't spend
a timer tick moving a line nobody can see.

⚠ **The interval is never cleared.** A `Timeline` that gets removed from the
DOM (unmounted, replaced) leaves its `setInterval` running forever, holding a
closure over `$now` and `base` — a small, permanent leak per destroyed
instance. Harmless at today's usage (one `Timeline` per page load, page load
= interval lifetime), but real: `View` has no `destroy()`/`unmount()` hook
this method could register against today, so fixing it is a `View`-level
question, not a one-line local fix.

## Improvements

1. **The uncleared interval**, above. **medium, useful** — no `View`
   lifecycle hook exists yet to clear it against; fixing this well means
   adding one to `core/View`, out of this module's fences.
