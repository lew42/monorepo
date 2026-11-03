The page's address, with a trailing slash.

**Usage** — the most-read property on the class: `child()` builds a probe path from
it (`Page.class.js:77`), `nav_for()` builds every menu entry
(`Page.class.js:157`), `link()` and `go()` use it, `Router` matches on it, and
`log_label()` prints it.

**Necessity** — the class. A Page without a url is a fragment.

**Simplicity** — right-sized, and the derivation is where the care is. Four
sources, in `naming()`, all `??=`:

```
this.meta                 → new URL(".", meta.url).pathname     a real file
this.parent + this.name   → parent.url + name + "/"             an inline page
this.title                → "/" + Page.slug(title) + "/"        a standalone root
none of them              → undefined                           still legal
```

**The trailing slash is load-bearing.** Every path is built by concatenation
(`this.url + name + "/"`), so a url without it would silently produce
`/docsintro/`. Nothing validates this; a hand-written `url: "/docs"` is a bug that
shows up one level down.

A title-derived url is **provisional**: `add()` overwrites it on adoption
(`move()`, subtree included), because a child's address is its parent's plus its
name. `undefined` remains a real state — a standalone page with no title — and it is
why nothing is fetched until a page is adopted: `child()` builds a child's url from
mine, so a page with no address has nowhere to fetch from.

