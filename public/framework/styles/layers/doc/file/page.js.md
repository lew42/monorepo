## What this file is

The single line the whole CSS strategy hangs on, explained:
`@layer base, theme, site, util;`. Four tabs (`base`, `theme`, `util`, `site`)
hang off this page as children — this file itself is only the restatement,
the "two traps that never throw," and the escalation ratchet in one paragraph.

## The two traps are the whole tax

The first `@layer` statement fixes the order for the entire page, and a name
first seen later is appended at the end — silently. Every rule must be inside
a layer, or it beats every layer at any specificity. The file states plainly
that there is no third trap; these two are what the convention costs.

## No stylesheet, on purpose

The comment at the top makes the same move `elements/page.js` and the base/
theme/util pages make: a page arguing that layer order matters would be
undermined by needing to win a layer fight itself to render correctly.

## Improvements

1. **Nothing ranked.** 34 lines, states two traps and links to four children
   that each carry their own weight — there is very little here to critique
   independent of the layers it summarizes.
