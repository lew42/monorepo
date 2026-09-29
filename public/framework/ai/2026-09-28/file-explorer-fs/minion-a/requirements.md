# Minion A: the file explorer without Panels

Load the `minion` skill first, then the `code` and `css` skills.

**Read first:** the owner's words in `../owner-words.md` (the file-explorer half), the task brief `../requirements.md`, and the card's folder `public/framework/ai/2026/09/28/file-explorer-no-panels-full-screen-at-a/`. How resizable columns work today: `public/framework/ai/2026/09/28/resizable-columns-how-they-work-today/about.md`.

Owner, verbatim: "the file explorer widget that we have right now is using the panel system, which is really cluttered and kind of broken … it should be a a file tree so we can expand uh, directory subdirectories … there's like a very primitive toolbar above that whole file explorer system that's kind of strange … let's strip the panels out of the file explorer system and do kind of like a audit of that file explorer".

## Where you work

- Worktree: `C:\Code\lew42\worktrees\file-explorer-fs` (branch `worktree/file-explorer-fs`). Its server is `http://localhost:52659/`. Commit there. Do not merge; the task mastermind merges.
- **Fence (you write only these):** `public/framework/ext/files/**` in the worktree, **except** `ext/files/fs.js` (minion B owns that file). Also your own log `minion-a/task.jsonl` and `audit.md` plus `shots/` in the task dir of the MAIN tree: `C:\Code\lew42\monorepo\public\framework\ai\2026-09-28\file-explorer-fs\`.
- A second minion (B) works in the same worktree at the same time, on `ext/files/fs.js`, `core/Page` and `ext/Doc`. Don't touch those.

## Deliverables

1. **Audit, before you change anything.** Write `audit.md` (one screen, plain sentences, pictures first): is today's tree a real tree or a flat list? where does the toolbar above it come from? where does "no readme found" come from? who uses `files()` (grep: ext/Doc's Files tab, `core/Page/Log.js` `draw_folder()`, `ai2/card.js`, others)? Screenshots at 1920 and 3440 wide of `/framework/ext/files/` and one ext/Doc Files tab, saved to `shots/before-*.png`. Use headless Playwright (a probe script in the session scratchpad named `fe-a-*.mjs`), never the owner's tabs.
2. **Strip ext/Panel out.** `files()` no longer imports `panels.js` or anything from `ext/Panel`. Delete `panels.js`. Delete the primitive toolbar above the explorer, whatever it is.
3. **Resizable columns without Panels.** Columns sit side by side: tree | source (tree | about | source when `about` is given). Dragging the seam between two columns resizes the left one, using `ext/grip` (`public/framework/ext/grip/grip.js`, whose `write(px)` sets the width). Keep it plain flex.
4. **A real file tree.** Folders expand and collapse on click (a chevron or folder icon that turns). Clicking a file shows its highlighted source (`source()` / `code.file`, as today). The selection still lives in the url query (`?file=`) for the first `files()` on a page, as today.
5. **Two new options that minion B needs** (keep the signature `files(meta, names, opts)`):
   - `fill: true` makes the explorer take the full height of its box (the columns scroll on their own; the page does not).
   - `open: <n>` opens folders down to depth n at start and leaves deeper ones collapsed (default: all open, as today). A collapsed folder's rows are built on first expand, not before: B will hand it thousands of paths.
6. **Nothing that uses it breaks.** ext/Doc's Files tab (the `about` column) and the AI 2 card folders still work. Load `/framework/ext/files/`, one ext/Doc page's Files tab (e.g. `/framework/ext/files/` itself or `/framework/core/View/`, find one) and `/framework/ai2/` on the worktree server with zero console errors.
7. Update `ext/files/readme.md`, `page.js` (show, don't tell) and `doc/` so they describe what is there now; remove `doc/panels.md` or rewrite it. Note in the readme, under later: "a per-file readme in a third column (the owner: not now)".
8. After shots at 1920 and 3440 to `shots/after-*.png`.

## Rules

- `windowsHide: true` on every Node spawn; no windows pop up, ever.
- No new npm dependency. No build step. Every CSS rule inside a layer. New class names: run the `new-css-class` skill (the `files-` prefix is yours).
- Don't restart the dev server on port 80; your worktree server is yours to use.
- Log decisions and caveats to `minion-a/task.jsonl` with `node .claude/hooks/append.mjs` as they happen.
- Budget: `files.js` + `files.css` together should stay near today's size (~180 lines); explain in the log if you go over by much.

## Report back

A short answer: what you changed (files), the audit's three answers, the shot paths, anything left and why.
