**Usage** — one caller: `backtick_append()` (`View.js:191`).

**Necessity** — yes, as the implementation under `p()` and `h1`–`h6`. Not as
public API — nothing calls it by name.

**Simplicity** — right-sized, and the scope is the point: **`code` spans and
nothing else.** Bold, links and tables render as literal text. That is not a gap to
fill — filling it means writing a markdown parser in `core/`, and `md()` already
exists one directory over. Reach for `md()` the moment a sentence needs more than
backticks.

Note it calls the module-level `el()` factory, so the `<code>` it builds is created
*outside* the captor and then appended — safe only because the call sits in
argument position.
