# File system: what exists today (2026-09-29)

**There is no File or Directory class anywhere.** A file is a plain path string; a folder is a
nested object built on the fly. Three places draw files, and all three call the same `files()`.

## Data

| What | Where | Shape | Notes |
|---|---|---|---|
| The whole site's file list | `/directory.json`, written by [Server/plugins/Directory.js](/Server/plugins/Directory.js) | `{name, type: "dir"\|"file", children}` | Dev server only; production has none. Ignores every `.json` file. |
| Reading it | [core/Page/Markdown.js](/framework/core/Page/Markdown.js) `tree()`, `node(dir)` | the raw JSON node | The one reader; `ext/files/fs.js` and `ext/AITask` reuse it. [ai2/groups.js](/framework/ai2/groups.js) fetches `/framework/directory.json` itself. |
| A list of paths → a folder tree | [ext/files/files.js](/framework/ext/files/) `nest()` | `{ "a.js": "path", dir: {…} }` | Also used by [ext/Doc](/framework/ext/Doc/)'s Docs tab. |
| A folder's files, as a page log | [Server/plugins/PageFiles.js](/Server/plugins/PageFiles.js) | `{"file": "x.png"}` lines in `page.jsonl` | Appends when a file appears or goes. |
| Writing a file | [ext/Saver/FileSaver.js](/framework/ext/Saver/) | `socket.async_rpc("write", path, text)` | Dev only; JSON documents. |

## UI

| What the reader sees | Where | Built on |
|---|---|---|
| A tree + the clicked file's source | [ext/files](/framework/ext/files/) `files()` | its own `tree()`, `rows()`, `source()` |
| `<any path>/fs/`, full screen, no site nav | [ext/files/fs.js](/framework/ext/files/) via `Page.fs_folder()` in [core/Page](/framework/core/Page/) | `files()` + `/directory.json` |
| A module's **Files** tab (tree, prose, source) | [ext/Doc](/framework/ext/Doc/) `Doc.js` | `files(…, { about })`, plus an "Open full screen" link to `/fs/` |
| An AI 2 card's folder | [core/Page/Log.js](/framework/core/Page/) `draw_folder()` (card.js calls it) | `files()` |
| Workspace documents | [ext/Panel/Workspace](/framework/ext/Panel/Workspace/) `documents.js` | FileSaver; saved panel layouts, not files |
| Icon items and trees (being built) | `ui/item`, branch `worktree/item-ui` | details/summary rows |

## Duplicated or missing

- **Duplicated:** walking `directory.json` into a path list (fs.js `list()`, Markdown.js, ai2/groups.js); tree rows (`ext/files` `rows()` vs `ext/Doc`'s own tree vs the coming `ui/item` tree).
- **Missing:** a File or Directory object; a line anchor (`#L42`); a context menu; a `file_link()` helper; the site nav on `/fs/` (it hides it).

