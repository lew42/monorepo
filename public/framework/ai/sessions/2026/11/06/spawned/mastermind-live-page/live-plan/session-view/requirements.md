# The session view, a fast prototype for one session, at /live/session/

Budget: $5 (Sonnet). Load the `minion` skill first, then `code`, `page` and `layout`.

## Why

The owner (2026-11-09, relayed by voice-app) can't read the current session page: the task list is crossed-off paragraphs with no titles, and the page loads slowly. In the owner's words: the crossed-off list "was just impossible to read… they don't really have a title… a strike through all of it… I need to see a simple overview of all the tasks". Also: "always work contextually… establish which thing we're looking at first, then get into the detail on demand… give me the ID… something familiar with an icon and ID so I can click through."

This is a **prototype for one session only**: `cloud-voice-app-20261106`. Later it becomes the view of every session at that session's own folder; not now.

## What to build

A page at **`/live/session/`** (`public/live/session/page.js`, plus one class file if the drawing is more than a few lines, e.g. `SessionView.js`). **No new CSS** (the owner, 2026-11-09, via voice-app): compose the existing ui/ parts (`public/framework/ui/` card, row, item, tree; browse them at /framework/library/). Where a part lacks something, log `ui-kit gap: <part> needs <thing>` on your task and use the closest part; mastermind-ui-kit owns the kit. It reads **only** `public/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/session.jsonl` (834 lines, 120 KB), with one fetch, and draws it. Phone first (400 wide), and it must still look right at 1200.

Top to bottom:

1. **What this is:** icon, the session id (`cloud-voice-app-20261106`, linking to its folder `/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/`), a title, start and last dates, cost if the file has it, and completion ("24 of 33 tasks done", computed from the file).
2. **Tasks, one line each, grouped by state:** working, waiting on you, open, done. Each row is an icon and a short title on one line. **No strike-through, no dimmed paragraphs.** A tap opens that task's detail: why, outcome, evidence (commits, pages, as links). Use `details`/`summary` or a small sub-route, whichever is simpler; the url should change if you use a route (`/live/session/<task id>/`).
3. **Child sessions** (the agents this session spawned, the `spawned` lines): icon and agent id, each a link to its session folder if the line names one, else to nothing.
4. **The owner's prompts by number,** each linked to the owner's words. ⚠ `session.jsonl` may not hold the prompts (a quick grep found no `prompt` or `from:"owner"` lines). Check the session's own folder (`ai/`, `page.jsonl`) first. If the prompts aren't in that folder, draw this section with one line saying where they are missing and log the gap on your task. Don't go searching the whole repo.

## How to read the file

The file is an Item log: `{"tasks":{"add":{…}}}`, later lines that change a task by id (`{"tasks":{"<id>":{…}}}` or similar), `spawned`, `messages`, `log`, and 558 `tool_call` lines you can skip. **Fold it with the existing replay if it is fast** (look at how `core/Session/` or `core/Item/Store.js` replays a log, e.g. `Item.root_from`), so state is computed by the same code as everywhere else (law 7). If that replay pulls in the whole slow session page, write a small fold in your class instead, and say why in a comment. Measure load time (fetch to drawn) at 400 wide and log it; target well under 1 s.

## Look and reuse

- Look at `public/live/calibration/page.js` for how a page.js under /live/ is written today, and at `public/live/LivePage.js` / `LivePage.css` for the header look. Use the ui/ parts above, framework.css utilities and Material icons (`icon` from View). No new CSS file and no local styling.
- One class per file, named for the file. One lean test (`SessionView.test.mjs`) for the fold: counts by state from a small fixture, under 1 s.

## Proof

- Headless shots at 400 and 1200 of `/live/session/`, saved in this task folder and committed. Read them yourself: one-line titles, nothing struck through, groups clear.
- `node Server/smoke.mjs <worktree>` with no FAIL.
- One line in `public/live/readme.md` naming the page.

## How

- Work in a worktree (`take_worktree`). `public/live/` is gitignored, so add new files with `git add -f <exact path>`. Commit by exact path.
- **Don't edit** `public/live/LivePage.js`/`LivePage.css` (another worker is on them), `core/Page/`, `core/Plugin/`, `core/List/`, `Servex/agents/page_tools.js`, or the session's `session.jsonl`.
- **Don't merge.** Log the branch, commits, shots, load time and test result as `log` lines on your task, then `close_task` with outcome and evidence.
- Never: kill or restart the dev server or Servex, drive the owner's tabs, use git's stash, or delete recursively in the main tree.
