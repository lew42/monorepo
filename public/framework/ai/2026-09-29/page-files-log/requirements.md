# Each page lists its own files in its page.jsonl: requirements

The owner's words are in `owner-words.md`. Today one giant `directory.json` (3.3 MB) lists the whole site. Every page fetches it, and on the phone it costs seconds (see card 2026/09/29/experiment-3-models-read-the-dictate-spa).

## The shape the owner wants
1. **Each folder's page.jsonl lists that folder's own entries:** one line per file or subfolder DIRECTLY inside it, e.g. `{"file": "readme.md"}` / `{"dir": "doc"}`. Not the sub-folders' contents; they're in the sub-folders' own page.jsonl. So loading a page gets its listing for free, and deeper levels load on demand.
2. **Changes APPEND:** when the dev server's watcher (Server/watch.js, Server/plugins/Directory.js) sees a file or folder added, append `{"file": "x"}`; when one is removed, append `{"removed": "x"}` (latest line wins). Never rewrite the file.
3. **A backfill:** a one-time node script writes the current listing into each folder's page.jsonl. Decide which folders get one (every folder under public/ except dated task folders, node_modules and assets?), weighing the "don't clutter the tree" concern. Propose the rule, then apply it.
4. **Readers switch over:** core/Page (Log.js already reads `{"file"}` lines), core/Page/Markdown.js, ai2/groups.js, ext/files/fs.js, the drawer's sessions.js walk, and the Router's children lookup read the page's own page.jsonl, falling back to directory.json while it still exists. Keep directory.json for now, and stop depending on it for rendering.

## Traps (these have burned us)
- **The watcher must IGNORE its own writes** to page.jsonl, or it loops. Also: on Windows, a READ fires a change event (memory: "reload-on-read"), so filter by real content change.
- **Concurrent appends:** use the append path (Servex /card/append or the dev server's append), never read-modify-write.
- **Live reload:** hold it during the backfill (`node Server/hold.mjs on "page-files-log backfill"`).

## Rules
Use a pool worktree, prove it on a private dev server, the smoke test with links followed, merge.mjs, and a fresh-eyes review. Measure the phone load (the card page above, throttled) before and after. Budget about $10, with at most 3 minions. Coordinate with task-mastermind-page-system-2, which documents it on core/Page/jsonl/. Post progress on card 2026/09/29/the-page-system-layout-navigation-new-pa.

