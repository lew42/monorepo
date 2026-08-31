# Mag — a small magazine, made only of column words

[Issue 01, *The Column*](/imagine/mag/) is six real articles you can read. Nothing in it is
a new mechanism: it is the seven column labs' vocabulary — width words, `index`, `bleed`,
resizable seams, the tone verdicts, the feeds filter — composed into one thing a visitor
uses rather than inspects.

## The shape

Three columns of one row, and the row is `/imagine/`'s.

| | url | word | tone |
|---|---|---|---|
| Cover | `/imagine/mag/` | `full`, then `38.2%`, then `20%` | the most veil |
| Contents | `…/contents/` | `large` + `index: true` | less |
| Article | `…/contents/<slug>/` | none — the 40em measure | none, the only white column |

The cover is one page in three CSS states: alone it is the screen, with the contents open
it takes the minor share of the golden pair, and once you are reading it steps back to a
fifth so the article keeps its measure. No second render, no state — one `:has()` each.

## Use

Every word and number lives in `issue.json`, fetched once by `issue.js` and never again.
Add an article by adding an entry:

```json
{ "slug": "…", "section": "Craft", "title": "…", "standfirst": "…",
  "body": [{ "p": "…" }, { "h": "…" }, { "quote": "…", "by": "…" },
           { "figure": ["1", "0.382 0.618"], "caption": "…" }] }
```

Its url, its place on the contents, the `03 / 06` on its own head, and which article the
last one hops to all follow from where it sits in the array — nothing counts the issue out
loud. `"kind": "data"` plus a `data` block makes it the chart piece instead
([`Article.js`](./Article.js) — `Article.Data`).

Reading is a line: every article ends with the next one, and the sixth ends with the
cover. Clicked through headless — six hops, back to `/imagine/mag/`, no console errors.

## Watch out

- **`issue.js` uses a top-level `await`,** and it has to: children are declared, never
  crawled, so an article that appears after a promise would 404 on a cold load.
- **A subclass field runs after `super()`** — that is where `Page` does its `assign()` — so
  `no = ""` on `Article` would erase the number handed in. Defaults go in `initialize()`.
- **The theme sizes generic headings at (0,2,0)** (`.theme-lew42 :is(h2, .h2)`, 2.25em), so
  a plain `.mag-title` loses and a two-class selector only ties. The headline scale is
  written at (0,3,0) on purpose.
- **Three tone rungs, all opaque.** The row paints its empty slots *behind* the columns; a
  translucent body lets the hairlines through.

Detail, measurements and what was tried and dropped: [`doc/decisions.md`](./doc/decisions.md).

## More

- [`page.js`](./page.js) the cover · [`contents/page.js`](./contents/page.js) the index ·
  [`Article.js`](./Article.js) one article and the data piece · [`mag.css`](./mag.css) ·
  [`issue.json`](./issue.json) the whole issue
- Where the words came from: [the findings](/framework/core/Page/doc/findings/) ·
  [`columns.md`](/framework/core/Page/doc/columns/) · [Screens](/imagine/screens/) ·
  [Tone](/imagine/vary/tone/) · [Feeds · Data](/imagine/feeds/data/)
