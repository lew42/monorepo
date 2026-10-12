# Minion C — clear the two review findings, then re-shoot

Load the `minion` skill first. Task dir (read it for full context — owner's words, requirements,
minion-a's audit, minion-b's notes): `public/framework/ai/2026-09-28/file-explorer-fs/`.

Work in the existing worktree at `C:/Code/lew42/worktrees/file-explorer-fs` (branch
`worktree/file-explorer-fs`, already has both minions' commits: `f250ef84` strips ext/Panel out
of ext/files, `ad417e41` adds the `/fs/` route). Its own dev server should already be running
(check `.worktrees.json` for the port, or start it if needed — never a visible window).

## Your fence

- `public/framework/ext/demo/page.js`
- `public/framework/ext/files/readme.md`

Nothing else. Don't touch `ext/files/files.js`, `fs.js`, `Page.class.js`, or `ext/Doc/Doc.js` —
those are done and reviewed.

## The two fixes (from `review.jsonl`, findings #2 and #3)

**#2 — `ext/demo/page.js` describes a deleted feature.**
- Line 187-191 calls `files(import.meta, "readme.md demo.js stage.js exhibit.js", { columns:
  "render" })`. Its caption says "Choose **2 columns**... shift-click to fill the second." That
  mode and its switcher bar are gone (ext/Panel came out of ext/files this week).
- Drop `{ columns: "render" }` from the `code.js` example and the live call.
- Rewrite the caption to match today's `files()`: a two-column tree+source view, folders
  expand/collapse, drag the `ext/grip` seam to resize. One sentence, same register as the page.

**#3 — say the cut out loud.**
- The 2-column "code + rendered" mode and the Panel toolbar were deleted outright, not just
  de-panel'd — beyond the owner's literal ask, but matching "very cluttered... let's strip the
  panels out."
- Add one line to `ext/files/readme.md`'s `## Later` section, next to the existing "third
  column" bullet, noting the mode was cut with the panels and can come back on request. One
  line, same style as the existing bullet.

## Then: real after-shots

The task's last review ran against `michael/dev` by mistake (this worktree wasn't registered in
`.worktrees.json`, so `Server/review.mjs` fell back to screenshotting the wrong site — a review
tooling gap, not a code problem; don't chase it). Take fresh screenshots against **this
worktree's own server** (check `.worktrees.json` for the port; `mcp__site__shot` or a headless
Playwright script, `windowsHide: true`, never the owner's tabs):

- `/framework/ext/files/` at 1920 and 3440 — the new tree + grip columns, no Panel toolbar
- one `/fs/` view, e.g. `/framework/ext/files/fs/`, at 1920
- one `ext/Doc` Files tab (e.g. `/framework/ext/files/files/`) at 1920, showing the "Open full
  screen" link

Save them into `public/framework/ai/2026-09-28/file-explorer-fs/minion-c/shots/`.

## Commit

Commit your two fenced files, in the worktree, on the existing branch. One short commit message.
Zero new console errors on the pages above and on `/framework/ai2/`. Log your steps in
`public/framework/ai/2026-09-28/file-explorer-fs/minion-c/task.jsonl` the way minion-a and
minion-b did (see their files for the shape). Write a short `notes.md` (what you changed, links
to the shots). Report back when done — the task mastermind runs the review turns, smoke test,
and merge.

Budget: about $1.50. Small, contained fix — don't expand scope.

