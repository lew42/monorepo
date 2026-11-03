Budget: $4

# ext/tabs: the Tabs page loads with no error, and its demo tabs link to real urls

Load the `minion` skill first. This task's log is `session.jsonl` in this folder.

**Why:** `/framework/ext/tabs/` is the documentation page for the third level of navigation (tabs). Today it fails, and so does every tab under it:
- the page throws `Failed to construct 'URL': Invalid base URL`;
- its two in-page demos (`public/framework/ext/tabs/page.js`, lines 21-29 and 59-67: `demo.app(sample({children: {what, why}, content(){ this.tabs("what why"); }}))`) link to `/framework/ext/tabs/undefinedwhy/` and `/undefinednotes/`. A demo page's `url` is undefined when its tabs build their links.

It was seen in `Server/smoke.mjs` on 2026-10-23 (michael/dev at 3940d1b1c). Reproduce it on current michael/dev first.

## Do

1. **Reproduce:** `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/ext-tabs /framework/ext/tabs/`, run from the main tree (`C:/Code/lew42/monorepo`). Save the output in your scratchpad, and log the FAIL lines and their stack as one `log` line.
2. **Find the cause, as file:line.** Start from the stack of the URL error, and from how `demo.app()` (`public/framework/ext/demo/`) and `sample()` (`ext/demo/sample.js`) give a demo page its url. Ask yourself whether the tabs (`ext/tabs/tabs.js`) or the demo should own the fix. Log a `decision` line naming the one alternative.
3. **Fix the smallest thing that removes both symptoms.** Do not change how a real (non-demo) page's tabs render. These must still pass smoke: `/framework/ext/tabs/`, every tab under it, `/framework/ext/Doc/` and `/framework/core/Page/`.
4. **Prove it:**
   - smoke before and after, with the FAIL count for each;
   - a headless shot at 1920 of `/framework/ext/tabs/`, showing both demos with their tab bars;
   - in the browser console (from the headless run), the demo tab links' `href` values.
   Then run `node --check` on every file you touched.
5. Log `ready: worktree/ext-tabs at <sha> <one line>` on this task, and send `mastermind-page` one line.

## How

- Your worktree is `C:/Code/lew42/worktrees/ext-tabs`, branch `worktree/ext-tabs`, already made. Never work in the main tree, except to append to this task's own log.
- Commit after each working step.
- Never kill or restart the dev server or Servex, never drive the owner's tabs (headless only), and never `git stash`.

**Deliverable:** the branch, the smoke numbers before and after, and one decision line. If the cause turns out to be outside `ext/tabs`, `ext/demo`, `core/Page` or `core/Router`, stop there and log it with the file:line rather than editing.
