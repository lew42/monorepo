# File explorer: requirements

The owner's words are in `owner-words.md`; the file explorer is the second half. Read them in full.

## Asks (tick each against the owner's sentence)

1. **Audit ext/files as it is today.** What's the tree (a real tree with expandable folders, or a flat list)? Where does the primitive toolbar above it come from? What does "no readme found" come from? Screenshots at 1920 and 3440.
2. **Strip ext/Panel out of the file explorer.** The panel overlay buttons and chrome are "very cluttered". Keep resizable columns using the core Page column mechanism or ext/grip (see /framework/ai2/2026/09/28/resizable-columns-how-they-work-today/), not Panels.
3. **A real file tree:** folders expand and collapse; the file's contents show on click (highlighted source, which exists today).
4. **A full-screen route at any path:** `<any path>/fs` opens that directory's files in full-screen mode. It's a dynamic route, with no page.js per folder. Check how the Page router can handle it (a route() hook), and whether the trailing slash matters.
5. **A link to it from the page template:** every page can link to its own /fs view (a small link; don't rebuild navigation).
6. **Keep the Files tab on class/module doc pages working.** Check whether it loads the widget automatically, and whether it's cramped inside tabs, padding and the sidebar; if so, link to /fs for the big view.
7. **NOT now:** a per-file readme (a three-column view with the readme beside the code). Note it as later.

## Rules
Work in a pool worktree (take_worktree). Run the smoke test with links followed, merge with node Server/merge.mjs, get a fresh-eyes review with screenshots, and land with a Next/Next walkthrough. ext/files has other users (ext/Doc's Files tab, the AI 2 card folders via Log.js draw_folder()); don't break them. Post progress on card 2026/09/28/file-explorer-no-panels-full-screen-at-a, two sentences at a time.
