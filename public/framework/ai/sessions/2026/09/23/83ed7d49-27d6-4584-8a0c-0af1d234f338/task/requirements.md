# editor-deps — what ext/Editor is built from, and how it relates to Panel and the playground

Read the three laws in `CLAUDE.md` first: less is more, clear beats brief, prioritize. The owner
reads one screen of plain sentences; detail nests one click down.

## The ask, verbatim (the owner, 2026-09-23 14:20)

> look at the ext slash editor and what kind of dependencies it has it looks like it's rendering a
> tree of icon items it's got some sort of inspector here with some layout controls definitely has
> a panel system it has kind of like a workspace here um, look at the ext playground and ext panel
> systems um, maybe spawn a opus minion to work on this in parallel

## Your job — read and report, change nothing

1. **`public/framework/ext/Editor/`** (`page.js`, `blocks.js`, `History.js`, readme, doc/). Map what
   it is built from: every import, and what each piece contributes on screen — the tree of icon
   items, the inspector, the layout controls, the workspace/panel system, drag-and-drop, saving,
   undo. Name the file and the class/function for each.
2. **`public/framework/ext/Panel/`** (31 files, ~4,500 lines) and **the playground**
   (`ext/Panel/playground/`; older notes call it `ext/Playground`). What each is, what Editor uses
   from them, and what it does not.
3. **The overlaps.** Where Editor, Panel and the playground each solve the same problem their own
   way (trees, inspectors, layout controls, workspaces, persistence). Which one is the most
   complete version of each, with file names.
4. **A recommendation**, one paragraph: if these were to become one editor, what is the spine and
   what folds into it. A proposal only — no code changes.

Open the pages in a headless browser (Playwright, the `ui-test` skill) at
`http://monorepo.localhost/framework/ext/Editor/` and the Panel / playground pages, and take one
screenshot of each into this task dir, so the report can show what you are describing.

## Deliverable

`report.md` in this dir — one screen at the top (what Editor is, its parts in a small table,
the overlap verdict, the recommendation), then the detail below a `---`. Screenshots embedded.
Then land with the `finish-task` skill: the outcome is the top screen, linked to `report.md`.

## Fence

Write ONLY inside `public/framework/ai/2026-09-23/editor-deps/` (plus the task.jsonl / day.jsonl
lines the skills tell you to append). Read anything. Do not edit framework code, skills, or
Servex. Do not refresh `ai/usage.json`. Launch nothing that opens a window. Budget: aim under $6.
