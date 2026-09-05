# Research — a live research program, four topics dug in parallel, every claim rated by how sure anyone is

[/imagine/research/](/imagine/research/) aggregates four topics' `log.jsonl` files
(`ext/Research/Program.js` does the reading) into one front: a credence legend, a synthesis
card, one 3-column card per topic, and the raw chronological feed behind a closed
`<details>`. New minions append to a topic's log; the page redraws live, no reload.

## Use

A new topic is a directory named in `topics:` (`page.js`) plus its own `log.jsonl` — no
registration beyond that string. Give it a `page.js` once it has enough to show and the
front links straight to it:

```js /imagine/research/<topic>/log.jsonl
{"at":"2026-09-05T…","topic":"stone","kind":"theory","title":"…","summary":"…","url":"https://…","credence":"fringe"}
```

## Watch out

- **A topic card is the owner's 3-column shape** (left = who/what, centre = the topic's
  own newest theory live, right = the credence readouts) — `page.js` `topic_card()`, CSS in
  `research-front.css`. [`doc/decisions.md`](./doc/decisions.md) has the before/after
  measurements.
- **Depth is still the recurring failure here.** 368 raw entries once flattened this front to
  14,517px at 3440; it is 2,855px now, one theory per topic shown and the rest — plus the
  flat cross-topic feed — behind closed `<details>`. Before adding anything else that shows
  by default, measure at 3440 first.
- **A closed `<details>`'s children still report real `getBoundingClientRect()` geometry** in
  this browser — a plain box-union measurement massively overcounts a page that uses
  disclosure. Filter with `el.checkVisibility({ checkVisibilityCSS: true })`, or read the
  visible container's own rect. [`doc/decisions.md`](./doc/decisions.md)
- **`width: "fill"` was tried and reverted** (2026-09-04) — it squeezes an open topic column
  to its 288px floor. The column stays `"large"`; the fix for 3440's dead space is not this
  page's to make (`framework/ai/2026-09-04/realm-alternates/task.jsonl`).
- **This realm persists nothing** — no `store()`, no `localStorage`. No baseline mark needed.

## More

- [Overview](/imagine/research/) · [`doc/decisions.md`](./doc/decisions.md) — the 2026-09-05
  UX pass: what was tried, what was measured, what was kept
- Files: `page.js` (the front, `ResearchFront extends Program`) · `research-front.css` (the
  3-column card) · `stone/` `depictions/` `disclosure/` `theories/` (the four topics, each its
  own `page.js` + `log.jsonl`)
- What this stands on: [`ext/Research`](/framework/ext/Research/readme.md) (the schema, the
  aggregator, the shared card renderers) · [the 3-column card's other user,
  `/imagine/layouts/`](/imagine/layouts/readme.md) (same shape, borrowed CSS mechanism) ·
  [the approved five](/imagine/design/layout/approved/) — this page is a column inside
  approved-layout #3 (columns row), not a layout of its own
