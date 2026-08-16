## Usage

`Router.js:11` — the document listener, the only caller. Every navigation on the
site that isn't a reload or a Back starts here.

## Necessity

Essential. It is three lines because all the judgment lives in
[`link_clicked`](/framework/core/Router/api/link_clicked/): decide, then act.

**It passes the whole url, never just the path:**

```js
this.go(link.pathname + link.search + link.hash);
```

`pathname` alone silently ate the fragment on a cross-page link — the url in the
address bar came out short and nothing threw. See [fragment](/framework/core/Router/docs/fragment/) for
the half that is still open (where it *lands* is still the top).

## Simplicity

Right-sized: guard, then act, nothing else. There is no debug logging here or
anywhere else in the class — a navigation is traced with the browser's own
Network/Performance tools, not a bespoke log line.
