Budget: $10

# core/Page navigation: one rule, even columns

Load the `minion` skill first, then the `page` skill. This task's log is `session.jsonl` in this folder. Its task line is `core-page-navigation-one-rule-written-do` in `../task.jsonl` (line 22).

**Why:** a page can navigate seven ways (tabs, sidebar, rail, list and detail, Miller columns, none, expand), and nothing says which one applies where. The design is decided in [plan.md](../plan.md), section 1, lines 15-53, with shots of each way beside it. Read it first; this brief only adds where things are. It is build-order step 5 (plan.md line 154). Plan.md line 165 told the owner these defaults would be built unless they changed them, so build them.

## Do, one commit each

1. **Write the rule down in two places.** The rule: *a page with its own navigation keeps it, and its children open inside it; a page without navigation is replaced by its child.* A linked markdown page (`<page>/md/<doc>/`) follows the same rule and never brings navigation of its own (the `md/` explorer's file list is the one exception). Write it:
   - in `public/framework/design/navigation/readme.md`, as a short section near the top, with the seven ways as a small table that links the shots where they already are (the five `nav-*.png` and `md-explorer-1400.png` in `public/framework/core/Page/tasks/page-mastermind/`; link them, don't move them);
   - in `public/framework/core/Page/readme.md`, as one or two sentences that link the design readme.
   The code already follows the rule: `container()` in `core/Page/Page.class.js` (about lines 525-533) finds the nearest tab panel, rail panel or columns row. Check that claim against the code and say what you found in one log line.
2. **Even columns by default.** In `core/Page/Columns.js`, `even` mode (`static even()`, about line 107) is opt-in today through `page.column_even`. Make it the default for every columns page: N = the row width divided by the recommended column width, rounded down, and the row shared equally. A page can still opt out (`column_even: false`), and a column that asks for a width word keeps it. When more columns are open than fit, the row scrolls sideways. Find where `column_even` is read and defaulted (`rg column_even public/framework`).
   - Prove it with headless shots of `/framework/core/Page/overview/columns/` at 1920 and 3440, before and after, saved in this task folder as `columns-<width>-before.png` / `-after.png`. Compare with `../nav-columns-even-3440.png`.
3. **The two dead words** in `core/Page/words.js` (`NAVIGATION`, lines 43-58):
   - `navigation: "columns"` should open the real Miller columns (`Page.columns()`), the same as a page that calls `columns()` itself. Today `Frame.js:58` draws rows for it.
   - Retire `takeover` as a word: a page that says `navigation: "takeover"` gets the same result as `none`. Take it out of `NAVIGATION` and leave one comment at the spot. Before you remove it, `rg '"takeover"|navigation: *.takeover' public/framework` and list every user in a log line; the CSS classes `inbox-takeover` and `ai2-live-takeover` are a different thing, so leave them alone. If a real page uses the word, map it to none rather than editing that page.
   - *Decision to log:* the alternative for takeover was keeping it as a second name for none. Write a `decision` line naming it.
4. **Expand is for things that are not pages.** In the `expand` entry's `means`, and in the design readme, say it is for details with no address (an FAQ answer), never for a child page. `rg 'navigation: *"expand"' public/framework` and log every user; change none of them.
5. **Only if steps 1-4 are done and the budget allows:** `/framework/core/Page/navigation/`'s tab bar wraps to 3 rows at 1200 px and 2 rows at 1920 (task `navigation-tab-bar-wraps-at-1200`, from a review's layout.json `tab_rows`). Find why in one log line, with file:line. If the fix is in that page's own files, fix it. If it is in `ext/tabs/`, log the cause and stop there.

## Prove it

- `node --check` every touched file. Run `node public/framework/core/Page/Page.test.mjs` before and after.
- Smoke, run from the main tree (`C:/Code/lew42/monorepo`):
  `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/nav-rule /framework/ /framework/core/Page/ /framework/core/Page/overview/columns/ /framework/core/Page/navigation/ /framework/design/navigation/ /imagine/paging/mechanisms/expand/`
  Log the FAIL count before your first change and after your last. A FAIL that was there before is listed, not fixed.
- Log `ready: worktree/nav-rule at <sha> <one line>` on this task, and send `mastermind-page` one line.

## How

- Your worktree is `C:/Code/lew42/worktrees/nav-rule`, branch `worktree/nav-rule`, already made from michael/dev; its server is http://nav-rule.localhost/ (or its port in `.worktrees.json`). Commit after each step.
- Never kill or restart the dev server or Servex, never drive the owner's tabs (headless only), never `git stash`. Edit nothing in the main tree except this task's log.
- Findings go in `session.jsonl` as `log` lines, written with `node .claude/hooks/append.mjs`.

**Deliverable:** the branch; the rule in the two readmes; even columns by default with the four shots; the two words fixed; one decision line. If time runs out, cut step 5 first, then step 4.
