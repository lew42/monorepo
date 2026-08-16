Blank on purpose. Called from `release()` (a rejected drop) and from `cancel()`
(an aborted gesture) alike — the one path back to "nothing happened." That
sharing is why [`cancel()`](../cancel/) costs four lines: whatever undoes a
drag's visual effect lives here once, not once per way the gesture can end.
