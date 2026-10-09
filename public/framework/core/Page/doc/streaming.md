# Page storage and streaming — one line in a file, one redraw on screen

A page keeps its data in plain text files inside its own folder. Anything can add a line to one of those files, and every open browser tab shows the new line a moment later, without a reload. This page follows that trip from start to finish.

```
 writer ──append one line──▶  page.jsonl  (on disk)
 (page_set, append_log,          │
  append.mjs, a browser tab)     │ file changes
                                 ▼
                  dev server watcher (chokidar)
                                 ▼
          Server/plugins/SocketServer/Tail.js   reads only the NEW bytes
                                 ▼  socket frame: "jsonl", path, lines, offset
          ext/JSONL/live.js                     hands lines to the reader
                                 ▼
          Page.Reader  (Page.class.js, extends Item.Store)
                                 ▼  host.set(line)   one line = one set() call
          the Page changes ──▶ changed() ──▶ log_redraw() / nav_redraw() / rerender()
```

## 1. The files in a folder

| File | What it is | Writes it | Reads it |
|---|---|---|---|
| `page.js` | The page's code (a tiny file: import the class, instantiate it). | a person or builder agent | the browser |
| `page.jsonl` | The page's content as lines, when it has no `page.js` ([`page-jsonl.md`](page-jsonl.md), [`jsonl.md`](jsonl.md)). Each line is one `set()` call. | the page tools, `append_log`, a browser tab | `Page.Reader` |
| `files.jsonl` | The folder's own file list, one line per file that appeared or went (`{"file":"x.png"}`). | `Server/plugins/PageFiles.js`, automatically | `Page.class.js` (the tab strip, listings) |
| `settings.jsonl` | A page's preferences about itself (a `settings` line, e.g. its tab weight), for a folder that has a `page.js`. | the page tools, `append.mjs` | the parent page's tab strip |
| `readme.md` | The folder's short index. | a person or agent | people, agents, `md/` route |
| `doc/` | Longer notes, one `.md` each, linked from the readme. | a person or agent | `md/` route |
| `directory.json` | The old one-file listing of the whole site. **Off since 2026-10-09** (it was 16 MB and reloaded every tab). The last copy is frozen on disk. See [`../../../../Server/doc/directory-off.md`](../../../../Server/doc/directory-off.md). | nothing now | a few old readers, listed there |

A JSONL page (no `page.js`) keeps its file list inside its own `page.jsonl`; every other folder uses `files.jsonl`. `PageFiles.js` decides which, in one place.

## 2. One line's journey

1. **A writer appends** one JSON line to a `.jsonl` file (section 3 lists the writers).
2. **The dev server notices.** Its file watcher calls `Tail.changed(file)` in [`Server/plugins/SocketServer/Tail.js`](../../../../Server/plugins/SocketServer/Tail.js). Tab sockets subscribed to that file; `Tail` remembers how many bytes each file had been read, reads only what is new, and keeps a half-written last line for next time.
3. **It sends a frame** over the socket: the file path, the new lines and the new offset. If the file shrank or was rewritten it sends `jsonl_reset` instead.
4. **The browser receives it.** [`ext/JSONL/live.js`](../../ext/JSONL/live.js) finds every reader of that path and calls its `read()`. Two readers of one file (a card and a task page) both get the lines.
5. **`Page.Reader`** (in [`Page.class.js`](../Page.class.js), extends [`Item.Store`](../../Item/Store.js)) replays each line through `page.set(line)`. Lines it sent itself are skipped (the echo skip), so a writer never applies its own line twice.
6. **The page redraws.** `Page.Reader.changed()` calls `log_redraw()` for the content; a `tab` or `file` line also calls `nav_redraw()` (the tab strip); a `settings` line asks the parent to redraw its strip. A change to the page's shape lands as one `rerender()` on the next microtask.

**Opening a page** is the same road, started by `Reader.open()`: it subscribes from offset 0, so the file's existing lines arrive as the first frame. Off localhost there is no socket: the file is fetched once and nothing streams ([`loading.md`](loading.md)).

**What a tab writes back.** When a page changes in the browser, `Item.Store` listens for the host's `delta` event, queues the change and sends the lines in one call through [`ext/filesystem/FsFile.js`](../../../ext/filesystem/FsFile.js) to [`Server/plugins/SocketServer/Append.js`](../../../../Server/plugins/SocketServer/Append.js). `Append` validates every line, then `appendFileSync`s them. The same watcher then streams them back to every tab, the writer included.

## 3. Who writes

- **`page_set` and the other page tools**: [`Servex/agents/page_tools.js`](../../../../Servex/agents/page_tools.js). An agent gives a page path plus a change; the tool validates and appends one line ([`architecture.md`](architecture.md)).
- **Servex `append_log`**: the MCP tool that appends one JSON line to a named log through Servex, the single writer of logs.
- **`.claude/hooks/append.mjs`**: the command-line append (`node .claude/hooks/append.mjs <file.jsonl> <lines.json>`); it validates, fills `"NOW"` with the real clock and re-parses the file.
- **A browser tab**: through `Item.Store` and `Append.js`, above.
- **Hand edits are blocked.** [`.claude/hooks/jsonl-guard.mjs`](../../../../.claude/hooks/jsonl-guard.mjs) refuses shell redirection and Write/Edit onto an existing `.jsonl`.

## 4. Rules that keep it safe

- **Append only.** Never rewrite a `.jsonl`; a rewrite makes every tab reset and replay from line 1.
- **One writer per line.** Appends go in whole lines, so two writers interleave between lines and never inside one.
- **Validated before writing.** [`.claude/hooks/jsonl-schema.mjs`](../../../../.claude/hooks/jsonl-schema.mjs) judges each line; one bad line refuses the whole batch. `Tail` and `Append` only accept paths under `public/` that end in `.jsonl`.
- **Localhost only.** Streaming exists only on the dev server. Production is static: the page loads its files once.

## 5. Path-based per-directory systems

A path system answers a url the page never declared. The census with costs is [`../ext/doc/path-extensions.md`](../ext/doc/path-extensions.md).

- **`md/`**: this folder's `.md` files rendered, one page each ([`markdown.md`](markdown.md)).
- **`fs/`**: this folder's real files, browsable full screen (`ext/files`).
- **The page inbox**: a note left on a page reaches the agent that owns it ([`../ext/Inbox/readme.md`](../ext/Inbox/readme.md)).
- **`files.jsonl` listing**: the per-folder file index from section 1, written live by `Server/plugins/PageFiles.js`.
