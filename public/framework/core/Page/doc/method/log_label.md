`page{/url/}` — how a page names itself in the console.

**Usage** — eight call sites, all logging, all in this file plus
`framework/core/Router/Router.js:97`. `App` implements the same method
(`framework/core/App/App.js:20`) returning `"app"`, so the two log the same way
without sharing a base class.

**Necessity** — yes, and the *name* is the necessity. It exists precisely so that
`label` can stay the human-facing property — a page's menu label — without the
console competing for the word. That is the scoping-prefix rule earning its
characters.

**Simplicity** — right-sized: one line, and `?? "…"` covers a standalone page that
has no url yet, which is a real state (see `naming()`).

The duck-typed pairing with `App.log_label()` is deliberate and is the only thing
that would break quietly: nothing declares an interface, so a third class that logs
this way has to be told.

