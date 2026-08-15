**Usage** — 3 internal call sites: `load()` (`View.js:251`), `lazy()`
(`View.js:256`) and `stylesheet()` (`View.js:366`). Every module-relative URL in
the framework resolves through here.

```js
View.url("/file.js");                 // already absolute — passed through
View.url(import.meta, "file.js");     // resolved against the MODULE
```

**Necessity** — yes, and the reason is a trap rather than a convenience.

> **Resolve module-relative URLs against `import.meta`, never the document.** The
> SPA fallback makes the document URL the *route*, not the file's location — so a
> document-relative path is wrong on **every** load, not just deep ones. That is
> what makes it easy to miss: the one page you tested was the one at the right
> depth.

**Simplicity** — right-sized. The two-shape signature (a bare string, or
`meta, path`) is what lets every caller take either without branching.

