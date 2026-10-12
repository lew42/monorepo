# parts — a page whose body is a list of parts, stored as lines in its own `page.jsonl`

Live: [/framework/core/Page/parts/](/framework/core/Page/parts/) (seed, with an add, a move and a remove already appended) and [/framework/core/Page/parts/example/](/framework/core/Page/parts/example/) (the `core/Item` readme, turned into parts by a script).

## Use
Make a folder with a `page.jsonl`; line 1 names the class, later lines are the parts:
```
{"title":"Mine","class":"/framework/core/Page/parts/Parts.js"}
{"content":{"add":{"id":"h","type":"part-heading","text":"Hello"}}}
{"content":{"add":{"id":"t","type":"part-text","text":"Some **markdown**."}}}
{"content":{"move":{"id":"t","after":null}}}
{"content":{"remove":"h"}}
```
Agents write these with `page_set` / `page_add`; code calls `page.add_part()`, `move_part()`, `remove_part()`.

## Index
- Classes: `Part` (base), `HeadingPart`, `TextPart`, `CardPart`, and `PartsPage` (the orchestrator) — [doc/architecture.md](doc/architecture.md)
- `MdToParts.mjs` — turns a markdown file into parts lines (`node MdToParts.mjs in.md out.json "Title"`)

## Watch out
- The wire name is `part-<kind>`; `Text` and `Card` alone belong to `ext/editor`. [doc/architecture.md](doc/architecture.md)
- `class` in line 1 resolves against the page's own folder: a child folder needs `../Parts.js`.
