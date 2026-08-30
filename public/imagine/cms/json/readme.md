# JSON pages — how it is built

`page.json` is the **snapshot**: one node — `title`, `icon`, `description`, `blocks`,
`children` — nested as deep as you like. `page.jsonl` is the **delta log**: one appended
line per change. Loading is *fetch the snapshot, replay the log in order*. Compacting
writes the replayed state back as the snapshot and empties the log, which is the whole
reason for the pair — the json never grows past the tree it describes, and an edit never
rewrites it.

## Use

- **Open [JSON pages](/imagine/cms/json/)**, then walk in three levels:
  [`format/snapshot/shape/`](/imagine/cms/json/format/snapshot/shape/) is data all the way
  down and works pasted cold into a new tab.
- **[Edit](/imagine/cms/json/edit/)** appends one line and prints the before/after line and
  byte counts. **Compact** prints them again, at zero.
- **The delta line** — the contract a writer may not break:
  ```json
  {"at": "<ISO>", "op": "set" | "del" | "append", "path": ["children", "why", "title"], "value": …}
  ```
  `set` replaces what `path` ends at, `del` removes it, `append` pushes `value` onto the
  array `path` ends at. `apply()` in `json.js` is the whole replayer, in nine lines.
- **`page.js` is the handoff** and the only code in the tree: it fetches both files and
  hands each node to `add()`. Two overrides make a cold deep url work — `child()`, because
  the Router asks the PARENT for each segment, and `load_all_children()`, because landing
  on the parent itself has no segment to walk. ⚠ `route()` is not the seam: core calls it
  synchronously and would assign a promise onto a Page as if it were a config.

## Can a page exist *entirely* as json?

**Content, yes. Behaviour, no — and the hatch is one field.**

A block names a renderer: `{ "type": "cards" }` draws this page's children as cards because
a function called `cards` is registered in `json.js`. Data chooses; js supplies. So a data
page can say anything a registered renderer can draw, and a new capability for every data
page in the site is one entry in `renderers`.

What data gets today, free, because `Page.declare()` already took this shape: a real url, the
Router, crumbs, columns, the card wall, `active-page` marking, `icon`, `description`, `width`.

What still needs a `page.js`: its own `render()`, its own state, event handlers, anything
that computes. That page can live in this tree as one more child — `edit/` is exactly that.

**The two seams that would move the line**, both in core, neither written here:

1. **`Page.redraw()`** — rebuild a page's view in place from new data. Today a delta redraws
   the node's own content box (`redraw()` in `json.js`), but a changed **title**, a new child,
   or a deleted page is next-load, because core builds the column head and the rail and there
   is no way to ask it to build them again.
2. **A declared data source** — `children: source` where the source is a promise of configs,
   so the two overrides in `page.js` become one word and every page in the site can be
   data-backed without repeating them.

## Watch out

- **`rpc:write` has no append verb**, so `Source.append()` holds the log text and writes
  log + line. The file still grows by exactly one line and the snapshot is still never
  rewritten — but two browsers editing at once would clobber, and a server-side `rpc:append`
  is the one-line fix.
- **Off localhost there is no dev socket**: the buttons disable themselves and say so. Reading
  is a fetch, so the tree itself works anywhere, including a static host.
- **A missing file answers 200 with `index.html`** (the SPA fallback), so `Source.read()`
  checks the content-type — a bare `res.ok` would replay a web page as a delta log.
- **`edit` is a reserved name** in this tree: a data node called `edit` would be shadowed by
  the real `edit/page.js` directory. Any child with a `page.js` wins over data.
- **Nothing fetches at import.** A page constructs itself when its module loads, so the load
  is memoised behind `ready()` and only a visit pays for it.

## More

- `json.js` — renderers, `config()` (a node becomes a page config), `apply()` (the replayer),
  `Source` (load, append, compact). `page.js` — the handoff. `edit/page.js` — the three ops.
- The files themselves: [`page.json`](/imagine/cms/json/page.json) ·
  [`page.jsonl`](/imagine/cms/json/page.jsonl)
- The rest of the CMS slice — a markdown file as a page, and `git commit` as publish:
  [`/imagine/cms/`](/imagine/cms/)
