Was that import error a 404, or a real error in a real file?

**Usage** — one caller: `Page.load()` (`Page.class.js:86`).

**Necessity** — yes, and it has no alternative. `import()` rejects with a plain
`TypeError` for a missing module; the specification does not give it a code, a
status or a distinguishable subclass. **The message string is the only signal
there is.**

**Simplicity** — as simple as it can be, and as fragile as the platform makes it.
Four alternatives are matched because four engines word it differently, and the
`MIME type` / `Expected a JavaScript` arms exist because a static host with an SPA
fallback answers a missing `page.js` with `index.html` — HTML, `200 OK`. That is
this site's actual 404 and it is why the naive check was not enough.

**The failure mode is a browser update.** If an engine rewords its message, a
missing page starts logging a red "the file EXISTS but failed to load" and the probe
still returns `null` — noisy, not broken. That asymmetry is why the regex errs
toward *broken*: a false "missing" would hide a real error.
