Derive `url`, `name` and `title` from whatever arrived.

**Usage** — two callers, both internal: the constructor (`Page.class.js:9`) and
`add()` (`Page.class.js:52`), which re-runs it the moment adoption supplies a
parent.

**Necessity** — yes, and the *shape* is the house rule made concrete: **derive
inside the class, not at the call site.** A caller that applied
`title: page.title ?? name` would give one object two identities depending on how
it was built.

**Simplicity** — right-sized. Every line is `??=`, so it is **idempotent** and an
explicit value always wins — which is what lets it be called twice with no guard,
and why "re-derive" beats "duplicate the `??` at every arrival point".

Three sources for the url, in order: `meta` (a real file, so `import.meta` is all a
page.js writes), then parent-plus-name (an inline page, which therefore never types
a path), then nothing — a standalone page with no url, which is legal and is why
the constructor guards `if (this.url)`.

**`this.name` is the last path segment**, and it is also the CSS hook: `render()`
writes `.page-<name>`. It is missing from the rail as a property page only because
`classdoc` would show `Function.name` there instead — see `readme.md` §Open.

