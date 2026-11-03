# tabs-catch-fix

## Ask (verbatim)

A one-bug fix in the lew42 framework. Read `CLAUDE.md` at the repo root first
— it outranks everything, and its "Traps that never throw" section is the
point of this task.

File: `public/framework/ext/tabs/tabs.js`, plus that module's `doc/**/*.md`.
Nothing else — not `tabs.css`.

The bug, from today's audit (`public/framework/audit/modules/ext-tabs.md`):
the `filling` promise built in `Page.prototype.tabs` has no `.catch()`. A
child whose `content()` throws leaves the tab bar blank with no console
trace. This module backs both nav levels of every `Doc` page on the site
(8+ module pages, each rendering `tabs()` twice), so a silent failure here
takes out a page's whole navigation.

Steps:
1. Read `tabs.js` end to end and the module's `readme.md` and audit report.
   Note whether `this.app?.loaders?.push(filling)` swallows a rejection
   already or is about to become an unhandled rejection.
2. Fix it — minimal, house style — so a throwing child's failure is visible
   and attributable to which page's content threw.
3. Update whatever `doc/*.md` and `readme.md` claims this changes.
4. Verify with `node --check` on a copy, then load `/framework/ext/tabs/`,
   `/framework/core/View/`, `/framework/core/Page/` on the already-running
   dev server (port 80, do not start/stop) via Playwright, confirm bars
   render with no console errors.
5. Prove the fix with a scratch throwing child, confirm it now reaches the
   console, delete the scratch file.

Do not touch other files, do not commit, do not install.

## Scope / file ownership

- Only `public/framework/ext/tabs/tabs.js` and `public/framework/ext/tabs/doc/**/*.md`
  and `public/framework/ext/tabs/readme.md` may be edited.
- `tabs.css` and everything else is out of fences.
