# Layout anatomy — Minion B, Figma wave 1

Verbatim brief: `public/framework/ai/2026-08-18/figma/minion.md` +
`public/framework/ai/2026-08-18/figma/wave-1.md` (Minion B section) +
`public/framework/ai/2026-08-18/figma/requirements.md` (owner's standing rules).

Design: https://www.figma.com/design/0rZv3Z6Hnqkxa2UQJ5xOOG/July-2026?node-id=181-1457

Children named: Burger, 3x Burgers, Burger with Columns, Burger with Columns with Burger,
Columns, Columns with Burger, 3x Columns.

Owner, verbatim: "there's a bunch inside, the parent container should not be mocked up, each
of the children should." Build the seven children; do not build the wrapper.

Task: check the 28 existing layouts first (`public/framework/styles/layouts/`) — six of the
pilot's eight designs already existed there, and `wire/` is the pilot's own precedent for
"demonstrate the class string, link to the real layout" instead of adding sibling directories.
If most of these seven are `stack`/`flex`/`grid` restated, ship ONE reference page, not seven
new dirs — say which it is and why.

Two new words to use instead of inline styles: `--grow` (`.flex.auto > *`) and `.tint`.

Home if a dir is needed: `public/framework/styles/layouts/anatomy/`, one word in `BANDS`
(`layouts/page.js`) — shared file with Minion A, add a line, don't touch theirs.

Verify headless 400/1280/1920/3440, `scrollWidth === clientWidth` at each, zero console errors.
Report token spend. Questions/dilemmas → `figma/questions.md` (append) + final report.

## Fences

Own only `styles/layouts/anatomy/` and one `BANDS` line. Never touch `framework.css`,
`css-scopes.txt`, `ext/CSSDoc/`, `styles/elements/code/`, `styles/layouts/wire/`, or Minion A's
`styles/layouts/home/`.
