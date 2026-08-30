# json-pages — pages that exist as data

## The ask (verbatim)

> look into page.json based pages. for now, we'll need a parent page to initiate the
> handoff/load of the json. however, we could, like the Item persistence, get pages to
> exist entirely as dynamic json?

> json + jsonl is the best way: jsonl is append only, and the snapshot is json. this
> prevents the json from getting bigger than it needs to be, and makes a nice place to
> log realtime deltas.

## Fence

- Mine: `public/imagine/cms/json/**`
- One `children:` line in `public/imagine/cms/page.js`. Nothing else outside my dir.
- `core/Page/Page.class.js` is FENCED to a sibling — zero core edits. A needed core seam
  gets logged, not written.

## The delta contract (mastermind-fixed — extend, never break)

One line of `page.jsonl`:

```json
{"at": "<ISO>", "op": "set"|"del"|"append", "path": ["children","intro","title"], "value": …}
```

Loading = fetch `page.json`, replay every delta in order.
Compaction = write the replayed state back as `page.json`, truncate the jsonl.

## Proofs required

1. Cold deep url, 3 levels, from pure data.
2. Edit appends exactly ONE line (before/after line counts).
3. Compact: json updated, jsonl reset (byte sizes before/after).
4. Zero console errors at 400 and 1920.
