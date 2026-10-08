# Minion A — ext/fs: File and Directory objects, operations, file_link

Load the `minion` skill first, then `code`, then `naming` before you name a class.

Read in full: [../owner-words.md](../owner-words.md) (the owner's words; the first two-thirds are
about files), [../requirements.md](../requirements.md), and [../audit.md](../audit.md) (what
exists today). The card: `public/framework/ai/2026/09/29/file-system-file-and-directory-objects-f/`.

**Work in the worktree `C:\Code\lew42\worktrees\file-system`** (branch `worktree/file-system`,
its server at http://localhost:55895/). Never edit the main tree's copy. Commit by exact path.
Every Node spawn sets `windowsHide: true`.

## The owner's words that decide this piece

> "maybe we create a new extension called a file system that handles all the file-based user
> interface stuff. So like, for each little file, having operations for reading and writing and
> fetching and rendering and the file tree and right clicking for context menus … the file
> objects could have a default view like an icon item, but they might be just more like data
> structures."

## Deliverables

1. **`ext/fs/`, a new ext: the data.** Two classes (names via the `naming` skill; `File` shadows
   the browser's global `File`, so weigh that): a file (path, name, extension, parent, url) and a
   directory (path, name, parent, children, find(path), walk()). One loader builds the tree from
   `/directory.json` once and shares it (reuse `core/Page/Markdown.js`'s `tree()`/`node()`; don't
   fetch it a second time). House style from the `code` skill: assign-based, every method a seam.
2. **Operations** as methods: `read()`/`fetch()` (the text), `render()` (its default view: an icon
   and a name, one row; `ui/item` from the item-ui task is not merged yet, so draw the same row
   ext/files draws today, one method, so it can switch to `ui/item` later), `write(text)` only on
   the dev server (reuse the socket `write` rpc that `ext/Saver/FileSaver.js` uses; off localhost it
   refuses clearly), `raw_url`, `fs_url(line?)`.
3. **`file_link(path, line?)`**, exported from ext/fs and from `/app.js`: returns a link to
   `<the file's directory>/fs/<file name>#L<line>` (line optional). Decide the exact url form and
   write it in the readme; minion B builds the line highlight on it, so the url must carry the file
   path and the line. Make the url route: opening it shows `/fs/` with that file selected (extend
   `ext/files/fs.js` and, if needed, `Page.fs_folder()` in `core/Page/Page.class.js` minimally).
4. **Right-click menu** on any file row in the tree: Copy path, Open in /fs, Open raw. Use
   `ux/Menu` if it fits a right-click; otherwise a small menu of your own in ext/fs.
5. **ext/files sits on ext/fs:** `fs.js`'s `list()` and `files()`'s tree use the new objects.
   `files()`'s signature and every current caller keep working: `ext/Doc` Files tab, `core/Page/Log.js`
   `draw_folder()`, `/fs/`, the ext/files page. Don't change the /fs layout (that is minion B's).
6. **ext/fs module files:** `readme.md` (index shape: what · Use · Watch out · More), `page.js`
   (show, don't tell: a live directory as a tree, a file's row, a `file_link` with a line, the menu),
   `doc/`, and a line in `ext/page.js`'s `children:` so the page exists.

## Fence
Yours: `public/framework/ext/fs/**`, `public/framework/ext/files/**`, the `fs_folder()` seam in
`core/Page/Page.class.js`, one export line in `public/app.js`, one line in `ext/page.js`.
Not yours: the /fs layout, line highlighting (minion B), any other page's links (minion C).

## Done means
Load `http://localhost:55895/framework/ext/fs/`, `/framework/ext/files/`, `/framework/ext/files/fs/`,
`/framework/ext/Doc/` (its Files tab) and a `file_link` url with zero console errors (use
`node Server/smoke.mjs` or a headless Playwright probe in the scratchpad). One screenshot of the
ext/fs page at 1920. Commit, log in `task.jsonl` beside this brief, and end your turn with a
five-line report: the class names and why, the url form, what you reused, what you left.
Budget: about $4.

