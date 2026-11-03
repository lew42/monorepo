`!Socket.singleton().disabled` — one line, and the only honest way to ask "is
the bridge here" without sending a request that's doomed to reject. Every
other export in this module checks the same flag internally and throws; this
is the version a view checks *before* deciding whether to render a form or a
muted line.

## Why it isn't cached

`Socket.singleton()` is a true singleton and `disabled` is set once, in
`initialize()`, from `location.hostname` — it can't change over the page's
life. Calling `available()` on every render (as `chat()` and the dev rail both
do) costs nothing: it's a property read behind a static method call, not a
network round-trip.

## Improvements

Nothing ranked: three lines, one job, and every caller already uses it
correctly (guard first, render the fallback, never call `ask()` speculatively
to find out).
