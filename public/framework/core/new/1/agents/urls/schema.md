# The url schema

Read this before adding your first page.

A url in this tier is not an address that points at a page. **It is the page's
state, entirely and exclusively** — which is why there is a schema at all, and
why the rules below are short enough to hold in your head.

Five rules. Each one comes with the code that proves it, because a rule you can
run beats ten you have to trust. The live version of every verification here is
`/urls/schema/`, which constructs a real `Page` per row rather than quoting
`naming()`.

---

## Rule 1 — a page url always ends in `/`

There is exactly **one** url shape in this tier. `naming()` produces nothing
else:

```js
naming(){
    this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
                 : this.parent && this.name ? this.parent.url + this.name + "/"
                 : undefined;
    this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
    this.title ??= this.name;
    return this;
}
```

Both branches end in `/`. `new URL(".", …)` always does; the other appends one
literally.

**Verify it:**

```js
new Page({ meta: { url: "http://h/urls/schema/page.js" } }).url   // "/urls/schema/"
new Page({ meta: { url: "http://h/page.js" } }).url               // "/"
new Page({ parent: { url: "/a/" }, name: "b" }).url               // "/a/b/"
new Page({ url: "/given/" }).url                                  // "/given/" — explicit wins
new Page({}).url                                                  // undefined — no meta, no parent
```

Measured across 379 derived urls on the live site: **zero non-canonical.** A
page's own url cannot be wrong. Every *other* appearance of it — an href, the
address bar — is a copy, and a copy can be.

### Why the slash is load-bearing, three times

Not style. Three independent mechanisms, in three files, none of which mentions
the others:

| | file | what the slash does | how it fails without it |
|---|---|---|---|
| 1 | `Page.class.js` | makes `url + "page.js"` a valid path | `/docs/introspage.js` — a 404 on a path nobody wrote |
| 2 | `Router.js` | keeps the final segment undotted, so `link_clicked`'s `/\.\w+$/` cannot reject it | `/docs/v1.2` is never intercepted — a silent full page load |
| 3 | `server.js` + Cloudflare's SPA fallback | keeps the request out of the extension rule | a hard **404 in dev**, 200 in production |

The three failures are a 404, a performance regression and a dev/prod
divergence. **Nobody would ever file them as the same bug**, which is precisely
what makes this a rule and not a convention. Demonstrated live, including a real
`fetch()` against the dev server, at `/sitemap/rule-one/`.

---

## Rule 2 — a segment is a `children` key

`/a/b/` means `root.child("a").child("b")`. Nothing else is consulted, and the
lookup is a `Map.get` — **exact, and case-sensitive**.

```js
async load_segments(url){            // Router
    let page = this.app.root;

    for (const name of url.split("/").filter(Boolean)){
        page = await page.child(name);
        if (!page) return null;
    }

    return page;
}
```

`filter(Boolean)` drops empty segments, so `/a/b/`, `/a/b`, `//a//b//` and
`/a/./b/` all resolve to the same page. **They resolve; they are not
canonical.** See rule 5.

**A segment is never decoded.** `/x/hello%20world/` reaches `route()` as the
literal string `hello%20world`. So a *declared* child named `hello world` is
unreachable — the Map key is decoded text and the segment is not:

```js
host.add("hello world", "…");
await host.child("hello world");     // the Page
await host.child("hello%20world");   // null — this is what a url produces
```

> **Write `children` keys url-safe.** Lowercase, hyphens, no spaces, no
> characters that percent-encode. This is a rule rather than a
> `decodeURIComponent` call because decoding would make the Map key and the
> module path disagree, and a malformed `%` throws.

---

## Rule 3 — the filesystem is the router

```
/               ←  /page.js
/a/             ←  /a/page.js
/a/b/           ←  /a/b/page.js
```

One expression each way, because rule 1 guarantees there is nothing to
normalise:

```js
const module_url = url => url + "page.js";                  // url  -> module
const page_url = meta => new URL(".", meta.url).pathname;   // module -> url
```

> The older `core/Page` tier has a **second** shape — `/docs/x.page.js` →
> `/docs/x`, no trailing slash — which is why its `Page.module_url()` needs a
> branch. This tier dropped it. One shape, one expression, no branch. Do not
> reintroduce the sibling form.

Adding a page is creating a `page.js` and naming it in its parent's `children`.
There is no registry, no manifest and no build step.

---

## Rule 4 — only a declared name reaches the network

`child()` resolves one segment against three slots, and the distinction between
the last two is the whole design:

```js
async child(name){
    const known = this.children.get(name);

    if (known) return known.assign({ app: this.app });   // a Page — here already
    if (known === null) return … Page.load(…) …          // declared — import it
    return this.route?.(name) … ;                        // never declared — claim it?
}
```

| `children.get(name)` | meaning | cost |
|---|---|---|
| a `Page` | loaded | none |
| `null` | **declared**, not yet imported | one module fetch |
| `undefined` | never declared | none — `route()` may claim it, in memory |

Two consequences, both load-bearing:

**A dynamic url costs no doomed 404.** `route()` runs *after the declaration and
before the filesystem*, so `/dynamic/42/` never asks the server about
`/dynamic/42/page.js`.

**`route()` structurally cannot shadow a `page.js`** — a file you want is a file
you declared, and a declared name never reaches `route()`.

**And a third, which is a deployment guarantee.** The string handed to `import()`
is always one an author typed, never one a visitor did — because it only gets
there after matching a `Map` key. Windows filesystems are case-insensitive and
Cloudflare's asset store is not, so `/COLUMNS/page.js` is a 200 in dev and a 404
in production; **it cannot bite**, because `children.get("COLUMNS")` returns
`undefined` and the walk stops before the network. Never derive a module path
from a url segment without a Map lookup first.

---

## Rule 5 — the page's url is canonical, not the one you typed

Rule 2 makes `/tabs`, `/tabs//` and `/tabs/` all resolve. Only one of them is
the url:

```js
page.url            // "/tabs/"  — derived, and cannot be wrong
location.pathname   // whatever was typed, pasted or written in an href
```

**Ask the page, never the browser.** `mark_links()` already does, and was
written that way for an unrelated reason — `go()` pushes only *after* the load
succeeds, so mid-navigation `location` still shows the url being left:

```js
mark_links(here = this.active?.url){ … }   // `here` is the PAGE's url
```

The consequence is that link marking was immune to every trailing-slash defect
before anyone noticed there were any. **The address bar was not** — `go()` pushed
the url it was handed. That is the one place rule 5 is not yet enforced; the diff
is `router.md` (R2), and it is one expression: push `this.active.url`.

Until it lands, and forever for hand-written hrefs, the practical rule is:

> **Never hand-write a url you could derive.** `page.link()`, `page.preview()`,
> `page.previews()` and `tabs()` all build from `page.url` and are canonical by
> construction. A hand-typed href is the only way to get this wrong — and it
> fails *quietly*: a non-canonical href can never match `.active`, so it silently
> becomes an ancestor of the page it points at, or nothing at all.

| href to `/urls/slash/` | `.active` | `.in-path` | what you see |
|---|---|---|---|
| `/urls/slash/` | yes | — | correct |
| `/urls/slash` | **no** | yes | a nav item that never highlights |
| `/urls/slash//` | **no** | **no** | a nav item never marked at all |
| `/urls/sla` | no | **yes** | an unrelated link marked as an ancestor |

`/sitemap/links/` checks every href on the site against this.

---

## When does a url exist?

Rule 1 says what a url looks like, not *when* there is one. A page built inline
has none until a parent adopts it.

```js
add(name, child = {}){
    const adopt = { name, parent: this, app: this.app };

    const page = child instanceof Page ? child.assign(adopt)
        : new Page(is.fn(child) || typeof child === "string" ? { content: child } : child, adopt);

    page.naming();
    …
}
```

Adoption goes in **through the constructor**, so `naming()` and `initialize()`
both run with the parent already known. Before this, they ran first and a page
that called `this.add()` from `initialize()` handed its children a url of
`undefinedkid/`, silently.

| `add(name, …)` given | `this.url` in `initialize()` | a child added there |
|---|---|---|
| an options object | `/host/a/` | `/host/a/kid/` |
| options, nested two deep | `/host/c/deep/` | — |
| a `new Page({ … })` you built | **`undefined`** | **`undefinedkid/`** |

The last row is not a bug and cannot be fixed: you constructed the page before
anything adopted it, so there was no url for it to have.

> **`route()` and `add()` want options, not a constructed `Page`**, whenever the
> page needs `initialize()`. A page with its own `meta` is never affected — it
> knows its url from its own file.

---

## What a sitemap can and cannot enumerate

| | |
|---|---|
| a declared name | enumerable — following it imports it |
| a declared name with no file | found and reportable: the import fails, `child()` returns `null` |
| an inline child added in `initialize()` | enumerable — already in the `children` map |
| **a `route()` claim** | **not enumerable.** `route(name)` is a function; its domain is every string. |

That last row is a property, not a gap. `/dynamic/42/` is a real url with no
file, no declaration and no upper bound. A sitemap claiming completeness would be
lying about the one mechanism that makes the tree finite. `/sitemap/` walks what
is declared and then reports how many pages have a `route()`, because that count
is the size of the unknown. Currently: **379 pages reached, 33 of them claiming
unbounded urls.**

---

## Adding a page — the whole checklist

1. Create `parent/name/page.js`. The directory name is the url segment: url-safe,
   lowercase, hyphens.
2. `export default new Page({ meta: import.meta, title, content(){ … } })`.
   `meta` is what gives it a url.
3. Add `name` to the parent's `children` string. **Nothing crawls the
   filesystem** — a page nobody declared does not exist.
4. Link to it with `page.link()` or `previews()`, never a hand-typed href.
5. If it needs `initialize()`, and it is built by `route()` or `add()`, pass
   **options** rather than a constructed `Page`.

If your page needs urls it cannot list in advance, give it `route(name)` and
declare nothing — and remember that `/sitemap/` can count those pages but never
their urls.
