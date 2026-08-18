# framework-css-load — move the framework.css load from View.js to app.js

Mike, 2026-08-17: importing a class file (`View.js`) must not opt you into a stylesheet. Fable's
call: `/app.js` — the site's composition root — loads `framework.css` and **prepends** its
`<link>`, so the one `@layer base, theme, site, util;` statement in framework.css is first in
`<head>` in every document (core CSS like `Page.css` loads during import, *before* app.js's body
runs — prepend is what makes that safe). No inline `<style>` in `index.html`: that would couple
the layer signature to every hand-written html file.

## Do (Law#1: as little as possible)

1. `public/framework/core/View/View.js` — delete the framework.css block at the bottom (the
   comment + `View.stylesheet(import.meta, "../../framework.css")` + `document.head.prepend(...)`).
2. `public/app.js` — before `App.stylesheet("/styles.css")`:
   ```js
   // framework.css goes FIRST in <head>: its @layer statement fixes the layer order for every
   // stylesheet after it, including the ones core modules loaded during import.
   App.stylesheet("/framework/framework.css");
   document.head.prepend(document.head.lastElementChild);
   ```
3. `public/fly/index.html` imports `View.js` directly, so it loses framework.css: add
   `<link rel="stylesheet" href="/framework/framework.css">` ABOVE `fly.css`.
4. Docs, minimal: delete `public/framework/core/View/doc/framework-css.md`, drop `framework-css`
   from `notes:` in `core/View/page.js`, delete the "`import View` loads `framework.css`" trap
   line in `core/View/readme.md`. In `public/framework/framework.css` line 1 comment: "app.js puts
   this file first" (not View.js). In `public/framework/styles/readme.md` (the `@layer` bullet
   under "The four things that fail silently"): app.js, not View.js; add: *a hand-written html
   file links `/framework/framework.css` first (fly/index.html) or has no fixed order.*
   `.claude/skills/code-architecture/SKILL.md` §6 and `.claude/skills/css-strategy/SKILL.md` §4
   say "View.js puts it first" → app.js.
5. Verify (never Mike's live tabs — headless Playwright, globally installed):
   `node "C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/f4bc3a9e-dcfa-429b-97ee-931bb9e17fbf/scratchpad/probe-order.mjs"`
   and `.../probe-layers.mjs` — every page must print `winner: rgb(4, 4, 4) ✓` and
   `first: /framework/framework.css`, `declaring: ["/framework/framework.css"]`. Also
   `/fly/` must still show framework.css first. `node --check` any .js you edit.
6. Log to `task.jsonl` here (append-only, no BOM — use the Write tool or bash printf): a
   `{"log": …}` line per finding, and last `{"assign": {"step": 4, "landed_at": "<ISO local>",
   "outcome": "**…** first line what landed"}}`.

⚠ Dev server is running (pid 28884); do not restart it. Do not touch anything else.
