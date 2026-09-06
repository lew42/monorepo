# ui-test — improvements

Append one line whenever this skill misled you or was silent about a trap that then bit you.

- 2026-08-27 (pg-ux-research, want only — the facts were applied to SKILL.md/drive.mjs by the mastermind, same day): `watch` accepting a selector that matches MANY elements and reporting each, plus a `baseline` verb, so a rect-sweep needs no hand-rolled eval. (drive.mjs crash on mid-run navigation: FIXED — rects/metrics/screenshot now swallow the destroyed context, flag `navigated mid-step`, and carry on.)
- 2026-09-04 (omnibox-prototype): the `offscreen-x` flag compares a watched rect against `vp.width`, a const captured ONCE from the plan's initial viewport — a mid-run `viewport w h` resize actually resizes the page but never updates `vp`, so anything past the OLD width false-positives as offscreen after every later resize (drive.mjs line ~16 vs ~85). Cost one detour chasing a phantom 3440px overflow; the real check (`doc.sw <= doc.cw`) was fine the whole time. Fix: update `vp` inside the `viewport` verb handler, or compute the threshold from a live `page.viewportSize()` each flag check.
