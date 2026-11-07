# Page system simplification: analysis (read-only)

Budget: $4. Load the `minion` skill first. Card: /framework/ai/2026/11/06/page-system-simplify-the-design-plan-onl/.

**The owner's words**, and the plan you are feeding: /live/plan/, cards `ov-keep`, `ov-cut`, `ov-icons` (`public/live/plan/page.jsonl`).

**Do not change any code.** This task is analysis only. Your only writes are the two files below and your task log.

## What to find (one row each; every claim gets a file:line)

1. **The Live\* classes:** `public/live/LiveButton.js`, `LiveLight.js`, `LiveChecklist.js`, `LiveScreen.js`, `LiveContent.js` and `TaskState.js`. For each one:
   - What it is, in one sentence.
   - What is truly "live" about it, and what is just a generic component.
   - Who imports it (rg over `public/`).
   - Is there already a generic version somewhere (`public/framework/ui/`, `ux/`, `ext/`, `core/Page/parts/`)?
   - What a generic, reusable replacement would be called and where it would live.
2. **`public/framework/core/Page/parts/`:** every file, including `kinds.js`, `types/` and `MdToParts.mjs`. For each one: what it does, whether it is a class, who imports it, and whether two files do the same job.
   - Then answer, in plain words: what is a "part"? Is it a view, a template or a data record?
   - Suggest one clearer model: names and homes.
3. **Every import line in `public/live/LivePage.js`:** what it brings in and why LivePage needs it, one line each. Add any import a newcomer couldn't explain (for example `ux/content/Object` and its `DefaultView`: what it is and who else uses it).
   - Then sketch a single entry file (`core/core.js`): what it would export, and how many import lines LivePage would save. Check whether something like it already exists (`/app.js` exports a lot; say what).
4. **Moving the keepers into the default `Page` class:** the breadcrumb, the gear, the settings page and the `/settings/<file>/` code view.
   - Where each lives today (file:line).
   - What a move into `core/Page` would take, and what would break.
   - What it would take to put `/framework/core/Page/` (a class doc page) on this system.
5. **Icons:** does Page already have an `icon` field (`pages.add` takes `icon`), and where would the header draw it?
6. **Old systems:** `/live/sessions/` and `/live/next/`. Give each one line: what it is, and its last commit date (`git log -1 --format=%cs -- <path>`). Don't audit beyond that.

## Deliverable

- `public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/simplify/analysis.md`: at most about 150 lines, one section per item above, with a table where it fits.
  - End with **a proposal**: at most 6 ordered steps from the current state to the simple one. Each step names the files it touches, a cost guess, and a risk (what breaks).
  - If you have to cut, cut item 6 first, then item 4's doc-page part.
- Log what you find as `log` lines in your `task.jsonl`, and write a `complete` line at the end.
- Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`. Commit only `analysis.md` and this folder's files, by exact path.
