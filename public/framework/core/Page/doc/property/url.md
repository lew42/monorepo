The page's address, with a trailing slash.

**Usage** — the most-read property on the class: `child()` builds a probe path from
it (`Page.class.js:77`), `nav_for()` builds every menu entry
(`Page.class.js:157`), `link()` and `go()` use it, `Router` matches on it, and
`log_label()` prints it.

**Necessity** — the class. A Page without a url is a fragment.

**Simplicity** — right-sized, and the derivation is where the care is. Three
sources, in `naming()`, all `??=`:

```
this.meta                 → new URL(".", meta.url).pathname     a real file
this.parent + this.name   → parent.url + name + "/"             an inline page
neither                   → undefined                           standalone, legal
```

**The trailing slash is load-bearing.** Every path is built by concatenation
(`this.url + name + "/"`), so a url without it would silently produce
`/docsintro/`. Nothing validates this; a hand-written `url: "/docs"` is a bug that
shows up one level down.

`undefined` is a real state, not an error: a page built standalone has no url until
`add()` adopts it, which is why the constructor guards `if (this.url)` before
loading children.

