# Nav links: every page this week can be clicked to

Budget: $8. Load the `minion` skill first, then the `navigation` and `page` skills.

## Why

The owner found that `/framework/ai/merge/` could not be reached by clicking: only `ai/readme.md` mentions it. The owner called it a major fail. The rule is now in [rules.md](/framework/doc/rules.md) ("a page nobody can click to does not exist", commit d0d87b4ce). The owner's words were relayed by vscode-mastermind on 2026-10-23 at about 22:30 and are logged by the prompt hook. Don't retype them.

## What to do (in this order)

1. **The Merge page gets a visible link.**
   - `AIDashboard.js:52` already draws a small "Ready to merge →" link on `/framework/ai/`. The owner still did not find it.
   - Load `/framework/ai/` headless at 400 and 1920 and see where a person would look.
   - Make Merge a first-class link in the page's visible navigation, with the number of branches waiting if that is cheap. `GET /api/ready-to-merge` on Servex returns the rows; `servex_url()` is how the page reaches it.
   - Also link it from the session page, `/framework/ai/sessions/<id>/` (`public/framework/ai/AISession/AISessionDetail.js`), which is where the Merge list is folding in. ⚠ worktree/qf-3 is about to merge a change to `AISessionDetail.js`. Make this edit last, and run `git merge michael/dev` into your branch right before it.
2. **Census.** Find every page added in the last 7 days that a person cannot click to.
   - Start from `git log --since="7 days ago" --diff-filter=A --name-only -- 'public/**/page.js'`, skipping dated session and task folders.
   - Add the route-only pages the owner named: `/framework/ai/sessions/v/review/`, `/framework/ai/sessions/v/mobile/`, `/framework/ai/readmes/`, `/framework/ai/asks/` (and `/asks/undone/`).
   - The test is a click, not a grep: load the parent page headless and look for an `a[href]` that resolves to the child's URL. A name in a `leaf: true` parent's `children:` list draws no link (`ai/page.js` is a leaf).
   - Link each unreachable page from its parent's navigation. Retire one only if it is plainly superseded: move it aside, never delete it, and say why.
3. **Make the check refuse.** The index step merged today (`core/Task/processes/BuildProcess.js`, the `index` step) is only a sentence in a prompt: nothing refuses a page with no link. Add the click test as a node script, `Server/NavCheck.mjs`: given a worktree and a diff range, it loads each new page's parent on the worktree server and reports any new page with no link to it. Call it from `Server/merge.mjs` so a merge with an unlinked new page is refused. Add an override flag in the style of `--no-review "why"`. Give it a test beside it (`Server/NavCheck.test.mjs`) that proves both a refusal and a pass. Name the check in the index step's `do:` text.

## Deliverable

- A branch, `worktree/nav-links`, made with `node Server/worktree-up.mjs nav-links`. Commit at every working step.
- Then log one `show:` line in your `session.jsonl`, in two parts:
  1. A list with one row per page: its URL, where it is now linked (or that it was retired and why), and the shot proving the click.
  2. The NavCheck refusal output on a deliberately unlinked test page.
- Then log `ready: worktree/nav-links <sha> <one line>` and stop. The deputy reviews and merges.

## Fences

- **Yours:** `public/framework/ai/page.js`, `public/framework/ai/AIDashboard/*`, the parent `page.js` of each page you link, `public/framework/ai/AISession/AISessionDetail.js` (last, see above), `Server/NavCheck.mjs` and its test, the NavCheck call in `Server/merge.mjs`, and the index step's `do:` text in `BuildProcess.js` and `DesignProcess.js`.
- **Not yours:**
  - `public/framework/ai/merge/*`, which another minion is fixing at the same time.
  - `core/Page/*` and `core/Router/*`, which belong to mastermind-page's nav-rule work.
  - `SessionWork.*`.
- The owner has dropped Miller columns in favour of previews plus full detail views, so add no column layouts.

## Never

Never kill or restart the dev server. Never drive the owner's tabs (headless only). Never `git stash`. Run `node --check` on every file you touch. Findings go in your `session.jsonl` as `log` lines.
