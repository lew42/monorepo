# File system: requirements

The owner's words are in `owner-words.md`; the first two-thirds are about files.

Start from what exists:
- `ext/files` (`files.js`, `fs.js`) — the file explorer, landed 09-28 with Panels removed, a real tree and `<path>/fs`. Walkthrough: /framework/ai/sessions/2026/09/28/file-explorer-fs/file-explorer-fs/walkthrough/
- the class-doc Files tab (`ext/Doc`)
- the AI 2 card folders (`Log.js` `draw_folder()`)
- the item-ui task building icon items and trees — coordinate with `task-mastermind-item-ui`

## Asks
1. **Audit, briefly:** what file and directory data structures exist today (in fs.js? in directory.json?), where each file UI lives, and what's duplicated. As a table.
2. **The data first, then the UX.** Clear classes, named with the `naming` skill: e.g. `File` and `Directory` (a path, a name, children, and read, fetch and render), plus a tree built from them. A file's default view is an icon item. Decide whether this becomes a new ext (e.g. `ext/fs`, "file system") that ext/files' UI sits on, or whether ext/files grows. Keep ext/files' current users working.
3. **Operations,** as far as the static site allows (reads everywhere; writes only through the dev server on localhost): read, fetch, render, and a right-click context menu (copy path, open in /fs, open raw).
4. **Link to a file, and to a LINE:** `<any path>/fs/<file>#L42` (or similar) opens the tree down to that file and scrolls to and highlights line 42. Add a helper, e.g. `file_link(path, line?)`, for readmes and pages. For a METHOD, prefer linking its class-doc method page over a line number.
5. **Layout:** on framework pages, KEEP the framework nav and swap everything else: the file tree, then one or more code columns. A two-column version (tree plus code) is fine for small spaces; the full view should feel roomy like VS Code, not claustrophobic. No stacked layers of navigation (the owner disliked the Files tab's many layers). Look at earlier editor or workspace attempts and reuse them.
6. **Every system page links its files** through this (page-system's pages, the Servex docs).

## Rules
Keep v1 of the explorer reachable. Use a pool worktree, the smoke test with links followed, merge.mjs, a fresh-eyes review, and screenshots at 1920, 3440 and 400. At most 3 minions; budget about $12. Post your session id and then progress on card 2026/09/29/file-system-file-and-directory-objects-f.

