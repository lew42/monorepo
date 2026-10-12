# Icon system build: minion brief

Load the `minion` skill first, then `code`, `css`, `new-css-class`, `page`. The owner's words: `../owner-words.md` (read in full; they are the acceptance test). Parent brief: `../requirements.md`.

**Worktree:** `C:/Code/lew42/worktrees/qf-9` (branch `worktree/qf-9`, its own server at http://127.0.0.1:63467/). Write and commit ONLY there, never in the main tree. Don't merge; the mastermind merges.
**Fence (in the worktree):** `public/framework/ui/icon/` (new module: readme.md, page.js, doc/, icon CSS), the icon block in `public/framework/framework.css` (around line 544, `.material-icons` / `.icon`), and `public/framework/ui/page.js` `children:` to declare the new page. Migration files come later in a second message from the mastermind.
**Budget:** about $5. Sonnet. Read only what you need.

## Build first, fast
Existing pieces to reuse, not duplicate: `icon()` in `core/View/View.js` (span.material-icons.icon), `.icon { font-size:1.25em; line-height:1 }` in framework.css, and the icon items in `ui/item/` (landed yesterday: /framework/ui/item/). Read ui/item's CSS before you write any.

## Deliverables — one page, `/framework/ui/icon/`, a demo of each
1. **Icon alone:** no frame (inline with text), and framed. The frame is a fixed em box (e.g. `width:1em;height:1em` relative to the icon's font-size, flex-centred both ways), so raising the container font-size scales icon, frame and padding together.
2. **Icon button:** flush (no background), with a background, with a hover background, and a TOGGLE (on = lit background, off = dim; clicking flips it, `aria-pressed`).
3. **Rail** of icon buttons, mixed flush and backed.
4. **Icon items in a list** (use ui/item): with a background (needs padding) and without (gap only). The hover background's EDGE must line up with the parent's edges and padding — show a parent with a visible background/outline so alignment is checkable.
5. **Every demo at 3 font sizes** (e.g. 14px, 18px, 28px containers) side by side, aligned vertically and horizontally. Add a thin baseline/centre guide toggle if cheap.
6. Keep new CSS minimal: a few classes in the `ui` scope (check `css-scopes.txt`), inside a CSS layer. Don't break existing `.icon` users: extend, don't rename. Keep v1 reachable (current `.icon` unchanged in behaviour for inline use).
7. `readme.md` + `doc/icons.md` (the rules: when to frame, which class for what) + `page.js` shown, not told.
8. Screenshots: `node Server/layout-check.mjs http://127.0.0.1:63467/framework/ui/icon/ --widths 400,1920`, run from the worktree; save into `public/framework/ai/2026-09-30/icon-system/build/` in the MAIN tree (that dir only). Look at them and fix any misalignment.
9. Commit in the worktree. Append a summary `log` line to your task.jsonl, then end your turn and wait: the mastermind will send you the audit's worst offenders to migrate.
Every process you start uses `windowsHide: true`. Stop any server you start.

