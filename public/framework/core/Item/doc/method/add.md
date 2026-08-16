`kids.forEach(kid => this.items.append(kid))` — appends one or more children to
the end, in argument order: `parent.add(a, b, c)`.

**Usage** — the construction-time verb. Once a tree exists and something needs
repositioning rather than inserting fresh, reach for [`move()`](move.md)
instead — `add()` always appends and has no "before" argument, deliberately: a
second verb for positioned insertion (`insert_before`) exists on
[`List`](/framework/core/List/), not here, because `move()` already covers the
reposition case and a third way to place a node was cut rather than added.
