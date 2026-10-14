# core/Session

`Session` is a record that lives in its own dated folder, `<root>/YYYY/MM/DD/<slug>/`, with a `page.jsonl` inside. It knows where its folder is (`locate`, `scan`, `dir_url`, `day`) and nothing else.

- `AISession` (`ai/AISession`) extends it and adds cost, cache and transcript. `RefineSession` (`ext/Refine`) will too.
- A subclass overrides `root_url()` and declares its own `days`, `slugs` and `scanned` maps. Statics inherit by reference, so a shared map would mix two kinds of session.
- `scan` finds a folder by its uuid name, `index.json`, cache summary, or the first `page.jsonl` line `{"session":uuid}` the page tool writes.

Decision: `core/Page/doc/architecture.md` (Session). Folder layout: `ai/sessions/doc/data/layout.md`.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
