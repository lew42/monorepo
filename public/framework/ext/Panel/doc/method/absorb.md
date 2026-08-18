`absorb()` pulls a container's **only** child up into the container itself:
the child's own children move onto `this`, `this.data` becomes the child's
`data` (with `this`'s own `grow` preserved — the share of the row `this`
already occupied), and `this.draw` takes the child's `draw`. The now-empty
child is removed.

Called from exactly one place: `close()`, when removing a panel leaves its
parent with a single remaining child. Never called directly by anything
else — it is the second half of a pair, not a general-purpose operation.

⚠ **`only.bequeath(this)` runs BEFORE `only.remove()`**, right after `this`
has taken `only`'s data and `draw` — so `this` is already wearing the
content by the time any copy of `only` gets re-pointed at it. Naming `this`
as the heir (rather than letting `bequeath()` default to `copies()[0]`) is
what makes a copy of the absorbed child track the survivor instead of
whichever other copy happened to be found first.
