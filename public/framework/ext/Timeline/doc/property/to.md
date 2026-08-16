# to

Optional. An explicit domain end — ISO string or epoch-ms number — overriding
the default of "the latest item's own timestamp (or `Date.now()`, whichever
is later), plus a 15-minute pad" (`span()`, `Timeline.js:56`–`62`).

The `Date.now()` floor means an all-past dataset still domains through to
"now" by default, so an open span (see `doc/property/items.md`) always has
somewhere to end visually. Pass `to` explicitly to suppress that and show a
strictly historical window instead.

See `doc/property/from.md` for its pair.

## Improvements

Nothing ranked: same shape as `from`, same file, same lines.
