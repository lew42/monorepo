`Panel.defaults` is a static plain object — `{ dir: "row", template: "blank",
align: "cc", self: "tl", tone: "surface", mode: "fill", grow: 1,
display: "block", w: "fill", h: "fill", position: "static" }` — never assigned
to a `Panel` instance directly. `get(key)` is the only reader, falling back here
whenever `this.data[key]` is `undefined`.

⚠ **`template` is `"blank"`, not `"random"` — deliberately, against the
instinct.** `divide()` hands its new sibling a bare `new Panel()`, so a
default of `"random"` would make *every* split roll a random
sub-arrangement: one click on a split icon would have produced three nested
columns. `"random"` is what explicit seeding and the `T` menu's own
`"random"` entry ask for — both ask by name, never by default. Full
reasoning: [Decisions](/framework/ext/Panel/doc/decisions/).

⚠ **`self` is `"tl"`, and must stay `"tl"`.** `size.css` reads the panel's
self-alignment as `var(--panel-self-y, start)`, and `start` is what those
cross-axis rules hardcoded before `self` existed. `PLACE.t` and `PLACE.l` are
both `start`, so `tl` is the one code that renders every saved hugging panel
exactly where it already was — any other default moves them all, silently.
Full reasoning: `size.js` in the [Files tab](/framework/ext/Panel/files/).

Keeping these on the class rather than copied into each panel's `data` at
construction is why a five-panel workspace's saved JSON holds only the keys
somebody actually changed, and why changing a default later can still reach
documents already on disk (an old document's missing key falls through to
whatever `Panel.defaults` says *today*).
