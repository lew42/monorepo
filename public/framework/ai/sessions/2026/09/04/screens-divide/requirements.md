# screens-divide — fix brief

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; mandatory. Skills: `new-task` (this dir, group `paging`), `code`, `ui-test`, `finish-task`.

**The owner's ask, verbatim:** "for the imagine/screens/divide/, clicking Two keeps Three active, i feel like it should just link to itself /two/, and then three disappears?"

## Do

1. Read `public/imagine/screens/screen.js`, `screens/divide/page.js` (and its children), `screens/readme.md` + `doc/`, and `core/Page/doc/columns.md` for the `active-page` / `active-ancestor` contract. Find the line that keeps Three active when Two is clicked, and say in one log line why it was written that way (there may be a reason — `screens/doc/` or a comment).
2. Fix at the cause: clicking Two links to `/imagine/screens/divide/two/` itself, and Three is no longer shown. If the fix belongs in `screen.js`, check every other screen (`quad`, `stack`, `uneven`, `mix`, `read`, `title`, `deck`) still behaves — shoot each before and after.
3. `ui-test`: click Two → the url is `.../divide/two/` and Three's box is gone; click Three → the reverse. Screenshots at 1280 in your task links; zero console errors.

## Fences

Write only `public/imagine/screens/` and this task dir. If the cause is in `core/`, do not edit it — write the diff in your task log as a proposal and stop. Budget ~80k tokens.
