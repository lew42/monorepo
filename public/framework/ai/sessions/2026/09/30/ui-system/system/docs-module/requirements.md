# core/System: finish the module (readme, page.js, doc/), link it in

Load the `minion` skill first, then `code`, `css`/`layout` if you touch CSS, and `page`
for the page.js. Also load `new-page` before writing `core/System/page.js`.

**Work only in the worktree:** `C:\Code\lew42\worktrees\ui-system` (branch
`worktree/ui-system`). Its server: http://ui-system.localhost/ (or
http://localhost:50941/ — check `Server/worktree-up.mjs`'s record if that port is
stale). Never edit the main tree, except your own log under
`public/framework/ai/sessions/2026/09/30/ui-system/system/docs-module/` in the MAIN tree
(`C:\Code\lew42\monorepo`).

## Background

`core/System/System.js` already exists on this branch, committed
(`4adf0a6d`): a class, `System extends Doc`, that gives Design/Code/UI/UX/AI a shared
top-tab strip (Overview · Inbox · <parts> · API · Docs · Files), concept tiles on the
Overview, and an Inbox tab. **Read it in full before you write anything** — its own
doc-comment at the top is the spec. Two real pages already use it:
`public/framework/design/page.js` and `public/framework/code/page.js` (same commit).

What's missing is the MODULE ITSELF — `core/System/` needs to look like every other
module in this framework (CLAUDE.md: "Every module: `readme.md`, `page.js`, `doc/`").
Right now it's just a `.js` file with no page and no docs. That's your whole job.

## Deliverables

1. **`core/System/readme.md`** — the reader's index for this class, in the shape
   `/framework/ai/readmes/` or any sibling module (e.g. `core/Page/readme.md`,
   `ext/Doc/readme.md`) uses: what it is, in one or two sentences, then links — the
   page, the doc, and the five real instances (Design, Code, UI, UX — and AI once it's
   converted; for now, just the three or four that exist, and say "AI: pending"). Short.
   Follow the `content` skill: show, don't tell, basics before detail.

2. **`core/System/page.js`** — a `new Doc({...})` page (NOT `new System` — this page
   documents the System *class*, exactly how `ext/Doc/page.js` documents Doc, or
   `core/Page/page.js` documents Page — check one of those for the shape first).
   Show, don't tell: the five systems (Design, Code, UI, UX, AI) as live preview cards
   at the top — link to each with `/framework/design/`, `/framework/code/`, etc (use
   `ux/Content/Concepts/Concepts.js`, the same tile component `System.js` itself uses,
   so this page eats its own dog food) — THEN the minimal code (the `export default new
   System({...})` example from `System.js`'s own doc comment, as a `code.js()` block).
   `subject: System`, with `methods`/`properties` naming what's real: `omitted`, `parts`,
   `wall`, `overview_content`, `concept_tiles`, `readme`, `inbox_section`,
   `inbox_content`, `bar`, `render` — check `System.js` for the exact list; only name
   what's actually a method on the class. `files: "System.js readme.md"`.

3. **`core/System/doc/system.md`** — one doc page: what a System IS (more than a page —
   "a whole system of rules," the owner's words, in `public/framework/ai/sessions/2026/09/30/
   ui-system/requirements.md` ask 1) and how to add one (the two ways: `page.js` or
   `page.jsonl` line 1 — `System.js`'s own doc comment has both). Keep it short; this is
   the ONE doc page `page.js`'s Docs tab needs (`notes: "system"` on the page.js config —
   check `Doc.js`'s `docs_section()`/`declare_note()` for how a single note becomes the
   Docs tab, same mechanism every module uses).

4. **Add `System` to `core/page.js`'s `children:` line** (line 9 today: `"View Page
   Router App Sidebar Shell Search Layout Section Item List"` — the `Task` class isn't
   in that list either; leave that alone, not your job). Just append `System`.

## What NOT to touch

Don't edit `System.js` itself (not your fence — if you find a real bug in it, write a
`need` line in your log and say so in your `done` message, don't fix it). Don't touch
`design/page.js`, `code/page.js`, `ui/page.js`, `ux/page.js`, `ai/page.js`,
`core/page.js` beyond the one children line, or `/app.js`.

## Prove it

- `/framework/core/System/` loads with zero console errors, at 400, 1200, 1920, 3440
  (`node Server/layout-check.mjs http://ui-system.localhost/framework/core/System/
  --widths 400,1200,1920,3440 --bands --out
  public/framework/ai/sessions/2026/09/30/ui-system/system/docs-module/shots` — run from the
  MAIN tree, `MSYS_NO_PATHCONV=1` prefix if you're in Git Bash). Read every shot
  yourself, top to bottom, and fix what you see.
- `/framework/core/` (the parent) still loads with zero console errors and shows System
  in its wall of children.
- The five cards on `core/System/page.js` are real links that resolve (click through or
  check each url 200s).

## Commit

One commit, exact paths: `core/System/readme.md core/System/page.js
core/System/doc/system.md core/page.js`. Message describes what you added. Don't merge
— tell your parent (`task-mastermind-system-class`) when it's committed, with the
commit hash and your shot paths. `send_to_agent` or just end your turn; your parent is
watching for your done event.
