# Extensions — a page.jsonl line turns a small piece of behavior on, by name

See it running: **[this page](/framework/core/Page/ext/)** — its own `page.jsonl` has
one line, `{"ext": "Inbox"}`, and two `{"inbox": …}` messages. That's the whole demo.

An extension is one file, `core/Page/ext/<Name>/<Name>.js`, exporting a class with a
static `setup(page)`. Core never imports it for you — a page has to ask, by name, so a
page that asks for nothing pays for nothing.

## Turn one on

**From data**, one page.jsonl line, no code anywhere:
```json
{"ext": "Inbox"}
```

**From code**, every page gets it, from the moment the module that calls this loads:
```js
import Inbox from "/framework/core/Page/ext/Inbox/Inbox.js";
Page.use(Inbox);
```

Both end up calling the exact same `Inbox.setup(page)`.

## The two hooks a `setup(page)` gets

- `page.on("line", fn)` — called once per page.jsonl line after line 1, with that
  line's own object (`{"inbox": {…}}`, say). `page.jsonl_lines` holds every line the
  page has seen so far — read that first to catch up on anything that arrived before
  your extension finished loading (its import is async; the page's own line replay
  isn't — `Inbox.js` does exactly this).
- `page.on("render", fn)` — called once, after the page's own content is drawn.

`page.ext_ready` is an array of promises, one per `{"ext": …}` line on this page —
`await Promise.all(page.ext_ready ?? [])` before reading what an extension set up, if
you're not sure it's finished yet (`demo.js`, on this page, does this).

## Extensions so far

- **Inbox** (`./Inbox/`, its own readme) — collects a page's own `{"inbox": {…}}`
  lines (any agent, or the owner, just appending a message) into `page.inbox`. Click
  through to it from this page's own file tree, below.

## Watch out

- The name in the jsonl line IS the folder and file name, spelled exactly the same:
  `{"ext": "Inbox"}` imports `core/Page/ext/Inbox/Inbox.js`.
- Model: `Server/Events.js`'s `static use(plugin)` / `setup(instance)`, and
  `Server/run.js`, which wires every server plugin the same way (dev-only; nothing
  here imports it — this module keeps its own tiny copy).
- `page.jsonl_lines` keeps every line, for the life of the page — the same tradeoff
  `this.listed` and `this.placed` (Log.js) already make. Fine for an ordinary page;
  a page whose log runs to many thousands of lines pays for that memory whether or
  not it uses an extension.

Files: `Page.class.js` (`Page.use`, the constructor hook, the `render` emit) ·
`Log.js` (`ext()`, `on`/`emit`, `jsonl_lines`) · `page.jsonl` + `demo.js` (this page,
the demo itself).
