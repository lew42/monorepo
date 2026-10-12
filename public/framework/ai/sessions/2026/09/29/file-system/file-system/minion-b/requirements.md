# Minion B — the /fs explorer, v2: framework nav kept, tree + code columns, line anchors

Load the `minion` skill first, then `code`, `page`, `layout` and `css`.

Read in full: [../owner-words.md](../owner-words.md), [../requirements.md](../requirements.md),
[../audit.md](../audit.md), minion A's report in [../minion-a/task.jsonl](../minion-a/task.jsonl) and
the new `ext/fs/readme.md` in the worktree (the File and Directory objects and the `file_link` url
form you build on). The card: `public/framework/ai/2026/09/29/file-system-file-and-directory-objects-f/`.

**Work in the worktree `C:\Code\lew42\worktrees\file-system`** (its server: http://localhost:55895/).
Commit by exact path. Every Node spawn sets `windowsHide: true`.

## The owner's words that decide this piece

> "VS Code needs to be as big as it can be just to have multiple columns and be able to actually
> use the thing without getting claustrophobic. Although a smaller two column, with just the file
> tree and one column of code isn't terrible."
> "on framework pages, we want to leave the framework navigation there as much as possible and swap
> out everything else. So maybe it goes from the framework navigation down to the file tree and
> then one or more code columns when we're linking to a specific file."
> "link to a specific file, potentially even a specific line number … anchor to a specific line number"
> The class-doc Files tab: "I didn't like because it had too many layers of navigation."

## Deliverables

1. **Keep v1 reachable.** Today's `/fs/` (full screen, `.layout-full`, no site nav) stays one click
   away: make it a class and v2 a variant that extends it; a small switch (or `?v=1`) returns to v1.
2. **v2 layout:** the site's framework navigation stays exactly where it is; everything to its right
   becomes the explorer, filling the rest of the window (no page padding eating it, no page scroll:
   the columns scroll). The file tree, then one code column; opening a second file (a toolbar button
   or a modifier-click, your call, stated in the readme) adds a second code column. Plain flex +
   `ext/grip` seams, as ext/files does now. ONE toolbar at most (the file's path, copy, raw,
   close column). No stacked tab bars. Look at `ext/Panel/Workspace`, `ext/editor` and
   core/Page's resizable columns first and reuse what fits.
3. **Line anchors:** `#L42` scrolls the code column to line 42 and highlights it; `#L40-L48` a range.
   The code shows line numbers (a gutter); clicking a number puts `#L<n>` in the url, as GitHub does.
   This needs `ext/highlight`'s `code.file()` output to carry lines: add it there as an option without
   changing its output for any other caller.
4. **Sizes:** roomy at 1920 and 3440 (at 3440 two or three code columns fit); at 400 the tree folds
   away behind a button and one code column fills the width.
5. **The class-doc Files tab** (ext/Doc) gets fewer layers: judge it after v2 exists. If it can link
   to or embed v2 instead of its own nested columns, do it; keep its `about` prose column working.
6. **Icon items:** if `ui/item` has reached michael/dev (`git log michael/dev -- public/framework/ui/item`),
   merge michael/dev into the worktree and switch the file's `render()` and the tree to it:
   `ui.item({ icon: "description", name, href, end: "menu" })`; a folder is
   `ui.item({ icon: "folder", name, open, children: [...] | fn })` (import `{ ui }` from `/app.js`).
   If not, leave the row as it is and say so.
7. Update `ext/files` readme and `doc/`, and `ext/fs` readme, for what you changed.

## Fence
Yours: `public/framework/ext/files/**`, `public/framework/ext/fs/**` (coordinate by reading A's
code; A has finished), `public/framework/ext/highlight/**` (the line option only), the Files tab code
in `public/framework/ext/Doc/**`. Not yours: other pages' links (minion C), core/Page beyond
`fs_folder()`.

## Done means
Screenshots at 1920, 3440 and 400 of a `file_link` url with a line, reached from the rail
(open `/framework/ext/files/`, then the link), saved in `minion-b/shots/`; you open each and say in
one line what it shows. Zero console errors on `/framework/ext/fs/`, `/framework/ext/files/`,
`/framework/ext/files/fs/` (v1 and v2), `/framework/ext/Doc/` and `/framework/ext/highlight/`.
Commit, log in `task.jsonl` beside this brief, and end with a five-line report. Budget: about $4.


## Notes from minion A's landing (the mastermind, 16:55)
- The data ext is `ext/filesystem` (renamed from `ext/fs`: `/ext/fs/` collided with the site's own
  `<path>/fs/` url). A file_link url looks like `/framework/ext/filesystem/fs/FsFile.js/#L42`.
- Its overview page has a large empty gap above the "Folder" row at 1920
  (`minion-a/shots/ext-fs-1920.png`); fix it while you're in there. Its readme names `fs.css`,
  the file is `filesystem.css`.
- An empty leftover dir `public/framework/ext/fs/doc/` in the worktree: delete it.
