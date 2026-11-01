# Framework tasks: what is asked for and not done yet

One list of framework-wide work, so an ask isn't lost in a chat. Newest date first; each line says what, and links where the detail lives. When a task is picked up, open it the normal way (`node Server/TaskDirs.mjs --new <slug>`, the `new-task` skill) and link it here; when it lands, strike it through with the date. Work that belongs to one module goes in that module's readme instead.

**This is a plain list, not yet a task system** (the owner, 2026-11-01). What exists today: `class Task extends Item` in [core/Task](../core/Task/) (one task's state machine), the task viewers in [ai/AITask](../ai/AITask/), and AI tasks filed inside session records (`ai/sessions/YYYY/MM/DD/session-*/<task>/`), made almost only by agents. The owner isn't sure where the task system stands now: the core Task may have been moved toward an AI task class. What he wants:
- **A task system that isn't tied to AI** (a core Task again, not an AI task), but that AI can still drive fully.
- **Any module can have its own `tasks/` folder** (`framework/tasks/` is the first). Asks from a dictation become tasks there, get worked on, and get checked off.
- **One object-oriented Task class and its UX:** how a task is created, updated, where it lives, how it renders, what it looks like. Poked at many times, never finished.

Until then: one line per task below, and when one gets a real task folder, link it.

## 2026-11-01 (the owner's dictation, cloud session `e3fd9043`, branch `claude/oop-streaming-research`)

- ~~**Merge `claude/oop-streaming-research` into `michael/dev`**~~ done 2026-11-01 (with `integration/data-shapes-2`); the PC still pulls and restarts. Steps and the one conflict: [build.md](../research/2026/10/29/persistence-sync/build.md#how-to-merge-owner-into-michaeldev-not-main-yet).
- **`index.jsonl` per folder**, so pages can be listed, linked, searched and mentioned without loading them: the plan and its open questions, [core/Page/doc/index-jsonl.md](../core/Page/doc/index-jsonl.md).
- **The Research page lists its projects by itself**, newest first, like a log. Today it is a list kept by hand in [research/page.js](../research/page.js). A `Dated` collection (`core/Item/Dated.js`) would do it, but its index lives in `ai/sessions/`, which isn't deployed; it needs an index the static site gets. Could become the default page for any dated folder.
- **Pages of files are cramped on mobile.** `page.jsonl` pages that show a file explorer are too wide on a phone. Rethink the explorer; meanwhile a project page shows links (the research project page does).
- **Review pages that were broken before this branch** (listed in [build.md](../research/2026/10/29/persistence-sync/build.md), "Broken before this branch"): `core/new/1/` imports four files that exist nowhere (maybe retire it); `ux/Content` catalog entry 65 imports `compose.js`, now `Compose.js`; the `audio/` mic pages need https.
- **One page checker, not five.** These all load pages headless and read the console: `Server/smoke.mjs` (the merge gate in `merge.mjs`; fails a page with more than 5 console warnings, `CONSOLE_BUDGET`, unless `Server/console-allow.jsonl` excuses them, which blocked a quick-fix merge on 2026-11-01), `NavCheck.mjs` (merge gate: a new page must be linked), `BrowserCheck.mjs` (the `check_page` tool), `PreviewCheck.mjs` (a deployed preview; added 2026-10-31, overlaps smoke.mjs), `layout-check.mjs`. Two tools that do the same job at different times means fixing one and not knowing why the other still fails. Fold them into one: `smoke.mjs` already takes `--base <url>`, so `PreviewCheck.mjs` may just be smoke.mjs pointed at a preview, and find the past work on a monitor that keeps checking the live site, before building anything new.
- **A minion audit that every folder's readme indexes its contents** (the rule: [core/Page/doc/navigation.md](../core/Page/doc/navigation.md)), run by Haiku with a script doing the listing.
- **Where each agent finds its docs:** a whole-system review of discoverability versus context bloat.
- **A branch strategy:** the proposal and its open decisions (rename `michael/dev` to `compliance`? first promotion to `main`; delete the merged branches it lists): [doc/git.md](../doc/git.md).
- **`merge.mjs` names the task in the merge commit** (`Merge qf-5: bold the session title`, not `Merge branch 'worktree/qf-5'`), so history says what each slot branch did: [doc/git.md](../doc/git.md#names).
- **`main` vs `michael/dev`:** maybe merge into `main` and work on `main` directly, instead of `michael/dev` acting as the main branch; the PC's own working branch could be named for the PC (`compliance`). Not done: merging into `main` deploys production, so it waits for the owner's go.
- **The Item MVP's open items** (the owner's 10 small calls, what wasn't built, untested corners): [build.md](../research/2026/10/29/persistence-sync/build.md#asked-for-or-planned-not-done-nothing-here-was-started).
