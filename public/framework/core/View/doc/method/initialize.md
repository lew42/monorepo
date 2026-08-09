**Usage** — called once, from the constructor (`View.js:11`). One line, and the
one line hands `render` to `append`.

**Necessity** — as a *hook*, yes: a subclass that wants to build differently
overrides this rather than the constructor, which stays `assign` → `prerender` →
`initialize` for every View. As a *body*, it is one call.

**Simplicity** — right-sized, but note the name collision it invites.
`View.body()` passes an `init()` in its constructor argument — a different word,
never called, and therefore dead (`View.js:490`). Any hook a caller wants to
inject must be spelled `initialize`, exactly. Recorded in `readme.md` §Proposed.

