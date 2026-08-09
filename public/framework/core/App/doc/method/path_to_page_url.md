```js
static path_to_page_url(path){
    return path.endsWith("/") ? path + "page.js" : path + ".page.js";
}
```

**Frozen.** The url convention it encodes (`/a/b` → `/a/b.page.js`) no longer
exists anywhere in this framework.

## Usage

- `arya/lib/Router.js:86` — a sandbox's own router, a real call.
- `arya/framework/page/page.js:98`, `120` — the same sandbox documenting it.

Zero callers inside `framework/`. `Page.load(url)` imports `url + "page.js"` and
never consults this.

## Necessity

**Compatibility, not API**, and the only member on this class that cannot delegate
to anything — there is no current function that answers the same question, because
the question stopped being asked.

Removing it breaks `arya/`. Keeping it means a new reader can find a second,
contradictory answer to *"how does a url become a module?"* — which is the actual
cost, and it is a documentation cost, paid here.

## Simplicity

The code is two lines and fine. The problem is that it is **wrong and reachable**:
`App.path_to_page_url("/docs/intro")` returns `/docs/intro.page.js`, which this
site does not serve.

Proposal (readme): move it to `arya/lib/`, where its one real caller lives, and
delete it here. A dev's `lib/` is a downstream package that happens to share a
repo — this is that package's function.
