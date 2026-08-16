**Usage** — `code.file(import.meta, "example.js")` fetches a real file and
renders it highlighted, language inferred from the extension via `code.ext()`
unless a third argument overrides it. Same signature and promise contract as
`md.file()`: **it must be returned or appended**, never awaited before a
factory call runs, because `capture: false` means there is nothing to place
until the promise settles (`View.captor` trap — see `core/View`'s
`capturing` note).

**Caching** — `code.cache[href] ??= fetch(...)`, so the same url is fetched
once no matter how many times a page calls this. A failed fetch deletes its
own cache entry (`highlight.js:176`) rather than caching the rejection, and
renders a `.code-error`-styled message in place of the block instead of
throwing — a broken doc link degrades the block, not the page.

**Necessity** — genuinely single-purpose: this ext's own Overview is the only
caller on the site right now (`readme.md`'s Open list flags this — if it's
still the only one in six months, that's a real signal to reconsider it, not
a reason to have skipped building it now next to `md.file()`).

**Simplicity** — right-sized: fetch, cache, render, degrade. No retry, no
loading state beyond "not there yet" — the promise itself is the loading
state, same as `md.file()`.
