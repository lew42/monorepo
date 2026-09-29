# Who writes a line

Seven things can add a line to a `page.jsonl`. None of them ever rewrite the file — every one
of them only appends.

| writer | what it appends | when | the code |
|---|---|---|---|
| The dev server's file watcher | `{"file": name}` when a file or folder appears; `{"file": name, "gone": true}` when it disappears | within about 60 ms of the real change on disk, debounced so one save doesn't fire five lines; also once for every `page.jsonl` on server boot, to catch up on anything that happened while it was down | `Server/plugins/PageFiles.js` — `sync()` and `catchup()` (dev-only; nothing in production writes these) |
| The page tools (`create_page`, `place`, `set_layout`) | `create_page`: a brand new child's line 1, plus a `{"file": "<name>/page.jsonl"}` line on the parent. `place`: `{"place": what}`. `set_layout`: `{"layout": name}` | whenever an agent calls the tool — usually while building or wiring up a page | [`Servex/pages.js`](/framework/servex/) |
| Cards, on the AI dashboard | any card line — `{"message": …}`, `{"prompt": …}`, `{"tags": …}`, `{"status": …}`, `{"attach": …}` and more (a **card is a `page.jsonl` page**, same format, its own vocabulary) | the owner replying to a card in the browser, or an agent calling the card reply/set tools | [`Servex/cards/Cards.js`](/framework/servex/), routed at `POST /card/append` |
| The reference tracker | `{"referenced_by": "/path/"}` — one line per page that links here; these ACCUMULATE, they don't replace each other | whenever `node Server/page-refs.mjs <from> <to>` runs, recording that `<from>` links to `<to>` | `Server/page-refs.mjs` |
| A weight adjustment | `{"weight": N}` — a manual importance number | whenever someone decides a page should outrank or underrank its siblings — what weight means and does lives on its own page, not here: [`core/Page/weight/`](/framework/core/Page/weight/) |
| An agent, by hand | any line at all — nothing checks the shape, so a typo is possible | mid-task, when an agent wants to record a `{"file": …}` or `{"place": …}` line itself instead of waiting for a tool | `.claude/hooks/append.mjs <target.jsonl> <lines.json>`, a repo script every agent session has |
| A person, editing on disk | any line | rare — someone opens the file in an editor and types a line by hand | not a tool, just a text file |

## A look-alike that is NOT a writer

Servex has an `append_log` tool that sounds like it belongs on this list — it doesn't.
`append_log` writes into Servex's own `logs/<name>.jsonl` folder (feature counters, task
logs, server diagnostics). A `page.jsonl` under `public/` is a different file in a different
place, and `append_log` never touches one. The seven rows above are the whole list.

More: [`doc/timing.md`](/framework/core/Page/jsonl/md/doc/timing/) (when a written line is
actually seen) and [`doc/caveats.md`](/framework/core/Page/jsonl/md/doc/caveats/) (what goes
wrong when two writers land at once).
