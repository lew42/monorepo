# One fetch, two urls

The tag experiment produces a page that exists twice. `/content/blog/x/` and
`/content/tags/graph/x/` are different `Page` instances with different parents,
different chains and different views. The obvious worry is that the reader pays
for that duplication over the network.

They do not, and the reason is four lines in `md.file`:

```js
const text = await (md.cache[href] ??= fetch(href).then(resp => {
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    return resp.text();
}));
```

The cache is keyed by the **resolved href**, not by the page, not by the view,
not by the call site. Two instances calling `md.file(meta, "x.md")` with the
same `import.meta` produce the same href and therefore the same entry. The
second caller awaits a promise that is already settled.

## What is cached and what is not

| | cached | rebuilt |
| --- | --- | --- |
| the network request | yes, per href | — |
| the response text | yes | — |
| `marked.parse()` | no | every visit |
| the DOM | no | per Page instance |
| syntax highlighting | no | every parse |

The text is cached; the parse is not. Re-visiting a page you have already read
re-parses its markdown and rebuilds its DOM, but does not touch the network.
That is a deliberate line: the parse is cheap and pure, the DOM cannot be shared
between two parents anyway, and caching parsed HTML would mean caching a string
that two views would then both `innerHTML` — no saving worth the bookkeeping.

Note the failure branch, which matters more than the success one:

```js
delete md.cache[href]; // don't cache the failure
```

Without that, one flaky fetch would poison the url for the lifetime of the tab —
every later visit awaiting a rejected promise and rendering the same red error.

## Where the duplication is real

DOM. `Page.render()` memoises `this.view`, so each instance builds its tree once
and keeps it forever. Two instances of one article mean two copies of the parsed
article in the document, one of them `display: none`.

For a six-post demo that is nothing. For a large site it is a reason to make
tags *list* articles rather than *contain* them — which is the cheap correct
answer, and the one to reach for unless you specifically want to browse forward
and backward inside a tag.

## The measurement

Cold load of `/content/tags/graph/2026-07-04-what-a-tree-cannot-say/`, then a
click through to the canonical `/content/blog/2026-07-04-what-a-tree-cannot-say/`:

```
first url    modules: /page.js, /content/page.js, /content/tags/page.js, posts.js
             md:      2026-07-04-what-a-tree-cannot-say.md          (1 request)
second url   modules: /content/blog/page.js
             md:      none — md.cache hit                            (0 requests)
```

One article, two urls, two Page objects, two DOM trees — and one request for the
words. That is the trade in a single line, and it is why "a node per path" is
survivable at all.
