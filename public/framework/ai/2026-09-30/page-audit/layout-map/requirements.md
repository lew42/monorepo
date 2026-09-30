# Map every page layout to its code (minion brief)

Parent: mastermind-page. Read-only on the repo. You write only `layouts.md` and `layouts.json` in THIS folder.

## The job
Find every page LAYOUT (a whole-page arrangement: how a page's screen is divided, and where its navigation sits) that the site's pages use, and say where each is defined in code and how to recognize it in the rendered DOM.

Start from these, and add any you find:
1. **Doc pages / top tabs**: `public/framework/ext/Doc/` (a page whose children are tabs beside the title).
2. **Column pages**: `page.columns()` in `public/framework/core/Page/` (`overview/columns/`, `doc/columns.md`, `Page.css`).
3. **The inner left nav / switcher**: `public/framework/core/Page/layout/switcher/`.
4. **The floating page**: `public/framework/core/Page/layout/floating/`.
5. **The AI 2 shell**: `public/framework/ai2/` and `public/framework/ai/v/` (the AI dashboard; its tabs are right-aligned: find exactly why, file and line).
6. **Card pages / preview walls**: `browse()`, `catalog()`, `demo.tree()`, the "wall" of preview cards (`core/Page/overview/`, `core/Page/doc/previews.md`).
7. **The site shell**: `public/app.js`, `public/framework/core/App/`, `core/Sidebar/`, the default `.page.standard`.
8. **/imagine/** and **/layouts/** (`public/imagine/`, `public/layouts/`): what layouts their pages use, and whether they build their own shell.
9. Any page that builds its OWN tab strip, sidebar or shell instead of calling one of the above (grep `page.js` files for hand-made tabs: `class("tabs")`, `tab`, `role=tablist`, `position: fixed`, own `nav(`). List each re-implementation with its file.

For each layout: `name` (plain words), `defined_in` (file paths), `api` (how a page opts in: a call, a class, a config word), `dom_marker` (a CSS selector that exists in the rendered DOM ONLY on pages using it; check it in the CSS/JS source), `page_js_count` (how many page.js files opt in, by grep), `examples` (3 urls), `tab_alignment` if it has tabs (where the tabs sit relative to the title, and the CSS rule that puts them there).

## Output
- `layouts.json`: an array of those objects, plus a `reimplementations` array `{file, what, should_use}`.
- `layouts.md`: the same as a table, then the re-implementations, then 5 lines on why pages drift from the shared layouts (what you saw).

## Never
Never edit any other file. Never `git stash/checkout/reset`.

## Return
10 lines at most: the layouts found with their page_js_count, the AI 2 right-aligned-tabs cause in one line, the re-implementation count.
