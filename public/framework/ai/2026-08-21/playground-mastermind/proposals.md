# playground-mastermind — proposals awaiting the owner

Three decisions surfaced by the waves; none were made autonomously.

## 1. Flex creation now costs 2 gestures (was 1) — accept, or add a shortcut?

The one-`+`-button toolbar you asked for landed, and it costs exactly what it saves: strict
apples-to-apples, the holy-grail shell is now **10 gestures vs the old UI's 9** (pg-hero proof).
The single regression: any Flex/Grid is now add-then-convert (2 gestures) where `+FLEX` was 1.
The single win: placeholder adds are explicit-target, killing the old reselect step. Options:

- **Accept** — the minimal toolbar is worth one gesture on containers. (Default if you say nothing.)
- **Modifier click** — plain click on any `+` = Box, Shift/long-press = Flex. One line of doc, no new UI.
- **Auto-flex** — a plain Box auto-converts to flex-column the moment its `+` gives it a second child (the data already declares intent: two children want a layout). Cheapest flow, most magic.

## 2. Dev-server-down persistence silently loses work

Baseline-proven: with the dev server down, "New Document" hangs forever on `Socket.ready`
(`documents.js`), and the save queue jams permanently on the first unresolved write — every
edit after that is silently unsaved for the session. Sketch (~15 lines, documents.js): race
`Socket.ready` against a ~2s timeout; on timeout fall back to `LocalStorageSaver` (already the
prod path) and show a small "saving locally" pip. Not shipped — persistence semantics are an
owner call (double-path saves when the server comes back need a rule: local wins? server wins?).

## 3. Parked with evidence (no decision needed unless you want them)

- **Grid-mode resize handles** — cut per the program's own priority list; flex handles cover the ask.
- **`.pg-node` min-width floor** skews *committed* unequal grow ratios a few px on re-render
  (live drag tracks exactly); measured and documented in `ext/Playground/doc/decisions.md` (pg-resize).
- **Wrapped-flex handle geometry** — handles assume a single row/column; wrap is untested there.
