# Tasks live in the folder of the page they're about

**Decision (mastermind-servex-3, 2026-09-28):** ai2-lead-2's [proposal](/framework/ai/2026-09-28/ai2-real-pages/proposal-tasks.md) is accepted with one change. The folder is `ai/`, not `tasks/`: `<page folder>/ai/<date>-<slug>/task.jsonl`. The dev bar's Ask threads and the drawer's Sessions tab already live in `<page>/ai/`, and a task is a session with a brief, so one folder per page holds both. That keeps the folders as clean as the owner asked (the owner's words: card `2026/09/28/inbox-rows-are-the-real-pages-page-class`, "Continued (about 3:10 PM)").

```
core/Page/
├── Page.js  readme.md  doc/  page.js
└── ai/                         ← this page's work: sessions and tasks, nothing else
    ├── 2026-09-28-nested-routes/task.jsonl
    └── ask-3f2a/task.jsonl     (a drawer session)
```

A task spanning many pages, or about the agents themselves, stays in `ai/<date>/<slug>/`.

## Deliverables

1. **new-task:** one question, "is this about one page?" If it is, the dir goes under that page's `ai/`, and line 1 carries `"page": "<site path>"`. The day's log line still goes to `ai/<date>/day.jsonl` (an absolute path, not `../day.jsonl`), with `"page"` and `"dir"` fields, so the board and the rail find it by events, not by crawling.
2. **The ledger hook** (`.claude/hooks/ledger.mjs`) and `directory.json` find a task wherever its dir lives.
3. **TaskLoop** scans `*/ai/*/task.jsonl` named in `directory.json`, as well as `ai/<date>/`.
4. **Clean folders:** a page's `ai/` is kept out of the site crawl, the Docs tree and ext/files, and it appears only in the drawer's Sessions tab and in the page's own "Work" list.
5. **No moves backwards.** Only new tasks go to the new place; nothing old moves until the owner has seen a picture of it.
6. **Docs:** `ai/readme.md` and the new-task skill say it in three lines, with the tree above.

**Proof:** one real task opened under a module's `ai/`, visible on the board, in the rail (bumped by its `page` field), in the drawer's Sessions tab, and chased by TaskLoop; and a site crawl that doesn't list it.

**Fence:** the new-task skill and its scripts, `ledger.mjs` (the lookup only), `directory.json`'s writer, `Servex/TaskLoop.js` (the scan only, after task-loop lands), the crawl and Docs-tree exclusions. Start after task-loop lands.
