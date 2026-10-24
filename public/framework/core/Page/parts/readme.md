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
Agents write these with `page_set` / `page_add`; code calls the content list: `page.content.add(...)`, `.move(...)`, `.remove(...)`. A plain `Page` draws them; `"class": "./Parts.js"` still works (an empty `PartsPage` subclass).

## Index
- **The six types** (the one list is [kinds.js](kinds.js)); every one has a live line on [types/](/framework/core/Page/parts/types/): `part-heading` (`text`), `part-text` (`text`, a whole markdown block), `part-card` (`title`, `text`), `part-link` (`path`), `part-view` (`class`, `data`: a module beside the page, drawn as `new Default({ page, item, ...data })` or `fn(page, box, data)`), `part-file` (`file`: a markdown file, rendered in place). `part-view` and `part-file` draw through `Jsonl.draw_module` and `Jsonl.draw_md`, the same code as the page-level `place` line.
- Classes: `PageHeading`, `PageText`, `PageCard`, `PageLink` (a card to a child page; [../doc/part-link.md](../doc/part-link.md)), each an `Item` with its own `View` (no base class); `Part.js`, `HeadingPart.js`, `TextPart.js`, `CardPart.js` and `Parts.js` (`PartsPage`) are shims for the old names — [doc/architecture.md](doc/architecture.md), [../doc/content.md](../doc/content.md)
- `MdToParts.mjs` — turns a markdown file into parts lines (`node MdToParts.mjs in.md out.json "Title"`)

## Watch out
- The wire name is `part-<kind>`; `Text` and `Card` alone belong to `ext/editor`. [doc/architecture.md](doc/architecture.md)
- `class` in line 1 resolves against the page's own folder: a child folder needs `../Parts.js`.
