`[ header | ☰ ]` — the whole sidebar on a narrow screen, the top strip of it wide.

## Usage

`Sidebar.js:25` — `render()`, the only caller. Assigns `this.$bar`, which nothing
reads. [views](/framework/core/Sidebar/doc/views/).

## Necessity

Keep. It is three lines, but it is the piece that makes the responsive story free:
**the same two boxes at every width**, and the media query only changes which of
them is a strip and which is hidden. No resize listener, no JS branch on width, no
second layout. [narrow](/framework/core/Sidebar/doc/narrow/).

Inline it into `render()` and the pairing of header-with-toggle stops being a
thing with a name, which is exactly what the breakpoint needs it to be.

## Simplicity

Right-sized. The `return this.$bar = …` is the only questionable part — it returns
a value nobody uses and stores it in a property nobody reads. Three of this class's
four `$` handles are like that; the readme carries the proposal to drop them.
