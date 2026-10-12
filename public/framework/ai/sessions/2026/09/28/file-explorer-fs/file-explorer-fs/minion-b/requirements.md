# Minion B: `<any path>/fs/`, the full-screen file view

Load the `minion` skill first, then the `code` skill.

**Read first:** the owner's words in `../owner-words.md` (the file-explorer half), the task brief `../requirements.md` (asks 4, 5, 6), the card's folder `public/framework/ai/2026/09/28/file-explorer-no-panels-full-screen-at-a/`.

Owner, verbatim: "if you go to any path slash fs … maybe you leave the the ending slash off so it, it actually looks more less like a page.js and more like a dynamic path any path slash fs just loads the file system in full screen mode showing you just the files in that directory … you could even have a little link to it from any page template, you know, could just link to the FS page." And about the doc pages' Files tab: "if that file system … is nested within the left sidebar, within the page padding, within the tabs, you know, it'll be much much smaller than it should be".

## Where you work

- Worktree: `C:\Code\lew42\worktrees\file-explorer-fs` (branch `worktree/file-explorer-fs`), server `http://localhost:52659/`. Commit there. Don't merge; the task mastermind merges.
- **Fence (you write only these):** `public/framework/ext/files/fs.js` (new), `public/framework/core/Page/Page.class.js` (the smallest change that works), the one core/Page file that draws a page's header or tools (find it; one small link), and `public/framework/ext/Doc/Doc.js` only for a link from the Files tab. Your log is `minion-b/task.jsonl` in the MAIN tree task dir: `C:\Code\lew42\monorepo\public\framework\ai\2026-09-28\file-explorer-fs\`; notes and shots go there too.
- Minion A rewrites the rest of `ext/files/` (files.js, files.css, page.js, docs) at the same time, removing ext/Panel. Don't edit those files. A adds two options to `files(meta, names, opts)` that you use: `fill: true` (the explorer takes the full height of its box) and `open: <n>` (folders open down to depth n, deeper ones collapsed and built on first expand). Until A lands they are ignored harmlessly, so build against them.
- core/Page belongs to another mastermind's documentation work. Touch only code, keep the diff small, and don't edit core/Page's readme or doc/.

## Deliverables

1. **The route.** `/framework/ext/`**`fs/`** (any path + `fs/`) shows every file under that directory in the explorer, full screen. One seam in `Page.child()`, handled like the special name `md` is (see `md_folder()`), with a lazy `import("../../ext/files/fs.js")`, so no page.js per folder. `fs.js` reads the file list from `/directory.json` (the dev server writes it; `PageMarkdown.tree()` in `core/Page/Markdown.js` already reads and walks it, reuse that), then calls `files()` with `fill: true, open: 1`. Paths resolve against the site root (`{ url: location.origin + "/" }`), never the document.
2. **Full screen.** The view fills the window: no sidebar, no page padding. Check `core/Page/words.js` (`full` is `.page.solo`, "a takeover, there is a way back at the top") and use that rather than inventing CSS. Include a way back to the folder's page.
3. **Trailing slash.** Find out and write down in `notes.md` whether `/x/fs` (no slash) and `/x/fs/` both land. The Router may redirect one to the other; say what happens, and make both work if it's cheap.
4. **Production.** Production has no `directory.json` (see `no_list()` in Markdown.js). Make `/fs/` say so plainly there instead of breaking. Test it by temporarily pointing the fetch at a missing file.
5. **The link from every page.** A small **"Folder"** link (the `folder_open` icon plus the word "Folder"; NOT "Files", because pages already have a top tab named Files) to `./fs/` in the page header or tools, wherever core already puts small per-page tools. Don't rebuild navigation. It must not appear on the /fs view itself.
6. **The doc pages' Files tab.** On ext/Doc module pages (e.g. `/framework/ext/files/` or `/framework/core/View/`), check whether the Files tab loads the widget on its own, and measure how cramped it is (width of the explorer vs the window at 1920). Add a small "Open full screen" link in that tab to the module's `fs/` route.
7. `notes.md` in the task dir: one screen, what you found about the router hook and the trailing slash, with shots at 1920 of `/framework/ext/fs/` and `/framework/fs/` saved to `shots/fs-*.png` (headless Playwright, a scratchpad script named `fe-b-*.mjs`, never the owner's tabs).
8. Zero console errors on `/framework/`, `/framework/ext/fs/`, `/framework/ai2/` and one ext/Doc page, on the worktree server.

## Rules

- `windowsHide: true` on every Node spawn. No popping windows, ever.
- No build step, no new npm dependency, every CSS rule inside a layer, new class names through the `new-css-class` skill.
- No DOM after an `await`: capture the box synchronously, fill it in a callback (see how `files()` does it).
- Don't restart the port-80 dev server.
- Log decisions and caveats to `minion-b/task.jsonl` with `node .claude/hooks/append.mjs` as they happen.

## Report back

A short answer: the route's shape (the diff in Page.class.js, line count), the slash answer, where the link sits, the Files tab finding, the shot paths, anything left and why.
