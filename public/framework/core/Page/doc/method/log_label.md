`page{/url/}` — how a page names itself in the console.

**Usage** — three call sites, all logging, all in this file: `container()`'s two
region-claim messages (`Page.class.js:134,137`) and `warn_if_hidden()`
(`Page.class.js:168`). `App` implements the same method
(`framework/core/App/App.js:20`) returning `"app"`, so the two log the same way
without sharing a base class. Confirmed against `core/App/doc/method/log_label.md`,
which counts the same three from the other side.

**Necessity** — yes, and the *name* is the necessity. It exists precisely so that
`label` can stay the human-facing property — a page's menu label — without the
console competing for the word. That is the scoping-prefix rule earning its
characters.

**Simplicity** — right-sized: one line, and `?? "…"` covers a standalone page that
has no url yet, which is a real state (see `naming()`).

The duck-typed pairing with `App.log_label()` is deliberate and is the only thing
that would break quietly: nothing declares an interface, so a third class that logs
this way has to be told.

