# core/Session

`Session` is a record that lives in its own dated folder, `<root>/YYYY/MM/DD/<slug>/`, with a `page.jsonl` inside. It knows where its folder is (`locate`, `scan`, `dir_url`, `day`) and nothing else.

- `AISession` (`ai/AISession`) extends it and adds cost, cache and transcript. `RefineSession` (`ext/Refine`) will too.
- A subclass overrides `root_url()` and declares its own `days`, `slugs` and `scanned` maps. Statics inherit by reference, so a shared map would mix two kinds of session.
- `scan` finds a folder by its uuid name, `index.json`, cache summary, or the first `page.jsonl` line `{"session":uuid}` the page tool writes.

Decision: `core/Page/doc/architecture.md` (Session). Folder layout: `ai/sessions/doc/data/layout.md`.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)

## Session is an Item that has tasks (step 7 of the task system plan)

`class Session extends Item`. `session.tasks` is a `List` of `Task`, made on first use; `progress()` is `{done, total}` and `completion` (0..1) is counted from them on read through `Task.progress_of(list)`, the one counting code. `Session.replay(lines)` builds one from `session.jsonl` lines; the item tool (`Servex/agents/page_tools.js`) maps `session.jsonl` to it. `AISession.on(fn)` became `subscribe(fn)` because `on(event, fn)` is now Item's. Test: `node Session.test.mjs`.

- **Dated folders as one shared system** (the owner, 2026-10-20; sessions and projects share `YYYY/MM/DD/<name>/`, to be upgraded once for both): [core/Task/doc/owner-2026-10-20-projects-and-completion.md](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md).
