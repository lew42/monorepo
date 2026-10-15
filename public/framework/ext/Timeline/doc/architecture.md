# Timeline architecture — CSS-positioned items in greedy lanes

Timeline is a general h/v timeline that renders dated items as bars and dots, entirely positioned via CSS custom properties (`--t` start, `--d` duration, `--em-per-hour` zoom) so orientation and zoom are property writes, never re-renders. Main class: [`Timeline.js`](../Timeline.js). Entry point: [`page.js`](../page.js) for the demo.

## Positioning is CSS custom properties, not layout math

**Decided:** every item is positioned by `--t` (hours since domain start), `--d` (duration), and `--lane` written as inline style; `left`, `top`, `width`, `height` are all `calc()` off them.

**Why:** zoom and orientation can change without triggering a full re-render — one property write on the root (`--em-per-hour`), one class swap (`.h` vs `.v`).

**Instead:** layout math in JavaScript (requires re-render on every zoom); or a live setter (expensive, would tie rendering to interaction).

**Detail:** [decisions.md](./decisions.md#decisions)

## Lanes use greedy interval packing

**Decided:** items sort by start time and fill the first lane whose previous item has already ended; a named `lane: "<string>"` pins related items to one shared track.

**Why:** sequential work reads as one lane; parallel work stacks naturally, with no upfront prediction needed.

**Instead:** a pre-computed layout (requires knowing all items' spans upfront); or manual lane assignment (user burden).

**Detail:** [decisions.md](./decisions.md#decisions) — method `lay()` at line 66.

## Item end time is unified in one method

**Decided:** `end(it, start)` computes an item's end in one place: instant at its own start, closed span at `to`, open span at "now". Both `lay()` and `item()` call it.

**Why:** they used to compute this separately and drifted — `lay()` would free a still-running open item's lane, letting later items pack into a visually-still-open space.

**Instead:** inline the ternary in both methods (prone to divergence on future changes).

**Detail:** [decisions.md#traps](./decisions.md#traps) — method `end()` at line 87.

## Window items render behind, day items pack normally

**Decided:** `kind: "window"` bypasses `lay()` entirely, drawn straight to lane 0; `kind: "day"` packs like a regular item even though its CSS spans the full cross axis.

**Why:** windows are backgrounds (behind all lanes); days are events that consume lane slots and should not pile invisibly.

**Instead:** both skip packing (would need more thought as usage grows); both pack (windows would float incorrectly).

**Detail:** [decisions.md#open](./decisions.md#open) — render() at line 48–49.
