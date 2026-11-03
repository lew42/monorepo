# streaming-pages

## The ask, verbatim

> look into streaming pages. when the editor gets better, I'd like to be able to create
> realtime streaming UI/ux/presentation, whatever. anything that could go on a page, could
> be edited and streamed in realtime. on cloudflare, that likely requires durableobjects.
> look into it.

## The local truth

The AI board already streams: `ext/JSONL` + `Server/plugins/SocketServer/Tail.js` push
appended `.jsonl` lines to open tabs with no reload (verified 2026-08-18,
`/framework/research/livereload/`). `LiveReload.changed()` routes every `.jsonl` to `Tail`
*before* any reload path, so a jsonl append is a **push, never a reload**.

## The delta contract (consumed, not redefined)

A sibling task (`json-pages`, `/imagine/cms/json/`) owns this format. One JSON object per
line over a `page.json` snapshot:

```json
{"at": "<ISO>", "op": "set"|"del"|"append", "path": ["a", "b"], "value": <any>}
```

## What gets built — /imagine/stream/

1. The live wire — an editor tab appends deltas, every other tab applies them live. Latency
   measured: append -> remote DOM change, median of 10.
2. A presentation streamed — the presenter drives the slide, viewers follow.
3. Streaming UI edit — md, a color token and a layout word, all delta-editable.
4. The Durable Objects design — doc, not code. Cited.

## Fence

- `/imagine/stream/**` only, plus at most ONE **unwired** file under `Server/plugins/`
  (wiring proposed in the report, never applied).
- Never kill or restart the port-80 dev server. Private server on `PORT=8095`, torn down after.
- Never stash, never commit.
