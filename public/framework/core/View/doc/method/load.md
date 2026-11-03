**Usage** — **no live caller in `public/`.** Three sandbox View pages document it
as API (`alex/framework/view/page.js:46`, `arya/framework/view/page.js:103`,
`edric/framework/view/page.js:105`), which is the only reason it is still here.

```js
div.c("sidebar").load(import.meta, "./sidebar.js");
```

**Necessity** — no, on call sites. The idea is sound, though: import a module and
append its default export, **without being async**, so it works inside a capture
function.

**Simplicity** — right-sized as written — it is `append_promise` plus a URL
resolution, and the resolution has to go through `View.url(meta, …)` because the
SPA fallback makes the document URL the *route*, not the file's location.

The verdict is "delete or find a caller", not "rewrite". Deleting it would make
three downstream pages lie, which is the half of *alias on the way out* that is
not about calls.

