# Minion brief: path modules are page extensions (merge 1b)

Load the `minion` skill first, then `code` and `documentation`. Parent: task-mastermind-inbox-ext. Task dir: `public/framework/ai/2026-09-30/inbox-ext/` — read `owner-words.md` (the last section is yours), `plan.md` (merge 1b), and `core/Page/ext/readme.md` in the worktree (merge 1, the extension system you build on).

## The owner's words (verbatim)

> we have some path specific page routes like the MD system. I think we have, I don't know if the, the route specific AI system is built. ... Let's make sure we document in our page system, the core page pages, the um, path specific modules. Those, those really should be extensions, right? Like, so if there's anything that creates a page subdirectory pattern, essentially, like the markdown, like the AI, maybe, uh, I don't remember, we might want like an editor one. So like any page slash edit creates like a whole module and workspace, essentially, like a, a directory for saving things. ... make sure those are documented properly so that we can, you know, see how that works.

## Where you work

Worktree `C:\Code\lew42\worktrees\inbox-ext` (branch `worktree/inbox-ext`, server http://localhost:51490/). Commit after each piece. Don't merge; I merge.

## Deliverables, in order

1. **Find them all.** Every module that adds a sub-path or a workspace under any page. Start with `core/Page/Markdown.js`, `core/Page/ai/`, `core/Page/dynamic/`, `core/Page/make/`, and any `/edit` route; grep `route(` in `core/Page/Page.class.js` and `core/Page/*.js` for others. For each: the path it adds, the file that adds it, where it saves, and whether it is built or only planned. Write the list to your task dir as `modules.md` (a table).
2. **Document each as an extension.** On the core/Page pages: `core/Page/ext/readme.md` gets a section "Path extensions" listing each one in a line (the path it adds, where it saves, a link to its own page); the ext demo page shows the list as a table or previews; each module's own readme gets one line saying it is a path extension and linking back.
3. **Move the cheap ones onto `core/Page/ext/`.** "Cheap" means: a module turned on by a hard-coded check in `Page.class.js` that can become a `Page.use(Ext)` or `{"ext": ...}` line with fewer than ~30 changed lines, and every existing url still works. Move files only if the move is a re-export away from safe. For each one you don't move, write the seam in one line (what would have to change) in `modules.md`.
4. **Proof.** Headless (Playwright, `windowsHide: true`) on the worktree server: every url in `modules.md` loads with zero console errors, before and after; the core/Page ext page at 400 and 1920. Shots in `path-ext/shots/`.

## Fence

`core/Page/ext/**`, `core/Page/Markdown.js`, `core/Page/ai/**`, `core/Page/dynamic/**`, `core/Page/make/**`, `core/Page/Page.class.js` (the smallest edits, only for a move), `core/Page/readme.md`, the readmes of the modules you document. Nothing in `ai2/`, `ai/`, `ux/`, Servex.

## Rules

`windowsHide: true` on every process; stop every server you start. Log steps and decisions in your task.jsonl. No cap; do it right. When done, message task-mastermind-inbox-ext: commits, shots, what was moved and what was only documented.
