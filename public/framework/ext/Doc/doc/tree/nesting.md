# Nesting

A note name may contain `/` — `"guide/setup"` is two notes deep, `"guide/deep/tips"` is
three. Every segment before the last becomes a plain pass-through page, built once and
reused by every sibling note that shares it, so `guide/setup` and `guide/config` share
one real `guide` page rather than two.

The Docs tab notices the difference and switches from its usual vertical tab bar to a
folder tree — the same look `ext/files` uses for browsing real files — the moment any
note in the list nests. A module whose notes are all flat, like almost every module on
this site today, never sees any change at all.
