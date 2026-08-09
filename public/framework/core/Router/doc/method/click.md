## Usage

`Router.js:12` — the document listener, the only caller. Every navigation on the
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

Right-sized. A third of the body is a `console.log`, which is true of most of this
class and is a deliberate trade — the log line is how a navigation is debugged
without a debugger.
