# ext renames — requirements (approved 2026-08-13, held for the usage window)

Mike's rule: **an ext that is a class gets a capitalized dir with
`Classname.js` inside** — the case signals `new Thing`, matching core
(`core/View/View.js`, `core/Item/Item.js`). Function/patch exts stay lowercase.

## The renames

- `ext/saver/` → `ext/Saver/` (Saver, FileSaver, MemorySaver, LocalStorageSaver)
- `ext/draggable/` → `ext/Draggable/` (Draggable, Sortable)
- `ext/ai/` → `ext/AISession/` (AISession + dashboard/message/prompt/replay/stats)
- `ext/panel/` → `ext/Panel/`, and inside it: `Panel.class.js` → `Panel.js`;
  `panel.js` splits into `workspace.js` (the doors — `panel()`, `workspace()` —
  the recursive view, bar controls, `scatter()`) and `PanelDrag.js`
  (`PanelDrag`, `grip()`, `coalesce()`). The `.class.` suffix dies with the
  split — `Panel.js` vs `panel.js` collide on Windows in the SAME directory
  regardless of the dir's case. `panel.css`, `templates.js`, `templates.css`,
  `page.js`, `readme.md` keep their names.

## Hazards (why this is one careful worker, not a find-replace)

- **Case-only dir renames**: two-step `git mv` (`git mv panel tmp && git mv
  tmp Panel`). Windows dev serving is case-insensitive, production hosting is
  not — a missed import works locally and 404s deployed, silently.
- Sweep EVERY reference: imports across `public/` (app.js export lines,
  ext/editor, exec-summary pages, my sandboxes), the `children:` string in
  `ext/page.js` (dir names are urls), prose links (`/framework/ext/panel/` →
  `/framework/ext/Panel/`), css `/* css: */ ` comments, readmes.
- Verification: `git status` shows pure renames; grep finds ZERO old-case
  runtime references; `node --check` all touched JS (scratchpad `.mjs`
  copies); browser pass on `/framework/ext/Panel/` (+`/full/`),
  `/framework/ext/editor/`, `/framework/ai/2026-08-13/` and the ext index —
  zero console errors. Playwright is global; the dev server on :80 stays up.

One Sonnet worker, next 5h window. No commits.
