# ui-test — improvements

Append one line whenever this skill misled you or was silent about a trap that then bit you.

- 2026-08-27 (pg-ux-research, want only — the facts were applied to SKILL.md/drive.mjs by the mastermind, same day): `watch` accepting a selector that matches MANY elements and reporting each, plus a `baseline` verb, so a rect-sweep needs no hand-rolled eval. (drive.mjs crash on mid-run navigation: FIXED — rects/metrics/screenshot now swallow the destroyed context, flag `navigated mid-step`, and carry on.)

- **No `dblclick` verb** (2026-08-29, col-resize). A double-click is a distinct gesture — `down`/`up` twice does NOT synthesize one (Playwright sends `clickCount: 1` each time, so no `dblclick` event fires and a reset handler looks broken). Had to copy `drive.mjs` and add one line: `dblclick: (x, y) => page.mouse.dblclick(+x, +y),`. Worth having in the runner.
