# AI 2: an inbox row that IS a real page (first: the Page class)

Load the `minion` skill first, then `code`, `page` and `layout`.

## The owner's words

Verbatim, in full: `public/framework/ai/2026/09/28/inbox-rows-are-the-real-pages-page-class/owner-words.md`.
Read all of it. The key sentences: "we could render the actual page class right there in the inbox.
And so the inbox is sort of just a different navigation mechanism for like recent things." —
"it's the exact same page as the framework core page. It's just, like I said, a different way to
jump there." — "if we then are doing some work on Servex, boom, class Servex pops to the top of the
list and I can click over to it" — "Let's just use the main views that we got." — "the detail area
is like a full... height and can be a fill width type area" — "the drawer should be contextual to
whichever page is actually active and frankly it should be the same AI sessions as if I were on the
actual page."

This supersedes the `?view=workspace` experiment where they overlap; leave the workspace code alone.

## Step 1: answer two questions, in `answers.md` in this task dir (worktree), short and plain

1. Can the Page router render any site URL (e.g. /framework/core/Page/, /framework/servex/) inside
   the AI 2 detail area, as the same Page object and the same view? How (import its page.js and
   mount it? a child route of ai2 that delegates? the router's own lookup by path?), and what breaks
   (its tabs' routed children, its own `children:`, `.active-page` marks, sidebar nav, relative URLs)?
2. How does a row know its page? Options: a `{"page": "/framework/core/Page/"}` line on a card
   (latest wins), or events keyed by path. Pick one and name the alternative.

## Step 2: build the smallest version

- ONE rail row for **/framework/core/Page/** (the Page class). Its title is the page's own title
  ("Page"); its sub-line is the existing "what happened" bar (`activity.js`), from the newest event
  that bumped it. It sorts by recency like every other row.
- Clicking it renders the **actual** /framework/core/Page/ page in the detail area, full height and
  filling the width — the same page, not a copy or a summary. Routed: its own URL under
  /framework/ai2/ (e.g. `/framework/ai2/framework/core/Page/` or what step 1 finds cleanest); reload
  and Back land on it; the page's own tabs keep working inside it if cheap (say if not).
- The drawer follows it: call `drawer.page("/framework/core/Page/")` (exported from `/app.js`) when
  the embedded page mounts and `drawer.page(null)` when you leave it (answer from task-mastermind-page-drawer).
- **Card folders keep working** for every other row, unchanged.
- If a Servex row is one line more, do it too (/framework/servex/); otherwise say so.

## Proof

Headless (scratchpad `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\546c308f-a944-4905-95a1-68d84991524f\scratchpad`,
files `ai2p-*.mjs`, shots in this task dir in the worktree), reached by clicking the row in the rail:
1920x1080 and 3440x1440 shots of the Page row opened; one of the drawer open on it showing the
Page path. Zero console errors and zero failed requests on /framework/ai2/, the Page row's url, a
card, a group, and /framework/core/Page/ loaded directly (it must be unchanged there).

## Fence and where

Worktree only: `C:\Code\lew42\worktrees\ai2-real-pages` (branch `worktree/ai2-real-pages`), server
http://localhost:52409/ . Write only under `public/framework/ai2/**` and this task dir. Do NOT edit
core/, app.js, the drawer, or `ai2/fold.js` (another task is changing fold.js). If core needs a change,
stop and say exactly what, in answers.md. Never edit C:\Code\lew42\monorepo. Traps: no DOM after an
await; CSS in a layer; URLs against import.meta. Any process: `windowsHide: true`. Commit in the
worktree (`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`); no landing line.

Report: the two answers in one line each, commit hash, shot paths, the row's URL, anything left.
