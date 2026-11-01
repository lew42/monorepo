# Framework tasks: what is asked for and not done yet

One list of framework-wide work, so an ask isn't lost in a chat. Newest date first; each line says what, and links where the detail lives. When a task is picked up, open it the normal way (`node Server/TaskDirs.mjs --new <slug>`, the `new-task` skill) and link it here; when it lands, strike it through with the date. Work that belongs to one module goes in that module's readme instead.

## 2026-11-01 (the owner's dictation, cloud session `e3fd9043`, branch `claude/oop-streaming-research`)

- **Merge `claude/oop-streaming-research` into `michael/dev`**, not `main` yet. Steps and the one expected conflict: [build.md](../research/2026/10/29/persistence-sync/build.md#how-to-merge-owner-into-michaeldev-not-main-yet).
- **`index.jsonl` per folder**, so pages can be listed, linked, searched and mentioned without loading them: the plan and its open questions, [core/Page/doc/index-jsonl.md](../core/Page/doc/index-jsonl.md).
- **The Research page lists its projects by itself**, newest first, like a log. Today it is a list kept by hand in [research/page.js](../research/page.js). A `Dated` collection (`core/Item/Dated.js`) would do it, but its index lives in `ai/sessions/`, which isn't deployed; it needs an index the static site gets. Could become the default page for any dated folder.
- **Pages of files are cramped on mobile.** `page.jsonl` pages that show a file explorer are too wide on a phone. Rethink the explorer; meanwhile a project page shows links (the research project page does).
- **Review pages that were broken before this branch** (listed in [build.md](../research/2026/10/29/persistence-sync/build.md), "Broken before this branch"): `core/new/1/` imports four files that exist nowhere (maybe retire it); `ux/Content` catalog entry 65 imports `compose.js`, now `Compose.js`; the `audio/` mic pages need https.
- **One smoke-test monitor.** Several tools already load pages: `Server/smoke.mjs`, `BrowserCheck.mjs` (the `check_page` tool), `NavCheck.mjs`, `PreviewCheck.mjs`, `layout-check.mjs`. Find the past work on a monitor that keeps checking the site, and fold these into one before building anything new.
- **A minion audit that every folder's readme indexes its contents** (the rule: [core/Page/doc/navigation.md](../core/Page/doc/navigation.md)), run by Haiku with a script doing the listing.
- **Where each agent finds its docs:** a whole-system review of discoverability versus context bloat.
- **A branch strategy** for the many loose `worktree/*` and `integration/*` branches. The old remote `claude/replay-tests` (renamed `claude/oop-streaming-research`) is left for the owner to delete on GitHub.
- **The Item MVP's open items** (the owner's 10 small calls, what wasn't built, untested corners): [build.md](../research/2026/10/29/persistence-sync/build.md#asked-for-or-planned-not-done-nothing-here-was-started).
